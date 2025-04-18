<script setup lang="ts">
defineProps<{
  user: {
    id: string
    avatar: string
  }
}>()
</script>

<template>
  <router-link :to="`/user/${user.id}`">
    <n-flex align="center">
      <n-avatar round :src="user.avatar" />
      <n-text>
        {{ user.id }}
      </n-text>
    </n-flex>
  </router-link>
</template>
