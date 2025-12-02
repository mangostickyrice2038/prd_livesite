const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = Array.from(
  document.querySelectorAll(".site-nav .js-navlink")
);
const siteNavLinks = document.querySelectorAll(".site-nav a");
const anchorLinks = document.querySelectorAll('a[href^="#"]');
const observedSections = document.querySelectorAll("[data-observe]");
const scrollSections = document.querySelectorAll(".js-section");
const yearEl = document.getElementById("year");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const HEADER_CONDENSE_OFFSET = 160;
let scrollTicking = false;
let activeNavLink = null;

const navLinkMap = new Map();
navLinks.forEach((link) => {
  const href = link.getAttribute("href");
  if (href && href.startsWith("#")) {
    navLinkMap.set(href.slice(1), link);
  }
});

const activateNavLink = (id) => {
  if (!id || !navLinkMap.has(id)) {
    return;
  }

  const targetLink = navLinkMap.get(id);
  if (activeNavLink === targetLink) {
    return;
  }

  navLinks.forEach((link) => {
    link.classList.remove("is-active");
    link.removeAttribute("aria-current");
  });

  targetLink.classList.add("is-active");
  targetLink.setAttribute("aria-current", "page");
  activeNavLink = targetLink;
};

const defaultActiveId = navLinks[0]?.getAttribute("href")?.slice(1);
if (defaultActiveId) {
  activateNavLink(defaultActiveId);
}

const closeMenu = () => {
  document.body.classList.remove("menu-open");
  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "false");
  }
};

const openMenu = () => {
  document.body.classList.add("menu-open");
  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "true");
  }
};

const toggleMenu = () => {
  if (document.body.classList.contains("menu-open")) {
    closeMenu();
  } else {
    openMenu();
  }
};

menuToggle?.addEventListener("click", () => {
  toggleMenu();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

siteNavLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
  });
});

const getHeaderOffset = () => {
  const headerHeight = siteHeader?.offsetHeight ?? 0;
  return headerHeight + 16;
};

anchorLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || !targetId.startsWith("#")) {
      return;
    }

    const target = document.querySelector(targetId);
    if (!target) {
      return;
    }

    event.preventDefault();
    activateNavLink(targetId.slice(1));
    const offset = getHeaderOffset();
    const top =
      target.getBoundingClientRect().top + window.pageYOffset - offset;

    if (prefersReducedMotion.matches) {
      window.scrollTo(0, top);
    } else {
      window.scrollTo({
        top,
        behavior: "smooth",
      });
    }
  });
});

const observeSections = () => {
  if (!scrollSections.length || !navLinks.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          activateNavLink(entry.target.id);
        }
      });
    },
    {
      rootMargin: "-100px 0px -30% 0px",
      threshold: [0.35, 0.5, 0.75],
    }
  );

  scrollSections.forEach((section) => {
    observer.observe(section);
  });
};

observeSections();

const setScrollReveal = () => {
  if (prefersReducedMotion.matches) {
    observedSections.forEach((section) => {
      section.classList.add("is-visible");
    });
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observerRef) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observerRef.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.2,
    }
  );

  observedSections.forEach((section) => {
    revealObserver.observe(section);
  });
};

setScrollReveal();

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const updateHeaderCondensedState = () => {
  if (!siteHeader) {
    return;
  }
  const shouldCondense = window.scrollY > HEADER_CONDENSE_OFFSET;
  siteHeader.classList.toggle("site-header--condensed", shouldCondense);
};

updateHeaderCondensedState();

window.addEventListener("scroll", () => {
  if (scrollTicking) {
    return;
  }
  window.requestAnimationFrame(() => {
    updateHeaderCondensedState();
    scrollTicking = false;
  });
  scrollTicking = true;
});

const clientsTrack = document.querySelector(".clients-carousel__track");
const clientCards = Array.from(document.querySelectorAll(".client-card"));
const clientsPrevButton = document.querySelector(".clients-carousel__nav--prev");
const clientsNextButton = document.querySelector(".clients-carousel__nav--next");
const clientOverlay = document.querySelector(".client-overlay");
const clientOverlayImage = clientOverlay?.querySelector(".client-overlay__logo img");
const clientOverlaySummary = clientOverlay?.querySelector(".client-overlay__summary");
const clientOverlayDescription = clientOverlay?.querySelector(".client-overlay__description");
const clientOverlayClose = clientOverlay?.querySelector(".client-overlay__close");
const clientOverlayBackdrop = clientOverlay?.querySelector("[data-client-overlay-close]");
const clientOverlayPrev = clientOverlay?.querySelector(".client-overlay__arrow--prev");
const clientOverlayNext = clientOverlay?.querySelector(".client-overlay__arrow--next");
const clientOverlayTitle = document.getElementById("client-overlay-title");
let activeClientIndex = null;

const getClientCardScrollAmount = () => {
  if (!clientsTrack) {
    return 0;
  }
  const firstCard = clientsTrack.querySelector(".client-card");
  if (!firstCard) {
    return clientsTrack.clientWidth;
  }
  const cardWidth = firstCard.getBoundingClientRect().width;
  const styles = window.getComputedStyle(clientsTrack);
  const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
  return cardWidth + gap;
};

const scrollClientsTrack = (direction) => {
  if (!clientsTrack) {
    return;
  }
  const amount = getClientCardScrollAmount();
  const behavior = prefersReducedMotion.matches ? "auto" : "smooth";
  clientsTrack.scrollBy({
    left: direction * amount,
    behavior,
  });
};

const updateCarouselNavState = () => {
  if (!clientsTrack) {
    return;
  }
  const maxScrollLeft = clientsTrack.scrollWidth - clientsTrack.clientWidth - 2;
  const disablePrev = clientsTrack.scrollLeft <= 0;
  const disableNext = clientsTrack.scrollLeft >= maxScrollLeft;
  if (clientsPrevButton) {
    clientsPrevButton.disabled = disablePrev;
  }
  if (clientsNextButton) {
    clientsNextButton.disabled = disableNext;
  }
};

clientsPrevButton?.addEventListener("click", () => {
  scrollClientsTrack(-1);
});

clientsNextButton?.addEventListener("click", () => {
  scrollClientsTrack(1);
});

clientsTrack?.addEventListener("scroll", () => {
  window.requestAnimationFrame(updateCarouselNavState);
});

window.addEventListener("resize", updateCarouselNavState);
updateCarouselNavState();

const fillClientOverlay = (index) => {
  if (!clientOverlay) {
    return;
  }
  const card = clientCards[index];
  if (!card) {
    return;
  }
  const { name, summary, detail, logo, logoAlt } = card.dataset;
  const cardTitle = card.querySelector("h3")?.textContent?.trim();
  const cardSummary = card.querySelector("p")?.textContent?.trim();
  const cardImage = card.querySelector("img");

  if (clientOverlayImage) {
    const src =
      logo || cardImage?.getAttribute("src") || clientOverlayImage.getAttribute("src") || "";
    clientOverlayImage.setAttribute("src", src);
    const altText =
      logoAlt ||
      cardImage?.getAttribute("alt") ||
      `${name ?? cardTitle ?? "Client"} logo`;
    clientOverlayImage.setAttribute("alt", altText);
  }

  if (clientOverlayTitle) {
    clientOverlayTitle.textContent = name || cardTitle || "Client";
  }

  if (clientOverlaySummary) {
    clientOverlaySummary.textContent = summary || cardSummary || "";
  }

  if (clientOverlayDescription) {
    clientOverlayDescription.textContent =
      detail || summary || cardSummary || "";
  }

  if (clientOverlayPrev) {
    clientOverlayPrev.disabled = index === 0;
  }

  if (clientOverlayNext) {
    clientOverlayNext.disabled = index === clientCards.length - 1;
  }
};

const openClientOverlay = (index) => {
  if (!clientOverlay || !clientCards.length) {
    return;
  }
  activeClientIndex = index;
  fillClientOverlay(index);
  clientOverlay.classList.add("is-visible");
  clientOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("client-overlay-open");
};

const closeClientOverlay = () => {
  if (!clientOverlay) {
    return;
  }
  clientOverlay.classList.remove("is-visible");
  clientOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("client-overlay-open");
  activeClientIndex = null;
};

const navigateClientOverlay = (direction) => {
  if (activeClientIndex === null) {
    return;
  }
  const nextIndex = activeClientIndex + direction;
  if (nextIndex < 0 || nextIndex >= clientCards.length) {
    return;
  }
  activeClientIndex = nextIndex;
  fillClientOverlay(nextIndex);
};

clientCards.forEach((card, index) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest(".client-card__cta")) {
      return;
    }
    openClientOverlay(index);
  });

  const cta = card.querySelector(".client-card__cta");
  cta?.addEventListener("click", (event) => {
    event.stopPropagation();
    openClientOverlay(index);
  });
});

clientOverlayClose?.addEventListener("click", () => {
  closeClientOverlay();
});

clientOverlayBackdrop?.addEventListener("click", () => {
  closeClientOverlay();
});

clientOverlayPrev?.addEventListener("click", () => {
  navigateClientOverlay(-1);
});

clientOverlayNext?.addEventListener("click", () => {
  navigateClientOverlay(1);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeClientOverlay();
  }
  if (!clientOverlay?.classList.contains("is-visible")) {
    return;
  }
  if (event.key === "ArrowRight") {
    navigateClientOverlay(1);
  } else if (event.key === "ArrowLeft") {
    navigateClientOverlay(-1);
  }
});
