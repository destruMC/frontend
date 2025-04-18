<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.store.ts'
import { storeToRefs } from 'pinia'
import api from '@/core/api.ts'
import { useMessage } from 'naive-ui'

const route = useRoute()
const { state, code }  = route.query

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const router = useRouter()
const message = useMessage()

if (user.value) {
  router.push(state === null ? '/' : state.toString())
}
else {
  if (code) {
    try {
      const response = await api.login(code.toString());
      if (response.ok) {
        const { user, token, expires } = await response.json()
        userStore.set(user, token, expires)
        message.success('登录成功')
      } else {
        message.error('登录失败')
      }
    } catch (error) {
      message.error('登录失败')
    }
    await router.push(state === null ? '/' : state.toString())
  }
  else {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=Iv23liftwY1oI5k4FzuF&state=${state}`;
  }
}
</script>

<template>
  <n-flex justify="center">
    登录中
  </n-flex>
</template>
