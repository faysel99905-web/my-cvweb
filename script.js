// CV Website JavaScript Functionality
// Author: Fissal Ali

class CVWebsite {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.isMenuOpen = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyTheme(this.currentTheme);
        this.setupSmoothScrolling();
        this.setupScrollAnimations();
        this.setupFormHandling();
        this.setupAccessibility();
        this.setupNavbarScroll(); // Initialize navbar as fixed from the start
        
        // Ensure 3D model backgrounds are applied after page load
        setTimeout(() => {
            this.updateSplineBackgrounds(this.currentTheme);
        }, 1000);
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Mobile menu toggle
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close mobile menu when clicking on links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.isMenuOpen) {
                    this.toggleMobileMenu();
                }
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                this.toggleMobileMenu();
            }
        });

        // Navbar scroll effect is now handled in init()
        this.setupActiveNavHighlighting();

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));

        // Window resize handler
        window.addEventListener('resize', () => this.handleResize());
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
        
        // Update 3D model backgrounds to match theme
        this.updateSplineBackgrounds(theme);
    }

    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        const navMenu = document.getElementById('nav-menu');
        const hamburger = document.getElementById('hamburger');
        
        if (navMenu && hamburger) {
            navMenu.classList.toggle('active', this.isMenuOpen);
            hamburger.classList.toggle('active', this.isMenuOpen);
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
        }
    }

    setupSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 70; // Account for fixed navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupNavbarScroll() {
        const navbar = document.getElementById('navbar');
        
        // Check if navbar exists
        if (!navbar) {
            console.warn('Navbar element not found');
            return;
        }
        
        let lastScrollY = window.scrollY;
        let isFixed = false;
        
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const navbarHeight = navbar.offsetHeight;
            
            // When scrolling down and past the navbar's original position
            if (currentScrollY > navbarHeight && !isFixed) {
                navbar.classList.add('fixed');
                document.body.classList.add('navbar-fixed');
                isFixed = true;
            }
            // When scrolling back up to the top
            else if (currentScrollY <= navbarHeight && isFixed) {
                navbar.classList.remove('fixed');
                document.body.classList.remove('navbar-fixed');
                isFixed = false;
            }
            
            lastScrollY = currentScrollY;
        };
        
        // Throttle scroll events for better performance
        const throttledScroll = Utils.throttle(handleScroll, 16); // ~60fps
        window.addEventListener('scroll', throttledScroll);
        
        // Initial check
        handleScroll();
    }

    setupActiveNavHighlighting() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('section[id]');
        
        // Function to update active nav link
        const updateActiveNav = () => {
            let current = '';
            const scrollPosition = window.scrollY + 150; // Offset for better detection
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });
            
            // Special case for home section
            if (window.scrollY < 200) {
                current = 'home';
            }
            
            // Update nav links
            navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href === `#${current}` || (current === 'home' && href === '#home')) {
                    link.classList.add('active');
                }
            });
        };
        
        // Update on scroll
        window.addEventListener('scroll', Utils.throttle(updateActiveNav, 50));
        
        // Update on page load
        setTimeout(updateActiveNav, 100);
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animatedElements = document.querySelectorAll('.timeline-item, .skill-category, .project-card, .stat');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    setupFormHandling() {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Form field animations
        const formGroups = document.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            const input = group.querySelector('input, textarea');
            const label = group.querySelector('label');
            
            if (input && label) {
                input.addEventListener('focus', () => {
                    group.classList.add('focused');
                });
                
                input.addEventListener('blur', () => {
                    if (!input.value) {
                        group.classList.remove('focused');
                    }
                });
                
                // Check if input has value on load
                if (input.value) {
                    group.classList.add('focused');
                }
            }
        });
    }

    handleFormSubmit(e) {
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Set reply-to field to the sender's email
        const emailInput = e.target.querySelector('input[name="email"]');
        const replyToField = e.target.querySelector('input[name="_replyto"]');
        if (emailInput && replyToField) {
            replyToField.value = emailInput.value;
        }
        
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        // Let the form submit naturally to Formspree
        // The form will redirect to a success page or show success message
        // We'll handle the success/error states after submission
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: type === 'success' ? '#00d4aa' : '#ff6b6b'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    handleNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.style.background = this.currentTheme === 'dark' 
                    ? 'rgba(15, 23, 42, 0.98)' 
                    : 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = this.currentTheme === 'dark' 
                    ? 'rgba(15, 23, 42, 0.95)' 
                    : 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        }
    }

    handleKeyboardNavigation(e) {
        // ESC key closes mobile menu
        if (e.key === 'Escape' && this.isMenuOpen) {
            this.toggleMobileMenu();
        }
        
        // Tab navigation enhancement
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    }

    handleResize() {
        // Close mobile menu on desktop
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.toggleMobileMenu();
        }
    }

    updateSplineBackgrounds(theme) {
        // Wait a bit for Spline viewers to be fully loaded
        setTimeout(() => {
            // Get all spline viewers
            const splineViewers = document.querySelectorAll('spline-viewer');
            
            splineViewers.forEach(viewer => {
                // Force update the background style with multiple approaches
                if (theme === 'dark') {
                    viewer.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
                    viewer.style.backgroundColor = '#0f172a';
                    viewer.setAttribute('style', viewer.getAttribute('style') + '; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important; background-color: #0f172a !important;');
                } else {
                    viewer.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
                    viewer.style.backgroundColor = '#ffffff';
                    viewer.setAttribute('style', viewer.getAttribute('style') + '; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important; background-color: #ffffff !important;');
                }
                
                // Also try to update any canvas elements inside
                const canvas = viewer.querySelector('canvas');
                if (canvas) {
                    if (theme === 'dark') {
                        canvas.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
                        canvas.style.backgroundColor = '#0f172a';
                    } else {
                        canvas.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
                        canvas.style.backgroundColor = '#ffffff';
                    }
                }
            });
            
            // Special handling for hero spline (first one, background overlay)
            const heroSpline = document.querySelector('body > spline-viewer');
            if (heroSpline) {
                if (theme === 'dark') {
                    heroSpline.style.background = 'linear-gradient(135deg, rgba(15, 23, 42, 0.1) 0%, rgba(30, 41, 59, 0.1) 100%)';
                    heroSpline.style.backgroundColor = 'rgba(15, 23, 42, 0.1)';
                } else {
                    heroSpline.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(248, 250, 252, 0.1) 100%)';
                    heroSpline.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }
            }
            
            // Special handling for skills section spline
            const skillsSpline = document.querySelector('.skills spline-viewer');
            if (skillsSpline) {
                if (theme === 'dark') {
                    skillsSpline.style.background = '#0f172a';
                    skillsSpline.style.backgroundColor = '#0f172a';
                    skillsSpline.style.border = '1px solid #334155';
                    skillsSpline.style.borderRadius = '0.5rem';
                    skillsSpline.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.4)';
                } else {
                    skillsSpline.style.background = '#ffffff';
                    skillsSpline.style.backgroundColor = '#ffffff';
                    skillsSpline.style.border = '1px solid #e2e8f0';
                    skillsSpline.style.borderRadius = '0.5rem';
                    skillsSpline.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                }
            }
        }, 100);
    }

    setupAccessibility() {
        // Add skip link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        Object.assign(skipLink.style, {
            position: 'absolute',
            top: '-40px',
            left: '6px',
            background: '#000',
            color: '#fff',
            padding: '8px',
            textDecoration: 'none',
            zIndex: '10000',
            transition: 'top 0.3s'
        });
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add main content landmark
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.id = 'main-content';
            hero.setAttribute('role', 'main');
        }
        
        // Enhance focus indicators
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
    }
}

// Utility functions
class Utils {
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
}

// Performance optimizations
class PerformanceOptimizer {
    constructor() {
        this.setupLazyLoading();
        this.optimizeAnimations();
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    optimizeAnimations() {
        // Reduce animations on low-end devices
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
            document.documentElement.style.setProperty('--transition-fast', '0.1s');
            document.documentElement.style.setProperty('--transition-normal', '0.2s');
            document.documentElement.style.setProperty('--transition-slow', '0.3s');
        }

        // Respect user's motion preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--transition-fast', '0.01s');
            document.documentElement.style.setProperty('--transition-normal', '0.01s');
            document.documentElement.style.setProperty('--transition-slow', '0.01s');
        }
    }
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    // Could send error to analytics service here
});

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new CVWebsite();
        new PerformanceOptimizer();
        
        // Initialize PDF viewer
        window.pdfViewer = new PDFViewer();
        
        // Initialize Certificate viewer
        window.certificateViewer = new CertificateViewer();
        
        // Add loading complete class for any loading animations
        document.body.classList.add('loaded');
        
        console.log('CV Website initialized successfully');
    } catch (error) {
        console.error('Failed to initialize CV website:', error);
    }
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// PDF Viewer functionality
class PDFViewer {
    constructor() {
        this.modal = document.getElementById('pdf-modal');
        this.iframe = document.getElementById('pdf-viewer');
        this.fallback = document.querySelector('.pdf-fallback');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close modal when clicking outside
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.classList.contains('show')) {
                this.close();
            }
        });

        // Check if PDF can be displayed
        this.checkPDFSupport();
    }

    open() {
        if (this.modal) {
            this.modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Focus management for accessibility
            const closeBtn = this.modal.querySelector('.pdf-close-btn');
            if (closeBtn) {
                closeBtn.focus();
            }
        }
    }

    close() {
        if (this.modal) {
            this.modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    checkPDFSupport() {
        // Check if browser supports PDF viewing
        const supportsPDF = this.iframe && 
            (navigator.mimeTypes && navigator.mimeTypes['application/pdf']) ||
            (window.chrome && window.chrome.webstore);

        if (!supportsPDF && this.fallback) {
            this.fallback.style.display = 'block';
            if (this.iframe) {
                this.iframe.style.display = 'none';
            }
        }
    }
}

// Global functions for PDF viewer
function openPDFViewer() {
    if (window.pdfViewer) {
        window.pdfViewer.open();
    }
}

function closePDFViewer() {
    if (window.pdfViewer) {
        window.pdfViewer.close();
    }
}

// Certificate Viewer functionality
class CertificateViewer {
    constructor() {
        this.modal = document.getElementById('certificate-modal');
        this.iframe = document.getElementById('certificate-viewer');
        this.fallback = document.querySelector('#certificate-modal .pdf-fallback');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close modal when clicking outside
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.classList.contains('show')) {
                this.close();
            }
        });

        // Check if PDF can be displayed
        this.checkPDFSupport();
    }

    open() {
        if (this.modal) {
            this.modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Focus management for accessibility
            const closeBtn = this.modal.querySelector('.pdf-close-btn');
            if (closeBtn) {
                closeBtn.focus();
            }
        }
    }

    close() {
        if (this.modal) {
            this.modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    checkPDFSupport() {
        // Check if browser supports PDF viewing
        const supportsPDF = this.iframe && 
            (navigator.mimeTypes && navigator.mimeTypes['application/pdf']) ||
            (window.chrome && window.chrome.webstore);

        if (!supportsPDF && this.fallback) {
            this.fallback.style.display = 'block';
            if (this.iframe) {
                this.iframe.style.display = 'none';
            }
        }
    }
}

// Global functions for Certificate viewer
function openCertificateViewer() {
    if (window.certificateViewer) {
        window.certificateViewer.open();
    }
}

function closeCertificateViewer() {
    if (window.certificateViewer) {
        window.certificateViewer.close();
    }
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CVWebsite, Utils, PerformanceOptimizer, PDFViewer, CertificateViewer };
}