<?php

namespace Database\Seeders;

use App\Models\NoteColor;
use Illuminate\Database\Seeder;

class NoteColorSeeder extends Seeder
{
    public function run(): void
    {
        $colors = [
            ['key' => 'default', 'name' => 'Default',   'hex' => '#FFFFFF', 'is_active' => true],
            ['key' => 'red',     'name' => 'Red',        'hex' => '#F28B82', 'is_active' => true],
            ['key' => 'pink',    'name' => 'Pink',       'hex' => '#FDCFE8', 'is_active' => true],
            ['key' => 'purple',  'name' => 'Purple',     'hex' => '#D7AEFB', 'is_active' => true],
            ['key' => 'blue',    'name' => 'Blue',       'hex' => '#AECBFA', 'is_active' => true],
            ['key' => 'teal',    'name' => 'Teal',       'hex' => '#A8DAB5', 'is_active' => true],
            ['key' => 'green',   'name' => 'Green',      'hex' => '#CCFF90', 'is_active' => true],
            ['key' => 'yellow',  'name' => 'Yellow',     'hex' => '#FFF475', 'is_active' => true],
            ['key' => 'orange',  'name' => 'Orange',     'hex' => '#FBBC04', 'is_active' => true],
            ['key' => 'brown',   'name' => 'Brown',      'hex' => '#E6C9A8', 'is_active' => true],
            ['key' => 'gray',    'name' => 'Gray',       'hex' => '#E8EAED', 'is_active' => true],
        ];

        foreach ($colors as $color) {
            NoteColor::updateOrCreate(['key' => $color['key']], $color);
        }
    }
}
