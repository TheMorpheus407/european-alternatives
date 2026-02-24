import type { Alternative } from '../types';

// Generated from data/research/master-research.md
// via scripts/generate-research-catalog.mjs
// Last generated: 2026-02-10T21:36:06.227Z

export const researchAlternatives: Alternative[] = [
  {
    "id": "airvpn",
    "name": "AirVPN",
    "category": "vpn",
    "country": "it",
    "replacesUS": [
      "ExpressVPN"
    ],
    "pricing": "paid",
    "website": "https://airvpn.org",
    "description": "Italian privacy VPN founded by hacktivists and digital-rights activists, offering advanced features like SSH/SSL tunneling and direct Tor integration. Runs its own bare-metal server infrastructure with full disk encryption and publishes real-time server load statistics.",
    "localizedDescriptions": {
      "de": "Italienisches Privatsphäre-VPN, gegründet von Hacktivisten und Bürgerrechtlern, mit erweiterten Funktionen wie SSH/SSL-Tunneling und direkter Tor-Integration. Betreibt eigene Bare-Metal-Server mit Festplattenverschlüsselung und veröffentlicht Echtzeit-Serverauslastung."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "openSourceAuditUrl": "https://github.com/AirVPN",
    "tags": [
      "vpn",
      "paid",
      "open-source",
      "privacy",
      "encryption",
      "expressvpn"
    ],
    "foundedYear": 2010,
    "headquartersCity": "Perugia",
    "sourceCodeUrl": "https://github.com/AirVPN/Eddie",
    "license": "GPL-3.0 (Eddie client); proprietary server infrastructure"
  },
  {
    "id": "aitch-systems",
    "name": "aitch.systems",
    "category": "hosting",
    "country": "de",
    "replacesUS": [
      "AWS",
      "Google Cloud",
      "Azure",
      "DigitalOcean"
    ],
    "pricing": "paid",
    "website": "https://aitch.systems",
    "description": "German hosting provider offering KVM servers (AMD EPYC, Ryzen), webspaces with Plesk, domains, and game servers. Based in Schwabmünchen, Germany with servers in NorthC Datacenters Nuremberg. Operates with premium DDoS protection via Inter.link.",
    "localizedDescriptions": {
      "de": "Deutscher Hosting-Anbieter mit KVM-Servern (AMD EPYC, Ryzen), Webspaces mit Plesk, Domains und Gameservern. Sitz in Schwabmünchen, Deutschland mit Servern im NorthC Datacenter Nürnberg. Betrieb mit Premium DDoS-Schutz via Inter.link."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "hosting",
      "paid",
      "kvm",
      "vps",
      "webhosting",
      "gameserver",
      "ddos-protection",
      "gdpr"
    ],
    "foundedYear": 2023,
    "headquartersCity": "Schwabmünchen"
  },
  {
    "id": "aliasvault",
    "name": "AliasVault",
    "category": "password-manager",
    "country": "nl",
    "replacesUS": [
      "1Password",
      "Dashlane",
      "LastPass"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://aliasvault.net",
    "description": "Privacy-first password manager with built-in email aliasing. End-to-end encrypted with zero-knowledge architecture. Self-hostable via Docker. Founded by Dutch developer with 15 years privacy tool experience.",
    "localizedDescriptions": {
      "de": "Datenschutzorientierter Passwortmanager mit integrierter E-Mail-Alias-Funktion. Ende-zu-Ende-verschlüsselt mit Zero-Knowledge-Architektur. Self-Hosting via Docker möglich. Gegründet von einem niederländischen Entwickler mit 15 Jahren Erfahrung im Datenschutzbereich."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "openSourceAuditUrl": "https://github.com/aliasvault/aliasvault",
    "tags": [
      "password-manager",
      "free",
      "open-source",
      "encryption",
      "self-hosted",
      "email-alias",
      "privacy"
    ],
    "foundedYear": 2024,
    "headquartersCity": "Netherlands",
    "sourceCodeUrl": "https://github.com/aliasvault/aliasvault",
    "license": "AGPL-3.0"
  },
  {
    "id": "alfaview",
    "name": "alfaview",
    "category": "meeting-software",
    "country": "de",
    "replacesUS": [
      "Zoom",
      "Microsoft Teams",
      "Google Meet"
    ],
    "pricing": "freemium",
    "website": "https://alfaview.com",
    "logo": "/logos/alfaview.svg",
    "description": "German video conferencing software for professional meetings, webinars, and virtual events. 100% GDPR compliant and ISO 27001 certified with all data centers located in Germany. Developed and operated by alfaview GmbH in Karlsruhe.",
    "localizedDescriptions": {
      "de": "Deutsche Videokonferenzsoftware für professionelle Meetings, Webinare und virtuelle Events. 100% DSGVO-konform und ISO 27001-zertifiziert mit allen Rechenzentren in Deutschland. Entwickelt und betrieben von alfaview GmbH in Karlsruhe."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "meeting-software",
      "videoconferencing",
      "gdpr",
      "iso-27001",
      "german",
      "saas",
      "webinar",
      "privacy"
    ],
    "foundedYear": 2018,
    "headquartersCity": "Karlsruhe",
    "license": "proprietary"
  },
  {
    "id": "aurora-store",
    "name": "Aurora Store",
    "category": "mobile-os",
    "country": "in",
    "replacesUS": [
      "Google Play Store"
    ],
    "pricing": "free",
    "website": "https://auroraoss.com",
    "description": "Open-source Google Play Store client for Android. Allows downloading, updating, and searching apps from Google Play without requiring Google Play Services. Features include anonymous login, device/locale spoofing, Exodus Privacy integration for tracker detection, and update blacklisting. Developed by independent developer Rahul Kumar Patel.",
    "localizedDescriptions": {
      "de": "Open-Source Google Play Store Client für Android. Ermöglicht das Herunterladen, Aktualisieren und Suchen von Apps aus dem Google Play Store ohne Google Play Services. Funktionen beinhalten anonymes Login, Geräts-/Locale-Spoofing, Exodus Privacy Integration zur Tracker-Erkennung und Update-Blacklisting. Entwickelt von unabhängigem Entwickler Rahul Kumar Patel."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://gitlab.com/AuroraOSS/AuroraStore",
    "tags": [
      "app-store",
      "android",
      "foss",
      "privacy",
      "open-source",
      "google-play"
    ],
    "foundedYear": 2018,
    "headquartersCity": "India",
    "license": "GPL-3.0"
  },
  {
    "id": "aves-gallery",
    "name": "Aves Gallery",
    "category": "mobile-os",
    "country": "fr",
    "replacesUS": [
      "Google Photos"
    ],
    "pricing": "free",
    "website": "https://github.com/deckerst/aves",
    "logo": "/logos/aves-gallery.svg",
    "description": "Open-source gallery and metadata explorer app for Android, built with Flutter. Aves handles various image and video formats including JPEGs, MP4s, multi-page TIFFs, SVGs, and more. Features include motion photo detection, panorama support, 360-degree video handling, and geoTIFF support. Developed by independent French developer Thibault Deckers.",
    "localizedDescriptions": {
      "de": "Open-Source-Galerie- und Metadaten-Explorer-App für Android, entwickelt mit Flutter. Aves verarbeitet verschiedene Bild- und Videoformate einschließlich JPEGs, MP4s, Multi-Seiten-TIFFs, SVGs und mehr. Funktionen umfassen Motion-Photo-Erkennung, Panorama-Unterstützung, 360-Grad-Video-Handhabung und GeoTIFF-Unterstützung. Entwickelt von unabhängigem französischem Entwickler Thibault Deckers."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/deckerst/aves",
    "tags": [
      "gallery",
      "android",
      "photo",
      "metadata",
      "foss",
      "privacy",
      "open-source"
    ],
    "foundedYear": 2020,
    "headquartersCity": "France",
    "license": "BSD-3-Clause"
  },
  {
    "id": "bitwarden",
    "name": "Bitwarden",
    "category": "password-manager",
    "country": "us",
    "replacesUS": [
      "LastPass",
      "1Password",
      "Dashlane"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://bitwarden.com",
    "description": "US-based but fully open-source password manager offering end-to-end encrypted storage for passwords, passkeys, credit cards, and sensitive notes across every platform. With a generous free tier, self-hosting support, and full third-party security audits, Bitwarden is the leading transparent alternative to proprietary password vaults. Note: Bitwarden is headquartered in the US but included here for its open-source nature and self-hosting capability.",
    "localizedDescriptions": {
      "de": "In den USA ansässiger, aber vollständig quelloffener Passwortmanager mit Ende-zu-Ende-verschlüsselter Speicherung von Passwörtern, Passkeys, Kreditkarten und vertraulichen Notizen auf allen Plattformen. Mit einem großzügigen kostenlosen Tarif, Self-Hosting-Option und vollständigen unabhängigen Sicherheitsaudits ist Bitwarden die führende transparente Alternative zu proprietären Passwort-Tresoren. Hinweis: Bitwarden hat seinen Sitz in den USA, wird aber aufgrund seiner Open-Source-Natur und Self-Hosting-Möglichkeit hier gelistet."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "password-manager",
      "freemium",
      "open-source",
      "encryption",
      "hosting",
      "lastpass",
      "1password"
    ],
    "foundedYear": 2015,
    "headquartersCity": "Santa Barbara, CA",
    "sourceCodeUrl": "https://github.com/bitwarden",
    "license": "GPL-3.0 / AGPL-3.0"
  },
  {
    "id": "bbbserver",
    "name": "bbbserver",
    "category": "meeting-software",
    "country": "de",
    "replacesUS": [
      "Zoom",
      "Google Meet",
      "Microsoft Teams"
    ],
    "pricing": "paid",
    "website": "https://bbbserver.com",
    "description": "German SaaS video conferencing platform based on BigBlueButton, offering GDPR-compliant hosted meetings with features like screen sharing, breakout rooms, whiteboards, and recording. Operated by invokable GmbH from Remscheid, Germany, with servers in ISO 27001-certified European data centers. Provides dedicated instances for businesses, educational institutions, and public authorities.",
    "localizedDescriptions": {
      "de": "Deutsche SaaS-Videokonferenzplattform basierend auf BigBlueButton, die GDPR-konforme gehostete Meetings mit Funktionen wie Bildschirmfreigabe, Breakout-Räumen, Whiteboards und Aufzeichnung bietet. Betrieben von invokable GmbH aus Remscheid, Deutschland, mit Servern in ISO 27001-zertifizierten europäischen Rechenzentren. Bietet dedizierte Instanzen für Unternehmen, Bildungseinrichtungen und öffentliche Behörden."
    },
    "isOpenSource": false,
    "openSourceLevel": "partial",
    "sourceCodeUrl": "https://github.com/bigbluebutton/bigbluebutton",
    "tags": [
      "meeting-software",
      "videoconferencing",
      "saas",
      "gdpr",
      "privacy",
      "european-hosting",
      "bigbluebutton"
    ],
    "headquartersCity": "Remscheid"
  },
  {
    "id": "brave",
    "name": "Brave",
    "category": "browser",
    "country": "us",
    "replacesUS": [
      "Google Chrome",
      "Safari",
      "Edge"
    ],
    "pricing": "free",
    "website": "https://brave.com",
    "description": "Privacy-focused web browser built on Chromium, developed by Brave Software Inc. in San Francisco. Blocks ads and trackers by default, offers built-in VPN, and includes Brave Search. Client code is open source under MPL-2.0.",
    "localizedDescriptions": {
      "de": "Datenschutzorientierter Webbrowser, basierend auf Chromium, entwickelt von Brave Software Inc. in San Francisco. Blockiert standardmäßig Werbung und Tracker, bietet integrierte VPN-Suche und Brave Search. Client-Code ist quelloffen unter MPL-2.0."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/brave/brave-browser",
    "tags": [
      "browser",
      "free",
      "open-source",
      "privacy",
      "google-chrome",
      "safari"
    ],
    "foundedYear": 2015,
    "headquartersCity": "San Francisco",
    "license": "MPL-2.0"
  },
  {
    "id": "borgbackup",
    "name": "BorgBackup",
    "category": "cloud-storage",
    "country": "eu",
    "logo": "/logos/borgbackup.svg",
    "replacesUS": [
      "Time Machine",
      "iCloud Backup",
      "Backblaze"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://www.borgbackup.org",
    "description": "Open-source deduplicating backup archiver with compression and authenticated encryption. Provides efficient space-efficient storage through content-defined chunking, supports client-side AES-256 encryption (AES-OCB or chacha20-poly1305), and runs on Linux, macOS, BSD, and WSL. Self-hostable with no vendor lock-in.",
    "localizedDescriptions": {
      "de": "Open-Source-Backup-Archivierer mit Deduplizierung, Komprimierung und authentifizierter Verschlüsselung. Bietet platzsparende Speicherung durch Content-defined Chunking, unterstützt clientseitige AES-256-Verschlüsselung (AES-OCB oder chacha20-poly1305) und läuft auf Linux, macOS, BSD und WSL. Self-Hosting ohne Anbieterbindung möglich."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/borgbackup/borg",
    "tags": [
      "backup",
      "encryption",
      "deduplication",
      "open-source",
      "self-hosted",
      "cli"
    ],
    "foundedYear": 2015,
    "headquartersCity": "International",
    "license": "BSD-3-Clause"
  },
  {
    "id": "black-forest-labs",
    "name": "Black Forest Labs",
    "category": "ai-ml",
    "country": "de",
    "replacesUS": [
      "OpenAI DALL-E",
      "Google Imagen",
      "Nano Banana Pro",
      "Midjourney"
    ],
    "pricing": "freemium",
    "website": "https://bfl.ai",
    "description": "German AI startup from Freiburg building the FLUX family of text-to-image models. Licensing is intentionally split: FLUX.1 [schnell] is Apache 2.0, FLUX.1 [dev] is non-commercial, and FLUX.1 [pro] is API-only proprietary.",
    "localizedDescriptions": {
      "de": "Deutsches KI-Startup aus Freiburg, das die FLUX-Familie hochmoderner Text-zu-Bild-Modelle entwickelt. Gegründet von ehemaligen Stability-AI-Forschern, die das ursprüngliche Stable Diffusion erschufen, bietet BFL offene Modellgewichte unter Apache 2.0 neben einer kommerziellen API und vereint Spitzenqualität mit europäischer Datensouveränität."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "openSourceAuditUrl": "https://github.com/black-forest-labs/flux",
    "tags": [
      "ai-ml",
      "freemium",
      "open-source",
      "openai-dall-e",
      "google-imagen"
    ],
    "foundedYear": 2024,
    "headquartersCity": "Freiburg",
    "sourceCodeUrl": "https://github.com/black-forest-labs",
    "license": "Apache-2.0 (FLUX.1 [schnell]); non-commercial (FLUX.1 [dev]); proprietary API (FLUX.1 [pro])"
  },
  {
    "id": "collabora-online",
    "name": "Collabora Online",
    "category": "office-suite",
    "country": "gb",
    "replacesUS": [
      "Google Workspace",
      "Microsoft Office"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://www.collaboraonline.com",
    "description": "Enterprise-ready online office suite based on LibreOffice technology, developed by Collabora Ltd in Cambridge. Integrates seamlessly with Nextcloud, ownCloud and other platforms for browser-based collaborative editing of documents, spreadsheets and presentations.",
    "localizedDescriptions": {
      "de": "Enterprise-fähige Online-Office-Suite basierend auf LibreOffice-Technologie, entwickelt von Collabora Ltd in Cambridge. Integriert sich nahtlos in Nextcloud, ownCloud und andere Plattformen für browserbasierte kollaborative Bearbeitung von Dokumenten, Tabellen und Präsentationen."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "office-suite",
      "freemium",
      "open-source",
      "cloud",
      "browser",
      "google-workspace",
      "microsoft-office"
    ],
    "foundedYear": 2005,
    "headquartersCity": "Cambridge",
    "sourceCodeUrl": "https://github.com/CollaboraOnline/online",
    "license": "MPL-2.0"
  },
  {
    "id": "cryptpad",
    "name": "CryptPad",
    "category": "office-suite",
    "country": "fr",
    "replacesUS": [
      "Google Workspace",
      "Microsoft Office"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://cryptpad.org",
    "description": "End-to-end encrypted collaborative office suite built by XWiki SAS in Paris. Documents, spreadsheets, presentations, kanban boards and polls are all encrypted in the browser before reaching the server, but trust still depends on the chosen instance serving untampered client code and secure link-sharing practices.",
    "localizedDescriptions": {
      "de": "Ende-zu-Ende-verschlüsselte kollaborative Office-Suite, entwickelt von XWiki SAS in Paris. Dokumente, Tabellen, Präsentationen, Kanban-Boards und Umfragen werden im Browser verschlüsselt, bevor sie den Server erreichen; das Vertrauen hängt jedoch weiterhin davon ab, dass die gewählte Instanz unveränderten Client-Code ausliefert und Freigabe-Links sicher geteilt werden."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "office-suite",
      "freemium",
      "open-source",
      "encryption",
      "zero-knowledge",
      "browser",
      "google-workspace",
      "microsoft-office"
    ],
    "foundedYear": 2017,
    "headquartersCity": "Paris",
    "sourceCodeUrl": "https://github.com/cryptpad/cryptpad",
    "license": "AGPL-3.0"
  },
  {
    "id": "cyberghost-vpn",
    "name": "CyberGhost VPN",
    "category": "vpn",
    "country": "ro",
    "replacesUS": [
      "ExpressVPN"
    ],
    "pricing": "paid",
    "website": "https://www.cyberghostvpn.com",
    "description": "Romanian VPN service founded in 2011 in Bucharest, now owned by UK-based Kape Technologies (also owns ExpressVPN, PIA, ZenMate). Operates under CyberGhost S.R.L. as the legal entity and data controller. Offers no-logs VPN with global server network.",
    "localizedDescriptions": {
      "de": "Rumänischer VPN-Dienst, 2011 in Bukarest gegründet, jetzt im Besitz der britischen Kape Technologies (betreibt auch ExpressVPN, PIA, ZenMate). Rechtlich operiert unter CyberGhost S.R.L. als Datenschutzverantwortlicher. Bietet No-Logs-VPN mit globalem Servernetz."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "vpn",
      "paid",
      "privacy",
      "no-logs",
      "expressvpn"
    ],
    "foundedYear": 2011,
    "headquartersCity": "Bucharest"
  },
  {
    "id": "dns4eu",
    "name": "DNS4EU",
    "category": "dns",
    "country": "cz",
    "replacesUS": [
      "Google DNS",
      "Cloudflare DNS",
      "OpenDNS"
    ],
    "pricing": "free",
    "website": "https://joindns4.eu",
    "description": "EU-funded DNS resolver service led by Czech cybersecurity company Whalebone, providing privacy-compliant and secure DNS resolution to strengthen European digital sovereignty. The public service offers multiple configuration options including basic protection, child protection, and ad blocking. Operated from Brno, Czech Republic with data processing entirely within the EU.",
    "localizedDescriptions": {
      "de": "EU-finanzierter DNS-Resolver-Dienst unter der Führung des tschechischen Cybersicherheitsunternehmens Whalebone, der datenschutzkonforme und sichere DNS-Auflösung für europäische digitale Souveränität bietet. Der öffentliche Dienst bietet mehrere Konfigurationsoptionen einschließlich grundlegendem Schutz, Kinderschutz und Werbeblocker. Betrieben von Brno, Tschechische Republik, mit Datenverarbeitung vollständig innerhalb der EU."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "dns",
      "free",
      "privacy",
      "gdpr",
      "digital-sovereignty",
      "eu-funded"
    ],
    "foundedYear": 2023,
    "headquartersCity": "Brno"
  },
  {
    "id": "datalix",
    "name": "Datalix",
    "category": "hosting",
    "country": "de",
    "replacesUS": [
      "AWS",
      "Google Cloud",
      "Azure",
      "Cloudflare"
    ],
    "pricing": "paid",
    "website": "https://datalix.de",
    "description": "German hosting provider offering KVM servers (Xeon, Ryzen, Epyc), dedicated servers, gameservers (Minecraft, Factorio, Valheim, Rust), webhosting, Nextcloud hosting, colocation, and reseller options. Based in Estenfeld, Germany with servers in Equinix data centers (FR5, FR7, FR8) in Frankfurt. Operates on 100% renewable energy with Tier III certified infrastructure.",
    "localizedDescriptions": {
      "de": "Deutscher Hosting-Anbieter mit KVM-Servern (Xeon, Ryzen, Epyc), Dedicated Servern, Gameservern (Minecraft, Factorio, Valheim, Rust), Webhosting, Nextcloud-Hosting, Colocation und Reseller-Optionen. Sitz in Estenfeld, Deutschland, mit Servern in Equinix-Rechenzentren (FR5, FR7, FR8) in Frankfurt. Betrieb zu 100 % mit erneuerbarer Energie und Tier-III-zertifizierter Infrastruktur."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "hosting",
      "paid",
      "kvm",
      "dedicated-server",
      "webhosting",
      "gameserver",
      "nextcloud",
      "gdpr"
    ],
    "foundedYear": 2022,
    "headquartersCity": "Estenfeld"
  },
  {
    "id": "dashserv",
    "name": "dashserv",
    "category": "hosting",
    "country": "de",
    "replacesUS": [
      "AWS",
      "Google Cloud",
      "Azure",
      "Cloudflare"
    ],
    "pricing": "paid",
    "logo": "/logos/dashserv.svg",
    "website": "https://dashserv.io",
    "description": "German hosting provider offering KVM vServers (AMD Ryzen, Xeon Gold), dedicated servers, webhosting, domains, gameservers, and colocation. Operated by Realtox Media (Felix Gassan) with data centers in Düsseldorf (myLoc) and Frankfurt (NTT). All services include premium DDoS protection.",
    "localizedDescriptions": {
      "de": "Deutscher Hosting-Anbieter mit KVM vServern (AMD Ryzen, Xeon Gold), Dedicated Servern, Webhosting, Domains, Gameservern und Colocation. Betrieben von Realtox Media (Felix Gassan) mit Rechenzentren in Düsseldorf (myLoc) und Frankfurt (NTT). Alle Dienste inklusive Premium DDoS-Schutz."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "hosting",
      "paid",
      "kvm",
      "vps",
      "dedicated-server",
      "webhosting",
      "gameserver",
      "ddos-protection",
      "gdpr"
    ],
    "foundedYear": 2018,
    "headquartersCity": "Hamburg",
    "reservations": [
      {
        "id": "transaction-logging-issues",
        "text": "The customer portal has reported transaction logging issues - transactions may not display correctly in the web interface. This is an operational/UX concern rather than a trust issue.",
        "textDe": "Das Kunden-Portal hat Probleme mit der Transaktionsprotokollierung - Transaktionen werden möglicherweise nicht korrekt in der Weboberfläche angezeigt. Dies ist ein operatives/UX-Problem, kein Vertrauensproblem.",
        "severity": "minor",
        "sourceUrl": "https://github.com/TheMorpheus407/european-alternatives/issues/44"
      }
    ]
  },
  {
    "id": "ph24",
    "name": "ph24",
    "category": "hosting",
    "country": "de",
    "replacesUS": [
      "AWS",
      "Google Cloud",
      "Azure",
      "Cloudflare"
    ],
    "pricing": "paid",
    "website": "https://ph24.io",
    "description": "German hosting provider offering cloud hosting, Kubernetes clusters, and web hosting services. Based in Frankfurt am Main, Germany with infrastructure at maincubes and NTT data centers (ISO 27001, 9001, DIN EN 50600 Tier II/III). Operated by Nicolas Janzen with a focus on quality and customer support.",
    "localizedDescriptions": {
      "de": "Deutscher Hosting-Anbieter mit Cloud-Hosting, Kubernetes-Clustern und Webhosting. Sitz in Frankfurt am Main mit Infrastruktur bei maincubes und NTT Rechenzentren (ISO 27001, 9001, DIN EN 50600 Tier II/III). Betrieben von Nicolas Janzen mit Fokus auf Qualität und Kundenbetreuung."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "hosting",
      "paid",
      "cloud",
      "kubernetes",
      "webhosting",
      "gdpr"
    ],
    "foundedYear": 2018,
    "headquartersCity": "Frankfurt"
  },
  {
    "id": "deepl",
    "name": "DeepL",
    "category": "ai-ml",
    "country": "de",
    "replacesUS": [
      "Google Translate",
      "AWS Translate"
    ],
    "pricing": "freemium",
    "website": "https://www.deepl.com",
    "description": "Cologne-based AI translation platform known for high-quality translation and writing assistance. DeepL trains on European infrastructure, including its Mercury NVIDIA DGX SuperPOD in Sweden, and states that Pro/API customer text is excluded from training while free-tier inputs may be used to improve models.",
    "localizedDescriptions": {
      "de": "In Köln ansässige KI-Übersetzungsplattform, die weithin als genauer und natürlicher klingend als Google Translate gilt. Bietet neuronale maschinelle Übersetzung für über 30 Sprachen, Dokumentenübersetzung, einen Schreibassistenten und eine Entwickler-API — alles betrieben von proprietären Deep-Learning-Modellen, die in Europa trainiert wurden."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "ai-ml",
      "freemium",
      "google-translate",
      "aws-translate"
    ],
    "foundedYear": 2017,
    "headquartersCity": "Cologne",
    "sourceCodeUrl": "https://github.com/DeepLcom"
  },
  {
    "id": "diaspora",
    "name": "diaspora",
    "category": "social-media",
    "country": "eu",
    "replacesUS": [
      "Facebook"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://diasporafoundation.org",
    "description": "Pioneering decentralized social network where users own their data. diaspora* distributes content across independently run pods with no central authority, offering aspects-based sharing for fine-grained privacy control.",
    "localizedDescriptions": {
      "de": "Wegweisendes dezentrales soziales Netzwerk, in dem Nutzende ihre Daten selbst besitzen. diaspora* verteilt Inhalte über unabhängig betriebene Pods ohne zentrale Instanz und bietet aspektbasiertes Teilen für feingranulare Privatsphärekontrolle."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "social-media",
      "free",
      "open-source",
      "privacy",
      "facebook"
    ],
    "foundedYear": 2010,
    "headquartersCity": "open",
    "sourceCodeUrl": "https://github.com/diaspora/diaspora",
    "license": "AGPL-3.0"
  },
  {
    "id": "disroot",
    "name": "Disroot",
    "category": "email",
    "country": "nl",
    "replacesUS": [
      "Gmail",
      "Outlook",
      "Yahoo Mail"
    ],
    "pricing": "free",
    "website": "https://disroot.org",
    "description": "Community-run platform from Amsterdam providing free, privacy-respecting email and collaboration tools built entirely on open-source software. Funded by donations rather than ads or data harvesting, Disroot embodies the principles of decentralization, federation, and digital freedom.",
    "localizedDescriptions": {
      "de": "Von der Community betriebene Plattform aus Amsterdam, die kostenlose, datenschutzfreundliche E-Mail und Zusammenarbeitstools bietet — vollständig auf Open-Source-Software aufgebaut. Finanziert durch Spenden statt durch Werbung oder Datensammlung, verkörpert Disroot die Prinzipien von Dezentralisierung, Föderation und digitaler Freiheit."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "email",
      "free",
      "privacy",
      "open-source",
      "gmail",
      "outlook"
    ],
    "foundedYear": 2015,
    "headquartersCity": "Amsterdam",
    "license": "uses FOSS"
  },
  {
    "id": "duplicati",
    "name": "Duplicati",
    "category": "cloud-storage",
    "country": "us",
    "replacesUS": [
      "Acronis",
      "Backblaze",
      "Carbonite",
      "Time Machine",
      "iCloud Backup"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://www.duplicati.com",
    "description": "Open-source, free backup client that stores securely encrypted, incremental, and compressed backups on cloud storage services and remote file servers. Supports AES-256 encryption, runs on Windows, macOS, and Linux, and integrates with 60+ storage backends including S3, Dropbox, Google Drive, and WebDAV. Founded by Danish developer Kenneth Skovhede, now operated by Duplicati Inc (San Francisco).",
    "localizedDescriptions": {
      "de": "Open-Source, kostenloser Backup-Client der sicher verschlüsselte, inkrementelle und komprimierte Backups auf Cloud-Speicherdiensten und Remote-Dateiservern speichert. Unterstützt AES-256-Verschlüsselung, läuft auf Windows, macOS und Linux und integriert sich mit über 60 Speicher-Backends einschliesslich S3, Dropbox, Google Drive und WebDAV. Gegründet vom dänischen Entwickler Kenneth Skovhede, jetzt betrieben von Duplicati Inc (San Francisco)."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/duplicati/duplicati",
    "tags": [
      "backup",
      "encryption",
      "deduplication",
      "open-source",
      "self-hosted",
      "cloud-storage"
    ],
    "foundedYear": 2008,
    "headquartersCity": "San Francisco",
    "license": "MIT"
  },
  {
    "id": "quad9",
    "name": "Quad9",
    "category": "dns",
    "country": "ch",
    "replacesUS": [
      "Google DNS",
      "Cloudflare DNS",
      "OpenDNS"
    ],
    "pricing": "free",
    "website": "https://quad9.net",
    "description": "Swiss-based not-for-profit DNS recursive resolver operated by the Quad9 Foundation, focusing on security and privacy. Blocks malicious domains using threat intelligence from multiple providers while not logging user IP addresses. Operates globally with 230+ resolver clusters in 110+ countries. GDPR-compliant and subject to Swiss privacy law.",
    "localizedDescriptions": {
      "de": "Schweizerischer nicht-kommerzieller DNS-Recursive-Resolver, betrieben von der Quad9 Foundation mit Fokus auf Sicherheit und Datenschutz. Blockiert bösartige Domains mittels Threat Intelligence von mehreren Anbietern, ohne Benutzer-IP-Adressen zu protokollieren. Global operierend mit über 230 Resolver-Clustern in über 110 Ländern. DSGVO-konform und schweizerischem Datenschutzrecht unterworfen."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "openSourceAuditUrl": "https://github.com/Quad9DNS",
    "tags": [
      "dns",
      "free",
      "privacy",
      "gdpr",
      "security",
      "malware-blocking",
      "non-profit"
    ],
    "foundedYear": 2016,
    "headquartersCity": "Zürich",
    "sourceCodeUrl": "https://github.com/Quad9DNS"
  },
  {
    "id": "qgis",
    "name": "QGIS",
    "category": "other",
    "country": "ch",
    "logo": "/logos/qgis.svg",
    "replacesUS": [
      "ArcGIS"
    ],
    "pricing": "free",
    "website": "https://www.qgis.org/",
    "description": "Free and open source Geographic Information System (GIS) that runs on Unix platforms, Windows, and macOS. Provides capabilities for viewing, editing, and analyzing spatial data with support for raster, vector, mesh, and point cloud formats. Developed since 2002, maintained by active international community and part of OSGeo foundation.",
    "localizedDescriptions": {
      "de": "Freies und quelloffenes Geografisches Informationssystem (GIS) für Unix-Plattformen, Windows und macOS. Bietet Funktionen zum Anzeigen, Bearbeiten und Analysieren räumlicher Daten mit Unterstützung für Raster-, Vektor-, Mesh- und Point-Cloud-Formate. Seit 2002 entwickelt, gepflegt von aktiver internationaler Gemeinschaft und Teil der OSGeo-Foundation."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/qgis/QGIS",
    "tags": [
      "gis",
      "mapping",
      "geospatial",
      "open-source",
      "free",
      "osgeo",
      "arcgis"
    ],
    "foundedYear": 2002,
    "headquartersCity": "Laax",
    "license": "GPL-2.0+"
  },
  {
    "id": "restic",
    "name": "Restic",
    "category": "cloud-storage",
    "country": "de",
    "logo": "/logos/restic.svg",
    "replacesUS": [
      "Time Machine",
      "iCloud Backup",
      "Backblaze",
      "Carbonite"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://restic.net",
    "description": "Fast, secure, and efficient open-source backup program with client-side encryption and deduplication. Supports Linux, macOS, Windows, BSD, and stores backups locally, via SFTP, REST servers, or S3-compatible cloud storage. Designed with a strong threat model assuming untrusted storage backends.",
    "localizedDescriptions": {
      "de": "Schnelles, sicheres und effizientes Open-Source-Backup-Programm mit clientseitiger Verschlüsselung und Deduplizierung. Unterstützt Linux, macOS, Windows, BSD und speichert Backups lokal, über SFTP, REST-Server oder S3-kompatible Cloud-Speicher. Entworfen mit einem starken Bedrohungsmodell für nicht vertrauenswürdige Speicher-Backends."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/restic/restic",
    "tags": [
      "backup",
      "encryption",
      "deduplication",
      "open-source",
      "self-hosted",
      "cli"
    ],
    "foundedYear": 2014,
    "headquartersCity": "Aachen",
    "license": "BSD-2-Clause"
  },
  {
    "id": "rocket-chat",
    "name": "Rocket.Chat",
    "category": "messaging",
    "country": "us",
    "replacesUS": [
      "Slack",
      "Microsoft Teams",
      "Skype for Business"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://rocket.chat",
    "description": "Open-source secure communications platform for mission-critical operations. Developed in TypeScript/Node.js with MongoDB, offering team chat, video conferencing, and omnichannel engagement. MIT-licensed with 44.7k GitHub stars, self-hostable or cloud-hosted. Used by governments and enterprises worldwide including Deutsche Bahn and US Navy.",
    "localizedDescriptions": {
      "de": "Open-Source sichere Kommunikationsplattform für kritische Operationen. Entwickelt in TypeScript/Node.js mit MongoDB, bietet Team-Chat, Videokonferenzen und Omnichannel-Engagement. MIT-lizenziert mit 44.7k GitHub-Sternen, self-hostbar oder Cloud-gehostet. Genutzt von Regierungen und Unternehmen weltweit, darunter Deutsche Bahn und US Navy."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/RocketChat/Rocket.Chat",
    "tags": [
      "messaging",
      "freemium",
      "open-source",
      "team-communication",
      "slack",
      "microsoft-teams"
    ],
    "foundedYear": 2015,
    "headquartersCity": "Delaware",
    "license": "MIT"
  },
  {
    "id": "zapstore",
    "name": "Zapstore",
    "category": "mobile-os",
    "country": "eu",
    "replacesUS": [
      "Google Play Store",
      "App Store"
    ],
    "pricing": "free",
    "website": "https://zapstore.dev",
    "description": "Open-source decentralized app store powered by Nostr protocol. The social permissionless app store allows developers to publish apps directly to users without centralized approval. Features include developer signatures, Lightning Network payments (Zaps), user communities, and no review process. Built with Flutter for cross-platform support. MIT licensed.",
    "localizedDescriptions": {
      "de": "Open-Source dezentraler App-Store, betrieben durch das Nostr-Protokoll. Der soziale permissionless App-Store ermöglicht Entwicklern, Apps direkt ohne zentrale Genehmigung zu veröffentlichen. Funktionen umfassen Entwickler-Signaturen, Lightning-Network-Zahlungen (Zaps), Benutzer-Communities und keinen Prüfprozess. Entwickelt mit Flutter für plattformübergreifende Unterstützung. MIT-lizenziert."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/zapstore/zapstore",
    "tags": [
      "app-store",
      "android",
      "ios",
      "foss",
      "nostr",
      "decentralized",
      "lightning-network",
      "permissionless"
    ],
    "foundedYear": 2023,
    "headquartersCity": "Global community",
    "license": "MIT"
  },
  {
    "id": "zulip",
    "name": "Zulip",
    "category": "messaging",
    "country": "us",
    "replacesUS": [
      "Slack",
      "Microsoft Teams"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://zulip.com",
    "description": "Open-source team chat with unique topic-based threading that combines the best of email and chat. 100% Apache 2.0 licensed open source with server, web, and mobile apps. Features include real-time messaging, file uploads, integrations, and video calls. Used by thousands of organizations including universities and open-source projects. Self-hostable or cloud-hosted.",
    "localizedDescriptions": {
      "de": "Open-Source Team-Chat mit einzigartigem Topic-basiertem Threading, das das Beste aus E-Mail und Chat kombiniert. 100% Apache 2.0 lizenziert mit Server, Web- und Mobile-Apps. Funktionen umfassen Echtzeit-Messaging, Datei-Upload, Integrationen und Videoanrufe. Tausende Organisationen nutzen es, darunter Universitäten und Open-Source-Projekte. Self-hostbar oder Cloud-gehostet."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/zulip/zulip",
    "tags": [
      "messaging",
      "freemium",
      "open-source",
      "team-communication",
      "slack",
      "threading"
    ],
    "foundedYear": 2012,
    "headquartersCity": "San Francisco",
    "license": "Apache-2.0"
  },
  {
    "id": "element",
    "name": "Element",
    "category": "messaging",
    "country": "gb",
    "replacesUS": [
      "Slack",
      "Discord",
      "WhatsApp"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://element.io",
    "description": "Flagship client for the decentralized Matrix protocol, enabling federated real-time messaging, voice, and video across organizations. Element clients are licensed under Apache 2.0, while the main Matrix homeserver (Synapse) is AGPLv3 to enforce reciprocal contributions for hosted forks.",
    "localizedDescriptions": {
      "de": "Vorzeige-Client für das dezentrale Matrix-Protokoll, der föderiertes Echtzeit-Messaging, Sprach- und Videoanrufe über Organisationsgrenzen hinweg ermöglicht. Element wird von Regierungen und der NATO genutzt und erlaubt Self-Hosting oder verwaltete Server bei voller Datenhoheit."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "messaging",
      "freemium",
      "open-source",
      "federated",
      "slack",
      "discord"
    ],
    "foundedYear": 2017,
    "headquartersCity": "London",
    "sourceCodeUrl": "https://github.com/element-hq",
    "license": "Apache-2.0 (Element clients); AGPL-3.0 (Matrix Synapse server)"
  },
  {
    "id": "e-os",
    "name": "e/OS",
    "category": "mobile-os",
    "country": "fr",
    "replacesUS": [
      "Android",
      "iOS"
    ],
    "pricing": "free",
    "website": "https://e.foundation",
    "description": "Privacy-focused de-googled mobile operating system based on LineageOS/AOSP, developed by French non-profit e Foundation. Offers open-source OS with MicroG as Google services replacement, built-in tracker blocking, and optional Murena cloud services. Available for 200+ smartphone models.",
    "localizedDescriptions": {
      "de": "Datenschutzorientiertes de-googledes mobiles Betriebssystem basierend auf LineageOS/AOSP, entwickelt von der französischen Non-Profit-Organisation e Foundation. Bietet Open-Source-OS mit MicroG als Google-Dienste-Ersatz, integrierte Tracker-Blockierung und optionale Murena-Cloud-Dienste. Verfügbar für über 200 Smartphone-Modelle."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "sourceCodeUrl": "https://gitlab.e.foundation",
    "tags": [
      "mobile-os",
      "privacy",
      "degoogled",
      "android",
      "open-source"
    ],
    "foundedYear": 2018,
    "headquartersCity": "Paris"
  },
  {
    "id": "etar",
    "name": "Etar",
    "category": "mobile-os",
    "country": "sa",
    "replacesUS": [
      "Google Calendar"
    ],
    "pricing": "free",
    "website": "https://github.com/Etar-Group/Etar-Calendar",
    "description": "Open-source material designed Android calendar app, ad-free and free of charge. Fork of AOSP Calendar with enhanced features including month/week/day/agenda views, offline calendar support, dark/light themes, and multilingual UI. Available on F-Droid and Google Play.",
    "localizedDescriptions": {
      "de": "Open-Source, Material-Design Android-Kalender-App, werbefrei und kostenlos. Fork des AOSP-Kalenders mit erweiterten Funktionen einschließlich Monat/Woche/Tag/Agenda-Ansichten, Offline-Kalender-Support, Dunkel/Hell-Themes und mehrsprachiger UI. Verfügbar auf F-Droid und Google Play."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/Etar-Group/Etar-Calendar",
    "tags": [
      "calendar",
      "productivity",
      "android",
      "open-source",
      "ad-free",
      "free",
      "material-design"
    ],
    "foundedYear": 2015,
    "headquartersCity": "Riyadh",
    "license": "GPL-3.0"
  },
  {
    "id": "filen",
    "name": "Filen",
    "category": "cloud-storage",
    "country": "de",
    "replacesUS": [
      "Google Drive",
      "Dropbox",
      "iCloud",
      "OneDrive"
    ],
    "pricing": "freemium",
    "website": "https://filen.io",
    "description": "Zero-knowledge encrypted cloud storage built and hosted entirely in Germany, with all apps open-sourced under AGPL-3.0. Filen offers affordable lifetime plans and keeps no logs, no trackers, and no backdoors — a privacy-first alternative to Big Tech clouds.",
    "localizedDescriptions": {
      "de": "Zero-Knowledge-verschlüsselter Cloud-Speicher, vollständig in Deutschland entwickelt und gehostet, mit allen Apps unter der AGPL-3.0-Lizenz quelloffen. Filen bietet günstige Lifetime-Tarife und verzichtet auf Logs, Tracker und Hintertüren — eine datenschutzorientierte Alternative zu Big-Tech-Clouds."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "openSourceAuditUrl": "https://github.com/orgs/FilenCloudDienste/repositories",
    "tags": [
      "cloud-storage",
      "freemium",
      "open-source",
      "privacy",
      "encryption",
      "zero-knowledge",
      "cloud",
      "google-drive"
    ],
    "foundedYear": 2021,
    "headquartersCity": "Recklinghausen",
    "sourceCodeUrl": "https://github.com/FilenCloudDienste",
    "license": "AGPL-3.0 (clients/SDKs); proprietary backend"
  },
  {
    "id": "hidrive",
    "name": "HiDrive",
    "category": "cloud-storage",
    "country": "de",
    "replacesUS": [
      "Google Drive",
      "Dropbox",
      "iCloud",
      "OneDrive"
    ],
    "pricing": "freemium",
    "website": "https://www.strato.de/cloud-speicher/",
    "description": "German cloud storage service from STRATO GmbH, hosted in TÜV-certified data centers in Germany with DSGVO compliance. Offers encrypted storage, optional end-to-end zero-knowledge encryption, two-factor authentication, and various protocol access (SFTP, WebDAV, SMB). Founded in 1997, part of IONOS Group SE.",
    "localizedDescriptions": {
      "de": "Deutscher Cloud-Speicherdienst von STRATO GmbH, gehostet in TÜV-zertifizierten Rechenzentren in Deutschland mit DSGVO-Konformität. Bietet verschlüsselten Speicher, optionale Ende-zu-Ende Zero-Knowledge-Verschlüsselung, Zwei-Faktor-Authentifizierung und various Protokollzugänge (SFTP, WebDAV, SMB). Gegründet 1997, Teil der IONOS Group SE."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "cloud-storage",
      "freemium",
      "encrypted",
      "gdpr",
      "german-hosted",
      "zero-knowledge",
      "google-drive"
    ],
    "foundedYear": 1997,
    "headquartersCity": "Berlin"
  },
  {
    "id": "fairemail",
    "name": "FairEmail",
    "category": "mail-client",
    "country": "nl",
    "replacesUS": [
      "Gmail",
      "Outlook",
      "Yahoo Mail"
    ],
    "pricing": "freemium",
    "website": "https://email.faircode.eu",
    "description": "Fully featured, open source, privacy friendly email app for Android. Developed by Dutch company FairCode B.V., FairEmail works with any email provider via IMAP/POP3/SMTP and supports OpenPGP and S/MIME encryption. No tracking, no ads, no data collection.",
    "localizedDescriptions": {
      "de": "Vollständig ausgestatteter, quelloffener, datenschutzfreundlicher E-Mail-Client für Android. Entwickelt vom niederländischen Unternehmen FairCode B.V., FairEmail funktioniert mit jedem E-Mail-Anbieter über IMAP/POP3/SMTP und unterstützt OpenPGP- und S/MIME-Verschlüsselung. Kein Tracking, keine Werbung, keine Datensammlung."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/M66B/FairEmail",
    "tags": [
      "mail-client",
      "android",
      "open-source",
      "privacy",
      "encryption",
      "imap",
      "smtp",
      "pgp",
      "gmail",
      "outlook"
    ],
    "foundedYear": 2018,
    "headquartersCity": "Dordrecht",
    "license": "GPL-3.0"
  },
  {
    "id": "fountain",
    "name": "Fountain",
    "category": "other",
    "country": "gb",
    "replacesUS": [
      "Apple Podcasts",
      "Spotify"
    ],
    "pricing": "free",
    "website": "https://fountain.fm",
    "description": "UK-based podcast player app with social features and Bitcoin/Lightning payment integration for supporting creators. Available on iOS and Android with features including offline downloads, clip sharing, and community engagement through comments and followers.",
    "localizedDescriptions": {
      "de": "Britischer Podcast-Player mit sozialen Funktionen und Bitcoin/Lightning-Integration zur Unterstützung von Erstellern. Verfügbar für iOS und Android mit Offline-Downloads, Clip-Sharing und Community-Engagement durch Kommentare und Follower."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "podcast-player",
      "social",
      "bitcoin",
      "lightning",
      "podcasting",
      "mobile"
    ],
    "foundedYear": 2021,
    "headquartersCity": "London",
    "trustScoreStatus": "pending"
  },
  {
    "id": "f-droid",
    "name": "F-Droid",
    "category": "mobile-os",
    "country": "gb",
    "replacesUS": [
      "Google Play Store"
    ],
    "pricing": "free",
    "website": "https://f-droid.org",
    "description": "Community-run free and open-source Android app repository. Founded in 2010, originally by UK-based F-Droid Limited (now shut down). Offers reproducible builds, anti-feature tracking for apps with tracking/ads, and no account required. Provides an alternative to Google Play Store with focus on privacy and user freedom.",
    "localizedDescriptions": {
      "de": "Community-betriebener freier und quelloffener Android-App-Store. Gegründet 2010, ursprünglich von der britischen F-Droid Limited (mittlerweile eingestellt). Bietet reproduzierbare Builds, Anti-Feature-Tracking für Apps mit Tracking/Werbung und kein Konto erforderlich. Bietet eine Alternative zum Google Play Store mit Fokus auf Datenschutz und Benutzerfreiheit."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://gitlab.com/fdroid",
    "tags": [
      "app-store",
      "android",
      "foss",
      "privacy",
      "open-source",
      "google-play"
    ],
    "foundedYear": 2010,
    "headquartersCity": "Global upstream community",
    "license": "AGPL-3.0"
  },
  {
    "id": "firefox",
    "name": "Firefox",
    "category": "browser",
    "country": "us",
    "replacesUS": [
      "Google Chrome",
      "Safari",
      "Edge"
    ],
    "pricing": "free",
    "website": "https://www.firefox.com",
    "description": "Open-source web browser developed by the Mozilla Foundation, a US-based non-profit organization. Firefox prioritizes privacy with built-in tracker blocking, fingerprinting protection, and regular security updates. Available for desktop and mobile platforms.",
    "localizedDescriptions": {
      "de": "Open-Source-Webbrowser, entwickelt von der Mozilla Foundation, einer US-basierten Non-Profit-Organisation. Firefox legt Wert auf Datenschutz mit integriertem Tracker-Blocker, Fingerprinting-Schutz und regelmäßigen Sicherheitsupdates. Verfügbar für Desktop und Mobile."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "browser",
      "free",
      "open-source",
      "privacy",
      "non-profit",
      "google-chrome",
      "safari"
    ],
    "foundedYear": 2004,
    "headquartersCity": "San Francisco",
    "sourceCodeUrl": "https://hg.mozilla.org/mozilla-central",
    "license": "MPL-2.0"
  },
  {
    "id": "fluxer",
    "name": "Fluxer",
    "category": "messaging",
    "country": "se",
    "replacesUS": [
      "Discord"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://fluxer.app",
    "description": "Free and open source instant messaging and VoIP platform built for friends, groups, and communities. Developed by Swedish company Fluxer Platform AB, with full self-hosting support. Features include messaging, voice and video calls, screen sharing, moderation tools, and custom emojis. Licensed under AGPL-3.0.",
    "localizedDescriptions": {
      "de": "Freie und quelloffene Instant-Messaging- und VoIP-Plattform für Freunde, Gruppen und Communities. Entwickelt von dem schwedischen Unternehmen Fluxer Platform AB mit voller Self-Hosting-Unterstützung. Funktionen umfassen Messaging, Sprach- und Videoanrufe, Bildschirmfreigabe, Moderationstools und eigene Emojis. Lizenziert unter AGPL-3.0."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/fluxerapp/fluxer",
    "tags": [
      "messaging",
      "voip",
      "freemium",
      "open-source",
      "discord",
      "self-hosted",
      "swedish"
    ],
    "foundedYear": 2024,
    "headquartersCity": "Stockholm",
    "license": "AGPL-3.0"
  },
  {
    "id": "librewolf",
    "name": "LibreWolf",
    "category": "browser",
    "country": "de",
    "replacesUS": [
      "Google Chrome",
      "Safari",
      "Edge"
    ],
    "pricing": "free",
    "website": "https://librewolf.net",
    "description": "Privacy-focused Firefox fork developed by the LibreWolf community. Removes all telemetry, disables DRM, and includes hardened privacy settings such as Resist Fingerprinting (RFP), enhanced tracking protection, and uBlock Origin. Updated regularly following upstream Firefox releases.",
    "localizedDescriptions": {
      "de": "Datenschutzorientierter Firefox-Fork der LibreWolf-Community. Entfernt alle Telemetrie, deaktiviert DRM und enthält gehärtete Datenschutzeinstellungen wie Resist Fingerprinting (RFP), erweiterten Tracking-Schutz und uBlock Origin. Regelmäßige Updates nach Firefox-Upstream-Releases."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "browser",
      "free",
      "open-source",
      "privacy",
      "firefox-fork"
    ],
    "foundedYear": 2020,
    "headquartersCity": "Community project",
    "sourceCodeUrl": "https://codeberg.org/librewolf",
    "license": "MPL-2.0"
  },
  {
    "id": "freeoffice",
    "name": "FreeOffice",
    "category": "office-suite",
    "country": "de",
    "replacesUS": [
      "Microsoft Office"
    ],
    "pricing": "free",
    "website": "https://www.freeoffice.com",
    "description": "German-developed free office suite by SoftMaker, offering TextMaker (word processor), PlanMaker (spreadsheet), and Presentations. Features seamless Microsoft Office file format compatibility (DOCX, XLSX, PPTX) and is free for both personal and business use.",
    "localizedDescriptions": {
      "de": "Deutsche Entwickler bieten mit FreeOffice eine kostenlose Bürosoftware von SoftMaker mit TextMaker (Textverarbeitung), PlanMaker (Tabellenkalkulation) und Präsentationen. Nahtlose Kompatibilität mit Microsoft Office Dateiformaten (DOCX, XLSX, PPTX) für private und geschäftliche Nutzung."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "office-suite",
      "free",
      "microsoft-office",
      "compatibility",
      "desktop"
    ],
    "foundedYear": 1987,
    "headquartersCity": "Nuremberg",
    "license": "Proprietary (free version)"
  },
  {
    "id": "freebsd",
    "name": "FreeBSD",
    "category": "desktop-os",
    "country": "us",
    "replacesUS": [
      "Windows Server"
    ],
    "pricing": "free",
    "website": "https://www.freebsd.org",
    "description": "Free and open-source Unix-like operating system descended from Berkeley Software Distribution (BSD). Developed since 1993, FreeBSD offers advanced networking, security, and storage features making it popular for servers, embedded systems, and network appliances. Used by major companies including Netflix, WhatsApp, and FlightAware. Cross-platform support includes x86-64, ARM64, RISC-V, and PowerPC.",
    "localizedDescriptions": {
      "de": "Freies und quelloffenes Unix-ähnliches Betriebssystem, abgeleitet von der Berkeley Software Distribution (BSD). Seit 1993 entwickelt, bietet FreeBSD fortschrittliche Netzwerk-, Sicherheits- und Speicherfunktionen, was es beliebt für Server, eingebettete Systeme und Netzwerkgeräte macht. Genutzt von großen Unternehmen wie Netflix, WhatsApp und FlightAware. Plattformübergreifende Unterstützung für x86-64, ARM64, RISC-V und PowerPC."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/freebsd",
    "tags": [
      "operating-system",
      "server",
      "open-source",
      "bsd",
      "unix",
      "self-hosting",
      "security",
      "networking"
    ],
    "foundedYear": 1993,
    "headquartersCity": "Community project (originated from University of California, Berkeley)",
    "license": "BSD-2-Clause"
  },
  {
    "id": "gajim",
    "name": "Gajim",
    "category": "messaging",
    "country": "eu",
    "replacesUS": [
      "WhatsApp",
      "iMessage",
      "Discord",
      "Signal"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://gajim.org",
    "description": "Free and fully featured desktop XMPP client for decentralized messaging. Gajim supports end-to-end encryption with OMEMO and OpenPGP, voice messages, file transfers, and group chats. Available for Windows, macOS, and Linux.",
    "localizedDescriptions": {
      "de": "Kostenloser, voll ausgestatteter Desktop-XMPP-Client für dezentrales Messaging. Gajim unterstützt Ende-zu-Ende-Verschlüsselung mit OMEMO und OpenPGP, Sprachnachrichten, Dateiübertragungen und Gruppenchats. Verfügbar für Windows, macOS und Linux."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "messaging",
      "free",
      "open-source",
      "federated",
      "xmpp",
      "jabber",
      "e2ee",
      "desktop"
    ],
    "foundedYear": 2004,
    "sourceCodeUrl": "https://dev.gajim.org/gajim/gajim",
    "license": "GPL-3.0"
  },
  {
    "id": "ghostfolio",
    "name": "Ghostfolio",
    "category": "other",
    "country": "ch",
    "replacesUS": [
      "Mint",
      "Personal Capital"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://ghostfol.io",
    "description": "Open source wealth management software for tracking stocks, ETFs, and cryptocurrencies. Built with Angular + NestJS + Prisma, self-hostable via Docker or cloud deployment. Privacy-focused with data ownership, supports multi-account management and portfolio performance tracking.",
    "localizedDescriptions": {
      "de": "Open-Source-Vermögensverwaltungssoftware zur Verfolgung von Aktien, ETFs und Kryptowährungen. Entwickelt mit Angular + NestJS + Prisma, selbst hostbar via Docker oder Cloud-Deployment. Datenschutzorientiert mit Datenbesitz, unterstützt Multi-Account-Management und Portfolio-Performance-Tracking."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/ghostfolio/ghostfolio",
    "tags": [
      "wealth-management",
      "portfolio-tracker",
      "finance",
      "stocks",
      "cryptocurrency",
      "self-hosted",
      "open-source",
      "docker"
    ],
    "foundedYear": 2021,
    "headquartersCity": "Switzerland",
    "license": "AGPL-3.0"
  },
  {
    "id": "gimp",
    "name": "GIMP",
    "category": "other",
    "country": "eu",
    "replacesUS": [
      "Adobe Photoshop"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://www.gimp.org",
    "description": "GNU Image Manipulation Program - a free and open-source raster graphics editor used for image retouching, editing, free-hand drawing, and converting between image formats. Cross-platform (Linux, macOS, Windows, FreeBSD, OpenBSD). Part of the GNU Project, actively maintained with regular releases.",
    "localizedDescriptions": {
      "de": "GNU Image Manipulation Program - ein freies und quelloffenes Rastergrafik-Programm zur Bildretusche, Bearbeitung, freien Zeichnung und Konvertierung zwischen Bildformaten. Plattformübergreifend (Linux, macOS, Windows, FreeBSD, OpenBSD). Teil des GNU-Projekts, aktiv gewartet mit regelmäßigen Veröffentlichungen."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://gitlab.gnome.org/GNOME/gimp",
    "tags": [
      "graphics-editor",
      "photo-editing",
      "free",
      "open-source",
      "foss",
      "gnu",
      "cross-platform",
      "adobe-photoshop"
    ],
    "foundedYear": 1995,
    "license": "GPL-3.0-or-later"
  },
  {
    "id": "friendica",
    "name": "Friendica",
    "category": "social-media",
    "country": "eu",
    "replacesUS": [
      "Facebook",
      "LinkedIn"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://friendi.ca",
    "description": "Versatile federated social platform that bridges multiple networks. Friendica connects to Mastodon, Diaspora, Bluesky, and more from a single account, offering Facebook-style features like events, photo albums, and threaded discussions.",
    "localizedDescriptions": {
      "de": "Vielseitige föderierte Sozialplattform, die mehrere Netzwerke verbindet. Friendica vernetzt sich mit Mastodon, Diaspora, Bluesky und weiteren Diensten über ein einziges Konto und bietet Facebook-ähnliche Funktionen wie Events, Fotoalben und Diskussionsstränge."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "social-media",
      "free",
      "open-source",
      "federated",
      "facebook",
      "linkedin"
    ],
    "foundedYear": 2010,
    "headquartersCity": "open",
    "sourceCodeUrl": "https://github.com/friendica/friendica",
    "license": "AGPL-3.0"
  },
  {
    "id": "gitea",
    "name": "Gitea",
    "category": "version-control",
    "country": "us",
    "replacesUS": [
      "GitHub",
      "GitLab"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://about.gitea.com",
    "description": "Open-source self-hosted Git service forked from Gogs in 2016. Provides Git hosting, code review, team collaboration, package registry, and CI/CD. Fully open source under MIT license with active development (53.8k GitHub stars). Can be self-hosted on any infrastructure or used via Gitea Cloud/Enterprise.",
    "localizedDescriptions": {
      "de": "Open-Source selbst gehosteter Git-Dienst, geforkt von Gogs im Jahr 2016. Bietet Git-Hosting, Code-Review, Team-Zusammenarbeit, Paket-Registry und CI/CD. Vollständig quelloffen unter MIT-Lizenz mit aktiver Entwicklung (53.8k GitHub-Sterne). Kann selbst gehostet oder über Gitea Cloud/Enterprise genutzt werden."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/go-gitea/gitea",
    "tags": [
      "version-control",
      "devops",
      "git",
      "ci-cd",
      "self-hosted",
      "open-source"
    ],
    "foundedYear": 2016,
    "headquartersCity": "US (CommitGo, Inc.)",
    "license": "MIT"
  },
  {
    "id": "forgejo",
    "name": "Forgejo",
    "category": "version-control",
    "country": "de",
    "replacesUS": [
      "GitHub",
      "GitLab"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://forgejo.org",
    "description": "Self-hosted lightweight software forge developed by the community under the umbrella of Codeberg e.V., a democratic non-profit organization based in Berlin, Germany. A hard fork of Gitea focused on privacy, federation, and community ownership. 100% Free Software under GPLv3+ license.",
    "localizedDescriptions": {
      "de": "Selbst gehostete, leichtgewichtige Software-Forge, entwickelt von der Community unter dem Dach von Codeberg e.V., einer demokratischen gemeinnützigen Organisation mit Sitz in Berlin. Ein Hard-Fork von Gitea mit Fokus auf Datenschutz, Föderation und Community-Eigentum. 100% Freie Software unter GPLv3+-Lizenz."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://codeberg.org/forgejo/forgejo",
    "tags": [
      "version-control",
      "devops",
      "git",
      "self-hosted",
      "open-source",
      "federation"
    ],
    "foundedYear": 2022,
    "headquartersCity": "Berlin",
    "license": "GPL-3.0-or-later"
  },
  {
    "id": "hedgedoc",
    "name": "HedgeDoc",
    "category": "other",
    "country": "eu",
    "replacesUS": [
      "Google Keep",
      "Evernote",
      "Notion",
      "Microsoft OneNote"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://hedgedoc.org",
    "description": "Open-source, web-based, self-hosted, collaborative markdown editor formerly known as CodiMD (fork of HackMD). Real-time collaboration on notes, graphs and presentations. Low system requirements, runs on Raspberry Pi. Supports revisions, permissions, and various authentication methods.",
    "localizedDescriptions": {
      "de": "Open-Source, webbasiert, selbst gehosteter, kollaborativer Markdown-Editor, ehemals bekannt als CodiMD (Fork von HackMD). Echtzeit-Zusammenarbeit an Notizen, Graphen und Präsentationen. Niedrige Systemanforderungen, läuft auch auf Raspberry Pi. Unterstützt Revisionen, Berechtigungen und verschiedene Authentifizierungsmethoden."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/hedgedoc/hedgedoc",
    "license": "AGPL-3.0",
    "tags": [
      "markdown",
      "editor",
      "collaboration",
      "notes",
      "open-source",
      "self-hosted",
      "real-time"
    ],
    "foundedYear": 2015,
    "headquartersCity": "Global upstream community"
  },
  {
    "id": "radicle",
    "name": "Radicle",
    "category": "version-control",
    "country": "ch",
    "replacesUS": [
      "GitHub",
      "GitLab"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://radicle.xyz",
    "description": "Open-source peer-to-peer code collaboration stack built on Git. Unlike centralized platforms, there is no single entity controlling the network — repositories are replicated across peers in a decentralized manner, giving users full control of their data. Features include cryptographic identities, local-first design, and a modular stack with CLI, TUI, and web interface. Operated by Better Internet Foundation, a Swiss non-profit.",
    "localizedDescriptions": {
      "de": "Open-Source Peer-to-Peer Code-Collaboration-Stack auf Git-Basis. Im Gegensatz zu zentralisierten Plattformen gibt es keine einzelne Entität, die das Netzwerk kontrolliert — Repositories werden dezentral über Peers repliziert, sodass Benutzer die volle Kontrolle über ihre Daten haben. Funktionen umfassen kryptografische Identitäten, Local-First-Design und einen modularen Stack mit CLI, TUI und Web-Interface. Betrieben von Better Internet Foundation, einer schweizerischen Non-Profit-Organisation."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/radicle-dev/heartwood",
    "tags": [
      "version-control",
      "devops",
      "git",
      "p2p",
      "decentralized",
      "open-source",
      "self-hosted"
    ],
    "foundedYear": 2018,
    "headquartersCity": "Zug",
    "license": "Apache-2.0"
  },
  {
    "id": "trilium",
    "name": "Trilium",
    "category": "other",
    "country": "ro",
    "replacesUS": [
      "Obsidian",
      "Evernote",
      "Microsoft OneNote",
      "Apple Notes"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://triliumnotes.org",
    "logo": "/logos/trilium.svg",
    "description": "Open-source hierarchical note-taking application for building personal knowledge bases. Features include rich WYSIWYG editing, code notes with syntax highlighting, note encryption, powerful search, note versioning, and synchronization with self-hosted server. Cross-platform (Windows, Mac, Linux) with mobile web interface. Developed by community with main maintainer Elian Doran based in Romania.",
    "localizedDescriptions": {
      "de": "Open-Source hierarchische Notizanwendung zumlicher Wissensdatenbanken. Funktion Aufbau persönen umfassen Rich-WYSIWYG-Bearbeitung, Code-Notizen mit Syntax-Highlighting, Notizenverschlüsselung, leistungsstarke Suche, Notizen-Versionierung und Synchronisation mit selbst gehostetem Server. Plattformübergreifend (Windows, Mac, Linux) mit mobiler Web-Oberfläche. Entwickelt von der Community mit Hauptmaintainer Elian Doran in Rumänien."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/TriliumNext/Trilium",
    "license": "AGPL-3.0",
    "tags": [
      "notes",
      "knowledge-base",
      "open-source",
      "self-hosted",
      "encryption",
      "cross-platform"
    ],
    "foundedYear": 2017,
    "headquartersCity": "Sibiu"
  },
  {
    "id": "hetzner",
    "name": "Hetzner",
    "category": "hosting",
    "country": "de",
    "replacesUS": [
      "AWS",
      "Google Cloud",
      "Azure",
      "Cloudflare"
    ],
    "pricing": "paid",
    "website": "https://www.hetzner.com",
    "description": "German cloud and dedicated hosting provider renowned for unbeatable price-to-performance ratios, transparent billing with no hidden fees, and ISO 27001-certified data centers in Germany, Finland, and the US.",
    "localizedDescriptions": {
      "de": "Deutscher Cloud- und Hosting-Anbieter, bekannt für sein unschlagbares Preis-Leistungs-Verhältnis, transparente Abrechnung ohne versteckte Kosten und ISO-27001-zertifizierte Rechenzentren in Deutschland, Finnland und den USA."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "hosting",
      "paid",
      "cloud",
      "aws",
      "google-cloud"
    ],
    "foundedYear": 1997,
    "headquartersCity": "Gunzenhausen"
  },
  {
    "id": "all-inkl",
    "name": "All-inkl",
    "category": "hosting",
    "country": "de",
    "replacesUS": [
      "AWS",
      "Google Cloud",
      "Azure",
      "Cloudflare"
    ],
    "pricing": "paid",
    "website": "https://all-inkl.com",
    "description": "German web hosting provider offering shared hosting, managed servers, domains, and reseller options. Based in Friedersdorf, Germany with over 25 years of experience, 2+ million domains, and 5+ million email addresses. Operates on 100% renewable energy with servers in German data centers.",
    "localizedDescriptions": {
      "de": "Deutscher Webhosting-Anbieter mit Shared Hosting, Managed Servern, Domains und Reseller-Optionen. Sitz in Friedersdorf, Deutschland mit über 25 Jahren Erfahrung, 2+ Millionen Domains und 5+ Millionen E-Mail-Adressen. Betrieb zu 100 % mit erneuerbarer Energie und Servern in deutschen Rechenzentren."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "hosting",
      "paid",
      "webhosting",
      "managed-server",
      "domains",
      "gdpr"
    ],
    "foundedYear": 2000,
    "headquartersCity": "Friedersdorf"
  },
  {
    "id": "hostinger",
    "name": "Hostinger",
    "category": "hosting",
    "country": "lt",
    "replacesUS": [
      "AWS",
      "Google Cloud",
      "Azure",
      "Cloudflare"
    ],
    "pricing": "paid",
    "website": "https://www.hostinger.com",
    "description": "Lithuanian web hosting and cloud infrastructure provider serving over 4 million customers in 150+ countries. Offers shared hosting, cloud hosting, VPS, email hosting, and an AI-powered website builder — all at aggressive price points with GDPR-compliant, ISO 27001-certified data centers across Europe.",
    "localizedDescriptions": {
      "de": "Litauischer Webhosting- und Cloud-Infrastrukturanbieter mit über 4 Millionen Kunden in mehr als 150 Ländern. Bietet Shared Hosting, Cloud Hosting, VPS, E-Mail-Hosting und einen KI-gestützten Website-Baukasten — alles zu wettbewerbsfähigen Preisen mit DSGVO-konformen, ISO-27001-zertifizierten Rechenzentren in Europa."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "hosting",
      "paid",
      "gdpr",
      "cloud",
      "email",
      "aws",
      "google-cloud"
    ],
    "foundedYear": 2004,
    "headquartersCity": "Vilnius"
  },
  {
    "id": "hugging-face",
    "name": "Hugging Face",
    "category": "ai-ml",
    "country": "fr",
    "replacesUS": [
      "OpenAI",
      "Google AI",
      "AWS AI"
    ],
    "pricing": "freemium",
    "website": "https://huggingface.co",
    "description": "The leading open-source AI platform and model hub, founded by French entrepreneurs in Paris. Hosts over 500,000 models, 100,000 datasets, and the widely-used Transformers library. Provides free community access alongside paid compute and enterprise features, championing open and collaborative AI development.",
    "localizedDescriptions": {
      "de": "Die führende Open-Source-KI-Plattform und Modell-Hub, gegründet von französischen Unternehmern in Paris. Beherbergt über 500.000 Modelle, 100.000 Datensätze und die weit verbreitete Transformers-Bibliothek. Bietet kostenlosen Community-Zugang neben kostenpflichtigen Rechen- und Enterprise-Funktionen und setzt sich für offene und kollaborative KI-Entwicklung ein."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "openSourceAuditUrl": "https://github.com/orgs/huggingface/repositories",
    "tags": [
      "ai-ml",
      "freemium",
      "open-source",
      "openai",
      "google-ai"
    ],
    "foundedYear": 2016,
    "headquartersCity": "Paris",
    "sourceCodeUrl": "https://github.com/huggingface",
    "license": "Apache-2.0 (libraries/tools); proprietary Hub platform"
  },
  {
    "id": "infomaniak",
    "name": "Infomaniak",
    "category": "hosting",
    "country": "ch",
    "replacesUS": [
      "AWS",
      "Google Cloud",
      "Azure"
    ],
    "pricing": "paid",
    "website": "https://www.infomaniak.com",
    "description": "Employee-owned Swiss hosting and cloud provider powering over 100,000 websites with servers running exclusively on renewable energy in Swiss data centers. Infomaniak offers web hosting, email, kSuite productivity tools, kDrive storage, and the Euria AI assistant — all GDPR- and nFADP-compliant with no data resale.",
    "localizedDescriptions": {
      "de": "Mitarbeitergeführter Schweizer Hosting- und Cloud-Anbieter, der über 100.000 Websites betreibt, mit Servern ausschließlich in Schweizer Rechenzentren und 100 % erneuerbarer Energie. Infomaniak bietet Webhosting, E-Mail, kSuite-Produktivitätstools, kDrive-Speicher und den KI-Assistenten Euria — alles DSGVO- und nDSG-konform, ohne Weiterverkauf von Daten."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "hosting",
      "paid",
      "gdpr",
      "cloud",
      "email",
      "aws",
      "google-cloud"
    ],
    "foundedYear": 1994,
    "headquartersCity": "Geneva"
  },
  {
    "id": "jellyfin",
    "name": "Jellyfin",
    "category": "other",
    "country": "eu",
    "replacesUS": [
      "Plex",
      "Emby"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://jellyfin.org",
    "description": "Volunteer-built free software media server for self-hosted media streaming. Fork of Emby created in 2018 after Emby went proprietary. No central servers, no tracking, no phone-home. Full open-source under GPL-2.0 with client and server code available on GitHub.",
    "localizedDescriptions": {
      "de": "Von Freiwilligen entwickelte freie Software für selbstgehostete Media-Streaming-Server. Abspaltung von Emby, die 2018 entstand, als Emby proprietär wurde. Keine zentralen Server, kein Tracking, keine Telefon-nach-Hause-Funktion. Vollständig quelloffen unter GPL-2.0 mit Client- und Server-Code auf GitHub."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/jellyfin/jellyfin",
    "tags": [
      "media-server",
      "streaming",
      "free",
      "open-source",
      "self-hosted",
      "privacy",
      "plex",
      "emby"
    ],
    "foundedYear": 2018,
    "license": "GPL-2.0"
  },
  {
    "id": "kdrive",
    "name": "Infomaniak kDrive",
    "category": "cloud-storage",
    "country": "ch",
    "replacesUS": [
      "Google Drive",
      "Dropbox",
      "OneDrive",
      "iCloud"
    ],
    "pricing": "freemium",
    "website": "https://www.infomaniak.com/en/ksuite/kdrive",
    "description": "Swiss cloud storage by Infomaniak with 15 GB free and integrated online office tools. kDrive data is hosted in Swiss data centers operated by Infomaniak, while the open-source footprint is focused on clients and regular storage is not end-to-end zero-knowledge encrypted by default.",
    "localizedDescriptions": {
      "de": "Schweizer Cloud-Speicher von Infomaniak mit 15 GB gratis und integrierten Online-Office-Tools. kDrive-Daten liegen in von Infomaniak betriebenen Schweizer Rechenzentren; quelloffen sind vor allem die Clients, während regulärer Speicher standardmässig nicht Ende-zu-Ende- bzw. Zero-Knowledge-verschlüsselt ist."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "openSourceAuditUrl": "https://github.com/orgs/Infomaniak/repositories",
    "tags": [
      "cloud-storage",
      "freemium",
      "open-source",
      "gdpr",
      "cloud",
      "office-suite",
      "google-drive",
      "dropbox"
    ],
    "foundedYear": 1994,
    "headquartersCity": "Geneva",
    "sourceCodeUrl": "https://github.com/Infomaniak",
    "license": "GPL-3.0 (clients); proprietary managed backend"
  },
  {
    "id": "koofr",
    "name": "Koofr",
    "category": "cloud-storage",
    "country": "si",
    "replacesUS": [
      "Google Drive",
      "Dropbox",
      "OneDrive",
      "iCloud"
    ],
    "pricing": "freemium",
    "website": "https://koofr.eu",
    "description": "Slovenian cloud storage service offering 10 GB free with no trackers or cookies. Data stored in ISO 27001 certified German data centers. Provides client-side encrypted Vault option, multi-device sync, and integrates with other cloud storage providers. Employee-owned company founded in 2012.",
    "localizedDescriptions": {
      "de": "Slowenischer Cloud-Speicherdienst mit 10 GB gratis ohne Tracker oder Cookies. Daten werden in ISO 27001 zertifizierten deutschen Rechenzentren gespeichert. Bietet clientenseitig verschlüsselte Vault-Option, Multi-Geräte-Sync und Integration mit anderen Cloud-Anbietern. Mitarbeitergeführtes Unternehmen seit 2012."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "openSourceAuditUrl": "https://github.com/koofr",
    "tags": [
      "cloud-storage",
      "freemium",
      "open-source",
      "gdpr",
      "privacy",
      "no-cookies",
      "e2ee"
    ],
    "foundedYear": 2012,
    "headquartersCity": "Ljubljana",
    "sourceCodeUrl": "https://github.com/koofr",
    "license": "MIT (Vault, SDKs); proprietary core service"
  },
  {
    "id": "kdenlive",
    "name": "Kdenlive",
    "category": "other",
    "country": "de",
    "replacesUS": [
      "Adobe Premiere Pro",
      "DaVinci Resolve",
      "Final Cut Pro"
    ],
    "pricing": "free",
    "website": "https://kdenlive.org",
    "logo": "/logos/kdenlive.svg",
    "description": "Free and open-source video editing software developed by KDE, a German non-profit organization. Based on MLT Framework and KDE Frameworks, it offers professional-grade features including multi-track editing, keyframe animation, proxy editing, and support for a wide range of formats via FFmpeg. Available on Linux, Windows, macOS, and FreeBSD.",
    "localizedDescriptions": {
      "de": "Freie und quelloffene Videoschnittsoftware, entwickelt von KDE, einer deutschen Non-Profit-Organisation. Basiert auf MLT Framework und KDE Frameworks, bietet professionelle Funktionen wie Multi-Track-Editing, Keyframe-Animation, Proxy-Editing und Unterstützung für zahlreiche Formate via FFmpeg. Verfügbar für Linux, Windows, macOS und FreeBSD."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://invent.kde.org/multimedia/kdenlive",
    "tags": [
      "video-editing",
      "free",
      "open-source",
      "foss",
      "kde",
      "premiere-pro",
      "davinci-resolve"
    ],
    "foundedYear": 2002,
    "headquartersCity": "Berlin",
    "license": "GPL-3.0-or-later"
  },
  {
    "id": "ionos",
    "name": "IONOS",
    "category": "hosting",
    "country": "de",
    "replacesUS": [
      "AWS",
      "Google Cloud",
      "Azure",
      "Cloudflare"
    ],
    "pricing": "paid",
    "website": "https://www.ionos.com",
    "description": "German hosting and cloud provider with EU jurisdiction, public-company governance, and strong assurance signals including ISO 27001/BSI certifications and a public cloud vulnerability register. Key trust caveats remain around pricing and renewal dynamics, no official public bug bounty program, and privacy-policy language that allows AI-related processing and possible international data transfers.",
    "localizedDescriptions": {
      "de": "Deutscher Hosting- und Cloud-Anbieter mit EU-Jurisdiktion, börsennotierter Governance und starken Assurance-Signalen inklusive ISO-27001-/BSI-Zertifizierungen sowie einem öffentlichen Cloud-Schwachstellenregister. Relevante Vertrauensvorbehalte bleiben bei Preis- und Verlängerungsdynamik, fehlendem offiziellem öffentlichem Bug-Bounty-Programm sowie Datenschutzklauseln zu KI-bezogener Verarbeitung und möglichen internationalen Datentransfers."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "hosting",
      "paid",
      "gdpr",
      "cloud",
      "aws",
      "google-cloud"
    ],
    "foundedYear": 1988,
    "headquartersCity": "Montabaur",
    "sourceCodeUrl": "https://github.com/ionos-cloud"
  },
  {
    "id": "ivpn",
    "name": "IVPN",
    "category": "vpn",
    "country": "gb",
    "replacesUS": [
      "ExpressVPN"
    ],
    "pricing": "paid",
    "website": "https://www.ivpn.net",
    "description": "Gibraltar-based privacy VPN endorsed by the Freedom of the Press Foundation, with a transparent anti-tracking stance and no surveillance-jurisdiction ties. Supports anonymous sign-up, accepts cash and crypto payments, and publishes an ethics page detailing what it will and will not do.",
    "localizedDescriptions": {
      "de": "In Gibraltar ansässiges Privatsphäre-VPN, empfohlen von der Freedom of the Press Foundation, mit transparenter Anti-Tracking-Haltung und keinen Verbindungen zu Überwachungsjurisdiktionen. Unterstützt anonyme Anmeldung, akzeptiert Bar- und Kryptozahlungen und veröffentlicht eine Ethik-Seite."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "openSourceAuditUrl": "https://www.ivpn.net/blog/ivpn-applications-are-now-open-source/",
    "tags": [
      "vpn",
      "paid",
      "open-source",
      "privacy",
      "payments",
      "expressvpn"
    ],
    "foundedYear": 2009,
    "headquartersCity": "Gibraltar",
    "sourceCodeUrl": "https://github.com/ivpn",
    "license": "GPL-3.0 (client apps); proprietary server infrastructure"
  },
  {
    "id": "ipv64",
    "name": "IPv64.net",
    "category": "dns",
    "country": "de",
    "logo": "/logos/ipv64.svg",
    "replacesUS": [
      "Google DNS",
      "Cloudflare DNS",
      "OpenDNS",
      "Cloudflare"
    ],
    "pricing": "free",
    "website": "https://ipv64.net",
    "description": "German DNS and networking services provider offering DynDNS2, DNS64 with ad-blocking and malware protection, healthcheck services, WireGuard VPN gateway, and CDN. Operated by Prox IT UG based in Mülheim an der Ruhr, Germany. All services hosted on Hetzner cloud infrastructure in Germany. Privacy policy explicitly states no third-country data transfers.",
    "localizedDescriptions": {
      "de": "Deutscher DNS- und Netzwerkdienstanbieter mit DynDNS2, DNS64 mit Werbeblocker und Malware-Schutz, Healthcheck-Diensten, WireGuard-VPN-Gateway und CDN. Betrieben von Prox IT UG mit Sitz in Mülheim an der Ruhr, Deutschland. Alle Dienste auf Hetzner-Cloud-Infrastruktur in Deutschland gehostet. Datenschutzerklärung erklärt explizit keine Drittländer-Datentransfers."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "dns",
      "dyndns",
      "free",
      "privacy",
      "gdpr",
      "vpn",
      "wireguard",
      "cdn",
      "german"
    ],
    "foundedYear": 2022,
    "headquartersCity": "Mülheim an der Ruhr"
  },
  {
    "id": "keepass",
    "name": "KeePass",
    "category": "password-manager",
    "country": "de",
    "replacesUS": [
      "LastPass",
      "1Password",
      "Dashlane"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://keepass.info",
    "description": "The original free, open source password manager. Stores all passwords in one encrypted database locked with a master key. Uses AES-256, ChaCha20 and Twofish encryption. Windows-focused but with cross-platform ports.",
    "localizedDescriptions": {
      "de": "Der originale freie Open-Source-Passwort-Manager. Speichert alle Passwörter in einer verschlüsselten Datenbank, die mit einem Master-Schlüssel gesperrt wird. Verschlüsselung mit AES-256, ChaCha20 und Twofish. Windows-fokussiert, aber mit plattformübergreifenden Ports."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "password-manager",
      "free",
      "open-source",
      "privacy",
      "encryption"
    ],
    "foundedYear": 2003,
    "headquartersCity": "Metzingen",
    "sourceCodeUrl": "https://sourceforge.net/projects/keepass/",
    "license": "GPL-2.0"
  },
  {
    "id": "keepassxc",
    "name": "KeePassXC",
    "category": "password-manager",
    "country": "de",
    "replacesUS": [
      "LastPass",
      "1Password",
      "Dashlane"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://keepassxc.org",
    "description": "Community-driven, fully offline password manager that stores credentials in an encrypted local database — no cloud, no account, no subscription. Cross-platform C++ rewrite of KeePass with modern UX, browser integration, SSH agent support, and TOTP, trusted by privacy advocates worldwide.",
    "localizedDescriptions": {
      "de": "Community-getriebener, vollständig offline arbeitender Passwort-Manager, der Zugangsdaten in einer verschlüsselten lokalen Datenbank speichert — keine Cloud, kein Konto, kein Abo. Plattformübergreifende C++-Neuentwicklung von KeePass mit moderner Oberfläche, Browser-Integration, SSH-Agent-Unterstützung und TOTP."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "password-manager",
      "free",
      "open-source",
      "privacy",
      "encryption",
      "cloud",
      "browser",
      "lastpass"
    ],
    "foundedYear": 2016,
    "headquartersCity": "Weimar",
    "sourceCodeUrl": "https://github.com/keepassxreboot/keepassxc",
    "license": "GPL-2.0-or-later / GPL-3.0-or-later"
  },
  {
    "id": "lemmy",
    "name": "Lemmy",
    "category": "social-media",
    "country": "eu",
    "replacesUS": [
      "Reddit",
      "Facebook Groups"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://join-lemmy.org",
    "description": "Federated link aggregator and discussion platform written in Rust. Lemmy lets communities self-host their own forums that seamlessly interoperate across the Fediverse, offering a corporate-free alternative to centralized social platforms.",
    "localizedDescriptions": {
      "de": "Föderierter Link-Aggregator und Diskussionsplattform in Rust geschrieben. Lemmy ermöglicht Communitys, eigene Foren zu betreiben, die nahtlos im Fediverse vernetzt sind — eine konzernfreie Alternative zu zentralisierten sozialen Plattformen."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "social-media",
      "free",
      "open-source",
      "federated",
      "reddit",
      "facebook-groups"
    ],
    "foundedYear": 2019,
    "headquartersCity": "open",
    "sourceCodeUrl": "https://github.com/LemmyNet/lemmy",
    "license": "AGPL-3.0"
  },
  {
    "id": "loops",
    "name": "Loops",
    "category": "social-media",
    "country": "ca",
    "replacesUS": [
      "TikTok"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://joinloops.org",
    "description": "Federated short-form video platform designed as an ethical alternative to TikTok. Loops is open-source, ad-free, and built on ActivityPub for federation across the fediverse. Part of the Pixelfed ecosystem.",
    "localizedDescriptions": {
      "de": "Föderierte Kurzvideo-Plattform als ethische Alternative zu TikTok. Loops ist Open-Source, werbefrei und basiert auf ActivityPub für Föderation im Fediverse. Teil des Pixelfed-Ökosystems."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "social-media",
      "short-video",
      "tiktok",
      "free",
      "open-source",
      "federated",
      "activitypub",
      "fediverse"
    ],
    "foundedYear": 2024,
    "headquartersCity": "open",
    "sourceCodeUrl": "https://github.com/joinloops/loops-server",
    "license": "AGPL-3.0"
  },
  {
    "id": "localsend",
    "name": "LocalSend",
    "category": "cloud-storage",
    "country": "de",
    "replacesUS": [
      "AirDrop",
      "Quick Share"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://localsend.org",
    "description": "Open-source cross-platform file sharing app that allows secure transfer between nearby devices over local network without internet. End-to-end encrypted, no account required. Developed by German individual developer Tien Do Nam.",
    "localizedDescriptions": {
      "de": "Open-Source plattformübergreifende App für Dateiübertragung zwischen Geräten im lokalen Netzwerk ohne Internet. Ende-zu-Ende-verschlüsselt, kein Konto erforderlich. Entwickelt von einem deutschen Individualentwickler."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/localsend/localsend",
    "tags": [
      "file-sharing",
      "airdrop-alternative",
      "free",
      "open-source",
      "encryption",
      "cross-platform",
      "local-network"
    ],
    "foundedYear": 2022,
    "headquartersCity": "Berlin",
    "license": "Apache-2.0"
  },
  {
    "id": "liberapay",
    "name": "Liberapay",
    "logo": "/logos/liberapay.svg",
    "category": "payments",
    "country": "fr",
    "replacesUS": [
      "PayPal"
    ],
    "pricing": "free",
    "website": "https://en.liberapay.com",
    "description": "European recurrent donations platform helping creators and projects receive sustained funding. Founded as a French non-profit in 2015, Liberapay enables weekly/monthly/yearly donations without taking a cut. Full source code available under CC0 license.",
    "localizedDescriptions": {
      "de": "Europäische Plattform für wiederkehrende Spenden, die Ersteller und Projekte bei nachhaltiger Finanzierung unterstützt. 2015 als französische Non-Profit-Organisation gegründet, ermöglicht Liberapay wöchentliche/monatliche/jährliche Spenden ohne Provision. Vollständiger Quellcode unter CC0-Lizenz verfügbar."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/liberapay/liberapay.com",
    "tags": [
      "payments",
      "donations",
      "crowdfunding",
      "open-source",
      "non-profit",
      "paypal"
    ],
    "foundedYear": 2015,
    "headquartersCity": "Querrien",
    "license": "CC0-1.0"
  },
  {
    "id": "discourse",
    "name": "Discourse",
    "category": "social-media",
    "country": "us",
    "replacesUS": [
      "Reddit"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://www.discourse.org",
    "description": "US-based fully open-source community discussion platform. Powers 22,000+ communities worldwide with features for forums, knowledge bases, and real-time chat. Available as managed hosting or self-hosted. Full source code available on GitHub under GPL-2.0.",
    "localizedDescriptions": {
      "de": " Vollständig quelloffene Community-Diskussionsplattform aus den USA. Betreibt über 22.000 Communities weltweit mit Funktionen für Foren, Wissensdatenbanken und Echtzeit-Chat. Verfügbar als verwalteter Hosting-Service oder self-hosted. Vollständiger Quellcode auf GitHub unter GPL-2.0 verfügbar."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "social-media",
      "forum",
      "freemium",
      "open-source",
      "reddit",
      "community",
      "self-hosted"
    ],
    "foundedYear": 2013,
    "headquartersCity": "United States",
    "sourceCodeUrl": "https://github.com/discourse/discourse",
    "license": "GPL-2.0"
  },
  {
    "id": "libreoffice",
    "name": "LibreOffice",
    "category": "office-suite",
    "country": "de",
    "replacesUS": [
      "Microsoft Office",
      "Google Workspace"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://www.libreoffice.org",
    "description": "Community-driven, full-featured office suite backed by The Document Foundation in Berlin. Offers Writer, Calc, Impress, Draw, Base and Math — all fully compatible with Microsoft formats — and is one of the most widely deployed open-source productivity suites worldwide.",
    "localizedDescriptions": {
      "de": "Von der Community entwickelte, umfassende Office-Suite, getragen von der Document Foundation in Berlin. Bietet Writer, Calc, Impress, Draw, Base und Math — vollständig kompatibel mit Microsoft-Formaten — und ist eine der am weitesten verbreiteten Open-Source-Produktivitätslösungen weltweit."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "office-suite",
      "free",
      "open-source",
      "microsoft-office",
      "google-workspace"
    ],
    "foundedYear": 2010,
    "headquartersCity": "Berlin",
    "sourceCodeUrl": "https://github.com/LibreOffice/core",
    "license": "MPL-2.0"
  },
  {
    "id": "magic-earth",
    "name": "Magic Earth",
    "category": "maps",
    "country": "nl",
    "replacesUS": [
      "Google Maps",
      "Apple Maps",
      "Waze"
    ],
    "pricing": "freemium",
    "website": "https://www.magicearth.com",
    "description": "Amsterdam-based navigation app offering free turn-by-turn navigation, offline maps, real-time traffic and speed camera alerts — all powered by OpenStreetMap with zero ads and no user tracking. Used as the default navigation app on several privacy-focused mobile operating systems.",
    "localizedDescriptions": {
      "de": "In Amsterdam ansässige Navigations-App mit kostenloser Schritt-für-Schritt-Navigation, Offline-Karten, Echtzeit-Verkehrsdaten und Blitzer-Warnungen — alles basierend auf OpenStreetMap, ohne Werbung und ohne Nutzer-Tracking. Wird als Standard-Navigations-App auf mehreren datenschutzorientierten Mobilbetriebssystemen verwendet."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "maps",
      "freemium",
      "privacy",
      "google-maps",
      "apple-maps"
    ],
    "foundedYear": 2015,
    "headquartersCity": "Amsterdam"
  },
  {
    "id": "mailbox-org",
    "name": "mailbox.org",
    "category": "email",
    "country": "de",
    "replacesUS": [
      "Gmail",
      "Outlook",
      "Yahoo Mail"
    ],
    "pricing": "paid",
    "website": "https://mailbox.org",
    "description": "Privacy-focused email and productivity suite from Berlin, built on open-source software by the Linux specialists at Heinlein Support. Starting at 1 EUR per month, it offers DSGVO-compliant email, calendar, cloud storage, video conferencing, and document editing — all hosted exclusively on servers in Germany.",
    "localizedDescriptions": {
      "de": "Datenschutzfreundliche E-Mail- und Produktivitätssuite aus Berlin, aufgebaut auf Open-Source-Software von den Linux-Spezialisten bei Heinlein Support. Ab 1 EUR pro Monat bietet sie DSGVO-konforme E-Mail, Kalender, Cloud-Speicher, Videokonferenzen und Dokumentenbearbeitung — alles ausschließlich auf Servern in Deutschland gehostet."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "email",
      "paid",
      "privacy",
      "open-source",
      "cloud",
      "gmail",
      "outlook"
    ],
    "foundedYear": 2014,
    "headquartersCity": "Berlin"
  },
  {
    "id": "mailfence",
    "name": "Mailfence",
    "category": "email",
    "country": "be",
    "replacesUS": [
      "Gmail",
      "Outlook",
      "Yahoo Mail"
    ],
    "pricing": "freemium",
    "website": "https://mailfence.com",
    "description": "Belgian encrypted email suite offering OpenPGP end-to-end encryption, digital signatures, calendar, contacts, documents, and group workspaces. Operated by ContactOffice Group since 2013, it is subject to strict Belgian privacy law and donates 15% of its premium revenue to digital-rights organizations like EFF and EDRi.",
    "localizedDescriptions": {
      "de": "Belgische verschlüsselte E-Mail-Suite mit OpenPGP-Ende-zu-Ende-Verschlüsselung, digitalen Signaturen, Kalender, Kontakten, Dokumenten und Gruppen-Arbeitsbereichen. Seit 2013 von der ContactOffice Group betrieben, unterliegt sie dem strengen belgischen Datenschutzrecht und spendet 15 % der Premium-Einnahmen an Organisationen für digitale Rechte wie EFF und EDRi."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "email",
      "freemium",
      "privacy",
      "encryption",
      "office-suite",
      "gmail",
      "outlook"
    ],
    "foundedYear": 2013,
    "headquartersCity": "Brussels"
  },
  {
    "id": "mastodon",
    "name": "Mastodon",
    "category": "social-media",
    "country": "de",
    "replacesUS": [
      "X/Twitter",
      "Facebook"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://joinmastodon.org",
    "description": "German-founded, AGPL-licensed federated social platform where independent servers interoperate via ActivityPub. Mastodon removes ad-driven ranking by default, while privacy and moderation practices depend on the instance you choose.",
    "localizedDescriptions": {
      "de": "Deutsch gegründete, AGPL-lizenzierte föderierte Social-Plattform, bei der unabhängige Server über ActivityPub zusammenarbeiten. Mastodon verzichtet standardmässig auf werbegetriebenes Ranking, während Datenschutz und Moderation von der gewählten Instanz abhängen."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "social-media",
      "free",
      "open-source",
      "federated",
      "activitypub",
      "x-twitter",
      "facebook"
    ],
    "foundedYear": 2016,
    "headquartersCity": "Berlin",
    "sourceCodeUrl": "https://github.com/mastodon/mastodon",
    "license": "AGPL-3.0"
  },
  {
    "id": "mattermost",
    "name": "Mattermost",
    "category": "messaging",
    "country": "us",
    "replacesUS": [
      "Slack",
      "Microsoft Teams"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://mattermost.com",
    "description": "Open-source secure collaboration platform for mission-critical work. Developed in Go/React, MIT-licensed Team Edition with AGPLv3 server source. Features channel-based messaging, file sharing, video calling, and workflow automation. Self-hostable or cloud-hosted. Used by US Department of Defense, NASA, and enterprises worldwide.",
    "localizedDescriptions": {
      "de": "Open-Source sichere Kollaborationsplattform für kritische Arbeiten. Entwickelt in Go/React, MIT-lizenzierte Team Edition mit AGPLv3 Server-Quellcode. Funktionen umfassen Kanal-basiertes Messaging, Dateifreigabe, Videoanrufe und Workflow-Automatisierung. Self-hostbar oder Cloud-gehostet. Genutzt vom US-Verteidigungsministerium, NASA und Unternehmen weltweit."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/mattermost/mattermost",
    "tags": [
      "messaging",
      "freemium",
      "open-source",
      "team-communication",
      "slack",
      "microsoft-teams",
      "devsecops"
    ],
    "foundedYear": 2015,
    "headquartersCity": "Palo Alto",
    "license": "MIT (Team Edition); AGPL-3.0 (server)"
  },
  {
    "id": "datawrapper",
    "name": "Datawrapper",
    "category": "analytics",
    "country": "de",
    "replacesUS": [
      "Tableau",
      "Microsoft Power BI",
      "Looker",
      "Google Data Studio"
    ],
    "pricing": "freemium",
    "website": "https://www.datawrapper.de",
    "description": "German web-based tool for creating charts, maps, and tables. Used by major news organizations including The New York Times, Washington Post, Reuters, and Die Zeit. Offers free tier with basic features and paid plans for teams with custom branding and self-hosting options.",
    "localizedDescriptions": {
      "de": "Deutsches webbasiertes Tool zur Erstellung von Diagrammen, Karten und Tabellen. Genutzt von großen Nachrichtenorganisationen wie The New York Times, Washington Post, Reuters und Die Zeit. Bietet kostenlose Basisversion und kostenpflichtige Tarife für Teams mit individueller Markenbindung und Self-Hosting-Optionen."
    },
    "isOpenSource": false,
    "openSourceLevel": "partial",
    "tags": [
      "analytics",
      "visualization",
      "charts",
      "maps",
      "tables",
      "data-visualization",
      "journalism",
      "german"
    ],
    "foundedYear": 2012,
    "headquartersCity": "Berlin",
    "sourceCodeUrl": "https://github.com/datawrapper"
  },
  {
    "id": "deltamaster",
    "name": "DeltaMaster",
    "category": "analytics",
    "country": "de",
    "replacesUS": [
      "Microsoft Power BI",
      "Tableau",
      "Qlik",
      "Looker"
    ],
    "pricing": "paid",
    "website": "https://bissantz.de/en/applications/deltamaster/",
    "description": "German business intelligence software for controlling and data-based management. DeltaMaster offers integrated analysis, planning, and reporting in one interface with AI-powered automation, standardized report generation, and patented visualization technology. Used by major German and European enterprises including Leica, Bosch, MediaMarkt, Würth, and Porsche.",
    "localizedDescriptions": {
      "de": "Deutsche Business-Intelligence-Software für Controlling und datenbasierte Unternehmenssteuerung. DeltaMaster bietet integrierte Analyse, Planung und Reporting in einer Oberfläche mit KI-gestützter Automatisierung, standardisierter Berichterstellung und patentierter Visualisierungstechnologie. Nutzung durch große deutsche und europäische Unternehmen wie Leica, Bosch, MediaMarkt, Würth und Porsche."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "analytics",
      "business-intelligence",
      "bi",
      "reporting",
      "enterprise",
      "german",
      "controlling"
    ],
    "foundedYear": 2003,
    "headquartersCity": "Nuremberg"
  },
  {
    "id": "matomo",
    "name": "Matomo",
    "category": "analytics",
    "country": "fr",
    "replacesUS": [
      "Google Analytics",
      "Mixpanel",
      "Amplitude"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://matomo.org",
    "description": "The leading open-source alternative to Google Analytics, used on over 1.4 million websites in 190+ countries. Matomo offers full data ownership with self-hosting or EU-hosted cloud, comprehensive visitor analytics, heatmaps, and A/B testing — all under the GPL license.",
    "localizedDescriptions": {
      "de": "Die führende Open-Source-Alternative zu Google Analytics, im Einsatz auf über 1,4 Millionen Websites in mehr als 190 Ländern. Matomo bietet volle Datenhoheit durch Self-Hosting oder EU-gehostete Cloud, umfassende Besucheranalysen, Heatmaps und A/B-Tests — alles unter der GPL-Lizenz."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "openSourceAuditUrl": "https://matomo.org/faq/general/faq_22573/",
    "tags": [
      "analytics",
      "freemium",
      "open-source",
      "cloud",
      "maps",
      "hosting",
      "google-analytics",
      "mixpanel"
    ],
    "foundedYear": 2007,
    "headquartersCity": "French",
    "sourceCodeUrl": "https://github.com/matomo-org/matomo",
    "license": "GPL-3.0 (core); InnoCraft EULA (premium plugins)"
  },
  {
    "id": "mollie",
    "name": "Mollie",
    "category": "payments",
    "country": "nl",
    "replacesUS": [
      "Stripe",
      "PayPal",
      "Square"
    ],
    "pricing": "paid",
    "website": "https://www.mollie.com",
    "logo": "/logos/mollie.svg?v=20260212",
    "description": "Dutch payment service provider and regulated e-money institution focused on European merchants, with broad local-method coverage, API tooling, and public status transparency. Core tradeoffs are typical PSP constraints (reserves/termination mechanics), AI-related processing language in privacy terms, and security exposure in popular third-party plugin integrations if patching is delayed.",
    "localizedDescriptions": {
      "de": "Niederländischer Zahlungsdienstleister und reguliertes E-Geld-Institut mit Fokus auf europäische Händler, breiter lokaler Zahlungsmethoden-Abdeckung, API-Tooling und öffentlicher Status-Transparenz. Zentrale Trade-offs sind typische PSP-Einschränkungen (Reserven/Kündigungsmechanik), KI-bezogene Verarbeitungszwecke in den Privacy-Texten sowie Sicherheitsrisiken in populären Drittanbieter-Plugin-Integrationen bei verzögertem Patchen."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "payments",
      "psp",
      "regulated-fintech",
      "api",
      "ecommerce",
      "risk-controls",
      "privacy"
    ],
    "foundedYear": 2004,
    "headquartersCity": "Amsterdam",
    "sourceCodeUrl": "https://github.com/mollie"
  },
  {
    "id": "mullvad-browser",
    "name": "Mullvad Browser",
    "category": "browser",
    "country": "se",
    "replacesUS": [
      "Google Chrome",
      "Safari",
      "Edge"
    ],
    "pricing": "free",
    "website": "https://mullvad.net/en/browser",
    "description": "Privacy-focused browser developed by the Tor Project in collaboration with Swedish VPN provider Mullvad. Designed to minimise tracking and fingerprinting out of the box — without requiring a VPN — by shipping the same anti-fingerprinting protections as the Tor Browser.",
    "localizedDescriptions": {
      "de": "Datenschutzorientierter Browser, entwickelt vom Tor Project in Zusammenarbeit mit dem schwedischen VPN-Anbieter Mullvad. Minimiert Tracking und Fingerprinting direkt nach der Installation — ohne VPN — durch die gleichen Anti-Fingerprinting-Schutzmaßnahmen wie der Tor Browser."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "browser",
      "free",
      "open-source",
      "privacy",
      "vpn",
      "project-management",
      "google-chrome",
      "safari"
    ],
    "foundedYear": 2023,
    "headquartersCity": "Gothenburg",
    "sourceCodeUrl": "https://github.com/mullvad/mullvad-browser",
    "license": "MPL-2.0"
  },
  {
    "id": "mullvad-vpn",
    "name": "Mullvad VPN",
    "category": "vpn",
    "country": "se",
    "replacesUS": [
      "ExpressVPN"
    ],
    "pricing": "paid",
    "website": "https://mullvad.net",
    "description": "Swedish privacy-first VPN with a unique account-number-only system — no email, no name, no personal data required. Charges a flat EUR 5/month with no upsells, long-term lock-ins, or discount gimmicks, and has kept the same price since 2009.",
    "localizedDescriptions": {
      "de": "Schwedisches VPN mit absolutem Fokus auf Privatsphäre — keine E-Mail, kein Name, keine persönlichen Daten erforderlich. Pauschal 5 EUR/Monat ohne Upselling, Vertragsbindung oder Rabattaktionen, zum gleichen Preis seit 2009."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "openSourceAuditUrl": "https://github.com/orgs/mullvad/repositories",
    "tags": [
      "vpn",
      "paid",
      "open-source",
      "privacy",
      "email",
      "expressvpn"
    ],
    "foundedYear": 2009,
    "headquartersCity": "Gothenburg",
    "sourceCodeUrl": "https://github.com/mullvad/mullvadvpn-app",
    "license": "GPL-3.0 (client app); relay server code not published"
  },
  {
    "id": "netbird",
    "name": "NetBird",
    "category": "vpn",
    "country": "de",
    "replacesUS": [
      "Tailscale"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://netbird.io",
    "description": "Open source Zero Trust Network Access (ZTNA) platform combining WireGuard-based overlay networks with centralized access control. Provides SSO, MFA, and granular policies with self-hosting option. Developed by NetBird GmbH in Berlin with operations in the Netherlands.",
    "localizedDescriptions": {
      "de": "Open-Source Zero Trust Network Access (ZTNA)-Plattform, die WireGuard-basierte Overlay-Netzwerke mit zentralisierter Zugriffskontrolle kombiniert. Bietet SSO, MFA und granulare Richtlinien mit Self-Hosting-Option. Entwickelt von NetBird GmbH in Berlin mit Niederlassungen in den Niederlanden."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "openSourceAuditUrl": "https://github.com/netbirdio/netbird",
    "tags": [
      "vpn",
      "ztna",
      "wireguard",
      "open-source",
      "self-hosted",
      "security",
      "sso",
      "mfa"
    ],
    "foundedYear": 2021,
    "headquartersCity": "Berlin",
    "sourceCodeUrl": "https://github.com/netbirdio/netbird",
    "license": "BSD-3-Clause (client); AGPL-3.0 (management, signal, relay)"
  },
  {
    "id": "neo-store",
    "name": "Neo Store",
    "category": "mobile-os",
    "country": "de",
    "replacesUS": [
      "Google Play Store"
    ],
    "pricing": "free",
    "website": "https://github.com/NeoApplications/Neo-Store",
    "description": "Modern F-Droid client with a feature-rich UI. Fork of Foxy-Droid, offering fast repository sync, built-in repositories, and extensive filtering options. Developed by a community of contributors with maintainers in Germany and El Salvador.",
    "localizedDescriptions": {
      "de": "Moderner F-Droid-Client mit funktionsreicher UI. Fork von Foxy-Droid mit schneller Repository-Synchronisation, integrierten Repositories und umfangreichen Filteroptionen. Entwickelt von einer Community mit Maintainern aus Deutschland und El Salvador."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/NeoApplications/Neo-Store",
    "tags": [
      "app-store",
      "android",
      "foss",
      "f-droid",
      "privacy",
      "open-source",
      "google-play"
    ],
    "foundedYear": 2021,
    "headquartersCity": "Community project (maintainers in DE/SV)",
    "license": "GPL-3.0"
  },
  {
    "id": "neorg",
    "name": "Neorg",
    "category": "other",
    "country": "eu",
    "replacesUS": [
      "Obsidian",
      "Evernote",
      "Microsoft OneNote",
      "Apple Notes"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://github.com/nvim-neorg/neorg",
    "description": "Modern organization tool for Neovim, designed as a reimagined alternative to Emacs Org-mode. Features include structured note-taking, task management, time tracking, and documentation writing, all built on a single extensible file format (.norg). Fully open-source with active development and international contributors.",
    "localizedDescriptions": {
      "de": "Modernes Organisationstool für Neovim, als neu konzipierte Alternative zu Emacs Org-mode. Funktionen umfassen strukturiertes Notieren, Aufgabenverwaltung, Zeiterfassung und Dokumentationserstellung, alles auf einem einzigen erweiterbaren Dateiformat (.norg) aufgebaut. Vollständig Open-Source mit aktiver Entwicklung und internationalen Mitwirkenden."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/nvim-neorg/neorg",
    "tags": [
      "notes",
      "knowledge-base",
      "open-source",
      "self-hosted",
      "neovim",
      "organization",
      "emacs-alternative"
    ],
    "foundedYear": 2020,
    "headquartersCity": "Community project (contributors in FR, CH)",
    "license": "GPL-3.0"
  },
  {
    "id": "nextcloud",
    "name": "Nextcloud",
    "category": "cloud-storage",
    "country": "de",
    "replacesUS": [
      "Google Drive",
      "Dropbox",
      "OneDrive",
      "iCloud"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://nextcloud.com",
    "description": "Self-hosted, open-source cloud platform offering file sync, collaboration, and office editing — trusted by the German and French governments. Nextcloud uses AGPLv3 and supports end-to-end encryption through dedicated encrypted folders, while default server-side encryption remains admin-accessible.",
    "localizedDescriptions": {
      "de": "Selbst gehostete Open-Source-Cloud-Plattform mit Dateisynchronisation, Zusammenarbeit und Office-Bearbeitung — im Einsatz bei der deutschen und französischen Regierung. Nextcloud Hub gibt dir die volle Kontrolle über deine Daten, ohne Herstellerbindung und ohne versteckte Enterprise-Funktionen hinter einer Bezahlschranke."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "cloud-storage",
      "free",
      "open-source",
      "self-hosted",
      "cloud",
      "office-suite",
      "google-drive",
      "dropbox"
    ],
    "foundedYear": 2016,
    "headquartersCity": "Stuttgart",
    "sourceCodeUrl": "https://github.com/nextcloud",
    "license": "AGPL-3.0"
  },
  {
    "id": "nordvpn",
    "name": "NordVPN",
    "category": "vpn",
    "country": "nl",
    "replacesUS": [
      "ExpressVPN"
    ],
    "pricing": "paid",
    "website": "https://nordvpn.com",
    "description": "Large VPN provider under Nord Security (Amsterdam with major operations in Vilnius), with a global server network and the NordLynx protocol (WireGuard-based). The Linux client is open-source under GPL-3.0, while core backend and server infrastructure remain proprietary, so trust depends on audits, disclosures, and contract terms.",
    "localizedDescriptions": {
      "de": "Grosser VPN-Anbieter unter Nord Security (Amsterdam mit starkem operativen Zentrum in Vilnius) mit globalem Servernetz und dem NordLynx-Protokoll auf WireGuard-Basis. Der Linux-Client ist unter GPL-3.0 quelloffen, während Backend und Server-Infrastruktur proprietär bleiben. Vertrauen hängt daher stark von Audits, Offenlegung und fairen Vertragsbedingungen ab."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "openSourceAuditUrl": "https://github.com/NordSecurity/nordvpn-linux",
    "tags": [
      "vpn",
      "paid",
      "privacy",
      "no-logs",
      "wireguard",
      "partial-open-source",
      "expressvpn"
    ],
    "foundedYear": 2012,
    "headquartersCity": "Amsterdam (HQ); Vilnius (operations)",
    "sourceCodeUrl": "https://github.com/NordSecurity/nordvpn-linux",
    "license": "GPL-3.0 (Linux client); proprietary backend and infrastructure"
  },
  {
    "id": "nostr",
    "name": "Nostr",
    "category": "social-media",
    "country": "eu",
    "replacesUS": [
      "X/Twitter"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://nostr.com",
    "description": "Decentralized social media protocol using cryptographic keys for identity and relays for message distribution. Founded by pseudonymous developer fiatjaf in 2020, Nostr is open-source (public domain) and censorship-resistant. Multiple independent clients exist (Damus, Amethyst, Coracle).",
    "localizedDescriptions": {
      "de": "Dezentrales Social-Media-Protokoll, das kryptografische Schlüssel für Identität und Relays für Nachrichtenverteilung verwendet. Gegründet vom pseudonymen Entwickler fiatjaf im Jahr 2020, ist Nostr Open-Source (Public Domain) und zensurresistent. Mehrere unabhängige Clients existieren (Damus, Amethyst, Coracle)."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "social-media",
      "free",
      "open-source",
      "decentralized",
      "censorship-resistant",
      "x-twitter",
      "protocol"
    ],
    "foundedYear": 2020,
    "headquartersCity": "open",
    "sourceCodeUrl": "https://github.com/nostr-protocol/nostr",
    "license": "Public Domain"
  },
  {
    "id": "otto",
    "name": "Otto",
    "category": "ecommerce",
    "country": "de",
    "replacesUS": [
      "Amazon",
      "eBay"
    ],
    "pricing": "free",
    "website": "https://otto.de",
    "description": "German e-commerce company and online marketplace based in Hamburg, operating across Europe. Founded in 1949, Otto is one of the largest online retailers in Germany, offering fashion, furniture, electronics, and consumer goods. A genuine European alternative to Amazon and eBay for German-speaking markets.",
    "localizedDescriptions": {
      "de": "Deutsches E-Commerce-Unternehmen und Online-Marktplatz mit Sitz in Hamburg, operierend in ganz Europa. Gegründet 1949, ist Otto einer der größten Online-Händler Deutschlands und bietet Mode, Möbel, Elektronik und Gebrauchswaren. Eine echte europäische Alternative zu Amazon und eBay für den deutschsprachigen Raum."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "ecommerce",
      "marketplace",
      "retail",
      "germany",
      "amazon",
      "ebay"
    ],
    "foundedYear": 1949,
    "headquartersCity": "Hamburg"
  },
  {
    "id": "ollama",
    "name": "Ollama",
    "category": "ai-ml",
    "country": "us",
    "replacesUS": [
      "OpenAI API",
      "Google AI",
      "Anthropic API"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://ollama.com",
    "description": "US-based but fully open-source (MIT) local-first runtime for running large language models on your own hardware. Ollama can run fully offline and also provides optional cloud models and paid plans when you need bigger remote capacity. Note: Ollama is headquartered in the US but included here for its open-source nature and strong local execution path.",
    "localizedDescriptions": {
      "de": "In den USA ansässiges, aber vollständig quelloffenes (MIT) Local-First-Tool zum Ausführen grosser Sprachmodelle auf eigener Hardware. Ollama kann komplett offline laufen und bietet optional Cloud-Modelle sowie bezahlte Pläne für mehr remote Rechenkapazität. Hinweis: Ollama hat seinen Sitz in den USA, wird aber wegen des Open-Source-Kerns und des starken lokalen Betriebswegs hier gelistet."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "ai-ml",
      "freemium",
      "open-source",
      "cloud",
      "openai-api",
      "google-ai"
    ],
    "foundedYear": 2023,
    "headquartersCity": "Palo Alto, CA",
    "sourceCodeUrl": "https://github.com/ollama/ollama",
    "license": "MIT"
  },
  {
    "id": "overleaf",
    "name": "Overleaf",
    "category": "office-suite",
    "country": "gb",
    "replacesUS": [
      "Google Docs",
      "Microsoft Word"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://www.overleaf.com",
    "description": "UK-based online collaborative LaTeX editor founded in 2011, acquired by Digital Science (London) in 2014. Offers both cloud-hosted service and self-hostable Community Edition. Full source code available under AGPL-3.0. Used by millions of researchers and academic institutions worldwide including CERN.",
    "localizedDescriptions": {
      "de": "UK-basierter kollaborativer Online-LaTeX-Editor, gegründet 2011, von Digital Science (London) 2014 übernommen. Bietet sowohl Cloud-Hosting als auch selbst-hostbare Community Edition. Vollständiger Quellcode unter AGPL-3.0 verfügbar. Wird von Millionen von Forschern und akademischen Institutionen weltweit genutzt, einschließlich CERN."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "openSourceAuditUrl": "https://github.com/overleaf/overleaf",
    "tags": [
      "office-suite",
      "freemium",
      "open-source",
      "latex",
      "collaboration",
      "self-hosted",
      "academic"
    ],
    "foundedYear": 2011,
    "headquartersCity": "London",
    "sourceCodeUrl": "https://github.com/overleaf/overleaf",
    "license": "AGPL-3.0"
  },
  {
    "id": "opencloud",
    "name": "OpenCloud",
    "category": "cloud-storage",
    "country": "de",
    "replacesUS": [
      "Google Drive",
      "Dropbox",
      "Microsoft OneDrive"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://opencloud.eu",
    "description": "German open-source file management and collaboration platform from Heinlein Gruppe (Berlin). Fork of ownCloud Infinite Scale, offering secure file storage, sharing, and real-time collaboration with GDPR compliance. Available as self-hosted solution or via partner SaaS.",
    "localizedDescriptions": {
      "de": "Deutsche Open-Source-Plattform für Dateimanagement und Zusammenarbeit von der Heinlein Gruppe (Berlin). Abspaltung von ownCloud Infinite Scale, bietet sichere Dateispeicherung, Teilen und Echtzeit-Zusammenarbeit mit DSGVO-Konformität. Als Self-Hosted-Lösung oder über Partner-SaaS verfügbar."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "openSourceAuditUrl": "https://github.com/opencloud-eu",
    "tags": [
      "cloud-storage",
      "file-sync",
      "open-source",
      "self-hosted",
      "collaboration",
      "gdpr",
      "data-sovereignty"
    ],
    "foundedYear": 2025,
    "headquartersCity": "Berlin",
    "sourceCodeUrl": "https://github.com/opencloud-eu/opencloud",
    "license": "Apache-2.0"
  },
  {
    "id": "paperless-ngx",
    "name": "Paperless-ngx",
    "category": "cloud-storage",
    "country": "eu",
    "replacesUS": [
      "Google Drive",
      "Dropbox",
      "OneDrive",
      "iCloud"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://docs.paperless-ngx.com",
    "description": "Open-source document management system that scans, indexes, and archives all your paper documents. OCR support via Tesseract, full-text search, multi-user permissions, and webhook integrations. Self-hostable for complete data sovereignty.",
    "localizedDescriptions": {
      "de": "Open-Source-Dokumentenmanagement-System zum Scannen, Indexieren und Archivieren Ihrer Papierdokumente. OCR-Unterstützung via Tesseract, Volltextsuche, Multi-User-Berechtigungen und Webhook-Integrationen. Selbst-hostbar für vollständige Datensouveränität."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/paperless-ngx/paperless-ngx",
    "tags": [
      "cloud-storage",
      "document-management",
      "free",
      "open-source",
      "self-hosted",
      "ocr",
      "archive"
    ],
    "foundedYear": 2016,
    "license": "GPL-3.0"
  },
  {
    "id": "openproject",
    "name": "OpenProject",
    "category": "project-management",
    "country": "de",
    "replacesUS": [
      "Jira",
      "Asana",
      "Monday.com",
      "Trello"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://www.openproject.org",
    "description": "The leading open-source project management software from Berlin, supporting classic waterfall, agile Scrum, and hybrid workflows. With Gantt charts, boards, time tracking, budgets, and BIM modules, OpenProject serves teams in governments, enterprises, and NGOs across Europe — all self-hostable under the GPL.",
    "localizedDescriptions": {
      "de": "Die führende Open-Source-Projektmanagement-Software aus Berlin — für klassisches Wasserfall-, agiles Scrum- und hybrides Arbeiten. Mit Gantt-Diagrammen, Boards, Zeiterfassung, Budgets und BIM-Modulen unterstützt OpenProject Teams in Behörden, Unternehmen und NGOs in ganz Europa — vollständig selbst hostbar unter der GPL."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "openSourceAuditUrl": "https://www.openproject.org/docs/enterprise-guide/enterprise-on-premises-guide/enterprise-on-premises-faq/",
    "tags": [
      "project-management",
      "freemium",
      "open-source",
      "jira",
      "asana"
    ],
    "foundedYear": 2012,
    "headquartersCity": "Berlin",
    "sourceCodeUrl": "https://github.com/opf/openproject",
    "license": "GPL-3.0"
  },
  {
    "id": "org-roam",
    "name": "Org-roam",
    "category": "other",
    "country": "eu",
    "replacesUS": [
      "Obsidian",
      "Roam Research",
      "Logseq"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://www.orgroam.com",
    "description": "Plain-text personal knowledge management system that brings Roam-like features to Emacs and Org-mode. Provides networked thought with backlinks, graph visualization, and full offline control. Data stored locally in plain org files with optional GPG encryption. Fully open source under GPL-3.0.",
    "localizedDescriptions": {
      "de": "Plain-Text Persönliches Wissensmanagementsystem, das Roam-ähnliche Funktionen in Emacs und Org-mode bringt. Bietet vernetztes Denken mit Backlinks, Graph-Visualisierung und volle Offline-Kontrolle. Daten werden lokal in Plain-Text-Org-Dateien mit optionaler GPG-Verschlüsselung gespeichert. Vollständig Open Source unter GPL-3.0."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "notes",
      "knowledge-base",
      "open-source",
      "emacs",
      "pkm",
      "zettelkasten",
      "offline"
    ],
    "foundedYear": 2020,
    "sourceCodeUrl": "https://github.com/org-roam/org-roam",
    "license": "GPL-3.0"
  },
  {
    "id": "organic-maps",
    "name": "Organic Maps",
    "category": "maps",
    "country": "ee",
    "replacesUS": [
      "Google Maps",
      "Apple Maps"
    ],
    "pricing": "free",
    "website": "https://organicmaps.app",
    "description": "Fast, privacy-respecting offline maps app for hikers, cyclists and travellers — forked from Maps.me by its original creators. Uses OpenStreetMap data with absolutely no ads, no tracking and no data collection, and works entirely without an internet connection.",
    "localizedDescriptions": {
      "de": "Schnelle, datenschutzfreundliche Offline-Karten-App für Wanderer, Radfahrer und Reisende — von den ursprünglichen Entwicklern als Fork von Maps.me erstellt. Nutzt OpenStreetMap-Daten ganz ohne Werbung, Tracking oder Datensammlung und funktioniert vollständig ohne Internetverbindung."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "maps",
      "free",
      "open-source",
      "privacy",
      "google-maps",
      "apple-maps"
    ],
    "foundedYear": 2020,
    "headquartersCity": "Tallinn",
    "sourceCodeUrl": "https://github.com/organicmaps/organicmaps",
    "license": "Apache-2.0"
  },
  {
    "id": "co-maps",
    "name": "CoMaps",
    "category": "maps",
    "country": "gb",
    "replacesUS": [
      "Google Maps",
      "Apple Maps"
    ],
    "pricing": "free",
    "website": "https://www.comaps.app",
    "description": "Community-driven privacy-focused offline maps app forked from Organic Maps. Built by former Organic Maps contributors following governance concerns. Works completely offline with no tracking, no data collection, and no ads. Open source under Apache 2.0, funded by community donations.",
    "localizedDescriptions": {
      "de": "Community-getriebene, datenschutzfreundliche Offline-Karten-App, geforkt von Organic Maps. Entwickelt von ehemaligen Organic-Maps-Contributern nach Governance-Problemen. Funktioniert vollständig offline ohne Tracking, Datensammlung oder Werbung. Open Source unter Apache 2.0, finanziert durch Community-Spenden."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "maps",
      "free",
      "open-source",
      "privacy",
      "google-maps",
      "apple-maps",
      "offline"
    ],
    "foundedYear": 2025,
    "sourceCodeUrl": "https://codeberg.org/comaps/comaps",
    "license": "Apache-2.0"
  },
  {
    "id": "osmand",
    "name": "OsmAnd",
    "category": "maps",
    "country": "nl",
    "replacesUS": [
      "Google Maps",
      "Apple Maps",
      "Waze"
    ],
    "pricing": "freemium",
    "website": "https://osmand.net",
    "description": "Powerful offline maps and navigation app built on OpenStreetMap data. OsmAnd's code is GPLv3, while artwork/assets use separate Creative Commons terms; the project also applies an explicit app-store exception to permit distribution through stores with DRM constraints.",
    "localizedDescriptions": {
      "de": "Leistungsstarke Offline-Karten- und Navigations-App basierend auf OpenStreetMap-Daten, entwickelt von einem niederländischen Unternehmen. Bietet detaillierte topografische Karten, Wander- und Radrouten, Schritt-für-Schritt-Navigation, ÖPNV und Seekarten — alles vollständig offline verfügbar mit monatlichen Kartenaktualisierungen."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "maps",
      "freemium",
      "open-source",
      "google-maps",
      "apple-maps"
    ],
    "foundedYear": 2010,
    "headquartersCity": "Amstelveen",
    "sourceCodeUrl": "https://github.com/osmandapp/OsmAnd",
    "license": "GPL-3.0 (code) + CC BY-ND (art/assets) with app-store exception"
  },
  {
    "id": "ovhcloud",
    "name": "OVHcloud",
    "category": "hosting",
    "country": "fr",
    "replacesUS": [
      "AWS",
      "Google Cloud",
      "Azure"
    ],
    "pricing": "paid",
    "website": "https://www.ovhcloud.com",
    "description": "Europe's largest cloud provider, operating 40+ data centers worldwide with a strong open-cloud philosophy built on OpenStack. OVHcloud offers public and private cloud, bare-metal servers, and managed Kubernetes with no egress fees.",
    "localizedDescriptions": {
      "de": "Europas größter Cloud-Anbieter mit über 40 Rechenzentren weltweit und einer offenen Cloud-Philosophie auf Basis von OpenStack. OVHcloud bietet Public und Private Cloud, Bare-Metal-Server und Managed Kubernetes ohne Egress-Gebühren."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "hosting",
      "paid",
      "cloud",
      "aws",
      "google-cloud"
    ],
    "foundedYear": 1999,
    "headquartersCity": "Roubaix"
  },
  {
    "id": "passbolt",
    "name": "Passbolt",
    "category": "password-manager",
    "country": "lu",
    "replacesUS": [
      "LastPass",
      "1Password",
      "Dashlane"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://www.passbolt.com",
    "description": "EU-based open-source password manager purpose-built for teams and DevOps workflows, with self-hosted and cloud options. Made in Luxembourg, Passbolt uses end-to-end encryption based on OpenPGP and offers a fully functional free Community Edition alongside paid business and enterprise tiers.",
    "localizedDescriptions": {
      "de": "In der EU ansässiger Open-Source-Passwort-Manager, speziell für Teams und DevOps-Workflows entwickelt, mit Self-Hosted- und Cloud-Optionen. In Luxemburg entwickelt, nutzt Passbolt Ende-zu-Ende-Verschlüsselung auf OpenPGP-Basis und bietet eine voll funktionsfähige kostenlose Community Edition neben Business- und Enterprise-Tarifen."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "openSourceAuditUrl": "https://www.passbolt.com/pricing/pro",
    "tags": [
      "password-manager",
      "freemium",
      "open-source",
      "encryption",
      "self-hosted",
      "cloud",
      "lastpass",
      "1password"
    ],
    "foundedYear": 2016,
    "headquartersCity": "Esch",
    "sourceCodeUrl": "https://github.com/passbolt",
    "license": "AGPL-3.0"
  },
  {
    "id": "pcloud",
    "name": "pCloud",
    "category": "cloud-storage",
    "country": "ch",
    "replacesUS": [
      "Google Drive",
      "Dropbox",
      "iCloud",
      "OneDrive"
    ],
    "pricing": "freemium",
    "website": "https://www.pcloud.com",
    "description": "Swiss-registered cloud storage with over 22 million users, offering lifetime storage plans and an EU data centre in Luxembourg. Optional zero-knowledge client-side encryption ensures that even pCloud cannot read your files.",
    "localizedDescriptions": {
      "de": "In der Schweiz registrierter Cloud-Speicher mit über 22 Millionen Nutzern, der Lifetime-Speicherpläne und ein EU-Rechenzentrum in Luxemburg bietet. Optionale Zero-Knowledge-Verschlüsselung auf Client-Seite stellt sicher, dass nicht einmal pCloud deine Dateien lesen kann."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "cloud-storage",
      "freemium",
      "encryption",
      "zero-knowledge",
      "cloud",
      "google-drive",
      "dropbox"
    ],
    "foundedYear": 2013,
    "headquartersCity": "Baar"
  },
  {
    "id": "peertube",
    "name": "PeerTube",
    "category": "video-hosting",
    "country": "fr",
    "replacesUS": [
      "YouTube",
      "Vimeo",
      "Twitch"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://joinpeertube.org",
    "description": "Decentralized video hosting platform developed by French non-profit Framasoft. PeerTube federates video and live-streaming across independently run instances via ActivityPub, freeing creators from ads, tracking, and algorithmic manipulation.",
    "localizedDescriptions": {
      "de": "Dezentrale Video-Hosting-Plattform, entwickelt vom französischen Verein Framasoft. PeerTube föderiert Video und Livestreaming über unabhängig betriebene Instanzen via ActivityPub — frei von Werbung, Tracking und algorithmischer Manipulation."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "video-hosting",
      "free",
      "open-source",
      "hosting",
      "youtube",
      "vimeo"
    ],
    "foundedYear": 2018,
    "headquartersCity": "Lyon",
    "sourceCodeUrl": "https://github.com/Chocobozzz/PeerTube",
    "license": "AGPL-3.0"
  },
  {
    "id": "pirsch",
    "name": "Pirsch Analytics",
    "category": "analytics",
    "country": "de",
    "replacesUS": [
      "Google Analytics",
      "Mixpanel"
    ],
    "pricing": "paid",
    "website": "https://pirsch.io",
    "description": "Privacy-friendly, cookie-free web analytics made and hosted in Germany. Pirsch is a server-side solution with an open-source core that is GDPR, CCPA, and Schrems II compliant — designed for developers who want clean, simple dashboards without sacrificing visitor privacy.",
    "localizedDescriptions": {
      "de": "Datenschutzfreundliche, cookiefreie Webanalyse — entwickelt und gehostet in Deutschland. Pirsch ist eine serverseitige Lösung mit Open-Source-Kern, DSGVO-, CCPA- und Schrems-II-konform — gemacht für Entwickler, die übersichtliche Dashboards ohne Einbußen bei der Privatsphäre wollen."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "openSourceAuditUrl": "https://github.com/orgs/pirsch-analytics/repositories",
    "tags": [
      "analytics",
      "paid",
      "open-source",
      "privacy",
      "gdpr",
      "google-analytics",
      "mixpanel"
    ],
    "foundedYear": 2020,
    "headquartersCity": "Rheda",
    "sourceCodeUrl": "https://github.com/pirsch-analytics/pirsch",
    "license": "AGPL-3.0 (core engine/SDKs); proprietary SaaS dashboard"
  },
  {
    "id": "piwik-pro",
    "name": "Piwik PRO",
    "category": "analytics",
    "country": "de",
    "replacesUS": [
      "Google Analytics",
      "Mixpanel",
      "Amplitude"
    ],
    "pricing": "paid",
    "website": "https://piwik.pro",
    "description": "Privacy-focused analytics suite developed in Germany, offering web and mobile analytics, tag management, customer data platform, and consent management. Piwik PRO is a commercial fork of Matomo (formerly Piwik) — provides ISO 27001 and SOC 2 certified cloud hosting in EU data centers with full data ownership.",
    "localizedDescriptions": {
      "de": "Datenschutzorientierte Analytics-Suite aus Deutschland, bietet Web- und Mobile-Analytics, Tag-Management, Customer Data Platform und Consent-Management. Piwik PRO ist ein kommerzieller Fork von Matomo — bietet ISO 27001 und SOC 2 zertifiziertes Cloud-Hosting in EU-Rechenzentren mit vollständiger Datenhoheit."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "analytics",
      "paid",
      "privacy",
      "gdpr",
      "tag-manager",
      "cdp",
      "consent-management",
      "google-analytics",
      "mixpanel"
    ],
    "foundedYear": 2014,
    "headquartersCity": "Berlin",
    "sourceCodeUrl": "https://github.com/PiwikPRO"
  },
  {
    "id": "pixelfed",
    "name": "Pixelfed",
    "category": "social-media",
    "country": "eu",
    "replacesUS": [
      "Instagram",
      "Facebook"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://pixelfed.org",
    "description": "Open-source, federated photo-sharing platform that puts creators first. Pixelfed offers an ad-free, algorithm-free Instagram experience with Stories, Collections, and full ActivityPub federation — all without selling your data.",
    "localizedDescriptions": {
      "de": "Open-Source-Fotoplattform mit Föderation, die Kreative in den Mittelpunkt stellt. Pixelfed bietet ein werbe- und algorithmusfreies Instagram-Erlebnis mit Stories, Sammlungen und voller ActivityPub-Integration — ganz ohne Datenverkauf."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "social-media",
      "free",
      "open-source",
      "federated",
      "instagram",
      "facebook"
    ],
    "foundedYear": 2018,
    "headquartersCity": "open",
    "sourceCodeUrl": "https://github.com/pixelfed/pixelfed",
    "license": "AGPL-3.0"
  },
  {
    "id": "plausible",
    "name": "Plausible Analytics",
    "category": "analytics",
    "country": "ee",
    "replacesUS": [
      "Google Analytics",
      "Mixpanel",
      "Amplitude"
    ],
    "pricing": "paid",
    "selfHostable": true,
    "website": "https://plausible.io",
    "description": "Estonian privacy-first web analytics with a strong open-source Community Edition and optional hosted SaaS. Plausible is cookie-free, self-hostable, and offers CSV/Stats API export, while buyers should still account for open-core licensing boundaries and enterprise assurance gaps.",
    "localizedDescriptions": {
      "de": "Datenschutzorientierte Webanalyse aus Estland mit starker Open-Source-Community-Edition und optionalem Hosted-SaaS. Plausible arbeitet cookiefrei, ist self-hostbar und bietet CSV-/Stats-API-Export; zugleich sollten Open-Core-Lizenzgrenzen und fehlende Enterprise-Assurance-Nachweise mitbewertet werden."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "openSourceAuditUrl": "https://plausible.io/blog/open-source-licenses",
    "tags": [
      "analytics",
      "paid",
      "open-source",
      "privacy",
      "self-hosted",
      "gdpr",
      "google-analytics",
      "mixpanel",
      "amplitude"
    ],
    "foundedYear": 2018,
    "headquartersCity": "Tartu",
    "sourceCodeUrl": "https://github.com/plausible/analytics",
    "license": "AGPL-3.0 (Community Edition) + source-available commercial features"
  },
  {
    "id": "posteo",
    "name": "Posteo",
    "category": "email",
    "country": "de",
    "replacesUS": [
      "Gmail",
      "Outlook",
      "Yahoo Mail"
    ],
    "pricing": "paid",
    "website": "https://posteo.de",
    "description": "Independent, ad-free email provider from Berlin running entirely on green energy from Greenpeace Energy. At just 1 EUR per month with no free tier, Posteo forgoes venture capital and tracking, stores all data on AES-encrypted servers in Germany, and supports DANE/TLSA for hardened transport encryption.",
    "localizedDescriptions": {
      "de": "Unabhängiger, werbefreier E-Mail-Anbieter aus Berlin, der komplett mit Ökostrom von Greenpeace Energy betrieben wird. Für nur 1 EUR pro Monat verzichtet Posteo auf Risikokapital und Tracking, speichert alle Daten auf AES-verschlüsselten Servern in Deutschland und unterstützt DANE/TLSA für gehärtete Transportverschlüsselung."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "email",
      "paid",
      "encryption",
      "gmail",
      "outlook"
    ],
    "foundedYear": 2009,
    "headquartersCity": "Berlin"
  },
  {
    "id": "prestashop",
    "name": "PrestaShop",
    "category": "ecommerce",
    "country": "fr",
    "replacesUS": [
      "Shopify",
      "Amazon",
      "eBay"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://prestashop.com",
    "description": "Leading European open-source e-commerce platform with a self-hosted architecture and broad module ecosystem. PrestaShop uses dual licensing: OSL-3.0 for core code and AFL-3.0 for native modules, while its commercial add-on marketplace layers proprietary business licensing on top.",
    "localizedDescriptions": {
      "de": "Die meistgenutzte Open-Source-E-Commerce-Plattform in Europa mit über 300.000 Online-Shops in 60 Sprachen. Selbst gehostet und vollständig anpassbar, bietet PrestaShop einen umfangreichen Modul-Marktplatz und ist kostenlos unter der Open Software License verfügbar."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "ecommerce",
      "freemium",
      "open-source",
      "self-hosted",
      "shopify",
      "amazon"
    ],
    "foundedYear": 2007,
    "headquartersCity": "Paris",
    "sourceCodeUrl": "https://github.com/PrestaShop/PrestaShop",
    "license": "OSL-3.0 (core) / AFL-3.0 (native modules)"
  },
  {
    "id": "proton-drive",
    "name": "Proton Drive",
    "category": "cloud-storage",
    "country": "ch",
    "replacesUS": [
      "Google Drive",
      "Dropbox",
      "iCloud",
      "OneDrive"
    ],
    "pricing": "freemium",
    "website": "https://proton.me/drive",
    "description": "End-to-end encrypted cloud storage from Proton AG in Geneva, protected by Swiss law. Proton open-sources and audits its client applications, while backend services remain largely proprietary as in most SaaS zero-knowledge architectures.",
    "localizedDescriptions": {
      "de": "Ende-zu-Ende-verschlüsselter Cloud-Speicher von den Machern von Proton Mail, mit Sitz in Genf und geschützt durch Schweizer Datenschutzrecht. Alle Apps sind quelloffen und unabhängig geprüft — niemand, nicht einmal Proton selbst, kann auf deine Dateien zugreifen."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "openSourceAuditUrl": "https://github.com/orgs/ProtonDriveApps/repositories",
    "tags": [
      "cloud-storage",
      "freemium",
      "open-source",
      "privacy",
      "encryption",
      "cloud",
      "google-drive",
      "dropbox"
    ],
    "foundedYear": 2014,
    "headquartersCity": "Geneva",
    "sourceCodeUrl": "https://github.com/ProtonDriveApps",
    "license": "GPL-3.0 (clients); proprietary backend"
  },
  {
    "id": "proton-mail",
    "name": "Proton Mail",
    "category": "email",
    "country": "ch",
    "replacesUS": [
      "Gmail",
      "Outlook",
      "Yahoo Mail"
    ],
    "pricing": "freemium",
    "website": "https://proton.me/mail",
    "description": "Swiss encrypted email service by Proton AG with end-to-end and zero-access encryption, open-source clients, and a public legal transparency report. Swiss court orders can still compel targeted metadata logging for specific accounts, and parts of the service stack remain outside fully reproducible open builds.",
    "localizedDescriptions": {
      "de": "Verschlüsselter E-Mail-Dienst aus der Schweiz von Proton AG mit Ende-zu-Ende- und Zero-Access-Verschlüsselung, quelloffenen Clients und öffentlichem Transparenzbericht. Gültige Schweizer Gerichtsanordnungen können dennoch gezieltes Metadaten-Logging erzwingen, und Teile des Stacks sind weiterhin nicht voll reproduzierbar offen buildbar."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "openSourceAuditUrl": "https://proton.me/community/open-source",
    "tags": [
      "email",
      "freemium",
      "open-source",
      "privacy",
      "encryption",
      "gmail",
      "outlook"
    ],
    "foundedYear": 2014,
    "headquartersCity": "Geneva",
    "sourceCodeUrl": "https://github.com/ProtonMail",
    "license": "GPL-3.0 (clients); proprietary backend"
  },
  {
    "id": "proton-pass",
    "name": "Proton Pass",
    "category": "password-manager",
    "country": "ch",
    "replacesUS": [
      "LastPass",
      "1Password",
      "Dashlane"
    ],
    "pricing": "freemium",
    "website": "https://proton.me/pass",
    "description": "End-to-end encrypted password and identity manager from Swiss-based Proton AG with aliases and passkey support. Proton Pass clients are open source, while backend service components remain proprietary, matching Proton's broader SaaS architecture.",
    "localizedDescriptions": {
      "de": "Ende-zu-Ende-verschlüsselter Passwort- und Identitätsmanager von der Schweizer Proton AG mit integriertem E-Mail-Aliasing, Passkey-Unterstützung und einem großzügigen Gratisangebot. Nahtlose Integration in das Proton-Ökosystem (Mail, VPN, Drive) mit Speicherung unter Schweizer Datenschutzrecht und Zero-Access-Verschlüsselung."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "openSourceAuditUrl": "https://proton.me/community/open-source",
    "tags": [
      "password-manager",
      "freemium",
      "open-source",
      "privacy",
      "encryption",
      "vpn",
      "email",
      "lastpass"
    ],
    "foundedYear": 2023,
    "headquartersCity": "Geneva",
    "sourceCodeUrl": "https://github.com/protonpass",
    "license": "GPL-3.0 (clients); proprietary backend"
  },
  {
    "id": "proton-vpn",
    "name": "Proton VPN",
    "category": "vpn",
    "country": "ch",
    "replacesUS": [
      "ExpressVPN"
    ],
    "pricing": "freemium",
    "website": "https://protonvpn.com",
    "description": "Swiss VPN from Proton AG with a large free tier, Secure Core multi-hop routing, open-source apps, recurring third-party no-logs audits, and reported ISO 27001 plus SOC 2 Type II assurance. Trade-offs remain around recurring high-severity client CVEs and auto-renewal at then-current pricing, so patch hygiene and renewal checks are still required.",
    "localizedDescriptions": {
      "de": "Schweizer VPN von Proton AG mit grosser Gratis-Stufe, Secure-Core-Multi-Hop-Routing, Open-Source-Apps, wiederkehrenden No-Logs-Audits durch Dritte sowie gemeldeten ISO-27001- und SOC-2-Type-II-Nachweisen. Relevante Trade-offs bleiben wiederkehrende High-Severity-Client-CVEs und Auto-Renew zum dann gültigen Preis, daher sind Patch-Disziplin und aktive Vertragskontrolle wichtig."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "openSourceAuditUrl": "https://proton.me/community/open-source",
    "tags": [
      "vpn",
      "freemium",
      "open-source",
      "privacy",
      "expressvpn"
    ],
    "foundedYear": 2017,
    "headquartersCity": "Geneva",
    "license": "GPL-3.0 (clients); proprietary backend"
  },
  {
    "id": "pubky",
    "name": "Pubky",
    "category": "social-media",
    "country": "mx",
    "replacesUS": [
      "Facebook",
      "X/Twitter",
      "Instagram"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://pubky.app",
    "description": "Decentralized P2P social media protocol and application where users own their data through public-key cryptography. Built on PKARR (Public Key Addressable Resource Records) using BitTorrent's Mainline DHT for censorship-resistant storage, with self-sovereign homeservers and no central authority.",
    "localizedDescriptions": {
      "de": "Dezentrales P2P-Social-Media-Protokoll und -Anwendung, bei dem Nutzende ihre Daten durch Public-Key-Kryptografie besitzen. Erstellt auf PKARR (Public Key Addressable Resource Records) unter Nutzung von BitTorents Mainline DHT für zensurresistente Speicherung, mit selbstsouveränen Homesern und ohne zentrale Autorität."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "social-media",
      "free",
      "open-source",
      "p2p",
      "decentralized",
      "self-sovereign",
      "facebook",
      "twitter",
      "instagram"
    ],
    "foundedYear": 2020,
    "headquartersCity": "Mexico City",
    "sourceCodeUrl": "https://github.com/pubky",
    "license": "MIT"
  },
  {
    "id": "saleor",
    "name": "Saleor",
    "category": "ecommerce",
    "country": "pl",
    "replacesUS": [
      "Shopify"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://saleor.io",
    "logo": "/logos/saleor.svg?v=20260212",
    "description": "Polish-built, GraphQL-first headless commerce platform designed for composable, API-driven storefronts. With 21,000+ GitHub stars and a BSD-3-Clause license, Saleor is ideal for developers who need full flexibility and modern stack integration.",
    "localizedDescriptions": {
      "de": "In Polen entwickelte, GraphQL-first Headless-Commerce-Plattform für modulare, API-gesteuerte Storefronts. Mit über 21.000 GitHub-Stars und einer BSD-3-Clause-Lizenz ist Saleor ideal für Entwickler, die volle Flexibilität und moderne Stack-Integration benötigen."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "openSourceAuditUrl": "https://docs.saleor.io/overview/why-saleor/open-source",
    "tags": [
      "ecommerce",
      "freemium",
      "open-source",
      "shopify"
    ],
    "foundedYear": 2020,
    "headquartersCity": "Wroclaw",
    "sourceCodeUrl": "https://github.com/saleor/saleor",
    "license": "BSD-3-Clause"
  },
  {
    "id": "sailfish-os",
    "name": "Sailfish OS",
    "category": "mobile-os",
    "country": "fi",
    "replacesUS": [
      "Android",
      "iOS"
    ],
    "pricing": "paid",
    "website": "https://sailfishos.org",
    "description": "Linux-based European mobile operating system developed by Finnish company Jolla. Features a custom gesture-based UI and proprietary Android compatibility layer (AppSupport). Partially open-source with core components available on GitHub.",
    "localizedDescriptions": {
      "de": "Linux-basiertes europäisches mobiles Betriebssystem, entwickelt von der finnischen Firma Jolla. Verfügt über eine benutzerdefinierte gestenbasierte UI und eine proprietäre Android-Kompatibilitätsschicht (AppSupport). Teilweise Open-Source mit Kernkomponenten auf GitHub."
    },
    "isOpenSource": false,
    "openSourceLevel": "partial",
    "sourceCodeUrl": "https://github.com/sailfishos",
    "tags": [
      "mobile-os",
      "paid",
      "linux",
      "privacy",
      "european"
    ],
    "foundedYear": 2013,
    "headquartersCity": "Tampere"
  },
  {
    "id": "surfshark-vpn",
    "name": "Surfshark VPN",
    "category": "vpn",
    "country": "nl",
    "replacesUS": [
      "ExpressVPN"
    ],
    "pricing": "paid",
    "website": "https://surfshark.com",
    "description": "European VPN founded in Lithuania in 2018, headquartered in Amsterdam with operations in Lithuania, Poland, and Germany. Merged with Nord Security in 2022. RAM-only servers, WireGuard protocol, no-logs policy verified by Deloitte (2022, 2025). Proprietary client software with multiple security audits (Cure53 2018/2021, MASA 2023). Note: Parent company Nord Security received $100M investment from US PE firm Warburg Pincus in 2023.",
    "localizedDescriptions": {
      "de": "Europäischer VPN-Dienst, 2018 in Litauen gegründet, mit Sitz in Amsterdam und Niederlassungen in Litauen, Polen und Deutschland. Fusion mit Nord Security 2022. RAM-only-Server, WireGuard-Protokoll, No-Logs-Policy von Deloitte verifiziert (2022, 2025). Proprietäre Client-Software mit mehreren Sicherheitsaudits (Cure53 2018/2021, MASA 2023). Hinweis: Muttergesellschaft Nord Security erhielt 2023 $100M Investition vom US-PE-Unternehmen Warburg Pincus."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "openSourceAuditUrl": "https://cure53.de/pentest-report_surfshark.pdf",
    "tags": [
      "vpn",
      "paid",
      "privacy",
      "no-logs",
      "wireguard",
      "expressvpn"
    ],
    "foundedYear": 2018,
    "headquartersCity": "Amsterdam"
  },
  {
    "id": "scaleway",
    "name": "Scaleway",
    "category": "hosting",
    "country": "fr",
    "replacesUS": [
      "AWS",
      "Google Cloud",
      "Azure",
      "Cloudflare"
    ],
    "pricing": "freemium",
    "website": "https://www.scaleway.com",
    "description": "French cloud provider in the Iliad Group with EU-only data centers, broad IaaS/PaaS coverage, and strong compliance signals (including ISO 27001 and HDS). Scaleway also states it does not train AI models on customer data by default, but users should actively monitor pricing changes and support/incident handling quality.",
    "localizedDescriptions": {
      "de": "Französischer Cloud-Anbieter der Iliad-Gruppe mit EU-only-Rechenzentren, breitem IaaS/PaaS-Portfolio und starken Compliance-Signalen (u. a. ISO 27001 und HDS). Scaleway gibt zudem an, Kundendaten standardmässig nicht für KI-Modelltraining zu nutzen, dennoch sollten Preisveränderungen sowie Support- und Incident-Qualität aktiv beobachtet werden."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "hosting",
      "freemium",
      "cloud",
      "aws",
      "google-cloud",
      "gdpr"
    ],
    "foundedYear": 1999,
    "headquartersCity": "Paris"
  },
  {
    "id": "searxng",
    "name": "SearXNG",
    "category": "search-engine",
    "country": "eu",
    "replacesUS": [
      "Google Search",
      "Bing"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://searxng.org",
    "description": "Free and open-source metasearch engine forked from searx in 2021. Aggregates results from up to 244 search services without tracking or profiling users. Self-hostable via Docker or manual installation with ~70 public instances available. Developed by an international community with European roots (fork of searx, originally created by Hungarian developer Adam Tauber).",
    "localizedDescriptions": {
      "de": "Freie und quelloffene Meta-Suchmaschine, geforkt von searx im Jahr 2021. Aggregiert Ergebnisse von bis zu 244 Suchdiensten ohne Benutzerverfolgung oder Profiling. Self-Hosting via Docker oder manueller Installation mit etwa 70 öffentlichen Instanzen. Entwickelt von einer internationalen Community mit europäischen Wurzeln (Fork von searx, ursprünglich erstellt vom ungarischen Entwickler Adam Tauber)."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "openSourceAuditUrl": "https://github.com/searxng/searxng",
    "sourceCodeUrl": "https://github.com/searxng/searxng",
    "tags": [
      "search-engine",
      "free",
      "open-source",
      "privacy",
      "metasearch",
      "self-hosted",
      "no-tracking"
    ],
    "foundedYear": 2021,
    "headquartersCity": "Community project (fork of searx, originated in Hungary/EU)",
    "license": "AGPL-3.0"
  },
  {
    "id": "shopware",
    "name": "Shopware",
    "category": "ecommerce",
    "country": "de",
    "replacesUS": [
      "Shopify",
      "Amazon"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://www.shopware.com",
    "description": "German open-source e-commerce platform built on Symfony and Vue.js. Shopware 6 Community Edition is MIT-licensed, while commercial plans add SaaS and enterprise features; contributors sign a CLA that grants shopware AG explicit rights to contributed code.",
    "localizedDescriptions": {
      "de": "Deutsche Open-Source-E-Commerce-Plattform auf Basis von Symfony und Vue.js und Marktführer unter den Top-1000-Online-Shops in Deutschland. Die MIT-lizenzierte Community Edition ist kostenlos, während kommerzielle Pläne Headless-Fähigkeiten, B2B-Funktionen und SaaS-Hosting bieten."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "openSourceAuditUrl": "https://www.shopware.com/en/pricing/",
    "tags": [
      "ecommerce",
      "freemium",
      "open-source",
      "hosting",
      "shopify",
      "amazon"
    ],
    "foundedYear": 2000,
    "headquartersCity": "Schöppingen",
    "sourceCodeUrl": "https://github.com/shopware/shopware",
    "license": "MIT (Community Edition, with CLA); proprietary SwagCommercial plugin (enterprise features)"
  },
  {
    "id": "simple-analytics",
    "name": "Simple Analytics",
    "category": "analytics",
    "country": "nl",
    "replacesUS": [
      "Google Analytics",
      "Amplitude"
    ],
    "pricing": "paid",
    "website": "https://www.simpleanalytics.com",
    "description": "Privacy-first Google Analytics alternative from the Netherlands. Simple Analytics collects zero personal data, uses no cookies, and stores everything on Dutch servers — making it 100% GDPR-compliant out of the box with an AI-powered dashboard for instant insights.",
    "localizedDescriptions": {
      "de": "Datenschutz-orientierte Google-Analytics-Alternative aus den Niederlanden. Simple Analytics erhebt keinerlei personenbezogene Daten, verwendet keine Cookies und speichert alles auf niederländischen Servern — von Haus aus 100 % DSGVO-konform, mit KI-gestütztem Dashboard für sofortige Einblicke."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "analytics",
      "paid",
      "privacy",
      "gdpr",
      "google-analytics",
      "amplitude"
    ],
    "foundedYear": 2018,
    "headquartersCity": "Amsterdam"
  },
  {
    "id": "stability-ai",
    "name": "Stability AI",
    "category": "ai-ml",
    "country": "gb",
    "replacesUS": [
      "OpenAI DALL-E",
      "Google Imagen",
      "Nano Banana Pro",
      "Midjourney"
    ],
    "pricing": "freemium",
    "website": "https://stability.ai",
    "description": "London-based company behind Stable Diffusion, now operating under a source-available licensing model for newer releases. Since July 2024, Stability AI's Community License is free only for entities below USD 1M annual revenue, with enterprise licensing required above that threshold.",
    "localizedDescriptions": {
      "de": "In London ansässiges Unternehmen hinter Stable Diffusion, einem der weltweit meistgenutzten Open-Source-Bildgenerierungsmodelle. Bietet Text-zu-Bild, Bild-zu-Video und Audiogenerierung mit offenen Modellgewichten und ermöglicht lokalen Betrieb ohne Abhängigkeit von US-Cloud-Anbietern."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "openSourceAuditUrl": "https://stability.ai/license",
    "tags": [
      "ai-ml",
      "freemium",
      "open-source",
      "cloud",
      "openai-dall-e",
      "google-imagen"
    ],
    "foundedYear": 2019,
    "headquartersCity": "London",
    "sourceCodeUrl": "https://github.com/Stability-AI",
    "license": "Community License (<= USD 1M revenue) / Enterprise License"
  },
  {
    "id": "stoat",
    "name": "Stoat",
    "category": "messaging",
    "country": "gb",
    "replacesUS": [
      "Discord"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://stoat.chat",
    "description": "Open-source chat platform (formerly Revolt) founded in 2021, developed by a team of friends who wanted to create a user-first chat app. Fully open-source under AGPL-3.0 with clients for web, desktop, Android, and iOS. Backend written in Rust, frontend in TypeScript/Solid.js. 600k+ users, 150k+ lines of code. Headquartered in London, UK.",
    "localizedDescriptions": {
      "de": "Open-Source-Chat-Plattform (früher Revolt), gegründet 2021 von einem Team, das einen nutzerzentrierten Chat-Dienst erschaffen wollte. Vollständig quelloffen unter AGPL-3.0 mit Clients für Web, Desktop, Android und iOS. Backend in Rust, Frontend in TypeScript/Solid.js. 600k+ Nutzer, 150k+ Codezeilen. Hauptsitz in London, UK."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/stoatchat",
    "tags": [
      "messaging",
      "free",
      "open-source",
      "discord-alternative",
      "self-hostable",
      "agpl-3.0"
    ],
    "foundedYear": 2021,
    "headquartersCity": "London",
    "license": "AGPL-3.0"
  },
  {
    "id": "stackit",
    "name": "STACKIT",
    "category": "cloud-storage",
    "country": "de",
    "replacesUS": [
      "Amazon Web Services",
      "Microsoft Azure",
      "Google Cloud Platform"
    ],
    "pricing": "paid",
    "website": "https://stackit.com",
    "description": "German cloud provider from Schwarz Gruppe (Lidl, Kaufland) offering sovereign cloud services from European data centers. Provides compute, Kubernetes, storage, databases, AI/ML services, and colocation with focus on digital sovereignty and GDPR compliance.",
    "localizedDescriptions": {
      "de": "Deutscher Cloud-Anbieter der Schwarz Gruppe (Lidl, Kaufland) mit souveränen Cloud-Diensten aus europäischen Rechenzentren. Bietet Compute, Kubernetes, Storage, Datenbanken, KI/ML-Dienste und Colocation mit Fokus auf digitale Souveränität und DSGVO-Konformität."
    },
    "isOpenSource": false,
    "openSourceLevel": "partial",
    "sourceCodeUrl": "https://github.com/stackitcloud",
    "tags": [
      "cloud",
      "hosting",
      "kubernetes",
      "storage",
      "database",
      "ai-ml",
      "sovereign-cloud",
      "gdpr"
    ],
    "foundedYear": 2021,
    "headquartersCity": "Neckarsulm"
  },
  {
    "id": "startmail",
    "name": "StartMail",
    "category": "email",
    "country": "nl",
    "replacesUS": [
      "Gmail",
      "Outlook",
      "Yahoo Mail"
    ],
    "pricing": "paid",
    "website": "https://www.startmail.com",
    "description": "Dutch privacy-focused email service with unlimited aliases, built-in PGP support, and full IMAP access for exportability. Core mailbox data is hosted in the Netherlands, while payment and anti-abuse flows use selected third-party processors.",
    "localizedDescriptions": {
      "de": "Niederländischer, auf Privatsphäre ausgerichteter E-Mail-Dienst mit unbegrenzten Aliasen, integrierter PGP-Unterstützung und vollem IMAP-Zugriff für den Datenexport. Kerndaten des Postfachs liegen in den Niederlanden, während Zahlungs- und Abuse-Schutz-Prozesse über ausgewählte Drittanbieter laufen."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "email",
      "paid",
      "privacy",
      "encryption",
      "gmail",
      "outlook"
    ],
    "foundedYear": 2014,
    "headquartersCity": "The Hague"
  },
  {
    "id": "strato-mail",
    "name": "STRATO Mail",
    "category": "email",
    "country": "de",
    "replacesUS": [
      "Gmail",
      "Outlook",
      "Yahoo Mail"
    ],
    "pricing": "freemium",
    "website": "https://www.strato.de/mail/",
    "description": "German email service from STRATO GmbH, hosted in TÜV-certified data centers in Germany with DSGVO compliance. Offers IMAP/POP3 access, ActiveSync for mobile sync, calendar and tasks (Business tier), and optional email archiving. Founded in 1997, part of IONOS Group SE.",
    "localizedDescriptions": {
      "de": "Deutscher E-Mail-Dienst von STRATO GmbH, gehostet in TÜV-zertifizierten Rechenzentren in Deutschland mit DSGVO-Konformität. Bietet IMAP/POP3-Zugriff, ActiveSync für mobile Synchronisation, Kalender und Aufgaben (Business-Tarif) und optionale E-Mail-Archivierung. Gegründet 1997, Teil der IONOS Group SE."
    },
    "isOpenSource": false,
    "openSourceLevel": "none",
    "tags": [
      "email",
      "freemium",
      "gdpr",
      "german-hosted",
      "gmail",
      "outlook"
    ],
    "foundedYear": 1997,
    "headquartersCity": "Berlin"
  },
  {
    "id": "taiga",
    "name": "Taiga",
    "category": "project-management",
    "country": "es",
    "replacesUS": [
      "Jira",
      "Asana",
      "Trello"
    ],
    "pricing": "freemium",
    "selfHostable": true,
    "website": "https://taiga.io",
    "description": "Open-source agile project management platform from Madrid for Scrum and Kanban teams. Taiga uses a split licensing approach: backend under MPL 2.0 and frontend under AGPLv3.",
    "localizedDescriptions": {
      "de": "Freie, quelloffene agile Projektmanagement-Plattform aus Madrid, speziell für crossfunktionale Teams entwickelt. Taiga bietet Scrum-Backlogs, Kanban-Boards, Sprint-Planung, Issue-Tracking und ein Wiki — alles in einer übersichtlichen Oberfläche, die agile Arbeitsweisen für alle zugänglich macht."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "project-management",
      "freemium",
      "open-source",
      "jira",
      "asana"
    ],
    "foundedYear": 2014,
    "headquartersCity": "Madrid",
    "sourceCodeUrl": "https://github.com/kaleidos-ventures/taiga",
    "license": "MPL-2.0 / AGPL-3.0"
  },
  {
    "id": "talos-linux",
    "name": "Talos Linux",
    "category": "hosting",
    "country": "us",
    "replacesUS": [
      "Azure Kubernetes Service",
      "Amazon EKS",
      "Google Kubernetes Engine"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://www.talos.dev/",
    "description": "Secure, immutable, and minimal Linux distribution designed specifically for Kubernetes. All system management is done via API - no SSH or interactive console. Production-ready and supported by Sidero Labs. A Certified Kubernetes distribution.",
    "localizedDescriptions": {
      "de": "Sichere, unveränderliche und minimalistische Linux-Distribution, speziell für Kubernetes entwickelt. Die gesamte Systemverwaltung erfolgt über API - kein SSH oder interaktive Konsole. Produktionsreif und unterstützt von Sidero Labs. Eine Certified Kubernetes Distribution."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "sourceCodeUrl": "https://github.com/siderolabs/talos",
    "tags": [
      "kubernetes",
      "linux-distribution",
      "operating-system",
      "cloud-native",
      "infrastructure",
      "self-hostable",
      "certified-kubernetes"
    ],
    "foundedYear": 2019,
    "headquartersCity": "Goleta",
    "license": "MPL-2.0"
  },
  {
    "id": "threema",
    "name": "Threema",
    "category": "messaging",
    "country": "ch",
    "replacesUS": [
      "WhatsApp",
      "iMessage"
    ],
    "pricing": "paid",
    "website": "https://threema.ch",
    "description": "Swiss end-to-end encrypted messenger with one-time paid licensing and no phone-number requirement. Threema clients are AGPLv3 and auditable, but service access is commercial: official builds validate store/shop licenses, and self-compiled builds need allowlisting for full network participation.",
    "localizedDescriptions": {
      "de": "In der Schweiz entwickelter Ende-zu-Ende-verschlüsselter Messenger, der weder Telefonnummer noch E-Mail zur Registrierung benötigt und so maximale Anonymität bietet. Alle Server stehen in der Schweiz, die Apps sind vollständig Open Source, und ein einmaliger Kauf bedeutet keine Abonnements und keine Werbung."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "openSourceAuditUrl": "https://threema.ch/en/open-source",
    "tags": [
      "messaging",
      "paid",
      "open-source",
      "encryption",
      "email",
      "whatsapp",
      "imessage"
    ],
    "foundedYear": 2012,
    "headquartersCity": "Pfäffikon",
    "sourceCodeUrl": "https://github.com/threema-ch",
    "license": "AGPL-3.0 (clients); proprietary server"
  },
  {
    "id": "timescribe",
    "name": "TimeScribe",
    "category": "project-management",
    "country": "de",
    "replacesUS": [
      "Clockify"
    ],
    "pricing": "free",
    "website": "https://timescribe.app",
    "description": "Modern and private time tracking application for macOS and Windows. Completely free with no paywall or freemium model, no registration required, and 100% offline operation - all data stays locally on the user's device. Developed by a German individual developer in Munich.",
    "localizedDescriptions": {
      "de": "Moderne und private Zeiterfassungsanwendung für macOS und Windows. Komplett kostenlos ohne Paywall oder Freemium-Modell, keine Registrierung erforderlich und 100% Offline-Betrieb - alle Daten bleiben lokal auf dem Gerät des Benutzers. Entwickelt von einem deutschen Einzelentwickler in München."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "openSourceAuditUrl": "https://github.com/WINBIGFOX/timescribe",
    "tags": [
      "time-tracking",
      "project-management",
      "free",
      "open-source",
      "privacy",
      "offline",
      "local-first",
      "macos",
      "windows",
      "clockify"
    ],
    "foundedYear": 2023,
    "headquartersCity": "Munich",
    "sourceCodeUrl": "https://github.com/WINBIGFOX/timescribe",
    "license": "GPL-3.0"
  },
  {
    "id": "tor-browser",
    "name": "Tor Browser",
    "category": "browser",
    "country": "us",
    "replacesUS": [
      "Google Chrome",
      "Microsoft Edge"
    ],
    "pricing": "free",
    "website": "https://www.torproject.org",
    "description": "Free and open-source browser focused on anonymity, developed by the US-based Tor Project. Uses the Tor network to route traffic through volunteer-run relays, protecting user identity and circumventing censorship. Ships with built-in privacy protections including tracker blocking, fingerprinting resistance, and multi-layer encryption.",
    "localizedDescriptions": {
      "de": "Kostenloser, quelloffener Browser mit Fokus auf Anonymität, entwickelt vom US-amerikanischen Tor Project. Nutzt das Tor-Netzwerk, um den Datenverkehr über von Freiwilligen betriebene Relays zu leiten, die Identität der Nutzer zu schützen und Zensur zu umgehen. Wird mit integrierten Datenschutzfunktionen ausgeliefert, darunter Tracker-Blockierung, Fingerprinting-Resistenz und Mehrfachverschlüsselung."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "browser",
      "free",
      "open-source",
      "privacy",
      "anonymity",
      "censorship-circumvention",
      "tor",
      "encryption"
    ],
    "foundedYear": 2006,
    "sourceCodeUrl": "https://gitlab.torproject.org/tpo/applications/tor-browser",
    "license": "BSD-3-Clause (based on Mozilla Firefox)"
  },
  {
    "id": "vikunja",
    "name": "Vikunja",
    "category": "project-management",
    "country": "de",
    "replacesUS": [
      "Todoist",
      "Microsoft To-Do",
      "Trello",
      "Asana",
      "Monday.com",
      "ClickUp"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://vikunja.io",
    "description": "Open-source, self-hostable task management app from Germany — a privacy-respecting alternative to Todoist, Trello, and ClickUp. Vikunja supports lists, Kanban boards, Gantt charts, CalDAV sync, reminders, and team collaboration, all under the AGPL license.",
    "localizedDescriptions": {
      "de": "Quelloffene, selbst hostbare Aufgabenverwaltung aus Deutschland — eine datenschutzfreundliche Alternative zu Todoist, Trello und ClickUp. Vikunja bietet Listen, Kanban-Boards, Gantt-Diagramme, CalDAV-Sync, Erinnerungen und Team-Zusammenarbeit, alles unter der AGPL-Lizenz."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "project-management",
      "free",
      "open-source",
      "privacy",
      "trello",
      "asana"
    ],
    "foundedYear": 2018,
    "sourceCodeUrl": "https://github.com/go-vikunja/vikunja",
    "license": "AGPL-3.0"
  },
    {
    "id": "stalwart-mail-server",
    "name": "Stalwart Mail Server",
    "category": "email",
    "country": "gb",
    "replacesUS": [
      "Gmail",
      "Outlook",
      "Yahoo Mail"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://stalw.art",
    "description": "All-in-one open-source mail and collaboration server written in Rust. Supports IMAP, JMAP, SMTP, CalDAV, CardDAV and WebDAV protocols. Features built-in DMARC, DKIM, SPF, and ARC support, spam filtering, encryption at rest, and clustering support. Community edition is AGPL-3.0 licensed, with optional enterprise license for additional features.",
    "localizedDescriptions": {
      "de": "All-in-One Open-Source-Mail- und Kollaborationsserver in Rust. Unterstützt IMAP, JMAP, SMTP, CalDAV, CardDAV und WebDAV-Protokolle. Integrierte DMARC-, DKIM-, SPF- und ARC-Unterstützung, Spam-Filterung, Verschlüsselung im Ruhezustand und Cluster-Unterstützung. Community-Edition unter AGPL-3.0 lizenziert, mit optionaler Enterprise-Lizenz für zusätzliche Funktionen."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "tags": [
      "email",
      "mail-server",
      "open-source",
      "self-hosted",
      "encryption",
      "spam-filter",
      "rust",
      "imap",
      "smtp",
      "caldav",
      "carddav",
      "jmap"
    ],
    "foundedYear": 2020,
    "headquartersCity": "London",
    "sourceCodeUrl": "https://github.com/stalwartlabs/stalwart",
    "license": "AGPL-3.0 / Enterprise License"
  },{
    "id": "super-productivity",
    "name": "Super Productivity",
    "category": "project-management",
    "country": "de",
    "replacesUS": [
      "Todoist",
      "Microsoft ToDo"
    ],
    "pricing": "free",
    "selfHostable": true,
    "website": "https://super-productivity.com",
    "description": "Open-source todo list and time tracking app with Pomodoro timer, task scheduling, and GitHub/Jira integration. Developed by a German individual developer, local-first with no data collection. Supports cross-platform sync via WebDAV and Dropbox.",
    "localizedDescriptions": {
      "de": "Open-Source Todo-Liste und Zeiterfassungs-App mit Pomodoro-Timer, Aufgabenplanung und GitHub/Jira-Integration. Entwickelt von einem deutschen Einzelentwickler, lokal zuerst ohne Datensammlung. Plattformübergreifende Synchronisierung via WebDAV und Dropbox."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "openSourceAuditUrl": "https://github.com/super-productivity/super-productivity",
    "tags": [
      "project-management",
      "todo",
      "time-tracking",
      "pomodoro",
      "open-source",
      "free",
      "privacy",
      "self-hosted",
      "linux",
      "windows",
      "macos",
      "android",
      "ios"
    ],
    "foundedYear": 2017,
    "headquartersCity": "Berlin",
    "sourceCodeUrl": "https://github.com/super-productivity/super-productivity",
    "license": "MIT"
  },{
    "id": "vivaldi",
    "name": "Vivaldi",
    "category": "browser",
    "country": "no",
    "replacesUS": [
      "Google Chrome",
      "Safari",
      "Edge"
    ],
    "pricing": "free",
    "website": "https://vivaldi.com",
    "description": "Feature-rich Norwegian browser with built-in email client, calendar, feed reader and translation. Founded by former Opera CEO Jon von Tetzchner, Vivaldi offers unmatched customisation — tab stacking, split-screen, command chains — while blocking ads and trackers by default.",
    "localizedDescriptions": {
      "de": "Funktionsreicher norwegischer Browser mit integriertem E-Mail-Client, Kalender, Feed-Reader und Übersetzung. Gegründet vom ehemaligen Opera-CEO Jon von Tetzchner, bietet Vivaldi unerreichte Anpassungsmöglichkeiten — Tab-Stacking, Split-Screen, Befehlsketten — und blockiert Werbung und Tracker standardmäßig."
    },
    "isOpenSource": true,
    "openSourceLevel": "partial",
    "openSourceAuditUrl": "https://vivaldi.com/source/",
    "tags": [
      "browser",
      "free",
      "email",
      "google-chrome",
      "safari"
    ],
    "foundedYear": 2013,
    "headquartersCity": "Oslo",
    "sourceCodeUrl": "https://vivaldi.com/source/",
    "license": "proprietary UI, Chromium engine"
  },
  {
    "id": "waveterm",
    "name": "Wave Terminal",
    "category": "other",
    "country": "us",
    "replacesUS": [
      "Windows Terminal",
      "Hyper"
    ],
    "pricing": "free",
    "website": "https://www.waveterm.dev",
    "description": "Open-source, AI-native terminal for macOS, Linux, and Windows. Built by Command Line Inc in San Francisco. Features include durable SSH sessions, file previews, inline web browser, and AI integration with support for OpenAI, Claude, Gemini, and local models via Ollama.",
    "localizedDescriptions": {
      "de": "Open-Source, KI-nativer Terminal-Emulator für macOS, Linux und Windows. Entwickelt von Command Line Inc in San Francisco. Funktionen umfassen persistente SSH-Sessions, Datei-Vorschauen, integrierten Webbrowser und KI-Integration mit Unterstützung für OpenAI, Claude, Gemini und lokale Modelle via Ollama."
    },
    "isOpenSource": true,
    "openSourceLevel": "full",
    "openSourceAuditUrl": "https://github.com/wavetermdev/waveterm",
    "sourceCodeUrl": "https://github.com/wavetermdev/waveterm",
    "tags": [
      "terminal",
      "developer-tools",
      "open-source",
      "ai",
      "ssh",
      "windows-terminal",
      "hyper"
    ],
    "foundedYear": 2022,
    "headquartersCity": "San Francisco",
    "license": "Apache-2.0"
  }
];
