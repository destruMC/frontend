import { defineStore } from 'pinia'

type UserStore = {
  user: {
    id: string
    name: string
    avatar: string
  } | null
  token: string | null
  expires: number | null
}

export const useUserStore = defineStore('user', {
  state: (): UserStore => ({
    user: null,
    token: null,
    expires: null,
  }),

  actions: {
    load(user: { id: string; name: string; avatar: string }, token: string, expires: number) {
      this.user = user
      this.token = token
      this.expires = expires
    },

    set(user: { id: string; name: string; avatar: string }, token: string, expires: number) {
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', token)
      localStorage.setItem('expires', String(expires))
      this.load(user, token, expires)
    },

    clear() {
      console.log(1)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('expires')
      this.user = null
      this.token = null
      this.expires = null
    },
  },
})
