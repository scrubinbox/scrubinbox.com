# Contributing to ScrubInbox

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

1. Fork and clone the repo
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and add your `VITE_GOOGLE_CLIENT_ID`
4. Start the dev server: `npm run dev`
5. Run tests: `npm test`

## Submitting Changes

1. Create a branch from `main`
2. Make your changes and add tests if applicable
3. Ensure all tests pass (`npm test`)
4. Open a pull request with a title that starts with a semantic prefix:
   - `feature:` A new feature
   - `bugfix:` A bug fix
   - `docs:` Documentation only changes
   - `style:` Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
   - `refactor:` A code change that neither fixes a bug nor adds a feature
   - `perf:` A code change that improves performance
   - `test:` Adding missing tests or correcting existing tests
   - `build:` Changes that affect the build system or external dependencies
   - `ci:` Changes to CI configuration files and scripts
   - `chore:` Other changes that don't modify src or test files
   - `revert:` Reverts a previous commit

For major changes, please open an issue first to discuss.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
