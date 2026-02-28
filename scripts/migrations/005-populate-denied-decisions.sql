-- Migration 005: Populate denied_decisions, entry_categories, and country codes
-- for all denied alternatives. Data sourced from DENIED_ALTERNATIVES.md.

-- ---------------------------------------------------------------------------
-- 1. Update country codes where missing
-- ---------------------------------------------------------------------------

UPDATE catalog_entries SET country_code = 'us' WHERE slug = 'brave-browser' AND country_code IS NULL;
UPDATE catalog_entries SET country_code = 'ca' WHERE slug = 'cryptostorm' AND country_code IS NULL;
UPDATE catalog_entries SET country_code = 'us' WHERE slug = 'hubitat-elevation' AND country_code IS NULL;
UPDATE catalog_entries SET country_code = 'us' WHERE slug = 'hugging-face' AND country_code IS NULL;
UPDATE catalog_entries SET country_code = 'us' WHERE slug = 'kagi' AND country_code IS NULL;
UPDATE catalog_entries SET country_code = 'ca' WHERE slug = 'obsidian' AND country_code IS NULL;
-- ONLYOFFICE: registered in Latvia (lv) but actual origin Russia; lv not in countries table, leave NULL
-- actual_origin is captured in denied_decisions
UPDATE catalog_entries SET country_code = 'nl' WHERE slug = 'startpage' AND country_code IS NULL;
UPDATE catalog_entries SET country_code = 'de' WHERE slug = 'thaura' AND country_code IS NULL;

-- ---------------------------------------------------------------------------
-- 2. Insert entry_categories for denied entries
-- ---------------------------------------------------------------------------

INSERT IGNORE INTO entry_categories (entry_id, category_id, is_primary, sort_order)
SELECT id, 'browser', 1, 0 FROM catalog_entries WHERE slug = 'brave-browser';

INSERT IGNORE INTO entry_categories (entry_id, category_id, is_primary, sort_order)
SELECT id, 'vpn', 1, 0 FROM catalog_entries WHERE slug = 'cryptostorm';

INSERT IGNORE INTO entry_categories (entry_id, category_id, is_primary, sort_order)
SELECT id, 'version-control', 1, 0 FROM catalog_entries WHERE slug = 'gitlab';

INSERT IGNORE INTO entry_categories (entry_id, category_id, is_primary, sort_order)
SELECT id, 'smart-home', 1, 0 FROM catalog_entries WHERE slug = 'hubitat-elevation';

INSERT IGNORE INTO entry_categories (entry_id, category_id, is_primary, sort_order)
SELECT id, 'ai-ml', 1, 0 FROM catalog_entries WHERE slug = 'hugging-face';

INSERT IGNORE INTO entry_categories (entry_id, category_id, is_primary, sort_order)
SELECT id, 'search-engine', 1, 0 FROM catalog_entries WHERE slug = 'kagi';

INSERT IGNORE INTO entry_categories (entry_id, category_id, is_primary, sort_order)
SELECT id, 'note-taking', 1, 0 FROM catalog_entries WHERE slug = 'obsidian';

INSERT IGNORE INTO entry_categories (entry_id, category_id, is_primary, sort_order)
SELECT id, 'office-suite', 1, 0 FROM catalog_entries WHERE slug = 'onlyoffice';

INSERT IGNORE INTO entry_categories (entry_id, category_id, is_primary, sort_order)
SELECT id, 'search-engine', 1, 0 FROM catalog_entries WHERE slug = 'startpage';

INSERT IGNORE INTO entry_categories (entry_id, category_id, is_primary, sort_order)
SELECT id, 'ai-ml', 1, 0 FROM catalog_entries WHERE slug = 'thaura';

-- ---------------------------------------------------------------------------
-- 3. Insert denied_decisions
-- ---------------------------------------------------------------------------

-- Cryptostorm
INSERT INTO denied_decisions (entry_id, proposed_in, claimed_origin, actual_origin, removed_in, raw_category_label, failed_gateways_json, text_en, text_de, sources_json)
SELECT id,
  'PR #91 (2026-02-16)',
  'Iceland',
  'Vancouver, Canada (Five Eyes)',
  NULL,
  'VPN',
  '["G1", "G8"]',
  'Cryptostorm is not a European company. Despite using an Icelandic TLD (.is) and claiming "Icelandic roots," the registered corporate entity is Baneki Privacy Computing Inc., based in Vancouver, Canada — a Five Eyes alliance member. Beyond the false European claim, founder Douglas Spink was convicted in 2005 of smuggling 375 pounds of cocaine ($34 million value) and was released after only 3 years due to "extensive cooperation with investigators," fueling widespread honeypot suspicions. The service was removed from privacytools.io and is not recommended by Privacy Guides. Current operators are pseudo-anonymous with no accountability.',
  'Cryptostorm ist kein europäisches Unternehmen. Trotz der isländischen TLD (.is) und der Behauptung "isländischer Wurzeln" ist die registrierte Unternehmenseinheit Baneki Privacy Computing Inc. mit Sitz in Vancouver, Kanada — einem Five-Eyes-Mitglied. Gründer Douglas Spink wurde 2005 wegen Kokainschmuggels verurteilt und nach nur 3 Jahren wegen "umfangreicher Kooperation mit Ermittlern" freigelassen, was weitverbreitete Honeypot-Verdächtigungen auslöste. Der Dienst wurde von privacytools.io entfernt und wird von Privacy Guides nicht empfohlen. Die aktuellen Betreiber sind pseudoanonym ohne Rechenschaftspflicht.',
  '["https://github.com/privacytools/privacytools.io/issues/1098", "https://discuss.privacyguides.net/t/why-is-vpn-providers-like-cryptostorm-or-ovpn-not-recommended/13061", "https://proprivacy.com/vpn/review/cryptostorm", "https://www.cloudwards.net/cryptostorm-review/", "https://www.techradar.com/reviews/cryptostorm", "https://www.privacysharks.com/vpn-reviews/cryptostorm-vpn/"]'
FROM catalog_entries WHERE slug = 'cryptostorm'
ON DUPLICATE KEY UPDATE text_en = VALUES(text_en);

-- ONLYOFFICE
INSERT INTO denied_decisions (entry_id, proposed_in, claimed_origin, actual_origin, removed_in, raw_category_label, failed_gateways_json, text_en, text_de, sources_json)
SELECT id,
  'Manual review (2026-02-18)',
  'Riga, Latvia (Ascensio System SIA)',
  'Nizhny Novgorod, Russia (NKT / R7-Office)',
  NULL,
  'Office / Productivity',
  '["G1", "G7"]',
  'ONLYOFFICE is de facto Russian-developed software operating behind a Latvian shell company. Created in 1998 by Lev Bannov in Nizhny Novgorod, Russia. Ascensio System SIA in Latvia was a 100% subsidiary of NKT, sharing the same physical address. EU sanctions apply to commercial licenses — German universities (TU Berlin, Uni Mainz, Leibniz Uni Hannover) all switched away citing sanctions. In 2021, NKT rebranded as R7-Office selling the same codebase to Russian government agencies. In 2025, VK (Russian state-adjacent tech) acquired 25% of R7-Office. The company has never condemned Russia''s invasion of Ukraine.',
  'ONLYOFFICE ist de facto russisch entwickelte Software hinter einer lettischen Briefkastenfirma. 1998 von Lev Bannov in Nischni Nowgorod, Russland gegründet. Ascensio System SIA in Lettland war eine 100%-Tochter von NKT mit derselben physischen Adresse. EU-Sanktionen gelten für kommerzielle Lizenzen — deutsche Universitäten (TU Berlin, Uni Mainz, Leibniz Uni Hannover) wechselten unter Verweis auf Sanktionen. 2021 wurde NKT zu R7-Office umbenannt und verkauft dieselbe Codebasis an russische Regierungsbehörden. 2025 erwarb VK (russischer staatsnaher Techkonzern) 25% an R7-Office. Das Unternehmen hat Russlands Invasion der Ukraine nie verurteilt.',
  '["https://www.tu.berlin/en/campusmanagement/news-details/umstellung-tubcloud-auf-collabora-online", "https://www.en-zdv.uni-mainz.de/2023/05/30/software-onlyoffice-will-be-switched-to-the-open-source-version/", "https://www.luis.uni-hannover.de/en/news/details/news/neues-online-office-paket-an-der-luh", "https://dms-solutions.co/news/dms-solutions-cuts-off-business-relations-with-onlyoffice-due-to-onlyoffice-close-ties-with-russia/", "https://softxpansion.global/resources/prypynyaye-spivpratsyu-z-ascensio-system-sia", "https://fossforce.com/2025/07/lyon-france-adopts-onlyoffice-from-russia-with-love/", "https://interfax.com/newsroom/top-stories/110513/", "https://discuss.privacyguides.net/t/serious-claims-made-against-onlyoffice/11644", "https://company.lursoft.lv/en/ascensio-system/40103265308", "https://www.blomstein.com/en/news/sanctions-101"]'
FROM catalog_entries WHERE slug = 'onlyoffice'
ON DUPLICATE KEY UPDATE text_en = VALUES(text_en);

-- Startpage
INSERT INTO denied_decisions (entry_id, proposed_in, claimed_origin, actual_origin, removed_in, raw_category_label, failed_gateways_json, text_en, text_de, sources_json)
SELECT id,
  NULL,
  'The Hague, Netherlands (Surfboard Holding B.V.)',
  'System1, US publicly traded ad-tech (effective control)',
  'Ownership Structure Clause application (2026-02-19)',
  'Search Engine',
  '["G1"]',
  'Startpage is a Dutch-registered entity (Surfboard Holding B.V.) but has been majority-owned by System1 (US, publicly traded ad-tech) since 2019. Under the Ownership Structure Clause, all three pass-through indicators are present: System1''s CEO is named as the legal responsible party, the "Vanish" AI feature routes user prompts through US-based LLM providers, and System1''s ad-tech business model is structurally intertwined with Startpage''s monetization. A legal entity that cannot independently resist compulsion from its US parent is not a genuine European headquarters. Fails G1.',
  'Startpage ist eine niederländische Gesellschaft (Surfboard Holding B.V.), wird aber seit 2019 mehrheitlich von System1 (US-börsennotierter Ad-Tech-Konzern) kontrolliert. Unter der Eigentümerstruktur-Klausel sind alle drei Pass-Through-Indikatoren erfüllt: System1s CEO ist als rechtlich Verantwortlicher benannt, die "Vanish"-KI-Funktion leitet Nutzeranfragen über US-basierte LLM-Anbieter, und System1s Geschäftsmodell ist strukturell mit Startpages Monetarisierung verflochten. Eine Gesellschaft, die sich nicht unabhängig gegen Zwang ihres US-Mutterkonzerns wehren kann, ist kein echter europäischer Hauptsitz. Scheitert an G1.',
  '["https://www.startpage.com/privacy-please/startpage-articles/startpage-relisted-on-privacytools", "https://www.startpage.com/en/privacy-policy/", "https://www.startpage.com/en/support-privacy-policy/"]'
FROM catalog_entries WHERE slug = 'startpage'
ON DUPLICATE KEY UPDATE text_en = VALUES(text_en);

-- Hubitat Elevation
INSERT INTO denied_decisions (entry_id, proposed_in, claimed_origin, actual_origin, removed_in, raw_category_label, failed_gateways_json, text_en, text_de, sources_json)
SELECT id,
  NULL,
  NULL,
  NULL,
  'Decision Matrix policy update (2026-02-18)',
  'Smart Home',
  '["G6"]',
  'Hubitat Elevation is a US-based, fully proprietary smart home hub. Under the Decision Matrix two-tier system (criterion G6), non-European entries require full open-source status — client and server code publicly available under an OSI-approved license. Hubitat is closed-source and does not meet this requirement.',
  'Hubitat Elevation ist ein US-basierter, vollständig proprietärer Smart-Home-Hub. Gemäß dem Zwei-Tier-System der Entscheidungsmatrix (Kriterium G6) müssen nicht-europäische Einträge vollständig Open-Source sein — Client- und Servercode öffentlich unter einer OSI-genehmigten Lizenz verfügbar. Hubitat ist Closed-Source und erfüllt diese Anforderung nicht.',
  NULL
FROM catalog_entries WHERE slug = 'hubitat-elevation'
ON DUPLICATE KEY UPDATE text_en = VALUES(text_en);

-- Brave Browser
INSERT INTO denied_decisions (entry_id, proposed_in, claimed_origin, actual_origin, removed_in, raw_category_label, failed_gateways_json, text_en, text_de, sources_json)
SELECT id,
  NULL,
  NULL,
  NULL,
  'Manual policy enforcement (2026-02-24)',
  'Browser',
  '["G6"]',
  'Brave is a Tier 2 (non-European) entry. Under the Decision Matrix (criterion G6), non-European alternatives are only eligible when fully open-source. Brave publishes major browser code under open-source licenses, but DRM video playback depends on Google Widevine, which is proprietary and cannot be reviewed by Brave. Because closed proprietary components are required for this feature path, Brave is not fully open-source end-to-end and fails G6.',
  'Brave ist ein Tier-2-Eintrag (nicht-europäisch). Gemäß der Entscheidungsmatrix (Kriterium G6) sind nicht-europäische Alternativen nur berechtigt, wenn sie vollständig Open-Source sind. Brave veröffentlicht den Großteil des Browser-Codes unter Open-Source-Lizenzen, aber die DRM-Videowiedergabe hängt von Google Widevine ab, das proprietär ist und nicht von Brave überprüft werden kann. Da proprietäre Komponenten für diesen Funktionspfad erforderlich sind, ist Brave nicht vollständig End-to-End Open-Source und scheitert an G6.',
  '["https://brave.com/privacy/browser/", "https://github.com/brave/brave-browser", "https://support.brave.com/hc/en-us/articles/360023851591-How-do-I-view-DRM-protected-content", "https://brave.com/blog/drm-support/", "https://brave.com/terms-of-use/"]'
FROM catalog_entries WHERE slug = 'brave-browser'
ON DUPLICATE KEY UPDATE text_en = VALUES(text_en);

-- Kagi
INSERT INTO denied_decisions (entry_id, proposed_in, claimed_origin, actual_origin, removed_in, raw_category_label, failed_gateways_json, text_en, text_de, sources_json)
SELECT id,
  'Issue #134 (2026-02-18)',
  NULL,
  NULL,
  NULL,
  'Search Engine',
  '["G6"]',
  'Kagi is a Tier 2 (non-European) proposal. Under the Decision Matrix (criterion G6), Tier 2 entries are only eligible when fully open-source. Kagi''s documentation identifies the company as US-based (Palo Alto founding, San Francisco address). Kagi describes itself as "increasingly open-source" and lists selected OSS projects, but this does not establish full open-source status for the core search/assistant stack end-to-end. Fails G6.',
  'Kagi ist ein Tier-2-Vorschlag (nicht-europäisch). Gemäß der Entscheidungsmatrix (Kriterium G6) sind Tier-2-Einträge nur berechtigt, wenn sie vollständig Open-Source sind. Kagis Dokumentation identifiziert das Unternehmen als US-basiert (Gründung in Palo Alto, Adresse in San Francisco). Kagi beschreibt sich als "zunehmend Open-Source" und listet ausgewählte OSS-Projekte, dies begründet jedoch keinen vollständigen Open-Source-Status für den Kern-Such-/Assistenz-Stack. Scheitert an G6.',
  '["https://github.com/TheMorpheus407/european-alternatives/issues/134", "https://help.kagi.com/kagi/company/", "https://help.kagi.com/kagi/support-and-community/open-source.html", "https://kagi.com/privacy"]'
FROM catalog_entries WHERE slug = 'kagi'
ON DUPLICATE KEY UPDATE text_en = VALUES(text_en);

-- GitLab
INSERT INTO denied_decisions (entry_id, proposed_in, claimed_origin, actual_origin, removed_in, raw_category_label, failed_gateways_json, text_en, text_de, sources_json)
SELECT id,
  'Issue #141 (2026-02-18)',
  NULL,
  NULL,
  NULL,
  'Version Control',
  '["G6"]',
  'GitLab is a Tier 2 (non-European) proposal. Under the Decision Matrix (criterion G6), Tier 2 entries must be fully open-source. GitLab Community Edition (CE) is MIT-licensed, but GitLab Enterprise Edition (EE) has a restrictive license. The proposed entry is GitLab (not CE-only), making it open-core rather than fully open-source end-to-end. Fails G6.',
  'GitLab ist ein Tier-2-Vorschlag (nicht-europäisch). Gemäß der Entscheidungsmatrix (Kriterium G6) müssen Tier-2-Einträge vollständig Open-Source sein. Die GitLab Community Edition (CE) ist MIT-lizenziert, aber die GitLab Enterprise Edition (EE) hat eine restriktive Lizenz. Der vorgeschlagene Eintrag ist GitLab (nicht nur CE), wodurch es Open-Core statt vollständig Open-Source ist. Scheitert an G6.',
  '["https://github.com/TheMorpheus407/european-alternatives/issues/141", "https://docs.gitlab.com/development/licensing/", "https://docs.gitlab.com/update/package/", "https://about.gitlab.com/upgrade/", "https://about.gitlab.com/fr-fr/mentions-legales/"]'
FROM catalog_entries WHERE slug = 'gitlab'
ON DUPLICATE KEY UPDATE text_en = VALUES(text_en);

-- Obsidian
INSERT INTO denied_decisions (entry_id, proposed_in, claimed_origin, actual_origin, removed_in, raw_category_label, failed_gateways_json, text_en, text_de, sources_json)
SELECT id,
  'Issue #201 (2026-02-25)',
  NULL,
  NULL,
  NULL,
  'Note-Taking',
  '["G6"]',
  'Obsidian is a Tier 2 (non-European) candidate. Its terms identify the legal entity as Dynalist Inc. with Ontario/Canada governing law. Under the Decision Matrix (criterion G6), Tier 2 entries must be fully open-source. Obsidian''s terms state the software is "licensed and not sold" with rights reserved, indicating a proprietary offering with some open-source components. Not fully open-source, fails G6.',
  'Obsidian ist ein Tier-2-Kandidat (nicht-europäisch). Die Nutzungsbedingungen identifizieren die Gesellschaft als Dynalist Inc. mit Ontario/Kanada als Rechtsraum. Gemäß der Entscheidungsmatrix (Kriterium G6) müssen Tier-2-Einträge vollständig Open-Source sein. Obsidians Bedingungen besagen, die Software sei "lizenziert und nicht verkauft" mit vorbehaltenen Rechten, was auf ein proprietäres Angebot mit einigen Open-Source-Komponenten hindeutet. Nicht vollständig Open-Source, scheitert an G6.',
  '["https://github.com/TheMorpheus407/european-alternatives/issues/201", "https://obsidian.md/terms", "https://obsidian.md/license"]'
FROM catalog_entries WHERE slug = 'obsidian'
ON DUPLICATE KEY UPDATE text_en = VALUES(text_en);

-- Thaura
INSERT INTO denied_decisions (entry_id, proposed_in, claimed_origin, actual_origin, removed_in, raw_category_label, failed_gateways_json, text_en, text_de, sources_json)
SELECT id,
  'Issue #154 (2026-02-19)',
  'Hannover, Germany (Thaura GbR)',
  'Corporate identity unverifiable',
  NULL,
  'AI & Machine Learning',
  '["G1"]',
  'Thaura fails G1 (Genuine headquarters). Its legal pages contain conflicting corporate-identity signals: Imprint claims "Thaura GbR" at a Hannover address with "HRB 245123 (Berlin)" — but HRB is for corporations (GmbH), not GbR. The embedded Organization schema sets addressCountry to "US." A VAT-ID check returned "Ungültige USt-Id-Nummer." Independent company-register lookups did not return a matching entity. The project requires a verifiable legal entity and genuine headquarters jurisdiction before inclusion.',
  'Thaura scheitert an G1 (Echter Hauptsitz). Die Rechtsseiten enthalten widersprüchliche Unternehmensidentitätssignale: Das Impressum nennt "Thaura GbR" an einer Hannoveraner Adresse mit "HRB 245123 (Berlin)" — aber HRB ist für Kapitalgesellschaften (GmbH), nicht für GbR. Das eingebettete Organization-Schema setzt addressCountry auf "US." Eine USt-IdNr.-Prüfung ergab "Ungültige USt-Id-Nummer." Unabhängige Handelsregister-Abfragen lieferten keine übereinstimmende Einheit. Das Projekt erfordert eine verifizierbare Rechtseinheit und echten Hauptsitz vor Aufnahme.',
  '["https://github.com/TheMorpheus407/european-alternatives/issues/154", "https://thaura.ai/imprint", "https://thaura.ai/terms-of-service", "https://thaura.ai/", "https://www.northdata.de/Thaura,%20Hannover?offset=0", "https://www.northdata.de/Thaura%20GbR,%20Hannover?offset=0", "https://www.northdata.de/HRB%20245123,%20Berlin?offset=0", "https://www.ust-id-prufen.de/"]'
FROM catalog_entries WHERE slug = 'thaura'
ON DUPLICATE KEY UPDATE text_en = VALUES(text_en);

-- Hugging Face
INSERT INTO denied_decisions (entry_id, proposed_in, claimed_origin, actual_origin, removed_in, raw_category_label, failed_gateways_json, text_en, text_de, sources_json)
SELECT id,
  NULL,
  'France (Paris)',
  'United States (Hugging Face, Inc., Delaware)',
  'Issue #207 correction (2026-02-26)',
  'AI & Machine Learning',
  '["G6"]',
  'The prior listing treated Hugging Face as a French alternative. However, the binding service entity is Hugging Face, Inc., a Delaware corporation, with New York governing law. The Paris entity (Hugging Face SAS) is the EU main establishment for GDPR supervision only. This places Hugging Face in Tier 2 (non-European). Tier 2 entries must pass G6 (fully open-source). While the ecosystem includes major open-source libraries, the Hub/service offering is not fully open-source end-to-end (previously marked openSourceLevel: "partial"). Fails G6.',
  'Die vorherige Listung behandelte Hugging Face als französische Alternative. Jedoch ist die vertraglich bindende Dienstleistungseinheit Hugging Face, Inc., eine Delaware-Gesellschaft, mit New Yorker Recht. Die Pariser Einheit (Hugging Face SAS) ist nur die EU-Hauptniederlassung für die DSGVO-Aufsicht. Dies ordnet Hugging Face in Tier 2 (nicht-europäisch) ein. Tier-2-Einträge müssen G6 bestehen (vollständig Open-Source). Obwohl das Ökosystem große Open-Source-Bibliotheken umfasst, ist das Hub-/Dienstangebot nicht vollständig End-to-End Open-Source (zuvor als openSourceLevel: "partial" markiert). Scheitert an G6.',
  '["https://github.com/TheMorpheus407/european-alternatives/issues/207", "https://huggingface.co/terms-of-service", "https://huggingface.co/privacy"]'
FROM catalog_entries WHERE slug = 'hugging-face'
ON DUPLICATE KEY UPDATE text_en = VALUES(text_en);
