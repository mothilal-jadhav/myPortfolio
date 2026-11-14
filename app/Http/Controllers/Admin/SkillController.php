<?php

namespace App\Http\Controllers\Admin;

use App\Models\Skill;
use App\Models\SkillCategory;
use App\Support\MediaUploader;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SkillController extends ContentController
{
    protected function model(): string
    {
        return Skill::class;
    }

    protected function page(): string
    {
        return 'admin/Skills';
    }

    protected function routeName(): string
    {
        return 'admin.skills';
    }

    protected function label(): string
    {
        return 'Skill';
    }

    protected function searchable(): array
    {
        return ['name'];
    }

    protected function relations(): array
    {
        return ['category:id,name', 'media'];
    }

    protected function mediaFields(): array
    {
        return ['media_upload' => 'media_id'];
    }

    protected function formProps(): array
    {
        return [
            'categories' => SkillCategory::query()->ordered()->get(['id', 'name']),
        ];
    }

    protected function rules(Request $request, ?Model $record): array
    {
        return [
            'skill_category_id' => ['required', 'integer', 'exists:skill_categories,id'],
            'name' => [
                'required', 'string', 'max:80',
                Rule::unique('skills', 'name')
                    ->where('skill_category_id', $request->input('skill_category_id'))
                    ->ignore($record),
            ],
            'proficiency' => ['nullable', 'integer', 'between:0,100'],
            'media_id' => MediaUploader::referenceRules(),
            'media_upload' => MediaUploader::imageRules(),
        ];
    }
}
