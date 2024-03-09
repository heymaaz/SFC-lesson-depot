<template>
  <div id="app">
    <header>
      <h1>{{sitename}}</h1>
      <div>Current view: {{ currentView }}</div>
      <button @click="showCheckout">{{cartCount}} <font-awesome-icon icon="fa-solid fa-cart-shopping" /> Checkout</button>
      <button @click="showTestConsole=!showTestConsole"><font-awesome-icon icon="fas fa-terminal" /> Show Test Console</button>
      <br>
      <button v-if="showTestConsole" @click="deleteAllCaches" class="test-elem">
        <font-awesome-icon icon="fa-solid fa-trash" />
        Delete All Caches
      </button>
      <button v-if="showTestConsole" @click="unregisterAllServiceWorkers" class="test-elem">
        <font-awesome-icon icon="fab fa-uniregistry" /> Unregister All ServiceWorkers
      </button>
      <button v-if="showTestConsole" @click="reloadPage" class="test-elem">
        <span class="fas fa-sync"></span>
        <font-awesome-icon icon="fas fa-sync" />
        Reload Page
      </button>
    </header>
    
    <main>
      <component 
      :is="currentView" 
      v-bind="currentProps"
      @add-to-cart="handleAddToCart"
      @remove-from-cart="handleRemoveFromCart"
      @clear-cart="handleClearCart"
      ></component>
      
    </main>
  </div>
</template>
<script>
import ProductList from "./components/ProductList.vue";
import Checkout from "./components/Checkout.vue";
import { markRaw } from 'vue';
const api_url = 'https://lessondepot-env-3.eba-uznqjf57.eu-west-2.elasticbeanstalk.com/';
export default {
  name: "App",
  components: { 
    ProductList, 
    Checkout 
  },
  data() { 
    return { 
      lessons: [],//Initialising the lessons
      lessonsCount: 0,//Initialising the count of lessons
      sitename: "Vue.js Pet Depot",
      cart: [],
      currentView: markRaw(Checkout),
      showTestConsole: false,
      api_url: api_url,
      
      
      showcart: false,//Boolean to show or hide the cart
      order: {
        full_name: '',//Initialising the full name
        phone_number: ''//Initialising the phone number
      },
      search_query: '',//Initialising the search query
      sort_by: '',//Initialising the sort_by
      sort_desc: false,//Boolean for sort in ascending or descending order
    } 
  },
  created() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("service-worker.js");
    }
    //get count of lessons
    fetch(api_url + 'count/lessons')//Fetching the count of lessons
    .then(response => response.json())
    .then(data => {
      //console.log(data);
      this.lessonsCount = data;//Setting the count of lessons
    })
    .then(() => {
      //get lessons
      fetch(api_url + 'search/lessons?')//Fetching the lessons
      .then(response => response.json())
      .then(data => {
        this.lessons = data;//Setting the lessons
      });
    })
    .then(() => {
      //initialise cart
      for(let i = 0; i <= this.lessonsCount; i++){
        this.cart.push(0);//Pushing the lessons to the cart
      }
    })
    .catch(err => {
      console.log(err);
    });
  },
  methods: { 
   
    handleAddToCart(item) {
      this.addToCart(item);
    },
    
    handleRemoveFromCart(item) {
      if (this.currentView === Checkout) {
        this.removeFromCart(item);
      }
      // No action if the currentView is not Checkout
    },
    
    handleClearCart() {
      if (this.currentView === Checkout) {
        this.clearCart();
      }
      // No action if the currentView is not Checkout
    },
    
    addToCart(id) {
      this.cart[id]++;//Adding the lesson to cart
      /* This was used in Vue 2
      console.log(`Adding to cart: ID=${id}`);//Logging the id of the lesson added to cart
      this.$set(this.cart, id, this.cart[id] + 1);//Adding the lesson to cart
      */
    },
    
    deleteAllCaches() {
      caches.keys().then(function(names) {
        for (let name of names)
        caches.delete(name);
      });
      console.log("All Caches Deleted");
    },
    
    unregisterAllServiceWorkers() {
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations) {
          registration.unregister()
        }
      });
      console.log("ServiceWorkers Unregistered");
    },
    
    reloadPage() {
      window.location.reload();
    },
    
    showCheckout() {
      console.log('showCheckout method is called');
      //console.log('currentView is: ', this.currentView);
      console.log('ProductList is: ', ProductList);
      console.log('Checkout is: ', Checkout);
      if (this.currentView === ProductList) {
        this.currentView = markRaw(Checkout);
      } else {
        this.currentView = markRaw(ProductList);
      }
      this.$forceUpdate();
    },
    
    setSortBy(sort_by) {
      this.sort_by = sort_by;//Setting the sort_by
    },
    
    removeFromCart(id) {
      this.cart[id]--;//Removing the lesson from cart
      /* This was used in Vue 2
      console.log(`Removing from cart: ID=${id}`);//Logging the id of the lesson removed from cart
      this.$set(this.cart, id, this.cart[id] - 1);//Removing the lesson from cart
      */
    },
    
    canAddToCart(id){
      if (!this.lessons || this.lessons.length === 0 || !this.cart || id < 1) {
        return false; // Default value for handling invalid cases
      }
      for(let i = 0; i < this.lessons.length; i++){
        if(this.lessons[i].id == id){
          return this.lessons[i].availableInventory > this.cart[id];//Checking if the stock is available
        }
      }
    },
    
    stockLevel(id) {
      if (!this.lessons || this.lessons.length === 0 || !this.cart || id < 1) {
        return 0; // Default value for handling invalid cases
      }
      for(let i = 0; i < this.lessons.length; i++){
        if(this.lessons[i].id == id){
          return this.lessons[i].availableInventory - this.cart[id];//Returning the stock level
        }
      }
    },
    
    clickCart() {
      this.search_query = '';//Clearing the search query when the cart is clicked to show all the lessons in the cart
      this.showcart = !this.showcart;//Showing or hiding the cart
    },
    
    place_order() {
      var sendOrder = {
        "customerDetails": {
          "name": this.order.full_name,
          "contactNumber": this.order.phone_number
        },
        "orderItems": [],
        "totalPrice": Number(this.cartTotal),
        "orderDate": new Date().toISOString().slice(0, 10)
      };
      
      // Process the cart items
      for (let i = 1; i < this.cart.length; i++) {
        if (this.cart[i] > 0) {
          sendOrder.orderItems.push({
            "lessonId": this.lessons[i-1]._id,
            "title": this.lessons[i-1].title,
            "price": this.lessons[i-1].price,
            "quantity": this.cart[i]
          });
        }
      }
      
      console.log(sendOrder);
      // Send the order to the server
      fetch(api_url + 'orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sendOrder)
      })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        
      })
      .then(() => {//update the inventory of the lessons with the new stock level
        for(let i = 1; i < this.cart.length; i++){
          if(this.cart[i] > 0){
            fetch(api_url + 'collections/lessons/'+this.lessons[i-1]._id, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                "availableInventory": Math.max(this.lessons[i-1].availableInventory - this.cart[i],0)
              })
            })
            .then(response => response.json())
            .then(data => {
              console.log(data);
              alert("Order placed!");//Alerting the user that the order has been placed
              //reload the page
              location.reload();
            })
            .catch(err => {
              console.log(err);
            });
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
      
    },
    
    clearCart() {
      for (let i = 0; i < this.cart.length; i++) {
        this.cart[i] = 0;
      }
    },
    
    getImage(path){
      return api_url +"images/"+ path;//Returning the image path
    },
    
    debounceSearch() {
      if (this.debounce) clearTimeout(this.debounce);
      this.debounce = setTimeout(() => {
        this.searchLessons();
      }, 300); // Adjust 300 to the desired debounce time in milliseconds
    },
    
    searchLessons() {
      fetch(api_url + 'search/lessons?searchTerm='+this.search_query)
      //fetch(api_url + 'search/lessons/'+this.lessonsCount+'/id/asc?searchTerm='+this.search_query)
      .then(response => response.json())
      .then(data => {
        this.lessons = data;
      }).catch(err => {
        console.log(err);
      });
    }
  },
  
  computed: {
    
    currentProps() {
      if (this.currentView === ProductList) {
        return {
          sortedLessons: this.sortedLessons,
          lessons: this.lessons,
          api_url: this.api_url,
          cart: this.cart
        };
      } else if (this.currentView === Checkout) {
        return {
          lessons: this.lessons,
          api_url: this.api_url,
          cart: this.cart
        };
      }
      return {}; // Return an empty object if no conditions match
    },
    
    cartCount() {//Computing the cart count
      let sum = 0;
      for(let i = 0; i < this.cart.length; i++){
        sum += this.cart[i];
      }
      return sum||"";
    },
    
    cartTotal() {//Computing the cart total
      let sum = 0;
      for(let i = 1; i < this.cart.length; i++){
        sum += this.cart[i] * this.lessons[i-1].price;
      }
      return sum.toFixed(2)||"";
    },
    
    placeordercheck() {//Checking if the order can be placed
      if(this.order.full_name == '' || this.order.phone_number =='')
      return false;
      return RegExp(/^[a-zA-Z ]+$/).test(this.order.full_name)&&RegExp(/^[0-9]+$/).test(this.order.phone_number);
    },
    
    filteredLessons() {//Filtering the lessons
      return this.lessons;//Returning all the lessons as the search is done in the backend
      /*This was used for frontend filtering
      return this.lessons.filter(lesson => {
        return lesson.title.toLowerCase().includes(this.search_query.toLowerCase())
        || lesson.description.toLowerCase().includes(this.search_query.toLowerCase())
        || lesson.location.toLowerCase().includes(this.search_query.toLowerCase())
      });
      */
    },
    
    sortMethod() {
      if(this.sort_desc)
      return "Descending";
      return "Ascending";
    },
    
    sortedLessons() {//Sorting the lessons
      if(this.sort_by == 'Title')
      if(this.sort_desc){
        return this.filteredLessons.sort((b, a) => {
          return a.title.localeCompare(b.title);
        });
      }
      else{
        return this.filteredLessons.sort((a, b) => {
          return a.title.localeCompare(b.title);
        });
      }
      
      else if(this.sort_by == 'Price')
      if(this.sort_desc){
        return this.filteredLessons.sort((b, a) => {
          return a.price - b.price;
        });
      }
      else{
        return this.filteredLessons.sort((a, b) => {
          return a.price - b.price;
        });
      }
      else if(this.sort_by == 'Location')
      if(this.sort_desc){
        return this.filteredLessons.sort((b, a) => {
          return a.location.localeCompare(b.location);
        });
      }
      else{
        return this.filteredLessons.sort((a, b) => {
          return a.location.localeCompare(b.location);
        });
      }
      else if(this.sort_by == 'Availability')
      if(this.sort_desc){
        return this.filteredLessons.sort((b, a) => {
          return this.stockLevel(a.id) - this.stockLevel(b.id);
        });
      }
      else{
        return this.filteredLessons.sort((a, b) => {
          return this.stockLevel(a.id) - this.stockLevel(b.id);
        });
      }
      else{
        return this.filteredLessons.sort((a, b) => {
          return a.id - b.id;
        });
      }
      
    }
  },
  
  watch: {
    
    search_query: function(newQuery, oldQuery) {
      if (newQuery !== oldQuery) {
        this.debounceSearch();
      }
    }
  }
  
};
</script>
