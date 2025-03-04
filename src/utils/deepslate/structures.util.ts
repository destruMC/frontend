import {
  type PlacedBlock,
  BlockPos,
  BlockState,
  NbtCompound,
  NbtIntArray,
  NbtType,
  Structure,
  type StructureProvider, Identifier
} from "deepslate";
import {fromAlphaMaterial} from "@/utils/deepslate/alpha-materials.util.ts";

type StructureRegion = {
  pos: BlockPos,
  structure: StructureProvider,
  name?: string,
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
    return this.regions.flatMap(r => {
      try {
        return r.structure.getBlocks().map(b => ({
          pos: BlockPos.add(r.pos, b.pos),
          state: b.state,
          ...b.nbt ? { nbt: b.nbt } : {},
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
    return pos[0] >= region.pos[0] && pos[0] < region.pos[0] + size[0]
      && pos[1] >= region.pos[1] && pos[1] < region.pos[1] + size[1]
      && pos[2] >= region.pos[2] && pos[2] < region.pos[2] + size[2]
  }
}

function getTriple(tag: NbtCompound): BlockPos {
  return [tag.getNumber('x'), tag.getNumber('y'), tag.getNumber('z')]
}

export function destruToStructure(root: NbtCompound) {
  const regions: StructureRegion[] = []

  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  const paletteNbt = root.getList('palette', 10);

  root.getList('regions', 10).forEach((region) => {
    const pos = region.getIntArray('pos');
    const size = region.getIntArray('size');

    const [x, y, z] = [pos.get(0), pos.get(1), pos.get(2)].map(n => n ? n.getAsNumber() : 0);
    const [width, height, length] = [size.get(0), size.get(1), size.get(2)].map(n => n ? n.getAsNumber() : 0);

    const bound = [x + width, y + height, z + length];
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], x, bound[i]);
      max[i] = Math.max(max[i], x, bound[i]);
    }

    const palette: BlockState[] = []
    const paletteMap = new Map<string, number>();
    const addPalette = (state: BlockState): number => {
      const key = state.toString()
      const existing = paletteMap.get(key);
      if (existing !== undefined) return existing;
      const index = palette.length;
      palette.push(state);
      paletteMap.set(key, index);
      return index;
    };

    const blocks: { pos: BlockPos; state: number; nbt?: NbtCompound; }[] = []
    const yLayerSize = width * length;
    const getPos = (index: number): [number, number, number] => {
      const y = Math.floor(index / yLayerSize);
      const layerIndex = index % yLayerSize;
      const z = Math.floor(layerIndex / width);
      const x = layerIndex % width;
      return [ x, y, z ]
    }

    region.getLongArray('blocks').forEach((state, index) => {
      const blockNbt = paletteNbt.get(state.getAsNumber())
      if (blockNbt == undefined) return
      blocks.push({
        pos: getPos(index),
        state: addPalette(new BlockState(Identifier.parse(blockNbt.getString('id')), blockNbt.getCompound('properties').map((key, value) => [key, value.getAsString()]))),
        nbt: blockNbt.hasCompound('data') ? blockNbt.getCompound('data') : undefined,
      });
    })

    regions.push({
      pos: [x, y, z],
      structure: new Structure([width, height, length], palette, blocks),
    })
  })

  return new MultiStructure(min.map((min, i) => max[i] - min) as [number, number, number], regions)
}

export function spongeToStructure(root: NbtCompound) {
  const width = root.getNumber('Width')
  const height = root.getNumber('Height')
  const length = root.getNumber('Length')

  const schemPalette = root.getCompound('Palette')
  const palette: BlockState[] = []
  for (const key of schemPalette.keys()) {
    const id = schemPalette.getNumber(key)
    palette[id] = BlockState.parse(key)
  }

  const blockData = root.getByteArray('BlockData').map(e => e.getAsNumber())
  const blockEntities = new Map<string, NbtCompound>()
  root.getList('BlockEntities', NbtType.Compound).forEach((tag) => {
    const pos = tag.getIntArray('Pos').toString()
    const copy = NbtCompound.fromJson(tag.toJson())
    copy.delete('Pos')
    blockEntities.set(pos, copy)
  })
  const blocks: { pos: BlockPos, state: number, nbt?: NbtCompound }[] = []
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

export function litematicToStructure(root: NbtCompound) {
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
    const statesData = blockStates.map(long => {
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
    const blocks: { pos: BlockPos, state: number, nbt?: NbtCompound }[] = []
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
          const index = (y * size[0] * size[2]) + z * size[0] + x
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

  const minPos: BlockPos = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
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

export function schematicToStructure(root: NbtCompound) {
  const width = root.getNumber('Width')
  const height = root.getNumber('Height')
  const length = root.getNumber('Length')

  const blocksArray = root.getByteArray('Blocks').map(e => e.getAsNumber())
  const dataArray = root.getByteArray('Data').map(e => e.getAsNumber())

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
        const i = (y * width * length) + z * width + x
        const blockStata = fromAlphaMaterial(blocksArray[i], dataArray[i])
        const nbt = blockEntities.get([x, y, z].toString())
        structure.addBlock([x, y, z], blockStata.getName(), blockStata.getProperties(), nbt)
      }
    }
  }

  return structure
}

export function loadStructure(root: NbtCompound) {
  if (root.hasList('palette', 10) && root.hasList('regions', 10)) {
    return destruToStructure(root)
  }
  if (root.get('BlockData')?.isByteArray() && root.hasCompound('Palette')) {
    return spongeToStructure(root)
  }
  if (root.hasCompound('Regions')) {
    return litematicToStructure(root)
  }
  if (root.get('Blocks')?.isByteArray() && root.get('Data')?.isByteArray()) {
    return schematicToStructure(root)
  }
  return Structure.fromNbt(root)
}
