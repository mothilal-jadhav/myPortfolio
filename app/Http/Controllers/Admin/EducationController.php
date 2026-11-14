<?php

namespace App\Http\Controllers\Admin;

use App\Models\Education;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class EducationController extends ContentController
{
    protected function model(): string
    {
        return Education::class;
    }

    protected function page(): string
    {
        return 'admin/Education';
    }

    protected function routeName(): string
    {
        return 'admin.education';
    }

    protected function label(): string
    {
        return 'Education record';
    }

    protected function searchable(): array
    {
        return ['institution', 'degree', 'field_of_study'];
    }

    protected function rules(Request $request, ?Model $record): array
    {
        return [
            'institution' => ['required', 'string', 'max:160'],
            'degree' => ['required', 'string', 'max:160'],
            'field_of_study' => ['nullable', 'string', 'max:160'],
            'location' => ['nullable', 'string', 'max:160'],
            'start_date' => ['required', 'date'],
            'is_current' => ['required', 'boolean'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date', 'prohibited_if:is_current,true'],
            'grade' => ['nullable', 'string', 'max:60'],
            'description' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
