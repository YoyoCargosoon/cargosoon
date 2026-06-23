<script setup>
import { computed, reactive, ref } from 'vue'
import { addInternalMessage, readAdminState, replyInternalMessage } from '@/services/adminRepository'

const state = readAdminState()
const keyword = ref('')
const topicFilter = ref('all')
const teamFilter = ref('all')
const replyDrafts = reactive({})

const form = reactive({
  author: 'Raymond',
  team: '报价运营',
  topic: '内部同步',
  content: '',
})

const fallbackMessages = [
  {
    id: 'msg-1',
    author: 'Raymond',
    team: '报价运营',
    content: 'YTHQ 新一周报价已导入，Matson 渠道映射已经核对完成。',
    topic: '价格更新',
    createdAt: '2026-06-22 10:30',
    replies: [],
  },
  {
    id: 'msg-2',
    author: 'Sanny',
    team: '客服',
    content: '今天客户反馈里，Dallas 的 DDP 价格问题重复出现两次，建议优先排查。',
    topic: '客户反馈',
    createdAt: '2026-06-22 14:20',
    replies: [
      {
        id: 'reply-1',
        author: 'Raymond',
        content: '我这边今天下午复核这条线路，先确认价格底座。',
        createdAt: '2026-06-22 14:40',
      },
    ],
  },
  {
    id: 'msg-3',
    author: 'Ava Chen',
    team: '管理层',
    content: '请明早前汇总本周高频反馈、订单转化和价格异常，提交给上级。',
    topic: '管理要求',
    createdAt: '2026-06-22 18:00',
    replies: [],
  },
]

const sourceMessages = computed(() => state.internalMessages || fallbackMessages)

const messages = computed(() =>
  sourceMessages.value
    .filter((item) => (topicFilter.value === 'all' ? true : item.topic === topicFilter.value))
    .filter((item) => (teamFilter.value === 'all' ? true : item.team === teamFilter.value))
    .filter((item) => {
      const query = keyword.value.trim().toLowerCase()
      if (!query) return true
      return [item.author, item.team, item.content, item.topic].some((value) =>
        String(value).toLowerCase().includes(query),
      )
    }),
)

const submitMessage = () => {
  if (!form.content.trim()) {
    return
  }

  addInternalMessage({
    author: form.author,
    team: form.team,
    topic: form.topic,
    content: form.content.trim(),
    replies: [],
  })

  form.content = ''
}

const submitReply = (messageId) => {
  const content = String(replyDrafts[messageId] || '').trim()
  if (!content) {
    return
  }

  replyInternalMessage({
    messageId,
    author: '当前成员',
    content,
  })

  replyDrafts[messageId] = ''
}
</script>

<template>
  <section class="admin-page">
    <article class="admin-panel">
      <div class="admin-section-head">
        <div>
          <span class="admin-kicker">内部沟通</span>
          <h3>团队内部反馈沟通墙</h3>
        </div>
        <p>这里集中展示内部成员的同步消息、排查进展和管理要求，大家都能看到最新沟通内容，也可以直接回复跟进。</p>
      </div>

      <div class="admin-toolbar">
        <input v-model="keyword" class="admin-input" placeholder="搜索人员、主题或沟通内容" />
        <select v-model="teamFilter" class="admin-select">
          <option value="all">全部部门</option>
          <option value="报价运营">报价运营</option>
          <option value="客服">客服</option>
          <option value="管理层">管理层</option>
        </select>
        <select v-model="topicFilter" class="admin-select">
          <option value="all">全部主题</option>
          <option value="价格更新">价格更新</option>
          <option value="客户反馈">客户反馈</option>
          <option value="管理要求">管理要求</option>
          <option value="内部同步">内部同步</option>
        </select>
      </div>

      <div class="admin-compose">
        <input v-model="form.author" class="admin-input" placeholder="发送人" />
        <select v-model="form.team" class="admin-select">
          <option value="报价运营">报价运营</option>
          <option value="客服">客服</option>
          <option value="管理层">管理层</option>
        </select>
        <select v-model="form.topic" class="admin-select">
          <option value="内部同步">内部同步</option>
          <option value="价格更新">价格更新</option>
          <option value="客户反馈">客户反馈</option>
          <option value="管理要求">管理要求</option>
        </select>
        <textarea
          v-model="form.content"
          class="admin-textarea"
          placeholder="输入要同步给团队的内部信息"
        ></textarea>
        <div class="admin-compose-actions">
          <button type="button" class="admin-post-btn" @click="submitMessage">发布消息</button>
        </div>
      </div>

      <div class="admin-list">
        <div v-for="item in messages" :key="item.id" class="admin-row admin-row--thread">
          <div class="admin-row-left">
            <strong class="admin-row-title">{{ item.author }}｜{{ item.topic }}</strong>
            <span class="admin-row-meta">{{ item.team }} | {{ item.createdAt }}</span>
            <p class="admin-caption">{{ item.content }}</p>

            <div v-if="item.replies?.length" class="admin-reply-list">
              <div v-for="reply in item.replies" :key="reply.id" class="admin-reply-item">
                <strong>{{ reply.author }}</strong>
                <span>{{ reply.createdAt }}</span>
                <p>{{ reply.content }}</p>
              </div>
            </div>

            <div class="admin-reply-box">
              <input
                v-model="replyDrafts[item.id]"
                class="admin-input"
                placeholder="回复这条内部沟通"
              />
              <button type="button" class="admin-post-btn admin-post-btn--small" @click="submitReply(item.id)">
                回复
              </button>
            </div>
          </div>
          <div class="admin-row-right">
            <div class="admin-chip-row">
              <span class="admin-chip is-info">{{ item.team }}</span>
              <span class="admin-chip">{{ item.topic }}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>
