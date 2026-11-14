<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use App\Models\Certification;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Project;
use App\Models\Skill;
use App\Models\SocialLink;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Content types shown in "recent updates": model, label, title column, route name.
     *
     * @var list<array{class-string<Model>, string, string, string}>
     */
    private const RECENT_SOURCES = [
        [Project::class, 'Project', 'title', 'admin.projects.edit'],
        [Skill::class, 'Skill', 'name', 'admin.skills.edit'],
        [Experience::class, 'Experience', 'job_title', 'admin.experiences.edit'],
        [Education::class, 'Education', 'degree', 'admin.education.edit'],
        [Certification::class, 'Certification', 'name', 'admin.certifications.edit'],
        [Achievement::class, 'Achievement', 'title', 'admin.achievements.edit'],
        [SocialLink::class, 'Social link', 'platform', 'admin.social-links.edit'],
    ];

    public function index(): Response
    {
        return Inertia::render('admin/Dashboard', [
            'stats' => [
                'projects' => Project::query()->count(),
                'publishedProjects' => Project::query()->where('status', Project::STATUS_PUBLISHED)->count(),
                'draftProjects' => Project::query()->where('status', Project::STATUS_DRAFT)->count(),
                'skills' => Skill::query()->count(),
                'experiences' => Experience::query()->count(),
                'education' => Education::query()->count(),
                'certifications' => Certification::query()->count(),
                'achievements' => Achievement::query()->count(),
            ],
            'recent' => $this->recentUpdates(),
        ]);
    }

    /**
     * The most recently changed records across every content type.
     *
     * @return Collection<int, array{type: string, title: string, url: string, updatedAt: string, created: bool}>
     */
    private function recentUpdates(): Collection
    {
        return collect(self::RECENT_SOURCES)
            ->flatMap(fn (array $source) => $source[0]::query()
                ->latest('updated_at')
                ->limit(6)
                ->get(['id', $source[2], 'created_at', 'updated_at'])
                ->map(fn (Model $record): array => [
                    'type' => $source[1],
                    'title' => (string) $record->getAttribute($source[2]),
                    'url' => route($source[3], $record->getKey()),
                    'updatedAt' => $record->updated_at->toIso8601String(),
                    'created' => $record->created_at->equalTo($record->updated_at),
                ]))
            ->sortByDesc('updatedAt')
            ->take(8)
            ->values();
    }
}
