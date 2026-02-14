import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/settings"></ion-back-button>
        </ion-buttons>
        <ion-title>
          <span class="page-title">Privacy Policy</span>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen class="legal-content">
      <div class="legal-container">

        <h1>Privacy Policy</h1>
        <p class="effective-date"><strong>Effective Date:</strong> 14 February 2026</p>
        <p class="effective-date"><strong>Last Updated:</strong> 14 February 2026</p>
        <p class="effective-date"><strong>Version:</strong> 1.0.0</p>

        <p>Code Cartel ("we", "us", "our") operates the Sport Aggregator mobile application and related services (collectively, the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our Service.</p>

        <p>Sport Aggregator is a <strong>fantasy sports insight and analysis tool</strong>. It is NOT a gambling, betting, or wagering application. No real money is wagered through our Service, and we do not facilitate or encourage gambling in any form.</p>

        <h2>1. Applicable Laws &amp; Compliance</h2>
        <p>This Privacy Policy is designed to comply with:</p>
        <ul>
          <li><strong>Protection of Personal Information Act, 2013 (POPI Act)</strong> — Republic of South Africa</li>
          <li><strong>General Data Protection Regulation (GDPR)</strong> — European Union (Regulation 2016/679)</li>
          <li><strong>Apple App Store Review Guidelines</strong> — Section 5.1 (Privacy)</li>
          <li><strong>Google Play Developer Policies</strong> — Data Safety requirements</li>
        </ul>
        <p>Where the POPI Act and GDPR impose different requirements, we apply the stricter standard.</p>

        <h2>2. Information We Collect</h2>

        <h3>2.1 Account Information</h3>
        <p>When you create an account via Google Sign-In or Apple Sign-In, we receive:</p>
        <ul>
          <li>Display name</li>
          <li>Email address</li>
          <li>Profile photograph (if provided by your identity provider)</li>
          <li>Unique user identifier</li>
        </ul>

        <h3>2.2 Subscription Data</h3>
        <ul>
          <li>Current subscription tier (Free, Pro, or Elite)</li>
          <li>Subscription status (active, trial, expired, cancelled)</li>
          <li>Platform of purchase (iOS, Android, or web)</li>
          <li>Product identifier (App Store or Play Store product ID)</li>
          <li>Subscription expiry date</li>
        </ul>
        <p><strong>We do NOT collect or store:</strong> credit card numbers, bank account details, or payment instrument data. All payment processing is handled by Apple (via App Store), Google (via Play Store), or Stripe (for web), and is subject to their respective privacy policies.</p>

        <h3>2.3 Usage Data</h3>
        <ul>
          <li>Daily feature access counts (e.g., number of player comparisons)</li>
          <li>Feature interaction patterns (aggregated, not individual player-level)</li>
          <li>App session frequency and duration</li>
        </ul>

        <h3>2.4 User Preferences &amp; Content</h3>
        <ul>
          <li>Watchlist entries (players you choose to follow)</li>
          <li>Saved team configurations</li>
          <li>Preferred sport, notification settings, display preferences</li>
          <li>Favourite leagues, teams, and drivers</li>
        </ul>

        <h3>2.5 Technical Data</h3>
        <ul>
          <li>Device type and operating system version</li>
          <li>App version</li>
          <li>Anonymous crash reports and performance metrics (via Firebase Crashlytics)</li>
          <li>IP-derived country code (for GDPR jurisdiction detection; IP address is not stored)</li>
        </ul>

        <h3>2.6 Information We Do NOT Collect</h3>
        <ul>
          <li>Betting or gambling activity</li>
          <li>Financial information beyond subscription status</li>
          <li>Precise geolocation (GPS coordinates)</li>
          <li>Contacts, call logs, or SMS messages</li>
          <li>Health or biometric data</li>
          <li>Browsing history outside our Service</li>
        </ul>

        <h2>3. Lawful Basis for Processing</h2>

        <h3>Under POPI Act (South Africa)</h3>
        <p>We process your personal information on the following grounds (Section 11):</p>
        <ul>
          <li><strong>Consent:</strong> You provide explicit consent when creating your account and accepting these terms.</li>
          <li><strong>Contract performance:</strong> Processing necessary to deliver the Service you have subscribed to.</li>
          <li><strong>Legitimate interest:</strong> Aggregated analytics to improve our Service (where your rights are not overridden).</li>
        </ul>

        <h3>Under GDPR (European Union)</h3>
        <ul>
          <li><strong>Consent (Article 6(1)(a)):</strong> For marketing communications and optional analytics.</li>
          <li><strong>Contract performance (Article 6(1)(b)):</strong> To provide the core Service functionality.</li>
          <li><strong>Legitimate interest (Article 6(1)(f)):</strong> For aggregated usage analytics, fraud prevention, and service improvement.</li>
        </ul>

        <h2>4. How We Use Your Information</h2>
        <ul>
          <li>To provide and maintain the Service</li>
          <li>To manage your account and subscription</li>
          <li>To enforce usage limits based on your subscription tier</li>
          <li>To personalise your experience (watchlists, saved teams, preferences)</li>
          <li>To send service-related notifications (with your consent)</li>
          <li>To improve the Service through aggregated, anonymised analytics</li>
          <li>To detect and prevent fraud or abuse</li>
          <li>To comply with legal obligations</li>
        </ul>

        <h2>5. Data Retention</h2>
        <table>
          <thead>
            <tr><th>Data Category</th><th>Retention Period</th></tr>
          </thead>
          <tbody>
            <tr><td>Account information</td><td>Until account deletion + 30 days</td></tr>
            <tr><td>Subscription records</td><td>Duration of subscription + 7 years (tax/legal)</td></tr>
            <tr><td>Daily usage records</td><td>90 days (rolling)</td></tr>
            <tr><td>Consent records</td><td>Duration of account + 5 years</td></tr>
            <tr><td>Data export/deletion requests</td><td>3 years after completion</td></tr>
            <tr><td>Crash reports</td><td>90 days</td></tr>
            <tr><td>User preferences &amp; content</td><td>Until account deletion</td></tr>
          </tbody>
        </table>

        <h2>6. Third-Party Services</h2>
        <p>We use the following third-party services that may process your data:</p>
        <table>
          <thead>
            <tr><th>Service</th><th>Purpose</th><th>Data Shared</th></tr>
          </thead>
          <tbody>
            <tr><td>Firebase Authentication</td><td>User sign-in</td><td>Email, display name, UID</td></tr>
            <tr><td>Cloud Firestore</td><td>Data storage</td><td>All user data (encrypted at rest)</td></tr>
            <tr><td>Firebase Analytics</td><td>Usage analytics</td><td>Anonymised events (with consent)</td></tr>
            <tr><td>Firebase Crashlytics</td><td>Crash reporting</td><td>Anonymous crash data</td></tr>
            <tr><td>Apple App Store</td><td>iOS subscriptions</td><td>Purchase data (managed by Apple)</td></tr>
            <tr><td>Google Play</td><td>Android subscriptions</td><td>Purchase data (managed by Google)</td></tr>
            <tr><td>Football-Data.org API</td><td>Football data</td><td>None (server-side only)</td></tr>
            <tr><td>FPL API</td><td>Fantasy Premier League data</td><td>None (server-side only)</td></tr>
            <tr><td>OpenF1 API</td><td>Formula 1 data</td><td>None (server-side only)</td></tr>
          </tbody>
        </table>
        <p>All third-party data processing is governed by the respective providers' privacy policies. Firebase services are provided by Google LLC and data is processed in accordance with the <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener">Firebase Privacy and Security documentation</a>.</p>

        <h2>7. Your Rights</h2>

        <h3>Under POPI Act (Sections 23–25)</h3>
        <ul>
          <li><strong>Right of access:</strong> Request a copy of your personal information (Section 23)</li>
          <li><strong>Right to correction:</strong> Request correction of inaccurate information (Section 24)</li>
          <li><strong>Right to deletion:</strong> Request deletion of your personal information (Section 24)</li>
          <li><strong>Right to object:</strong> Object to the processing of your personal information (Section 11(3)(a))</li>
        </ul>

        <h3>Under GDPR</h3>
        <ul>
          <li><strong>Right of access (Article 15):</strong> Obtain a copy of your personal data</li>
          <li><strong>Right to rectification (Article 16):</strong> Correct inaccurate personal data</li>
          <li><strong>Right to erasure (Article 17):</strong> Request deletion of your personal data ("right to be forgotten")</li>
          <li><strong>Right to restriction (Article 18):</strong> Restrict processing in certain circumstances</li>
          <li><strong>Right to data portability (Article 20):</strong> Receive your data in a structured, machine-readable format</li>
          <li><strong>Right to object (Article 21):</strong> Object to processing based on legitimate interest</li>
          <li><strong>Right to withdraw consent:</strong> Withdraw consent at any time without affecting the lawfulness of prior processing</li>
        </ul>

        <p>To exercise any of these rights, use the relevant options in the app's Settings page, or contact us at <strong>privacy&#64;codecartel.co.za</strong>. We will respond within 30 days (or sooner as required by law).</p>

        <h2>8. Data Exports &amp; Deletion</h2>
        <p>You may request a full export of your personal data or deletion of your account at any time through the Settings page. Data export requests are processed within 30 days and made available as a downloadable file. Account deletion requests include a 30-day grace period during which you may cancel the request. After the grace period, all personal data is permanently deleted, except where retention is required by law (e.g., tax records for subscription payments).</p>

        <h2>9. International Data Transfers</h2>
        <p>Your data may be transferred to and processed in countries outside South Africa and the European Economic Area (EEA), including the United States (where Firebase/Google Cloud infrastructure is located). Such transfers are protected by:</p>
        <ul>
          <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
          <li>Google's Data Processing Terms and commitments under the EU-US Data Privacy Framework</li>
          <li>POPIA Section 72 requirements for cross-border transfers</li>
        </ul>

        <h2>10. Cookies &amp; Local Storage</h2>
        <p>Sport Aggregator is a mobile application and does not use browser cookies. We use device local storage (localStorage) to store:</p>
        <ul>
          <li>Authentication session tokens</li>
          <li>User preferences (theme, default sport, notification settings)</li>
          <li>Daily usage counters</li>
          <li>Consent records</li>
          <li>Cached data for offline access</li>
        </ul>
        <p>This data remains on your device and is not transmitted to third parties.</p>

        <h2>11. Children's Privacy</h2>
        <p>Our Service is not intended for use by anyone under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at <strong>privacy&#64;codecartel.co.za</strong> and we will promptly delete such information.</p>

        <h2>12. Security Measures</h2>
        <p>We implement appropriate technical and organisational measures to protect your personal information, including:</p>
        <ul>
          <li>Encryption in transit (TLS 1.3) for all data communications</li>
          <li>Encryption at rest for all data stored in Cloud Firestore</li>
          <li>Firebase Security Rules restricting data access to authenticated users accessing their own data</li>
          <li>Regular security reviews and dependency updates</li>
          <li>Principle of least privilege for all service accounts</li>
        </ul>

        <h2>13. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of material changes by updating the "Last Updated" date and, where appropriate, providing notice within the app. Continued use of the Service after changes constitutes acceptance of the revised policy. If material changes affect your consent, we will request fresh consent.</p>

        <h2>14. Contact Information</h2>
        <p><strong>Data Controller / Responsible Party:</strong></p>
        <p>Code Cartel<br>
        Email: <a href="mailto:privacy@codecartel.co.za">privacy&#64;codecartel.co.za</a></p>

        <p><strong>Information Officer (POPI Act):</strong><br>
        Email: <a href="mailto:privacy@codecartel.co.za">privacy&#64;codecartel.co.za</a></p>

        <p>If you are not satisfied with our response, you may lodge a complaint with the Information Regulator (South Africa) at <a href="https://www.justice.gov.za/inforeg/" target="_blank" rel="noopener">www.justice.gov.za/inforeg</a> or the relevant supervisory authority in your jurisdiction.</p>

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
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 0.82rem;
    }
    th, td {
      border: 1px solid rgba(255,255,255,0.1);
      padding: 8px 10px;
      text-align: left;
    }
    th { background: rgba(212, 168, 71, 0.1); color: #D4A847; font-weight: 600; }
  `],
})
export class PrivacyPolicyPage {}
