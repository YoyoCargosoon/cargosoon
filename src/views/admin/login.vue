<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

const form = reactive({
  account: 'raymond.zhong@co-logistics.com',
  password: 'AI18688960755',
})

const errorMessage = ref('')
const isSubmitting = ref(false)

const submit = async () => {
  isSubmitting.value = true
  const result = await adminStore.login(form)
  isSubmitting.value = false

  if (!result.ok) {
    errorMessage.value = result.message
    return
  }

  errorMessage.value = ''
  const redirectPath = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  if (redirectPath) {
    router.push(redirectPath)
    return
  }

  router.push({ name: 'admin-dashboard' })
}
</script>

<template>
  <div class="admin-login-page">
    <section class="admin-login-card">
      <div class="admin-login-copy">
        <span class="admin-login-kicker">后台入口</span>
        <h1>登录统一客户运营后台</h1>
        <p>
          该后台用于价格库、查价、订单、充值、反馈、客户行为和内部协同管理，
          与客户端共用同一套业务底座与同步数据。
        </p>
        <ul>
          <li>AI 助手与对应业务页面共用同一套价格底座</li>
          <li>查价、订单、充值、反馈、行为数据统一汇总</li>
          <li>客户端与后台之间支持实时或准实时同步</li>
        </ul>
      </div>

      <form class="admin-login-form" @submit.prevent="submit">
        <div class="admin-login-field">
          <label for="admin-account">工作邮箱</label>
          <input id="admin-account" v-model="form.account" type="text" autocomplete="username" />
        </div>

        <div class="admin-login-field">
          <label for="admin-password">密码</label>
          <input
            id="admin-password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
          />
        </div>

        <p v-if="errorMessage" class="admin-login-error">{{ errorMessage }}</p>

        <button type="submit" class="admin-login-btn" :disabled="isSubmitting">
          {{ isSubmitting ? '登录中...' : '进入后台' }}
        </button>

        <p class="admin-login-hint">默认密码格式：`AI + 该同事手机号`</p>
      </form>
    </section>
  </div>
</template>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(17, 47, 102, 0.18), transparent 30%),
    radial-gradient(circle at bottom right, rgba(242, 106, 27, 0.18), transparent 26%),
    linear-gradient(135deg, #fff8f2 0%, #eff4fb 100%);
}

.admin-login-card {
  width: min(1080px, 100%);
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.92fr);
  overflow: hidden;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 28px 70px rgba(17, 47, 102, 0.14);
}

.admin-login-copy,
.admin-login-form {
  padding: 44px;
}

.admin-login-copy {
  background: linear-gradient(180deg, #112f66 0%, #183a73 100%);
  color: #ffffff;
}

.admin-login-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: #ffd8bf;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.admin-login-copy h1 {
  margin: 18px 0 14px;
  font-size: 42px;
  line-height: 1.05;
  font-weight: 800;
}

.admin-login-copy p,
.admin-login-copy li {
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.7;
  font-size: 15px;
}

.admin-login-copy ul {
  margin: 24px 0 0;
  padding-left: 18px;
}

.admin-login-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
}

.admin-login-field {
  display: grid;
  gap: 8px;
}

.admin-login-field label {
  color: #243047;
  font-size: 13px;
  font-weight: 700;
}

.admin-login-field input {
  height: 50px;
  border: 1px solid #dae3f0;
  border-radius: 14px;
  padding: 0 14px;
  font-size: 14px;
  color: #20242d;
  outline: 0;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.admin-login-field input:focus {
  border-color: #f26a1b;
  box-shadow: 0 0 0 3px rgba(242, 106, 27, 0.12);
}

.admin-login-btn {
  height: 52px;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, #f7853a 0%, #f26a1b 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}

.admin-login-btn:disabled {
  opacity: 0.72;
  cursor: wait;
}

.admin-login-error,
.admin-login-hint {
  margin: 0;
  font-size: 13px;
}

.admin-login-error {
  color: #c0392b;
}

.admin-login-hint {
  color: #6f7b90;
}

@media (max-width: 860px) {
  .admin-login-card {
    grid-template-columns: 1fr;
  }

  .admin-login-copy,
  .admin-login-form {
    padding: 28px 24px;
  }

  .admin-login-copy h1 {
    font-size: 34px;
  }
}
</style>
