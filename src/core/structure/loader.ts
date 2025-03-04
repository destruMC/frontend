import { ResourceManager } from '@/core/structure/resource-manager.ts'

const MCMETA = 'https://raw.githubusercontent.com/misode/mcmeta/'

export const loadResources = async (): Promise<ResourceManager> => {
  const [blocks, block_models, item_models, item_components, textures, atlas] = await Promise.all([
    fetch(`${MCMETA}summary/assets/block_definition/data.min.json`).then(r => r.json()),
    fetch(`${MCMETA}summary/assets/model/data.min.json`).then(r => r.json()),
    fetch(`${MCMETA}summary/assets/item_definition/data.min.json`).then(r => r.json()),
    fetch(`${MCMETA}summary/item_components/data.min.json`).then(r => r.json()),
    fetch(`${MCMETA}atlas/all/data.min.json`).then(r => r.json()),
    new Promise<HTMLImageElement>((res) => {
      const image = new Image()
      image.onload = () => res(image)
      image.crossOrigin = 'Anonymous'
      image.src = `${MCMETA}atlas/all/atlas.png`
    }),
  ])

  return new ResourceManager(blocks, block_models, item_models, item_components, textures, atlas)
}
