<?php

namespace App\Http\Controllers\Admin;

use App\Models\Certification;
use App\Support\MediaUploader;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class CertificationController extends ContentController
{
    protected function model(): string
    {
        return Certification::class;
    }

    protected function page(): string
    {
        return 'admin/Certifications';
    }

    protected function routeName(): string
    {
        return 'admin.certifications';
    }

    protected function label(): string
    {
        return 'Certification';
    }

    protected function searchable(): array
    {
        return ['name', 'issuer'];
    }

    protected function relations(): array
    {
        return ['media'];
    }

    protected function mediaFields(): array
    {
        return ['media_upload' => 'media_id'];
    }

    protected function rules(Request $request, ?Model $record): array
    {
        return [
            'name' => ['required', 'string', 'max:200'],
            'issuer' => ['required', 'string', 'max:160'],
            'issue_date' => ['nullable', 'date'],
            'expiry_date' => ['nullable', 'date', 'after_or_equal:issue_date'],
            'credential_id' => ['nullable', 'string', 'max:160'],
            'credential_url' => ['nullable', 'url:http,https', 'max:2048'],
            'media_id' => MediaUploader::referenceRules(),
            'media_upload' => MediaUploader::documentRules(),
        ];
    }
}
