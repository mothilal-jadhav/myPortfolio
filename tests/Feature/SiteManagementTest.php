<?php

use App\Models\Experience;
use App\Models\Media;
use App\Models\Profile;
use App\Models\Project;
use App\Models\SiteSetting;
use App\Models\Skill;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

/* ---------- Dashboard ---------- */

test('dashboard statistics are calculated from the database', function () {
    Project::factory()->count(2)->create();
    Project::factory()->unpublished()->create();
    Skill::factory()->count(4)->create();
    Experience::factory()->create(['job_title' => 'Latest change']);

    asAdmin()->get('/admin/dashboard')->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
        ->component('admin/Dashboard')
        ->where('stats.projects', 3)
        ->where('stats.publishedProjects', 2)
        ->where('stats.draftProjects', 1)
        ->where('stats.skills', 4)
        ->where('stats.experiences', 1)
        ->where('stats.education', 0)
        ->where('stats.certifications', 0)
        ->has('recent', 8)
        ->where('auth.user.email', auth()->user()->email)
        ->missing('auth.user.password'));
});

test('an empty dashboard reports zeros and no activity', function () {
    asAdmin()->get('/admin/dashboard')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('stats.projects', 0)
        ->has('recent', 0));
});

/* ---------- Profile ---------- */

test('the profile can be updated and drives the public page', function () {
    Storage::fake('public');

    asAdmin()->post('/admin/profile', [
        'name' => 'Asha Verma',
        'title' => 'Developer',
        'introduction' => 'Hello there.',
        'biography' => 'About me.',
        'email' => 'asha@example.test',
        'location' => 'Pune',
        'primary_cta_label' => 'Work',
        'primary_cta_url' => '#project-section',
        'stats' => [['label' => 'Years', 'value' => '3']],
        'show_calculated_stats' => false,
        'profile_image_upload' => UploadedFile::fake()->image('me.jpg'),
    ])->assertSessionHasNoErrors();

    expect(Profile::query()->count())->toBe(1)
        ->and(Profile::current()->profileImage)->not->toBeNull();

    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('hero.name', 'Asha Verma')
        ->where('about.image.url', fn ($url) => str_contains($url, '/storage/media/'))
        ->where('contact.location', 'Pune'));

    $this->post('/admin/profile', ['name' => 'Asha V.', 'biography' => '', 'show_calculated_stats' => false])->assertSessionHasNoErrors();

    expect(Profile::query()->count())->toBe(1)
        ->and(Profile::current())->name->toBe('Asha V.')->biography->toBeNull()->stats->toBe([]);
});

test('profile validation rejects unsafe links and bad email addresses', function () {
    asAdmin()->post('/admin/profile', [
        'email' => 'nope',
        'primary_cta_label' => 'Go',
        'primary_cta_url' => 'javascript:alert(1)',
        'secondary_cta_label' => 'Missing link',
        'show_calculated_stats' => false,
    ])->assertSessionHasErrors(['email', 'primary_cta_url', 'secondary_cta_url']);
});

/* ---------- Settings ---------- */

test('site settings can be saved', function () {
    $sections = collect(SiteSetting::SECTION_KEYS)->reverse()->values()
        ->map(fn (string $key) => ['key' => $key, 'visible' => $key !== 'skills'])->all();

    asAdmin()->post('/admin/settings', [
        'site_title' => 'My Site',
        'accent_color' => '#3b82f6',
        'footer_text' => '© Me',
        'sections' => $sections,
    ])->assertSessionHasNoErrors();

    $settings = SiteSetting::current();

    expect($settings->accent_color)->toBe('#3b82f6')
        ->and($settings->orderedSections()[0])->toBe(['key' => 'contact', 'visible' => true])
        ->and(collect($settings->orderedSections())->firstWhere('key', 'skills')['visible'])->toBeFalse();

    $this->get('/admin/settings')->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
        ->component('admin/Settings/Edit')
        ->where('settings.site_title', 'My Site')
        ->has('settings.sections', 8));
});

test('settings validation rejects invalid colours and section lists', function () {
    asAdmin()->post('/admin/settings', [
        'accent_color' => 'red; background:url(x)',
        'sections' => [['key' => 'unknown', 'visible' => true]],
    ])->assertSessionHasErrors(['accent_color', 'sections']);
});

/* ---------- Media ---------- */

test('files can be uploaded to the media library', function () {
    Storage::fake('public');

    asAdmin()->post('/admin/media', ['files' => [
        UploadedFile::fake()->image('photo.jpg', 640, 480),
        UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf'),
    ]])->assertSessionHasNoErrors();

    expect(Media::query()->count())->toBe(2);

    $this->get('/admin/media')->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
        ->component('admin/Media/Index')
        ->has('media.data', 2)
        ->where('media.data.0.usages', [])
        ->missing('media.data.0.path'));
});

test('the media library rejects disallowed and oversized files', function () {
    Storage::fake('public');

    asAdmin()->post('/admin/media', ['files' => [UploadedFile::fake()->create('run.exe', 10, 'application/octet-stream')]])
        ->assertSessionHasErrors('files.0');
    $this->post('/admin/media', ['files' => [UploadedFile::fake()->create('page.html', 10, 'text/html')]])
        ->assertSessionHasErrors('files.0');
    $this->post('/admin/media', ['files' => [UploadedFile::fake()->image('big.png')->size(6000)]])
        ->assertSessionHasErrors('files.0');
    $this->post('/admin/media', [])->assertSessionHasErrors('files');

    $this->assertDatabaseCount('media', 0);
});

test('unused media can be deleted together with its file', function () {
    Storage::fake('public');
    asAdmin()->post('/admin/media', ['files' => [UploadedFile::fake()->image('photo.jpg')]]);
    $media = Media::query()->firstOrFail();
    $path = $media->getRawOriginal('path');

    $this->delete("/admin/media/{$media->id}")->assertSessionHas('success');

    $this->assertDatabaseCount('media', 0);
    Storage::disk('public')->assertMissing($path);
});

test('media that is still in use cannot be deleted', function () {
    Storage::fake('public');
    $media = Media::factory()->create();
    Project::factory()->create(['title' => 'Uses it', 'thumbnail_id' => $media->id]);

    asAdmin()->delete("/admin/media/{$media->id}")->assertSessionHas('error', fn (string $message) => str_contains($message, 'Project: Uses it'));

    $this->assertDatabaseCount('media', 1);
});

test('a file can be replaced in place so every reference keeps working', function () {
    Storage::fake('public');
    asAdmin()->post('/admin/media', ['files' => [UploadedFile::fake()->image('old.jpg', 100, 100)]]);
    $media = Media::query()->firstOrFail();
    $oldPath = $media->getRawOriginal('path');
    $project = Project::factory()->create(['thumbnail_id' => $media->id]);

    $this->post("/admin/media/{$media->id}", ['alt_text' => 'New cover', 'file' => UploadedFile::fake()->image('new.png', 300, 200)])
        ->assertSessionHasNoErrors();

    $media->refresh();

    expect($media)->original_name->toBe('new.png')->width->toBe(300)->alt_text->toBe('New cover')
        ->and($project->fresh()->thumbnail_id)->toBe($media->id);

    Storage::disk('public')->assertMissing($oldPath);
    Storage::disk('public')->assertExists($media->getRawOriginal('path'));
});
