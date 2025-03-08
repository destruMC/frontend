import {type FetchOptions, ofetch} from "ofetch";

const url = import.meta.env.VITE_API_URL

const api = ofetch.create({
  baseURL: url,
})

export default {
  getStructures(options?: FetchOptions) {
    return api('/structures', options);
  },

  getStructure(id: String) {
    return api(`/structure/${id}`);
  },
}
