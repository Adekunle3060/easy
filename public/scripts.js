// Mobile menu toggle
        document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
            const navLinks = document.querySelector('.nav-links');
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
            }
        });
        
        // Form submission
        // document.getElementById('serviceBookingForm').addEventListener('submit', function(e) {
        //     e.preventDefault();
        //     alert('Thank you for your booking request! We will contact you shortly to confirm your appointment.');
        //     this.reset();
        // });
        document.getElementById('serviceBookingForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  // ...collect form data and send via fetch()
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

        // for button scrolling
        const buttons = document.querySelectorAll('button.btn.btn-primary');
     
        buttons.forEach(button => {
      button.addEventListener('click', () => {
    const bookingSection = document.getElementById('booking');
    
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
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
    const response = await fetch('http://localhost:5000/api/book-service', {
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

