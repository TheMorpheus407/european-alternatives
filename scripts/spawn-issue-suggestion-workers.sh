#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

for tool in opencode; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "Missing required tool: $tool" >&2
    exit 1
  fi
done

AGENT="${AGENT:-build}"
MODEL="${MODEL:-}"
VARIANT="${VARIANT:-minimal}"
MAX_PARALLEL="${MAX_PARALLEL:-1}"
SPAWN_DELAY_SECONDS="${SPAWN_DELAY_SECONDS:-2}"
DRY_RUN="${DRY_RUN:-0}"
WAIT_FOR_COMPLETION="${WAIT_FOR_COMPLETION:-1}"
WORKER_TIMEOUT_SECONDS="${WORKER_TIMEOUT_SECONDS:-1800}"

PROMPT_DIR="${PROMPT_DIR:-$REPO_ROOT/tmp/prompts/issue-alternatives}"
LOG_DIR="${LOG_DIR:-$REPO_ROOT/tmp/issue-alternative-workers}"
REPORT_DIR="${REPORT_DIR:-$LOG_DIR/reports}"
SPAWN_LOG="$LOG_DIR/spawn.log"
PIDS_FILE="$LOG_DIR/pids.txt"

mkdir -p "$PROMPT_DIR" "$LOG_DIR" "$REPORT_DIR"
: > "$PIDS_FILE"

normalize_key() {
  local value="$1"
  echo "$value" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+//g'
}

slugify() {
  local value="$1"
  value="$(echo "$value" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//; s/-+/-/g')"
  if [[ -z "$value" ]]; then
    value="suggestion"
  fi
  echo "$value"
}

running_jobs() {
  jobs -pr | wc -l | tr -d ' '
}

build_prompt() {
  local issue_number="$1"
  local issue_url="$2"
  local suggestion="$3"
  local report_file="$4"

  local prompt
  prompt="$(cat <<'PROMPT_TEMPLATE'
You are working in this repository: __REPO_ROOT__

Task:
- Process alternative suggestion "__SUGGESTION__" from open issue #__ISSUE_NUMBER__:
  __ISSUE_URL__

Goal:
- Decide exactly one outcome:
  A) ACCEPT_INCLUDE_PENDING
  B) DENY
  C) US_VENDOR_ONLY

Mandatory workflow:
1) Read the full issue body and all comments first.
2) Read and apply:
   - DECISION_MATRIX.md
   - DENIED_ALTERNATIVES.md
3) Run duplicate checks in:
   - src/data/manualAlternatives.ts
   - src/data/researchAlternatives.ts
4) Do BIG web research before editing anything:
   - Use at least 4 sources.
   - Must include official website plus official docs/repo or legal/about page.
   - Include independent corroborating sources where relevant.
5) Do an internal 2-pass process:
   - Pass 1: Researcher (collect facts + proposed outcome)
   - Pass 2: Reviewer (challenge facts and decision)
   - If tooling does not support separate agents, emulate this with an explicit self-review section in your report.
6) Apply gateway checks G1-G8 and choose exactly one outcome:
   - ACCEPT_INCLUDE_PENDING:
     - Add to src/data/researchAlternatives.ts (preferred) unless src/data/manualAlternatives.ts is clearly better.
     - Insert at the correct place in the existing array (keep ordering by id with nearby neighbors).
     - Use minimal targeted edit; do not rewrite large unrelated sections.
     - Fill standard fields with evidence-backed values.
     - Add logo in public/logos/<id>.svg when feasible; if not feasible, document why.
     - Keep trust score pending only.
   - DENY:
     - Do not add the alternative to manualAlternatives/researchAlternatives.
     - Explain the exact failing gateway criteria and cite sources.
   - US_VENDOR_ONLY:
     - Use this when the suggestion is not an eligible alternative but is a US product that should appear in replacements.
     - Add/update src/data/usVendors.ts (US_VENDOR_RECORDS only) with minimal edit at the correct place.
     - Do not add to manualAlternatives/researchAlternatives.
7) Trust-scoring constraints (hard rule):
   - Keep the result Trust Score Pending.
   - Do NOT add scoring metadata, positive signals, trust overrides, or vetted worksheets.
   - Do NOT edit:
     - src/data/scoringData.ts
     - src/data/positiveSignals.ts
     - src/data/trustOverrides.ts
     - tmp/vetted/*
8) Persistence verification (mandatory):
   - After editing, verify your change exists in the target file at exactly one insertion point.
   - In report, include the inserted id and the previous + next id (or surrounding keys) to prove correct placement.
   - If the edit did not persist, mark outcome as FAILED (not ADDED) and explain why.
9) Save report to:
   __REPORT_FILE__
10) Commit rule:
   - If outcome is ACCEPT_INCLUDE_PENDING or US_VENDOR_ONLY and you changed tracked project files, create exactly one commit for this suggestion only.
   - The commit must include only files related to this single suggestion (entry/logo/us-vendor/report), nothing unrelated.
   - Commit message: `add pending suggestion: <id> (issue #__ISSUE_NUMBER__)`
   - If outcome is DENY or FAILED, do not commit.

Batch-mode execution note:
- Do NOT run global repo validation commands (`npm run build`, `npm run lint`, `tsc`) in this worker.
- Focus only on the issue analysis, research, and targeted file edits/reporting.
- Do not perform broad refactors or formatting-only rewrites.

Report format:
- Issue and suggestion
- Decision (ACCEPT_INCLUDE_PENDING, DENY, or US_VENDOR_ONLY)
- Gateway check summary (G1-G8)
- Changed files
- Evidence links used
- Reviewer pass / validation notes
PROMPT_TEMPLATE
)"

  prompt="${prompt//__REPO_ROOT__/$REPO_ROOT}"
  prompt="${prompt//__SUGGESTION__/$suggestion}"
  prompt="${prompt//__ISSUE_NUMBER__/$issue_number}"
  prompt="${prompt//__ISSUE_URL__/$issue_url}"
  prompt="${prompt//__REPORT_FILE__/$report_file}"

  printf '%s\n' "$prompt"
}

# Snapshot date: 2026-02-23
# Source: all currently open issues in TheMorpheus407/european-alternatives
readarray -t RAW_SUGGESTIONS <<'EOF'
182|overlayer
181|Infomaniak
180|Otto.de
177|Zammad
175|ioBroker
170|AliasVault
166|Sailfish OS
162|Firefox
162|Brave
161|Tor Browser
160|FreeOffice
159|TeleGuard
158|DNS4EU
158|Quad9
156|Super Productivity
156|Vikunja
154|Thaura
151|Unraid
150|SoftMaker Office
147|Rclone
146|BorgBackup
145|Restic
144|Duplicati
141|GitLab
140|GitLab by Stackhero
139|Gitea
138|Forgejo
135|OpenCloud
134|Kagi
131|Qobuz
130|Codeberg
129|Signal
129|Matrix
129|Rocket.Chat
129|Zulip
129|Mattermost
129|Discourse
128|F-Droid
128|Neo Store
128|Aurora Store
127|Aves Gallery
126|e/OS
125|QGIS
124|Etar
123|ipv64.net
122|Liberapay
119|LineageOS
115|Mapy.com
114|Overleaf
113|HedgeDoc
110|Koofr
109|Open Telekom Cloud
108|STACKIT
109|netzbremse.de
105|GIMP
105|DaVinci Resolve
105|Shotcut
105|Kdenlive
102|Wave Terminal
101|LocalSend
100|Obsidian
100|Trilium
100|Org-roam
100|Neorg
99|KeePass
99|KeePassXC
97|heylogin
96|Radicle
95|CyberGhost VPN
90|DeepL
89|plankton.social
86|Bitwarden
86|HERE WeGo
86|2FAS
85|BigBlueButton
85|bbbserver.com
84|Surfshark VPN
80|Loops
79|LibreWolf
79|Mullvad Browser
78|Piwik PRO
77|All-inkl
76|HiDrive
76|Hetzner Cloud
76|STRATO Mail
76|Vivaldi Mail
76|FreeBSD
76|Jellyfin
73|Contabo
72|LanguageTool
69|Paperless-ngx
67|DeltaMaster
67|Datawrapper
66|Keet
66|Pubky
65|CoMaps
64|FairEmail
64|K-9 Mail
63|Aegis Authenticator
62|alfaview
60|GrapheneOS
57|grommunio
56|Proxmox VE
53|TimeScribe
52|Fluxer
52|Stoat Chat
52|Revolt
49|Talos Linux
46|NetBird
45|Mojeek
44|dashserv.io
44|aitch.systems
44|ph24.io
44|datalix.de
43|SearXNG
42|Ladybird Browser
41|Netcup
40|TeamSpeak
38|Nostr
38|Zapstore
38|Ghostfolio
38|Nextcloud
38|Immich
38|Paperless
38|Magic Earth
38|Fountain
38|Amethyst
38|Primal
37|Stalwart Mail Server
37|mailcow
35|Vaultwarden
35|Bitwarden Unified
34|Penpot
33|Authentik
33|Authelia
33|Keycloak
32|WeTransfer
32|SwissTransfer
31|Proton 2FA
31|Ente Auth
30|XMPP
30|Gajim
30|Conversations
28|Cryptomator
27|Fairphone
27|SHIFT Phone
27|Jolla Phone
27|Volla Phone
26|goneo
24|Hetzner Storage Share
24|Hetzner Storage Box
23|Delta Chat
22|Feeder
22|Read You
22|FreshRSS
22|Glance
21|OpenCal
20|Nextcloud Talk
11|Bielik.ai
EOF

declare -A seen
declare -a SUGGESTIONS=()

for row in "${RAW_SUGGESTIONS[@]}"; do
  [[ -z "$row" ]] && continue
  IFS='|' read -r issue_number suggestion <<< "$row"
  if [[ -z "${issue_number:-}" || -z "${suggestion:-}" ]]; then
    continue
  fi
  key="$(normalize_key "$suggestion")"
  if [[ -n "${seen[$key]:-}" ]]; then
    continue
  fi
  seen[$key]="$issue_number"
  SUGGESTIONS+=("${issue_number}|${suggestion}")
done

total="${#SUGGESTIONS[@]}"
if [[ "$total" -eq 0 ]]; then
  echo "No suggestions to process."
  exit 0
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Spawning $total opencode workers (agent=$AGENT, max_parallel=$MAX_PARALLEL)" | tee -a "$SPAWN_LOG"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] wait_for_completion=$WAIT_FOR_COMPLETION timeout=${WORKER_TIMEOUT_SECONDS}s" | tee -a "$SPAWN_LOG"
if [[ "$WAIT_FOR_COMPLETION" == "1" && "$MAX_PARALLEL" -gt 1 ]]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: parallel writes to shared files may cause edit conflicts." | tee -a "$SPAWN_LOG"
fi

for idx in "${!SUGGESTIONS[@]}"; do
  display_index=$((idx + 1))
  IFS='|' read -r issue_number suggestion <<< "${SUGGESTIONS[$idx]}"
  issue_url="https://github.com/TheMorpheus407/european-alternatives/issues/${issue_number}"
  slug="$(slugify "$suggestion")"
  if [[ -z "$slug" ]]; then
    slug="issue-${issue_number}-${display_index}"
  fi

  prompt_file="$PROMPT_DIR/$(printf '%03d' "$display_index")-issue-${issue_number}-${slug}.txt"
  worker_log="$LOG_DIR/$(printf '%03d' "$display_index")-issue-${issue_number}-${slug}.log"
  report_file="$REPORT_DIR/issue-${issue_number}-${slug}.md"

  build_prompt "$issue_number" "$issue_url" "$suggestion" "$report_file" > "$prompt_file"

  echo "[$display_index/$total] #$issue_number -> $suggestion" | tee -a "$SPAWN_LOG"

  if [[ "$DRY_RUN" == "1" ]]; then
    continue
  fi

  if [[ "$WAIT_FOR_COMPLETION" == "1" ]]; then
    while (( $(running_jobs) >= MAX_PARALLEL )); do
      wait -n || true
    done
  fi

  cmd=(opencode run "$(cat "$prompt_file")" --dir "$REPO_ROOT" --title "issue-${issue_number}-${slug}" --agent "$AGENT")
  if [[ -n "$MODEL" ]]; then
    cmd+=(--model "$MODEL")
  fi
  if [[ -n "$VARIANT" ]]; then
    cmd+=(--variant "$VARIANT")
  fi

  (
    exit_code=0
    if timeout "$WORKER_TIMEOUT_SECONDS" "${cmd[@]}" >"$worker_log" 2>&1; then
      exit_code=0
    else
      exit_code=$?
    fi

    if [[ "$exit_code" -eq 124 ]]; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] TIMEOUT #$issue_number -> $suggestion (${WORKER_TIMEOUT_SECONDS}s)" >> "$SPAWN_LOG"
    elif [[ "$exit_code" -eq 0 ]]; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] DONE #$issue_number -> $suggestion (exit=0)" >> "$SPAWN_LOG"
    else
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] FAILED #$issue_number -> $suggestion (exit=$exit_code)" >> "$SPAWN_LOG"
    fi
  ) &
  pid=$!
  echo "$pid|$issue_number|$suggestion|$worker_log" >> "$PIDS_FILE"
  echo "  pid=$pid log=$worker_log" | tee -a "$SPAWN_LOG"
  sleep "$SPAWN_DELAY_SECONDS"
done

if [[ "$DRY_RUN" == "1" ]]; then
  echo "Dry run complete. No workers were started."
  exit 0
fi

if [[ "$WAIT_FOR_COMPLETION" != "1" ]]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Spawned all workers in fire-and-forget mode." | tee -a "$SPAWN_LOG"
  echo "PIDs: $PIDS_FILE"
  echo "Logs: $LOG_DIR"
  exit 0
fi

wait
echo "[$(date '+%Y-%m-%d %H:%M:%S')] All workers finished." | tee -a "$SPAWN_LOG"
