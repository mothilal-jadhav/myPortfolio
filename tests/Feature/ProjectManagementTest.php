<?php

use App\Models\Media;
use App\Models\Project;
use App\Models\Technology;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

function projectPayload(array $overrides = []): array
{
    return [
        'title' => 'Inventory Tracker',
        'category' => 'Web application',
        'short_description' => 'Tracks stock across warehouses.',
        'details' => 'A longer description.',
        'github_url' => 'https://github.com/example/inventory',
        'live_url' => 'https://inventory.example.test',
        'hue' => 120,
        'is_featured' => false,
        'status' => 'draft',
        'technologies' => ['Laravel', 'React'],
        ...$overrides,
    ];
}

test('the project list shows every project with real totals', function () {
    Project::factory()->count(2)->create();
    Project::factory()->unpublished()->create();

    asAdmin()->get('/admin/projects')->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
        ->component('admin/Projects/Index')
        ->has('projects.data', 3)
        ->where('totals', ['all' => 3, 'published' => 2, 'draft' => 1]));
});

test('the project list can be searched and filtered', function () {
    Project::factory()->create(['title' => 'Weather Station']);
    Project::factory()->unpublished()->create(['title' => 'Chess Engine']);

    asAdmin()->get('/admin/projects?search=weather')->assertInertia(fn (AssertableInertia $page) => $page
        ->has('projects.data', 1)
        ->where('projects.data.0.title', 'Weather Station'));

    $this->get('/admin/projects?status=draft')->assertInertia(fn (AssertableInertia $page) => $page
        ->has('projects.data', 1)
        ->where('projects.data.0.title', 'Chess Engine'));
});

test('the project list is paginated', function () {
    Project::factory()->count(13)->create();

    asAdmin()->get('/admin/projects')->assertInertia(fn (AssertableInertia $page) => $page
        ->has('projects.data', 12)
        ->where('projects.last_page', 2));
});

test('a project can be created as a draft with technologies', function () {
    asAdmin()->post('/admin/projects', projectPayload())->assertSessionHasNoErrors()->assertRedirect();

    $project = Project::query()->firstOrFail();

    expect($project)
        ->title->toBe('Inventory Tracker')
        ->slug->toBe('inventory-tracker')
        ->status->toBe('draft')
        ->published_at->toBeNull()
        ->sort_order->toBe(1)
        ->and($project->technologies->pluck('name')->all())->toBe(['Laravel', 'React']);

    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page->has('projects', 0));
});

test('technologies are reused across projects instead of duplicated', function () {
    asAdmin()->post('/admin/projects', projectPayload());
    $this->post('/admin/projects', projectPayload(['title' => 'Second', 'technologies' => ['laravel', 'Vue']]));

    expect(Technology::query()->count())->toBe(3)
        ->and(Technology::query()->where('slug', 'laravel')->first()->projects()->count())->toBe(2);
});

test('publishing a project sets its publication date and shows it publicly', function () {
    asAdmin()->post('/admin/projects', projectPayload(['status' => 'published']));

    expect(Project::query()->first()->published_at)->not->toBeNull();

    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page
        ->has('projects', 1)
        ->where('projects.0.technologies', ['Laravel', 'React']));
});

test('duplicate titles get distinct slugs', function () {
    asAdmin()->post('/admin/projects', projectPayload());
    $this->post('/admin/projects', projectPayload());

    expect(Project::query()->pluck('slug')->all())->toBe(['inventory-tracker', 'inventory-tracker-2']);
});

test('project validation errors are reported per field', function () {
    asAdmin()->post('/admin/projects', projectPayload([
        'title' => '',
        'short_description' => '',
        'github_url' => 'not a url',
        'live_url' => 'javascript:alert(1)',
        'hue' => 999,
        'status' => 'archived',
        'slug' => 'Not A Slug',
    ]))->assertSessionHasErrors(['title', 'short_description', 'github_url', 'live_url', 'hue', 'status', 'slug']);

    $this->assertDatabaseCount('projects', 0);
});

test('a project can be edited', function () {
    $project = Project::factory()->create(['title' => 'Old title']);
    $project->technologies()->sync(Technology::idsForNames(['PHP']));

    asAdmin()->get("/admin/projects/{$project->id}/edit")->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
        ->component('admin/Projects/Edit')
        ->where('project.title', 'Old title')
        ->where('project.technologies', ['PHP']));

    $this->post("/admin/projects/{$project->id}", projectPayload(['title' => 'New title', 'slug' => $project->slug, 'technologies' => ['Go']]))
        ->assertSessionHasNoErrors();

    expect($project->fresh())
        ->title->toBe('New title')
        ->category->toBe('Web application')
        ->and($project->technologies()->pluck('name')->all())->toBe(['Go']);
});

test('a project can be unpublished and published again', function () {
    $project = Project::factory()->create();

    asAdmin()->patch("/admin/projects/{$project->id}/toggle")->assertRedirect();
    expect($project->fresh()->status)->toBe('draft');
    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page->has('projects', 0));
    $this->get('/projects/'.$project->slug)->assertNotFound();

    $this->patch("/admin/projects/{$project->id}/toggle");
    expect($project->fresh()->status)->toBe('published');
    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page->has('projects', 1));
});

test('a deleted project disappears from the public site', function () {
    $project = Project::factory()->create();
    $project->technologies()->sync(Technology::idsForNames(['PHP']));

    asAdmin()->delete("/admin/projects/{$project->id}")->assertRedirect(route('admin.projects.index'));

    $this->assertDatabaseCount('projects', 0);
    $this->assertDatabaseCount('project_technology', 0);
    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page->has('projects', 0));
});

test('projects can be reordered', function () {
    $first = Project::factory()->create(['sort_order' => 1]);
    $second = Project::factory()->create(['sort_order' => 2]);

    asAdmin()->patch("/admin/projects/{$second->id}/move", ['direction' => 'up']);

    expect($second->fresh()->sort_order)->toBe(1)
        ->and($first->fresh()->sort_order)->toBe(2);

    $this->patch("/admin/projects/{$second->id}/move", ['direction' => 'sideways'])->assertSessionHasErrors('direction');
});

test('an administrator can preview a draft that visitors cannot see', function () {
    $draft = Project::factory()->unpublished()->create(['title' => 'Secret draft']);

    asAdmin()->get("/admin/projects/{$draft->id}/preview")->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
        ->component('public/Project')
        ->where('project.title', 'Secret draft')
        ->where('preview.status', 'draft'));

    auth()->logout();

    $this->get("/admin/projects/{$draft->id}/preview")->assertRedirect(route('login'));
});

test('a thumbnail and gallery images can be uploaded with a project', function () {
    Storage::fake('public');

    asAdmin()->post('/admin/projects', projectPayload([
        'thumbnail_upload' => UploadedFile::fake()->image('cover.png', 800, 600),
        'gallery_uploads' => [UploadedFile::fake()->image('one.jpg'), UploadedFile::fake()->image('two.jpg')],
    ]))->assertSessionHasNoErrors();

    $project = Project::query()->with(['thumbnail', 'images.media'])->firstOrFail();

    expect($project->thumbnail)
        ->original_name->toBe('cover.png')
        ->width->toBe(800)
        ->and($project->images)->toHaveCount(2)
        ->and(Media::query()->count())->toBe(3);

    Media::all()->each(fn (Media $media) => Storage::disk('public')->assertExists($media->getRawOriginal('path')));
});

test('a thumbnail can be replaced with one from the media library and the gallery edited', function () {
    Storage::fake('public');
    $project = Project::factory()->create();
    $old = Media::factory()->create();
    $new = Media::factory()->create();
    $kept = Media::factory()->create();
    $project->update(['thumbnail_id' => $old->id]);
    $project->images()->create(['media_id' => $old->id, 'sort_order' => 1]);
    $project->images()->create(['media_id' => $kept->id, 'sort_order' => 2]);

    asAdmin()->post("/admin/projects/{$project->id}", projectPayload([
        'slug' => $project->slug,
        'thumbnail_id' => $new->id,
        'gallery_ids' => [$kept->id],
    ]))->assertSessionHasNoErrors();

    expect($project->fresh()->thumbnail_id)->toBe($new->id)
        ->and($project->images()->pluck('media_id')->all())->toBe([$kept->id]);
});

test('uploads that are not allowed images are rejected', function (UploadedFile $file) {
    Storage::fake('public');

    asAdmin()->post('/admin/projects', projectPayload(['thumbnail_upload' => $file]))
        ->assertSessionHasErrors('thumbnail_upload');

    $this->assertDatabaseCount('projects', 0);
    $this->assertDatabaseCount('media', 0);
})->with([
    'php script' => fn () => UploadedFile::fake()->create('shell.php', 10, 'application/x-php'),
    'svg' => fn () => UploadedFile::fake()->create('logo.svg', 10, 'image/svg+xml'),
    'pdf as thumbnail' => fn () => UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf'),
    'oversized image' => fn () => UploadedFile::fake()->image('huge.jpg')->size(5000),
]);
