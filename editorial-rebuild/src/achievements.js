// Existing published claims, reaffirmed by the owner on 2026-10-09.
// Keep their original scope: not a sales guarantee or an agency ranking.
const records = [
  ['안경 제작 사례 작성', '5,000', '건+'],
  ['메인 품목 재계약률', '100', '%'],
  ['전문성 만족도', '98', '%'],
  ['에실로 얼티밋 전국 순위', '2', '위'],
];

export function renderAchievements() {
  return `<section class="achievements wrap" aria-labelledby="achievements-title">
    <h2 id="achievements-title">고또마케팅이 쌓아온 기록</h2>
    <dl class="achievement-ledger">${records.map(([label, number, unit]) => `<div class="achievement"><dt>${label}</dt><dd><span class="achievement-number">${number}</span><span class="achievement-unit">${unit}</span></dd></div>`).join('')}</dl>
  </section>`;
}

export function initAchievements({gsap}) {
  const ledger = document.querySelector('.achievement-ledger');
  if (!ledger) return () => {};
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from(ledger.querySelectorAll('.achievement-number'), {
      clipPath:'inset(100% 0% 0% 0%)', y:12, duration:.95, stagger:.11, ease:'power3.out',
      clearProps:'clipPath,transform', scrollTrigger:{trigger:ledger, start:'top 90%', once:true},
    });
  });
  return () => mm.revert();
}
