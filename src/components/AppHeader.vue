<script setup lang="ts">
import IconLogo from '@/components/icons/IconLogo.vue'
import IconTitle from '@/components/icons/IconTitle.vue'
import IconLogin from '@/components/icons/xicons/tabler/IconLogin.vue'
import { useUserStore } from '@/stores/user.store.ts'
import { storeToRefs } from 'pinia'
import { h } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import IconLogout from '@/components/icons/xicons/tabler/IconLogout.vue'

const userStore = useUserStore()
const { flag, user } = storeToRefs(userStore)

const options = [
  {
    key: 'logout',
    label: () => '退出登录',
    icon: () =>
      h(NIcon, {
        component: IconLogout,
      }),
  },
]

async function handleSelect(key: string) {
  switch (key) {
    case 'logout': {
      localStorage.removeItem('id')
      await userStore.set(undefined)
      break
    }
  }
}
</script>

<template>
  <nav class="nav">
    <router-link to="/">
      <n-h1 class="brand">
        <n-icon size="2rem" :component="IconLogo" />
        <icon-title class="title" />
      </n-h1>
    </router-link>
    <router-link v-if="!flag" to="/sign">
      <n-button type="primary" size="small">
        <template #icon>
          <n-icon :component="IconLogin" />
        </template>
        登录
      </n-button>
    </router-link>
    <n-button v-if="flag" text>
      <n-dropdown trigger="click" @select="handleSelect" :options="options">
        <n-avatar round :size="32" :src="user ? user['avatar'] : ''" />
      </n-dropdown>
    </n-button>
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
