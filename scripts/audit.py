import subprocess
import sys
import os
import warnings

warnings.filterwarnings("ignore", category=RuntimeWarning)
os.environ["PYTHONWARNINGS"] = "ignore"

LOCALE = {
    "de": {
        "header": "=== european-alternatives.cloud COMPLIANCE AUDIT ===",
        "tool_name": "Name des Tools/Unternehmens (z.B. Shadow, Nextcloud): ",
        "context": "Kategorie/Kontext (z.B. Cloud Gaming, Messenger, Browser): ",
        "step0": "Schritt 0: Basisdaten",
        "step1": "Schritt 1: Gerichtsbarkeit",
        "step2": "Schritt 2: Infrastruktur",
        "step3": "Schritt 3: Quellcode",
        "step4": "Schritt 4: Aktive Wartung",
        "step5": "Schritt 5: Privacy Signals",
        "search_for": "Recherche läuft: ",
        "url_prompt": "Ist dies die offizielle Webseite? (y/n): ",
        "url_manual": "Bitte offizielle URL eingeben (inkl. https://): ",
        "g1_prompt": "Hauptsitz in EU/EWR/CH? (y/n): ",
        "g1_1_prompt": "Sitz in einem bestimmten EU/EEA/CH Land? (y/n): ",
        "g1_2_prompt": "Hauptsitz außerhalb der US? (y/n): ",
        "g1_3_prompt": "Signifikante EU-Präsenz oder Alleinstellungsmerkmal? (y/n): ",
        "g2_prompt": "Wird das Tool aktiv gewartet? (y/n):",
        "g3_prompt": "Ist die Hosting-Infrastruktur In Europa? (y/n/u): ",
        "g4_prompt": "Ist auf US-Hyperscalern (AWS, Google, Azure)? (y/n): ",
        "g6_os_client": "Ist der Client-Code Open Source? (y/n): ",
        "g6_os_server": "Ist der Server/Backend-Code Open Source? (y/n): ",
        "priv_pri_prompt": "Bietet 'Primäre Privatsphäre' (E2E, Zero-Knowledge, No-Logs)? (y/n): ",
        "priv_sec_prompt": "Bietet 'Sekundäre Privatsphäre' (Selbst-Hosting, Federation, Offline)? (y/n): ",
        "abort": "Audit abgebrochen: Kriterien nicht erfüllt.",
        "result_header": "=== AUDIT ERGEBNIS ===",
        "classification": "Klassifizierung",
        "reservations": "Vorbehalte",
        "pr_template": "Markdown-Vorschlag für das Repository:",
        "none": "Keine",
        "recon_fail": "Keine relevanten Infos gefunden.",
        "trust_score": "Geschätzter Trust-Score",
    },
    "en": {
        "header": "=== european-alternatives.cloud COMPLIANCE AUDIT ===",
        "tool_name": "Name of the tool/company (e.g., Shadow, Nextcloud): ",
        "context": "Category/Context (e.g., Cloud Gaming, Messenger, Browser): ",
        "step0": "Step 0: Basic Data",
        "step1": "Step 1: Jurisdiction",
        "step2": "Step 2: Infrastructure",
        "step3": "Step 3: Source Code",
        "step4": "Step 4: Active Maintenance",
        "step5": "Step 5: Privacy Signals",
        "search_for": "Recon in progress: ",
        "url_prompt": "Is this the official website? (y/n): ",
        "url_manual": "Please enter official URL (incl. https://): ",
        "g1_prompt": "HQ in EU/EEA/CH? (y/n): ",
        "g1_1_prompt": "HQ in specific EU/EEA/CH country? (y/n): ",
        "g1_2_prompt": "HQ outside the US? (y/n): ",
        "g1_3_prompt": "Significant EU presence or unique alternative? (y/n): ",
        "g2_prompt": "Is the tool actively maintained? (y/n): ",
        "g3_prompt": "Is hosting infrastructure in Europe? (y/n/u): ",
        "g4_prompt": "Is on US Hyperscalers (AWS, Google, Azure)? (y/n): ",
        "g6_os_client": "Is Client code Open Source? (y/n): ",
        "g6_os_server": "Is Server/Backend code Open Source? (y/n): ",
        "priv_pri_prompt": "Offers 'Primary Privacy' (E2E, Zero-Knowledge, No-Logs)? (y/n): ",
        "priv_sec_prompt": "Offers 'Secondary Privacy' (Self-Hosting, Federation, Offline)? (y/n): ",
        "abort": "Audit aborted: Criteria not met.",
        "result_header": "=== AUDIT RESULT ===",
        "classification": "Classification",
        "reservations": "Reservations",
        "pr_template": "Markdown template for the repository:",
        "none": "None",
        "recon_fail": "No relevant information found.",
        "trust_score": "Approximate Trust Score",
    }
}

RESERVATIONS = {
    "juris": "Non-EU Jurisdiction (G1)",
    "maint": "Not Actively Maintained (G2)",
    "infra": "Non-EU Infrastructure (G3)",
    "infra_unknown": "Infrastructure Unclear (G3)",
    "infra_us": "Reliance on US Cloud (G4)",
    "prop": "Proprietary (G6)"
}

SEARCH_QUERIES = {
    "web": "offical website url homepage",
    "hq": "company headquarters location",
    "infra": "hosting infrastructure aws azure ovh hetzner",
    "licence": "github open source license",
    "privacy": "privacy policy gdpr encryption end-to-end zero knowledge self-hosting"
}

def ensure_environment():
    """
    Fix and Setup of dependencies via an virtual environment (venv)
    """

    if hasattr(sys, 'real_prefix') or (target := sys.base_prefix) != sys.prefix:
        return 
    venv_dir = os.path.join(os.path.dirname(__file__), ".venv")
    if not os.path.exists(venv_dir):
        print("[*] Initializing .venv environment to prevent PEP 668 conflicts...")
        subprocess.check_call([sys.executable, "-m", "venv", venv_dir])
    python_exe = os.path.join(venv_dir, "bin", "python") if os.name != 'nt' else os.path.join(venv_dir, "Scripts", "python.exe")
    subprocess.check_call([python_exe, "-m", "pip", "install", "--quiet", "ddgs"])
    os.execv(python_exe, [python_exe] + sys.argv)

def ask_user(prompt):
    """
    More robust handling of input for y/n/u questions.
    
    :param prompt: The question to answer with y/n/u.
    """
    val = input(prompt).lower().strip()
    positive_values = ['y', 'yes', 'j', 'ja']
    negative_values = ['n', 'no', 'nein']
    unknown_values = ['u', '?', 'unknown', 'unbekannt']

    if val in positive_values: return 'y'
    if val in negative_values: return 'n'
    if val in unknown_values: return 'u'

    return val

class ReconModule:
    def __init__(self, tool_name, context, lang):
        self.tool = tool_name
        self.context = context.strip()
        self.lang = lang
        self.t = LOCALE[lang]

    def search(self, query_key, limit=3):
        """
        Searches the info with the query via ddgs.
        
        :param query_key: Key of the query which should be searched for
        :param limit: Count on how many results should be shown
        """

        try:
            from ddgs import DDGS
        except ImportError:
            return ["Import Error: ddgs not found."]
        
        query_suffix = SEARCH_QUERIES.get(query_key)
        query = f'"{self.tool}" {self.context} {query_suffix}'.strip()
        results = []

        print(f"\033[94m[Info]\033[0m {self.t['search_for']}{query}")

        try:
            with DDGS() as ddgs:
                search_gen = ddgs.text(query, max_results=limit)
                for r in search_gen:
                    results.append({
                        "title": r.get('title', 'No Title'),
                        "body": r.get('body').replace('\n', ' ')[:140] + "...",
                        "href": r.get('href', '#')
                    })
        except Exception as e:
            pass 
        
        return results

class ComplianceAudit:
    def __init__(self, lang):
        self.lang = lang
        self.t = LOCALE[lang]
        self.reservations = []
        self.tool_url = ''
        self.trust = 0

    def display_results(self, results):
        if not results:
            print(f" \033[90m{self.t['recon_fail']}\033[0m")
            return
        
        for r in results:
            print(f"  \033[1m• {r['title']}\033[0m")
            print(f"    {r['body']}")
            print(f"    \033[90m-> {r['href']}\033[0m")

    def run(self):
        print(f"\n\033[1m{self.t['header']}\033[0m")
        name = input(self.t['tool_name'])
        context = input(self.t['context'])
        recon = ReconModule(name, context, self.lang)

        # URL
        print(f"\n\033[1m{self.t['step0']}\033[0m")
        url_results = recon.search("web", limit=1)
        guessed_url = url_results[0]['href'] if url_results else ''

        if guessed_url:
            print(f'   Found: {guessed_url}')

            if ask_user(self.t['url_prompt']) == 'y':
                self.tool_url = guessed_url
            else:
                self.tool_url = input(self.t['url_manual'])
        else:
            self.tool_url = input(self.t['url_manual'])

        # Jurisdiction (G1 & G2)
        print(f"\n\033[1m{self.t['step1']}\033[0m")
        self.display_results(recon.search('hq'))

        g1 = ask_user(f"\n{self.t['g1_prompt']}")
        tier = "Tier 1" if g1 == 'y' else "Tier 2"
        is_us = False
        
        if g1 == 'y':
            if ask_user(self.t['g1_1_prompt']) == 'y':
                self.trust += 4
            else:
                self.trust += 3
        else:
            self.reservations.append(RESERVATIONS['juris'])
            if ask_user(self.t['g1_2_prompt']) == 'y':
                self.trust += 3 # HQ not in US or EU
            else:
                self.trust += 1 # HQ in US
                is_us = True
                if ask_user(self.t['g1_3_prompt']) != 'y':
                    print(f"\033[91m{self.t['abort']}\033[0m"); return

        # Infrastructure (G3)
        print(f"\n\033[1m{self.t['step2']}\033[0m")
        self.display_results(recon.search("infra"))

        g3 = ask_user(f"\n{self.t['g3_prompt']}")

        if g3 == 'y':
            if ask_user(self.t['g4_prompt']) == "y":
                self.trust -= 1
                self.reservations.append(RESERVATIONS["infra_us"])
            else:
                self.trust += 2
        elif g3 == 'n':
            self.trust -= 1
            self.reservations.append(RESERVATIONS['infra'])
        elif g3 == 'u':
            self.reservations.append(RESERVATIONS['infra_unknown'])

        # Source Code (G6)
        print(f"\n\033[1m{self.t['step3']}\033[0m")
        self.display_results(recon.search("licence"))

        client_os = ask_user(f"\n{self.t['g6_os_client']}")
        if client_os == 'y':
            server_os = ask_user(self.t['g6_os_server'])

        oss = False
        if client_os == 'y' and server_os == 'y':
            oss = True
            self.trust += 3 # Full
        elif client_os == 'y' and server_os != 'y':
            oss = True
            self.trust += 2 # Partial
        else:
            self.trust += 1 # Proprietary
            self.reservations.append(RESERVATIONS['prop'])

        # active maintenance
        if oss:
            print(f"\n\033[1m{self.t['step4']}\033[0m")

            if ask_user(self.t['g2_prompt']) == 'y':
                pass
            else:
                self.reservations.append(RESERVATIONS['maint'])

        # Privacy Signals
        print(f"\n\033[1m{self.t['step5']}\033[0m")
        self.display_results(recon.search("privacy"))

        if ask_user(f"{self.t['priv_pri_prompt']}") == 'y':
            self.trust += 1
        if ask_user(self.t['priv_sec_prompt']) == 'y':
            self.trust += 1

        self.report(name, tier, is_us)

    def report(self, name, tier, us_based):
        res_text = ", ".join(self.reservations) if self.reservations else self.t['none']

        url = f"[{self.tool_url}]({self.tool_url})" if self.tool_url and "http" in self.tool_url else ''
        
        trust_val = min(self.trust, 4) if us_based else self.trust
        trust = max(1, min(10, trust_val))

        print(f"\n\033[92m\033[1m{self.t['result_header']}\033[0m")
        print(f"Tool: {name}")
        print(f'URL: {self.tool_url}')
        print(f"{self.t['classification']}: {tier}")
        print(f"{self.t['trust_score']}: {trust}")
        print(f"{self.t['reservations']}: {res_text}")
        print(f"\n{self.t['pr_template']}")
        print(f"| Name | {self.t['classification']} | {self.t['reservations']} | {self.t['trust_score']} | URL |")
        print(f"|--------|--------|--------|--------|--------|")
        print(f"| {name} | {tier} | {res_text} | {trust} | {url} |")

if __name__ == "__main__":
    try:
        ensure_environment()
    
        lang_choice = input("Select Language / Sprache wählen (en/de) [default: de]: ").lower().strip()
        lang = 'en' if lang_choice in ['en', 'english'] else 'de'
    
        ComplianceAudit(lang).run()
    except KeyboardInterrupt:
        print("\nExit.")
    except Exception as e:
        print(f'\nError: {e}')
