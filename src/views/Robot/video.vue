<script setup lang="ts">
import flvjs from "flv.js";
import { computed, onUpdated, ref, watch, watchEffect } from "vue";
import { Stream } from '@/types'
import { message } from "@tauri-apps/api/dialog";

const props = defineProps<{
  streams: Stream[];
}>();

let flvPlayer: any = {};
const curStream = ref<Stream>();
let curStreamIndex = 0;

const volume = ref(0.5);
const audioMode = ref(false);

const changeVolume = (event: WheelEvent) => {
  const { deltaY } = event;
  const sign = deltaY > 0 ? -1 : 1;
  volume.value += sign * 0.1;
  if (volume.value > 1) {
    volume.value = 1;
  } else {
    if (volume.value < 0) {
      volume.value = 0;
    }
  }
};

const videoRef = ref();

const initPlayer = () => {
  if (flvjs.isSupported()) {
    flvPlayer = flvjs.createPlayer(
      {
        type: curStream.value!.type,
        url: curStream.value!.url,
        isLive: true,
        hasVideo: !audioMode.value,
      },
      {
        enableWorker: false, // 不启用拆散线程
        enableStashBuffer: false, // 敞开IO暗藏缓冲区
        reuseRedirectedURL: true, // 重用301/302重定向url，用于随后的申请，如查找、重新连接等。
        autoCleanupSourceBuffer: true // 主动清除缓存
      }
    );
    flvPlayer.attachMediaElement(videoRef.value);
    flvPlayer.load();
    flvPlayer.play();

    flvPlayer.on(flvjs.Events.LOADING_COMPLETE, (data: any) => {
      message("视频流停止");
      destroyPlayer();
    });

    flvPlayer.on(flvjs.Events.ERROR, (data: any) => {
      curStreamIndex++;
      if (curStreamIndex < props.streams.length) {
        curStream.value = props.streams[curStreamIndex]
      } else {
        message('视频流加载失败')
        destroyPlayer();
      }
    });

    flvPlayer.on(flvjs.Events.MEDIA_INFO, (data: any) => {
      const { width, height } = data
      if (curStream.value!.type === 'flv') {
        // 根据视频流的宽高比，设置视频的宽高
        if (width > height) {
          // 横屏
          videoRef.value.style.width = '100%';
          videoRef.value.style.height = 'auto';
        } else {
          // 竖屏
          videoRef.value.style.width = '50%';
          videoRef.value.style.height = '100%';
        }
      } else {
        videoRef.value.style.maxHeight = '393px';
        videoRef.value.style.width = '100%';
      }
    });
  } else {
    message('系统不支持flv.js')
  }
};

const switchAudioMode = () => {
  audioMode.value = !audioMode.value;
  destroyPlayer();
  initPlayer();
};

const destroyPlayer = () => {
  if (Object.keys(flvPlayer).length) {
    // 关闭之前的流
    flvPlayer.pause();
    flvPlayer.unload();
    flvPlayer.detachMediaElement();
    flvPlayer.destroy();
    flvPlayer = {};
  }
};

watch(curStream, async (val) => {
  await destroyPlayer()
  initPlayer()
})

watchEffect(async () => {
  if (props.streams.length === 0) return;
  await destroyPlayer();

  curStreamIndex = 0;
  curStream.value = props.streams[curStreamIndex];
  // 优先m3u8
  // curStream.value = props.streams.find(item => item.type === 'm3u8');
})


</script>

<template>
  <div class="flex flex-col h-full items-center justify-center bg-gray/30" @wheel="changeVolume">
    <video ref="videoRef" :volume="volume" controls />
    <div class="flex justify-around items-center gap-4">
      <div :class="audioMode ? 'i-carbon-video-filled' : 'i-carbon-headphones'"
        class="text-5xl text-white hover:cursor-pointer" @click="switchAudioMode" />
    </div>
  </div>
</template>
