<script setup lang="ts">
import { isLogin, clearInfo } from "@/utils/auth";
import { validateLoginInfoApi } from "@/api";
import { Notify } from "quasar";

import { onMounted, ref } from "vue";
import QRCode from "./qr-code.vue";
import Robot from "@/views/Robot/index.vue";

const logged = ref<boolean>(false);

const logout = () => {
  clearInfo();
  window.location.reload();
};

const validateLoginInfo = async () => {
  if (!isLogin) return

  const result = await validateLoginInfoApi();
  if (result.code) {
    logout();
    Notify.create("登录信息已过期，请重新扫码登录");
    return;
  }
  logged.value = true;
};

onMounted(validateLoginInfo);

</script>

<template>
  <Robot v-if="logged" />
  <div class="flex flex-col h-screen justify-center items-center" v-else>
    <h4 class="m-0">
      扫码登录
    </h4>
    <QRCode />
    <p class="m-0">
      请使用哔哩哔哩手机客户端
    </p>
  </div>
</template>

<style scoped lang="scss">

</style>
