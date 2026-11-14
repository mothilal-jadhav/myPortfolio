<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->unique()->words(3, true),
            'slug' => fn (array $attributes) => Str::slug($attributes['title']),
            'category' => fake()->word(),
            'short_description' => fake()->sentence(),
            'details' => fake()->paragraph(),
            'github_url' => fake()->url(),
            'live_url' => null,
            'hue' => fake()->numberBetween(0, 360),
            'is_featured' => false,
            'sort_order' => 0,
            'status' => Project::STATUS_PUBLISHED,
            'published_at' => now()->subDay(),
        ];
    }

    /**
     * Indicate that the record is hidden from the public site.
     */
    public function unpublished(): static
    {
        return $this->state(fn (array $attributes) => ['status' => Project::STATUS_DRAFT, 'published_at' => null]);
    }
}
