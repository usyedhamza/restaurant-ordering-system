const API =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://restaurant-ordering-api-stxb.onrender.com";
let orders = [];
let menu = [];
let activeFilter = "all";
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, options);
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

async function loadAll() {
  try {
    [orders, menu] = await Promise.all([api("/orders"), api("/menu")]);
    renderEverything();
  } catch (e) {
    console.error(e);
  }
}

function renderEverything() {
  renderStats();
  renderLatest();
  renderOrders();
  renderMenu();
}
function renderStats() {
  $("#statOrders").textContent = orders.length;
  $("#statSales").textContent =
    `₹${orders.reduce((s, o) => s + Number(o.total || 0), 0)}`;
  $("#statDelivery").textContent = orders.filter(
    (o) => o.orderType === "delivery",
  ).length;
  $("#statPending").textContent = orders.filter(
    (o) => !["completed", "cancelled"].includes(o.status),
  ).length;
}
function renderLatest() {
  $("#latestOrders").innerHTML =
    orders
      .slice(0, 5)
      .map(
        (order) => `
          <div class="mini-order">
            <div>
              <strong>#${order.orderId}</strong>
              <span>${order.orderType}${order.table ? ` · Table ${order.table}` : ""}</span>
            </div>
            <strong>₹${order.total}</strong>
          </div>
        `,
      )
      .join("") || `<p class="empty">No orders yet.</p>`;
}
function renderOrders() {
  const filtered =
    activeFilter === "all"
      ? orders
      : activeFilter === "delivery"
        ? orders.filter((o) => o.orderType === "delivery")
        : orders.filter((o) => o.status === activeFilter);
  $("#orderCount").textContent = `${filtered.length} orders`;
  $("#orders").innerHTML =
    filtered.map(orderCard).join("") ||
    `<div class="empty">No orders in this view.</div>`;
  $$(".status-select").forEach((select) =>
    select.addEventListener("change", async () => {
      await api(`/orders/${select.dataset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: select.value }),
      });
      await loadAll();
    }),
  );
}
function orderCard(o) {
  const destination =
    o.orderType === "delivery"
      ? o.customer?.address || "Address not provided"
      : o.orderType === "takeaway"
        ? "Takeaway"
        : `Table ${o.table || "—"}`;
  const nav =
    o.orderType === "delivery" && o.customer?.address
      ? `
        <a
          class="nav-button"
          target="_blank"
          href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(o.customer.address)}"
        >
          Open navigation
        </a>
      `
      : "";
  const orderItems = o.items
    .map(
      (item) => `
        <div class="order-item">
          <span>${item.quantity} × ${escapeHtml(item.name)}</span>
          <strong>₹${item.price * item.quantity}</strong>
        </div>
      `,
    )
    .join("");

  const statusOptions = [
    ["new", "New"],
    ["preparing", "Preparing"],
    ["ready", "Ready"],
    ["completed", "Completed"],
    ["cancelled", "Cancelled"],
  ]
    .map(
      ([value, label]) => `
        <option value="${value}" ${o.status === value ? "selected" : ""}>
          ${label}
        </option>
      `,
    )
    .join("");

  return `
    <article class="order-card">
      <div class="order-head">
        <div>
          <p class="eyebrow">ORDER #${o.orderId}</p>
          <h3>${escapeHtml(destination)}</h3>
          <p class="customer">
            ${escapeHtml(o.customer?.name || "Guest")}
            ${o.customer?.phone ? `· ${escapeHtml(o.customer.phone)}` : ""}
          </p>
        </div>
        <span class="badge ${o.status}">${o.status}</span>
      </div>
      ${nav}
      <div class="order-items">${orderItems}</div>
      <div class="order-bottom">
        <div>
          <span>Total</span>
          <strong>₹${o.total}</strong>
        </div>
        <select class="status-select" data-id="${o.orderId}">
          ${statusOptions}
        </select>
      </div>
    </article>
  `;
}

function renderMenu() {
  $("#menuAdmin").innerHTML = menu
    .map(
      (item) => `
        <article class="menu-admin-row">
          <div class="menu-thumb">
            ${item.image ? `<img src="${escapeAttr(item.image)}" alt="">` : ""}
          </div>
          <div class="menu-info">
            <p class="eyebrow">${escapeHtml(item.category)}</p>
            <h3>${escapeHtml(item.name)}</h3>
            <p>${escapeHtml(item.description || "")}</p>
          </div>
          <div class="menu-price">₹${item.price}</div>
          <div class="menu-actions">
            <button class="edit" data-id="${item.id}">Edit</button>
            <button
              class="availability ${item.available ? "on" : "off"}"
              data-id="${item.id}"
            >
              ${item.available ? "Available" : "Sold out"}
            </button>
            <button class="delete" data-id="${item.id}">Delete</button>
          </div>
        </article>
      `,
    )
    .join("");
  $$(".edit").forEach((b) =>
    b.addEventListener("click", () => openItem(Number(b.dataset.id))),
  );
  $$(".availability").forEach((b) =>
    b.addEventListener("click", async () => {
      const item = menu.find((i) => i.id === Number(b.dataset.id));
      await api(`/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !item.available }),
      });
      await loadAll();
    }),
  );
  $$(".delete").forEach((b) =>
    b.addEventListener("click", async () => {
      if (confirm("Delete this menu item?")) {
        await api(`/menu/${b.dataset.id}`, { method: "DELETE" });
        await loadAll();
      }
    }),
  );
}

$$(".tab").forEach((tab) =>
  tab.addEventListener("click", () => {
    $$(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    $$(".tab-panel").forEach((p) => p.classList.remove("active"));
    $(`#${tab.dataset.tab}Panel`).classList.add("active");
  }),
);
$$(".filter").forEach((b) =>
  b.addEventListener("click", () => {
    $$(".filter").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    activeFilter = b.dataset.filter;
    renderOrders();
  }),
);
$("#refresh").addEventListener("click", loadAll);

function openItem(id = null) {
  const item = menu.find((i) => i.id === id);
  $("#itemId").value = item?.id || "";
  $("#itemName").value = item?.name || "";
  $("#itemCategory").value = item?.category || "";
  $("#itemPrice").value = item?.price || "";
  $("#itemDescription").value = item?.description || "";
  $("#itemImage").value = item?.image || "";
  $("#itemAvailable").checked = item?.available !== false;
  $("#modalTitle").textContent = item ? "Edit item" : "Add item";
  $("#itemModal").classList.add("open");
}
$("#addItem").addEventListener("click", () => openItem());
$("#closeModal").addEventListener("click", () =>
  $("#itemModal").classList.remove("open"),
);
$("#itemForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = $("#itemId").value;
  const body = {
    name: $("#itemName").value,
    category: $("#itemCategory").value,
    price: Number($("#itemPrice").value),
    description: $("#itemDescription").value,
    image: $("#itemImage").value,
    available: $("#itemAvailable").checked,
  };
  try {
    await api(id ? `/menu/${id}` : "/menu", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    $("#itemModal").classList.remove("open");
    await loadAll();
  } catch (err) {
    $("#itemMessage").textContent = "Could not save item.";
  }
});

setInterval(loadAll, 10000);
function escapeHtml(v) {
  return String(v).replace(
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
function escapeAttr(v) {
  return escapeHtml(v);
}
loadAll();
