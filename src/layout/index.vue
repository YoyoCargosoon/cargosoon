<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import Notice from './components/notice.vue'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { getLocal } from '@/utils/common'
import LoadingVue from '@/components/common/loading.vue'
import { useLoadingStore } from '@/stores/loading'
import router from '@/router/index.js'

const activeIndex2 = ref('/new/')
const input = ref('')
const superLevel = ref('')
const userName = ref('')
const istoken = ref(false)
const userImg = ref('')
const showPrice = ref(true)
const loadingStore = useLoadingStore()

if (process.env.NODE_ENV == 'production') {
  showPrice.value = true
}

if (getLocal('TOKEN')) {
  istoken.value = true
  const userInfo = JSON.parse(getLocal('userInfo'))
  userName.value = userInfo.first_name + ' ' + userInfo.last_name
  superLevel.value = userInfo.super_level

  if (process.env.NODE_ENV != 'production') {
    if (userInfo.price_status == 1) {
      // 1展示查价，0不展示
      showPrice.value = true
    } else {
      showPrice.value = false
    }
  }
} else {
  istoken.value = false
}

const logout = () => {
  localStorage.removeItem('loginto')
  // this.$router.push('/login')
  window.location.href = '/login'
  window.localStorage.clear()
}

const handleSelect = (key, keyPath) => {
  activeIndex2.value = key
  if (key == '/login') {
    logout()
    window.location.href = key
    return
  }else if (key == '0') {
    activeIndex2.value = '/new/'
    router.push('/new/')
  }else {
    window.location.href = key
  }
  
}

const toDrops = () => {
  if(getLocal('TOKEN')){
    let infos = getLocal('userInfo')
    let manages = getLocal('customer_manage')
    let tokens = getLocal('TOKEN')
    document.cookie=`userInfo=${infos};domain=.codropshipping.com;path=/;samesite:none`
    document.cookie=`customer_manage=${manages};domain=.codropshipping.com;path=/;samesite:none`
    document.cookie=`TOKEN=${tokens};domain=.codropshipping.com;path=/;samesite:none`
  }
}

const goCodrop = () => {
  // await toDrops()
  window.open('https://codropshipping.com/', '_blank')
}

const goLogin = () => {
  window.location.href = '/login'
}

const goSignUp = () => {
  window.location.href = '/signUp'
}

if (getLocal('TOKEN')) {
  let userInfo = JSON.parse(getLocal('userInfo'))
  let dt = new Date()
  userImg.value = userInfo.img + userInfo.id + '_40_40.png?v=' + dt.getTime()
  userName.value = userInfo.first_name + ' ' + userInfo.last_name
}
</script>


<template>
  <div class="relative">
    <el-menu
      :default-active="activeIndex2"
      class="el-menu-demo"
      mode="horizontal"
      background-color="#112f66"
      text-color="#fff"
      active-text-color="#e58d36"
      @select="handleSelect"
    >
      <el-menu-item index="0">
        <div class="flex ml-6 items-center">
        <a
          class="flex items-center"
          href="/"
          target="_blank"
        >
          <img
            src="@/assets/logo/co-logistics.png"
            class="h-10"
            alt=""
            v-if="window?.location.host=='app.cargosoon.com'"
          />

          <div
            v-else
            class="flex items-center"
          >
            <img
              src="@/assets/logo/cargosoonLogo1.png"
              class="h-8 mr-1 hidden sm:block"
              alt=""
            />
            <img
              src="@/assets/logo/cargosoonLogo2.png"
              class="h-6"
              alt=""
            />
          </div>
        </a>

        <div class="mx-3 w-3xs">
          <el-input
            v-model="input"
            placeholder="Please input"
            :prefix-icon="Search"
          />
        </div>
      </div>
      </el-menu-item>
      
      <el-menu-item index="/new/">Home</el-menu-item>
      <el-sub-menu index="2">
        <template #title>Quote</template>
        <!-- <el-menu-item index="/main/booking">DDP/DDU Freight</el-menu-item> -->
        <el-menu-item index="/main/pricelist">FCL/DDP freight</el-menu-item>
        <el-menu-item index="/order/shippingOrder">Order</el-menu-item>
        <el-menu-item index="/order/tracking">Tracking</el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="3">
        <template #title>Warehouse</template>
        <el-menu-item index="/warehouse/SKUManagement">Product</el-menu-item>
        <el-menu-item index="/warehouse/PreloadManagement">Box</el-menu-item>
        <el-menu-item index="/warehouse/Apply">Apply</el-menu-item>
        <el-menu-item index="/warehouse/InventoryStatistics">Inventory</el-menu-item>
        <el-menu-item index="/warehouse/CargoManagements">Transfer inventory</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="4">
        <template #title>DropShipping</template>
        <!-- <el-menu-item index="codropshipping">CoDropshipping</el-menu-item> -->
        <div
          class="meun-item"
          @click="goCodrop"
        >CoDropshipping</div>
        <el-menu-item index="/account/Shopify">Store</el-menu-item>
        <el-menu-item index="/account/storeOrder">Store Order</el-menu-item>
      </el-sub-menu>
      <el-menu-item index="/account/Bill">Billing</el-menu-item>
      <el-menu-item index="/aboutUs">About Us</el-menu-item>

      <div class="flex items-center absolute right-10  h-full">
        <div
          v-if="istoken"
          class="flex items-center"
        >
          <Notice></Notice>
          <el-sub-menu index="5">
            <template #title>
              <div class="p-1 flex items-center">
                <div class="relative">
                  <img
                    :src="userImg"
                    class="mr-1 sm:mr-4 w-10 h-10 rounded-full"
                    alt=""
                  />
                  <img
                    v-if="superLevel == 'L1'"
                    src="@/assets/logo/lv1.png"
                    class="absolute right-0 -bottom-1.5 w-7"
                    alt=""
                  >
                  <img
                    v-if="superLevel == 'L2'"
                    src="@/assets/logo/lv2.png"
                    class="absolute right-0 -bottom-1.5 w-7"
                    alt=""
                  >
                </div>
                <div class="max-w-200 overflow-hidden whitespace-nowrap overflow-ellipsis">{{userName}}</div>
              </div>
            </template>
            <el-menu-item index="/account/wallet">Wallet</el-menu-item>
            <el-menu-item index="/accountnav">Account</el-menu-item>
            <el-menu-item index="/main/issus">Feedback</el-menu-item>
            <el-menu-item index="/main/assessment">Assessment</el-menu-item>
            <el-menu-item index="/main/FBAwarehouse">FBA Warehouse Address</el-menu-item>
            <el-menu-item index="/login">Logout</el-menu-item>
          </el-sub-menu>
        </div>

        <div
          v-else
          class="mr-8"
        >
          <button
            class="text-sm px-3 py-0.5 rounded bg-orange hover:bg-orange1 text-white"
            @click="goLogin"
          >Log in</button>
          <button
            class="ml-3 text-sm px-3 py-0.5 rounded bg-orange hover:bg-orange1 text-white"
            @click="goSignUp"
          >Sign up</button>
        </div>
      </div>
    </el-menu>

    <LoadingVue v-show="loadingStore.showLoading"></LoadingVue>
  </div>
</template>

<style scoped>
.meun-item {
  height: 36px;
  line-height: 36px;
  padding: 0 10px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}
.meun-item:hover {
  outline: 0;
  background-color: rgb(14, 38, 82);
}
</style>