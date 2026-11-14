<?php

namespace App\Support;

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
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Builds the data sent to public pages. Every array is assembled field by
 * field so that nothing unpublished or internal can leak into Inertia props.
 */
class PortfolioPresenter
{
    /**
     * Props for the public home page.
     *
     * @return array<string, mixed>
     */
    public function home(): array
    {
        $settings = SiteSetting::current();
        $profile = Profile::current();
        $socialLinks = $this->socialLinks();

        $content = [
            'about' => fn (): ?array => $this->about($profile),
            'skills' => fn (): array => $this->skillCategories(),
            'projects' => fn (): array => $this->projects(),
            'experience' => fn (): array => $this->experiences(),
            'education' => fn (): array => $this->education(),
            'certifications' => fn (): array => $this->certifications(),
            'achievements' => fn (): array => $this->achievements(),
            'contact' => fn (): ?array => $this->contact($profile, $socialLinks),
        ];

        $sections = [];
        $data = [];

        foreach ($settings->orderedSections() as $section) {
            $value = $section['visible'] ? $content[$section['key']]() : null;
            $data[$section['key']] = $value;

            if (! empty($value)) {
                $sections[] = $section['key'];
            }
        }

        return [
            'site' => $this->site($settings, $profile),
            'hero' => $this->hero($profile),
            'sections' => $sections,
            'about' => $data['about'],
            'skillCategories' => $data['skills'] ?? [],
            'projects' => $data['projects'] ?? [],
            'experiences' => $data['experience'] ?? [],
            'education' => $data['education'] ?? [],
            'certifications' => $data['certifications'] ?? [],
            'achievements' => $data['achievements'] ?? [],
            'contact' => $data['contact'],
            'socialLinks' => $socialLinks,
        ];
    }

    /**
     * Props for a single project page.
     *
     * @return array<string, mixed>
     */
    public function projectPage(Project $project): array
    {
        $project->loadMissing(['thumbnail', 'technologies:id,name', 'images.media']);
        $profile = Profile::current();

        return [
            'site' => $this->site(SiteSetting::current(), $profile),
            'project' => [
                ...$this->projectSummary($project),
                'details' => $project->details,
                'gallery' => $project->images
                    ->map(fn ($image) => $image->media?->toPublicArray($project->title))
                    ->filter()
                    ->values()
                    ->all(),
            ],
            'socialLinks' => $this->socialLinks(),
        ];
    }

    /**
     * Title and description for the document head.
     *
     * @return array{title: string, description: string|null}
     */
    public function meta(?string $pageTitle = null, ?string $pageDescription = null): array
    {
        $settings = SiteSetting::current();
        $profile = Profile::current();
        $siteTitle = $settings->meta_title ?: $settings->site_title ?: $profile->name ?: config('app.name');

        return [
            'title' => $pageTitle ? $pageTitle.' · '.$siteTitle : $siteTitle,
            'description' => $pageDescription ?: $settings->meta_description ?: $profile->introduction,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function site(SiteSetting $settings, Profile $profile): array
    {
        return [
            'title' => $settings->site_title ?: $profile->name,
            'logo' => $settings->logo?->toPublicArray((string) ($settings->site_title ?: $profile->name)),
            'accentColor' => $settings->accent_color,
            'footerText' => $settings->footer_text,
            'footerDescription' => $settings->footer_description,
            'meta' => $this->meta(),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function hero(Profile $profile): ?array
    {
        if (blank($profile->name) && blank($profile->title) && blank($profile->introduction)) {
            return null;
        }

        return [
            'greeting' => $profile->hero_greeting,
            'name' => $profile->name,
            'title' => $profile->title,
            'introduction' => $profile->introduction,
            'image' => $profile->heroImage?->toPublicArray((string) $profile->name),
            'primaryCta' => $this->cta($profile->primary_cta_label, $profile->primary_cta_url),
            'secondaryCta' => $this->cta($profile->secondary_cta_label, $profile->secondary_cta_url),
        ];
    }

    /**
     * @return array{label: string, url: string}|null
     */
    private function cta(?string $label, ?string $url): ?array
    {
        return filled($label) && filled($url) ? ['label' => $label, 'url' => $url] : null;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function about(Profile $profile): ?array
    {
        if (blank($profile->biography) && blank($profile->about_extra)) {
            return null;
        }

        return [
            'heading' => $profile->about_heading,
            'paragraphs' => $this->paragraphs($profile->biography."\n\n".$profile->about_extra),
            'image' => $profile->profileImage?->toPublicArray((string) $profile->name),
            'name' => $profile->name,
            'stats' => $this->stats($profile),
        ];
    }

    /**
     * Configured statistics, optionally preceded by counts of real published records.
     *
     * @return list<array{label: string, value: string}>
     */
    private function stats(Profile $profile): array
    {
        $stats = [];

        if ($profile->show_calculated_stats) {
            $counts = [
                'Projects' => Project::query()->published()->count(),
                'Skills' => Skill::query()->published()
                    ->whereHas('category', fn (Builder $query) => $query->published())->count(),
                'Certifications' => Certification::query()->published()->count(),
            ];

            foreach (array_filter($counts) as $label => $count) {
                $stats[] = ['label' => $label, 'value' => (string) $count];
            }
        }

        foreach ($profile->stats ?? [] as $stat) {
            if (filled($stat['label'] ?? null) && filled($stat['value'] ?? null)) {
                $stats[] = ['label' => $stat['label'], 'value' => $stat['value']];
            }
        }

        return $stats;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function skillCategories(): array
    {
        return SkillCategory::query()
            ->published()
            ->ordered()
            ->whereHas('skills', fn (Builder $query) => $query->published())
            ->with(['skills' => fn (HasMany $query) => $query->published()->ordered()->with('media')])
            ->get()
            ->map(fn (SkillCategory $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'description' => $category->description,
                'icon' => $category->icon,
                'skills' => $category->skills->map(fn (Skill $skill): array => [
                    'id' => $skill->id,
                    'name' => $skill->name,
                    'proficiency' => $skill->proficiency,
                    'image' => $skill->media?->toPublicArray($skill->name),
                ])->all(),
            ])
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function projects(): array
    {
        return Project::query()
            ->published()
            ->ordered()
            ->with(['thumbnail', 'technologies:id,name'])
            ->get()
            ->map(fn (Project $project): array => $this->projectSummary($project))
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function projectSummary(Project $project): array
    {
        return [
            'id' => $project->id,
            'title' => $project->title,
            'slug' => $project->slug,
            'category' => $project->category,
            'description' => $project->short_description,
            'thumbnail' => $project->thumbnail?->toPublicArray($project->title),
            'technologies' => $project->technologies->pluck('name')->all(),
            'githubUrl' => $project->github_url,
            'liveUrl' => $project->live_url,
            'featured' => $project->is_featured,
            'hue' => $project->hue,
            'publishedAt' => $project->published_at?->toDateString(),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function experiences(): array
    {
        return Experience::query()
            ->published()
            ->ordered()
            ->with('technologies:id,name')
            ->get()
            ->map(fn (Experience $experience): array => [
                'id' => $experience->id,
                'organisation' => $experience->organisation,
                'jobTitle' => $experience->job_title,
                'employmentType' => $experience->employment_type,
                'location' => $experience->location,
                'startDate' => $experience->start_date->toDateString(),
                'endDate' => $experience->is_current ? null : $experience->end_date?->toDateString(),
                'isCurrent' => $experience->is_current,
                'description' => $experience->description,
                'responsibilities' => array_values(array_filter($experience->responsibilities ?? [])),
                'technologies' => $experience->technologies->pluck('name')->all(),
            ])
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function education(): array
    {
        return Education::query()
            ->published()
            ->ordered()
            ->get()
            ->map(fn (Education $education): array => [
                'id' => $education->id,
                'institution' => $education->institution,
                'degree' => $education->degree,
                'fieldOfStudy' => $education->field_of_study,
                'location' => $education->location,
                'startDate' => $education->start_date->toDateString(),
                'endDate' => $education->is_current ? null : $education->end_date?->toDateString(),
                'isCurrent' => $education->is_current,
                'grade' => $education->grade,
                'description' => $education->description,
            ])
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function certifications(): array
    {
        return Certification::query()
            ->published()
            ->ordered()
            ->with('media')
            ->get()
            ->map(fn (Certification $certification): array => [
                'id' => $certification->id,
                'name' => $certification->name,
                'issuer' => $certification->issuer,
                'issueDate' => $certification->issue_date?->toDateString(),
                'expiryDate' => $certification->expiry_date?->toDateString(),
                'credentialId' => $certification->credential_id,
                'credentialUrl' => $certification->credential_url,
                'image' => $certification->media?->is_image ? $certification->media->toPublicArray($certification->name) : null,
                'documentUrl' => $certification->media && ! $certification->media->is_image ? $certification->media->url : null,
            ])
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function achievements(): array
    {
        return Achievement::query()
            ->published()
            ->ordered()
            ->with('media')
            ->get()
            ->map(fn (Achievement $achievement): array => [
                'id' => $achievement->id,
                'title' => $achievement->title,
                'description' => $achievement->description,
                'issuer' => $achievement->issuer,
                'date' => $achievement->achieved_on?->toDateString(),
                'image' => $achievement->media?->toPublicArray($achievement->title),
            ])
            ->all();
    }

    /**
     * @return list<array{id: int, platform: string, url: string, icon: string|null}>
     */
    private function socialLinks(): array
    {
        return SocialLink::query()
            ->published()
            ->ordered()
            ->get()
            ->map(fn (SocialLink $link): array => [
                'id' => $link->id,
                'platform' => $link->platform,
                'url' => $link->url,
                'icon' => $link->icon,
            ])
            ->all();
    }

    /**
     * @param  list<array<string, mixed>>  $socialLinks
     * @return array<string, mixed>|null
     */
    private function contact(Profile $profile, array $socialLinks): ?array
    {
        if (blank($profile->email) && blank($profile->phone) && blank($profile->location) && $socialLinks === []) {
            return null;
        }

        return [
            'heading' => $profile->contact_heading,
            'message' => $profile->contact_message,
            'email' => $profile->email,
            'phone' => $profile->phone,
            'location' => $profile->location,
        ];
    }

    /**
     * Split free text into paragraphs on blank lines.
     *
     * @return list<string>
     */
    private function paragraphs(?string $text): array
    {
        return array_values(array_filter(array_map('trim', preg_split('/\R{2,}/', (string) $text) ?: [])));
    }
}
