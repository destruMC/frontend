<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useResourceStore } from '@/stores/resource.store.ts'
import { storeToRefs } from 'pinia'
import { ItemRenderer, ItemStack } from 'deepslate'

const props = defineProps<{
  item: ItemStack
  size: number
}>()

const canvas = ref<HTMLCanvasElement>()

const resourceStore = useResourceStore()
const { isReady, resources } = storeToRefs(resourceStore)

watchEffect(() => {
  if (isReady.value && resources.value && canvas.value) {
    const gl = canvas.value.getContext('webgl')
    if (!gl) return

    new ItemRenderer(gl, props.item, resources.value).drawItem()
  }
})
</script>

<template>
  <canvas :width="size" :height="size" ref="canvas" />
</template>
