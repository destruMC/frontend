<script setup lang="ts">
import StructureRenderer from '@/components/renderers/StructureRenderer.vue'
import { ref } from 'vue'
import { loadStructure } from '@/utils/deepslate/structures.util.ts'
import { NbtFile } from 'deepslate'
import { useLoadingBar } from 'naive-ui'

const loadingBar = useLoadingBar()

const options = ref({
  grid: false,
  invisibleBlocks: false,
})

const structure = ref()

function preventDefault(e: Event) {
  e.preventDefault()
}

async function handleDrop(e: DragEvent) {
  preventDefault(e)

  structure.value = undefined

  const dt = e.dataTransfer
  const files = dt?.files

  if (files && files.length > 0) {
    const file = files[0]

    try {
      loadingBar.start()

      const arrayBuffer = await file.arrayBuffer()
      structure.value = loadStructure(NbtFile.read(new Uint8Array(arrayBuffer)).root)

      loadingBar.finish()
    } catch (e) {
      loadingBar.error()
    }
  }
}
</script>

<template>
  <n-flex
    align="center"
    justify="center"
    @dragenter="preventDefault"
    @dragover="preventDefault"
    @dragleave="preventDefault"
    @drop="handleDrop"
  >
    <structure-renderer v-if="structure" :structure :options />
  </n-flex>
</template>

<style scoped>
.n-flex {
  position: absolute;
  inset: 0;
}
</style>
