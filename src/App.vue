<script setup lang="ts">
import { onMounted } from 'vue';
import { initStore } from './store';
import Login from '@/views/Login/index.vue';

onMounted(() => {
  // 初始化 store 数据
  initStore();
});
</script>

<template>
  <Suspense>
    <Login />
  </Suspense>
</template>

<style scoped>

</style>
