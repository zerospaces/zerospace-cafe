---
layout: home
---

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const projects = ref<any[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
    loading.value = true
    try {
        // Check if cache exists and is not expired
        const cachedData = localStorage.getItem('githubData')
        const cachedTimestamp = localStorage.getItem('githubDataTimestamp')
        const oneHour = 3600000 // 1 hour in milliseconds
        
        // If cache exists and is within 1 hour, use it directly
        if (cachedData && cachedTimestamp && (Date.now() - Number(cachedTimestamp)) < oneHour) {
            projects.value = JSON.parse(cachedData)
            return
        }

        // Fetch new data
        const res = await fetch('https://api.github.com/orgs/zerospaces/repos')
        if (!res.ok) throw new Error('You can\'t access this section due to the rate limitation of the GitHub API.')
        const data = await res.json()
        
        // Get commit information
        const updatedProjects = await Promise.all(data
            .filter(repo => repo.name.toLowerCase() !== '.github')
            .map(async repo => {
                const commitsRes = await fetch(`https://api.github.com/repos/zerospaces/${repo.name}/commits?per_page=1`)
                const commits = await commitsRes.json()
                
                return {
                    ...repo,
                    name: repo.name.replace(/-/g, ' '),
                    lastCommit: commits[0]?.commit?.message,
                    committer: commits[0]?.commit?.author?.name
                }
            }))

        // Update cache
        projects.value = updatedProjects
        localStorage.setItem('githubData', JSON.stringify(updatedProjects))
        localStorage.setItem('githubDataTimestamp', Date.now().toString())
        
    } catch (e: any) {
        // If fetching new data fails, try to use old cache
        const cachedData = localStorage.getItem('githubData')
        if (cachedData) {
            projects.value = JSON.parse(cachedData)
        } else {
            error.value = e.message
        }
    } finally {
        loading.value = false
    }
})

</script>

<!--
    HTML & Markdown
-->

<div style="height: 60px;"></div>

# ☕ Menu of Coffee

<div style="height: 20px;"></div>
<div v-if="loading"></div>
<div v-else-if="error">{{ error }}</div>
<div v-else class="items">
    <div v-for="repo in projects" :key="repo.id" class="item">
        <a :href="repo.html_url" class="project">
                <img class="icon" src="https://wsrv.nl/?url=avatars.githubusercontent.com/u/208816776&v=4" />
                <a class="title" target="_blank">{{ repo.name }}</a>
                <p class="details" v-if="repo.description">{{ repo.description }}</p>
                <div v-if="repo.lastCommit" class="commit-info">
                    <small style="color: var(--vp-c-text-3)">{{ repo.lastCommit }}</small>
                    <small v-if="repo.committer" style="margin-left: 5px;color: var(--vp-c-gutter)">by {{ repo.committer }}</small>
                </div>
                <div v-else>
                    <small style="color: var(--vp-c-gutter)">No commits yet</small>
                </div>
        </a>
    </div>
</div>

<!--
    Styles
-->

<style scoped>
div.items {
    display: grid;
    grid-gap: 10px;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
}
a.project img.icon {
    margin-bottom: 20px;
    height: 48px;
    width: 48px;
    border-radius: var(--vp-border-radius-2);
}
a.project {
    height: 100%;
    padding: 24px;
    border-radius: var(--vp-border-radius-1);
    background-color: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    display: flex;
    flex-direction: column;
    padding: 24px;
    height: 100%;
    &, & * {
            text-decoration: none !important;
            transition: all .4s;
    };
}
a.project:hover {
    border-color: var(--vp-c-brand-1);
    a.title {
            color: var(--vp-c-brand-1)
    }
}
a.project a.title {
    color: var(--vp-c-text-1);
    font-family: var(--vp-font-family-mono);
    padding: 0px;
    margin: 0px;
    font-size: 22px;
    line-height: 22px;
    font-weight: 600;
    text-transform: capitalize;
}
a.project p.details {
    font-size: 14px;
    padding: 8px 0px 0px 0px;
    margin: 0px;
    color: var(--vp-c-text-2);
    font-weight: 500;
    line-height: 24px;
}

</style>
