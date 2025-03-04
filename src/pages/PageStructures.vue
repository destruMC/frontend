<script setup lang="ts">
import {useIsMobile} from "@/utils/composables.util.ts";
import api from "@/core/api.ts";
import {ref, computed, onMounted} from "vue";

const isMobile = useIsMobile();

const s = computed(() => isMobile.value ? '1rem' : '1.5rem');
const b = computed(() => isMobile.value ? '0.5rem' : '1rem');

const structures = ref();

onMounted(async () => {
  const response = await api.getStructures();
  structures.value = response.structures;
})
</script>

<template>
  <n-flex vertical :style="`width: 100%; gap: ${isMobile ? `0.5rem` : `1rem`};`">
    <n-h1>
      结构列表
    </n-h1>
    <n-grid cols="1 s:2 m:3 l:4" x-gap="s:32" y-gap="16 s:32" responsive="screen">
      <n-gi v-for="structure in structures" :key="structure.id">
        <router-link :to="'/structure/' + structure.id">
          <n-card hoverable size="huge" :header-style="`padding: 0 ${s};`" :content-style="`padding: 0 ${s} ${b};`">
            <template #header>
              <n-h2>
                {{ structure.name }}
              </n-h2>
            </template>
            <template #cover>
              <n-image lazy preview-disabled :src="structure.image" object-fit="cover" style="width: 100%; aspect-ratio: 16/9;" />
            </template>
            <span>
              {{ structure.creator }}
            </span>
          </n-card>
        </router-link>
      </n-gi>
    </n-grid>
  </n-flex>
</template>

<style scoped>
.n-h2 {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
