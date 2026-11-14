<?php

use App\Http\Controllers\Admin\AchievementController;
use App\Http\Controllers\Admin\CertificationController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EducationController;
use App\Http\Controllers\Admin\ExperienceController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\SiteSettingController;
use App\Http\Controllers\Admin\SkillCategoryController;
use App\Http\Controllers\Admin\SkillController;
use App\Http\Controllers\Admin\SocialLinkController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\PortfolioController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PortfolioController::class, 'home'])->name('home');
Route::get('/projects/{slug}', [PortfolioController::class, 'project'])->name('projects.show');

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->name('login.store');
});

Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth')->name('logout');

Route::middleware(['auth', 'can:access-admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::get('/settings', [SiteSettingController::class, 'edit'])->name('settings.edit');
    Route::post('/settings', [SiteSettingController::class, 'update'])->name('settings.update');

    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/create', [ProjectController::class, 'create'])->name('projects.create');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project}/edit', [ProjectController::class, 'edit'])->name('projects.edit');
    Route::get('/projects/{project}/preview', [ProjectController::class, 'preview'])->name('projects.preview');
    Route::post('/projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::patch('/projects/{project}/toggle', [ProjectController::class, 'toggle'])->name('projects.toggle');
    Route::patch('/projects/{project}/move', [ProjectController::class, 'move'])->name('projects.move');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');

    Route::get('/media', [MediaController::class, 'index'])->name('media.index');
    Route::post('/media', [MediaController::class, 'store'])->name('media.store');
    Route::post('/media/{medium}', [MediaController::class, 'update'])->name('media.update');
    Route::delete('/media/{medium}', [MediaController::class, 'destroy'])->name('media.destroy');

    /*
     | Content types that share the same create/edit/delete/reorder/visibility
     | flow. Updates use POST because they may carry file uploads.
     */
    $contentControllers = [
        'skill-categories' => SkillCategoryController::class,
        'skills' => SkillController::class,
        'experiences' => ExperienceController::class,
        'education' => EducationController::class,
        'certifications' => CertificationController::class,
        'achievements' => AchievementController::class,
        'social-links' => SocialLinkController::class,
    ];

    foreach ($contentControllers as $uri => $controller) {
        Route::prefix($uri)->name($uri.'.')->controller($controller)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/create', 'create')->name('create');
            Route::post('/', 'store')->name('store');
            Route::get('/{record}/edit', 'edit')->name('edit')->whereNumber('record');
            Route::post('/{record}', 'update')->name('update')->whereNumber('record');
            Route::patch('/{record}/toggle', 'toggle')->name('toggle')->whereNumber('record');
            Route::patch('/{record}/move', 'move')->name('move')->whereNumber('record');
            Route::delete('/{record}', 'destroy')->name('destroy')->whereNumber('record');
        });
    }
});
