<template>
    <div class="products_container">
        <div v-for="lesson in sortedLessons" class="product_card"><!--For each item in items-->
            <div>
                
                <img :src="getImage(lesson.image)" alt="Lesson Image"><!--Image of the lesson-->
                
            </div>
            <div>
                <h2>{{lesson.title}}</h2><!--Title of the lesson -->
                <h4>{{lesson.description}}</h4><!--Description of the lesson -->
                <h5>{{lesson.location}}</h5><!--Location of the lesson -->
                <p>Price: £{{lesson.price}}</p><!--Price of the lesson -->
                
                <p>Stock Remaining: {{stockLevel(lesson.id)}}</p> <!--Stock remaining of the lesson -->
                
                <button v-on:click="addToCart(lesson.id)" v-if="canAddToCart(lesson.id)">Add to cart</button><!--Button to add to cart if stock available-->
                
                <button disabled="disabled" v-else>Add to cart</button><!--Button to add to cart disabled as stock not available-->
                
                <p v-if="stockLevel(lesson.id) == 0">Out of Stock</p><!--Display out of stock if stock is 0 -->
                
                <p v-else-if="stockLevel(lesson.id) < 3" style="color: red;">Hurry! Only {{stockLevel(lesson.id)}} left in stock.</p><!--Display stock level in red if stock is less than 3 with a only left message-->
                
                <p v-else>In Stock</p><!--Display in stock if stock is greater than or equal to 3 -->
            </div>
        </div>
    </div>
    <div v-if="sortedLessons.length<1" style="left: 0; right: 0; text-align: center; margin-top: 200px;">
        <!--If there are no lessons to display -->
        <h1>No lessons to display</h1>
    </div>
</template>
<script>
export default {
    name: "ProductList",
    props: ["sortedLessons", "api_url", "lessons", "cart"],
    //emits: ["add-to-cart"],
    
    emits: ["add-to-cart", "remove-from-cart", "clear-cart"],
    methods: {
        getImage: function (image) {
            return this.api_url + "images/" + image;
        },
        stockLevel: function (id) {
            //return this.sortedLessons.find(lesson => lesson.id === id).stock;
            if (!this.lessons || this.lessons.length === 0 || !this.cart || id < 1) {
                return 0; // Default value for handling invalid cases
            }
            for(let i = 0; i < this.lessons.length; i++){
                if(this.lessons[i].id == id){
                    return this.lessons[i].availableInventory - this.cart[id];//Returning the stock level
                }
            }
        },
        canAddToCart: function (id) {
            return this.stockLevel(id) > 0;
        },
        addToCart: function (id) {
            this.$emit("add-to-cart", id);
        }
    }
}
</script>
<style>
</style>