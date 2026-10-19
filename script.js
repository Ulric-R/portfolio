const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const emailAddress = 'ulricrandrianiaina@gmail.com';

$('#year').textContent = new Date().getFullYear();

const navToggle = $('#navToggle');
const header = document.querySelector('.site-header');
if (navToggle && header) {
  navToggle.addEventListener('click', () => header.classList.toggle('open'));
}
$$('#mainNav a').forEach(link => link.addEventListener('click', () => header && header.classList.remove('open')));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => observer.observe(el));

const createParticles = () => {
  const particlesRoot = $('#particles');
  if (!particlesRoot) return;

  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 18; index += 1) {
    const particle = document.createElement('span');
    particle.className = 'particle';
    particle.style.setProperty('--left', `${Math.random() * 100}`);
    particle.style.setProperty('--top', `${Math.random() * 100}`);
    particle.style.setProperty('--size', `${(Math.random() * 10 + 6).toFixed(2)}px`);
    particle.style.animationDelay = `${(Math.random() * 12).toFixed(2)}s`;
    fragment.appendChild(particle);
  }

  particlesRoot.appendChild(fragment);
};

const updatePointerGlow = (event) => {
  document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
  document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
};

document.addEventListener('pointermove', updatePointerGlow);
createParticles();

const addTiltEffect = () => {
  const interactiveCards = $$('.project-card, .hero-card, .extra-card, .game-card, .contact-form');

  interactiveCards.forEach(card => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.transform = `perspective(1000px) rotateX(${(0.5 - y) * 10}deg) rotateY(${(x - 0.5) * 12}deg) translateY(-4px)`;
      card.style.transition = 'transform 0.12s ease, box-shadow 0.12s ease';
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.35s ease, box-shadow 0.35s ease';
    });
  });
};

addTiltEffect();

const projectsGrid = $('.projects-grid');
const projectsToggle = $('#projectsToggle');
if (projectsToggle && projectsGrid) {
  projectsToggle.addEventListener('click', () => {
    const isExpanded = projectsGrid.classList.toggle('expanded');
    projectsToggle.textContent = isExpanded ? 'Voir moins de projets' : 'Voir tous les projets';
    projectsToggle.setAttribute('aria-expanded', String(isExpanded));
  });
}

const gameSection = $('#game');
const resetGame = () => {
  round = 0;
  playerScore = 0;
  computerScore = 0;
  $('#playerScore').textContent = '0';
  $('#computerScore').textContent = '0';
  $('#gameMessage').textContent = 'Choisis ton coup.';
};

const gameStart = $('#gameStart');
if (gameStart && gameSection) {
  gameStart.addEventListener('click', () => {
    resetGame();
    gameSection.classList.remove('hidden');
    gameSection.scrollIntoView({ behavior: 'smooth' });
  });
}

let round = 0;
let playerScore = 0;
let computerScore = 0;
const choices = ['rock', 'paper', 'scissors'];
const labels = { rock: 'Pierre', paper: 'Feuille', scissors: 'Ciseaux' };

function play(player) {
  if (round >= 3) return;
  const computer = choices[Math.floor(Math.random() * choices.length)];
  round++;
  let result;
  if (player === computer) result = 'Égalité.';
  else if ((player === 'rock' && computer === 'scissors') || (player === 'paper' && computer === 'rock') || (player === 'scissors' && computer === 'paper')) {
    playerScore++;
    result = 'Tu remportes la manche.';
  } else {
    computerScore++;
    result = 'Le bot remporte la manche.';
  }
  $('#playerScore').textContent = playerScore;
  $('#computerScore').textContent = computerScore;
  $('#gameMessage').textContent = `Manche ${round}/3 — ${result} (${labels[player]} vs ${labels[computer]})`;
  if (round === 3) {
    const final = playerScore === computerScore ? 'Match nul.' : playerScore > computerScore ? 'Bravo, victoire finale !' : 'Le bot gagne cette partie.';
    $('#gameMessage').textContent += ` ${final}`;
  }
}

$$('.choices button').forEach(button => button.addEventListener('click', () => play(button.dataset.choice)));
$('#gameReset').addEventListener('click', resetGame);
$('#gameClose').addEventListener('click', () => {
  gameSection.classList.add('hidden');
  $('#gameStart').focus();
});

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3200);
}

const formStatus = $('#formStatus');
const submitBtn = $('#submitBtn');
const contactForm = $('#contactForm');

const setSubmitState = (isLoading) => {
  if (!submitBtn) return;
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? 'Envoi...' : 'Envoyer';
};

const sendContactMessage = async (payload) => {
  const response = await fetch('http://localhost:5000/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      message: payload.message,
      date: payload.date
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Erreur lors de l’envoi par email.');
  }

  return data;
};

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      message: String(formData.get('message') || '').trim(),
      date: new Date().toISOString()
    };

    if (!payload.name || !payload.email || !payload.message) {
      if (formStatus) {
        formStatus.textContent = 'Veuillez remplir tous les champs.';
      }
      showToast('Veuillez compléter tous les champs.');
      return;
    }

    setSubmitState(true);
    if (formStatus) {
      formStatus.textContent = 'Envoi en cours...';
    }

    try {
      await sendContactMessage(payload);
      localStorage.setItem('ulric_message_backup', JSON.stringify(payload));
      event.currentTarget.reset();
      if (formStatus) {
        formStatus.textContent = 'Message envoyé avec succès !';
      }
      showToast('Message envoyé avec succès.');
    } catch (error) {
      localStorage.setItem('ulric_message_backup', JSON.stringify(payload));
      if (formStatus) {
        formStatus.textContent = error.message || 'Une erreur est survenue.';
      }
      showToast(error.message || 'Une erreur est survenue.');
    } finally {
      setSubmitState(false);
    }
  });
}

