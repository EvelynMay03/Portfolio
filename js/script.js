/* Small interactions for the portfolio: theme, menu, scrolling, carousels, and lightbox. */

const navToggle = document.getElementById("nav-toggle");
const primaryNav = document.getElementById("primary-nav");
const themeToggle = document.getElementById("theme-toggle");
const siteHeader = document.getElementById("site-header");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const navLinks = document.querySelectorAll(".nav-link");
const sectionIds = ["home", "about", "projects", "skills", "contact"];

/* Keep this width the same as the mobile menu rule in style.css. */
const mobileQuery = window.matchMedia("(max-width: 860px)");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

function getStoredTheme() {
  try {
    return localStorage.getItem("theme");
  } catch (error) {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch (error) {}
}

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  storeTheme(theme);

  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", theme === "dark" ? "#111318" : "#F5F5F3");
  }

  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
  }
}

function setupThemeToggle() {
  if (!themeToggle) {
    return;
  }

  applyTheme(currentTheme());

  themeToggle.addEventListener("click", () => {
    applyTheme(currentTheme() === "dark" ? "light" : "dark");
  });

  systemThemeQuery.addEventListener("change", (event) => {
    if (getStoredTheme()) {
      return;
    }
    applyTheme(event.matches ? "dark" : "light");
  });
}

function setupStickyHeader() {
  if (!siteHeader) {
    return;
  }

  const updateHeader = () => {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

function closeMobileMenu() {
  primaryNav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open menu");
}

function openMobileMenu() {
  primaryNav.classList.add("is-open");
  navToggle.setAttribute("aria-expanded", "true");
  navToggle.setAttribute("aria-label", "Close menu");
}

function toggleMobileMenu() {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";

  if (isOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

function setupMobileMenu() {
  navToggle.addEventListener("click", toggleMobileMenu);

  document.addEventListener("click", (event) => {
    const clickedToggle = navToggle.contains(event.target);
    const clickedMenu = primaryNav.contains(event.target);

    if (!clickedToggle && !clickedMenu) {
      closeMobileMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });

  /* On a wide screen the links are always visible, so the mobile menu closes. */
  mobileQuery.addEventListener("change", (event) => {
    if (!event.matches) {
      closeMobileMenu();
    }
  });
}

function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));

      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
      closeMobileMenu();
    });
  });
}

function updateActiveNavLink() {
  let currentSectionId = "home";

  sectionIds.forEach((id) => {
    const section = document.getElementById(id);

    if (section && section.getBoundingClientRect().top <= 140) {
      currentSectionId = id;
    }
  });

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${currentSectionId}`;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function setupScrollReveal() {
  const revealItems = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${(index % 2) * 90}ms`;
    observer.observe(item);
  });
}

function setupScrollSpy() {
  updateActiveNavLink();
  window.addEventListener("scroll", updateActiveNavLink, { passive: true });
}

/* One carousel per project. Visitors move the slides; nothing plays automatically. */
function setupCarousel(carousel) {
  const viewport = carousel.querySelector(".carousel-viewport");
  const track = carousel.querySelector(".carousel-track");
  const slides = [...track.querySelectorAll(".carousel-slide")];
  const total = slides.length;
  const prevButton = carousel.querySelector(".carousel-prev");
  const nextButton = carousel.querySelector(".carousel-next");
  const dotsWrap = carousel.querySelector(".carousel-dots");
  const counter = carousel.querySelector(".carousel-count");

  if (total === 0) {
    return;
  }

  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[total - 1].cloneNode(true);
  firstClone.querySelector("img").alt = "";
  lastClone.querySelector("img").alt = "";
  firstClone.setAttribute("aria-hidden", "true");
  lastClone.setAttribute("aria-hidden", "true");
  track.appendChild(firstClone);
  track.insertBefore(lastClone, slides[0]);

  let index = 1;
  let isMoving = false;
  let settleTimer = 0;
  const moveDuration = 450;

  function slideWidth() {
    return viewport.clientWidth;
  }

  function fitFrame(animated) {
    const img = track.children[index]?.querySelector("img");
    if (!img) {
      return;
    }

    const height = Math.round(img.getBoundingClientRect().height);
    if (!height) {
      return;
    }

    viewport.style.transition = animated && !prefersReducedMotion ? `height ${moveDuration}ms ease` : "none";
    viewport.style.height = `${height}px`;
  }

  function placeArrows(img) {
    const imgRect = img.getBoundingClientRect();
    const vpRect = viewport.getBoundingClientRect();
    const gap = 10;
    const button = 36;
    const leftSpace = imgRect.left - vpRect.left;
    const rightSpace = vpRect.right - imgRect.right;

    if (leftSpace > button + gap) {
      prevButton.style.left = `${Math.max(gap, leftSpace - button - gap)}px`;
      nextButton.style.right = `${Math.max(gap, rightSpace - button - gap)}px`;
    } else {
      prevButton.style.left = "12px";
      nextButton.style.right = "12px";
    }
  }

  function paint(animated) {
    fitFrame(animated);
    track.style.transition = animated && !prefersReducedMotion ? `transform ${moveDuration}ms ease` : "none";
    track.style.transform = `translateX(${-index * slideWidth()}px)`;

    const img = track.children[index]?.querySelector("img");
    if (img) {
      placeArrows(img);
    }
  }

  function shownIndex() {
    if (index === 0) {
      return total - 1;
    }
    if (index === total + 1) {
      return 0;
    }
    return index - 1;
  }

  function updateStatus() {
    const current = shownIndex();
    counter.textContent = `${current + 1} / ${total}`;

    dotsWrap.querySelectorAll(".carousel-dot").forEach((dot, dotIndex) => {
      const isActive = dotIndex === current;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", String(isActive));
    });
  }

  function settleClones() {
    window.clearTimeout(settleTimer);
    settleTimer = 0;

    if (index === 0) {
      index = total;
      paint(false);
    } else if (index === total + 1) {
      index = 1;
      paint(false);
    }

    isMoving = false;
  }

  function goTo(nextIndex) {
    if (isMoving || total < 2 || nextIndex === index) {
      return;
    }

    index = nextIndex;
    const animated = !prefersReducedMotion;
    isMoving = animated;
    paint(animated);
    updateStatus();

    if (!animated) {
      settleClones();
      return;
    }

    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(settleClones, moveDuration + 50);
  }

  track.addEventListener("transitionend", (event) => {
    if (event.target !== track || event.propertyName !== "transform" || !isMoving) {
      return;
    }
    settleClones();
  });

  prevButton.addEventListener("click", (event) => {
    event.preventDefault();
    goTo(index - 1);
  });
  nextButton.addEventListener("click", (event) => {
    event.preventDefault();
    goTo(index + 1);
  });

  slides.forEach((slide, slideIndex) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Show screenshot ${slideIndex + 1} of ${total}`);
    dot.addEventListener("click", () => goTo(slideIndex + 1));
    dotsWrap.appendChild(dot);
  });

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    }
  });

  let startX = 0;
  let startY = 0;
  let axis = "";

  viewport.addEventListener(
    "touchstart",
    (event) => {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      axis = "";
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchmove",
    (event) => {
      const deltaX = event.touches[0].clientX - startX;
      const deltaY = event.touches[0].clientY - startY;

      if (!axis && (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8)) {
        axis = Math.abs(deltaX) > Math.abs(deltaY) ? "x" : "y";
      }

      if (axis === "x") {
        event.preventDefault();
      }
    },
    { passive: false }
  );

  viewport.addEventListener("touchend", (event) => {
    if (axis !== "x") {
      return;
    }

    const deltaX = event.changedTouches[0].clientX - startX;
    if (deltaX <= -48) {
      goTo(index + 1);
    } else if (deltaX >= 48) {
      goTo(index - 1);
    }
  });

  function refreshLayout() {
    if (isMoving) {
      return;
    }
    paint(false);
  }

  track.querySelectorAll("img").forEach((img) => {
    if (img.complete) {
      return;
    }
    img.addEventListener("load", refreshLayout);
  });

  window.addEventListener("resize", refreshLayout);
  paint(false);
  updateStatus();
  window.requestAnimationFrame(refreshLayout);

  return {
    getIndex: () => shownIndex(),
    getTotal: () => total,
    goToAbsolute: (absoluteIndex) => goTo(absoluteIndex + 1),
    getImageAt: (absoluteIndex) => slides[absoluteIndex]?.querySelector("img") || null,
  };
}

function setupProjectCarousels() {
  const carousels = [];

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const api = setupCarousel(carousel);
    if (api) {
      carousels.push({ element: carousel, api });
    }
  });

  setupLightbox(carousels);
}

function setupLightbox(carousels) {
  const dialog = document.getElementById("lightbox");
  const image = document.getElementById("lightbox-image");
  const caption = document.getElementById("lightbox-caption");
  const closeButton = document.getElementById("lightbox-close");
  const prevButton = document.getElementById("lightbox-prev");
  const nextButton = document.getElementById("lightbox-next");

  if (!dialog || !image || !closeButton || !prevButton || !nextButton) {
    return;
  }

  let active = null;
  let activeIndex = 0;

  function render() {
    if (!active) {
      return;
    }

    const source = active.api.getImageAt(activeIndex);
    if (!source) {
      return;
    }

    image.src = source.currentSrc || source.src;
    image.alt = source.alt || "Project screenshot";
    caption.textContent = `${activeIndex + 1} / ${active.api.getTotal()}`;
    active.api.goToAbsolute(activeIndex);
  }

  function openLightbox(carouselApiPair, startIndex) {
    active = carouselApiPair;
    activeIndex = startIndex;
    render();

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  }

  function closeLightbox() {
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
    active = null;
  }

  function step(delta) {
    if (!active) {
      return;
    }
    const total = active.api.getTotal();
    activeIndex = (activeIndex + delta + total) % total;
    render();
  }

  carousels.forEach((pair) => {
    pair.element.querySelectorAll(".carousel-slide:not([aria-hidden='true']) img").forEach((img, index) => {
      img.addEventListener("click", () => openLightbox(pair, index));
      img.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(pair, index);
        }
      });
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", `Open screenshot ${index + 1} fullscreen`);
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  prevButton.addEventListener("click", () => step(-1));
  nextButton.addEventListener("click", () => step(1));

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeLightbox();
    }
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
  });
}

setupThemeToggle();
setupStickyHeader();
setupMobileMenu();
setupSmoothScrolling();
setupScrollReveal();
setupScrollSpy();
setupProjectCarousels();
