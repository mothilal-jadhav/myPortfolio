# Mothilal Jadhav — Portfolio

A personal portfolio site and content management system built with Laravel, React, TypeScript, and Inertia. Public portfolio content is stored in the database and maintained through an authenticated admin area.

## Features

### Public portfolio

- Responsive home page with profile, skills, projects, experience, education, certifications, achievements, and contact sections.
- Project detail pages at `/projects/{slug}`.
- Only published content is included in public pages. Draft projects and unpublished records are hidden.
- Social links, site identity, and accent settings are managed through the CMS.

### Admin CMS

- Email and password sign-in at `/login`; admin dashboard at `/admin/dashboard`.
- Manage profile, projects, skill categories, skills, work experience, education, certifications, achievements, social links, media, and site settings.
- Create and edit projects, upload images, add gallery images and technologies, set display order, preview drafts, and publish or unpublish content.
- Media library for image and PDF uploads.
- There is no public registration. Existing and newly created accounts are not administrators by default.

## Technology

- PHP 8.3 or later and Laravel 13
- MySQL or SQLite
- Inertia.js 3, React 19, and TypeScript
- Vite 8 and Tailwind CSS 4
- Pest 5 for feature tests

## Requirements

Install PHP, Composer, Node.js, and npm. The repository includes `composer.lock` and `package-lock.json` for reproducible dependency installs.

## Local setup

From the project root:

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
```

The example environment uses SQLite. Ensure the SQLite database file exists (the repository's `database/database.sqlite` is created by Laravel setup where needed), then run:

```bash
php artisan migrate
php artisan storage:link
```

For MySQL, set `DB_CONNECTION=mysql` and the `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` values in `.env` before migrating. Set `APP_URL` to the URL where the app runs; uploaded media URLs use it.

Create an administrator interactively:

```bash
php artisan portfolio:admin
```

The command prompts for a name, email, and password of at least 12 characters. It can also be run with `--name`, `--email`, and `--password` options. To create or update an administrator through the database seeder instead, set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `.env` (password must be at least 12 characters), then run:

```bash
php artisan db:seed
```

The seeder does not create an administrator when those credentials are empty. Never commit `.env` or put real credentials in source control.

Run the application in development with the backend and Vite server available:

```bash
php artisan serve
npm run dev
```

Open the URL shown by `php artisan serve`. Visit `/login` to sign in and `/admin/dashboard` for CMS management.

## Configuration and uploads

- Application and database settings are read from `.env`; `.env.example` contains development defaults.
- Uploaded images and PDFs are stored on Laravel's `public` disk under `storage/app/public/media` and served through the `public/storage` link.
- Upload validation allows JPG, PNG, WebP, and GIF images; the media library also accepts PDFs. SVG uploads are not accepted. The maximum upload size is 4 MB per file.
- `php artisan storage:link` is required for uploaded media to appear in the browser.

## Project structure

```text
app/
  Console/Commands/       Admin account setup command
  Http/Controllers/       Public, auth, and admin request handling
  Http/Requests/          Form request validation
  Models/                 Eloquent content models and relationships
  Support/                Media upload and portfolio presentation logic
database/
  migrations/             Schema and existing project-table extension
  factories/              Model factories, including test data
resources/
  js/components/admin/    Reusable CMS fields, media picker, and UI
  js/components/public/   Public site sections, navigation, and behavior
  js/layouts/             Admin application layout
  js/pages/               Inertia admin and public pages
  css/app.css             Public and admin styling
routes/web.php            Public, authentication, and protected admin routes
tests/Feature/            Authentication, CMS, project, and public-page tests
```

## Routes at a glance

| URL | Purpose | Access |
| --- | --- | --- |
| `/` | Public portfolio | Public |
| `/projects/{slug}` | Published project detail | Public |
| `/login` | Admin sign-in | Guest |
| `/admin/dashboard` | CMS dashboard | Authenticated administrator |
| `/admin/profile` | Profile management | Authenticated administrator |
| `/admin/projects` | Project management | Authenticated administrator |
| `/admin/skill-categories`, `/admin/skills` | Skills management | Authenticated administrator |
| `/admin/experiences`, `/admin/education` | Career and education management | Authenticated administrator |
| `/admin/certifications`, `/admin/achievements` | Credentials and achievements | Authenticated administrator |
| `/admin/social-links`, `/admin/media`, `/admin/settings` | Links, uploads, and site settings | Authenticated administrator |

Admin routes require both an authenticated session and the `access-admin` gate. The `is_admin` column defaults to `false`; the CMS setup migration does not promote existing accounts. Use the explicit admin command or credential-based seeder to grant admin access.

## Database notes

Run `php artisan migrate` to create the CMS tables. The project migration extends the existing `projects` table and maps the previous tag and description fields into category and short description. Existing projects receive slugs and are marked published to preserve their public visibility. The admin flag migration defaults to non-admin for existing users. Migrations include rollback methods; review changes against your database backup policy before deployment.

Do not run migrations against production until the deployment environment and database backup are ready. Use `php artisan migrate:status` to inspect migration state and `php artisan migrate --force` only as part of an intentional production deployment.

## Checks

```bash
php artisan route:list
php artisan migrate:status
php artisan test
npm run typecheck
npm run build
```

Feature tests cover admin authentication and authorization, content management, project workflows, site settings, and public visibility rules. The test environment uses SQLite in memory.

## Production checklist

1. Configure production `.env` values and a supported database.
2. Back up the database, then run `php artisan migrate --force` during deployment.
3. Run `npm ci && npm run build` and deploy the generated `public/build` assets.
4. Ensure `storage/app/public` is persistent and the public storage link is available.
5. Create the administrator using `php artisan portfolio:admin` in the secured deployment environment.
6. Set `APP_DEBUG=false` and use HTTPS with a production-ready session and cache configuration.
