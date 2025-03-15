import { ResourceManager } from '@/core/structure/resource-manager.ts'
import pako from 'pako'

const MCMETA = 'https://raw.gitmirror.com/misode/mcmeta/'

const fetchData = (url: string) =>
  fetch(url)
    .then((r) => r.arrayBuffer())
    .then((buffer) => JSON.parse(pako.ungzip(new Uint8Array(buffer), { to: 'string' })))

export const loadResources = async (): Promise<ResourceManager> => {
  const [blocks, blockDefinitions, blockModels, itemModels, itemComponents, textures, atlas] =
    await Promise.all([
      fetchData(`${MCMETA}summary/blocks/data.json.gz`),
      fetchData(`${MCMETA}summary/assets/block_definition/data.json.gz`),
      fetchData(`${MCMETA}summary/assets/model/data.json.gz`),
      fetchData(`${MCMETA}summary/assets/item_definition/data.json.gz`),
      fetchData(`${MCMETA}summary/item_components/data.json.gz`),
      fetchData(`${MCMETA}atlas/all/data.json.gz`),
      new Promise<HTMLImageElement>((res) => {
        const image = new Image()
        image.onload = () => res(image)
        image.crossOrigin = 'Anonymous'
        image.src = `${MCMETA}atlas/all/atlas.png`
      }),
    ])

  return new ResourceManager(
    blocks,
    blockDefinitions,
    blockModels,
    itemModels,
    itemComponents,
    textures,
    atlas,
  )
}
