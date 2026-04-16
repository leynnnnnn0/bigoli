<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StampCode extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'user_id',
        'staff_id',
        'loyalty_card_id',
        'business_id',
        'customer_id',
        'branch_id',
        'code',
        'used_at',
        'is_expired',
        'is_offline_code',
        'reference_number',
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function loyalty_card()
    {
        return $this->belongsTo(LoyaltyCard::class);
    }

    public function completed_loyalty_card()
    {
        return $this->hasOne(CompletedLoyaltyCard::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
