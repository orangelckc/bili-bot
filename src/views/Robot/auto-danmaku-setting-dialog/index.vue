
<script lang="ts" setup>
import { ref } from 'vue';
import { manage } from '../message/robot';

const dialog = ref(false);
</script>

<template>
  <q-btn label="设置机器人弹幕" @click="dialog = true" />

  <q-dialog v-model="dialog" persistent no-shake full-width>
    <q-card>
      <q-card-section class="flex justify-between items-center">
        <div class="text-2xl">设置机器人弹幕</div>
        <q-btn flat round dense @click="dialog = false" size="lg">
          <div class="i-carbon-close-filled"></div>
        </q-btn>
      </q-card-section>

      <q-card-section>
        <p class="text-lg text-center">
          输入框中的特殊标记会自动替换成指定的文本
        </p>

        <q-list bordered separator>
          <q-item v-ripple>
            <q-item-section>
              <span>主播名称: <span class="font-bold text-red-500">{up}</span></span>
            </q-item-section>
            <q-item-section>
              <span>用户昵称: <span class="font-bold text-red-500">{user}</span></span>
            </q-item-section>
            <q-item-section>
              <span>礼物名称: <span class="font-bold text-red-500">{gift}</span></span>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section class="flex flex-col px-3 gap-2 items-center">
        <div class="flex w-full justify-around items-center">
          <q-checkbox v-model="manage.like" label="点赞" />
          <q-input outlined v-model="manage.likeText" dense hint="有人点赞时发送" class="w-4/5" />
        </div>
        <div class="flex w-full justify-around items-center">
          <q-checkbox v-model="manage.follow" label="关注" />
          <q-input outlined v-model="manage.followText" dense hint="有人关注时发送" class="w-4/5" />
        </div>
        <div class="flex w-full justify-around items-center">
          <q-checkbox v-model="manage.gift" label="礼物" />
          <q-input outlined v-model="manage.giftText" dense hint="有人送礼物时发送" class="w-4/5" />
        </div>
        <div class="flex w-full justify-around items-center">
          <q-checkbox v-model="manage.welcome" label="欢迎词" />
          <q-input outlined v-model="manage.welcomeText" dense hint="人气到达设定值时触发" class="w-4/5" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>


