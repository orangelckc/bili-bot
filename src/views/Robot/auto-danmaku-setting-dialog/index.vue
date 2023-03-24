<template>
  <q-btn label="设置自动弹幕" @click="dialog = true" />
  <q-dialog
      v-model="dialog"
      persistent
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card>
        <q-bar data-tauri-drag-region class="hover:cursor-move">
          <q-space />
          <!-- TODO 处理下图标 -->
          <q-btn dense flat @click="maximizedToggle = false" :disable="!maximizedToggle">
            缩小
          </q-btn>
          <q-btn dense flat @click="maximizedToggle = true" :disable="maximizedToggle">
            全屏
          </q-btn>
          <q-btn dense flat v-close-popup>
            收起
          </q-btn>
        </q-bar>

        <q-card-section>
          <div class="text-h6">设置自动发送的弹幕</div>
          <div>
            <q-toggle v-model="active" size="md" label="是否开启自动发送弹幕">
            </q-toggle>
          </div>
        </q-card-section>

        <q-card-section v-if="active">
          <div>
            输入框中的特殊标记会自动替换成指定的文本
          </div>
          <ul>
            <li>{up} 会被替换成主播名称</li>
            <li>{user} 会被替换成用户昵称</li>
            <li>{gift} 会被替换成礼物名称 </li>
          </ul>
        </q-card-section>

        <q-card-section v-if="active" class="q-pt-none">
          <div>
            <q-checkbox v-model="manage.like" label="点赞" />
            <q-input outlined v-model="manage.likeText" label="有人点赞时发送" />
          </div>
          <div>
            <q-checkbox v-model="manage.follow" label="关注" />
            <q-input outlined v-model="manage.followText" label="有人关注时发送" />
          </div>
          <div>
            <q-checkbox v-model="manage.gift" label="礼物" />
            <q-input outlined v-model="manage.giftText" label="有人送礼物时发送" />
          </div>
          <div>
            <q-checkbox v-model="manage.welcome" label="欢迎词" />
            <q-input outlined v-model="manage.welcomeText" label="有人进直播间时发送" />
          </div>
          <div>
            <q-checkbox v-model="isOpenChatgpt" label="GPT问答机器人" />
            <q-input outlined v-model="manage.gptToken" label="输入chatgpt的token才可以启用。启用后，管家会使用 chatgpt 但回答问题，回答不会超过10个字" />
            <div>
              
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { manage, isOpenChatgpt, active } from '../message/robot';
// 是否打开设置页面
const dialog = ref(false);
// 是否最大化设置页面
const maximizedToggle = ref(true);
</script>

<style lang="less" scoped>
</style>
