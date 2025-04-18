import { defineStore } from 'pinia'

type UserStore = {
  user: {
    id: string
    name: string
    avatar: string
  } | null
  token: string | null
  expired: number | null
}

export const useUserStore = defineStore('user', {
  state: (): UserStore => ({
    user: null,
    token: null,
    expired: null,
  }),

  actions: {
    load(user: { id: string; name: string; avatar: string }, token: string, expired: number) {
      this.user = user
      this.token = token
      this.expired = expired
    },

    set(user: { id: string; name: string; avatar: string }, token: string, expires: number) {
      const expired = Date.now() + expires * 1000
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', token)
      localStorage.setItem('expired', String(expired))
      this.load(user, token, expired)
    },

    clear() {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('expired')
      this.user = null
      this.token = null
      this.expired = null
    },
  },
})
