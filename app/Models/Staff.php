<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Auth\Authenticatable;

class Staff extends Model implements AuthenticatableContract, AuthorizableContract
{
    /** @use HasFactory<\Database\Factories\StaffFactory> */
    use HasFactory, Authenticatable, Authorizable, Notifiable;

    protected $fillable = [ 
        'business_id',
        'branch_id',
        'branch',
        'username',
        'password',
        'remarks',
        'is_active'
    ];
     protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $table = 'staff';

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function branchRelation()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }
}

// test