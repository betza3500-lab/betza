<script setup>
import { useAuth } from '../composables/useAuth.js';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const { loginWithGoogle } = useAuth();
const route = useRoute();

// Surface a human-readable error message when Google redirects back with
// an auth_error query parameter (set by the server callback handler).
const authErrorMessages = {
  oauth_denied: 'Je hebt de Google-aanmelding geannuleerd.',
  state_mismatch: 'Beveiligingsfout bij aanmelding. Probeer opnieuw.',
  no_email: 'Geen e-mailadres ontvangen van Google.',
  access_denied: 'Jouw e-mailadres is niet geregistreerd. Contacteer de Betza-beheerder.',
  session_error: 'Sessie kon niet aangemaakt worden. Probeer opnieuw.',
  server_error: 'Er is een serverfout opgetreden. Probeer later opnieuw.',
};

const errorMessage = computed(() => {
  const key = route.query.auth_error;
  return key ? (authErrorMessages[key] ?? 'Aanmelden mislukt. Probeer opnieuw.') : null;
});
</script>

<template>
  <main class="login-page container">
    <div class="row justify-content-center">
      <div class="col-12 col-sm-8 col-md-6 col-lg-4">
        <div class="login-card">
          <img
            alt="Betza logo"
            class="login-logo"
            src="@/assets/logo.svg"
          />
          <h1 class="login-title">Betza</h1>
          <p class="login-subtitle">Aanmelden om verder te gaan</p>

          <div v-if="errorMessage" class="error-box" role="alert">
            {{ errorMessage }}
          </div>

          <button class="btn-google" @click="loginWithGoogle">
            <svg class="google-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Aanmelden met Google
          </button>

          <p class="login-note">
            Enkel geregistreerde deelnemers hebben toegang.<br />
            Gebruik het e-mailadres dat aan jouw account is gekoppeld.
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.login-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.login-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2.5rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.login-logo {
  height: 60px;
  width: auto;
  margin-bottom: 0.5rem;
}

.login-title {
  font-size: 2rem;
  margin: 0;
  color: var(--betza-light);
}

.login-subtitle {
  margin: 0;
  color: var(--vt-c-text-dark-2, #aaa);
  font-size: 0.95rem;
}

.error-box {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(234, 67, 53, 0.12);
  border: 1px solid rgba(234, 67, 53, 0.35);
  color: #f08080;
  font-size: 0.9rem;
}

.btn-google {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1.4rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  color: inherit;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.btn-google:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}

.google-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.login-note {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  color: var(--vt-c-text-dark-2, #888);
  line-height: 1.6;
}
</style>
