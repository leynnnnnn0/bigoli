<?php

// Uses a disposable MySQL database, never the application's configured database.
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
set_exception_handler(function (Throwable $error) {
    fwrite(STDERR, $error->getMessage().PHP_EOL);
    exit(1);
});

use App\Models\Business;
use App\Models\CompletedLoyaltyCard;
use App\Models\Customer;
use App\Models\LoyaltyCard;
use App\Models\PerkClaim;
use App\Models\Staff;
use App\Models\StampCode;
use App\Services\LoyaltyStampService;
use App\Services\PerkClaimService;
use App\Services\StampCodeService;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Process\Process;

$worker = ($argv[1] ?? '') === 'worker';
$database = $worker ? ($argv[2] ?? '') : 'loyalty_security_'.bin2hex(random_bytes(8));
if (! preg_match('/^loyalty_security_[a-f0-9]{16}$/', $database)) {
    throw new RuntimeException('Invalid isolated test database name.');
}
$connection = config('database.connections.mysql');
$connection['url'] = null;
$connection['database'] = $database;
config(['database.connections.loyalty_security' => $connection, 'database.default' => 'loyalty_security', 'cache.default' => 'array']);

if ($worker) {
    $business = Business::firstOrFail();
    $customer = Customer::firstOrFail();
    $staff = Staff::where('is_active', true)->firstOrFail();
    $card = LoyaltyCard::firstOrFail();
    $job = (int) $argv[3];
    $signature = substr(hash_hmac('sha256', "{$customer->id}|{$business->id}", config('app.key')), 0, 24);
    $input = ['customer_qr' => "stampbayan:customer:{$customer->id}:{$business->id}:{$signature}", 'loyalty_card_id' => $card->id, 'branch_id' => $staff->branch_id, 'reference_number' => "CONCURRENT-{$job}"];
    $claim = ($argv[4] ?? '') === 'reward' ? PerkClaim::firstOrFail() : null;
    echo "READY\n";
    fflush(STDOUT);
    if ($claim) {
        $success = app(PerkClaimService::class)->redeem($claim, $business->id, null, $staff->id, "Worker {$job}");
    } else {
        $service = app(StampCodeService::class);
        $loyalty = app(LoyaltyStampService::class);
        $result = match ($job % 3) {
            0 => $service->redeemForCustomer($customer, "CONCURRENT-{$job}", $loyalty),
            1 => $service->recordStaffCustomerScan($staff, $input, $loyalty),
            2 => $service->recordCustomerScan($business, $business->user_id, $input, $loyalty),
        };
        $success = $result['success'] ?? false;
    }
    echo $success ? "SUCCESS\n" : "REJECTED\n";
    exit(0);
}

// A separate admin connection has no application database selected.
$admin = $connection;
$admin['database'] = '';
config(['database.connections.loyalty_security_admin' => $admin]);
$adminConnection = DB::connection('loyalty_security_admin');
$adminConnection->statement("CREATE DATABASE `{$database}`");
$processes = [];
try {
    Artisan::call('migrate', ['--force' => true]);
    Artisan::call('db:seed', ['--class' => 'E2ETestSeeder', '--force' => true]);
    $business = Business::firstOrFail();
    $card = LoyaltyCard::firstOrFail();
    for ($i = 0; $i < 12; $i += 3) {
        StampCode::create(['business_id' => $business->id, 'user_id' => $business->user_id, 'loyalty_card_id' => $card->id, 'code' => "CONCURRENT-{$i}", 'is_offline_code' => false]);
    }

    foreach (['stamps', 'reward'] as $phase) {
        $processes = [];
        DB::beginTransaction();
        if ($phase === 'stamps') {
            LoyaltyCard::whereKey($card->id)->lockForUpdate()->firstOrFail();
        } else {
            PerkClaim::query()->lockForUpdate()->firstOrFail();
        }
        for ($i = 0; $i < 12; $i++) {
            $process = new Process([PHP_BINARY, __FILE__, 'worker', $database, (string) $i, $phase]);
            $process->setTimeout(30);
            $process->start();
            $processes[] = $process;
        }
        $deadline = microtime(true) + 20;
        while (count(array_filter($processes, fn ($p) => str_contains($p->getOutput(), 'READY'))) !== 12) {
            if (microtime(true) > $deadline) {
                throw new RuntimeException('Workers did not reach concurrency barrier.');
            }
            usleep(10000);
        }
        DB::commit();
        $successes = 0;
        foreach ($processes as $process) {
            $process->wait();
            if (! $process->isSuccessful()) {
                throw new RuntimeException($process->getErrorOutput().$process->getOutput());
            }
            $successes += str_contains($process->getOutput(), 'SUCCESS') ? 1 : 0;
        }
        if ($successes !== ($phase === 'stamps' ? 12 : 1)) {
            throw new RuntimeException("Unexpected successful {$phase} operations: {$successes}");
        }
        echo "{$phase}: {$successes} successful operations from 12 simultaneous requests.\n";
    }
    if (CompletedLoyaltyCard::orderBy('card_cycle')->pluck('card_cycle')->all() !== [1, 2, 3, 4]
        || PerkClaim::count() !== 4
        || StampCode::whereNotNull('customer_id')->count() !== 0) {
        throw new RuntimeException('Concurrent stamp progress or rewards were inconsistent: '.json_encode([
            'cycles' => CompletedLoyaltyCard::orderBy('card_cycle')->pluck('card_cycle')->all(),
            'claims' => PerkClaim::count(),
            'remaining' => StampCode::whereNotNull('customer_id')->count(),
            'completed_stamps' => CompletedLoyaltyCard::pluck('stamps_collected')->all(),
        ]));
    }
    echo "PASS: Four complete cycles, four milestone claims, no lost or leftover stamps.\n";
} finally {
    foreach ($processes as $process) {
        if ($process->isRunning()) {
            $process->stop();
        }
    }
    while (DB::transactionLevel() > 0) {
        DB::rollBack();
    }
    DB::disconnect('loyalty_security');
    $adminConnection->statement("DROP DATABASE `{$database}`");
}
