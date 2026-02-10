# Trust Sources

This project uses two evidence layers for trust scoring:

1. Automated vendor-wide web signal crawl (`src/data/trustWebSignals.ts`)
2. Manual reservations for high-impact risks (`src/data/trustOverrides.ts`)

The web signal layer is generated from live vendor websites with:

```bash
npm run generate:trust-signals
```

It checks each listed vendor for privacy, open-source, encryption, self-hosting, audit, and no-logs signals.

## Manual Reservation Sources

- Bitwarden legal jurisdiction:
  - https://bitwarden.com/help/terms/
- Bitwarden October 2024 licensing incident:
  - https://github.com/bitwarden/clients/issues/11611
- Filen audit status:
  - https://github.com/FilenCloudDienste/filen-roadmap/issues/104
- Mastodon private mentions (not end-to-end encrypted):
  - https://docs.joinmastodon.org/user/posting/#private
- Proton Mail 2021 court-order logging case:
  - https://proton.me/blog/climate-activist-arrest
- Startpage / System1 ownership change:
  - https://support.startpage.com/hc/en-us/articles/4455577632788-How-has-Startpage-responded-to-the-privacy-community-s-concerns-about-System1
- Mistral / Microsoft 2024 deal:
  - https://www.reuters.com/world/europe/french-ai-startup-mistral-signs-distribution-deal-with-microsoft-2024-02-26/
- NordVPN 2018 breach disclosure timeline:
  - https://www.bbc.com/news/technology-50150981
- Stability AI litigation:
  - https://apnews.com/article/stability-ai-lawsuit-midjourney-deviantart-artists-6217bcd9f7f6f095ac3c7bcd9deabfce
- Stability AI community license restrictions:
  - https://stability.ai/community-license-agreement
- Stability AI governance turbulence (2024):
  - https://www.reuters.com/world/uk/ai-start-up-stability-ai-ceo-mostaque-steps-down-information-reports-2024-03-22/
