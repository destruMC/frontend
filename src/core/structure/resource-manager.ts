import {
  BlockDefinition,
  BlockModel,
  Identifier,
  ItemModel,
  type ItemRendererResources,
  jsonToNbt,
  NbtTag,
  type Resources,
  TextureAtlas,
  upperPowerOfTwo,
  type UV,
} from 'deepslate'
import {
  NON_SELF_CULLING,
  OPAQUE_BLOCKS,
  TRANSLUCENT_BLOCKS,
} from '@/utils/deepslate/block-flags.util.ts'

export class ResourceManager implements Resources, ItemRendererResources {
  private readonly blocks: Map<
    string,
    { properties: Record<string, string[]> | null; default: Record<string, string> | null }
  >
  private readonly blockDefinitions: { [id: string]: BlockDefinition }
  private readonly blockModels: { [id: string]: BlockModel }
  private readonly itemModels: { [id: string]: ItemModel }
  private readonly itemComponents: { [id: string]: Map<string, NbtTag> }
  private textureAtlas: TextureAtlas

  constructor(
    blocks: Map<string, Map<number, unknown>>,
    blockDefinitions: Map<string, Map<string, unknown>>,
    blockModels: Map<string, unknown>,
    itemModels: Map<string, Map<string, { model: unknown }>>,
    itemComponents: Map<string, Map<string, unknown>>,
    textures: Map<string, [number, number, number, number]>,
    atlas: HTMLImageElement,
  ) {
    this.blocks = new Map()
    this.blockDefinitions = {}
    this.blockModels = {}
    this.itemModels = {}
    this.itemComponents = {}
    this.textureAtlas = TextureAtlas.empty()
    this.loadBlocks(blocks)
    this.loadBlockDefinitions(blockDefinitions)
    this.loadBlockModels(blockModels)
    this.loadBlockAtlas(atlas, textures)
    this.loadItemModels(itemModels)
    this.loadItemComponents(itemComponents)
  }

  public getBlockDefinition(id: Identifier) {
    return this.blockDefinitions[id.toString()]
  }

  public getBlockModel(id: Identifier) {
    return this.blockModels[id.toString()]
  }

  public getTextureUV(id: Identifier) {
    return this.textureAtlas.getTextureUV(id)
  }

  public getTextureAtlas() {
    return this.textureAtlas.getTextureAtlas()
  }

  public getBlockFlags(id: Identifier) {
    const str = id.toString()
    return {
      opaque: OPAQUE_BLOCKS.has(str),
      semi_transparent: TRANSLUCENT_BLOCKS.has(str),
      self_culling: !NON_SELF_CULLING.has(str),
    }
  }

  public getBlockProperties(id: Identifier) {
    return this.blocks.get(id.toString())?.properties ?? null
  }

  public getDefaultBlockProperties(id: Identifier) {
    return this.blocks.get(id.toString())?.default ?? null
  }

  public getItemModel(id: Identifier) {
    return this.itemModels[id.toString()]
  }

  public getItemComponents(id: Identifier) {
    return this.itemComponents[id.toString()]
  }

  public loadBlocks(blocks: Map<string, Map<number, unknown>>) {
    Object.entries(blocks).forEach(([id, value]) => {
      this.blocks.set(Identifier.create(id).toString(), { properties: value[0], default: value[1] })
    })
  }

  public loadBlockDefinitions(definitions: Map<string, unknown>) {
    Object.entries(definitions).forEach(([id, definition]) => {
      this.blockDefinitions[Identifier.create(id).toString()] = BlockDefinition.fromJson(definition)
    })
  }

  public loadBlockModels(models: Map<string, unknown>) {
    Object.entries(models).forEach(([id, model]) => {
      this.blockModels[Identifier.create(id).toString()] = BlockModel.fromJson(model)
    })
    Object.values(this.blockModels).forEach((m) => m.flatten(this))
  }

  public loadBlockAtlas(
    atlas: HTMLImageElement,
    textures: Map<string, [number, number, number, number]>,
  ) {
    const atlasCanvas = document.createElement('canvas')
    const atlasSize = upperPowerOfTwo(Math.max(atlas.width, atlas.height))
    atlasCanvas.width = atlasSize
    atlasCanvas.height = atlasSize
    const atlasCtx = atlasCanvas.getContext('2d')!
    atlasCtx.drawImage(atlas, 0, 0)
    const atlasData = atlasCtx.getImageData(0, 0, atlasSize, atlasSize)
    const idMap: Record<string, UV> = {}
    Object.entries(textures).forEach(([id, [u, v, du, dv]]) => {
      const dv2 = du !== dv && id.startsWith('block/') ? du : dv
      idMap[Identifier.create(id).toString()] = [
        u / atlasSize,
        v / atlasSize,
        (u + du) / atlasSize,
        (v + dv2) / atlasSize,
      ]
    })
    this.textureAtlas = new TextureAtlas(atlasData, idMap)
  }

  public loadItemModels(models: Map<string, Map<string, { model: unknown }>>) {
    Object.entries(models).forEach(([id, model]) => {
      this.itemModels[Identifier.create(id).toString()] = ItemModel.fromJson(model.model)
    })
  }

  public loadItemComponents(itemComponents: Map<string, Map<string, unknown>>) {
    Object.entries(itemComponents).forEach(([id, component]) => {
      const components = new Map<string, NbtTag>()
      Object.entries(component).forEach(([key, value]) => {
        components.set(key, jsonToNbt(value))
      })
      this.itemComponents[Identifier.create(id).toString()] = components
    })
  }
}
