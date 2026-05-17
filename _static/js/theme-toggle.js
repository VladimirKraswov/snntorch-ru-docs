(function () {
  "use strict";

  var storageKey = "snntorch-ru-theme";
  var root = document.documentElement;
  var mediaQuery = window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

  function readPreference() {
    try {
      var value = window.localStorage.getItem(storageKey);
      return value === "dark" || value === "light" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function systemTheme() {
    return mediaQuery && mediaQuery.matches ? "dark" : "light";
  }

  function currentTheme() {
    return readPreference() || systemTheme();
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    updateButtons(theme);
  }

  function savePreference(theme) {
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (error) {
      // Browsers with disabled storage can still use the current page session.
    }
  }

  function updateButtons(theme) {
    var buttons = document.querySelectorAll(".snn-theme-switch__button");
    buttons.forEach(function (button) {
      button.setAttribute(
        "aria-pressed",
        button.getAttribute("data-theme-value") === theme ? "true" : "false"
      );
    });
  }

  function createButton(theme, label) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "snn-theme-switch__button";
    button.setAttribute("data-theme-value", theme);
    button.textContent = label;
    button.addEventListener("click", function () {
      savePreference(theme);
      applyTheme(theme);
    });
    return button;
  }

  function mountSwitch() {
    if (document.querySelector(".snn-theme-switch")) {
      updateButtons(currentTheme());
      return;
    }

    var host =
      document.querySelector(".switch-menus") ||
      document.querySelector(".wy-side-nav-search");

    if (!host) {
      return;
    }

    var switcher = document.createElement("div");
    switcher.className = "snn-theme-switch";
    switcher.setAttribute("role", "group");
    switcher.setAttribute("aria-label", "Тема оформления");
    switcher.appendChild(createButton("light", "Светлая"));
    switcher.appendChild(createButton("dark", "Тёмная"));
    host.appendChild(switcher);
    updateButtons(currentTheme());
  }

  applyTheme(currentTheme());

  if (mediaQuery) {
    var handleSystemThemeChange = function () {
      if (!readPreference()) {
        applyTheme(systemTheme());
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemThemeChange);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountSwitch);
  } else {
    mountSwitch();
  }
})();
