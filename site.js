(function () {
  "use strict";

  var root = document.documentElement;
  var reducedQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var reduceMotion = !!(reducedQuery && reducedQuery.matches);
  var savedTheme = null;
  try { savedTheme = window.localStorage.getItem("pt-theme"); } catch (error) {}
  if (savedTheme === "dark") root.setAttribute("data-theme", "dark");

  function iconMoon() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.1A8.6 8.6 0 0 1 8.9 3.8 8.7 8.7 0 1 0 20.2 15.1Z"/></svg>'; }
  function iconSun() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>'; }
  function iconMenu() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'; }
  function iconClose() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>'; }

  var header = document.querySelector(".site-header");
  var nav = header && header.querySelector(".nav");
  var brand = header && header.querySelector(".brand");
  var tools = null;
  var theme = null;
  var menu = null;
  var indicator = null;

  function closeMenu() {
    if (!nav || !menu) return;
    nav.classList.remove("is-open");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation menu");
    menu.title = "Open navigation menu";
    menu.innerHTML = iconMenu();
  }

  if (header && nav && brand) {
    if (!nav.id) nav.id = "primary-navigation";
    tools = document.createElement("div");
    tools.className = "header-tools";
    theme = document.createElement("button");
    theme.type = "button";
    theme.className = "theme-toggle";
    theme.setAttribute("aria-label", root.getAttribute("data-theme") === "dark" ? "Switch to light theme" : "Switch to dark theme");
    theme.title = theme.getAttribute("aria-label");
    theme.innerHTML = root.getAttribute("data-theme") === "dark" ? iconSun() : iconMoon();

    menu = document.createElement("button");
    menu.type = "button";
    menu.className = "menu-toggle";
    menu.setAttribute("aria-controls", nav.id);
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation menu");
    menu.title = "Open navigation menu";
    menu.innerHTML = iconMenu();
    tools.appendChild(theme);
    tools.appendChild(menu);
    brand.after(tools);

    function placeControls() {
      if (window.innerWidth <= 760) {
        if (theme.parentNode !== tools) tools.appendChild(theme);
        if (menu.parentNode !== tools) tools.appendChild(menu);
      } else {
        var cta = nav.querySelector(".nav-cta") || nav.querySelector(".btn");
        if (cta && cta.nextElementSibling !== theme) cta.after(theme);
        else if (!cta && theme.parentNode !== nav) nav.appendChild(theme);
        if (menu.parentNode !== tools) tools.appendChild(menu);
        closeMenu();
      }
      updateNavIndicator();
    }

    function setTheme(dark) {
      if (dark) root.setAttribute("data-theme", "dark");
      else root.removeAttribute("data-theme");
      theme.innerHTML = dark ? iconSun() : iconMoon();
      theme.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
      theme.title = theme.getAttribute("aria-label");
      try { window.localStorage.setItem("pt-theme", dark ? "dark" : "light"); } catch (error) {}
    }

    theme.addEventListener("click", function () {
      setTheme(root.getAttribute("data-theme") !== "dark");
    });
    menu.addEventListener("click", function () {
      var open = menu.getAttribute("aria-expanded") !== "true";
      if (open) {
        nav.classList.add("is-open");
        menu.setAttribute("aria-expanded", "true");
        menu.setAttribute("aria-label", "Close navigation menu");
        menu.title = "Close navigation menu";
        menu.innerHTML = iconClose();
      } else closeMenu();
    });
    nav.addEventListener("click", function (event) {
      if (event.target && event.target.closest && event.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
    placeControls();

    indicator = document.createElement("span");
    indicator.className = "nav-indicator";
    indicator.setAttribute("aria-hidden", "true");
    nav.appendChild(indicator);
  }

  function normalizedPath(value) {
    var path = value || "/";
    return path.length > 1 ? path.replace(/\/+$/, "") + "/" : "/";
  }

  function setPageNavState() {
    if (!nav) return;
    var currentPath = normalizedPath(window.location.pathname);
    var links = nav.querySelectorAll("a[href]");
    links.forEach(function (link) {
      var url;
      try { url = new URL(link.href, window.location.href); } catch (error) { return; }
      if (url.origin !== window.location.origin) return;
      var linkPath = normalizedPath(url.pathname);
      var homeAlias = linkPath === "/" && (currentPath === "/" || currentPath === "/index.html");
      if (linkPath === currentPath || homeAlias) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function updateNavIndicator(target) {
    if (!nav || !indicator || window.innerWidth <= 760) return;
    var active = target || nav.querySelector('a[aria-current="location"]') || nav.querySelector('a[aria-current="page"]') || nav.querySelector('a[href="./"], a[href="../"]');
    if (!active || !active.offsetParent) {
      indicator.style.opacity = "0";
      return;
    }
    var navRect = nav.getBoundingClientRect();
    var linkRect = active.getBoundingClientRect();
    indicator.style.width = Math.max(0, linkRect.width) + "px";
    indicator.style.transform = "translateX(" + Math.round(linkRect.left - navRect.left) + "px)";
    indicator.style.opacity = "1";
  }

  setPageNavState();

  function setupPageTransitions() {
    if (reduceMotion) return;
    root.classList.add("motion-ready");
    document.body.classList.add("page-enter");
    window.requestAnimationFrame(function () { document.body.classList.add("page-entered"); });
    if (!nav) return;
    document.addEventListener("click", function (event) {
      var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target === "_blank" || link.hasAttribute("download")) return;
      var destination;
      try { destination = new URL(link.href, window.location.href); } catch (error) { return; }
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname && destination.hash) return;
      event.preventDefault();
      document.body.classList.add("page-leaving");
      window.setTimeout(function () { window.location.href = destination.href; }, 300);
    });
  }

  function setupScrollReveal() {
    if (reduceMotion) {
      root.classList.add("motion-reduced");
      return;
    }
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll("main > section, .audience-tags, .grid .card, .steps article, .about-grid, .contact-panel").forEach(function (item) {
        item.classList.add("is-revealed");
      });
      return;
    }
    var revealTargets = [];
    document.querySelectorAll("main > section:not(.hero-section), .audience-tags, .grid .card, .steps article, .about-grid, .contact-panel, .legal-note").forEach(function (item) {
      item.classList.add("reveal-on-scroll");
      revealTargets.push(item);
    });
    document.querySelectorAll(".grid .card, .steps article, .audience-tags span").forEach(function (item, index) {
      item.style.setProperty("--stagger-delay", Math.min(index * 100, 500) + "ms");
    });
    root.classList.add("motion-ready");
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealTargets.forEach(function (item) { observer.observe(item); });
  }

  function setupHeroEntrance() {
    if (reduceMotion || !document.querySelector(".hero-copy")) return;
    root.classList.add("hero-motion-ready");
    var audience = document.querySelectorAll(".audience-tags span");
    audience.forEach(function (item, index) {
      item.style.setProperty("--audience-delay", Math.min(index * 90, 450) + "ms");
    });
  }

  function setupScrollControls() {
    var progress = document.createElement("div");
    progress.className = "scroll-progress";
    progress.setAttribute("role", "progressbar");
    progress.setAttribute("aria-label", "Page scroll progress");
    progress.setAttribute("aria-valuemin", "0");
    progress.setAttribute("aria-valuemax", "100");
    progress.setAttribute("aria-valuenow", "0");
    document.body.appendChild(progress);

    var backToTop = Array.prototype.find.call(document.querySelectorAll(".site-footer a[href='#main-content']"), function (link) {
      return /back to top/i.test(link.textContent || "");
    });
    if (backToTop) {
      backToTop.classList.add("back-to-top");
      backToTop.setAttribute("aria-label", "Back to top");
      backToTop.tabIndex = -1;
    }

    var homePage = normalizedPath(window.location.pathname) === "/" || normalizedPath(window.location.pathname) === "/index.html";
    var sectionMap = [];
    if (homePage && nav) {
      var serviceSection = document.querySelector(".grid") && document.querySelector(".grid").closest("section");
      var sections = [
        { selector: ".hero-section", href: "/" },
        { element: serviceSection, href: "/services/" },
        { selector: ".about", href: "/about/" },
        { selector: ".contact", href: "/contact/" }
      ];
      sectionMap = sections.map(function (entry) {
        return { element: entry.element || document.querySelector(entry.selector), href: entry.href };
      }).filter(function (entry) { return !!entry.element; });
    }

    var lastY = window.scrollY || 0;
    var rafPending = false;
    function update() {
      rafPending = false;
      var y = window.scrollY || window.pageYOffset || 0;
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      var amount = Math.max(0, Math.min(1, y / max));
      progress.style.transform = "scaleX(" + amount + ")";
      progress.setAttribute("aria-valuenow", String(Math.round(amount * 100)));

      if (header) {
        header.classList.toggle("is-scrolled", y > 80);
        if (y <= 80) header.classList.remove("is-hidden");
        else if (y > lastY + 3) header.classList.add("is-hidden");
        else if (y < lastY - 3) header.classList.remove("is-hidden");
      }
      if (backToTop) {
        var visible = y > 420;
        backToTop.classList.toggle("is-visible", visible);
        backToTop.tabIndex = visible ? 0 : -1;
        backToTop.setAttribute("aria-hidden", visible ? "false" : "true");
      }
      if (sectionMap.length && nav) {
        var active = sectionMap[0];
        sectionMap.forEach(function (entry) {
          if (entry.element.getBoundingClientRect().top <= window.innerHeight * 0.45) active = entry;
        });
        var activeLink = Array.prototype.find.call(nav.querySelectorAll('a[href]'), function (link) {
          try { return normalizedPath(new URL(link.href, location.href).pathname) === normalizedPath(active.href); } catch (error) { return false; }
        });
        nav.querySelectorAll('a[aria-current="location"]').forEach(function (link) { link.removeAttribute("aria-current"); });
        if (activeLink && activeLink.getAttribute("aria-current") !== "page") activeLink.setAttribute("aria-current", "location");
        updateNavIndicator(activeLink);
      } else updateNavIndicator();
      lastY = y;
    }
    window.addEventListener("scroll", function () {
      if (rafPending) return;
      rafPending = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener("resize", function () {
      if (rafPending) return;
      rafPending = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  setupPageTransitions();
  setupHeroEntrance();
  setupScrollReveal();
  setupScrollControls();

  if (header) window.addEventListener("resize", function () {
    if (window.innerWidth > 760) closeMenu();
    updateNavIndicator();
  }, { passive: true });
}());