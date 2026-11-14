<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Support\PortfolioPresenter;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    public function __construct(private PortfolioPresenter $presenter) {}

    public function home(): Response
    {
        return Inertia::render('public/Home', $this->presenter->home())
            ->withViewData(['meta' => $this->presenter->meta()]);
    }

    /**
     * Show one published project. Drafts and scheduled projects return 404.
     */
    public function project(string $slug): Response
    {
        $project = Project::query()->published()->where('slug', $slug)->firstOrFail();

        return Inertia::render('public/Project', [
            ...$this->presenter->projectPage($project),
            'preview' => null,
        ])->withViewData(['meta' => $this->presenter->meta($project->title, $project->short_description)]);
    }
}
