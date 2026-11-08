<?php

use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('public/Home');
});

Route::get('/login', function () {
    return Inertia::render('admin/auth/Login');
})->name('login');

Route::post('/login', [LoginController::class,'store'])->name('login.store');