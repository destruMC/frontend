import {
  BlockDefinition,
  BlockModel,
  Identifier,
  ItemModel,
  type ItemRendererResources,
  jsonToNbt,
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
import type {NbtTag} from "deepslate/lib/nbt";

export class ResourceManager implements Resources, ItemRendererResources {
  private readonly blocks: Map<
    string,
    { default: Record<string, string>; properties: Record<string, string[]> }
  >
  private readonly blockDefinitions: { [id: string]: BlockDefinition }
  private readonly blockModels: { [id: string]: BlockModel }
  private readonly itemModels: { [id: string]: ItemModel }
  private readonly itemComponents: { [id: string]: Map<string, NbtTag> }
  private textureAtlas: TextureAtlas

  constructor(
    blocks: Map<string, unknown>,
    blockModels: Map<string, unknown>,
    itemModels: Map<string, unknown>,
    itemComponents: Map<string, unknown>,
    textures: any,
    atlas: HTMLImageElement,
  ) {
    this.blocks = new Map(
      Object.entries(blocks).map(([k, v]: [string, any]) => [
        Identifier.create(k).toString(),
        { properties: v[0], default: v[1] },
      ]),
    )
    this.blockDefinitions = {}
    this.blockModels = {}
    this.itemModels = {}
    this.itemComponents = {}
    this.textureAtlas = TextureAtlas.empty()
    this.loadBlockDefinitions(blocks)
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

  public loadBlockDefinitions(definitions: Map<string, unknown>) {
    Object.keys(definitions).forEach((id) => {
      this.blockDefinitions[Identifier.create(id).toString()] = BlockDefinition.fromJson(
        definitions[id],
      )
    })
  }

  public loadBlockModels(models: Map<string, unknown>) {
    Object.keys(models).forEach((id) => {
      this.blockModels[Identifier.create(id).toString()] = BlockModel.fromJson(models[id])
    })
    Object.values(this.blockModels).forEach((m) => m.flatten(this))
  }

  public loadBlockAtlas(atlas: HTMLImageElement, textures: any) {
    const atlasCanvas = document.createElement('canvas')
    const w = upperPowerOfTwo(atlas.width)
    const h = upperPowerOfTwo(atlas.height)
    atlasCanvas.width = w
    atlasCanvas.height = h
    const atlasCtx = atlasCanvas.getContext('2d')!
    atlasCtx.drawImage(atlas, 0, 0)
    const atlasData = atlasCtx.getImageData(0, 0, w, h)
    const idMap: Record<string, UV> = {}
    Object.keys(textures).forEach((id) => {
      const [u, v, du, dv] = textures[id]
      const dv2 = du !== dv && id.startsWith('block/') ? du : dv
      idMap[Identifier.create(id).toString()] = [u / w, v / h, (u + du) / w, (v + dv2) / h]
    })
    this.textureAtlas = new TextureAtlas(atlasData, idMap)
  }

  public loadItemModels(models: Map<string, unknown>) {
    Object.keys(models).forEach((id) => {
      this.itemModels[Identifier.create(id).toString()] = ItemModel.fromJson(models[id].model)
    })
  }

  public loadItemComponents(itemComponents: Map<string, unknown>) {
    Object.keys(itemComponents).forEach(id => {
      const components = new Map<string, NbtTag>()
      Object.keys(itemComponents[id]).forEach(c_id => {
        components.set(c_id, jsonToNbt(itemComponents[id][c_id]))
      })
      this.itemComponents[Identifier.create(id).toString()] = components
    })
  }
}
