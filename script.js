const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const mainSections = Array.from(document.querySelector("main").children);
const pageSections = {
  home: ["home", "trust-strip"],
  about: ["about"],
  services: ["services"],
  "why-us": ["why-us"],
  reviews: ["reviews"],
  contact: ["contact"]
};

const showPage = pageId => {
  const visibleSections = pageSections[pageId] || pageSections.home;

  mainSections.forEach(section => {
    section.hidden = !visibleSections.includes(section.id || "trust-strip");
  });

  mainNav.querySelectorAll("a[href^='#']").forEach(link => {
    if (link.hash.slice(1) === pageId) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  window.scrollTo(0, 0);
};

const navigateToPage = pageId => {
  if (!pageSections[pageId]) return;

  const destination = `#${pageId}`;
  if (window.location.hash !== destination) {
    window.history.pushState({ pageId }, "", destination);
  }
  showPage(pageId);
};

document.querySelectorAll("a[href^='#']").forEach(link => {
  link.addEventListener("click", event => {
    const pageId = link.hash.slice(1);
    if (!pageSections[pageId]) return;

    event.preventDefault();
    navigateToPage(pageId);

    if (link.dataset.service) {
      document.getElementById("service").value = link.dataset.service;
    }
  });
});

const showCurrentPage = () => {
  const pageId = window.location.hash.slice(1);
  showPage(pageSections[pageId] ? pageId : "home");
};

window.addEventListener("popstate", showCurrentPage);
window.addEventListener("hashchange", showCurrentPage);
showCurrentPage();

menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mainNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

const pulseMark = document.querySelector(".brand-pulse");
const pulsePaths = pulseMark ? Array.from(pulseMark.querySelectorAll("path")) : [];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (pulsePaths.length && !reduceMotion.matches) {
  const pulseLengths = pulsePaths.map(path => path.getTotalLength());
  pulsePaths.forEach((path, index) => {
    path.style.strokeDasharray = pulseLengths[index];
    path.style.strokeDashoffset = pulseLengths[index];
  });

  const drawDuration = 1400;
  const cycleDuration = 3600;
  let animationStart;

  const drawPulse = timestamp => {
    if (animationStart === undefined) animationStart = timestamp;
    const elapsed = (timestamp - animationStart) % cycleDuration;
    const progress = Math.min(elapsed / drawDuration, 1);

    pulsePaths.forEach((path, index) => {
      path.style.strokeDashoffset = pulseLengths[index] * (1 - progress);
    });

    window.requestAnimationFrame(drawPulse);
  };

  window.requestAnimationFrame(drawPulse);
}

const enquiryForm = document.getElementById("enquiryForm");
const whatsappOptionsToggle = document.getElementById("whatsappOptionsToggle");
const whatsappOptions = document.getElementById("whatsappOptions");

whatsappOptionsToggle.addEventListener("click", () => {
  if (!enquiryForm.reportValidity()) return;

  whatsappOptions.hidden = false;
  whatsappOptionsToggle.setAttribute("aria-expanded", "true");
  whatsappOptions.querySelector("button").focus();
});

enquiryForm.addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const body = encodeURIComponent(
    `Name: ${form.get("name")}\nLocation: ${form.get("location")}\nPhone: ${form.get("phone")}\nService: ${form.get("service")}\nMessage: ${form.get("message") || "Not provided"}`
  );

  const subject = "Website enquiry - Elan Homecare Nursing";
  const whatsappNumbers = {
    "whatsapp-256783063799": "256783063799",
    "whatsapp-256779688091": "256779688091"
  };
  const whatsappNumber = event.submitter && whatsappNumbers[event.submitter.value];
  if (whatsappNumber) {
    window.open(`https://wa.me/${whatsappNumber}?text=${body}`, "_blank", "noopener,noreferrer");
    return;
  }

  const gmailParams = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: "elanhomenursing@gmail.com",
    su: subject,
    body: decodeURIComponent(body)
  });
  window.open(`https://mail.google.com/mail/?${gmailParams}`, "_blank", "noopener,noreferrer");
});
