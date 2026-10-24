(() => {
  "use strict";

  const form = document.querySelector("#verify-form");
  const humanCheck = document.querySelector("#human-check");
  const error = document.querySelector("#form-error");
  const button = document.querySelector("#verify-button");
  const result = document.querySelector("#result");
  const resetButton = document.querySelector("#reset-button");

  if (!form || !humanCheck || !error || !button || !result || !resetButton) {
    console.error("Não foi possível inicializar a interface de verificação.");
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    error.textContent = "";

    if (!humanCheck.checked) {
      error.textContent = "Marque a caixa acima para continuar.";
      humanCheck.focus();
      return;
    }

    // Esta é somente uma demonstração visual no navegador.
    // Para validar usuários ou conceder cargos no Discord, integre um backend/bot seguro.
    form.hidden = true;
    result.hidden = false;
  });

  resetButton.addEventListener("click", () => {
    result.hidden = true;
    form.hidden = false;
    humanCheck.checked = false;
    error.textContent = "";
    humanCheck.focus();
  });

  humanCheck.addEventListener("change", () => {
    if (humanCheck.checked) error.textContent = "";
  });
})(); 
