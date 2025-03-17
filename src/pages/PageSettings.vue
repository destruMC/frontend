<script setup lang="ts">
import { type Component, computed, h } from 'vue'
import { NIcon } from 'naive-ui'
import IconUser from '@/components/icons/xicons/tabler/IconUser.vue'
import IconPalette from '@/components/icons/xicons/tabler/IconPalette.vue'
import IconShield from '@/components/icons/xicons/tabler/IconShield.vue'
import { RouterLink, useRoute } from 'vue-router'
import { useIsMobile } from '@/utils/composables.util.ts'

const isMobile = useIsMobile()
const g = computed(() => (isMobile.value ? '1rem' : '2rem'))

const route = useRoute()

const option = (label: string, key: string, icon: Component) => {
  return {
    label: () => h(RouterLink, { to: key }, { default: () => label }),
    key,
    icon: () => h(NIcon, { component: () => h(icon) }),
  }
}
const options = [
  option('外观', 'appearance', IconPalette),
  {
    type: 'divider',
  },
  option('资料', 'profile', IconUser),
  option('账户', 'account', IconShield),
]
</script>

<template>
  <n-flex :vertical="isMobile" :style="`width: 100%; gap: ${g};`">
    <n-menu :options :value="route.params.option" />
    <n-flex class="grow">
      <n-flex vertical :style="`width: 100%; gap: ${g};`">
        <template #default v-if="route.params.option === 'profile'">
          <n-h1> 编辑资料 </n-h1>
          <n-flex :style="isMobile ? '' : `gap: ${g};`">
            <n-form class="grow">
              <n-form-item path="name" label="名称">
                <n-input />
              </n-form-item>
              <n-form-item path="bio" label="简介">
                <n-input type="textarea" />
              </n-form-item>
            </n-form>
            <n-flex vertical>
              头像
              <n-avatar round :size="256" />
            </n-flex>
          </n-flex>
          <n-flex>
            <n-button type="primary" disabled> 更新资料 </n-button>
          </n-flex>
        </template>
      </n-flex>
    </n-flex>
  </n-flex>
</template>

<style scoped>
.n-menu {
  flex: 0 0 20%;
}

.grow {
  flex-grow: 1;
}
</style>
