<script setup lang="ts">
import { useIsMobile } from '@/utils/composables.util.ts'
import structure_api from '@/core/api/structure.ts'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/routers/router.ts'
import { useThemeVars } from 'naive-ui'
import ReloadableEmpty from '@/components/ReloadableEmpty.vue'

const theme = useThemeVars()

const isMobile = useIsMobile()
const route = useRoute()

const s = computed(() => (isMobile.value ? '1rem' : '1.5rem'))
const b = computed(() => (isMobile.value ? '0.5rem' : '1rem'))

const structures = ref<
  {
    id: string
    name: string
    cover: string
    owner: string
  }[]
>()
const pagination = ref({
  page: 1,
  size: 16,
  total: 1,
})

const isLoading = ref(true)
const error = ref()

const loadStructures = async () => {
  try {
    isLoading.value = true

    const pagesResponse = await structure_api.pages()
    const pagesData = await pagesResponse.json()
    const total = pagesData.total

    let page = Math.max(1, Number(route.query.page) || 1)
    if (page > total) {
      page = total
      await router.replace({
        query: {
          ...route.query,
          page: page === 1 ? undefined : page,
        },
      })
    }

    const pageResponse = await structure_api.page(page)
    structures.value = await pageResponse.json()

    pagination.value = {
      ...pagination.value,
      page,
      total,
    }
  } catch (e) {
    error.value = '加载失败'
  } finally {
    isLoading.value = false
  }
}

const handlePageChange = (page: number) => {
  router.push({
    query: {
      ...route.query,
      page: page === 1 ? undefined : page,
    },
  })
}

watch(
  () => route.query.page,
  () => {
    loadStructures()
  },
)

onMounted(() => {
  loadStructures()
})
</script>

<template>
  <n-flex vertical :style="`width: 100%; gap: ${isMobile ? `0.5rem` : `1rem`};`">
    <n-h1> 结构列表 </n-h1>
    <n-spin class="full" :show="isLoading" content-style="height: 100%;">
      <reloadable-empty
        v-if="!structures && !isLoading"
        :description="error"
        :onclick="loadStructures"
      />
      <n-grid
        v-if="structures"
        cols="1 s:2 m:3 l:4"
        x-gap="s:32"
        y-gap="16 s:32"
        responsive="screen"
      >
        <n-gi v-for="structure in structures" :key="structure.id">
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
                  :src="structure.cover"
                  object-fit="cover"
                  :style="`width: 100%; aspect-ratio: 16/9; background-color: ${theme.bodyColor};`"
                />
              </template>
              <span>
                {{ structure.owner }}
              </span>
            </n-card>
          </router-link>
        </n-gi>
      </n-grid>
    </n-spin>
    <n-pagination
      :page-count="pagination.total"
      style="margin-left: auto"
      @update-page="handlePageChange"
    />
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
