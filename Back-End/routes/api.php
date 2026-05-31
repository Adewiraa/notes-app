<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ChecklistItemController;
use App\Http\Controllers\Api\V1\CollaboratorController;
use App\Http\Controllers\Api\V1\LabelController;
use App\Http\Controllers\Api\V1\NoteController;
use App\Http\Controllers\Api\V1\ReminderController;
use App\Http\Controllers\Api\V1\AttachmentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Notes App V1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // Auth Routes
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
        Route::post('register', [AuthController::class, 'register']);
        
        Route::middleware('auth:api')->group(function () {
            Route::post('refresh', [AuthController::class, 'refresh']);
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
        });
    });

    // Authenticated API Routes
    Route::middleware('auth:api')->group(function () {

        // Notes CRUD & Special Actions
        Route::get('notes-summary', [NoteController::class, 'summary']);
        Route::get('notes', [NoteController::class, 'index']);
        Route::post('notes', [NoteController::class, 'store']);
        Route::get('notes/{uuid}', [NoteController::class, 'show']);
        Route::patch('notes/{uuid}', [NoteController::class, 'update']);
        Route::delete('notes/{uuid}', [NoteController::class, 'destroy']);
        Route::post('notes/{uuid}/restore', [NoteController::class, 'restore']);
        Route::delete('notes/{uuid}/force', [NoteController::class, 'forceDelete']);

        Route::post('notes/{uuid}/pin', [NoteController::class, 'pin']);
        Route::post('notes/{uuid}/archive', [NoteController::class, 'archive']);

        // Checklist Items (nested within notes or standalone)
        Route::post('notes/{uuid}/checklist-items', [ChecklistItemController::class, 'store']);
        Route::patch('checklist-items/{id}', [ChecklistItemController::class, 'update']);
        Route::delete('checklist-items/{id}', [ChecklistItemController::class, 'destroy']);

        // Labels
        Route::get('labels', [LabelController::class, 'index']);
        Route::post('labels', [LabelController::class, 'store']);
        Route::patch('labels/{id}', [LabelController::class, 'update']);
        Route::delete('labels/{id}', [LabelController::class, 'destroy']);

        // Reminders
        Route::post('notes/{uuid}/reminders', [ReminderController::class, 'store']);
        Route::patch('reminders/{id}', [ReminderController::class, 'update']);
        Route::post('reminders/{id}/complete', [ReminderController::class, 'complete']);

        // Collaborators
        Route::post('notes/{uuid}/collaborators', [CollaboratorController::class, 'store']);
        Route::delete('collaborators/{id}', [CollaboratorController::class, 'destroy']);

        // Attachments
        Route::post('notes/{uuid}/attachments', [AttachmentController::class, 'store']);
        Route::get('attachments/{id}/download', [AttachmentController::class, 'download']);

    });
});
