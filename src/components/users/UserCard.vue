<script setup lang="ts">
import type { UserPreview } from '@/types/user'

defineProps<{
  user: UserPreview
}>()
</script>

<template>
  <router-link :to="`/user/${user.name}`">
    <n-flex align="center">
      <n-avatar round :src="user.avatar" />
      <n-text>
        {{ user.slug ? user.slug : user.name }}
      </n-text>
    </n-flex>
  </router-link>
</template>
