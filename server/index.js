const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let orders = [];

app.get("/", function(req, res) {
    res.send("Restaurant server is running!");
});

app.post("/orders", function(req, res) {
    let order = req.body;

    orders.push(order);

    console.log("New order received:");
    console.log(order);

    res.json({
        message: "Order received!",
        order: order
    });
});

app.get("/orders", function(req, res) {
    res.json(orders);
});

app.listen(PORT, "0.0.0.0", function() {
    console.log(`Server running on port ${PORT}`);
});