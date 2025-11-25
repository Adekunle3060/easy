// --- Admin JS ---

const loginBtn = document.getElementById("loginBtn");
const loginContainer = document.getElementById("login-container");
const dashboard = document.getElementById("dashboard");
const loginError = document.getElementById("loginError");
const tbody = document.getElementById("bookingTableBody");

let adminToken = "";

// --- Admin Login ---
loginBtn.addEventListener("click", async () => {
  const username = document.getElementById("adminUser").value.trim();
  const password = document.getElementById("adminPass").value.trim();

  try {
    const res = await fetch("https://easy-wgff.onrender.com/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.success) {
      adminToken = data.token;
      loginContainer.classList.add("hidden");
      dashboard.classList.remove("hidden");
      await loadBookings();
    } else {
      loginError.classList.remove("hidden");
    }
  } catch (err) {
    console.error(err);
    loginError.classList.remove("hidden");
  }
});

// --- Load Bookings ---
async function loadBookings() {
  try {
    const res = await fetch("https://easy-wgff.onrender.com/api/book-service", {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    const bookings = await res.json();

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
          <td class="border px-2 py-1">
            <select onchange="updateStatus('${b._id}', this.value)">
              <option value="">Change</option>
              <option value="pending" ${b.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="accepted" ${b.status === 'accepted' ? 'selected' : ''}>Accepted</option>
              <option value="in-progress" ${b.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
              <option value="completed" ${b.status === 'completed' ? 'selected' : ''}>Completed</option>
              <option value="cancelled" ${b.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error("Error loading bookings:", err);
    alert("❌ Could not load bookings. Check console for details.");
  }
}

// --- Update Booking Status ---
async function updateStatus(id, status) {
  if (!status) return; // ignore if "Change" selected
  try {
    const res = await fetch(`https://easy-wgff.onrender.com/api/book-service/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status })
    });

    const result = await res.json();

    if (result.success) {
      alert(`✅ Status updated to "${status}"`);
      await loadBookings(); // refresh table
    } else {
      alert("⚠️ Could not update status");
    }
  } catch (err) {
    console.error("Error updating status:", err);
    alert("❌ Error updating status");
  }
}
