<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Existing rows are kept: "tag" becomes the category, "description"
     * becomes the short description, and each row is published so that it
     * keeps appearing once the public page reads from the database.
     */
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->renameColumn('tag', 'category');
            $table->renameColumn('description', 'short_description');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->string('category', 80)->nullable()->change();
            $table->string('github_url', 2048)->nullable()->change();
            $table->string('slug', 170)->nullable()->after('title');
            $table->longText('details')->nullable()->after('short_description');
            $table->string('live_url', 2048)->nullable()->after('github_url');
            $table->foreignId('thumbnail_id')->nullable()->after('live_url')->constrained('media')->nullOnDelete();
            $table->boolean('is_featured')->default(false)->after('hue');
            $table->unsignedInteger('sort_order')->default(0)->after('is_featured');
            $table->string('status', 20)->default('draft')->after('sort_order');
            $table->timestamp('published_at')->nullable()->after('status');
        });

        $usedSlugs = [];

        foreach (DB::table('projects')->orderBy('id')->get() as $index => $project) {
            $base = Str::slug($project->title) ?: 'project';
            $slug = $base;
            $suffix = 2;

            while (in_array($slug, $usedSlugs, true)) {
                $slug = $base.'-'.$suffix++;
            }

            $usedSlugs[] = $slug;

            DB::table('projects')->where('id', $project->id)->update([
                'slug' => $slug,
                'sort_order' => $index + 1,
                'status' => 'published',
                'published_at' => $project->created_at ?? now(),
            ]);
        }

        Schema::table('projects', function (Blueprint $table) {
            $table->unique('slug');
            $table->index(['status', 'is_featured', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex(['status', 'is_featured', 'sort_order']);
            $table->dropUnique(['slug']);
            $table->dropConstrainedForeignId('thumbnail_id');
            $table->dropColumn(['slug', 'details', 'live_url', 'is_featured', 'sort_order', 'status', 'published_at']);
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->renameColumn('category', 'tag');
            $table->renameColumn('short_description', 'description');
        });
    }
};
