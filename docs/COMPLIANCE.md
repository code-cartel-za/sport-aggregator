# Compliance Documentation — Sport Aggregator

> Last updated: 14 February 2026

Sport Aggregator is a **fantasy sports insight and analysis tool**. It is NOT a gambling, betting, or wagering application.

---

## Apple App Store Guidelines

### Rule 3.1.1 — In-App Purchase
- All subscriptions on iOS MUST use StoreKit / Apple In-App Purchase
- No external payment links or references to alternative payment methods on iOS
- Product IDs: `com.codecartel.sportagg.{pro|elite}.{monthly|yearly}`

### Rule 3.1.2(a) — Auto-Renewable Subscriptions
- Clear subscription terms displayed before purchase
- Monthly and yearly billing options with transparent pricing
- Free trial duration (7 days) clearly disclosed
- Subscription auto-renews unless cancelled at least 24 hours before end of current period
- Payment charged to Apple ID account at confirmation of purchase

### Rule 5.1.1 — Data Collection & Storage
- Privacy policy accessible from app and App Store listing
- All data collection purposes disclosed
- Data minimisation practiced — only collect what's necessary
- Encryption at rest (Firestore) and in transit (TLS 1.3)

### Rule 5.1.2 — Privacy Nutrition Labels
Required disclosures for App Store Connect:
| Category | Data Types | Linked to Identity | Tracking |
|----------|-----------|-------------------|----------|
| Contact Info | Email, Name | Yes | No |
| Identifiers | User ID | Yes | No |
| Usage Data | Product Interaction | Yes | No |
| Purchases | Purchase History | Yes | No |
| Diagnostics | Crash Data | No | No |

### Purchase Restoration
- "Restore Purchases" button available in Settings
- Uses `SKPaymentQueue.restoreCompletedTransactions()`
- Works across all devices signed into the same Apple ID

### Subscription Management
- Direct link to Settings > Apple ID > Subscriptions provided in app
- Cancellation instructions clearly documented in Terms of Service

### App Classification
- Category: Sports
- NOT classified as gambling — no real money outcomes
- Age rating: 12+ (fantasy sports content)

---

## Google Play Policies

### Google Play Billing
- All subscriptions on Android MUST use Google Play Billing Library v7+
- Product IDs: `pro_monthly`, `pro_yearly`, `elite_monthly`, `elite_yearly`
- `BillingClient` handles purchase flow, acknowledgement, and consumption

### Subscription Disclosure
- Subscription price, billing period, and trial terms shown before purchase
- Cancellation policy clearly stated
- Auto-renewal disclosure before initial purchase

### Data Safety Section
Required declarations for Play Console:
| Data Type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Email | Yes | No | Account management |
| Name | Yes | No | Account management |
| User IDs | Yes | No | Account management |
| App interactions | Yes | No | Analytics |
| Crash logs | Yes | No | App stability |
| Purchase history | Yes | No | Subscription management |

- Data encrypted in transit: Yes
- Data encrypted at rest: Yes
- Users can request data deletion: Yes
- Data deletion request mechanism: In-app + email

### App Classification
- Category: Sports
- Content rating: Everyone
- NOT gambling: No real money wagering, no variable outcomes tied to money
- Clearly positioned as information/insight tool for free-to-play fantasy games

---

## POPI Act (South Africa) — Protection of Personal Information Act, 2013

### Lawful Processing Basis (Section 11)
- **Consent:** Explicit consent obtained during onboarding (consent screen)
- **Contract:** Processing necessary for service delivery
- **Legitimate interest:** Aggregated analytics (with opt-out)

### Purpose Limitation (Section 13)
- Data collected only for stated purposes in privacy policy
- No secondary use without additional consent

### Information Quality (Section 16)
- Users can view and correct their data via Settings
- Data export provides full view of stored information

### Security Safeguards (Section 19)
- Firebase Security Rules: users can only access their own data
- Firestore encryption at rest
- TLS 1.3 for all network communications
- No sensitive data stored on device beyond encrypted auth tokens

### Data Subject Rights (Sections 23–25)
- **Access (Section 23):** "Download My Data" in Settings
- **Correction (Section 24):** Update profile via identity provider
- **Deletion (Section 24):** "Delete My Account" in Settings (30-day grace)
- **Objection (Section 11(3)(a)):** Marketing consent toggle

### Information Officer
- Designated Information Officer: privacy@codecartel.co.za
- Registered with the Information Regulator (pending)

### Cross-Border Transfer (Section 72)
- Data processed by Google Cloud (Firebase) in international data centres
- Protected by Google's Data Processing Terms
- Adequate safeguards per POPIA Section 72 requirements

---

## GDPR (European Union) — General Data Protection Regulation

### Lawful Basis (Article 6)
- **Consent (6(1)(a)):** Marketing communications, optional analytics
- **Contract (6(1)(b)):** Core service functionality, subscription management
- **Legitimate Interest (6(1)(f)):** Aggregated analytics, fraud prevention, service improvement

### Data Subject Rights
| Right | Article | Implementation |
|-------|---------|----------------|
| Access | 15 | "Download My Data" button — full JSON export |
| Rectification | 16 | Profile update via identity provider |
| Erasure | 17 | "Delete My Account" — 30-day grace, then permanent deletion |
| Restriction | 18 | Contact privacy@codecartel.co.za |
| Portability | 20 | JSON export format, machine-readable |
| Object | 21 | Marketing/analytics toggles in Settings |
| Withdraw Consent | 7(3) | Toggles in Settings, account deletion option |

### Privacy by Design (Article 25)
- Data minimisation: only collect necessary data
- Purpose limitation: clear purpose for each data point
- Storage limitation: defined retention periods per data type
- Pseudonymisation: Firebase UIDs, no direct identifiers in analytics
- Default privacy: analytics opt-in, marketing opt-in

### Records of Processing (Article 30)
| Processing Activity | Data Categories | Recipients | Retention |
|---------------------|----------------|------------|-----------|
| Account management | Name, email, UID | Firebase Auth | Until deletion + 30d |
| Subscription management | Tier, status, platform | Firestore | Duration + 7 years |
| Usage tracking | Feature counts | Firestore | 90 days rolling |
| Analytics | Anonymised events | Firebase Analytics | 14 months |
| Crash reporting | Device info, stack traces | Crashlytics | 90 days |

### Data Protection Officer
- Not required (fewer than 250 employees, no large-scale systematic monitoring)
- Contact point: privacy@codecartel.co.za
- Response time: 30 days maximum for data subject requests

### International Transfers
- Data processed by Google Cloud (Firebase)
- Protected by EU Standard Contractual Clauses (SCCs)
- Google participates in EU-US Data Privacy Framework
- Transfer Impact Assessment: adequate protections in place

---

## Firestore Data Structure

```
users/{uid}/
├── subscription          — UserSubscription document
├── consent               — ConsentRecord document
├── usage/
│   └── {YYYY-MM-DD}      — Daily UsageRecord documents
└── data-requests/
    └── {requestId}        — DataExportRequest | DataDeletionRequest documents
```

### Firestore Security Rules (additions)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/subscription {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if false; // Server-side only
    }
    match /users/{uid}/consent {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /users/{uid}/usage/{date} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /users/{uid}/data-requests/{requestId} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow create: if request.auth != null && request.auth.uid == uid;
      allow update, delete: if false; // Server-side only
    }
  }
}
```

---

## Implementation Checklist

- [x] Type system (`@types/subscription/`)
- [x] Tier configuration (`config/tiers.config.ts`)
- [x] Tier service with signals
- [x] Usage tracking service
- [x] Privacy service (consent, export, deletion)
- [x] Paywall component
- [x] Blurred content component
- [x] Usage badge component
- [x] Tier guards (pro, elite)
- [x] Consent guard
- [x] Privacy policy page (POPI + GDPR)
- [x] Terms of service page
- [x] Consent collection page
- [x] Settings page updates (subscription, privacy, legal sections)
- [x] Routes for legal pages
- [ ] StoreKit integration (iOS) — requires native setup
- [ ] Play Billing integration (Android) — requires native setup
- [ ] Stripe integration (web) — requires backend
- [ ] Firestore sync for subscription state
- [ ] Cloud Functions for data export/deletion processing
- [ ] App Store privacy nutrition labels submission
- [ ] Play Store data safety section submission
- [ ] Information Regulator registration (POPIA)
