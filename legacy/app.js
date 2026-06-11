/* =====================================================================
   My_Fix Core Logic Controller
   Features: Proximity matching, Onboarding KYC wizard, Paystack Webhook, 
             Vulnerability simulator, and Live Supabase database seeder.
   ===================================================================== */

// 1. Initial Lagos Seed Data
const LAGOS_ARTISANS = [
    {
        id: "a1a1a1a1-bbbb-cccc-dddd-111122223333",
        full_name: "Emeka Anthony Nwosu",
        trade_category: ["Electrician", "Generator Repair"],
        badge: "gold",
        nin_verified: true,
        bvn_verified: true,
        background_checked: true,
        base_callout_fee: 5000,
        service_areas: ["Surulere", "Yaba", "Ikeja"],
        lat: 6.5058, // Surulere
        lng: 3.3614,
        about_text: "Certified commercial and residential electrician. Specializes in conduit wiring, fault detection, and large diesel generator servicing. 5+ years experience.",
        rating_avg: 4.9,
        jobs_completed: 142,
        avatar_url: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: "b2b2b2b2-cccc-dddd-eeee-222233334444",
        full_name: "Chinedu Okafor",
        trade_category: ["Plumber"],
        badge: "silver",
        nin_verified: true,
        bvn_verified: true,
        background_checked: false,
        base_callout_fee: 4000,
        service_areas: ["Lekki", "VI", "Victoria Island"],
        lat: 6.4281, // Lekki Phase 1
        lng: 3.4219,
        about_text: "Professional residential plumber. Expertise in water mains repair, sewage drainage unblocking, pipe threading, and water heater installations.",
        rating_avg: 4.6,
        jobs_completed: 89,
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: "c3c3c3c3-dddd-eeee-ffff-333344445555",
        full_name: "Babajide Cole",
        trade_category: ["AC Repair", "Electrician"],
        badge: "gold",
        nin_verified: true,
        bvn_verified: true,
        background_checked: true,
        base_callout_fee: 6000,
        service_areas: ["Ikeja", "Maryland", "Surulere"],
        lat: 6.5920, // Ikeja GRA
        lng: 3.3422,
        about_text: "HVAC cooling systems specialist. Expert in invertor AC installation, gas refilling, duct cleaning, and deep diagnostic repairs. 8 years active service.",
        rating_avg: 4.85,
        jobs_completed: 215,
        avatar_url: "https://images.unsplash.com/photo-1620122303020-43ec4b6cf7f8?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: "d4d4d4d4-eeee-ffff-aaaa-444455556666",
        full_name: "Tolani Alao",
        trade_category: ["Tailor"],
        badge: "bronze",
        nin_verified: true,
        bvn_verified: false,
        background_checked: false,
        base_callout_fee: 3000,
        service_areas: ["Yaba", "Surulere"],
        lat: 6.5095, // Yaba
        lng: 3.3711,
        about_text: "Expert tailor and designer for traditional male and female garments (Agbada, Ankara fits). Available for home measurements and express delivery.",
        rating_avg: 4.2,
        jobs_completed: 31,
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: "e5e5e5e5-ffff-aaaa-bbbb-555566667777",
        full_name: "Funke Bello",
        trade_category: ["Laundry"],
        badge: "silver",
        nin_verified: true,
        bvn_verified: true,
        background_checked: false,
        base_callout_fee: 3500,
        service_areas: ["Victoria Island", "Ikoyi", "Lekki"],
        lat: 6.4278, // Victoria Island
        lng: 3.4248,
        about_text: "Deep-cleaning home services and premium laundry adjustments. Highly trusted housekeeper with verified ratings across premium Lekki/VI estates.",
        rating_avg: 4.7,
        jobs_completed: 65,
        avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: "f6f6f6f6-aaaa-bbbb-cccc-666677778888",
        full_name: "Segun Bakare",
        trade_category: ["Generator Repair", "Plumber"],
        badge: "gold",
        nin_verified: true,
        bvn_verified: true,
        background_checked: true,
        base_callout_fee: 5500,
        service_areas: ["Surulere", "Yaba", "Apapa"],
        lat: 6.5020, // Surulere Neighborhood
        lng: 3.3580,
        about_text: "Specialized generator technician with 10+ years experience. Expert in servicing Mikano, Lister, and Tigmax generators. Emergency callouts accepted.",
        rating_avg: 4.95,
        jobs_completed: 320,
        avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
    }
];

// Supabase Direct Credentials (extracted from .env for local demo)
const SUPABASE_URL = "https://tarvtukfkytouhyuiamb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhcnZ0dWtma3l0b3VoeXVpYW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2OTg3MDMsImV4cCI6MjA5NTI3NDcwM30.9LYBtBiYbQtMFUVzo9z29N_4H77-LFvFsdQa8wZmX88";

// 2. Active Application State
let appState = {
    theme: "dark",
    clientLat: 6.4281, // Lekki Phase 1
    clientLng: 3.4219,
    filterTrade: "all",
    filterBadge: "bronze",
    loadedArtisans: [], // Cache of queried database artisans
    
    // Onboarding Simulator State
    onboardingStep: 1,
    otpSent: false,
    otpVerified: false,
    ninVerified: false,
    bvnVerified: false,
    
    // Booking & Escrow Simulator State
    selectedArtisanForBooking: LAGOS_ARTISANS[0],
    bookingPriceNaira: 15000,
    paymentAmountInput: 15000,
    bookingStatus: "pending", // pending, paid, completed, released, disputed
    isExploitAttempted: false
};

// 3. Document Elements Cache
const elements = {
    // Navigation Tabs
    navButtons: document.querySelectorAll('.nav-btn'),
    tabPanels: document.querySelectorAll('.tab-panel'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    
    // Client Context inputs
    clientNeighborhood: document.getElementById('client-neighborhood'),
    displayLat: document.getElementById('display-lat'),
    displayLng: document.getElementById('display-lng'),
    filterTrade: document.getElementById('filter-trade'),
    badgeButtons: document.querySelectorAll('.badge-btn'),
    
    // Dynamic List containers
    artisansListContainer: document.getElementById('artisans-list-container'),
    
    // Onboarding elements
    indSteps: [
        document.getElementById('ind-step-1'),
        document.getElementById('ind-step-2'),
        document.getElementById('ind-step-3'),
        document.getElementById('ind-step-4')
    ],
    stepViews: [
        document.getElementById('step-view-1'),
        document.getElementById('step-view-2'),
        document.getElementById('step-view-3'),
        document.getElementById('step-view-4')
    ],
    btnSendOtp: document.getElementById('btn-send-otp'),
    otpInputArea: document.getElementById('otp-input-area'),
    btnVerifyOtp: document.getElementById('btn-verify-otp'),
    btnSubmitNin: document.getElementById('btn-submit-nin'),
    btnSubmitBvn: document.getElementById('btn-submit-bvn'),
    btnResetOnboarding: document.getElementById('btn-reset-onboarding'),
    toggleNimcOffline: document.getElementById('toggle-nimc-offline'),
    selfieCaptureBox: document.getElementById('selfie-capture-box'),
    selfieMatchBadge: document.getElementById('selfie-match-badge'),
    
    // Escrow & Webhook elements
    escrowArtisanName: document.getElementById('escrow-artisan-name'),
    escrowCalloutFee: document.getElementById('escrow-callout-fee'),
    escrowServiceFee: document.getElementById('escrow-service-fee'),
    escrowTotalCost: document.getElementById('escrow-total-cost'),
    simPaymentAmount: document.getElementById('sim-payment-amount'),
    btnForceExploitPrice: document.getElementById('btn-force-exploit-price'),
    btnTriggerCheckout: document.getElementById('btn-trigger-checkout'),
    btnPaystackSuccessMock: document.getElementById('btn-paystack-success-mock'),
    btnPaystackCancel: document.getElementById('btn-paystack-cancel'),
    paystackModal: document.getElementById('paystack-modal'),
    paystackModalAmount: document.getElementById('paystack-modal-amount'),
    consoleLogsDisplay: document.getElementById('console-logs-display'),
    btnClearConsole: document.getElementById('btn-clear-console'),
    
    // Escrow nodes
    nodePending: document.getElementById('node-pending'),
    nodePaid: document.getElementById('node-paid'),
    nodeCompleted: document.getElementById('node-completed'),
    nodeReleased: document.getElementById('node-released'),
    
    // Escrow buttons controller
    escrowActionsArea: document.getElementById('escrow-actions-area'),
    btnArtisanComplete: document.getElementById('btn-artisan-complete'),
    btnClientConfirmRelease: document.getElementById('btn-client-confirm-release'),
    btnClientDispute: document.getElementById('btn-client-dispute'),
    
    // Supabase monitor buttons
    btnSeedDatabase: document.getElementById('btn-seed-database'),
    seedingLoadingIndicator: document.getElementById('seeding-loading-indicator'),
    statArtisansCount: document.getElementById('stat-artisans-count'),
    statEscrowCount: document.getElementById('stat-escrow-count')
};

// =====================================================================
// Haversine Proximity Calculation (Simulating PostGIS Proximity)
// =====================================================================
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}
// 4. Render Discovery Cards dynamically
async function renderArtisanCards() {
    elements.artisansListContainer.innerHTML = `
        <div class="loading-state text-center" style="grid-column: 1 / -1; padding: 3rem;">
            <i class="fa-solid fa-circle-notch fa-spin text-gold" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h4>Loading from Supabase...</h4>
            <p class="text-muted">Fetching live artisans using PostGIS proximity filters.</p>
        </div>
    `;
    
    let sourceArtisans = LAGOS_ARTISANS;
    let isLiveDatabase = false;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_nearby_artisans`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                lat: appState.clientLat,
                lng: appState.clientLng,
                max_distance_meters: 100000, // 100 km limit
                trade_filter: appState.filterTrade === "all" ? null : appState.filterTrade
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                sourceArtisans = data;
                isLiveDatabase = true;
            }
        }
    } catch (err) {
        console.warn("Direct Supabase fetch failed. Falling back to local dataset.", err);
    }

    elements.artisansListContainer.innerHTML = "";

    // Filter by badge (RPC already filtered by trade if we got live data)
    const filtered = sourceArtisans.filter(artisan => {
        // Trade filter (only run if using local dataset fallback)
        if (!isLiveDatabase && appState.filterTrade !== "all" && !artisan.trade_category.includes(appState.filterTrade)) {
            return false;
        }

        // Badge filter hierarchy
        const badgeRanks = { bronze: 1, silver: 2, gold: 3 };
        const artisanRank = badgeRanks[artisan.badge] || 1;
        const targetRank = badgeRanks[appState.filterBadge] || 1;
        return artisanRank >= targetRank;
    });

    // Map and Sort by proximity distance
    const matched = filtered.map(artisan => {
        let distance;
        if (isLiveDatabase) {
            distance = (artisan.distance_meters || 0) / 1000; // convert to km
        } else {
            distance = calculateHaversineDistance(
                appState.clientLat,
                appState.clientLng,
                artisan.lat,
                artisan.lng
            );
        }
        return { ...artisan, distance };
    }).sort((a, b) => a.distance - b.distance);

    // Cache the loaded artisans in the global appState for the booking selector
    appState.loadedArtisans = matched;

    if (matched.length === 0) {
        elements.artisansListContainer.innerHTML = `
            <div class="no-results glass text-center" style="grid-column: 1 / -1; padding: 3rem;">
                <i class="fa-solid fa-folder-open text-muted" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h4>No Artisans Found</h4>
                <p class="text-secondary">Try easing your search filters or neighborhood proximity limit.</p>
            </div>
        `;
        return;
    }

    matched.forEach(artisan => {
        const distanceText = artisan.distance.toFixed(1) + " km away";
        const calloutText = "₦" + Number(artisan.base_callout_fee).toLocaleString();
        
        let badgeIconHtml = "";
        if (artisan.badge === "gold") {
            badgeIconHtml = `<i class="fa-solid fa-award gold-text"></i>`;
        } else if (artisan.badge === "silver") {
            badgeIconHtml = `<i class="fa-solid fa-award silver-text"></i>`;
        } else {
            badgeIconHtml = `<i class="fa-solid fa-award bronze-text"></i>`;
        }

        // Handle case where trade_category is a postgres array or normal js array
        const trades = Array.isArray(artisan.trade_category) ? artisan.trade_category : [];
        const tradePillsHtml = trades.map(trade => `<span class="trade-pill">${trade}</span>`).join("");

        const card = document.createElement('div');
        card.className = "artisan-card glass";
        card.innerHTML = `
            <div class="artisan-header">
                <div class="artisan-avatar-wrapper">
                    <img class="artisan-avatar" src="${artisan.avatar_url || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150'}" alt="${artisan.full_name}">
                    <div class="artisan-badge-icon">${badgeIconHtml}</div>
                </div>
                <div class="artisan-meta">
                    <h4>${artisan.full_name}</h4>
                    <div class="artisan-trade-pills">${tradePillsHtml}</div>
                </div>
            </div>
            
            <div class="proximity-widget">
                <span><i class="fa-solid fa-location-crosshairs text-gold"></i> Proximity</span>
                <span class="distance-value">${distanceText}</span>
            </div>

            <p class="artisan-about">${artisan.about_text || 'No bio available.'}</p>

            <div class="artisan-pricing-rating">
                <div class="card-rating">
                    <i class="fa-solid fa-star"></i> <span>${Number(artisan.rating_avg || 5).toFixed(2)} (${artisan.jobs_completed || 0} jobs)</span>
                </div>
                <div class="card-price">
                    <span>Callout Fee: </span><strong>${calloutText}</strong>
                </div>
            </div>
            
            <button class="btn btn-primary" onclick="selectArtisanForEscrow('${artisan.id}')" style="width: 100%; margin-top: 0.5rem;">
                <i class="fa-solid fa-calendar-check"></i> Book Artisan
            </button>
        `;
        elements.artisansListContainer.appendChild(card);
    });

    elements.statArtisansCount.innerText = filtered.length;
}
// 5. Select Artisan for Booking Simulator
window.selectArtisanForEscrow = function(artisanId) {
    const artisan = appState.loadedArtisans.find(a => a.id === artisanId) || LAGOS_ARTISANS.find(a => a.id === artisanId);
    if (!artisan) return;

    appState.selectedArtisanForBooking = artisan;
    
    // Update checkout fields
    elements.escrowArtisanName.innerText = `${artisan.full_name} (${artisan.trade_category[0]})`;
    
    const callout = artisan.base_callout_fee;
    const serviceFee = 10000; // Mock estimate
    const total = callout + serviceFee;
    
    appState.bookingPriceNaira = total;
    appState.paymentAmountInput = total;
    
    elements.escrowCalloutFee.innerText = `₦${callout.toLocaleString()}.00`;
    elements.escrowServiceFee.innerText = `₦${serviceFee.toLocaleString()}.00`;
    elements.escrowTotalCost.innerText = `₦${total.toLocaleString()}.00`;
    elements.simPaymentAmount.value = total;
    elements.paystackModalAmount.innerText = `₦${total.toLocaleString()}.00`;

    // Navigate to Escrow Tab
    switchTab("escrow");
    
    // Reset state visualizer
    resetEscrowSimulator();
    
    appendAuditLog("blue", `[SYSTEM] Prepared booking with ${artisan.full_name}. Price agreed: ₦${total.toLocaleString()}`);
};

// =====================================================================
// Navigation & Theme Toggling
// =====================================================================
function switchTab(tabId) {
    elements.navButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    elements.tabPanels.forEach(panel => {
        if (panel.id === `tab-${tabId}`) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });
}

// Setup Event Listeners
elements.navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        switchTab(btn.getAttribute('data-tab'));
    });
});

elements.themeToggleBtn.addEventListener('click', () => {
    const html = document.documentElement;
    if (html.getAttribute('data-theme') === 'dark') {
        html.setAttribute('data-theme', 'light');
        appState.theme = "light";
    } else {
        html.setAttribute('data-theme', 'dark');
        appState.theme = "dark";
    }
});

// Proximity Coordinate Listeners
elements.clientNeighborhood.addEventListener('change', (e) => {
    const selected = e.target.options[e.target.selectedIndex];
    appState.clientLat = parseFloat(selected.getAttribute('data-lat'));
    appState.clientLng = parseFloat(selected.getAttribute('data-lng'));
    
    elements.displayLat.innerText = appState.clientLat;
    elements.displayLng.innerText = appState.clientLng;

    renderArtisanCards();
    appendAuditLog("blue", `[SYSTEM] Client location shifted to ${selected.text}. Re-calculating PostGIS distances.`);
});

elements.filterTrade.addEventListener('change', (e) => {
    appState.filterTrade = e.target.value;
    renderArtisanCards();
});

elements.badgeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        elements.badgeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        appState.filterBadge = btn.getAttribute('data-badge');
        renderArtisanCards();
    });
});

// =====================================================================
// Artisan Onboarding Wizard Simulator
// =====================================================================
function updateOnboardingStepsUI() {
    elements.indSteps.forEach((ind, index) => {
        if (index + 1 < appState.onboardingStep) {
            ind.className = "step-indicator completed";
        } else if (index + 1 === appState.onboardingStep) {
            ind.className = "step-indicator active";
        } else {
            ind.className = "step-indicator";
        }
    });

    elements.stepViews.forEach((view, index) => {
        if (index + 1 === appState.onboardingStep) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });
}

// Step 1: Phone OTP Click
elements.btnSendOtp.addEventListener('click', () => {
    elements.btnSendOtp.innerText = "Sending Code...";
    elements.btnSendOtp.disabled = true;
    
    setTimeout(() => {
        elements.btnSendOtp.classList.add('hidden');
        elements.otpInputArea.classList.remove('hidden');
        appState.otpSent = true;
    }, 1000);
});

elements.btnVerifyOtp.addEventListener('click', () => {
    appState.otpVerified = true;
    appState.onboardingStep = 2;
    updateOnboardingStepsUI();
});

// Step 2: NIN Submission (Simulating NIMC API & Fallbacks)
elements.btnSubmitNin.addEventListener('click', () => {
    const isOffline = elements.toggleNimcOffline.checked;
    elements.btnSubmitNin.innerText = "Connecting to NIMC API...";
    elements.btnSubmitNin.disabled = true;
    
    elements.selfieCaptureBox.className = "selfie-viewport analyzing";
    elements.selfieCaptureBox.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin text-gold" style="font-size: 3rem;"></i>
        <span class="selfie-label">Scanning Facial Selfie Matching with NIMC Biometrics...</span>
    `;

    setTimeout(() => {
        if (isOffline) {
            // NIMC Offline Trigger Manual Fallback
            elements.selfieCaptureBox.className = "selfie-viewport";
            elements.selfieCaptureBox.innerHTML = `
                <i class="fa-solid fa-hourglass-half text-gold" style="font-size: 3rem;"></i>
                <span class="selfie-label text-gold">NIMC API Offline fallback queue initialized. Face match pending admin review.</span>
            `;
            
            // Show alert box popup
            alert("⚠️ NIMC API DOWNTIME DETECTED!\nThe platform has diverted your registration to the pending admin review queue. Your background check is initiated, but your profile remains in Bronze status until manual verification completes.");
            
            appState.ninVerified = true;
            appState.onboardingStep = 3;
            updateOnboardingStepsUI();
        } else {
            // Normal Face Match Success
            elements.selfieCaptureBox.className = "selfie-viewport";
            elements.selfieCaptureBox.style.backgroundImage = "url('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80')";
            elements.selfieCaptureBox.style.backgroundSize = "cover";
            elements.selfieCaptureBox.innerHTML = "";
            elements.selfieMatchBadge.classList.remove('hidden');
            
            appState.ninVerified = true;
            setTimeout(() => {
                appState.onboardingStep = 3;
                updateOnboardingStepsUI();
            }, 1500);
        }
    }, 2000);
});

// Step 3: BVN Payout Verification Click
elements.btnSubmitBvn.addEventListener('click', () => {
    elements.btnSubmitBvn.innerText = "Cross-referencing BVN Name...";
    elements.btnSubmitBvn.disabled = true;

    setTimeout(() => {
        appState.bvnVerified = true;
        appState.onboardingStep = 4;
        updateOnboardingStepsUI();
    }, 1500);
});

elements.btnResetOnboarding.addEventListener('click', () => {
    // Reset everything
    appState.onboardingStep = 1;
    appState.otpSent = false;
    appState.otpVerified = false;
    appState.ninVerified = false;
    appState.bvnVerified = false;
    
    elements.btnSendOtp.classList.remove('hidden');
    elements.btnSendOtp.innerText = "Send Verification OTP Code";
    elements.btnSendOtp.disabled = false;
    elements.otpInputArea.classList.add('hidden');
    
    elements.btnSubmitNin.innerText = "Process NIN & Live Selfie";
    elements.btnSubmitNin.disabled = false;
    elements.selfieCaptureBox.innerHTML = `
        <i class="fa-solid fa-user-astronaut placeholder-astronaut"></i>
        <span class="selfie-label">Click 'Process NIN' to run Face Match</span>
    `;
    elements.selfieCaptureBox.style.backgroundImage = "none";
    elements.selfieMatchBadge.classList.add('hidden');
    
    elements.btnSubmitBvn.innerText = "Verify Payout Credentials";
    elements.btnSubmitBvn.disabled = false;

    updateOnboardingStepsUI();
});


// =====================================================================
// Escrow Payment Engine & Webhook Exploit Simulator
// =====================================================================
function resetEscrowSimulator() {
    appState.bookingStatus = "pending";
    appState.isExploitAttempted = false;
    
    elements.nodePending.className = "state-node active";
    elements.nodePaid.className = "state-node";
    elements.nodeCompleted.className = "state-node";
    elements.nodeReleased.className = "state-node";
    
    elements.escrowActionsArea.classList.add('hidden');
    elements.btnClientConfirmRelease.classList.add('hidden');
    elements.btnClientDispute.classList.add('hidden');
    elements.btnArtisanComplete.classList.remove('hidden');
}

elements.btnForceExploitPrice.addEventListener('click', () => {
    appState.paymentAmountInput = 1.00;
    elements.simPaymentAmount.value = 1.00;
    elements.paystackModalAmount.innerText = "₦1.00";
    appState.isExploitAttempted = true;
    
    appendAuditLog("red-alert", "⚠️ SECURITY ALERT: Local payment parameters manually modified to ₦1.00! Testing price exploitation validation.");
});

// Standard user changing amount in mock field
elements.simPaymentAmount.addEventListener('input', (e) => {
    appState.paymentAmountInput = parseFloat(e.target.value) || 0;
    elements.paystackModalAmount.innerText = `₦${appState.paymentAmountInput.toLocaleString()}`;
    
    if (appState.paymentAmountInput !== appState.bookingPriceNaira) {
        appState.isExploitAttempted = true;
    } else {
        appState.isExploitAttempted = false;
    }
});

// Paystack Modal triggers
elements.btnTriggerCheckout.addEventListener('click', () => {
    elements.paystackModal.classList.remove('hidden');
    appendAuditLog("blue", `[PAYSTACK] Initialized secure checkout dialog. Awaiting authorization.`);
});

elements.btnPaystackCancel.addEventListener('click', () => {
    elements.paystackModal.classList.add('hidden');
    appendAuditLog("blue", `[PAYSTACK] Payment authorization cancelled by user.`);
});

// Clear audit logs
elements.btnClearConsole.addEventListener('click', () => {
    elements.consoleLogsDisplay.innerHTML = "";
});

function appendAuditLog(type, text) {
    const line = document.createElement('div');
    line.className = `log-line text-${type}`;
    
    // Add ISO timestamp
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    
    line.innerText = `[${timeStr}] ${text}`;
    elements.consoleLogsDisplay.appendChild(line);
    elements.consoleLogsDisplay.scrollTop = elements.consoleLogsDisplay.scrollHeight;
}

// Mimic Paystack firing Webhook to Deno Serverless Endpoint
elements.btnPaystackSuccessMock.addEventListener('click', async () => {
    elements.paystackModal.classList.add('hidden');
    
    const paidNaira = appState.paymentAmountInput;
    const expectedNaira = appState.bookingPriceNaira;
    const bookingId = "b92a30f1-432e-9df2-bbcc-d30a84f3e9a1"; // Mock ID
    
    appendAuditLog("blue", `[PAYSTACK] Payment authorized. Dispatching HMAC-signed charge.success event webhook to edge function...`);

    // Simulate Serverless API payload processing
    setTimeout(() => {
        appendAuditLog("blue", `📩 Edge function paystack-webhook/index.ts received POST request. Signature validated.`);
        
        // Core Security Logic check mimicking our updated index.ts
        if (paidNaira !== expectedNaira) {
            // Price Exploitation Attempt Caught!
            appendAuditLog("red-alert", `⚠️ SECURITY REJECTION: Price validation failed! Payload Paid: ₦${paidNaira}, DB Expected: ₦${expectedNaira}. Aborting database update.`);
            alert("❌ SECURITY BLOCKED!\nThe server edge function detected that the paid amount does not match the actual database booking price. Status remains 'Pending'. An exploit alert has been logged in the system audits.");
        } else {
            // Successful payment match!
            appendAuditLog("green-success", `✅ Price Verification Successful! Payment match confirmed (₦${paidNaira} matches exactly).`);
            appendAuditLog("green-success", `💾 Admin Client writes escrow update: booking status = 'paid', escrow_status = 'held'`);
            
            // Advance UI State Node
            appState.bookingStatus = "paid";
            elements.nodePending.className = "state-node";
            elements.nodePaid.className = "state-node active";
            
            // Show artisan / client engine controls
            elements.escrowActionsArea.classList.remove('hidden');
            
            // Update Platform stat display
            elements.statEscrowCount.innerText = `₦${expectedNaira.toLocaleString()}`;
        }
    }, 1500);
});

// Artisan logs completion
elements.btnArtisanComplete.addEventListener('click', () => {
    appState.bookingStatus = "completed";
    
    elements.nodePaid.className = "state-node";
    elements.nodeCompleted.className = "state-node active";
    
    elements.btnArtisanComplete.classList.add('hidden');
    elements.btnClientConfirmRelease.classList.remove('hidden');
    elements.btnClientDispute.classList.remove('hidden');
    
    appendAuditLog("blue", `🛠️ Artisan Emeka logs completion. SMS reminder sent to client. Awaiting confirm action (24h window).`);
});

// Client confirms release
elements.btnClientConfirmRelease.addEventListener('click', () => {
    appState.bookingStatus = "released";
    
    elements.nodeCompleted.className = "state-node";
    elements.nodeReleased.className = "state-node active";
    
    elements.escrowActionsArea.classList.add('hidden');
    
    // Calculate Payout details
    const total = appState.bookingPriceNaira;
    const commission = total * 0.1;
    const artisanShare = total - commission;
    
    appendAuditLog("green-success", `🎉 Client confirms completion! Escrow Released successfully.`);
    appendAuditLog("green-success", `💸 Payout processed: ₦${artisanShare.toLocaleString()} dispatched to GTBank account; ₦${commission.toLocaleString()} (10%) commission retained.`);
    
    // Reset platform display counter
    elements.statEscrowCount.innerText = "₦0.00";
});

// Client disputes booking
elements.btnClientDispute.addEventListener('click', () => {
    appState.bookingStatus = "disputed";
    
    elements.nodeCompleted.className = "state-node";
    
    const line = document.createElement('div');
    line.className = "state-node active";
    line.style.borderColor = "#ce3c3e";
    line.style.background = "rgba(206, 60, 62, 0.05)";
    line.innerHTML = `
        <div class="node-icon" style="background:#ce3c3e;"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div class="node-text">
            <h4 style="color:#ce3c3e;">Escrow Locked (Disputed)</h4>
            <p>Admin Dispute Panel has locked funds. Escalated for verification reviews.</p>
        </div>
    `;
    elements.nodeCompleted.after(line);
    elements.escrowActionsArea.classList.add('hidden');
    
    appendAuditLog("red-alert", `🚨 DISPUTE OPENED! Escrow state transition = 'disputed'. Dispute support queue notified.`);
});


// =====================================================================
// Direct Supabase Seeding Sync Functionality
// =====================================================================
elements.btnSeedDatabase.addEventListener('click', async () => {
    elements.btnSeedDatabase.disabled = true;
    elements.seedingLoadingIndicator.classList.remove('hidden');
    
    appendAuditLog("blue", `[SUPABASE] Fetching schema parameters. Connecting to REST API endpoint...`);

    try {
        let successCount = 0;

        // Loop and seed profiles and artisans
        for (const artisan of LAGOS_ARTISANS) {
            // First, upsert the profile info
            const profilePayload = {
                id: artisan.id,
                full_name: artisan.full_name,
                avatar_url: artisan.avatar_url,
                phone_number: "+234" + Math.floor(1000000000 + Math.random() * 9000000000),
                role: "artisan",
                email: artisan.full_name.toLowerCase().replace(/\s/g, "") + "@myfix.ng"
            };

            const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${artisan.id}`, {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                    "Content-Type": "application/json",
                    "Prefer": "resolution=merge-duplicates"
                },
                body: JSON.stringify(profilePayload)
            });

            if (!profileRes.ok) {
                const errText = await profileRes.text();
                throw new Error(`Profile insert failure: ${errText}`);
            }

            // Next, upsert the artisan credentials with PostGIS Point format
            // PostGIS Point representation: POINT(lng lat)
            const artisanPayload = {
                id: artisan.id,
                trade_category: artisan.trade_category,
                badge: artisan.badge,
                nin_verified: artisan.nin_verified,
                bvn_verified: artisan.bvn_verified,
                background_checked: artisan.background_checked,
                base_callout_fee: artisan.base_callout_fee,
                service_areas: artisan.service_areas,
                location_coords: `POINT(${artisan.lng} ${artisan.lat})`,
                about_text: artisan.about_text,
                portfolio_urls: artisan.portfolio_urls || [],
                rating_avg: artisan.rating_avg,
                jobs_completed: artisan.jobs_completed
            };

            const artisanRes = await fetch(`${SUPABASE_URL}/rest/v1/artisans?id=eq.${artisan.id}`, {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                    "Content-Type": "application/json",
                    "Prefer": "resolution=merge-duplicates"
                },
                body: JSON.stringify(artisanPayload)
            });

            if (!artisanRes.ok) {
                const errText = await artisanRes.text();
                throw new Error(`Artisan insert failure: ${errText}`);
            }

            successCount++;
            appendAuditLog("green-success", `[SUPABASE] Successfully synchronized: ${artisan.full_name} (${artisan.trade_category[0]})`);
        }

        appendAuditLog("green-success", `🎉 Database Seeding Complete! ${successCount} artisan profile pairs successfully written.`);
        alert(`🎉 Database Synced Successfully!\n${successCount} highly-detailed artisans have been written to the tables. You can now run proximity PostGIS spatial matching queries directly against the remote PostgreSQL engine!`);

    } catch (err) {
        console.error("Supabase seeding failure:", err);
        appendAuditLog("red-alert", `❌ Database Seeding Failed: ${err.message}`);
        alert(`❌ Seeding Failed!\nError details: ${err.message}\nMake sure your Supabase project is active and migrations are applied.`);
    } finally {
        elements.btnSeedDatabase.disabled = false;
        elements.seedingLoadingIndicator.classList.add('hidden');
    }
});

// Initialise App Discovery View
renderArtisanCards();
