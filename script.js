const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

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

const reviewForm = document.getElementById("reviewForm");
if (reviewForm) {
  const reviewList = document.getElementById("reviewList");
  const reviewStatus = document.getElementById("reviewStatus");
  const ratingAverage = document.getElementById("ratingAverage");
  const ratingStars = document.getElementById("ratingStars");
  const ratingCount = document.getElementById("ratingCount");
  const reviewStorageKey = "elan-homecare-reviews";
  let reviews = [];
  let storageAvailable = true;

  try {
    const savedReviews = window.localStorage.getItem(reviewStorageKey);
    const parsedReviews = savedReviews ? JSON.parse(savedReviews) : [];
    if (!Array.isArray(parsedReviews) || parsedReviews.some(review =>
      typeof review.name !== "string" ||
      typeof review.comment !== "string" ||
      !Number.isInteger(review.rating) ||
      review.rating < 1 ||
      review.rating > 5 ||
      typeof review.date !== "string"
    )) {
      throw new Error("Saved review data is invalid.");
    }
    reviews = parsedReviews;
  } catch (error) {
    storageAvailable = false;
    reviewStatus.textContent = "Reviews could not be loaded from this browser. Please check your browser storage settings.";
    reviewStatus.setAttribute("role", "alert");
    reviewForm.querySelector('button[type="submit"]').disabled = true;
  }

  const renderReviews = () => {
    const totalRating = reviews.reduce((total, review) => total + review.rating, 0);
    const average = reviews.length ? totalRating / reviews.length : 0;
    ratingAverage.textContent = reviews.length ? average.toFixed(1) : "—";
    ratingStars.textContent = "★★★★★".slice(0, Math.round(average)).padEnd(5, "☆");
    ratingCount.textContent = `${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`;
    reviewList.replaceChildren();

    if (!reviews.length) {
      const emptyState = document.createElement("p");
      emptyState.className = "review-empty";
      emptyState.textContent = "Be the first to share your experience.";
      reviewList.append(emptyState);
      return;
    }

    reviews.forEach(review => {
      const card = document.createElement("article");
      card.className = "review-card";

      const header = document.createElement("div");
      header.className = "review-card-header";
      const name = document.createElement("strong");
      name.textContent = review.name;
      const date = document.createElement("time");
      date.dateTime = review.date;
      date.textContent = new Date(review.date).toLocaleDateString();
      header.append(name, date);

      const stars = document.createElement("div");
      stars.className = "review-card-stars";
      stars.setAttribute("aria-label", `${review.rating} out of 5 stars`);
      stars.textContent = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

      const comment = document.createElement("p");
      comment.textContent = review.comment;
      card.append(header, stars, comment);
      reviewList.append(card);
    });
  };

  renderReviews();

  reviewForm.addEventListener("submit", event => {
    event.preventDefault();
    if (!storageAvailable) return;

    const formData = new FormData(reviewForm);
    const newReview = {
      name: formData.get("name").trim(),
      rating: Number(formData.get("rating")),
      comment: formData.get("comment").trim(),
      date: new Date().toISOString()
    };
    const updatedReviews = [newReview, ...reviews];

    try {
      window.localStorage.setItem(reviewStorageKey, JSON.stringify(updatedReviews));
    } catch (error) {
      reviewStatus.textContent = "Your review could not be saved. Check your browser storage settings and try again.";
      reviewStatus.setAttribute("role", "alert");
      return;
    }

    reviews = updatedReviews;
    renderReviews();
    reviewForm.reset();
    reviewStatus.removeAttribute("role");
    reviewStatus.textContent = "Thank you. Your review was saved in this browser.";
  });
}

document.getElementById("enquiryForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const body = encodeURIComponent(
    `Name: ${form.get("name")}\nPhone: ${form.get("phone")}\nService: ${form.get("service")}\nMessage: ${form.get("message") || "Not provided"}`
  );

  const subject = "Website enquiry - Elan Homecare Nursing";
  if (event.submitter && event.submitter.value === "whatsapp") {
    window.open(`https://wa.me/256766028496?text=${body}`, "_blank", "noopener,noreferrer");
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
