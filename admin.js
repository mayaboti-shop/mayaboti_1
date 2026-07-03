// ==============================================
// Admin dashboard logic — requires config.js and auth.js loaded first
// ==============================================

// ---- guard: must be logged in AND an admin ----
if (!Auth.isLoggedIn() || !Auth.isAdmin()) {
    window.location.href = "login.html";
}

const adminError = document.getElementById("adminError");
const adminSuccess = document.getElementById("adminSuccess");

function showError(msg) {
    adminError.textContent = msg;
    adminError.style.display = "block";
    adminSuccess.style.display = "none";
    setTimeout(() => (adminError.style.display = "none"), 5000);
}

function showSuccess(msg) {
    adminSuccess.textContent = msg;
    adminSuccess.style.display = "block";
    adminError.style.display = "none";
    setTimeout(() => (adminSuccess.style.display = "none"), 3000);
}

// ---- logout ----
document.getElementById("logoutBtn").addEventListener("click", () => {
    Auth.logout();
    window.location.href = "login.html";
});

// ---- tabs ----
const tabButtons = document.querySelectorAll(".admin-tab-btn");
const panels = document.querySelectorAll(".admin-panel");

tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        tabButtons.forEach((b) => b.classList.remove("active"));
        panels.forEach((p) => p.classList.remove("active"));

        btn.classList.add("active");
        document.getElementById(`panel-${btn.dataset.tab}`).classList.add("active");
    });
});

// ================= STATS =================

async function loadStats() {
    try {
        const stats = await Auth.apiFetch("/admin/stats");
        document.getElementById("statUsers").textContent = stats.userCount;
        document.getElementById("statProducts").textContent = stats.productCount;
        document.getElementById("statOrders").textContent = stats.orderCount;
        document.getElementById("statRevenue").textContent = `$${stats.revenue.toFixed(2)}`;
    } catch (err) {
        showError(err.message);
    }
}

// ================= PRODUCTS =================

const productForm = document.getElementById("productForm");
const productSubmitBtn = document.getElementById("productSubmitBtn");
const productIdField = document.getElementById("productId");

async function loadProducts() {
    const wrap = document.getElementById("productsTableWrap");
    try {
        const products = await Auth.apiFetch("/products");

        if (!products.length) {
            wrap.innerHTML = `<p class="admin-empty">No products yet. Add one above.</p>`;
            return;
        }

        wrap.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr>
                </thead>
                <tbody>
                    ${products
                        .map(
                            (p) => `
                        <tr>
                            <td>${p.image ? `<img src="${p.image}" alt="">` : ""}</td>
                            <td>${p.name}</td>
                            <td>${p.category}</td>
                            <td>$${p.price.toFixed(2)}</td>
                            <td>${p.stock}</td>
                            <td>
                                <button class="btn-small" data-edit="${p._id}">Edit</button>
                                <button class="btn-small danger" data-delete="${p._id}">Delete</button>
                            </td>
                        </tr>`
                        )
                        .join("")}
                </tbody>
            </table>`;

        wrap.querySelectorAll("[data-edit]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const product = products.find((p) => p._id === btn.dataset.edit);
                fillProductForm(product);
            });
        });

        wrap.querySelectorAll("[data-delete]").forEach((btn) => {
            btn.addEventListener("click", () => deleteProduct(btn.dataset.delete));
        });
    } catch (err) {
        wrap.innerHTML = `<p class="admin-empty">Failed to load products.</p>`;
        showError(err.message);
    }
}

function fillProductForm(product) {
    productIdField.value = product._id;
    document.getElementById("pName").value = product.name;
    document.getElementById("pCategory").value = product.category;
    document.getElementById("pPrice").value = product.price;
    document.getElementById("pStock").value = product.stock;
    document.getElementById("pImage").value = product.image || "";
    document.getElementById("pDescription").value = product.description || "";
    productSubmitBtn.textContent = "Update Product";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetProductForm() {
    productForm.reset();
    productIdField.value = "";
    productSubmitBtn.textContent = "Add Product";
}

productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        name: document.getElementById("pName").value,
        category: document.getElementById("pCategory").value,
        price: parseFloat(document.getElementById("pPrice").value),
        stock: parseInt(document.getElementById("pStock").value || "0", 10),
        image: document.getElementById("pImage").value,
        description: document.getElementById("pDescription").value,
    };

    const id = productIdField.value;

    try {
        if (id) {
            await Auth.apiFetch(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) });
            showSuccess("Product updated.");
        } else {
            await Auth.apiFetch("/products", { method: "POST", body: JSON.stringify(payload) });
            showSuccess("Product added.");
        }

        resetProductForm();
        loadProducts();
        loadStats();
    } catch (err) {
        showError(err.message);
    }
});

async function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;

    try {
        await Auth.apiFetch(`/products/${id}`, { method: "DELETE" });
        showSuccess("Product deleted.");
        loadProducts();
        loadStats();
    } catch (err) {
        showError(err.message);
    }
}

// ================= ORDERS =================

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

async function loadOrders() {
    const wrap = document.getElementById("ordersTableWrap");
    try {
        const orders = await Auth.apiFetch("/orders");

        if (!orders.length) {
            wrap.innerHTML = `<p class="admin-empty">No orders yet.</p>`;
            return;
        }

        wrap.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Placed</th></tr>
                </thead>
                <tbody>
                    ${orders
                        .map(
                            (o) => `
                        <tr>
                            <td>${o.user ? `${o.user.fname} ${o.user.lname}<br><small>${o.user.email}</small>` : "—"}</td>
                            <td>${o.items.map((i) => `${i.name} x${i.qty}`).join(", ")}</td>
                            <td>$${o.total.toFixed(2)}</td>
                            <td>
                                <select data-order="${o._id}">
                                    ${ORDER_STATUSES.map(
                                        (s) => `<option value="${s}" ${s === o.status ? "selected" : ""}>${s}</option>`
                                    ).join("")}
                                </select>
                            </td>
                            <td>${new Date(o.createdAt).toLocaleDateString()}</td>
                        </tr>`
                        )
                        .join("")}
                </tbody>
            </table>`;

        wrap.querySelectorAll("[data-order]").forEach((select) => {
            select.addEventListener("change", async () => {
                try {
                    await Auth.apiFetch(`/orders/${select.dataset.order}/status`, {
                        method: "PUT",
                        body: JSON.stringify({ status: select.value }),
                    });
                    showSuccess("Order status updated.");
                } catch (err) {
                    showError(err.message);
                }
            });
        });
    } catch (err) {
        wrap.innerHTML = `<p class="admin-empty">Failed to load orders.</p>`;
        showError(err.message);
    }
}

// ================= USERS =================

async function loadUsers() {
    const wrap = document.getElementById("usersTableWrap");
    try {
        const users = await Auth.apiFetch("/admin/users");

        wrap.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr>
                </thead>
                <tbody>
                    ${users
                        .map(
                            (u) => `
                        <tr>
                            <td>${u.fname} ${u.lname}</td>
                            <td>${u.email}</td>
                            <td>${u.phone || "—"}</td>
                            <td><span class="badge ${u.role}">${u.role}</span></td>
                            <td>${new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>`
                        )
                        .join("")}
                </tbody>
            </table>`;
    } catch (err) {
        wrap.innerHTML = `<p class="admin-empty">Failed to load users.</p>`;
        showError(err.message);
    }
}

// ================= INIT =================

loadStats();
loadProducts();
loadOrders();
loadUsers();
