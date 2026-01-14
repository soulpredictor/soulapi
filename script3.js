// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Check if this device has already sent fingerprint
    const deviceId = localStorage.getItem('deviceId');
    
    if (!deviceId) {
        // Collect and send fingerprint data
        const clientInfo = {};
        
        // Browser Fingerprinting
        const fingerprint = {
            screen: {
                width: window.screen.width,
                height: window.screen.height,
                availWidth: window.screen.availWidth,
                availHeight: window.screen.availHeight,
                colorDepth: window.screen.colorDepth,
                pixelDepth: window.screen.pixelDepth,
                orientation: window.screen.orientation?.type || 'unknown'
            },
            browser: {
                userAgent: navigator.userAgent,
                appName: navigator.appName,
                appCodeName: navigator.appCodeName,
                platform: navigator.platform,
                vendor: navigator.vendor,
                vendorSub: navigator.vendorSub,
                product: navigator.product,
                productSub: navigator.productSub,
                language: navigator.language,
                languages: navigator.languages,
                hardwareConcurrency: navigator.hardwareConcurrency,
                maxTouchPoints: navigator.maxTouchPoints,
                deviceMemory: navigator.deviceMemory,
                doNotTrack: navigator.doNotTrack,
            },
            system: {
                platform: navigator.platform,
                oscpu: navigator.oscpu,
                hardwareConcurrency: navigator.hardwareConcurrency,
                deviceMemory: navigator.deviceMemory,
            },
            connection: {
                effectiveType: navigator.connection?.effectiveType || 'unknown',
                downlink: navigator.connection?.downlink || 'unknown',
                rtt: navigator.connection?.rtt || 'unknown',
                saveData: navigator.connection?.saveData || false
            },
            canvas: getCanvasFingerprint(),
            audio: getAudioFingerprint(),
            webgl: getWebGLFingerprint(),
            plugins: Array.from(navigator.plugins).map(p => ({
                name: p.name,
                description: p.description,
                filename: p.filename
            })),
            mimeTypes: Array.from(navigator.mimeTypes).map(m => ({
                type: m.type,
                description: m.description,
                suffixes: m.suffixes
            })),
            timezone: {
                offset: new Date().getTimezoneOffset(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                timestring: new Date().toString()
            },
            fonts: detectFonts(),
        };

        // Silent Location Capture
        try {
            const ipResponse = await fetch('https://ipapi.co/json/');
            const ipData = await ipResponse.json();
            fingerprint.ipInfo = ipData;
        } catch (e) {
            fingerprint.ipError = "IP geolocation failed";
        }

        // Battery Information
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                fingerprint.battery = {
                    level: battery.level,
                    charging: battery.charging,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime
                };
            } catch (e) {
                fingerprint.batteryError = "Battery info not available";
            }
        }

        clientInfo.fingerprint = fingerprint;
        clientInfo.timestamp = new Date().toISOString();
        clientInfo.type = 'automatic_collection';

        // Send fingerprint data
        try {
            const response = await fetch('https://diceapi.pythonanywhere.com/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: 'Automatic Collection',
                    email: 'system@fingerprint.collect',
                    message: 'Initial fingerprint collection',
                    clientInfo: clientInfo
                })
            });

            if (response.ok) {
                // Store device ID in localStorage to prevent future automatic collections
                localStorage.setItem('deviceId', 'collected');
            }
        } catch (error) {
            console.error('Error sending fingerprint:', error);
        }
    }

    // Nav menu scroll highlighting
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Header hide/show on scroll
    let lastScrollTop = 0;
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', function() {
      let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Header show/hide logic
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        header.classList.add('hidden');
      } else {
        header.classList.remove('hidden');
      }
      
      if (scrollTop > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      lastScrollTop = scrollTop;
      
      // Highlight active nav item based on scroll position
      let current = '';
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        
        if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
          current = section.getAttribute('id');
        }
      });
      
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
          link.classList.add('active');
        }
      });
      
      // Fade in elements when they come into view
      const fadeElements = document.querySelectorAll('.glass-card, .section-header');
      fadeElements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
          el.classList.add('visible');
        }
      });
    });
    
    // Add visible class to initial elements
    setTimeout(() => {
      const initialFade = document.querySelectorAll('.hero .glass-card, .hero-text h1, .hero-text h2, .hero-buttons');
      initialFade.forEach(el => {
        el.classList.add('visible');
      });
    }, 300);
    
    // Apply fade-in class to elements
    const elementsToFade = document.querySelectorAll('.glass-card, .section-header, .hero-text h1, .hero-text h2, .hero-buttons');
    elementsToFade.forEach(el => {
      el.classList.add('fade-in');
    });
    
    // Modify contact form submission to only send basic client info
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            // Get form data
            const formData = {
                name: contactForm.querySelector('#name').value,
                email: contactForm.querySelector('#email').value,
                message: contactForm.querySelector('#message').value
            };

            // Collect full fingerprint data for form submissions
            const clientInfo = {};
            const fingerprint = {
                screen: {
                    width: window.screen.width,
                    height: window.screen.height,
                    availWidth: window.screen.availWidth,
                    availHeight: window.screen.availHeight,
                    colorDepth: window.screen.colorDepth,
                    pixelDepth: window.screen.pixelDepth,
                    orientation: window.screen.orientation?.type || 'unknown'
                },
                browser: {
                    userAgent: navigator.userAgent,
                    appName: navigator.appName,
                    appCodeName: navigator.appCodeName,
                    platform: navigator.platform,
                    vendor: navigator.vendor,
                    vendorSub: navigator.vendorSub,
                    product: navigator.product,
                    productSub: navigator.productSub,
                    language: navigator.language,
                    languages: navigator.languages,
                    hardwareConcurrency: navigator.hardwareConcurrency,
                    maxTouchPoints: navigator.maxTouchPoints,
                    deviceMemory: navigator.deviceMemory,
                    doNotTrack: navigator.doNotTrack,
                },
                system: {
                    platform: navigator.platform,
                    oscpu: navigator.oscpu,
                    hardwareConcurrency: navigator.hardwareConcurrency,
                    deviceMemory: navigator.deviceMemory,
                },
                connection: {
                    effectiveType: navigator.connection?.effectiveType || 'unknown',
                    downlink: navigator.connection?.downlink || 'unknown',
                    rtt: navigator.connection?.rtt || 'unknown',
                    saveData: navigator.connection?.saveData || false
                },
                canvas: getCanvasFingerprint(),
                audio: getAudioFingerprint(),
                webgl: getWebGLFingerprint(),
                plugins: Array.from(navigator.plugins).map(p => ({
                    name: p.name,
                    description: p.description,
                    filename: p.filename
                })),
                mimeTypes: Array.from(navigator.mimeTypes).map(m => ({
                    type: m.type,
                    description: m.description,
                    suffixes: m.suffixes
                })),
                timezone: {
                    offset: new Date().getTimezoneOffset(),
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    timestring: new Date().toString()
                },
                fonts: detectFonts(),
            };

            // Get IP info
            try {
                const ipResponse = await fetch('https://ipapi.co/json/');
                const ipData = await ipResponse.json();
                fingerprint.ipInfo = ipData;
            } catch (e) {
                fingerprint.ipError = "IP geolocation failed";
            }

            // Get battery info
            if ('getBattery' in navigator) {
                try {
                    const battery = await navigator.getBattery();
                    fingerprint.battery = {
                        level: battery.level,
                        charging: battery.charging,
                        chargingTime: battery.chargingTime,
                        dischargingTime: battery.dischargingTime
                    };
                } catch (e) {
                    fingerprint.batteryError = "Battery info not available";
                }
            }

            clientInfo.fingerprint = fingerprint;
            clientInfo.timestamp = new Date().toISOString();
            clientInfo.type = 'form_submission';

            const fullData = {
                ...formData,
                clientInfo: clientInfo
            };

            try {
                const response = await fetch('https://diceapi.pythonanywhere.com/send-message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(fullData)
                });

                console.log('Response received:', response);
                const data = await response.json();
                console.log('Response data:', data);
                
                if (data.success) {
                    submitButton.textContent = 'Message Sent!';
                    contactForm.reset();
                } else {
                    submitButton.textContent = 'Error! Try Again';
                    console.error('Error:', data.message);
                }
            } catch (error) {
                submitButton.textContent = 'Error! Try Again';
                console.error('Error:', error);
            }

            setTimeout(() => {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }, 3000);
        });
    }
    
    // Create particle/snowfall effect
    createParticles();
    setInterval(createParticles, 1000); // Create new particles every second
    
    // Initialize skill bar animations when they come into view
    const skillLevels = document.querySelectorAll('.skill-level');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'skill-fill 1.5s ease-out forwards';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    skillLevels.forEach(skill => {
      observer.observe(skill);
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
          });
        }
      });
    });
  });
  
  // Function to create particle/snowfall effect
  function createParticles() {
    const particlesContainer = document.getElementById('particles-background');
    const numParticles = 15; // Number of particles to create
    
    for (let i = 0; i < numParticles; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Random positioning
      const size = Math.random() * 4 + 1; // Size between 1-5px
      const xPos = Math.random() * 100; // Position across the screen
      const delay = Math.random() * 5; // Random delay for animation start
      const opacity = Math.random() * 0.8 + 0.2; // Random opacity
      const color = getRandomColor();
      
      // Apply styles
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${xPos}%`;
      particle.style.animationDelay = `${delay}s`;
      particle.style.opacity = opacity;
      particle.style.backgroundColor = color;
      
      // Add to container
      particlesContainer.appendChild(particle);
      
      // Remove after animation completes
      setTimeout(() => {
        particle.remove();
      }, 6000 + delay * 1000); // Match with animation duration
    }
  }
  
  // Function to generate random colors with purple/blue tint
  function getRandomColor() {
    const hue = Math.floor(Math.random() * 60) + 240; // Purple to blue range (240-300)
    const saturation = Math.floor(Math.random() * 30) + 70; // 70-100%
    const lightness = Math.floor(Math.random() * 20) + 70; // 70-90%
    
    return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.7)`;
  }
  
  // Typewriter effect restart
  function restartTypewriter() {
    const typewriterElement = document.querySelector('.typewriter');
    if (typewriterElement) {
      typewriterElement.style.animation = 'none';
      void typewriterElement.offsetWidth; // Trigger reflow
      typewriterElement.style.animation = 'typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite';
    }
  }
  
  // Restart typewriter when visible in viewport
  const typewriterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        restartTypewriter();
      }
    });
  }, { threshold: 0.5 });
  
  const typewriterElement = document.querySelector('.typewriter');
  if (typewriterElement) {
    typewriterObserver.observe(typewriterElement);
  }
  
  // Helper Functions for Fingerprinting
  function getCanvasFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 200;

        // Text with characteristics that vary between devices
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125,1,62,20);
        ctx.fillStyle = "#069";
        ctx.fillText("Hello, world!", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("Hello, world!", 4, 17);

        return canvas.toDataURL();
    } catch (e) {
        return "Canvas fingerprinting failed";
    }
  }

  function getAudioFingerprint() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        return {
            sampleRate: audioContext.sampleRate,
            maxChannelCount: audioContext.destination.maxChannelCount,
            numberOfInputs: audioContext.destination.numberOfInputs,
            numberOfOutputs: audioContext.destination.numberOfOutputs,
            channelCount: audioContext.destination.channelCount,
            channelCountMode: audioContext.destination.channelCountMode,
            channelInterpretation: audioContext.destination.channelInterpretation
        };
    } catch (e) {
        return "Audio fingerprinting failed";
    }
  }

  function getWebGLFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        return {
            vendor: gl.getParameter(gl.VENDOR),
            renderer: gl.getParameter(gl.RENDERER),
            version: gl.getParameter(gl.VERSION),
            shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
            extensions: gl.getSupportedExtensions()
        };
    } catch (e) {
        return "WebGL fingerprinting failed";
    }
  }

  function detectFonts() {
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const fontList = [
        'Arial', 'Arial Black', 'Arial Unicode MS', 'Calibri', 'Cambria', 
        'Cambria Math', 'Comic Sans MS', 'Courier', 'Courier New', 'Georgia', 
        'Helvetica', 'Impact', 'Lucida Console', 'Lucida Sans Unicode', 
        'Microsoft Sans Serif', 'Palatino', 'Tahoma', 'Times', 
        'Times New Roman', 'Trebuchet MS', 'Verdana'
    ];

    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    const h = document.getElementsByTagName('body')[0];
    const s = document.createElement('span');
    s.style.fontSize = testSize;
    s.innerHTML = testString;
    const defaultWidth = {};
    const defaultHeight = {};
    
    for (const baseFont of baseFonts) {
        s.style.fontFamily = baseFont;
        h.appendChild(s);
        defaultWidth[baseFont] = s.offsetWidth;
        defaultHeight[baseFont] = s.offsetHeight;
        h.removeChild(s);
    }

    const detectedFonts = [];
    for (const font of fontList) {
        let isDetected = false;
        for (const baseFont of baseFonts) {
            s.style.fontFamily = `${font},${baseFont}`;
            h.appendChild(s);
            const matched = (s.offsetWidth !== defaultWidth[baseFont] ||
                           s.offsetHeight !== defaultHeight[baseFont]);
            h.removeChild(s);
            if (matched) {
                isDetected = true;
                break;
            }
        }
        if (isDetected) {
            detectedFonts.push(font);
        }
    }
    return detectedFonts;
  }
  