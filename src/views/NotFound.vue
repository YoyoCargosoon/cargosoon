<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Page not found</p>
    <router-link to="/" class="home-link">Go back home</router-link>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.not-found h1 {
  font-size: 6rem;
  margin-bottom: 1rem;
  color: #333;
}

.not-found p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: #666;
}

.home-link {
  padding: 0.75rem 2rem;
  background-color: #409eff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.home-link:hover {
  background-color: #66b1ff;
}

@media (min-width: 1024px) {
  .not-found {
    min-height: 100vh;
  }
}
</style>
