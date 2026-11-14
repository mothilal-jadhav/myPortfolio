<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'name', 'title', 'hero_greeting', 'introduction',
    'primary_cta_label', 'primary_cta_url', 'secondary_cta_label', 'secondary_cta_url',
    'about_heading', 'biography', 'about_extra', 'stats', 'show_calculated_stats',
    'contact_heading', 'contact_message', 'email', 'phone', 'location',
    'profile_image_id', 'hero_image_id',
])]
class Profile extends Model
{
    /**
     * The single profile row, or an unsaved empty one.
     */
    public static function current(): self
    {
        return self::query()->with(['profileImage', 'heroImage'])->first() ?? new self;
    }

    /**
     * @return BelongsTo<Media, $this>
     */
    public function profileImage(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'profile_image_id');
    }

    /**
     * @return BelongsTo<Media, $this>
     */
    public function heroImage(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'hero_image_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'stats' => 'array',
            'show_calculated_stats' => 'boolean',
        ];
    }
}
