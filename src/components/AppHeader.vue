<script setup lang="ts">
import IconTitle from '@/components/icons/IconTitle.vue'
import IconLogo from '@/components/icons/IconLogo.vue'
</script>

<template>
  <nav class="nav">
    <router-link to="/">
      <n-h1 class="brand">
        <n-icon size="2rem" :component="IconLogo" />
        <icon-title class="title" />
      </n-h1>
    </router-link>
  </nav>
</template>

<style scoped>
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav .brand {
  display: flex;
  gap: 0.5rem;
}

.nav .brand .title {
  width: 4rem;
}
</style>
