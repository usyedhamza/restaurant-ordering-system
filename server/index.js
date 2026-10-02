const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let orders = [];
let menu = [
  {
    id: 1,
    name: "Chicken Biryani",
    category: "Main Course",
    price: 249,
    description: "Fragrant basmati rice, aromatic spices and tender chicken.",
    image:
    
     "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1000&q=85",
    available: true,
  },
  {
    id: 2,
    name: "House Pizza",
    category: "Main Course",
    price: 299,
    description: "Fresh vegetables, mozzarella and our signature sauce.",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=85",
    available: true,
  },
  {
    id: 3,
    name: "Classic Burger",
    category: "Main Course",
    price: 179,
    description: "Crispy lettuce, melted cheese and house-made sauce.",
    image:
    "https://erpin.com.tr/assets/img/urun-cekimi/yemek/yemek_hero_1_1772756997071.png",
    available: true,
  },
  {
    id: 4,
    name: "Masala Chai",
    category: "Drinks",
    price: 99,
    description: "House masala chai brewed with warming spices.",
    image:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1000&q=85",
    available: true,
  },
  {
    id: 5,
    name: "Cold Coffee",
    category: "Drinks",
    price: 149,
    description: "Chilled coffee, creamy and lightly sweet.",
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1000&q=85",
    available: true,
  },
];

app.get("/", function (req, res) {
  res.json({ message: "Restaurant server is running!" });
});

app.get("/menu", function (req, res) {
  res.json(menu);
});

app.post("/menu", function (req, res) {
  const item = req.body;
  if (!item.name || !item.category || Number.isNaN(Number(item.price))) {
    return res
      .status(400)
      .json({ message: "Name, category and price are required." });
  }
  const newItem = {
    id: Date.now(),
    name: item.name.trim(),
    category: item.category.trim(),
    price: Number(item.price),
    description: (item.description || "").trim(),
    image: item.image || "",
    available: item.available !== false,
  };
  menu.push(newItem);
  res.status(201).json(newItem);
});

app.patch("/menu/:id", function (req, res) {
  const id = Number(req.params.id);
  const item = menu.find(function (entry) {
    return entry.id === id;
  });
  if (!item) return res.status(404).json({ message: "Menu item not found." });

  const body = req.body;
  if (body.name !== undefined) item.name = String(body.name).trim();
  if (body.category !== undefined) item.category = String(body.category).trim();
  if (body.price !== undefined) item.price = Number(body.price);
  if (body.description !== undefined)
    item.description = String(body.description).trim();
  if (body.image !== undefined) item.image = String(body.image);
  if (body.available !== undefined) item.available = Boolean(body.available);

  res.json(item);
});

app.delete("/menu/:id", function (req, res) {
  const id = Number(req.params.id);
  const before = menu.length;
  menu = menu.filter(function (item) {
    return item.id !== id;
  });
  if (menu.length === before)
    return res.status(404).json({ message: "Menu item not found." });
  res.json({ message: "Menu item deleted." });
});

app.post("/orders", function (req, res) {
  const incoming = req.body;
  if (!Array.isArray(incoming.items) || incoming.items.length === 0) {
    return res.status(400).json({ message: "Order must contain items." });
  }

  const order = {
    orderId: Date.now(),
    restaurantId: incoming.restaurantId || "chai-house",
    orderType: incoming.orderType || "dine-in",
    table: incoming.table || null,
    customer: incoming.customer || {},
    items: incoming.items,
    subtotal: Number(incoming.subtotal || 0),
    deliveryFee: Number(incoming.deliveryFee || 0),
    total: Number(incoming.total || 0),
    paymentMethod: incoming.paymentMethod || "pay-at-counter",
    paymentStatus: incoming.paymentStatus || "pending",
    status: "new",
    createdAt: new Date().toISOString(),
  };

  orders.unshift(order);
  console.log("New order received:", order);
  res.status(201).json({ message: "Order received!", order });
});

app.get("/orders", function (req, res) {
  res.json(orders);
});

app.patch("/orders/:id", function (req, res) {
  const order = orders.find(function (entry) {
    return String(entry.orderId) === String(req.params.id);
  });
  if (!order) return res.status(404).json({ message: "Order not found." });
  if (req.body.status) order.status = req.body.status;
  if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
  res.json(order);
});

// Development-only reset. Protect/remove before production launch.
app.delete("/orders", function (req, res) {
  orders = [];
  res.json({ message: "All orders cleared!" });
});

app.listen(PORT, "0.0.0.0", function () {
  console.log(`Server running on port ${PORT}`);
});
