const sign_in_btn = document.querySelector('#sign-in-btn');
const sign_up_btn = document.querySelector('#sign-up-btn');
const container = document.querySelector('.container');

const signInForm = document.querySelector('.sign-in-form');
const signUpForm = document.querySelector('.sign-up-form');

function validateForm(form) {
    const inputs = form.querySelectorAll('input');
    let valid = true;

    inputs.forEach((input) => {
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

sign_up_btn.addEventListener('click', () => {
    container.classList.add('sign-up-mode');
});

sign_in_btn.addEventListener('click', () => {
    container.classList.remove('sign-up-mode');
});

signInForm.addEventListener('submit', (e) => {
    if (!validateForm(signInForm)) {
        e.preventDefault();
    }
});

signUpForm.addEventListener('submit', (e) => {
    if (!validateForm(signUpForm)) {
        e.preventDefault();
    }
});