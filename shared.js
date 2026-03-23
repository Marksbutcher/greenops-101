// GreenOps 101 — Shared module utilities v4 (light theme)

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

// Knowledge check handling
function initKnowledgeChecks() {
  document.querySelectorAll('.kc-block').forEach(block => {
    const correct = block.dataset.correct;
    block.querySelectorAll('.kc-option').forEach(opt => {
      opt.addEventListener('click', function() {
        if (block.classList.contains('answered')) return;
        block.classList.add('answered');
        const chosen = this.dataset.val;
        block.querySelectorAll('.kc-option').forEach(o => {
          if (o.dataset.val === correct) {
            o.classList.add('selected-correct');
          } else if (o.dataset.val === chosen && chosen !== correct) {
            o.classList.add('selected-wrong');
          }
        });
        // Show feedback
        const fb = block.querySelector(chosen === correct ? '.kc-correct' : '.kc-wrong');
        if (fb) fb.style.display = 'block';
        // Also show .kc-reveal if present (legacy)
        const reveal = block.querySelector('.kc-reveal');
        if (reveal) reveal.style.display = 'block';
      });
    });
  });
}

// Scroll-triggered reveals
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Sticky nav progress
function initProgress(current) {
  const p = getProgress();
  const total = 14;
  const done = Object.keys(p).filter(k => k.startsWith('module')).length;
  const el = document.getElementById('progress-count');
  if (el) el.textContent = `${done}/${total}`;
  const fill = document.getElementById('prog-fill');
  if (fill) fill.style.width = `${(done/total)*100}%`;
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
