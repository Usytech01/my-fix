My_Fix
YOUR TRUSTED HOME FIX
Lagos Home Services Marketplace
PRODUCT REQUIREMENTS DOCUMENT
Version 1.0
May 2026
Document Status
Draft — Pending Stakeholder Review
Product Owner
TBD
Target Launch
Q1 2027
Prepared By
Product Team
Last Updated
May 23, 2026
CONFIDENTIAL — FOR INTERNAL USE ONLY
1. Executive Summary
My_Fix is a mobile-first, two-sided marketplace designed to formalize and digitize the home services industry in Lagos, Nigeria. The platform connects verified, skilled artisans (plumbers, electricians, tilers, tailors, and more) with homeowners and tenants who need reliable, trustworthy, and fairly-priced services.
By combining identity verification, escrow payments, and a transparent rating ecosystem, My_Fix addresses the critical failure points of the current informal market: trust deficits, opaque pricing, and discovery friction.
Strategic Goal
My_Fix aims to become the #1 trusted platform for home services across all Lagos Local Government Areas (LGAs) within 24 months of launch, targeting 50,000 active users and 5,000 verified artisans in Year 1.
2. Problem Statement
Lagos represents one of Africa's largest urban economies, yet its home services sector remains almost entirely informal and fragmented. Residents are forced to rely on word-of-mouth referrals — a system that is geographically limited, inconsistent, and increasingly inadequate for a rapidly growing metropolitan population of over 20 million people.
2.1  Key Market Challenges
Challenge
Impact on Residents
Impact on Artisans
Trust Deficit
Fear of inviting unverified strangers into the home; security risks.
Difficulty building reputation beyond immediate social circle.
Lack of Accountability
No formal recourse when work is substandard or incomplete.
Unfair accusations with no neutral arbitration mechanism.
Pricing Inconsistency
Susceptibility to price gouging; no market benchmarks.
Undercharging due to lack of market visibility.
Discovery Friction
Time-consuming search process; heavy reliance on phone chains.
Feast-or-famine workflow; no steady inbound lead source.
Payment Risk
Cash payments with no consumer protection or receipts.
Late or partial payments; no enforcement mechanism.
3. Objectives & Success Metrics
3.1  Product Objectives
Build a trustworthy, verified artisan marketplace that eliminates the discovery friction in Lagos home services.
Create a secure payment infrastructure that protects both clients and artisans.
Establish Lagos as the launch market before expanding to Abuja, Port Harcourt, and other Nigerian cities.
Comply fully with the Nigeria Data Protection Regulation (NDPR) from Day 1.
3.2  Key Performance Indicators (KPIs)
Metric
Year 1 Target
Year 2 Target
Registered Clients
50,000
200,000
Verified Artisans on Platform
5,000
20,000
Completed Bookings (Monthly)
10,000
60,000
Average App Store Rating
>= 4.2 stars
>= 4.5 stars
Booking-to-Completion Rate
>= 80%
>= 90%
Dispute Resolution Time
< 48 hours
< 24 hours
Platform Uptime
99.9%
99.95%
NPS Score
>= 40
>= 55
4. Target Users
4.1  User Persona A — The Busy Lagos Professional (Client)
Name
Chidinma, 34
Location
Lekki Phase 1, Lagos
Occupation
Mid-level finance executive; hybrid work schedule
Goals
Fast, reliable home repairs with zero security concerns. Transparent pricing upfront.
Pain Points
Unreliable referrals; fear of inviting strangers home; no-show artisans; surprise costs after job completion.
Tech Profile
Smartphone-first; uses fintech apps (Opay, Kuda); comfortable with app-based payments.
Quote
"I just want someone I can trust to fix my plumbing without me having to stand over them the whole time."
4.2  User Persona B — The Skilled Artisan
Name
Emeka, 28
Location
Surulere, Lagos
Trade
Certified electrician; 5 years of experience
Goals
Steady flow of quality jobs; ability to build a digital reputation; reliable and on-time payment.
Pain Points
Inconsistent work; clients who delay or refuse to pay; inability to prove skills to new customers.
Tech Profile
Uses WhatsApp heavily; basic smartphone experience; comfortable with USSD payments.
Quote
"I know I do good work, but customers don't trust me because they don't know me."
5. Core Features
5.1  Identity & Credibility Verification
Every artisan on the platform must complete a multi-step verification process before their profile is made discoverable. This is the cornerstone of trust on My_Fix.
NIN (National Identification Number) integration via the NIMC API for real-time identity verification.
BVN (Bank Verification Number) cross-check to validate financial identity and reduce fraud.
Manual background check partnership with an accredited Nigerian security verification firm.
Trade certification upload (e.g., City & Guilds, NABTEB) reviewed by platform moderators.
Issuance of a tiered "Verified Professional" badge (Bronze, Silver, Gold) based on verification completeness and platform history.
Profile re-verification required every 12 months to maintain badge status.
5.2  Service Marketplace
A browsable directory of artisan categories, optimized for fast, location-aware discovery.
Initial service categories: Plumbing, Electrical, Tiling, Bricklaying, Painting, Carpentry, AC Repair, Generator Repair, Interior Design, Tailoring, and Laundry.
Location-based search with geo-tagging of artisans to specific Lagos neighborhoods and LGAs (e.g., Surulere, Ikeja, Victoria Island, Alimosho).
Advanced filters: availability, minimum rating, price range, verification tier, and response time.
Smart matching algorithm that surfaces artisans based on proximity, rating, and past completion rate.
"Emergency Services" quick-access category for urgent repairs (plumbing bursts, electrical faults), with a guaranteed 2-hour response SLA for premium artisans.
5.3  Booking & Scheduling System
A streamlined in-app booking flow that confirms availability and sets clear expectations for both parties.
Artisans manage their own real-time availability calendar within the app.
Clients can book immediately (for available slots) or schedule up to 30 days in advance.
Automated SMS and in-app push notifications for booking confirmation, 24-hour reminders, and same-day reminders.
Job description form with optional photo/video upload for clients to document the issue.
Artisan can accept, counter-propose a time, or decline a booking with a mandatory reason code.
Cancellation policy: free cancellation up to 4 hours before the appointment; late cancellations incur a fee to protect artisan income.
5.4  Rating & Review System
A verified, post-completion review system that builds a reliable reputation layer for the Lagos artisan market.
Reviews can only be submitted after a booking is marked "Completed" by both parties — preventing fake or incentivized reviews.
Clients rate artisans across five dimensions: Quality of Work, Punctuality, Professionalism, Value for Money, and Cleanliness.
Artisans can rate clients on: Payment Timeliness, Clear Communication, and Respectful Conduct — creating mutual accountability.
Review window: 72 hours after job completion. After that, the booking is archived.
Platform moderation team reviews flagged reviews within 24 hours.
Public display of aggregate ratings, number of completed jobs, and a select sample of recent reviews on artisan profile pages.
5.5  Escrow-Style Payment System
A secure, platform-mediated payment flow that eliminates cash-handling risk and protects both client and artisan.
Client pays the agreed service fee into a secure escrow account at the time of booking confirmation.
Funds are held by the platform and are not accessible to the artisan until job completion is confirmed.
Upon client confirmation of job completion, funds are released to the artisan within 2 business hours.
Dispute window: if the client raises a dispute within 24 hours of the artisan logging completion, funds are held while the dispute team investigates.
Supported payment methods: Paystack integration (debit cards, bank transfer, USSD), wallet top-up, and PayWithBank.
Artisan payout to any Nigerian bank account, with options for instant or next-day settlement.
Platform commission: 10-15% of service value, deducted at the point of payout.
5.6  Artisan Portfolio & Profile
A rich, multimedia artisan profile that serves as a digital business card and builds pre-engagement trust.
Photo gallery: artisans can upload before-and-after images of completed projects.
Video intro: a 60-second self-introduction video to humanize the profile.
Service description: artisan-authored summary of specializations, tools owned, and service areas.
Badges displayed prominently: Verification tier, "Top Rated" (>= 4.8 rating with 50+ reviews), "Returning Professional" (repeat booking rate > 60%).
Transparent pricing: artisans set a base call-out fee and indicative hourly rates; final pricing agreed upon in-app before booking is confirmed.
6. User Flows
6.1  Client Booking Flow
Onboarding: Client downloads app and registers with phone number (OTP verified) or email. Optional Google/Apple SSO. Profile setup includes name, photo, and home neighborhood.
Search: Client selects a service category (e.g., "Plumber") from the home screen and enters or confirms their neighborhood (e.g., "Surulere"). The app uses device GPS if location permission is granted.
Browse & Select: Client reviews a list of available verified artisans sorted by proximity and rating. Each card shows: name, photo, badge tier, aggregate rating, number of completed jobs, and indicative pricing.
Profile Review: Client taps on an artisan to view full profile, portfolio gallery, and detailed reviews.
Booking: Client selects date/time from artisan's live availability calendar, writes a job description, and optionally uploads photos. Client reviews the base pricing and confirms.
Payment: Client pays the quoted amount into escrow. Booking is confirmed and both parties receive notifications.
Execution: Artisan arrives, performs work. Both can communicate via in-app chat. Artisan logs "Job Complete" when finished.
Confirmation & Review: Client confirms completion within the app, triggering fund release. Client is prompted to leave a rated review (within 72-hour window).
6.2  Artisan Onboarding Flow
Registration: Artisan downloads app, registers with phone number (OTP verified). Selects trade category/categories.
Identity Verification: Artisan submits NIN, uploads a clear photo of their government ID and a live selfie for facial recognition matching.
Background Check Consent: Artisan signs digital consent and the platform initiates a background check (48-72 hour turnaround).
Bank Details: Artisan provides bank account number for payouts. BVN validation is performed automatically.
Profile Build: Artisan uploads portfolio photos/video, writes service description, sets service areas and pricing.
Go Live: Upon successful verification, profile is made discoverable. Artisan receives an in-app tutorial on managing bookings.
7. Non-Functional Requirements
7.1  Reliability
Platform target uptime: 99.9% (equates to < 8.76 hours of downtime per year).
Emergency Services category must maintain a higher SLA: 99.95% during peak hours (6 AM – 10 PM WAT).
Implement automated health checks and circuit breakers to isolate failing microservices.
Active-active multi-region deployment on AWS (Lagos primary + Cape Town failover).
7.2  Security
AES-256 encryption at rest for all personally identifiable information (PII) including NIN, BVN, and payment details.
TLS 1.3 for all data in transit.
Sensitive verification documents (ID scans, selfies) stored in encrypted, access-controlled blob storage with no public URLs.
OAuth 2.0 / JWT-based session management with token refresh and forced re-authentication after 7 days.
PCI-DSS compliance for all payment flows, handled via Paystack's certified gateway.
Regular penetration testing (minimum quarterly) by an independent security firm.
7.3  Performance
App initial load time: < 3 seconds on a 3G connection (targeting low-to-medium bandwidth environments across Lagos LGAs).
Search results returned in < 1.5 seconds for any Lagos neighborhood query.
Image assets served via a CDN with WebP format and lazy loading to minimize data consumption.
Offline mode: cached artisan profiles and active booking details accessible without network connection.
7.4  Scalability
Microservices architecture to allow independent scaling of high-load services (search, payments, notifications).
Database: PostgreSQL with read replicas for query-heavy operations; Redis for session and search caching.
Horizontal auto-scaling configured to handle 10x normal load during peak periods (public holidays, end-of-month).
Architecture must support expansion to additional Nigerian cities (Abuja, PH, Ibadan) without core redesign.
7.5  Legal & Compliance
Full alignment with the Nigeria Data Protection Regulation (NDPR) 2019, including a clear, plain-language Privacy Policy and data subject rights (access, deletion, portability).
A designated Data Protection Officer (DPO) must be appointed before launch.
Artisan NIN and BVN data processed in compliance with NIMC and CBN data handling guidelines.
Payment flows registered with the Central Bank of Nigeria (CBN) as required for payment service operations.
Terms of Service reviewed by a Nigerian legal counsel before launch.
8. Technical Architecture Overview
The following summarizes the recommended technical stack. Final technology decisions are subject to engineering team validation.
Layer
Component
Recommended Technology
Mobile
iOS & Android Apps
React Native (shared codebase)
API Gateway
Routing, Auth, Rate Limiting
AWS API Gateway + WAF
Backend
Business Logic Services
Node.js (Express) microservices
Database
Primary Data Store
PostgreSQL (RDS) with read replicas
Cache
Search & Session Cache
Redis (ElastiCache)
Search
Geo Search Index
Elasticsearch / OpenSearch
Payments
Payment Processing
Paystack (PCI-DSS certified)
Identity
NIN Verification
NIMC API integration
Storage
Media & Documents
AWS S3 (encrypted, private)
CDN
Asset Delivery
CloudFront
Messaging
Push & SMS Notifications
Firebase Cloud Messaging + Termii
Monitoring
Observability
Datadog / AWS CloudWatch
9. Assumptions & Constraints
9.1  Assumptions
The NIMC API will be accessible with acceptable rate limits for real-time NIN verification.
Paystack will remain the primary payment gateway; terms and commission structures will not change materially before launch.
A sufficient pool of artisans in Lagos is willing to undergo formal verification in exchange for market access.
Smartphone penetration in the target user base is sufficient to support an app-first strategy.
9.2  Constraints
NDPR compliance is mandatory and non-negotiable; no data can be sent to servers outside Nigeria without explicit user consent.
Budget and timeline constraints require a phased feature rollout — MVP must be lean.
Background check turnaround time (48-72 hours) creates a delay between artisan sign-up and going live.
Low-literacy users among the artisan population may require additional onboarding support and simplified UX.
10. MVP Scope & Phased Roadmap
Phase
Timeline
Key Deliverables
Phase 1 — MVP
Months 1–4
NIN verification, 5 service categories, search & booking, escrow payments (Paystack), ratings & reviews, artisan portfolio.
Phase 2 — Growth
Months 5–8
Emergency Services category, in-app chat, artisan analytics dashboard, repeat-booking feature, client loyalty program.
Phase 3 — Scale
Months 9–14
Expand to 15+ categories, corporate/B2B accounts, artisan training & certification partnerships, expansion to Abuja.
Phase 4 — Platform
Months 15–24
Open API for third-party integrations, artisan insurance product, predictive maintenance scheduling, Pan-Nigeria expansion.
11. Risks & Mitigations
Risk
Likelihood
Mitigation Strategy
Low artisan adoption of formal verification
Medium
Offer incentives: priority placement, first-month commission waiver, co-branded marketing.
NIN API downtime blocking artisan onboarding
Medium
Implement manual verification fallback with human review queue.
High dispute rate inflating operations cost
Medium
Invest in clear job-description UX; introduce AI-assisted dispute pre-screening.
Payment fraud or chargeback abuse by clients
Low
Implement velocity checks; require BVN for clients making high-value bookings.
Competitor launch (local or international)
Medium
Focus on trust and community; build switching costs through review history and loyalty rewards.
Regulatory change (NDPR, CBN payment guidelines)
Low
Retain Nigerian legal counsel on retainer; appoint DPO; monitor NITDA communications.
12. Open Questions
What is the exact commission structure and will it vary by service category or booking size?
Will background checks be done in-house or outsourced to a third party (e.g., Youverify, Smile Identity)? What is the cost per check?
Should there be a waitlist or referral-only period for artisan sign-ups to control quality at launch?
How will pricing disputes be handled — will the platform publish suggested price bands per category?
What is the plan for artisans who fail the background check? Is there an appeal mechanism?
Will the platform support informal artisans without trade certifications, at a lower badge tier?
13. Document Approvals
Role
Name
Signature
Date
Product Owner
Engineering Lead
Design Lead
Legal Counsel
CEO / Sponsor
Document Control
This document is version-controlled. Any changes must be tracked with a new version number, summary of changes, and re-approval by all signatories listed above.
