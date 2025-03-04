import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import {useResourceStore} from "@/stores/resource.store.ts";
import router from "@/routers/router.ts";
import './assets/main.css'

const app = createApp(App)

app.use(router)

app.use(createPinia())

const resourceStore = useResourceStore()
resourceStore.load()

app.mount('#app')
