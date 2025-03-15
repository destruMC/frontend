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

const userStore = useUserStore()
const item = localStorage.getItem('id')
if (item) {
  userStore.set(item)
}

app.mount('#app')
