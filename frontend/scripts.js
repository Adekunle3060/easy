// // Mobile menu toggle
// document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
//     document.querySelector('.nav-links').classList.toggle('active');
// });

// // Smooth scrolling
// document.querySelectorAll('a[href^="#"]').forEach(anchor => {
//     anchor.addEventListener('click', function(e) {
//         e.preventDefault();
//         const target = document.querySelector(this.getAttribute('href'));
//         window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
//     });
// });

// // Min date
// document.getElementById('date').setAttribute('min', new Date().toISOString().split('T')[0]);

// // Scroll to booking
// document.querySelectorAll('.service-card .btn-primary').forEach(btn =>
//     btn.addEventListener('click', () =>
//         document.getElementById('booking').scrollIntoView({ behavior: "smooth" })
//     )
// );

// // Submit booking
// document.getElementById('serviceBookingForm').addEventListener('submit', async function(e) {
//     e.preventDefault();

//     const bookingData = {
//         firstName: firstName.value,
//         lastName: lastName.value,
//         email: email.value,
//         phone: phone.value,
//         service: service.value,
//         date: date.value,
//         time: time.value,
//         details: details.value
//     };

//     try {
//         const res = await fetch("https://easy-wgff.onrender.com/api/book-service", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(bookingData)
//         });

//         const result = await res.json();

//         if (result.success) {
//             alert(`✅ Booking submitted!\nYour Tracking ID: ${result.trackingId}`);
//             this.reset();
//         } else {
//             alert("⚠️ Booking failed.");
//         }
//     } catch (err) {
//         alert("❌ Server unreachable.");
//         console.error(err);
//     }
// });

// ==========================
// MOBILE MENU TOGGLE
// ==========================
const menuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const overlay = document.querySelector('.menu-overlay');

menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
    overlay.classList.toggle('active');
});

overlay.addEventListener('click', () => {
    menuBtn.classList.remove('active');
    navLinks.classList.remove('active');
    overlay.classList.remove('active');
});

// ==========================
// SMOOTH SCROLLING
// ==========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });

        // Close menu after clicking link (mobile)
        navLinks.classList.remove('active');
        menuBtn.classList.remove('active');
        overlay.classList.remove('active');
    });
});

// ==========================
// SET MIN DATE IN CALENDAR
// ==========================
document.getElementById('date').setAttribute('min', new Date().toISOString().split('T')[0]);

// ==========================
// SCROLL TO BOOKING ON BUTTON CLICK
// ==========================
document.querySelectorAll('.service-card .btn-primary').forEach(btn =>
    btn.addEventListener('click', () =>
        document.getElementById('booking').scrollIntoView({ behavior: "smooth" })
    )
);

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
document.getElementById('serviceBookingForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const bookingData = {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        phone: phone.value,
        service: service.value,
        date: date.value,
        time: time.value,
        details: details.value
    };

    // Send booking to backend
    try {
        const res = await fetch("https://easy-wgff.onrender.com/api/book-service", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingData)
        });

        const result = await res.json();

        if (result.success) {
            // Launch payment
            payWithPaystack(bookingData, result.trackingId);
            this.reset();
        } else {
            alert("⚠️ Booking failed.");
        }

    } catch (err) {
        alert("❌ Server unreachable.");
        console.error(err);
    }
});

// ==========================
// PAYSTACK PAYMENT
// ==========================
function payWithPaystack(bookingData, trackingId) {
    const amount = (servicePrices[bookingData.service] || 5000) * 100; // in Kobo

    let handler = PaystackPop.setup({
        key: "pk_test_9c0c8023c9d5cc025e12c161c8d7a405b281aa8c", // ← Replace with your Paystack PUBLIC KEY
        email: bookingData.email,
        amount: amount,
        currency: "NGN",
        ref: `EZ-${trackingId}-${Date.now()}`,

        callback: function(response) {
            alert("💳 Payment Successful!\nRef: " + response.reference);

            // verify payment in backend
            fetch("https://easy-wgff.onrender.com/api/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reference: response.reference,
                    trackingId: trackingId
                })
            });
        },

        onClose: function() {
            alert("Payment cancelled.");
        }
    });

    handler.openIframe();
}
