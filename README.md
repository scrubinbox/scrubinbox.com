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

Starred and labeled emails are automatically protected and won't appear in scan results.

### Why not exclude "Important" emails?

Gmail's `IMPORTANT` label is applied automatically by Google's priority inbox algorithm -- it is not an explicit user action. In practice, Gmail marks the vast majority of inbox threads as important, so excluding them would silently discard nearly all scan results. `STARRED`, by contrast, is always a deliberate user action, so starred threads are always excluded.

### Why client-side filtering?

Thread filtering (label exclusion, starred exclusion) is done client-side after fetching threads from the Gmail API rather than via Gmail query operators like `-is:important` or `-label:Name`. We found that Gmail's search operators behave inconsistently with the label data returned by the API -- for example, `is:important` in a query matches far more threads than those that actually carry the `IMPORTANT` label ID in the API response. Label names with spaces, nesting (`Parent/Child`), or special characters also cause query syntax issues. Client-side filtering against the actual `labelIds` returned by `threads.get` is reliable and predictable.

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
