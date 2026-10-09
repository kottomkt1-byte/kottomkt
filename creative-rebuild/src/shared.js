export const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
export function initCommon(){
  document.documentElement.dataset.motion=reducedMotion.matches?'reduced':'full';
  reducedMotion.addEventListener('change',()=>{document.documentElement.dataset.motion=reducedMotion.matches?'reduced':'full'});
  const main=document.querySelector('main');
  if(main){if(!main.id)main.id='main';const link=document.createElement('a');link.className='skip-link';link.href='#'+main.id;link.textContent='본문으로 이동';document.body.prepend(link)}
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const href=a.getAttribute('href');if(href==='#')return;
    const target=document.getElementById(href.slice(1));if(!target)return;
    e.preventDefault();target.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth'});
    history.replaceState(null,'',href);
    if(a.classList.contains('skip-link')){target.setAttribute('tabindex','-1');target.focus({preventScroll:true})}
  }));
}
