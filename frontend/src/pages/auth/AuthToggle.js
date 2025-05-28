/**
 * Handles the toggle functionality between login and signup forms
 */
export const initializeAuthToggle = () => {
    // Get container element
    const container = document.querySelector('.container');
    
    // Get toggle buttons
    const registerBtn = document.querySelector('.register-btn');
    const loginBtn = document.querySelector('.login-btn');
    
    // Add event listeners
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            container.classList.add('active');
        });
    }
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            container.classList.remove('active');
        });
    }
};
