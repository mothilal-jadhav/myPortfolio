<?php

namespace App\Models;

use App\Models\Concerns\PublishableContent;
use Database\Factories\EducationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['institution', 'degree', 'field_of_study', 'location', 'start_date', 'end_date', 'is_current', 'grade', 'description', 'sort_order', 'is_published'])]
class Education extends Model
{
    /** @use HasFactory<EducationFactory> */
    use HasFactory, PublishableContent;

    /**
     * @var string
     */
    protected $table = 'educations';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
            'is_current' => 'boolean',
            'sort_order' => 'integer',
            'is_published' => 'boolean',
        ];
    }
}
