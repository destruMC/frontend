<script setup lang="ts">
import UserCard from '@/components/users/UserCard.vue'
import StructureRenderer from '@/components/renderers/StructureRenderer.vue'
import IconDownload from '@/components/icons/xicons/tabler/IconDownload.vue'
import { useIsMobile } from '@/utils/composables.util.ts'
import { computed, h, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { md } from '@/utils/markdown.util.ts'
import {
  loadStructure,
  structure2destru,
  structure2Nbt,
} from '@/utils/deepslate/structures.util.ts'
import { BlockState, ItemStack, NbtFile, type StructureProvider } from 'deepslate'
import ItemRenderer from '@/components/renderers/ItemRenderer.vue'
import { NButton, NFlex, NIcon, NSelect, useDialog, useLoadingBar, useThemeVars } from 'naive-ui'
import { setTitle } from '@/routers/router.ts'
import ReloadableEmpty from '@/components/ReloadableEmpty.vue'
import api from '@/core/api.ts'

const theme = useThemeVars()

const isMobile = useIsMobile()
const s = computed(() => (isMobile.value ? '1rem' : '1.5rem'))
const b = computed(() => (isMobile.value ? '0.5rem' : '1rem'))
const g = computed(() => (isMobile.value ? '1rem' : '2rem'))
const p = computed(() => (isMobile.value ? 16 : 24))

const structureName = ref()
const structureSummary = ref()
const structureDescription = ref()
const structureImages = ref()
const structureAuthor = ref()

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

const loadingBar = useLoadingBar()

const load = async () => {
  try {
    loadingBar.start()
    isLoading.value = true

    const response = await api.getStructure(route.params.id.toString())
    const data = await response.json()
    structureName.value = data.name
    structureSummary.value = data.summary
    structureDescription.value = md.render(data.description)
    structureImages.value = data.images
    structureAuthor.value = data.author

    setTitle(structureName.value, '结构')

    const file = await fetch(data.file)
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

    loadingBar.finish()
  } catch (e) {
    error.value = '加载失败'
    setTitle(error.value, '结构')

    loadingBar.error()
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  load()
})

onBeforeUnmount(() => {
  if (isLoading.value) {
    loadingBar.finish()
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
      new Blob([handler(structureRef.value).write()])
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
  <n-flex vertical :style="`${isMobile ? '' : 'gap: 1rem;'}`">
    <reloadable-empty v-if="!structureRef && !isLoading" :description="error" :onclick="load" />
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
        <!--        <n-flex>-->
        <n-button type="primary" @click="handleDownload">
          <template #icon>
            <n-icon :component="IconDownload" />
          </template>
          下载
        </n-button>
        <!--          <n-button strong secondary circle>-->
        <!--            <template #icon>-->
        <!--              <n-icon :component="IconHeart" />-->
        <!--            </template>-->
        <!--          </n-button>-->
        <!--          <n-button strong secondary circle>-->
        <!--            <template #icon>-->
        <!--              <n-icon :component="IconStar" />-->
        <!--            </template>-->
        <!--          </n-button>-->
        <!--          <n-button quaternary circle>-->
        <!--            <template #icon>-->
        <!--              <n-icon :component="IconDotsVertical" />-->
        <!--            </template>-->
        <!--          </n-button>-->
        <!--        </n-flex>-->
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
                  :pane-wrapper-style="`background-color: ${theme.bodyColor}`"
                >
                  <n-tab-pane name="model" tab="模型">
                    <n-flex class="ar169">
                      <structure-renderer :structure="structureRef" :options="structureOptions" />
                    </n-flex>
                  </n-tab-pane>
                  <n-tab-pane name="images" tab="图片">
                    <n-carousel class="ar169" mousewheel>
                      <n-image
                        lazy
                        v-for="image in structureImages"
                        v-bind:key="image"
                        :src="image"
                        object-fit="cover"
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
                <n-h2> 作者 </n-h2>
              </template>
              <user-card :user="structureAuthor" />
            </n-card>
          </n-flex>
        </n-gi>
      </n-grid>
    </n-flex>
  </n-flex>
</template>

<style scoped>
.n-image {
  width: 100%;
  aspect-ratio: 16/9;
}

.ar169 {
  aspect-ratio: 16/9;
}
</style>
