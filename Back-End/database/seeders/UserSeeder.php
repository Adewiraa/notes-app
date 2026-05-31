<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(['email' => 'superadmin@notesapp.com'], [
            'name'     => 'Super Admin',
            'password' => Hash::make('password'),
            'role'     => 'super_admin',
            'is_active'=> true,
        ]);

        User::updateOrCreate(['email' => 'admin@notesapp.com'], [
            'name'     => 'Admin',
            'password' => Hash::make('password'),
            'role'     => 'admin',
            'is_active'=> true,
        ]);

        User::updateOrCreate(['email' => 'user@notesapp.com'], [
            'name'     => 'User Demo',
            'password' => Hash::make('password'),
            'role'     => 'user',
            'is_active'=> true,
        ]);
    }
}
