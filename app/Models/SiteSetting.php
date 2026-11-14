<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'site_title', 'logo_id', 'accent_color', 'meta_title', 'meta_description',
    'footer_text', 'footer_description', 'sections',
])]
class SiteSetting extends Model
{
    /**
     * Sections of the public page that can be reordered or hidden, in default order.
     *
     * @var list<string>
     */
    public const SECTION_KEYS = [
        'about', 'skills', 'projects', 'experience', 'education',
        'certifications', 'achievements', 'contact',
    ];

    /**
     * The single settings row, or an unsaved empty one.
     */
    public static function current(): self
    {
        return self::query()->with('logo')->first() ?? new self;
    }

    /**
     * @return BelongsTo<Media, $this>
     */
    public function logo(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'logo_id');
    }

    /**
     * Every known section in display order, with its visibility flag.
     *
     * @return list<array{key: string, visible: bool}>
     */
    public function orderedSections(): array
    {
        $ordered = [];

        foreach ($this->sections ?? [] as $section) {
            $key = $section['key'] ?? null;

            if (in_array($key, self::SECTION_KEYS, true) && ! isset($ordered[$key])) {
                $ordered[$key] = ['key' => $key, 'visible' => (bool) ($section['visible'] ?? true)];
            }
        }

        foreach (self::SECTION_KEYS as $key) {
            $ordered[$key] ??= ['key' => $key, 'visible' => true];
        }

        return array_values($ordered);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sections' => 'array',
        ];
    }
}
