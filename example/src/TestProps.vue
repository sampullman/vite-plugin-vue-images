<template>
<img :src="iconSrc">
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    iconSrc: {
      type: String,
      required: true
    },
  },
});
</script>