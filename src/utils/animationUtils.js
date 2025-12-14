/**
 * Animation Utility Functions
 */

/**
 * Add stagger animation delay to elements
 * @param {number} index - Element index
 * @param {number} baseDelay - Base delay in ms
 * @returns {object} Style object with animation delay
 */
export const getStaggerDelay = (index, baseDelay = 100) => {
    return {
        animationDelay: `${index * baseDelay}ms`
    };
};

/**
 * Trigger ripple effect on element
 * @param {HTMLElement} element - Element to add ripple to
 * @param {MouseEvent} event - Mouse event
 */
export const triggerRippleEffect = (element, event) => {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple-effect');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
};

/**
 * Smooth scroll to element
 * @param {string} elementId - ID of element to scroll to
 * @param {number} offset - Offset from top in pixels
 */
export const smoothScrollTo = (elementId, offset = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
        const y = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
};

/**
 * Add entrance animation class to element
 * @param {HTMLElement} element - Element to animate
 * @param {string} animationClass - Animation class name
 * @param {number} delay - Delay before animation starts
 */
export const addEntranceAnimation = (element, animationClass = 'animate-fadeIn', delay = 0) => {
    setTimeout(() => {
        element.classList.add(animationClass);
    }, delay);
};

/**
 * Create fade transition between content changes
 * @param {HTMLElement} element - Element to transition
 * @param {Function} callback - Function to execute during transition
 * @param {number} duration - Transition duration in ms
 */
export const fadeTransition = async (element, callback, duration = 300) => {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease-in-out`;
    
    await new Promise(resolve => setTimeout(resolve, duration));
    
    callback();
    
    element.style.opacity = '1';
};

/**
 * Animate number count up
 * @param {HTMLElement} element - Element to update
 * @param {number} end - End value
 * @param {number} duration - Animation duration in ms
 * @param {string} suffix - Suffix to add (e.g., '%')
 */
export const animateCountUp = (element, end, duration = 1000, suffix = '') => {
    const start = 0;
    const increment = end / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, 16);
};

/**
 * Add loading skeleton animation
 * @param {HTMLElement} element - Element to add skeleton to
 */
export const addLoadingSkeleton = (element) => {
    element.classList.add('loading-skeleton');
};

/**
 * Remove loading skeleton animation
 * @param {HTMLElement} element - Element to remove skeleton from
 */
export const removeLoadingSkeleton = (element) => {
    element.classList.remove('loading-skeleton');
};

/**
 * Create particle effect
 * @param {HTMLElement} container - Container element
 * @param {object} options - Effect options
 */
export const createParticleEffect = (container, options = {}) => {
    const {
        count = 20,
        color = '#667eea',
        size = 4,
        duration = 1000
    } = options;
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = color;
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        
        const angle = (Math.PI * 2 * i) / count;
        const velocity = 50 + Math.random() * 50;
        const x = Math.cos(angle) * velocity;
        const y = Math.sin(angle) * velocity;
        
        particle.style.left = '50%';
        particle.style.top = '50%';
        particle.style.transition = `all ${duration}ms ease-out`;
        
        container.appendChild(particle);
        
        setTimeout(() => {
            particle.style.transform = `translate(${x}px, ${y}px)`;
            particle.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
            particle.remove();
        }, duration);
    }
};
