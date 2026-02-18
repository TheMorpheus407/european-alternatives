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
- [CoolTechZone — Cryptostorm VPN Review](https://cooltechzone.com/cryptostorm)
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
- [P7-Office / NKT company profile — TAdviser](https://tadviser.com/index.php/Company:P7-Office_(formerly_New_Communication_Technologies,_NKT))
- [Ascensio System SIA — Latvian company register (Lursoft)](https://company.lursoft.lv/en/ascensio-system/40103265308)
- [BLOMSTEIN — EU sanctions on IT and software compliance](https://www.blomstein.com/en/news/sanctions-101)

---

## Hubitat Elevation (Smart Home)

**Previously listed, removed in:** Decision Matrix policy update (2026-02-18)
**Origin:** United States
**Category:** Smart Home

### Reason for Removal

Hubitat Elevation is a US-based, fully proprietary smart home hub. Under the [Decision Matrix](DECISION_MATRIX.md) two-tier system (criterion G6), non-European entries require full open-source status — client and server code publicly available under an OSI-approved license. Hubitat is closed-source and does not meet this requirement.

European users seeking a local-first smart home hub should consider **Home Assistant** (already listed, fully open-source, Apache-2.0) or **openHAB** (already listed, fully open-source, EPL-2.0).
