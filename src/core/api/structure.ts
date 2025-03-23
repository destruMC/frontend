const URL = 'https://raw.githubusercontent.com/destruMC/repo/structures'

export default {
  pages() {
    return fetch(`${URL}/meta`)
  },

  page(index: number) {
    return fetch(`${URL}/pages/${index}`)
  },

  get(id: string) {
    return fetch(`${URL}/items/${id}`)
  },
}
