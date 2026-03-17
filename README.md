# ScrubInbox

A free, open source tool to declutter your Gmail inbox. Scan your inbox by sender domain and bulk delete thousands of promotional emails, newsletters, and spam in minutes.

**Your emails never leave your browser.** This app runs entirely client-side. No server processes your data.

[![CI](https://github.com/scrubinbox/scrubinbox.com/actions/workflows/ci.yml/badge.svg)](https://github.com/scrubinbox/scrubinbox.com/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why?

Paid inbox cleaners exist, but they cost money and require handing over access to a third party. ScrubInbox runs entirely in your browser -- your Gmail data never touches a server. It uses the Gmail API to scan your inbox by sender domain and lets you bulk delete thousands of emails at once.

## How It Works

1. **Sign in** with Google to grant temporary, browser-only access
2. **Scan** your inbox -- emails are grouped by sender domain
3. **Review** domains, see email counts and sample subjects
4. **Preview** what will be deleted (dry-run mode)
5. **Delete** unwanted emails in bulk

Starred, important, and labeled emails are automatically protected and won't appear in scan results.

## Privacy & Security

- **100% client-side** -- all Gmail API calls go directly from your browser to Google
- **No backend** -- static site, no server to intercept your data
- **Token in memory only** -- expires after ~1 hour, never persisted
- **Open source** -- inspect every line of code

## Development

### Prerequisites

- Node.js 20+
- A Google Cloud project with Gmail API enabled and an OAuth client ID ([setup guide](https://console.cloud.google.com/))

### Setup

```bash
cp .env.example .env
# Add your VITE_GOOGLE_CLIENT_ID to .env

npm install
npm run dev
```

### Test & Build

```bash
npm test
npm run build
```

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Disclaimer

This tool modifies your Gmail inbox. Always use preview mode first and review selections carefully. **Use at your own risk.**

## License

[MIT](LICENSE)
