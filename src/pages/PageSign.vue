<script setup lang="ts">
import {useIsMobile} from "@/utils/composables.util.ts";
import IconEye from "@/components/icons/xicons/tabler/IconEye.vue";
import IconEyeOff from "@/components/icons/xicons/tabler/IconEyeOff.vue";
import {computed} from "vue";

const isMobile = useIsMobile();

const h = computed(() => isMobile.value ? '1rem' : '1.5rem');
const v = computed(() => isMobile.value ? '0.5rem' : '1rem');
</script>

<template>
  <n-flex vertical justify="center" align="center" :style="`min-width: ${isMobile ? `100%` : `40%`};`">
    <n-card hoverable :content-style="`padding: ${h} ${v};`">
      <n-tabs default-value="in" size="large" justify-content="space-evenly" animated>
        <n-tab-pane name="in" tab="登录">
          <n-flex vertical align="center" style="gap: 0;">
            <n-form :show-label="false" :show-feedback="false">
              <n-form-item-row :style="`margin-bottom: ${v}`">
                <n-input placeholder="账号或邮箱" />
              </n-form-item-row>
              <n-form-item-row :style="`margin-bottom: ${v}`">
                <n-input type="password" show-password-toggle placeholder="密码">
                  <template #password-visible-icon>
                    <n-icon :component="IconEye" />
                  </template>
                  <template #password-invisible-icon>
                    <n-icon :component="IconEyeOff" />
                  </template>
                </n-input>
              </n-form-item-row>
            </n-form>
            <n-button type="primary">
              登录
            </n-button>
          </n-flex>
        </n-tab-pane>
        <n-tab-pane name="up" tab="注册">
          <n-flex vertical align="center" style="gap: 0;">
            <n-form :show-label="false" :show-feedback="false">
              <n-form-item-row :style="`margin-bottom: ${v};`">
                <n-input placeholder="账号" />
              </n-form-item-row>
              <n-form-item-row :style="`margin-bottom: ${v};`">
                <n-input type="password" show-password-toggle placeholder="密码">
                  <template #password-visible-icon>
                    <n-icon :component="IconEye" />
                  </template>
                  <template #password-invisible-icon>
                    <n-icon :component="IconEyeOff" />
                  </template>
                </n-input>
              </n-form-item-row>
              <n-form-item-row :style="`margin-bottom: ${v};`">
                <n-input type="password" show-password-toggle placeholder="重复密码">
                  <template #password-visible-icon>
                    <n-icon :component="IconEye" />
                  </template>
                  <template #password-invisible-icon>
                    <n-icon :component="IconEyeOff" />
                  </template>
                </n-input>
              </n-form-item-row>
              <n-form-item-row :style="`margin-bottom: ${v};`">
                <n-flex :style="`min-width: 100%; gap: ${v}`">
                  <n-input placeholder="邮箱" :style="isMobile ? `` : `flex: 2`" />
                  <n-input placeholder="验证码" :style="isMobile ? `` : `flex: 1`" />
                </n-flex>
              </n-form-item-row>
            </n-form>
            <n-button type="primary">
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
</style>
