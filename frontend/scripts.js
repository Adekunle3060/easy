// ==========================
// GET FORM INPUT ELEMENTS
// ==========================
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const service = document.getElementById('service');
const date = document.getElementById('date');
const time = document.getElementById('time');
const details = document.getElementById('details');

// ==========================
// MOBILE MENU TOGGLE
// ==========================
// MOBILE MENU TOGGLE
const menuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuBtn.classList.toggle('active');
    });

    // Optional: close menu when link clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuBtn.classList.remove('active');
        });
    });
}



// ==========================
// SMOOTH SCROLLING
// ==========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });

        navLinks?.classList.remove('active');
        menuBtn?.classList.remove('active');
        overlay?.classList.remove('active');
    });
});

// ==========================
// SET MIN DATE
// ==========================
if (date) {
    date.setAttribute('min', new Date().toISOString().split('T')[0]);
}

// ==========================
// SCROLL TO BOOKING + PRE-SELECT SERVICE
// ==========================
document.querySelectorAll('.service-card').forEach(card => {
    const btn = card.querySelector('.btn-primary');
    const serviceType = card.dataset.service; // Example: <div class="service-card" data-service="plumbing">

    if (btn) {
        btn.addEventListener('click', () => {
            document.getElementById('booking')?.scrollIntoView({ behavior: "smooth" });
            
            // Auto-select service
            if (service && serviceType) {
                service.value = serviceType;
            }
        });
    }
});

// ==========================
// SERVICE PRICES (NGN)
// ==========================
const servicePrices = {
    plumbing: 10000,
    electrical: 15000,
    hvac: 20000,
    cleaning: 15000,
    handyman: 15000,
    painting: 10000,
};

// ==========================
// BOOKING FORM HANDLER
// ==========================
const form = document.getElementById('serviceBookingForm');
if (form) {
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Basic Validation
        if (!firstName.value || !email.value || !service.value) {
            alert("⚠️ Please fill all required fields.");
            return;
        }

        // Disable button while loading
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        const bookingData = {
            firstName: firstName.value.trim(),
            lastName: lastName.value.trim(),
            email: email.value.trim(),
            phone: phone.value.trim(),
            service: service.value,
            date: date.value,
            time: time.value,
            details: details.value.trim()
        };

        try {
            const res = await fetch("https://easy-wgff.onrender.com/api/book-service", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData)
            });

            const result = await res.json();
            console.log("Backend response:", result);

            if (result?.success) {
                payWithPaystack(bookingData, result.trackingId);
                form.reset();
            } else {
                alert(result?.message || "⚠️ Booking failed. Try again.");
            }
        } catch (err) {
            alert("❌ Failed to connect to server.");
            console.error(err);
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
}

// ==========================
// PAYSTACK PAYMENT
// ==========================
function payWithPaystack(bookingData, trackingId) {
    if (!window.PaystackPop) {
        alert("❌ Paystack SDK not loaded.");
        return;
    }

    const amount = (servicePrices[bookingData.service] || 5000) * 100;

    const handler = PaystackPop.setup({
        key: "pk_test_9c0c8023c9d5cc025e12c161c8d7a405b281aa8c",
        email: bookingData.email,
        amount,
        currency: "NGN",
        ref: `EZ-${trackingId}-${Date.now()}`,

        callback: function(response) {
            alert("💳 Payment Successful!\nRef: " + response.reference);
            fetch("https://easy-wgff.onrender.com/api/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reference: response.reference,
                    trackingId
                })
            }).catch(console.error);
        },

        onClose: function() {
            alert("❌ Payment cancelled.");
        }
    });

    handler.openIframe();
}
