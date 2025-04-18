<script setup lang="ts">
import IconTitle from '@/components/icons/IconTitle.vue'
import IconLogo from '@/components/icons/IconLogo.vue'
import IconBrandGithub from '@/components/icons/xicons/tabler/IconBrandGithub.vue'
import { RouterLink, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user.store.ts'
import { storeToRefs } from 'pinia'
import { type Component, h, ref } from 'vue'
import { NIcon, NText, useMessage, useThemeVars } from 'naive-ui'
import IconUser from '@/components/icons/xicons/tabler/IconUser.vue'
import IconLogout from '@/components/icons/xicons/tabler/IconLogout.vue'
import api from '@/core/api.ts'

const route = useRoute()

const userStore = useUserStore()
const { user, token } = storeToRefs(userStore)

const theme = useThemeVars()

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
    label: label('个人资料', undefined, () => {
      return `/user/${user.value?.id}`
    }),
    icon: icon(IconUser),
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
      userStore.clear()
      message.success('已退出登录')
      break
    }
  }
}

if (user.value && token.value) {
  api.auth(token.value).then(async (response) => {
    if (response.ok) {
      const { user, token, expires } = await response.json()
      userStore.set(user, token, expires)
    } else {
      userStore.clear()
      message.error('登录过期')
    }
  })
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
    <template v-if="route.path !== '/login'">
      <router-link v-if="!user" to="login">
        <n-button type="primary">
          <template #icon>
            <n-icon :component="IconBrandGithub" />
          </template>
          登录
        </n-button>
      </router-link>
      <n-button v-if="user" text>
        <n-dropdown trigger="click" @select="handleSelect" :options>
          <n-avatar round :size="32" :src="user?.avatar" />
        </n-dropdown>
      </n-button>
    </template>
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
