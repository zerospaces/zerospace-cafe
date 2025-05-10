<template>
  <div class="vp-doc layout beforeDocs">
    <div class="textArea">
      <img
        v-if="frontmatter.image"
        class="image"
        :src="`${frontmatter.image}`"
      />
      <p class="time">Published on {{ formatDate(frontmatter.date) }}</p>
      <h1 class="title">
        {{ frontmatter.title
        }}<sup v-if="frontmatter.lang != 'en-US'"
          ><badge v-if="frontmatter.lang">{{ frontmatter.lang }}</badge></sup
        >
      </h1>
      <p class="desc">{{ frontmatter.desc }}</p>
      <div class="author-info" v-if="frontmatter.author">
        <img
          v-if="authorData.avatar"
          class="author-avatar"
          :src="`https://wsrv.nl/?url=${authorData.avatar}&w=24&h=24&mask=circle`"
          :alt="frontmatter.author"
        />
        <a
          class="author-name"
          :href="`https://github.com/${frontmatter.author}`"
          target="_blank"
        >
          {{ authorData.name || frontmatter.author }}
        </a>
      </div>
      <div v-if="frontmatter.translator" class="translator">
        <blockquote
          style="
            margin-top: 20px;
            background-color: var(--vp-c-bg-alt);
            border: 1px solid var(--vp-c-divider);
            border-radius:var(--vp-border-radius-2);
            padding: 10px 15px 10px 15px;
          "
        >
          This page has been translated by <strong>{{ frontmatter.translator }}</strong>, please be cautious when reading.
        </blockquote>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useData } from "vitepress";

const { page } = useData();
const frontmatter = page.value.frontmatter;
const authorData = ref({});

const getGitHubUser = async (username) => {
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
  if (frontmatter.author) {
    authorData.value = await getGitHubUser(frontmatter.author);
  }
});

function formatDate(raw) {
  const date = new Date(raw);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>

<style scoped>
.author-info {
  display: flex;
  align-items: center;
  margin-top: 14px;
  gap: 8px;
}

.author-avatar {
  width: 22px;
  height: 22px;
  border-radius: 100%;
}

.author-name {
  color: var(--vp-c-text-3);
  font-size: 15px;
  text-decoration: none;
  transition: color 0.2s;
}

.author-name:hover {
  color: var(--vp-c-brand-1);
}

.layout:has(.image) .textArea {
  margin-top: 20px;
}

.layout:not(:has(.image)) .textArea {
  margin-top: 100px;
}

div.vp-doc.layout.beforeDocs {
  /* 提高文字区域的空间 */
  .textArea {
    margin-bottom: 70px;
  }

  /* image */
  .image {
    border: 1px solid var(--vp-c-divider);
    height: 350px;
    width: 100%;
    object-fit: cover;
    margin-bottom: 40px;
    border-radius: var(--vp-border-radius-1);
  }

  /* Time */
  p.time {
    color: var(--vp-c-gutter);
    font-weight: 500;
    margin-bottom: 7px;
  }

  /* Descriptions */
  p.desc {
    margin: 7px 0 0 0;
    color: var(--vp-c-text-3);
    font-weight: 500;
  }
}
</style>
