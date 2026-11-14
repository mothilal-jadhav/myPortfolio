<?php

namespace App\Http\Controllers\Admin;

use App\Models\Experience;
use App\Models\Technology;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class ExperienceController extends ContentController
{
    protected function model(): string
    {
        return Experience::class;
    }

    protected function page(): string
    {
        return 'admin/Experience';
    }

    protected function routeName(): string
    {
        return 'admin.experiences';
    }

    protected function label(): string
    {
        return 'Experience';
    }

    protected function searchable(): array
    {
        return ['organisation', 'job_title'];
    }

    protected function relations(): array
    {
        return ['technologies:id,name'];
    }

    protected function formProps(): array
    {
        return [
            'technologyOptions' => Technology::query()->orderBy('name')->pluck('name'),
        ];
    }

    protected function rules(Request $request, ?Model $record): array
    {
        return [
            'organisation' => ['required', 'string', 'max:160'],
            'job_title' => ['required', 'string', 'max:160'],
            'employment_type' => ['nullable', 'string', 'max:60'],
            'location' => ['nullable', 'string', 'max:160'],
            'start_date' => ['required', 'date'],
            'is_current' => ['required', 'boolean'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date', 'prohibited_if:is_current,true'],
            'description' => ['nullable', 'string', 'max:5000'],
            'responsibilities' => ['nullable', 'array', 'max:20'],
            'responsibilities.*' => ['required', 'string', 'max:500'],
            'technologies' => ['nullable', 'array', 'max:30'],
            'technologies.*' => ['required', 'string', 'max:60'],
        ];
    }

    protected function afterSave(Model $record, array $data): void
    {
        $record->technologies()->sync(Technology::idsForNames($data['technologies'] ?? []));
    }
}
