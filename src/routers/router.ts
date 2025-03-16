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
    meta: {
      title: '结构列表',
    },
  },
  {
    path: '/structure/:id',
    component: () => import('@/pages/PageStructure.vue'),
    meta: {
      title: '加载中',
      scope: '结构',
    },
  },
  {
    path: '/sign',
    component: () => import('@/pages/PageSign.vue'),
    meta: {
      title: '登录',
    },
  },
  {
    path: '/profile',
    component: () => import('@/pages/PageProfile.vue'),
    meta: {
      title: '个人空间',
    },
  },
]

export const loadingBarApi = ref()

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export function setTitle(title?: unknown, scope?: unknown) {
  const s = scope || 'destru'
  if (title) {
    document.title = `${title} - ${s}`
  } else {
    document.title = s as string
  }
}

router.beforeEach((to, from, next) => {
  if (!from || to.path !== from.path) {
    setTitle(to.meta.title, to.meta.scope)
    if (loadingBarApi.value) {
      loadingBarApi.value.start()
    }
  }
  next()
})

router.afterEach((to, from) => {
  if (!from || to.path !== from.path) {
    if (loadingBarApi.value) {
      if (to.path.startsWith('/structure/')) return
      loadingBarApi.value.finish()
    }
  }
})

export default router
