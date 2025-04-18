import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useResourceStore } from '@/stores/resource.store.ts'
import router from '@/routers/router.ts'
import './assets/main.css'
import { useUserStore } from '@/stores/user.store.ts'

const app = createApp(App)

app.use(router)

app.use(createPinia())

const resourceStore = useResourceStore()
resourceStore.load()

const user = localStorage.getItem('user')
const token = localStorage.getItem('token')
const expires = localStorage.getItem('expires')
if (user && token && expires) {
  const userStore = useUserStore()
  const number = parseInt(expires)
  if (Date.now() >= number * 1000) {
    // userStore.clear()
  } else {
    userStore.set(JSON.parse(user), token, number)
  }
}

app.mount('#app')
