# Sensitive Data Censor

A local-first desktop app that detects and masks secrets in text — connection strings, API keys, tokens, tunnel URLs, PII and more — before they leak into chats, tickets, screenshots, or pasted logs.

**Everything runs on your machine. No text is ever sent anywhere.** Detection is pure regex inside the app; the clipboard never leaves your computer.

Built with [Electron](https://www.electronjs.org/).

---

## Features

- **One-click censoring** — paste text, get a masked copy with a live count of what was hit.
- **Auto-censor while typing** — output updates as you type or edit your custom rules.
- **Clipboard interception** — `Ctrl+C` / `Ctrl+V` inside the app are automatically censored before they hit the clipboard.
- **Background clipboard monitor** — optionally watch the system clipboard (every 250 ms) and auto-censor anything copied from *any* app.
- **Custom rules** — comma-separated words, regex, or `key=value` patterns.
- **Configurable mask styles** — fixed `****`, same-length `•••••`, show-last-4 `****1234`, or `[REDACTED]`.
- **Persistent settings** — your custom words, mask style, and detector toggles are saved to your local profile automatically.
- **Lives in the system tray** — closing the window hides it to the tray instead of quitting.

---

## Built-in detectors

| Detector | Catches | Default |
|---|---|:--:|
| DB connection creds | `mongodb://`, `postgres://`, `mysql://`, `redis://`, … `user:pass@host` | ✅ |
| DB creds (key=value / JDBC) | `uid=…;pwd=…` style params | ✅ |
| `.env` file vars | `*_USERNAME`, `*_PASSWORD`, `*_SECRET`, `DATABASE_URL`, `DSN`, … | ✅ |
| Secret / key / token / client id (key=value) | `password=`, `api_key=`, `token=`, `client_id=`, `client_secret=`, `webhook=`, … | ✅ |
| Slack incoming webhook URLs | `https://hooks.slack.com/services/…` | ✅ |
| ngrok tunnel URLs | `*.ngrok.io`, `*.ngrok-free.app`, `*.ngrok.app`, `*.ngrok.dev` | ✅ |
| Cloudflare tunnel URLs | `*.trycloudflare.com`, `*.cfargotunnel.com` | ✅ |
| Slack tokens | `xoxb-`, `xoxp-`, `xapp-`, … | ✅ |
| Telegram bot tokens | `123456789:AA…` | ✅ |
| GitHub tokens | `ghp_`, `gho_`, `github_pat_…` | ✅ |
| Google API keys | `AIza…` | ✅ |
| OAuth client IDs | `…apps.googleusercontent.com` | ✅ |
| Stripe keys | `sk_live_`, `pk_test_`, `rk_…` | ✅ |
| Bearer / Basic auth tokens | `Authorization: Bearer …` | ✅ |
| AWS access key | `AKIA…` | ✅ |
| JWT tokens | `eyJ….….…` | ✅ |
| IPv4 addresses | `203.0.113.5` | ✅ |
| Email addresses | `user@example.com` | ✅ |
| Phone numbers | `+1 (555) 123-4567` | ⬜ |
| Credit card numbers | 13–16 digit PANs | ✅ |
| US SSN | `###-##-####` | ✅ |
| Private key blocks | `-----BEGIN … PRIVATE KEY-----` | ✅ |

Each detector can be toggled on/off in the UI, and your choices are remembered.

---

## Custom rules

Enter rules in the **Custom words / patterns** field, comma-separated. Three forms are supported:

| Form | Example | Effect |
|---|---|---|
| Plain word | `ProjectX` | Masks every occurrence of `ProjectX` |
| Regex | `internal-\d+` | Masks anything matching the pattern |
| `key=value` | `MY_API_KEY=` or `slack_hook:` | Masks only the **value** after the key, preserving the key, separator, and quotes |

`key=value` rules match `=` or `:`, quoted or unquoted values, and `export KEY=…` forms.

Click **💾 Save Words** to persist them to your profile.

---

## Mask styles

| Style | Output for `hunter2` |
|---|---|
| `**** (fixed)` | `****` |
| Same length | `•••••••` |
| Show last 4 | `***er2` |
| `[REDACTED]` | `[REDACTED]` |

---

## Getting started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS recommended)

### Install & run

```bash
npm install
npm start
```

### Build a Windows installer

```bash
npm run dist
```

The NSIS installer is written to `dist/Sensitive Data Censor Setup <version>.exe`, with the raw app in `dist/win-unpacked/`.

---

## How it works

| File | Role |
|---|---|
| `main.js` | Electron main process — window, system tray, settings/word persistence, native clipboard IPC |
| `preload.js` | Secure `contextBridge` exposing a minimal `electronAPI` to the renderer |
| `renderer/index.html` | The entire UI and the regex-based censor engine |

Settings and custom words are stored as JSON in Electron's per-user `userData` directory:

- `custom-words.json` — your saved custom rules
- `settings.json` — mask style, detector toggles, clipboard intercept & monitor state

---

## Privacy

This tool is **offline by design**. It makes no network requests and contains no telemetry. All detection happens locally via regular expressions; clipboard contents are read and written only on your machine.

> ⚠️ Regex-based detection is best-effort. It will catch common secret formats but is **not** a guarantee that all sensitive data has been removed. Always review censored output before sharing.

---

## License

Add a license of your choice (e.g. MIT) before distributing.
