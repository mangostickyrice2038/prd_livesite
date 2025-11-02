const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
const siteNavLinks = document.querySelectorAll(".site-nav a");
const anchorLinks = document.querySelectorAll('a[href^="#"]');
const observedSections = document.querySelectorAll("[data-observe]");
const yearEl = document.getElementById("year");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const HEADER_CONDENSE_OFFSET = 160;
let scrollTicking = false;

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

const setActiveLink = () => {
  if (!navLinks.length) {
    return;
  }

  navLinks.forEach((navLink) => navLink.setAttribute("aria-current", "false"));
  navLinks[0].setAttribute("aria-current", "true");

  const sections = Array.from(navLinks).map((link) => {
    const target = document.querySelector(link.getAttribute("href"));
    return target;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("id");
        const matchingLink = document.querySelector(
          `.site-nav a[href="#${id}"]`
        );
        if (!matchingLink) {
          return;
        }
        if (entry.isIntersecting) {
          navLinks.forEach((navLink) =>
            navLink.setAttribute("aria-current", "false")
          );
          matchingLink.setAttribute("aria-current", "true");
        }
      });
    },
    {
      rootMargin: "-40% 0px -50% 0px",
      threshold: [0.25, 0.6],
    }
  );

  sections.forEach((section) => {
    if (section) {
      observer.observe(section);
    }
  });
};

setActiveLink();

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
