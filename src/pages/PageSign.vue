<script setup lang="ts">
import { useIsMobile } from '@/utils/composables.util.ts'
import IconEye from '@/components/icons/xicons/tabler/IconEye.vue'
import IconEyeOff from '@/components/icons/xicons/tabler/IconEyeOff.vue'
import { computed, ref } from 'vue'
import api from '@/core/api.ts'
import { useMessage } from 'naive-ui'
import { sha3_256 } from 'js-sha3'
import { FetchError } from 'ofetch'
import router from '@/routers/router.ts'
import { useUserStore } from '@/stores/user.store.ts'
import { zxcvbn } from '@zxcvbn-ts/core'

const tab = ref()

const isMobile = useIsMobile()

const showPasswordOn = computed(() => (isMobile.value ? 'click' : 'mousedown'))

const h = computed(() => (isMobile.value ? '1rem' : '1.5rem'))
const v = computed(() => (isMobile.value ? '0.5rem' : '1rem'))

const message = useMessage()

const name = (value: string) => /^[0-9a-zA-Z_-]*$/.test(value)

const upNameValue = ref()
const upNameStatus = ref()
const upNameFeedback = computed(() => {
  if (upNameValue.value) {
    if (upNameValue.value === upNameExists.value) {
      return '名称重复'
    }
    if (upNameValue.value.length >= 3) {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      upNameStatus.value = undefined
      return undefined
    }
    return '最短为3个字符'
  }
  return undefined
})
const upNameExists = ref()

const upPasswordValue = ref()
const upPasswordStatus = ref()
const upPasswordFeedback = computed(() => {
  if (upPasswordValue.value) {
    if (zxcvbn(upPasswordValue.value).score > 2) {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      upPasswordStatus.value = undefined
      return undefined
    }
    return '密码安全性太低'
  }
  return undefined
})

const upRepeatValue = ref()
const upRepeatStatus = ref()
const upRepeatFeedback = computed(() => {
  if (upRepeatValue.value) {
    if (upRepeatValue.value == upPasswordValue.value) {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      upRepeatStatus.value = undefined
      return undefined
    }
    return '两次密码不一致'
  }
  return undefined
})

const signingUp = ref()

async function handleUp() {
  let flag
  if (upNameFeedback.value) {
    upNameStatus.value = 'error'
    flag = true
  }
  if (upPasswordFeedback.value) {
    upPasswordStatus.value = 'error'
    flag = true
  }
  if (upRepeatFeedback.value) {
    upRepeatStatus.value = 'error'
    flag = true
  }
  if (flag) {
    return
  }
  try {
    signingUp.value = true
    await api.register(upNameValue.value, sha3_256(upPasswordValue.value))
    upNameValue.value = undefined
    upPasswordValue.value = undefined
    upRepeatValue.value = undefined
    message.success('注册成功')
    tab.value = 'in'
  } catch (error) {
    if (error instanceof FetchError && error.response?._data?.reason === 'NameExists') {
      upNameExists.value = upNameValue.value
      upNameStatus.value = 'error'
    } else {
      message.error('注册失败')
    }
  } finally {
    signingUp.value = false
  }
}

const inNameValue = ref()
const inNameStatus = ref()
const inNameFeedback = computed(() => {
  if (inNameValue.value) {
    if (inNameValue.value === inNameNotfound.value) {
      return '名称不存在'
    }
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    inNameStatus.value = undefined
    return undefined
  }
  return undefined
})
const inNameNotfound = ref()

const inPasswordValue = ref()
const inPasswordStatus = ref()
const inPasswordFeedback = computed(() => {
  if (inPasswordValue.value) {
    if (inPasswordValue.value === inPasswordMismatch.value) {
      return '密码错误'
    }
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    inPasswordStatus.value = undefined
    return undefined
  }
  return undefined
})
const inPasswordMismatch = ref()

const remember = ref()

const signingIn = ref()

const userStore = useUserStore()

async function handleIn() {
  try {
    signingIn.value = true
    const { id } = await api.login(
      inNameValue.value,
      sha3_256(inPasswordValue.value),
      remember.value ? true : undefined,
    )
    localStorage.setItem('id', id)
    await userStore.set(id)
    message.success('登录成功')
    await router.replace('/')
  } catch (error) {
    if (error instanceof FetchError) {
      switch (error.status) {
        case 401: {
          inPasswordMismatch.value = inPasswordValue.value
          inPasswordStatus.value = 'error'
          break
        }
        case 404: {
          inNameNotfound.value = inNameValue.value
          inNameStatus.value = 'error'
          break
        }
        default: {
          message.error('登录失败')
        }
      }
    } else {
      message.error('登录失败')
    }
  } finally {
    signingIn.value = false
  }
}
</script>

<template>
  <n-flex
    vertical
    justify="center"
    align="center"
    :style="`min-width: ${isMobile ? `100%` : `40%`};`"
  >
    <n-card hoverable :content-style="`padding: ${h} ${v};`">
      <n-tabs
        default-value="in"
        size="large"
        justify-content="space-evenly"
        animated
        v-model:value="tab"
      >
        <n-tab-pane name="in" tab="登录">
          <n-flex vertical align="center" style="gap: 0">
            <n-form :show-label="false">
              <n-form-item-row :feedback="inNameFeedback" :validation-status="inNameStatus">
                <n-input placeholder="名称" v-model:value="inNameValue" />
              </n-form-item-row>
              <n-form-item-row :validation-status="inPasswordStatus">
                <n-input
                  type="password"
                  :show-password-on
                  placeholder="密码"
                  v-model:value="inPasswordValue"
                >
                  <template #password-visible-icon>
                    <n-icon :component="IconEye" />
                  </template>
                  <template #password-invisible-icon>
                    <n-icon :component="IconEyeOff" />
                  </template>
                </n-input>
                <template #feedback>
                  {{ inPasswordFeedback }}
                  <n-checkbox v-model:checked="remember"> 记住我 </n-checkbox>
                </template>
              </n-form-item-row>
            </n-form>
            <n-spin v-if="signingIn" />
            <n-button
              v-if="!signingIn"
              type="primary"
              :disabled="!(inNameValue && inPasswordValue)"
              :onclick="handleIn"
            >
              登录
            </n-button>
          </n-flex>
        </n-tab-pane>
        <n-tab-pane name="up" tab="注册">
          <n-flex vertical align="center" style="gap: 0">
            <n-form :show-label="false">
              <n-form-item-row :feedback="upNameFeedback" :validation-status="upNameStatus">
                <n-input
                  placeholder="名称"
                  minlength="3"
                  maxlength="20"
                  show-count
                  :allow-input="name"
                  v-model:value="upNameValue"
                />
              </n-form-item-row>
              <n-form-item-row :feedback="upPasswordFeedback" :validation-status="upPasswordStatus">
                <n-input
                  type="password"
                  :show-password-on
                  placeholder="密码"
                  v-model:value="upPasswordValue"
                >
                  <template #password-visible-icon>
                    <n-icon :component="IconEye" />
                  </template>
                  <template #password-invisible-icon>
                    <n-icon :component="IconEyeOff" />
                  </template>
                </n-input>
              </n-form-item-row>
              <n-form-item-row :feedback="upRepeatFeedback" :validation-status="upRepeatStatus">
                <n-input
                  type="password"
                  :show-password-on
                  placeholder="重复密码"
                  maxlength="100"
                  v-model:value="upRepeatValue"
                >
                  <template #password-visible-icon>
                    <n-icon :component="IconEye" />
                  </template>
                  <template #password-invisible-icon>
                    <n-icon :component="IconEyeOff" />
                  </template>
                </n-input>
              </n-form-item-row>
            </n-form>
            <n-spin v-if="signingUp" />
            <n-button
              v-if="!signingUp"
              type="primary"
              :disabled="!(upNameValue && upPasswordValue && upRepeatValue)"
              :onclick="handleUp"
            >
              注册
            </n-button>
          </n-flex>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </n-flex>
</template>

<style scoped>
.n-form {
  min-width: 100%;
}

.n-checkbox {
  position: absolute;
  right: 0;
  bottom: 0;
}
</style>
