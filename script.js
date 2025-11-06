// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active navigation link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link, .footer-link');

function highlightNavigation() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 200;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNavigation);

// Filter buttons functionality
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        // Add your filter logic here
    });
});

// Form submission is handled by FormSubmit.co
// Set dynamic redirect URL based on current location
document.addEventListener('DOMContentLoaded', function() {
    const formRedirect = document.getElementById('formRedirect');
    if (formRedirect) {
        // Get current URL and construct thank-you page URL
        const currentUrl = window.location.href;
        const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);
        formRedirect.value = baseUrl + 'thank-you.html';
        console.log('Form will redirect to:', formRedirect.value);
    }
});

// Contact button is now a link, no JavaScript needed

// Hire me button - redirect to SuperProfile booking
const hireMeBtn = document.querySelector('.btn-primary');
if (hireMeBtn) {
    hireMeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        // Redirect to SuperProfile booking page
        window.open('https://superprofile.bio/bookings/ashwaniyadav00?sessionId=690c12078ad42000139095db', '_blank');
    });
}

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Scroll animations for sections
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe sections for animation (skip home section as it should be visible immediately)
document.querySelectorAll('section').forEach((section, index) => {
    if (section.id !== 'home') {
        section.classList.add('fade-in-section');
        observer.observe(section);
    }
});

// Add fade-in animation class
const style = document.createElement('style');
style.textContent = `
    .fade-in-section {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.8s ease, transform 0.8s ease;
    }
    
    .fade-in-section.visible {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

// Mouse-following animation for ALL floating elements
function addMouseFollowEffect(section, elementsSelector) {
    const sectionElement = document.querySelector(section);
    const floatingElements = document.querySelectorAll(elementsSelector);
    
    if (sectionElement && floatingElements.length > 0) {
        sectionElement.addEventListener('mousemove', function(e) {
            const rect = sectionElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            floatingElements.forEach((element, index) => {
                // Different movement speeds for each element
                const speed = (index + 1) * 0.015;
                const moveX = (x - rect.width / 2) * speed;
                const moveY = (y - rect.height / 2) * speed;
                
                // Get current rotation if element has one
                const currentTransform = window.getComputedStyle(element).transform;
                const hasRotation = element.classList.contains('floating-square') || 
                                   element.classList.contains('floating-square-2') ||
                                   element.classList.contains('contact-square-1') ||
                                   element.classList.contains('footer-square') ||
                                   element.classList.contains('footer-square-2');
                
                if (hasRotation) {
                    const rotation = element.classList.contains('floating-square') ? 45 : 
                                   element.classList.contains('floating-square-2') ? 25 :
                                   element.classList.contains('contact-square-1') ? 35 :
                                   element.classList.contains('footer-square') ? 25 : -20;
                    element.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotation}deg)`;
                } else {
                    element.style.transform = `translate(${moveX}px, ${moveY}px)`;
                }
            });
        });
        
        // Reset position when mouse leaves
        sectionElement.addEventListener('mouseleave', function() {
            floatingElements.forEach(element => {
                const hasRotation = element.classList.contains('floating-square') || 
                                   element.classList.contains('floating-square-2') ||
                                   element.classList.contains('contact-square-1') ||
                                   element.classList.contains('footer-square') ||
                                   element.classList.contains('footer-square-2');
                
                if (hasRotation) {
                    const rotation = element.classList.contains('floating-square') ? 45 : 
                                   element.classList.contains('floating-square-2') ? 25 :
                                   element.classList.contains('contact-square-1') ? 35 :
                                   element.classList.contains('footer-square') ? 25 : -20;
                    element.style.transform = `translate(0, 0) rotate(${rotation}deg)`;
                } else {
                    element.style.transform = 'translate(0, 0)';
                }
            });
        });
    }
}

// Apply mouse-following effect to all sections
addMouseFollowEffect('.home-section', '.floating-element');
addMouseFollowEffect('.contact-section', '.contact-float-element');
addMouseFollowEffect('.footer', '.footer-floating-element');

// Booking Popup on Main Page - Show after 8 seconds
const bookingPopup = document.getElementById('bookingPopup');
const closePopupBtn = document.getElementById('closePopup');

// Check if popup was already shown in this session
const popupShown = sessionStorage.getItem('bookingPopupShown');

if (!popupShown && bookingPopup) {
    // Show popup after 8 seconds
    setTimeout(() => {
        bookingPopup.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        sessionStorage.setItem('bookingPopupShown', 'true');
    }, 8000);
}

// Close popup functionality
if (closePopupBtn) {
    closePopupBtn.addEventListener('click', function() {
        bookingPopup.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    });
}

// Close popup when clicking outside
if (bookingPopup) {
    bookingPopup.addEventListener('click', function(e) {
        if (e.target === bookingPopup) {
            bookingPopup.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Allow Escape key to close popup
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && bookingPopup && bookingPopup.classList.contains('active')) {
        bookingPopup.classList.remove('active');
        document.body.style.overflow = '';
    }
});
