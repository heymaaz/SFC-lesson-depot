<template>
    <!-- if showcart is true then show the cart-->
    <div v-if="cartCount == 0" class="cart-container"><!--If the cart is empty -->
        <!--Image for empty cart -->
        <img src="https://img.freepik.com/premium-vector/shopping-cart-with-cross-mark-wireless-paymant-icon-shopping-bag-failure-paymant-sign-online-shopping-vector_662353-912.jpg" alt="Cart is empty" class="cart-image">
    </div>
    <div v-else><!--If the cart is not empty -->
        
        <div v-for="lesson in lessons">
            
            <div v-if="cart[lesson.id] > 0" style="display: flex; align-items: center; gap: 20px;"><!--For each lesson in the cart -->
                
                <div style="flex: 1; max-width: 25%;">
                    <!--Image of the lesson -->
                    
                    <img :src="getImage(lesson.image)" alt="Lesson Image" width="100%">
                </div>
                <div style="flex: 2;max-width: 75%;">
                    <!--Details of the lesson -->
                    
                    <h2>{{lesson.title}}</h2>
                    <h4>{{lesson.description}}</h4>
                    <h5>{{lesson.location}}</h5>
                    <p>Price: £{{lesson.price}}</p>
                    Quantity:
                    <button v-on:click="removeFromCart(lesson.id)">-</button><!--Button to remove from cart -->
                    
                    {{cart[lesson.id]}}
                    <button v-on:click="addToCart(lesson.id)" v-if="canAddToCart(lesson.id)">+</button><!--Button to add to cart if stock available-->
                    
                    <button disabled="disabled" v-else>+</button><!--Button to add to cart disabled as stock not available-->
                    
                </div>
            </div>
        </div>
        
        <h3>Your total is: £{{cartTotal}}</h3><!--Total price of items in the cart -->
        <h3>Enter your details to place your order:</h3>
        <div class="input-container">
            <strong>Full Name:</strong><!--Input for full name -->
            <input type="text" v-model="order.full_name" placeholder="Full Name"><!--v-model binds the input to the order.full_name variable -->
        </div>
        <div class="input-container">
            <strong>Phone Number:</strong><!--Input for phone number -->
            <input type="text" v-model="order.phone_number" placeholder="Phone Number"><!--v-model binds the input to the order.phone_number variable -->
        </div>
        <br>
        <br>
        <div class="input-container">
            <strong>Full Name:</strong><!--Displaying the full name -->
            <strong>{{order.full_name}}</strong>
        </div>
        <div class="input-container">
            <strong>Phone Number:</strong><!--Displaying the phone number -->
            <strong>{{order.phone_number}}</strong>
        </div>
        <button v-if="placeordercheck" v-on:click="place_order()">Place order</button><!--Button to place order -->
        <button disabled="disabled" v-else>Place order</button><!--Button to place order disabled as details not entered correctly-->
    </div>
</template>
<script>
export default{
    name: "Checkout",
    props: ["lessons", "cart", "api_url"],
    emits: ["add-to-cart", "remove-from-cart", "clear-cart"],
    data: function(){
        return {
            order: {
                full_name: "",
                phone_number: ""
            }
        }
    },
    computed: {
        cartCount: function(){
            let count = 0;
            for(let id in this.cart){
                count += this.cart[id];
            }
            return count;
        },
        cartTotal: function(){
            let sum = 0;
            for(let i = 1; i < this.cart.length; i++){
                sum += this.cart[i] * this.lessons[i-1].price;
            }
            return sum.toFixed(2)||"";
        },
        placeordercheck: function(){
            return this.order.full_name.length > 0 && this.order.phone_number.length > 0;
        }
    },
    methods: {
        getImage: function (image) {
            return this.api_url + "images/" + image;
        },
        canAddToCart: function (id) {
            return this.stockLevel(id) > 0;
        },
        addToCart: function (id) {
            this.$emit("add-to-cart", id);
        },
        removeFromCart: function (id) {
            this.$emit("remove-from-cart", id);
        },
        stockLevel: function (id) {
            if (!this.lessons || this.lessons.length === 0 || !this.cart || id < 1) {
                return 0; // Default value for handling invalid cases
            }
            for(let i = 0; i < this.lessons.length; i++){
                if(this.lessons[i].id == id){
                    return this.lessons[i].availableInventory - this.cart[id];
                }
            }
        },
        place_order: function(){
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
            fetch(this.api_url + 'orders', {
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
                        fetch(this.api_url + 'collections/lessons/'+this.lessons[i-1]._id, {
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
        }
    }
}
</script>
<style>
</style>