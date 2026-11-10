<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;


#[Fillable([
    'title',
    'tag',
    'description',
    'github_url',
    'hue',
])]
class Project extends Model
{
    //
}
