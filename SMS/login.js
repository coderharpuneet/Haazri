const sign_in_btn = document.querySelector('#sign-in-btn');
const sign_up_btn = document.querySelector('#sign-up-btn');
const container = document.querySelector('.container');

// Form elements
const signInForm = document.querySelector('.sign-in-form');
const signUpForm = document.querySelector('.sign-up-form');

// Validation function
function validateForm(form) {
    const inputs = form.querySelectorAll('input');
    let valid = true;

    inputs.forEach((input) => {
        // Check for empty fields
        if (input.value.trim() === '') {
            valid = false;
            input.classList.add('error');
            input.nextElementSibling.textContent = `${input.placeholder} is required`;
        } else {
            input.classList.remove('error');
            input.nextElementSibling.textContent = '';
        }
    });

    return valid;
}

// Sign-up button click event
sign_up_btn.addEventListener('click', () => {
    container.classList.add('sign-up-mode');
});

// Sign-in button click event
sign_in_btn.addEventListener('click', () => {
    container.classList.remove('sign-up-mode');
});

// Sign-in form submission
signInForm.addEventListener('submit', (e) => {
    if (!validateForm(signInForm)) {
        e.preventDefault();
    }
});

// Sign-up form submission
signUpForm.addEventListener('submit', (e) => {
    if (!validateForm(signUpForm)) {
        e.preventDefault();
    }
});