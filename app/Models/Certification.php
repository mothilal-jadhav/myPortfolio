<?php

namespace App\Models;

use App\Models\Concerns\PublishableContent;
use Database\Factories\CertificationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['name', 'issuer', 'issue_date', 'expiry_date', 'credential_id', 'credential_url', 'media_id', 'sort_order', 'is_published'])]
class Certification extends Model
{
    /** @use HasFactory<CertificationFactory> */
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
            'issue_date' => 'date:Y-m-d',
            'expiry_date' => 'date:Y-m-d',
            'sort_order' => 'integer',
            'is_published' => 'boolean',
        ];
    }
}
