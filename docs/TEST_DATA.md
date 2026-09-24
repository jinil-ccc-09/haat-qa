# Haat: Test Data

Use this data together with `REQUIREMENT_DOCUMENT.md`. All expected results below are the **correct** results per the requirements.

> **Reset tip:** to start clean, open DevTools → Application → Storage → **Clear site data** (or run `localStorage.clear(); sessionStorage.clear()` in the Console) and reload.

---

## 1. User accounts

| # | Email | Password | Name | Status | Expected on login |
|---|---|---|---|---|---|
| U1 | `asha@haat.in` | `Asha@1234` | Asha Verma | Active | Success, redirect to Products |
| U2 | `ravi@haat.in` | `Ravi#2026` | Ravi Kulkarni | Active | Success, redirect to Products |
| U3 | `meera@haat.in` | `Meera$789` | Meera Iyer | **Inactive** | "This account is inactive. Please contact support@haat.in." |

### 1.1 Invalid credential combinations

| # | Email | Password | Expected |
|---|---|---|---|
| IC1 | `asha@haat.in` | `Asha@9999` | Invalid email or password. 2 attempts left… |
| IC2 | `unknown@haat.in` | `Asha@1234` | Invalid email or password. (not counted) |
| IC3 | `ASHA@HAAT.IN` | `Asha@1234` | Success (email is case-insensitive) |
| IC4 | `asha@haat.in` | `asha@1234` | Complexity message (no uppercase) |
| IC5 | `ravi@haat.in` | wrong × 3 | Locked for 5 minutes after the **3rd** failure |

> Tip: use **U2 (Ravi)** for lockout tests so U1 stays usable.

---

## 2. Email samples (Login, Forgot password, Checkout)

| Value | Valid? | Reason |
|---|---|---|
| `asha@haat.in` | Valid | n/a |
| `first.last+tag@mail.co.in` | Valid | n/a |
| `abc` | Invalid | No @ |
| `abc@` | Invalid | No domain |
| `abc@gmail` | Invalid | No top-level domain |
| `@haat.in` | Invalid | No local part |
| `john doe@mail.com` | Invalid | Contains a space |
| `asha@@haat.in` | Invalid | Two @ signs |
| `a@b.c` | Invalid | TLD shorter than 2 letters |
| `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@haat.in` (50 chars) | Valid | Maximum length boundary |
| `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@haat.in` (51 chars) | Invalid | Over 50 characters (type or paste it; the field stops at 50) |
| (empty) | Invalid | Mandatory |
| `   ` (spaces) | Invalid | Mandatory (trimmed) |

## 3. Password samples

| Value | Length | Valid? | Reason |
|---|---|---|---|
| `Asha@1234` | 9 | Valid (format) | n/a |
| `Ab@12345` | 8 | Valid (format) | Minimum boundary |
| `Abcdefgh@1234567890` | 19 | Valid (format) | n/a |
| `Abcdefgh@12345678901` | 20 | Valid (format) | Maximum boundary |
| `Asha@12345678901234567` | 22 | **Invalid** | Over 20 |
| `Ab@1234` | 7 | Invalid | Under 8 |
| `asha@1234` | 9 | Invalid | No uppercase |
| `ASHA@1234` | 9 | Invalid | No lowercase |
| `Asha@abcd` | 9 | Invalid | No digit |
| `Asha12345` | 9 | Invalid | No special character |

## 4. Captcha notes

- 6 characters from `A–Z` (without I, O), `a–z` (without i, l, o) and `2–9`.
- **Case-sensitive.** If the image shows `aB3xYz`, then `aB3xYz` is valid while `ab3xyz` and `AB3XYZ` are invalid.
- Refresh button: new image **and** the input is emptied.
- After any failed login (wrong captcha or wrong credentials) a new image appears and the input is emptied.
- Captcha errors do not count towards the account lockout.

---

## 5. Coupon codes

| Code | Type | Value | Minimum Subtotal | Valid till | Expected |
|---|---|---|---|---|---|
| `SAVE10` | Percent | 10% of Subtotal | ₹1,000.00 | 31-Dec-2030 | Applies when Subtotal ≥ ₹1,000 |
| `FLAT200` | Flat | ₹200.00 | ₹1,500.00 | 31-Dec-2030 | Applies when Subtotal ≥ ₹1,500 |
| `EXPIRED50` | Percent | 50% | n/a | 31-Dec-2025 | **Always rejected**: "This coupon has expired." (any letter case) |
| `save10` | Same as SAVE10 | n/a | n/a | n/a | Case-insensitive, behaves like SAVE10 |
| `HELLO` | n/a | n/a | n/a | n/a | "Invalid coupon code." |

Rules: only **one** coupon at a time. The minimum is checked on the Subtotal after product discounts, not on MRP.

---

## 6. Checkout samples

### 6.1 Mobile number

| Value | Valid? | Reason |
|---|---|---|
| `9876543210` | Valid | n/a |
| `987654321` | Invalid | 9 digits |
| `98765432101` | Invalid | 11 digits (the field also stops at 10) |
| `98765abcde` | Invalid | Letters |
| `98765 4321` | Invalid | Space |
| `+919876543` | Invalid | Symbols |

### 6.2 Pincode

| Value | Valid? | Reason |
|---|---|---|
| `411001` | Valid | n/a |
| `560034` | Valid | n/a |
| `41100` | Invalid | 5 digits |
| `4110` | Invalid | 4 digits |
| `41100A` | Invalid | Letter |

### 6.3 Other fields

| Field | Valid sample | Invalid samples |
|---|---|---|
| Full name | `Asha Verma` | empty, `     ` (spaces only), `A1` (digit), `Jo` (under 3), 51 letters |
| Address | `12 MG Road, Pune, Maharashtra` | empty, `short` (under 10), 201+ characters |
| Payment | any one tile selected | none selected |

---

## 7. Product quick reference (starting stock)

| ID | Product | Category | MRP | Disc % | Selling price | Stock |
|---|---|---|---|---|---|---|
| HT101 | Brass Diya Lamp (Pair) | Home Decor | 450.00 | 10 | 405.00 | 20 |
| HT102 | Madhubani Wall Art | Art | 1,200.00 | 0 | 1,200.00 | 6 |
| HT103 | Kanjeevaram Silk Stole *(festive)* | Textiles | 2,400.00 | 15 | 2,040.00 | 4 |
| HT104 | Terracotta Planter Set | Home Decor | 850.00 | 20 | 680.00 | **0** |
| HT105 | Channapatna Toy Train | Toys | 560.00 | 40 | 336.00 | 12 |
| HT106 | Blue Pottery Mug | Kitchen | 380.00 | 0 | 380.00 | 25 |
| HT107 | Pattachitra Scroll | Art | 3,200.00 | 30 | 2,240.00 | 3 |
| HT108 | Dhokra Brass Elephant | Home Decor | 1,850.00 | 12 | 1,628.00 | 7 |
| HT109 | Handloom Cotton Dhurrie *(festive)* | Textiles | 1,499.00 | 20 | 1,199.20 | 10 |
| HT110 | Bamboo Serving Tray | Kitchen | 640.00 | 5 | 608.00 | 15 |
| HT111 | Ajrakh Table Runner | Textiles | 749.00 | 15 | 636.65 | 9 |
| HT112 | Kondapalli Toy Set | Toys | 999.00 | 10 | 899.10 | 5 |
| HT113 | Copper Water Bottle | Kitchen | 1,150.00 | 15 | 977.50 | 18 |
| HT114 | Warli Painted Coasters | Art | 250.00 | 0 | 250.00 | 30 |

Correct Price: High to Low order: 2,240.00 → 2,040.00 → 1,628.00 → 1,200.00 → 1,199.20 → 977.50 → 899.10 → 680.00 → 636.65 → 608.00 → 405.00 → 380.00 → 336.00 → 250.00.

---

## 8. Ready basket scenarios (correct expected totals)

Formula: Item total = selling price × qty → Subtotal → Coupon → GST 18% on (Subtotal − Coupon) → Shipping ₹50 if (Subtotal − Coupon) < ₹500 → Grand total. Each amount is rounded to 2 decimals.

| # | Basket | Coupon | Subtotal | Coupon | After coupon | GST 18% | Shipping | **Grand total** |
|---|---|---|---|---|---|---|---|---|
| A | Brass Diya Lamp × 2 (810.00) + Blue Pottery Mug × 1 (380.00) | none | 1,190.00 | 0.00 | 1,190.00 | 214.20 | FREE | **₹1,404.20** |
| B | Kanjeevaram Silk Stole × 1 (2,040.00) + Channapatna Toy Train × 2 (672.00) | SAVE10 | 2,712.00 | 271.20 | 2,440.80 | 439.34 | FREE | **₹2,880.14** |
| C | Warli Painted Coasters × 2 (500.00) | none | 500.00 | 0.00 | 500.00 | 90.00 | FREE | **₹590.00** |
| D | Ajrakh Table Runner × 3 (1,909.95) | FLAT200 | 1,909.95 | 200.00 | 1,709.95 | 307.79 | FREE | **₹2,017.74** |
| E | Blue Pottery Mug × 1 (380.00) | none | 380.00 | 0.00 | 380.00 | 68.40 | ₹50.00 | **₹498.40** |
| F | Channapatna Toy Train × 1 (336.00) + Bamboo Serving Tray × 1 (608.00) | SAVE10 → **must be rejected** (944 < 1,000) | 944.00 | 0.00 | 944.00 | 169.92 | FREE | **₹1,113.92** |
| G | Dhokra Brass Elephant × 1 (1,628.00) + Copper Water Bottle × 1 (977.50) | SAVE10 | 2,605.50 | 260.55 | 2,344.95 | 422.09 | FREE | **₹2,767.04** |

For every scenario, the Checkout summary and the confirmation "Total paid" must show the **same** Grand total as the Basket.

### 8.1 Boundary ideas
- **Shipping:** Warli Coasters × 2 = ₹500.00 → FREE. Blue Pottery Mug × 1 = ₹380.00 → ₹50.
- **SAVE10 minimum:** Warli Coasters × 4 = ₹1,000.00 → must be accepted. Scenario F (₹944) → must be rejected.
- **FLAT200 minimum:** Warli Coasters × 6 = ₹1,500.00 → must be accepted. Coasters × 5 = ₹1,250 → rejected.
- **Quantity:** 1 ("−" disabled). 10 ("+" disabled when stock ≥ 10). For stock below 10 the maximum is the stock (Pattachitra Scroll max 3).
- **Stock after order:** order Brass Diya Lamp × 3 from fresh data → Products must show "In stock: 17".
- **One coupon rule:** with SAVE10 active, applying FLAT200 must be refused.
