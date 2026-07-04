// Öffentlicher Web3Forms Access Key (darf im Client-Code stehen)
const ACCESS_KEY = "bcff2d3b-bdec-4b48-b315-86765a998203";

const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const formView = document.getElementById('form-view');
const successView = document.getElementById('success-view');
const formError = document.getElementById('form-error');

const emailInput = document.getElementById('email');
const telefonInput = document.getElementById('telefon');
const einwilligungInput = document.getElementById('einwilligung');

const emailError = document.getElementById('email-error');
const telefonError = document.getElementById('telefon-error');
const einwilligungError = document.getElementById('einwilligung-error');

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function showError(input, errorEl, message) {
  input.classList.add('invalid');
  errorEl.textContent = message;
  errorEl.classList.add('visible');
}

function clearError(input, errorEl) {
  input.classList.remove('invalid');
  errorEl.textContent = '';
  errorEl.classList.remove('visible');
}

function validateForm() {
  let valid = true;

  clearError(emailInput, emailError);
  clearError(telefonInput, telefonError);
  einwilligungError.classList.remove('visible');
  einwilligungError.textContent = '';

  if (!emailInput.value.trim() || !isValidEmail(emailInput.value.trim())) {
    showError(emailInput, emailError, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
    valid = false;
  }

  if (!telefonInput.value.trim()) {
    showError(telefonInput, telefonError, 'Bitte geben Sie Ihre Telefonnummer ein.');
    valid = false;
  }

  if (!einwilligungInput.checked) {
    einwilligungError.textContent = 'Bitte stimmen Sie der Datenverarbeitung zu.';
    einwilligungError.classList.add('visible');
    valid = false;
  }

  return valid;
}

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  formError.textContent = '';
  formError.classList.remove('visible');

  // Honeypot: wenn ausgefüllt, still abbrechen (Bot)
  const botcheck = document.getElementById('botcheck');
  if (botcheck.value.trim() !== '') {
    return;
  }

  if (!validateForm()) {
    return;
  }

  const vorname = document.getElementById('vorname').value.trim();
  const nachname = document.getElementById('nachname').value.trim();
  const email = emailInput.value.trim();
  const telefon = telefonInput.value.trim();
  const gesendetAm = new Date().toLocaleString('de-DE');

  const message =
    `Neue Kontaktanfrage über den QR-Code:\n` +
    `Vorname: ${vorname}\n` +
    `Nachname: ${nachname}\n` +
    `E-Mail: ${email}\n` +
    `Telefon: ${telefon}\n` +
    `Gesendet am: ${gesendetAm}`;

  const payload = {
    access_key: ACCESS_KEY,
    subject: 'Interesse an abstract painting',
    from_name: 'Till Rohde – Kontaktformular',
    vorname: vorname,
    nachname: nachname,
    email: email,
    telefon: telefon,
    replyto: email,
    message: message
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Senden …';

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      formView.classList.add('hidden');
      successView.classList.remove('hidden');
    } else {
      throw new Error('Web3Forms meldete einen Fehler.');
    }
  } catch (err) {
    formError.textContent = 'Etwas ist schiefgelaufen. Bitte versuchen Sie es später erneut oder schreiben Sie direkt an art@tillrohde.com.';
    formError.classList.add('visible');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Senden';
  }
});
