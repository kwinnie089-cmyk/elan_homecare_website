import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-config.js";

const loginForm = document.getElementById("adminLogin");
const loginEmail = document.getElementById("adminEmail");
const loginPassword = document.getElementById("adminPassword");
const toolbar = document.getElementById("adminToolbar");
const identity = document.getElementById("adminIdentity");
const status = document.getElementById("adminStatus");
const reviewList = document.getElementById("adminReviewList");
const refreshButton = document.getElementById("refreshReviews");
const signOutButton = document.getElementById("adminSignOut");
const sessionKey = "elan-review-admin-session";
let session = null;

const setStatus = (message, isError = false) => {
  status.textContent = message;
  status.toggleAttribute("data-error", isError);
};

const showDashboard = isSignedIn => {
  loginForm.hidden = isSignedIn;
  toolbar.hidden = !isSignedIn;
};

const authHeaders = accessToken => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${accessToken}`,
  "Content-Type": "application/json"
});

const saveSession = nextSession => {
  session = nextSession;
  window.sessionStorage.setItem(sessionKey, JSON.stringify(nextSession));
};

const refreshSession = async () => {
  if (!session || !session.refresh_token) return false;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ refresh_token: session.refresh_token })
  });
  if (!response.ok) {
    session = null;
    window.sessionStorage.removeItem(sessionKey);
    return false;
  }
  saveSession(await response.json());
  return true;
};

const authenticatedFetch = async (url, options = {}) => {
  let response = await fetch(url, {
    ...options,
    headers: { ...authHeaders(session.access_token), ...options.headers }
  });
  if (response.status === 401 && await refreshSession()) {
    response = await fetch(url, {
      ...options,
      headers: { ...authHeaders(session.access_token), ...options.headers }
    });
  }
  return response;
};

const renderReviews = reviews => {
  reviewList.replaceChildren();
  if (!reviews.length) {
    const empty = document.createElement("p");
    empty.className = "admin-empty";
    empty.textContent = "No reviews have been submitted yet.";
    reviewList.append(empty);
    return;
  }

  reviews.forEach(review => {
    const card = document.createElement("article");
    card.className = "admin-review-card";
    const heading = document.createElement("div");
    heading.className = "admin-review-heading";
    const name = document.createElement("strong");
    name.textContent = review.name;
    const date = document.createElement("time");
    date.dateTime = review.created_at;
    date.textContent = new Date(review.created_at).toLocaleString();
    const stars = document.createElement("p");
    stars.className = "admin-review-stars";
    stars.setAttribute("aria-label", `${review.rating} out of 5 stars`);
    stars.textContent = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
    const comment = document.createElement("p");
    comment.textContent = review.comment;
    heading.append(name, date);
    card.append(heading, stars, comment);
    reviewList.append(card);
  });
};

const loadReviews = async () => {
  if (!session) return;
  refreshButton.disabled = true;
  setStatus("Loading reviews…");
  try {
    const response = await authenticatedFetch(
      `${SUPABASE_URL}/rest/v1/reviews?select=id,name,rating,comment,created_at&order=created_at.desc`
    );
    if (!response.ok) {
      throw new Error(`Could not load reviews (${response.status}).`);
    }
    renderReviews(await response.json());
    setStatus("");
  } catch (error) {
    setStatus("Could not load reviews. Check the Supabase setup and admin access, then try again.", true);
    console.error("Could not load reviews:", error);
  } finally {
    refreshButton.disabled = false;
  }
};

const signIn = async (email, password) => {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.msg || result.message || "Sign-in failed. Check the email and password.");
  }
  saveSession(result);
  identity.textContent = `Signed in as ${result.user.email}`;
  showDashboard(true);
  await loadReviews();
};

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    setStatus("The Supabase project is not configured yet.", true);
    return;
  }
  const submitButton = loginForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  setStatus("Signing in…");
  try {
    await signIn(loginEmail.value.trim(), loginPassword.value);
    loginPassword.value = "";
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    submitButton.disabled = false;
  }
});

refreshButton.addEventListener("click", loadReviews);

signOutButton.addEventListener("click", async () => {
  const currentSession = session;
  session = null;
  window.sessionStorage.removeItem(sessionKey);
  showDashboard(false);
  reviewList.replaceChildren();
  setStatus("Signed out.");
  if (currentSession && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: authHeaders(currentSession.access_token)
      });
      if (!response.ok && response.status !== 401) {
        throw new Error(`Supabase sign-out failed (${response.status}).`);
      }
    } catch (error) {
      setStatus("Signed out on this device, but Supabase could not end the remote session.", true);
      console.error("Could not end the Supabase session:", error);
    }
  }
});

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  setStatus("The Supabase project is not configured yet.", true);
} else {
  try {
    session = JSON.parse(window.sessionStorage.getItem(sessionKey) || "null");
    if (session) {
      if (await refreshSession()) {
        identity.textContent = `Signed in as ${session.user.email}`;
        showDashboard(true);
        await loadReviews();
      } else {
        showDashboard(false);
        setStatus("Your admin session expired. Please sign in again.", true);
      }
    } else {
      showDashboard(false);
    }
  } catch (error) {
    session = null;
    window.sessionStorage.removeItem(sessionKey);
    showDashboard(false);
    setStatus("Could not restore the admin session. Please sign in again.", true);
    console.error("Could not restore admin session:", error);
  }
}
