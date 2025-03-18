import { ofetch } from 'ofetch'

const url = import.meta.env.VITE_API_URL

const api = ofetch.create({
  baseURL: url,
})

export default {
  register(name: string, password: string) {
    return api('/auths/register', {
      method: 'POST',
      credentials: 'include',
      body: { name, password },
    })
  },

  login(name: string, password: string, remember?: boolean) {
    return api(`/auths/login`, {
      method: 'POST',
      credentials: 'include',
      body: { name, password, remember },
    })
  },

  logout() {
    return api(`/auths/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  },

  getStructures(page?: number, size?: number) {
    return api('/structures', {
      credentials: 'include',
      params: { page, size },
    })
  },

  getStructure(id: string) {
    return api(`/structures/${id}`, {
      credentials: 'include',
    })
  },

  getUser(id: string) {
    return api(`/users/${id}`, {
      credentials: 'include',
    })
  },

  getUserByName(name: string) {
    return api(`/users/by/name/${name}`, {
      credentials: 'include',
    })
  },
}
