<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    /** @use HasFactory<\Database\Factories\BranchFactory> */
    use HasFactory;

    protected $fillable = [
        'business_id',
        'name',
        'address',
        'remarks'
    ];


    public function business()
    {
        return $this->belongsTo(Business::class); 
    }

    public function loyaltyCards()
    {
        return $this->belongsToMany(LoyaltyCard::class, 'branch_loyalty_cards');
    }

    public function stampCodes()
    {
        return $this->hasMany(StampCode::class);
    }
}
