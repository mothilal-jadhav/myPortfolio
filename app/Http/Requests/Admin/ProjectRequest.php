<?php

namespace App\Http\Requests\Admin;

use App\Models\Project;
use App\Support\MediaUploader;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class ProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('access-admin');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'slug' => [
                'nullable', 'string', 'max:170', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('projects', 'slug')->ignore($this->route('project')),
            ],
            'category' => ['nullable', 'string', 'max:80'],
            'short_description' => ['required', 'string', 'max:500'],
            'details' => ['nullable', 'string', 'max:20000'],
            'github_url' => ['nullable', 'url:http,https', 'max:2048'],
            'live_url' => ['nullable', 'url:http,https', 'max:2048'],
            'hue' => ['required', 'integer', 'between:0,360'],
            'is_featured' => ['required', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'status' => ['required', Rule::in([Project::STATUS_DRAFT, Project::STATUS_PUBLISHED])],
            'published_at' => ['nullable', 'date'],
            'technologies' => ['nullable', 'array', 'max:30'],
            'technologies.*' => ['required', 'string', 'max:60'],
            'thumbnail_id' => MediaUploader::referenceRules(),
            'thumbnail_upload' => MediaUploader::imageRules(),
            'gallery_ids' => ['nullable', 'array', 'max:12'],
            'gallery_ids.*' => ['integer', 'distinct', 'exists:media,id'],
            'gallery_uploads' => ['nullable', 'array', 'max:8'],
            'gallery_uploads.*' => ['file', 'mimes:jpg,jpeg,png,webp,gif', 'max:'.MediaUploader::MAX_KILOBYTES],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'slug.regex' => 'The slug may only contain lowercase letters, numbers and single hyphens.',
            'thumbnail_upload.mimes' => 'The thumbnail must be a JPG, PNG, WebP or GIF image.',
            'thumbnail_upload.max' => 'The thumbnail may not be larger than 4 MB.',
            'gallery_uploads.*.mimes' => 'Gallery images must be JPG, PNG, WebP or GIF files.',
            'gallery_uploads.*.max' => 'Each gallery image may not be larger than 4 MB.',
        ];
    }
}
