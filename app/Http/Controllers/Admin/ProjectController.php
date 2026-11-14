<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProjectRequest;
use App\Models\Project;
use App\Models\Technology;
use App\Support\MediaUploader;
use App\Support\PortfolioPresenter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function __construct(private MediaUploader $uploader) {}

    public function index(Request $request): Response
    {
        $filters = [
            'search' => trim((string) $request->query('search', '')),
            'status' => (string) $request->query('status', ''),
            'featured' => $request->boolean('featured'),
        ];

        $projects = Project::query()
            ->with(['thumbnail', 'technologies:id,name'])
            ->when($filters['search'] !== '', function (Builder $query) use ($filters): void {
                $query->where(function (Builder $inner) use ($filters): void {
                    $term = '%'.$filters['search'].'%';
                    $inner->whereLike('title', $term)
                        ->orWhereLike('category', $term)
                        ->orWhereLike('short_description', $term);
                });
            })
            ->when(in_array($filters['status'], [Project::STATUS_DRAFT, Project::STATUS_PUBLISHED], true),
                fn (Builder $query) => $query->where('status', $filters['status']))
            ->when($filters['featured'], fn (Builder $query) => $query->where('is_featured', true))
            ->orderBy('sort_order')
            ->orderBy('id')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('admin/Projects/Index', [
            'projects' => $projects,
            'filters' => $filters,
            'totals' => [
                'all' => Project::query()->count(),
                'published' => Project::query()->where('status', Project::STATUS_PUBLISHED)->count(),
                'draft' => Project::query()->where('status', Project::STATUS_DRAFT)->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/Projects/Create', $this->formProps());
    }

    public function store(ProjectRequest $request): RedirectResponse
    {
        $project = $this->save(new Project, $request);

        return redirect()->route('admin.projects.edit', $project)->with('success', 'Project created.');
    }

    public function edit(Project $project): Response
    {
        $project->load(['thumbnail', 'images.media', 'technologies:id,name']);

        return Inertia::render('admin/Projects/Edit', [
            'project' => [
                ...$project->only([
                    'id', 'title', 'slug', 'category', 'short_description', 'details', 'github_url',
                    'live_url', 'hue', 'is_featured', 'sort_order', 'status', 'thumbnail_id',
                ]),
                'published_at' => $project->published_at?->format('Y-m-d\TH:i'),
                'updated_at' => $project->updated_at,
                'thumbnail' => $project->thumbnail,
                'technologies' => $project->technologies->pluck('name'),
                'gallery' => $project->images->map->media->filter()->values(),
            ],
            ...$this->formProps(),
        ]);
    }

    public function update(ProjectRequest $request, Project $project): RedirectResponse
    {
        $this->save($project, $request);

        return back()->with('success', 'Project updated.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        $project->delete();

        return redirect()->route('admin.projects.index')->with('success', 'Project deleted.');
    }

    /**
     * Publish a draft, or move a published project back to draft.
     */
    public function toggle(Project $project): RedirectResponse
    {
        $publishing = $project->status !== Project::STATUS_PUBLISHED;

        $project->update([
            'status' => $publishing ? Project::STATUS_PUBLISHED : Project::STATUS_DRAFT,
            'published_at' => $publishing ? ($project->published_at ?? now()) : $project->published_at,
        ]);

        return back()->with('success', $publishing ? 'Project published.' : 'Project moved to drafts.');
    }

    public function move(Request $request, Project $project): RedirectResponse
    {
        $direction = $request->validate(['direction' => ['required', Rule::in(['up', 'down'])]])['direction'];

        ContentController::reorder(Project::class, $project->id, $direction);

        return back();
    }

    /**
     * Show a project exactly as visitors would see it, whatever its status.
     */
    public function preview(Project $project, PortfolioPresenter $presenter): Response
    {
        return Inertia::render('public/Project', [
            ...$presenter->projectPage($project),
            'preview' => [
                'status' => $project->status,
                'editUrl' => route('admin.projects.edit', $project),
            ],
        ]);
    }

    private function save(Project $project, ProjectRequest $request): Project
    {
        $data = $request->validated();

        return DB::transaction(function () use ($project, $request, $data): Project {
            if ($request->hasFile('thumbnail_upload')) {
                $data['thumbnail_id'] = $this->uploader->store($request->file('thumbnail_upload'))->id;
            }

            $data['slug'] = Project::uniqueSlug($data['slug'] ?? $data['title'], $project->id);
            $data['sort_order'] ??= $project->exists ? $project->sort_order : ((int) Project::query()->max('sort_order')) + 1;

            if ($data['status'] === Project::STATUS_PUBLISHED) {
                $data['published_at'] ??= $project->published_at ?? now();
            }

            $project->fill(array_intersect_key($data, array_flip($project->getFillable())))->save();

            $project->technologies()->sync(Technology::idsForNames($data['technologies'] ?? []));

            $galleryIds = $data['gallery_ids'] ?? [];

            foreach ($request->file('gallery_uploads', []) as $file) {
                $galleryIds[] = $this->uploader->store($file)->id;
            }

            $project->images()->whereNotIn('media_id', $galleryIds)->delete();

            foreach (array_values(array_unique($galleryIds)) as $position => $mediaId) {
                $project->images()->updateOrCreate(['media_id' => $mediaId], ['sort_order' => $position + 1]);
            }

            return $project;
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function formProps(): array
    {
        return [
            'technologyOptions' => Technology::query()->orderBy('name')->pluck('name'),
            'categoryOptions' => Project::query()->whereNotNull('category')->distinct()->orderBy('category')->pluck('category'),
            'mediaLibrary' => ContentController::mediaLibrary(),
        ];
    }
}
