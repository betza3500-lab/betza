<script setup>
import { RouterLink, RouterView } from 'vue-router'

import SvgIcon from 'vue3-icon';
import { mdiTableLarge, mdiFormatListNumbered, mdiChartLine, mdiFootball   } from '@mdi/js'


</script>

<template>
   <b-navbar toggleable="sm" dark fix="top" sticky="top" class="p-0">
    <b-navbar-brand class="logos">
      <RouterLink to="/"><img alt="Betza logo" class="ms-2 logo" src="@/assets/logo.svg" /></RouterLink>
    </b-navbar-brand>
    <div class="d-sm-none d-flex justify-content-evenly flex-grow-1">
    <!--
      <b-link active-class="active" class="nav-link prono flex-grow" target="_blank" href="https://forms.gle/5Be7stkJmnizxYsT9"><span class="d-flex justify-content-center">Geef pronostiek</span></b-link> 
    -->
    <b-link active-class="active" class="nav-link" to="/resultaat"><svg-icon class="menu-icon" type="mdi" :path="mdiTableLarge" :size="30"></svg-icon></b-link>
    <b-link active-class="active" class="nav-link" to="/grafiek"><svg-icon class="menu-icon" type="mdi" :path="mdiChartLine" :size="30"></svg-icon></b-link>
    <b-link active-class="active" class="nav-link" to="/tussenstand"><svg-icon class="menu-icon" type="mdi" :path="mdiFormatListNumbered" :size="30"></svg-icon></b-link>
    </div>
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav>   
        <!-- <b-link active-class="active" class="nav-link prono" target="_blank" href="https://forms.gle/5Be7stkJmnizxYsT9"><span class="d-flex justify-content-center" data-bs-target="#nav-collapse" data-bs-toggle="collapse">Geef pronostiek</span></b-link> -->
        <b-link active-class="active" class="nav-link" to="/resultaat"><span class="d-flex justify-content-center" data-bs-target="#nav-collapse" data-bs-toggle="collapse">Resultaat</span></b-link>
        <b-link active-class="active" class="nav-link" to="/grafiek"><span class="d-flex justify-content-center" data-bs-target="#nav-collapse" data-bs-toggle="collapse">Grafiek</span></b-link>
        <b-link active-class="active" class="nav-link" to="/tussenstand"><span class="d-flex justify-content-center" data-bs-target="#nav-collapse" data-bs-toggle="collapse">Tussenstand</span></b-link>
        <b-link active-class="active" class="nav-link" to="/deelnemers"><span class="d-flex justify-content-center" data-bs-target="#nav-collapse" data-bs-toggle="collapse">Deelnemers</span></b-link>
        <b-link active-class="active" class="nav-link" to="/halloffame"><span class="d-flex justify-content-center" data-bs-target="#nav-collapse" data-bs-toggle="collapse">Hall of fame</span></b-link>
        <b-link active-class="active" class="nav-link" to="/hallofshame"><span class="d-flex justify-content-center" data-bs-target="#nav-collapse" data-bs-toggle="collapse">Hall of shame</span></b-link>
        
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
  <svg-icon type="mdi" :path="mdiAccount" :size="48"></svg-icon>
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
