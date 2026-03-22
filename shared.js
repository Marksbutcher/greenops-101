// GreenOps 101 — Shared module utilities

const STORAGE_KEY = 'greenops101_progress';

function getProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function markComplete(moduleKey) {
  const p = getProgress();
  p[moduleKey] = { completedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  document.querySelectorAll('.complete-btn').forEach(b => {
    b.textContent = '✓ Module complete';
    b.classList.add('done');
  });
}

function isComplete(moduleKey) {
  return !!getProgress()[moduleKey];
}

// Knowledge check reveal
function initKnowledgeChecks() {
  document.querySelectorAll('.kc-option').forEach(opt => {
    opt.addEventListener('click', function() {
      const block = this.closest('.kc-block');
      if (block.classList.contains('answered')) return;
      block.classList.add('answered');
      const correct = block.dataset.correct;
      block.querySelectorAll('.kc-option').forEach(o => {
        if (o.dataset.val === correct) o.classList.add('correct');
        else o.classList.add('wrong');
      });
      const reveal = block.querySelector('.kc-reveal');
      if (reveal) { reveal.style.display = 'block'; }
    });
  });
}

// Scroll-triggered section reveals
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Sticky nav progress
function initProgress(current) {
  const p = getProgress();
  const total = 14;
  const done = Object.keys(p).filter(k => k.startsWith('module')).length;
  const el = document.getElementById('progress-count');
  if (el) el.textContent = `${done}/${total}`;
  if (isComplete('module' + current)) {
    document.querySelectorAll('.complete-btn').forEach(b => {
      b.textContent = '✓ Module complete';
      b.classList.add('done');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initKnowledgeChecks();
  initScrollReveal();
});
