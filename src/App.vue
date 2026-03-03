<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden; /* 防止出现滚动条 */
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh; /* 确保应用占满整个视口高度 */
}
</style>