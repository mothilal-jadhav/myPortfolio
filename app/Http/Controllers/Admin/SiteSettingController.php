<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Support\MediaUploader;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SiteSettingController extends Controller
{
    public function edit(): Response
    {
        $settings = SiteSetting::current();

        return Inertia::render('admin/Settings/Edit', [
            'settings' => [
                ...$settings->only([
                    'site_title', 'logo_id', 'accent_color', 'meta_title', 'meta_description',
                    'footer_text', 'footer_description', 'updated_at',
                ]),
                'logo' => $settings->logo,
                'sections' => $settings->orderedSections(),
            ],
            'mediaLibrary' => ContentController::mediaLibrary(),
        ]);
    }

    public function update(Request $request, MediaUploader $uploader): RedirectResponse
    {
        $data = $request->validate([
            'site_title' => ['nullable', 'string', 'max:120'],
            'accent_color' => ['nullable', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'meta_title' => ['nullable', 'string', 'max:160'],
            'meta_description' => ['nullable', 'string', 'max:300'],
            'footer_text' => ['nullable', 'string', 'max:200'],
            'footer_description' => ['nullable', 'string', 'max:300'],
            'logo_id' => MediaUploader::referenceRules(),
            'logo_upload' => MediaUploader::imageRules(),
            'sections' => ['required', 'array', 'size:'.count(SiteSetting::SECTION_KEYS)],
            'sections.*.key' => ['required', 'distinct', Rule::in(SiteSetting::SECTION_KEYS)],
            'sections.*.visible' => ['required', 'boolean'],
        ], [
            'accent_color.regex' => 'Choose the accent colour as a six-digit hex value such as #f5a524.',
        ]);

        DB::transaction(function () use ($request, $uploader, $data): void {
            if ($request->hasFile('logo_upload')) {
                $data['logo_id'] = $uploader->store($request->file('logo_upload'))->id;
            }

            $data['sections'] = array_map(
                fn (array $section): array => ['key' => $section['key'], 'visible' => (bool) $section['visible']],
                $data['sections'],
            );

            $settings = SiteSetting::query()->firstOrNew([]);
            $settings->fill(array_intersect_key($data, array_flip($settings->getFillable())))->save();
        });

        return back()->with('success', 'Settings saved.');
    }
}
