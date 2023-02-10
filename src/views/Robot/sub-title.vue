<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

const recognition = new (window as any).webkitSpeechRecognition();
const subTitle = ref<string>('');
const tmp = ref<string>('');
const audioDevices = ref<MediaStreamTrack[]>([]);
const target = ref<MediaStreamTrack>();
const scrollRef = ref()

const start = () => {
  if (!target.value) return;
  recognition.audioTrackConstraints = {
    deviceId: target.value.getSettings().deviceId,
  };
  recognition.start();
};

const stop = () => {
  recognition.stop();
  subTitle.value = ''
  tmp.value = ''
};

watch(tmp, () => {
  const top = scrollRef.value.getScrollPosition('vertical').top
  scrollRef.value.setScrollPosition('vertical', top + 100, 200)
});

onMounted(async () => {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((devices) => {
      audioDevices.value = devices.getAudioTracks();
    })
    .catch((err) => {
      console.log('未找到设备', err);
    });

  recognition.continuous = true;
  recognition.lang = 'zh-CN';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    const result = event.results[event.resultIndex];
    tmp.value = result[0].transcript;
    if (result.isFinal) {
      console.log('识别结束');
      tmp.value = '';
      subTitle.value += result[0].transcript;
    }
  };
  recognition.onerror = (event: any) => {
    console.log('语音识别出现错误', event);
    target.value?.stop()
  };
  recognition.onend = (event: any) => {
    console.log('语音识别结束', event);
    target.value?.stop()
  };
  recognition.onstart = (event: any) => {
    console.log('语音识别开始', event);
  };
});
</script>

<template>
  <div class="flex justify-around items-center gap-4">
    <q-select square filled v-model="target" :options="audioDevices" label="选择音频输入设备"
      dropdown-icon="img:https://api.iconify.design/ant-design:caret-down-outlined.svg" class="w-200px" />
    <button @click="start">开始</button>
    <button @click="stop">结束</button>
  </div>
  <q-scroll-area ref="scrollRef" class="h-[80px]" :visible="false">
    <span class="text-base">{{ subTitle }}{{ tmp }}</span>
  </q-scroll-area>
</template>

<style scoped lang="scss">

</style>
