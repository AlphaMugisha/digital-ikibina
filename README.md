# Digital Ikibina

## Overview

Digital Ikibina is a web application codebase built with Next.js and TypeScript. Its repository includes authentication modules, application components, internationalization messages, Prisma database files, and a Vitest configuration.

## Mission

Support the digitization of community savings groups (ikimina) by providing a structured online platform for group-related activities.

## Goals

- Provide a clear and reliable foundation for user access and account management.
- Organize the application around group workflows and the needs of its intended members.
- Keep data access and authentication rules explicit and maintainable.
- Support the languages represented in the internationalization resources.
- Use automated tests to improve confidence as features evolve.

## Technology

- Next.js and React
- TypeScript
- Prisma
- Vitest
- CSS and the project's configured UI components

## Getting started

Requirements: Node.js, npm, and a database configured for the Prisma schema.

```bash
npm install
```

Create a local environment file based on `.env.example`, fill in the required values privately, then run the scripts defined in `package.json`. Never commit real credentials. Check the Prisma configuration and migrations before starting the application.

## Repository structure

- `app/` — Next.js routes and application pages
- `components/` — reusable interface components
- `i18n/` and `messages/` — internationalization configuration and translations
- `prisma/` — database schema and related files
- `lib/` — shared application utilities
- `types/` — TypeScript types
- `vitest.config.ts` — test configuration

## Development priorities

Keep the README aligned with implemented group workflows, document database setup and migrations, and run the available tests before releases.
