// Mobile menu toggle
document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
    } else {
        navLinks.style.display = 'flex';
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            const navLinks = document.querySelector('.nav-links');
            if (window.innerWidth <= 768 && navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            }
        }
    });
});

// Set minimum date for booking to today
const today = new Date().toISOString().split('T')[0];
document.getElementById('date').setAttribute('min', today);

// Button scroll to booking section
const buttons = document.querySelectorAll('button.btn.btn-primary');
buttons.forEach(button => {
    button.addEventListener('click', () => {
        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
            bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Form submission
document.getElementById('serviceBookingForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const bookingData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        service: document.getElementById('service').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        details: document.getElementById('details').value
    };

    try {
        const response = await fetch('https://easy-m117.onrender.com/api/book-service', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();
        if (result.success) {
            alert('✅ Booking request sent successfully!');
            this.reset();
        } else {
            alert('⚠️ Something went wrong.');
        }
    } catch (error) {
        console.error('Error sending booking:', error);
        alert('❌ Could not connect to the server.');
    }
});
