const API =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://restaurant-ordering-api-stxb.onrender.com";
const params = new URLSearchParams(window.location.search);
const tableNumber = params.get("table") || "12";
let menu = [];
let cart = [];
let orderMode = "dine-in";
let currentSlide = 0;

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

$("#tableNumber").textContent = tableNumber;

async function loadMenu() {
  try {
    const response = await fetch(`${API}/menu`);
    menu = await response.json();
    renderCategories();
    renderMenu();
    renderSignatures();
  } catch (error) {
    $("#menuGrid").innerHTML =
      `<div class="loading">Menu is temporarily unavailable. Please try again.</div>`;
  }
}

function renderCategories() {
  const categories = ["All", ...new Set(menu.map((item) => item.category))];
  $("#categories").innerHTML = categories
    .map(
      (cat, i) =>
        `<button class="category ${i === 0 ? "active" : ""}" data-category="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`,
    )
    .join("");
  $$(".category").forEach((button) =>
    button.addEventListener("click", () => {
      $$(".category").forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      renderMenu(button.dataset.category);
    }),
  );
}

function renderMenu(category = "All") {
  const items = menu.filter(
    (item) => category === "All" || item.category === category,
  );
  $("#menuGrid").innerHTML = items
    .map(
      (item) => `
        <article class="menu-card ${item.available ? "" : "sold-out"}">
          <div class="menu-image">
            ${
              item.image
                ? `<img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.name)}">`
                : ""
            }
          </div>
          <div class="menu-card-body">
            <div>
              <p class="menu-category">${escapeHtml(item.category)}</p>
              <h3>${escapeHtml(item.name)}</h3>
              <p>${escapeHtml(item.description || "")}</p>
            </div>
            <div class="menu-card-bottom">
              <strong>₹${item.price}</strong>
              <button
                class="add-button"
                data-id="${item.id}"
                ${item.available ? "" : "disabled"}
              >
                ${item.available ? "+ Add" : "Sold out"}
              </button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");
  $$(".add-button").forEach((button) =>
    button.addEventListener("click", () =>
      addToCart(Number(button.dataset.id)),
    ),
  );
}

function renderSignatures() {
  const items = menu.slice(0, 3);
  $("#signatureSlides").innerHTML = items
    .map(
      (item, i) => `
        <article class="food-slide ${i === 0 ? "active" : ""}">
          <div class="slide-image">
            <img
              src="${escapeAttr(item.image)}"
              alt="${escapeAttr(item.name)}"
            >
          </div>
          <div class="slide-content">
            <p class="eyebrow">0${i + 1} / ${items.length}</p>
            <h3>${escapeHtml(item.name)}</h3>
            <p class="slide-description">
              ${escapeHtml(item.description || "")}
            </p>
            <div class="slide-bottom">
              <strong>₹${item.price}</strong>
              <button class="add-button" data-id="${item.id}">
                + Add
              </button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");
  currentSlide = 0;
  $$("#signatureSlides .add-button").forEach((button) =>
    button.addEventListener("click", () =>
      addToCart(Number(button.dataset.id)),
    ),
  );
}

function moveSlide(direction) {
  const slides = $$(".food-slide");
  if (!slides.length) return;
  slides[currentSlide].classList.remove("active");
  currentSlide = (currentSlide + direction + slides.length) % slides.length;
  slides[currentSlide].classList.add("active");
}

$("#nextBtn").addEventListener("click", () => moveSlide(1));
$("#prevBtn").addEventListener("click", () => moveSlide(-1));

function addToCart(id) {
  const item = menu.find((entry) => entry.id === id);
  if (!item || !item.available) return;
  const existing = cart.find((entry) => entry.id === id);
  if (existing) existing.quantity++;
  else
    cart.push({ id: item.id, name: item.name, price: item.price, quantity: 1 });
  updateCart();
  showToast(`${item.name} added`);
}

function updateCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  $("#cart-count").textContent = count;
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  $("#cartTotal").textContent = `₹${subtotal}`;
  $("#cartItems").innerHTML = cart.length
    ? cart
        .map(
          (item, index) => `
          <div class="cart-item">
            <div>
              <h3>${escapeHtml(item.name)}</h3>
              <p>₹${item.price} × ${item.quantity}</p>
            </div>
            <div class="quantity-controls">
              <button data-action="minus" data-index="${index}">−</button>
              <span>${item.quantity}</span>
              <button data-action="plus" data-index="${index}">+</button>
            </div>
          </div>
        `,
        )
        .join("")
    : `<p class="empty-cart">Your cart is empty.</p>`;
  $("#deliverySummary").textContent =
    orderMode === "delivery" && cart.length
      ? "Delivery fee will be confirmed at checkout."
      : "";
  $$(".quantity-controls button").forEach((button) =>
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      cart[index].quantity += button.dataset.action === "plus" ? 1 : -1;
      if (cart[index].quantity <= 0) cart.splice(index, 1);
      updateCart();
    }),
  );
}

function setMode(mode) {
  orderMode = mode;
  $$(".mode").forEach((button) =>
    button.classList.toggle("active", button.dataset.mode === mode),
  );
  $("#tableNote").innerHTML =
    mode === "dine-in"
      ? `Table ordering enabled. Your table: <strong>${escapeHtml(tableNumber)}</strong>`
      : mode === "takeaway"
        ? "We'll prepare your order for pickup."
        : "Enter your delivery details at checkout.";
  updateCart();
}

$$(".mode").forEach((button) =>
  button.addEventListener("click", () => setMode(button.dataset.mode)),
);

$("#openCart").addEventListener("click", () => {
  $("#cartDrawer").classList.add("open");
  $("#cartOverlay").classList.add("open");
});
function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#cartOverlay").classList.remove("open");
}
$("#closeCart").addEventListener("click", closeCart);
$("#cartOverlay").addEventListener("click", closeCart);

$("#placeOrder").addEventListener("click", () => {
  if (!cart.length) return showToast("Add something to your order first");
  $("#checkoutType").textContent =
    orderMode === "dine-in"
      ? `Dine in · Table ${tableNumber}`
      : orderMode === "takeaway"
        ? "Takeaway order"
        : "Delivery order";
  $("#customerFields").innerHTML =
    orderMode === "delivery"
      ? `
      <label>
        Name
        <input id="customerName" placeholder="Your name" required>
      </label>
      <label>
        Phone
        <input
          id="customerPhone"
          type="tel"
          placeholder="10-digit mobile number"
          required
        >
      </label>
      <label>
        Delivery address
        <textarea
          id="customerAddress"
          rows="3"
          placeholder="House / street / area"
          required
        ></textarea>
      </label>
    `
      : `<label>Name<input id="customerName" placeholder="Your name"></label><label>Phone<input id="customerPhone" type="tel" placeholder="Mobile number"></label>`;
  $("#checkoutOverlay").classList.add("open");
});

$("#closeCheckout").addEventListener("click", () =>
  $("#checkoutOverlay").classList.remove("open"),
);
$("#confirmOrder").addEventListener("click", async () => {
  const name = $("#customerName").value.trim();
  const phone = $("#customerPhone").value.trim();
  const address = $("#customerAddress")?.value.trim() || "";
  const message = $("#formMessage");
  if (!name || !phone || (orderMode === "delivery" && !address)) {
    message.textContent = "Please complete the required details.";
    return;
  }
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const order = {
    restaurantId: "chai-house",
    orderType: orderMode,
    table: orderMode === "dine-in" ? tableNumber : null,
    customer: { name, phone, address },
    items: cart.map(({ name, price, quantity }) => ({ name, price, quantity })),
    subtotal,
    deliveryFee: 0,
    total: subtotal,
    paymentMethod: $("#paymentMethod").value,
    paymentStatus: "pending",
  };
  const button = $("#confirmOrder");
  button.disabled = true;
  message.textContent = "Sending order…";
  try {
    const response = await fetch(`${API}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    if (!response.ok) throw new Error("Order failed");
    const data = await response.json();
    cart = [];
    updateCart();
    closeCart();
    $("#checkoutOverlay").classList.remove("open");
    $("#successOrderNumber").textContent = `ORDER #${data.order.orderId}`;
    $("#successText").textContent =
      orderMode === "delivery"
        ? "Your delivery order has been sent to the restaurant."
        : "Your order has been sent to the restaurant.";
    $("#orderSuccess").classList.add("open");
  } catch (error) {
    message.textContent = "Could not place the order. Please try again.";
  }
  button.disabled = false;
});

$("#closeSuccess").addEventListener("click", () =>
  $("#orderSuccess").classList.remove("open"),
);

function showToast(text) {
  const toast = $("#toast");
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}
function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[c],
  );
}
function escapeAttr(value) {
  return escapeHtml(value);
}

loadMenu();
updateCart();
