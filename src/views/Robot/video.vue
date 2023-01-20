<script setup lang="ts">
import flvjs from "flv.js";
import { getLiveStreamUrlApi } from "@/api";
import { reactive, ref, watch } from "vue";

const props = defineProps<{
  url: string;
}>();

let flvPlayer = reactive<any>({});

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

const videoElement = ref();

const initPlayer = () => {
  if (flvjs.isSupported()) {
    flvPlayer = flvjs.createPlayer(
      {
        type: "flv",
        url: props.url,
        isLive: true,
        hasVideo: !audioMode.value,
      },
      {
        enableWorker: false, // 不启用拆散线程
        enableStashBuffer: false, // 敞开IO暗藏缓冲区
        reuseRedirectedURL: true, // 重用301/302重定向url，用于随后的申请，如查找、从新连贯等。
        autoCleanupSourceBuffer: true // 主动革除缓存
      }
    );
    flvPlayer.attachMediaElement(videoElement.value);
    flvPlayer.load();
    flvPlayer.play();

    flvPlayer.on(flvjs.Events.LOADING_COMPLETE, (data: any) => {
      console.log("视频流停止", data);
      destroyPlayer();
    });

    flvPlayer.on(flvjs.Events.ERROR, (data: any) => {
      console.log("加载失败", data);
      destroyPlayer();
    });

    flvPlayer.on(flvjs.Events.MEDIA_INFO, (data: any) => {
      console.log("MEDIA_INFO", data);
    });

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
    flvPlayer = null;
  }
};

watch(props, async () => {
  initPlayer();
});

</script>

<template>
  <div class="flex h-full items-center justify-center bg-black/30" @wheel="changeVolume">
    <video ref="videoElement" :volume="volume" class="max-h-300px w-full " controls />
    <div class="flex justify-around">
      <div :class="audioMode ? 'i-carbon-video-filled' : 'i-carbon-headphones'"
        class="text-5xl text-white  hover:text-red-100 hover:text-6xl hover:cursor-pointer" @click="switchAudioMode" />
    </div>
  </div>
</template>
