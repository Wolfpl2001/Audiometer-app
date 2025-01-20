document.addEventListener("DOMContentLoaded", () => {
  const emailForm = document.getElementById("emailForm");
  const activationForm = document.getElementById("activationForm");
  const submitEmail = document.getElementById("submitEmail");
  const submitButton = document.getElementById("submitButton");
  const activationCodeInput = document.getElementById("activationCode");
  const instructions = document.getElementById("instructions");

  // Simulatie of tijdelijke gegevens
  const Dev = true;
  const correctCode = "TEST-TEST-TEST-TEST";

  // Gebruik email en activeer de UI-overgangen
  submitEmail.addEventListener("click", () => {
    const email = document.getElementById("email").value.trim();
    if (email && /\S+@\S+\.\S+/.test(email)) {
      // Simuleer het verzenden van een e-mail en toon activeringsform
      alert(`Activeringscode is verzonden naar: ${email}`);
      console.info(
        "Simulated sending email with activation code:",
        correctCode
      );

      emailForm.classList.remove("active");
      activationForm.classList.add("active");
      instructions.textContent =
        "Voer de activeringscode in die naar je e-mailadres is verzonden.";
    } else {
      alert("Voer een geldig e-mailadres in.");
    }
  });

  // Verifieer de activeringscode
  submitButton.addEventListener("click", () => {
    const userCode = activationCodeInput.value.trim().toUpperCase();

    if (userCode === correctCode) {
      alert("Activering succesvol!");
      window.location.href = "index.html";
    } else {
      alert("Ongeldige activeringscode. Probeer het opnieuw.");
      console.warn("Invalid activation code entered:", userCode);
    }
  });

  // Automatisch formatteer invoer
  activationCodeInput.addEventListener("input", () => {
    let value = activationCodeInput.value.replace(/-/g, "").toUpperCase();
    activationCodeInput.value = value.match(/.{1,4}/g)?.join("-") || value;
  });

  // Testmodus afhandeling
  if (Dev) {
    console.info("Dev mode enabled. Redirecting to index.html...");
    window.location.href = "index.html";
  }
});
