<script setup lang="ts">
import type { User } from '@/types/user'

defineProps<{
  user: User
}>()
</script>

<template>
  <n-flex align="center">
    <n-avatar round :src="user.avatar" />
    {{ user.name }}
  </n-flex>
</template>
