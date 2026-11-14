<?php

namespace App\Models;

use App\Models\Concerns\PublishableContent;
use Database\Factories\AchievementFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['title', 'description', 'issuer', 'achieved_on', 'media_id', 'sort_order', 'is_published'])]
class Achievement extends Model
{
    /** @use HasFactory<AchievementFactory> */
    use HasFactory, PublishableContent;

    /**
     * @return BelongsTo<Media, $this>
     */
    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'achieved_on' => 'date:Y-m-d',
            'sort_order' => 'integer',
            'is_published' => 'boolean',
        ];
    }
}
