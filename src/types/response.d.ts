import type {StructurePreview} from "@/types/structure";

interface Response {
  success: boolean;
}

export interface StructuresResponse extends Response {
  structures: StructurePreview[];
  pagination: {
    page: number;
    size: number;
    total: number;
  }
}

export interface StructureResponse extends Response {
  structure: Structure;
}
