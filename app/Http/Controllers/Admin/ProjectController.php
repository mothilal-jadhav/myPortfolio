<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(){
        $projects = Project::latest()->get();

        return Inertia::render("admin/Projects/Index", [
            'projects' => $projects,
        ]);
    }

    public function create(){
        return Inertia::render('admin/Projects/Create');
    }

    public function store(Request $request){
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'tag' => ['required', 'string', 'max:80'],
            'description' => ['required', 'string'],
            'github_url' => ['required', 'url', 'max:2048'],
            'hue' => ['required', 'integer', 'between:0,360'],
        ]);

        Project::create($validated);

        return redirect()->route('admin.projects.index')->with('success','Project Created Successfully!');
    }
}
