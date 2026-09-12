<?php

namespace App\Models;

use Database\Factories\PerkFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Perk extends Model
{
    /** @use HasFactory<PerkFactory> */
    use HasFactory;

    protected $fillable = [
        'loyalty_card_id',
        'stampNumber',
        'reward',
        'details',
        'color',
    ];

    public function loyaltyCard()
    {
        return $this->belongsTo(LoyaltyCard::class);
    }

    public function claims()
    {
        return $this->hasMany(PerkClaim::class);
    }
}
