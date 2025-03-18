import { defineStore } from 'pinia'
import api from '@/core/api.ts'
import type { User } from '@/types/user'

type UserStore = {
  flag: boolean
  user: User | null
}

export const useUserStore = defineStore('user', {
  state: (): UserStore => ({
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
