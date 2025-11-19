// Mobile menu toggle
document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('active');
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    });
});

// Min date
document.getElementById('date').setAttribute('min', new Date().toISOString().split('T')[0]);

// Scroll to booking
document.querySelectorAll('.service-card .btn-primary').forEach(btn =>
    btn.addEventListener('click', () =>
        document.getElementById('booking').scrollIntoView({ behavior: "smooth" })
    )
);

// Submit booking
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

    try {
        const res = await fetch("https://easy-wgff.onrender.com/api/book-service", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingData)
        });

        const result = await res.json();

        if (result.success) {
            alert(`✅ Booking submitted!\nYour Tracking ID: ${result.trackingId}`);
            this.reset();
        } else {
            alert("⚠️ Booking failed.");
        }
    } catch (err) {
        alert("❌ Server unreachable.");
        console.error(err);
    }
});
