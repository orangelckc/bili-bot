<script setup lang="ts">
import { onMounted, ref } from "vue";
import QRCode from "qrcode";
import QS from "qs";

import { getLoginUrlApi, verifyQrCodeApi } from "@/api";
import { LOGIN_INFO } from "@/constants";
import { setStore } from "@/store";

const enum EQRCodeState {
  '成功登陆' = 0,
  '已失效' = 86038,
  '未扫码' = 86101,
  '已扫码未确认' = 86090,
}

// 二维码图片
const qrCodeImage = ref<string>();

// 扫码状态 0 未扫码 1 已扫码 2 已过期 3 扫码并登录
const qrCodeStatus = ref<0 | 1 | 2 | 3>(0);

// 获取登录链接，生成二维码
const getQRCode = async () => {
  qrCodeStatus.value = 0;
  qrCodeImage.value = "";

  const result = await getLoginUrlApi();
  if (!result) {
    setTimeout(getQRCode, 1000 * 3);

    return;
  }

  const { qrcode_key, url } = result;
  qrCodeImage.value = await QRCode.toDataURL(url);
  verifyQrCode(qrcode_key);
};

// 验证扫码信息
const verifyQrCode = async (qrcode_key: string) => {
  const result = await verifyQrCodeApi(qrcode_key);

  if (!result) {
    setTimeout(() => verifyQrCode(qrcode_key), 1000 * 3);

    return;
  }

  switch (result.code) {
    case EQRCodeState.已失效:
      getQRCode()
      break

    case EQRCodeState.未扫码:
      setTimeout(() => verifyQrCode(qrcode_key), 1000 * 3)
      break

    case EQRCodeState.已扫码未确认:
      setTimeout(() => verifyQrCode(qrcode_key), 1000 * 3)
      break

    case EQRCodeState.成功登陆:
      saveLoginInfo(result.url)
      break
  }
};

// 存储登录信息，提示验证
const saveLoginInfo = async (data: string) => {
  const { DedeUserID, bili_jct, SESSDATA } = QS.parse(data.split("?")[1]);

  await setStore(LOGIN_INFO.uid, DedeUserID!.toString());
  await setStore(LOGIN_INFO.cookie, `SESSDATA=${SESSDATA}`);
  await setStore(LOGIN_INFO.csrf, bili_jct!.toString());
  window.location.reload();
};

onMounted(getQRCode);
</script>

<template>
  <div class=" flex justify-center items-center h-40 w-40">

    <h5 v-if="qrCodeStatus === 1">扫码成功</h5>
    <h5 v-else-if="qrCodeStatus === 2">二维码已过期
      <q-btn flat color="primary" label="点击刷新" @click="getQRCode" />
    </h5>
    <h5 v-else-if="qrCodeStatus === 3">登录成功</h5>
    <img :src="qrCodeImage" class="h-full w-full" v-else>

  </div>
</template>

<style scoped lang="scss">

</style>
