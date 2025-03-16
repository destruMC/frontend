<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { loadingBarApi, setTitle } from '@/routers/router.ts'
import api from '@/core/api.ts'
import { NFlex } from 'naive-ui'
import { useIsMobile } from '@/utils/composables.util.ts'
import { useUserStore } from '@/stores/user.store.ts'
import { storeToRefs } from 'pinia'

const isMobile = useIsMobile()
const g = computed(() => (isMobile.value ? '1rem' : '2rem'))

const route = useRoute()

const isLoading = ref(true)
const error = ref()

const userRef = ref()

const load = async () => {
  try {
    isLoading.value = true

    const { user } = await api.getUser(route.params.id.toString())
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
const { flag, user } = storeToRefs(userStore)
const editable = computed(() => {
  return user.value && user.value['id'] === localStorage.getItem('id') && flag.value
})

onMounted(() => {
  load()
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
        <n-avatar round :size="256" :src="userRef['avatar']" />
        <n-flex vertical>
          <n-h1>
            {{ userRef['name'] }}
          </n-h1>
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
