<template>
  <router-view></router-view>
</template>

<script setup>
// 导入全局样式
import { RouterView } from 'vue-router';
import './assets/styles/global.css';
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  height: 100%;
}
</style> 