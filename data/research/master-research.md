# European Alternatives — Master Research Document

**Date:** 2026-02-10
**Status:** Awaiting user approval before implementation

**Scope:** European-headquartered OR meaningfully open-source alternatives to US tech.
US-based products included only if open-source (marked with `country: 'eu'`).

---

## Summary

| Category | Count | Entries |
|----------|-------|---------|
| Cloud Storage | 6 | Nextcloud, Proton Drive, Filen, pCloud, Tresorit, kDrive |
| Email | 6 | Proton Mail, Mailfence, Posteo, mailbox.org, StartMail, Disroot |
| Search Engine | — | *(already in data: Startpage, Ecosia)* |
| Social Media | 5 | Mastodon, Pixelfed, Lemmy, diaspora*, Friendica |
| Video Hosting | 1 | PeerTube |
| Messaging | 2 | Threema, Element |
| Office Suite | 4 | LibreOffice, ONLYOFFICE, CryptPad, Collabora Online |
| Browser | 2 | Vivaldi, Mullvad Browser |
| Maps & Navigation | 3 | OsmAnd, Organic Maps, Magic Earth |
| VPN | 5 | Mullvad VPN, Proton VPN, AirVPN, IVPN, NordVPN |
| Password Manager | 4 | Proton Pass, KeePassXC, Passbolt, Bitwarden |
| Analytics | 4 | Plausible, Matomo, Pirsch, Simple Analytics |
| Project Management | 3 | OpenProject, Taiga, Vikunja |
| AI/ML | 5 | DeepL, Hugging Face, Stability AI, Black Forest Labs, Ollama |
| Hosting | 6 | Hetzner, OVHcloud, Scaleway, Infomaniak, Hostinger, IONOS |
| Payments | 2 | Mollie, Adyen |
| E-Commerce | 3 | PrestaShop, Shopware, Saleor |
| **Total new** | **61** | |

---

## Cloud Storage (6)

### 1. Nextcloud
- **Country:** DE (Stuttgart) | **Founded:** 2016 | **Open Source:** Yes (AGPL-3.0)
- **Pricing:** free | **Replaces:** Google Drive, Dropbox, OneDrive, iCloud
- **Website:** https://nextcloud.com | **GitHub:** https://github.com/nextcloud
- **EN:** Self-hosted, open-source cloud platform offering file sync, collaboration, and office editing — trusted by the German and French governments. Nextcloud Hub puts you in full control of your data with no vendor lock-in and no hidden enterprise features behind a paywall.
- **DE:** Selbst gehostete Open-Source-Cloud-Plattform mit Dateisynchronisation, Zusammenarbeit und Office-Bearbeitung — im Einsatz bei der deutschen und französischen Regierung. Nextcloud Hub gibt dir die volle Kontrolle über deine Daten, ohne Herstellerbindung und ohne versteckte Enterprise-Funktionen hinter einer Bezahlschranke.

### 2. Proton Drive
- **Country:** CH (Geneva) | **Founded:** 2014 | **Open Source:** Yes (GPL-3.0)
- **Pricing:** freemium | **Replaces:** Google Drive, Dropbox, iCloud, OneDrive
- **Website:** https://proton.me/drive | **GitHub:** https://github.com/ProtonDriveApps
- **EN:** End-to-end encrypted cloud storage from the creators of Proton Mail, headquartered in Geneva and protected by Swiss privacy law. All apps are open source and independently audited, ensuring nobody — not even Proton — can access your files.
- **DE:** Ende-zu-Ende-verschlüsselter Cloud-Speicher von den Machern von Proton Mail, mit Sitz in Genf und geschützt durch Schweizer Datenschutzrecht. Alle Apps sind quelloffen und unabhängig geprüft — niemand, nicht einmal Proton selbst, kann auf deine Dateien zugreifen.

### 3. Filen
- **Country:** DE (Recklinghausen) | **Founded:** 2021 | **Open Source:** Yes (AGPL-3.0)
- **Pricing:** freemium | **Replaces:** Google Drive, Dropbox, iCloud, OneDrive
- **Website:** https://filen.io | **GitHub:** https://github.com/FilenCloudDienste
- **EN:** Zero-knowledge encrypted cloud storage built and hosted entirely in Germany, with all apps open-sourced under AGPL-3.0. Filen offers affordable lifetime plans and keeps no logs, no trackers, and no backdoors — a privacy-first alternative to Big Tech clouds.
- **DE:** Zero-Knowledge-verschlüsselter Cloud-Speicher, vollständig in Deutschland entwickelt und gehostet, mit allen Apps unter der AGPL-3.0-Lizenz quelloffen. Filen bietet günstige Lifetime-Tarife und verzichtet auf Logs, Tracker und Hintertüren — eine datenschutzorientierte Alternative zu Big-Tech-Clouds.

### 4. pCloud
- **Country:** CH (Baar/Zug) | **Founded:** 2013 | **Open Source:** No
- **Pricing:** freemium | **Replaces:** Google Drive, Dropbox, iCloud, OneDrive
- **Website:** https://www.pcloud.com
- **EN:** Swiss-registered cloud storage with over 22 million users, offering lifetime storage plans and an EU data centre in Luxembourg. Optional zero-knowledge client-side encryption ensures that even pCloud cannot read your files.
- **DE:** In der Schweiz registrierter Cloud-Speicher mit über 22 Millionen Nutzern, der Lifetime-Speicherpläne und ein EU-Rechenzentrum in Luxemburg bietet. Optionale Zero-Knowledge-Verschlüsselung auf Client-Seite stellt sicher, dass nicht einmal pCloud deine Dateien lesen kann.

### 5. Tresorit
- **Country:** CH (Zürich) | **Founded:** 2011 | **Open Source:** No
- **Pricing:** freemium | **Replaces:** Google Drive, Dropbox, OneDrive, iCloud
- **Website:** https://tresorit.com
- **EN:** End-to-end encrypted cloud storage owned by Swiss Post, combining Swiss privacy jurisdiction with zero-knowledge security. Tresorit is trusted by enterprises and governments to protect sensitive files without sacrificing usability.
- **DE:** Ende-zu-Ende-verschlüsselter Cloud-Speicher im Besitz der Schweizerischen Post, der Schweizer Datenschutzrecht mit Zero-Knowledge-Sicherheit verbindet. Tresorit wird von Unternehmen und Behörden geschätzt, um sensible Dateien ohne Einbußen bei der Benutzerfreundlichkeit zu schützen.

### 6. Infomaniak kDrive
- **Country:** CH (Geneva) | **Founded:** 1994 | **Open Source:** Yes (GPL-3.0)
- **Pricing:** freemium | **Replaces:** Google Drive, Dropbox, OneDrive, iCloud
- **Website:** https://www.infomaniak.com/en/ksuite/kdrive | **GitHub:** https://github.com/Infomaniak
- **EN:** Sovereign Swiss cloud storage by employee-owned Infomaniak, offering 15 GB free and built-in online office tools. Hosted exclusively in Swiss data centres powered by 100% renewable energy, kDrive is GDPR- and nFADP-compliant with no data resale.
- **DE:** Souveräner Schweizer Cloud-Speicher vom mitarbeitergeführten Unternehmen Infomaniak, mit 15 GB gratis und integrierten Online-Office-Tools. Ausschließlich in Schweizer Rechenzentren mit 100 % erneuerbarer Energie gehostet, ist kDrive DSGVO- und nDSG-konform — ohne Weiterverkauf von Daten.

---

## Email (6)

### 1. Proton Mail
- **Country:** CH (Geneva) | **Founded:** 2014 | **Open Source:** Yes (GPL-3.0)
- **Pricing:** freemium | **Replaces:** Gmail, Outlook, Yahoo Mail
- **Website:** https://proton.me/mail | **GitHub:** https://github.com/ProtonMail
- **EN:** Swiss encrypted email born at CERN, offering end-to-end and zero-access encryption so not even Proton can read your messages. With a free tier, open-source clients, and servers protected by Swiss privacy law, it is the most popular privacy-first alternative to Gmail and Outlook.
- **DE:** Verschlüsselter E-Mail-Dienst aus der Schweiz, entstanden am CERN, mit Ende-zu-Ende- und Zero-Access-Verschlüsselung — nicht einmal Proton selbst kann Ihre Nachrichten lesen. Mit kostenlosem Tarif, quelloffenen Clients und Servern unter Schweizer Datenschutzrecht ist er die beliebteste datenschutzfreundliche Alternative zu Gmail und Outlook.

### 2. Mailfence
- **Country:** BE (Brussels) | **Founded:** 2013 | **Open Source:** No
- **Pricing:** freemium | **Replaces:** Gmail, Outlook, Yahoo Mail
- **Website:** https://mailfence.com
- **EN:** Belgian encrypted email suite offering OpenPGP end-to-end encryption, digital signatures, calendar, contacts, documents, and group workspaces. Operated by ContactOffice Group since 2013, it is subject to strict Belgian privacy law and donates 15% of its premium revenue to digital-rights organizations like EFF and EDRi.
- **DE:** Belgische verschlüsselte E-Mail-Suite mit OpenPGP-Ende-zu-Ende-Verschlüsselung, digitalen Signaturen, Kalender, Kontakten, Dokumenten und Gruppen-Arbeitsbereichen. Seit 2013 von der ContactOffice Group betrieben, unterliegt sie dem strengen belgischen Datenschutzrecht und spendet 15 % der Premium-Einnahmen an Organisationen für digitale Rechte wie EFF und EDRi.

### 3. Posteo
- **Country:** DE (Berlin) | **Founded:** 2009 | **Open Source:** No
- **Pricing:** paid (1 EUR/mo) | **Replaces:** Gmail, Outlook, Yahoo Mail
- **Website:** https://posteo.de
- **EN:** Independent, ad-free email provider from Berlin running entirely on green energy from Greenpeace Energy. At just 1 EUR per month with no free tier, Posteo forgoes venture capital and tracking, stores all data on AES-encrypted servers in Germany, and supports DANE/TLSA for hardened transport encryption.
- **DE:** Unabhängiger, werbefreier E-Mail-Anbieter aus Berlin, der komplett mit Ökostrom von Greenpeace Energy betrieben wird. Für nur 1 EUR pro Monat verzichtet Posteo auf Risikokapital und Tracking, speichert alle Daten auf AES-verschlüsselten Servern in Deutschland und unterstützt DANE/TLSA für gehärtete Transportverschlüsselung.

### 4. mailbox.org
- **Country:** DE (Berlin) | **Founded:** 2014 | **Open Source:** No
- **Pricing:** paid (1 EUR/mo) | **Replaces:** Gmail, Outlook, Yahoo Mail
- **Website:** https://mailbox.org
- **EN:** Privacy-focused email and productivity suite from Berlin, built on open-source software by the Linux specialists at Heinlein Support. Starting at 1 EUR per month, it offers DSGVO-compliant email, calendar, cloud storage, video conferencing, and document editing — all hosted exclusively on servers in Germany.
- **DE:** Datenschutzfreundliche E-Mail- und Produktivitätssuite aus Berlin, aufgebaut auf Open-Source-Software von den Linux-Spezialisten bei Heinlein Support. Ab 1 EUR pro Monat bietet sie DSGVO-konforme E-Mail, Kalender, Cloud-Speicher, Videokonferenzen und Dokumentenbearbeitung — alles ausschließlich auf Servern in Deutschland gehostet.

### 5. StartMail
- **Country:** NL (The Hague) | **Founded:** 2014 | **Open Source:** No
- **Pricing:** paid | **Replaces:** Gmail, Outlook, Yahoo Mail
- **Website:** https://www.startmail.com
- **EN:** Dutch private email service created by the founders of the Startpage search engine. Offers unlimited disposable aliases, built-in PGP encryption, and full IMAP support, with all data stored in the Netherlands under Dutch and EU privacy law.
- **DE:** Niederländischer privater E-Mail-Dienst, entwickelt von den Gründern der Suchmaschine Startpage. Bietet unbegrenzte Wegwerf-Aliase, eingebaute PGP-Verschlüsselung und volle IMAP-Unterstützung — alle Daten werden in den Niederlanden unter niederländischem und EU-Datenschutzrecht gespeichert.

### 6. Disroot
- **Country:** NL (Amsterdam) | **Founded:** 2015 | **Open Source:** No (uses FOSS)
- **Pricing:** free (donations) | **Replaces:** Gmail, Outlook, Yahoo Mail
- **Website:** https://disroot.org
- **EN:** Community-run platform from Amsterdam providing free, privacy-respecting email and collaboration tools built entirely on open-source software. Funded by donations rather than ads or data harvesting, Disroot embodies the principles of decentralization, federation, and digital freedom.
- **DE:** Von der Community betriebene Plattform aus Amsterdam, die kostenlose, datenschutzfreundliche E-Mail und Zusammenarbeitstools bietet — vollständig auf Open-Source-Software aufgebaut. Finanziert durch Spenden statt durch Werbung oder Datensammlung, verkörpert Disroot die Prinzipien von Dezentralisierung, Föderation und digitaler Freiheit.

---

## Social Media — Fediverse Only (5)

### 1. Mastodon
- **Country:** DE (Berlin) | **Founded:** 2016 | **Open Source:** Yes (AGPL-3.0)
- **Pricing:** free | **Replaces:** X/Twitter, Facebook
- **Website:** https://joinmastodon.org | **GitHub:** https://github.com/mastodon/mastodon
- **EN:** Decentralized microblogging platform built in Germany as a non-profit. Mastodon connects millions of users across independently operated servers via ActivityPub, offering a timeline free of ads, algorithms, and corporate surveillance.
- **DE:** Dezentrale Microblogging-Plattform, als gemeinnütziges Projekt in Deutschland entwickelt. Mastodon verbindet Millionen Nutzer über unabhängig betriebene Server via ActivityPub — frei von Werbung, Algorithmen und Überwachung durch Konzerne.

### 2. Pixelfed
- **Country:** EU (open-source project) | **Founded:** 2018 | **Open Source:** Yes (AGPL-3.0)
- **Pricing:** free | **Replaces:** Instagram, Facebook
- **Website:** https://pixelfed.org | **GitHub:** https://github.com/pixelfed/pixelfed
- **EN:** Open-source, federated photo-sharing platform that puts creators first. Pixelfed offers an ad-free, algorithm-free Instagram experience with Stories, Collections, and full ActivityPub federation — all without selling your data.
- **DE:** Open-Source-Fotoplattform mit Föderation, die Kreative in den Mittelpunkt stellt. Pixelfed bietet ein werbe- und algorithmusfreies Instagram-Erlebnis mit Stories, Sammlungen und voller ActivityPub-Integration — ganz ohne Datenverkauf.

### 3. Lemmy
- **Country:** EU (open-source, NLnet-funded) | **Founded:** 2019 | **Open Source:** Yes (AGPL-3.0)
- **Pricing:** free | **Replaces:** Reddit, Facebook Groups
- **Website:** https://join-lemmy.org | **GitHub:** https://github.com/LemmyNet/lemmy
- **EN:** Federated link aggregator and discussion platform written in Rust. Lemmy lets communities self-host their own forums that seamlessly interoperate across the Fediverse, offering a corporate-free alternative to centralized social platforms.
- **DE:** Föderierter Link-Aggregator und Diskussionsplattform in Rust geschrieben. Lemmy ermöglicht Communitys, eigene Foren zu betreiben, die nahtlos im Fediverse vernetzt sind — eine konzernfreie Alternative zu zentralisierten sozialen Plattformen.

### 4. diaspora*
- **Country:** EU (open-source, community-maintained) | **Founded:** 2010 | **Open Source:** Yes (AGPL-3.0)
- **Pricing:** free | **Replaces:** Facebook
- **Website:** https://diasporafoundation.org | **GitHub:** https://github.com/diaspora/diaspora
- **EN:** Pioneering decentralized social network where users own their data. diaspora* distributes content across independently run pods with no central authority, offering aspects-based sharing for fine-grained privacy control.
- **DE:** Wegweisendes dezentrales soziales Netzwerk, in dem Nutzende ihre Daten selbst besitzen. diaspora* verteilt Inhalte über unabhängig betriebene Pods ohne zentrale Instanz und bietet aspektbasiertes Teilen für feingranulare Privatsphärekontrolle.

### 5. Friendica
- **Country:** EU (open-source, multi-protocol) | **Founded:** 2010 | **Open Source:** Yes (AGPL-3.0)
- **Pricing:** free | **Replaces:** Facebook, LinkedIn
- **Website:** https://friendi.ca | **GitHub:** https://github.com/friendica/friendica
- **EN:** Versatile federated social platform that bridges multiple networks. Friendica connects to Mastodon, Diaspora, Bluesky, and more from a single account, offering Facebook-style features like events, photo albums, and threaded discussions.
- **DE:** Vielseitige föderierte Sozialplattform, die mehrere Netzwerke verbindet. Friendica vernetzt sich mit Mastodon, Diaspora, Bluesky und weiteren Diensten über ein einziges Konto und bietet Facebook-ähnliche Funktionen wie Events, Fotoalben und Diskussionsstränge.

---

## Video Hosting (1)

### 1. PeerTube
- **Country:** FR (Lyon) | **Founded:** 2018 | **Open Source:** Yes (AGPL-3.0)
- **Pricing:** free | **Replaces:** YouTube, Vimeo, Twitch
- **Website:** https://joinpeertube.org | **GitHub:** https://github.com/Chocobozzz/PeerTube
- **EN:** Decentralized video hosting platform developed by French non-profit Framasoft. PeerTube federates video and live-streaming across independently run instances via ActivityPub, freeing creators from ads, tracking, and algorithmic manipulation.
- **DE:** Dezentrale Video-Hosting-Plattform, entwickelt vom französischen Verein Framasoft. PeerTube föderiert Video und Livestreaming über unabhängig betriebene Instanzen via ActivityPub — frei von Werbung, Tracking und algorithmischer Manipulation.

---

## Messaging (2)

### 1. Threema
- **Country:** CH (Pfäffikon) | **Founded:** 2012 | **Open Source:** Yes (AGPL-3.0)
- **Pricing:** paid (one-time ~4 EUR) | **Replaces:** WhatsApp, iMessage
- **Website:** https://threema.ch | **GitHub:** https://github.com/threema-ch
- **EN:** Swiss-engineered end-to-end encrypted messenger that requires no phone number or email to sign up, offering maximum anonymity. All servers are in Switzerland, the apps are fully open source, and a one-time purchase means no subscriptions and no ads ever.
- **DE:** In der Schweiz entwickelter Ende-zu-Ende-verschlüsselter Messenger, der weder Telefonnummer noch E-Mail zur Registrierung benötigt und so maximale Anonymität bietet. Alle Server stehen in der Schweiz, die Apps sind vollständig Open Source, und ein einmaliger Kauf bedeutet keine Abonnements und keine Werbung.

### 2. Element
- **Country:** GB (London) | **Founded:** 2017 | **Open Source:** Yes (AGPL-3.0)
- **Pricing:** freemium | **Replaces:** Slack, Discord, WhatsApp
- **Website:** https://element.io | **GitHub:** https://github.com/element-hq
- **EN:** Flagship client for the decentralized Matrix protocol, enabling federated real-time messaging, voice, and video across organizations. Used by governments and NATO, Element lets you self-host or use managed servers, keeping full ownership of your data.
- **DE:** Vorzeige-Client für das dezentrale Matrix-Protokoll, der föderiertes Echtzeit-Messaging, Sprach- und Videoanrufe über Organisationsgrenzen hinweg ermöglicht. Element wird von Regierungen und der NATO genutzt und erlaubt Self-Hosting oder verwaltete Server bei voller Datenhoheit.

---

## Office Suite (4)

### 1. LibreOffice
- **Country:** DE (Berlin) | **Founded:** 2010 | **Open Source:** Yes (MPL-2.0)
- **Pricing:** free | **Replaces:** Microsoft Office, Google Workspace
- **Website:** https://www.libreoffice.org | **GitHub:** https://github.com/LibreOffice/core
- **EN:** Community-driven, full-featured office suite backed by The Document Foundation in Berlin. Offers Writer, Calc, Impress, Draw, Base and Math — all fully compatible with Microsoft formats — and is one of the most widely deployed open-source productivity suites worldwide.
- **DE:** Von der Community entwickelte, umfassende Office-Suite, getragen von der Document Foundation in Berlin. Bietet Writer, Calc, Impress, Draw, Base und Math — vollständig kompatibel mit Microsoft-Formaten — und ist eine der am weitesten verbreiteten Open-Source-Produktivitätslösungen weltweit.

### 2. ONLYOFFICE
- **Country:** LV (Riga) | **Founded:** 2009 | **Open Source:** Yes (AGPL-3.0)
- **Pricing:** freemium | **Replaces:** Microsoft Office, Google Workspace
- **Website:** https://www.onlyoffice.com | **GitHub:** https://github.com/ONLYOFFICE
- **EN:** Latvian-built collaborative office suite with high-fidelity Microsoft Office compatibility. The free Community Edition supports up to 20 users with real-time co-editing of documents, spreadsheets and presentations, while paid plans add enterprise features and unlimited users.
- **DE:** In Lettland entwickelte kollaborative Office-Suite mit hoher Microsoft-Office-Kompatibilität. Die kostenlose Community Edition unterstützt bis zu 20 Nutzer mit Echtzeit-Bearbeitung von Dokumenten, Tabellen und Präsentationen, während kostenpflichtige Pläne Enterprise-Funktionen und unbegrenzte Nutzer bieten.

### 3. CryptPad
- **Country:** FR (Paris) | **Founded:** 2017 | **Open Source:** Yes (AGPL-3.0)
- **Pricing:** freemium | **Replaces:** Google Workspace, Microsoft Office
- **Website:** https://cryptpad.org | **GitHub:** https://github.com/cryptpad/cryptpad
- **EN:** End-to-end encrypted collaborative office suite built by XWiki SAS in Paris. Documents, spreadsheets, presentations, kanban boards and polls are all encrypted in the browser before reaching the server — making it a zero-knowledge alternative adopted even by the United Nations.
- **DE:** Ende-zu-Ende-verschlüsselte kollaborative Office-Suite, entwickelt von XWiki SAS in Paris. Dokumente, Tabellen, Präsentationen, Kanban-Boards und Umfragen werden im Browser verschlüsselt, bevor sie den Server erreichen — eine Zero-Knowledge-Alternative, die sogar von den Vereinten Nationen genutzt wird.

### 4. Collabora Online
- **Country:** GB (Cambridge) | **Founded:** 2005 | **Open Source:** Yes (MPL-2.0)
- **Pricing:** freemium | **Replaces:** Google Workspace, Microsoft Office
- **Website:** https://www.collaboraonline.com | **GitHub:** https://github.com/CollaboraOnline/online
- **EN:** Enterprise-ready online office suite based on LibreOffice technology, developed by Collabora Ltd in Cambridge. Integrates seamlessly with Nextcloud, ownCloud and other platforms for browser-based collaborative editing of documents, spreadsheets and presentations.
- **DE:** Enterprise-fähige Online-Office-Suite basierend auf LibreOffice-Technologie, entwickelt von Collabora Ltd in Cambridge. Integriert sich nahtlos in Nextcloud, ownCloud und andere Plattformen für browserbasierte kollaborative Bearbeitung von Dokumenten, Tabellen und Präsentationen.

---

## Browser (2)

### 1. Vivaldi
- **Country:** NO (Oslo) | **Founded:** 2013 | **Open Source:** No (proprietary UI, Chromium engine)
- **Pricing:** free | **Replaces:** Google Chrome, Safari, Edge
- **Website:** https://vivaldi.com
- **EN:** Feature-rich Norwegian browser with built-in email client, calendar, feed reader and translation. Founded by former Opera CEO Jon von Tetzchner, Vivaldi offers unmatched customisation — tab stacking, split-screen, command chains — while blocking ads and trackers by default.
- **DE:** Funktionsreicher norwegischer Browser mit integriertem E-Mail-Client, Kalender, Feed-Reader und Übersetzung. Gegründet vom ehemaligen Opera-CEO Jon von Tetzchner, bietet Vivaldi unerreichte Anpassungsmöglichkeiten — Tab-Stacking, Split-Screen, Befehlsketten — und blockiert Werbung und Tracker standardmäßig.

### 2. Mullvad Browser
- **Country:** SE (Gothenburg) | **Founded:** 2023 | **Open Source:** Yes (MPL-2.0)
- **Pricing:** free | **Replaces:** Google Chrome, Safari, Edge
- **Website:** https://mullvad.net/en/browser | **GitHub:** https://github.com/mullvad/mullvad-browser
- **EN:** Privacy-focused browser developed by the Tor Project in collaboration with Swedish VPN provider Mullvad. Designed to minimise tracking and fingerprinting out of the box — without requiring a VPN — by shipping the same anti-fingerprinting protections as the Tor Browser.
- **DE:** Datenschutzorientierter Browser, entwickelt vom Tor Project in Zusammenarbeit mit dem schwedischen VPN-Anbieter Mullvad. Minimiert Tracking und Fingerprinting direkt nach der Installation — ohne VPN — durch die gleichen Anti-Fingerprinting-Schutzmaßnahmen wie der Tor Browser.

---

## Maps & Navigation (3)

### 1. OsmAnd
- **Country:** NL (Amstelveen) | **Founded:** 2010 | **Open Source:** Yes (GPL-3.0)
- **Pricing:** freemium | **Replaces:** Google Maps, Apple Maps, Waze
- **Website:** https://osmand.net | **GitHub:** https://github.com/osmandapp/OsmAnd
- **EN:** Powerful offline maps and navigation app built on OpenStreetMap data by a Dutch company. Offers detailed topographic maps, hiking and cycling routes, turn-by-turn navigation, public transport and nautical charts — all available fully offline with monthly map updates.
- **DE:** Leistungsstarke Offline-Karten- und Navigations-App basierend auf OpenStreetMap-Daten, entwickelt von einem niederländischen Unternehmen. Bietet detaillierte topografische Karten, Wander- und Radrouten, Schritt-für-Schritt-Navigation, ÖPNV und Seekarten — alles vollständig offline verfügbar mit monatlichen Kartenaktualisierungen.

### 2. Organic Maps
- **Country:** EE (Tallinn) | **Founded:** 2020 | **Open Source:** Yes (Apache-2.0)
- **Pricing:** free | **Replaces:** Google Maps, Apple Maps
- **Website:** https://organicmaps.app | **GitHub:** https://github.com/organicmaps/organicmaps
- **EN:** Fast, privacy-respecting offline maps app for hikers, cyclists and travellers — forked from Maps.me by its original creators. Uses OpenStreetMap data with absolutely no ads, no tracking and no data collection, and works entirely without an internet connection.
- **DE:** Schnelle, datenschutzfreundliche Offline-Karten-App für Wanderer, Radfahrer und Reisende — von den ursprünglichen Entwicklern als Fork von Maps.me erstellt. Nutzt OpenStreetMap-Daten ganz ohne Werbung, Tracking oder Datensammlung und funktioniert vollständig ohne Internetverbindung.

### 3. Magic Earth
- **Country:** NL (Amsterdam) | **Founded:** 2015 | **Open Source:** No
- **Pricing:** freemium | **Replaces:** Google Maps, Apple Maps, Waze
- **Website:** https://www.magicearth.com
- **EN:** Amsterdam-based navigation app offering free turn-by-turn navigation, offline maps, real-time traffic and speed camera alerts — all powered by OpenStreetMap with zero ads and no user tracking. Used as the default navigation app on several privacy-focused mobile operating systems.
- **DE:** In Amsterdam ansässige Navigations-App mit kostenloser Schritt-für-Schritt-Navigation, Offline-Karten, Echtzeit-Verkehrsdaten und Blitzer-Warnungen — alles basierend auf OpenStreetMap, ohne Werbung und ohne Nutzer-Tracking. Wird als Standard-Navigations-App auf mehreren datenschutzorientierten Mobilbetriebssystemen verwendet.

---

## VPN (5)

### 1. Mullvad VPN
- **Country:** SE (Gothenburg) | **Founded:** 2009 | **Open Source:** Yes (GPL-3.0)
- **Pricing:** paid (flat 5 EUR/mo) | **Replaces:** ExpressVPN
- **Website:** https://mullvad.net | **GitHub:** https://github.com/mullvad/mullvadvpn-app
- **EN:** Swedish privacy-first VPN with a unique account-number-only system — no email, no name, no personal data required. Charges a flat EUR 5/month with no upsells, long-term lock-ins, or discount gimmicks, and has kept the same price since 2009.
- **DE:** Schwedisches VPN mit absolutem Fokus auf Privatsphäre — keine E-Mail, kein Name, keine persönlichen Daten erforderlich. Pauschal 5 EUR/Monat ohne Upselling, Vertragsbindung oder Rabattaktionen, zum gleichen Preis seit 2009.

### 2. Proton VPN
- **Country:** CH (Geneva) | **Founded:** 2017 | **Open Source:** Yes (GPL-3.0)
- **Pricing:** freemium | **Replaces:** ExpressVPN
- **Website:** https://protonvpn.com | **GitHub:** https://github.com/ProtonVPN
- **EN:** Swiss high-speed VPN from the creators of Proton Mail, operated by the non-profit Proton AG under strict Swiss privacy law. Offers a genuinely unlimited free tier with no ads and no data caps — the only major VPN to do so — plus Secure Core multi-hop routing and NetShield ad-blocker on paid plans.
- **DE:** Schweizer Hochgeschwindigkeits-VPN von den Machern von Proton Mail, betrieben von der gemeinnützigen Proton AG unter strengem Schweizer Datenschutzrecht. Bietet eine echte, unbegrenzte Gratis-Stufe ohne Werbung und ohne Datenlimit sowie Secure-Core-Multi-Hop-Routing und NetShield-Werbeblocker in den Bezahlplänen.

### 3. AirVPN
- **Country:** IT (Perugia) | **Founded:** 2010 | **Open Source:** Yes (GPL-3.0)
- **Pricing:** paid | **Replaces:** ExpressVPN
- **Website:** https://airvpn.org | **GitHub:** https://github.com/AirVPN/Eddie
- **EN:** Italian privacy VPN founded by hacktivists and digital-rights activists, offering advanced features like SSH/SSL tunneling and direct Tor integration. Runs its own bare-metal server infrastructure with full disk encryption and publishes real-time server load statistics.
- **DE:** Italienisches Privatsphäre-VPN, gegründet von Hacktivisten und Bürgerrechtlern, mit erweiterten Funktionen wie SSH/SSL-Tunneling und direkter Tor-Integration. Betreibt eigene Bare-Metal-Server mit Festplattenverschlüsselung und veröffentlicht Echtzeit-Serverauslastung.

### 4. IVPN
- **Country:** GB (Gibraltar) | **Founded:** 2009 | **Open Source:** Yes (GPL-3.0)
- **Pricing:** paid | **Replaces:** ExpressVPN
- **Website:** https://www.ivpn.net | **GitHub:** https://github.com/ivpn
- **EN:** Gibraltar-based privacy VPN endorsed by the Freedom of the Press Foundation, with a transparent anti-tracking stance and no surveillance-jurisdiction ties. Supports anonymous sign-up, accepts cash and crypto payments, and publishes an ethics page detailing what it will and will not do.
- **DE:** In Gibraltar ansässiges Privatsphäre-VPN, empfohlen von der Freedom of the Press Foundation, mit transparenter Anti-Tracking-Haltung und keinen Verbindungen zu Überwachungsjurisdiktionen. Unterstützt anonyme Anmeldung, akzeptiert Bar- und Kryptozahlungen und veröffentlicht eine Ethik-Seite.

### 5. NordVPN
- **Country:** NL (Amsterdam — Nord Security parent HQ) | **Founded:** 2012 | **Open Source:** Partial (GPL-3.0 Linux client)
- **Pricing:** paid | **Replaces:** ExpressVPN
- **Website:** https://nordvpn.com | **GitHub:** https://github.com/NordSecurity/nordvpn-linux
- **Note:** Nord Security parent company is headquartered in Amsterdam (NL). VPN product entity registered in Panama. Operations in Vilnius, Lithuania.
- **EN:** Europe's largest cybersecurity unicorn, offering a massive 7,000+ server network across 118 countries with the custom NordLynx protocol built on WireGuard. Nord Security is headquartered in Amsterdam with primary operations in Vilnius, Lithuania, where the Lithuanian founders built the product from the ground up.
- **DE:** Europas größtes Cybersicherheits-Einhorn mit über 7.000 Servern in 118 Ländern und dem eigenen NordLynx-Protokoll auf WireGuard-Basis. Nord Security hat seinen Hauptsitz in Amsterdam mit dem operativen Zentrum in Vilnius, Litauen, wo die litauischen Gründer das Produkt von Grund auf entwickelt haben.

---

## Password Manager (4)

### 1. Proton Pass
- **Country:** CH (Geneva) | **Founded:** 2023 | **Open Source:** Yes (GPL-3.0)
- **Pricing:** freemium | **Replaces:** LastPass, 1Password, Dashlane
- **Website:** https://proton.me/pass | **GitHub:** https://github.com/protonpass
- **EN:** End-to-end encrypted password and identity manager from Swiss-based Proton AG, featuring built-in email aliasing, passkey support, and a generous free tier. Integrates seamlessly with the Proton ecosystem (Mail, VPN, Drive) and stores all data under Swiss privacy law with zero-access encryption.
- **DE:** Ende-zu-Ende-verschlüsselter Passwort- und Identitätsmanager von der Schweizer Proton AG mit integriertem E-Mail-Aliasing, Passkey-Unterstützung und einem großzügigen Gratisangebot. Nahtlose Integration in das Proton-Ökosystem (Mail, VPN, Drive) mit Speicherung unter Schweizer Datenschutzrecht und Zero-Access-Verschlüsselung.

### 2. KeePassXC
- **Country:** DE (Weimar) | **Founded:** 2016 | **Open Source:** Yes (GPL-3.0)
- **Pricing:** free | **Replaces:** LastPass, 1Password, Dashlane
- **Website:** https://keepassxc.org | **GitHub:** https://github.com/keepassxreboot/keepassxc
- **EN:** Community-driven, fully offline password manager that stores credentials in an encrypted local database — no cloud, no account, no subscription. Cross-platform C++ rewrite of KeePass with modern UX, browser integration, SSH agent support, and TOTP, trusted by privacy advocates worldwide.
- **DE:** Community-getriebener, vollständig offline arbeitender Passwort-Manager, der Zugangsdaten in einer verschlüsselten lokalen Datenbank speichert — keine Cloud, kein Konto, kein Abo. Plattformübergreifende C++-Neuentwicklung von KeePass mit moderner Oberfläche, Browser-Integration, SSH-Agent-Unterstützung und TOTP.

### 3. Passbolt
- **Country:** LU (Esch-sur-Alzette) | **Founded:** 2016 | **Open Source:** Yes (AGPL-3.0)
- **Pricing:** freemium | **Replaces:** LastPass, 1Password, Dashlane
- **Website:** https://www.passbolt.com | **GitHub:** https://github.com/passbolt
- **EN:** EU-based open-source password manager purpose-built for teams and DevOps workflows, with self-hosted and cloud options. Made in Luxembourg, Passbolt uses end-to-end encryption based on OpenPGP and offers a fully functional free Community Edition alongside paid business and enterprise tiers.
- **DE:** In der EU ansässiger Open-Source-Passwort-Manager, speziell für Teams und DevOps-Workflows entwickelt, mit Self-Hosted- und Cloud-Optionen. In Luxemburg entwickelt, nutzt Passbolt Ende-zu-Ende-Verschlüsselung auf OpenPGP-Basis und bietet eine voll funktionsfähige kostenlose Community Edition neben Business- und Enterprise-Tarifen.

### 4. Bitwarden *(open-source, US-based)*
- **Country:** EU (Santa Barbara, CA — included for open-source) | **Founded:** 2015 | **Open Source:** Yes (GPL-3.0 / AGPL-3.0)
- **Pricing:** freemium | **Replaces:** LastPass, 1Password, Dashlane
- **Website:** https://bitwarden.com | **GitHub:** https://github.com/bitwarden
- **EN:** Open-source password manager offering end-to-end encrypted storage for passwords, passkeys, credit cards, and sensitive notes across every platform. With a generous free tier, self-hosting support, and full third-party security audits, Bitwarden is the leading transparent alternative to proprietary password vaults.
- **DE:** Open-Source-Passwortmanager mit Ende-zu-Ende-verschlüsselter Speicherung von Passwörtern, Passkeys, Kreditkarten und vertraulichen Notizen auf allen Plattformen. Mit einem großzügigen kostenlosen Tarif, Self-Hosting-Option und vollständigen unabhängigen Sicherheitsaudits ist Bitwarden die führende transparente Alternative zu proprietären Passwort-Tresoren.

---

## Analytics (4)

### 1. Plausible Analytics
- **Country:** EE (Tartu) | **Founded:** 2018 | **Open Source:** Yes (AGPL-3.0)
- **Pricing:** paid | **Replaces:** Google Analytics, Mixpanel, Amplitude
- **Website:** https://plausible.io | **GitHub:** https://github.com/plausible/analytics
- **EN:** Lightweight, open-source web analytics built in the EU. Plausible is cookie-free, fully GDPR-compliant by design, and delivers clear traffic insights in a single-page dashboard — no complex setup or consent banners required.
- **DE:** Leichtgewichtige, quelloffene Webanalyse aus der EU. Plausible kommt ohne Cookies aus, ist von Grund auf DSGVO-konform und liefert klare Traffic-Einblicke auf einem einzigen Dashboard — ohne aufwendige Einrichtung oder Cookie-Banner.

### 2. Matomo
- **Country:** FR (French-founded; legal entity in NZ) | **Founded:** 2007 | **Open Source:** Yes (GPL-3.0)
- **Pricing:** freemium | **Replaces:** Google Analytics, Mixpanel, Amplitude
- **Website:** https://matomo.org | **GitHub:** https://github.com/matomo-org/matomo
- **EN:** The leading open-source alternative to Google Analytics, used on over 1.4 million websites in 190+ countries. Matomo offers full data ownership with self-hosting or EU-hosted cloud, comprehensive visitor analytics, heatmaps, and A/B testing — all under the GPL license.
- **DE:** Die führende Open-Source-Alternative zu Google Analytics, im Einsatz auf über 1,4 Millionen Websites in mehr als 190 Ländern. Matomo bietet volle Datenhoheit durch Self-Hosting oder EU-gehostete Cloud, umfassende Besucheranalysen, Heatmaps und A/B-Tests — alles unter der GPL-Lizenz.

### 3. Pirsch Analytics
- **Country:** DE (Rheda-Wiedenbrück) | **Founded:** 2020 | **Open Source:** Yes (AGPL-3.0)
- **Pricing:** paid | **Replaces:** Google Analytics, Mixpanel
- **Website:** https://pirsch.io | **GitHub:** https://github.com/pirsch-analytics/pirsch
- **EN:** Privacy-friendly, cookie-free web analytics made and hosted in Germany. Pirsch is a server-side solution with an open-source core that is GDPR, CCPA, and Schrems II compliant — designed for developers who want clean, simple dashboards without sacrificing visitor privacy.
- **DE:** Datenschutzfreundliche, cookiefreie Webanalyse — entwickelt und gehostet in Deutschland. Pirsch ist eine serverseitige Lösung mit Open-Source-Kern, DSGVO-, CCPA- und Schrems-II-konform — gemacht für Entwickler, die übersichtliche Dashboards ohne Einbußen bei der Privatsphäre wollen.

### 4. Simple Analytics
- **Country:** NL (Amsterdam) | **Founded:** 2018 | **Open Source:** No
- **Pricing:** paid | **Replaces:** Google Analytics, Amplitude
- **Website:** https://www.simpleanalytics.com
- **EN:** Privacy-first Google Analytics alternative from the Netherlands. Simple Analytics collects zero personal data, uses no cookies, and stores everything on Dutch servers — making it 100% GDPR-compliant out of the box with an AI-powered dashboard for instant insights.
- **DE:** Datenschutz-orientierte Google-Analytics-Alternative aus den Niederlanden. Simple Analytics erhebt keinerlei personenbezogene Daten, verwendet keine Cookies und speichert alles auf niederländischen Servern — von Haus aus 100 % DSGVO-konform, mit KI-gestütztem Dashboard für sofortige Einblicke.

---

## Project Management (3)

### 1. OpenProject
- **Country:** DE (Berlin) | **Founded:** 2012 | **Open Source:** Yes (GPL-3.0)
- **Pricing:** freemium | **Replaces:** Jira, Asana, Monday.com, Trello
- **Website:** https://www.openproject.org | **GitHub:** https://github.com/opf/openproject
- **EN:** The leading open-source project management software from Berlin, supporting classic waterfall, agile Scrum, and hybrid workflows. With Gantt charts, boards, time tracking, budgets, and BIM modules, OpenProject serves teams in governments, enterprises, and NGOs across Europe — all self-hostable under the GPL.
- **DE:** Die führende Open-Source-Projektmanagement-Software aus Berlin — für klassisches Wasserfall-, agiles Scrum- und hybrides Arbeiten. Mit Gantt-Diagrammen, Boards, Zeiterfassung, Budgets und BIM-Modulen unterstützt OpenProject Teams in Behörden, Unternehmen und NGOs in ganz Europa — vollständig selbst hostbar unter der GPL.

### 2. Taiga
- **Country:** ES (Madrid) | **Founded:** 2014 | **Open Source:** Yes (MPL-2.0 / AGPL-3.0)
- **Pricing:** freemium | **Replaces:** Jira, Asana, Trello
- **Website:** https://taiga.io | **GitHub:** https://github.com/kaleidos-ventures/taiga
- **EN:** Free, open-source agile project management platform from Madrid, purpose-built for cross-functional teams. Taiga offers Scrum backlogs, Kanban boards, sprint planning, issue tracking, and a wiki — all in a clean interface that makes agile workflows accessible to everyone.
- **DE:** Freie, quelloffene agile Projektmanagement-Plattform aus Madrid, speziell für crossfunktionale Teams entwickelt. Taiga bietet Scrum-Backlogs, Kanban-Boards, Sprint-Planung, Issue-Tracking und ein Wiki — alles in einer übersichtlichen Oberfläche, die agile Arbeitsweisen für alle zugänglich macht.

### 3. Vikunja
- **Country:** DE | **Founded:** 2018 | **Open Source:** Yes (AGPL-3.0)
- **Pricing:** free | **Replaces:** Trello, Asana, Monday.com
- **Website:** https://vikunja.io | **GitHub:** https://github.com/go-vikunja/vikunja
- **EN:** Open-source, self-hostable task management app from Germany — a privacy-respecting alternative to Todoist, Trello, and ClickUp. Vikunja supports lists, Kanban boards, Gantt charts, CalDAV sync, reminders, and team collaboration, all under the AGPL license.
- **DE:** Quelloffene, selbst hostbare Aufgabenverwaltung aus Deutschland — eine datenschutzfreundliche Alternative zu Todoist, Trello und ClickUp. Vikunja bietet Listen, Kanban-Boards, Gantt-Diagramme, CalDAV-Sync, Erinnerungen und Team-Zusammenarbeit, alles unter der AGPL-Lizenz.

---

## AI & Machine Learning (5)

### 1. DeepL
- **Country:** DE (Cologne) | **Founded:** 2017 | **Open Source:** No
- **Pricing:** freemium | **Replaces:** Google Translate, AWS Translate
- **Website:** https://www.deepl.com | **GitHub:** https://github.com/DeepLcom
- **EN:** Cologne-based AI translation platform widely regarded as more accurate and natural-sounding than Google Translate. Offers neural machine translation for 30+ languages, document translation, a writing assistant, and a developer API — all powered by proprietary deep-learning models trained in Europe.
- **DE:** In Köln ansässige KI-Übersetzungsplattform, die weithin als genauer und natürlicher klingend als Google Translate gilt. Bietet neuronale maschinelle Übersetzung für über 30 Sprachen, Dokumentenübersetzung, einen Schreibassistenten und eine Entwickler-API — alles betrieben von proprietären Deep-Learning-Modellen, die in Europa trainiert wurden.

### 2. Hugging Face
- **Country:** FR (Paris) | **Founded:** 2016 | **Open Source:** Yes (Apache-2.0)
- **Pricing:** freemium | **Replaces:** OpenAI, Google AI, AWS AI
- **Website:** https://huggingface.co | **GitHub:** https://github.com/huggingface
- **Note:** French-founded, US-incorporated. Largest office (70+ staff) is in Paris.
- **EN:** The leading open-source AI platform and model hub, founded by French entrepreneurs in Paris. Hosts over 500,000 models, 100,000 datasets, and the widely-used Transformers library. Provides free community access alongside paid compute and enterprise features, championing open and collaborative AI development.
- **DE:** Die führende Open-Source-KI-Plattform und Modell-Hub, gegründet von französischen Unternehmern in Paris. Beherbergt über 500.000 Modelle, 100.000 Datensätze und die weit verbreitete Transformers-Bibliothek. Bietet kostenlosen Community-Zugang neben kostenpflichtigen Rechen- und Enterprise-Funktionen und setzt sich für offene und kollaborative KI-Entwicklung ein.

### 3. Stability AI
- **Country:** GB (London) | **Founded:** 2019 | **Open Source:** Yes (community license)
- **Pricing:** freemium | **Replaces:** OpenAI DALL-E, Google Imagen, Midjourney
- **Website:** https://stability.ai | **GitHub:** https://github.com/Stability-AI
- **EN:** London-based company behind Stable Diffusion, one of the most widely used open-source image generation models in the world. Offers text-to-image, image-to-video, and audio generation with open model weights, enabling local deployment without reliance on US cloud providers.
- **DE:** In London ansässiges Unternehmen hinter Stable Diffusion, einem der weltweit meistgenutzten Open-Source-Bildgenerierungsmodelle. Bietet Text-zu-Bild, Bild-zu-Video und Audiogenerierung mit offenen Modellgewichten und ermöglicht lokalen Betrieb ohne Abhängigkeit von US-Cloud-Anbietern.

### 4. Black Forest Labs
- **Country:** DE (Freiburg) | **Founded:** 2024 | **Open Source:** Yes (Apache-2.0)
- **Pricing:** freemium | **Replaces:** OpenAI DALL-E, Google Imagen, Midjourney
- **Website:** https://bfl.ai | **GitHub:** https://github.com/black-forest-labs
- **EN:** German AI startup from Freiburg building the FLUX family of state-of-the-art text-to-image models. Founded by former Stability AI researchers who created the original Stable Diffusion, BFL offers open-weight models under Apache 2.0 alongside a commercial API, combining cutting-edge quality with European data sovereignty.
- **DE:** Deutsches KI-Startup aus Freiburg, das die FLUX-Familie hochmoderner Text-zu-Bild-Modelle entwickelt. Gegründet von ehemaligen Stability-AI-Forschern, die das ursprüngliche Stable Diffusion erschufen, bietet BFL offene Modellgewichte unter Apache 2.0 neben einer kommerziellen API und vereint Spitzenqualität mit europäischer Datensouveränität.

### 5. Ollama *(open-source, US-based)*
- **Country:** EU (Palo Alto, CA — included for open-source) | **Founded:** 2023 | **Open Source:** Yes (MIT)
- **Pricing:** freemium | **Replaces:** OpenAI API, Google AI, Anthropic API
- **Website:** https://ollama.com | **GitHub:** https://github.com/ollama/ollama (162k+ stars)
- **EN:** Open-source tool for running large language models locally on your own hardware. Ollama keeps your data fully private with no cloud dependency, offers an OpenAI-compatible API, and supports hundreds of open models including Llama, Mistral, Gemma, and DeepSeek.
- **DE:** Open-Source-Tool zum lokalen Ausführen großer Sprachmodelle auf eigener Hardware. Ollama bewahrt vollständige Datensouveränität ohne Cloud-Abhängigkeit, bietet eine OpenAI-kompatible API und unterstützt hunderte offene Modelle wie Llama, Mistral, Gemma und DeepSeek.

---

## Cloud & Hosting (6)

### 1. Hetzner
- **Country:** DE (Gunzenhausen) | **Founded:** 1997 | **Open Source:** No
- **Pricing:** paid | **Replaces:** AWS, Google Cloud, Azure, Cloudflare
- **Website:** https://www.hetzner.com
- **EN:** German cloud and dedicated hosting provider renowned for unbeatable price-to-performance ratios, transparent billing with no hidden fees, and ISO 27001-certified data centers in Germany, Finland, and the US.
- **DE:** Deutscher Cloud- und Hosting-Anbieter, bekannt für sein unschlagbares Preis-Leistungs-Verhältnis, transparente Abrechnung ohne versteckte Kosten und ISO-27001-zertifizierte Rechenzentren in Deutschland, Finnland und den USA.

### 2. OVHcloud
- **Country:** FR (Roubaix) | **Founded:** 1999 | **Open Source:** No
- **Pricing:** paid | **Replaces:** AWS, Google Cloud, Azure
- **Website:** https://www.ovhcloud.com
- **EN:** Europe's largest cloud provider, operating 40+ data centers worldwide with a strong open-cloud philosophy built on OpenStack. OVHcloud offers public and private cloud, bare-metal servers, and managed Kubernetes with no egress fees.
- **DE:** Europas größter Cloud-Anbieter mit über 40 Rechenzentren weltweit und einer offenen Cloud-Philosophie auf Basis von OpenStack. OVHcloud bietet Public und Private Cloud, Bare-Metal-Server und Managed Kubernetes ohne Egress-Gebühren.

### 3. Scaleway
- **Country:** FR (Paris) | **Founded:** 1999 | **Open Source:** No
- **Pricing:** freemium | **Replaces:** AWS, Google Cloud, Azure, Cloudflare
- **Website:** https://www.scaleway.com
- **EN:** Developer-friendly French cloud provider and Iliad Group subsidiary offering compute, storage, managed databases, serverless functions, and GPU instances for AI workloads — all hosted in EU data centers with transparent pricing and generous free tiers.
- **DE:** Entwicklerfreundlicher französischer Cloud-Anbieter und Tochtergesellschaft der Iliad-Gruppe mit Compute, Storage, Managed Databases, Serverless Functions und GPU-Instanzen für KI-Workloads — alles in EU-Rechenzentren mit transparenter Preisgestaltung und großzügigen Free Tiers.

### 4. Infomaniak
- **Country:** CH (Geneva) | **Founded:** 1994 | **Open Source:** No
- **Pricing:** paid | **Replaces:** AWS, Google Cloud, Azure
- **Website:** https://www.infomaniak.com
- **EN:** Employee-owned Swiss hosting and cloud provider powering over 100,000 websites with servers running exclusively on renewable energy in Swiss data centers. Infomaniak offers web hosting, email, kSuite productivity tools, kDrive storage, and the Euria AI assistant — all GDPR- and nFADP-compliant with no data resale.
- **DE:** Mitarbeitergeführter Schweizer Hosting- und Cloud-Anbieter, der über 100.000 Websites betreibt, mit Servern ausschließlich in Schweizer Rechenzentren und 100 % erneuerbarer Energie. Infomaniak bietet Webhosting, E-Mail, kSuite-Produktivitätstools, kDrive-Speicher und den KI-Assistenten Euria — alles DSGVO- und nDSG-konform, ohne Weiterverkauf von Daten.

### 5. Hostinger
- **Country:** LT (Vilnius) | **Founded:** 2004 | **Open Source:** No
- **Pricing:** paid | **Replaces:** AWS, Google Cloud, Azure, Cloudflare
- **Website:** https://www.hostinger.com
- **EN:** Lithuanian web hosting and cloud infrastructure provider serving over 4 million customers in 150+ countries. Offers shared hosting, cloud hosting, VPS, email hosting, and an AI-powered website builder — all at aggressive price points with GDPR-compliant, ISO 27001-certified data centers across Europe.
- **DE:** Litauischer Webhosting- und Cloud-Infrastrukturanbieter mit über 4 Millionen Kunden in mehr als 150 Ländern. Bietet Shared Hosting, Cloud Hosting, VPS, E-Mail-Hosting und einen KI-gestützten Website-Baukasten — alles zu wettbewerbsfähigen Preisen mit DSGVO-konformen, ISO-27001-zertifizierten Rechenzentren in Europa.

### 6. IONOS
- **Country:** DE (Montabaur) | **Founded:** 1988 | **Open Source:** No
- **Pricing:** paid | **Replaces:** AWS, Google Cloud, Azure, Cloudflare
- **Website:** https://www.ionos.com | **GitHub:** https://github.com/ionos-cloud
- **EN:** Europe's largest hosting provider, born from the 1988-founded German pioneer 1&1 and cloud specialist ProfitBricks. IONOS serves over 6 million customers, manages 22 million domains, and operates 31 data centers — including German facilities powered by 100% renewable energy — with full GDPR compliance and ISO 27001 certification.
- **DE:** Europas größter Hosting-Anbieter, hervorgegangen aus dem 1988 gegründeten deutschen Pionier 1&1 und dem Cloud-Spezialisten ProfitBricks. IONOS betreut über 6 Millionen Kunden, verwaltet 22 Millionen Domains und betreibt 31 Rechenzentren — darunter deutsche Standorte mit 100 % erneuerbarer Energie — bei vollständiger DSGVO-Konformität und ISO-27001-Zertifizierung.

---

## Payments (2)

### 1. Mollie
- **Country:** NL (Amsterdam) | **Founded:** 2004 | **Open Source:** No
- **Pricing:** paid | **Replaces:** Stripe, PayPal, Square
- **Website:** https://www.mollie.com
- **EN:** Dutch payment service provider offering a simple, pay-per-transaction model with no setup fees, no monthly charges, and no lock-in contracts. Mollie supports 25+ payment methods including iDEAL, SEPA, Klarna, and credit cards — making it the go-to Stripe alternative for European merchants.
- **DE:** Niederländischer Zahlungsdienstleister mit einem einfachen Pay-per-Transaction-Modell ohne Einrichtungsgebühren, Monatskosten oder Vertragsbindung. Mollie unterstützt über 25 Zahlungsmethoden wie iDEAL, SEPA, Klarna und Kreditkarten — die erste Wahl als Stripe-Alternative für europäische Händler.

### 2. Adyen
- **Country:** NL (Amsterdam) | **Founded:** 2006 | **Open Source:** No
- **Pricing:** paid | **Replaces:** Stripe, PayPal, Square
- **Website:** https://www.adyen.com
- **EN:** Amsterdam-based global payments platform with acquiring-bank status, powering checkout for enterprises like Spotify, Uber, and eBay. Adyen uses interchange++ pricing for full cost transparency and supports in-store, online, and mobile payments in a single unified platform.
- **DE:** Globale Zahlungsplattform mit Banklizenz aus Amsterdam, die den Checkout für Unternehmen wie Spotify, Uber und eBay abwickelt. Adyen nutzt Interchange++-Preise für volle Kostentransparenz und vereint In-Store-, Online- und Mobile-Zahlungen in einer einzigen Plattform.

---

## E-Commerce (3)

### 1. PrestaShop
- **Country:** FR (Paris) | **Founded:** 2007 | **Open Source:** Yes (OSL-3.0)
- **Pricing:** freemium | **Replaces:** Shopify, Amazon, eBay
- **Website:** https://prestashop.com | **GitHub:** https://github.com/PrestaShop/PrestaShop
- **EN:** The most widely adopted open-source e-commerce platform in Europe, powering over 300,000 online shops in 60 languages. Self-hosted and fully customizable, PrestaShop offers a rich module marketplace and is free to download under the Open Software License.
- **DE:** Die meistgenutzte Open-Source-E-Commerce-Plattform in Europa mit über 300.000 Online-Shops in 60 Sprachen. Selbst gehostet und vollständig anpassbar, bietet PrestaShop einen umfangreichen Modul-Marktplatz und ist kostenlos unter der Open Software License verfügbar.

### 2. Shopware
- **Country:** DE (Schoeppingen) | **Founded:** 2000 | **Open Source:** Yes (MIT)
- **Pricing:** freemium | **Replaces:** Shopify, Amazon
- **Website:** https://www.shopware.com | **GitHub:** https://github.com/shopware/shopware
- **EN:** German open-source e-commerce platform built on Symfony and Vue.js, and market leader in Germany's top-1000 online shops. The MIT-licensed Community Edition is free, while commercial plans add headless capabilities, B2B features, and SaaS hosting.
- **DE:** Deutsche Open-Source-E-Commerce-Plattform auf Basis von Symfony und Vue.js und Marktführer unter den Top-1000-Online-Shops in Deutschland. Die MIT-lizenzierte Community Edition ist kostenlos, während kommerzielle Pläne Headless-Fähigkeiten, B2B-Funktionen und SaaS-Hosting bieten.

### 3. Saleor
- **Country:** PL (Wroclaw) | **Founded:** 2020 | **Open Source:** Yes (BSD-3-Clause)
- **Pricing:** freemium | **Replaces:** Shopify
- **Website:** https://saleor.io | **GitHub:** https://github.com/saleor/saleor
- **EN:** Polish-built, GraphQL-first headless commerce platform designed for composable, API-driven storefronts. With 21,000+ GitHub stars and a BSD-3-Clause license, Saleor is ideal for developers who need full flexibility and modern stack integration.
- **DE:** In Polen entwickelte, GraphQL-first Headless-Commerce-Plattform für modulare, API-gesteuerte Storefronts. Mit über 21.000 GitHub-Stars und einer BSD-3-Clause-Lizenz ist Saleor ideal für Entwickler, die volle Flexibilität und moderne Stack-Integration benötigen.

---

## Removed (per user request)

- ~~Aleph Alpha~~ — removed by user
- ~~LocalAI~~ — replaced by Ollama
- ~~Wire~~ — removed by user
- ~~SimpleX Chat~~ — removed by user
- ~~Olvid~~ — removed by user
- ~~Dailymotion~~ — removed by user
- ~~Non-fediverse social media~~ — all were fediverse, nothing removed
