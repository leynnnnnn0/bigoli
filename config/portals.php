<?php

return [
    'customer_register_url' => env('CUSTOMER_REGISTER_URL', 'http://rewards.bigoli.test/register'),

    'domains' => [
        'admin' => env('ADMIN_DOMAIN', 'admin-rewards.bigoli.test'),
        'customer' => env('CUSTOMER_DOMAIN', 'rewards.bigoli.test'),
        'staff' => env('STAFF_DOMAIN', 'store-staff-rewards.bigoli.test'),
    ],
];
