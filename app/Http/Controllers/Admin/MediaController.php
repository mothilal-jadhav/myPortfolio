<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Support\MediaUploader;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function __construct(private MediaUploader $uploader) {}

    public function index(): Response
    {
        $media = Media::query()->latest('id')->paginate(24);

        $media->through(fn (Media $item): array => [
            ...$item->toArray(),
            'usages' => $item->usages(),
        ]);

        return Inertia::render('admin/Media/Index', [
            'media' => $media,
            'maxKilobytes' => MediaUploader::MAX_KILOBYTES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'files' => ['required', 'array', 'min:1', 'max:10'],
            'files.*' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,gif,pdf', 'max:'.MediaUploader::MAX_KILOBYTES],
        ], [
            'files.required' => 'Choose at least one file to upload.',
            'files.*.mimes' => 'Only JPG, PNG, WebP, GIF and PDF files can be uploaded.',
            'files.*.max' => 'Each file may not be larger than 4 MB.',
        ]);

        foreach ($request->file('files') as $file) {
            $this->uploader->store($file);
        }

        return back()->with('success', 'Upload complete.');
    }

    /**
     * Update the description of a file, or replace the file itself in place.
     */
    public function update(Request $request, Media $medium): RedirectResponse
    {
        $data = $request->validate([
            'alt_text' => ['nullable', 'string', 'max:255'],
            'file' => MediaUploader::documentRules(),
        ]);

        if ($request->hasFile('file')) {
            $this->uploader->replace($medium, $request->file('file'));
        }

        $medium->update(['alt_text' => $data['alt_text'] ?? null]);

        return back()->with('success', 'Media updated.');
    }

    public function destroy(Media $medium): RedirectResponse
    {
        $usages = $medium->usages();

        if ($usages !== []) {
            return back()->with('error', 'This file is still used by: '.implode(', ', $usages).'. Replace it or remove it there first.');
        }

        $this->uploader->delete($medium);

        return back()->with('success', 'Media deleted.');
    }
}
