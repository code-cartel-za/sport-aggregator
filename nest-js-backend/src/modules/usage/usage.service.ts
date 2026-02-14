import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { B2bUsageRecord } from '../../types';

@Injectable()
export class UsageService {
  constructor(
    @Inject('FIRESTORE') private readonly db: admin.firestore.Firestore,
  ) {}

  async getUsageForKey(apiKey: string, days: number = 30): Promise<B2bUsageRecord[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startStr = startDate.toISOString().split('T')[0] as string;

    const snapshot = await this.db
      .collection('api-usage')
      .where('key', '==', apiKey)
      .where('date', '>=', startStr)
      .orderBy('date', 'desc')
      .get();

    return snapshot.docs.map((doc) => doc.data() as B2bUsageRecord);
  }

  async getTodayUsage(apiKey: string): Promise<B2bUsageRecord | null> {
    const today = new Date().toISOString().split('T')[0] as string;
    const doc = await this.db.collection('api-usage').doc(`${apiKey}_${today}`).get();
    return doc.exists ? (doc.data() as B2bUsageRecord) : null;
  }
}
