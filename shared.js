// GreenOps 101 — Shared utilities v4 light theme

const STORAGE_KEY = 'greenops101_progress';
function getProgress(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');}catch{return {};}}
function markComplete(moduleKey){
  const p=getProgress();p[moduleKey]={completedAt:new Date().toISOString()};
  localStorage.setItem(STORAGE_KEY,JSON.stringify(p));
  document.querySelectorAll('.complete-btn').forEach(b=>{b.textContent='✓ Complete';b.classList.add('done');});
}
function isComplete(k){return !!getProgress()[k];}
function initKnowledgeChecks(){
  document.querySelectorAll('.kc-block').forEach(block=>{
    const correct=block.dataset.correct;
    block.querySelectorAll('.kc-option').forEach(opt=>{
      opt.addEventListener('click',function(){
        if(block.classList.contains('answered'))return;
        block.classList.add('answered');
        const chosen=this.dataset.val;
        const isCorrect=(chosen===correct);

        block.querySelectorAll('.kc-option').forEach(o=>{
          if(o.dataset.val===correct)o.classList.add('selected-correct');
          else if(o.dataset.val===chosen&&!isCorrect)o.classList.add('selected-wrong');
        });

        // Find the correct option text for feedback
        const correctBtn=block.querySelector('.kc-option[data-val="'+correct+'"]');
        const correctText=correctBtn?correctBtn.textContent.replace(/^[A-D]\s*/,'').trim():'';

        // Build or find feedback label
        let revealLabel=block.querySelector('.kc-reveal-label');
        if(!revealLabel){
          revealLabel=document.createElement('p');
          revealLabel.className='kc-reveal-label';
          const rv=block.querySelector('.kc-reveal');
          if(rv)rv.insertBefore(revealLabel,rv.firstChild);
        }

        if(isCorrect){
          revealLabel.style.color='var(--teal-dark)';
          revealLabel.textContent='✓ Correct — Option '+correct;
        } else {
          revealLabel.style.color='#B54D12';
          revealLabel.innerHTML='✗ Incorrect — the correct answer was <strong>Option '+correct+'</strong>: '+correctText;
        }

        const rv=block.querySelector('.kc-reveal');
        if(rv)rv.style.display='block';

        const hint=block.querySelector('.kc-hint');
        if(hint)hint.style.display='none';
      });
    });
  });
}
function initScrollReveal(){
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});
  },{threshold:0.06,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
}
function initProgress(current){
  const p=getProgress(),total=14;
  const done=Object.keys(p).filter(k=>k.startsWith('module')).length;
  const el=document.getElementById('progress-count');
  if(el)el.textContent=done+'/'+total;
  const fill=document.getElementById('prog-fill');
  if(fill)fill.style.width=((done/total)*100)+'%';
  if(isComplete('module'+current))document.querySelectorAll('.complete-btn').forEach(b=>{b.textContent='✓ Complete';b.classList.add('done');});
}
