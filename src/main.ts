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
const expired = localStorage.getItem('expired')
if (user && token && expired) {
  const userStore = useUserStore()
  const number = parseInt(expired)
  if (Date.now() >= number) {
    userStore.clear()
  } else {
    userStore.load(JSON.parse(user), token, number)
  }
}

app.mount('#app')
