/* =========================
   FOOD SLIDER
========================= */

let slides = document.querySelectorAll(".food-slide");

let nextButton = document.getElementById("nextBtn");
let prevButton = document.getElementById("prevBtn");

let currentSlide = 0;


nextButton.addEventListener("click", function () {

    slides[currentSlide].classList.remove("active");

    currentSlide++;

    if (currentSlide >= slides.length) {
        currentSlide = 0;
    }

    slides[currentSlide].classList.add("active");

});


prevButton.addEventListener("click", function () {

    slides[currentSlide].classList.remove("active");

    currentSlide--;

    if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    }

    slides[currentSlide].classList.add("active");

});


/* =========================
   CART
========================= */

let cart = [];

let cartCount = document.getElementById("cart-count");
let cartItems = document.getElementById("cartItems");
let cartTotal = document.getElementById("cartTotal");

let addButtons = document.querySelectorAll(".add-button");


/* =========================
   ADD BUTTONS
========================= */

addButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        let itemName = button.dataset.name;
        let itemPrice = Number(button.dataset.price);


        let existingItem = cart.find(function(item) {

            return item.name === itemName;

        });


        if (existingItem) {

            existingItem.quantity++;

        } else {

            cart.push({

                name: itemName,
                price: itemPrice,
                quantity: 1

            });

        }


        updateCartCount();

        displayCart();

        console.log(cart);

    });

});


/* =========================
   CART COUNT
========================= */

function updateCartCount() {

    let itemCount = cart.reduce(function(total, item) {

        return total + item.quantity;

    }, 0);


    cartCount.textContent = itemCount;

}


/* =========================
   DISPLAY CART
========================= */

function displayCart() {

    cartItems.innerHTML = "";

    let total = 0;


    if (cart.length === 0) {

        cartItems.innerHTML = `
            <p class="empty-cart">
                Your cart is empty.
            </p>
        `;

    }


    cart.forEach(function(item, index) {

        let itemTotal = item.price * item.quantity;

        total = total + itemTotal;


        let itemElement = document.createElement("div");

        itemElement.classList.add("cart-item");


        itemElement.innerHTML = `

            <div>

                <h3>${item.name}</h3>

                <p>
                    ₹${item.price} × ${item.quantity}
                </p>

            </div>


            <div class="quantity-controls">

                <button class="quantity-minus">
                    −
                </button>

                <span>
                    ${item.quantity}
                </span>

                <button class="quantity-plus">
                    +
                </button>

            </div>

        `;


        cartItems.appendChild(itemElement);


        /* MINUS */

        let minusButton =
            itemElement.querySelector(".quantity-minus");


        minusButton.addEventListener("click", function() {

            item.quantity--;


            if (item.quantity <= 0) {

                cart.splice(index, 1);

            }


            updateCartCount();

            displayCart();

        });


        /* PLUS */

        let plusButton =
            itemElement.querySelector(".quantity-plus");


        plusButton.addEventListener("click", function() {

            item.quantity++;

            updateCartCount();

            displayCart();

        });

    });


    cartTotal.textContent = "₹" + total;

}


/* =========================
   CART DRAWER
========================= */

let cartButton =
    document.querySelector(".cart-button");

let cartDrawer =
    document.getElementById("cartDrawer");

let cartOverlay =
    document.getElementById("cartOverlay");

let closeCart =
    document.getElementById("closeCart");


cartButton.addEventListener("click", function() {

    cartDrawer.classList.add("open");

    cartOverlay.classList.add("open");

});


closeCart.addEventListener("click", function() {

    cartDrawer.classList.remove("open");

    cartOverlay.classList.remove("open");

});


cartOverlay.addEventListener("click", function() {

    cartDrawer.classList.remove("open");

    cartOverlay.classList.remove("open");

});


/* =========================
   PLACE ORDER
========================= */

let placeOrder =
    document.getElementById("placeOrder");

let orderSuccess =
    document.getElementById("orderSuccess");

let closeSuccess =
    document.getElementById("closeSuccess");


placeOrder.addEventListener("click", function() {

    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;

    }
let order = {
    orderId: Date.now(),

    table: 12,

    items: cart.map(function(item) {
        return {
            name: item.name,
            price: item.price,
            quantity: item.quantity
        };
    }),

    total: cart.reduce(function(total, item) {
        return total + item.price * item.quantity;
    }, 0),

    status: "new",

    createdAt: new Date().toISOString()
};

fetch("https://restaurant-ordering-api-stxb.onrender.com/orders",  {
    method: "POST",

    headers: {
        "Content-Type": "application/json"
    },

    body: JSON.stringify(order)

})
.then(function(response) {

    return response.json();

})
.then(function(data) {

    console.log("Server response:");
    console.log(data);

})
.catch(function(error) {

    console.log("Error sending order:");
    console.log(error);

});

console.log(order);

    orderSuccess.classList.add("open");


    cart = [];


    updateCartCount();

    displayCart();


    cartDrawer.classList.remove("open");

    cartOverlay.classList.remove("open");

});


/* =========================
   CLOSE SUCCESS
========================= */

closeSuccess.addEventListener("click", function() {

    orderSuccess.classList.remove("open");

});