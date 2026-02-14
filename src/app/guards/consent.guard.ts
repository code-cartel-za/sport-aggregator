import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PrivacyService } from '../services/privacy.service';

export const consentGuard: CanActivateFn = () => {
  const privacyService = inject(PrivacyService);
  const router = inject(Router);

  if (privacyService.hasConsented()) {
    return true;
  }

  return router.createUrlTree(['/consent']);
};
