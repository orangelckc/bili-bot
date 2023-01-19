<script setup lang="ts">
import { onMounted } from 'vue';
import { initStore } from './store';


onMounted( () => {
  // 初始化 store 数据
  initStore();
});
</script>

<template>
</template>

<style scoped>

</style>
