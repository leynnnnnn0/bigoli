<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QrCode extends Model
{
     protected $fillable = [
        'business_id',
        'heading',
        'subheading',
        'background_color',
        'text_color',
        'background_image',
        'logo',
        'subdomain',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the business that owns the QR code
     */
    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}
