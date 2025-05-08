---
layout: home
---

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const members = ref<any[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
    loading.value = true
    try {
        const cachedData = localStorage.getItem('githubMembers')
        const cachedTimestamp = localStorage.getItem('githubMembersTimestamp')
        const oneHour = 3600000
        
        if (cachedData && cachedTimestamp && (Date.now() - Number(cachedTimestamp)) < oneHour) {
            members.value = JSON.parse(cachedData)
            return
        }

        const res = await fetch('https://api.github.com/orgs/zerospaces/members')
        if (!res.ok) throw new Error('API rate limit exceeded')
        const data = await res.json()

        const memberDetails = await Promise.all(data.map(async (user: any) => {
            const userRes = await fetch(user.url)
            const userData = await userRes.json()
            return {
                id: user.id,
                name: userData.name || user.login,
                login: user.login,
                bio: userData.bio,
                avatar: user.avatar_url,
                profile: user.html_url
            }
        }))

        members.value = memberDetails
        localStorage.setItem('githubMembers', JSON.stringify(memberDetails))
        localStorage.setItem('githubMembersTimestamp', Date.now().toString())
        
    } catch (e: any) {
        const cachedData = localStorage.getItem('githubMembers')
        if (cachedData) {
            members.value = JSON.parse(cachedData)
        } else {
            error.value = e.message
        }
    } finally {
        loading.value = false
    }
})
</script>

<div style="height: 60px;"></div>

# 🪐 Contributors

<div style="height: 20px;"></div>
<div v-if="loading"></div>
<div v-else-if="error">{{ error }}</div>
<div v-else class="items">
    <div v-for="member in members" :key="member.id" class="item">
        <a :href="member.profile" class="project">
            <img class="icon" :src="member.avatar" />
        <a class="title" target="_blank">{{ member.name }}</a>
            <p class="details" v-if="member.bio">{{ member.bio }}</p>
            <div v-else>
                <small style="color: var(--vp-c-gutter)">No bio available</small>
            </div>
        </a>
    </div>
</div>

<style scoped>
.items {
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
    &, & * {
        text-decoration: none !important;
        transition: all .4s;
    }
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
