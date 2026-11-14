<?php

namespace App\Models;

use App\Models\Concerns\PublishableContent;
use Database\Factories\ExperienceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['organisation', 'job_title', 'employment_type', 'location', 'start_date', 'end_date', 'is_current', 'description', 'responsibilities', 'sort_order', 'is_published'])]
class Experience extends Model
{
    /** @use HasFactory<ExperienceFactory> */
    use HasFactory, PublishableContent;

    /**
     * @return BelongsToMany<Technology, $this>
     */
    public function technologies(): BelongsToMany
    {
        return $this->belongsToMany(Technology::class)->orderBy('name');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
            'is_current' => 'boolean',
            'responsibilities' => 'array',
            'sort_order' => 'integer',
            'is_published' => 'boolean',
        ];
    }
}
