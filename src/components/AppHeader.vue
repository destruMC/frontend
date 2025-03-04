<script setup lang="ts">
import IconLogo from "@/components/icons/IconLogo.vue";
import IconTitle from "@/components/icons/IconTitle.vue";
import IconLogin from "@/components/icons/xicons/tabler/IconLogin.vue";
</script>

<template>
  <nav class="nav">
    <router-link to="/">
      <n-h1 class="brand">
        <n-icon size="2rem" :component="IconLogo" />
        <icon-title class="title" />
      </n-h1>
    </router-link>
    <router-link to="/sign">
      <n-button type="primary" size="small">
        <template #icon>
          <n-icon :component="IconLogin" />
        </template>
        登录
      </n-button>
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
