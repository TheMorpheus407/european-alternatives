# Decision Matrix

A transparent, consistent framework for deciding which alternatives are included, scored, or denied. This matrix exists to eliminate subjective curation and ensure every decision can be traced to documented criteria.

> Prompted by community feedback in [PR #91](https://github.com/TheMorpheus407/european-alternatives/pull/91) requesting a clear decision framework.

---

## Two-Tier System

Alternatives are evaluated in two tiers based on headquarters jurisdiction. Each tier has different gateway requirements.

| | Tier 1: European | Tier 2: Non-European |
|---|---|---|
| **Jurisdictions** | EU member states, CH, NO, GB, IS | Any jurisdiction not listed in Tier 1 |
| **Open-source requirement** | None (but rewarded in scoring) | **Full open-source required** |
| **Proprietary allowed?** | Yes | No |
| **Partial open-source allowed?** | Yes | No |
| **Trust score cap** | EU: 97, nonEU: 95 (0-100 scale) | FOSS: 100 (all Tier 2 entries must be full open-source per G6) |
| **Rationale** | European jurisdiction + GDPR provides baseline trust | Without European legal protections, only full source transparency can compensate |

### Why This Asymmetry Exists

This project promotes **European digital sovereignty**. European companies operate under GDPR, are subject to European courts, and keep data within European legal reach. That legal framework provides a trust baseline that proprietary European companies benefit from.

Non-European companies lack that baseline. A proprietary product under US jurisdiction offers no verifiable guarantees to European users. Full open-source status is the only compensating factor — it allows independent verification of privacy claims, community forks if the vendor acts against user interests, and self-hosting to keep data under European control.

**This is why Netcup (DE, proprietary) is listed but a proprietary US service would not be.** European jurisdiction is not just a label — it is a legal shield.

### Ownership Structure Clause

The GDPR legal shield that justifies Tier 1 classification depends on the European entity being **outside the reach of non-European legal compulsion**. US laws such as FISA Section 702, the CLOUD Act, and Executive Order 12333 can compel US-domiciled parent companies to produce data held by their foreign subsidiaries. When a Tier 1 European company is majority-owned by a US entity, the jurisdictional protection may be structurally compromised.

**Rule:** If a Tier 1 company is majority-owned (>50% voting control or beneficial ownership) by a non-European parent entity, the following applies:

1. **Mandatory ownership transparency review** — The ownership chain must be documented and the degree of operational entanglement assessed.
2. **Automatic `major` reservation** — A reservation of `major` severity is required, documenting the parent entity, jurisdiction, and the legal compulsion risk (FISA/CLOUD Act exposure).
3. **Severity escalation based on entanglement** — The reservation severity and score penalty scale with operational entanglement:

| Entanglement Level | Indicator | Reservation Severity |
|---|---|---|
| **Passive financial** | PE firm holds shares; European management, staff, and infrastructure unchanged | `major` (ownership documented) |
| **Active operational** | Parent's officers hold legal roles in subsidiary; shared infrastructure or personnel | `major` (with additional penalty) |
| **Data routing through parent** | User data is processed by or routed through the parent's jurisdiction | **Re-evaluate G1** — may constitute a shell structure |

4. **G1 re-evaluation trigger** — If investigation reveals the European entity functions as a pass-through for a non-European parent (data routing, shared infrastructure, parent officers directing operations), the entry must be re-evaluated under G1 (Genuine headquarters). A legal entity that cannot independently resist compulsion from its parent is not a genuine European headquarters.

**This clause does not automatically reclassify affected entries to Tier 2.** It ensures that ownership-related jurisdictional risks are documented, scored, and — in the worst cases — escalated to a gateway re-evaluation.

**Examples:**
- **Contabo (DE, KKR):** KKR (US PE) holds majority since 2022. Operationally German (GmbH, Munich HQ). → `major` reservation for passive financial ownership. Deep research required for full assessment.
- **Startpage (NL, System1) — DENIED:** System1 (US ad-tech) has majority ownership. System1 CEO named as legal responsible party. Vanish AI routes data through US LLM providers. G1 re-evaluation triggered → **failed G1** (pass-through structure). See [DENIED_ALTERNATIVES.md](DENIED_ALTERNATIVES.md#startpage-search-engine).

---

## Gateway Criteria (Pass/Fail)

Every proposed alternative must pass ALL of the following. Failure on any single criterion results in denial.

| # | Criterion | What It Means | Example Denial |
|---|---|---|---|
| G1 | **Genuine headquarters** | The actual corporate entity (not a shell or subsidiary) must be headquartered in an accepted jurisdiction. Beneficial ownership is traced. | Cryptostorm: `.is` domain but registered in Vancouver, Canada |
| G2 | **Active maintenance** | The service/software must be alive and receiving updates. No abandoned projects. | — |
| G3 | **Functional replacement** | Must serve a similar purpose to an identified US product (`replacesUS` field required). | — |
| G4 | **Independent product** | Must not be a thin wrapper or reskin of a US service. Must not route data through US infrastructure without transparency. | — |
| G5 | **Usable offering** | Must have a publicly available product. No pre-alpha, no vaporware. | — |
| G6 | **Open-source (Tier 2 only)** | Non-European entries require `openSourceLevel: 'full'` — both client and server code publicly available under an OSI-approved license. | Hubitat Elevation: US-based, closed-source |
| G7 | **No sanctions exposure** | Revenue must not ultimately flow to sanctioned jurisdictions or beneficial owners. EU Regulation 833/2014 and equivalent apply. | ONLYOFFICE: Russian beneficial ownership behind Latvian shell |
| G8 | **No disqualifying trust concerns** | Founders/owners must not have serious criminal or regulatory enforcement history that undermines the product's trustworthiness. Evaluated in context — severity, relevance to the product, and time since incident all matter. | Cryptostorm: founder's cocaine smuggling conviction + honeypot suspicions + pseudo-anonymous operators |

### A Note on G8 (Trust Concerns)

A founder's past does not automatically disqualify an alternative. We evaluate:
- **Severity** — was it a regulatory fine or a criminal conviction?
- **Relevance** — does it relate to the product's trust claims (e.g., financial fraud for a payments service)?
- **Compounding factors** — is the product proprietary (unverifiable), unaudited, or rejected by trusted review bodies?
- **Time and remediation** — has the situation been addressed transparently?

A single concern rarely disqualifies. It is the **combination and severity** of concerns that determines the outcome. Concerns that are serious but not disqualifying result in **reservations** with score penalties rather than denial. For example, black.com (AT) has a founder with SEC/CFTC regulatory history — this is documented as a reservation rather than a denial, because it was a regulatory compliance case (not fraud), and the European jurisdiction provides a trust baseline. The concerns are made transparent to users through the reservation system.

Only when concerns are **both severe and unmitigable** does G8 trigger denial — e.g., Cryptostorm's founder had a criminal conviction for cocaine smuggling, was suspected of cooperating with law enforcement (honeypot), and current operators are pseudo-anonymous with no accountability.

---

## Scoring Criteria (Trust Score — Alignment v2)

Alternatives that pass all gateway criteria are scored on a **0-100 internal scale** (displayed as **0-10 with one decimal**). The formula is deterministic and implemented in `src/utils/trustScore.ts`, with constants defined in `src/data/scoringConfig.ts`.

The score is composed of two parts: a **base alignment score** determined by the alternative's classification, plus an **operational score** derived from four scored dimensions. Caps enforce sovereignty boundaries.

```
final = clamp(min(base + operationalTotal, lowestApplicableCap), 0, 100)
```

> **Non-vetted alternatives** — Alternatives that have not been through the full vetting process (deep research + worksheet) display **"Trust Score Pending"** instead of a computed score. No score is shown to users until the alternative has been properly vetted. Internally, a simplified heuristic is used for sorting only.

### Base Alignment Score

Every alternative is assigned exactly one **base class** that determines its starting score. Classification is automatic based on open-source level and jurisdiction, with manual override available when auto-detection is incorrect.

**Auto-classification priority:**
1. If `openSourceLevel === 'full'` → **FOSS** (regardless of jurisdiction)
2. If EU member state → **EU**
3. If European non-EU (CH, NO, GB, IS) → **nonEU**
4. If pan-European (`eu` meta designation) → **EU**
5. If US → **US**
6. If sanctioned/authoritarian (CN, RU) → **Autocracy**
7. Otherwise → **Rest**

| Base Class | Base Score | Rationale |
|---|---|---|
| **FOSS** (full open-source, verified) | 80 | Full source transparency enables independent verification, community forks, and self-hosting — the strongest trust signal regardless of jurisdiction |
| **EU** | 70 | Direct GDPR applicability, EU court jurisdiction, strongest European legal shield |
| **nonEU** (European non-EU: CH, NO, GB, IS) | 65 | Adequacy decisions, strong privacy laws, but not directly GDPR-bound |
| **Rest** (non-European, non-US) | 40 | No European legal framework, but also no FISA/CLOUD Act exposure |
| **US** | 20 | FISA 702, CLOUD Act, EO 12333 — structural threat to European users' data |
| **Autocracy** (CN, RU) | 10 | State surveillance apparatus with no meaningful legal protections for European users |

**Notes:**
- FOSS takes priority over jurisdiction — a full-FOSS project from any country gets base 80.
- FOSS requires real, verifiable openness (OSI-approved license, publicly available source). Marketing-only or restrictive pseudo-open licenses do not qualify.
- Autocracy class applies when headquarters or effective control is in CN/RU. If CN/RU is only a dependency (not control), keep the base class and apply penalties instead.
- Sanctioned/authoritarian jurisdictions are also denied at the gateway level (G7). The Autocracy base class exists as a scoring backstop in case an entry passes G7 but has residual jurisdictional risk.

### Operational Score — Four Dimensions (+0 to +32)

The operational score measures execution quality across four dimensions. Each dimension has a defined maximum and contributes to the total operational score.

**Starting point:** Each dimension starts at **50% of its maximum** (not at the full maximum). Positive signals (documented evidence of good practices) add points back toward the maximum. Reservation penalties subtract points. The effective score per dimension is clamped to `[0, max]`.

```
dimension_effective = clamp(baseline - penalties + signals, 0, max)
  where baseline = max × 0.5
```

| Dimension | Max | What It Measures |
|---|---|---|
| **Security** | 12 | Independent audits, vulnerability disclosure, security architecture, encryption practices, bug bounty programs |
| **Governance** | 8 | Ownership transparency, legal clarity, open-source governance, GDPR/DPA documentation, stability signals |
| **Reliability** | 6 | Incident history, status page transparency, release cadence, infrastructure resilience, maintenance maturity |
| **Contract** | 6 | Data export/portability, cancellation terms, anti-lock-in measures, self-hostability, EU data residency |

**Total operational maximum: 32 points** (12 + 8 + 6 + 6).

Operational scores can improve ranking within a base class, but the base class and caps ensure that operational excellence alone cannot override alignment classification. A proprietary EU alternative with perfect operational scores still cannot outrank a well-run FOSS alternative, by design.

### Positive Signals (add to dimensions)

Positive signals are documented pieces of evidence that increase a dimension's effective score. Each signal specifies which dimension it applies to and by how much. Signals are defined per alternative in `src/data/positiveSignals.ts`.

Examples of positive signals:
- **Security:** ISO 27001 certification (+2), SOC 2 Type II attestation (+2), public bug bounty (+1), E2E encryption by default (+2), zero-knowledge architecture (+2)
- **Governance:** Transparent ownership (+1), GDPR/DPA documented (+1), foundation/nonprofit structure (+1), public transparency reports (+1)
- **Reliability:** Public status page (+1), active release cadence (+1), multi-region infrastructure (+1), documented incident response (+1)
- **Contract:** Self-hostable (+2), data export available (+1), EU data residency (+1), open standards / no lock-in (+1), fair cancellation terms (+1)

### Reservation Penalties (subtract from dimensions)

Each reservation may carry a **penalty** that specifies which dimension it affects and the penalty amount. Penalties are subtracted from the relevant dimension's effective score (after applying recency decay — see below). A dimension's effective score cannot drop below 0.

Penalties are organized into **four tiers** matching the four dimensions:

| Penalty Tier | Dimension | Example Penalties |
|---|---|---|
| **Security** | Security (max 12) | CVE/vulnerability finding, confirmed major breach, delayed breach disclosure, tracker in privacy product |
| **Governance** | Governance (max 8) | Major privacy/regulatory finding, adverse antitrust ruling, PE/rollup abusive patterns, default AI training on user data, advertising/misleading claims |
| **Reliability** | Reliability (max 6) | Service outages, degraded availability incidents, deprecated infrastructure |
| **Contract** | Contract (max 6) | Lock-in practices, hostile license switch, pricing volatility, reserve/withholding rights, unfair cancellation terms |

### Recency Decay for Penalties

Incident-based penalties (those with a `date` field) decay over time. Structural or ongoing penalties (no date) always apply at full strength (multiplier 1.0).

| Age of Incident | Multiplier | Effect |
|---|---|---|
| Less than 1 year | ×1.0 | Full penalty |
| 1-3 years | ×0.5 | Half penalty |
| 3-5 years | ×0.25 | Quarter penalty |
| More than 5 years | ×0.1 | Residual penalty |

**Example:** A governance penalty of -4 from an incident 4 years ago → -4 × 0.25 = -1 effective.

This ensures that historical incidents still leave a trace (transparency) but do not permanently dominate the score when a company has demonstrably improved.

### Hard Caps

All applicable caps are evaluated. The **lowest** cap wins.

#### Class Caps

Every base class has a ceiling that the final score cannot exceed, regardless of how high the operational score is.

| Base Class | Cap |
|---|---|
| FOSS | 100 |
| EU | 97 |
| nonEU | 95 |
| Rest | 70 |
| US | 50 |
| Autocracy | 30 |

#### Ad-Surveillance Cap

Alternatives whose core business model is advertising-driven surveillance (e.g., Google, Meta, ad-tech platforms) are capped at **45**, regardless of base class. This cap stacks with the class cap — the lower of the two applies.

#### US Cap Behavior

The US class cap of **50** applies to entries with `baseClass: 'us'` — that is, US-based entries that are **not** fully open-source. In practice, this applies to **US vendor comparison entries** (Google, Meta, Amazon, etc.) displayed alongside alternatives for context.

For listed alternatives, G6 requires all non-European entries to be fully open-source. Since FOSS classification takes priority over jurisdiction in auto-classification, a US-based alternative that passes G6 receives `baseClass: 'foss'` and the FOSS cap (100), not the US cap (50). The US jurisdictional disadvantage is reflected in the **US vendor comparisons** rather than penalizing alternatives that have already cleared the open-source gateway.

> **Design note:** In Alignment v2, all caps are class-based. The base class assignment — which checks open-source level before jurisdiction — determines which cap applies. A US FOSS alternative and a European FOSS alternative share the same base class, base score, and cap. The sovereignty boundary for non-FOSS US products is enforced at the gateway level (G6 denial) rather than through scoring.

---

## Reservation System

Not every concern warrants denial. The reservation system documents non-disqualifying caveats transparently.

### When to Add a Reservation (Instead of Denying)

| Situation | Action |
|---|---|
| Company has a concerning incident but remains otherwise trustworthy | Add reservation |
| Product has a dependency on US infrastructure for one feature | Add reservation |
| Terms of service contain unusual clauses | Add reservation |
| Privacy practices have a specific gap (e.g., analytics enabled by default) | Add reservation |
| Founder has severe criminal history AND product is unverifiable AND no accountability | **Deny** (G8) |
| Company is a shell hiding non-European ownership | **Deny** (G1) |
| Revenue flows to sanctioned jurisdiction | **Deny** (G7) |

### Data Portability (Reservation Trigger)

Alternatives that store user data but do not offer standardized data export — such as JSON, CSV, or other open formats — receive a **minor** reservation noting the limitation. This is grounded in GDPR Art. 20 (Right to data portability), which requires data controllers to provide personal data in a structured, commonly used, and machine-readable format upon request.

This trigger applies to any service that stores user data in the cloud or on vendor-controlled infrastructure. It does **not** apply to purely local/offline tools with no cloud storage component — if data never leaves the user's device, there is no portability concern.

| Condition | Action |
|---|---|
| Service stores user data but offers no standardized export (JSON, CSV, open formats) | Add `minor` reservation citing data portability limitation |
| Service stores user data and provides standardized export | No reservation needed |
| Tool is purely local/offline with no cloud storage | Not applicable |

### Hosting Transparency (Reservation Trigger)

The [Ownership Structure Clause](#ownership-structure-clause) addresses CLOUD Act exposure through corporate ownership chains. This trigger addresses a second vector: **infrastructure dependency**. A 100% European entity that hosts its service on US-owned cloud infrastructure (AWS, GCP, Azure, etc.) may face CLOUD Act exposure through its infrastructure provider. The US government can compel a US cloud provider to produce data in its possession, custody, or control, regardless of where that data is physically stored.

This does **not** disqualify a service. Hosting choices are operational decisions, and many European companies use US cloud providers for legitimate technical reasons. However, the jurisdictional exposure must be documented transparently.

**Rule:** If a Tier 1 company hosts its primary service infrastructure on US-owned cloud platforms, a reservation is required unless one of the following mitigating conditions applies:

1. **End-to-end encryption** — User data is encrypted client-side before reaching the server, and neither the service provider nor the infrastructure provider can access plaintext content. Compelled production yields only ciphertext.
2. **Full self-hostability** — The software can be fully operated on user-controlled infrastructure (`selfHostable: true`). Users who require sovereignty can deploy on European infrastructure, breaking the compulsion chain entirely.

If neither condition applies:

| Condition | Reservation Severity | Rationale |
|---|---|---|
| Primary infrastructure on US-owned cloud, no E2E encryption, not self-hostable | `moderate` | CLOUD Act exposure via infrastructure provider; European jurisdiction partially undermined |
| Primary infrastructure on US-owned cloud, partial mitigation (e.g., server-side encryption with provider-managed keys) | `minor` | Reduced but not eliminated exposure; provider-managed keys can be compelled alongside the data |

**Scope limits:**
- This trigger targets the **primary hosting infrastructure** where user data is stored and processed. Incidental US dependencies (a CDN edge node, a single third-party API call) do not trigger it.
- This trigger applies to **Tier 1 entries only**. Tier 2 entries already require full open-source and face stricter scoring constraints.

### Reservation Fields

Each reservation includes:
- **id** — unique identifier
- **text / textDe** — English and German description
- **severity** — `major`, `moderate`, or `minor`
- **date** — when the incident occurred (if applicable; used for recency decay)
- **sourceUrl** — link to evidence (required for major/moderate)
- **penalty** (optional) — scoring penalty with `tier` (security | governance | reliability | contract) and `amount` (positive number, subtracted from the dimension). Omit for informational-only reservations that should not affect the score.

---

## Denial Documentation

Denied alternatives are permanently documented in [DENIED_ALTERNATIVES.md](DENIED_ALTERNATIVES.md) with:
- The PR that proposed them
- The gateway criterion (or combination) they failed
- Detailed reasoning with sourced citations
- Claimed vs. actual origin (if applicable)

This ensures transparency and prevents re-litigation of settled decisions.

---

## Decision Flowchart

```
Is the company genuinely headquartered in Europe?
├── YES (Tier 1: European)
│   └── Passes all gateway criteria (G1-G5, G7-G8)?
│       ├── YES → INCLUDED
│       │   ├── Base class: EU (base 70) or nonEU (base 65)
│       │   ├── Full open-source → base class overridden to FOSS (base 80)
│       │   ├── + Operational score (0-32) from four dimensions
│       │   ├── Caps: EU 97, nonEU 95, FOSS 100
│       │   └── Reservations subtract from dimensions (with recency decay)
│       └── NO  → DENIED (documented in DENIED_ALTERNATIVES.md)
│
└── NO (Tier 2: Non-European)
    └── Is it fully open-source (client + server, OSI license)?
        ├── YES → Passes all gateway criteria (G1-G5, G7-G8)?
        │   ├── YES → INCLUDED
        │   │   ├── Base class: FOSS (base 80, cap 100)
        │   │   ├── + Operational score (0-32) from four dimensions
        │   │   └── Reservations subtract from dimensions (with recency decay)
        │   └── NO  → DENIED
        └── NO  → NOT ELIGIBLE (non-European + not fully open-source)
```

---

## Examples Demonstrating Consistency

| Alternative | Country | Open Source | Outcome | Reasoning |
|---|---|---|---|---|
| **Nextcloud** | DE | Full | Included (FOSS class, base 80, cap 100) | European, fully open-source, privacy-focused — FOSS class overrides EU jurisdiction |
| **Netcup** | DE | None | Included (EU class, base 70, cap 97) | European jurisdiction provides trust baseline; proprietary means EU class (not FOSS), lower operational signals |
| **Bitwarden** | US | Full | Included (FOSS class, base 80, cap 100) | Non-European, but fully open-source → FOSS base class (G6 satisfied). FOSS cap applies, not US cap, because FOSS classification takes priority over jurisdiction |
| **black.com** | AT | None | Included (EU class, with reservations) | European jurisdiction provides trust baseline; proprietary + founder SEC history documented as reservations with governance penalties |
| **Hubitat** | US | None | Not eligible | Non-European AND proprietary — fails G6 |
| **Cryptostorm** | CA | — | Denied | Fails G1: claimed Iceland but actually Vancouver, Canada. Also fails G8. |
| **ONLYOFFICE** | RU (via LV shell) | Full | Denied | Fails G1 (shell company) and G7 (sanctions exposure to Russia) |

---

## Amending This Matrix

This matrix is a living document. Changes require:
1. A GitHub issue or PR explaining the proposed change
2. Community discussion
3. Maintainer approval

The goal is consistency, not rigidity. If a rule produces clearly absurd outcomes, the rule should be refined — not silently ignored.
