<template>
<div class="vite-plugin-vue-images-test">
  <img :src="Test">
  <img v-bind:src="TestFolder">
  <img :src="DeepTestFolder">
  <img :src="TestCustom">
  <TestProps :iconSrc="TestCustom" />
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