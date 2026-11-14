<?php

namespace App\Http\Controllers\Admin;

use App\Models\SocialLink;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class SocialLinkController extends ContentController
{
    protected function model(): string
    {
        return SocialLink::class;
    }

    protected function page(): string
    {
        return 'admin/SocialLinks';
    }

    protected function routeName(): string
    {
        return 'admin.social-links';
    }

    protected function label(): string
    {
        return 'Social link';
    }

    protected function searchable(): array
    {
        return ['platform', 'url'];
    }

    protected function rules(Request $request, ?Model $record): array
    {
        return [
            'platform' => ['required', 'string', 'max:60'],
            'url' => ['required', 'url:http,https,mailto', 'max:2048'],
            'icon' => ['nullable', 'string', 'max:40'],
        ];
    }
}
