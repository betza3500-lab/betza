<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'

import SvgIcon from 'vue3-icon';
import { mdiTableLarge, mdiFormatListNumbered, mdiChartLine } from '@mdi/js'
import { useAuth } from './composables/useAuth.js'
import ParticipantAvatar from './components/ParticipantAvatar.vue'

const { user, isAuthenticated, logout } = useAuth();
const router = useRouter();

async function handleLogout() {
  await logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <b-navbar toggleable="sm" dark fix="top" sticky="top" class="p-0">
    <b-navbar-brand class="logos">
      <RouterLink to="/"><img alt="Betza logo" class="ms-2 logo" src="@/assets/logo.svg" /></RouterLink>
    </b-navbar-brand>

    <template v-if="isAuthenticated">
      <div class="d-sm-none d-flex justify-content-evenly flex-grow-1">
        <b-link active-class="active" class="nav-link" to="/resultaat"><svg-icon class="menu-icon" type="mdi" :path="mdiTableLarge" :size="30"></svg-icon></b-link>
        <b-link active-class="active" class="nav-link" to="/grafiek"><svg-icon class="menu-icon" type="mdi" :path="mdiChartLine" :size="30"></svg-icon></b-link>
        <b-link active-class="active" class="nav-link" to="/tussenstand"><svg-icon class="menu-icon" type="mdi" :path="mdiFormatListNumbered" :size="30"></svg-icon></b-link>
      </div>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-link active-class="active" class="nav-link" to="/resultaat"><span class="d-flex justify-content-center" data-bs-target="#nav-collapse" data-bs-toggle="collapse">Resultaat</span></b-link>
          <b-link active-class="active" class="nav-link" to="/grafiek"><span class="d-flex justify-content-center" data-bs-target="#nav-collapse" data-bs-toggle="collapse">Grafiek</span></b-link>
          <b-link active-class="active" class="nav-link" to="/tussenstand"><span class="d-flex justify-content-center" data-bs-target="#nav-collapse" data-bs-toggle="collapse">Tussenstand</span></b-link>
          <b-link active-class="active" class="nav-link" to="/deelnemers"><span class="d-flex justify-content-center" data-bs-target="#nav-collapse" data-bs-toggle="collapse">Deelnemers</span></b-link>
          <b-link active-class="active" class="nav-link" to="/halloffame"><span class="d-flex justify-content-center" data-bs-target="#nav-collapse" data-bs-toggle="collapse">Hall of fame</span></b-link>
          <b-link active-class="active" class="nav-link" to="/hallofshame"><span class="d-flex justify-content-center" data-bs-target="#nav-collapse" data-bs-toggle="collapse">Hall of shame</span></b-link>
          <div class="nav-user d-flex align-items-center gap-2 px-2 ms-auto">
            <ParticipantAvatar v-if="user?.pictureID" :pictureId="user.pictureID" />
            <img
              v-else-if="user?.picture"
              class="google-avatar"
              :src="user.picture"
              :alt="user.naam ?? user.name"
            />
            <span class="nav-username d-none d-sm-inline">{{ user?.naam ?? user?.name }}</span>
            <button class="btn-logout" @click="handleLogout">Afmelden</button>
          </div>
        </b-navbar-nav>
      </b-collapse>
    </template>

    <template v-else>
      <div class="ms-auto me-2">
        <RouterLink to="/login" class="btn-login">Aanmelden</RouterLink>
      </div>
    </template>
  </b-navbar>

  <RouterView />
</template>

<style scoped>
.logo {
  display: block;
  margin: 0 auto 0rem;
  padding: 2px;
  width: 90px;
  height: 45px;
}

.onelove {
  display: block;
  margin: auto;
  padding: 2px;
  height: 20px;
}

b-navbar {
  background-color: black;
}

.logos {
  display: flex;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  border-bottom: #9bd02bff 1px solid;
  background-color: black;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

.prono {
  background-color: var(--betza-light);
  color: black;
  font-weight: bold !important;
}


nav a:first-of-type {
  border: 0;
}

.menu-icon {
  color: var(--betza-dark);
}

.nav-user {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 0.5rem;
  margin-top: 0.25rem;
}

.google-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.nav-username {
  font-size: 0.85rem;
  color: var(--vt-c-text-dark-2, #aaa);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-logout {
  padding: 0.25rem 0.65rem;
  font-size: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: background 0.15s ease;
  white-space: nowrap;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.08);
}

.btn-login {
  padding: 0.25rem 0.75rem;
  font-size: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  color: inherit;
  text-decoration: none;
  transition: background 0.15s ease;
}

.btn-login:hover {
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
}

@media (min-width: 576px) {
  .nav-user {
    border-top: none;
    padding-top: 0;
    margin-top: 0;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    padding-left: 0.75rem;
  }
}

@media (min-width: 1024px) {

  .logo {
    margin: 0 2rem 0 0;
  }

  nav {
    text-align: right;
    margin-left: -1rem;
    font-size: 1rem;    
  }
}
</style>

