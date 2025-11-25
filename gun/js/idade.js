// Script de verificação de idade
function handleIdadeVerification(isAdult) {
  const overlay = document.getElementById("IdadeOverlay");
  const deniedScreen = document.getElementById("IdadeDenied");
  const mainContent = document.getElementById("mainContent");

  if (isAdult) {
    overlay.style.display = "none";
    localStorage.setItem("isAdult", "true");
    mainContent.style.display = "block";
  } else {
    overlay.style.display = "none";
    deniedScreen.style.display = "flex";
    localStorage.setItem("isAdult", "false");

    setTimeout(() => {
      window.location.href = "https://www.google.com";
    }, 3000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const isAdult = localStorage.getItem("isAdult");
  const overlay = document.getElementById("IdadeOverlay");
  const deniedScreen = document.getElementById("IdadeDenied");
  const mainContent = document.getElementById("mainContent");

  if (isAdult === "true") {
    overlay.style.display = "none";
    deniedScreen.style.display = "none";
    mainContent.style.display = "block";
  } else if (isAdult === "false") {
    overlay.style.display = "none";
    deniedScreen.style.display = "flex";
    mainContent.style.display = "none";

    setTimeout(() => {
      window.location.href = "https://www.google.com";
    }, 3000);
  } else {
    overlay.style.display = "flex";
    deniedScreen.style.display = "none";
    mainContent.style.display = "none";
  }
});

// Função para scroll suave até o catálogo
function scrollToCatalog() {
  document.getElementById("catalogo").scrollIntoView({
    behavior: "smooth",
  });
}
