/**
 * EnBici Nicaragua — GSAP ScrollTrigger Animation System
 * Premium bike brand website animations
 * Dependencies: GSAP 3.12.5 + ScrollTrigger (loaded via CDN in index.html)
 */
(function () {
  'use strict';

  /* ============================================================
     CDN REFERENCES (already in index.html):
       gsap 3.12.5 — cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js
       ScrollTrigger 3.12.5 — cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js
     Ensure these are loaded before this script runs.
  ============================================================ */

  // ── Guard: bail if GSAP isn't available ─────────────────────
  if (typeof gsap === 'undefined') {
    console.warn('[EnBici] GSAP not loaded — animations disabled.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ============================================================
     1. TEXT REVEAL ANIMATIONS
        Elements with class 'reveal' fade in + translateY(30px → 0)
        Trigger: 'top 85%' — per-section staggering with explicit
        reveal-delay-N class support (N = 1–5 ⇒ 0.1s increments).
  ============================================================ */
  function initTextReveals() {
    document.querySelectorAll('.section').forEach(function (section) {
      var reveals = section.querySelectorAll('.reveal');
      if (!reveals.length) return;

      // Build a timeline for this section so all reveals stagger together
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none none',
          // markers: false  // uncomment for debugging
        }
      });

      reveals.forEach(function (el, i) {
        // Respect explicit reveal-delay-N classes, fall back to auto stagger
        var delay = i * 0.08; // auto stagger
        for (var d = 1; d <= 5; d++) {
          if (el.classList.contains('reveal-delay-' + d)) {
            delay = d * 0.12;
            break;
          }
        }

        tl.fromTo(el,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          delay
        );
      });
    });
  }

  /* ============================================================
     2. HERO PARALLAX
        Hero background image translates down 80px as user scrolls
        through the hero section.
        Selector: '#hero .hero-bg img'
  ============================================================ */
  function initHeroParallax() {
    // Primary hero
    var heroImg = document.querySelector('#hero .hero-bg img');
    if (heroImg) {
      gsap.to(heroImg, {
        y: 80,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      });
    }

    // Secondary heroes (#hero-zebra, #hero-raven)
    gsap.utils.toArray('.hero').forEach(function (heroSection) {
      if (heroSection.id === 'hero') return; // already handled above
      var bgImg = heroSection.querySelector('.hero-bg img');
      if (bgImg) {
        gsap.to(bgImg, {
          y: 60,
          ease: 'none',
          scrollTrigger: {
            trigger: heroSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        });
      }
    });
  }

  /* ============================================================
     3. PRODUCT IMAGE TRANSITIONS
        Handled inside switchProduct() / switchProduct2() below.
        Animate from opacity 0.5 + scale 0.98 → opacity 1 + scale 1
        over 0.5s with power2.out ease.
  ============================================================ */

  /* ============================================================
     4. NAV SCROLL BEHAVIOR
        Switch nav from transparent/white-text (nav--transparent)
        to white-bg/dark-text (nav--solid) when user scrolls past
        the hero section bottom. Uses ScrollTrigger for clean
        enter/leave toggling.
  ============================================================ */
  function initNavScroll() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    // Use ScrollTrigger to drive the class toggle based on hero section
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'bottom bottom',      // hero bottom hits viewport bottom
      end: 'bottom top',            // hero bottom passes viewport top
      onEnter: function () {
        nav.classList.remove('nav--transparent');
        nav.classList.add('nav--solid');
      },
      onLeaveBack: function () {
        nav.classList.add('nav--transparent');
        nav.classList.remove('nav--solid');
      }
      // No toggleActions — we use the callbacks for explicit control
    });
  }

  /* ============================================================
     5. SECTION ENTER ANIMATION
        Each .section gets a subtle scale(0.98 → 1) as it enters
        the viewport, with power2.out ease.
  ============================================================ */
  function initSectionEnter() {
    gsap.utils.toArray('.section').forEach(function (section) {
      // Skip the hero (it's the starting point, shouldn't scale-in)
      if (section.id === 'hero') return;

      gsap.fromTo(section,
        { scale: 0.98, transformOrigin: 'center center' },
        {
          scale: 1,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 92%',
            toggleActions: 'play none none none',
            // once: true   // uncomment if you want it only once
          }
        }
      );
    });
  }

  /* ============================================================
     PRODUCT DATA & SWITCHERS
     (1) switchProduct(idx)  — for #modelos  (Monkey / Zebra)
     (2) switchProduct2(idx) — for #modelos-zebra (Zebra / Raven)
     Both animate product image from opacity 0.5/scale 0.98 → 1/1
     over 0.5s with power2.out ease.
  ============================================================ */

  // ── Product set 1: Monkey → Zebra ───────────────────────────
  var products1 = [
    {
      name: 'GW Zebra — Tu entrada al MTB',
      sub: 'Ideal para principiantes · Cuadro aluminio · Frenos disco',
      img: 'https://s3.imginn.com/688506588_18008535107856831_3502327725756954636_n.jpg?stp=dst-jpg_e35_s640x640_sh2.08_tt6',
      tags: ['Equilibrio perfecto', 'Estabilidad', 'Control total']
    },
    {
      name: 'GW Ocelot — La探险adora',
      sub: 'Mountain bike · Suspensión delantera · 21 velocidades',
      img: 'https://s3.imginn.com/686517948_966126729297816_2753789692704178521_n.jpg?stp=dst-jpg_e35_s640x640_sh2.08_tt6',
      tags: ['Para montaña', 'Frenos disco', 'GW Colombia']
    }
  ];

  window.switchProduct = function (idx) {
    var p = products1[idx];
    var nameEl = document.getElementById('prod1-name');
    var subEl  = document.getElementById('prod1-sub');
    var imgEl  = document.getElementById('prod1-img');
    var tagsContainer = document.querySelector('#modelos .product-tags');

    if (nameEl) nameEl.textContent = p.name;
    if (subEl)  subEl.textContent  = p.sub;

    // Update tags
    if (tagsContainer) {
      tagsContainer.innerHTML = p.tags.map(function (t) {
        return '<span class="product-tag">' + t + '</span>';
      }).join('');
    }

    // Update active state on tabs & dots
    document.querySelectorAll('#modelos .product-tab').forEach(function (t, i) {
      t.classList.toggle('active', i === idx);
    });
    document.querySelectorAll('#modelos .product-dot').forEach(function (d, i) {
      d.classList.toggle('active', i === idx);
    });

    // ── Product image crossfade + scale (requirement #3) ──
    if (imgEl) {
      gsap.fromTo(imgEl,
        { opacity: 0.5, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
      );
      imgEl.src = p.img;
    }
  };

  // ── Product set 2: Zebra → Raven ────────────────────────────
  var products2 = [
    {
      name: 'GW Jackal 1x11 — Potencia pura',
      sub: 'Alto rendimiento · Transmisión 1x11 · Frenos hidráulicos',
      img: 'https://s3.imginn.com/656278221_18002937410856831_3110246088265330419_n.jpg?stp=dst-jpg_e35_p640x640_sh2.08_tt6',
      tags: ['11 velocidades', 'Potencia', 'Estilo']
    },
    {
      name: 'GW Raven — La intrépida',
      sub: 'Cuadro paso-bajo · Doble suspensión · Shimano 24v',
      img: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=1000&q=85',
      tags: ['Doble suspensión', '24 velocidades', 'Frenos disco']
    }
  ];

  window.switchProduct2 = function (idx) {
    var p = products2[idx];
    var nameEl = document.getElementById('prod2-name');
    var subEl  = document.getElementById('prod2-sub');
    var imgEl  = document.getElementById('prod2-img');
    var tagsContainer = document.querySelector('#modelos-zebra .product-tags');

    if (nameEl) nameEl.textContent = p.name;
    if (subEl)  subEl.textContent  = p.sub;

    if (tagsContainer) {
      tagsContainer.innerHTML = p.tags.map(function (t) {
        return '<span class="product-tag">' + t + '</span>';
      }).join('');
    }

    document.querySelectorAll('#modelos-zebra .product-tab').forEach(function (t, i) {
      t.classList.toggle('active', i === idx);
    });
    document.querySelectorAll('#modelos-zebra .product-dot').forEach(function (d, i) {
      d.classList.toggle('active', i === idx);
    });

    // ── Product image crossfade + scale ──
    if (imgEl) {
      gsap.fromTo(imgEl,
        { opacity: 0.5, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
      );
      imgEl.src = p.img;
    }
  };

  /* ============================================================
     THREE.JS — SUBTLE WEBGL PARTICLES (hero background)
  ============================================================ */
  function initWebGLParticles() {
    var hero = document.getElementById('hero');
    if (!hero) return;

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;mix-blend-mode:screen;opacity:.45';
    hero.insertBefore(canvas, hero.firstChild);

    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = function () {
      var THREE = window.THREE;
      var dpr = Math.min(window.devicePixelRatio, 1.5);
      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(dpr);

      var scene  = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 50);
      camera.position.z = 5;

      // ── Canvas-generated rounded-diamond sprite ─────
      function createSprite(colorHex, size) {
        var c = document.createElement('canvas');
        c.width = c.height = size;
        var ctx = c.getContext('2d');
        var half = size / 2;
        var gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
        gradient.addColorStop(0, colorHex);
        gradient.addColorStop(0.15, colorHex);
        gradient.addColorStop(0.4, colorHex.replace('1)', '0.6)').replace('rgb', 'rgba'));
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        // Diamond shape
        ctx.beginPath();
        ctx.moveTo(half, 0);
        ctx.lineTo(size, half);
        ctx.lineTo(half, size);
        ctx.lineTo(0, half);
        ctx.closePath();
        ctx.fill();
        var tex = new THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        return tex;
      }

      var texOrange = createSprite('rgb(191,72,0)', 64);
      var texWhite  = createSprite('rgb(255,255,255)', 48);

      // ── Orange particle field (600 particles) ─────
      var countA = 600, geoA = new THREE.BufferGeometry(), posA = new Float32Array(countA * 3);
      for (var i = 0; i < countA * 3; i += 3) {
        var r = 4 + Math.random() * 3;
        var theta = Math.random() * Math.PI * 2;
        var phi = Math.acos(2 * Math.random() - 1);
        posA[i] = r * Math.sin(phi) * Math.cos(theta);
        posA[i+1] = r * Math.sin(phi) * Math.sin(theta);
        posA[i+2] = (Math.random() - 0.5) * 3;
      }
      geoA.setAttribute('position', new THREE.BufferAttribute(posA, 3));
      var matA = new THREE.PointsMaterial({ map: texOrange, size: 0.12, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
      var particlesA = new THREE.Points(geoA, matA);
      scene.add(particlesA);

      // ── White accent particles (300) ─────
      var countB = 300, geoB = new THREE.BufferGeometry(), posB = new Float32Array(countB * 3);
      for (var j = 0; j < countB * 3; j += 3) {
        var r2 = 3.5 + Math.random() * 4;
        var theta2 = Math.random() * Math.PI * 2;
        var phi2 = Math.acos(2 * Math.random() - 1);
        posB[j] = r2 * Math.sin(phi2) * Math.cos(theta2);
        posB[j+1] = r2 * Math.sin(phi2) * Math.sin(theta2);
        posB[j+2] = (Math.random() - 0.5) * 3;
      }
      geoB.setAttribute('position', new THREE.BufferAttribute(posB, 3));
      var matB = new THREE.PointsMaterial({ map: texWhite, size: 0.08, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
      var particlesB = new THREE.Points(geoB, matB);
      scene.add(particlesB);

      // ── Central glow sphere (custom shader) ─────
      var glowGeo = new THREE.SphereGeometry(0.85, 48, 48);
      var glowMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: 'varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: 'varying vec3 vNormal; uniform float uTime; void main() { float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0,0,1))), 3.0); float pulse = 1.0 + sin(uTime * 1.3) * 0.15 + sin(uTime * 2.7) * 0.08; gl_FragColor = vec4(0.749, 0.282, 0.0, fresnel * pulse * 0.25); }',
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
      });
      var glow = new THREE.Mesh(glowGeo, glowMat);
      scene.add(glow);

      // ── Resize ─────────────────────────────────
      function resize() {
        var w = hero.offsetWidth, h = hero.offsetHeight;
        if (!w || !h) return;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      resize();
      window.addEventListener('resize', resize);

      // ── Animation + IntersectionObserver ────────
      var visible = true;
      var observer = new IntersectionObserver(function(entries) {
        visible = entries[0].isIntersecting;
      }, { threshold: 0.05 });
      observer.observe(hero);

      function animate(time) {
        requestAnimationFrame(animate);
        if (!visible) return;
        particlesA.rotation.y += 0.00012;
        particlesA.rotation.x += 0.00006;
        particlesB.rotation.y -= 0.0001;
        particlesB.rotation.x += 0.00008;
        glow.material.uniforms.uTime.value = time * 0.001;
        glow.rotation.y += 0.0008;
        renderer.render(scene, camera);
      }
      requestAnimationFrame(animate);
    };
    document.head.appendChild(script);
  }

  /* ============================================================
     MAGNETIC CTA BUTTONS — spring physics follow-cursor
  ============================================================ */
  function initMagneticButtons() {
    var btns = document.querySelectorAll('.hero-cta, .product-cta');
    btns.forEach(function(btn) {
      var bounds = null;
      var cx = 0, cy = 0, tx = 0, ty = 0, raf = null, running = false;
      var radius = 40;
      var px = 0, py = 0; // current position

      function updateBounds() { bounds = btn.getBoundingClientRect(); }
      updateBounds();
      window.addEventListener('resize', updateBounds);
      window.addEventListener('scroll', updateBounds);

      function spring() {
        var dx = tx - px;
        var dy = ty - py;
        px += dx * 0.2;
        py += dy * 0.2;
        btn.style.transform = 'translate3d(' + px.toFixed(2) + 'px,' + py.toFixed(2) + 'px,0)';
        if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05 || Math.abs(tx) > 0.05 || Math.abs(ty) > 0.05) {
          raf = requestAnimationFrame(spring);
        } else {
          px = 0; py = 0;
          btn.style.transform = '';
          raf = null; running = false;
        }
      }

      function startSpring() {
        if (!running) { running = true; spring(); }
      }

      btn.addEventListener('mousemove', function(e) {
        if (!bounds) return;
        cx = e.clientX - bounds.left - bounds.width / 2;
        cy = e.clientY - bounds.top - bounds.height / 2;
        var dist = Math.sqrt(cx*cx + cy*cy);
        tx = dist < radius ? cx * 0.35 : 0;
        ty = dist < radius ? cy * 0.35 : 0;
        startSpring();
      });

      btn.addEventListener('mouseleave', function() {
        tx = 0; ty = 0;
        startSpring();
      });
    });
  }

  /* ============================================================
     CURSOR FOLLOWER — premium dot trail
  ============================================================ */
  function initCursorFollower() {
    var dot = document.createElement('div');
    dot.style.cssText = 'position:fixed;width:12px;height:12px;border-radius:50%;background:#BF4800;pointer-events:none;z-index:9999;mix-blend-mode:difference;transition:width .3s,height .3s,background .3s;transform:translate(-50%,-50%);opacity:0';
    document.body.appendChild(dot);
    
    var mx = 0, my = 0, px = 0, py = 0;
    document.addEventListener('mousemove', function(e) { mx = e.clientX; my = e.clientY; dot.style.opacity = '1'; });
    document.addEventListener('mouseleave', function() { dot.style.opacity = '0'; });
    
    // Hover on links/buttons → enlarge dot
    document.querySelectorAll('a, button').forEach(function(el) {
      el.addEventListener('mouseenter', function() { dot.style.width = '32px'; dot.style.height = '32px'; dot.style.background = 'rgba(191,72,0,.4)'; });
      el.addEventListener('mouseleave', function() { dot.style.width = '12px'; dot.style.height = '12px'; dot.style.background = '#BF4800'; });
    });
    
    function follow() {
      px += (mx - px) * 0.15;
      py += (my - py) * 0.15;
      dot.style.left = px + 'px';
      dot.style.top = py + 'px';
      requestAnimationFrame(follow);
    }
    follow();
  }

  /* ============================================================
     COUNTER ANIMATION — numbers count up on scroll
  ============================================================ */
  function initCounters() {
    document.querySelectorAll('[data-count]').forEach(function(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var duration = 2000;
      var triggered = false;
      
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        onEnter: function() {
          if (triggered) return;
          triggered = true;
          var start = performance.now();
          function tick(now) {
            var elapsed = now - start;
            var progress = Math.min(elapsed / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target;
          }
          requestAnimationFrame(tick);
        }
      });
    });
  }

  /* ============================================================
     NAV LINK UNDERLINE — sliding indicator
  ============================================================ */
  function initNavUnderline() {
    var nav = document.getElementById('nav');
    var links = nav ? nav.querySelectorAll('.nav-links a') : [];
    if (!links.length) return;
    
    var underline = document.createElement('div');
    underline.style.cssText = 'position:absolute;bottom:12px;height:2px;background:#BF4800;border-radius:1px;transition:left .3s ease,width .3s ease;pointer-events:none';
    nav.style.position = 'relative';
    nav.appendChild(underline);
    
    function updateUnderline(el) {
      if (!el) { underline.style.width = '0'; return; }
      var rect = el.getBoundingClientRect();
      var navRect = nav.getBoundingClientRect();
      underline.style.left = (rect.left - navRect.left) + 'px';
      underline.style.width = rect.width + 'px';
    }
    
    links.forEach(function(link) {
      link.addEventListener('mouseenter', function() { updateUnderline(link); });
      link.addEventListener('mouseleave', function() { updateUnderline(null); });
    });
  }

  /* ============================================================
     IMAGE REVEAL — clip-path animation on scroll
  ============================================================ */
  function initImageReveals() {
    document.querySelectorAll('.img-reveal').forEach(function(el) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: function() { el.classList.add('visible'); },
        once: true
      });
    });
  }

  /* ============================================================
     BOOTSTRAP — run everything after DOM is ready
  ============================================================ */
  function boot() {
    initTextReveals();
    initHeroParallax();
    initNavScroll();
    initSectionEnter();
    initWebGLParticles();
    initMagneticButtons();
    initCursorFollower();
    initCounters();
    initNavUnderline();
    initImageReveals();

    // ── Banner dismiss auto-restore timer ─────────────────────
    var banner = document.getElementById('banner');
    if (banner) {
      // Re-show banner after 30s if user dismissed it
      var bannerObserver = new MutationObserver(function () {
        if (banner.classList.contains('hidden')) {
          setTimeout(function () {
            banner.classList.remove('hidden');
          }, 30000);
        }
      });
      bannerObserver.observe(banner, { attributes: true, attributeFilter: ['class'] });
    }

    console.log('🚲 EnBici Nicaragua — GSAP ScrollTrigger animation system ready.');
  }

  // Fire when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
