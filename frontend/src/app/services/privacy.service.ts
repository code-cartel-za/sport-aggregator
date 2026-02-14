import { Injectable, inject } from '@angular/core';
import {
  ConsentRecord, DataExportRequest, DataDeletionRequest, DataRequest,
} from '../@types';
import { AuthService } from './auth.service';

const CONSENT_KEY = 'sport-agg-consent';
const PRIVACY_POLICY_VERSION = '1.0.0';
const TERMS_VERSION = '1.0.0';

@Injectable({ providedIn: 'root' })
export class PrivacyService {
  private readonly authService = inject(AuthService);

  hasConsented(): boolean {
    const consent = this.getConsent();
    if (!consent) return false;
    return (
      consent.dataProcessingConsent &&
      consent.privacyPolicyVersion === PRIVACY_POLICY_VERSION &&
      consent.termsVersion === TERMS_VERSION
    );
  }

  getConsent(): ConsentRecord | null {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        return JSON.parse(stored) as ConsentRecord;
      }
    } catch {
      // Fall through
    }
    return null;
  }

  async recordConsent(consent: Partial<ConsentRecord>): Promise<void> {
    const uid = this.authService.currentUser()?.uid ?? '';
    const record: ConsentRecord = {
      uid,
      privacyPolicyVersion: PRIVACY_POLICY_VERSION,
      termsVersion: TERMS_VERSION,
      dataProcessingConsent: false,
      marketingConsent: false,
      analyticsConsent: false,
      consentedAt: new Date().toISOString(),
      ipCountry: null,
      ...consent,
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
    // TODO: Sync to Firestore users/{uid}/consent
  }

  async requestDataExport(): Promise<DataExportRequest> {
    const uid = this.authService.currentUser()?.uid ?? '';
    const request: DataExportRequest = {
      uid,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      downloadUrl: null,
      expiresAt: null,
    };
    // TODO: Write to Firestore users/{uid}/data-requests/
    // TODO: Trigger Cloud Function to compile data export
    return request;
  }

  async requestDataDeletion(): Promise<DataDeletionRequest> {
    const uid = this.authService.currentUser()?.uid ?? '';
    const request: DataDeletionRequest = {
      uid,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      completedAt: null,
    };
    // TODO: Write to Firestore users/{uid}/data-requests/
    // TODO: Trigger Cloud Function to process deletion (30-day grace period)
    return request;
  }

  async getDataRequests(): Promise<DataRequest[]> {
    // TODO: Read from Firestore users/{uid}/data-requests/
    return [];
  }

  getCollectedDataCategories(): string[] {
    return [
      'Account information (name, email, profile photo)',
      'Authentication data (sign-in method, last login)',
      'Subscription and billing status',
      'App usage data (feature access counts, daily usage)',
      'Watchlist and saved team preferences',
      'Consent records',
    ];
  }

  async updateMarketingConsent(enabled: boolean): Promise<void> {
    const current = this.getConsent();
    if (current) {
      await this.recordConsent({ ...current, marketingConsent: enabled });
    }
  }

  async updateAnalyticsConsent(enabled: boolean): Promise<void> {
    const current = this.getConsent();
    if (current) {
      await this.recordConsent({ ...current, analyticsConsent: enabled });
    }
  }
}
