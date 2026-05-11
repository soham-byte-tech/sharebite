const defaultListings = [
  {
    id: "green-leaf-mess",
    title: "Veg biryani, dal, salad",
    donor: "Green Leaf Mess",
    servings: 120,
    price: "free",
    diet: "veg",
    window: "Today, 7:30 PM - 9:00 PM",
    location: "MG Road, 2.4 km",
    ngoEmail: "ngo@example.com",
    status: "approved",
    reserved: false
  },
  {
    id: "royal-wedding-hall",
    title: "Paneer curry and chapati",
    donor: "Royal Wedding Hall",
    servings: 180,
    price: "discount",
    diet: "veg",
    window: "Today, 10:00 PM - 11:00 PM",
    location: "Civil Lines, 4.8 km",
    ngoEmail: "ngo@example.com",
    status: "approved",
    reserved: false
  },
  {
    id: "city-star-hotel",
    title: "Rice, dal, mixed vegetables",
    donor: "City Star Hotel",
    servings: 65,
    price: "free",
    diet: "veg",
    window: "Tomorrow, 8:00 AM - 9:00 AM",
    location: "Station Road, 3.1 km",
    ngoEmail: "ngo@example.com",
    status: "approved",
    reserved: false
  },
  {
    id: "bright-events",
    title: "Packed lunch boxes",
    donor: "Bright Events",
    servings: 95,
    price: "discount",
    diet: "mixed",
    window: "Today, 6:30 PM - 8:00 PM",
    location: "Sector 12, 5.2 km",
    ngoEmail: "ngo@example.com",
    status: "approved",
    reserved: false
  }
];

function loadListings() {
  const savedListings = localStorage.getItem("sharebiteListings") || localStorage.getItem("mealbridgeListings");
  const loadedListings = savedListings ? JSON.parse(savedListings) : defaultListings;
  return loadedListings.map((item) => ({
    ...item,
    ngoEmail: item.ngoEmail || "ngo@example.com",
    status: item.status || "approved"
  }));
}

function saveListings() {
  localStorage.setItem("sharebiteListings", JSON.stringify(listings));
}

function loadAccounts() {
  const savedAccounts = localStorage.getItem("sharebiteAccounts");
  return savedAccounts ? JSON.parse(savedAccounts) : [];
}

function saveAccounts(accountsToSave) {
  localStorage.setItem("sharebiteAccounts", JSON.stringify(accountsToSave));
}

function loadFeedback() {
  const savedFeedback = localStorage.getItem("sharebiteNgoFeedback");
  return savedFeedback ? JSON.parse(savedFeedback) : [];
}

function saveFeedback(feedbackToSave) {
  localStorage.setItem("sharebiteNgoFeedback", JSON.stringify(feedbackToSave));
}

const listings = loadListings();
const accounts = loadAccounts();
const ngoFeedback = loadFeedback();
const listingGrid = document.querySelector("#listingGrid");
const filterButtons = document.querySelectorAll(".filter");
const donateForm = document.querySelector("#donate");
const ngoForm = document.querySelector("#ngo");
const donationMessage = document.querySelector("#donationMessage");
const ngoMessage = document.querySelector("#ngoMessage");
const approvalMessage = document.querySelector("#approvalMessage");
const mealsSaved = document.querySelector("#mealsSaved");
const resultsNote = document.querySelector("#resultsNote");
const supplierGrid = document.querySelector("#supplierGrid");
const ownerEmailForm = document.querySelector("#ownerEmailForm");
const ownerEmail = document.querySelector("#ownerEmail");
const ownerEmailMessage = document.querySelector("#ownerEmailMessage");
const ownerStats = document.querySelector("#ownerStats");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#mainNav");
const pickupDialog = document.querySelector("#pickupDialog");
const pickupDetails = document.querySelector("#pickupDetails");
const pickupContact = document.querySelector("#pickupContact");
const pickupNotes = document.querySelector("#pickupNotes");
const confirmPickup = document.querySelector("#confirmPickup");
const loginForms = document.querySelectorAll("[data-login-role]");
const signupForm = document.querySelector("#signupForm");
const ngoFeedbackForm = document.querySelector("#ngoFeedbackForm");

let activeListingId = null;

const loginConfig = {
  ngo: {
    redirect: "listings.html",
    label: "NGO"
  },
  supplier: {
    redirect: "supplier.html",
    label: "Supplier"
  },
  owner: {
    email: "sharebite.in@gmail.com",
    password: "sharebite.333",
    redirect: "owner.html",
    label: "Owner"
  }
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function priceLabel(price) {
  return price === "free" ? "Free" : "50% off";
}

function foodIcon(title) {
  const value = title.toLowerCase();
  if (value.includes("salad")) return "🥗";
  if (value.includes("rice") || value.includes("biryani")) return "🍚";
  if (value.includes("paneer") || value.includes("curry")) return "🍛";
  if (value.includes("lunch") || value.includes("box")) return "🍱";
  return "🍽️";
}

function currentFilter() {
  const activeFilter = document.querySelector(".filter.active");
  return activeFilter ? activeFilter.dataset.filter : "all";
}

function getFilteredListings(filter = "all") {
  return listings.filter((item) => {
    if (item.status !== "approved") return false;
    if (filter === "all") return true;
    if (filter === "veg") return item.diet === "veg";
    return item.price === filter;
  });
}

function buildNgoEmail(listing) {
  const subject = encodeURIComponent(`ShareBite approved food pickup: ${listing.title}`);
  const body = encodeURIComponent(
    `Hello NGO team,\n\nA food donation has been approved by the supplier.\n\n` +
    `Food: ${listing.title}\n` +
    `Donor/Supplier: ${listing.donor}\n` +
    `Servings: ${listing.servings}\n` +
    `Price: ${priceLabel(listing.price)}\n` +
    `Pickup window: ${listing.window}\n` +
    `Pickup location: ${listing.location}\n\n` +
    `Please collect the food directly. No pickup partner is required.\n\n` +
    `Regards,\nShareBite`
  );
  return `mailto:${listing.ngoEmail || "ngo@example.com"}?subject=${subject}&body=${body}`;
}

function buildOwnerReportEmail(email) {
  const pendingListings = listings.filter((item) => item.status === "pending");
  const approvedListings = listings.filter((item) => item.status === "approved");
  const reservedListings = listings.filter((item) => item.reserved);
  const totalServings = listings.reduce((total, item) => total + Number(item.servings || 0), 0);

  const listingLines = listings.map((item, index) => (
    `${index + 1}. ${item.title}\n` +
    `   Donor/Supplier: ${item.donor}\n` +
    `   Servings: ${item.servings}\n` +
    `   Price: ${priceLabel(item.price)}\n` +
    `   Status: ${item.status === "pending" ? "Pending approval" : "Approved"}\n` +
    `   Reserved: ${item.reserved ? "Yes" : "No"}\n` +
    `   NGO email: ${item.ngoEmail || "ngo@example.com"}\n` +
    `   Pickup: ${item.window}\n` +
    `   Location: ${item.location}`
  )).join("\n\n");
  const feedbackLines = ngoFeedback.map((item, index) => (
    `${index + 1}. ${item.ngoName}\n` +
    `   Email: ${item.email}\n` +
    `   Rating: ${item.rating}/5\n` +
    `   Feedback: ${item.text}\n` +
    `   Submitted: ${item.createdAt}`
  )).join("\n\n");

  const subject = encodeURIComponent("ShareBite full data and updates report");
  const body = encodeURIComponent(
    `Hello,\n\nHere is the latest ShareBite data report.\n\n` +
    `Total food listings: ${listings.length}\n` +
    `Pending approvals: ${pendingListings.length}\n` +
    `Approved listings: ${approvedListings.length}\n` +
    `Reserved pickups: ${reservedListings.length}\n` +
    `Total servings listed: ${totalServings}\n\n` +
    `Food listing details:\n\n${listingLines || "No listings yet."}\n\n` +
    `NGO feedback:\n\n${feedbackLines || "No NGO feedback yet."}\n\n` +
    `This report was generated from the ShareBite website.\n\n` +
    `Regards,\nShareBite`
  );

  return `mailto:${email}?subject=${subject}&body=${body}`;
}

function showMessage(element, message) {
  if (element) {
    element.textContent = message;
  }
}

function renderListings(filter = "all") {
  if (!listingGrid || !resultsNote) return;

  const filteredListings = getFilteredListings(filter);
  resultsNote.textContent = `${filteredListings.length} listing${filteredListings.length === 1 ? "" : "s"} available for this filter.`;

  if (!filteredListings.length) {
    listingGrid.innerHTML = `
      <article class="food-card">
        <h3>No listings found</h3>
        <p>Try another filter or publish a new food listing.</p>
      </article>
    `;
    return;
  }

  listingGrid.innerHTML = filteredListings.map((item) => `
    <article class="food-card">
      <header>
        <span class="food-art" aria-hidden="true">${foodIcon(item.title)}</span>
        <div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.donor)}</p>
        </div>
        <span class="tag ${item.price === "discount" ? "discount" : ""}">${priceLabel(item.price)}</span>
      </header>
      <div class="meta" aria-label="Listing details">
        <span><strong>${item.servings}</strong> servings</span>
        <span>${item.diet === "veg" ? "Veg" : "Mixed"} food</span>
        <span>${escapeHtml(item.window)}</span>
        <span>${escapeHtml(item.location)}</span>
      </div>
      <button class="claim ${item.reserved ? "claimed" : ""}" type="button" data-id="${item.id}" ${item.reserved ? "disabled" : ""}>
        ${item.reserved ? "Pickup reserved" : "Reserve pickup"}
      </button>
    </article>
  `).join("");
}

function renderSupplierApprovals() {
  if (!supplierGrid || !approvalMessage) return;

  const pendingListings = listings.filter((item) => item.status === "pending");
  const approvedListings = listings.filter((item) => item.status === "approved");

  approvalMessage.textContent = `${pendingListings.length} pending approval${pendingListings.length === 1 ? "" : "s"}.`;

  if (!pendingListings.length && !approvedListings.length) {
    supplierGrid.innerHTML = `
      <article class="food-card">
        <h3>No food listings yet</h3>
        <p>Submit food from the donor page to create a supplier approval request.</p>
      </article>
    `;
    return;
  }

  supplierGrid.innerHTML = [...pendingListings, ...approvedListings].map((item) => `
    <article class="food-card">
      <header>
        <div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.donor)}</p>
        </div>
        <span class="tag ${item.status === "pending" ? "pending" : ""}">${item.status === "pending" ? "Pending" : "Approved"}</span>
      </header>
      <div class="meta" aria-label="Approval details">
        <span><strong>${item.servings}</strong> servings</span>
        <span>${priceLabel(item.price)}</span>
        <span>${escapeHtml(item.window)}</span>
        <span>${escapeHtml(item.location)}</span>
        <span>${escapeHtml(item.ngoEmail || "ngo@example.com")}</span>
        <span>${item.reserved ? "Reserved" : "Not reserved"}</span>
      </div>
      <button class="claim approve" type="button" data-id="${item.id}" ${item.status === "approved" ? "disabled" : ""}>
        ${item.status === "approved" ? "Email already prepared" : "Approve and email NGO"}
      </button>
      ${item.status === "approved" ? `<a class="button dark full" href="${buildNgoEmail(item)}">Email NGO again</a>` : ""}
    </article>
  `).join("");
}

function renderOwnerStats() {
  if (!ownerStats) return;

  const pendingListings = listings.filter((item) => item.status === "pending");
  const approvedListings = listings.filter((item) => item.status === "approved");
  const reservedListings = listings.filter((item) => item.reserved);
  const totalServings = listings.reduce((total, item) => total + Number(item.servings || 0), 0);

  ownerStats.innerHTML = `
    <article class="food-card stat-card">
      <strong>${listings.length}</strong>
      <h3>Total listings</h3>
      <p>All food records saved in ShareBite.</p>
    </article>
    <article class="food-card stat-card">
      <strong>${pendingListings.length}</strong>
      <h3>Pending approvals</h3>
      <p>Food waiting for supplier approval.</p>
    </article>
    <article class="food-card stat-card">
      <strong>${approvedListings.length}</strong>
      <h3>Approved listings</h3>
      <p>Food visible to NGOs on the listings page.</p>
    </article>
    <article class="food-card stat-card">
      <strong>${reservedListings.length}</strong>
      <h3>Reserved pickups</h3>
      <p>Food already reserved by NGOs.</p>
    </article>
    <article class="food-card stat-card">
      <strong>${totalServings}</strong>
      <h3>Total servings</h3>
      <p>Combined meals from all listings.</p>
    </article>
  `;
}

function closeMenu() {
  if (!mainNav || !menuToggle) return;
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      closeMenu();
    }
  });
}

loginForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const role = form.dataset.loginRole;
    const config = loginConfig[role];
    const email = form.querySelector(".login-email").value.trim();
    const password = form.querySelector(".login-password").value.trim();
    const message = form.querySelector(".login-message");

    if (!config) return;

    let savedAccount = accounts.find((account) => (
      account.role === role &&
      account.email.toLowerCase() === email.toLowerCase() &&
      account.password === password
    ));

    const fixedOwnerLogin = role === "owner" && email === config.email && password === config.password;

    if (savedAccount || fixedOwnerLogin) {
      localStorage.setItem("sharebiteLoggedInRole", role);
      localStorage.setItem("sharebiteLoggedInEmail", email);
      showMessage(message, `${config.label} login successful. Redirecting...`);
      window.location.href = config.redirect;
      return;
    }

    showMessage(message, `Invalid ${config.label} login. Please sign up first or check your email and password.`);
  });
});

if (signupForm) {
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!signupForm.reportValidity()) return;

    const role = document.querySelector("#signupRole").value;
    const name = document.querySelector("#signupName").value.trim();
    const email = document.querySelector("#signupEmail").value.trim();
    const password = document.querySelector("#signupPassword").value.trim();
    const signupMessage = document.querySelector("#signupMessage");
    const alreadyExists = accounts.some((account) => (
      account.role === role &&
      account.email.toLowerCase() === email.toLowerCase()
    ));

    if (alreadyExists) {
      showMessage(signupMessage, "This email is already signed up for that account type.");
      return;
    }

    accounts.push({ role, name, email, password });
    saveAccounts(accounts);
    showMessage(signupMessage, "Account created. Redirecting to the correct login page...");

    const loginPage = {
      ngo: "ngo-login.html",
      supplier: "supplier-login.html"
    }[role];

    window.location.href = loginPage;
  });
}

if (ngoFeedbackForm) {
  ngoFeedbackForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!ngoFeedbackForm.reportValidity()) return;

    const feedback = {
      ngoName: document.querySelector("#feedbackNgoName").value.trim(),
      email: document.querySelector("#feedbackEmail").value.trim(),
      rating: document.querySelector("#feedbackRating").value,
      text: document.querySelector("#feedbackText").value.trim(),
      createdAt: new Date().toLocaleString()
    };
    const feedbackMessage = document.querySelector("#feedbackMessage");

    ngoFeedback.unshift(feedback);
    saveFeedback(ngoFeedback);
    ngoFeedbackForm.reset();
    showMessage(feedbackMessage, "Thank you. Your NGO feedback has been submitted to ShareBite.");
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-pressed", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");
    renderListings(button.dataset.filter);
  });
});

if (listingGrid && pickupDialog && pickupDetails && pickupContact && pickupNotes) {
  listingGrid.addEventListener("click", (event) => {
    const claimButton = event.target.closest(".claim");
    if (!claimButton || claimButton.disabled) return;

    const listing = listings.find((item) => item.id === claimButton.dataset.id);
    if (!listing) return;

    activeListingId = listing.id;
    pickupDetails.innerHTML = `
      <p><strong>${escapeHtml(listing.title)}</strong> from ${escapeHtml(listing.donor)}</p>
      <p>${listing.servings} servings | ${priceLabel(listing.price)} | ${escapeHtml(listing.window)}</p>
      <p>Pickup location: ${escapeHtml(listing.location)}</p>
    `;
    pickupNotes.value = "";
    pickupDialog.showModal();
    pickupContact.focus();
  });
}

if (supplierGrid) {
  supplierGrid.addEventListener("click", (event) => {
    const approveButton = event.target.closest(".approve");
    if (!approveButton || approveButton.disabled) return;

    const listing = listings.find((item) => item.id === approveButton.dataset.id);
    if (!listing) return;

    listing.status = "approved";
    saveListings();
    renderSupplierApprovals();
    showMessage(approvalMessage, `${listing.title} approved. Email draft opened for ${listing.ngoEmail}.`);
    window.location.href = buildNgoEmail(listing);
  });
}

if (ownerEmail) {
  ownerEmail.value = localStorage.getItem("sharebiteOwnerEmail") || ownerEmail.value;
}

if (ownerEmailForm && ownerEmail && ownerEmailMessage) {
  ownerEmailForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!ownerEmailForm.reportValidity()) return;

    const email = ownerEmail.value.trim();
    localStorage.setItem("sharebiteOwnerEmail", email);
    showMessage(ownerEmailMessage, "Email report prepared. Your email app will open with all current data.");
    window.location.href = buildOwnerReportEmail(email);
  });
}

if (confirmPickup && pickupContact && pickupDialog) {
  confirmPickup.addEventListener("click", () => {
    if (!pickupContact.value.trim()) {
      pickupContact.reportValidity();
      return;
    }

    const listing = listings.find((item) => item.id === activeListingId);
    if (!listing) return;

    listing.reserved = true;
    saveListings();
    pickupDialog.close();
    renderListings(currentFilter());
    showMessage(resultsNote, `${listing.title} reserved for ${pickupContact.value.trim()}. Donor and NGO can now complete direct pickup.`);
  });
}

if (donateForm) {
  donateForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!donateForm.reportValidity()) return;

    const foodName = document.querySelector("#foodName").value.trim();
    const donorType = document.querySelector("#donorType").value;
    const servings = Number(document.querySelector("#servings").value);
    const pickupWindow = document.querySelector("#pickupWindow").value.trim();
    const location = document.querySelector("#location").value.trim();
    const ngoEmail = document.querySelector("#ngoEmail").value.trim();

    const newListing = {
      id: `listing-${Date.now()}`,
      title: foodName,
      donor: donorType,
      servings,
      price: document.querySelector("#priceType").value,
      diet: foodName.toLowerCase().includes("veg") ? "veg" : "mixed",
      window: pickupWindow,
      location,
      ngoEmail,
      status: "pending",
      reserved: false
    };

    listings.unshift(newListing);
    saveListings();
    showMessage(donationMessage, "Food submitted for supplier approval. After approval, an email will be prepared for the NGO.");
    if (mealsSaved) {
      mealsSaved.textContent = (Number(mealsSaved.textContent.replaceAll(",", "")) + newListing.servings).toLocaleString("en-IN");
    }
  });
}

if (ngoForm) {
  ngoForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!ngoForm.reportValidity()) return;

    const ngoName = ngoForm.querySelector("input[type='text']").value.trim();
    const canPickup = ngoForm.querySelector("input[type='checkbox']").checked;
    const button = ngoForm.querySelector("button");

    if (!canPickup) {
      showMessage(ngoMessage, "Please confirm that your NGO can collect food directly before requesting access.");
      return;
    }

    button.textContent = "Verification sent";
    showMessage(ngoMessage, `${ngoName} verification request submitted. After approval, nearby food listings can be reserved.`);
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

renderListings();
renderSupplierApprovals();
renderOwnerStats();
