// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import "@catppuccin/vitepress/theme/mocha/lavender.css";
import BeforeDocs from "../../src/components/beforeDocs.vue";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      'doc-before': () => h(BeforeDocs)
    })
  },
  enhanceApp({ app, router, siteData }) {
  }
} satisfies Theme
