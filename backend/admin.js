async function loadBookings() {
  const res = await fetch("https://easy-wgff.onrender.com/api/book-service");
  const bookings = await res.json();

  const tbody = document.querySelector("#bookingTable tbody");
  tbody.innerHTML = "";

  bookings.forEach(b => {
    tbody.innerHTML += `
      <tr>
        <td>${b.firstName} ${b.lastName}</td>
        <td>${b.service}</td>
        <td>${b.date} (${b.time})</td>
        <td>${b.trackingId}</td>
        <td>${b.status}</td>
        <td>
          <select onchange="updateStatus('${b._id}', this.value)">
            <option value="">Change</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </td>
      </tr>
    `;
  });
}

async function updateStatus(id, status) {
  await fetch(`https://easy-wgff.onrender.com/api/update-status/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });

  loadBookings();
}

loadBookings();

async function updateStatus(id, status) {
  try {
    const response = await fetch(`https://easy-wgff.onrender.com/api/book-service/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const result = await response.json();
    if (result.success) {
      alert(`✅ Status updated to "${status}"`);
      loadBookings(); // refresh table
    } else {
      alert("⚠️ Could not update status");
    }
  } catch (err) {
    console.error("Error updating status:", err);
    alert("❌ Error updating status");
  }
}

const loginBtn = document.getElementById("loginBtn");
const loginContainer = document.getElementById("login-container");
const dashboard = document.getElementById("dashboard");
const loginError = document.getElementById("loginError");

let adminToken = "";

loginBtn.addEventListener("click", async () => {
  const username = document.getElementById("adminUser").value;
  const password = document.getElementById("adminPass").value;

  try {
    const res = await fetch("https://your-backend-url.onrender.com/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.success) {
      adminToken = data.token;
      loginContainer.classList.add("hidden");
      dashboard.classList.remove("hidden");
      loadBookings();
    } else {
      loginError.classList.remove("hidden");
    }
  } catch (err) {
    console.error(err);
    loginError.classList.remove("hidden");
  }
});

async function loadBookings() {
  try {
    const res = await fetch("https://your-backend-url.onrender.com/api/book-service", {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const bookings = await res.json();
    const tbody = document.getElementById("bookingTableBody");
    tbody.innerHTML = "";
    bookings.forEach(b => {
      tbody.innerHTML += `
        <tr>
          <td class="border px-2 py-1">${b.firstName} ${b.lastName}</td>
          <td class="border px-2 py-1">${b.email}</td>
          <td class="border px-2 py-1">${b.phone}</td>
          <td class="border px-2 py-1">${b.service}</td>
          <td class="border px-2 py-1">${b.date}</td>
          <td class="border px-2 py-1">${b.time}</td>
          <td class="border px-2 py-1">${b.details}</td>
        </tr>
      `;
    });
  } catch (err) {
    console.error(err);
  }
}
