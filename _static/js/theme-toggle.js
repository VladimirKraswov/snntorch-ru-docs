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

  function isSignatureSeparator(node) {
    return node.nodeType === Node.TEXT_NODE && /^[,\s]*$/.test(node.textContent);
  }

  function isParen(element, value) {
    return (
      element &&
      element.classList &&
      element.classList.contains("sig-paren") &&
      element.textContent.trim() === value
    );
  }

  function findPreviousOpenParen(element) {
    var current = element ? element.previousElementSibling : null;
    while (current) {
      if (isParen(current, "(")) {
        return current;
      }
      current = current.previousElementSibling;
    }
    return null;
  }

  function findNextCloseParen(element) {
    var current = element ? element.nextElementSibling : null;
    while (current) {
      if (isParen(current, ")")) {
        return current;
      }
      current = current.nextElementSibling;
    }
    return null;
  }

  function formatLongSignature(signature) {
    if (signature.classList.contains("snn-signature--expanded")) {
      return;
    }

    var params = Array.prototype.slice.call(
      signature.querySelectorAll(":scope > .sig-param")
    );

    if (params.length < 4 || signature.textContent.trim().length < 96) {
      signature.classList.add("snn-signature--wrapped");
      return;
    }

    var firstParam = params[0];
    var lastParam = params[params.length - 1];
    var openParen = findPreviousOpenParen(firstParam);
    var closeParen = findNextCloseParen(lastParam);

    if (!openParen || !closeParen) {
      signature.classList.add("snn-signature--wrapped");
      return;
    }

    var paramList = document.createElement("span");
    paramList.className = "snn-signature-params";
    paramList.setAttribute("aria-label", "Параметры");

    openParen.classList.add("snn-signature-paren-open");
    closeParen.classList.add("snn-signature-paren-close");
    signature.insertBefore(paramList, openParen.nextSibling);

    var node = paramList.nextSibling;
    while (node && node !== closeParen) {
      var next = node.nextSibling;
      if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains("sig-param")) {
        paramList.appendChild(node);
      } else if (isSignatureSeparator(node) && node.parentNode === signature) {
        signature.removeChild(node);
      }
      node = next;
    }

    node = paramList.nextSibling;
    while (node && node !== closeParen) {
      var nextNode = node.nextSibling;
      if (node.parentNode === signature) {
        signature.removeChild(node);
      }
      node = nextNode;
    }

    var visibleParams = Array.prototype.slice.call(
      paramList.querySelectorAll(":scope > .sig-param")
    );
    visibleParams.forEach(function (param, index) {
      if (index < visibleParams.length - 1) {
        var comma = document.createElement("span");
        comma.className = "snn-signature-param-comma";
        comma.textContent = ",";
        param.appendChild(comma);
      }
    });

    signature.classList.add("snn-signature--expanded");
  }

  function enhanceSignatures() {
    var signatures = document.querySelectorAll("dt.sig.sig-object.py");
    signatures.forEach(formatLongSignature);
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
    document.addEventListener("DOMContentLoaded", function () {
      mountSwitch();
      enhanceSignatures();
    });
  } else {
    mountSwitch();
    enhanceSignatures();
  }
})();
