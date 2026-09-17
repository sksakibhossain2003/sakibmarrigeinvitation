/**
 * ==========================================================================
 * SAKIB & NUSRAT WEDDING INVITATION
 * Mobile-First Interactive Logic & 3D Envelope Physics
 * ==========================================================================
 */

// --------------------------------------------------------------------------
// 1. EASY CUSTOMIZATION CONFIG
// --------------------------------------------------------------------------
const wedding = {
  groom: "Sakib Hossain",
  bride: "Nusrat Jahan",
  date: "January 8, 2027",
  time: "Friday, After Jummah Namaz (2:00 PM)",
  venue: "Al Hossain Jame Mosque",
  location: "Dewliya Bari",
  // Target date for countdown: Friday, January 8, 2027 at 2:00 PM (Local Bangladesh Time UTC+6)
  targetDate: "2027-01-08T14:00:00+06:00",
  // Customizable WhatsApp phone number to receive wishes (Bangladesh: +8801782274951)
  whatsappNumber: "8801782274951",
  // Path to background music file in assets folder
  musicFile: "assets/music.mp3",
  // Music volume level (0.40 = 40% peaceful ambient volume)
  musicVolume: 0.40
};

// Storage Keys
const ACCESS_LIST_STORAGE_KEY = 'wedding_access_allowed_guests';
const GUEST_STORAGE_KEY = 'wedding_verified_guest';
const WISHES_STORAGE_KEY = 'wedding_saved_wishes';
const CLOUD_STORAGE_KEY = 'wedding_custom_cloud_url';

// Online Cloud Storage Configuration
// High-availability primary cloud endpoint shared across all devices
const DEFAULT_CLOUD_ENDPOINT = 'https://api.restful-api.dev/objects/ff808181a067127101a0999d8f0006fb';
// Canonical static file deployed with the site on Netlify
const GUESTS_STATIC_URL = './guests.json';

let isCloudSyncing = false;
let lastCloudSyncTime = null;

// Default Invited Guests & VIPs (Restorable by Sakib Hossain)
const DEFAULT_GUEST_ACCESS_LIST = [
  "Sakib Hossain",
  "Nusrat Jahan",
  "Rifat",
  "Shafiqul Islam",
  "Rahim Ahmed",
  "Karim Hossain",
  "Farhana Jahan",
  "Tanvir Ahmed",
  "Rafiq Islam",
  "Amina Begum",
  "Zubair Ahmed",
  "Mahmudul Hasan",
  "Nasrin Akter",
  "Fahim Rahman",
  "Sumaiya Islam"
];

// Real guestbook wishes array (No random dummy blessings)
const initialWishes = [];

// --------------------------------------------------------------------------
// 2. DOM ELEMENTS CACHE
// --------------------------------------------------------------------------
const dom = {
  // Persistent Top Bar
  topNavBar: document.getElementById('top-nav-bar'),

  // Guest Gate
  gateOverlay: document.getElementById('guest-gate'),
  guestForm: document.getElementById('guest-form'),
  guestInput: document.getElementById('guest-name-input'),
  gateChecking: document.getElementById('gate-checking'),
  gateError: document.getElementById('gate-error'),
  gateSuccess: document.getElementById('gate-success'),
  tryAgainBtn: document.getElementById('try-again-btn'),
  welcomeGuestName: document.getElementById('welcome-guest-name'),
  activeGuestLabel: document.getElementById('active-guest-label'),
  changeGuestBtn: document.getElementById('change-guest-btn'),

  // Envelope Stage
  envelopeStage: document.getElementById('envelope-stage'),
  envelopeContainer: document.getElementById('envelope-container'),
  waxSeal: document.getElementById('wax-seal'),
  envelopeHint: document.getElementById('envelope-hint'),

  // Main App Folio
  invitationApp: document.getElementById('invitation-app'),

  // Countdown
  cdDays: document.getElementById('cd-days'),
  cdHours: document.getElementById('cd-hours'),
  cdMinutes: document.getElementById('cd-minutes'),
  cdSeconds: document.getElementById('cd-seconds'),

  // Gallery & Lightbox
  galleryCards: document.querySelectorAll('.gallery-card'),
  lightboxModal: document.getElementById('lightbox-modal'),
  lightboxBackdrop: document.getElementById('lightbox-backdrop'),
  lightboxImage: document.getElementById('lightbox-image'),
  lightboxCaption: document.getElementById('lightbox-caption'),
  lightboxCloseBtn: document.getElementById('lightbox-close-btn'),

  // Wishes Form & WhatsApp
  wishesForm: document.getElementById('wishes-form'),
  wishSenderName: document.getElementById('wish-sender-name'),
  wishRelation: document.getElementById('wish-relation'),
  wishMessage: document.getElementById('wish-message'),
  wishesList: document.getElementById('wishes-list'),
  wishesCountBadge: document.getElementById('wishes-count-badge'),
  sentimentChips: document.querySelectorAll('.chip-btn'),

  // Music
  musicToggleBtn: document.getElementById('music-toggle-btn'),
  musicLabel: document.getElementById('music-label'),
  audioEl: document.getElementById('wedding-audio'),

  // Canvas
  ambientCanvas: document.getElementById('ambient-canvas'),

  // Admin Management (Exclusive to Groom Sakib Hossain)
  adminManageBtn: document.getElementById('admin-manage-btn'),
  adminModal: document.getElementById('admin-modal'),
  adminModalBackdrop: document.getElementById('admin-modal-backdrop'),
  adminModalCloseBtn: document.getElementById('admin-modal-close-btn'),
  adminAddGuestForm: document.getElementById('admin-add-guest-form'),
  adminNewGuestInput: document.getElementById('admin-new-guest-input'),
  adminAddBtn: document.getElementById('admin-add-btn'),
  adminFeedback: document.getElementById('admin-feedback'),
  adminGuestCount: document.getElementById('admin-guest-count'),
  adminGuestsContainer: document.getElementById('admin-guests-container'),
  adminResetDefaultsBtn: document.getElementById('admin-reset-defaults-btn'),
  adminDoneBtn: document.getElementById('admin-done-btn'),

  // Cloud Sync Controls
  cloudStatusDot: document.getElementById('cloud-status-dot'),
  cloudStatusText: document.getElementById('cloud-status-text'),
  adminCloudSyncBtn: document.getElementById('admin-cloud-sync-btn'),
  adminCloudSettingsToggle: document.getElementById('admin-cloud-settings-toggle'),
  adminCloudSettingsDrawer: document.getElementById('admin-cloud-settings-drawer'),
  adminCustomCloudUrl: document.getElementById('admin-custom-cloud-url'),
  adminSaveCloudUrlBtn: document.getElementById('admin-save-cloud-url-btn'),
  adminResetCloudUrlBtn: document.getElementById('admin-reset-cloud-url-btn'),
  adminCloudFeedback: document.getElementById('admin-cloud-feedback'),
  adminCopyJsonBtn: document.getElementById('admin-copy-json-btn')
};

// --------------------------------------------------------------------------
// 3. SMART GUEST MATCHING & DYNAMIC ACCESS CONTROL
// --------------------------------------------------------------------------

/**
 * Detects if the logged-in user is the Groom / Host / Admin (Sakib Hossain)
 */
function isGroomAdmin(name) {
  if (!name) return false;
  const lower = name.trim().toLowerCase();
  return (
    lower === 'sakib hossain' ||
    lower === 'sakib' ||
    lower === 'md sakib hossain' ||
    lower === 'sakib hossain (groom)' ||
    lower.includes('sakib')
  );
}

/**
 * Gets currently active cloud URL (custom user URL or pre-configured default)
 */
function getActiveCloudUrl() {
  try {
    const custom = localStorage.getItem(CLOUD_STORAGE_KEY);
    if (custom && custom.trim().startsWith('http')) {
      return custom.trim();
    }
  } catch (err) {
    // fallback
  }
  return DEFAULT_CLOUD_ENDPOINT;
}

/**
 * Updates UI status indicator for cloud sync
 */
function setCloudStatus(state, message) {
  if (dom.cloudStatusDot) {
    dom.cloudStatusDot.className = 'cloud-pulse-dot';
    if (state === 'syncing') dom.cloudStatusDot.classList.add('syncing');
    else if (state === 'error') dom.cloudStatusDot.classList.add('error');
  }
  if (dom.cloudStatusText) {
    dom.cloudStatusText.textContent = message || (state === 'synced' ? 'Online Cloud: Synced' : 'Cloud: Connecting...');
  }
  if (dom.adminCloudSyncBtn) {
    if (state === 'syncing') {
      dom.adminCloudSyncBtn.classList.add('is-spinning');
    } else {
      dom.adminCloudSyncBtn.classList.remove('is-spinning');
    }
  }
}

/**
 * Retrieves the live access list from localStorage or initializes defaults
 */
function getAccessList() {
  try {
    const raw = localStorage.getItem(ACCESS_LIST_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Guarantee Sakib Hossain (the host) is always preserved as protected admin
        if (!parsed.some((n) => isGroomAdmin(n))) {
          parsed.unshift("Sakib Hossain");
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not retrieve access list from localStorage:", err);
  }
  // Initialize and persist defaults
  saveAccessList(DEFAULT_GUEST_ACCESS_LIST);
  return [...DEFAULT_GUEST_ACCESS_LIST];
}

/**
 * Persists updated access list to localStorage
 */
function saveAccessList(list) {
  try {
    localStorage.setItem(ACCESS_LIST_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn("Could not save access list to localStorage:", err);
  }
}

/**
 * Synchronizes the guest access list from the online cloud database
 * Tries cloud endpoint first, falls back to ./guests.json
 */
async function syncAccessListFromCloud(isManualTrigger = false) {
  if (isCloudSyncing) return getAccessList();
  isCloudSyncing = true;
  setCloudStatus('syncing', 'Cloud: Synchronizing...');

  let fetchedGuests = null;
  const cloudUrl = getActiveCloudUrl();

  // 1. Try primary/custom cloud database
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const resp = await fetch(cloudUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data)) {
        fetchedGuests = data;
      } else if (data && data.data && Array.isArray(data.data.guests)) {
        fetchedGuests = data.data.guests;
      } else if (data && Array.isArray(data.guests)) {
        fetchedGuests = data.guests;
      }
    }
  } catch (err) {
    console.warn("Could not sync from primary cloud endpoint:", err);
  }

  // 2. If primary failed or empty, fallback to canonical ./guests.json
  if (!fetchedGuests || fetchedGuests.length === 0) {
    try {
      const respStatic = await fetch(`${GUESTS_STATIC_URL}?_t=${Date.now()}`);
      if (respStatic.ok) {
        const staticData = await respStatic.json();
        if (Array.isArray(staticData) && staticData.length > 0) {
          fetchedGuests = staticData;
        }
      }
    } catch (err) {
      console.warn("Could not fetch static guests.json:", err);
    }
  }

  // 3. Process and persist fetched list
  if (Array.isArray(fetchedGuests) && fetchedGuests.length > 0) {
    // Sanitize and ensure Sakib Hossain is preserved
    const sanitized = fetchedGuests
      .filter((g) => typeof g === 'string' && g.trim().length > 0)
      .map((g) => g.trim());

    if (!sanitized.some((n) => isGroomAdmin(n))) {
      sanitized.unshift("Sakib Hossain");
    }

    // Merge with local list so nothing is accidentally lost
    const localList = getAccessList();
    const mergedMap = new Map();
    [...sanitized, ...localList].forEach((name) => {
      const lower = name.toLowerCase();
      if (!mergedMap.has(lower)) {
        mergedMap.set(lower, name);
      }
    });
    const mergedList = Array.from(mergedMap.values());

    saveAccessList(mergedList);
    lastCloudSyncTime = new Date();
    setCloudStatus('synced', `Online Cloud: Synced (${mergedList.length} Guests)`);

    if (dom.adminModal && dom.adminModal.classList.contains('is-active')) {
      renderAdminGuestList();
    }

    if (isManualTrigger) {
      showAdminFeedback(`✨ Synced with online cloud! (${mergedList.length} guests authorized)`, "success");
    }

    isCloudSyncing = false;
    return mergedList;
  } else {
    // Offline / fallback to local cache
    const current = getAccessList();
    setCloudStatus('error', `Offline Cache (${current.length} Guests)`);
    if (isManualTrigger) {
      showAdminFeedback("Could not reach online cloud. Using cached guest list.", "warning");
    }
    isCloudSyncing = false;
    return current;
  }
}

/**
 * Pushes updated access list to the online cloud database
 */
async function pushAccessListToCloud(list) {
  if (!Array.isArray(list) || list.length === 0) return false;
  setCloudStatus('syncing', 'Cloud: Uploading changes...');

  const cloudUrl = getActiveCloudUrl();
  let payload;
  let method = 'PUT';

  // Format payload according to endpoint type
  if (cloudUrl.includes('api.restful-api.dev')) {
    method = 'PUT';
    payload = JSON.stringify({
      name: "wedding_guests_sakib_nusrat",
      data: { guests: list }
    });
  } else if (cloudUrl.includes('firebaseio.com')) {
    method = 'PUT';
    payload = JSON.stringify(list);
  } else if (cloudUrl.includes('script.google.com')) {
    method = 'POST';
    payload = JSON.stringify({ action: "set", guests: list });
  } else {
    method = 'PUT';
    payload = JSON.stringify({ guests: list });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    const resp = await fetch(cloudUrl, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (resp.ok) {
      lastCloudSyncTime = new Date();
      setCloudStatus('synced', `Online Cloud: Synced (${list.length} Guests)`);
      showAdminFeedback(`☁️ Synced to online cloud! Available on all devices.`, "success");
      return true;
    } else {
      throw new Error(`Cloud returned status ${resp.status}`);
    }
  } catch (err) {
    console.warn("Error pushing to cloud:", err);
    setCloudStatus('error', `Saved locally (Cloud upload pending)`);
    showAdminFeedback(`Saved locally on this device. Cloud sync will retry.`, "warning");
    return false;
  }
}

/**
 * Smart Name Matcher against live dynamic access list:
 * - Direct match (case-insensitive)
 * - First-name / partial matching ("Sakib" -> "Sakib Hossain", "Nusrat" -> "Nusrat Jahan", "Rifat" -> "Rifat")
 * - Strictly verifies against authorized access list (unauthorized guests return null)
 */
function findMatchingGuest(rawInput) {
  if (!rawInput) return null;
  const inputTrimmed = rawInput.trim().replace(/\s+/g, ' ');
  if (inputTrimmed.length < 2) return null;

  const currentAccessList = getAccessList();
  const inputLower = inputTrimmed.toLowerCase();

  // 1. Direct exact match (case-insensitive)
  const exact = currentAccessList.find((g) => g.toLowerCase() === inputLower);
  if (exact) return exact;

  // 2. Partial / word boundary match
  const partial = currentAccessList.find((g) => {
    const gLower = g.toLowerCase();
    const gWords = gLower.split(' ');
    const inputWords = inputLower.split(' ');
    return (
      inputWords.some((w) => w.length >= 3 && gWords.includes(w)) ||
      gLower.includes(inputLower) ||
      inputLower.includes(gLower)
    );
  });
  if (partial) return partial;

  // Not on the authorized guest list -> Deny access
  return null;
}

function showGateChecking() {
  if (dom.gateError) dom.gateError.style.display = 'none';
  if (dom.gateSuccess) dom.gateSuccess.style.display = 'none';
  if (dom.gateChecking) dom.gateChecking.style.display = 'flex';
}

function hideGateChecking() {
  if (dom.gateChecking) dom.gateChecking.style.display = 'none';
}

function initGuestVerification() {
  // Always start with a completely empty, fresh input whenever the link is opened
  try {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    sessionStorage.removeItem(GUEST_STORAGE_KEY);
  } catch (err) {
    // ignore storage restrictions
  }

  if (dom.guestInput) {
    dom.guestInput.value = '';
    dom.guestInput.defaultValue = '';
  }

  // Ensure gate overlay is visible and active on initial load
  dom.gateOverlay.classList.remove('is-hidden');
  dom.envelopeStage.classList.remove('is-opened');
  dom.envelopeContainer.className = 'envelope-container';
  dom.invitationApp.style.display = 'none';

  if (dom.topNavBar) {
    dom.topNavBar.classList.remove('is-visible');
  }
  if (dom.adminManageBtn) {
    dom.adminManageBtn.style.display = 'none';
  }
  if (dom.activeGuestLabel) {
    dom.activeGuestLabel.textContent = 'Guest';
  }

  // Handle Form Submission with Live Real-Time Online Verification
  dom.guestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rawInput = dom.guestInput.value.trim();

    if (!rawInput || rawInput.length < 2) {
      showGateError("Please enter your name before continuing.");
      return;
    }

    // 1. Fast match check against current local/cached access list
    let matchedGuest = findMatchingGuest(rawInput);

    // 2. If not matched in cache, verify live online against cloud database
    if (!matchedGuest) {
      showGateChecking();
      try {
        await syncAccessListFromCloud();
        matchedGuest = findMatchingGuest(rawInput);
      } catch (err) {
        console.warn("Online verification error:", err);
      } finally {
        hideGateChecking();
      }
    }

    if (matchedGuest) {
      handleVerificationSuccess(matchedGuest);
    } else {
      showGateError("Sorry, your name is not on the authorized guest list. Please check the spelling or contact Sakib Hossain for access.");
    }
  });

  // Try Again Button
  dom.tryAgainBtn.addEventListener('click', () => {
    dom.gateError.style.display = 'none';
    dom.guestInput.value = '';
    dom.guestInput.focus();
  });

  // Change Guest Name Button
  dom.changeGuestBtn.addEventListener('click', () => {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    pauseMusic();
    if (dom.topNavBar) {
      dom.topNavBar.classList.remove('is-visible');
    }
    if (dom.adminManageBtn) {
      dom.adminManageBtn.style.display = 'none';
    }
    closeAdminModal();
    dom.gateSuccess.style.display = 'none';
    dom.gateError.style.display = 'none';
    dom.guestInput.value = '';
    dom.gateOverlay.classList.remove('is-hidden');
    dom.envelopeStage.classList.remove('is-opened');
    dom.envelopeContainer.className = 'envelope-container';
    dom.invitationApp.style.display = 'none';
    dom.guestInput.focus();
  });
}

function showGateError(customMsg) {
  dom.gateSuccess.style.display = 'none';
  dom.gateError.style.display = 'flex';
  if (customMsg) {
    dom.gateError.querySelector('.alert-content span').textContent = customMsg;
  }
}

function handleVerificationSuccess(guestName) {
  dom.gateError.style.display = 'none';
  dom.welcomeGuestName.textContent = `Welcome, ${guestName}!`;
  dom.gateSuccess.style.display = 'flex';

  localStorage.setItem(GUEST_STORAGE_KEY, guestName);

  // 1. Immediately play music upon matching name (valid user gesture)
  playMusic();

  // 2. Reveal persistent top navigation bar with active guest & audio controls
  if (dom.topNavBar) {
    dom.topNavBar.classList.add('is-visible');
  }

  // 3. Smooth transition to envelope stage with music playing
  setTimeout(() => {
    activateVerifiedGuest(guestName, true);
  }, 950);
}

function activateVerifiedGuest(guestName, isNewLogin) {
  // Update UI Labels
  dom.activeGuestLabel.textContent = guestName;
  if (dom.wishSenderName) {
    dom.wishSenderName.value = guestName;
  }

  // If Groom / Admin (Sakib), show the "Manage Access" button
  if (isGroomAdmin(guestName)) {
    if (dom.adminManageBtn) {
      dom.adminManageBtn.style.display = 'inline-flex';
    }
  } else {
    if (dom.adminManageBtn) {
      dom.adminManageBtn.style.display = 'none';
    }
  }

  // Ensure persistent top bar is visible
  if (dom.topNavBar) {
    dom.topNavBar.classList.add('is-visible');
  }

  // Fade out gate overlay
  dom.gateOverlay.classList.add('is-hidden');

  // Envelope stage ready
  dom.envelopeStage.classList.remove('is-opened');
}

// --------------------------------------------------------------------------
// 4. 3D ENVELOPE OPENING CEREMONY
// --------------------------------------------------------------------------
let isEnvelopeOpening = false;

function initEnvelopeCeremony() {
  function triggerOpening() {
    if (isEnvelopeOpening) return;
    isEnvelopeOpening = true;

    // Start background music automatically on user interaction
    tryStartMusic();

    // Step 1: Wax seal sparkles and cracks
    dom.envelopeContainer.classList.add('anim-step-1');

    setTimeout(() => {
      // Step 2: Seal drops and top flap flips 180 degrees
      dom.envelopeContainer.classList.add('anim-step-2');
    }, 450);

    setTimeout(() => {
      // Step 3: Inner letter slides smoothly upward
      dom.envelopeContainer.classList.add('anim-step-3');
    }, 1150);

    setTimeout(() => {
      // Step 4: Letter scales toward screen, envelope stage fades
      dom.envelopeContainer.classList.add('anim-step-4');
    }, 2200);

    setTimeout(() => {
      // Step 5: Full invitation folio appears
      dom.envelopeStage.classList.add('is-opened');
      dom.invitationApp.style.display = 'flex';

      // Trigger initial scroll reveals
      triggerScrollReveals();
      isEnvelopeOpening = false;
    }, 2800);
  }

  dom.waxSeal.addEventListener('click', triggerOpening);
  dom.waxSeal.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerOpening();
    }
  });

  dom.envelopeContainer.addEventListener('click', (e) => {
    if (!isEnvelopeOpening && !dom.envelopeStage.classList.contains('is-opened')) {
      triggerOpening();
    }
  });
}

// --------------------------------------------------------------------------
// 5. COUNTDOWN TIMER
// --------------------------------------------------------------------------
function initCountdown() {
  const targetTime = new Date(wedding.targetDate).getTime();

  function update() {
    const now = new Date().getTime();
    const distance = targetTime - now;

    if (distance <= 0) {
      dom.cdDays.textContent = "00";
      dom.cdHours.textContent = "00";
      dom.cdMinutes.textContent = "00";
      dom.cdSeconds.textContent = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    dom.cdDays.textContent = String(days).padStart(2, '0');
    dom.cdHours.textContent = String(hours).padStart(2, '0');
    dom.cdMinutes.textContent = String(minutes).padStart(2, '0');
    dom.cdSeconds.textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// --------------------------------------------------------------------------
// 6. GALLERY LIGHTBOX
// --------------------------------------------------------------------------
function initGalleryLightbox() {
  dom.galleryCards.forEach((card) => {
    card.addEventListener('click', () => {
      const imgSrc = card.getAttribute('data-img');
      const caption = card.getAttribute('data-caption') || '';

      dom.lightboxImage.src = imgSrc;
      dom.lightboxCaption.textContent = caption;
      dom.lightboxModal.classList.add('is-active');
      dom.lightboxModal.setAttribute('aria-hidden', 'false');
    });
  });

  function closeLightbox() {
    dom.lightboxModal.classList.remove('is-active');
    dom.lightboxModal.setAttribute('aria-hidden', 'true');
    dom.lightboxImage.src = '';
  }

  dom.lightboxCloseBtn.addEventListener('click', closeLightbox);
  dom.lightboxBackdrop.addEventListener('click', closeLightbox);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dom.lightboxModal.classList.contains('is-active')) {
      closeLightbox();
    }
  });
}

// --------------------------------------------------------------------------
// 7. WISHES & DIRECT WHATSAPP INTEGRATION (REAL GUEST BLESSINGS ONLY)
// --------------------------------------------------------------------------
function initWishesAndWhatsApp() {
  // Load only genuine guest-submitted wishes from localStorage (No random dummy wishes)
  let wishes = [];
  try {
    const saved = localStorage.getItem(WISHES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const dummyNames = [
          "Rahim Ahmed", "Karim Hossain", "Uncle Rafiq & Family", 
          "Farhana Jahan", "Tanvir Ahmed", "Amina Begum"
        ];
        wishes = parsed.filter((w) => !dummyNames.includes(w.name) && (!w.id || w.id.startsWith('user-wish-')));
        localStorage.setItem(WISHES_STORAGE_KEY, JSON.stringify(wishes));
      }
    }
  } catch (e) {
    wishes = [];
  }

  renderWishes(wishes);

  // Quick sentiment chips click handler
  dom.sentimentChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const sentimentText = chip.getAttribute('data-text');
      dom.wishMessage.value = sentimentText;
      dom.wishMessage.focus();
    });
  });

  // Handle Wishes form submit
  dom.wishesForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const senderName = dom.wishSenderName.value.trim() || "An Honored Well-Wisher";
    const relation = dom.wishRelation.value;
    const message = dom.wishMessage.value.trim();

    if (!message) {
      alert("Please write your blessing or prayer before sending.");
      return;
    }

    // 1. Create real guest wish object & store locally
    const newWish = {
      id: "user-wish-" + Date.now(),
      name: senderName,
      relation: relation,
      message: message,
      time: "Just now",
      ameens: 1,
      isAmeenGiven: true
    };

    wishes.unshift(newWish);
    try {
      localStorage.setItem(WISHES_STORAGE_KEY, JSON.stringify(wishes));
    } catch (err) {
      console.warn("Could not save to localStorage", err);
    }

    // 2. Re-render the live guestbook wall with immediate animation
    renderWishes(wishes);

    // 3. Format message for direct WhatsApp sending with Islamic dua and Jummah date
    const formattedWhatsAppText = 
      `*Nikah Mubarak & Wedding Blessing for Sakib & Nusrat* 💍✨\n` +
      `*Date:* Friday, January 08, 2027 (After Jummah Namaz)\n` +
      `*Venue:* Al Hossain Jame Mosque, Dewliya Bari\n\n` +
      `*From:* ${senderName} (${relation})\n` +
      `*Prayer / Blessing:* "${message}"\n\n` +
      `Barakallahu lakuma wa baraka alaykuma wa jama'a baynakuma fee khair! 🤲🤍`;

    const whatsappUrl = `https://wa.me/${wedding.whatsappNumber}?text=${encodeURIComponent(formattedWhatsAppText)}`;

    // 4. Reset message input
    dom.wishMessage.value = "";

    // 5. Open WhatsApp in new tab / app
    window.open(whatsappUrl, '_blank');
  });
}

function renderWishes(wishes) {
  if (!dom.wishesList) return;
  dom.wishesList.innerHTML = '';

  // Update live counter badge
  if (dom.wishesCountBadge) {
    if (wishes.length === 0) {
      dom.wishesCountBadge.textContent = '✦ Be the First to Send Blessings ✦';
    } else if (wishes.length === 1) {
      dom.wishesCountBadge.textContent = '✦ 1 Blessing & Prayer Shared ✦';
    } else {
      dom.wishesCountBadge.textContent = `✦ ${wishes.length} Blessings & Prayers Shared ✦`;
    }
  }

  // If no wishes yet, show clean empty-state encouragement
  if (wishes.length === 0) {
    const emptyNotice = document.createElement('div');
    emptyNotice.className = 'empty-wishes-notice';
    emptyNotice.innerHTML = `
      <div class="empty-icon">✨</div>
      <p class="empty-title">Be the First to Bestow a Blessing</p>
      <p class="empty-desc">No messages yet. Send your heartfelt prayers &amp; blessings to Sakib &amp; Nusrat above to appear on this live wall!</p>
    `;
    dom.wishesList.appendChild(emptyNotice);
    return;
  }

  wishes.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'wish-item-card';

    // Header: Name, Badge, and Timestamp
    const header = document.createElement('div');
    header.className = 'wish-item-header';

    const authorGroup = document.createElement('div');
    authorGroup.className = 'wish-author-group';

    const author = document.createElement('span');
    author.className = 'wish-author';
    author.textContent = item.name;

    const badge = document.createElement('span');
    badge.className = 'wish-badge';
    badge.textContent = item.relation;

    authorGroup.appendChild(author);
    authorGroup.appendChild(badge);

    const time = document.createElement('span');
    time.className = 'wish-time';
    time.textContent = item.time || 'Recently';

    header.appendChild(authorGroup);
    header.appendChild(time);

    // Message Body
    const text = document.createElement('p');
    text.className = 'wish-text';
    text.textContent = `"${item.message}"`;

    // Footer: Islamic Dua Tag & Interactive "Say Ameen" button
    const footer = document.createElement('div');
    footer.className = 'wish-item-footer';

    const duaTag = document.createElement('span');
    duaTag.className = 'wish-dua-tag';
    duaTag.innerHTML = `<span>🤲</span> Du'a`;

    const ameenBtn = document.createElement('button');
    ameenBtn.type = 'button';
    ameenBtn.className = `btn-say-ameen ${item.isAmeenGiven ? 'is-active' : ''}`;
    ameenBtn.setAttribute('aria-label', `Say Ameen to prayer by ${item.name}`);
    ameenBtn.innerHTML = `
      <span class="ameen-icon">${item.isAmeenGiven ? '✨' : '🤲'}</span>
      <span class="ameen-label">${item.isAmeenGiven ? 'Ameen ✓' : 'Say Ameen'}</span>
      <span class="ameen-count">${item.ameens || 1}</span>
    `;

    // Click handler for Say Ameen interaction
    ameenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!item.isAmeenGiven) {
        item.isAmeenGiven = true;
        item.ameens = (item.ameens || 0) + 1;
      } else {
        item.isAmeenGiven = false;
        item.ameens = Math.max(1, (item.ameens || 1) - 1);
      }
      try {
        localStorage.setItem(WISHES_STORAGE_KEY, JSON.stringify(wishes));
      } catch (err) {}
      renderWishes(wishes);
    });

    footer.appendChild(duaTag);
    footer.appendChild(ameenBtn);

    card.appendChild(header);
    card.appendChild(text);
    card.appendChild(footer);

    dom.wishesList.appendChild(card);
  });
}

// --------------------------------------------------------------------------
// 8. LUXURY AUDIO PLAYER (WITH GRACEFUL SYNTHESIZER FALLBACK)
// --------------------------------------------------------------------------
let isAudioPlaying = false;
let audioContext = null;
let synthTimer = null;

function initMusicPlayer() {
  if (dom.audioEl) {
    if (wedding.musicFile) {
      dom.audioEl.src = wedding.musicFile;
    }
    // Set gentle, peaceful 40% volume level
    dom.audioEl.volume = wedding.musicVolume ?? 0.40;
  }
  if (dom.musicToggleBtn) {
    dom.musicToggleBtn.addEventListener('click', toggleMusic);
  }
}

function tryStartMusic() {
  if (!isAudioPlaying) {
    toggleMusic();
  }
}

function toggleMusic() {
  if (isAudioPlaying) {
    pauseMusic();
  } else {
    playMusic();
  }
}

function playMusic() {
  isAudioPlaying = true;
  if (dom.musicToggleBtn) {
    dom.musicToggleBtn.classList.add('is-playing');
    dom.musicToggleBtn.setAttribute('aria-pressed', 'true');
  }
  if (dom.musicLabel) {
    dom.musicLabel.textContent = "Pause";
  }

  // Ensure volume is set to 40%
  if (dom.audioEl) {
    dom.audioEl.volume = wedding.musicVolume ?? 0.40;
    // Try playing external MP3 audio
    const playPromise = dom.audioEl.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Audio element play interrupted or blocked; falling back to Web Audio synth:", err);
        // If external mp3 is missing or blocked, trigger soothing Web Audio wedding synth
        startSoothingWeddingSynth();
      });
    }
  } else {
    startSoothingWeddingSynth();
  }
}

function pauseMusic() {
  isAudioPlaying = false;
  if (dom.musicToggleBtn) {
    dom.musicToggleBtn.classList.remove('is-playing');
    dom.musicToggleBtn.setAttribute('aria-pressed', 'false');
  }
  if (dom.musicLabel) {
    dom.musicLabel.textContent = "Play Music";
  }

  if (dom.audioEl) {
    dom.audioEl.pause();
  }
  stopSoothingWeddingSynth();
}

/**
 * Built-in Web Audio API Synthesizer:
 * Generates an ethereal, romantic wedding harp & celesta chord progression.
 * Works 100% reliably in all modern browsers without needing external audio files.
 */
function startSoothingWeddingSynth() {
  if (synthTimer) return;

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioContext) {
      audioContext = new AudioCtx();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // Peaceful Pentatonic Harp Frequencies (Db major / romantic wedding warmth)
    const notes = [
      277.18, 329.63, 369.99, 415.30, 493.88, 554.37, 659.25, 739.99
    ];

    let step = 0;
    synthTimer = setInterval(() => {
      if (!isAudioPlaying || !audioContext) return;

      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = 'sine';
      const freq = notes[step % notes.length];
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);

      gain.gain.setValueAtTime(0.001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.035, audioContext.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start();
      osc.stop(audioContext.currentTime + 1.85);

      step++;
    }, 750);
  } catch (e) {
    console.log("Web Audio synth not supported", e);
  }
}

function stopSoothingWeddingSynth() {
  if (synthTimer) {
    clearInterval(synthTimer);
    synthTimer = null;
  }
}

// --------------------------------------------------------------------------
// 9. SCROLL REVEALS & DYNAMIC SCROLL ANIMATIONS
// --------------------------------------------------------------------------
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.12
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.scroll-reveal').forEach((el) => {
    observer.observe(el);
  });
}

function triggerScrollReveals() {
  document.querySelectorAll('.scroll-reveal').forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 50) {
      el.classList.add('is-revealed');
    }
  });
}

// --------------------------------------------------------------------------
// 10. FLOATING ROSE PETALS & GOLD DUST CANVAS
// --------------------------------------------------------------------------
function initAmbientCanvas() {
  const canvas = dom.ambientCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  // Particle models (petals and golden sparkles)
  const particles = [];
  const TOTAL_PARTICLES = window.innerWidth < 768 ? 22 : 36;

  for (let i = 0; i < TOTAL_PARTICLES; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 8 + 4,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: Math.random() * 0.9 + 0.4,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 1.5,
      type: i % 3 === 0 ? 'gold' : 'petal',
      opacity: Math.random() * 0.5 + 0.3
    });
  }

  // Scroll speed tracking to influence particles
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    scrollVelocity = (currentScrollY - lastScrollY) * 0.15;
    lastScrollY = currentScrollY;
  }, { passive: true });

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Dampen scroll velocity
    scrollVelocity *= 0.92;

    particles.forEach((p) => {
      p.y += p.speedY + scrollVelocity;
      p.x += p.speedX + Math.sin(p.y * 0.01) * 0.5;
      p.rotation += p.rotSpeed;

      // Wrap around screen
      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      } else if (p.y < -30) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x > width + 20) p.x = -10;
      if (p.x < -20) p.x = width + 10;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;

      if (p.type === 'petal') {
        // Soft blush pink rose petal
        ctx.fillStyle = '#E8BDC4';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.6, Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        // Shimmering antique gold sparkle
        ctx.fillStyle = '#D4AF37';
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.35, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.restore();
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

// --------------------------------------------------------------------------
// 10B. GROOM ADMIN ACCESS CONTROL (ADD / REMOVE GUEST ACCESS & CLOUD SYNC)
// --------------------------------------------------------------------------
function initAdminAccessControl() {
  if (!dom.adminManageBtn || !dom.adminModal) return;

  // Open modal
  dom.adminManageBtn.addEventListener('click', () => {
    openAdminModal();
  });

  // Close modal via top-right close button
  if (dom.adminModalCloseBtn) {
    dom.adminModalCloseBtn.addEventListener('click', () => {
      closeAdminModal();
    });
  }

  // Close modal via backdrop click
  if (dom.adminModalBackdrop) {
    dom.adminModalBackdrop.addEventListener('click', () => {
      closeAdminModal();
    });
  }

  // Close modal via Done button
  if (dom.adminDoneBtn) {
    dom.adminDoneBtn.addEventListener('click', () => {
      closeAdminModal();
    });
  }

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dom.adminModal && dom.adminModal.classList.contains('is-active')) {
      closeAdminModal();
    }
  });

  // Add Guest Form (Local + Online Cloud Sync)
  if (dom.adminAddGuestForm) {
    dom.adminAddGuestForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rawName = dom.adminNewGuestInput.value.trim().replace(/\s+/g, ' ');
      if (!rawName || rawName.length < 2) {
        showAdminFeedback("Please enter a valid name (at least 2 characters).", "error");
        return;
      }

      // Format properly: "abdur rahim" -> "Abdur Rahim"
      const formattedName = rawName
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

      const list = getAccessList();

      // Check for duplicate (case-insensitive)
      const existing = list.find((g) => g.toLowerCase() === formattedName.toLowerCase());
      if (existing) {
        showAdminFeedback(`"${existing}" is already on the access list.`, "warning");
        return;
      }

      list.push(formattedName);
      saveAccessList(list);
      renderAdminGuestList();
      dom.adminNewGuestInput.value = '';
      showAdminFeedback(`✨ Added "${formattedName}"! Syncing to online cloud...`, "success");

      // Push to online cloud so all devices get the update immediately
      await pushAccessListToCloud(list);
    });
  }

  // Manual Cloud Sync Button
  if (dom.adminCloudSyncBtn) {
    dom.adminCloudSyncBtn.addEventListener('click', async () => {
      await syncAccessListFromCloud(true);
    });
  }

  // Toggle Cloud Settings Drawer
  if (dom.adminCloudSettingsToggle && dom.adminCloudSettingsDrawer) {
    dom.adminCloudSettingsToggle.addEventListener('click', () => {
      const isClosed = dom.adminCloudSettingsDrawer.style.display === 'none';
      dom.adminCloudSettingsDrawer.style.display = isClosed ? 'block' : 'none';
      dom.adminCloudSettingsToggle.setAttribute('aria-expanded', isClosed ? 'true' : 'false');
    });
  }

  // Save Custom Cloud URL
  if (dom.adminSaveCloudUrlBtn && dom.adminCustomCloudUrl) {
    dom.adminSaveCloudUrlBtn.addEventListener('click', async () => {
      const url = dom.adminCustomCloudUrl.value.trim();
      if (!url || !url.startsWith('http')) {
        showAdminCloudFeedback("Please enter a valid HTTP/HTTPS URL.", "error");
        return;
      }

      showAdminCloudFeedback("Testing connection to cloud...", "warning");
      try {
        const resp = await fetch(url);
        if (!resp.ok && resp.status !== 404) {
          throw new Error(`Server responded with HTTP ${resp.status}`);
        }
        localStorage.setItem(CLOUD_STORAGE_KEY, url);
        showAdminCloudFeedback("✅ Cloud database connected and saved!", "success");
        await syncAccessListFromCloud(true);
      } catch (err) {
        console.warn("Cloud connection test failed:", err);
        showAdminCloudFeedback(`Could not connect: ${err.message}. Check URL or CORS permissions.`, "error");
      }
    });
  }

  // Reset Custom Cloud URL
  if (dom.adminResetCloudUrlBtn && dom.adminCustomCloudUrl) {
    dom.adminResetCloudUrlBtn.addEventListener('click', async () => {
      localStorage.removeItem(CLOUD_STORAGE_KEY);
      dom.adminCustomCloudUrl.value = '';
      showAdminCloudFeedback("Restored to built-in online cloud.", "success");
      await syncAccessListFromCloud(true);
    });
  }

  // Copy JSON Button
  if (dom.adminCopyJsonBtn) {
    dom.adminCopyJsonBtn.addEventListener('click', () => {
      const currentList = getAccessList();
      const jsonStr = JSON.stringify(currentList, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(jsonStr).then(() => {
          showAdminFeedback("📋 Copied guests.json to clipboard!", "success");
        }).catch(() => {
          showAdminFeedback("Could not copy automatically. Check permissions.", "warning");
        });
      } else {
        showAdminFeedback("Clipboard not supported in this browser.", "warning");
      }
    });
  }

  // Reset Defaults Button
  if (dom.adminResetDefaultsBtn) {
    dom.adminResetDefaultsBtn.addEventListener('click', async () => {
      if (confirm("Reset the guest access list back to the default guests?")) {
        saveAccessList(DEFAULT_GUEST_ACCESS_LIST);
        renderAdminGuestList();
        showAdminFeedback("Access list restored to default guests. Syncing to cloud...", "success");
        await pushAccessListToCloud(DEFAULT_GUEST_ACCESS_LIST);
      }
    });
  }
}

function openAdminModal() {
  if (!dom.adminModal) return;
  dom.adminModal.style.display = 'flex';
  setTimeout(() => {
    dom.adminModal.classList.add('is-active');
  }, 10);

  // Pre-fill custom cloud URL input if configured
  if (dom.adminCustomCloudUrl) {
    const custom = localStorage.getItem(CLOUD_STORAGE_KEY);
    dom.adminCustomCloudUrl.value = custom || '';
  }

  renderAdminGuestList();
  if (dom.adminFeedback) {
    dom.adminFeedback.style.display = 'none';
  }
  if (dom.adminNewGuestInput) {
    dom.adminNewGuestInput.focus();
  }

  // Refresh latest list from online cloud
  syncAccessListFromCloud();
}

function closeAdminModal() {
  if (!dom.adminModal) return;
  dom.adminModal.classList.remove('is-active');
  setTimeout(() => {
    dom.adminModal.style.display = 'none';
  }, 300);
}

function showAdminFeedback(message, type = "success") {
  if (!dom.adminFeedback) return;
  dom.adminFeedback.textContent = message;
  dom.adminFeedback.className = `admin-feedback ${type}`;
  dom.adminFeedback.style.display = 'block';

  clearTimeout(dom.adminFeedback._timeout);
  dom.adminFeedback._timeout = setTimeout(() => {
    dom.adminFeedback.style.display = 'none';
  }, 4500);
}

function showAdminCloudFeedback(message, type = "success") {
  if (!dom.adminCloudFeedback) return;
  dom.adminCloudFeedback.textContent = message;
  dom.adminCloudFeedback.className = `admin-feedback ${type}`;
  dom.adminCloudFeedback.style.display = 'block';

  clearTimeout(dom.adminCloudFeedback._timeout);
  dom.adminCloudFeedback._timeout = setTimeout(() => {
    dom.adminCloudFeedback.style.display = 'none';
  }, 5000);
}

function renderAdminGuestList() {
  if (!dom.adminGuestsContainer) return;
  const list = getAccessList();

  if (dom.adminGuestCount) {
    dom.adminGuestCount.textContent = `${list.length} ${list.length === 1 ? 'Guest' : 'Guests'}`;
  }

  dom.adminGuestsContainer.innerHTML = '';

  if (list.length === 0) {
    const emptyNotice = document.createElement('div');
    emptyNotice.className = 'admin-empty-list';
    emptyNotice.textContent = 'No guests on the list. Add a name above.';
    dom.adminGuestsContainer.appendChild(emptyNotice);
    return;
  }

  list.forEach((guest) => {
    const isHost = isGroomAdmin(guest);
    const item = document.createElement('div');
    item.className = `admin-guest-item ${isHost ? 'is-host' : ''}`;

    const info = document.createElement('div');
    info.className = 'admin-guest-info';

    const avatar = document.createElement('span');
    avatar.className = 'admin-guest-avatar';
    avatar.textContent = isHost ? '👑' : '👤';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'admin-guest-name';
    nameSpan.textContent = guest;

    const badge = document.createElement('span');
    badge.className = `admin-guest-badge ${isHost ? 'badge-host' : 'badge-guest'}`;
    badge.textContent = isHost ? 'Groom / Host' : 'Guest';

    info.appendChild(avatar);
    info.appendChild(nameSpan);
    info.appendChild(badge);
    item.appendChild(info);

    if (!isHost) {
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'btn-remove-guest';
      removeBtn.title = `Remove access for ${guest}`;
      removeBtn.innerHTML = '<span class="remove-icon">✕</span> <span>Remove</span>';
      removeBtn.addEventListener('click', () => {
        handleRemoveGuest(guest);
      });
      item.appendChild(removeBtn);
    } else {
      const protectedTag = document.createElement('span');
      protectedTag.className = 'admin-protected-tag';
      protectedTag.textContent = 'Protected';
      protectedTag.title = 'Host/Groom cannot be removed';
      item.appendChild(protectedTag);
    }

    dom.adminGuestsContainer.appendChild(item);
  });
}

async function handleRemoveGuest(guestName) {
  if (isGroomAdmin(guestName)) return; // Safety check
  const list = getAccessList();
  const updated = list.filter((g) => g.toLowerCase() !== guestName.toLowerCase());
  saveAccessList(updated);
  renderAdminGuestList();
  showAdminFeedback(`Removed "${guestName}". Syncing to cloud...`, "warning");

  // Push update to cloud
  await pushAccessListToCloud(updated);
}

// --------------------------------------------------------------------------
// 11. INITIALIZATION ON DOM READY
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // 1. Instantly begin background fetch from online cloud
  syncAccessListFromCloud();

  // 2. Initialize core modules
  initGuestVerification();
  initEnvelopeCeremony();
  initCountdown();
  initGalleryLightbox();
  initWishesAndWhatsApp();
  initMusicPlayer();
  initScrollAnimations();
  initAmbientCanvas();
  initAdminAccessControl();
});
