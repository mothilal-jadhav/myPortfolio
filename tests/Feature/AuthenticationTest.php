<?php

use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Testing\AssertableInertia;

test('the login page is shown to guests', function () {
    $this->get('/login')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component('admin/auth/Login'));
});

test('there is no public registration page', function () {
    $this->get('/register')->assertNotFound();
});

test('an administrator can sign in', function () {
    $admin = User::factory()->admin()->create();

    $this->post('/login', ['email' => $admin->email, 'password' => 'password'])
        ->assertRedirect(route('admin.dashboard'));

    $this->assertAuthenticatedAs($admin);
});

test('a wrong password is rejected with an error on the email field', function () {
    $admin = User::factory()->admin()->create();

    $this->from('/login')
        ->post('/login', ['email' => $admin->email, 'password' => 'not-the-password'])
        ->assertRedirect('/login')
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});

test('login requires an email and a password', function () {
    $this->post('/login', ['email' => 'not-an-email', 'password' => ''])
        ->assertSessionHasErrors(['email', 'password']);
});

test('a user without administrator rights cannot sign in', function () {
    $user = User::factory()->create();

    $this->post('/login', ['email' => $user->email, 'password' => 'password'])
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});

test('sign-in attempts are rate limited', function () {
    $admin = User::factory()->admin()->create();

    foreach (range(1, 5) as $attempt) {
        $this->post('/login', ['email' => $admin->email, 'password' => 'wrong']);
    }

    $this->post('/login', ['email' => $admin->email, 'password' => 'password'])
        ->assertSessionHasErrors('email');

    expect(session('errors')->first('email'))->toContain('Too many sign-in attempts');
    $this->assertGuest();

    RateLimiter::clear(strtolower($admin->email).'|127.0.0.1');
});

test('logging out ends the session and returns to the login page', function () {
    $response = asAdmin()->withSession(['marker' => 'kept'])->post('/logout');

    $response->assertRedirect(route('login'))->assertSessionMissing('marker');
    $this->assertGuest();
});

test('logout only accepts POST requests', function () {
    asAdmin()->get('/logout')->assertMethodNotAllowed();
});

test('guests are redirected to the login page from every admin area', function (string $uri) {
    $this->get($uri)->assertRedirect(route('login'));
})->with([
    '/admin/dashboard', '/admin/profile', '/admin/settings', '/admin/projects', '/admin/projects/create',
    '/admin/media', '/admin/skills', '/admin/skill-categories', '/admin/experiences', '/admin/education',
    '/admin/certifications', '/admin/achievements', '/admin/social-links',
]);

test('signed-in users without administrator rights are forbidden from the admin area', function () {
    $this->actingAs(User::factory()->create());

    $this->get('/admin/dashboard')->assertForbidden();
    $this->get('/admin/projects')->assertForbidden();
    $this->post('/admin/projects', ['title' => 'Nope'])->assertForbidden();
    $this->post('/admin/skills', ['name' => 'Nope'])->assertForbidden();
    $this->post('/admin/profile', ['name' => 'Nope'])->assertForbidden();
    $this->post('/admin/media', [])->assertForbidden();

    $this->assertDatabaseCount('projects', 0);
});

test('guests cannot modify content', function () {
    $this->post('/admin/projects', ['title' => 'Nope'])->assertRedirect(route('login'));
    $this->delete('/admin/skills/1')->assertRedirect(route('login'));

    $this->assertDatabaseCount('projects', 0);
});

test('the administrator flag cannot be mass assigned', function () {
    $user = User::create(['name' => 'A', 'email' => 'a@example.test', 'password' => 'secret-password', 'is_admin' => true]);

    expect($user->fresh()->is_admin)->toBeFalse();
});

test('the seeder does not create an administrator without configured credentials', function () {
    config(['portfolio.admin.email' => null, 'portfolio.admin.password' => null]);

    $this->seed();

    $this->assertDatabaseCount('users', 0);
});

test('the seeder creates the administrator from configured credentials', function () {
    config(['portfolio.admin.email' => 'owner@example.test', 'portfolio.admin.password' => 'a-long-unique-password']);

    $this->seed();

    expect(User::query()->where('email', 'owner@example.test')->first())
        ->not->toBeNull()
        ->is_admin->toBeTrue();
});
