<template>
<div class="vite-plugin-vue-images-test">
  <div>
    <img :src="Test">
    <img v-bind:src="TestFolder">
    <img :src="DeepTestFolder">
    <img :src="TestCustom">
    <TestProps :iconSrc="TestCustom" />
  </div>
  <div>
    <img
      v-for="name in [Test, DeepTestFolder, TestCustom]"
      :key="name"
      :src="name"
    >
  </div>
</div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import TestProps from './TestProps.vue';

export default defineComponent({
  components: {
    TestProps,
  },
});
</script>