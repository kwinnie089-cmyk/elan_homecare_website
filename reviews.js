import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-config.js";

const reviewForm = document.getElementById("reviewForm");
const reviewStatus = document.getElementById("reviewStatus");

if (reviewForm && reviewStatus) {
  reviewForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      reviewStatus.textContent = "Reviews are not available yet. Please contact Elan directly.";
      reviewStatus.setAttribute("role", "alert");
      return;
    }

    const formData = new FormData(reviewForm);
    const review = {
      name: formData.get("name").trim(),
      rating: Number(formData.get("rating")),
      comment: formData.get("comment").trim()
    };
    const submitButton = reviewForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    reviewStatus.removeAttribute("role");
    reviewStatus.textContent = "Submitting your review…";

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify(review)
      });

      if (!response.ok) {
        throw new Error(`Review submission failed (${response.status}).`);
      }

      reviewForm.reset();
      reviewStatus.textContent = "Thank you. Your review has been sent privately to Elan.";
    } catch (error) {
      reviewStatus.textContent = "Your review could not be sent right now. Please try again later.";
      reviewStatus.setAttribute("role", "alert");
      console.error("Could not submit review:", error);
    } finally {
      submitButton.disabled = false;
    }
  });
}
