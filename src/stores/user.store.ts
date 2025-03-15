import { defineStore } from 'pinia'
import api from '@/core/api.ts'

export const useUserStore = defineStore('user', {
  state: () => ({
    flag: false,
    user: null,
  }),

  actions: {
    async set(id?: string) {
      if (id) {
        this.flag = true
        const { user } = await api.getUser(id)
        this.user = user
      } else {
        this.flag = false
        this.user = null
      }
    },
  },
})
