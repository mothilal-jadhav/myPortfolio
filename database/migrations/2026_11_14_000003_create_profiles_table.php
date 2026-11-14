<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120)->nullable();
            $table->string('title', 160)->nullable();
            $table->string('hero_greeting', 80)->nullable();
            $table->string('introduction', 500)->nullable();
            $table->string('primary_cta_label', 60)->nullable();
            $table->string('primary_cta_url', 2048)->nullable();
            $table->string('secondary_cta_label', 60)->nullable();
            $table->string('secondary_cta_url', 2048)->nullable();
            $table->string('about_heading', 160)->nullable();
            $table->text('biography')->nullable();
            $table->text('about_extra')->nullable();
            $table->json('stats')->nullable();
            $table->boolean('show_calculated_stats')->default(false);
            $table->string('contact_heading', 160)->nullable();
            $table->string('contact_message', 500)->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 40)->nullable();
            $table->string('location', 160)->nullable();
            $table->foreignId('profile_image_id')->nullable()->constrained('media')->nullOnDelete();
            $table->foreignId('hero_image_id')->nullable()->constrained('media')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
