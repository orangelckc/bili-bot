<script setup lang="ts">
import { connected, startWebsocket, stopWebsocket, active, msgList, manage } from "./message/robot";
import { ROOM_URL_PREFIX } from "@/constants";
import { computed, ref, watch } from "vue";
import { getLiveStreamUrlApi } from "@/api";

import sendMessages from "./message/index.vue";
import Video from "./video.vue";

const url = ref("");

const openPreview = async () => {
  const res = await getLiveStreamUrlApi("10000", manage.roomid);
  if (!res) return;
  url.value = res.durl[0].url;
};

const scrollRef = ref();
const autoScroll = ref(true)

watch(msgList.value, (val) => {
  const position = scrollRef.value.getScrollPosition('vertical').top + 30 * val.length;
  autoScroll.value && scrollRef.value.setScrollPosition('vertical', position, 300)
});

const scrollControl = (event: WheelEvent) => {
  const position = scrollRef.value.getScrollPosition('vertical').top;

  const { deltaY } = event;
  if (deltaY < 0) {
    autoScroll.value = false;
  } else {
    if (position > scrollRef.value.getScrollPosition('vertical').top - 40)
      autoScroll.value = true;
  }
}

const roomLink = computed(() =>
  `${ROOM_URL_PREFIX}/${manage.roomid}`);

</script>

<template>
  <div>
    <q-card>
      <q-card-section class="flex justify-between">
        <div class="text-2xl">
          直播间状态:&nbsp;
          <a :href="roomLink" target="_blank" v-if="connected" class="text-green">
            已连接
          </a>
          <span class="text-red" v-else>未连接</span>
        </div>
        <div>
          <div class="flex">
            <q-checkbox v-model="manage.like" label="点赞" />
            <q-checkbox v-model="manage.follow" label="关注" />
            <q-checkbox v-model="manage.gift" label="礼物" />
            <q-checkbox v-model="manage.welcome" label="欢迎词" />
            <q-toggle v-model="active" size="md" :disable="!connected">
              <div class="i-carbon-machine-learning text-2xl font-bold" :class="active ? 'text-green' : 'text-gray'" />
            </q-toggle>
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="flex justify-around gap-2 w-full">
          <q-input outlined v-model="manage.roomid" label="直播间id" :disable="connected" />
          <q-input outlined v-model="manage.hostName" label="主播名称" :disable="connected" />
          <q-input outlined v-model="manage.robotName" label="机器人名称" :disable="connected" />
        </div>
        <div class="flex gap-2 m-3">
          <q-btn @click="openPreview">
            直播预览
          </q-btn>
          <q-btn @click="startWebsocket" :disable="connected">
            开启链接
          </q-btn>
          <q-btn @click="stopWebsocket" :disable="!connected">
            停止链接
          </q-btn>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="my-2">
      <q-card-section class="flex items-center h-[450px] gap-2">
        <div class="max-w-3/5 flex-grow ">
          <Video :url="url" v-show="url.length" />
        </div>
        <div class="flex-grow max-w-2/5">
          <q-scroll-area ref="scrollRef" class="h-[350px]" @wheel="scrollControl" :visible="false">
            <p v-for="item in msgList" :key="item">
              {{ item.uname }}: {{ item.message }}
            </p>
          </q-scroll-area>
          <sendMessages :roomid="manage.roomid" :connected="connected" class="bg-gray-100 mt-2" />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<style lang="scss" scoped>

</style>
