# Haat: Software Requirements Specification

| Item | Detail |
|---|---|
| Product | Haat, a hand-made crafts bazaar (web) |
| Version | 1.0 (training build) |
| Document owner | Product and QA team |
| Audience | QA trainees, testers, developers |
| Status | Baselined for the QA practical |

---

## 1. Project overview

Haat is an online marketplace for hand-made Indian crafts. Signed-in buyers can browse 14 products from named craft clusters, search, filter and sort them, add pieces to a basket, apply a coupon, and place an order with cash on delivery, UPI or card. They can also see their past orders.

The application runs in the browser. It has no server, and all data is kept in the browser's storage (`localStorage` / `sessionStorage`).

This document describes the **correct expected behaviour** of the system. Any behaviour that differs from it is a defect.

## 2. Scope

### 2.1 In scope
| Module | Pages |
|---|---|
| Authentication | `login.html` (login, captcha, remember me, forgot password, register info, lockout) |
| Session | Guarding of protected pages, logout |
| Product catalogue | `products.html` (listing, search, category filter, sort, quick view, add to basket) |
| Basket | `cart.html` (quantities, remove, coupons, free-delivery meter, totals) |
| Checkout | `checkout.html` (delivery form, payment method, order summary, place order, confirmation) |
| Order history | `orders.html` (orders placed by the signed-in user) |

### 2.2 Out of scope
- Real payment processing, payment gateways, OTP and UPI verification
- Real registration and password-reset emails (the screens only show messages)
- Admin or seller back-office, inventory management screens
- Order cancellation, returns, tracking
- Server-side security (the app is client-side only)

## 3. User roles

| Role | Description | Access |
|---|---|---|
| Guest | Not signed in | Login page only. Any protected page redirects to login. |
| Buyer (active) | Signed-in active account | Products, basket, checkout, orders |
| Buyer (inactive) | Account exists but is disabled | Cannot sign in and sees the "inactive" message |

The demo accounts are listed in `TEST_DATA.md`.

---

## 4. Functional requirements

### 4.1 Login (LOGIN)

| ID | Requirement |
|---|---|
| REQ-LOGIN-001 | The login page shows: Email field, Password field with a Show/Hide toggle, a Captcha image with a refresh button and an input box, a "Remember me" checkbox, a Log in button, a "Forgot password?" link and a "Create an account" link. |
| REQ-LOGIN-002 | Email is mandatory, must be a valid email address (`local-part@domain.tld`, the domain must include at least one dot and a top-level domain of 2 or more letters), and must be at most 50 characters. Leading and trailing spaces are ignored. |
| REQ-LOGIN-003 | Password is mandatory and must be **8 to 20 characters** long. It must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit and 1 special character. A password that breaks these rules must be rejected with the inline message **before** any sign-in attempt is made, and it must **not** count as a failed login attempt. |
| REQ-LOGIN-004 | The Show/Hide toggle switches the password between masked and plain text. The button label changes between "Show" and "Hide". |
| REQ-LOGIN-005 | The captcha is a 6-character image made of letters (upper and lower case) and digits. The captcha input is mandatory and the comparison is **case-sensitive**. `aB3xYz` is not the same as `AB3XYZ`. |
| REQ-LOGIN-006 | Clicking the captcha refresh button shows a new captcha **and clears the captcha input field**. |
| REQ-LOGIN-007 | After any failed attempt (wrong captcha, wrong credentials, locked or inactive account), a new captcha is generated and the captcha input is cleared. |
| REQ-LOGIN-008 | An account is **locked for 5 minutes after 3 consecutive failed password attempts**. After each failure the message shows the number of attempts left (2, then 1). The 3rd consecutive failure locks the account at once. While locked, even the correct password is refused with the lock message and remaining time. A successful login resets the counter. |
| REQ-LOGIN-009 | An inactive account with correct credentials is refused with "This account is inactive. Please contact support@haat.in." |
| REQ-LOGIN-010 | On success, a green success message is shown and the user is taken to `products.html` within about 1 second. If the user was sent to login from a protected page, they return to that page. |
| REQ-LOGIN-011 | **Remember me.** If ticked, the session survives closing the browser and the email is pre-filled on the next visit to the login page, with the box already ticked. If unticked, the session ends when the browser or tab is closed. |
| REQ-LOGIN-012 | "Forgot password?" opens a dialog with an email field. A valid email shows "If an account exists for <email>, a reset link is on its way." An invalid email shows the email validation message. |
| REQ-LOGIN-013 | "Create an account" opens a dialog explaining that sign-ups are not open yet. |
| REQ-LOGIN-014 | Keyboard focus order follows the visual order: Email → Password → Show/Hide → Captcha refresh → Captcha input → Remember me → Forgot password → Log in → Create an account. |

### 4.2 Session (SESSION)

| ID | Requirement |
|---|---|
| REQ-SESSION-001 | `products.html`, `cart.html`, `checkout.html` and `orders.html` require a signed-in user. Opening them directly without a session redirects to `login.html`. |
| REQ-SESSION-002 | "Log out" ends the session **completely**, whether or not Remember me was used, and redirects to the login page with "You have been logged out safely." After logout, opening any protected page directly (or using the browser Back button) must redirect to login. |
| REQ-SESSION-003 | The header shows "Namaste, <first name>", links to Shop, Basket (with item count badge) and Orders, and a Log out button. |

### 4.3 Product catalogue (PROD)

| ID | Requirement |
|---|---|
| REQ-PROD-001 | The listing shows 14 products. Each card shows an image, category, name, craft region, stock status, rating with review count, selling price, the MRP struck through and the discount % (when discounted), and an "Add to basket" button. |
| REQ-PROD-002 | **Search** filters as you type on product name and category. It is **case-insensitive** and matches partial words (`diya`, `DIYA` and `Diya` all find "Brass Diya Lamp (Pair)"). |
| REQ-PROD-003 | **Category filter** chips: All, Art, Home Decor, Kitchen, Textiles, Toys. Search and category work together. |
| REQ-PROD-004 | **Sort** options: Featured (default), Price: Low to High, Price: High to Low, Name: A to Z. Price sorting uses the **selling price** (the price after discount that is shown in bold on the card). |
| REQ-PROD-005 | A product with stock 0 shows "Out of stock", its button reads "Sold out" and is disabled. It must not be possible to add an out-of-stock product from **any** entry point, including Quick view. |
| REQ-PROD-006 | Stock status: stock ≤ 0 shows "Out of stock", stock 1 to 5 shows "Only N left", and otherwise "In stock: N". |
| REQ-PROD-007 | "Add to basket" adds 1 unit, or adds 1 more if the item is already in the basket. The quantity of one item can never exceed **min(stock, 10)**. Reaching the limit shows an error toast and does not change the basket. |
| REQ-PROD-008 | "Quick view" opens a dialog with a larger image, description, price, stock and an "Add to basket" button. The button follows the same rules as REQ-PROD-005 and REQ-PROD-007. |
| REQ-PROD-009 | "Festive offer" products show the selling price printed on the card. The discount shown is **already included** in that price and must be applied only once anywhere in the app. |
| REQ-PROD-010 | When nothing matches, show "Nothing matches that search." with a "Clear filters" button. |

### 4.4 Basket (CART)

| ID | Requirement |
|---|---|
| REQ-CART-001 | Each basket line shows image, name, region, unit selling price (with MRP struck through if discounted), a quantity stepper (−, input, +), the **item total** and a Remove button. |
| REQ-CART-002 | Quantity minimum is 1 ("−" is disabled at 1). Maximum is **min(stock, 10)** ("+" is disabled at the maximum). |
| REQ-CART-003 | The quantity can also be typed. Values under 1 or not numeric become 1. Values over the maximum become the maximum and show a toast. The typed value is **saved immediately**, just like +/−. |
| REQ-CART-004 | Remove deletes **exactly the line it belongs to** and shows a toast naming the removed product. |
| REQ-CART-005 | The basket (items, quantities, applied coupon) **persists after page refresh** and between pages, for every way of changing it. |
| REQ-CART-006 | An empty basket shows "Your basket is empty." with a "Browse the haat" button. The summary is hidden. |
| REQ-CART-007 | Coupon codes are entered in a text box and applied with "Apply". Codes are matched case-insensitively (`save10` = `SAVE10`). Messages: empty code, invalid code, expired code, below minimum order, already applied (see §7). |
| REQ-CART-008 | **Only one coupon can be active at a time.** Applying a second coupon while one is active must be refused with "Only one coupon can be applied at a time. Remove <CODE> first." |
| REQ-CART-009 | The **minimum order value** of a coupon is checked against the **Subtotal** (the sum of item totals after product discounts), not against MRP. |
| REQ-CART-010 | An **expired** coupon must be rejected with "This coupon has expired." however it is typed (upper, lower or mixed case). |
| REQ-CART-011 | If the basket changes so that the Subtotal falls below the active coupon's minimum, the coupon is removed automatically and a toast explains why. |
| REQ-CART-012 | Applied coupons appear as a chip with a × button that removes them. |
| REQ-CART-013 | The free-delivery meter shows "Add ₹X more for free delivery" while the amount after coupon is below ₹500, and "You have unlocked free delivery" at ₹500 or more. |
| REQ-CART-014 | The summary shows Subtotal (item count), Coupon discount, GST (18%), Shipping ("FREE" or the amount) and Grand total, calculated as in §6. |
| REQ-CART-015 | The header badge always equals the total quantity in the basket. |

### 4.5 Checkout (CHK)

| ID | Requirement |
|---|---|
| REQ-CHK-001 | Checkout shows a delivery form (§5), a payment method choice (Cash on delivery / UPI / Card) and an order summary identical to the basket summary (same items, quantities and amounts). |
| REQ-CHK-002 | Every field is validated when it loses focus and again on "Place order". The first invalid field receives focus. |
| REQ-CHK-003 | If the basket is empty, checkout shows "There is nothing to check out." with a link to the shop. |
| REQ-CHK-004 | On a valid "Place order", the button immediately shows a loading state ("Placing order…") **and is disabled** until processing ends. Only **one** order may be created per click sequence (no double submit). |
| REQ-CHK-005 | The confirmation shows: a thank-you heading, a unique Order ID (`HTyymmdd-NNNN`), payment method, an item table (item, qty, price, total), Subtotal, Coupon discount, GST, Shipping, **Total paid** and the delivery address. **Total paid must equal the Grand total shown in the basket and checkout summary.** |
| REQ-CHK-006 | After a successful order, the basket and applied coupon are cleared and the header badge shows 0. |
| REQ-CHK-007 | After a successful order, the stock of each purchased product goes down by the **quantity purchased**. |
| REQ-CHK-008 | The email field is pre-filled with the signed-in user's email and can be edited. |

### 4.6 Order history (ORD)

| ID | Requirement |
|---|---|
| REQ-ORD-001 | `orders.html` lists the signed-in user's orders, newest first, each with Order ID, date and time, payment method, status "Confirmed", item thumbnails, item names × qty, item count and the amount paid. |
| REQ-ORD-002 | With no orders, show "No orders yet." with a "Start shopping" button. |

---

## 5. Validation rules

| Screen | Field | Type | Min | Max | Mandatory | Format / rule |
|---|---|---|---|---|---|---|
| Login | Email | email | n/a | 50 chars | Yes | `local@domain.tld`, no spaces, domain has a dot and a TLD of 2+ letters |
| Login | Password | password | 8 chars | 20 chars | Yes | ≥1 uppercase, ≥1 lowercase, ≥1 digit, ≥1 special character |
| Login | Captcha | text | 6 chars | 6 chars | Yes | Exact, case-sensitive match of the image |
| Forgot password | Email | email | n/a | 50 chars | Yes | Same as the Login email |
| Basket | Coupon code | text | n/a | n/a | Yes (to apply) | One of the defined codes, case-insensitive |
| Basket | Quantity | number | 1 | min(stock, 10) | Yes | Whole number |
| Checkout | Full name | text | 3 chars | 50 chars | Yes | Letters and spaces only. Must contain at least 3 letters (spaces-only input is invalid). Leading and trailing spaces are ignored. |
| Checkout | Mobile number | tel | 10 digits | 10 digits | Yes | Digits 0 to 9 only, exactly 10 |
| Checkout | Email | email | n/a | 50 chars | Yes | Same as the Login email (no spaces allowed) |
| Checkout | Delivery address | textarea | 10 chars | 200 chars | Yes | Any characters. Trimmed length is counted. |
| Checkout | Pincode | text | 6 digits | 6 digits | Yes | Digits only, exactly 6 |
| Checkout | Payment method | radio | n/a | n/a | Yes | Cash on Delivery / UPI / Card |

---

## 6. Business and calculation rules

| ID | Rule |
|---|---|
| REQ-CALC-001 | **Unit selling price** = MRP − (MRP × discount% ÷ 100), rounded to 2 decimals. For festive-offer products the printed offer price **is** the unit selling price (the discount is not applied again). |
| REQ-CALC-002 | **Item total** = unit selling price × quantity, rounded **half-up** to 2 decimals (for example ₹636.65 × 3 = ₹1,909.95). |
| REQ-CALC-003 | **Subtotal** = sum of item totals. |
| REQ-CALC-004 | **Coupons.** Only one at a time. **SAVE10** = 10% of Subtotal (rounded to 2 decimals), valid when Subtotal ≥ ₹1,000. **FLAT200** = ₹200 off, valid when Subtotal ≥ ₹1,500. **EXPIRED50** expired on 31-Dec-2025 and must always be rejected. |
| REQ-CALC-005 | **Amount after discount** = Subtotal − Coupon discount. |
| REQ-CALC-006 | **GST** = 18% of (Subtotal − Coupon discount), rounded to 2 decimals. |
| REQ-CALC-007 | **Shipping** = ₹50 if the amount after discount is **below ₹500**, otherwise FREE. Exactly ₹500.00 means FREE. |
| REQ-CALC-008 | **Grand total** = Subtotal − Coupon + GST + Shipping, rounded to 2 decimals. |
| REQ-CALC-009 | All amounts are shown in Indian Rupees with 2 decimals and Indian digit grouping (₹1,23,456.00). |

### 6.1 Worked example

Basket: Kanjeevaram Silk Stole × 1 (festive offer ₹2,040.00) + Channapatna Toy Train × 2 (₹560 − 40% = ₹336.00). Coupon: SAVE10.

| Step | Calculation | Amount |
|---|---|---|
| Item total: Stole | 2,040.00 × 1 | ₹2,040.00 |
| Item total: Train | 336.00 × 2 | ₹672.00 |
| Subtotal | 2,040.00 + 672.00 | ₹2,712.00 |
| SAVE10 eligibility | 2,712.00 ≥ 1,000 | Eligible |
| Coupon discount | 10% × 2,712.00 | ₹271.20 |
| Amount after discount | 2,712.00 − 271.20 | ₹2,440.80 |
| GST 18% | 18% × 2,440.80 = 439.344 | ₹439.34 |
| Shipping | 2,440.80 ≥ 500 | FREE |
| **Grand total** | 2,440.80 + 439.34 + 0 | **₹2,880.14** |

More ready-made scenarios are in `TEST_DATA.md`.

---

## 7. Message catalogue

| Code | Where | Message |
|---|---|---|
| MSG-01 | Login, email empty | Email is required. |
| MSG-02 | Login, email too long | Email must not exceed 50 characters. |
| MSG-03 | Login, email bad format | Enter a valid email address (e.g. name@example.com). |
| MSG-04 | Login, password empty | Password is required. |
| MSG-05 | Login, password length | Password must be 8 to 20 characters long. |
| MSG-06 | Login, password complexity | Password must contain an uppercase letter, a lowercase letter, a number and a special character. |
| MSG-07 | Login, captcha empty | Enter the characters shown in the captcha. |
| MSG-08 | Login, captcha wrong | Captcha does not match. A new captcha has been generated. |
| MSG-09 | Login, wrong credentials | Invalid email or password. N attempt(s) left before your account is locked. (Unknown email: "Invalid email or password.") |
| MSG-10 | Login, locked | Account locked after too many failed attempts. Try again in m:ss minutes. |
| MSG-11 | Login, inactive | This account is inactive. Please contact support@haat.in. |
| MSG-12 | Login, success | Login successful. Welcome back, <Name>! Taking you to the haat… |
| MSG-13 | Login, after logout | You have been logged out safely. |
| MSG-14 | Login, redirected by guard | Please log in to continue. |
| MSG-15 | Coupon empty | Please enter a coupon code. |
| MSG-16 | Coupon unknown | Invalid coupon code. |
| MSG-17 | Coupon expired | This coupon has expired. |
| MSG-18 | Coupon below minimum | Add items worth ₹X more to use CODE (minimum order ₹Y). |
| MSG-19 | Coupon repeated | This coupon is already applied. |
| MSG-20 | Second coupon | Only one coupon can be applied at a time. Remove CODE first. |
| MSG-21 | Coupon success | CODE applied. |
| MSG-22 | Quantity limit | You can buy at most N of this item. / Only N of <product> in stock. |
| MSG-23 | Checkout name | Full name is required. / Name should be 3 to 50 letters and spaces only. |
| MSG-24 | Checkout mobile | Mobile number is required. / Enter a valid 10-digit mobile number. |
| MSG-25 | Checkout email | Email is required. / Email must not exceed 50 characters. / Enter a valid email address. |
| MSG-26 | Checkout address | Delivery address is required. / Address should be at least 10 characters. / Address must not exceed 200 characters. |
| MSG-27 | Checkout pincode | Pincode is required. / Enter a valid 6-digit pincode. |
| MSG-28 | Checkout payment | Choose a payment method. |

---

## 8. UI / UX expectations

| ID | Expectation |
|---|---|
| REQ-UI-001 | The layout adapts to desktop (≥ 981 px), tablet (481 to 980 px) and mobile (320 to 480 px). **No element may overflow its container or the screen, and there must be no horizontal scrolling at any width from 320 px up.** |
| REQ-UI-002 | Inline error messages appear **below** their field in red. They must never cover the field or its content. Invalid fields get a red border. |
| REQ-UI-003 | All text meets WCAG 2.1 AA contrast: **at least 4.5:1** for normal text and 3:1 for large text. |
| REQ-UI-004 | Keyboard focus order matches the visual reading order on every page, and focus is always visible. |
| REQ-UI-005 | Every input has a visible label. Placeholders are hints only. |
| REQ-UI-006 | Any action that takes time (login redirect, placing an order) shows a loading state and prevents repeat clicks. |
| REQ-UI-007 | Typography is consistent: serif for headings, sans-serif for body and controls. |
| REQ-UI-008 | Toast notifications confirm add, remove, coupon removal and limit messages, and disappear after about 3 seconds. |
| REQ-UI-009 | Dialogs close with the × button, the Esc key or a click outside. |

## 9. Browser and device support

| Browser | Versions |
|---|---|
| Google Chrome | Latest 2 (desktop and Android) |
| Mozilla Firefox | Latest 2 |
| Microsoft Edge | Latest 2 |
| Safari | Latest 2 (macOS and iOS) |

Reference devices: 1366×768 laptop, 1920×1080 desktop, iPad (768×1024), iPhone 12/13/14 (390×844), small Android (360×740), and a 320 px width check.

## 10. Assumptions and constraints

1. The app is static (HTML, CSS, vanilla JavaScript) and is hosted on GitHub Pages or opened locally.
2. All data (session, basket, coupons, stock, orders, login attempts) lives in the browser's storage. Clearing site data resets the app.
3. Basket, coupon and orders are stored per user on the same browser.
4. Prices include no hidden charges other than GST and shipping as defined in §6.
5. The system date is used to check coupon expiry.
6. Product stock starts at the values in the catalogue and is shared by all users on the same browser.

## 11. Out of scope (repeated for clarity)

Real payments, real email and SMS, registration, password change, admin screens, order cancellation and returns, multi-currency, localisation, and security testing beyond the listed login rules.
