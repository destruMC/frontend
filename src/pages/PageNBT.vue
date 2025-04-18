<script setup lang="ts">
import { NbtCompound, NbtFile, StringReader } from 'deepslate'
import { ref } from 'vue'

const snbt = ref()

function handleDownload() {
  const root = NbtCompound.fromString(new StringReader(snbt.value))
  if (root instanceof NbtCompound) {
    const blob = new Blob([new NbtFile('', root, 'gzip', false, undefined).write()])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'test.destru'
    a.click()
  }
}
</script>

<template>
  <n-flex vertical>
    <n-tabs default-value="snbt">
      <n-tab-pane name="snbt" tab="SNBT">
        <n-input type="textarea" v-model:value="snbt" />
      </n-tab-pane>
    </n-tabs>
    <n-button @click="handleDownload"> 下载 </n-button>
  </n-flex>
</template>
