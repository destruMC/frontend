import { defineStore } from 'pinia'

type UserStore = {
  flag: boolean
  user: {
    id: string
    name: string
    avatar: string
  } | null
}

export const useUserStore = defineStore('user', {
  state: (): UserStore => ({
    flag: false,
    user: null,
  }),

  actions: {
    load(user: { id: string; name: string; avatar: string }) {
      this.user = user
      this.flag = true
    },

    set(user: { id: string; name: string; avatar: string }) {
      localStorage.setItem('user', JSON.stringify(user))
      this.load(user)
      this.flag = true
    },

    clear() {
      localStorage.removeItem('user')
      this.user = null
      this.flag = false
    },
  },
})
