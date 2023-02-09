<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { emojiList, msgList, sendMessage, emojiPopList } from './robot'

const props = defineProps<{
  connected: boolean;
}>();

const popupRef = ref()
// 输入框内容
const inputValue = ref("");
// 选中的tab
const activeTab = ref('通用表情');
const popupEmoji = ref();

// 发送信息
const sendDanmu = async (value?: string) => {
  const type = value ? "1" : "0"
  const msg = value || inputValue.value.trim();
  if (!msg) return;

  const res = sendMessage(msg, type);
  if (!res) return
  inputValue.value = "";
  popupRef.value.hide();
};

const scrollRef = ref();
const autoScroll = ref(true)

watch(msgList.value, (val) => {
  // 只保留最新的100条
  if (!autoScroll && msgList.value.length > 100) {
    msgList.value.splice(0, msgList.value.length - 100);
  }
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

onMounted(() => {
  setInterval(() => {
    if (emojiPopList.value.length) {
      popupEmoji.value = emojiPopList.value.shift()
    } else {
      popupEmoji.value = null
    }
  }, 1500)
})


</script>

<template>
  <div class="relative">
    <q-scroll-area ref="scrollRef" class="h-[350px] " @wheel="scrollControl" :visible="false">
      <p v-for="item in msgList" :key="item">
        {{ item.uname }}: {{ item.message }}
      </p>
    </q-scroll-area>
    <q-img :src="popupEmoji?.url" fit="scale-down" class="absolute bottom-25" height="100px" position="90% 50%" />
    <q-input standout="bg-teal text-white" maxlength="20" counter placeholder="发个弹幕呗~" @keyup.enter="sendDanmu()"
      v-model="inputValue" class="w-full bg-gray-100 mt-2" :disable="!props.connected">
      <template v-slot:append>
        <q-icon name="event" class="i-carbon-face-activated">
          <q-popup-proxy class="w-280px h-200px" ref="popupRef">
            <q-tabs v-model="activeTab" class="text-grey" active-color="primary" indicator-color="primary"
              align="justify" narrow-indicator left-icon="img:https://api.iconify.design/carbon:chevron-left.svg"
              right-icon="img:https://api.iconify.design/carbon:chevron-right.svg">
              <q-tab v-for="item in emojiList" :name="item.pkg_name" :label="item.pkg_name" :key="item.pkg_id" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="activeTab" animated>
              <q-tab-panel v-for="item in emojiList" :name="item.pkg_name" :key="item.pkg_id">
                <div class="flex flex-wrap gap-1">
                  <q-img v-for="emoji in item.emoticons" :key="emoji.emoticon_id" :src="emoji.url" :alt="emoji.emoji"
                    class="flex-1/4 cursor-pointer h-60px" fit="scale-down" @click="sendDanmu(emoji.emoticon_unique)" />
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>
