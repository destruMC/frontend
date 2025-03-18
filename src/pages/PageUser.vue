<script setup lang="ts">
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { loadingBarApi, setTitle } from '@/routers/router.ts'
import api from '@/core/api.ts'
import { NFlex } from 'naive-ui'
import { useIsMobile } from '@/utils/composables.util.ts'
import { useUserStore } from '@/stores/user.store.ts'
import { storeToRefs } from 'pinia'
import type { User } from '@/types/user'

const isMobile = useIsMobile()
const g = computed(() => (isMobile.value ? '1rem' : '2rem'))

const isLoading = ref(true)
const error = ref()
const userRef = ref<User>()

const load = async (name: string) => {
  try {
    isLoading.value = true

    const { user } = await api.getUserByName(name)
    userRef.value = user

    setTitle(user.name, '用户')
  } catch (e) {
    error.value = '加载失败'
    setTitle(error.value, '用户')
  } finally {
    isLoading.value = false
    loadingBarApi.value?.finish()
  }
}

const userStore = useUserStore()
const { flag } = storeToRefs(userStore)
const editable = computed(() => {
  return userRef.value && userRef.value.id === localStorage.getItem('id') && flag.value
})

onMounted(() => {
  const route = useRoute()
  load(route.params.name.toString())
})

onBeforeRouteUpdate((to, from, next) => {
  if (to.params.name !== from.params.name) {
    load(to.params.name.toString())
  }
  next()
})

onBeforeUnmount(() => {
  if (isLoading.value) {
    loadingBarApi.value?.finish()
  }
})
</script>

<template>
  <n-flex vertical :style="`width: 100%${isMobile ? `;` : `; gap: 1rem;`};`">
    <n-empty v-if="!userRef && !isLoading" :description="error" />
    <n-flex v-if="userRef">
      <n-flex vertical :style="`gap: ${g};`">
        <n-avatar round :size="256" :src="userRef.avatar" />
        <n-flex vertical>
          <n-h1>
            {{ userRef.slug ? userRef.slug : userRef.name }}
          </n-h1>
          <n-text depth="3" v-if="userRef.slug">
            {{ userRef.name }}
          </n-text>
        </n-flex>
        <router-link v-if="editable" to="/settings/profile">
          <n-button secondary> 编辑资料 </n-button>
        </router-link>
      </n-flex>
    </n-flex>
  </n-flex>
</template>

<style scoped>
.n-empty {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.n-button {
  width: 100%;
}
</style>
