<script setup lang="ts">
import IconLogo from '@/components/icons/IconLogo.vue'
import IconCube from '@/components/icons/xicons/tabler/IconCube.vue'
import IconApps from '@/components/icons/xicons/tabler/IconApps.vue'
import { useLoadingBar } from 'naive-ui'

const loadingBar = useLoadingBar()

function handleError() {
  loadingBar.error()
}
</script>

<template>
  <n-flex vertical align="center" justify="center" size="small">
    <n-icon size="12rem" :component="IconLogo" />
    <n-h1> 分享 Minecraft 结构的网站 </n-h1>
    <n-text> 在这里发现、展示、分享结构，<br />一起构建我的世界。 </n-text>
    <n-flex justify="center">
      <router-link to="/structures">
        <n-button type="primary">
          <template #icon>
            <n-icon :component="IconCube" />
          </template>
          浏览结构
        </n-button>
      </router-link>
      <n-button @click="handleError">
        <template #icon>
          <n-icon :component="IconApps" />
        </template>
        我的面板
      </n-button>
    </n-flex>
  </n-flex>
</template>

<style scoped>
.n-flex {
  gap: 1rem !important;
}

.n-h1 {
  text-align: center;
  font-size: 3rem;
}

.n-text {
  text-align: center;
  margin-bottom: 1rem;
}
</style>
