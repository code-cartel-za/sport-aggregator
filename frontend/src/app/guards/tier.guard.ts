import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { TierService } from '../services/tier.service';

export const proGuard: CanActivateFn = () => {
  const tierService = inject(TierService);
  return tierService.isPro();
};

export const eliteGuard: CanActivateFn = () => {
  const tierService = inject(TierService);
  return tierService.isElite();
};
