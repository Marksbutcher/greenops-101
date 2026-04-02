// GreenOps 101 — Shared utilities v6
// Consolidated: progress tracking, knowledge checks, tabs, accordions,
// domain selectors, keyboard accessibility, and scroll reveals.

const STORAGE_KEY = 'greenops101_progress';

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function markComplete(moduleKey) {
  const p = getProgress();
  p[moduleKey] = { completedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  document.querySelectorAll('.complete-btn').forEach(b => {
    b.textContent = '\u2713 Complete';
    b.classList.add('done');
    b.setAttribute('aria-pressed', 'true');
  });
}

function isComplete(k) {
  return !!getProgress()[k];
}

// ============================================================================
// KEYBOARD ACCESSIBILITY HELPERS
// ============================================================================

function makeClickable(el) {
  // Ensure interactive non-button elements are keyboard accessible
  if (!el.getAttribute('tabindex')) el.setAttribute('tabindex', '0');
  if (!el.getAttribute('role')) el.setAttribute('role', 'button');
  el.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.click();
    }
  });
}

// ============================================================================
// KNOWLEDGE CHECKS
// ============================================================================

function initKnowledgeChecks() {
  document.querySelectorAll('.kc-block').forEach(block => {
    const correct = block.dataset.correct;
    block.querySelectorAll('.kc-option').forEach(opt => {
      makeClickable(opt);
      opt.addEventListener('click', function() {
        if (block.classList.contains('answered')) return;
        block.classList.add('answered');
        const chosen = this.dataset.val;
        const isRight = (chosen === correct);

        block.querySelectorAll('.kc-option').forEach(o => {
          o.removeAttribute('tabindex');
          o.setAttribute('aria-disabled', 'true');
          if (o.dataset.val === correct) o.classList.add('selected-correct');
          else if (o.dataset.val === chosen && !isRight) o.classList.add('selected-wrong');
        });

        const correctBtn = block.querySelector('.kc-option[data-val="' + correct + '"]');
        const correctText = correctBtn ? correctBtn.textContent.replace(/^[A-D]\s*/, '').trim() : '';

        let revealLabel = block.querySelector('.kc-reveal-label');
        if (!revealLabel) {
          revealLabel = document.createElement('p');
          revealLabel.className = 'kc-reveal-label';
          const rv = block.querySelector('.kc-reveal');
          if (rv) rv.insertBefore(revealLabel, rv.firstChild);
        }

        if (isRight) {
          revealLabel.style.color = 'var(--teal-dark)';
          revealLabel.textContent = '\u2713 Correct \u2014 Option ' + correct;
        } else {
          revealLabel.style.color = '#B54D12';
          revealLabel.innerHTML = '\u2717 Incorrect \u2014 the correct answer was <strong>Option ' + correct + '</strong>: ' + correctText;
        }

        const rv = block.querySelector('.kc-reveal');
        if (rv) {
          rv.style.display = 'block';
          rv.setAttribute('aria-live', 'polite');
        }

        const hint = block.querySelector('.kc-hint');
        if (hint) hint.style.display = 'none';
      });
    });
  });
}

// ============================================================================
// SCROLL REVEAL — with prefers-reduced-motion respect
// ============================================================================

function initScrollReveal() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = document.querySelectorAll('.reveal, .content-section');

  if (prefersReducedMotion) {
    // Skip animation — just show everything
    els.forEach(el => {
      el.classList.add('visible');
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  // Failsafe: force-show any element that is in the viewport right now
  function revealInViewport() {
    els.forEach(el => {
      if (el.classList.contains('visible')) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 60 && rect.bottom > -60) {
        el.classList.add('visible');
      }
    });
  }

  // Primary: IntersectionObserver
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => obs.observe(el));

  // Failsafe: reveal anything already in viewport on load
  revealInViewport();

  // Failsafe: scroll listener catches anything the observer misses
  let scrollTimer;
  window.addEventListener('scroll', function() {
    if (scrollTimer) return;
    scrollTimer = setTimeout(function() {
      scrollTimer = null;
      revealInViewport();
    }, 80);
  }, { passive: true });
}

// ============================================================================
// PROGRESS COUNTER
// ============================================================================

function initProgress(current) {
  const p = getProgress();
  const total = 14;
  const done = Object.keys(p).filter(k => k.startsWith('module')).length;

  // Support both ID patterns
  const countEl = document.getElementById('progress-count') || document.getElementById('progCount');
  if (countEl) countEl.textContent = done + '/' + total;

  const fillEl = document.getElementById('prog-fill') || document.getElementById('progFill');
  if (fillEl) fillEl.style.width = ((done / total) * 100) + '%';

  if (isComplete('module' + current)) {
    document.querySelectorAll('.complete-btn').forEach(b => {
      b.textContent = '\u2713 Complete';
      b.classList.add('done');
      b.setAttribute('aria-pressed', 'true');
    });
  }
}

// ============================================================================
// GENERIC TAB PANEL HANDLER
// ============================================================================

function initTabs() {
  document.querySelectorAll('[data-tab-group]').forEach(group => {
    const buttons = group.querySelectorAll('[data-tab]');
    const panelContainer = document.getElementById(group.dataset.tabGroup);
    if (!panelContainer) return;

    buttons.forEach(btn => {
      makeClickable(btn);
      btn.addEventListener('click', () => {
        buttons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        panelContainer.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        const target = panelContainer.querySelector('#' + btn.dataset.tab);
        if (target) target.classList.add('active');
      });
    });
  });
}

// ============================================================================
// GENERIC ACCORDION/EXPLORER HANDLER
// ============================================================================

function initAccordions() {
  document.querySelectorAll('.explorer-item, .scope-box, .action-level').forEach(item => {
    const header = item.querySelector('.explorer-header, .scope-header, .action-level-header');
    if (!header) return;

    makeClickable(header);
    header.setAttribute('aria-expanded', 'false');

    header.addEventListener('click', () => {
      const parent = item.parentElement;
      parent.querySelectorAll('.explorer-item.open, .scope-box.open, .action-level.open').forEach(sib => {
        if (sib !== item) {
          sib.classList.remove('open');
          const sibHeader = sib.querySelector('.explorer-header, .scope-header, .action-level-header');
          if (sibHeader) sibHeader.setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('open');
      header.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
    });
  });
}

// ============================================================================
// DOMAIN SELECTOR HANDLER
// ============================================================================

function initDomainSelector() {
  document.querySelectorAll('.domain-selector').forEach(selector => {
    const buttons = selector.querySelectorAll('.domain-btn');
    const panelContainer = selector.nextElementSibling;
    if (!panelContainer) return;

    buttons.forEach(btn => {
      makeClickable(btn);
      btn.addEventListener('click', () => {
        buttons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        panelContainer.querySelectorAll('.domain-panel').forEach(p => p.classList.remove('active'));
        const target = panelContainer.querySelector('#' + btn.dataset.domain);
        if (target) target.classList.add('active');
      });
    });
  });
}

// ============================================================================
// WASTE TABS HANDLER
// ============================================================================

function initWasteTabs() {
  document.querySelectorAll('.waste-tabs').forEach(tabBar => {
    const tabs = tabBar.querySelectorAll('.waste-tab');
    const panels = tabBar.nextElementSibling;
    if (!panels) return;

    tabs.forEach(tab => {
      makeClickable(tab);
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        panels.querySelectorAll('.waste-panel').forEach(p => p.classList.remove('active'));
        const target = panels.querySelector('#' + tab.dataset.waste);
        if (target) target.classList.add('active');
      });
    });
  });
}

// ============================================================================
// LIFECYCLE BAR HANDLER
// ============================================================================

function initLifecycleBar() {
  document.querySelectorAll('.lifecycle-bar').forEach(bar => {
    const phases = bar.querySelectorAll('.lc-phase');
    const detail = bar.nextElementSibling;

    phases.forEach(phase => {
      makeClickable(phase);
      phase.addEventListener('click', () => {
        if (detail) {
          detail.textContent = phase.dataset.detail || '';
          detail.style.display = detail.textContent ? 'block' : 'none';
        }
      });
    });
  });
}

// ============================================================================
// TASK CHECKBOX HANDLER (Module 14)
// ============================================================================

function initTaskCheckboxes() {
  document.querySelectorAll('.task-checkbox').forEach(cb => {
    cb.setAttribute('role', 'checkbox');
    cb.setAttribute('aria-checked', cb.classList.contains('checked') ? 'true' : 'false');
    cb.setAttribute('tabindex', '0');

    cb.addEventListener('click', () => {
      cb.classList.toggle('checked');
      const isChecked = cb.classList.contains('checked');
      cb.setAttribute('aria-checked', isChecked ? 'true' : 'false');
      cb.textContent = isChecked ? '\u2713' : '';
    });

    cb.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        cb.click();
      }
    });
  });
}

// ============================================================================
// MASTER INIT FUNCTION
// ============================================================================

function initModule(moduleNum) {
  initKnowledgeChecks();
  initScrollReveal();
  initProgress(moduleNum);
  initTabs();
  initAccordions();
  initDomainSelector();
  initWasteTabs();
  initLifecycleBar();
  initTaskCheckboxes();
}

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const moduleNum = body.dataset.module ||
    (window.location.pathname.match(/module(\d+)/) || [0, 0])[1];
  initModule(moduleNum);
});
