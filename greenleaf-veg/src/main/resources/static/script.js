// ---------------- FOOTER YEAR ----------------
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
// ---- Reservation date: disable past days ----
// ---- Reservation date: allow only today to +30 days ----
const resDateInput = document.getElementById("resDate");
if (resDateInput) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // max = today + 30 days (you can change 30 to any number)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxStr = maxDate.toISOString().split("T")[0];

  resDateInput.setAttribute("min", todayStr);
  resDateInput.setAttribute("max", maxStr);
}


// ---------------- SMOOTH SCROLL NAV ----------------
document.querySelectorAll("header nav a").forEach(link => {
  link.addEventListener("click", e => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  });
});

/* ======================= CART LOGIC ======================= */

const cart = {}; // { itemName: { price, qty } }

const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const clearCartBtn = document.getElementById("clear-cart");
const placeOrderBtn = document.getElementById("place-order");

// Customer detail fields
const custNameInput = document.getElementById("custName");
const custPhoneInput = document.getElementById("custPhone");
const custAddressInput = document.getElementById("custAddress");

// Add to cart buttons
document.querySelectorAll(".add-to-cart").forEach(btn => {
  btn.addEventListener("click", () => {
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);

    if (!cart[name]) {
      cart[name] = { price, qty: 1 };
    } else {
      cart[name].qty += 1;
    }
    renderCart();
  });
});

function renderCart() {
  cartItemsEl.innerHTML = "";
  let total = 0;

  const entries = Object.entries(cart);

  if (entries.length === 0) {
    cartItemsEl.innerHTML = `<li class="cart-empty">Cart is empty. Add some dishes!</li>`;
  } else {
    entries.forEach(([name, item]) => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;

      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `
        <div>
          <div class="cart-item-name">${name}</div>
          <div class="cart-item-price">&#8377;${item.price} x ${item.qty} = &#8377;${itemTotal}</div>
        </div>
        <div class="cart-controls">
          <button class="qty-btn" data-action="dec" data-name="${name}">-</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" data-action="inc" data-name="${name}">+</button>
          <button class="qty-btn" data-action="remove" data-name="${name}">&times;</button>
        </div>
      `;
      cartItemsEl.appendChild(li);
    });
  }

  cartTotalEl.textContent = `\u20B9${total}`;
}

// Handle quantity buttons
cartItemsEl.addEventListener("click", e => {
  const btn = e.target.closest(".qty-btn");
  if (!btn) return;

  const action = btn.dataset.action;
  const name = btn.dataset.name;
  if (!cart[name]) return;

  if (action === "inc") {
    cart[name].qty += 1;
  } else if (action === "dec") {
    cart[name].qty -= 1;
    if (cart[name].qty <= 0) {
      delete cart[name];
    }
  } else if (action === "remove") {
    delete cart[name];
  }
  renderCart();
});

// Clear cart
if (clearCartBtn) {
  clearCartBtn.addEventListener("click", () => {
    Object.keys(cart).forEach(key => delete cart[key]);
    renderCart();
  });
}

/* ---------------- PLACE ORDER (BACKEND) ---------------- */

if (placeOrderBtn) {
  placeOrderBtn.addEventListener("click", async () => {
    const entries = Object.entries(cart);
    if (entries.length === 0) {
      alert("Your cart is empty! Please add some dishes first.");
      return;
    }

    const name = custNameInput ? custNameInput.value.trim() : "";
    const phone = custPhoneInput ? custPhoneInput.value.trim() : "";
    const address = custAddressInput ? custAddressInput.value.trim() : "";

    if (!name || !address) {
      alert("Please enter your name and address before placing the order.");
      return;
    }
	if (!/^[0-9]{10}$/.test(phone)) {
	  alert("Please enter a valid 10-digit phone number.");
	  return;
	}


	  // Build items + calculate total
	  let total = 0;
	  const items = entries.map(([itemName, item]) => {
	    const lineTotal = item.price * item.qty;
	    total += lineTotal;
	    return {
	      name: itemName,
	      price: item.price,
	      quantity: item.qty
	    };
	  });

	  const payload = {
	    customerName: name,  // stored in orders.customer_name
	    phone: phone,        // stored in orders.phone
	    email: "",           // you can add email later
	    notes: address,      // stored in orders.notes as address
	    items: items
	  };

	  try {
	    const response = await fetch("/api/orders", {
	      method: "POST",
	      headers: { "Content-Type": "application/json" },
	      body: JSON.stringify(payload)
	    });

	    const text = await response.text(); // "Order placed successfully. Order ID: X, Total: ₹Y"

	    if (response.status === 201) {
	      // Save details for order-success page
	      sessionStorage.setItem("orderMsg", text);
	      sessionStorage.setItem("orderName", name);
	      sessionStorage.setItem("orderPhone", phone);
	      sessionStorage.setItem("orderAddress", address);
	      sessionStorage.setItem("orderTotal", total.toString());
	      sessionStorage.setItem("orderItems", JSON.stringify(items));

	      // Clear cart and customer fields
	      Object.keys(cart).forEach(key => delete cart[key]);
	      renderCart();
	      if (custNameInput) custNameInput.value = "";
	      if (custPhoneInput) custPhoneInput.value = "";
	      if (custAddressInput) custAddressInput.value = "";

	      // Redirect to Order Success page
	      window.location.href = "order-success.html";
	    } else if (response.status === 400) {
	      alert("Order not valid: " + text);
	    } else {
	      alert("Something went wrong placing the order: " + text);
	    }
	  } catch (err) {
	    console.error(err);
	    alert("Unable to connect to server. Please try again later.");
	  }
	});

}
// Initial cart render
renderCart();

/* ======================= RESERVATION LOGIC (FRONTEND) ======================= */

// In-memory reservations for conflict demo
// Each entry: { date, table, startMin, endMin, name, phone, guests, email, notes }
const reservations = [];

const reservationForm = document.getElementById("reservation-form");

function timeToMinutes(timeStr) {
  // timeStr example: "10:30"
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

if (reservationForm) {
  reservationForm.addEventListener("submit", async e => {
    e.preventDefault();

    const name = document.getElementById("resName").value.trim();
    const phone = document.getElementById("resPhone").value.trim();
    const email = document.getElementById("resEmail").value.trim();
    const date = document.getElementById("resDate").value;
    const time = document.getElementById("resTime").value;
    const table = document.getElementById("resTable").value;
    const guests = document.getElementById("resGuests").value;
    const notes = document.getElementById("resNotes").value.trim();

    // Basic required check
    if (!name || !phone || !date || !time || !table || !guests) {
      alert("Please fill all required fields (Name, Phone, Date, Time, Table, Guests).");
      return;
    }

    // Phone validation
    if (!/^[0-9]{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    // Prevent booking for past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date + "T00:00:00");
    if (selectedDate < today) {
      alert("You cannot reserve a table for a past date. Please choose today or a future date.");
      return;
    }

    // Prevent booking more than 30 days ahead
    const maxDate = new Date();
    maxDate.setHours(0, 0, 0, 0);
    maxDate.setDate(maxDate.getDate() + 30);
    if (selectedDate > maxDate) {
      alert("Reservations can be made only within the next 30 days.");
      return;
    }

    // Time window + duration
    const startMinutes = timeToMinutes(time);
    const duration = 90; // 1.5 hours
    const endMinutes = startMinutes + duration;
    const OPEN_MIN = 11 * 60;
    const CLOSE_MIN = 23 * 60;

    if (startMinutes < OPEN_MIN || endMinutes > CLOSE_MIN) {
      alert("Reservations are allowed only between 11:00 AM and 11:00 PM (1.5 hours per reservation).");
      return;
    }

    // Build payload – include BOTH naming styles just in case
	const payload = {
	  // what backend actually uses for DB:
	  customerName: name,
	  phone,
	  email,
	  notes,
	  guests: parseInt(guests, 10),
	  tableNumber: parseInt(table, 10),
	  reservationDate: date,
	  startTime: time,

	  // extra fields (harmless, in case you ever read them)
	  name,
	  date,
	  time
	};


    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const text = await response.text();

      if (response.status === 201 || response.status === 200) {
        // Save for success page
        sessionStorage.setItem("resName", name);
        sessionStorage.setItem("resPhone", phone);
        sessionStorage.setItem("resEmail", email);
        sessionStorage.setItem("resDate", date);
        sessionStorage.setItem("resTime", time);
        sessionStorage.setItem("resTable", table);
        sessionStorage.setItem("resGuests", guests);
        sessionStorage.setItem("resNotes", notes);

        window.location.href = "reservation-success.html";
      } else {
        alert("Reservation failed: " + text);
      }
    } catch (err) {
      console.error(err);
      alert("Unable to connect to server at the moment.");
    }
  });
}



