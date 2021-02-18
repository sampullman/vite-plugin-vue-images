<h2 align='center'>vite-plugin-vue-images</h2>

<p align='center'>Auto import images for Vite+Vue projects</p>

<p align='center'>
<a href='https://www.npmjs.com/package/vite-plugin-vue-images'>
  <img src='https://img.shields.io/npm/v/vite-plugin-vue-images?color=222&style=flat-square'>
</a>
</p>

<br>

## Usage

> **Only works with Vite 2 & Vue 3.**

Install

```bash
npm i vite-plugin-vue-images -D
```

Add to `vite.config.js`

```ts
// vite.config.js
import Vue from '@vitejs/plugin-vue'
import ViteImages from 'vite-plugin-vue-images'

export default {
  plugins: [
    Vue(),
    ViteImages()
  ],
};
```

Use images in templates without `import`-ing and exposing via `data`. Image names are converted to PascalCase. Duplicate image names are not
supported at this time.

The plugin will convert this:

```vue
<template>
<img :src="Image1" />
</template>

<script>
export default {
  name: 'app',
};
</script>
```

into this:

```vue
<template>
<img :src="TestImage1" />
</template>

<script>
import TestImage1 from '/src/assets/img/test_image1.vue'

export default {
  name: 'App',
  data() {
    return {
      TestImage1,
    };
  },
};
</script>
```

## Configuration

Default configuration values:

```ts
ViteImages({
  // Relative paths of image search directories
  dirs: ['src/assets/img'],

  // valid image extensions
  extensions: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
});
```

## Example

See the `example` directory.

## Thanks

Thanks to [@antfu](https://github.com/antfu) and [@brattonross](https://github.com/brattonross). This project is inspired by
[vite-olugin-components](https://github.com/antfu/vite-plugin-components), which is in turn inspired by [vite-plugin-voie](https://github.com/vamplate/vite-plugin-voie).

## License

MIT License © 2021 [Samuel Pullman](https://github.com/sampullman)
