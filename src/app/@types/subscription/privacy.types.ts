/**
 * Privacy & Compliance Types
 * POPI Act (South Africa) + GDPR (EU) compliant consent and data request types.
 */

export interface ConsentRecord {
  uid: string;
  privacyPolicyVersion: string;
  termsVersion: string;
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
  analyticsConsent: boolean;
  consentedAt: string;
  ipCountry: string | null;
}

export type DataExportStatus = 'pending' | 'processing' | 'ready' | 'expired';
export type DataDeletionStatus = 'pending' | 'processing' | 'completed';

export interface DataExportRequest {
  uid: string;
  requestedAt: string;
  status: DataExportStatus;
  downloadUrl: string | null;
  expiresAt: string | null;
}

export interface DataDeletionRequest {
  uid: string;
  requestedAt: string;
  status: DataDeletionStatus;
  completedAt: string | null;
}

export type DataRequest = DataExportRequest | DataDeletionRequest;
