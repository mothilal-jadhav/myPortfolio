<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <title data-inertia>{{ $meta['title'] ?? config('app.name') }}</title>
        @if (! empty($meta['description']))
            <meta name="description" content="{{ $meta['description'] }}" data-inertia="description">
        @endif

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])

        <x-inertia::head />
    </head>
    <body>
        <x-inertia::app />
    </body>
</html>
