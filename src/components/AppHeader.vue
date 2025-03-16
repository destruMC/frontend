<script setup lang="ts">
import IconLogo from '@/components/icons/IconLogo.vue'
import IconTitle from '@/components/icons/IconTitle.vue'
import IconLogin from '@/components/icons/xicons/tabler/IconLogin.vue'
import { useUserStore } from '@/stores/user.store.ts'
import { storeToRefs } from 'pinia'
import { type Component, h } from 'vue'
import { NButton, NIcon, NText, useThemeVars } from 'naive-ui'
import IconLogout from '@/components/icons/xicons/tabler/IconLogout.vue'
import IconHome from '@/components/icons/xicons/tabler/IconHome.vue'
import { RouterLink } from 'vue-router'

const theme = useThemeVars()

const userStore = useUserStore()
const { flag, user } = storeToRefs(userStore)

const label = (label: string, type?: string, to?: string) => () => {
  const result = h(
    NText,
    {
      type,
    },
    {
      default: () => label,
    },
  )

  if (to) {
    return h(
      RouterLink,
      {
        to,
      },
      {
        default: () => result,
      },
    )
  }

  return result
}
const icon = (icon: Component, color?: string) => () =>
  h(NIcon, { component: () => h(icon), color })
const options = [
  {
    key: 'profile',
    label: label('我的主页', undefined, '/profile'),
    icon: icon(IconHome),
  },
  {
    type: 'divider',
  },
  {
    key: 'logout',
    label: label('退出登录', 'error'),
    icon: icon(IconLogout, theme.value.errorColor),
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
