<script setup lang="ts">
import IconLogo from '@/components/icons/IconLogo.vue'
import IconCube from '@/components/icons/xicons/tabler/IconCube.vue'
import IconEdit from '@/components/icons/xicons/tabler/IconEdit.vue'
</script>

<template>
  <n-flex vertical align="center" justify="center">
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
      <router-link to="/editor">
        <n-button>
          <template #icon>
            <n-icon :component="IconEdit" />
          </template>
          在线编辑
        </n-button>
      </router-link>
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
