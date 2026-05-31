<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['super_admin', 'admin', 'user', 'viewer'])->default('user')->after('email');
            $table->unsignedBigInteger('department_id')->nullable()->after('role');
            $table->boolean('is_active')->default(true)->after('department_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'department_id', 'is_active']);
        });
    }
};
