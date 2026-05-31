<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            NoteColorSeeder::class,
            UserSeeder::class,
        ]);
    }
}
