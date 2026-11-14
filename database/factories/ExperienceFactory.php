<?php

namespace Database\Factories;

use App\Models\Experience;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Experience>
 */
class ExperienceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'organisation' => fake()->company(),
            'job_title' => fake()->jobTitle(),
            'employment_type' => 'Full-time',
            'location' => fake()->city(),
            'start_date' => '2024-01-01',
            'end_date' => null,
            'is_current' => true,
            'description' => fake()->sentence(),
            'responsibilities' => [fake()->sentence()],
            'sort_order' => 0,
            'is_published' => true,
        ];
    }

    /**
     * Indicate that the record is hidden from the public site.
     */
    public function unpublished(): static
    {
        return $this->state(fn (array $attributes) => ['is_published' => false]);
    }
}
