<script setup lang="ts">
import { getEmojiApi, sendMessageApi } from "@/api";
import type { SendMessage } from "@/types";
import { ref, watch } from "vue";

const props = defineProps<{
  roomid: string;
  connected: boolean;
}>();

watch(props, () => {
  if (!props.connected) return;
  const id = Number(props.roomid.trim());
  if (isNaN(id) || id === 0) return;
  getEmojiList();
});

const popupRef = ref()

// 表情包列表
const emojiList = ref<any[]>([]);
// 输入框内容
const inputValue = ref("");
// 选中的tab
const activeTab = ref('通用表情');

// 获取表情包列表
const getEmojiList = async () => {
  const result = await getEmojiApi(props.roomid);
  if (!result) {
    return;
  }
  emojiList.value = result.data;
};

// 发送信息
const sendMessage = async (value?: string) => {
  const params: SendMessage = {
    dm_type: value ? "1" : "0",
    msg: value || inputValue.value.trim(),
    roomid: props.roomid
  };

  if (!params.msg) return;

  const result = await sendMessageApi({ ...params, isInitiative: true });

  if (!result || value) return;

  inputValue.value = "";
  popupRef.value.hide();
};

</script>

<template>
  <q-input standout="bg-teal text-white" maxlength="20" counter placeholder="发个弹幕呗~" @keyup.enter="sendMessage()"
    v-model="inputValue" class="w-full" :disable="!connected">
    <template v-slot:append>
      <q-icon name="event" class="i-carbon-face-activated">
        <q-popup-proxy class="w-280px h-200px" ref="popupRef">
          <q-tabs v-model="activeTab" class="text-grey" active-color="primary" indicator-color="primary" align="justify"
            narrow-indicator left-icon="img:https://api.iconify.design/carbon:chevron-left.svg"
            right-icon="img:https://api.iconify.design/carbon:chevron-right.svg">
            <q-tab v-for="item in emojiList" :name="item.pkg_name" :label="item.pkg_name" :key="item.pkg_id" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated>
            <q-tab-panel v-for="item in emojiList" :name="item.pkg_name" :key="item.pkg_id">
              <div class="flex flex-wrap gap-1">
                <q-img v-for="emoji in item.emoticons" :key="emoji.emoticon_id" :src="emoji.url" :alt="emoji.emoji"
                  class="flex-1/4 cursor-pointer h-60px" fit="scale-down" @click="sendMessage(emoji.emoticon_unique)" />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

