import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton],
  template: `
    <ion-header>
      <ion-toolbar >
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/settings"></ion-back-button>
        </ion-buttons>
        <ion-title>
          <span class="page-title">Terms of Service</span>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen class="legal-content">
      <div class="legal-container">

        <h1>Terms of Service</h1>
        <p class="effective-date"><strong>Effective Date:</strong> 14 February 2026</p>
        <p class="effective-date"><strong>Version:</strong> 1.0.0</p>

        <h2>1. Service Description</h2>
        <p>Sport Aggregator is a <strong>fantasy sports insight and analysis tool</strong> provided by Code Cartel. The Service aggregates publicly available sports data and provides analytical tools including player projections, captain recommendations, fixture difficulty ratings, player comparisons, team simulators, and other statistical insights for Fantasy Premier League (FPL) and Formula 1 Fantasy.</p>

        <p><strong>IMPORTANT DISCLAIMER:</strong> Sport Aggregator is NOT a gambling, betting, or wagering platform. The Service does not facilitate, encourage, or enable any form of real-money gambling. All insights and projections are for informational and entertainment purposes relating to free-to-play fantasy sports games operated by third parties. No real money outcomes are determined or influenced by our Service.</p>

        <h2>2. Acceptance of Terms</h2>
        <p>By creating an account and using the Service, you agree to be bound by these Terms of Service, our Privacy Policy, and any additional terms that may apply to specific features. If you do not agree, do not use the Service.</p>

        <h2>3. Eligibility</h2>
        <p>You must be at least 13 years of age to use the Service. By using the Service, you represent and warrant that you meet this age requirement. If you are under 18, you must have the consent of a parent or legal guardian.</p>

        <h2>4. Account Responsibilities</h2>
        <ul>
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          <li>You are responsible for all activities that occur under your account.</li>
          <li>You must provide accurate and complete information when creating your account.</li>
          <li>You must promptly notify us of any unauthorised use of your account.</li>
          <li>One account per person. Sharing accounts or creating multiple accounts is prohibited.</li>
        </ul>

        <h2>5. Subscription Terms</h2>

        <h3>5.1 Free Tier</h3>
        <p>The Service offers a free tier with limited access to features and daily usage caps as described in the app. The free tier may be modified or discontinued at our discretion.</p>

        <h3>5.2 Paid Subscriptions (Pro &amp; Elite)</h3>
        <ul>
          <li>Paid subscriptions are available on a monthly or yearly basis.</li>
          <li>Prices are displayed in the app and may vary by platform (iOS, Android, web).</li>
          <li>Subscriptions automatically renew at the end of each billing period unless cancelled.</li>
          <li>You will be charged through your app store account (Apple App Store or Google Play) or via Stripe for web subscriptions.</li>
        </ul>

        <h3>5.3 Free Trials</h3>
        <p>We may offer a 7-day free trial for new subscribers. If you do not cancel before the trial ends, your subscription will automatically convert to a paid subscription at the displayed price.</p>

        <h3>5.4 Cancellation</h3>
        <ul>
          <li><strong>iOS:</strong> Cancel via Settings &gt; Apple ID &gt; Subscriptions on your device.</li>
          <li><strong>Android:</strong> Cancel via Google Play Store &gt; Subscriptions.</li>
          <li><strong>Web:</strong> Cancel through your account settings.</li>
          <li>Cancellation takes effect at the end of the current billing period. You will retain access until then.</li>
        </ul>

        <h3>5.5 Refunds</h3>
        <p>Refunds for App Store and Play Store purchases are handled by Apple and Google respectively, in accordance with their refund policies. For web subscriptions, contact <a href="mailto:privacy@codecartel.co.za">privacy&#64;codecartel.co.za</a>.</p>

        <h3>5.6 Price Changes</h3>
        <p>We may change subscription prices from time to time. Price changes will be communicated in advance and will not affect your current billing period. Continued use after a price change constitutes acceptance of the new price.</p>

        <h2>6. Acceptable Use</h2>
        <p>You agree NOT to:</p>
        <ul>
          <li>Use the Service for any unlawful purpose</li>
          <li>Scrape, crawl, or automatically extract data from the Service</li>
          <li>Reverse-engineer, decompile, or disassemble any part of the Service</li>
          <li>Redistribute, resell, or commercially exploit Service content without authorisation</li>
          <li>Attempt to gain unauthorised access to other users' accounts or our systems</li>
          <li>Use the Service to create competing products or services</li>
          <li>Interfere with or disrupt the Service or its infrastructure</li>
          <li>Use bots, automation, or artificial means to interact with the Service beyond normal use</li>
          <li>Misrepresent the Service's insights as guaranteed outcomes, financial advice, or betting tips</li>
        </ul>

        <h2>7. Intellectual Property</h2>
        <p>All content, design, code, algorithms, data visualisations, and branding within Sport Aggregator are the intellectual property of Code Cartel or its licensors. You may not copy, modify, distribute, or create derivative works without express written permission.</p>
        <p>Third-party sports data (Premier League, FPL, Formula 1) remains the property of their respective owners. We display this data under fair use for informational and analytical purposes.</p>

        <h2>8. Disclaimers</h2>
        <ul>
          <li><strong>No Financial Advice:</strong> Sport Aggregator does not provide financial, betting, gambling, or investment advice. All projections, recommendations, and insights are for informational and entertainment purposes only.</li>
          <li><strong>No Guaranteed Outcomes:</strong> Fantasy sports projections are statistical estimates. Actual results will vary. Past performance does not guarantee future results.</li>
          <li><strong>Data Accuracy:</strong> While we strive for accuracy, we cannot guarantee the completeness or accuracy of third-party sports data. Data may be delayed or unavailable due to upstream provider issues.</li>
          <li><strong>"As Is" Service:</strong> The Service is provided "as is" and "as available" without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.</li>
        </ul>

        <h2>9. Limitation of Liability</h2>
        <p>To the maximum extent permitted by applicable law, Code Cartel shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill, arising from or related to your use of the Service.</p>
        <p>Our total liability for any claim arising from or related to the Service shall not exceed the amount you have paid us in the twelve (12) months preceding the claim, or R500 (ZAR), whichever is greater.</p>

        <h2>10. Indemnification</h2>
        <p>You agree to indemnify, defend, and hold harmless Code Cartel and its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable legal fees) arising from your use of the Service, violation of these Terms, or infringement of any third-party rights.</p>

        <h2>11. Modifications to the Service</h2>
        <p>We reserve the right to modify, suspend, or discontinue any part of the Service at any time, with or without notice. We will not be liable for any modification, suspension, or discontinuation.</p>

        <h2>12. Modifications to These Terms</h2>
        <p>We may update these Terms from time to time. Material changes will be communicated via the app or email. Continued use after changes constitutes acceptance. If you disagree with changes, you must stop using the Service and may request account deletion.</p>

        <h2>13. Governing Law &amp; Dispute Resolution</h2>
        <p>These Terms are governed by the laws of the Republic of South Africa. Any disputes arising from or relating to these Terms shall be subject to the exclusive jurisdiction of the courts of the Republic of South Africa.</p>
        <p>For EU users: Nothing in these Terms affects your rights under mandatory EU consumer protection legislation, including the right to bring proceedings in the courts of your Member State of residence.</p>

        <h2>14. Severability</h2>
        <p>If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.</p>

        <h2>15. Entire Agreement</h2>
        <p>These Terms, together with our Privacy Policy and any subscription-specific terms, constitute the entire agreement between you and Code Cartel regarding the Service.</p>

        <h2>16. Contact</h2>
        <p>Code Cartel<br>
        Email: <a href="mailto:privacy@codecartel.co.za">privacy&#64;codecartel.co.za</a></p>

      </div>
    </ion-content>
  `,
  styles: [`
    .page-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      letter-spacing: 0.06em;
      font-size: 1rem;
      color: var(--accent-gold, #D4A847);
    }
    .legal-content { --background: #060D18; }
    .legal-container {
      padding: 24px 20px 100px;
      color: #cbd5e1;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.88rem;
      line-height: 1.65;
      max-width: 720px;
      margin: 0 auto;
    }
    h1 {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1.5rem;
      color: #D4A847;
      margin-bottom: 8px;
    }
    h2 {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 1.15rem;
      color: #e2e8f0;
      margin-top: 28px;
      margin-bottom: 12px;
      border-bottom: 1px solid rgba(212, 168, 71, 0.2);
      padding-bottom: 6px;
    }
    h3 {
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      font-size: 0.98rem;
      color: #94a3b8;
      margin-top: 16px;
    }
    .effective-date { color: #64748b; font-size: 0.82rem; margin: 2px 0; }
    ul { padding-left: 20px; }
    li { margin-bottom: 4px; }
    a { color: #3B82F6; text-decoration: none; }
  `],
})
export class TermsPage {}
