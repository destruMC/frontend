<script setup lang="ts">
import { useIsMobile } from '@/utils/composables.util.ts'
import { computed, onMounted, ref } from 'vue'
import { useThemeVars } from 'naive-ui'
import ReloadableEmpty from '@/components/ReloadableEmpty.vue'
import api from '@/core/api.ts'

const theme = useThemeVars()

const isMobile = useIsMobile()

const s = computed(() => (isMobile.value ? '1rem' : '1.5rem'))
const b = computed(() => (isMobile.value ? '0.5rem' : '1rem'))

const structuresRef = ref<
  {
    id: string
    name: string
    image: string
    author: string
  }[]
>()

const isLoading = ref(true)
const error = ref()

const loadStructures = async () => {
  try {
    isLoading.value = true

    const { structures } = await (await api.getStructures()).json()
    structuresRef.value = structures
  } catch (e) {
    error.value = '加载失败'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadStructures()
})
</script>

<template>
  <n-flex vertical :style="`gap: ${isMobile ? `0.5rem` : `1rem`};`">
    <n-h1> 结构列表 </n-h1>
    <n-spin class="full" :show="isLoading" content-style="height: 100%;">
      <reloadable-empty
        v-if="!structuresRef && !isLoading"
        :description="error"
        :onclick="loadStructures"
      />
      <n-grid
        v-if="structuresRef"
        cols="1 s:2 m:3 l:4"
        x-gap="s:32"
        y-gap="16 s:32"
        responsive="screen"
      >
        <n-gi v-for="structure in structuresRef" :key="structure.id">
          <router-link :to="'/structure/' + structure.id">
            <n-card
              hoverable
              size="huge"
              :header-style="`padding: ${b} ${s};`"
              :content-style="`padding: 0 ${s} ${b};`"
            >
              <template #header>
                <n-h2 class="name">
                  {{ structure.name }}
                </n-h2>
              </template>
              <template #cover>
                <n-image
                  lazy
                  preview-disabled
                  :src="structure.image"
                  object-fit="cover"
                  :style="`width: 100%; aspect-ratio: 16/9; background-color: ${theme.bodyColor};`"
                />
              </template>
              <span>
                {{ structure.author }}
              </span>
            </n-card>
          </router-link>
        </n-gi>
      </n-grid>
    </n-spin>
  </n-flex>
</template>

<style scoped>
.name {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.full {
  height: 100%;
}
</style>
