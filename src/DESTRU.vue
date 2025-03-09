<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useIsMobile } from '@/utils/composables.util.ts'
import { loadingBarApi } from './routers/router'
import { computed, onMounted } from 'vue'
import { useLoadingBar } from 'naive-ui'

const isMobile = useIsMobile()

const p = computed(() => (isMobile.value ? '0.5rem 1rem' : '1rem 2rem'))
const m = computed(() => (isMobile.value ? '3rem' : '4rem'))
const h = computed(() => `calc(100vh - ${m.value})`)

const loadingBar = useLoadingBar()

onMounted(() => {
  loadingBarApi.value = loadingBar
  loadingBar.finish()
})
</script>

<template>
  <n-layout>
    <n-layout-header bordered :style="`z-index: 1; position: fixed; padding: ${p};`">
      <app-header />
    </n-layout-header>
    <n-scrollbar :style="`max-height: ${h}; margin-top: ${m};`">
      <n-layout-content
        :content-style="`min-height: ${h}; display: flex; justify-content: center; padding: ${p}; padding-bottom: ${isMobile ? `1rem` : `2rem`};`"
      >
        <router-view />
      </n-layout-content>
      <n-layout-footer bordered style="display: flex; justify-content: center">
        <app-footer />
      </n-layout-footer>
    </n-scrollbar>
  </n-layout>
</template>
