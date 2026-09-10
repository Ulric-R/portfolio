const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

$('#year').textContent = new Date().getFullYear();

const navToggle = $('#navToggle');
const header = document.querySelector('.site-header');
navToggle.addEventListener('click', () => header.classList.toggle('open'));
$$('#mainNav a').forEach(link => link.addEventListener('click', () => header.classList.remove('open')));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => observer.observe(el));

const projectsGrid = $('.projects-grid');
const projectsToggle = $('#projectsToggle');
projectsToggle.addEventListener('click', () => {
  const isExpanded = projectsGrid.classList.toggle('expanded');
  projectsToggle.textContent = isExpanded ? 'Voir moins de projets' : 'Voir tous les projets';
  projectsToggle.setAttribute('aria-expanded', String(isExpanded));
});

const gameSection = $('#game');
const resetGame = () => {
  round = 0;
  playerScore = 0;
  computerScore = 0;
  $('#playerScore').textContent = '0';
  $('#computerScore').textContent = '0';
  $('#gameMessage').textContent = 'Choisis ton coup.';
};

$('#gameStart').addEventListener('click', () => {
  resetGame();
  gameSection.classList.remove('hidden');
  gameSection.scrollIntoView({ behavior: 'smooth' });
});

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
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3200);
}

$('#contactForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const message = Object.fromEntries(form.entries());
  message.date = new Date().toISOString();
  const saved = JSON.parse(localStorage.getItem('ulric_messages') || '[]');
  saved.push(message);
  localStorage.setItem('ulric_messages', JSON.stringify(saved));
  event.currentTarget.reset();
  showToast('Message enregistré localement au format JSON.');
});
