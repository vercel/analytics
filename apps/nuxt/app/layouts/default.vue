<template>
  <header>
    <img alt="Nuxt logo" class="logo" src="@/assets/logo.svg" width="180" />
    <div class="wrapper">
      <nav>
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/blog/various/hi">Hi!</NuxtLink>
        <NuxtLink to="/blog/various/hallo">Hallo!</NuxtLink>
      </nav>
    </div>
    <slot />
  </header>
</template>

<style>
@import url('~/assets/main.css');

header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 2rem auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin: 2rem 0;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}
</style>
