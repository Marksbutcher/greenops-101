// GreenOps 101 — Shared utilities v5 — Enhanced with tab/accordion handlers

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
    b.textContent = '✓ Complete';
    b.classList.add('done');
  });
}

function isComplete(k) {
  return !!getProgress()[k];
}

// ============================================================================
// KNOWLEDGE CHECKS
// ============================================================================

function initKnowledgeChecks() {
  document.querySelectorAll('.kc-block').forEach(block => {
    const correct = block.dataset.correct;
    block.querySelectorAll('.kc-option').forEach(opt => {
      opt.addEventListener('click', function() {
        if (block.classList.contains('answered')) return;
        block.classList.add('answered');
        const chosen = this.dataset.val;
        const isCorrect = (chosen === correct);

        block.querySelectorAll('.kc-option').forEach(o => {
          if (o.dataset.val === correct) o.classList.add('selected-correct');
          else if (o.dataset.val === chosen && !isCorrect) o.classList.add('selected-wrong');
        });

        // Find the correct option text for feedback
        const correctBtn = block.querySelector('.kc-option[data-val="' + correct + '"]');
        const correctText = correctBtn ? correctBtn.textContent.replace(/^[A-D]\s*/, '').trim() : '';

        // Build or find feedback label
        let revealLabel = block.querySelector('.kc-reveal-label');
        if (!revealLabel) {
          revealLabel = document.createElement('p');
          revealLabel.className = 'kc-reveal-label';
          const rv = block.querySelector('.kc-reveal');
          if (rv) rv.insertBefore(revealLabel, rv.firstChild);
        }

        if (isCorrect) {
          revealLabel.style.color = 'var(--teal-dark)';
          revealLabel.textContent = '✓ Correct — Option ' + correct;
        } else {
          revealLabel.style.color = '#B54D12';
          revealLabel.innerHTML = '✗ Incorrect — the correct answer was <strong>Option ' + correct + '</strong>: ' + correctText;
        }

        const rv = block.querySelector('.kc-reveal');
        if (rv) rv.style.display = 'block';

        const hint = block.querySelector('.kc-hint');
        if (hint) hint.style.display = 'none';
      });
    });
  });
}

// ============================================================================
// SCROLL REVEAL
// ============================================================================

function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ============================================================================
// PROGRESS COUNTER
// ============================================================================

function initProgress(current) {
  const p = getProgress();
  const total = 14;
  const done = Object.keys(p).filter(k => k.startsWith('module')).length;
  const el = document.getElementById('progress-count');
  if (el) el.textContent = done + '/' + total;
  const fill = document.getElementById('prog-fill');
  if (fill) fill.style.width = ((done / total) * 100) + '%';
  if (isComplete('module' + current)) {
    document.querySelectorAll('.complete-btn').forEach(b => {
      b.textContent = '✓ Complete';
      b.classList.add('done');
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
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
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

    header.addEventListener('click', () => {
      // Close siblings
      const parent = item.parentElement;
      parent.querySelectorAll('.explorer-item.open, .scope-box.open, .action-level.open').forEach(sib => {
        if (sib !== item) sib.classList.remove('open');
      });
      item.classList.toggle('open');
    });
  });
}

// ============================================================================
// DOMAIN SELECTOR HANDLER
// ============================================================================

function initDomainSelector() {
  document.querySelectorAll('.domain-selector').forEach(selector => {
    const buttons = selector.querySelectorAll('.domain-btn');
    const panelContainer = selector.nextElementSibling; // .domain-panels
    if (!panelContainer) return;

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
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
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
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
    const detail = bar.nextElementSibling; // .lifecycle-detail

    phases.forEach(phase => {
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
}

document.addEventListener('DOMContentLoaded', () => {
  // Auto-detect module number from body data attribute or URL
  const body = document.body;
  const moduleNum = body.dataset.module ||
    (window.location.pathname.match(/module(\d+)/) || [0, 0])[1];
  initModule(moduleNum);
});
