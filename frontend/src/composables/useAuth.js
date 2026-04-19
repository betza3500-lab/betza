/**
 * useAuth – reactive authentication state for the Betza app.
 *
 * Provides a module-level singleton so that any component that imports
 * useAuth() shares the same reactive state without a dedicated store
 * library.
 *
 * Usage:
 *   const { user, isAuthenticated, loading, checkSession, logout } = useAuth()
 */

import { ref, computed } from 'vue';

const user = ref(null);
const loading = ref(true); // true until the first session check completes

const isAuthenticated = computed(() => user.value !== null);

/**
 * Calls GET /api/auth/session to restore auth state from the server-managed
 * session cookie. Should be called once on app startup.
 *
 * @returns {Promise<boolean>} true when a valid session was found.
 */
async function checkSession() {
  loading.value = true;
  try {
    const res = await fetch('/api/auth/session', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      user.value = data.user;
      return true;
    }
    user.value = null;
    return false;
  } catch {
    user.value = null;
    return false;
  } finally {
    loading.value = false;
  }
}

/**
 * Logs the user out by calling POST /api/auth/logout and clears local state.
 */
async function logout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } finally {
    user.value = null;
  }
}

/**
 * Initiates the Google Sign-In flow by navigating the browser to
 * /api/auth/login. This causes a full-page redirect so no AJAX fetch
 * is needed.
 */
function loginWithGoogle() {
  window.location.href = '/api/auth/login';
}

export function useAuth() {
  return {
    user,
    loading,
    isAuthenticated,
    checkSession,
    logout,
    loginWithGoogle,
  };
}
