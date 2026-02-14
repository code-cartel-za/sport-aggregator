import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut,
  user,
  User,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);

  /** Observable of the current Firebase user (null when signed out) */
  readonly user$: Observable<User | null> = user(this.auth);

  /** Signal for template-friendly reactive access */
  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly displayName = computed(() => this.currentUser()?.displayName ?? 'User');
  readonly photoURL = computed(() => this.currentUser()?.photoURL ?? null);
  readonly email = computed(() => this.currentUser()?.email ?? null);

  constructor() {
    // Keep signal in sync with the auth state
    this.user$.subscribe((u) => this.currentUser.set(u));
  }

  // ─── Google Sign-In ────────────────────────────────────────────────
  async signInWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    const result = await signInWithPopup(this.auth, provider);
    return result.user;
  }

  // ─── Apple Sign-In ─────────────────────────────────────────────────
  async signInWithApple(): Promise<User> {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    const result = await signInWithPopup(this.auth, provider);
    return result.user;
  }

  // ─── Sign Out ──────────────────────────────────────────────────────
  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
