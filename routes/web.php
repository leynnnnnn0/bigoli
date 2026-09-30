<?php

use App\Http\Controllers\BranchController;
use App\Http\Controllers\Business\CardTempalateController;
use App\Http\Controllers\Business\CustomerController;
use App\Http\Controllers\Business\DashboardController;
use App\Http\Controllers\Business\IssueStampController;
use App\Http\Controllers\Business\PerkClaimController;
use App\Http\Controllers\Business\QRStudioController;
use App\Http\Controllers\Business\StaffController;
use App\Http\Controllers\Business\StampCodeController;
use App\Http\Controllers\Business\TicketController;
use App\Http\Controllers\Customer\CustomerAuthController;
use App\Http\Controllers\Customer\DashboardController as CustomerDashboardController;
use App\Http\Controllers\Staff\DashboardController as StaffDashboardController;
use App\Http\Controllers\Staff\StaffAuthController;
use App\Http\Middleware\EnsureStaffIsActive;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::domain(config('portals.domains.admin'))->group(function () {
    Route::redirect('/', '/dashboard');

    Route::middleware(['auth:web', 'verified'])->group(function () {
        Route::get('/stamp-codes/export', [StampCodeController::class, 'export'])
            ->name('business.stamp-codes.export');

        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::resource('/staffs', StaffController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('/branches', BranchController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('/card-templates', CardTempalateController::class);
        Route::get('/qr-studio', [QRStudioController::class, 'index']);
        Route::get('/qr-studio/download', [QRStudioController::class, 'download']);
        Route::post('/qr-studio/update', [QRStudioController::class, 'update']);
        Route::resource('/customers', CustomerController::class)->only(['index', 'show']);
        Route::get('/issue-stamp', [IssueStampController::class, 'index']);
        Route::post('/issue-stamp/scan-customer', [StampCodeController::class, 'recordCustomerScan']);
        Route::get('/stamp-codes', [StampCodeController::class, 'index']);
        Route::get('/perk-claims', [PerkClaimController::class, 'index'])->name('perk-claims.index');
        Route::post('/perk-claims/{perkClaim}/redeem', [PerkClaimController::class, 'markAsRedeemed'])->name('perk-claims.redeem');
        Route::post('/perk-claims/{perkClaim}/undo', [PerkClaimController::class, 'undoRedeem'])->name('perk-claims.undo');
        Route::get('/tickets', [TicketController::class, 'index'])->name('tickets.index');
        Route::post('/tickets', [TicketController::class, 'store'])->name('tickets.store');
        Route::get('/tickets/{id}', [TicketController::class, 'show'])->name('tickets.show');
        Route::post('/tickets/{id}/reply', [TicketController::class, 'reply'])->name('tickets.reply');
    });

    require __DIR__.'/settings.php';
});

Route::domain(config('portals.domains.customer'))->name('customer.')->group(function () {
    Route::get('/', function () {
        return Inertia::render('welcome', [
            'customerLoginUrl' => route('customer.login'),
            'customerRegisterUrl' => route('customer.register'),
        ]);
    })->name('home');

    Route::get('/sitemap.xml', function () {
        $pages = [
            ['loc' => url('/'), 'priority' => '1.0', 'changefreq' => 'weekly'],
        ];

        return response()->view('sitemap', compact('pages'))
            ->header('Content-Type', 'text/xml');
    });

    Route::post('/stamps/record', [StampCodeController::class, 'record'])->name('stamps.record');

    Route::middleware('guest:customer')->group(function () {
        Route::get('/login', [CustomerAuthController::class, 'index'])->name('login');
        Route::post('/login', [CustomerAuthController::class, 'login'])->name('login.store');
        Route::get('/register', [CustomerAuthController::class, 'showRegister'])->name('register');
        Route::post('/register', [CustomerAuthController::class, 'register'])->name('register.store');
        Route::get('/forgot-password', [CustomerAuthController::class, 'showForgotPassword'])->name('password.request');
        Route::post('/forgot-password', [CustomerAuthController::class, 'sendResetLink'])->name('password.email');
        Route::get('/reset-password/{token}', [CustomerAuthController::class, 'showResetPassword'])->name('password.reset');
        Route::post('/reset-password', [CustomerAuthController::class, 'resetPassword'])->name('password.update');
    });

    Route::middleware('auth:customer')->group(function () {
        Route::get('/dashboard', [CustomerDashboardController::class, 'index'])->name('dashboard');
        Route::post('/logout', [CustomerAuthController::class, 'logout'])->name('logout');
        Route::post('/profile/update', [CustomerDashboardController::class, 'updateProfile'])->name('profile.update');
        Route::post('/password/update', [CustomerDashboardController::class, 'updatePassword'])->name('profile.password.update');
        Route::post('/stamps/{stampCode}/rating', [CustomerDashboardController::class, 'rateStamp'])->name('stamps.rating');

        Route::get('/verify-email', function () {
            return Inertia::render('Customer/Auth/VerifyEmail');
        })->name('verification.notice');

        Route::get('/verify-email/{id}/{hash}', function (EmailVerificationRequest $request) {
            $request->fulfill();

            return redirect()->route('customer.dashboard');
        })->middleware('signed')->name('verification.verify');

        Route::post('/email/verification-notification', function (Request $request) {
            $request->user('customer')->sendEmailVerificationNotification();

            return back()->with('status', 'verification-link-sent');
        })->middleware('throttle:6,1')->name('verification.send');
    });
});

Route::domain(config('portals.domains.staff'))->name('staff.')->group(function () {
    Route::redirect('/', '/dashboard');

    Route::middleware('guest:staff')->group(function () {
        Route::get('/login', [StaffAuthController::class, 'index'])->name('login');
        Route::post('/login', [StaffAuthController::class, 'login'])->name('login.store');
    });

    Route::middleware(['auth:staff', EnsureStaffIsActive::class])->group(function () {
        Route::get('/dashboard', [StaffDashboardController::class, 'index'])->name('dashboard');
        Route::post('/dashboard/generate-code', [StaffDashboardController::class, 'generateCode'])->name('dashboard.generate-code');
        Route::post('/scan-customer', [StaffDashboardController::class, 'recordCustomerScan'])->name('scan-customer');
        Route::post('/perk-claims/{perkClaim}/redeem', [StaffDashboardController::class, 'markAsRedeemed'])->name('perk-claims.redeem');
        Route::post('/perk-claims/{perkClaim}/undo', [StaffDashboardController::class, 'undoRedeem'])->name('perk-claims.undo');
        Route::post('/logout', [StaffAuthController::class, 'logout'])->name('logout');
    });
});

Route::get('/', function () {
    return Inertia::render('welcome', [
        'customerLoginUrl' => route('customer.login'),
        'customerRegisterUrl' => route('customer.register'),
    ]);
})->name('home');
