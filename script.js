/* =====================================================
   고또마케팅 - Shared JavaScript
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
        const hide = () => { preloader.classList.add('hidden'); document.body.classList.remove('no-scroll'); initAOS(); };
        window.addEventListener('load', () => setTimeout(hide, 1400));
        setTimeout(() => { if (!preloader.classList.contains('hidden')) hide(); }, 2500);
    } else {
        initAOS();
    }

    // Header scroll
    const header = document.getElementById('header');
    const handleScroll = () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Mobile menu
    const hamburger = document.getElementById('hamburger');
    const mobMenu = document.getElementById('mobMenu');
    const mobOverlay = document.getElementById('mobOverlay');
    const mobClose = document.getElementById('mobClose');
    const open = () => { mobMenu.classList.add('active'); mobOverlay.classList.add('active'); document.body.classList.add('no-scroll'); };
    const close = () => { mobMenu.classList.remove('active'); mobOverlay.classList.remove('active'); document.body.classList.remove('no-scroll'); };
    if (hamburger) hamburger.addEventListener('click', open);
    if (mobClose) mobClose.addEventListener('click', close);
    if (mobOverlay) mobOverlay.addEventListener('click', close);
    document.querySelectorAll('#mobMenu .mob-links a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && mobMenu?.classList.contains('active')) close(); });

    // Smooth scroll for same-page anchors
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id = a.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                const offset = header ? header.offsetHeight : 80;
                window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
            }
        });
    });

    // Top button
    const topBtn = document.getElementById('topBtn');
    if (topBtn) {
        window.addEventListener('scroll', () => {
            topBtn.classList.toggle('visible', window.scrollY > 500);
        }, { passive: true });
    }

    // AOS (scroll animations)
    var aosEls = [];
    function initAOS() {
        aosEls = document.querySelectorAll('[data-aos]');
        checkAOS();
    }
    function checkAOS() {
        if (!aosEls || !aosEls.length) return;
        const trigger = window.innerHeight * 0.86;
        aosEls.forEach(el => {
            if (el.getBoundingClientRect().top < trigger) {
                const delay = parseInt(el.dataset.aosDelay) || 0;
                setTimeout(() => el.classList.add('aos-animate'), delay);
            }
        });
    }
    window.addEventListener('scroll', checkAOS, { passive: true });
    // For pages without preloader, init AOS immediately
    if (!preloader) {
        initAOS();
    }

    // Counter animation
    const counters = document.querySelectorAll('.stat-number[data-count]');
    let counted = false;
    function animateCounters() {
        if (counted) return;
        const wrap = document.querySelector('.hero-stats');
        if (!wrap) return;
        if (wrap.getBoundingClientRect().top < window.innerHeight) {
            counted = true;
            counters.forEach(c => {
                const target = parseInt(c.dataset.count);
                const dur = 2000, start = performance.now();
                (function tick(now) {
                    const p = Math.min((now - start) / dur, 1);
                    const ease = 1 - Math.pow(1 - p, 3);
                    c.textContent = Math.floor(target * ease).toLocaleString();
                    if (p < 1) requestAnimationFrame(tick); else c.textContent = target.toLocaleString();
                })(start);
            });
        }
    }
    window.addEventListener('scroll', animateCounters, { passive: true });
    setTimeout(animateCounters, 1600);

    // Contact form
    const form = document.getElementById('contactForm');
    const toast = document.getElementById('toast');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const fd = new FormData(form);
            const company = fd.get('company')?.trim();
            const store = fd.get('storeName')?.trim();
            const phone = fd.get('phone')?.trim();
            const region = fd.get('region')?.trim();
            const msg = fd.get('message')?.trim();
            const priv = form.querySelector('#privacy')?.checked;
            if (!company || !store || !phone || !region || !msg) return showToast('모든 필수 항목을 입력해주세요.', 'error');
            if (!priv) return showToast('개인정보 수집 및 이용에 동의해주세요.', 'error');
            if (!/^[0-9\-+() ]{8,15}$/.test(phone)) return showToast('올바른 연락처를 입력해주세요.', 'error');
            const btn = form.querySelector('.btn-submit');
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 전송 중...';
            btn.disabled = true;
            setTimeout(() => {
                showToast('문의가 성공적으로 전송되었습니다. 빠른 시일 내에 연락드리겠습니다.', 'success');
                form.reset();
                btn.innerHTML = orig;
                btn.disabled = false;
            }, 1500);
        });
    }
    function showToast(msg, type) {
        if (!toast) return;
        const icon = toast.querySelector('i');
        const span = toast.querySelector('span');
        span.textContent = msg;
        if (type === 'error') { icon.className = 'fas fa-exclamation-circle'; icon.style.color = '#EF4444'; }
        else { icon.className = 'fas fa-check-circle'; icon.style.color = '#10B981'; }
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);
    }

    // Phone formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function () {
            let v = this.value.replace(/\D/g, '');
            if (v.length > 3 && v.length <= 7) v = v.slice(0, 3) + '-' + v.slice(3);
            else if (v.length > 7) v = v.slice(0, 3) + '-' + v.slice(3, 7) + '-' + v.slice(7, 11);
            this.value = v;
        });
    }

    // Parallax hero pattern
    const heroPattern = document.querySelector('.hero-pattern');
    if (heroPattern) {
        window.addEventListener('scroll', () => {
            if (window.scrollY < window.innerHeight) heroPattern.style.transform = `translateY(${window.scrollY * .25}px)`;
        }, { passive: true });
    }

    // Resize
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (window.innerWidth > 768) close(); }, 250); });

    // Portfolio Slider
    const track = document.getElementById('portfolioTrack');
    const pfPrev = document.getElementById('pfPrev');
    const pfNext = document.getElementById('pfNext');
    const pfDotsWrap = document.getElementById('pfDots');
    if (track && pfPrev && pfNext && pfDotsWrap) {
        const slides = track.querySelectorAll('.portfolio-slide');
        let pfIdx = 0;
        const total = slides.length;
        // Create dots
        for (let i = 0; i < total; i++) {
            const dot = document.createElement('div');
            dot.className = 'portfolio-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => goSlide(i));
            pfDotsWrap.appendChild(dot);
        }
        const dots = pfDotsWrap.querySelectorAll('.portfolio-dot');
        function goSlide(idx) {
            pfIdx = ((idx % total) + total) % total;
            track.style.transform = `translateX(-${pfIdx * 100}%)`;
            dots.forEach((d, i) => d.classList.toggle('active', i === pfIdx));
        }
        pfPrev.addEventListener('click', () => goSlide(pfIdx - 1));
        pfNext.addEventListener('click', () => goSlide(pfIdx + 1));
        // Auto play
        let pfAuto = setInterval(() => goSlide(pfIdx + 1), 4000);
        track.parentElement.addEventListener('mouseenter', () => clearInterval(pfAuto));
        track.parentElement.addEventListener('mouseleave', () => { pfAuto = setInterval(() => goSlide(pfIdx + 1), 4000); });
        // Touch/swipe support
        let startX = 0, diff = 0;
        track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
        track.addEventListener('touchmove', e => { diff = e.touches[0].clientX - startX; }, { passive: true });
        track.addEventListener('touchend', () => { if (Math.abs(diff) > 50) { goSlide(pfIdx + (diff > 0 ? -1 : 1)); } diff = 0; });
    }

    // No-Sales Chat Slider
    const nsTrack = document.getElementById('nosalesTrack');
    const nsPrev = document.getElementById('nsPrev');
    const nsNext = document.getElementById('nsNext');
    const nsDotsWrap = document.getElementById('nsDots');
    if (nsTrack && nsPrev && nsNext && nsDotsWrap) {
        const nsSlider = document.getElementById('nosalesSlider');
        const nsSlides = nsTrack.querySelectorAll('.nosales-slide');
        let nsIdx = 0;
        function getSlidesPerView() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }
        let perView = getSlidesPerView();
        let totalPages = Math.ceil(nsSlides.length / perView);

        // Set slide widths based on slider container width
        function setSizeNs() {
            const sliderW = nsSlider.offsetWidth;
            const slideW = sliderW / perView;
            nsSlides.forEach(s => { s.style.width = slideW + 'px'; });
            nsTrack.style.width = (slideW * nsSlides.length) + 'px';
        }
        setSizeNs();

        function buildDots() {
            nsDotsWrap.innerHTML = '';
            totalPages = Math.ceil(nsSlides.length / perView);
            for (let i = 0; i < totalPages; i++) {
                const dot = document.createElement('div');
                dot.className = 'nosales-dot' + (i === 0 ? ' active' : '');
                dot.addEventListener('click', () => goNs(i));
                nsDotsWrap.appendChild(dot);
            }
        }
        buildDots();

        function goNs(idx) {
            nsIdx = Math.max(0, Math.min(idx, totalPages - 1));
            const slideW = nsSlider.offsetWidth / perView;
            const offset = nsIdx * perView * slideW;
            const maxOffset = (nsSlides.length - perView) * slideW;
            nsTrack.style.transform = 'translateX(-' + Math.min(offset, maxOffset) + 'px)';
            nsDotsWrap.querySelectorAll('.nosales-dot').forEach((d, i) => d.classList.toggle('active', i === nsIdx));
        }
        nsPrev.addEventListener('click', () => goNs(nsIdx - 1));
        nsNext.addEventListener('click', () => goNs(nsIdx + 1));
        // Auto play
        let nsAuto = setInterval(() => goNs(nsIdx >= totalPages - 1 ? 0 : nsIdx + 1), 4000);
        nsTrack.parentElement.parentElement.addEventListener('mouseenter', () => clearInterval(nsAuto));
        nsTrack.parentElement.parentElement.addEventListener('mouseleave', () => { nsAuto = setInterval(() => goNs(nsIdx >= totalPages - 1 ? 0 : nsIdx + 1), 4000); });
        // Touch swipe
        let nsStartX = 0, nsDiff = 0;
        nsTrack.addEventListener('touchstart', e => { nsStartX = e.touches[0].clientX; }, { passive: true });
        nsTrack.addEventListener('touchmove', e => { nsDiff = e.touches[0].clientX - nsStartX; }, { passive: true });
        nsTrack.addEventListener('touchend', () => { if (Math.abs(nsDiff) > 50) { goNs(nsIdx + (nsDiff > 0 ? -1 : 1)); } nsDiff = 0; });
        // Responsive resize
        window.addEventListener('resize', () => {
            const newPV = getSlidesPerView();
            perView = newPV;
            setSizeNs();
            buildDots();
            goNs(0);
        });
    }

    // Review lightbox
    document.querySelectorAll('.review-card img').forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            const lb = document.createElement('div');
            lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;z-index:99999;cursor:pointer;padding:24px;';
            const im = document.createElement('img');
            im.src = img.src;
            im.alt = img.alt;
            im.style.cssText = 'max-width:90vw;max-height:90vh;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.5);';
            lb.appendChild(im);
            lb.addEventListener('click', () => { lb.style.opacity = '0'; setTimeout(() => lb.remove(), 300); });
            lb.style.transition = 'opacity .3s';
            lb.style.opacity = '0';
            document.body.appendChild(lb);
            requestAnimationFrame(() => lb.style.opacity = '1');
        });
    });
});
