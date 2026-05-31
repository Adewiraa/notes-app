<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('note_colors', function (Blueprint $table) {
            $table->string('key', 50)->primary();
            $table->string('name', 100);
            $table->string('hex', 10);
            $table->boolean('is_active')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('note_colors');
    }
};
