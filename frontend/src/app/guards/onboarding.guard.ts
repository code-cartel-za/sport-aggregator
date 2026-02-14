import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const onboardingGuard: CanActivateFn = () => {
  const router = inject(Router);

  const complete = localStorage.getItem('onboarding_complete') === 'true';
  if (complete) return true;

  return router.createUrlTree(['/onboarding']);
};
