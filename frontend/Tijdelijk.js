document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('submitButton');
    const Dev = true;
    if (Dev !== true) {
        if (button) {
            button.addEventListener('click', () => {
                const input = document.getElementById('activationCode');
                const code = "TEST-TEST-TEST-TEST";

                if (input.value.trim().toUpperCase() === code) {
                    window.location.href = "index.html";
                } else {
                    alert("Invalid activation code. Please try again.");
                }
            });
        } else {
            console.error('Element with id "submitButton" not found');
        }
    } else {
        window.location.href = "index.html";
    }
});
