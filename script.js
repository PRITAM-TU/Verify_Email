document.addEventListener('DOMContentLoaded', function() {
  // Mobile Menu Toggle
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  hamburger.addEventListener('click', function() {
      this.classList.toggle('active');
      mobileMenu.classList.toggle('active');
  });
  
  // Close mobile menu when clicking a link
  const mobileLinks = document.querySelectorAll('.mobile-menu a');
  mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
          hamburger.classList.remove('active');
          mobileMenu.classList.remove('active');
      });
  });
  
  // Navbar scroll effect
  window.addEventListener('scroll', function() {
      const navbar = document.querySelector('.navbar');
      if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
      } else {
          navbar.classList.remove('scrolled');
      }
  });
  
  // Smooth scrolling for navigation links
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
          }
      });
  });
  
  // Email validation function
  const emailInput = document.getElementById('email-input');
  const validateBtn = document.getElementById('validate-btn');
  const resultText = document.getElementById('result-text');
  const resultStats = document.getElementById('result-stats');
  
  validateBtn.addEventListener('click', validateEmail);
  emailInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
          validateEmail();
      }
  });
  
  function validateEmail() {
      const email = emailInput.value.trim();
      
      if (!email) {
          showResult('Please enter an email address', 'warning');
          return;
      }
      
      // Simple regex for basic validation (API will do the real validation)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
          showResult('Invalid email format', 'invalid');
          return;
      }
      
      // Show loading state
      showResult('Validating email...', 'loading');
      validateBtn.disabled = true;
      validateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validating';
      
      // API Key and Endpoint
      const apiKey = 'ema_live_g0njldRc05vGGpemKRhOwjuP6hiwGKJZI4CDOYVL';
      const apiUrl = `https://api.emailvalidation.io/v1/info?apikey=${apiKey}&email=${encodeURIComponent(email)}`;
      
      // Make API call
      fetch(apiUrl)
          .then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              return response.json();
          })
          .then(data => {
              processApiResponse(data);
          })
          .catch(error => {
              console.error('Error validating email:', error);
              showResult('Error validating email. Please try again.', 'invalid');
          })
          .finally(() => {
              validateBtn.disabled = false;
              validateBtn.innerHTML = '<i class="fas fa-check"></i> Validate';
          });
  }
  
  function processApiResponse(response) {
      const resultContainer = document.querySelector('.result-container');
      
      // Check if the response has the expected format
      if (!response || typeof response.state !== 'string') {
          showResult('Invalid API response format', 'invalid');
          return;
      }
      
      if (response.state === 'deliverable') {
          resultContainer.style.borderLeft = '5px solid var(--success-color)';
          showResult(`<strong>${response.email}</strong> is a valid and deliverable email address`, 'valid');
          
          let statsHTML = '';
          
          if (response.disposable === 'true') {
              statsHTML += `
                  <div class="stat-item warning">
                      <i class="fas fa-exclamation-triangle"></i>
                      Disposable email
                  </div>
              `;
          }
          
          if (response.free === 'true') {
              statsHTML += `
                  <div class="stat-item">
                      <i class="fas fa-envelope-open-text"></i>
                      Free provider
                  </div>
              `;
          }
          
          if (response.dns_valid === 'true') {
              statsHTML += `
                  <div class="stat-item valid">
                      <i class="fas fa-check-circle"></i>
                      Valid DNS records
                  </div>
              `;
          }
          
          if (response.smtp_check === 'true') {
              statsHTML += `
                  <div class="stat-item valid">
                      <i class="fas fa-server"></i>
                      SMTP server verified
                  </div>
              `;
          }
          
          resultStats.innerHTML = statsHTML;
      } else if (response.state === 'undeliverable') {
          resultContainer.style.borderLeft = '5px solid var(--danger-color)';
          showResult(`<strong>${response.email}</strong> is not deliverable`, 'invalid');
          
          let statsHTML = '';
          
          if (response.dns_valid === 'false') {
              statsHTML += `
                  <div class="stat-item invalid">
                      <i class="fas fa-times-circle"></i>
                      Invalid DNS records
                  </div>
              `;
          }
          
          if (response.smtp_check === 'false') {
              statsHTML += `
                  <div class="stat-item invalid">
                      <i class="fas fa-server"></i>
                      SMTP verification failed
                  </div>
              `;
          }
          
          if (response.did_you_mean) {
              statsHTML += `
                  <div class="stat-item">
                      <i class="fas fa-lightbulb"></i>
                      Did you mean: ${response.did_you_mean}?
                  </div>
              `;
          }
          
          resultStats.innerHTML = statsHTML;
      } else {
          // Handle other states (risky, unknown, etc.)
          resultContainer.style.borderLeft = '5px solid var(--warning-color)';
          showResult(`<strong>${response.email}</strong> validation result: ${response.state}`, 'warning');
          
          let statsHTML = '';
          
          if (response.score) {
              statsHTML += `
                  <div class="stat-item">
                      <i class="fas fa-percentage"></i>
                      Quality score: ${response.score}/1
                  </div>
              `;
          }
          
          if (response.reason) {
              statsHTML += `
                  <div class="stat-item">
                      <i class="fas fa-info-circle"></i>
                      ${response.reason}
                  </div>
              `;
          }
          
          resultStats.innerHTML = statsHTML;
      }
  }
  
  function showResult(message, type) {
      const resultIcon = document.querySelector('.result-icon i');
      
      resultText.innerHTML = message;
      
      // Reset all classes
      resultIcon.className = 'fas';
      
      switch(type) {
          case 'valid':
              resultIcon.classList.add('fa-check-circle');
              resultIcon.style.color = 'var(--success-color)';
              break;
          case 'invalid':
              resultIcon.classList.add('fa-times-circle');
              resultIcon.style.color = 'var(--danger-color)';
              break;
          case 'warning':
              resultIcon.classList.add('fa-exclamation-triangle');
              resultIcon.style.color = 'var(--warning-color)';
              break;
          case 'loading':
              resultIcon.classList.add('fa-spinner', 'fa-spin');
              resultIcon.style.color = 'var(--primary-color)';
              break;
          default:
              resultIcon.classList.add('fa-envelope');
              resultIcon.style.color = 'var(--primary-color)';
      }
  }
  
  // Animation on scroll
  const animateElements = document.querySelectorAll('.animate-pop-in');
  
  function checkAnimation() {
      animateElements.forEach(element => {
          const elementPosition = element.getBoundingClientRect().top;
          const screenPosition = window.innerHeight / 1.3;
          
          if (elementPosition < screenPosition) {
              element.style.animation = 'popIn 0.6s cubic-bezier(0.26, 0.53, 0.74, 1.48) forwards';
          }
      });
  }
  
  // Initial check
  checkAnimation();
  
  // Check on scroll
  window.addEventListener('scroll', checkAnimation);
  
  // Form submission
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          // In a real implementation, you would send the form data to your server
          alert('Thank you for your message! We will get back to you soon.');
          this.reset();
      });
  }
});