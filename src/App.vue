<template>
  <div id="app">
    <header>
      <h1>{{sitename}}</h1>
      <div>Current view: {{ currentView }}</div>
      <button @click="showCheckout">{{ this.cart.length }} Checkout</button>
    </header>
    <main>
      <component :is="currentView"></component>
    </main>
  </div>
 </template>
 <script>
  import ProductList from "./components/ProductList.vue";
  import Checkout from "./components/Checkout.vue";
  import { markRaw } from 'vue';
  export default {
    name: "App",
    data() { 
      return { 
        sitename: "Vue.js Pet Depot",
        cart: [],
        currentView: markRaw(ProductList),
      } 
    },
    components: { 
      ProductList, 
      Checkout 
    },
    methods: { 
      showCheckout() {
        console.log('showCheckout method is called');
        console.log('currentView is: ', this.currentView);
        console.log('ProductList is: ', ProductList);
        console.log('Checkout is: ', Checkout);
        if (this.currentView === ProductList) {
          this.currentView = markRaw(Checkout);
        } else {
          this.currentView = markRaw(ProductList);
        }
        this.$forceUpdate();
      }
    }
  };
 </script>
 