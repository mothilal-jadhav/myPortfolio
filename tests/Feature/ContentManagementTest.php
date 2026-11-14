<?php

use App\Models\Achievement;
use App\Models\Certification;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Skill;
use App\Models\SkillCategory;
use App\Models\SocialLink;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

/* ---------- Skill categories ---------- */

test('skill categories can be created, renamed and deleted', function () {
    asAdmin()->post('/admin/skill-categories', ['name' => 'Frontend', 'icon' => 'code', 'is_published' => true])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.skill-categories.index'));

    $category = SkillCategory::query()->firstOrFail();

    $this->post("/admin/skill-categories/{$category->id}", ['name' => 'Front-end', 'is_published' => true])->assertSessionHasNoErrors();
    expect($category->fresh()->name)->toBe('Front-end');

    $this->delete("/admin/skill-categories/{$category->id}")->assertSessionMissing('error');
    $this->assertDatabaseCount('skill_categories', 0);
});

test('category names must be unique', function () {
    SkillCategory::factory()->create(['name' => 'Backend']);

    asAdmin()->post('/admin/skill-categories', ['name' => 'Backend', 'is_published' => true])->assertSessionHasErrors('name');
});

test('a category that still has skills cannot be deleted', function () {
    $skill = Skill::factory()->create();

    asAdmin()->delete("/admin/skill-categories/{$skill->skill_category_id}")->assertSessionHas('error');

    $this->assertDatabaseCount('skill_categories', 1);
    $this->assertDatabaseCount('skills', 1);
});

/* ---------- Skills ---------- */

test('a skill can be created in a category and appears publicly', function () {
    $category = SkillCategory::factory()->create(['name' => 'Databases']);

    asAdmin()->post('/admin/skills', ['name' => 'MySQL', 'skill_category_id' => $category->id, 'proficiency' => 80, 'is_published' => true])
        ->assertSessionHasNoErrors();

    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('skillCategories.0.name', 'Databases')
        ->where('skillCategories.0.skills.0.name', 'MySQL')
        ->where('skillCategories.0.skills.0.proficiency', 80));
});

test('a skill can be moved to another category, hidden and deleted', function () {
    $skill = Skill::factory()->create(['name' => 'Docker']);
    $tools = SkillCategory::factory()->create(['name' => 'Tools']);

    asAdmin()->post("/admin/skills/{$skill->id}", ['name' => 'Docker', 'skill_category_id' => $tools->id, 'is_published' => true])
        ->assertSessionHasNoErrors();
    expect($skill->fresh()->skill_category_id)->toBe($tools->id);

    $this->patch("/admin/skills/{$skill->id}/toggle");
    expect($skill->fresh()->is_published)->toBeFalse();
    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page->has('skillCategories', 0)->where('sections', []));

    $this->delete("/admin/skills/{$skill->id}");
    $this->assertDatabaseCount('skills', 0);
});

test('skill validation rejects bad input', function () {
    $skill = Skill::factory()->create(['name' => 'React']);

    asAdmin()->post('/admin/skills', ['name' => '', 'skill_category_id' => 999, 'proficiency' => 140, 'is_published' => true])
        ->assertSessionHasErrors(['name', 'skill_category_id', 'proficiency']);

    $this->post('/admin/skills', ['name' => 'React', 'skill_category_id' => $skill->skill_category_id, 'is_published' => true])
        ->assertSessionHasErrors('name');
});

test('a skill image can be uploaded', function () {
    Storage::fake('public');
    $category = SkillCategory::factory()->create();

    asAdmin()->post('/admin/skills', [
        'name' => 'Rust',
        'skill_category_id' => $category->id,
        'is_published' => true,
        'media_upload' => UploadedFile::fake()->image('rust.png'),
    ])->assertSessionHasNoErrors();

    expect(Skill::query()->first()->media)->not->toBeNull();
});

/* ---------- Experience ---------- */

test('an experience record can be created with responsibilities and technologies', function () {
    asAdmin()->post('/admin/experiences', [
        'organisation' => 'Acme Ltd',
        'job_title' => 'Software Engineer',
        'employment_type' => 'Full-time',
        'location' => 'Remote',
        'start_date' => '2025-02-01',
        'is_current' => true,
        'description' => 'Platform work.',
        'responsibilities' => ['Built the billing API', 'Mentored interns'],
        'technologies' => ['Laravel', 'MySQL'],
        'is_published' => true,
    ])->assertSessionHasNoErrors()->assertRedirect(route('admin.experiences.index'));

    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('experiences.0.organisation', 'Acme Ltd')
        ->where('experiences.0.isCurrent', true)
        ->where('experiences.0.endDate', null)
        ->where('experiences.0.responsibilities', ['Built the billing API', 'Mentored interns'])
        ->where('experiences.0.technologies', ['Laravel', 'MySQL']));
});

test('experience dates are validated', function () {
    $payload = ['organisation' => 'Acme', 'job_title' => 'Dev', 'start_date' => '2025-02-01', 'is_published' => true];

    asAdmin()->post('/admin/experiences', [...$payload, 'is_current' => false, 'end_date' => '2024-01-01'])
        ->assertSessionHasErrors('end_date');

    $this->post('/admin/experiences', [...$payload, 'is_current' => true, 'end_date' => '2026-01-01'])
        ->assertSessionHasErrors('end_date');

    $this->post('/admin/experiences', ['is_published' => true, 'is_current' => false])
        ->assertSessionHasErrors(['organisation', 'job_title', 'start_date']);
});

test('an experience record can be edited and deleted', function () {
    $experience = Experience::factory()->create(['responsibilities' => ['Old duty']]);

    asAdmin()->get("/admin/experiences/{$experience->id}/edit")->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
        ->component('admin/Experience/Form')
        ->where('record.id', $experience->id));

    $this->post("/admin/experiences/{$experience->id}", [
        'organisation' => 'Globex',
        'job_title' => 'Lead',
        'start_date' => '2022-01-01',
        'end_date' => '2023-01-01',
        'is_current' => false,
        'is_published' => true,
    ])->assertSessionHasNoErrors();

    expect($experience->fresh())
        ->organisation->toBe('Globex')
        ->is_current->toBeFalse()
        ->responsibilities->toBe([]);

    $this->delete("/admin/experiences/{$experience->id}");
    $this->assertDatabaseCount('experiences', 0);
});

/* ---------- Education ---------- */

test('education records support the full lifecycle', function () {
    asAdmin()->post('/admin/education', [
        'institution' => 'State University',
        'degree' => 'B.Tech',
        'field_of_study' => 'Computer Science',
        'start_date' => '2021-08-01',
        'is_current' => true,
        'grade' => '8.9 CGPA',
        'is_published' => true,
    ])->assertSessionHasNoErrors();

    $education = Education::query()->firstOrFail();

    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('education.0.institution', 'State University')
        ->where('education.0.isCurrent', true)
        ->where('education.0.grade', '8.9 CGPA'));

    $this->post("/admin/education/{$education->id}", [
        'institution' => 'State University',
        'degree' => 'B.Tech',
        'start_date' => '2021-08-01',
        'end_date' => '2025-05-30',
        'is_current' => false,
        'is_published' => false,
    ])->assertSessionHasNoErrors();

    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page->has('education', 0));

    $this->delete("/admin/education/{$education->id}");
    $this->assertDatabaseCount('educations', 0);
});

test('education validation requires the core fields', function () {
    asAdmin()->post('/admin/education', ['is_published' => true, 'is_current' => false])
        ->assertSessionHasErrors(['institution', 'degree', 'start_date']);
});

/* ---------- Certifications and achievements ---------- */

test('a certification can be created with a PDF and is listed publicly', function () {
    Storage::fake('public');

    asAdmin()->post('/admin/certifications', [
        'name' => 'Cloud Practitioner',
        'issuer' => 'Example Cloud',
        'issue_date' => '2025-03-01',
        'credential_url' => 'https://verify.example.test/abc',
        'media_upload' => UploadedFile::fake()->create('certificate.pdf', 200, 'application/pdf'),
        'is_published' => true,
    ])->assertSessionHasNoErrors();

    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('certifications.0.name', 'Cloud Practitioner')
        ->where('certifications.0.image', null)
        ->where('certifications.0.documentUrl', fn ($url) => str_ends_with($url, '.pdf')));

    $this->post('/admin/certifications', ['name' => 'X', 'issuer' => 'Y', 'issue_date' => '2025-03-01', 'expiry_date' => '2024-01-01', 'credential_url' => 'ftp://x', 'is_published' => true])
        ->assertSessionHasErrors(['expiry_date', 'credential_url']);

    $certification = Certification::query()->firstOrFail();
    $this->delete("/admin/certifications/{$certification->id}");
    $this->assertDatabaseCount('certifications', 0);
});

test('achievements support the full lifecycle', function () {
    asAdmin()->post('/admin/achievements', ['title' => 'Hackathon winner', 'achieved_on' => '2025-06-01', 'is_published' => true])
        ->assertSessionHasNoErrors();

    $achievement = Achievement::query()->firstOrFail();

    $this->post("/admin/achievements/{$achievement->id}", ['title' => 'Hackathon finalist', 'is_published' => true])->assertSessionHasNoErrors();
    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page->where('achievements.0.title', 'Hackathon finalist'));

    $this->post('/admin/achievements', ['title' => '', 'is_published' => true])->assertSessionHasErrors('title');

    $this->delete("/admin/achievements/{$achievement->id}");
    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page->has('achievements', 0));
});

/* ---------- Social links ---------- */

test('social links can be added, reordered, hidden and deleted', function () {
    asAdmin()->post('/admin/social-links', ['platform' => 'GitHub', 'url' => 'https://github.com/example', 'icon' => 'github', 'is_published' => true])
        ->assertSessionHasNoErrors();
    $this->post('/admin/social-links', ['platform' => 'LinkedIn', 'url' => 'https://linkedin.com/in/example', 'is_published' => true]);

    [$github, $linkedin] = SocialLink::query()->orderBy('id')->get();
    expect([$github->sort_order, $linkedin->sort_order])->toBe([1, 2]);

    $this->patch("/admin/social-links/{$linkedin->id}/move", ['direction' => 'up']);
    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('socialLinks.0.platform', 'LinkedIn')
        ->where('socialLinks.1.platform', 'GitHub')
        ->where('sections', ['contact']));

    $this->patch("/admin/social-links/{$linkedin->id}/toggle");
    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page->has('socialLinks', 1));

    $this->delete("/admin/social-links/{$github->id}");
    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page->has('socialLinks', 0)->where('sections', []));
});

test('social link URLs must be safe', function () {
    asAdmin()->post('/admin/social-links', ['platform' => 'Bad', 'url' => 'javascript:alert(1)', 'is_published' => true])
        ->assertSessionHasErrors('url');
});

/* ---------- Listings ---------- */

test('every content listing renders with search and pagination data', function (string $uri, string $component) {
    asAdmin()->get($uri.'?search=zzz')->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
        ->component($component)
        ->has('records.data', 0)
        ->where('filters.search', 'zzz'));

    $this->get($uri.'/create')->assertOk();
    $this->get($uri.'/999/edit')->assertNotFound();
})->with([
    ['/admin/skill-categories', 'admin/SkillCategories/Index'],
    ['/admin/skills', 'admin/Skills/Index'],
    ['/admin/experiences', 'admin/Experience/Index'],
    ['/admin/education', 'admin/Education/Index'],
    ['/admin/certifications', 'admin/Certifications/Index'],
    ['/admin/achievements', 'admin/Achievements/Index'],
    ['/admin/social-links', 'admin/SocialLinks/Index'],
]);
