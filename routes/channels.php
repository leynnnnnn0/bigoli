<?php

use App\Models\Customer;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel(
    'customers.{customerId}',
    fn (Customer $customer, int $customerId): bool => $customer->id === $customerId,
    ['guards' => ['customer']],
);
