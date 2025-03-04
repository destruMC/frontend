import { defineStore } from 'pinia';
import {loadResources} from "@/core/structure/loader.ts";
import type {ResourceManager} from "@/core/structure/resource-manager.ts";

type ResourceState = {
  resources: ResourceManager | null;
  isLoading: boolean;
  error: Error | null;
}

export const useResourceStore = defineStore('resource', {
  state: (): ResourceState => ({
    resources: null,
    isLoading: false,
    error: null
  }),

  actions: {
    async load() {
      if (this.resources || this.isLoading) return;

      this.isLoading = true;
      try {
        this.resources = await loadResources();
      } catch (err) {
        this.error = err instanceof Error ? err : new Error('Failed to load resources');
      } finally {
        this.isLoading = false;
      }
    }
  },

  getters: {
    isReady: (state) => !!state.resources && !state.isLoading && !state.error
  }
});
