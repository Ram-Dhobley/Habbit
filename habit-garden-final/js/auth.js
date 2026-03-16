// ── AUTH SCREEN ──
// Shown when no user is signed in. Handles Google sign-in and the
// post-redirect result on mobile.

HG.auth = {
  currentUser: null,

  // Called on app boot — waits for Firebase auth state
  async init() {
    return new Promise((resolve) => {
      FB.onAuth(async (firebaseUser) => {
        if (firebaseUser) {
          const profile = await FB.getOrCreateUser(firebaseUser);
          HG.auth.currentUser = { ...firebaseUser, ...profile };
          // Patch mock data with real user info
          HG.data.user.name    = profile.name    || firebaseUser.displayName;
          HG.data.user.handle  = profile.handle;
          HG.data.user.city    = profile.city    || 'Pune';
          HG.data.user.country = profile.country || 'India';
          HG.data.user.bio     = profile.bio     || 'Runner · Reader · Meditator';
          HG.data.user.quote   = profile.quote   || '"Discipline is choosing between what you want now and what you want most."';
          document.getElementById('auth-screen').style.display = 'none';
          document.getElementById('main-app').style.display = 'flex';
          resolve(true);
        } else {
          document.getElementById('auth-screen').style.display = 'flex';
          document.getElementById('main-app').style.display = 'none';
          resolve(false);
        }
      });
      // Handle redirect result (mobile Google sign-in)
      FB.handleRedirectResult().catch(() => {});
    });
  },

  async signIn() {
    const btn = document.getElementById('signin-btn');
    if (btn) { btn.textContent = 'Signing in…'; btn.disabled = true; }
    try {
      await FB.signInGoogle();
    } catch (e) {
      if (btn) { btn.textContent = 'Continue with Google'; btn.disabled = false; }
      HG.util.toast('Sign-in failed. Try again.');
    }
  },

  async signOut() {
    await FB.signOutUser();
    HG.util.toast('Signed out');
  },

  html() {
    return `
    <div id="auth-screen" style="
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      min-height:100dvh;min-height:100vh;padding:40px 32px;text-align:center;
      background:var(--bg);
    ">
      <div style="font-size:72px;margin-bottom:16px">🌿</div>
      <div style="font-family:var(--fd);font-size:30px;font-weight:700;color:var(--g700);margin-bottom:8px">Habit Garden</div>
      <div style="font-size:14px;color:var(--tx3);margin-bottom:48px;line-height:1.6">
        Grow habits.<br>Watch your garden come alive.
      </div>

      <button id="signin-btn" onclick="HG.auth.signIn()" style="
        display:flex;align-items:center;gap:12px;
        background:var(--surf);border:0.5px solid var(--bdr);border-radius:14px;
        padding:14px 24px;font-size:15px;font-weight:500;font-family:var(--fn);
        color:var(--tx);cursor:pointer;width:100%;max-width:280px;justify-content:center;
        transition:background .15s;
      ">
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.5-1.45-.79-3-.79-4.59s.29-3.14.79-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.55 10.78l7.98-6.19z"/>
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.55 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        </svg>
        Continue with Google
      </button>

      <div style="font-size:11px;color:var(--tx3);margin-top:32px;line-height:1.6;max-width:260px">
        By continuing you agree to our terms.<br>
        Your data stays private by default.
      </div>
    </div>`;
  }
};
