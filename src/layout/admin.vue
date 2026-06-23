<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

const currentUser = computed(() => adminStore.currentUser)
const menus = computed(() => adminStore.allowedMenus)

const iconMap = {
  grid: '01',
  stack: '02',
  spark: '03',
  boxes: '04',
  wallet: '05',
  bubble: '06',
  users: '07',
}

const goToMenu = (routeName) => {
  router.push({ name: routeName })
}

const logout = async () => {
  await adminStore.logout()
  router.push({ name: 'admin-login' })
}
</script>

<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <div class="admin-brand">
        <span class="admin-brand-kicker">Cargosoon</span>
        <h1>运营后台</h1>
        <p>统一承接 AI、客户端页面与运营侧的数据底座。</p>
      </div>

      <nav class="admin-nav">
        <button
          v-for="item in menus"
          :key="item.routeName"
          type="button"
          class="admin-nav-item"
          :class="{ 'is-active': route.name === item.routeName }"
          @click="goToMenu(item.routeName)"
        >
          <span class="admin-nav-icon">{{ iconMap[item.icon] }}</span>
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <div class="admin-sidebar-foot">
        <div class="admin-user-card">
          <strong>{{ currentUser?.nameCn || currentUser?.name }}</strong>
          <span>{{ currentUser?.email }}</span>
        </div>
        <button type="button" class="admin-ghost-btn" @click="logout">退出登录</button>
      </div>
    </aside>

    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.admin-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 292px minmax(0, 1fr);
  background:
    radial-gradient(circle at top left, rgba(242, 106, 27, 0.12), transparent 26%),
    linear-gradient(180deg, #fff9f3 0%, #f5f7fb 46%, #edf2f8 100%);
}

.admin-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 28px 22px;
  background:
    radial-gradient(circle at top right, rgba(242, 106, 27, 0.18), transparent 26%),
    linear-gradient(180deg, #10284f 0%, #122d59 52%, #142643 100%);
  color: #f5f7fb;
}

.admin-brand-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  background: rgba(255, 255, 255, 0.12);
  color: #ffd7ba;
}

.admin-brand h1 {
  margin: 14px 0 10px;
  font-size: 30px;
  font-weight: 800;
}

.admin-brand p {
  margin: 0;
  color: rgba(245, 247, 251, 0.74);
  line-height: 1.7;
  font-size: 14px;
}

.admin-nav {
  display: grid;
  gap: 10px;
}

.admin-nav-item,
.admin-ghost-btn {
  border: 0;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
}

.admin-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 50px;
  padding: 0 14px;
  border-radius: 18px;
  background: transparent;
  color: rgba(245, 247, 251, 0.86);
  font-size: 14px;
  font-weight: 700;
  text-align: left;
}

.admin-nav-item:hover,
.admin-nav-item.is-active {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  transform: translateX(2px);
}

.admin-nav-icon {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffd2b2;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.06em;
}

.admin-sidebar-foot {
  margin-top: auto;
  display: grid;
  gap: 14px;
}

.admin-user-card {
  display: grid;
  gap: 6px;
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
}

.admin-user-card span {
  color: rgba(245, 247, 251, 0.7);
  font-size: 13px;
}

.admin-ghost-btn {
  min-height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f7853a 0%, #f26a1b 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 16px 30px rgba(242, 106, 27, 0.22);
}

.admin-main {
  min-width: 0;
  padding: 24px;
}

@media (max-width: 1080px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }

  .admin-sidebar {
    padding-bottom: 18px;
  }

  .admin-nav {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}

@media (max-width: 720px) {
  .admin-main {
    padding: 16px;
  }
}
</style>
