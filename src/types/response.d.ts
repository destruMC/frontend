import type {StructurePreview} from "@/types/structure";

interface Response {
  success: boolean;
}

export interface StructuresResponse extends Response {
  structures: StructurePreview[];
}

export interface StructureResponse extends Response {
  structure: Structure;
}
