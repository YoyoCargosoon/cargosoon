import { ref } from 'vue'
import MarkdownIt from 'markdown-it'
import { useNoticeStore } from '@/stores/notice'
import { getLocal, removeLocal } from '@/utils/common'

const WS_URL = 'wss://chat.co-logistics.cn/wss'
const MAX_RECONNECT_DELAY = 30000

export function useWebSocket() {
  const noticeInfo = useNoticeStore()

  let ws = null
  let reconnectTimer = null
  let reconnectDelay = 1000
  let destroyed = false

  // user context set at connect time
  let _userInfo = {}
  let _ruleForm = {}
  let _manageNologin = {}

  // reactive state
  const chatList = ref([])
  const entering = ref(false)
  const manageAI = ref(false)
  const waitingAI = ref(false)
  const connected = ref(false)
  const nologinHello = ref([])
  const guessList = ref([]) // msg_type 15: suggested questions ("猜你想问")
  const manage = ref({ id: '', image_url: '', englishname: '', whatsappp: '', service_email: '' })

  let banEnter = false
  let aiEnter = false
  let waitingTime = null

  // safe send: only sends when connection is open
  const send = (message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
      return true
    }
    return false
  }

  const _scheduleReconnect = () => {
    if (destroyed) return
    clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(() => {
      if (!destroyed) _createWs()
    }, reconnectDelay)
    // exponential backoff, capped at MAX_RECONNECT_DELAY
    reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY)
  }

  const _nologinMessage = () => {
    const code = getLocal('invitation_codes')
    send({
      type: 'no_login_init',
      sys: _ruleForm.sys,
      browser: _ruleForm.browser,
      machine: _ruleForm.machine,
      from_user_id: _ruleForm.id,
      code: code,
      manage: _manageNologin,
      order_state: _userInfo.token,
    })
    removeLocal('invitation_codes')
  }

  const _onOpen = () => {
    // reset backoff on successful connect
    connected.value = true
    reconnectDelay = 1000
    if (_userInfo.token) {
      send({
        type: 'init',
        from_user_id: _userInfo.id,
        service_type: 1,
        status: '',
        order_state: _userInfo.token,
        client_source: 1,
      })
    } else {
      _nologinMessage()
    }
  }

  const _onClose = () => {
    connected.value = false
    _scheduleReconnect()
  }

  const _onError = () => {
    connected.value = false
    // onerror is always followed by onclose, so just ensure ws is closed
    if (ws && ws.readyState !== WebSocket.CLOSED) {
      ws.close()
    }
  }

  const _parseMsg = (raw) => {
    const dt = new Date()
    const times = dt.getTime()
    const markdownIt = new MarkdownIt()
    const data = JSON.parse(raw)

    if (data.type === 'init' || data.type === 'chat_msg_list' || data.type === 'no_login_init') {
      if (data.type === 'init') {
        noticeInfo.setList(data.notice_list)
        noticeInfo.setNum(data.no_notice_read)
        if (data.mode === 2) manageAI.value = true
      }
      if (data.type === 'no_login_init') {
        manage.value = {
          id: data.manage_row.id,
          image_url: data.manage_row.image_url,
          englishname: data.manage_row.englishname,
          service_email: data.manage_row.service_email,
          whatsappp: data.manage_row.whatsappp,
        }
      }

      const list = data.message_list
      for (let n = 0; n < list.length; n++) {
        list[n].head_img = list[n].head_img + '?v=' + times
        if (list[n].msg_type === 3 || list[n].msg_type === 4) {
          list[n].msg = JSON.parse(list[n].msg)
        }
        if (list[n].msg_type === 5) {
          nologinHello.value = list[n].msg.split(',')
        }
        if (list[n].msg_type === 11 || list[n].msg_type === 12) {
          list[n].msg = JSON.parse(list[n].msg)
          list[n].msg_state = Array.isArray(list[n].msg) ? 0 : 1
        }
        if (list[n].msg_type === 13) {
          list[n].msg = markdownIt.render(list[n].msg)
        }
        if (list[n].msg_type === 14) {
          list[n].msgx = JSON.parse(list[n].msg)
          list[n].msgx.price_us = (Number(list[n].msgx.min_price) / 6).toFixed(2)
        }
        if (list[n].msg_type === 15) {
          try { guessList.value = JSON.parse(list[n].msg) } catch (e) { /* ignore */ }
        }
        if (list[n].msg_type === 21 || list[n].msg_type === 22) {
          let m = JSON.parse(list[n].msg)
          if (typeof m === 'string') m = JSON.parse(m)
          list[n].inquiry = {
            message: m.content,
            file: m.files,
            ...(list[n].msg_type === 22 ? { whatsapp: m.whatsapp, email: m.email } : {}),
          }
        }
      }
      chatList.value = list
      return
    }

    // msg_type 15: suggested questions ("猜你想问") — not a chat bubble
    if (data.type === 'chat_msg' && data.msg_type === 15) {
      try { guessList.value = JSON.parse(data.msg) } catch (e) { /* ignore */ }
      return
    }

    if (data.type === 'chat_msg' && data.msg_type !== 13) {
      const a = {
        date_entered: data.date_entered,
        head_img: data.head_img + '?v=' + times,
        is_me: data.is_me,
        is_read: data.is_read,
        msg: data.msg,
        nickname: data.nickname,
        msg_type: data.msg_type,
      }
      if (data.msg_type === 3 || data.msg_type === 4) a.msg = JSON.parse(data.msg)
      if (data.msg_type === 2) a.file_name = data.file_name
      if (data.msg_type === 11 || data.msg_type === 12) {
        a.msg = JSON.parse(data.msg)
        a.msg_state = Array.isArray(a.msg) ? 0 : 1
      }
      chatList.value.push(a)

      if (manageAI.value && data.is_me === 1) {
        waitingTime = setInterval(() => { waitingAI.value = true }, 5000)
      }
      if (data.is_me === 0) {
        banEnter = false
        clearInterval(waitingTime)
        waitingAI.value = false
      }
      return
    }

    if (data.type === 'chat_msg_entering') { entering.value = true; return }
    if (data.type === 'chat_msg_cancel_entering') { entering.value = false; return }

    if (data.type === 'is_read') {
      send({
        type: 'chat_msg_list',
        from_user_id: _userInfo.id,
        from_service_id: _userInfo.manage.id,
        service_type: 1,
        order_state: _userInfo.token,
      })
      return
    }

    // AI streaming (msg_type 13)
    if (data.msg_type === 13) {
      clearInterval(waitingTime)
      waitingAI.value = false
      const a = {
        head_img: data.head_img + '?v=' + times,
        is_me: data.is_me,
        msg: data.msg,
        nickname: data.nickname,
        msg_type: data.msg_type,
      }
      if (!aiEnter) {
        chatList.value.push(a)
      } else if (data.msg !== '[DONE]') {
        const last = chatList.value[chatList.value.length - 1]
        last.msg = markdownIt.renderInline(last.msg + data.msg)
      }

      if (data.msg !== '[DONE]') {
        aiEnter = true
      } else {
        aiEnter = false
        const last = chatList.value[chatList.value.length - 1]
        last.msg = markdownIt.render(last.msg)
        banEnter = false
      }
    }
  }

  const _onMessage = (e) => {
    try {
      _parseMsg(e.data)
    } catch (err) {
      console.error('[WS] message parse error', err)
    }
  }

  const _createWs = () => {
    // detach old handlers before replacing
    if (ws) {
      ws.onopen = ws.onclose = ws.onmessage = ws.onerror = null
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close()
      }
    }
    ws = new WebSocket(WS_URL)
    ws.onopen = _onOpen
    ws.onclose = _onClose
    ws.onmessage = _onMessage
    ws.onerror = _onError
  }

  // --- public API ---

  const connect = (userInfo, ruleForm = {}, manageNologin = {}) => {
    destroyed = false
    _userInfo = userInfo
    _ruleForm = ruleForm
    _manageNologin = manageNologin
    clearTimeout(reconnectTimer)
    reconnectDelay = 1000
    _createWs()
  }

  const disconnect = () => {
    destroyed = true
    clearTimeout(reconnectTimer)
    clearInterval(waitingTime)
    if (ws) {
      ws.onopen = ws.onclose = ws.onmessage = ws.onerror = null
      ws.close()
      ws = null
    }
    connected.value = false
  }

  const sendChatMsg = (msg, userInfo) => {
    const info = userInfo || _userInfo
    return send({
      type: 'chat_msg',
      from_user_id: info.id,
      from_service_id: info.manage.id,
      service_type: 1,
      msg_type: 0,
      msg,
      order_state: info.token,
      msg_source_type: 'app',
      client_source: 1,
    })
  }

  const sendEntering = () => {
    send({
      type: 'chat_msg_entering',
      from_user_id: _userInfo.id,
      service_type: 1,
      order_state: _userInfo.token,
    })
  }

  const sendCancelEntering = () => {
    send({
      type: 'chat_msg_cancel_entering',
      from_user_id: _userInfo.id,
      service_type: 1,
      order_state: _userInfo.token,
    })
  }

  const requestMsgList = () => {
    send({
      type: 'chat_msg_list',
      from_user_id: _userInfo.id,
      from_service_id: _userInfo.manage.id,
      service_type: 1,
      order_state: _userInfo.token,
    })
  }

  const sendFile = (type, url, extra = {}) => {
    if (type === 1) {
      send({
        type: 'chat_msg',
        from_user_id: _userInfo.id,
        from_service_id: _userInfo.manage.id,
        service_type: 1,
        msg_type: 1,
        msg: url,
        order_state: _userInfo.token,
        client_source: 1,
      })
    } else {
      send({
        type: 'chat_msg',
        from_user_id: _userInfo.id,
        from_service_id: _userInfo.manage.id,
        service_type: 1,
        msg_type: 2,
        msg: JSON.stringify({ image: url, ...extra }),
        order_state: _userInfo.token,
        client_source: 1,
      })
    }
  }

  const isBanEnter = () => banEnter
  const setBanEnter = (val) => { banEnter = val }

  return {
    // state
    chatList,
    entering,
    manageAI,
    waitingAI,
    connected,
    nologinHello,
    guessList,
    manage,
    // connection
    connect,
    disconnect,
    // messaging
    send,
    sendChatMsg,
    sendEntering,
    sendCancelEntering,
    requestMsgList,
    sendFile,
    isBanEnter,
    setBanEnter,
  }
}
