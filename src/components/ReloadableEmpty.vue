<script setup lang="ts">
defineProps({
  description: {
    type: String,
    required: true,
  },
  onclick: {
    type: Function,
    required: false,
  },
})
</script>

<template>
  <n-empty :description>
    <template #icon>
      <n-flex justify="center">
        <n-button tertiary :onclick> 重试 </n-button>
      </n-flex>
    </template>
  </n-empty>
</template>

<style scoped>
.n-empty {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
