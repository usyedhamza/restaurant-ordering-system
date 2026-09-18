fetch("http://localhost:3000/orders")
    .then(function(response) {

        return response.json();

    })
    .then(function(orders) {

        console.log("Orders from server:");
        console.log(orders);

        displayOrders(orders);

    })
    .catch(function(error) {

        console.log("Error getting orders:");
        console.log(error);

    });


function displayOrders(orders) {

    let ordersContainer = document.getElementById("orders");

    let orderCount = document.getElementById("orderCount");


    orderCount.textContent = orders.length + " orders";


    ordersContainer.innerHTML = "";


    orders.forEach(function(order) {

        let orderCard = document.createElement("article");

        orderCard.classList.add("order-card");


        orderCard.innerHTML = `

            <div class="order-card-header">

                <div>

                    <p class="eyebrow">
                        ORDER #${order.orderId}
                    </p>

                    <h3>
                        Table ${order.table}
                    </h3>

                </div>

                <span class="order-status">
                    ${order.status}
                </span>

            </div>


            <div class="order-items">

                ${order.items.map(function(item) {

                    return `
                        <div class="order-item">

                            <span>
                                ${item.quantity} × ${item.name}
                            </span>

                            <strong>
                                ₹${item.price * item.quantity}
                            </strong>

                        </div>
                    `;

                }).join("")}

            </div>


            <div class="order-card-footer">

                <span>Total</span>

                <strong>
                    ₹${order.total}
                </strong>

            </div>

        `;


        ordersContainer.appendChild(orderCard);

    });

}