<?php

namespace Database\Factories;

use App\Models\Education;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Education>
 */
class EducationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'institution' => fake()->company().' University',
            'degree' => 'Bachelor of Technology',
            'field_of_study' => 'Computer Science',
            'location' => fake()->city(),
            'start_date' => '2020-08-01',
            'end_date' => '2024-05-31',
            'is_current' => false,
            'grade' => null,
            'description' => null,
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
