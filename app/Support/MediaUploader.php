<?php

namespace App\Support;

use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class MediaUploader
{
    public const DISK = 'public';

    public const DIRECTORY = 'media';

    public const MAX_KILOBYTES = 4096;

    /**
     * Validation rules for an optional image upload. SVG is deliberately
     * excluded because it can carry scripts.
     *
     * @return list<string>
     */
    public static function imageRules(): array
    {
        return ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,gif', 'max:'.self::MAX_KILOBYTES];
    }

    /**
     * Validation rules for an optional image or PDF upload.
     *
     * @return list<string>
     */
    public static function documentRules(): array
    {
        return ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,gif,pdf', 'max:'.self::MAX_KILOBYTES];
    }

    /**
     * Validation rules for a reference to an existing media row.
     *
     * @return list<string>
     */
    public static function referenceRules(): array
    {
        return ['nullable', 'integer', 'exists:media,id'];
    }

    /**
     * Store an uploaded file and record it in the media library.
     */
    public function store(UploadedFile $file): Media
    {
        return Media::query()->create([
            'disk' => self::DISK,
            ...$this->writeFile($file),
        ]);
    }

    /**
     * Swap the file behind an existing media row, keeping every reference to it intact.
     */
    public function replace(Media $media, UploadedFile $file): Media
    {
        $previousDisk = $media->disk;
        $previousPath = $media->path;

        $media->update(['disk' => self::DISK, ...$this->writeFile($file)]);

        Storage::disk($previousDisk)->delete($previousPath);

        return $media;
    }

    /**
     * Remove a media row together with its file.
     */
    public function delete(Media $media): void
    {
        Storage::disk($media->disk)->delete($media->path);

        $media->delete();
    }

    /**
     * @return array{path: string, original_name: string, mime_type: string, size: int, width: int|null, height: int|null}
     */
    private function writeFile(UploadedFile $file): array
    {
        $dimensions = str_starts_with((string) $file->getMimeType(), 'image/')
            ? @getimagesize($file->getRealPath())
            : false;

        return [
            'path' => $file->store(self::DIRECTORY, self::DISK),
            'original_name' => mb_substr($file->getClientOriginalName(), 0, 255),
            'mime_type' => (string) $file->getMimeType(),
            'size' => (int) $file->getSize(),
            'width' => $dimensions ? $dimensions[0] : null,
            'height' => $dimensions ? $dimensions[1] : null,
        ];
    }
}
