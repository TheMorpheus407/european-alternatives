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
    "openSourceAuditUrl": "https://github.com/orgs/AirVPN/repositories",
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
    "id": "friendica",
    "name": "Friendica",
    "category": "social-media",
    "country": "eu",
    "replacesUS": [
      "Facebook",
      "LinkedIn"
    ],
    "pricing": "free",
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
    "id": "libreoffice",
    "name": "LibreOffice",
    "category": "office-suite",
    "country": "de",
    "replacesUS": [
      "Microsoft Office",
      "Google Workspace"
    ],
    "pricing": "free",
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
    "id": "pixelfed",
    "name": "Pixelfed",
    "category": "social-media",
    "country": "eu",
    "replacesUS": [
      "Instagram",
      "Facebook"
    ],
    "pricing": "free",
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
    "sourceCodeUrl": "https://github.com/ProtonVPN",
    "license": "GPL-3.0 (clients); proprietary backend"
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
    "id": "shopware",
    "name": "Shopware",
    "category": "ecommerce",
    "country": "de",
    "replacesUS": [
      "Shopify",
      "Amazon"
    ],
    "pricing": "freemium",
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
    "id": "vikunja",
    "name": "Vikunja",
    "category": "project-management",
    "country": "de",
    "replacesUS": [
      "Trello",
      "Asana",
      "Monday.com"
    ],
    "pricing": "free",
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
  }
];
