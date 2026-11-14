<?php

namespace App\Models;

use Database\Factories\MediaFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

#[Fillable(['disk', 'path', 'original_name', 'mime_type', 'size', 'width', 'height', 'alt_text'])]
class Media extends Model
{
    /** @use HasFactory<MediaFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $appends = ['url', 'is_image'];

    /**
     * @var list<string>
     */
    protected $hidden = ['disk', 'path'];

    /**
     * Public URL of the stored file.
     *
     * @return Attribute<string, never>
     */
    protected function url(): Attribute
    {
        return Attribute::get(fn (): string => Storage::disk($this->disk)->url($this->path));
    }

    /**
     * @return Attribute<bool, never>
     */
    protected function isImage(): Attribute
    {
        return Attribute::get(fn (): bool => str_starts_with((string) $this->mime_type, 'image/'));
    }

    /**
     * Human-readable list of the places this file is used.
     *
     * @return list<string>
     */
    public function usages(): array
    {
        $usages = [];

        if (Profile::query()->where('profile_image_id', $this->id)->orWhere('hero_image_id', $this->id)->exists()) {
            $usages[] = 'Profile';
        }

        if (SiteSetting::query()->where('logo_id', $this->id)->exists()) {
            $usages[] = 'Site logo';
        }

        $projectIds = ProjectImage::query()->where('media_id', $this->id)->pluck('project_id');

        Project::query()
            ->where('thumbnail_id', $this->id)
            ->orWhereIn('id', $projectIds)
            ->pluck('title')
            ->each(function (string $title) use (&$usages): void {
                $usages[] = 'Project: '.$title;
            });

        Skill::query()->where('media_id', $this->id)->pluck('name')
            ->each(function (string $name) use (&$usages): void {
                $usages[] = 'Skill: '.$name;
            });

        Certification::query()->where('media_id', $this->id)->pluck('name')
            ->each(function (string $name) use (&$usages): void {
                $usages[] = 'Certification: '.$name;
            });

        Achievement::query()->where('media_id', $this->id)->pluck('title')
            ->each(function (string $title) use (&$usages): void {
                $usages[] = 'Achievement: '.$title;
            });

        return $usages;
    }

    /**
     * Compact representation used by public pages.
     *
     * @return array{url: string, alt: string, width: int|null, height: int|null}
     */
    public function toPublicArray(string $fallbackAlt = ''): array
    {
        return [
            'url' => $this->url,
            'alt' => $this->alt_text ?: $fallbackAlt,
            'width' => $this->width,
            'height' => $this->height,
        ];
    }
}
