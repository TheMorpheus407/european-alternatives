import type { PositiveSignal } from '../types';

/**
 * Vetted positive signals per alternative, keyed by alternative ID.
 *
 * Each signal maps to the standard signal catalog defined in the scoring
 * playbook and must reference a source URL from the vetted worksheet or
 * deep-research document.
 */
export const positiveSignalsById: Record<string, PositiveSignal[]> = {

  'adyen': [
    { id: 'iso-27001-certified', text: 'ISO 27001 certified', textDe: 'ISO-27001-zertifiziert', dimension: 'security', amount: 2, sourceUrl: 'https://help.adyen.com/en_US/knowledge/security/security-principles/what-are-the-adyen-security-certifications' },
    { id: 'soc2-type2-attested', text: 'SOC 2 Type II attested', textDe: 'SOC-2-Typ-II-Attestierung', dimension: 'security', amount: 2, sourceUrl: 'https://help.adyen.com/en_US/knowledge/security/security-principles/what-are-the-adyen-security-certifications' },
    { id: 'responsible-disclosure-process', text: 'Published security disclosure process', textDe: 'Veröffentlichter Prozess zur Sicherheitsmeldung', dimension: 'security', amount: 1, sourceUrl: 'https://help.adyen.com/en_US/knowledge/security/product-security/how-do-i-disclose-a-security-issue' },
    { id: 'transparent-ownership', text: 'Publicly listed company with clear ownership', textDe: 'Börsennotiertes Unternehmen mit klarer Eigentümerstruktur', dimension: 'governance', amount: 1, sourceUrl: 'https://www.adyen.com' },
    { id: 'gdpr-dpa-documented', text: 'GDPR/DPA compliance documented', textDe: 'DSGVO-/AVV-Konformität dokumentiert', dimension: 'governance', amount: 1, sourceUrl: 'https://www.adyen.com/en_GB/legal/adyen-terms-and-conditions' },
    { id: 'public-status-page', text: 'Public service status page', textDe: 'Öffentliche Service-Statusseite', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.adyen.com/knowledge-hub/mitigating-a-ddos-april-2025' },
    { id: 'documented-incident-response', text: 'Transparent incident communication including DDoS postmortem', textDe: 'Transparente Vorfallkommunikation einschliesslich DDoS-Postmortem', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.adyen.com/knowledge-hub/mitigating-a-ddos-april-2025' },
    { id: 'multi-region-infrastructure', text: 'Multi-region payment infrastructure', textDe: 'Zahlungsinfrastruktur in mehreren Regionen', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.adyen.com' },
    { id: 'data-export-available', text: 'Reporting and export paths for merchant operations', textDe: 'Reporting- und Exportoptionen für Händleroperationen', dimension: 'contract', amount: 1, sourceUrl: 'https://docs.adyen.com/online-payments/analytics-and-data-tracking/' },
    { id: 'eu-data-residency', text: 'EU data processing for payment infrastructure', textDe: 'EU-Datenverarbeitung für Zahlungsinfrastruktur', dimension: 'contract', amount: 1, sourceUrl: 'https://www.adyen.com' },
  ],
  'bitwarden': [
    { id: 'soc2-type2-attested', text: 'SOC 2 Type II attested (SOC 3 report publicly available)', textDe: 'SOC-2-Typ-II-Attestierung (SOC-3-Bericht öffentlich verfügbar)', dimension: 'security', amount: 2, sourceUrl: 'https://bitwarden.com/compliance/' },
    { id: 'recurring-security-audits', text: 'Regular third-party security assessments by independent auditors', textDe: 'Regelmässige Sicherheitsprüfungen durch unabhängige Dritte', dimension: 'security', amount: 3, sourceUrl: 'https://bitwarden.com/help/is-bitwarden-audited/' },
    { id: 'public-bug-bounty', text: 'Public bug bounty via HackerOne', textDe: 'Öffentliches Bug-Bounty-Programm über HackerOne', dimension: 'security', amount: 1, sourceUrl: 'https://hackerone.com/bitwarden' },
    { id: 'responsible-disclosure-process', text: 'Published security disclosure process in GitHub repositories', textDe: 'Veröffentlichter Sicherheitsmeldeprozess in GitHub-Repositories', dimension: 'security', amount: 1, sourceUrl: 'https://github.com/bitwarden/server/blob/main/SECURITY.md' },
    { id: 'zero-knowledge-architecture', text: 'Zero-knowledge vault encryption under user-controlled keys', textDe: 'Zero-Knowledge-Tresorverschlüsselung mit nutzerkontrollierten Schlüsseln', dimension: 'security', amount: 2, sourceUrl: 'https://bitwarden.com/help/what-encryption-is-used/' },
    { id: 'transparent-ownership', text: 'Clear corporate entity with documented ownership', textDe: 'Klare Unternehmensstruktur mit dokumentierter Eigentümerschaft', dimension: 'governance', amount: 1, sourceUrl: 'https://bitwarden.com/about/' },
    { id: 'active-release-cadence', text: 'Regular release schedule with documented security fixes', textDe: 'Regelmässiger Release-Zyklus mit dokumentierten Sicherheitskorrekturen', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/bitwarden/clients/releases' },
    { id: 'self-hostable', text: 'Self-hostable via Docker deployment', textDe: 'Selbst hostbar via Docker-Deployment', dimension: 'contract', amount: 2, sourceUrl: 'https://bitwarden.com/help/install-on-premise-linux/' },
    { id: 'data-export-available', text: 'Vault export in CSV, JSON, and encrypted JSON formats', textDe: 'Tresor-Export in CSV-, JSON- und verschlüsselten JSON-Formaten', dimension: 'contract', amount: 1, sourceUrl: 'https://bitwarden.com/help/export-your-data/' },
    { id: 'eu-data-residency', text: 'EU cloud region available for data storage', textDe: 'EU-Cloud-Region für Datenspeicherung verfügbar', dimension: 'contract', amount: 1, sourceUrl: 'https://bitwarden.com/help/data-storage/' },
  ],
  'black-forest-labs': [
    { id: 'responsible-disclosure-process', text: 'Trust center surface with security contact channel', textDe: 'Trust-Center mit Sicherheitskontaktkanal', dimension: 'security', amount: 1, sourceUrl: 'https://app.vanta.com/blackforestlabs.ai/trust/0cb6ffww8qmy60nxzo3p5' },
    { id: 'transparent-ownership', text: 'Identifiable organization with public legal and product pages', textDe: 'Identifizierbare Organisation mit öffentlichen Rechts- und Produktseiten', dimension: 'governance', amount: 1, sourceUrl: 'https://bfl.ai/legal/terms-of-service' },
    { id: 'partial-open-source', text: 'Open-weight model family with public GitHub repository', textDe: 'Open-Weight-Modellfamilie mit öffentlichem GitHub-Repository', dimension: 'governance', amount: 1, sourceUrl: 'https://github.com/black-forest-labs/flux' },
    { id: 'public-status-page', text: 'Public status page with incident timelines', textDe: 'Öffentliche Statusseite mit Vorfall-Zeitachsen', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.bfl.ml/history' },
    { id: 'active-release-cadence', text: 'Active release cadence with documented release notes', textDe: 'Aktiver Release-Zyklus mit dokumentierten Release-Notes', dimension: 'reliability', amount: 1, sourceUrl: 'https://docs.bfl.ai/release-notes' },
    { id: 'self-hostable', text: 'Self-hostable via open-weight model downloads', textDe: 'Selbst hostbar über Open-Weight-Modell-Downloads', dimension: 'contract', amount: 2, sourceUrl: 'https://github.com/black-forest-labs/flux' },
  ],
  'cryptpad': [
    { id: 'e2e-encryption-default', text: 'Browser-side end-to-end encryption by default', textDe: 'Browserseitige Ende-zu-Ende-Verschlüsselung standardmässig', dimension: 'security', amount: 2, sourceUrl: 'https://docs.cryptpad.org/en/user_guide/security.html#trust-assumptions' },
    { id: 'zero-knowledge-architecture', text: 'Zero-knowledge architecture with documented trust assumptions', textDe: 'Zero-Knowledge-Architektur mit dokumentierten Vertrauensannahmen', dimension: 'security', amount: 2, sourceUrl: 'https://docs.cryptpad.org/en/user_guide/security.html#trust-assumptions' },
    { id: 'responsible-disclosure-process', text: 'Public responsible-disclosure process with published advisories', textDe: 'Öffentlicher Responsible-Disclosure-Prozess mit veröffentlichten Advisories', dimension: 'security', amount: 1, sourceUrl: 'https://github.com/cryptpad/cryptpad/security/advisories' },
    { id: 'transparent-ownership', text: 'Ownership and funding publicly documented with transparent project updates', textDe: 'Eigentümerschaft und Finanzierung öffentlich dokumentiert mit transparenten Projekt-Updates', dimension: 'governance', amount: 1, sourceUrl: 'https://cryptpad.org' },
    { id: 'active-release-cadence', text: 'Active release cadence with transparent outage postmortems', textDe: 'Aktiver Release-Zyklus mit transparenten Ausfall-Postmortems', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/cryptpad/cryptpad/releases' },
    { id: 'self-hostable', text: 'Self-hostable with documented deployment', textDe: 'Selbst hostbar mit dokumentiertem Deployment', dimension: 'contract', amount: 2, sourceUrl: 'https://docs.cryptpad.org/en/admin_guide/installation.html' },
    { id: 'data-export-available', text: 'Practical data export options available', textDe: 'Praktische Datenexportoptionen verfügbar', dimension: 'contract', amount: 1, sourceUrl: 'https://docs.cryptpad.org/en/user_guide/index.html' },
    { id: 'open-standards-no-lock-in', text: 'Open-source with self-hosting path reduces hard lock-in', textDe: 'Open Source mit Self-Hosting-Option reduziert harten Lock-in', dimension: 'contract', amount: 1, sourceUrl: 'https://github.com/cryptpad/cryptpad' },
  ],
  'deepl': [
    { id: 'iso-27001-certified', text: 'ISO 27001 certification signals referenced in trust center', textDe: 'ISO-27001-Zertifizierungssignale im Trust Center referenziert', dimension: 'security', amount: 2, sourceUrl: 'https://trust.deepl.com/' },
    { id: 'soc2-type2-attested', text: 'SOC 2 signals referenced in trust center', textDe: 'SOC-2-Signale im Trust Center referenziert', dimension: 'security', amount: 2, sourceUrl: 'https://trust.deepl.com/' },
    { id: 'responsible-disclosure-process', text: 'Published security.txt disclosure channel', textDe: 'Veröffentlichter security.txt-Meldekanal', dimension: 'security', amount: 1, sourceUrl: 'https://www.deepl.com/.well-known/security.txt' },
    { id: 'data-minimization-verified', text: 'Pro/API tiers provide no-training and no-persistent-storage guarantees', textDe: 'Pro-/API-Tarife bieten No-Training- und No-Persistent-Storage-Garantien', dimension: 'security', amount: 2, sourceUrl: 'https://www.deepl.com/en/pro-data-security/' },
    { id: 'transparent-ownership', text: 'Clear legal entity and EU jurisdiction with visible growth trajectory', textDe: 'Klare Rechtsform und EU-Gerichtsbarkeit mit sichtbarem Wachstumskurs', dimension: 'governance', amount: 1, sourceUrl: 'https://www.deepl.com' },
    { id: 'gdpr-dpa-documented', text: 'GDPR compliance documented in service and legal pages', textDe: 'DSGVO-Konformität in Service- und Rechtsseiten dokumentiert', dimension: 'governance', amount: 1, sourceUrl: 'https://www.deepl.com/en/pro-data-security/' },
    { id: 'active-release-cadence', text: 'Active SDK and documentation maintenance with public release notes', textDe: 'Aktive SDK- und Dokumentationspflege mit öffentlichen Release-Notes', dimension: 'reliability', amount: 1, sourceUrl: 'https://developers.deepl.com/docs/resources/roadmap-and-release-notes' },
    { id: 'data-export-available', text: 'Practical API portability for translation workflows', textDe: 'Praktische API-Portabilität für Übersetzungsworkflows', dimension: 'contract', amount: 1, sourceUrl: 'https://developers.deepl.com/docs/getting-started/client-libraries' },
    { id: 'eu-data-residency', text: 'EU-headquartered with EU data processing', textDe: 'EU-Hauptsitz mit EU-Datenverarbeitung', dimension: 'contract', amount: 1, sourceUrl: 'https://www.deepl.com/en/pro-data-security/' },
  ],
  'ecosia': [
    { id: 'responsible-disclosure-process', text: 'Published vulnerability disclosure policy and security.txt', textDe: 'Veröffentlichte Schwachstellen-Meldepolitik und security.txt', dimension: 'security', amount: 1, sourceUrl: 'https://www.ecosia.org/.well-known/security.txt' },
    { id: 'transparent-ownership', text: 'Steward-ownership structure via Purpose Foundation', textDe: 'Verantwortungseigentum über die Purpose Foundation', dimension: 'governance', amount: 1, sourceUrl: 'https://purpose-economy.org/en/companies/ecosia/' },
    { id: 'public-transparency-report', text: 'Monthly financial reports published for transparency', textDe: 'Monatliche Finanzberichte zur Transparenz veröffentlicht', dimension: 'governance', amount: 1, sourceUrl: 'https://blog.ecosia.org/ecosia-financial-reports-tree-planting-receipts/' },
    { id: 'gdpr-dpa-documented', text: 'German-law jurisdiction with documented privacy practices', textDe: 'Deutsche Rechtsordnung mit dokumentierten Datenschutzpraktiken', dimension: 'governance', amount: 1, sourceUrl: 'https://www.ecosia.org/privacy' },
    { id: 'foundation-or-nonprofit', text: 'B Corp certified with steward-ownership governance', textDe: 'B-Corp-zertifiziert mit Verantwortungseigentums-Governance', dimension: 'governance', amount: 1, sourceUrl: 'https://www.bcorporation.net/en-us/find-a-b-corp/company/ecosia-gmbh/' },
    { id: 'active-release-cadence', text: 'Active app maintenance with recent updates', textDe: 'Aktive App-Pflege mit aktuellen Updates', dimension: 'reliability', amount: 1, sourceUrl: 'https://play.google.com/store/apps/details?id=com.ecosia.android' },
    { id: 'data-export-available', text: 'Browser bookmark and password export in standard formats', textDe: 'Browser-Lesezeichen- und Passwort-Export in Standardformaten', dimension: 'contract', amount: 1, sourceUrl: 'https://support.ecosia.org' },
    { id: 'fair-cancellation-terms', text: 'Free service with no subscription lock-in', textDe: 'Kostenloser Dienst ohne Abo-Bindung', dimension: 'contract', amount: 1, sourceUrl: 'https://www.ecosia.org/privacy' },
  ],
  'element': [
    { id: 'e2e-encryption-default', text: 'End-to-end encryption enabled by default in private rooms via Megolm/Olm', textDe: 'Ende-zu-Ende-Verschlüsselung standardmässig in privaten Räumen via Megolm/Olm', dimension: 'security', amount: 2, sourceUrl: 'https://element.io/enterprise/security' },
    { id: 'iso-27001-certified', text: 'ISO/IEC 27001:2022 certified', textDe: 'ISO/IEC 27001:2022-zertifiziert', dimension: 'security', amount: 2, sourceUrl: 'https://element.io/blog/element-achieves-iso-27001-certification/' },
    { id: 'responsible-disclosure-process', text: 'Published security disclosure policy with 90-day fix target', textDe: 'Veröffentlichte Sicherheitsmeldepolitik mit 90-Tage-Fix-Ziel', dimension: 'security', amount: 1, sourceUrl: 'https://element.io/security' },
    { id: 'transparent-ownership', text: 'Clear legal entity registered at UK Companies House', textDe: 'Klare Rechtsform im UK Companies House registriert', dimension: 'governance', amount: 1, sourceUrl: 'https://element.io/about' },
    { id: 'gdpr-dpa-documented', text: 'GDPR/DPA documented with EU/EEA/UK processing scope', textDe: 'DSGVO/AVV dokumentiert mit EU-/EWR-/UK-Verarbeitungsumfang', dimension: 'governance', amount: 1, sourceUrl: 'https://element.io/privacy' },
    { id: 'public-status-page', text: 'Public status page for Element services', textDe: 'Öffentliche Statusseite für Element-Dienste', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.element.io' },
    { id: 'active-release-cadence', text: 'Very active release cadence across clients and server', textDe: 'Sehr aktiver Release-Zyklus über Clients und Server hinweg', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/element-hq/element-web/releases' },
    { id: 'self-hostable', text: 'Self-hostable via Synapse/Dendrite homeserver deployment', textDe: 'Selbst hostbar via Synapse-/Dendrite-Homeserver-Deployment', dimension: 'contract', amount: 2, sourceUrl: 'https://github.com/element-hq/synapse' },
    { id: 'open-standards-no-lock-in', text: 'Built on open Matrix protocol with federation support', textDe: 'Basiert auf offenem Matrix-Protokoll mit Föderationsunterstützung', dimension: 'contract', amount: 1, sourceUrl: 'https://matrix.org' },
    { id: 'data-export-available', text: 'Data export and account portability via federation and DPA terms', textDe: 'Datenexport und Kontoportabilität via Föderation und AVV-Bedingungen', dimension: 'contract', amount: 1, sourceUrl: 'https://element.io/privacy' },
  ],
  'euria': [
    { id: 'iso-27001-certified', text: 'Infomaniak ISO/IEC 27001 certification', textDe: 'Infomaniak ISO/IEC-27001-Zertifizierung', dimension: 'security', amount: 2, sourceUrl: 'https://www.infomaniak.com/en/secure' },
    { id: 'public-bug-bounty', text: 'Public bug bounty program via YesWeHack', textDe: 'Öffentliches Bug-Bounty-Programm über YesWeHack', dimension: 'security', amount: 1, sourceUrl: 'https://yeswehack.com/programs/infomaniak' },
    { id: 'transparent-ownership', text: 'Independent Swiss company with B Corp certification', textDe: 'Unabhängiges Schweizer Unternehmen mit B-Corp-Zertifizierung', dimension: 'governance', amount: 1, sourceUrl: 'https://www.bcorporation.net/en-us/find-a-b-corp/company/infomaniak-group-sa/' },
    { id: 'gdpr-dpa-documented', text: 'Confidentiality policy with documented data access and deletion rights', textDe: 'Vertraulichkeitsrichtlinie mit dokumentierten Datenzugangs- und Löschrechten', dimension: 'governance', amount: 1, sourceUrl: 'https://www.infomaniak.com/en/legal/confidentiality-policy' },
    { id: 'public-status-page', text: 'Public status page with incident communication', textDe: 'Öffentliche Statusseite mit Vorfallkommunikation', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.infomaniakstatus.com/' },
    { id: 'active-release-cadence', text: 'Active release cadence with visible development activity', textDe: 'Aktiver Release-Zyklus mit sichtbarer Entwicklungsaktivität', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/Infomaniak/android-euria' },
    { id: 'fair-cancellation-terms', text: 'Published legal terms with personal-data access and deletion rights', textDe: 'Veröffentlichte AGB mit Rechten auf Datenzugang und -löschung', dimension: 'contract', amount: 1, sourceUrl: 'https://www.infomaniak.com/en/legal/confidentiality-policy' },
    { id: 'eu-data-residency', text: 'Swiss data residency with European infrastructure', textDe: 'Schweizer Datenresidenz mit europäischer Infrastruktur', dimension: 'contract', amount: 1, sourceUrl: 'https://www.infomaniak.com/en/secure' },
  ],
  'filen': [
    { id: 'e2e-encryption-default', text: 'End-to-end encryption by default for all stored files', textDe: 'Ende-zu-Ende-Verschlüsselung standardmässig für alle gespeicherten Dateien', dimension: 'security', amount: 2, sourceUrl: 'https://filen.io/about' },
    { id: 'zero-knowledge-architecture', text: 'Zero-knowledge architecture where server cannot access file contents', textDe: 'Zero-Knowledge-Architektur, bei der der Server keinen Zugriff auf Dateiinhalte hat', dimension: 'security', amount: 2, sourceUrl: 'https://filen.io/about' },
    { id: 'public-bug-bounty', text: 'Public bug bounty channel', textDe: 'Öffentlicher Bug-Bounty-Kanal', dimension: 'security', amount: 1, sourceUrl: 'https://filen.io/bug-bounty' },
    { id: 'transparent-ownership', text: 'Clear German legal entity with public imprint and warrant canary', textDe: 'Klare deutsche Rechtsform mit öffentlichem Impressum und Warrant Canary', dimension: 'governance', amount: 1, sourceUrl: 'https://filen.io/imprint' },
    { id: 'public-status-page', text: 'Public status page with incident history', textDe: 'Öffentliche Statusseite mit Vorfallhistorie', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.filen.io/incidents' },
    { id: 'data-export-available', text: 'Data export via rclone integration and direct download', textDe: 'Datenexport via rclone-Integration und Direktdownload', dimension: 'contract', amount: 1, sourceUrl: 'https://rclone.org/filen/' },
    { id: 'fair-cancellation-terms', text: 'Documented cancellation path and refund policy', textDe: 'Dokumentierter Kündigungsweg und Erstattungsrichtlinie', dimension: 'contract', amount: 1, sourceUrl: 'https://filen.io/refund-policy' },
    { id: 'eu-data-residency', text: 'German data center with EU data residency', textDe: 'Deutsches Rechenzentrum mit EU-Datenresidenz', dimension: 'contract', amount: 1, sourceUrl: 'https://filen.io/about' },
  ],
  'hetzner': [
    { id: 'iso-27001-certified', text: 'ISO/IEC 27001:2022 certified', textDe: 'ISO/IEC 27001:2022-zertifiziert', dimension: 'security', amount: 2, sourceUrl: 'https://docs.hetzner.com/general/others/certificates/' },
    { id: 'responsible-disclosure-process', text: 'Published security.txt disclosure channel', textDe: 'Veröffentlichter security.txt-Meldekanal', dimension: 'security', amount: 1, sourceUrl: 'https://www.hetzner.com/.well-known/security.txt' },
    { id: 'transparent-ownership', text: 'Clear legal operator identity with contractual and legal disclosure surface', textDe: 'Klare Betreiberidentität mit vertraglicher und rechtlicher Offenlegung', dimension: 'governance', amount: 1, sourceUrl: 'https://www.hetzner.com/legal/legal-notice/' },
    { id: 'gdpr-dpa-documented', text: 'GDPR processor framing with explicit DPA and data privacy FAQ', textDe: 'DSGVO-Auftragsverarbeiter-Rahmen mit explizitem AVV und Datenschutz-FAQ', dimension: 'governance', amount: 1, sourceUrl: 'https://docs.hetzner.com/general/general-terms-and-conditions/data-privacy-faq/' },
    { id: 'public-status-page', text: 'Public status page with transparent incident communication', textDe: 'Öffentliche Statusseite mit transparenter Vorfallkommunikation', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.hetzner.com' },
    { id: 'multi-region-infrastructure', text: 'Multi-region data center infrastructure across EU locations', textDe: 'Multi-Region-Rechenzentrumsinfrastruktur an EU-Standorten', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.hetzner.com/unternehmen/rechenzentrum/' },
    { id: 'eu-data-residency', text: 'EU data residency with German and Finnish data centers', textDe: 'EU-Datenresidenz mit deutschen und finnischen Rechenzentren', dimension: 'contract', amount: 1, sourceUrl: 'https://docs.hetzner.com/general/general-terms-and-conditions/data-privacy-faq/' },
  ],
  'home-assistant': [
    { id: 'independent-security-audit', text: 'Cure53 third-party security audit completed', textDe: 'Cure53-Sicherheitsaudit durch Dritte abgeschlossen', dimension: 'security', amount: 2, sourceUrl: 'https://www.home-assistant.io/blog/2023/10/19/security-audits-of-home-assistant/' },
    { id: 'recurring-security-audits', text: 'Multiple independent audits including GitHub Security Lab review', textDe: 'Mehrere unabhängige Audits inkl. GitHub Security Lab-Review', dimension: 'security', amount: 3, sourceUrl: 'https://securitylab.github.com/advisories/GHSL-2023-142_Home_Assistant_Companion_for_Android/' },
    { id: 'responsible-disclosure-process', text: 'Published security disclosure process with advisory timeline', textDe: 'Veröffentlichter Sicherheitsmeldeprozess mit Advisory-Zeitplan', dimension: 'security', amount: 1, sourceUrl: 'https://www.home-assistant.io/security/' },
    { id: 'transparent-ownership', text: 'Clear governance under Open Home Foundation', textDe: 'Klare Governance unter der Open Home Foundation', dimension: 'governance', amount: 1, sourceUrl: 'https://www.openhomefoundation.org/about/' },
    { id: 'foundation-or-nonprofit', text: 'Governed by the Open Home Foundation to prevent single-company capture', textDe: 'Unter Leitung der Open Home Foundation zur Verhinderung von Einzelunternehmensdominanz', dimension: 'governance', amount: 1, sourceUrl: 'https://www.openhomefoundation.org/about/' },
    { id: 'public-status-page', text: 'Public status pages for Home Assistant and Nabu Casa cloud', textDe: 'Öffentliche Statusseiten für Home Assistant und Nabu Casa Cloud', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.nabucasa.com/' },
    { id: 'active-release-cadence', text: 'Active monthly release cadence', textDe: 'Aktiver monatlicher Release-Zyklus', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.home-assistant.io/faq/release/' },
    { id: 'self-hostable', text: 'Local-first and fully self-hostable core', textDe: 'Local-First-Ansatz und vollständig selbst hostbarer Kern', dimension: 'contract', amount: 2, sourceUrl: 'https://www.home-assistant.io' },
    { id: 'open-standards-no-lock-in', text: 'Open-source core with low structural lock-in', textDe: 'Open-Source-Kern mit geringem strukturellem Lock-in', dimension: 'contract', amount: 1, sourceUrl: 'https://github.com/home-assistant/core' },
    { id: 'data-export-available', text: 'Documented backup and export paths for cloud and local data', textDe: 'Dokumentierte Backup- und Exportpfade für Cloud- und lokale Daten', dimension: 'contract', amount: 1, sourceUrl: 'https://support.nabucasa.com/hc/en-us/articles/17749521790045-How-can-I-download-my-Cloud-Backups' },
    { id: 'fair-cancellation-terms', text: 'Documented cancellation and account deletion process', textDe: 'Dokumentierter Kündigungs- und Kontolöschungsprozess', dimension: 'contract', amount: 1, sourceUrl: 'https://support.nabucasa.com/hc/en-us/articles/26056126365853-How-do-I-cancel-my-subscription' },
  ],

  'hostinger': [
    { id: 'iso-27001-certified', text: 'ISO/IEC 27001 certification verified via external certifier registry', textDe: 'ISO/IEC-27001-Zertifizierung über externes Zertifiziererregister verifiziert', dimension: 'security', amount: 2, sourceUrl: 'https://www.hostinger.com/legal/security-policy' },
    { id: 'responsible-disclosure-process', text: 'Published responsible disclosure program with monetary bounty framework', textDe: 'Veröffentlichtes Responsible-Disclosure-Programm mit monetärem Prämienrahmen', dimension: 'security', amount: 1, sourceUrl: 'https://www.hostinger.com/legal/responsible-disclosure-policy' },
    { id: 'public-bug-bounty', text: 'Public bug bounty program with $100-$25,000 payout range', textDe: 'Öffentliches Bug-Bounty-Programm mit 100-25.000 $ Auszahlungsspanne', dimension: 'security', amount: 1, sourceUrl: 'https://www.hostinger.com/legal/responsible-disclosure-policy' },
    { id: 'transparent-ownership', text: 'Clear contracting entity and legal structure publicly documented', textDe: 'Klar dokumentierte Vertragsgesellschaft und Rechtsstruktur', dimension: 'governance', amount: 1, sourceUrl: 'https://www.hostinger.com/legal/universal-terms-of-service-agreement' },
    { id: 'public-transparency-report', text: 'DSA transparency report and third-party code of conduct published', textDe: 'DSA-Transparenzbericht und Verhaltenskodex für Dritte veröffentlicht', dimension: 'governance', amount: 1, sourceUrl: 'https://www.hostinger.com/legal/dsa-transparency-report' },
    { id: 'gdpr-dpa-documented', text: 'GDPR DPA with SCC/UK-IDTA mechanisms publicly available', textDe: 'DSGVO-AVV mit SCC-/UK-IDTA-Mechanismen öffentlich verfügbar', dimension: 'governance', amount: 1, sourceUrl: 'https://www.hostinger.com/legal/dpa' },
    { id: 'public-status-page', text: 'Public Statuspage for incident and uptime tracking', textDe: 'Öffentliche Statusseite für Vorfall- und Verfügbarkeitsüberwachung', dimension: 'reliability', amount: 1, sourceUrl: 'https://statuspage.hostinger.com/' },
    { id: 'active-release-cadence', text: 'Active SDK and tooling release cadence across GitHub repositories', textDe: 'Aktiver SDK- und Tooling-Release-Zyklus über GitHub-Repositories', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/niceit/hostinger-api-client-typescript' },
    { id: 'data-export-available', text: 'Downloadable file and database backups for standard hosting plans', textDe: 'Herunterladbare Datei- und Datenbank-Backups für Standard-Hosting-Pläne', dimension: 'contract', amount: 1, sourceUrl: 'https://support.hostinger.com/en/articles/5981435-how-to-download-backups-at-hostinger' },
    { id: 'eu-data-residency', text: 'EU contracting entity in Cyprus with EMEA subprocessor designations', textDe: 'EU-Vertragsgesellschaft in Zypern mit EMEA-Unterauftragsverarbeiter-Bezeichnungen', dimension: 'contract', amount: 1, sourceUrl: 'https://www.hostinger.com/legal/dpa' },
  ],
  'hugging-face': [
    { id: 'soc2-type2-attested', text: 'SOC 2 Type II attestation claimed for Hub and Inference Endpoints', textDe: 'SOC-2-Typ-II-Attestierung für Hub und Inference Endpoints angegeben', dimension: 'security', amount: 2, sourceUrl: 'https://huggingface.co/docs/hub/en/security' },
    { id: 'responsible-disclosure-process', text: 'Security reporting via HackerOne private program and documented disclosure process', textDe: 'Sicherheitsmeldung über privates HackerOne-Programm und dokumentierten Meldeprozess', dimension: 'security', amount: 1, sourceUrl: 'https://huggingface.co/docs/hub/en/security' },
    { id: 'partial-open-source', text: 'Core libraries (Transformers, datasets, tokenizers) are Apache-2.0 open-source', textDe: 'Kernbibliotheken (Transformers, Datasets, Tokenizers) sind unter Apache 2.0 quelloffen', dimension: 'governance', amount: 1, sourceUrl: 'https://github.com/huggingface/transformers' },
    { id: 'transparent-ownership', text: 'Clear legal entity disclosures with EU main establishment in France', textDe: 'Klare Rechtsform-Offenlegung mit EU-Hauptniederlassung in Frankreich', dimension: 'governance', amount: 1, sourceUrl: 'https://huggingface.co/privacy' },
    { id: 'public-status-page', text: 'Public status page with uptime metrics per service', textDe: 'Öffentliche Statusseite mit Verfügbarkeitsmetriken pro Service', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.huggingface.co' },
    { id: 'active-release-cadence', text: 'Very high release cadence across core libraries (multiple releases per month)', textDe: 'Sehr hohe Release-Frequenz über Kernbibliotheken (mehrere Releases pro Monat)', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/huggingface/transformers/releases' },
    { id: 'data-export-available', text: 'Git-based repository model enables full cloning and download of artifacts', textDe: 'Git-basiertes Repository-Modell ermöglicht vollständiges Klonen und Herunterladen von Artefakten', dimension: 'contract', amount: 1, sourceUrl: 'https://huggingface.co/docs/hub/en/security' },
    { id: 'open-standards-no-lock-in', text: 'Git-like repository semantics with standard ML formats reduce lock-in', textDe: 'Git-ähnliche Repository-Semantik mit Standard-ML-Formaten reduziert Lock-in', dimension: 'contract', amount: 1, sourceUrl: 'https://huggingface.co/docs/hub/en/security' },
    { id: 'fair-cancellation-terms', text: 'Pro subscriptions cancellable anytime with documented content ownership', textDe: 'Pro-Abonnements jederzeit kündbar mit dokumentiertem Inhalts-Eigentumsrecht', dimension: 'contract', amount: 1, sourceUrl: 'https://huggingface.co/terms-of-service' },
  ],
  'infomaniak': [
    { id: 'iso-27001-certified', text: 'ISO/IEC 27001:2022 certification with public certificate PDF', textDe: 'ISO/IEC-27001:2022-Zertifizierung mit öffentlichem Zertifikats-PDF', dimension: 'security', amount: 2, sourceUrl: 'https://www.infomaniak.com/documents/iso/27001_1EN.pdf' },
    { id: 'public-bug-bounty', text: 'Public bug bounty program via YesWeHack', textDe: 'Öffentliches Bug-Bounty-Programm über YesWeHack', dimension: 'security', amount: 1, sourceUrl: 'https://yeswehack.com/programs/infomaniak-bug-bounty-program' },
    { id: 'responsible-disclosure-process', text: 'Published security.txt and coordinated disclosure channels', textDe: 'Veröffentlichte security.txt und koordinierte Meldekanäle', dimension: 'security', amount: 1, sourceUrl: 'https://www.infomaniak.com/en/secure' },
    { id: 'transparent-ownership', text: 'Employee-majority ownership narrative with long operating history', textDe: 'Darstellung einer Mitarbeiter-Mehrheitsbeteiligung mit langer Betriebshistorie', dimension: 'governance', amount: 1, sourceUrl: 'https://www.infomaniak.com/en/legal/general-terms-and-conditions' },
    { id: 'gdpr-dpa-documented', text: 'Public legal framework with Swiss data protection compliance documentation', textDe: 'Öffentlicher Rechtsrahmen mit Schweizer Datenschutz-Compliance-Dokumentation', dimension: 'governance', amount: 1, sourceUrl: 'https://www.infomaniak.com/en/legal/general-terms-and-conditions' },
    { id: 'public-status-page', text: 'Public service status page at infomaniakstatus.com', textDe: 'Öffentliche Service-Statusseite unter infomaniakstatus.com', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.infomaniakstatus.com/' },
    { id: 'active-release-cadence', text: 'Active product maintenance and update cadence across services', textDe: 'Aktive Produktpflege und Update-Frequenz über alle Dienste', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.infomaniakstatus.com/' },
    { id: 'fair-cancellation-terms', text: 'Trial and money-back pathways documented in terms', textDe: 'Test- und Geld-zurück-Optionen in den AGB dokumentiert', dimension: 'contract', amount: 1, sourceUrl: 'https://www.infomaniak.com/en/legal/general-terms-and-conditions' },
    { id: 'eu-data-residency', text: 'Swiss-hosted infrastructure with explicit data residency commitments', textDe: 'In der Schweiz gehostete Infrastruktur mit expliziten Datenresidenz-Zusagen', dimension: 'contract', amount: 1, sourceUrl: 'https://www.infomaniak.com/en/legal/general-terms-and-conditions' },
  ],
  'ionos': [
    { id: 'iso-27001-certified', text: 'ISO 27001 on BSI IT-Grundschutz basis with registry-verifiable certification', textDe: 'ISO 27001 auf BSI-IT-Grundschutz-Basis mit registerprüfbarer Zertifizierung', dimension: 'security', amount: 2, sourceUrl: 'https://www.bsi.bund.de/EN/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/Zertifizierung-und-Anerkennung/ISO-IEC-27001-Zertifizierung-auf-Basis-von-IT-Grundschutz/Zertifizierte-Unternehmen/Zertifizierte-Unternehmen_node.html' },
    { id: 'responsible-disclosure-process', text: 'Public vulnerability register with patch-deploy timestamps and reporting process', textDe: 'Öffentliches Schwachstellenregister mit Patch-Zeitstempeln und Meldeprozess', dimension: 'security', amount: 1, sourceUrl: 'https://docs.ionos.com/cloud/security-safeguards/report-security-event/vulnerabilities' },
    { id: 'transparent-ownership', text: 'Public-company reporting with clear legal structure reduces ownership opacity', textDe: 'Börsennotierte Berichterstattung mit klarer Rechtsstruktur reduziert Eigentümerintransparenz', dimension: 'governance', amount: 1, sourceUrl: 'https://www.ionos-group.com/investor-relations/publications' },
    { id: 'public-transparency-report', text: 'Public investor relations publications and financial reporting', textDe: 'Öffentliche Investor-Relations-Publikationen und Finanzberichterstattung', dimension: 'governance', amount: 1, sourceUrl: 'https://www.ionos-group.com/investor-relations/publications' },
    { id: 'gdpr-dpa-documented', text: 'GDPR compliance documented in terms and DPA framework', textDe: 'DSGVO-Konformität in AGB und AVV-Rahmen dokumentiert', dimension: 'governance', amount: 1, sourceUrl: 'https://www.ionos.de/terms-gtc/terms/' },
    { id: 'public-status-page', text: 'Security and status publications for cloud infrastructure', textDe: 'Sicherheits- und Statuspublikationen für Cloud-Infrastruktur', dimension: 'reliability', amount: 1, sourceUrl: 'https://docs.ionos.com/cloud/security-safeguards/vulnerability-register' },
    { id: 'data-export-available', text: 'Explicit data export guidance and EU Data Act portability framing', textDe: 'Explizite Datenexport-Anleitung und EU Data Act-Portabilitätsrahmen', dimension: 'contract', amount: 1, sourceUrl: 'https://docs.ionos.com/cloud/data-export/eu-data-act' },
    { id: 'eu-data-residency', text: 'German-headquartered with EU data center infrastructure', textDe: 'Deutscher Hauptsitz mit EU-Rechenzentrumsinfrastruktur', dimension: 'contract', amount: 1, sourceUrl: 'https://www.ionos.de/terms-gtc/terms/' },
  ],
  'kdrive': [
    { id: 'iso-27001-certified', text: 'ISO/IEC 27001 certification via Infomaniak parent with public certificate', textDe: 'ISO/IEC-27001-Zertifizierung über Muttergesellschaft Infomaniak mit öffentlichem Zertifikat', dimension: 'security', amount: 2, sourceUrl: 'https://www.infomaniak.com/documents/iso/27001_1EN.pdf' },
    { id: 'public-bug-bounty', text: 'Public bug bounty program via Infomaniak YesWeHack', textDe: 'Öffentliches Bug-Bounty-Programm über Infomaniak YesWeHack', dimension: 'security', amount: 1, sourceUrl: 'https://yeswehack.com/programs/infomaniak-bug-bounty-program' },
    { id: 'responsible-disclosure-process', text: 'Published security.txt with coordinated disclosure channels', textDe: 'Veröffentlichte security.txt mit koordinierten Meldekanälen', dimension: 'security', amount: 1, sourceUrl: 'https://www.infomaniak.com/.well-known/security.txt' },
    { id: 'transparent-ownership', text: 'Long-running legal entity with public legal terms and certification artifacts', textDe: 'Langjährige Rechtsform mit öffentlichen AGB und Zertifizierungsartefakten', dimension: 'governance', amount: 1, sourceUrl: 'https://www.infomaniak.com/en/legal/general-terms-and-conditions' },
    { id: 'gdpr-dpa-documented', text: 'Swiss data protection framework with explicit contractual commitments', textDe: 'Schweizer Datenschutzrahmen mit expliziten vertraglichen Zusagen', dimension: 'governance', amount: 1, sourceUrl: 'https://welcome.infomaniak.com/api/web-components/1/cgu/latest?id=63&locale=en_GB' },
    { id: 'public-status-page', text: 'Public status page at infomaniakstatus.com', textDe: 'Öffentliche Statusseite unter infomaniakstatus.com', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.infomaniakstatus.com/' },
    { id: 'active-release-cadence', text: 'Active desktop client releases on GitHub', textDe: 'Aktive Desktop-Client-Releases auf GitHub', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/Infomaniak/desktop-kDrive/releases' },
    { id: 'eu-data-residency', text: 'Explicit Swiss-hosting commitment in kDrive special terms', textDe: 'Explizite Schweizer-Hosting-Zusage in kDrive-Sonderbedingungen', dimension: 'contract', amount: 1, sourceUrl: 'https://welcome.infomaniak.com/api/web-components/1/cgu/latest?id=63&locale=en_GB' },
    { id: 'data-export-available', text: 'File download and sync client enable data export', textDe: 'Dateidownload und Sync-Client ermöglichen Datenexport', dimension: 'contract', amount: 1, sourceUrl: 'https://www.infomaniak.com/en/support/faq/2462/understanding-kdrive-data-security' },
  ],
  'keepassxc': [
    { id: 'independent-security-audit', text: 'ANSSI CSPN certification for v2.7.9', textDe: 'ANSSI-CSPN-Zertifizierung für v2.7.9', dimension: 'security', amount: 2, sourceUrl: 'https://keepassxc.org/blog/2025-11-17-keepassxc-279-cspn-certified/' },
    { id: 'responsible-disclosure-process', text: 'Documented security policy with dedicated reporting process', textDe: 'Dokumentierte Sicherheitsrichtlinie mit dediziertem Meldeprozess', dimension: 'security', amount: 1, sourceUrl: 'https://github.com/keepassxreboot/keepassxc/security/policy' },
    { id: 'zero-knowledge-architecture', text: 'Local-only encrypted KDBX database with no server-side access', textDe: 'Rein lokale verschlüsselte KDBX-Datenbank ohne serverseitigen Zugriff', dimension: 'security', amount: 2, sourceUrl: 'https://keepassxc.org/docs/' },
    { id: 'signed-releases', text: 'Cryptographically signed releases with documented verification process', textDe: 'Kryptografisch signierte Releases mit dokumentiertem Verifizierungsprozess', dimension: 'governance', amount: 1, sourceUrl: 'https://github.com/keepassxreboot/keepassxc/blob/develop/docs/topics/verifying-signatures.adoc' },
    { id: 'active-release-cadence', text: 'Mature maintenance pattern with regular versioned releases', textDe: 'Ausgereiftes Wartungsmuster mit regelmässigen versionierten Releases', dimension: 'reliability', amount: 1, sourceUrl: 'https://keepassxc.org/blog/2025-11-17-keepassxc-279-cspn-certified/' },
    { id: 'self-hostable', text: 'Fully local desktop application with no cloud dependency', textDe: 'Vollständig lokale Desktop-Anwendung ohne Cloud-Abhängigkeit', dimension: 'contract', amount: 2, sourceUrl: 'https://keepassxc.org/' },
    { id: 'open-standards-no-lock-in', text: 'KDBX open format with broad ecosystem interoperability', textDe: 'Offenes KDBX-Format mit breiter Ökosystem-Interoperabilität', dimension: 'contract', amount: 1, sourceUrl: 'https://keepassxc.org/' },
    { id: 'data-export-available', text: 'Local database files fully portable across platforms', textDe: 'Lokale Datenbankdateien plattformübergreifend vollständig portabel', dimension: 'contract', amount: 1, sourceUrl: 'https://keepassxc.org/' },
  ],
  'librewolf': [
    { id: 'responsible-disclosure-process', text: 'Dedicated PGP-secured security reporting channel', textDe: 'Dedizierter PGP-gesicherter Sicherheitsmeldekanal', dimension: 'security', amount: 1, sourceUrl: 'https://librewolf.net/docs/security/' },
    { id: 'data-minimization-verified', text: 'Privacy-hardening defaults with telemetry and tracking disabled', textDe: 'Datenschutzgehärtete Standardeinstellungen mit deaktivierter Telemetrie und Tracking', dimension: 'security', amount: 2, sourceUrl: 'https://librewolf.net/docs/faq/' },
    { id: 'active-release-cadence', text: 'Recurring updates tracking Firefox upstream releases', textDe: 'Regelmässige Updates im Einklang mit Firefox-Upstream-Releases', dimension: 'reliability', amount: 1, sourceUrl: 'https://librewolf.net/docs/faq/#how-often-do-you-update-librewolf' },
    { id: 'self-hostable', text: 'Local desktop browser with no cloud account required', textDe: 'Lokaler Desktop-Browser ohne Cloud-Konto erforderlich', dimension: 'contract', amount: 2, sourceUrl: 'https://librewolf.net/' },
    { id: 'open-standards-no-lock-in', text: 'Standard web browser with no forced account or ecosystem lock-in', textDe: 'Standard-Webbrowser ohne erzwungenes Konto oder Ökosystem-Lock-in', dimension: 'contract', amount: 1, sourceUrl: 'https://librewolf.net/' },
  ],
  'linux-kernel': [
    { id: 'responsible-disclosure-process', text: 'Documented private security reporting flow with coordinated handling', textDe: 'Dokumentierter privater Sicherheitsmeldeprozess mit koordinierter Bearbeitung', dimension: 'security', amount: 1, sourceUrl: 'https://www.kernel.org/doc/html/latest/process/security-bugs.html' },
    { id: 'recurring-security-audits', text: 'Continuous CVE workflow ownership with dedicated security team', textDe: 'Kontinuierlicher CVE-Workflow mit dediziertem Sicherheitsteam', dimension: 'security', amount: 3, sourceUrl: 'https://docs.kernel.org/process/cve.html' },
    { id: 'foundation-or-nonprofit', text: 'Stewarded by the Linux Foundation with explicit governance documentation', textDe: 'Unter Verwaltung der Linux Foundation mit expliziter Governance-Dokumentation', dimension: 'governance', amount: 1, sourceUrl: 'https://www.kernel.org/doc/html/latest/process/management-style.html' },
    { id: 'signed-releases', text: 'Cryptographically signed kernel releases via kernel.org', textDe: 'Kryptografisch signierte Kernel-Releases über kernel.org', dimension: 'governance', amount: 1, sourceUrl: 'https://www.kernel.org/signature.html' },
    { id: 'active-release-cadence', text: 'Regular mainline cadence with stable and LTS update flow', textDe: 'Regelmässiger Mainline-Zyklus mit Stable- und LTS-Update-Fluss', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.kernel.org/releases.html' },
    { id: 'documented-incident-response', text: 'Documented stable kernel rules and security patch process', textDe: 'Dokumentierte Stable-Kernel-Regeln und Sicherheitspatch-Prozess', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.kernel.org/doc/html/latest/process/stable-kernel-rules.html' },
    { id: 'self-hostable', text: 'Fully self-hostable operating system kernel', textDe: 'Vollständig selbst hostbarer Betriebssystemkernel', dimension: 'contract', amount: 2, sourceUrl: 'https://www.kernel.org/' },
    { id: 'open-standards-no-lock-in', text: 'GPL licensing with broad downstream portability and no lock-in', textDe: 'GPL-Lizenzierung mit breiter Downstream-Portabilität und ohne Lock-in', dimension: 'contract', amount: 1, sourceUrl: 'https://github.com/torvalds/linux/blob/master/COPYING' },
    { id: 'data-export-available', text: 'Complete source availability enables full portability', textDe: 'Vollständige Quellcode-Verfügbarkeit ermöglicht volle Portabilität', dimension: 'contract', amount: 1, sourceUrl: 'https://www.kernel.org/' },
  ],
  'lumo': [
    { id: 'soc2-type2-attested', text: 'Proton SOC 2 Type II attestation covering organizational controls', textDe: 'Proton-SOC-2-Typ-II-Attestierung für organisatorische Kontrollen', dimension: 'security', amount: 2, sourceUrl: 'https://proton.me/blog/soc-2' },
    { id: 'iso-27001-certified', text: 'Proton ISO 27001 certification', textDe: 'Proton-ISO-27001-Zertifizierung', dimension: 'security', amount: 2, sourceUrl: 'https://proton.me/blog/iso-27001-certification' },
    { id: 'public-bug-bounty', text: 'Public bug bounty and safe-harbor programs via Proton security response center', textDe: 'Öffentliches Bug-Bounty- und Safe-Harbor-Programm über Proton Security Response Center', dimension: 'security', amount: 1, sourceUrl: 'https://proton.me/security/response-center' },
    { id: 'responsible-disclosure-process', text: 'Published security response center with disclosure process', textDe: 'Veröffentlichtes Security Response Center mit Meldeprozess', dimension: 'security', amount: 1, sourceUrl: 'https://proton.me/security/response-center' },
    { id: 'data-minimization-verified', text: 'Explicit no-training, no-sharing, no-logs defaults for Lumo interactions', textDe: 'Explizite No-Training-, No-Sharing-, No-Logs-Standards für Lumo-Interaktionen', dimension: 'security', amount: 2, sourceUrl: 'https://proton.me/support/lumo-privacy' },
    { id: 'partial-open-source', text: 'Client code published under GPL-3.0 (server orchestration proprietary)', textDe: 'Client-Code unter GPL-3.0 veröffentlicht (Server-Orchestrierung proprietär)', dimension: 'governance', amount: 1, sourceUrl: 'https://proton.me/community/open-source' },
    { id: 'transparent-ownership', text: 'Clear legal operator identity and Swiss jurisdiction disclosures', textDe: 'Klare Betreiberidentität und Schweizer Jurisdiktionsoffenlegung', dimension: 'governance', amount: 1, sourceUrl: 'https://proton.me/support/lumo-privacy' },
    { id: 'public-status-page', text: 'Public status infrastructure at status.proton.me', textDe: 'Öffentliche Statusinfrastruktur unter status.proton.me', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.proton.me' },
    { id: 'eu-data-residency', text: 'Swiss-hosted with privacy-by-default data residency framing', textDe: 'In der Schweiz gehostet mit Privacy-by-Default-Datenresidenz', dimension: 'contract', amount: 1, sourceUrl: 'https://proton.me/support/lumo-privacy' },
  ],
  'magic-earth': [
    { id: 'data-minimization-verified', text: 'Published data-retention matrix with explicit retention windows and not-retained claims', textDe: 'Veröffentlichte Datenaufbewahrungsmatrix mit expliziten Aufbewahrungsfristen und Nicht-Aufbewahrungs-Angaben', dimension: 'security', amount: 2, sourceUrl: 'https://www.magicearth.com/assets/docs/MagicEarth-User-Data-Privacy-20240703.pdf' },
    { id: 'transparent-ownership', text: 'Identifiable legal entity with public legal pages', textDe: 'Identifizierbare Rechtsform mit öffentlichen Rechtsseiten', dimension: 'governance', amount: 1, sourceUrl: 'https://www.magicearth.com/terms-and-conditions' },
    { id: 'gdpr-dpa-documented', text: 'Consumer-rights wording for EU users in terms and conditions', textDe: 'Verbraucherrechtliche Formulierungen für EU-Nutzer in den AGB', dimension: 'governance', amount: 1, sourceUrl: 'https://www.magicearth.com/terms-and-conditions' },
    { id: 'active-release-cadence', text: 'Active app updates on mobile stores', textDe: 'Aktive App-Updates in mobilen Stores', dimension: 'reliability', amount: 1, sourceUrl: 'https://play.google.com/store/apps/details?id=com.generalmagic.magicearth' },
    { id: 'eu-data-residency', text: 'Netherlands-headquartered EU legal entity', textDe: 'EU-Rechtsform mit Hauptsitz in den Niederlanden', dimension: 'contract', amount: 1, sourceUrl: 'https://www.magicearth.com/terms-and-conditions' },
  ],
  'mailbox-org': [
    { id: 'independent-security-audit', text: 'BSI IT-Sicherheitskennzeichen (IT-SIK-01011) certification', textDe: 'BSI-IT-Sicherheitskennzeichen (IT-SIK-01011) Zertifizierung', dimension: 'security', amount: 2, sourceUrl: 'https://www.bsi.bund.de/SiteGlobals/Functions/Zertifikat/DE/ITSIK/ITSIK_Formular.html?nn=1335442&cl2Categories_ITSIK=01011' },
    { id: 'responsible-disclosure-process', text: 'Published security.txt with coordinated disclosure process', textDe: 'Veröffentlichte security.txt mit koordiniertem Meldeprozess', dimension: 'security', amount: 1, sourceUrl: 'https://mailbox.org/.well-known/security.txt' },
    { id: 'transparent-ownership', text: 'Clear legal operator disclosures (Heinlein Hosting GmbH) in German jurisdiction', textDe: 'Klare Betreiberoffenlegung (Heinlein Hosting GmbH) in deutscher Rechtsordnung', dimension: 'governance', amount: 1, sourceUrl: 'https://mailbox.org/en/company/#legal-info' },
    { id: 'public-transparency-report', text: 'Published transparency report for 2025', textDe: 'Veröffentlichter Transparenzbericht für 2025', dimension: 'governance', amount: 1, sourceUrl: 'https://mailbox.org/en/post/transparency-report-2025/' },
    { id: 'gdpr-dpa-documented', text: 'Comprehensive data protection and privacy policy for German jurisdiction', textDe: 'Umfassende Datenschutzrichtlinie für deutsche Rechtsordnung', dimension: 'governance', amount: 1, sourceUrl: 'https://mailbox.org/en/data-protection-privacy-policy' },
    { id: 'documented-incident-response', text: 'Public postmortem-style outage communication for incidents', textDe: 'Öffentliche Postmortem-Ausfallkommunikation bei Vorfällen', dimension: 'reliability', amount: 1, sourceUrl: 'https://mailbox.org/en/news/power-outage-data-centre-led-downtime-mailboxorg/' },
    { id: 'open-standards-no-lock-in', text: 'Open email protocols (IMAP/SMTP/CalDAV/CardDAV) prevent lock-in', textDe: 'Offene E-Mail-Protokolle (IMAP/SMTP/CalDAV/CardDAV) verhindern Lock-in', dimension: 'contract', amount: 1, sourceUrl: 'https://mailbox.org/en/' },
    { id: 'data-export-available', text: 'Standard email protocol access enables full data export', textDe: 'Standard-E-Mail-Protokollzugang ermöglicht vollständigen Datenexport', dimension: 'contract', amount: 1, sourceUrl: 'https://mailbox.org/en/' },
    { id: 'fair-cancellation-terms', text: 'Explicit deletion and cancellation policy publicly documented', textDe: 'Explizite Lösch- und Kündigungsrichtlinie öffentlich dokumentiert', dimension: 'contract', amount: 1, sourceUrl: 'https://mailbox.org/en/t-cs-cancellation-policy/' },
    { id: 'eu-data-residency', text: 'German-hosted infrastructure with EU data residency', textDe: 'In Deutschland gehostete Infrastruktur mit EU-Datenresidenz', dimension: 'contract', amount: 1, sourceUrl: 'https://mailbox.org/en/data-protection-privacy-policy' },
  ],

  // ── Mailfence ───────────────────────────────────────────────────────
  'mailfence': [
    { id: 'responsible-disclosure-process', text: 'Published threat model and security disclosure process', textDe: 'Veröffentlichtes Bedrohungsmodell und Sicherheitsmeldeprozess', dimension: 'security', amount: 1, sourceUrl: 'https://mailfence.com/en/threat-model.jsp' },
    { id: 'transparent-ownership', text: 'Clear Belgian legal entity and jurisdiction framing', textDe: 'Klare belgische Rechtsform und Jurisdiktionsrahmen', dimension: 'governance', amount: 1, sourceUrl: 'https://mailfence.com/en/terms.jsp' },
    { id: 'public-transparency-report', text: 'Publishes transparency report with warrant canary', textDe: 'Veröffentlicht Transparenzbericht mit Warrant Canary', dimension: 'governance', amount: 1, sourceUrl: 'https://blog.mailfence.com/transparency-report-and-warrant-canary/' },
    { id: 'gdpr-dpa-documented', text: 'GDPR compliance and Belgian privacy law documented', textDe: 'DSGVO-Konformität und belgisches Datenschutzrecht dokumentiert', dimension: 'governance', amount: 1, sourceUrl: 'https://mailfence.com/en/privacy.jsp' },
    { id: 'public-status-page', text: 'Public status page with incident history', textDe: 'Öffentliche Statusseite mit Vorfallhistorie', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.mfstatus.com/history' },
    { id: 'active-release-cadence', text: 'Regular release notes and mobile app updates', textDe: 'Regelmässige Release-Notes und mobile App-Updates', dimension: 'reliability', amount: 1, sourceUrl: 'https://mailfence.com' },
    { id: 'data-export-available', text: 'Message export/import and IMAP/POP/SMTP access', textDe: 'Nachrichten-Export/-Import und IMAP-/POP-/SMTP-Zugang', dimension: 'contract', amount: 1, sourceUrl: 'https://kb.mailfence.com/kb/how-can-use-mailfence-messages-with-thunderbird-using-smtp-and-imap-pop/' },
    { id: 'open-standards-no-lock-in', text: 'Standard protocols (IMAP, CalDAV, CardDAV) reduce lock-in', textDe: 'Standardprotokolle (IMAP, CalDAV, CardDAV) reduzieren Lock-in', dimension: 'contract', amount: 1, sourceUrl: 'https://mailfence.com/en/terms.jsp' },
    { id: 'eu-data-residency', text: 'Servers hosted in Belgium, EU data residency', textDe: 'Server in Belgien gehostet, EU-Datenresidenz', dimension: 'contract', amount: 1, sourceUrl: 'https://mailfence.com/en/privacy.jsp' },
  ],

  // ── Mastodon ────────────────────────────────────────────────────────
  'mastodon': [
    { id: 'responsible-disclosure-process', text: 'Formal responsible-disclosure process with dedicated security contact', textDe: 'Formeller Responsible-Disclosure-Prozess mit dediziertem Sicherheitskontakt', dimension: 'security', amount: 1, sourceUrl: 'https://docs.joinmastodon.org/dev/disclosure/' },
    { id: 'transparent-ownership', text: 'Clear legal entity (Mastodon gGmbH) with visible governance', textDe: 'Klare Rechtsform (Mastodon gGmbH) mit sichtbarer Governance', dimension: 'governance', amount: 1, sourceUrl: 'https://joinmastodon.org' },
    { id: 'foundation-or-nonprofit', text: 'Run by a German nonprofit gGmbH', textDe: 'Betrieben von einer deutschen gemeinnützigen gGmbH', dimension: 'governance', amount: 1, sourceUrl: 'https://joinmastodon.org' },
    { id: 'active-release-cadence', text: 'Active release cadence with supported version policies', textDe: 'Aktiver Release-Zyklus mit dokumentierten Versions-Support-Richtlinien', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/mastodon/mastodon/releases' },
    { id: 'public-status-page', text: 'Public status reporting for official infrastructure', textDe: 'Öffentliche Statusberichte für offizielle Infrastruktur', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.mastodon.social' },
    { id: 'self-hostable', text: 'Fully self-hostable federated server software', textDe: 'Vollständig selbst hostbare föderierte Server-Software', dimension: 'contract', amount: 2, sourceUrl: 'https://docs.joinmastodon.org/' },
    { id: 'data-export-available', text: 'Account export and migration via federation', textDe: 'Konto-Export und -Migration via Föderation', dimension: 'contract', amount: 1, sourceUrl: 'https://docs.joinmastodon.org/user/moving/' },
    { id: 'open-standards-no-lock-in', text: 'Uses ActivityPub open standard, no vendor lock-in', textDe: 'Nutzt offenen ActivityPub-Standard, kein Anbieter-Lock-in', dimension: 'contract', amount: 1, sourceUrl: 'https://docs.joinmastodon.org/user/network/' },
  ],

  // ── Mistral AI ──────────────────────────────────────────────────────
  'mistral': [
    { id: 'responsible-disclosure-process', text: 'Security contact and trust center with disclosure process', textDe: 'Sicherheitskontakt und Trust Center mit Meldeprozess', dimension: 'security', amount: 1, sourceUrl: 'https://mistral.ai/trust/' },
    { id: 'partial-open-source', text: 'Partially open-source: some models Apache 2.0, flagships proprietary', textDe: 'Teilweise quelloffen: einige Modelle Apache 2.0, Flaggschiff-Modelle proprietär', dimension: 'governance', amount: 1, sourceUrl: 'https://docs.mistral.ai/getting-started/models/' },
    { id: 'transparent-ownership', text: 'Clear French legal identity and publicly visible investor structure', textDe: 'Klare französische Rechtsform und öffentlich sichtbare Investorenstruktur', dimension: 'governance', amount: 1, sourceUrl: 'https://mistral.ai' },
    { id: 'gdpr-dpa-documented', text: 'GDPR/DPA compliance documented with breach-notification obligations', textDe: 'DSGVO-/AVV-Konformität dokumentiert mit Meldepflichten bei Datenschutzverletzungen', dimension: 'governance', amount: 1, sourceUrl: 'https://legal.mistral.ai/terms/privacy-policy' },
    { id: 'active-release-cadence', text: 'Active model and SDK release cadence', textDe: 'Aktiver Modell- und SDK-Release-Zyklus', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/mistralai' },
    { id: 'data-export-available', text: 'Data export explicitly listed as Team feature', textDe: 'Datenexport explizit als Team-Funktion aufgeführt', dimension: 'contract', amount: 1, sourceUrl: 'https://mistral.ai/pricing/' },
    { id: 'open-standards-no-lock-in', text: 'OpenAI-compatible API and self-deployment support reduce lock-in', textDe: 'OpenAI-kompatible API und Self-Deployment-Support reduzieren Lock-in', dimension: 'contract', amount: 1, sourceUrl: 'https://docs.mistral.ai/' },
  ],

  // ── Mollie ──────────────────────────────────────────────────────────
  'mollie': [
    { id: 'responsible-disclosure-process', text: 'Public responsible-disclosure workflow with explicit response windows', textDe: 'Öffentlicher Responsible-Disclosure-Workflow mit expliziten Antwortfristen', dimension: 'security', amount: 1, sourceUrl: 'https://www.mollie.com/legal/responsible-disclosure' },
    { id: 'transparent-ownership', text: 'Clear legal identity with DNB/FCA supervisory disclosures', textDe: 'Klare Rechtsform mit DNB-/FCA-Aufsichtsoffenlegungen', dimension: 'governance', amount: 1, sourceUrl: 'https://www.mollie.com/legal/user-agreement' },
    { id: 'gdpr-dpa-documented', text: 'GDPR/DPA terms documented in privacy and legal materials', textDe: 'DSGVO-/AVV-Bedingungen in Datenschutz- und Rechtsdokumenten erfasst', dimension: 'governance', amount: 1, sourceUrl: 'https://www.mollie.com/legal/privacy' },
    { id: 'public-status-page', text: 'Public status page with incident transparency', textDe: 'Öffentliche Statusseite mit Vorfall-Transparenz', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.mollie.com/' },
    { id: 'active-release-cadence', text: 'Active SDK and plugin release cadence', textDe: 'Aktiver SDK- und Plugin-Release-Zyklus', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/mollie' },
    { id: 'data-export-available', text: 'Dashboard exports (CSV, CAMT.053, MT940) and API portability', textDe: 'Dashboard-Exporte (CSV, CAMT.053, MT940) und API-Portabilität', dimension: 'contract', amount: 1, sourceUrl: 'https://www.mollie.com' },
    { id: 'eu-data-residency', text: 'Dutch regulated entity with EU operational base', textDe: 'Niederländische regulierte Gesellschaft mit EU-Betriebsbasis', dimension: 'contract', amount: 1, sourceUrl: 'https://www.mollie.com/legal/privacy' },
  ],

  // ── Mullvad VPN ─────────────────────────────────────────────────────
  'mullvad-vpn': [
    { id: 'recurring-security-audits', text: 'Recurring white-box audits by X41 and Cure53 (app, API, infrastructure)', textDe: 'Wiederkehrende White-Box-Audits durch X41 und Cure53 (App, API, Infrastruktur)', dimension: 'security', amount: 3, sourceUrl: 'https://mullvad.net/en/blog/the-report-for-the-2024-security-audit-of-the-app-is-now-available' },
    { id: 'independent-security-audit', text: 'Account and payment stack audited by X41 D-Sec', textDe: 'Account- und Zahlungs-Stack von X41 D-Sec auditiert', dimension: 'security', amount: 2, sourceUrl: 'https://mullvad.net/en/blog/new-security-audit-of-account-and-payment-services' },
    { id: 'responsible-disclosure-process', text: 'Published security process with PGP-encrypted reporting channel', textDe: 'Veröffentlichter Sicherheitsprozess mit PGP-verschlüsseltem Meldekanal', dimension: 'security', amount: 1, sourceUrl: 'https://github.com/mullvad/mullvadvpn-app/security' },
    { id: 'data-minimization-verified', text: 'Verified no-logging with numbered accounts, minimal data inventory', textDe: 'Verifiziertes No-Logging mit nummerierten Konten, minimales Dateninventar', dimension: 'security', amount: 2, sourceUrl: 'https://mullvad.net/en/help/no-logging-data-policy/' },
    { id: 'transparent-ownership', text: 'Clear Swedish legal entity with published jurisdiction documentation', textDe: 'Klare schwedische Rechtsform mit veröffentlichter Jurisdiktionsdokumentation', dimension: 'governance', amount: 1, sourceUrl: 'https://mullvad.net/en/help/swedish-legislation' },
    { id: 'gdpr-dpa-documented', text: 'GDPR compliance documented with data inventory', textDe: 'DSGVO-Konformität dokumentiert mit Dateninventar', dimension: 'governance', amount: 1, sourceUrl: 'https://mullvad.net/en/help/no-logging-data-policy/' },
    { id: 'active-release-cadence', text: 'Active release cadence across desktop and mobile clients', textDe: 'Aktiver Release-Zyklus über Desktop- und Mobile-Clients', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/mullvad/mullvadvpn-app/releases' },
    { id: 'open-standards-no-lock-in', text: 'Supports standard WireGuard clients, not locked to proprietary app', textDe: 'Unterstützt Standard-WireGuard-Clients, nicht an proprietäre App gebunden', dimension: 'contract', amount: 1, sourceUrl: 'https://mullvad.net/en/help/terms-service' },
    { id: 'fair-cancellation-terms', text: 'Flat EUR 5/month with period-based expiry, no forced long-term lock-in', textDe: 'Pauschale 5 EUR/Monat mit zeitbasiertem Ablauf, keine erzwungene Langzeitbindung', dimension: 'contract', amount: 1, sourceUrl: 'https://mullvad.net/en/help/terms-service' },
    { id: 'eu-data-residency', text: 'Swedish-headquartered with EU operational base', textDe: 'Schwedischer Hauptsitz mit EU-Betriebsbasis', dimension: 'contract', amount: 1, sourceUrl: 'https://mullvad.net/en/help/swedish-legislation' },
  ],

  // ── Nextcloud ───────────────────────────────────────────────────────
  'nextcloud': [
    { id: 'responsible-disclosure-process', text: 'Public security advisories and CVE workflow', textDe: 'Öffentliche Sicherheits-Advisories und CVE-Workflow', dimension: 'security', amount: 1, sourceUrl: 'https://github.com/nextcloud/server/security/advisories' },
    { id: 'public-bug-bounty', text: 'Public bug bounty program for security researchers', textDe: 'Öffentliches Bug-Bounty-Programm für Sicherheitsforscher', dimension: 'security', amount: 1, sourceUrl: 'https://hackerone.com/nextcloud' },
    { id: 'transparent-ownership', text: 'Clear German legal entity (Nextcloud GmbH)', textDe: 'Klare deutsche Rechtsform (Nextcloud GmbH)', dimension: 'governance', amount: 1, sourceUrl: 'https://nextcloud.com/impressum/' },
    { id: 'gdpr-dpa-documented', text: 'GDPR compliance documented with dedicated compliance page', textDe: 'DSGVO-Konformität dokumentiert mit dedizierter Compliance-Seite', dimension: 'governance', amount: 1, sourceUrl: 'https://nextcloud.com/compliance/' },
    { id: 'active-release-cadence', text: 'Regular release schedule with published maintenance calendar', textDe: 'Regelmässiger Release-Plan mit veröffentlichtem Wartungskalender', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/nextcloud/server/wiki/Maintenance-and-Release-Schedule' },
    { id: 'self-hostable', text: 'Fully self-hostable cloud platform', textDe: 'Vollständig selbst hostbare Cloud-Plattform', dimension: 'contract', amount: 2, sourceUrl: 'https://nextcloud.com/install/' },
    { id: 'data-export-available', text: 'Data export via WebDAV, CalDAV, CardDAV APIs', textDe: 'Datenexport über WebDAV-, CalDAV-, CardDAV-APIs', dimension: 'contract', amount: 1, sourceUrl: 'https://nextcloud.com/faq/' },
    { id: 'open-standards-no-lock-in', text: 'Uses open standards (WebDAV, CalDAV, CardDAV) for interoperability', textDe: 'Nutzt offene Standards (WebDAV, CalDAV, CardDAV) für Interoperabilität', dimension: 'contract', amount: 1, sourceUrl: 'https://docs.nextcloud.com/' },
  ],

  // ── Nextcloud Docs ──────────────────────────────────────────────────
  'nextcloud-docs': [
    { id: 'responsible-disclosure-process', text: 'Public security advisories and CVE workflow', textDe: 'Öffentliche Sicherheits-Advisories und CVE-Workflow', dimension: 'security', amount: 1, sourceUrl: 'https://github.com/nextcloud/server/security/advisories' },
    { id: 'public-bug-bounty', text: 'Public bug bounty program for security researchers', textDe: 'Öffentliches Bug-Bounty-Programm für Sicherheitsforscher', dimension: 'security', amount: 1, sourceUrl: 'https://hackerone.com/nextcloud' },
    { id: 'transparent-ownership', text: 'Clear German legal entity (Nextcloud GmbH)', textDe: 'Klare deutsche Rechtsform (Nextcloud GmbH)', dimension: 'governance', amount: 1, sourceUrl: 'https://nextcloud.com/impressum/' },
    { id: 'gdpr-dpa-documented', text: 'GDPR compliance documented with dedicated compliance page', textDe: 'DSGVO-Konformität dokumentiert mit dedizierter Compliance-Seite', dimension: 'governance', amount: 1, sourceUrl: 'https://nextcloud.com/compliance/' },
    { id: 'active-release-cadence', text: 'Regular release schedule with published maintenance calendar', textDe: 'Regelmässiger Release-Plan mit veröffentlichtem Wartungskalender', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/nextcloud/server/wiki/Maintenance-and-Release-Schedule' },
    { id: 'self-hostable', text: 'Fully self-hostable document collaboration platform', textDe: 'Vollständig selbst hostbare Dokumenten-Kollaborationsplattform', dimension: 'contract', amount: 2, sourceUrl: 'https://nextcloud.com/install/' },
    { id: 'open-standards-no-lock-in', text: 'Open-source stack prevents vendor lock-in', textDe: 'Open-Source-Stack verhindert Anbieter-Lock-in', dimension: 'contract', amount: 1, sourceUrl: 'https://nextcloud.com/faq/' },
  ],

  // ── NordVPN ─────────────────────────────────────────────────────────
  'nordvpn': [
    { id: 'recurring-security-audits', text: 'Recurring third-party infrastructure audits', textDe: 'Wiederkehrende Infrastruktur-Audits durch Dritte', dimension: 'security', amount: 3, sourceUrl: 'https://www.tomsguide.com/computing/vpns/nordvpn-passes-infrastructure-audit-with-flying-colors-but-security-work-never-ends' },
    { id: 'public-bug-bounty', text: 'Public bug bounty program on HackerOne', textDe: 'Öffentliches Bug-Bounty-Programm auf HackerOne', dimension: 'security', amount: 1, sourceUrl: 'https://hackerone.com/nordsecurity' },
    { id: 'partial-open-source', text: 'Linux client open-source under GPL-3.0', textDe: 'Linux-Client quelloffen unter GPL-3.0', dimension: 'governance', amount: 1, sourceUrl: 'https://github.com/NordSecurity/nordvpn-linux' },
    { id: 'active-release-cadence', text: 'Active client maintenance and product operations', textDe: 'Aktive Client-Pflege und Produktbetrieb', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/NordSecurity/nordvpn-linux' },
    { id: 'eu-data-residency', text: 'EU control anchor with core operations in Lithuania', textDe: 'EU-Kontrollanker mit Kernbetrieb in Litauen', dimension: 'contract', amount: 1, sourceUrl: 'https://nordvpn.com' },
  ],

  // ── Ollama ──────────────────────────────────────────────────────────
  'ollama': [
    { id: 'responsible-disclosure-process', text: 'Public security channel and active patching cadence', textDe: 'Öffentlicher Sicherheitskanal und aktive Patch-Frequenz', dimension: 'security', amount: 1, sourceUrl: 'https://github.com/ollama/ollama/security' },
    { id: 'transparent-ownership', text: 'Clear public project identity and maintainers', textDe: 'Klare öffentliche Projektidentität und Maintainer', dimension: 'governance', amount: 1, sourceUrl: 'https://github.com/ollama/ollama' },
    { id: 'active-release-cadence', text: 'High release and issue activity with frequent updates', textDe: 'Hohe Release- und Issue-Aktivität mit häufigen Updates', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/ollama/ollama/releases' },
    { id: 'self-hostable', text: 'Local-first execution on own hardware, fully self-hostable', textDe: 'Lokale Ausführung auf eigener Hardware, vollständig selbst hostbar', dimension: 'contract', amount: 2, sourceUrl: 'https://github.com/ollama/ollama' },
    { id: 'open-standards-no-lock-in', text: 'Local execution and open-source prevent vendor lock-in', textDe: 'Lokale Ausführung und Open Source verhindern Anbieter-Lock-in', dimension: 'contract', amount: 1, sourceUrl: 'https://github.com/ollama/ollama' },
  ],

  // ── Olvid Messenger ─────────────────────────────────────────────────
  'olvid': [
    { id: 'e2e-encryption-default', text: 'End-to-end encryption by default with proprietary protocol', textDe: 'Ende-zu-Ende-Verschlüsselung standardmässig mit proprietärem Protokoll', dimension: 'security', amount: 2, sourceUrl: 'https://www.olvid.io/technology/en' },
    { id: 'data-minimization-verified', text: 'No mandatory phone-number directory, privacy-by-design', textDe: 'Kein obligatorisches Telefonnummernverzeichnis, Privacy-by-Design', dimension: 'security', amount: 2, sourceUrl: 'https://www.olvid.io/privacy/en/' },
    { id: 'partial-open-source', text: 'Mobile clients and AWS server core open-sourced under AGPL', textDe: 'Mobile Clients und AWS-Server-Kern unter AGPL quelloffen', dimension: 'governance', amount: 1, sourceUrl: 'https://github.com/olvid-io/olvid-android' },
    { id: 'transparent-ownership', text: 'Clear French SAS legal entity with published privacy and terms', textDe: 'Klare französische SAS-Rechtsform mit veröffentlichtem Datenschutz und AGB', dimension: 'governance', amount: 1, sourceUrl: 'https://olvid.io/terms/en/' },
    { id: 'gdpr-dpa-documented', text: 'GDPR compliance documented in privacy policy', textDe: 'DSGVO-Konformität in Datenschutzrichtlinie dokumentiert', dimension: 'governance', amount: 1, sourceUrl: 'https://www.olvid.io/privacy/en/' },
    { id: 'active-release-cadence', text: 'Active product cadence visible in release information', textDe: 'Aktive Produktfrequenz in Release-Informationen sichtbar', dimension: 'reliability', amount: 1, sourceUrl: 'https://olvid.io/faq-admin/en/#question-install' },
    { id: 'data-export-available', text: 'Exportable encrypted backup workflow for migration/continuity', textDe: 'Exportierbarer verschlüsselter Backup-Workflow für Migration/Kontinuität', dimension: 'contract', amount: 1, sourceUrl: 'https://olvid.io/terms/en/' },
  ],

  // ── OpenStreetMap ───────────────────────────────────────────────────
  'openstreetmap': [
    { id: 'responsible-disclosure-process', text: 'Published security policy in core repositories', textDe: 'Veröffentlichte Sicherheitsrichtlinie in Kern-Repositories', dimension: 'security', amount: 1, sourceUrl: 'https://github.com/openstreetmap/openstreetmap-website/security/policy' },
    { id: 'transparent-ownership', text: 'Transparent OSM Foundation governance with public policies', textDe: 'Transparente OSM-Foundation-Governance mit öffentlichen Richtlinien', dimension: 'governance', amount: 1, sourceUrl: 'https://osmfoundation.org/wiki/Terms_of_Use' },
    { id: 'foundation-or-nonprofit', text: 'Operated by the OpenStreetMap Foundation (UK nonprofit)', textDe: 'Betrieben von der OpenStreetMap Foundation (gemeinnützig, UK)', dimension: 'governance', amount: 1, sourceUrl: 'https://osmfoundation.org' },
    { id: 'active-release-cadence', text: 'Active development with public operations policies', textDe: 'Aktive Entwicklung mit öffentlichen Betriebsrichtlinien', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/openstreetmap/openstreetmap-website' },
    { id: 'documented-incident-response', text: 'Public post-mortem culture with published incident reports', textDe: 'Öffentliche Postmortem-Kultur mit veröffentlichten Vorfallberichten', dimension: 'reliability', amount: 1, sourceUrl: 'https://operations.osmfoundation.org/2025/02/15/post-mortem.html' },
    { id: 'self-hostable', text: 'Data and tile infrastructure fully self-hostable', textDe: 'Daten- und Kachelinfrastruktur vollständig selbst hostbar', dimension: 'contract', amount: 2, sourceUrl: 'https://www.openstreetmap.org/export' },
    { id: 'data-export-available', text: 'Full data export under ODbL license', textDe: 'Vollständiger Datenexport unter ODbL-Lizenz', dimension: 'contract', amount: 1, sourceUrl: 'https://www.openstreetmap.org/export' },
    { id: 'open-standards-no-lock-in', text: 'ODbL-licensed open data with no vendor lock-in', textDe: 'ODbL-lizenzierte offene Daten ohne Anbieter-Lock-in', dimension: 'contract', amount: 1, sourceUrl: 'https://www.openstreetmap.org/copyright' },
  ],

  'organic-maps': [
    { id: 'transparent-ownership', text: 'Clear public ownership structure (Organic Maps OÜ, Estonia)', textDe: 'Klare öffentliche Eigentümerstruktur (Organic Maps OÜ, Estland)', dimension: 'governance', amount: 1, sourceUrl: 'https://raw.githubusercontent.com/organicmaps/organicmaps/master/LEGAL' },
    { id: 'data-minimization-verified', text: 'Offline-first architecture with no account requirement minimizes data collection', textDe: 'Offline-First-Architektur ohne Kontozwang minimiert Datenerhebung', dimension: 'security', amount: 2, sourceUrl: 'https://organicmaps.app/privacy/' },
    { id: 'signed-releases', text: 'Reproducible builds verified through F-Droid', textDe: 'Reproduzierbare Builds über F-Droid verifiziert', dimension: 'governance', amount: 1, sourceUrl: 'https://gitlab.com/fdroid/fdroiddata/-/raw/master/metadata/app.organicmaps.yml' },
    { id: 'active-release-cadence', text: 'Active release cadence with ongoing updates through 2025-2026', textDe: 'Aktiver Release-Zyklus mit fortlaufenden Updates bis 2025-2026', dimension: 'reliability', amount: 1, sourceUrl: 'https://organicmaps.app/news/2025-05-20/back-on-track-may-2025-release/' },
    { id: 'open-standards-no-lock-in', text: 'Exports data in standard formats (KML/KMZ, GPX, GeoJSON)', textDe: 'Exportiert Daten in Standardformaten (KML/KMZ, GPX, GeoJSON)', dimension: 'contract', amount: 1, sourceUrl: 'https://organicmaps.app/' },
    { id: 'data-export-available', text: 'Data export in open formats reduces lock-in', textDe: 'Datenexport in offenen Formaten reduziert Lock-in', dimension: 'contract', amount: 1, sourceUrl: 'https://organicmaps.app/' },
  ],
  'osmand': [
    { id: 'partial-open-source', text: 'GPLv3 codebase with non-free artwork terms and store exceptions', textDe: 'GPLv3-Codebasis mit unfreien Artwork-Bedingungen und Store-Ausnahmen', dimension: 'governance', amount: 1, sourceUrl: 'https://osmand.net/docs/legal/license/' },
    { id: 'transparent-ownership', text: 'Clear legal entity (OsmAnd B.V., Netherlands)', textDe: 'Klare Rechtsform (OsmAnd B.V., Niederlande)', dimension: 'governance', amount: 1, sourceUrl: 'https://osmand.net/help-online/privacy-policy/' },
    { id: 'data-minimization-verified', text: 'Offline-first architecture reduces always-on tracking surface', textDe: 'Offline-First-Architektur reduziert die ständige Tracking-Angriffsfläche', dimension: 'security', amount: 2, sourceUrl: 'https://osmand.net/help-online/privacy-policy/' },
    { id: 'active-release-cadence', text: 'Active release cadence with version updates through F-Droid', textDe: 'Aktiver Release-Zyklus mit Versions-Updates über F-Droid', dimension: 'reliability', amount: 1, sourceUrl: 'https://f-droid.org/packages/net.osmand.plus/' },
    { id: 'open-standards-no-lock-in', text: 'Uses standard GPX format for tracks and supports various export formats', textDe: 'Nutzt Standard-GPX-Format für Tracks und unterstützt verschiedene Exportformate', dimension: 'contract', amount: 1, sourceUrl: 'https://osmand.net/help-online/terms-of-use/' },
    { id: 'data-export-available', text: 'Export/backup options in standard formats (GPX)', textDe: 'Export-/Backup-Optionen in Standardformaten (GPX)', dimension: 'contract', amount: 1, sourceUrl: 'https://osmand.net/help-online/terms-of-use/' },
    { id: 'gdpr-dpa-documented', text: 'EU-based entity with documented privacy policy and GDPR scope', textDe: 'EU-ansässige Gesellschaft mit dokumentierter Datenschutzrichtlinie und DSGVO-Umfang', dimension: 'governance', amount: 1, sourceUrl: 'https://osmand.net/help-online/privacy-policy/' },
  ],
  'ovhcloud': [
    { id: 'soc2-type2-attested', text: 'SOC 3 report published for 2024 control period (Security/Availability/Confidentiality)', textDe: 'SOC-3-Bericht für Kontrollzeitraum 2024 veröffentlicht (Sicherheit/Verfügbarkeit/Vertraulichkeit)', dimension: 'security', amount: 2, sourceUrl: 'https://us.ovhcloud.com/sites/default/files/external_files/ovhcloud-us-soc3-report-2025.pdf' },
    { id: 'iso-27001-certified', text: 'ISO 27001 certification evidenced via UK G-Cloud listing', textDe: 'ISO-27001-Zertifizierung über UK-G-Cloud-Listing belegt', dimension: 'security', amount: 2, sourceUrl: 'https://corporate.ovhcloud.com/en/newsroom/news/secnumcloud-qualification-bare-metal-pod/' },
    { id: 'public-bug-bounty', text: 'Public bug bounty program via YesWeHack', textDe: 'Öffentliches Bug-Bounty-Programm über YesWeHack', dimension: 'security', amount: 1, sourceUrl: 'https://corporate.ovhcloud.com/' },
    { id: 'transparent-ownership', text: 'Clear public ownership structure with Euronext-listed company', textDe: 'Klare öffentliche Eigentümerstruktur als Euronext-börsennotiertes Unternehmen', dimension: 'governance', amount: 1, sourceUrl: 'https://us.ovhcloud.com/legal/terms-of-service/' },
    { id: 'gdpr-dpa-documented', text: 'GDPR compliance documented with CISPE code of conduct adherence', textDe: 'DSGVO-Konformität dokumentiert mit Einhaltung des CISPE-Verhaltenskodex', dimension: 'governance', amount: 1, sourceUrl: 'https://www.codeofconduct.cloud/public-register/' },
    { id: 'partial-open-source', text: 'Many public repositories including Control Panel and Terraform provider', textDe: 'Viele öffentliche Repositories inkl. Control Panel und Terraform-Provider', dimension: 'governance', amount: 1, sourceUrl: 'https://github.com/ovh' },
    { id: 'public-status-page', text: 'Public network and infrastructure status page with history', textDe: 'Öffentliche Netzwerk- und Infrastruktur-Statusseite mit Historie', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.ovhcloud.com/' },
    { id: 'multi-region-infrastructure', text: 'Multi-region datacenter infrastructure across Europe and globally', textDe: 'Multi-Region-Rechenzentrumsinfrastruktur in Europa und weltweit', dimension: 'reliability', amount: 1, sourceUrl: 'https://us.ovhcloud.com/legal/terms-of-service/' },
    { id: 'eu-data-residency', text: 'EU data residency with SecNumCloud-qualified offerings in France', textDe: 'EU-Datenresidenz mit SecNumCloud-qualifizierten Angeboten in Frankreich', dimension: 'contract', amount: 1, sourceUrl: 'https://corporate.ovhcloud.com/en/newsroom/news/hosted-private-cloud-secnumcloud-available/' },
    { id: 'fair-cancellation-terms', text: 'Customer retains right, title, and interest in content data', textDe: 'Kunde behält Recht, Eigentum und Anspruch an Inhaltsdaten', dimension: 'contract', amount: 1, sourceUrl: 'https://us.ovhcloud.com/legal/terms-of-service/' },
    { id: 'sla-published', text: 'Published SLA with service-specific terms', textDe: 'Veröffentlichtes SLA mit dienstspezifischen Bedingungen', dimension: 'reliability', amount: 1, sourceUrl: 'https://us.ovhcloud.com/legal/terms-of-service/' },
  ],
  'pcloud': [
    { id: 'transparent-ownership', text: 'Swiss AG structure with public registry (pCloud AG, Baar)', textDe: 'Schweizer AG-Struktur mit öffentlichem Register (pCloud AG, Baar)', dimension: 'governance', amount: 1, sourceUrl: 'https://www.pcloud.com/terms_and_conditions' },
    { id: 'eu-data-residency', text: 'EU data region option available (Luxembourg)', textDe: 'EU-Datenregion verfügbar (Luxemburg)', dimension: 'contract', amount: 1, sourceUrl: 'https://pcdn-www.pcloud.com/help/general-help-center/what-data-regions-are-available-to-store-my-data' },
    { id: 'data-export-available', text: 'Public API documentation and rclone integration for data export', textDe: 'Öffentliche API-Dokumentation und rclone-Integration für Datenexport', dimension: 'contract', amount: 1, sourceUrl: 'https://docs.pcloud.com/' },
    { id: 'open-standards-no-lock-in', text: 'Open API and third-party tool support (rclone) reduce lock-in', textDe: 'Offene API und Drittanbieter-Tool-Support (rclone) reduzieren Lock-in', dimension: 'contract', amount: 1, sourceUrl: 'https://rclone.org/pcloud/' },
  ],
  'peertube': [
    { id: 'responsible-disclosure-process', text: 'Published security policy with responsible disclosure and safe harbor', textDe: 'Veröffentlichte Sicherheitsrichtlinie mit Responsible Disclosure und Safe Harbor', dimension: 'security', amount: 1, sourceUrl: 'https://github.com/Chocobozzz/PeerTube/security/policy' },
    { id: 'foundation-or-nonprofit', text: 'Stewarded by Framasoft, a French nonprofit association', textDe: 'Verwaltet von Framasoft, einem französischen gemeinnützigen Verein', dimension: 'governance', amount: 1, sourceUrl: 'https://joinpeertube.org/en/faq/' },
    { id: 'public-transparency-report', text: 'Transparent public communication and roadmap from Framasoft', textDe: 'Transparente öffentliche Kommunikation und Roadmap von Framasoft', dimension: 'governance', amount: 1, sourceUrl: 'https://framablog.org/2025/04/10/2025-peertube-roadmap/' },
    { id: 'signed-releases', text: 'Cryptographically signed (verified) releases on GitHub', textDe: 'Kryptografisch signierte (verifizierte) Releases auf GitHub', dimension: 'governance', amount: 1, sourceUrl: 'https://github.com/Chocobozzz/PeerTube/releases' },
    { id: 'active-release-cadence', text: 'Active release cadence through early 2026 (v8.0.0, v8.0.1, v8.0.2)', textDe: 'Aktiver Release-Zyklus bis Anfang 2026 (v8.0.0, v8.0.1, v8.0.2)', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/Chocobozzz/PeerTube/releases' },
    { id: 'self-hostable', text: 'Fully self-hostable video platform', textDe: 'Vollständig selbst hostbare Videoplattform', dimension: 'contract', amount: 2, sourceUrl: 'https://docs.joinpeertube.org/admin/privacy-guide' },
    { id: 'data-export-available', text: 'Account export/import functionality available', textDe: 'Konto-Export-/Import-Funktionalität verfügbar', dimension: 'contract', amount: 1, sourceUrl: 'https://docs.joinpeertube.org/use/setup-account' },
    { id: 'open-standards-no-lock-in', text: 'Uses ActivityPub open federation standard', textDe: 'Nutzt offenen ActivityPub-Föderationsstandard', dimension: 'contract', amount: 1, sourceUrl: 'https://joinpeertube.org/en/faq/' },
  ],
  'pixelfed': [
    { id: 'responsible-disclosure-process', text: 'Documented vulnerability reporting channel (SECURITY.md)', textDe: 'Dokumentierter Schwachstellenmeldekanal (SECURITY.md)', dimension: 'security', amount: 1, sourceUrl: 'https://raw.githubusercontent.com/pixelfed/pixelfed/dev/SECURITY.md' },
    { id: 'active-release-cadence', text: 'Active release cadence (v0.12.5, v0.12.6 in 2025)', textDe: 'Aktiver Release-Zyklus (v0.12.5, v0.12.6 in 2025)', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/pixelfed/pixelfed/releases/tag/v0.12.6' },
    { id: 'self-hostable', text: 'Fully self-hostable federated image sharing platform', textDe: 'Vollständig selbst hostbare föderierte Bildplattform', dimension: 'contract', amount: 2, sourceUrl: 'https://github.com/pixelfed/pixelfed' },
    { id: 'data-export-available', text: 'Archive export and account deletion documented in privacy policy', textDe: 'Archiv-Export und Kontolöschung in Datenschutzrichtlinie dokumentiert', dimension: 'contract', amount: 1, sourceUrl: 'https://pixelfed.social/site/privacy' },
    { id: 'open-standards-no-lock-in', text: 'Uses ActivityPub open federation standard', textDe: 'Nutzt offenen ActivityPub-Föderationsstandard', dimension: 'contract', amount: 1, sourceUrl: 'https://pixelfed.social/site/privacy' },
  ],
  'plausible': [
    { id: 'responsible-disclosure-process', text: 'Published vulnerability disclosure program with safe harbor', textDe: 'Veröffentlichtes Schwachstellen-Meldeprogramm mit Safe Harbor', dimension: 'security', amount: 1, sourceUrl: 'https://github.com/plausible/analytics/blob/master/SECURITY.md' },
    { id: 'data-minimization-verified', text: 'Privacy-by-design: no cookies, daily rotating hashes, no raw IP storage', textDe: 'Privacy-by-Design: keine Cookies, täglich rotierende Hashes, keine Roh-IP-Speicherung', dimension: 'security', amount: 2, sourceUrl: 'https://plausible.io/privacy' },
    { id: 'transparent-ownership', text: 'Clear EU legal entity (Plausible Insights OÜ, Estonia)', textDe: 'Klare EU-Rechtsform (Plausible Insights OÜ, Estland)', dimension: 'governance', amount: 1, sourceUrl: 'https://plausible.io/terms' },
    { id: 'gdpr-dpa-documented', text: 'GDPR/DPA compliance documented with EU data residency positioning', textDe: 'DSGVO-/AVV-Konformität dokumentiert mit EU-Datenresidenz-Positionierung', dimension: 'governance', amount: 1, sourceUrl: 'https://plausible.io/dpa' },
    { id: 'public-status-page', text: 'Public service status page with incident history', textDe: 'Öffentliche Service-Statusseite mit Vorfallhistorie', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.plausible.io/' },
    { id: 'active-release-cadence', text: 'Active maintenance with updates multiple times per week', textDe: 'Aktive Pflege mit Updates mehrmals pro Woche', dimension: 'reliability', amount: 1, sourceUrl: 'https://plausible.io/security' },
    { id: 'self-hostable', text: 'Self-hostable Community Edition available', textDe: 'Selbst hostbare Community Edition verfügbar', dimension: 'contract', amount: 2, sourceUrl: 'https://plausible.io/blog/plausible-community-edition' },
    { id: 'data-export-available', text: 'Data export via CSV and Stats API', textDe: 'Datenexport über CSV und Stats-API', dimension: 'contract', amount: 1, sourceUrl: 'https://plausible.io/security' },
    { id: 'eu-data-residency', text: 'EU data residency with Hetzner (Germany) infrastructure', textDe: 'EU-Datenresidenz mit Hetzner-Infrastruktur (Deutschland)', dimension: 'contract', amount: 1, sourceUrl: 'https://plausible.io/security' },
    { id: 'fair-cancellation-terms', text: 'Simple no-questions-asked cancellation documented', textDe: 'Einfache Kündigung ohne Rückfragen dokumentiert', dimension: 'contract', amount: 1, sourceUrl: 'https://plausible.io/terms' },
  ],
  'posteo': [
    { id: 'recurring-security-audits', text: 'BSI TR-03108 transport security certification (BSI-K-TR-0745-2025)', textDe: 'BSI-TR-03108-Transportsicherheitszertifizierung (BSI-K-TR-0745-2025)', dimension: 'security', amount: 3, sourceUrl: 'https://www.techradar.com/reviews/posteo' },
    { id: 'data-minimization-verified', text: 'Privacy-first service posture with minimal data collection and no advertising partners', textDe: 'Privacy-First-Dienst mit minimaler Datenerhebung und ohne Werbepartner', dimension: 'security', amount: 2, sourceUrl: 'https://www.techradar.com/reviews/posteo' },
    { id: 'transparent-ownership', text: 'Long-running independent Berlin operator (Posteo e.K.)', textDe: 'Langjähriger unabhängiger Berliner Betreiber (Posteo e.K.)', dimension: 'governance', amount: 1, sourceUrl: 'https://www.techradar.com/reviews/posteo' },
    { id: 'public-transparency-report', text: 'Publishes recurring transparency reports on authority requests', textDe: 'Veröffentlicht regelmässige Transparenzberichte zu Behördenanfragen', dimension: 'governance', amount: 1, sourceUrl: 'https://www.golem.de/news/transparenzbericht-posteo-weist-61-prozent-der-behoerdenanfragen-zurueck-2504-195561.html' },
    { id: 'gdpr-dpa-documented', text: 'German jurisdiction with documented data storage exclusively in Germany', textDe: 'Deutsche Rechtsordnung mit dokumentierter Datenspeicherung ausschliesslich in Deutschland', dimension: 'governance', amount: 1, sourceUrl: 'https://www.techradar.com/reviews/posteo' },
    { id: 'partial-open-source', text: 'Publishes security-relevant components (Krypto-Mailspeicher Dovecot plugin)', textDe: 'Veröffentlicht sicherheitsrelevante Komponenten (Krypto-Mailspeicher-Dovecot-Plugin)', dimension: 'governance', amount: 1, sourceUrl: 'https://www.techradar.com/reviews/posteo' },
    { id: 'active-release-cadence', text: 'Ongoing product updates (spam folder 2023, storage doubling 2026)', textDe: 'Fortlaufende Produktupdates (Spam-Ordner 2023, Speicherverdoppelung 2026)', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.techradar.com/reviews/posteo' },
    { id: 'open-standards-no-lock-in', text: 'Standards-based portability via IMAP/SMTP, CalDAV/CardDAV', textDe: 'Standardbasierte Portabilität via IMAP/SMTP, CalDAV/CardDAV', dimension: 'contract', amount: 1, sourceUrl: 'https://www.techradar.com/reviews/posteo' },
    { id: 'fair-cancellation-terms', text: 'Monthly cancellation with proportional refund reported', textDe: 'Monatliche Kündigung mit anteiliger Erstattung dokumentiert', dimension: 'contract', amount: 1, sourceUrl: 'https://www.techradar.com/reviews/posteo' },
    { id: 'eu-data-residency', text: 'Data stored exclusively in Germany', textDe: 'Daten ausschliesslich in Deutschland gespeichert', dimension: 'contract', amount: 1, sourceUrl: 'https://www.techradar.com/reviews/posteo' },
  ],
  'prestashop': [
    { id: 'responsible-disclosure-process', text: 'Security charter with clear SLAs (ack 7 days, fix plan 30 days, CVE publication)', textDe: 'Sicherheits-Charta mit klaren SLAs (Bestätigung 7 Tage, Fix-Plan 30 Tage, CVE-Veröffentlichung)', dimension: 'security', amount: 1, sourceUrl: 'https://prestashop.com/security-charter/' },
    { id: 'transparent-ownership', text: 'Clear legal entity disclosure (PrestaShop S.A., France)', textDe: 'Klare Rechtsform-Offenlegung (PrestaShop S.A., Frankreich)', dimension: 'governance', amount: 1, sourceUrl: 'https://prestashop.com/' },
    { id: 'active-release-cadence', text: 'Active release cadence with same-day security patches (8.2.4 and 9.0.3 on Feb 3, 2026)', textDe: 'Aktiver Release-Zyklus mit Same-Day-Sicherheitspatches (8.2.4 und 9.0.3 am 3. Feb. 2026)', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/PrestaShop/PrestaShop/releases/tag/9.0.3' },
    { id: 'self-hostable', text: 'Fully self-hostable e-commerce platform', textDe: 'Vollständig selbst hostbare E-Commerce-Plattform', dimension: 'contract', amount: 2, sourceUrl: 'https://github.com/PrestaShop/PrestaShop' },
    { id: 'open-standards-no-lock-in', text: 'Self-hosted architecture with code/DB under operator control', textDe: 'Self-Hosted-Architektur mit Code/DB unter Betreiberkontrolle', dimension: 'contract', amount: 1, sourceUrl: 'https://github.com/PrestaShop/PrestaShop' },
  ],
  'proton-mail': [
    { id: 'iso-27001-certified', text: 'ISO 27001 certification obtained May 2024', textDe: 'ISO-27001-Zertifizierung erhalten Mai 2024', dimension: 'security', amount: 2, sourceUrl: 'https://proton.me/blog/iso-27001' },
    { id: 'soc2-type2-attested', text: 'SOC 2 Type II audit completed (auditor: Schellman)', textDe: 'SOC-2-Typ-II-Audit abgeschlossen (Auditor: Schellman)', dimension: 'security', amount: 2, sourceUrl: 'https://proton.me/security/response-center' },
    { id: 'e2e-encryption-default', text: 'End-to-end encryption by default for Proton-to-Proton email', textDe: 'Ende-zu-Ende-Verschlüsselung standardmässig für Proton-zu-Proton-E-Mail', dimension: 'security', amount: 2, sourceUrl: 'https://proton.me/security/response-center' },
    { id: 'zero-knowledge-architecture', text: 'Zero-access encryption — Proton cannot read encrypted content', textDe: 'Zero-Access-Verschlüsselung — Proton kann verschlüsselte Inhalte nicht lesen', dimension: 'security', amount: 2, sourceUrl: 'https://proton.me/security/response-center' },
    { id: 'responsible-disclosure-process', text: 'Published security response center with disclosure process', textDe: 'Veröffentlichtes Security Response Center mit Meldeprozess', dimension: 'security', amount: 1, sourceUrl: 'https://proton.me/security/response-center' },
    { id: 'partial-open-source', text: 'Open-source clients (GPLv3) for web, Android, and Bridge', textDe: 'Open-Source-Clients (GPLv3) für Web, Android und Bridge', dimension: 'governance', amount: 1, sourceUrl: 'https://github.com/ProtonMail' },
    { id: 'public-transparency-report', text: 'Publishes annual transparency report on legal orders', textDe: 'Veröffentlicht jährlichen Transparenzbericht zu Rechtsanordnungen', dimension: 'governance', amount: 1, sourceUrl: 'https://proton.me/legal/transparency' },
    { id: 'foundation-or-nonprofit', text: 'Proton Foundation as controlling nonprofit shareholder', textDe: 'Proton Foundation als kontrollierende gemeinnützige Anteilseignerin', dimension: 'governance', amount: 1, sourceUrl: 'https://proton.me/foundation' },
    { id: 'transparent-ownership', text: 'Clear Swiss legal entity with public governance structure', textDe: 'Klare Schweizer Rechtsform mit öffentlicher Governance-Struktur', dimension: 'governance', amount: 1, sourceUrl: 'https://proton.me/foundation' },
    { id: 'public-status-page', text: 'Public service status page with incident history', textDe: 'Öffentliche Service-Statusseite mit Vorfallhistorie', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.proton.me' },
    { id: 'active-release-cadence', text: 'Active release cadence across multiple client repositories', textDe: 'Aktiver Release-Zyklus über mehrere Client-Repositories', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/ProtonMail/proton-bridge/releases' },
    { id: 'data-export-available', text: 'Data export via Bridge (IMAP/SMTP standard protocols)', textDe: 'Datenexport über Bridge (IMAP-/SMTP-Standardprotokolle)', dimension: 'contract', amount: 1, sourceUrl: 'https://proton.me/support/bridge' },
    { id: 'open-standards-no-lock-in', text: 'Bridge provides local IMAP/SMTP for standard client compatibility', textDe: 'Bridge bietet lokales IMAP/SMTP für Standard-Client-Kompatibilität', dimension: 'contract', amount: 1, sourceUrl: 'https://proton.me/support/imap-smtp-and-pop3-setup' },
  ],
  'proton-vpn': [
    { id: 'iso-27001-certified', text: 'ISO 27001 certification for Proton AG', textDe: 'ISO-27001-Zertifizierung für Proton AG', dimension: 'security', amount: 2, sourceUrl: 'https://protonvpn.com/trust-center' },
    { id: 'soc2-type2-attested', text: 'SOC 2 Type II audit completed (auditor: Schellman)', textDe: 'SOC-2-Typ-II-Audit abgeschlossen (Auditor: Schellman)', dimension: 'security', amount: 2, sourceUrl: 'https://protonvpn.com/trust-center' },
    { id: 'recurring-security-audits', text: 'Recurring annual no-logs audits by Securitum (2022-2025 series)', textDe: 'Wiederkehrende jährliche No-Logs-Audits durch Securitum (Serie 2022-2025)', dimension: 'security', amount: 3, sourceUrl: 'https://protonvpn.com/blog/no-logs-audit/' },
    { id: 'independent-security-audit', text: 'Independent client security audit by SEC Consult', textDe: 'Unabhängiges Client-Sicherheitsaudit durch SEC Consult', dimension: 'security', amount: 2, sourceUrl: 'https://protonvpn.com/features/no-logs-policy' },
    { id: 'partial-open-source', text: 'Open-source clients (GPL-3.0) across all major platforms', textDe: 'Open-Source-Clients (GPL-3.0) auf allen grossen Plattformen', dimension: 'governance', amount: 1, sourceUrl: 'https://github.com/ProtonVPN' },
    { id: 'public-transparency-report', text: 'Transparency report and VPN-specific warrant canary', textDe: 'Transparenzbericht und VPN-spezifischer Warrant Canary', dimension: 'governance', amount: 1, sourceUrl: 'https://proton.me/legal/transparency' },
    { id: 'foundation-or-nonprofit', text: 'Proton Foundation as controlling nonprofit shareholder', textDe: 'Proton Foundation als kontrollierende gemeinnützige Anteilseignerin', dimension: 'governance', amount: 1, sourceUrl: 'https://proton.me/foundation' },
    { id: 'transparent-ownership', text: 'Clear Swiss legal entity with documented governance structure', textDe: 'Klare Schweizer Rechtsform mit dokumentierter Governance-Struktur', dimension: 'governance', amount: 1, sourceUrl: 'https://proton.me/legal/terms' },
    { id: 'public-status-page', text: 'Public service status page with incident history', textDe: 'Öffentliche Service-Statusseite mit Vorfallhistorie', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.proton.me' },
    { id: 'active-release-cadence', text: 'Active release cadence with client updates through Feb 2026', textDe: 'Aktiver Release-Zyklus mit Client-Updates bis Feb. 2026', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/ProtonVPN' },
    { id: 'open-standards-no-lock-in', text: 'Standard VPN protocols (WireGuard/OpenVPN) for manual configuration', textDe: 'Standard-VPN-Protokolle (WireGuard/OpenVPN) für manuelle Konfiguration', dimension: 'contract', amount: 1, sourceUrl: 'https://protonvpn.com/support/vpn-config-download' },
  ],

  'qwant': [
    { id: 'public-bug-bounty', text: 'Public bug bounty via YesWeHack', textDe: 'Öffentliches Bug-Bounty über YesWeHack', dimension: 'security', amount: 1, sourceUrl: 'https://yeswehack.com/programs/qwant' },
    { id: 'responsible-disclosure-process', text: 'Published security.txt disclosure path', textDe: 'Veröffentlichter security.txt-Meldepfad', dimension: 'security', amount: 1, sourceUrl: 'https://www.qwant.com/.well-known/security.txt' },
    { id: 'transparent-ownership', text: 'Legal entity, address, and representative publicly disclosed', textDe: 'Rechtsform, Adresse und Vertretung öffentlich offengelegt', dimension: 'governance', amount: 1, sourceUrl: 'https://about.qwant.com/en/legal/mentions-legales/' },
    { id: 'gdpr-dpa-documented', text: 'GDPR compliance and data rights documented', textDe: 'DSGVO-Konformität und Datenrechte dokumentiert', dimension: 'governance', amount: 1, sourceUrl: 'https://about.qwant.com/en/legal/confidentialite/' },
    { id: 'data-export-available', text: 'Data portability rights documented in privacy policy', textDe: 'Datenportabilitätsrechte in Datenschutzrichtlinie dokumentiert', dimension: 'contract', amount: 1, sourceUrl: 'https://about.qwant.com/en/legal/confidentialite/' },
    { id: 'eu-data-residency', text: 'French-headquartered EU operator', textDe: 'EU-Betreiber mit Hauptsitz in Frankreich', dimension: 'contract', amount: 1, sourceUrl: 'https://about.qwant.com/en/legal/mentions-legales/' },
  ],
  'raspberry-pi-self-hosting': [
    { id: 'responsible-disclosure-process', text: 'Published security contact and disclosure path', textDe: 'Veröffentlichter Sicherheitskontakt und Meldepfad', dimension: 'security', amount: 1, sourceUrl: 'https://www.raspberrypi.com/contact/security/' },
    { id: 'partial-open-source', text: 'Open-source software and tooling with proprietary boot firmware', textDe: 'Open-Source-Software und -Tooling mit proprietärer Boot-Firmware', dimension: 'governance', amount: 1, sourceUrl: 'https://github.com/raspberrypi/firmware' },
    { id: 'transparent-ownership', text: 'Publicly listed company with transparent governance disclosures', textDe: 'Börsennotiertes Unternehmen mit transparenter Governance-Offenlegung', dimension: 'governance', amount: 1, sourceUrl: 'https://www.investegate.co.uk/announcement/rns/raspberry-pi-holdings--rpi/final-results/8818052' },
    { id: 'active-release-cadence', text: 'Active maintenance across core tooling and documentation', textDe: 'Aktive Pflege über Kern-Tooling und Dokumentation', dimension: 'reliability', amount: 1, sourceUrl: 'https://pip.raspberrypi.com/categories/1004-cyber-security' },
    { id: 'self-hostable', text: 'Core purpose is self-hosting with full local control', textDe: 'Kernzweck ist Self-Hosting mit vollständiger lokaler Kontrolle', dimension: 'contract', amount: 2, sourceUrl: 'https://www.raspberrypi.com/documentation/services/connect.html' },
    { id: 'open-standards-no-lock-in', text: 'Low hardware lock-in with practical off-ramps', textDe: 'Geringer Hardware-Lock-in mit praktischen Ausstiegsoptionen', dimension: 'contract', amount: 1, sourceUrl: 'https://www.raspberrypi.com/documentation/services/connect.html' },
    { id: 'data-export-available', text: 'Strong data portability in self-hosting posture', textDe: 'Starke Datenportabilität im Self-Hosting-Betrieb', dimension: 'contract', amount: 1, sourceUrl: 'https://www.raspberrypi.com/documentation/services/connect.html' },
  ],
  'scaleway': [
    { id: 'iso-27001-certified', text: 'ISO/IEC 27001 certified with HDS coverage', textDe: 'ISO/IEC-27001-zertifiziert mit HDS-Abdeckung', dimension: 'security', amount: 2, sourceUrl: 'https://www.scaleway.com/en/security-and-resilience/' },
    { id: 'transparent-ownership', text: 'Clear EU operator profile associated with Iliad group', textDe: 'Klares EU-Betreiberprofil in Verbindung mit der Iliad-Gruppe', dimension: 'governance', amount: 1, sourceUrl: 'https://www.scaleway.com/en/about-us/' },
    { id: 'gdpr-dpa-documented', text: 'EU compliance posture with documented data privacy statements', textDe: 'EU-Compliance-Positionierung mit dokumentierten Datenschutzerklärungen', dimension: 'governance', amount: 1, sourceUrl: 'https://www.scaleway.com/en/docs/managed-inference/reference-content/data-privacy-security-scaleway-ai-services/' },
    { id: 'public-status-page', text: 'Public service status page with incident history', textDe: 'Öffentliche Service-Statusseite mit Vorfallhistorie', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.scaleway.com/' },
    { id: 'data-export-available', text: 'Snapshot import/export and API tooling for data portability', textDe: 'Snapshot-Import/-Export und API-Tooling für Datenportabilität', dimension: 'contract', amount: 1, sourceUrl: 'https://www.scaleway.com/en/docs/instances/api-cli/snapshot-import-export-feature/' },
    { id: 'eu-data-residency', text: 'French-headquartered cloud provider with EU data centers', textDe: 'Französischer Cloud-Anbieter mit EU-Rechenzentren', dimension: 'contract', amount: 1, sourceUrl: 'https://www.scaleway.com/en/about-us/' },
  ],
  'simple-analytics': [
    { id: 'data-minimization-verified', text: 'No cookies, no IP collection, verified minimal data collection', textDe: 'Keine Cookies, keine IP-Erfassung, verifizierte minimale Datenerhebung', dimension: 'security', amount: 2, sourceUrl: 'https://docs.simpleanalytics.com/what-we-collect' },
    { id: 'transparent-ownership', text: 'Open startup metrics and clear company transparency pages', textDe: 'Offene Startup-Metriken und klare Unternehmenstransparenz-Seiten', dimension: 'governance', amount: 1, sourceUrl: 'https://dashboard.simpleanalytics.com/open' },
    { id: 'gdpr-dpa-documented', text: 'GDPR compliance documented', textDe: 'DSGVO-Konformität dokumentiert', dimension: 'governance', amount: 1, sourceUrl: 'https://docs.simpleanalytics.com/compliance' },
    { id: 'public-status-page', text: 'Public status page with root-cause incident notes', textDe: 'Öffentliche Statusseite mit Ursachenanalyse bei Vorfällen', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.simpleanalytics.com' },
    { id: 'data-export-available', text: 'Documented data export paths with ownership framing', textDe: 'Dokumentierte Datenexportpfade mit Eigentumsrahmen', dimension: 'contract', amount: 1, sourceUrl: 'https://docs.simpleanalytics.com/export-data' },
    { id: 'fair-cancellation-terms', text: 'Explicit cancel and delete account documentation', textDe: 'Explizite Kündigungs- und Kontolöschungsdokumentation', dimension: 'contract', amount: 1, sourceUrl: 'https://docs.simpleanalytics.com/cancel-account' },
    { id: 'eu-data-residency', text: 'Netherlands-based EU data processing', textDe: 'EU-Datenverarbeitung mit Sitz in den Niederlanden', dimension: 'contract', amount: 1, sourceUrl: 'https://docs.simpleanalytics.com/data-security-and-ownership' },
  ],
  'startmail': [
    { id: 'responsible-disclosure-process', text: 'Signed security.txt with disclosure process', textDe: 'Signierte security.txt mit Meldeprozess', dimension: 'security', amount: 1, sourceUrl: 'https://www.startmail.com/.well-known/security.txt' },
    { id: 'transparent-ownership', text: 'Clear Dutch legal entity and jurisdiction', textDe: 'Klare niederländische Rechtsform und Jurisdiktion', dimension: 'governance', amount: 1, sourceUrl: 'https://www.startmail.com/terms-of-service' },
    { id: 'public-transparency-report', text: 'Public transparency reporting', textDe: 'Öffentliche Transparenzberichterstattung', dimension: 'governance', amount: 1, sourceUrl: 'https://www.startmail.com/transparency' },
    { id: 'gdpr-dpa-documented', text: 'GDPR compliance under Dutch jurisdiction', textDe: 'DSGVO-Konformität unter niederländischer Jurisdiktion', dimension: 'governance', amount: 1, sourceUrl: 'https://www.startmail.com/privacy' },
    { id: 'public-status-page', text: 'Public service status page', textDe: 'Öffentliche Service-Statusseite', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.startmail.com' },
    { id: 'active-release-cadence', text: 'Active maintenance with published release notes', textDe: 'Aktive Pflege mit veröffentlichten Release-Notes', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.startmail.com/category/release-notes' },
    { id: 'data-export-available', text: 'IMAP data extraction supported', textDe: 'IMAP-Datenextraktion unterstützt', dimension: 'contract', amount: 1, sourceUrl: 'https://www.startmail.com/whitepaper' },
    { id: 'eu-data-residency', text: 'Netherlands-based EU email service', textDe: 'EU-E-Mail-Dienst mit Sitz in den Niederlanden', dimension: 'contract', amount: 1, sourceUrl: 'https://www.startmail.com/privacy' },
  ],
  'threema': [
    { id: 'recurring-security-audits', text: 'Recurring external security audits (2019, 2020, 2024)', textDe: 'Wiederkehrende externe Sicherheitsaudits (2019, 2020, 2024)', dimension: 'security', amount: 3, sourceUrl: 'https://threema.com/en/faq/code-audit' },
    { id: 'e2e-encryption-default', text: 'End-to-end encryption by default for all messages', textDe: 'Ende-zu-Ende-Verschlüsselung standardmässig für alle Nachrichten', dimension: 'security', amount: 2, sourceUrl: 'https://threema.com/en/faq/code-audit' },
    { id: 'public-bug-bounty', text: 'Public bug bounty and CVD intake path', textDe: 'Öffentliches Bug-Bounty und CVD-Meldepfad', dimension: 'security', amount: 1, sourceUrl: 'https://threema.com/en/faq/code-audit' },
    { id: 'responsible-disclosure-process', text: 'Coordinated vulnerability disclosure process', textDe: 'Koordinierter Schwachstellen-Meldeprozess', dimension: 'security', amount: 1, sourceUrl: 'https://threema.com/en/faq/code-audit' },
    { id: 'partial-open-source', text: 'Client apps are open source (AGPL-3.0), server is proprietary', textDe: 'Client-Apps sind quelloffen (AGPL-3.0), Server ist proprietär', dimension: 'governance', amount: 1, sourceUrl: 'https://threema.com/en/why-threema/open-source' },
    { id: 'transparent-ownership', text: 'Explicit ownership disclosures and legal/jurisdiction framing', textDe: 'Explizite Eigentümeroffenlegung und rechtlicher/jurisdiktionaler Rahmen', dimension: 'governance', amount: 1, sourceUrl: 'https://threema.com/en/faq/ownership' },
    { id: 'active-release-cadence', text: 'Active product operation with published changelog', textDe: 'Aktiver Produktbetrieb mit veröffentlichtem Changelog', dimension: 'reliability', amount: 1, sourceUrl: 'https://threema.com/en/changelog' },
  ],
  'thunderbird': [
    { id: 'public-bug-bounty', text: 'Mozilla-wide bug bounty program', textDe: 'Mozilla-weites Bug-Bounty-Programm', dimension: 'security', amount: 1, sourceUrl: 'https://www.mozilla.org/en-US/security/bug-bounty/' },
    { id: 'responsible-disclosure-process', text: 'Mature vulnerability disclosure and patch posture', textDe: 'Ausgereifter Schwachstellen-Meldeprozess und Patch-Praxis', dimension: 'security', amount: 1, sourceUrl: 'https://www.mozilla.org/en-US/security/bug-bounty/' },
    { id: 'transparent-ownership', text: 'Clear MZLA/Mozilla ownership and governance path', textDe: 'Klare MZLA-/Mozilla-Eigentümerschaft und Governance-Struktur', dimension: 'governance', amount: 1, sourceUrl: 'https://github.com/thunderbird' },
    { id: 'foundation-or-nonprofit', text: 'Operated under Mozilla Foundation umbrella', textDe: 'Betrieben unter dem Dach der Mozilla Foundation', dimension: 'governance', amount: 1, sourceUrl: 'https://github.com/thunderbird' },
    { id: 'active-release-cadence', text: 'Active release cadence with ESR and stable channels', textDe: 'Aktiver Release-Zyklus mit ESR- und Stable-Kanälen', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.thunderbird.net/en-US/thunderbird/releases/' },
    { id: 'open-standards-no-lock-in', text: 'Open protocols (IMAP, SMTP, CalDAV) prevent lock-in', textDe: 'Offene Protokolle (IMAP, SMTP, CalDAV) verhindern Lock-in', dimension: 'contract', amount: 1, sourceUrl: 'https://www.thunderbird.net/en-US/privacy/' },
    { id: 'data-export-available', text: 'Local-first architecture with standard protocol data access', textDe: 'Local-First-Architektur mit Standard-Protokoll-Datenzugang', dimension: 'contract', amount: 1, sourceUrl: 'https://www.thunderbird.net/en-US/privacy/' },
  ],
  'tor-browser': [
    { id: 'public-bug-bounty', text: 'Public bug bounty via HackerOne', textDe: 'Öffentliches Bug-Bounty über HackerOne', dimension: 'security', amount: 1, sourceUrl: 'https://hackerone.com/torproject' },
    { id: 'responsible-disclosure-process', text: 'Active vulnerability handling and rapid CVE response', textDe: 'Aktive Schwachstellenbearbeitung und schnelle CVE-Reaktion', dimension: 'security', amount: 1, sourceUrl: 'https://hackerone.com/torproject' },
    { id: 'data-minimization-verified', text: 'No telemetry, no accounts, privacy-by-design posture', textDe: 'Keine Telemetrie, keine Konten, Privacy-by-Design-Positionierung', dimension: 'security', amount: 2, sourceUrl: 'https://www.torproject.org/about/privacy_policy/' },
    { id: 'foundation-or-nonprofit', text: 'Operated by The Tor Project nonprofit', textDe: 'Betrieben von der gemeinnützigen Tor-Project-Organisation', dimension: 'governance', amount: 1, sourceUrl: 'https://www.torproject.org/about/reports/' },
    { id: 'transparent-ownership', text: 'Nonprofit transparency with public IRS artifacts', textDe: 'Gemeinnützige Transparenz mit öffentlichen IRS-Dokumenten', dimension: 'governance', amount: 1, sourceUrl: 'https://www.torproject.org/about/reports/' },
    { id: 'public-transparency-report', text: 'Public financial and organizational reports', textDe: 'Öffentliche Finanz- und Organisationsberichte', dimension: 'governance', amount: 1, sourceUrl: 'https://www.torproject.org/about/reports/' },
    { id: 'signed-releases', text: 'Cryptographically signed releases with verification guide', textDe: 'Kryptografisch signierte Releases mit Verifizierungsanleitung', dimension: 'governance', amount: 1, sourceUrl: 'https://support.torproject.org/tbb/how-to-verify-signature/' },
    { id: 'public-status-page', text: 'Public operational status page', textDe: 'Öffentliche Betriebs-Statusseite', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.torproject.org/' },
    { id: 'active-release-cadence', text: 'Active release cadence tracking Firefox ESR', textDe: 'Aktiver Release-Zyklus im Einklang mit Firefox ESR', dimension: 'reliability', amount: 1, sourceUrl: 'https://blog.torproject.org/new-release-tor-browser-1357/' },
    { id: 'open-standards-no-lock-in', text: 'Free software with no account requirement and low lock-in', textDe: 'Freie Software ohne Kontozwang und geringem Lock-in', dimension: 'contract', amount: 1, sourceUrl: 'https://www.torproject.org/about/privacy_policy/' },
  ],
  'tresorit': [
    { id: 'iso-27001-certified', text: 'ISO/IEC 27001 certified via Microsoft 365 App Certification', textDe: 'ISO/IEC-27001-zertifiziert über Microsoft 365 App-Zertifizierung', dimension: 'security', amount: 2, sourceUrl: 'https://appsource.microsoft.com/en-us/product/office/wa200005095' },
    { id: 'e2e-encryption-default', text: 'End-to-end encryption for all stored files', textDe: 'Ende-zu-Ende-Verschlüsselung für alle gespeicherten Dateien', dimension: 'security', amount: 2, sourceUrl: 'https://tresorit.com/legal/terms-of-use' },
    { id: 'zero-knowledge-architecture', text: 'Client-side encryption with zero-knowledge file content model', textDe: 'Clientseitige Verschlüsselung mit Zero-Knowledge-Dateiinhaltsmodell', dimension: 'security', amount: 2, sourceUrl: 'https://tresorit.com/legal/terms-of-use' },
    { id: 'transparent-ownership', text: 'Swiss Post majority ownership with clear governance structure', textDe: 'Schweizerische Post als Mehrheitseigentümerin mit klarer Governance-Struktur', dimension: 'governance', amount: 1, sourceUrl: 'https://group.swisspost.ch/en/media/press-releases/2021/swiss-post-acquires-majority-stake-in-tresorit' },
    { id: 'public-status-page', text: 'Public service status page with incident history', textDe: 'Öffentliche Service-Statusseite mit Vorfallhistorie', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.tresorit.com/history' },
    { id: 'data-export-available', text: 'Customer retains ownership of files with export rights', textDe: 'Kunde behält Eigentum an Dateien mit Exportrechten', dimension: 'contract', amount: 1, sourceUrl: 'https://tresorit.com/legal/terms-of-use' },
  ],
  'tuta': [
    { id: 'e2e-encryption-default', text: 'End-to-end encryption by default for Tuta-to-Tuta email', textDe: 'Ende-zu-Ende-Verschlüsselung standardmässig für Tuta-zu-Tuta-E-Mail', dimension: 'security', amount: 2, sourceUrl: 'https://tuta.com/security' },
    { id: 'partial-open-source', text: 'Client apps are open source, backend is closed', textDe: 'Client-Apps sind quelloffen, Backend ist geschlossen', dimension: 'governance', amount: 1, sourceUrl: 'https://tuta.com/open-source' },
    { id: 'transparent-ownership', text: 'Named legal entity with founder ownership disclosed', textDe: 'Namentlich genannte Rechtsform mit offengelegter Gründer-Eigentümerschaft', dimension: 'governance', amount: 1, sourceUrl: 'https://tuta.com/security' },
    { id: 'public-transparency-report', text: 'Regular transparency report with request/disclosure counts', textDe: 'Regelmässiger Transparenzbericht mit Anfrage-/Offenlegungszahlen', dimension: 'governance', amount: 1, sourceUrl: 'https://tuta.com/blog/transparency-report' },
    { id: 'active-release-cadence', text: 'High release frequency with active GitHub maintenance', textDe: 'Hohe Release-Frequenz mit aktiver GitHub-Pflege', dimension: 'reliability', amount: 1, sourceUrl: 'https://tuta.com/open-source' },
    { id: 'data-export-available', text: 'Email export available as .eml/.msg from desktop client', textDe: 'E-Mail-Export als .eml/.msg vom Desktop-Client verfügbar', dimension: 'contract', amount: 1, sourceUrl: 'https://tuta.com/security' },
    { id: 'eu-data-residency', text: 'German-hosted data storage in EU', textDe: 'In Deutschland gehostete Datenspeicherung in der EU', dimension: 'contract', amount: 1, sourceUrl: 'https://tuta.com/security' },
  ],
  'ungoogled-chromium': [
    { id: 'data-minimization-verified', text: 'All Google tracking and telemetry stripped by design', textDe: 'Sämtliches Google-Tracking und -Telemetrie konstruktionsbedingt entfernt', dimension: 'security', amount: 2, sourceUrl: 'https://raw.githubusercontent.com/ungoogled-software/ungoogled-chromium/master/docs/design.md' },
    { id: 'active-release-cadence', text: 'Releases track current Chromium stable lines', textDe: 'Releases folgen aktuellen Chromium-Stable-Versionen', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/ungoogled-software/ungoogled-chromium/releases' },
    { id: 'open-standards-no-lock-in', text: 'Standard browser profile format with no subscription lock-in', textDe: 'Standard-Browserprofilformat ohne Abo-Lock-in', dimension: 'contract', amount: 1, sourceUrl: 'https://github.com/ungoogled-software/ungoogled-chromium' },
    { id: 'data-export-available', text: 'Direct portability of user data and browser profile', textDe: 'Direkte Portabilität von Nutzerdaten und Browserprofil', dimension: 'contract', amount: 1, sourceUrl: 'https://github.com/ungoogled-software/ungoogled-chromium' },
  ],
  'vikunja': [
    { id: 'responsible-disclosure-process', text: 'Public security policy with PGP key for responsible disclosure', textDe: 'Öffentliche Sicherheitsrichtlinie mit PGP-Schlüssel für Responsible Disclosure', dimension: 'security', amount: 1, sourceUrl: 'https://vikunja.io/security/' },
    { id: 'transparent-ownership', text: 'Named legal entity with clear imprint for both domains', textDe: 'Namentlich genannte Rechtsform mit klarem Impressum für beide Domains', dimension: 'governance', amount: 1, sourceUrl: 'https://vikunja.io/imprint/' },
    { id: 'public-status-page', text: 'Public cloud service status page', textDe: 'Öffentliche Cloud-Service-Statusseite', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.vikunja.cloud/' },
    { id: 'active-release-cadence', text: 'Active release cadence with clear changelog communication', textDe: 'Aktiver Release-Zyklus mit klarer Changelog-Kommunikation', dimension: 'reliability', amount: 1, sourceUrl: 'https://vikunja.io/changelog/vikunja-v1.1.0-was-released/' },
    { id: 'self-hostable', text: 'Fully self-hostable with Docker and binary deployment', textDe: 'Vollständig selbst hostbar mit Docker- und Binary-Deployment', dimension: 'contract', amount: 2, sourceUrl: 'https://vikunja.io/features/' },
    { id: 'open-standards-no-lock-in', text: 'AGPL license with self-hosting prevents vendor lock-in', textDe: 'AGPL-Lizenz mit Self-Hosting verhindert Anbieter-Lock-in', dimension: 'contract', amount: 1, sourceUrl: 'https://github.com/go-vikunja/vikunja' },
  ],
  'vivaldi': [
    { id: 'responsible-disclosure-process', text: 'Documented security disclosure channel', textDe: 'Dokumentierter Sicherheitsmeldekanal', dimension: 'security', amount: 1, sourceUrl: 'https://vivaldi.com/privacy/browser/' },
    { id: 'partial-open-source', text: 'Chromium engine source available, UI layer proprietary', textDe: 'Chromium-Engine-Quellcode verfügbar, UI-Schicht proprietär', dimension: 'governance', amount: 1, sourceUrl: 'https://help.vivaldi.com/desktop/privacy/is-vivaldi-open-source/' },
    { id: 'transparent-ownership', text: 'Clear legal/operator identity and business model disclosure', textDe: 'Klare Betreiberidentität und Geschäftsmodell-Offenlegung', dimension: 'governance', amount: 1, sourceUrl: 'https://help.vivaldi.com/services/account/is-vivaldi-free/' },
    { id: 'active-release-cadence', text: 'Active release cadence with fast Chromium CVE backports', textDe: 'Aktiver Release-Zyklus mit schnellen Chromium-CVE-Backports', dimension: 'reliability', amount: 1, sourceUrl: 'https://vivaldi.com/blog/desktop/minor-update-8-four-security-fixes-updated-translations-and-a-fix-for-netflix-playback/' },
    { id: 'data-export-available', text: 'Browser data import/export in standard formats', textDe: 'Browserdaten-Import/-Export in Standardformaten', dimension: 'contract', amount: 1, sourceUrl: 'https://help.vivaldi.com/desktop/tools/import-and-export-browser-data/' },
    { id: 'fair-cancellation-terms', text: 'Browser is free with no subscription lock-in', textDe: 'Browser ist kostenlos ohne Abo-Lock-in', dimension: 'contract', amount: 1, sourceUrl: 'https://help.vivaldi.com/services/account/is-vivaldi-free/' },
  ],

};

/**
 * Positive signals for vetted US vendors.
 * Each entry is keyed by the US vendor ID and maps to an array of
 * evidence-backed positive signals derived from vetted trust-score worksheets.
 */
export const usVendorPositiveSignalsById: Record<string, PositiveSignal[]> = {

  // ── 1Password ──────────────────────────────────────────────────────────
  '1password': [
    { id: 'recurring-security-audits', text: 'Documented third-party security assessment practice', textDe: 'Dokumentierte Sicherheitsprüfungspraxis durch Dritte', dimension: 'security', amount: 3, sourceUrl: 'https://support.1password.com/security-assessments/' },
    { id: 'public-bug-bounty', text: 'Active HackerOne bug bounty program', textDe: 'Aktives HackerOne-Bug-Bounty-Programm', dimension: 'security', amount: 1, sourceUrl: 'https://hackerone.com/1password' },
    { id: 'responsible-disclosure-process', text: 'Clear vulnerability advisory flow', textDe: 'Klarer Schwachstellen-Advisory-Prozess', dimension: 'security', amount: 1, sourceUrl: 'https://support.1password.com/kb/202408/' },
    { id: 'zero-knowledge-architecture', text: 'Zero-knowledge encryption architecture for vault data', textDe: 'Zero-Knowledge-Verschlüsselungsarchitektur für Tresordaten', dimension: 'security', amount: 2, sourceUrl: 'https://support.1password.com/security-assessments/' },
    { id: 'transparent-ownership', text: 'Clear legal entity and ownership structure', textDe: 'Klare Rechtsform und Eigentümerstruktur', dimension: 'governance', amount: 1, sourceUrl: 'https://1password.com/legal/terms-of-service' },
    { id: 'gdpr-dpa-documented', text: 'Explicit customer data ownership and service-limited access rights', textDe: 'Explizites Kundendaten-Eigentum und dienstbeschränkte Zugriffsrechte', dimension: 'governance', amount: 1, sourceUrl: 'https://1password.com/legal/privacy' },
    { id: 'public-status-page', text: 'Public incident and status transparency', textDe: 'Öffentliche Vorfall- und Status-Transparenz', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.1password.com/history' },
    { id: 'active-release-cadence', text: 'Active release cadence across platforms', textDe: 'Aktiver Release-Zyklus über alle Plattformen', dimension: 'reliability', amount: 1, sourceUrl: 'https://releases.1password.com/mac/stable/' },
    { id: 'data-export-available', text: 'Explicit export path for vault data', textDe: 'Expliziter Exportpfad für Tresordaten', dimension: 'contract', amount: 1, sourceUrl: 'https://support.1password.com/export/' },
    { id: 'eu-data-residency', text: 'EU data residency option available', textDe: 'EU-Datenresidenz-Option verfügbar', dimension: 'contract', amount: 1, sourceUrl: 'https://support.1password.com/regions/' },
    { id: 'fair-cancellation-terms', text: 'Customer data remains under customer control per terms', textDe: 'Kundendaten verbleiben laut AGB unter Kundenkontrolle', dimension: 'contract', amount: 1, sourceUrl: 'https://1password.com/legal/terms-of-service' },
  ],

  // ── Amazon Alexa ───────────────────────────────────────────────────────
  'amazon-alexa': [
    { id: 'responsible-disclosure-process', text: 'Documented vulnerability-reporting channels', textDe: 'Dokumentierte Schwachstellen-Meldekanäle', dimension: 'security', amount: 1, sourceUrl: 'https://aws.amazon.com/security/vulnerability-reporting/' },
    { id: 'transparent-ownership', text: 'Clear public-company legal ownership and accountability', textDe: 'Klare börsennotierte Eigentümerschaft und Verantwortlichkeit', dimension: 'governance', amount: 1, sourceUrl: 'https://www.amazon.com' },
  ],

  // ── Amazon Shop ────────────────────────────────────────────────────────
  'amazon-shop': [
    { id: 'responsible-disclosure-process', text: 'Formal vulnerability-reporting channel', textDe: 'Formeller Schwachstellen-Meldekanal', dimension: 'security', amount: 1, sourceUrl: 'https://aws.amazon.com/security/vulnerability-reporting/' },
    { id: 'public-bug-bounty', text: 'Broad bug-bounty footprint via HackerOne', textDe: 'Breites Bug-Bounty-Programm über HackerOne', dimension: 'security', amount: 1, sourceUrl: 'https://www.hackerone.com/bug-bounty-programs' },
    { id: 'transparent-ownership', text: 'Clear public-company ownership and governance', textDe: 'Klare börsennotierte Eigentümerschaft und Governance', dimension: 'governance', amount: 1, sourceUrl: 'https://www.amazon.com' },
    { id: 'public-transparency-report', text: 'Documented EU DSA transparency reporting', textDe: 'Dokumentierte EU-DSA-Transparenzberichterstattung', dimension: 'governance', amount: 1, sourceUrl: 'https://digital-strategy.ec.europa.eu/en/policies/list-designated-vlops-and-vloses' },
  ],

  // ── Amplitude ──────────────────────────────────────────────────────────
  'amplitude': [
    { id: 'soc2-type2-attested', text: 'SOC 2 Type II attestation referenced in trust center', textDe: 'SOC-2-Typ-II-Attestierung im Trust Center referenziert', dimension: 'security', amount: 2, sourceUrl: 'https://trust.amplitude.com/' },
    { id: 'iso-27001-certified', text: 'ISO certification referenced in security posture', textDe: 'ISO-Zertifizierung in Sicherheitspositionierung referenziert', dimension: 'security', amount: 2, sourceUrl: 'https://amplitude.com/security-and-privacy' },
    { id: 'transparent-ownership', text: 'Public-company SEC reporting and clear legal structure', textDe: 'Börsennotierte SEC-Berichterstattung und klare Rechtsstruktur', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/Archives/edgar/data/1866692/000095017025104357/ampl-20250630.htm' },
    { id: 'gdpr-dpa-documented', text: 'Documented legal and privacy controls', textDe: 'Dokumentierte Rechts- und Datenschutzkontrollen', dimension: 'governance', amount: 1, sourceUrl: 'https://amplitude.com/privacy' },
    { id: 'public-status-page', text: 'Public status reporting page', textDe: 'Öffentliche Statusberichterstattungsseite', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.amplitude.com/' },
    { id: 'active-release-cadence', text: 'Active SDK maintenance cadence', textDe: 'Aktive SDK-Pflegefrequenz', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/amplitude/Amplitude-TypeScript' },
    { id: 'data-export-available', text: 'Practical data export paths via Export API', textDe: 'Praktische Datenexportpfade über Export-API', dimension: 'contract', amount: 1, sourceUrl: 'https://amplitude.com/docs/apis/analytics/export' },
  ],

  // ── Anthropic ──────────────────────────────────────────────────────────
  'anthropic': [
    { id: 'responsible-disclosure-process', text: 'Public vulnerability-reporting channels via HackerOne', textDe: 'Öffentliche Schwachstellen-Meldekanäle über HackerOne', dimension: 'security', amount: 1, sourceUrl: 'https://www.hackerone.com/anthropic' },
    { id: 'public-bug-bounty', text: 'Active bug bounty program', textDe: 'Aktives Bug-Bounty-Programm', dimension: 'security', amount: 1, sourceUrl: 'https://www.hackerone.com/anthropic' },
    { id: 'gdpr-dpa-documented', text: 'Formal DPA and explicit enterprise data-processing commitments', textDe: 'Formeller AVV und explizite Enterprise-Datenverarbeitungszusagen', dimension: 'governance', amount: 1, sourceUrl: 'https://www.anthropic.com/legal/data-processing-agreement' },
    { id: 'public-status-page', text: 'Public status reporting', textDe: 'Öffentliche Statusberichterstattung', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.anthropic.com/' },
  ],

  // ── Apple HomeKit ──────────────────────────────────────────────────────
  'apple-homekit': [
    { id: 'e2e-encryption-default', text: 'E2E-encrypted HomeKit Secure Video and accessory communication', textDe: 'E2E-verschlüsselte HomeKit Secure Video und Zubehörkommunikation', dimension: 'security', amount: 2, sourceUrl: 'https://support.apple.com/guide/security/homekit-security-sec59b0b31ff/web' },
    { id: 'public-bug-bounty', text: 'Mature Apple Security Bounty program', textDe: 'Ausgereiftes Apple Security Bounty-Programm', dimension: 'security', amount: 1, sourceUrl: 'https://security.apple.com/bounty/' },
    { id: 'responsible-disclosure-process', text: 'Ongoing Apple security-release cadence and advisory flow', textDe: 'Fortlaufende Apple-Sicherheits-Release-Frequenz und Advisory-Fluss', dimension: 'security', amount: 1, sourceUrl: 'https://support.apple.com/en-us/100100' },
    { id: 'transparent-ownership', text: 'Clear public-company governance structure', textDe: 'Klare börsennotierte Governance-Struktur', dimension: 'governance', amount: 1, sourceUrl: 'https://www.apple.com' },
    { id: 'gdpr-dpa-documented', text: 'Published GDPR compliance documentation', textDe: 'Veröffentlichte DSGVO-Compliance-Dokumentation', dimension: 'governance', amount: 1, sourceUrl: 'https://www.apple.com/legal/more-resources/gdpr-compliance/' },
    { id: 'active-release-cadence', text: 'Active platform updates and broad device support', textDe: 'Aktive Plattform-Updates und breite Geräteunterstützung', dimension: 'reliability', amount: 1, sourceUrl: 'https://support.apple.com/en-us/100100' },
  ],

  // ── Apple iCloud ───────────────────────────────────────────────────────
  'apple-icloud': [
    { id: 'public-bug-bounty', text: 'Mature Apple Security Bounty program', textDe: 'Ausgereiftes Apple Security Bounty-Programm', dimension: 'security', amount: 1, sourceUrl: 'https://security.apple.com/bounty/' },
    { id: 'responsible-disclosure-process', text: 'Clear security documentation and advisory flow', textDe: 'Klare Sicherheitsdokumentation und Advisory-Prozess', dimension: 'security', amount: 1, sourceUrl: 'https://support.apple.com/en-us/102651' },
    { id: 'transparent-ownership', text: 'Clear public-company governance', textDe: 'Klare börsennotierte Governance', dimension: 'governance', amount: 1, sourceUrl: 'https://www.apple.com' },
    { id: 'public-transparency-report', text: 'Published legal and transparency reporting', textDe: 'Veröffentlichte Rechts- und Transparenzberichterstattung', dimension: 'governance', amount: 1, sourceUrl: 'https://www.apple.com/legal/transparency/' },
    { id: 'public-status-page', text: 'Public system status page', textDe: 'Öffentliche Systemstatusseite', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.apple.com/support/systemstatus/' },
    { id: 'data-export-available', text: 'Documented export and transfer pathways', textDe: 'Dokumentierte Export- und Übertragungspfade', dimension: 'contract', amount: 1, sourceUrl: 'https://support.apple.com/en-us/102651' },
  ],

  // ── Apple macOS ────────────────────────────────────────────────────────
  'apple-macos': [
    { id: 'public-bug-bounty', text: 'Mature Apple Security Bounty program', textDe: 'Ausgereiftes Apple Security Bounty-Programm', dimension: 'security', amount: 1, sourceUrl: 'https://security.apple.com/bounty/' },
    { id: 'responsible-disclosure-process', text: 'Active security-release cadence with detailed notes', textDe: 'Aktive Sicherheits-Release-Frequenz mit detaillierten Hinweisen', dimension: 'security', amount: 1, sourceUrl: 'https://support.apple.com/en-us/100100' },
    { id: 'transparent-ownership', text: 'Clear public-company governance and accountability', textDe: 'Klare börsennotierte Governance und Verantwortlichkeit', dimension: 'governance', amount: 1, sourceUrl: 'https://www.apple.com' },
    { id: 'active-release-cadence', text: 'High release cadence and strong engineering maturity', textDe: 'Hohe Release-Frequenz und starke Engineering-Reife', dimension: 'reliability', amount: 1, sourceUrl: 'https://support.apple.com/en-us/100100' },
  ],

  // ── Apple Maps ─────────────────────────────────────────────────────────
  'apple-maps': [
    { id: 'data-minimization-verified', text: 'Privacy architecture with rotating identifiers and selective E2E protection', textDe: 'Datenschutzarchitektur mit rotierenden Identifikatoren und selektivem E2E-Schutz', dimension: 'security', amount: 2, sourceUrl: 'https://www.apple.com/legal/privacy/data/en/apple-maps/' },
    { id: 'transparent-ownership', text: 'Clear public-company accountability and governance', textDe: 'Klare börsennotierte Verantwortlichkeit und Governance', dimension: 'governance', amount: 1, sourceUrl: 'https://www.apple.com' },
    { id: 'active-release-cadence', text: 'Continued active product development and updates', textDe: 'Fortlaufend aktive Produktentwicklung und Updates', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.apple.com/legal/privacy/data/en/apple-maps/' },
  ],

  // ── Asana ──────────────────────────────────────────────────────────────
  'asana': [
    { id: 'soc2-type2-attested', text: 'SOC/ISO compliance posture documented via Trust Center', textDe: 'SOC-/ISO-Compliance-Positionierung im Trust Center dokumentiert', dimension: 'security', amount: 2, sourceUrl: 'https://trust.asana.com/' },
    { id: 'public-bug-bounty', text: 'Active Bugcrowd bug bounty program', textDe: 'Aktives Bugcrowd-Bug-Bounty-Programm', dimension: 'security', amount: 1, sourceUrl: 'https://bugcrowd.com/asana' },
    { id: 'transparent-ownership', text: 'Public-company disclosures and clear legal documentation', textDe: 'Börsennotierte Offenlegungen und klare Rechtsdokumentation', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/Archives/edgar/data/1477720/000119312525112359/d806157ddef14a.htm' },
    { id: 'public-status-page', text: 'Public status page with incident tracking', textDe: 'Öffentliche Statusseite mit Vorfallverfolgung', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.asana.com/' },
    { id: 'active-release-cadence', text: 'Active release and developer ecosystem', textDe: 'Aktiver Release-Zyklus und Entwicklerökosystem', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/Asana/node-asana/releases' },
    { id: 'sla-published', text: 'Enterprise SLA framing', textDe: 'Enterprise-SLA-Rahmen', dimension: 'reliability', amount: 1, sourceUrl: 'https://trust.asana.com/' },
    { id: 'data-export-available', text: 'Project-level JSON/CSV export and documented APIs', textDe: 'Projektebenen-JSON/CSV-Export und dokumentierte APIs', dimension: 'contract', amount: 1, sourceUrl: 'https://developers.asana.com/reference/organization-exports' },
  ],

  // ── Authy ──────────────────────────────────────────────────────────────
  'authy': [
    { id: 'responsible-disclosure-process', text: 'Public incident communications and remediation guidance', textDe: 'Öffentliche Vorfallkommunikation und Behebungsanleitung', dimension: 'security', amount: 1, sourceUrl: 'https://www.twilio.com/en-us/changelog/Security_Alert_Authy_App_Android_iOS' },
    { id: 'transparent-ownership', text: 'Clear legal operator (Twilio) and public legal surfaces', textDe: 'Klarer Betreiber (Twilio) und öffentliche Rechtsseiten', dimension: 'governance', amount: 1, sourceUrl: 'https://www.twilio.com/en-us/legal/authy-app-terms' },
  ],

  // ── AWS ────────────────────────────────────────────────────────────────
  'aws': [
    { id: 'soc2-type2-attested', text: 'Broad SOC 2 Type II attestation surface via AWS Artifact', textDe: 'Breite SOC-2-Typ-II-Attestierung über AWS Artifact', dimension: 'security', amount: 2, sourceUrl: 'https://aws.amazon.com/compliance/soc-faqs/' },
    { id: 'iso-27001-certified', text: 'ISO 27001 certification across services', textDe: 'ISO-27001-Zertifizierung über alle Dienste', dimension: 'security', amount: 2, sourceUrl: 'https://aws.amazon.com/compliance/services-in-scope/' },
    { id: 'responsible-disclosure-process', text: 'Mature security bulletin cadence with rapid mitigations', textDe: 'Ausgereifte Security-Bulletin-Frequenz mit schnellen Mitigationen', dimension: 'security', amount: 1, sourceUrl: 'https://aws.amazon.com/security/security-bulletins/AWS-2025-016/' },
    { id: 'transparent-ownership', text: 'Transparent public-company governance and legal documentation', textDe: 'Transparente börsennotierte Governance und Rechtsdokumentation', dimension: 'governance', amount: 1, sourceUrl: 'https://www.amazon.com' },
    { id: 'public-status-page', text: 'Public AWS Health Dashboard with incident summaries', textDe: 'Öffentliches AWS Health Dashboard mit Vorfallzusammenfassungen', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.aws.amazon.com/' },
    { id: 'multi-region-infrastructure', text: 'Multi-region global infrastructure', textDe: 'Multi-Region-Globalinfrastruktur', dimension: 'reliability', amount: 1, sourceUrl: 'https://aws.amazon.com/about-aws/global-infrastructure/' },
    { id: 'sla-published', text: 'Published SLAs for individual services', textDe: 'Veröffentlichte SLAs für einzelne Dienste', dimension: 'reliability', amount: 1, sourceUrl: 'https://aws.amazon.com/machine-learning/language-services/sla/' },
    { id: 'eu-data-residency', text: 'Explicit EU regional data controls available', textDe: 'Explizite regionale EU-Datenkontrollen verfügbar', dimension: 'contract', amount: 1, sourceUrl: 'https://aws.amazon.com/compliance/services-in-scope/' },
  ],

  // ── AWS Translate ──────────────────────────────────────────────────────
  'aws-translate': [
    { id: 'soc2-type2-attested', text: 'Listed in SOC/ISO compliance scope references', textDe: 'In SOC-/ISO-Compliance-Umfangsreferenzen aufgeführt', dimension: 'security', amount: 2, sourceUrl: 'https://aws.amazon.com/compliance/services-in-scope/' },
    { id: 'iso-27001-certified', text: 'ISO 27001 certified scope includes Translate', textDe: 'ISO-27001-zertifizierter Umfang umfasst Translate', dimension: 'security', amount: 2, sourceUrl: 'https://aws.amazon.com/compliance/services-in-scope/' },
    { id: 'transparent-ownership', text: 'Clear public-company ownership and strong operating capacity', textDe: 'Klare börsennotierte Eigentümerschaft und starke Betriebskapazität', dimension: 'governance', amount: 1, sourceUrl: 'https://www.amazon.com' },
    { id: 'sla-published', text: 'Formal SLA framework for machine learning language services', textDe: 'Formelles SLA-Rahmenwerk für Machine-Learning-Sprachdienste', dimension: 'reliability', amount: 1, sourceUrl: 'https://aws.amazon.com/machine-learning/language-services/sla/' },
    { id: 'public-status-page', text: 'Mature public incident communication channels', textDe: 'Ausgereifte öffentliche Vorfallkommunikationskanäle', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.aws.amazon.com/' },
  ],

  // ── Bing ───────────────────────────────────────────────────────────────
  'bing': [
    { id: 'responsible-disclosure-process', text: 'Mature Microsoft security program and active vulnerability handling', textDe: 'Ausgereiftes Microsoft-Sicherheitsprogramm und aktive Schwachstellenbearbeitung', dimension: 'security', amount: 1, sourceUrl: 'https://msrc.microsoft.com/update-guide/vulnerability/CVE-2025-21355' },
    { id: 'transparent-ownership', text: 'Clear legal entity and ownership structure', textDe: 'Klare Rechtsform und Eigentümerstruktur', dimension: 'governance', amount: 1, sourceUrl: 'https://www.microsoft.com' },
  ],

  // ── Block (Square) ─────────────────────────────────────────────────────
  'block': [
    { id: 'responsible-disclosure-process', text: 'Mature open-source security and disclosure channels', textDe: 'Ausgereifte Open-Source-Sicherheits- und Meldekanäle', dimension: 'security', amount: 1, sourceUrl: 'https://status.block.xyz/' },
    { id: 'transparent-ownership', text: 'Public-company SEC disclosure regime', textDe: 'Börsennotiertes SEC-Offenlegungsregime', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1512673/000151267325000013/xyz-20241231.htm' },
    { id: 'partial-open-source', text: 'Open-source developer platform and tooling', textDe: 'Open-Source-Entwicklerplattform und -Tooling', dimension: 'governance', amount: 1, sourceUrl: 'https://developer.squareup.com/' },
    { id: 'documented-incident-response', text: 'Public incident-postmortem practice', textDe: 'Öffentliche Vorfall-Postmortem-Praxis', dimension: 'reliability', amount: 1, sourceUrl: 'https://developer.squareup.com/blog/an-analysis-of-the-square-and-cash-app-outage/' },
    { id: 'public-status-page', text: 'Public status pages for Square and Cash App', textDe: 'Öffentliche Statusseiten für Square und Cash App', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.block.xyz/' },
  ],

  // ── Cloudflare ─────────────────────────────────────────────────────────
  'cloudflare': [
    { id: 'responsible-disclosure-process', text: 'Public security disclosure process and CVE advisory trail', textDe: 'Öffentlicher Sicherheitsmeldeprozess und CVE-Advisory-Trail', dimension: 'security', amount: 1, sourceUrl: 'https://www.cloudflare.com/disclosure/' },
    { id: 'gdpr-dpa-documented', text: 'Customer DPA/SCC framing and EU Cloud Code of Conduct verification', textDe: 'Kunden-AVV/SCC-Rahmen und EU-Cloud-Verhaltenskodex-Verifizierung', dimension: 'governance', amount: 1, sourceUrl: 'https://www.cloudflare.com/cloudflare-customer-dpa/' },
    { id: 'transparent-ownership', text: 'Public-company SEC reporting and clear legal structure', textDe: 'Börsennotierte SEC-Berichterstattung und klare Rechtsstruktur', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/Archives/edgar/data/1477333/000147733325000137/cloud-20250630.htm' },
    { id: 'public-transparency-report', text: 'Transparent legal policy surface and published reporting', textDe: 'Transparente Rechtspolitik und veröffentlichte Berichterstattung', dimension: 'governance', amount: 1, sourceUrl: 'https://www.cloudflare.com/privacypolicy/' },
    { id: 'documented-incident-response', text: 'Detailed public postmortem practice for major incidents', textDe: 'Detaillierte öffentliche Postmortem-Praxis bei grösseren Vorfällen', dimension: 'reliability', amount: 1, sourceUrl: 'https://blog.cloudflare.com/18-november-2025-outage/' },
    { id: 'multi-region-infrastructure', text: 'Global anycast network with documented localization pathways', textDe: 'Globales Anycast-Netzwerk mit dokumentierten Lokalisierungspfaden', dimension: 'reliability', amount: 1, sourceUrl: 'https://developers.cloudflare.com/data-localization/' },
    { id: 'eu-data-residency', text: 'Enterprise-tier EU data localization available', textDe: 'EU-Datenlokalisierung auf Enterprise-Ebene verfügbar', dimension: 'contract', amount: 1, sourceUrl: 'https://developers.cloudflare.com/data-localization/' },
  ],

  // ── Dashlane ───────────────────────────────────────────────────────────
  'dashlane': [
    { id: 'public-bug-bounty', text: 'Active HackerOne bug bounty program (10+ years)', textDe: 'Aktives HackerOne-Bug-Bounty-Programm (10+ Jahre)', dimension: 'security', amount: 1, sourceUrl: 'https://hackerone.com/dashlane/policy_scopes' },
    { id: 'responsible-disclosure-process', text: 'Documented vulnerability disclosure policy', textDe: 'Dokumentierte Schwachstellen-Meldepolitik', dimension: 'security', amount: 1, sourceUrl: 'https://www.dashlane.com/security/researchers' },
    { id: 'zero-knowledge-architecture', text: 'Zero-knowledge encryption architecture for vault data', textDe: 'Zero-Knowledge-Verschlüsselungsarchitektur für Tresordaten', dimension: 'security', amount: 2, sourceUrl: 'https://www.dashlane.com/security' },
    { id: 'transparent-ownership', text: 'Clear legal-entity framing and explicit subprocessor disclosures', textDe: 'Klare Rechtsform-Rahmung und explizite Unterauftragsverarbeiter-Offenlegung', dimension: 'governance', amount: 1, sourceUrl: 'https://www.dashlane.com/terms' },
    { id: 'public-status-page', text: 'Public status page', textDe: 'Öffentliche Statusseite', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.dashlane.com/' },
    { id: 'active-release-cadence', text: 'Active product and security communication cadence', textDe: 'Aktive Produkt- und Sicherheitskommunikationsfrequenz', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.dashlane.com/blog/10-years-bug-bounty' },
    { id: 'data-export-available', text: 'Documented migration and export paths including Credential Exchange', textDe: 'Dokumentierte Migrations- und Exportpfade inkl. Credential Exchange', dimension: 'contract', amount: 1, sourceUrl: 'https://www.dashlane.com/blog/credential-exchange-ios-switching-pwm' },
  ],

  // ── Discord ────────────────────────────────────────────────────────────
  'discord': [
    { id: 'public-bug-bounty', text: 'Active Bugcrowd intake for security reports', textDe: 'Aktive Bugcrowd-Aufnahme für Sicherheitsmeldungen', dimension: 'security', amount: 1, sourceUrl: 'https://discord.com/security' },
    { id: 'e2e-encryption-default', text: 'E2E encryption rollout for audio and video', textDe: 'E2E-Verschlüsselungseinführung für Audio und Video', dimension: 'security', amount: 2, sourceUrl: 'https://support.discord.com/hc/en-us/articles/25968222946071-End-to-End-Encryption-for-Audio-and-Video' },
    { id: 'public-status-page', text: 'Public status feed for platform health', textDe: 'Öffentlicher Status-Feed für Plattformgesundheit', dimension: 'reliability', amount: 1, sourceUrl: 'https://discordstatus.com/history.rss' },
    { id: 'data-export-available', text: 'Documented data package export', textDe: 'Dokumentierter Datenpaket-Export', dimension: 'contract', amount: 1, sourceUrl: 'https://support.discord.com/hc/en-us/articles/360004957991-Your-Discord-Data-Package' },
  ],

  // ── Dropbox ────────────────────────────────────────────────────────────
  'dropbox': [
    { id: 'soc2-type2-attested', text: 'SOC/ISO assurance surface documented in trust center', textDe: 'SOC-/ISO-Assurance im Trust Center dokumentiert', dimension: 'security', amount: 2, sourceUrl: 'https://trust.dropbox.com/' },
    { id: 'responsible-disclosure-process', text: 'Formal security disclosure channels', textDe: 'Formelle Sicherheitsmeldekanäle', dimension: 'security', amount: 1, sourceUrl: 'https://trust.dropbox.com/' },
    { id: 'transparent-ownership', text: 'Public-company reporting and clear legal structure', textDe: 'Börsennotierte Berichterstattung und klare Rechtsstruktur', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/Archives/edgar/data/1467623/000146762325000011/dbx-20241231.htm' },
    { id: 'active-release-cadence', text: 'Active product and security maintenance cadence', textDe: 'Aktive Produkt- und Sicherheitspflegefrequenz', dimension: 'reliability', amount: 1, sourceUrl: 'https://trust.dropbox.com/' },
    { id: 'data-export-available', text: 'Export and portability pathways documented', textDe: 'Export- und Portabilitätspfade dokumentiert', dimension: 'contract', amount: 1, sourceUrl: 'https://www.dropbox.com/terms' },
  ],

  // ── eBay ───────────────────────────────────────────────────────────────
  'ebay': [
    { id: 'public-bug-bounty', text: 'Active responsible disclosure and bug bounty program', textDe: 'Aktives Responsible-Disclosure- und Bug-Bounty-Programm', dimension: 'security', amount: 1, sourceUrl: 'https://www.ebay.com/securitycenter/researcher' },
    { id: 'responsible-disclosure-process', text: 'SEC-disclosed cybersecurity governance and incident-response framework', textDe: 'SEC-offengelegte Cybersicherheits-Governance und Incident-Response-Rahmen', dimension: 'security', amount: 1, sourceUrl: 'https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1065088/000106508825000010/ebay-20241231.htm' },
    { id: 'transparent-ownership', text: 'Public-company governance and SEC disclosures', textDe: 'Börsennotierte Governance und SEC-Offenlegungen', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1065088/000106508825000010/ebay-20241231.htm' },
    { id: 'public-transparency-report', text: 'Published EU DSA transparency report', textDe: 'Veröffentlichter EU-DSA-Transparenzbericht', dimension: 'governance', amount: 1, sourceUrl: 'https://static.ebayinc.com/static/assets/Uploads/Documents/eBay-2024-DSA-Transparency-Report-qualitative.pdf' },
    { id: 'public-status-page', text: 'Public system and API status transparency', textDe: 'Öffentliche System- und API-Status-Transparenz', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.ebay.com/sts' },
    { id: 'data-export-available', text: 'Data access and export paths exist', textDe: 'Datenzugangs- und Exportpfade vorhanden', dimension: 'contract', amount: 1, sourceUrl: 'https://www.ebay.com/help/policies/member-behaviour-policies/user-privacy-notice-privacy-policy?id=4260' },
  ],

  // ── ExpressVPN ─────────────────────────────────────────────────────────
  'expressvpn': [
    { id: 'recurring-security-audits', text: 'Recurring third-party audits (KPMG ISAE 3000, Cure53 Lightway review)', textDe: 'Wiederkehrende Drittanbieter-Audits (KPMG ISAE 3000, Cure53 Lightway-Review)', dimension: 'security', amount: 3, sourceUrl: 'https://www.expressvpn.com/blog/trustedserver-no-logs-audit' },
    { id: 'independent-security-audit', text: 'Independent Cure53 security review of Lightway protocol', textDe: 'Unabhängiges Cure53-Sicherheitsreview des Lightway-Protokolls', dimension: 'security', amount: 2, sourceUrl: 'https://cure53.de/pentest-report_lightway-rust.pdf' },
    { id: 'responsible-disclosure-process', text: 'Public disclosure process and remediation communication', textDe: 'Öffentlicher Meldeprozess und Behebungskommunikation', dimension: 'security', amount: 1, sourceUrl: 'https://www.expressvpn.com/blog/fixes-for-dns-and-rdp-leaks/' },
    { id: 'partial-open-source', text: 'Lightway protocol core is open-source', textDe: 'Lightway-Protokollkern ist quelloffen', dimension: 'governance', amount: 1, sourceUrl: 'https://github.com/expressvpn/lightway' },
    { id: 'active-release-cadence', text: 'Active maintenance and public remediation communication', textDe: 'Aktive Pflege und öffentliche Behebungskommunikation', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.expressvpn.com/blog/fixes-for-dns-and-rdp-leaks/' },
  ],

  // ── Meta (Facebook) ────────────────────────────────────────────────────
  'meta': [
    { id: 'public-bug-bounty', text: 'Active bug bounty and vulnerability-reporting program', textDe: 'Aktives Bug-Bounty- und Schwachstellen-Meldeprogramm', dimension: 'security', amount: 1, sourceUrl: 'https://www.facebook.com/whitehat' },
    { id: 'transparent-ownership', text: 'Public-company reporting and legal entity transparency', textDe: 'Börsennotierte Berichterstattung und Rechtsform-Transparenz', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/ix?doc=/Archives/edgar/data/1326801/000162828026003942/meta-20251231.htm' },
    { id: 'data-export-available', text: 'Account data export path exists (Download Your Information)', textDe: 'Kontodatenexport verfügbar (Deine Informationen herunterladen)', dimension: 'contract', amount: 1, sourceUrl: 'https://www.facebook.com/help/212802592074644' },
  ],

  // ── Gmail ──────────────────────────────────────────────────────────────
  'gmail': [
    { id: 'soc2-type2-attested', text: 'SOC 2 attestation referenced for Google Workspace', textDe: 'SOC-2-Attestierung für Google Workspace referenziert', dimension: 'security', amount: 2, sourceUrl: 'https://workspace.google.com/security/' },
    { id: 'iso-27001-certified', text: 'ISO 27001 certified scope includes Gmail', textDe: 'ISO-27001-zertifizierter Umfang umfasst Gmail', dimension: 'security', amount: 2, sourceUrl: 'https://workspace.google.com/security/' },
    { id: 'public-bug-bounty', text: 'Active Google Vulnerability Reward Program', textDe: 'Aktives Google Vulnerability Reward Program', dimension: 'security', amount: 1, sourceUrl: 'https://bughunters.google.com/' },
    { id: 'transparent-ownership', text: 'Clear public-company ownership and reporting', textDe: 'Klare börsennotierte Eigentümerschaft und Berichterstattung', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1652044/000165204425000014/goog-20241231.htm' },
    { id: 'public-status-page', text: 'Google Workspace Status Dashboard', textDe: 'Google Workspace-Status-Dashboard', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.google.com/appsstatus/dashboard/' },
    { id: 'sla-published', text: 'SLA-backed enterprise posture', textDe: 'SLA-gestützte Enterprise-Positionierung', dimension: 'reliability', amount: 1, sourceUrl: 'https://workspace.google.com/terms/sla.html' },
    { id: 'data-export-available', text: 'Strong portability via IMAP/POP/SMTP and Google Takeout', textDe: 'Starke Portabilität über IMAP/POP/SMTP und Google Takeout', dimension: 'contract', amount: 1, sourceUrl: 'https://takeout.google.com/' },
    { id: 'open-standards-no-lock-in', text: 'Standard email protocols (IMAP/POP/SMTP) prevent lock-in', textDe: 'Standard-E-Mail-Protokolle (IMAP/POP/SMTP) verhindern Lock-in', dimension: 'contract', amount: 1, sourceUrl: 'https://support.google.com/mail/answer/7126229' },
  ],

  // ── Google Analytics ───────────────────────────────────────────────────
  'google-analytics': [
    { id: 'iso-27001-certified', text: 'ISO 27001 coverage for Google Ads/Analytics scope', textDe: 'ISO-27001-Abdeckung für Google Ads/Analytics-Umfang', dimension: 'security', amount: 2, sourceUrl: 'https://support.google.com/analytics/answer/6366371?hl=en' },
    { id: 'gdpr-dpa-documented', text: 'Formal processor terms and data processing documentation', textDe: 'Formelle Auftragsverarbeitungsbedingungen und Datenverarbeitungsdokumentation', dimension: 'governance', amount: 1, sourceUrl: 'https://privacy.google.com/businesses/processorterms/' },
    { id: 'transparent-ownership', text: 'Clear public-company ownership and reporting', textDe: 'Klare börsennotierte Eigentümerschaft und Berichterstattung', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1652044/000165204425000014/goog-20241231.htm' },
    { id: 'public-status-page', text: 'Google Cloud status page covers Analytics infrastructure', textDe: 'Google-Cloud-Statusseite deckt Analytics-Infrastruktur ab', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.cloud.google.com/' },
    { id: 'active-release-cadence', text: 'Active product release cadence and GA4 evolution', textDe: 'Aktiver Produkt-Release-Zyklus und GA4-Weiterentwicklung', dimension: 'reliability', amount: 1, sourceUrl: 'https://support.google.com/analytics/answer/9383630?hl=en' },
    { id: 'data-export-available', text: 'Practical export paths via Reporting API and BigQuery export', textDe: 'Praktische Exportpfade über Reporting-API und BigQuery-Export', dimension: 'contract', amount: 1, sourceUrl: 'https://support.google.com/analytics/answer/9358801?hl=en' },
  ],

  'google-authenticator': [
    { id: 'transparent-ownership', text: 'Clear public-company ownership under Alphabet', textDe: 'Klare börsennotierte Eigentümerschaft unter Alphabet', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1652044/000165204425000014/goog-20241231.htm' },
    { id: 'active-release-cadence', text: 'Continued mobile release activity on iOS and Android', textDe: 'Fortlaufende mobile Release-Aktivität auf iOS und Android', dimension: 'reliability', amount: 1, sourceUrl: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2' },
  ],

  'google-chrome': [
    { id: 'public-bug-bounty', text: 'Chrome vulnerability reward program with active payouts', textDe: 'Chrome Vulnerability Reward Program mit aktiven Auszahlungen', dimension: 'security', amount: 1, sourceUrl: 'https://bughunters.google.com/' },
    { id: 'responsible-disclosure-process', text: 'Mature vulnerability disclosure and security release process', textDe: 'Ausgereifter Schwachstellen-Melde- und Sicherheits-Release-Prozess', dimension: 'security', amount: 1, sourceUrl: 'https://chromereleases.googleblog.com/2025/05/stable-channel-update-for-desktop_14.html' },
    { id: 'partial-open-source', text: 'Chromium open-source base with public repository', textDe: 'Quelloffene Chromium-Basis mit öffentlichem Repository', dimension: 'governance', amount: 1, sourceUrl: 'https://blog.chromium.org/2025/01/announcing-supporters-of-chromium-based.html' },
    { id: 'transparent-ownership', text: 'Clear public-company ownership under Alphabet', textDe: 'Klare börsennotierte Eigentümerschaft unter Alphabet', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1652044/000165204425000014/goog-20241231.htm' },
    { id: 'active-release-cadence', text: 'Frequent security and feature release cadence', textDe: 'Häufige Sicherheits- und Feature-Release-Frequenz', dimension: 'reliability', amount: 1, sourceUrl: 'https://chromereleases.googleblog.com/2025/05/stable-channel-update-for-desktop_14.html' },
    { id: 'data-export-available', text: 'Core browser data export paths available', textDe: 'Kern-Browserdaten-Exportpfade verfügbar', dimension: 'contract', amount: 1, sourceUrl: 'https://support.google.com/accounts/answer/3024190' },
  ],

  'google-cloud': [
    { id: 'iso-27001-certified', text: 'ISO 27001 certified across GCP services', textDe: 'ISO-27001-zertifiziert über GCP-Dienste', dimension: 'security', amount: 2, sourceUrl: 'https://cloud.google.com/security/compliance' },
    { id: 'soc2-type2-attested', text: 'SOC 2 Type II attestation available', textDe: 'SOC-2-Typ-II-Attestierung verfügbar', dimension: 'security', amount: 2, sourceUrl: 'https://cloud.google.com/security/compliance/soc-2' },
    { id: 'public-bug-bounty', text: 'Google vulnerability reward programs cover GCP', textDe: 'Google Vulnerability Reward Programs umfassen GCP', dimension: 'security', amount: 1, sourceUrl: 'https://bughunters.google.com/' },
    { id: 'responsible-disclosure-process', text: 'Structured security disclosure and advisory process', textDe: 'Strukturierter Sicherheitsmelde- und Advisory-Prozess', dimension: 'security', amount: 1, sourceUrl: 'https://cloud.google.com/security/compliance' },
    { id: 'transparent-ownership', text: 'Clear public-company ownership under Alphabet', textDe: 'Klare börsennotierte Eigentümerschaft unter Alphabet', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1652044/000165204425000014/goog-20241231.htm' },
    { id: 'public-transparency-report', text: 'Google publishes regular transparency reports', textDe: 'Google veröffentlicht regelmässige Transparenzberichte', dimension: 'governance', amount: 1, sourceUrl: 'https://transparencyreport.google.com/' },
    { id: 'public-status-page', text: 'Public status dashboard with incident history', textDe: 'Öffentliches Status-Dashboard mit Vorfallhistorie', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.cloud.google.com/' },
    { id: 'sla-published', text: 'Published SLAs for GCP services', textDe: 'Veröffentlichte SLAs für GCP-Dienste', dimension: 'reliability', amount: 1, sourceUrl: 'https://cloud.google.com/terms/sla' },
    { id: 'multi-region-infrastructure', text: 'Global multi-region infrastructure with data location controls', textDe: 'Globale Multi-Region-Infrastruktur mit Datenlokalisierungskontrollen', dimension: 'reliability', amount: 1, sourceUrl: 'https://cloud.google.com/about/locations' },
    { id: 'data-export-available', text: 'Data export and migration tooling documented', textDe: 'Datenexport- und Migrationswerkzeuge dokumentiert', dimension: 'contract', amount: 1, sourceUrl: 'https://cloud.google.com/blog/products/infrastructure-modernization/eliminating-data-transfer-fees-when-migrating-off-google-cloud' },
    { id: 'eu-data-residency', text: 'EU data region options available for eligible services', textDe: 'EU-Datenregion-Optionen für berechtigte Dienste verfügbar', dimension: 'contract', amount: 1, sourceUrl: 'https://cloud.google.com/security/compliance/c5' },
  ],

  'google-docs': [
    { id: 'iso-27001-certified', text: 'Workspace ISO 27001 certified', textDe: 'Workspace ISO-27001-zertifiziert', dimension: 'security', amount: 2, sourceUrl: 'https://workspace.google.com/security/' },
    { id: 'soc2-type2-attested', text: 'Workspace SOC 2 Type II attestation', textDe: 'Workspace-SOC-2-Typ-II-Attestierung', dimension: 'security', amount: 2, sourceUrl: 'https://workspace.google.com/security/' },
    { id: 'transparent-ownership', text: 'Clear public-company ownership under Alphabet', textDe: 'Klare börsennotierte Eigentümerschaft unter Alphabet', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1652044/000165204425000014/goog-20241231.htm' },
    { id: 'public-status-page', text: 'Public Workspace status dashboard', textDe: 'Öffentliches Workspace-Status-Dashboard', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.google.com/appsstatus/dashboard/' },
    { id: 'sla-published', text: 'Published Workspace SLA', textDe: 'Veröffentlichtes Workspace-SLA', dimension: 'reliability', amount: 1, sourceUrl: 'https://workspace.google.com/terms/sla.html' },
    { id: 'data-export-available', text: 'Google Takeout and admin export paths documented', textDe: 'Google Takeout und Admin-Exportpfade dokumentiert', dimension: 'contract', amount: 1, sourceUrl: 'https://support.google.com/accounts/answer/3024190' },
  ],

  'google-drive': [
    { id: 'iso-27001-certified', text: 'Workspace ISO 27001 certified', textDe: 'Workspace ISO-27001-zertifiziert', dimension: 'security', amount: 2, sourceUrl: 'https://workspace.google.com/security/' },
    { id: 'soc2-type2-attested', text: 'SOC 2 Type II attestation via Workspace', textDe: 'SOC-2-Typ-II-Attestierung über Workspace', dimension: 'security', amount: 2, sourceUrl: 'https://cloud.google.com/security/compliance/soc-2' },
    { id: 'transparent-ownership', text: 'Clear public-company ownership under Alphabet', textDe: 'Klare börsennotierte Eigentümerschaft unter Alphabet', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1652044/000165204425000014/goog-20241231.htm' },
    { id: 'public-status-page', text: 'Public Workspace status dashboard', textDe: 'Öffentliches Workspace-Status-Dashboard', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.google.com/appsstatus/dashboard/' },
    { id: 'data-export-available', text: 'Google Takeout export and admin export paths', textDe: 'Google-Takeout-Export und Admin-Exportpfade', dimension: 'contract', amount: 1, sourceUrl: 'https://support.google.com/accounts/answer/3024190' },
  ],

  'google-gemini': [
    { id: 'responsible-disclosure-process', text: 'Active AI vulnerability reward and disclosure process', textDe: 'Aktives KI-Schwachstellen-Belohnungs- und Meldeverfahren', dimension: 'security', amount: 1, sourceUrl: 'https://security.googleblog.com/2025/06/mitigating-prompt-injection-attacks.html' },
    { id: 'transparent-ownership', text: 'Clear public-company ownership under Alphabet', textDe: 'Klare börsennotierte Eigentümerschaft unter Alphabet', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1652044/000165204425000014/goog-20241231.htm' },
    { id: 'active-release-cadence', text: 'Rapid model and feature shipping cadence', textDe: 'Schnelle Modell- und Feature-Veröffentlichungsfrequenz', dimension: 'reliability', amount: 1, sourceUrl: 'https://blog.google/technology/google-deepmind/google-gemini-updates-io-2025/' },
    { id: 'public-status-page', text: 'Public Workspace status dashboard covers Gemini', textDe: 'Öffentliches Workspace-Status-Dashboard umfasst Gemini', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.google.com/appsstatus/dashboard/' },
  ],

  'google-home': [
    { id: 'responsible-disclosure-process', text: 'Recurring Nest security bulletins and CVE remediation', textDe: 'Wiederkehrende Nest-Security-Bulletins und CVE-Behebung', dimension: 'security', amount: 1, sourceUrl: 'https://support.google.com/product-documentation/answer/10231940?hl=en' },
    { id: 'transparent-ownership', text: 'Clear public-company ownership under Alphabet', textDe: 'Klare börsennotierte Eigentümerschaft unter Alphabet', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1652044/000165204425000014/goog-20241231.htm' },
  ],

  'google-maps': [
    { id: 'transparent-ownership', text: 'Clear public-company ownership under Alphabet', textDe: 'Klare börsennotierte Eigentümerschaft unter Alphabet', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1652044/000165204425000014/goog-20241231.htm' },
    { id: 'public-status-page', text: 'Maps Platform public status and SLA surface', textDe: 'Öffentliche Maps-Platform-Status- und SLA-Oberfläche', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.cloud.google.com/' },
  ],

  'google-meet': [
    { id: 'iso-27001-certified', text: 'Workspace ISO 27001 certified', textDe: 'Workspace ISO-27001-zertifiziert', dimension: 'security', amount: 2, sourceUrl: 'https://workspace.google.com/security/' },
    { id: 'soc2-type2-attested', text: 'Workspace SOC 2 Type II attestation', textDe: 'Workspace-SOC-2-Typ-II-Attestierung', dimension: 'security', amount: 2, sourceUrl: 'https://workspace.google.com/security/' },
    { id: 'transparent-ownership', text: 'Clear public-company ownership under Alphabet', textDe: 'Klare börsennotierte Eigentümerschaft unter Alphabet', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1652044/000165204425000014/goog-20241231.htm' },
    { id: 'public-status-page', text: 'Public Workspace status dashboard', textDe: 'Öffentliches Workspace-Status-Dashboard', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.google.com/appsstatus/dashboard/' },
    { id: 'data-export-available', text: 'Workspace admin export paths documented', textDe: 'Workspace-Admin-Exportpfade dokumentiert', dimension: 'contract', amount: 1, sourceUrl: 'https://support.google.com/accounts/answer/3024190' },
    { id: 'eu-data-residency', text: 'Data Regions available for eligible Workspace editions', textDe: 'Datenregionen für berechtigte Workspace-Editionen verfügbar', dimension: 'contract', amount: 1, sourceUrl: 'https://workspace.google.com/terms/service-terms/' },
  ],

  'google-search': [
    { id: 'public-bug-bounty', text: 'Google vulnerability reward programs', textDe: 'Google Vulnerability Reward Programs', dimension: 'security', amount: 1, sourceUrl: 'https://bughunters.google.com/' },
    { id: 'transparent-ownership', text: 'Clear public-company ownership under Alphabet', textDe: 'Klare börsennotierte Eigentümerschaft unter Alphabet', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1652044/000165204425000014/goog-20241231.htm' },
    { id: 'active-release-cadence', text: 'Hyperscale service maturity with continuous updates', textDe: 'Hyperscale-Dienstreife mit kontinuierlichen Updates', dimension: 'reliability', amount: 1, sourceUrl: 'https://policies.google.com/privacy' },
  ],

  'google-translate': [
    { id: 'transparent-ownership', text: 'Clear public-company ownership under Alphabet', textDe: 'Klare börsennotierte Eigentümerschaft unter Alphabet', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1652044/000165204425000014/goog-20241231.htm' },
    { id: 'public-status-page', text: 'Cloud Translation public status page', textDe: 'Öffentliche Statusseite für Cloud Translation', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.cloud.google.com/' },
    { id: 'sla-published', text: 'Published Cloud Translation SLA', textDe: 'Veröffentlichtes Cloud Translation-SLA', dimension: 'reliability', amount: 1, sourceUrl: 'https://cloud.google.com/translate/sla' },
  ],

  'google-workspace': [
    { id: 'iso-27001-certified', text: 'Workspace ISO 27001 certified', textDe: 'Workspace ISO-27001-zertifiziert', dimension: 'security', amount: 2, sourceUrl: 'https://workspace.google.com/security/' },
    { id: 'soc2-type2-attested', text: 'Workspace SOC 2 Type II attestation', textDe: 'Workspace-SOC-2-Typ-II-Attestierung', dimension: 'security', amount: 2, sourceUrl: 'https://workspace.google.com/security/' },
    { id: 'transparent-ownership', text: 'Clear public-company ownership under Alphabet', textDe: 'Klare börsennotierte Eigentümerschaft unter Alphabet', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1652044/000165204425000014/goog-20241231.htm' },
    { id: 'public-status-page', text: 'Public Workspace status dashboard', textDe: 'Öffentliches Workspace-Status-Dashboard', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.google.com/appsstatus/dashboard/' },
    { id: 'sla-published', text: 'Published Workspace SLA', textDe: 'Veröffentlichtes Workspace-SLA', dimension: 'reliability', amount: 1, sourceUrl: 'https://workspace.google.com/terms/sla.html' },
    { id: 'data-export-available', text: 'Google Takeout and admin export paths', textDe: 'Google Takeout und Admin-Exportpfade', dimension: 'contract', amount: 1, sourceUrl: 'https://support.google.com/accounts/answer/3024190' },
    { id: 'eu-data-residency', text: 'Data Regions for covered data in eligible editions', textDe: 'Datenregionen für abgedeckte Daten in berechtigten Editionen', dimension: 'contract', amount: 1, sourceUrl: 'https://workspace.google.com/terms/service-terms/' },
  ],

  'imessage': [
    { id: 'e2e-encryption-default', text: 'iMessage uses end-to-end encryption by default for iMessage-to-iMessage', textDe: 'iMessage nutzt standardmässig Ende-zu-Ende-Verschlüsselung für iMessage-zu-iMessage', dimension: 'security', amount: 2, sourceUrl: 'https://support.apple.com/guide/security/imessage-security-overview-secd9764312f/web' },
    { id: 'public-bug-bounty', text: 'Apple Security Bounty program covers iMessage', textDe: 'Apple Security Bounty-Programm umfasst iMessage', dimension: 'security', amount: 1, sourceUrl: 'https://security.apple.com/bounty/' },
    { id: 'transparent-ownership', text: 'Clear public-company governance under Apple Inc', textDe: 'Klare börsennotierte Governance unter Apple Inc.', dimension: 'governance', amount: 1, sourceUrl: 'https://support.apple.com/en-us/guide/certifications/apc34d2c0468b/web' },
    { id: 'public-transparency-report', text: 'Apple publishes regular transparency reports', textDe: 'Apple veröffentlicht regelmässige Transparenzberichte', dimension: 'governance', amount: 1, sourceUrl: 'https://www.apple.com/legal/transparency/' },
    { id: 'active-release-cadence', text: 'Regular platform security release cadence', textDe: 'Regelmässige Plattform-Sicherheits-Release-Frequenz', dimension: 'reliability', amount: 1, sourceUrl: 'https://support.apple.com/en-us/100100' },
    { id: 'public-status-page', text: 'Apple system status page available', textDe: 'Apple-Systemstatusseite verfügbar', dimension: 'reliability', amount: 1, sourceUrl: 'https://support.apple.com/en-us/systemstatus' },
  ],

  'jira': [
    { id: 'public-bug-bounty', text: 'Active Bugcrowd bug bounty program', textDe: 'Aktives Bugcrowd-Bug-Bounty-Programm', dimension: 'security', amount: 1, sourceUrl: 'https://bugcrowd.com/atlassian' },
    { id: 'responsible-disclosure-process', text: 'Public security advisories and vulnerability intake process', textDe: 'Öffentliche Sicherheits-Advisories und Schwachstellen-Aufnahmeprozess', dimension: 'security', amount: 1, sourceUrl: 'https://www.atlassian.com/trust/security/advisories' },
    { id: 'transparent-ownership', text: 'Public-company reporting and legal identity clarity', textDe: 'Börsennotierte Berichterstattung und klare Rechtsidentität', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/Archives/edgar/data/0001650372/000165037226000011/team-20251231.htm' },
    { id: 'public-status-page', text: 'Public status page with incident history', textDe: 'Öffentliche Statusseite mit Vorfallhistorie', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.atlassian.com/history' },
    { id: 'active-release-cadence', text: 'Active cloud release cadence', textDe: 'Aktiver Cloud-Release-Zyklus', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.atlassian.com/history' },
    { id: 'eu-data-residency', text: 'Data residency options available for some products', textDe: 'Datenresidenz-Optionen für einige Produkte verfügbar', dimension: 'contract', amount: 1, sourceUrl: 'https://support.atlassian.com/security-and-access-policies/docs/understand-data-residency/' },
  ],

  'lastpass': [
    { id: 'zero-knowledge-architecture', text: 'Zero-knowledge architecture with local encryption and decryption', textDe: 'Zero-Knowledge-Architektur mit lokaler Ver- und Entschlüsselung', dimension: 'security', amount: 2, sourceUrl: 'https://blog.lastpass.com/posts/security-incident-update-recommended-actions' },
    { id: 'transparent-ownership', text: 'Clear legal entity and public accountability statements', textDe: 'Klare Rechtsform und öffentliche Verantwortlichkeitserklärungen', dimension: 'governance', amount: 1, sourceUrl: 'https://blog.lastpass.com/posts/security-incident-update-recommended-actions' },
    { id: 'public-status-page', text: 'Public status page available', textDe: 'Öffentliche Statusseite verfügbar', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.lastpass.com/' },
    { id: 'data-export-available', text: 'Export and retrieval paths exist for vault data', textDe: 'Export- und Abrufpfade für Tresordaten vorhanden', dimension: 'contract', amount: 1, sourceUrl: 'https://www.lastpass.com/legal-center/terms-of-service/personal' },
  ],

  'microsoft-365': [
    { id: 'iso-27001-certified', text: 'Microsoft 365 ISO 27001 certified via Service Trust Portal', textDe: 'Microsoft 365 ISO-27001-zertifiziert über Service Trust Portal', dimension: 'security', amount: 2, sourceUrl: 'https://servicetrust.microsoft.com/' },
    { id: 'soc2-type2-attested', text: 'SOC 2 Type II attestation artifacts available', textDe: 'SOC-2-Typ-II-Attestierungsartefakte verfügbar', dimension: 'security', amount: 2, sourceUrl: 'https://servicetrust.microsoft.com/' },
    { id: 'public-bug-bounty', text: 'Active MSRC bounty programs', textDe: 'Aktive MSRC-Bounty-Programme', dimension: 'security', amount: 1, sourceUrl: 'https://www.microsoft.com/en-us/msrc' },
    { id: 'transparent-ownership', text: 'Clear public-company governance and reporting', textDe: 'Klare börsennotierte Governance und Berichterstattung', dimension: 'governance', amount: 1, sourceUrl: 'https://www.microsoft.com/en-us/investor' },
    { id: 'public-transparency-report', text: 'Microsoft publishes regular transparency reports', textDe: 'Microsoft veröffentlicht regelmässige Transparenzberichte', dimension: 'governance', amount: 1, sourceUrl: 'https://www.microsoft.com/en-us/corporate-responsibility/law-enforcement-requests-report' },
    { id: 'public-status-page', text: 'Service Health dashboard for M365 tenants', textDe: 'Service Health Dashboard für M365-Mandanten', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.office365.com/' },
    { id: 'sla-published', text: 'Published SLAs for Microsoft 365 services', textDe: 'Veröffentlichte SLAs für Microsoft 365-Dienste', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.microsoft.com/licensing/docs/view/Service-Level-Agreements-SLA-for-Online-Services' },
    { id: 'data-export-available', text: 'Practical export mechanisms for core workloads', textDe: 'Praktische Exportmechanismen für Kernarbeitslasten', dimension: 'contract', amount: 1, sourceUrl: 'https://learn.microsoft.com/en-us/compliance/regulatory/offering-data-residency' },
    { id: 'eu-data-residency', text: 'EU Data Boundary for Microsoft Cloud available', textDe: 'EU Data Boundary für Microsoft Cloud verfügbar', dimension: 'contract', amount: 1, sourceUrl: 'https://techcommunity.microsoft.com/blog/eu-databoundaryblog/completing-the-eu-data-boundary-for-the-microsoft-cloud/4360343' },
  ],

  'microsoft-authenticator': [
    { id: 'public-bug-bounty', text: 'Identity-scoped bug bounty via MSRC', textDe: 'Identity-bezogenes Bug-Bounty über MSRC', dimension: 'security', amount: 1, sourceUrl: 'https://www.microsoft.com/en-us/msrc' },
    { id: 'transparent-ownership', text: 'Clear public-company governance under Microsoft', textDe: 'Klare börsennotierte Governance unter Microsoft', dimension: 'governance', amount: 1, sourceUrl: 'https://www.microsoft.com/en-us/investor' },
    { id: 'active-release-cadence', text: 'Active maintenance and explicit support policy', textDe: 'Aktive Pflege und explizite Support-Richtlinie', dimension: 'reliability', amount: 1, sourceUrl: 'https://support.microsoft.com/en-us/account-billing/common-questions-about-the-microsoft-authenticator-app-12d283d1-bcef-4875-9ae5-ac360e2945dd' },
  ],

  'microsoft-windows': [
    { id: 'responsible-disclosure-process', text: 'Mature MSRC vulnerability response infrastructure', textDe: 'Ausgereifte MSRC-Schwachstellen-Reaktionsinfrastruktur', dimension: 'security', amount: 1, sourceUrl: 'https://www.microsoft.com/en-us/msrc' },
    { id: 'transparent-ownership', text: 'Clear public-company governance under Microsoft', textDe: 'Klare börsennotierte Governance unter Microsoft', dimension: 'governance', amount: 1, sourceUrl: 'https://www.microsoft.com/en-us/investor' },
    { id: 'active-release-cadence', text: 'Documented monthly servicing cadence', textDe: 'Dokumentierte monatliche Wartungsfrequenz', dimension: 'reliability', amount: 1, sourceUrl: 'https://learn.microsoft.com/en-us/windows/deployment/update/release-cycle' },
    { id: 'documented-incident-response', text: 'Transparent release-health communication and known-issue publication', textDe: 'Transparente Release-Health-Kommunikation und Known-Issue-Veröffentlichung', dimension: 'reliability', amount: 1, sourceUrl: 'https://learn.microsoft.com/en-us/windows/release-health/' },
  ],

  'mixpanel': [
    { id: 'soc2-type2-attested', text: 'SOC 2 Type II attestation published', textDe: 'SOC-2-Typ-II-Attestierung veröffentlicht', dimension: 'security', amount: 2, sourceUrl: 'https://mixpanel.com/legal/security/' },
    { id: 'public-bug-bounty', text: 'Active HackerOne bug bounty program', textDe: 'Aktives HackerOne-Bug-Bounty-Programm', dimension: 'security', amount: 1, sourceUrl: 'https://hackerone.com/mixpanel' },
    { id: 'transparent-ownership', text: 'Clear legal entity and published policy surface', textDe: 'Klare Rechtsform und veröffentlichte Richtlinien', dimension: 'governance', amount: 1, sourceUrl: 'https://mixpanel.com/legal/terms-of-use/' },
    { id: 'public-transparency-report', text: 'Published transparency reporting', textDe: 'Veröffentlichte Transparenzberichterstattung', dimension: 'governance', amount: 1, sourceUrl: 'https://mixpanel.com/legal/transparency-report/' },
    { id: 'public-status-page', text: 'Public status page available', textDe: 'Öffentliche Statusseite verfügbar', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.mixpanel.com/' },
    { id: 'active-release-cadence', text: 'Active SDK release cadence', textDe: 'Aktiver SDK-Release-Zyklus', dimension: 'reliability', amount: 1, sourceUrl: 'https://github.com/mixpanel/mixpanel-js/releases' },
    { id: 'data-export-available', text: 'Raw event export API and practical export methods', textDe: 'Raw-Event-Export-API und praktische Exportmethoden', dimension: 'contract', amount: 1, sourceUrl: 'https://docs.mixpanel.com/docs/export-methods#raw-event-export-api' },
    { id: 'eu-data-residency', text: 'EU data residency option available', textDe: 'EU-Datenresidenz-Option verfügbar', dimension: 'contract', amount: 1, sourceUrl: 'https://docs.mixpanel.com/docs/privacy/data-residency' },
  ],

  'monday-com': [
    { id: 'iso-27001-certified', text: 'ISO 27001 certification signals in Trust Center', textDe: 'ISO-27001-Zertifizierungssignale im Trust Center', dimension: 'security', amount: 2, sourceUrl: 'https://monday.com/trustcenter' },
    { id: 'soc2-type2-attested', text: 'SOC 2 Type II attestation signals in Trust Center', textDe: 'SOC-2-Typ-II-Attestierungssignale im Trust Center', dimension: 'security', amount: 2, sourceUrl: 'https://monday.com/trustcenter' },
    { id: 'transparent-ownership', text: 'Public-company disclosure via NASDAQ', textDe: 'Börsennotierte Offenlegung über NASDAQ', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/ix?doc=/Archives/edgar/data/1845338/000184533825000036/mndy-20241231.htm' },
    { id: 'public-status-page', text: 'Public status page with incident history', textDe: 'Öffentliche Statusseite mit Vorfallhistorie', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.monday.com/history' },
    { id: 'active-release-cadence', text: 'Active product and developer maintenance', textDe: 'Aktive Produkt- und Entwicklerpflege', dimension: 'reliability', amount: 1, sourceUrl: 'https://monday.com/trustcenter' },
    { id: 'data-export-available', text: 'Documented export paths for customer data', textDe: 'Dokumentierte Exportpfade für Kundendaten', dimension: 'contract', amount: 1, sourceUrl: 'https://monday.com/l/legal/tos/' },
  ],

  'nano-banana-pro': [
    { id: 'responsible-disclosure-process', text: 'Active AI vulnerability-reward and disclosure process', textDe: 'Aktives KI-Schwachstellen-Belohnungs- und Meldeverfahren', dimension: 'security', amount: 1, sourceUrl: 'https://security.googleblog.com/2025/06/mitigating-prompt-injection-attacks.html' },
    { id: 'transparent-ownership', text: 'Clear public-company governance under Alphabet', textDe: 'Klare börsennotierte Governance unter Alphabet', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1652044/000165204425000014/goog-20241231.htm' },
    { id: 'active-release-cadence', text: 'Active model and feature shipping cadence', textDe: 'Aktiver Modell- und Feature-Veröffentlichungszyklus', dimension: 'reliability', amount: 1, sourceUrl: 'https://blog.google/technology/google-deepmind/google-gemini-updates-io-2025/' },
  ],

  'notion': [
    { id: 'soc2-type2-attested', text: 'SOC 2 Type 2 attestation documented', textDe: 'SOC-2-Typ-2-Attestierung dokumentiert', dimension: 'security', amount: 2, sourceUrl: 'https://www.notion.com/security' },
    { id: 'iso-27001-certified', text: 'ISO 27001 family references in security documentation', textDe: 'ISO-27001-Familienreferenzen in Sicherheitsdokumentation', dimension: 'security', amount: 2, sourceUrl: 'https://www.notion.com/security' },
    { id: 'public-bug-bounty', text: 'Active HackerOne bug bounty program', textDe: 'Aktives HackerOne-Bug-Bounty-Programm', dimension: 'security', amount: 1, sourceUrl: 'https://hackerone.com/notion' },
    { id: 'responsible-disclosure-process', text: 'Published responsible disclosure policy', textDe: 'Veröffentlichte Responsible-Disclosure-Richtlinie', dimension: 'security', amount: 1, sourceUrl: 'https://notion.notion.site/Responsible-Disclosure-and-Bug-Bounty-Policy-5f18be78a93643138648f4f4bce1f89b' },
    { id: 'public-status-page', text: 'Public status page with incident history', textDe: 'Öffentliche Statusseite mit Vorfallhistorie', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.notion.so/' },
    { id: 'data-export-available', text: 'Self-service content export paths available', textDe: 'Self-Service-Inhaltsexportpfade verfügbar', dimension: 'contract', amount: 1, sourceUrl: 'https://www.notion.com/help/export-your-content' },
    { id: 'eu-data-residency', text: 'Data residency option documented', textDe: 'Datenresidenz-Option dokumentiert', dimension: 'contract', amount: 1, sourceUrl: 'https://www.notion.com/help/data-residency' },
  ],

  'openai': [
    { id: 'soc2-type2-attested', text: 'SOC 2 Type II attestation for business offerings', textDe: 'SOC-2-Typ-II-Attestierung für Business-Angebote', dimension: 'security', amount: 2, sourceUrl: 'https://openai.com/security-and-privacy/' },
    { id: 'public-bug-bounty', text: 'Structured vulnerability disclosure and bug bounty process', textDe: 'Strukturierter Schwachstellen-Melde- und Bug-Bounty-Prozess', dimension: 'security', amount: 1, sourceUrl: 'https://openai.com/security-and-privacy/' },
    { id: 'transparent-ownership', text: 'Public governance and structure disclosures', textDe: 'Öffentliche Governance- und Strukturoffenlegungen', dimension: 'governance', amount: 1, sourceUrl: 'https://openai.com/our-structure/' },
    { id: 'public-status-page', text: 'Public status page with incident communication', textDe: 'Öffentliche Statusseite mit Vorfallkommunikation', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.openai.com/' },
    { id: 'data-export-available', text: 'Documented export and delete controls', textDe: 'Dokumentierte Export- und Löschkontrollen', dimension: 'contract', amount: 1, sourceUrl: 'https://openai.com/policies/terms-of-use/' },
  ],

  'paypal': [
    { id: 'transparent-ownership', text: 'Public-company disclosures and legal-policy framework', textDe: 'Börsennotierte Offenlegungen und Rechtsrahmen', dimension: 'governance', amount: 1, sourceUrl: 'https://www.paypal.com/us/trust' },
    { id: 'public-status-page', text: 'Public status program with component-level incident notices', textDe: 'Öffentliches Status-Programm mit komponentenspezifischen Vorfallhinweisen', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.paypal-status.com/feed/rss' },
    { id: 'data-export-available', text: 'Reporting and export options available', textDe: 'Reporting- und Exportoptionen verfügbar', dimension: 'contract', amount: 1, sourceUrl: 'https://www.paypal.com/us/legalhub/paypal/useragreement-full' },
  ],

  'reddit': [
    { id: 'responsible-disclosure-process', text: 'Published security.txt and vulnerability disclosure channel', textDe: 'Veröffentlichte security.txt und Schwachstellen-Meldekanal', dimension: 'security', amount: 1, sourceUrl: 'https://www.reddit.com/.well-known/security.txt' },
    { id: 'transparent-ownership', text: 'Public-company disclosures via SEC filings', textDe: 'Börsennotierte Offenlegungen über SEC-Filings', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/Archives/edgar/data/1713445/000171344526000022/rddt-20251231.htm' },
    { id: 'public-transparency-report', text: 'Regular transparency reporting structure', textDe: 'Regelmässige Transparenzberichterstattungsstruktur', dimension: 'governance', amount: 1, sourceUrl: 'https://redditinc.com/policies/transparency-report-january-to-june-2025-reddit' },
  ],

  'safari': [
    { id: 'public-bug-bounty', text: 'Apple Security Bounty program covers Safari/WebKit', textDe: 'Apple Security Bounty-Programm umfasst Safari/WebKit', dimension: 'security', amount: 1, sourceUrl: 'https://security.apple.com/bounty/' },
    { id: 'transparent-ownership', text: 'Clear public-company governance under Apple Inc', textDe: 'Klare börsennotierte Governance unter Apple Inc.', dimension: 'governance', amount: 1, sourceUrl: 'https://support.apple.com/guide/security/certifications-sec8e4b0b8fd/web' },
    { id: 'active-release-cadence', text: 'Frequent update cadence and active maintenance pipeline', textDe: 'Häufige Update-Frequenz und aktive Wartungspipeline', dimension: 'reliability', amount: 1, sourceUrl: 'https://support.apple.com/en-us/100100' },
    { id: 'data-export-available', text: 'Practical browser data export paths available', textDe: 'Praktische Browserdaten-Exportpfade verfügbar', dimension: 'contract', amount: 1, sourceUrl: 'https://support.apple.com/en-us/102651' },
  ],

  'shopify': [
    { id: 'soc2-type2-attested', text: 'SOC 2 Type II / SOC 3 attestation available', textDe: 'SOC-2-Typ-II-/SOC-3-Attestierung verfügbar', dimension: 'security', amount: 2, sourceUrl: 'https://help.shopify.com/en/manual/privacy-and-security/compliance-reports' },
    { id: 'public-bug-bounty', text: 'Mature bug bounty program', textDe: 'Ausgereiftes Bug-Bounty-Programm', dimension: 'security', amount: 1, sourceUrl: 'https://www.shopify.com/bugbounty/blog/inside-shopifys-bug-bounty-program' },
    { id: 'transparent-ownership', text: 'Clear legal and privacy documentation', textDe: 'Klare Rechts- und Datenschutzdokumentation', dimension: 'governance', amount: 1, sourceUrl: 'https://www.shopify.com/legal/terms' },
    { id: 'active-release-cadence', text: 'Large-scale production maturity and ongoing updates', textDe: 'Grosse Produktionsreife und fortlaufende Updates', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.shopify.com/security' },
    { id: 'data-export-available', text: 'Documented export pathways for store data', textDe: 'Dokumentierte Exportpfade für Shop-Daten', dimension: 'contract', amount: 1, sourceUrl: 'https://www.shopify.com/legal/terms' },
  ],

  'signal': [
    { id: 'e2e-encryption-default', text: 'Strong default E2EE architecture for all messages', textDe: 'Starke Standard-E2EE-Architektur für alle Nachrichten', dimension: 'security', amount: 2, sourceUrl: 'https://signal.org/legal/' },
    { id: 'data-minimization-verified', text: 'Documented data-minimization posture verified by subpoena responses', textDe: 'Dokumentierte Datenminimierungshaltung durch Vorladungsantworten verifiziert', dimension: 'security', amount: 2, sourceUrl: 'https://signal.org/bigbrother/' },
    { id: 'partial-open-source', text: 'Client apps and core protocol open-source, but anti-spam component is proprietary', textDe: 'Client-Apps und Kernprotokoll quelloffen, Anti-Spam-Komponente jedoch proprietär', dimension: 'governance', amount: 1, sourceUrl: 'https://github.com/signalapp' },
    { id: 'foundation-or-nonprofit', text: 'Signal Foundation is a 501(c)(3) nonprofit', textDe: 'Signal Foundation ist eine 501(c)(3)-gemeinnützige Organisation', dimension: 'governance', amount: 1, sourceUrl: 'https://projects.propublica.org/nonprofits/organizations/824506840' },
    { id: 'fair-cancellation-terms', text: 'Clear ownership wording and straightforward service-exit language', textDe: 'Klare Eigentumsformulierung und einfache Dienstausstiegssprache', dimension: 'contract', amount: 1, sourceUrl: 'https://signal.org/legal/' },
  ],

  'slack': [
    { id: 'iso-27001-certified', text: 'Mature enterprise security posture with ISO certifications', textDe: 'Ausgereifte Enterprise-Sicherheitspositionierung mit ISO-Zertifizierungen', dimension: 'security', amount: 2, sourceUrl: 'https://slack.com/trust/security' },
    { id: 'soc2-type2-attested', text: 'SOC 2 Type II attestation', textDe: 'SOC-2-Typ-II-Attestierung', dimension: 'security', amount: 2, sourceUrl: 'https://slack.com/trust/security' },
    { id: 'transparent-ownership', text: 'Clear ownership under Salesforce with enterprise governance', textDe: 'Klare Eigentümerschaft unter Salesforce mit Enterprise-Governance', dimension: 'governance', amount: 1, sourceUrl: 'https://slack.com/trust/security' },
    { id: 'public-status-page', text: 'Public status page with incident communication', textDe: 'Öffentliche Statusseite mit Vorfallkommunikation', dimension: 'reliability', amount: 1, sourceUrl: 'https://slack-status.com/2025-02-26' },
    { id: 'data-export-available', text: 'Documented workspace data export pathways', textDe: 'Dokumentierte Workspace-Datenexportpfade', dimension: 'contract', amount: 1, sourceUrl: 'https://slack.com/help/articles/201658943-Export-your-workspace-data' },
    { id: 'eu-data-residency', text: 'Data residency options available for eligible plans', textDe: 'Datenresidenz-Optionen für berechtigte Pläne verfügbar', dimension: 'contract', amount: 1, sourceUrl: 'https://slack.com/help/articles/360035633934-Data-residency-for-Slack' },
  ],

  'stripe': [
    { id: 'soc2-type2-attested', text: 'SOC 2 Type II and SOC 3 attestation available', textDe: 'SOC-2-Typ-II- und SOC-3-Attestierung verfügbar', dimension: 'security', amount: 2, sourceUrl: 'https://docs.stripe.com/security' },
    { id: 'public-bug-bounty', text: 'Active HackerOne bug bounty program', textDe: 'Aktives HackerOne-Bug-Bounty-Programm', dimension: 'security', amount: 1, sourceUrl: 'https://hackerone.com/stripe' },
    { id: 'transparent-ownership', text: 'Clear legal entity with EEA-regulated subsidiaries', textDe: 'Klare Rechtsform mit EWR-regulierten Tochtergesellschaften', dimension: 'governance', amount: 1, sourceUrl: 'https://registers.centralbank.ie/FirmDataPage.aspx?firmReferenceNumber=C187865' },
    { id: 'gdpr-dpa-documented', text: 'Published DPA with documented GDPR compliance posture', textDe: 'Veröffentlichter AVV mit dokumentierter DSGVO-Compliance-Positionierung', dimension: 'governance', amount: 1, sourceUrl: 'https://stripe.com/legal/dpa' },
    { id: 'public-status-page', text: 'Public status page available', textDe: 'Öffentliche Statusseite verfügbar', dimension: 'reliability', amount: 1, sourceUrl: 'https://status.stripe.com/' },
    { id: 'active-release-cadence', text: 'Ongoing product maintenance and changelog', textDe: 'Fortlaufende Produktpflege und Changelog', dimension: 'reliability', amount: 1, sourceUrl: 'https://docs.stripe.com/changelog' },
    { id: 'open-standards-no-lock-in', text: 'PCI migration paths and explicit API/export workflows reduce hard lock-in', textDe: 'PCI-Migrationspfade und explizite API-/Export-Workflows reduzieren harten Lock-in', dimension: 'contract', amount: 1, sourceUrl: 'https://docs.stripe.com/security' },
  ],

  'twitch': [
    { id: 'responsible-disclosure-process', text: 'Documented security disclosure channel', textDe: 'Dokumentierter Sicherheitsmeldekanal', dimension: 'security', amount: 1, sourceUrl: 'https://www.twitch.tv/settings/security' },
    { id: 'transparent-ownership', text: 'Clear ownership under Amazon with public policy surface', textDe: 'Klare Eigentümerschaft unter Amazon mit öffentlichen Richtlinien', dimension: 'governance', amount: 1, sourceUrl: 'https://www.twitch.tv/p/en/legal/privacy-notice/' },
    { id: 'data-export-available', text: 'Account-level data access and export path', textDe: 'Datenzugang und Exportpfad auf Kontoebene', dimension: 'contract', amount: 1, sourceUrl: 'https://www.twitch.tv/p/en/legal/privacy-notice/' },
  ],

  'whatsapp': [
    { id: 'e2e-encryption-default', text: 'Default E2EE for all message content via Signal Protocol', textDe: 'Standard-E2EE für alle Nachrichteninhalte über das Signal-Protokoll', dimension: 'security', amount: 2, sourceUrl: 'https://www.whatsapp.com/security/' },
    { id: 'transparent-ownership', text: 'Ownership and legal entities clear via Meta SEC filings', textDe: 'Eigentümerschaft und Rechtsformen klar über Meta-SEC-Filings', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/ix?doc=/Archives/edgar/data/1326801/000162828026003942/meta-20251231.htm' },
    { id: 'active-release-cadence', text: 'Active patch cadence and mature large-scale operations', textDe: 'Aktive Patch-Frequenz und ausgereifter Grossbetrieb', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.whatsapp.com/security/advisories' },
    { id: 'data-export-available', text: 'Export and account deletion paths exist', textDe: 'Export- und Kontolöschungspfade vorhanden', dimension: 'contract', amount: 1, sourceUrl: 'https://www.whatsapp.com/legal/privacy-policy-eea/' },
  ],

  'x-corp': [
    { id: 'responsible-disclosure-process', text: 'Active vulnerability-reporting pathway', textDe: 'Aktiver Schwachstellen-Meldepfad', dimension: 'security', amount: 1, sourceUrl: 'https://privacy.x.com/en/blog/an-issue-affecting-some-anonymous-accounts' },
    { id: 'transparent-ownership', text: 'Legal entity and platform ownership publicly identifiable', textDe: 'Rechtsform und Plattform-Eigentümerschaft öffentlich identifizierbar', dimension: 'governance', amount: 1, sourceUrl: 'https://x.com/en/tos' },
  ],

  'yahoo': [
    { id: 'responsible-disclosure-process', text: 'Published coordinated vulnerability disclosure program', textDe: 'Veröffentlichtes koordiniertes Schwachstellen-Meldeprogramm', dimension: 'security', amount: 1, sourceUrl: 'https://legal.yahoo.com/xw/en/yahoo/coordinated-vulnerability-disclosure-program-policy/index.html' },
    { id: 'transparent-ownership', text: 'Ownership publicly disclosed via Apollo and Verizon', textDe: 'Eigentümerschaft öffentlich offengelegt über Apollo und Verizon', dimension: 'governance', amount: 1, sourceUrl: 'https://www.verizon.com/about/news/verizon-completes-sale-media-business' },
    { id: 'open-standards-no-lock-in', text: 'Standards-based email access paths (IMAP/SMTP)', textDe: 'Standardbasierte E-Mail-Zugangspfade (IMAP/SMTP)', dimension: 'contract', amount: 1, sourceUrl: 'https://legal.yahoo.com/us/en/yahoo/terms/otos/index.html' },
  ],

  'youtube': [
    { id: 'public-bug-bounty', text: 'Google vulnerability reward programs cover YouTube', textDe: 'Google Vulnerability Reward Programs umfassen YouTube', dimension: 'security', amount: 1, sourceUrl: 'https://bughunters.google.com/' },
    { id: 'transparent-ownership', text: 'Clear public-company governance under Alphabet', textDe: 'Klare börsennotierte Governance unter Alphabet', dimension: 'governance', amount: 1, sourceUrl: 'https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1652044/000165204425000014/goog-20241231.htm' },
    { id: 'active-release-cadence', text: 'Ongoing API ecosystem maintenance', textDe: 'Fortlaufende API-Ökosystem-Pflege', dimension: 'reliability', amount: 1, sourceUrl: 'https://developers.google.com/youtube/v3/revision_history' },
    { id: 'data-export-available', text: 'Google Takeout export for YouTube data', textDe: 'Google-Takeout-Export für YouTube-Daten', dimension: 'contract', amount: 1, sourceUrl: 'https://support.google.com/accounts/answer/3024190' },
  ],

  'zoom': [
    { id: 'iso-27001-certified', text: 'ISO 27001 and additional certifications via Trust Center', textDe: 'ISO 27001 und weitere Zertifizierungen über Trust Center', dimension: 'security', amount: 2, sourceUrl: 'https://www.zoom.com/en/trust/compliance/' },
    { id: 'soc2-type2-attested', text: 'SOC 2 Type II attestation available', textDe: 'SOC-2-Typ-II-Attestierung verfügbar', dimension: 'security', amount: 2, sourceUrl: 'https://www.zoom.com/en/trust/compliance/' },
    { id: 'public-bug-bounty', text: 'Active HackerOne bug bounty program', textDe: 'Aktives HackerOne-Bug-Bounty-Programm', dimension: 'security', amount: 1, sourceUrl: 'https://hackerone.com/zoom' },
    { id: 'responsible-disclosure-process', text: 'Public security bulletin program', textDe: 'Öffentliches Security-Bulletin-Programm', dimension: 'security', amount: 1, sourceUrl: 'https://www.zoom.com/en/trust/security-bulletin/' },
    { id: 'transparent-ownership', text: 'Public-company governance structure', textDe: 'Börsennotierte Governance-Struktur', dimension: 'governance', amount: 1, sourceUrl: 'https://www.zoom.com/en/trust/compliance/' },
    { id: 'active-release-cadence', text: 'Strong release cadence and regular update stream', textDe: 'Starke Release-Frequenz und regelmässiger Update-Strom', dimension: 'reliability', amount: 1, sourceUrl: 'https://www.zoom.com/en/trust/security-bulletin/' },
    { id: 'eu-data-residency', text: 'Data residency options require admin configuration', textDe: 'Datenresidenz-Optionen erfordern Admin-Konfiguration', dimension: 'contract', amount: 1, sourceUrl: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0067422' },
  ],

};
