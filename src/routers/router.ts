import { ref } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/pages/PageHome.vue'),
  },
  {
    path: '/structures',
    component: () => import('@/pages/PageStructures.vue'),
  },
  {
    path: '/structure/:id',
    component: () => import('@/pages/PageStructure.vue'),
  },
  {
    path: '/sign',
    component: () => import('@/pages/PageSign.vue'),
  },
]

export const loadingBarApi = ref()

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  if (!from || to.path !== from.path) {
    if (loadingBarApi.value) {
      loadingBarApi.value.start()
    }
  }
  next()
})

router.afterEach((to, from) => {
  if (!from || to.path !== from.path) {
    if (loadingBarApi.value) {
      loadingBarApi.value.finish()
    }
  }
})

export default router
