<?php

use App\Models\Achievement;
use App\Models\Certification;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Profile;
use App\Models\Project;
use App\Models\SiteSetting;
use App\Models\Skill;
use App\Models\SkillCategory;
use App\Models\SocialLink;
use Inertia\Testing\AssertableInertia;

test('an empty database renders the home page with no sections and no invented content', function () {
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/Home')
            ->where('hero', null)
            ->where('about', null)
            ->where('contact', null)
            ->where('sections', [])
            ->has('projects', 0)
            ->has('skillCategories', 0)
            ->has('experiences', 0)
            ->has('socialLinks', 0));
});

test('the hero, about and contact sections come from the profile', function () {
    Profile::create([
        'name' => 'Asha Verma',
        'title' => 'Backend developer',
        'introduction' => 'I build APIs.',
        'primary_cta_label' => 'See my work',
        'primary_cta_url' => '#project-section',
        'biography' => "First paragraph.\n\nSecond paragraph.",
        'email' => 'asha@example.test',
        'stats' => [['label' => 'Years', 'value' => '4']],
    ]);

    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('hero.name', 'Asha Verma')
        ->where('hero.title', 'Backend developer')
        ->where('hero.primaryCta', ['label' => 'See my work', 'url' => '#project-section'])
        ->where('hero.secondaryCta', null)
        ->where('about.paragraphs', ['First paragraph.', 'Second paragraph.'])
        ->where('about.stats', [['label' => 'Years', 'value' => '4']])
        ->where('contact.email', 'asha@example.test')
        ->where('sections', ['about', 'contact']));
});

test('calculated statistics count only published records', function () {
    Profile::create(['biography' => 'Bio', 'show_calculated_stats' => true]);
    Project::factory()->count(2)->create();
    Project::factory()->unpublished()->create();

    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('about.stats', [['label' => 'Projects', 'value' => '2']]));
});

test('only published projects are sent to the home page', function () {
    $published = Project::factory()->create(['title' => 'Visible project']);
    Project::factory()->unpublished()->create(['title' => 'Draft project']);
    Project::factory()->create(['title' => 'Scheduled project', 'published_at' => now()->addWeek()]);

    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page
        ->has('projects', 1)
        ->where('projects.0.title', 'Visible project')
        ->where('projects.0.slug', $published->slug)
        ->where('sections', ['projects']));
});

test('featured projects come first, then the display order', function () {
    Project::factory()->create(['title' => 'Second', 'sort_order' => 1]);
    Project::factory()->create(['title' => 'Third', 'sort_order' => 2]);
    Project::factory()->create(['title' => 'First', 'sort_order' => 9, 'is_featured' => true]);

    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('projects.0.title', 'First')
        ->where('projects.1.title', 'Second')
        ->where('projects.2.title', 'Third'));
});

test('skills are grouped by category and hidden skills or categories are left out', function () {
    $frontend = SkillCategory::factory()->create(['name' => 'Frontend', 'sort_order' => 1]);
    Skill::factory()->create(['skill_category_id' => $frontend->id, 'name' => 'React', 'sort_order' => 2]);
    Skill::factory()->create(['skill_category_id' => $frontend->id, 'name' => 'CSS', 'sort_order' => 1]);
    Skill::factory()->unpublished()->create(['skill_category_id' => $frontend->id, 'name' => 'Secret']);

    $hidden = SkillCategory::factory()->unpublished()->create(['name' => 'Hidden']);
    Skill::factory()->create(['skill_category_id' => $hidden->id, 'name' => 'Invisible']);

    SkillCategory::factory()->create(['name' => 'Empty category']);

    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page
        ->has('skillCategories', 1)
        ->where('skillCategories.0.name', 'Frontend')
        ->has('skillCategories.0.skills', 2)
        ->where('skillCategories.0.skills.0.name', 'CSS')
        ->where('skillCategories.0.skills.1.name', 'React'));
});

test('unpublished records of every content type stay private', function () {
    Experience::factory()->create(['job_title' => 'Shown role']);
    Experience::factory()->unpublished()->create(['job_title' => 'Hidden role']);
    Education::factory()->unpublished()->create();
    Certification::factory()->unpublished()->create();
    Achievement::factory()->unpublished()->create();
    SocialLink::factory()->unpublished()->create();

    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page
        ->has('experiences', 1)
        ->where('experiences.0.jobTitle', 'Shown role')
        ->has('education', 0)
        ->has('certifications', 0)
        ->has('achievements', 0)
        ->has('socialLinks', 0)
        ->where('sections', ['experience']));

    expect($this->get('/')->getContent())->not->toContain('Hidden role');
});

test('a current role is sent without an end date', function () {
    Experience::factory()->create(['is_current' => true, 'end_date' => null]);
    Experience::factory()->create(['is_current' => false, 'start_date' => '2020-01-01', 'end_date' => '2021-06-30', 'sort_order' => 5]);

    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('experiences.0.isCurrent', true)
        ->where('experiences.0.endDate', null)
        ->where('experiences.1.endDate', '2021-06-30'));
});

test('navigation sections follow the order and visibility chosen in settings', function () {
    Project::factory()->create();
    Experience::factory()->create();
    Education::factory()->create();

    SiteSetting::create(['sections' => [
        ['key' => 'education', 'visible' => true],
        ['key' => 'projects', 'visible' => false],
        ['key' => 'experience', 'visible' => true],
    ]]);

    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('sections', ['education', 'experience'])
        ->has('projects', 0));
});

test('site settings reach the page and the document head', function () {
    SiteSetting::create(['site_title' => 'Asha.dev', 'accent_color' => '#22aa88', 'meta_title' => 'Asha — developer', 'meta_description' => 'Portfolio of Asha']);

    $this->get('/')
        ->assertSee('<title data-inertia>Asha — developer</title>', false)
        ->assertSee('Portfolio of Asha')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('site.title', 'Asha.dev')
            ->where('site.accentColor', '#22aa88'));
});

test('a published project has a public page', function () {
    $project = Project::factory()->create(['title' => 'Public one', 'details' => 'Long text']);

    $this->get('/projects/'.$project->slug)
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/Project')
            ->where('project.title', 'Public one')
            ->where('project.details', 'Long text')
            ->where('preview', null));
});

test('draft and scheduled projects have no public page', function () {
    $draft = Project::factory()->unpublished()->create();
    $scheduled = Project::factory()->create(['published_at' => now()->addDay()]);

    $this->get('/projects/'.$draft->slug)->assertNotFound();
    $this->get('/projects/'.$scheduled->slug)->assertNotFound();
});

test('public props do not expose internal fields', function () {
    Project::factory()->create();

    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page
        ->missing('projects.0.status')
        ->missing('projects.0.sort_order')
        ->missing('projects.0.thumbnail_id')
        ->where('auth.user', null));
});
