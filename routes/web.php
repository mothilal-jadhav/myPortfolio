<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Admin\ProjectController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    return Inertia::render('public/Home');
});

Route::middleware('guest')->group(function(){
    
    Route::get('/login', function () {
        return Inertia::render('admin/auth/Login');
    })->name('login');

    Route::post('/login', [LoginController::class,'store'])->name('login.store');

});

Route::middleware('auth')->prefix('admin')->name('admin.')->group(function(){
    Route::get('/dashboard', [DashboardController::class,'index'])->name('dashboard');

    Route::get('/projects', [ProjectController::class, 'index'])
        ->name('projects.index');

    Route::get('/projects/create', [ProjectController::class, 'create'])
        ->name('projects.create');

    Route::post('/projects', [ProjectController::class, 'store'])
        ->name('projects.store');
});