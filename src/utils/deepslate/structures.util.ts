import {
  BlockPos,
  BlockState,
  Identifier,
  NbtCompound,
  NbtFile,
  NbtInt,
  NbtIntArray,
  NbtList,
  NbtString,
  NbtType,
  type PlacedBlock,
  Structure,
  type StructureProvider,
} from 'deepslate'
import { fromAlphaMaterial } from '@/utils/deepslate/alpha-materials.util.ts'

type StructureRegion = {
  pos: BlockPos
  structure: StructureProvider
  name?: string
}

export class MultiStructure implements StructureProvider {
  constructor(
    private readonly size: BlockPos,
    private readonly regions: StructureRegion[],
  ) {}

  getSize(): BlockPos {
    return this.size
  }

  getBlock(pos: BlockPos): PlacedBlock | null {
    for (const region of this.regions) {
      if (MultiStructure.posInRegion(pos, region)) {
        const block = region.structure.getBlock(BlockPos.subtract(pos, region.pos))
        if (block !== null) {
          return block
        }
      }
    }
    return null
  }

  getBlocks(): PlacedBlock[] {
    return this.regions.flatMap((r) => {
      try {
        return r.structure.getBlocks().map((b) => ({
          pos: BlockPos.add(r.pos, b.pos),
          state: b.state,
          ...(b.nbt ? { nbt: b.nbt } : {}),
        }))
      } catch (e) {
        if (e instanceof Error) {
          console.log((r.structure as Structure)['blocks'])
          e.message = e.message.replace(' in structure ', ` in structure region "${r.name}" `)
        }
        throw e
      }
    })
  }

  private static posInRegion(pos: BlockPos, region: StructureRegion) {
    const size = region.structure.getSize()
    return (
      pos[0] >= region.pos[0] &&
      pos[0] < region.pos[0] + size[0] &&
      pos[1] >= region.pos[1] &&
      pos[1] < region.pos[1] + size[1] &&
      pos[2] >= region.pos[2] &&
      pos[2] < region.pos[2] + size[2]
    )
  }
}

function getTriple(tag: NbtCompound): BlockPos {
  return [tag.getNumber('x'), tag.getNumber('y'), tag.getNumber('z')]
}

function createFlat123(width: number, length: number) {
  const yLayerSize = width * length
  return (index: number): [number, number, number] => {
    const y = Math.floor(index / yLayerSize)
    const layerIndex = index % yLayerSize
    const z = Math.floor(layerIndex / width)
    const x = layerIndex % width
    return [x, y, z]
  }
}

function createPaletteManager<S>(length: () => number, consume: (source: S) => void) {
  const palette = new Map<string, number>()
  return (source: S, gen: (source: S) => string) => {
    const key = gen(source)
    const existing = palette.get(key)
    if (existing !== undefined) return existing
    const index = length()
    consume(source)
    palette.set(key, index)
    return index
  }
}

export function loadStructure(root: NbtCompound) {
  if (root.hasList('palette', 10) && root.hasList('regions', 10)) {
    return destru2Structure(root)
  }
  if (root.get('BlockData')?.isByteArray() && root.hasCompound('Palette')) {
    return sponge2Structure(root)
  }
  if (root.hasCompound('Regions')) {
    return litematic2Structure(root)
  }
  if (root.get('Blocks')?.isByteArray() && root.get('Data')?.isByteArray()) {
    return schematic2Structure(root)
  }
  return Structure.fromNbt(root)
}

export function destru2Structure(root: NbtCompound) {
  const regions: StructureRegion[] = []

  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]

  const paletteNbt = root.getList('palette', 10)

  root.getList('regions', 10).forEach((region) => {
    const pos = region.getIntArray('pos')
    const size = region.getIntArray('size')

    const [x, y, z] = [pos.get(0), pos.get(1), pos.get(2)].map((n) => (n ? n.getAsNumber() : 0))
    const [width, height, length] = [size.get(0), size.get(1), size.get(2)].map((n) =>
      n ? n.getAsNumber() : 0,
    )

    const bound = [x + width, y + height, z + length]
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], x, bound[i])
      max[i] = Math.max(max[i], x, bound[i])
    }

    const palette: BlockState[] = []
    const paletteAdd = createPaletteManager<BlockState>(
      () => palette.length,
      (block) => palette.push(block),
    )

    const blocks: { pos: BlockPos; state: number; nbt?: NbtCompound }[] = []
    const flat123 = createFlat123(width, length)

    region.getIntArray('blocks').forEach((state, index) => {
      const blockNbt = paletteNbt.get(state.getAsNumber())
      if (blockNbt == undefined) return
      blocks.push({
        pos: flat123(index),
        state: paletteAdd(
          new BlockState(
            Identifier.parse(blockNbt.getString('id')),
            blockNbt.getCompound('properties').map((key, value) => [key, value.getAsString()]),
          ),
          (block) => block.toString(),
        ),
        nbt: blockNbt.hasCompound('data') ? blockNbt.getCompound('data') : undefined,
      })
    })

    regions.push({
      pos: [x, y, z],
      structure: new Structure([width, height, length], palette, blocks),
      name: region.hasString('name') ? region.getString('name') : undefined,
    })
  })

  return new MultiStructure(min.map((min, i) => max[i] - min) as [number, number, number], regions)
}

export function sponge2Structure(root: NbtCompound) {
  const width = root.getNumber('Width')
  const height = root.getNumber('Height')
  const length = root.getNumber('Length')

  const schemPalette = root.getCompound('Palette')
  const palette: BlockState[] = []
  for (const key of schemPalette.keys()) {
    const id = schemPalette.getNumber(key)
    palette[id] = BlockState.parse(key)
  }

  const blockData = root.getByteArray('BlockData').map((e) => e.getAsNumber())
  const blockEntities = new Map<string, NbtCompound>()
  root.getList('BlockEntities', NbtType.Compound).forEach((tag) => {
    const pos = tag.getIntArray('Pos').toString()
    const copy = NbtCompound.fromJson(tag.toJson())
    copy.delete('Pos')
    blockEntities.set(pos, copy)
  })
  const blocks: { pos: BlockPos; state: number; nbt?: NbtCompound }[] = []
  let i = 0
  for (let y = 0; y < height; y += 1) {
    for (let z = 0; z < length; z += 1) {
      for (let x = 0; x < width; x += 1) {
        let id = blockData[i] ?? 0
        i += 1
        if (id > 127) {
          id += ((blockData[i] ?? 0) - 1) << 7
          i += 1
        }
        const pos = new NbtIntArray([x, y, z]).toString()
        blocks.push({
          pos: [x, y, z],
          state: id,
          nbt: blockEntities.get(pos),
        })
      }
    }
  }

  return new Structure([width, height, length], palette, blocks)
}

export function litematic2Structure(root: NbtCompound) {
  const enclosingSize = root.getCompound('Metadata').getCompound('EnclosingSize')
  const [width, height, length] = getTriple(enclosingSize)

  const regions: StructureRegion[] = []
  root.getCompound('Regions').forEach((name, region) => {
    if (!region.isCompound()) return
    const pos = getTriple(region.getCompound('Position'))
    const size = getTriple(region.getCompound('Size'))
    for (let i = 0; i < 3; i += 1) {
      if (size[i] < 0) {
        pos[i] += size[i]
        size[i] = -size[i]
      }
    }
    const volume = size[0] * size[1] * size[2]
    const stretches = true

    const palette = region.getList('BlockStatePalette', NbtType.Compound).map(BlockState.fromNbt)
    const blockStates = region.getLongArray('BlockStates')
    const tempDataview = new DataView(new Uint8Array(8).buffer)
    const statesData = blockStates.map((long) => {
      tempDataview.setInt32(0, Number(long.getAsPair()[0]))
      tempDataview.setInt32(4, Number(long.getAsPair()[1]))
      return tempDataview.getBigUint64(0)
    })

    // litematica use at least 2 bits for palette indices (https://github.com/misode/vscode-nbt/issues/76)
    const bits = Math.max(2, Math.ceil(Math.log2(palette.length)))
    const bigBits = BigInt(bits)
    const big0 = BigInt(0)
    const big64 = BigInt(64)
    const bitMask = BigInt(Math.pow(2, bits) - 1)
    let state = 0
    let data = statesData[state]
    let dataLength = big64

    const arr: number[] = []
    for (let j = 0; j < volume; j += 1) {
      if (dataLength < bits) {
        state += 1
        let newData = statesData[state]
        if (newData === undefined) {
          console.error(`Out of bounds states access ${state}`)
          newData = big0
        }
        if (stretches) {
          data = (newData << dataLength) | data
          dataLength += big64
        } else {
          data = newData
          dataLength = big64
        }
      }

      let paletteId = Number(data & bitMask)
      if (paletteId > palette.length - 1) {
        console.error(`Invalid palette ID ${paletteId}`)
        paletteId = 0
      }
      arr.push(paletteId)
      data >>= bigBits
      dataLength -= bigBits
    }
    const blocks: { pos: BlockPos; state: number; nbt?: NbtCompound }[] = []
    const blockEntities = new Map<string, NbtCompound>()
    region.getList('TileEntities', NbtType.Compound).forEach((tag) => {
      const pos = getTriple(tag).toString()
      const copy = NbtCompound.fromJson(tag.toJson())
      copy.delete('x')
      copy.delete('y')
      copy.delete('z')
      blockEntities.set(pos, copy)
    })
    for (let x = 0; x < size[0]; x += 1) {
      for (let y = 0; y < size[1]; y += 1) {
        for (let z = 0; z < size[2]; z += 1) {
          const index = y * size[0] * size[2] + z * size[0] + x
          const pos = [x, y, z].toString()
          blocks.push({
            pos: [x, y, z],
            state: arr[index],
            nbt: blockEntities.get(pos),
          })
        }
      }
    }
    const structure = new Structure(size, palette, blocks)
    regions.push({ pos, structure, name })
  })

  const minPos: BlockPos = [
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
  ]
  for (const region of regions) {
    for (let i = 0; i < 3; i += 1) {
      minPos[i] = Math.min(minPos[i], region.pos[i])
    }
  }
  for (const region of regions) {
    for (let i = 0; i < 3; i += 1) {
      region.pos[i] -= minPos[i]
    }
  }

  return new MultiStructure([width, height, length], regions)
}

export function schematic2Structure(root: NbtCompound) {
  const width = root.getNumber('Width')
  const height = root.getNumber('Height')
  const length = root.getNumber('Length')

  const blocksArray = root.getByteArray('Blocks').map((e) => e.getAsNumber())
  const dataArray = root.getByteArray('Data').map((e) => e.getAsNumber())

  const blockEntities = new Map<string, NbtCompound>()
  root.getList('TileEntities', NbtType.Compound).forEach((tag) => {
    const pos = getTriple(tag).toString()
    const copy = NbtCompound.fromJson(tag.toJson())
    copy.delete('x')
    copy.delete('y')
    copy.delete('z')
    blockEntities.set(pos, copy)
  })

  const structure = new Structure([width, height, length])
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      for (let z = 0; z < length; z += 1) {
        const i = y * width * length + z * width + x
        const blockStata = fromAlphaMaterial(blocksArray[i], dataArray[i])
        const nbt = blockEntities.get([x, y, z].toString())
        structure.addBlock([x, y, z], blockStata.getName(), blockStata.getProperties(), nbt)
      }
    }
  }

  return structure
}

function toNbt(properties: { [key: string]: string }) {
  return Object.entries(properties).reduce(
    (c, [k, v]) => c.set(k, new NbtString(v)),
    NbtCompound.create(),
  )
}

export function structure2Nbt(structure: StructureProvider) {
  const nbt = NbtFile.create({ compression: 'gzip' })
  const root = nbt.root

  const size = BlockPos.toNbt(structure.getSize())
  root.set('size', size)

  const palette = NbtList.create()
  const blocks = NbtList.create()

  const blockNbt = (block: BlockState) => {
    const compound = NbtCompound.create()

    const name = new NbtString(block.getName().toString())
    compound.set('Name', name)

    const properties = toNbt(block.getProperties())
    if (properties.size !== 0) compound.set('Properties', properties)

    return compound
  }

  const paletteAdd = createPaletteManager<BlockState>(
    () => palette.length,
    (block) => palette.add(blockNbt(block)),
  )

  structure.getBlocks().forEach((block) => {
    const compound = NbtCompound.create()

    const pos = BlockPos.toNbt(block.pos)
    compound.set('pos', pos)

    const state = new NbtInt(paletteAdd(block.state, (block) => block.toString()))
    compound.set('state', state)

    const nbt = block.nbt
    if (nbt) compound.set('nbt', nbt)

    blocks.add(compound)
  })

  root.set('palette', palette)
  root.set('blocks', blocks)

  return nbt
}

export function structure2destru(structure: StructureProvider) {
  const nbt = NbtFile.create({ compression: 'gzip' })
  const root = nbt.root

  const palette = NbtList.create()
  const regions = NbtList.create()

  const paletteAdd = createPaletteManager<{ state: BlockState; nbt?: NbtCompound }>(
    () => palette.length,
    (block) => {
      const compound = NbtCompound.create()

      compound.set('id', new NbtString(block.state.getName().toString()))

      const properties = toNbt(block.state.getProperties())
      if (properties.size !== 0) compound.set('properties', properties)

      if (block.nbt) compound.set('data', block.nbt)

      palette.add(compound)
    },
  )

  const sr: StructureRegion[] = []

  if (structure instanceof MultiStructure) sr.push(...structure['regions'])
  else sr.push({ pos: [0, 0, 0], structure })

  sr.forEach((region) => {
    const compound = NbtCompound.create()

    compound.set('pos', new NbtIntArray(region.pos))

    const size = region.structure.getSize()
    compound.set('size', new NbtIntArray(size))

    const blocks = NbtIntArray.create()
    const flat123 = createFlat123(size[0], size[2])

    for (let i = 0; i < region.structure.getBlocks().length; i++) {
      const block = region.structure.getBlock(flat123(i))
      if (!block) continue
      blocks.add(
        new NbtInt(
          paletteAdd(
            { state: block.state, nbt: block.nbt },
            (block) => block.state.toString() + (block.nbt?.toString() ?? ''),
          ),
        ),
      )
    }

    compound.set('blocks', blocks)

    regions.add(compound)
  })

  root.set('palette', palette)
  root.set('regions', regions)

  return nbt
}
