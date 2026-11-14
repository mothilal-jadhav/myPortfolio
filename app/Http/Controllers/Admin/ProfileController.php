<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Support\MediaUploader;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('admin/Profile/Edit', [
            'profile' => Profile::current(),
            'mediaLibrary' => ContentController::mediaLibrary(),
        ]);
    }

    public function update(Request $request, MediaUploader $uploader): RedirectResponse
    {
        $link = ['nullable', 'string', 'max:2048', 'regex:/^(#[\w-]*|\/[^\s]*|https?:\/\/\S+|mailto:\S+)$/i'];

        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:120'],
            'title' => ['nullable', 'string', 'max:160'],
            'hero_greeting' => ['nullable', 'string', 'max:80'],
            'introduction' => ['nullable', 'string', 'max:500'],
            'primary_cta_label' => ['nullable', 'string', 'max:60', 'required_with:primary_cta_url'],
            'primary_cta_url' => [...$link, 'required_with:primary_cta_label'],
            'secondary_cta_label' => ['nullable', 'string', 'max:60', 'required_with:secondary_cta_url'],
            'secondary_cta_url' => [...$link, 'required_with:secondary_cta_label'],
            'about_heading' => ['nullable', 'string', 'max:160'],
            'biography' => ['nullable', 'string', 'max:5000'],
            'about_extra' => ['nullable', 'string', 'max:5000'],
            'stats' => ['nullable', 'array', 'max:6'],
            'stats.*.label' => ['required', 'string', 'max:40'],
            'stats.*.value' => ['required', 'string', 'max:20'],
            'show_calculated_stats' => ['required', 'boolean'],
            'contact_heading' => ['nullable', 'string', 'max:160'],
            'contact_message' => ['nullable', 'string', 'max:500'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'location' => ['nullable', 'string', 'max:160'],
            'profile_image_id' => MediaUploader::referenceRules(),
            'profile_image_upload' => MediaUploader::imageRules(),
            'hero_image_id' => MediaUploader::referenceRules(),
            'hero_image_upload' => MediaUploader::imageRules(),
        ], [
            'primary_cta_url.regex' => 'Use a full URL, a path starting with "/", or a section anchor such as "#project-section".',
            'secondary_cta_url.regex' => 'Use a full URL, a path starting with "/", or a section anchor such as "#contact".',
        ]);

        // Multipart requests omit empty lists entirely; treat a missing list as cleared.
        $data['stats'] ??= [];

        DB::transaction(function () use ($request, $uploader, $data): void {
            foreach (['profile_image', 'hero_image'] as $field) {
                if ($request->hasFile($field.'_upload')) {
                    $data[$field.'_id'] = $uploader->store($request->file($field.'_upload'))->id;
                }
            }

            $profile = Profile::query()->firstOrNew([]);
            $profile->fill(array_intersect_key($data, array_flip($profile->getFillable())))->save();
        });

        return back()->with('success', 'Profile updated.');
    }
}
