# Denied Alternatives

Alternatives that were evaluated and rejected from the catalogue, with reasoning and sources.

---

## Cryptostorm (VPN)

**Proposed in:** PR #91 (2026-02-16)
**Claimed origin:** Iceland
**Actual origin:** Vancouver, Canada (Baneki Privacy Computing Inc.)
**Category:** VPN

### Reason for Denial

Cryptostorm is **not a European company**. Despite using an Icelandic TLD (.is) and claiming "Icelandic roots," the registered corporate entity is Baneki Privacy Computing Inc., based in Vancouver, Canada — a Five Eyes alliance member. When asked about jurisdiction, a Cryptostorm spokesperson responded: "Which country are you based in from a legal perspective? Iceland, actually we don't care."

Beyond the false European claim, Cryptostorm has severe trust concerns:

- **Founder Douglas Spink** was convicted in 2005 of smuggling 375 pounds of cocaine ($34 million value) and sentenced to 17 years in prison
- Spink was **released after only 3 years** due to "extensive cooperation with investigators," fueling widespread honeypot/law-enforcement-collaboration suspicions
- **Removed from privacytools.io** (GitHub issue #1098) specifically due to founder trust concerns
- **Not recommended by Privacy Guides**
- Current operators are **pseudo-anonymous** with no accountability
- **Five Eyes jurisdiction** (Canada) undermines any privacy claims

### Sources

- [privacytools.io removal — GitHub issue #1098](https://github.com/privacytools/privacytools.io/issues/1098)
- [Privacy Guides discussion on Cryptostorm](https://discuss.privacyguides.net/t/why-is-vpn-providers-like-cryptostorm-or-ovpn-not-recommended/13061)
- [ProPrivacy — CryptoStorm VPN Review](https://proprivacy.com/vpn/review/cryptostorm)
- [Cloudwards — Cryptostorm Review](https://www.cloudwards.net/cryptostorm-review/)
- [TechRadar — CryptoStorm VPN Review](https://www.techradar.com/reviews/cryptostorm)
- [PrivacySharks — CryptoStorm VPN Review](https://www.privacysharks.com/vpn-reviews/cryptostorm-vpn/)

---

## ONLYOFFICE (Office Suite)

**Proposed in:** Manual review (2026-02-18)
**Claimed origin:** Riga, Latvia (Ascensio System SIA)
**Actual origin:** Nizhny Novgorod, Russia (New Communication Technologies / NKT, now R7-Office)
**Category:** Office / Productivity

### Reason for Denial

ONLYOFFICE is **de facto Russian-developed software** operating behind a Latvian shell company. The product was created in 1998 by Lev Bannov and Alexey Ryazanov as New Communication Technologies (NKT) in Nizhny Novgorod, Russia. Ascensio System SIA in Latvia was a 100% subsidiary of NKT, and both entities shared the same physical address in Nizhny Novgorod. The Latvian beneficial ownership register confirms Russian citizen Lev Bannov as the ultimate beneficial owner.

**EU sanctions apply to commercial ONLYOFFICE licenses.** While ONLYOFFICE has not been individually named on an SDN list, German and EU institutions have determined that purchasing commercial licenses falls under the broad EU sanctions regime against Russia (EU Regulation 833/2014), because revenue ultimately flows to Russian beneficial owners. Multiple institutions have acted on this:

- **TU Berlin** (May 2023) switched to Collabora Online, stating ONLYOFFICE "falls under the sanctions of the EU and Germany against Russia"
- **Johannes Gutenberg University Mainz** (May 2023) switched to the open-source version to ensure "no more money flows to Russia"
- **Leibniz University Hannover** (November 2023) let its ONLYOFFICE license expire "due to sanctions"
- **soft Xpansion** (April 2022) terminated all cooperation, citing Russian roots and failure to condemn the invasion of Ukraine
- **DMS Solutions** (November 2024) cut off all business relations, calling ONLYOFFICE "a Russian owned company, which supports (does not condemn) the brutal and unprovoked Russian invasion of Ukraine"

Further concerns:

- In 2021, NKT rebranded as **R7-Office** and continues selling the same codebase to Russian government agencies and military institutions
- In February 2025, **VK** (formerly Mail.ru Group, a major Russian state-adjacent tech company) acquired a **25% stake in R7-Office** for 2.5 billion rubles
- In August 2023, ONLYOFFICE created a **Singapore holding company** to further obscure Russian ownership, and Bannov's citizenship was changed from Russian to Turkish in the Latvian register
- The company has **never condemned Russia's invasion of Ukraine**

### Sources

- [TU Berlin — switches to Collabora Online due to sanctions](https://www.tu.berlin/en/campusmanagement/news-details/umstellung-tubcloud-auf-collabora-online)
- [University of Mainz — switches to open-source ONLYOFFICE version](https://www.en-zdv.uni-mainz.de/2023/05/30/software-onlyoffice-will-be-switched-to-the-open-source-version/)
- [Leibniz University Hannover — discontinues ONLYOFFICE](https://www.luis.uni-hannover.de/en/news/details/news/neues-online-office-paket-an-der-luh)
- [DMS Solutions — cuts off relations with ONLYOFFICE](https://dms-solutions.co/news/dms-solutions-cuts-off-business-relations-with-onlyoffice-due-to-onlyoffice-close-ties-with-russia/)
- [soft Xpansion — terminates cooperation with Ascensio System SIA](https://softxpansion.global/resources/prypynyaye-spivpratsyu-z-ascensio-system-sia)
- [FOSS Force — Lyon adopts OnlyOffice: From Russia With Love](https://fossforce.com/2025/07/lyon-france-adopts-onlyoffice-from-russia-with-love/)
- [VK acquires 25% of R7-Office — Interfax](https://interfax.com/newsroom/top-stories/110513/)
- [Privacy Guides discussion — claims against ONLYOFFICE](https://discuss.privacyguides.net/t/serious-claims-made-against-onlyoffice/11644)
- [Ascensio System SIA — Latvian company register (Lursoft)](https://company.lursoft.lv/en/ascensio-system/40103265308)
- [BLOMSTEIN — EU sanctions on IT and software compliance](https://www.blomstein.com/en/news/sanctions-101)

---

## Startpage (Search Engine)

**Previously listed, removed in:** Ownership Structure Clause application (2026-02-19)
**Claimed origin:** The Hague, Netherlands (Surfboard Holding B.V.)
**Effective control:** System1, a US publicly traded ad-tech company
**Category:** Search Engine

### Reason for Removal

Startpage is a Dutch-registered entity (Surfboard Holding B.V.) but has been majority-owned by **System1** (US, publicly traded ad-tech) since 2019. Under the [Ownership Structure Clause](DECISION_MATRIX.md#ownership-structure-clause), this triggers a G1 re-evaluation because all three pass-through indicators are present:

1. **Parent officers directing operations:** System1's CEO is named as the legal responsible party for Startpage, indicating the Dutch entity does not operate independently of its US parent.
2. **Data routing through parent jurisdiction:** Startpage's "Vanish" AI feature explicitly routes user prompts through US-based LLM providers (OpenAI, Anthropic, Perplexity), creating a direct data flow into US jurisdiction.
3. **Structural operational entanglement:** System1 is not a passive financial investor — it is an ad-tech company whose business model (advertising) is structurally intertwined with Startpage's monetization (Google AdSense sponsored links).

A legal entity that cannot independently resist compulsion from its US parent is not a genuine European headquarters. Startpage **fails G1** under the Ownership Structure Clause.

### Additional Concerns

- **Proprietary and closed-source** — cannot be independently audited or self-hosted
- **No SOC2/ISO 27001 certification** — only historical EuroPriSe seal (suspended since 2017)
- **Privacy Guides delisted Startpage in 2019** over System1 ownership concerns, then relisted after Startpage provided clarifications — but the structural ownership concern remains
- **SEC filings for System1** show workforce reductions and class-action settlements in the corporate group

### Sources

- [Startpage — "Relisted on PrivacyTools" (ownership disclosure)](https://www.startpage.com/privacy-please/startpage-articles/startpage-relisted-on-privacytools)
- [Startpage — Privacy Policy (Google AdSense disclosure)](https://www.startpage.com/en/privacy-policy/)
- [Startpage — Support Privacy Policy (Zendesk disclosure)](https://www.startpage.com/en/support-privacy-policy/)
- [Deep research: 360° Vendor Trust & Ethics Audit — Startpage](tmp/deepresearches/startpage.md) (internal, 63/100 score)

---

## Hubitat Elevation (Smart Home)

**Previously listed, removed in:** Decision Matrix policy update (2026-02-18)
**Origin:** United States
**Category:** Smart Home

### Reason for Removal

Hubitat Elevation is a US-based, fully proprietary smart home hub. Under the [Decision Matrix](DECISION_MATRIX.md) two-tier system (criterion G6), non-European entries require full open-source status — client and server code publicly available under an OSI-approved license. Hubitat is closed-source and does not meet this requirement.

European users seeking a local-first smart home hub should consider **Home Assistant** (already listed, fully open-source, Apache-2.0) or **openHAB** (already listed, fully open-source, EPL-2.0).

---

## Brave Browser (Browser)

**Previously listed, removed in:** Manual policy enforcement (2026-02-24)
**Origin:** United States (Brave Software, Inc., California)
**Category:** Browser

### Reason for Removal

Brave is a Tier 2 (non-European) entry. Under the [Decision Matrix](DECISION_MATRIX.md) two-tier gateway rules (criterion G6), non-European alternatives are only eligible when they are fully open-source.

Brave publishes major browser code under open-source licenses, but Brave's own documentation confirms DRM video playback depends on **Google Widevine**, which is proprietary and cannot be reviewed by Brave. Brave's Terms also state source code may be available for "certain" software, not all components. Because closed proprietary components are required for this feature path, Brave is not fully open-source end-to-end and therefore fails G6.

### Sources

- [Brave Browser Privacy Policy (Brave Software, Inc., California)](https://brave.com/privacy/browser/)
- [Brave GitHub repository](https://github.com/brave/brave-browser)
- [Brave Support: DRM-protected content (Widevine)](https://support.brave.com/hc/en-us/articles/360023851591-How-do-I-view-DRM-protected-content)
- [Brave Blog: DRM support and Widevine licensing constraints](https://brave.com/blog/drm-support/)
- [Brave Terms of Use](https://brave.com/terms-of-use/)

---

## Kagi (Search Engine)

**Proposed in:** Issue #134 (2026-02-18)
**Origin:** United States (Kagi Inc.; founded in Palo Alto, California)
**Category:** Search Engine

### Reason for Denial

Kagi is a Tier 2 (non-European) proposal. Under the [Decision Matrix](DECISION_MATRIX.md) gateway rules (criterion G6), Tier 2 entries are only eligible when they are fully open-source (client and server under OSI-approved licenses).

Kagi's own company documentation identifies the company as US-based (Palo Alto founding and San Francisco address), and its terms state proprietary rights over the service. Kagi's open-source page describes the company as "increasingly open-source" and lists selected OSS projects, but this does not establish full open-source status for the core search/assistant stack end-to-end.

Because Kagi is non-European and not fully open-source, it fails G6 and is not eligible for catalogue inclusion.

### Sources

- [Issue #134 — "Please add Kagi"](https://github.com/TheMorpheus407/european-alternatives/issues/134)
- [Kagi Docs — About (founded in Palo Alto; San Francisco contact address)](https://help.kagi.com/kagi/company/)
- [Kagi Docs — Commitment to Open-source](https://help.kagi.com/kagi/support-and-community/open-source.html)
- [Kagi Terms (Proprietary Rights; Delaware, U.S.A. governing law)](https://kagi.com/privacy)

---

## GitLab (Version Control)

**Proposed in:** Issue #141 (2026-02-18)
**Origin:** United States (GitLab, Inc., San Francisco)
**Category:** Version Control

### Reason for Denial

GitLab is a Tier 2 (non-European) proposal. Under the [Decision Matrix](DECISION_MATRIX.md), criterion G6 requires Tier 2 entries to be fully open-source (client and server under OSI-approved licenses).

GitLab's own licensing documentation states that:

- **GitLab Community Edition (CE)** is MIT-licensed
- **GitLab Enterprise Edition (EE)** is licensed under the GitLab EE license with additional restrictions

GitLab's installation and upgrade docs also separate `gitlab-ce` ("stripped down" community-only package) from `gitlab-ee` (full package with community + enterprise features), and GitLab's upgrade page states that Enterprise features require an EE license.

Because the proposed entry is **GitLab** (not a CE-only listing), the offering is open-core rather than fully open-source end-to-end. It therefore fails **G6** and is not eligible for inclusion.

### Sources

- [Issue #141 — "entry request: gitlab"](https://github.com/TheMorpheus407/european-alternatives/issues/141)
- [GitLab Docs — Licensing and Compatibility (CE MIT, EE restrictive license)](https://docs.gitlab.com/development/licensing/)
- [GitLab Docs — Upgrade Linux package instances (`gitlab-ce` vs `gitlab-ee`)](https://docs.gitlab.com/update/package/)
- [GitLab — Upgrade to Enterprise Edition (Enterprise features not in CE; license required)](https://about.gitlab.com/upgrade/)
- [GitLab Legal Notice (GitLab, Inc. San Francisco address)](https://about.gitlab.com/fr-fr/mentions-legales/)

---

## Obsidian (Note-Taking)

**Raised in:** Issue #201 (2026-02-25)
**Origin:** Canada (Dynalist Inc.)
**Category:** Note-Taking

### Reason for Denial

Obsidian is **not US-based**. Obsidian's terms identify the legal entity as Dynalist Inc., set Ontario/Canada governing law, and state the services are controlled and operated from offices within Canada.

However, Obsidian is a Tier 2 (non-European) candidate. Under the [Decision Matrix](DECISION_MATRIX.md), gateway criterion G6 requires Tier 2 entries to be fully open-source (client and server under OSI-approved licenses).

Obsidian's terms state the software is "licensed and not sold," with rights reserved to the company, and note that software may include third-party open-source components. Obsidian's license overview also states the company owns and reserves rights to code in the app. This supports an interpretation of a proprietary offering with some open-source components, not a fully open-source stack.

Because Obsidian is non-European and not fully open-source, it fails G6 and is not eligible for catalogue inclusion.

### Sources

- [Issue #201 — "Obsidian incorrectly listed as US company"](https://github.com/TheMorpheus407/european-alternatives/issues/201)
- [Obsidian Terms of Service (Dynalist Inc.; Ontario/Canada governing law)](https://obsidian.md/terms)
- [Obsidian License Overview (rights reserved statement)](https://obsidian.md/license)
