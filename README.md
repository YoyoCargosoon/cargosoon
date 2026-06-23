# CargoSoon

CargoSoon is now organized for a clearer environment flow:

- `local`: fixed-port development on `http://localhost:5173`
- `test`: public preview deployments for teammates
- `production`: the future formal domain

## Environment Flow

`local development` -> `Vercel test deployment` -> `production domain`

This avoids relying on localhost for team review and makes the project easier to deploy without changing code between environments.

## Local Development

Install dependencies:

```sh
npm install
```

Start the normal dev server:

```sh
npm run dev
```

This project is configured to:

- always use port `5173`
- stop immediately if `5173` is already occupied
- avoid silently jumping to `5174`, `5175`, and other ports

If port `5173` is occupied by an old process, run:

```sh
npm run dev:clean
```

If you want the browser to open automatically:

```sh
npm run dev:open
```

## Stable Local Access

After the dev server starts successfully, use:

[http://localhost:5173](http://localhost:5173)

If that address does not open, it should now mean one of only two things:

- the dev server is not running
- another process is blocking port `5173`

It should no longer auto-switch to a different port.

## Why Localhost Cannot Be Shared With Teammates

`localhost` only works on your own computer.

That means:

- teammates cannot open your `localhost:5173`
- links stop working as soon as your local server stops
- random port changes create confusion during testing

For teammate testing, use a public deployment instead of localhost.

## Build And Preview

Create a production build:

```sh
npm run build
```

Preview the built app locally:

```sh
npm run preview
```

## Deploy To Vercel

Recommended setup:

1. Push the repository to GitHub
2. Import the repository into Vercel
3. Keep the framework preset as `Vite`
4. Build command:

```sh
npm run build
```

5. Output directory:

```sh
dist
```

The repo is now prepared so you can push it directly and deploy without changing code for the test environment.

## Share A Test Link With Teammates

Use this flow:

1. Commit your current changes
2. Push to GitHub
3. Let Vercel build the latest version
4. Send the Vercel preview URL to teammates

That test link is stable for review and does not depend on your machine staying online.

## Suggested Team Workflow

- use `npm run dev` for daily coding
- use `npm run dev:clean` when port `5173` is occupied
- use `npm run dev:open` when you want the browser launched automatically
- use Vercel preview URLs for colleague testing
- use the formal domain later for production
