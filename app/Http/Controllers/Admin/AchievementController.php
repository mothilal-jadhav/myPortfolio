<?php

namespace App\Http\Controllers\Admin;

use App\Models\Achievement;
use App\Support\MediaUploader;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AchievementController extends ContentController
{
    protected function model(): string
    {
        return Achievement::class;
    }

    protected function page(): string
    {
        return 'admin/Achievements';
    }

    protected function routeName(): string
    {
        return 'admin.achievements';
    }

    protected function label(): string
    {
        return 'Achievement';
    }

    protected function searchable(): array
    {
        return ['title', 'issuer'];
    }

    protected function relations(): array
    {
        return ['media'];
    }

    protected function mediaFields(): array
    {
        return ['media_upload' => 'media_id'];
    }

    protected function rules(Request $request, ?Model $record): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:5000'],
            'issuer' => ['nullable', 'string', 'max:160'],
            'achieved_on' => ['nullable', 'date'],
            'media_id' => MediaUploader::referenceRules(),
            'media_upload' => MediaUploader::imageRules(),
        ];
    }
}
