# Decision Matrix

A transparent, consistent framework for deciding which alternatives are included, scored, or denied. This matrix exists to eliminate subjective curation and ensure every decision can be traced to documented criteria.

> Prompted by community feedback in [PR #91](https://github.com/TheMorpheus407/european-alternatives/pull/91) requesting a clear decision framework.

---

## Two-Tier System

Alternatives are evaluated in two tiers based on headquarters jurisdiction. Each tier has different gateway requirements.

|                                  | Tier 1: European                                     | Tier 2: Non-European                                                             |
|----------------------------------|------------------------------------------------------|----------------------------------------------------------------------------------|
| **Jurisdictions**                | EU member states, CH, NO, GB, IS                     | Any jurisdiction not listed in Tier 1                                            |
| **Open-source requirement**      | None (but rewarded in scoring)                       | **Full open-source required**                                                    |
| **Proprietary allowed?**         | Yes                                                  | No                                                                               |
| **Partial open-source allowed?** | Yes                                                  | No                                                                               |
| **Trust score cap**              | EU cap 9.7, non-EU cap 9.5                           | US entries capped at 5.0 (FOSS base class overrides to cap 10.0)                 |
| **Rationale**                    | European jurisdiction + GDPR provides baseline trust | Without European legal protections, only full source transparency can compensate |

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

| Entanglement Level              | Indicator                                                                            | Reservation Severity                                  |
|---------------------------------|--------------------------------------------------------------------------------------|-------------------------------------------------------|
| **Passive financial**           | PE firm holds shares; European management, staff, and infrastructure unchanged       | `major` (ownership documented)                        |
| **Active operational**          | Parent's officers hold legal roles in subsidiary; shared infrastructure or personnel | `major` (with additional penalty)                     |
| **Data routing through parent** | User data is processed by or routed through the parent's jurisdiction                | **Re-evaluate G1** — may constitute a shell structure |

4. **G1 re-evaluation trigger** — If investigation reveals the European entity functions as a pass-through for a non-European parent (data routing, shared infrastructure, parent officers directing operations), the entry must be re-evaluated under G1 (Genuine headquarters). A legal entity that cannot independently resist compulsion from its parent is not a genuine European headquarters.

**This clause does not automatically reclassify affected entries to Tier 2.** It ensures that ownership-related jurisdictional risks are documented, scored, and — in the worst cases — escalated to a gateway re-evaluation.

**Examples:**
- **Contabo (DE, KKR):** KKR (US PE) holds majority since 2022. Operationally German (GmbH, Munich HQ). → `major` reservation for passive financial ownership. Deep research required for full assessment.
- **Startpage (NL, System1) — DENIED:** System1 (US ad-tech) has majority ownership. System1 CEO named as legal responsible party. Vanish AI routes data through US LLM providers. G1 re-evaluation triggered → **failed G1** (pass-through structure). See [DENIED_ALTERNATIVES.md](DENIED_ALTERNATIVES.md#startpage-search-engine).

---

## Gateway Criteria (Pass/Fail)

Every proposed alternative must pass ALL of the following. Failure on any single criterion results in denial.

| #  | Criterion                           | What It Means                                                                                                                                                                                                                  | Example Denial                                                                                         |
|----|-------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| G1 | **Genuine headquarters**            | The actual corporate entity (not a shell or subsidiary) must be headquartered in an accepted jurisdiction. Beneficial ownership is traced.                                                                                     | Cryptostorm: `.is` domain but registered in Vancouver, Canada                                          |
| G2 | **Active maintenance**              | The service/software must be alive and receiving updates. No abandoned projects.                                                                                                                                               | —                                                                                                      |
| G3 | **Functional replacement**          | Must serve a similar purpose to an identified US product (`replacesUS` field required).                                                                                                                                        | —                                                                                                      |
| G4 | **Independent product**             | Must not be a thin wrapper or reskin of a US service. Must not route data through US infrastructure without transparency.                                                                                                      | —                                                                                                      |
| G5 | **Usable offering**                 | Must have a publicly available product. No pre-alpha, no vaporware.                                                                                                                                                            | —                                                                                                      |
| G6 | **Open-source (Tier 2 only)**       | Non-European entries require `openSourceLevel: 'full'` — both client and server code publicly available under an OSI-approved license.                                                                                         | Hubitat Elevation: US-based, closed-source                                                             |
| G7 | **No sanctions exposure**           | Revenue must not ultimately flow to sanctioned jurisdictions or beneficial owners. EU Regulation 833/2014 and equivalent apply.                                                                                                | ONLYOFFICE: Russian beneficial ownership behind Latvian shell                                          |
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

## Scoring Criteria — Alignment v2 (Trust Score)

Alternatives that pass all gateway criteria are scored on a 0-10 scale (one decimal place). The formula is deterministic and implemented in `src/utils/trustScore.ts`, with constants defined in `src/data/scoringConfig.ts`.

The score has two layers: a **base alignment score** determined by structural factors (jurisdiction + open-source status), and a **dimensional operational score** built from evidence-based reservations (penalties) and positive signals. The full scoring model is documented in `agents/AGENT_TRUST_SCORING.md`.

### Base Class (Structural Trust)

Every alternative is assigned exactly one base class. Classification is automatic based on open-source level and country, with manual override available when auto-detection would be wrong.

| Priority | Condition                                     | Base Class  | Base Score |
|----------|-----------------------------------------------|-------------|------------|
| 1        | `openSourceLevel: 'full'`                     | `foss`      | 80         |
| 2        | EU member state                               | `eu`        | 70         |
| 3        | European non-EU (CH, NO, GB, IS)              | `nonEU`     | 65         |
| 4        | Pan-European (`eu` meta)                      | `eu`        | 70         |
| 5        | United States                                 | `us`        | 20         |
| 6        | All other jurisdictions                       | `rest`      | 40         |
| —        | Autocracy (CN, RU — via manual override only) | `autocracy` | 10         |

Full open-source (`foss`) takes priority over jurisdiction — a fully open-source project from any country gets base 80. This reflects the project's conviction that verifiable source code is the strongest trust signal after European jurisdiction.

### Dimensional Operational Score (0-32 points)

Four operational dimensions measure trust beyond structural factors. Each dimension starts at **50% of its maximum** (the baseline). Reservations with penalties subtract from the baseline (with recency decay). Positive signals add back. Each dimension is clamped to `[0, max]`.

| Dimension   | Max    | Baseline (50%) | What It Measures                                                             |
|-------------|--------|----------------|------------------------------------------------------------------------------|
| Security    | 12     | 6              | Audits, disclosure process, vulnerability handling, security architecture    |
| Governance  | 8      | 4              | Ownership clarity, structural opacity, legal clarity, stability signals      |
| Reliability | 6      | 3              | Incident history, status transparency, release cadence, maintenance maturity |
| Contract    | 6      | 3              | Exportability, deletion rights, fair renewals/cancellation, anti-lock-in     |
| **Total**   | **32** | **16**         |                                                                              |

A vetted alternative with zero reservations and zero positive signals receives an operational score of 16 (the baseline). Penalties reduce this; positive signals increase it toward the dimension maximums.

### Reservation Penalties

Reservations carry structured penalty data: a **tier** (which dimension to subtract from) and an **amount**. Penalties are evidence-based and scaled by recency decay for incident-based issues.

| Recency    | Multiplier | Rationale                      |
|------------|------------|--------------------------------|
| < 1 year   | 1.0        | Recent and fully relevant      |
| 1-3 years  | 0.5        | Aging but still notable        |
| 3-5 years  | 0.25       | Historical, reduced weight     |
| >= 5 years | 0.1        | Legacy, minimal ongoing impact |

Structural or ongoing issues (no date) receive full weight (1.0).

**Cumulative penalty cap:** Total effective penalties (after recency decay) are capped at **15 points**. No alternative loses more than 15 points from penalties, regardless of how many reservations exist. If the sum exceeds 15, each tier's penalties are scaled down proportionally to preserve relative severity distribution. This prevents runaway penalization while maintaining differentiation between clean and problematic alternatives.

### Hard Caps

Each base class has a ceiling that cannot be exceeded, enforcing sovereignty boundaries.

| Base Class  | Cap        |
|-------------|------------|
| `foss`      | 100 (10.0) |
| `eu`        | 97 (9.7)   |
| `nonEU`     | 95 (9.5)   |
| `rest`      | 70 (7.0)   |
| `us`        | 50 (5.0)   |
| `autocracy` | 30 (3.0)   |

**Ad-surveillance cap:** Alternatives with a core ad-surveillance business model are additionally capped at 45 (4.5). The lowest applicable cap wins.

### Score Computation

The final score follows this formula:

```
raw = baseScore + operationalTotal
capped = min(raw, lowestApplicableCap)
final = clamp(capped, 0, 100)
displayed = round(final) / 10    (shown as X.X / 10)
```

### Interpreting the Score Scale

Vetted alternative scores intentionally cluster in the **7.0-10.0 range** for European and FOSS entries. This is by design, not a deficiency.

**Why base class dominates:** The base score (65-80 for European/FOSS entries) constitutes the majority of the final score because structural trust — jurisdiction and open-source license — is the primary signal this project cares about. A European company under GDPR with full source transparency has already cleared the highest bar. Operational dimensions provide differentiation *within* a class, not between classes.

**Why the 50% baseline exists:** Vetted alternatives have been researched and scored with evidence. Awarding 50% of each dimension's maximum by default reflects that inclusion itself implies demonstrated credibility — these are real, maintained products that passed all gateway criteria. Penalties subtract from this baseline when evidence of problems exists; positive signals raise it when evidence of excellence exists.

**Practical score floors** (maximum penalties, no positive signals):

| Base Class | Floor Score    | Rationale                                                                               |
|------------|----------------|-----------------------------------------------------------------------------------------|
| `foss`     | ~8.1           | Even heavily penalized FOSS retains structural advantage of verifiable code             |
| `eu`       | ~7.1           | Even heavily penalized EU retains GDPR jurisdictional shield                            |
| `nonEU`    | ~6.6           | European non-EU retains strong privacy law baseline                                     |
| `rest`     | ~4.1           | Non-European, non-FOSS: structural trust is limited                                     |
| `us`       | ~2.1 (cap 5.0) | Low base reflects jurisdictional risk; cap prevents exceeding 5.0 regardless of signals |

These floors are intentional. They reflect the project's core thesis: structural factors (where a company is incorporated, whether its code is auditable) matter more than any single operational incident. A European company that has had security issues is still structurally safer for European users than a US company with a clean record, because the legal compulsion threat (FISA 702, CLOUD Act) is a permanent structural risk, not an incident.

**Score differentiation happens within classes.** Two EU proprietary alternatives might score 7.5 and 8.8 — the difference comes entirely from their operational track records (audits, incidents, governance transparency, contract fairness). This is where the dimensional scoring provides value.

### Pending Alternatives (Non-Vetted)

Alternatives that have not yet been through deep research and formal scoring display **"Trust Score Pending"** instead of a numeric score. Internally, a simplified heuristic is used for sorting only — it estimates penalties from reservation severity, infers penalty tiers from reservation text, and estimates positive signals from tags. Non-vetted alternatives also receive a dimensional discount (dimensions start at 25% of max instead of 50%) to reflect lower confidence. These heuristic scores are never displayed to users.

---

## Reservation System

Not every concern warrants denial. The reservation system documents non-disqualifying caveats transparently.

### When to Add a Reservation (Instead of Denying)

| Situation                                                                             | Action          |
|---------------------------------------------------------------------------------------|-----------------|
| Company has a concerning incident but remains otherwise trustworthy                   | Add reservation |
| Product has a dependency on US infrastructure for one feature                         | Add reservation |
| Terms of service contain unusual clauses                                              | Add reservation |
| Privacy practices have a specific gap (e.g., analytics enabled by default)            | Add reservation |
| Founder has severe criminal history AND product is unverifiable AND no accountability | **Deny** (G8)   |
| Company is a shell hiding non-European ownership                                      | **Deny** (G1)   |
| Revenue flows to sanctioned jurisdiction                                              | **Deny** (G7)   |

### Data Portability (Reservation Trigger)

Alternatives that store user data but do not offer standardized data export — such as JSON, CSV, or other open formats — receive a **minor** reservation noting the limitation. This is grounded in GDPR Art. 20 (Right to data portability), which requires data controllers to provide personal data in a structured, commonly used, and machine-readable format upon request.

This trigger applies to any service that stores user data in the cloud or on vendor-controlled infrastructure. It does **not** apply to purely local/offline tools with no cloud storage component — if data never leaves the user's device, there is no portability concern.

| Condition                                                                            | Action                                                     |
|--------------------------------------------------------------------------------------|------------------------------------------------------------|
| Service stores user data but offers no standardized export (JSON, CSV, open formats) | Add `minor` reservation citing data portability limitation |
| Service stores user data and provides standardized export                            | No reservation needed                                      |
| Tool is purely local/offline with no cloud storage                                   | Not applicable                                             |

### Hosting Transparency (Reservation Trigger)

The [Ownership Structure Clause](#ownership-structure-clause) addresses CLOUD Act exposure through corporate ownership chains. This trigger addresses a second vector: **infrastructure dependency**. A 100% European entity that hosts its service on US-owned cloud infrastructure (AWS, GCP, Azure, etc.) may face CLOUD Act exposure through its infrastructure provider. The US government can compel a US cloud provider to produce data in its possession, custody, or control, regardless of where that data is physically stored.

This does **not** disqualify a service. Hosting choices are operational decisions, and many European companies use US cloud providers for legitimate technical reasons. However, the jurisdictional exposure must be documented transparently.

**Rule:** If a Tier 1 company hosts its primary service infrastructure on US-owned cloud platforms, a reservation is required unless one of the following mitigating conditions applies:

1. **End-to-end encryption** — User data is encrypted client-side before reaching the server, and neither the service provider nor the infrastructure provider can access plaintext content. Compelled production yields only ciphertext.
2. **Full self-hostability** — The software can be fully operated on user-controlled infrastructure (`selfHostable: true`). Users who require sovereignty can deploy on European infrastructure, breaking the compulsion chain entirely.

If neither condition applies:

| Condition                                                                                                              | Reservation Severity | Rationale                                                                                      |
|------------------------------------------------------------------------------------------------------------------------|----------------------|------------------------------------------------------------------------------------------------|
| Primary infrastructure on US-owned cloud, no E2E encryption, not self-hostable                                         | `moderate`           | CLOUD Act exposure via infrastructure provider; European jurisdiction partially undermined     |
| Primary infrastructure on US-owned cloud, partial mitigation (e.g., server-side encryption with provider-managed keys) | `minor`              | Reduced but not eliminated exposure; provider-managed keys can be compelled alongside the data |

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
- **penalty** (optional) — structured penalty with `tier` (security, governance, reliability, or contract) and `amount` (positive integer, subtracted from the matching dimension). Omit only for informational-only reservations that should not affect the score; when omitted, the engine estimates the penalty from severity and text

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
│       ├── YES → INCLUDED (scored 0-10, reservations if needed)
│       │   ├── Full open-source    → base class 'foss' (base 80)
│       │   ├── Partial / proprietary → base class 'eu' or 'nonEU' (base 65-70)
│       │   └── + operational dimensions (security, governance, reliability, contract)
│       └── NO  → DENIED (documented in DENIED_ALTERNATIVES.md)
│
└── NO (Tier 2: Non-European)
    └── Is it fully open-source (client + server, OSI license)?
        ├── YES → Passes all gateway criteria (G1-G5, G7-G8)?
        │   ├── YES → INCLUDED (base class 'foss'; cap at 10.0)
        │   └── NO  → DENIED
        └── NO  → NOT ELIGIBLE (non-European + not fully open-source)
```

---

## Examples Demonstrating Consistency

| Alternative     | Country           | Open Source | Outcome                      | Reasoning                                                                                                                           |
|-----------------|-------------------|-------------|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| **Nextcloud**   | DE                | Full        | Included (high score)        | Base class `foss` (base 80) + strong operational signals; EU + FOSS is the highest-trust combination                                |
| **Netcup**      | DE                | None        | Included (lower score)       | Base class `eu` (base 70); proprietary lacks the `foss` base class boost but European jurisdiction provides trust baseline          |
| **Bitwarden**   | US                | Full        | Included (FOSS base class)   | Base class `foss` (base 80) overrides US origin; full open-source + self-hostable provides structural trust despite US jurisdiction |
| **black.com**   | AT                | None        | Included (with reservations) | Base class `eu` (base 70); founder SEC history documented as reservations with governance penalties, not denial                     |
| **Hubitat**     | US                | None        | Not eligible                 | Non-European AND proprietary — fails G6                                                                                             |
| **Cryptostorm** | CA                | —           | Denied                       | Fails G1: claimed Iceland but actually Vancouver, Canada. Also fails G8.                                                            |
| **ONLYOFFICE**  | RU (via LV shell) | Full        | Denied                       | Fails G1 (shell company) and G7 (sanctions exposure to Russia)                                                                      |

---

## Amending This Matrix

This matrix is a living document. Changes require:
1. A GitHub issue or PR explaining the proposed change
2. Community discussion
3. Maintainer approval

The goal is consistency, not rigidity. If a rule produces clearly absurd outcomes, the rule should be refined — not silently ignored.
