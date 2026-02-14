import { Module, Global, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Global()
@Module({
  providers: [
    {
      provide: 'FIRESTORE',
      useFactory: (): admin.firestore.Firestore => {
        if (!admin.apps.length) {
          admin.initializeApp({
            projectId: process.env['FIREBASE_PROJECT_ID'] ?? 'sport-aggregator-5bbd7',
          });
        }
        return admin.firestore();
      },
    },
  ],
  exports: ['FIRESTORE'],
})
export class FirebaseModule implements OnModuleInit {
  onModuleInit(): void {
    console.log('🔥 Firebase Admin initialized');
  }
}
