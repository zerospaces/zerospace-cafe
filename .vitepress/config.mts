import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Zerospace Café",
  description: "Zerospace Development Team",
  markdown: {
    theme: {
      light: "catppuccin-latte",
      dark: "catppuccin-mocha",
    },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "https://wsrv.nl/?url=avatars.githubusercontent.com/u/208816776?s=250&v=4&mask=circle",
    nav: [
      { text: "Diary", link: "/src/cafe/diary" },
      { text: "Projects", link: "/src/cafe" },
      { text: "Contributors", link: "/src/cafe/contributors" },
    ],
    search: {
      provider: "local",
    },
    socialLinks: [{ icon: "github", link: "https://github.com/zerospaces" }],
  },
});
