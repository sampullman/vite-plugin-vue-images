import { UserConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';
import ViteImages from 'vite-plugin-vue-images';

const config: UserConfig = {
  plugins: [
    Vue(),
    ViteImages({
      dirs: ['src/assets/img', 'src/static/img'],
      customResolvers: [
        (name: string) => {
          if(name === 'TestCustomResolver') {
            return '/src/assets/test_custom.png';
          }
        },
      ],
    }),
  ],
};

export default config;
