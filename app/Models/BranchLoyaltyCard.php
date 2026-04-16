<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BranchLoyaltyCard extends Model
{
    /** @use HasFactory<\Database\Factories\BranchLoyaltyCardFactory> */
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'loyalty_card_id'
    ];
}
