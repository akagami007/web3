<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/auth/nonce', [AuthController::class, 'nonce']);
Route::post('/auth/verify', [AuthController::class, 'verify']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
});
