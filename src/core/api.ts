import { ofetch } from 'ofetch'

const url = import.meta.env.VITE_API_URL

const api = ofetch.create({
  baseURL: url,
})

export default {
  getStructures(page?: number, size?: number) {
    return api('/structures', {
      credentials: 'include',
      params: { page, size },
    })
  },

  getStructure(id: string) {
    return api(`/structure/${id}`, {
      credentials: 'include',
    })
  },

  register(name: string, password: string) {
    return api('/register', {
      method: 'POST',
      credentials: 'include',
      body: { name, password },
    })
  },

  login(name: string, password: string, remember?: boolean) {
    return api(`/login`, {
      method: 'POST',
      credentials: 'include',
      body: { name, password, remember },
    })
  },

  getUser(id: string) {
    return api(`/user/${id}`, {
      credentials: 'include',
    })
  },
}
