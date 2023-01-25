<script setup lang="ts">
import { connected, startWebsocket, stopWebsocket, active, msgList, manage } from "./message/robot";
import { ROOM_URL_PREFIX } from "@/constants";
import { computed, ref, watch } from "vue";
import { getLiveStreamUrlApi, getLiveStatusApi } from "@/api";
import { newRecorder, testFfmpge, recordPath } from '@/utils/cmd'
import { type Child, type Command } from "@tauri-apps/api/shell";

import sendMessages from "./message/index.vue";
import Video from "./video.vue";
import { message } from "@tauri-apps/api/dialog";
import { open } from "@tauri-apps/api/shell";

const url = ref('');
const isRecording = ref(false)

const getUrl = async () => {
  if (!manage.roomid.trim()) return
  const { by_room_ids } = await getLiveStatusApi(manage.roomid);
  const { live_status, uname, title } = by_room_ids[manage.roomid];
  if (live_status !== 1) {
    message(`${uname}直播间未开播！`)
    return false
  }
  const res = await getLiveStreamUrlApi("10000", manage.roomid);
  if (!res) return;
  const urls = res.durl.map((item: any) => item.url);
  return { urls, uname, title };
}

const openPreview = async () => {
  const res = await getUrl();
  if (!res || !res?.urls.length) return
  url.value = res?.urls[0];
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

let recorder: Command;
let spawn: Child;
const startRecord = async (order = 0) => {
  // 检测ffmpeg是否安装
  const { code } = await testFfmpge()
  if (code) {
    message('未检测到ffmpeg, 请先安装ffmpeg')
    return
  }
  const res = await getUrl();
  if (!res || !res?.urls.length) return
  const streamUrl = res?.urls[order]
  const folder = `${res?.uname}-[${manage.roomid}]`
  // 创建录制器
  recorder = await newRecorder(streamUrl, folder, res?.title)
  recorder.on("close", async ({ code }) => {
    if (code) {
      console.log(`${manage.roomid}链接-${order + 1} 失败`)
      if (order === 1) {
        await message('录制视频流失败')
        isRecording.value = false
        return
      }
      startRecord(1)
    } else {
      await message('录制完成')
      open(await recordPath(folder))
      isRecording.value = false
    }
  })
  spawn = await recorder.spawn()
  isRecording.value = true
}

const stopRecord = async () => {
  await spawn.write("q");
  isRecording.value = false
}

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
              <q-tooltip v-if="connected">
                开启机器人
              </q-tooltip>
            </q-toggle>
            <q-icon class="i-carbon-add-alt" color="primary">
              <q-tooltip>
                修改GPT-Token
              </q-tooltip>
              <q-popup-proxy>
                <q-input v-model="manage.gptToken" dense autofocus />
              </q-popup-proxy>
            </q-icon>
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="flex justify-around gap-2 w-full">
          <q-input outlined v-model="manage.roomid" label="直播间id" :disable="connected" />
          <q-input outlined v-model="manage.hostName" label="主播名称" :disable="connected" />
          <q-input outlined v-model="manage.robotName" label="机器人名称" :disable="connected" />
        </div>
        <div class="flex gap-2 m-3 items-center">
          <q-btn @click="openPreview">
            直播预览
          </q-btn>
          <q-btn @click="startWebsocket" :disable="connected">
            开启链接
          </q-btn>
          <q-btn @click="stopWebsocket" :disable="!connected">
            停止链接
          </q-btn>
          <div>
            <q-icon :class="isRecording ? 'i-carbon-stop-filled text-red' : 'i-carbon-play-filled text-blue'"
              class="justify-start hover:cursor-pointer" @click="isRecording ? stopRecord() : startRecord()" size="md">
              <q-tooltip>
                {{ isRecording?'结束录制': '点击开始录制' }}
              </q-tooltip>
            </q-icon>
            <span class="text-red  font-bold" v-if="isRecording"> 正在录制中... </span>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="my-2">
      <q-card-section class="flex items-center h-[480px] gap-2">
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
