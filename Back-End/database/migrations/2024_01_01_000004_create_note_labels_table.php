<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('note_labels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('color_key', 50)->nullable();
            $table->enum('scope', ['personal', 'department', 'global'])->default('personal');
            $table->unsignedBigInteger('department_id')->nullable();
            $table->timestamps();

            $table->index('owner_id');
        });

        Schema::create('note_label_map', function (Blueprint $table) {
            $table->foreignId('note_id')->constrained('notes')->cascadeOnDelete();
            $table->foreignId('label_id')->constrained('note_labels')->cascadeOnDelete();
            $table->primary(['note_id', 'label_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('note_label_map');
        Schema::dropIfExists('note_labels');
    }
};
