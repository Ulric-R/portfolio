const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const emailAddress = "ulricrandrianiaina@gmail.com";

$("#year").textContent = new Date().getFullYear();

const navToggle = $("#navToggle");
const header = document.querySelector(".site-header");
if (navToggle && header) {
  navToggle.addEventListener("click", () => header.classList.toggle("open"));
}
$$("#mainNav a").forEach((link) =>
  link.addEventListener(
    "click",
    () => header && header.classList.remove("open"),
  ),
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);
$$(".reveal").forEach((el) => observer.observe(el));

const createParticles = () => {
  const particlesRoot = $("#particles");
  if (!particlesRoot) return;

  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 18; index += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.setProperty("--left", `${Math.random() * 100}`);
    particle.style.setProperty("--top", `${Math.random() * 100}`);
    particle.style.setProperty(
      "--size",
      `${(Math.random() * 10 + 6).toFixed(2)}px`,
    );
    particle.style.animationDelay = `${(Math.random() * 12).toFixed(2)}s`;
    fragment.appendChild(particle);
  }

  particlesRoot.appendChild(fragment);
};

const updatePointerGlow = (event) => {
  document.documentElement.style.setProperty(
    "--pointer-x",
    `${event.clientX}px`,
  );
  document.documentElement.style.setProperty(
    "--pointer-y",
    `${event.clientY}px`,
  );
};

document.addEventListener("pointermove", updatePointerGlow);
createParticles();

const addTiltEffect = () => {
  const interactiveCards = $$(
    ".project-card, .hero-card, .extra-card, .game-card, .contact-form",
  );

  interactiveCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.transform = `perspective(1000px) rotateX(${(0.5 - y) * 10}deg) rotateY(${(x - 0.5) * 12}deg) translateY(-4px)`;
      card.style.transition = "transform 0.12s ease, box-shadow 0.12s ease";
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
      card.style.transition = "transform 0.35s ease, box-shadow 0.35s ease";
    });
  });
};

addTiltEffect();

const projectsGrid = $(".projects-grid");
const projectsToggle = $("#projectsToggle");
if (projectsToggle && projectsGrid) {
  projectsToggle.addEventListener("click", () => {
    const isExpanded = projectsGrid.classList.toggle("expanded");
    projectsToggle.textContent = isExpanded
      ? "Voir moins de projets"
      : "Voir tous les projets";
    projectsToggle.setAttribute("aria-expanded", String(isExpanded));
  });
}

const gameSection = $("#game");
const resetGame = () => {
  round = 0;
  playerScore = 0;
  computerScore = 0;
  $("#playerScore").textContent = "0";
  $("#computerScore").textContent = "0";
  $("#gameMessage").textContent = "Choisis ton coup.";
};

const gameStart = $("#gameStart");
if (gameStart && gameSection) {
  gameStart.addEventListener("click", () => {
    resetGame();
    gameSection.classList.remove("hidden");
    gameSection.scrollIntoView({ behavior: "smooth" });
  });
}

let round = 0;
let playerScore = 0;
let computerScore = 0;
const choices = ["rock", "paper", "scissors"];
const labels = { rock: "Pierre", paper: "Feuille", scissors: "Ciseaux" };

function play(player) {
  if (round >= 3) return;
  const computer = choices[Math.floor(Math.random() * choices.length)];
  round++;
  let result;
  if (player === computer) result = "Égalité.";
  else if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && computer === "rock") ||
    (player === "scissors" && computer === "paper")
  ) {
    playerScore++;
    result = "Tu remportes la manche.";
  } else {
    computerScore++;
    result = "Le bot remporte la manche.";
  }
  $("#playerScore").textContent = playerScore;
  $("#computerScore").textContent = computerScore;
  $("#gameMessage").textContent =
    `Manche ${round}/3 — ${result} (${labels[player]} vs ${labels[computer]})`;
  if (round === 3) {
    const final =
      playerScore === computerScore
        ? "Match nul."
        : playerScore > computerScore
          ? "Bravo, victoire finale !"
          : "Le bot gagne cette partie.";
    $("#gameMessage").textContent += ` ${final}`;
  }
}

$$(".choices button").forEach((button) =>
  button.addEventListener("click", () => play(button.dataset.choice)),
);
$("#gameReset").addEventListener("click", resetGame);
$("#gameClose").addEventListener("click", () => {
  gameSection.classList.add("hidden");
  $("#gameStart").focus();
});

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 3200);
}

const formStatus = $("#formStatus");
const submitBtn = $("#submitBtn");
const contactForm = $("#contactForm");

const setFormMessage = (message, type = "info") => {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.classList.remove("error", "success");
  if (type === "error") {
    formStatus.classList.add("error");
  }
  if (type === "success") {
    formStatus.classList.add("success");
  }
};

const resetFieldStates = () => {
  if (!contactForm) return;
  contactForm.querySelectorAll("input, textarea").forEach((field) => {
    field.classList.remove("invalid");
    field.setAttribute("aria-invalid", "false");
  });
};

const validatePayload = (payload) => {
  if (!payload.name || payload.name.length < 4) {
    return "Le nom doit contenir au moins 4 caractères.";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(payload.email)) {
    return "L’adresse email est invalide.";
  }

  if (!payload.message || payload.message.length < 20) {
    return "Le message doit contenir au moins 20 caractères.";
  }

  return "";
};

const markFieldError = (fieldName) => {
  if (!contactForm) return;
  const field = contactForm.querySelector(`[name="${fieldName}"]`);
  if (!field) return;
  field.classList.add("invalid");
  field.setAttribute("aria-invalid", "true");
  field.focus();
};

const setSubmitState = (isLoading) => {
  if (!submitBtn) return;
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? "Envoi..." : "Envoyer";
};

const sendContactMessage = async (payload) => {
  const response = await fetch(`https://formsubmit.co/ajax/${emailAddress}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      message: payload.message,
      date: payload.date,
      _subject: `Nouveau message depuis le portfolio : ${payload.name}`,
      _replyto: payload.email,
      _template: "table",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || "Erreur lors de l’envoi par email.");
  }

  return response.json();
};

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = contactForm;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      date: new Date().toISOString(),
    };

    resetFieldStates();
    const validationError = validatePayload(payload);
    if (validationError) {
      setFormMessage(validationError, "error");
      showToast(validationError);

      if (!payload.name || payload.name.length < 2) {
        markFieldError("name");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        markFieldError("email");
      } else {
        markFieldError("message");
      }
      return;
    }

    const immediateStatus = "Message envoyé !";
    setSubmitState(true);
    setFormMessage(immediateStatus, "success");
    showToast(immediateStatus);
    if (form) form.reset();

    try {
      await sendContactMessage(payload);
      localStorage.setItem("ulric_message_backup", JSON.stringify(payload));
    } catch (error) {
      localStorage.setItem("ulric_message_backup", JSON.stringify(payload));
      const subject = encodeURIComponent(`Nouveau message de ${payload.name}`);
      const body = encodeURIComponent(
        `Nom : ${payload.name}\nEmail : ${payload.email}\n\nMessage :\n${payload.message}\n\nEnvoyé le : ${new Date(payload.date).toLocaleString("fr-FR")}`,
      );

      setFormMessage(
        "Le client email a été ouvert pour finaliser l’envoi.",
        "info",
      );
      showToast("Votre messagerie a été ouverte pour finaliser l’envoi.");
      setTimeout(() => {
        window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
      }, 200);
    } finally {
      setSubmitState(false);
    }
  });
}
