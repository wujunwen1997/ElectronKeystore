<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <button @click="onclicks">Test</button>
    <button @click="onQueryclicks">Query</button>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
const { ipcRenderer } =  window.require('electron');

ipcRenderer.on("add-item-result", function (event, arg) {
  console.log("add-item-result", arg);
});

ipcRenderer.on("query-all-item-result", function (event, arg) {
  console.log("query-all-item-result", arg);
});

export default {
  name: 'app',
  components: {
    HelloWorld
  },
  methods: {
    onclicks () {
      ipcRenderer.send("add-item");
    },
    onQueryclicks () {
      ipcRenderer.send("query-all-item");
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
