## Portfolio CMS

The public site renders entirely from the database. Content is managed at `/admin` after signing in at `/login`.

### Setup

```bash
composer install && npm install
cp .env.example .env && php artisan key:generate   # then set APP_URL and the MySQL DB_* values
php artisan migrate
php artisan storage:link        # serves uploaded images from /storage
php artisan portfolio:admin     # creates the administrator (prompts for a password, 12+ characters)
npm run build                   # or: composer run dev
```

`php artisan db:seed` creates the administrator from `ADMIN_EMAIL` / `ADMIN_PASSWORD` instead, if you prefer environment variables. There is no default account and no public registration.

Set `APP_URL` to the address the site is served from: uploaded image URLs are built from it.

### Checks

```bash
php artisan test     # feature tests (SQLite in memory)
npm run typecheck
npm run build
```


# Architecutral plan for this portfolio
## Public portfolio
No authentication required
- Home page
- About me
- Skills
- Projects
- Experience
- Education
- Contact information

## Admin dashboard
Authentication required
- Login
- Manage projects
- Manage skills
- Manage experience
- Update portfolio content