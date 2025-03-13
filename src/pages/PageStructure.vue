<script setup lang="ts">
import UserCard from '@/components/users/UserCard.vue'
import StructureRenderer from '@/components/renderers/StructureRenderer.vue'
import IconDownload from '@/components/icons/xicons/tabler/IconDownload.vue'
import IconHeart from '@/components/icons/xicons/tabler/IconHeart.vue'
import IconStar from '@/components/icons/xicons/tabler/IconStar.vue'
import IconDotsVertical from '@/components/icons/xicons/tabler/IconDotsVertical.vue'
import { useIsMobile } from '@/utils/composables.util.ts'
import { computed, h, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/core/api.ts'
import { md } from '@/utils/markdown.util.ts'
import {
  loadStructure,
  structure2destru,
  structure2Nbt,
} from '@/utils/deepslate/structures.util.ts'
import { BlockState, ItemStack, NbtFile, type StructureProvider } from 'deepslate'
import ItemRenderer from '@/components/renderers/ItemRenderer.vue'
import { NButton, NFlex, NIcon, NSelect, useDialog } from 'naive-ui'
import Pako from 'pako'
import { loadingBarApi } from '@/routers/router.ts'

const isMobile = useIsMobile()
const s = computed(() => (isMobile.value ? '1rem' : '1.5rem'))
const b = computed(() => (isMobile.value ? '0.5rem' : '1rem'))
const g = computed(() => (isMobile.value ? '1rem' : '2rem'))
const p = computed(() => (isMobile.value ? 16 : 24))

const structureName = ref()
const structureSummary = ref()
const structureDescription = ref()
const structureImages = ref()
const structureCreators = ref()

const structureRef = ref()
const structureOptions = ref({
  grid: false,
  invisibleBlocks: false,
})

const route = useRoute()

const blobs = {
  nbt: ref(),
  destru: ref(),
  sponge: ref(),
  litematic: ref(),
  schematic: ref(),
}

const isLoading = ref(true)
const error = ref()

const load = async () => {
  try {
    isLoading.value = true

    const response = (await api.getStructure(route.params.id.toString())).structure
    structureName.value = response.name
    structureSummary.value = response.summary
    structureDescription.value = md.render(response.description)
    structureImages.value = response.images
    structureCreators.value = response.creators

    const file = await fetch(response.files[response.files.length - 1].url)
    const blob = await file.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const structure = loadStructure(NbtFile.read(new Uint8Array(arrayBuffer)).root)
    blobs.destru.value = blob

    structureRef.value = structure

    const size = structure.getSize()

    paletteData.value = Array.from(
      structure
        .getBlocks()
        .reduce((map, block) => {
          if (!block.state.is(BlockState.AIR)) {
            const id = block.state.getName().toString()
            map.set(id, (map.get(id) || 0) + 1)
          }
          return map
        }, new Map<string, number>())
        .entries(),
    ).map(([item, count]) => ({
      item: h(NFlex, { align: 'center' }, () => [
        h(ItemRenderer, { item: ItemStack.fromString(item), size: 24 }),
        item,
      ]),
      count,
    }))
    infoData.value = [
      {
        item: '长',
        value: size[2],
      },
      {
        item: '宽',
        value: size[0],
      },
      {
        item: '高',
        value: size[1],
      },
      {
        item: '体积',
        value: size.reduce((a: number, b: number) => a * b, 1),
      },
    ]
  } catch (e) {
    error.value = '加载失败'
  } finally {
    isLoading.value = false
    loadingBarApi.value?.finish()
  }
}

onMounted(() => {
  load()
})

onBeforeUnmount(() => {
  if (isLoading.value) {
    loadingBarApi.value?.finish()
  }
})

const tab = ref()

interface Palette {
  id: string
  count: number
}
const paletteColumns = [
  {
    title: '物品',
    key: 'item',
    resizable: true,
  },
  {
    title: '数量',
    key: 'count',
    defaultSortOrder: 'descend',
    sorter: (n1: Palette, n2: Palette) => n1.count - n2.count,
  },
]
const paletteData = ref()
const infoColumns = [
  {
    title: '项',
    key: 'item',
    resizable: true,
  },
  {
    title: '值',
    key: 'value',
  },
]
const infoData = ref()

const dialog = useDialog()

function handleDownload() {
  const type = ref<'nbt' | 'destru' | 'sponge' | 'litematic' | 'schematic'>()

  function download(blob: Blob, type: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${structureName.value}.${type}`
    a.click()
  }

  async function handleDownload() {
    const blob = (handler: (structure: StructureProvider) => NbtFile) =>
      new Blob([Pako.gzip(handler(structureRef.value).write())])
    switch (type.value) {
      case 'nbt': {
        if (!blobs.nbt.value) {
          blobs.nbt.value = blob(structure2Nbt)
        }
        download(blobs.nbt.value, 'nbt')
        break
      }
      case 'destru': {
        if (!blobs.destru.value) {
          blobs.destru.value = blob(structure2destru)
        }
        download(blobs.destru.value, 'destru')
        break
      }
      default: {
        console.log(type.value)
      }
    }
  }

  dialog.create({
    title: `下载 ${structureName.value}`,
    showIcon: false,
    bordered: true,
    content: () =>
      h(
        NFlex,
        {
          vertical: true,
        },
        {
          default: () => [
            h(NSelect, {
              placeholder: '文件类型',
              value: type.value,
              'onUpdate:value': (value) => {
                type.value = value
              },
              renderTag: (props) => `文件类型：${props.option.label}`,
              options: [
                {
                  label: 'NBT (*.nbt)',
                  value: 'nbt',
                },
                {
                  label: 'destru (*.destru)',
                  value: 'destru',
                },
                {
                  label: 'Sponge (*.schem)',
                  value: 'sponge',
                  disabled: true,
                },
                {
                  label: 'Litematic (*.litematic)',
                  value: 'litematic',
                  disabled: true,
                },
                {
                  label: 'Schematic (*.schematic)',
                  value: 'schematic',
                  disabled: true,
                },
              ],
            }),
            h(
              NButton,
              {
                type: 'primary',
                disabled: !type.value,
                onClick: () => handleDownload(),
              },
              {
                default: () => '下载',
              },
            ),
          ],
        },
      ),
  })
}
</script>

<template>
  <n-flex vertical :style="`width: 100%${isMobile ? `;` : `; gap: 1rem;`};`">
    <n-empty v-if="!structureRef && !isLoading" :description="error" />
    <n-flex v-if="structureRef" vertical>
      <n-flex justify="space-between" align="center">
        <n-flex vertical>
          <n-h1>
            {{ structureName }}
          </n-h1>
          <n-text>
            {{ structureSummary }}
          </n-text>
        </n-flex>
        <n-flex>
          <n-button type="primary" @click="handleDownload">
            <template #icon>
              <n-icon :component="IconDownload" />
            </template>
            下载
          </n-button>
          <n-button strong secondary circle>
            <template #icon>
              <n-icon :component="IconHeart" />
            </template>
          </n-button>
          <n-button strong secondary circle>
            <template #icon>
              <n-icon :component="IconStar" />
            </template>
          </n-button>
          <n-button quaternary circle>
            <template #icon>
              <n-icon :component="IconDotsVertical" />
            </template>
          </n-button>
        </n-flex>
      </n-flex>
      <n-grid cols="1 s:10" x-gap="s:32" y-gap="16 s:32" responsive="screen" item-responsive>
        <n-gi span="1 s:6">
          <n-flex vertical :style="`gap: ${g};`">
            <n-card hoverable>
              <template #cover>
                <n-tabs
                  v-model:value="tab"
                  animated
                  placement="bottom"
                  default-value="images"
                  type="line"
                  pane-style="padding: 0;"
                  :tab-style="`padding: ${b} 0;`"
                  :bar-width="0"
                  :tabs-padding="p"
                >
                  <n-tab-pane name="model" tab="模型">
                    <n-flex vertical justify="center" align="center" style="aspect-ratio: 16/9">
                      <structure-renderer :structure="structureRef" :options="structureOptions" />
                    </n-flex>
                  </n-tab-pane>
                  <n-tab-pane name="images" tab="图片">
                    <n-carousel style="aspect-ratio: 16/9" mousewheel>
                      <n-image
                        lazy
                        v-for="image in structureImages"
                        v-bind:key="image"
                        :src="image.url"
                        object-fit="cover"
                        style="width: 100%; aspect-ratio: 16/9"
                      />
                    </n-carousel>
                  </n-tab-pane>
                  <template v-if="tab == `model`" #suffix>
                    <n-flex :style="`padding: 0 ${s}; gap: ${b};`">
                      <n-checkbox v-model:checked="structureOptions.grid"> 边框 </n-checkbox>
                      <n-checkbox v-model:checked="structureOptions.invisibleBlocks" disabled>
                        隐形方块
                      </n-checkbox>
                    </n-flex>
                  </template>
                </n-tabs>
              </template>
            </n-card>
            <n-card
              :header-style="`padding: ${b} ${s};`"
              :content-style="`padding: 0 ${s} ${b};`"
              hoverable
            >
              <template #header>
                <n-h2> 介绍 </n-h2>
              </template>
              <div v-html="structureDescription" />
            </n-card>
          </n-flex>
        </n-gi>
        <n-gi span="1 s:4">
          <n-flex vertical :style="`gap: ${g};`">
            <n-card :content-style="`padding: 0 ${s} ${b};`" hoverable>
              <n-tabs animated type="line" pane-style="padding: 0;" :tab-style="`padding: ${b} 0;`">
                <n-tab-pane name="info">
                  <template #tab>
                    <n-h2> 信息 </n-h2>
                  </template>
                  <n-scrollbar style="max-height: 60vh">
                    <n-data-table :bordered="false" :data="infoData" :columns="infoColumns" />
                  </n-scrollbar>
                </n-tab-pane>
                <n-tab-pane name="palette">
                  <template #tab>
                    <n-h2> 材料 </n-h2>
                  </template>
                  <n-scrollbar style="max-height: 60vh">
                    <n-data-table :bordered="false" :data="paletteData" :columns="paletteColumns" />
                  </n-scrollbar>
                </n-tab-pane>
              </n-tabs>
            </n-card>
            <n-card
              :header-style="`padding: ${b} ${s};`"
              :content-style="`padding: 0 ${s} ${b};`"
              hoverable
            >
              <template #header>
                <n-h2> 创作团队 </n-h2>
              </template>
              <n-list clickable :show-divider="false">
                <n-list-item v-for="creator in structureCreators" v-bind:key="creator">
                  <user-card :user="creator" />
                </n-list-item>
              </n-list>
            </n-card>
          </n-flex>
        </n-gi>
      </n-grid>
    </n-flex>
  </n-flex>
</template>

<style scoped>
.n-empty {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
