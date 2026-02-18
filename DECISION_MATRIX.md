# Decision Matrix

A transparent, consistent framework for deciding which alternatives are included, scored, or denied. This matrix exists to eliminate subjective curation and ensure every decision can be traced to documented criteria.

> Prompted by community feedback in [PR #91](https://github.com/TheMorpheus407/european-alternatives/pull/91) requesting a clear decision framework.

---

## Two-Tier System

Alternatives are evaluated in two tiers based on headquarters jurisdiction. Each tier has different gateway requirements.

| | Tier 1: European | Tier 2: Non-European |
|---|---|---|
| **Jurisdictions** | EU member states, CH, NO, GB, IS | US, CA, or any other non-European country |
| **Open-source requirement** | None (but rewarded in scoring) | **Full open-source required** |
| **Proprietary allowed?** | Yes | No |
| **Partial open-source allowed?** | Yes | No |
| **Trust score cap** | None (1-10) | US entries capped at 4 |
| **Rationale** | European jurisdiction + GDPR provides baseline trust | Without European legal protections, only full source transparency can compensate |

### Why This Asymmetry Exists

This project promotes **European digital sovereignty**. European companies operate under GDPR, are subject to European courts, and keep data within European legal reach. That legal framework provides a trust baseline that proprietary European companies benefit from.

Non-European companies lack that baseline. A proprietary product under US jurisdiction offers no verifiable guarantees to European users. Full open-source status is the only compensating factor — it allows independent verification of privacy claims, community forks if the vendor acts against user interests, and self-hosting to keep data under European control.

**This is why Netcup (DE, proprietary) is listed but a proprietary US service would not be.** European jurisdiction is not just a label — it is a legal shield.

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

## Scoring Criteria (Trust Score)

Alternatives that pass all gateway criteria are scored on a 1-10 scale. The formula is deterministic and implemented in `src/utils/trustScore.ts`.

### Open-Source Level (0-3 points)

Open-source transparency is the strongest signal of trustworthiness after jurisdiction.

| Level | Points | What It Means |
|---|---|---|
| **Full open-source** | 3 | Client AND server code publicly available under OSI-approved license. Anyone can audit, fork, or self-host. |
| **Partial open-source** | 2 | Client code is open but server/backend is proprietary (e.g., Tuta, Proton). Users can verify client behavior but must trust the server. |
| **Proprietary** | 1 | Closed-source. Privacy and security claims cannot be independently verified. |

**Preference order: full open-source > partial open-source > proprietary.** This is reflected directly in the score.

### Jurisdiction (0-4 points)

| Jurisdiction | Points |
|---|---|
| European country (specific) | 4 |
| Pan-European (`eu`) | 3 |
| Other non-US, non-European | 3 |
| United States | 1 |

### Privacy Signals (0-2 points)

| Signal Group | Points | Tags |
|---|---|---|
| Primary privacy | +1 (if any match) | `privacy`, `gdpr`, `encryption`, `zero-knowledge`, `no-logs` |
| Secondary privacy | +1 (if any match) | `self-hosted`, `self-hosting`, `offline`, `federated`, `local` |

### Reservation Penalties (deducted from score)

Reservations reduce the trust score based on severity. The values below are the **maximum** penalty per reservation — the actual deduction may be lower depending on context, mitigating factors, and how many reservations compound.

| Severity | Max Penalty | When Applied |
|---|---|---|
| Major | up to -3 | Serious incidents, systemic issues, or critical trust failures |
| Moderate | up to -2 | Notable concerns that users should be aware of |
| Minor | up to -1 | Small caveats or historical incidents with limited ongoing impact |

### US Hard Cap

US-based entries are capped at a maximum trust score of **4**, regardless of other positive factors. This reflects the jurisdictional disadvantage for European users.

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

### Reservation Fields

Each reservation includes:
- **id** — unique identifier
- **text / textDe** — English and German description
- **severity** — `major`, `moderate`, or `minor`
- **date** — when the incident occurred (if applicable)
- **sourceUrl** — link to evidence (required for major/moderate)

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
│       ├── YES → INCLUDED (scored 1-10, reservations if needed)
│       │   ├── Full open-source    → +3 points
│       │   ├── Partial open-source → +2 points
│       │   └── Proprietary         → +1 point (still allowed)
│       └── NO  → DENIED (documented in DENIED_ALTERNATIVES.md)
│
└── NO (Tier 2: Non-European)
    └── Is it fully open-source (client + server, OSI license)?
        ├── YES → Passes all gateway criteria (G1-G5, G7-G8)?
        │   ├── YES → INCLUDED (scored, US entries capped at 4)
        │   └── NO  → DENIED
        └── NO  → NOT ELIGIBLE (non-European + not fully open-source)
```

---

## Examples Demonstrating Consistency

| Alternative | Country | Open Source | Outcome | Reasoning |
|---|---|---|---|---|
| **Nextcloud** | DE | Full | Included (score ~9.8) | European, fully open-source, privacy-focused |
| **Netcup** | DE | None | Included (lower score) | European jurisdiction provides trust baseline; proprietary is penalized in score but allowed |
| **Bitwarden** | US | Full | Included (capped at 4) | Non-European, but fully open-source compensates; capped score reflects jurisdictional limitation |
| **black.com** | AT | None | Included (with reservations) | European jurisdiction provides trust baseline; proprietary + founder SEC history documented as reservations, not denial |
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
