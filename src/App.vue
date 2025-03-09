<script setup lang="ts">
import { darkTheme, dateZhCN, lightTheme, NConfigProvider, useOsTheme, zhCN } from 'naive-ui'
import { darkThemeOverrides, lightThemeOverrides } from '@/assets/theme.ts'
import DESTRU from '@/DESTRU.vue'
import { computed } from 'vue'

const osTheme = useOsTheme()

const theme = computed(() => (osTheme.value === 'dark' ? darkTheme : lightTheme))
const themeOverrides = computed(() =>
  osTheme.value === 'dark' ? darkThemeOverrides : lightThemeOverrides,
)
</script>

<template>
  <n-config-provider
    :theme="theme"
    :themeOverrides="themeOverrides"
    preflight-style-disabled
    :locale="zhCN"
    :date-locale="dateZhCN"
  >
    <n-loading-bar-provider>
      <n-dialog-provider>
        <d-e-s-t-r-u />
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>
