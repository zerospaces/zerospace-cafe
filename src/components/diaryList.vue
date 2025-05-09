<script setup lang="ts">
import { ref, onMounted } from "vue";
import { data as posts } from "../../.vitepress/posts.data.mts";

interface Author {
  login: string;
  avatar: string;
  name?: string;
}

const props = defineProps({
  maxItems: {
    type: Number,
    default: 0,
  },
  showAuthor: {
    type: Boolean,
    default: true,
  },
});

const articles = ref(posts);
const authorsCache = ref<Record<string, Author>>({});
const loading = ref(true);
const error = ref("");

const getGitHubUser = async (username: string) => {
  const cacheKey = `githubUser_${username}`;
  const cachedData = localStorage.getItem(cacheKey);
  const cachedTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
  const oneHour = 3600000;

  if (
    cachedData &&
    cachedTimestamp &&
    Date.now() - Number(cachedTimestamp) < oneHour
  ) {
    return JSON.parse(cachedData);
  }

  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) throw new Error("User not found");
    const data = await res.json();
    const userData = {
      login: data.login,
      avatar: data.avatar_url,
      name: data.name,
    };

    localStorage.setItem(cacheKey, JSON.stringify(userData));
    localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
    return userData;
  } catch (e) {
    return { login: username, avatar: "", name: username };
  }
};

onMounted(async () => {
  try {
    // Get unique authors
    const uniqueAuthors = [...new Set(articles.value.map((a) => a.author))];
    const authors = await Promise.all(
      uniqueAuthors.map((username) => getGitHubUser(username))
    );

    // Build author cache
    authorsCache.value = authors.reduce((acc, cur) => {
      acc[cur.login] = cur;
      return acc;
    }, {} as Record<string, Author>);

    // Apply max items limit
    if (props.maxItems > 0) {
      articles.value = articles.value.slice(0, props.maxItems);
    }
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="items">
    <div v-if="loading" class="item">
      <div class="diary skeleton">
        <div class="image-placeholder" />
        <div class="title-placeholder" />
        <div class="details-placeholder" />
      </div>
    </div>

    <div v-else-if="error" class="item">
      <div class="diary error">⚠️ {{ error }}</div>
    </div>

    <div v-else v-for="article in articles" :key="article.url" class="item">
      <a :href="article.url" class="diary">
        <img v-if="article.image" class="image" :src="`${article.image}`" />
        <div class="textPlace">
          <a class="title">{{ article.title }}</a>
          <p class="details">{{ article.desc }}</p>

          <div class="author-info">
            <template v-if="showAuthor && authorsCache[article.author]?.avatar">
              <img
                class="author-avatar"
                :src="`https://wsrv.nl/?url=${
                  authorsCache[article.author].avatar
                }&w=24&h=24&mask=circle`"
                :alt="article.author"
              />
              <small class="author-name"
                >{{ authorsCache[article.author].name || article.author
                }}<span
                  class="date"
                  style="color: var(--vp-c-gutter); margin-left: 5px"
                  >{{ article.relativeDate }}</span
                ></small
              >
            </template>
            <small v-else>{{ article.relativeDate }}</small>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<style scoped>
.items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 10px;
}

.diary {
  break-inside: avoid;
  border-radius: var(--vp-border-radius-1);
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  transition: all 0.4s;
}

.textPlace {
  padding: 30px;
}

.diary:hover {
  border-color: var(--vp-c-brand-1);
  a.title {
    color: var(--vp-c-brand-1);
  }
}

.image {
  height: 200px;
  width: 100%;
  border-top-left-radius: var(--vp-border-radius-1);
  border-top-right-radius: var(--vp-border-radius-1);
  object-fit: cover;
}

.title {
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 22px;
  line-height: 22px;
  font-weight: 600;
  margin: 0;
}

.details {
  color: var(--vp-c-text-2);
  font-size: 14px;
  margin: 8px 0 0 0;
}

.author-avatar {
  vertical-align: middle;
  display: inline-block;
  margin-right: 6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.author-name {
  color: var(--vp-c-text-3);
  line-height: 20px;
  font-size: 14px;
}

.author-info {
  margin-top: 8px;
}

/* 加载状态样式 */
.skeleton {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.image-placeholder,
.title-placeholder,
.details-placeholder {
  background-color: var(--vp-c-divider);
  border-radius: 4px;
}

.image-placeholder {
  height: 150px;
  margin-bottom: 20px;
}

.title-placeholder {
  height: 22px;
  width: 70%;
}

.details-placeholder {
  height: 14px;
  width: 90%;
  margin-top: 8px;
}
</style>
