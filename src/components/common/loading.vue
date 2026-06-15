<script setup>
</script>

<template>
  <div class="page-loading">
    <div class="loading">
      <span>c</span>
      <span>a</span>
      <span>r</span>
      <span>g</span>
      <span>o</span>
      <span>s</span>
      <span>o</span>
      <span>o</span>
      <span>n</span>
    </div>
  </div>
</template>

<style scoped>
.loading {
  font-size: 48px;
  font-weight: bold;
  color: #ff9900;
  display: flex;
}

.loading span {
  margin: 0 2px;
  animation: jumpAnimation 0.3s infinite alternate;
}
.loading span:nth-child(1) {
  animation-delay: 0s;
}
.loading span:nth-child(2) {
  animation-delay: 0.1s;
}
.loading span:nth-child(3) {
  animation-delay: 0.2s;
}
.loading span:nth-child(4) {
  animation-delay: 0.3s;
}
.loading span:nth-child(5) {
  animation-delay: 0s;
}
.loading span:nth-child(6) {
  animation-delay: 0.1s;
}
.loading span:nth-child(7) {
  animation-delay: 0.2s;
}
.loading span:nth-child(8) {
  animation-delay: 0.3s;
}
.loading span:nth-child(9) {
  animation-delay: 0.4s;
}
.loading span:nth-child(10) {
  animation-delay: 0.3s;
}
.loading span:nth-child(11) {
  animation-delay: 0.4s;
}
.loading span:nth-child(12) {
  animation-delay: 0.5s;
}

@keyframes jumpAnimation {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-20px);
  }
}
.page-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.page-loading-dear {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #222646;
  opacity: 0.7;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
</style>
