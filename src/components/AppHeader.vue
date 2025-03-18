<script setup lang="ts">
import IconLogo from '@/components/icons/IconLogo.vue'
import IconTitle from '@/components/icons/IconTitle.vue'
import IconLogin from '@/components/icons/xicons/tabler/IconLogin.vue'
import { useUserStore } from '@/stores/user.store.ts'
import { storeToRefs } from 'pinia'
import { type Component, h, ref } from 'vue'
import { NButton, NIcon, NText, useMessage, useThemeVars } from 'naive-ui'
import IconLogout from '@/components/icons/xicons/tabler/IconLogout.vue'
import { RouterLink } from 'vue-router'
import IconUser from '@/components/icons/xicons/tabler/IconUser.vue'
import IconSettings from '@/components/icons/xicons/tabler/IconSettings.vue'
import api from '@/core/api.ts'

const theme = useThemeVars()

const userStore = useUserStore()
const { flag, user } = storeToRefs(userStore)

const label = (label: string, type?: string, to?: () => string) => () => {
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
        to: to(),
      },
      {
        default: () => result,
      },
    )
  }

  return result
}
const icon = (icon: Component, color?: () => string) => () =>
  h(NIcon, { component: () => h(icon), color: color ? color() : undefined })
const options = ref([
  {
    key: 'profile',
    label: label('个人资料', undefined, () => `/user/${user.value?.name}`),
    icon: icon(IconUser),
  },
  {
    key: 'settings',
    label: label('设置', undefined, () => '/settings/appearance'),
    icon: icon(IconSettings),
  },
  {
    type: 'divider',
  },
  {
    key: 'logout',
    label: label('退出登录', 'error'),
    icon: icon(IconLogout, () => theme.value.errorColor),
  },
])

const message = useMessage()

async function handleSelect(key: string) {
  switch (key) {
    case 'logout': {
      localStorage.removeItem('id')
      message.success('已退出登录')
      await userStore.set(undefined)
      await api.logout()
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
      <n-dropdown trigger="click" @select="handleSelect" :options>
        <n-avatar round :size="32" :src="user?.avatar || ''" />
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
