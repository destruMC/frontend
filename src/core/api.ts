import {ofetch} from "ofetch";
import type {StructuresResponse, StructureResponse} from "@/types/response";

const api = ofetch.create({
  baseURL: "http://127.0.0.1:8080",
})

export default {
  getStructures(): Promise<StructuresResponse> {
    return api('/structures');
  },

  getStructure(id: String): Promise<StructureResponse> {
    return api(`/structure/${id}`);
  },
}
