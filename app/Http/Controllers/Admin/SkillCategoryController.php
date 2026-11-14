<?php

namespace App\Http\Controllers\Admin;

use App\Models\SkillCategory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SkillCategoryController extends ContentController
{
    protected function model(): string
    {
        return SkillCategory::class;
    }

    protected function page(): string
    {
        return 'admin/SkillCategories';
    }

    protected function routeName(): string
    {
        return 'admin.skill-categories';
    }

    protected function label(): string
    {
        return 'Skill category';
    }

    protected function searchable(): array
    {
        return ['name'];
    }

    protected function indexProps(): array
    {
        return [
            'skillCounts' => SkillCategory::query()->withCount('skills')->pluck('skills_count', 'id'),
        ];
    }

    protected function rules(Request $request, ?Model $record): array
    {
        return [
            'name' => ['required', 'string', 'max:80', Rule::unique('skill_categories', 'name')->ignore($record)],
            'description' => ['nullable', 'string', 'max:300'],
            'icon' => ['nullable', 'string', 'max:40'],
        ];
    }

    public function destroy(int $record): RedirectResponse
    {
        if (SkillCategory::query()->findOrFail($record)->skills()->exists()) {
            return back()->with('error', 'Move or delete the skills in this category before deleting it.');
        }

        return parent::destroy($record);
    }
}
