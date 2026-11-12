(function () {
  "use strict";
  var root = document.documentElement;
  var savedTheme = null;
  try { savedTheme = window.localStorage.getItem("pt-theme"); } catch (e) {}
  if (savedTheme === "dark") root.setAttribute("data-theme", "dark");

  function iconMoon() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.1A8.6 8.6 0 0 1 8.9 3.8 8.7 8.7 0 1 0 20.2 15.1Z"/></svg>'; }
  function iconSun() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>'; }
  function iconMenu() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'; }
  function iconClose() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>'; }

  var header = document.querySelector(".site-header");
  if (!header) return;
  var brand = header.querySelector(".brand");
  var nav = header.querySelector(".nav");
  if (!brand || !nav) return;
  if (!nav.id) nav.id = "primary-navigation";

  var tools = document.createElement("div");
  tools.className = "header-tools";
  var theme = document.createElement("button");
  theme.type = "button";
  theme.className = "theme-toggle";
  theme.setAttribute("aria-label", root.getAttribute("data-theme") === "dark" ? "Switch to light theme" : "Switch to dark theme");
  theme.title = theme.getAttribute("aria-label");
  theme.innerHTML = root.getAttribute("data-theme") === "dark" ? iconSun() : iconMoon();

  var menu = document.createElement("button");
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

  function closeMenu() {
    nav.classList.remove("is-open");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation menu");
    menu.title = "Open navigation menu";
    menu.innerHTML = iconMenu();
  }

  theme.addEventListener("click", function () {
    var dark = root.getAttribute("data-theme") !== "dark";
    if (dark) root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    theme.innerHTML = dark ? iconSun() : iconMoon();
    theme.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    theme.title = theme.getAttribute("aria-label");
    try { window.localStorage.setItem("pt-theme", dark ? "dark" : "light"); } catch (e) {}
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
  window.addEventListener("resize", function () {
    if (window.innerWidth > 760) closeMenu();
  });
}());
