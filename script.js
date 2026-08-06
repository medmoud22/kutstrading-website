(function () {
  'use strict';

  var header = document.getElementById('siteHeader');
  var menuToggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  var iconOpen = document.getElementById('iconOpen');
  var iconClose = document.getElementById('iconClose');
  var toast = document.getElementById('toast');
  var toastTimer = null;

  var STORAGE_KEY = 'kuts_lang';
  var DEFAULT_LANG = 'en';
  var dict = window.KUTS_I18N || {};
  var currentLang = getLang();

  function getLang() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (saved && dict[saved]) return saved;
    var nav = (navigator.language || DEFAULT_LANG).slice(0, 2).toLowerCase();
    return dict[nav] ? nav : DEFAULT_LANG;
  }

  function t(key, lang) {
    var table = dict[lang] || {};
    if (table[key] !== undefined) return table[key];
    var fallback = dict[DEFAULT_LANG] || {};
    return fallback[key] !== undefined ? fallback[key] : key;
  }

  function tt(key) {
    return t(key, currentLang);
  }

  function applyTranslations(lang) {
    if (!dict[lang]) return;
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (key) el.textContent = tt(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (key) el.setAttribute('placeholder', tt(key));
    });
    document.querySelectorAll('.lang-option').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
  }

  document.querySelectorAll('.lang-option').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var lang = btn.getAttribute('data-lang');
      if (!lang || !dict[lang]) return;
      applyTranslations(lang);
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
      var toggle = document.getElementById('langToggle');
      if (toggle) toggle.blur();
    });
  });

  applyTranslations(currentLang);

  function headerScroll() {
    if (window.scrollY > 10) {
      header.classList.add('shadow-lg');
    } else {
      header.classList.remove('shadow-lg');
    }
  }

  function closeMenu() {
    mobileMenu.classList.add('hidden');
    iconOpen.classList.remove('hidden');
    iconClose.classList.add('hidden');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  menuToggle.addEventListener('click', function () {
    var isOpen = !mobileMenu.classList.contains('hidden');
    if (isOpen) {
      closeMenu();
    } else {
      mobileMenu.classList.remove('hidden');
      iconOpen.classList.add('hidden');
      iconClose.classList.remove('hidden');
      menuToggle.setAttribute('aria-expanded', 'true');
    }
  });

  document.querySelectorAll('.mobile-link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('scroll', headerScroll, { passive: true });
  headerScroll();

  var navLinks = document.querySelectorAll('.nav-link');
  var sections = Array.prototype.map.call(navLinks, function (link) {
    return document.querySelector(link.getAttribute('href'));
  });

  function highlightNav() {
    var pos = window.scrollY + 120;
    var current = sections[0];
    sections.forEach(function (section) {
      if (section && section.offsetTop <= pos) current = section;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current.id);
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });
  highlightNav();

  var revealEls = document.querySelectorAll('.reveal');
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach(function (el) { io.observe(el); });

  function showToast(message, type) {
    toast.textContent = message;
    toast.className = 'toast show ' + (type || '');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 4200);
  }

  var form = document.getElementById('contactForm');

  function setInvalid(input) {
    input.classList.add('invalid');
    var err = form.querySelector('[data-error-for="' + input.id + '"]');
    if (err) err.classList.add('visible');
  }

  function clearInvalid(input) {
    input.classList.remove('invalid');
    var err = form.querySelector('[data-error-for="' + input.id + '"]');
    if (err) err.classList.remove('visible');
  }

  function validateName(input) {
    var ok = input.value.trim().length >= 2;
    if (ok) clearInvalid(input); else setInvalid(input);
    return ok;
  }

  function validateEmail(input) {
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
    if (ok) clearInvalid(input); else setInvalid(input);
    return ok;
  }

  function validateMessage(input) {
    var ok = input.value.trim().length >= 10;
    if (ok) clearInvalid(input); else setInvalid(input);
    return ok;
  }

  var nameInput = document.getElementById('name');
  var emailInput = document.getElementById('email');
  var messageInput = document.getElementById('message');
  var phoneInput = document.getElementById('phone');
  var interestInput = document.getElementById('interest');

  nameInput.addEventListener('blur', function () { if (nameInput.value) validateName(nameInput); });
  emailInput.addEventListener('blur', function () { if (emailInput.value) validateEmail(emailInput); });
  messageInput.addEventListener('blur', function () { if (messageInput.value) validateMessage(messageInput); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var valid =
      validateName(nameInput) &
      validateEmail(emailInput) &
      validateMessage(messageInput);

    if (!valid) {
      showToast(tt('form.invalid'), 'error');
      return;
    }

    var name = nameInput.value.trim();
    var email = emailInput.value.trim();
    var phone = phoneInput.value.trim();
    var interest = interestInput.value;
    var message = messageInput.value.trim();

    var body =
      'New inquiry from kutstrading.com website\n\n' +
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Phone: ' + (phone || '-') + '\n' +
      'Interest: ' + interest + '\n\n' +
      'Message:\n' + message;

    var mailLink =
      'mailto:info@kutstrading.com' +
      '?subject=' + encodeURIComponent('Website Inquiry - ' + interest + ' (' + name + ')') +
      '&body=' + encodeURIComponent(body);

    form.reset();
    showToast(tt('form.sent'), 'success');
    window.location.href = mailLink;
  });

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
