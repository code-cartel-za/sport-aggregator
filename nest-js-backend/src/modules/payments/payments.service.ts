import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';
import { STRIPE_PRICES, StripeTier, StripeInterval } from '../../config/stripe.config';

interface SubscriptionDoc {
  tier: StripeTier;
  status: 'active' | 'cancelled' | 'expired';
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  interval: StripeInterval;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  updatedAt: string;
}

interface CheckoutSessionRequest {
  tier: StripeTier;
  interval: StripeInterval;
  uid: string;
  successUrl: string;
  cancelUrl: string;
}

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(
    @Inject('FIRESTORE') private readonly db: admin.firestore.Firestore,
  ) {
    const secretKey: string = process.env['STRIPE_SECRET_KEY'] ?? '';
    this.stripe = new Stripe(secretKey);
  }

  async createCheckoutSession(request: CheckoutSessionRequest): Promise<{ sessionId: string; url: string }> {
    const priceId: string = STRIPE_PRICES[request.tier][request.interval];
    if (!priceId) {
      throw new BadRequestException('Invalid tier or interval');
    }

    const session: Stripe.Checkout.Session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: request.successUrl,
      cancel_url: request.cancelUrl,
      metadata: { uid: request.uid, tier: request.tier },
      client_reference_id: request.uid,
    });

    return { sessionId: session.id, url: session.url ?? '' };
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const webhookSecret: string = process.env['STRIPE_WEBHOOK_SECRET'] ?? '';
    const event: Stripe.Event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.activateSubscription(session);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.updateSubscriptionStatus(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.cancelSubscriptionInFirestore(subscription);
        break;
      }
      default:
        break;
    }
  }

  async getSubscriptionStatus(uid: string): Promise<SubscriptionDoc | null> {
    const doc: FirebaseFirestore.DocumentSnapshot = await this.db
      .doc(`users/${uid}/subscription/current`)
      .get();

    if (!doc.exists) return null;
    return doc.data() as SubscriptionDoc;
  }

  async cancelSubscription(uid: string): Promise<void> {
    const subDoc = await this.getSubscriptionStatus(uid);
    if (!subDoc?.stripeSubscriptionId) {
      throw new NotFoundException('No active subscription found');
    }

    await this.stripe.subscriptions.update(subDoc.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await this.db.doc(`users/${uid}/subscription/current`).update({
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  private async activateSubscription(session: Stripe.Checkout.Session): Promise<void> {
    const uid: string = session.metadata?.['uid'] ?? session.client_reference_id ?? '';
    const tier: StripeTier = (session.metadata?.['tier'] as StripeTier) ?? 'pro';

    if (!uid) return;

    const subscription: Stripe.Subscription = await this.stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    const firstItem: Stripe.SubscriptionItem | undefined = subscription.items.data[0];
    const periodEnd: number = firstItem?.current_period_end ?? 0;

    const subData: SubscriptionDoc = {
      tier,
      status: 'active',
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscription.id,
      interval: firstItem?.plan?.interval === 'year' ? 'yearly' : 'monthly',
      currentPeriodEnd: new Date(periodEnd * 1000).toISOString(),
      cancelledAt: null,
      updatedAt: new Date().toISOString(),
    };

    await this.db.doc(`users/${uid}/subscription/current`).set(subData, { merge: true });
  }

  private async updateSubscriptionStatus(subscription: Stripe.Subscription): Promise<void> {
    const snapshot: FirebaseFirestore.QuerySnapshot = await this.db
      .collectionGroup('subscription')
      .where('stripeSubscriptionId', '==', subscription.id)
      .limit(1)
      .get();

    if (snapshot.empty) return;

    const docRef: FirebaseFirestore.DocumentReference = snapshot.docs[0]!.ref;
    const item: Stripe.SubscriptionItem | undefined = subscription.items.data[0];
    const end: number = item?.current_period_end ?? 0;
    await docRef.update({
      status: subscription.status === 'active' ? 'active' : 'expired',
      currentPeriodEnd: new Date(end * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  private async cancelSubscriptionInFirestore(subscription: Stripe.Subscription): Promise<void> {
    const snapshot: FirebaseFirestore.QuerySnapshot = await this.db
      .collectionGroup('subscription')
      .where('stripeSubscriptionId', '==', subscription.id)
      .limit(1)
      .get();

    if (snapshot.empty) return;

    const docRef: FirebaseFirestore.DocumentReference = snapshot.docs[0]!.ref;
    await docRef.update({
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}
