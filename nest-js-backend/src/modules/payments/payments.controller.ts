import {
  Controller, Post, Get, Body, Req, Res, Headers, RawBodyRequest,
  HttpCode, HttpStatus, BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { StripeTier, StripeInterval } from '../../config/stripe.config';

interface CreateCheckoutDto {
  tier: StripeTier;
  interval: StripeInterval;
  successUrl: string;
  cancelUrl: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body() body: CreateCheckoutDto,
    @Req() req: Request,
  ): Promise<{ sessionId: string; url: string }> {
    const uid: string | undefined = (req as unknown as Record<string, unknown>)['uid'] as string | undefined;
    if (!uid) throw new BadRequestException('Missing authenticated user');

    return this.paymentsService.createCheckoutSession({
      tier: body.tier,
      interval: body.interval,
      uid,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
    });
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
    @Res() res: Response,
  ): Promise<void> {
    const rawBody: Buffer | undefined = req.rawBody;
    if (!rawBody) {
      res.status(400).send('Missing raw body');
      return;
    }

    try {
      await this.paymentsService.handleWebhook(rawBody, signature);
      res.status(200).json({ received: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Webhook error';
      res.status(400).send(message);
    }
  }

  @Get('status')
  async getStatus(@Req() req: Request): Promise<{ subscription: unknown }> {
    const uid: string | undefined = (req as unknown as Record<string, unknown>)['uid'] as string | undefined;
    if (!uid) throw new BadRequestException('Missing authenticated user');

    const subscription = await this.paymentsService.getSubscriptionStatus(uid);
    return { subscription };
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  async cancelSubscription(@Req() req: Request): Promise<{ success: boolean }> {
    const uid: string | undefined = (req as unknown as Record<string, unknown>)['uid'] as string | undefined;
    if (!uid) throw new BadRequestException('Missing authenticated user');

    await this.paymentsService.cancelSubscription(uid);
    return { success: true };
  }
}
