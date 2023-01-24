<script lang="ts" setup>
import { onMounted, reactive } from 'vue';
import { getStore } from "@/store";
import { LOGIN_INFO } from "@/constants";
import { clearInfo } from '@/utils/auth';
import { getUserInfoApi } from '@/api';
import useWebsocket from "@/hooks/useWebsocket";
import { appWindow } from '@tauri-apps/api/window';

import Room from "./room.vue";
import { initSQL } from '@/utils/initSQL';
// 用户信息
const userInfo = reactive({
  avatar: '',
  uname: '',
  uid: await getStore(LOGIN_INFO.uid),
});

const getUserInfo = async () => {
  const result = await getUserInfoApi();
  if (!result) {
    // getUserInfo();
    return;
  }

  const { name, face } = result;
  userInfo.avatar = face;
  userInfo.uname = name;
};

const logout = () => {
  clearInfo();
  window.location.reload();
};

const exit = async () => {
  await appWindow.hide();
};

onMounted(() => {
  getUserInfo();
  useWebsocket().trigger();
  initSQL();
});


</script>

<template>
  <q-layout view="lHh lpr lFf" class="h-screen w-full">
    <q-header elevated>
      <q-toolbar>
        <q-avatar>
          <q-img :src="userInfo.avatar" spinner-color="white" />
        </q-avatar>
        <q-toolbar-title data-tauri-drag-region class="hover:cursor-move">
          {{ userInfo.uname }}
        </q-toolbar-title>
        <q-btn flat round dense @click="logout" size="lg">
          <div class="i-carbon-logout"></div>
        </q-btn>
        <q-btn flat round dense @click="exit" size="lg">
          <div class="i-carbon-close-filled"></div>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding>
        <Room />
      </q-page>
    </q-page-container>
  </q-layout>
</template>
