import {ofetch} from "ofetch";
import type {StructuresResponse, StructureResponse} from "@/types/response";

const url = import.meta.env.VITE_API_URL

const api = ofetch.create({
  baseURL: url,
})

export default {
  getStructures(): Promise<StructuresResponse> {
    return api('/structures');
  },

  getStructure(id: String): Promise<StructureResponse> {
    return api(`/structure/${id}`);
  },
}
