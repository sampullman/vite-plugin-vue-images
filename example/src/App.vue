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
      v-for="image in [
        { title: 'Test title', src: Test },
        { title: 'DeepTestFolder title', src: DeepTestFolder },
        { title: 'TestCustom title', src: TestCustom },
      ]"
      :key="image.title"
      :src="image.src"
      :title="image.title"
    >
  </div>
  <div>Mixin data workaround test: ({{ test }}, {{ testFolder }})</div>
</div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import TestProps from './TestProps.vue';
import testMixin from './testMixin';

export default defineComponent({
  mixins: [testMixin],
  components: {
    TestProps,
  },
});
</script>