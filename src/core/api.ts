const URL = 'https://api.destru.org'

export default {
  login(code: string) {
    return fetch(`${URL}/login?code=${code}`)
  },

  getStructures() {
    return fetch(`${URL}/structures`)
  },

  getStructure(id: string) {
    return fetch(`${URL}/structures/${id}`)
  },
}
