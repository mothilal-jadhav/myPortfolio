<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Only the administrator account is seeded, and only from credentials
     * supplied through the environment. No default password exists and no
     * portfolio content is invented: content is entered through the dashboard.
     */
    public function run(): void
    {
        $email = config('portfolio.admin.email');
        $password = config('portfolio.admin.password');

        if (blank($email) || blank($password)) {
            $this->command?->warn('No administrator was seeded. Set ADMIN_EMAIL and ADMIN_PASSWORD, or run "php artisan portfolio:admin".');

            return;
        }

        if (mb_strlen($password) < 12) {
            $this->command?->error('ADMIN_PASSWORD must be at least 12 characters. No administrator was seeded.');

            return;
        }

        $user = User::query()->firstOrNew(['email' => $email]);
        $user->forceFill([
            'name' => config('portfolio.admin.name'),
            'password' => $password,
            'is_admin' => true,
            'email_verified_at' => $user->email_verified_at ?? now(),
        ])->save();
    }
}
