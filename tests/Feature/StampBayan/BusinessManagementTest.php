<?php

use App\Models\Branch;
use App\Models\Business;
use App\Models\LoyaltyCard;
use App\Models\Staff;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

function businessOwner(array $businessAttributes = []): array
{
    $user = User::factory()->create();
    $business = Business::factory()->for($user)->create($businessAttributes);

    return [$user, $business];
}

it('lets a business owner manage branches for their own business', function () {
    [$user, $business] = businessOwner();

    $this->actingAs($user)
        ->post('/business/branches', [
            'name' => 'BGC Branch',
            'address' => 'Taguig',
            'remarks' => 'Main branch',
        ])
        ->assertRedirect();

    $branch = Branch::firstWhere('name', 'BGC Branch');

    expect($branch)
        ->not->toBeNull()
        ->business_id->toBe($business->id);

    $this->actingAs($user)
        ->put("/business/branches/{$branch->id}", [
            'name' => 'Makati Branch',
            'address' => 'Makati',
            'remarks' => 'Updated',
        ])
        ->assertRedirect();

    expect($branch->fresh()->name)->toBe('Makati Branch');
});

it('prevents a business owner from modifying another business branch', function () {
    [$user] = businessOwner();
    [, $otherBusiness] = businessOwner();
    $otherBranch = Branch::factory()->for($otherBusiness)->create();

    $this->actingAs($user)
        ->put("/business/branches/{$otherBranch->id}", [
            'name' => 'Hijacked Branch',
            'address' => 'Nowhere',
            'remarks' => null,
        ])
        ->assertForbidden();

    expect($otherBranch->fresh()->name)->not->toBe('Hijacked Branch');
});

it('lets a business owner create staff only for branches they own', function () {
    [$user, $business] = businessOwner();
    $branch = Branch::factory()->for($business)->create();
    [, $otherBusiness] = businessOwner();
    $otherBranch = Branch::factory()->for($otherBusiness)->create();

    $this->actingAs($user)
        ->post('/business/staffs', [
            'branch_id' => $branch->id,
            'username' => 'counter-staff',
            'password' => 'password',
            'confirm_password' => 'password',
            'remarks' => 'Front desk',
            'is_active' => true,
        ])
        ->assertRedirect();

    expect(Staff::firstWhere('username', 'counter-staff'))
        ->business_id->toBe($business->id)
        ->branch_id->toBe($branch->id);

    $this->actingAs($user)
        ->post('/business/staffs', [
            'branch_id' => $otherBranch->id,
            'username' => 'wrong-branch-staff',
            'password' => 'password',
            'confirm_password' => 'password',
            'is_active' => true,
        ])
        ->assertForbidden();

    expect(Staff::where('username', 'wrong-branch-staff')->exists())->toBeFalse();
});

it('lets a business owner create and reply to support tickets', function () {
    [$user, $business] = businessOwner();

    $this->actingAs($user)
        ->post('/business/tickets', [
            'subject' => 'Need help with QR download',
            'description' => 'The QR code download button should generate a printable file.',
            'priority' => 'high',
        ])
        ->assertRedirect();

    $ticket = Ticket::firstWhere('subject', 'Need help with QR download');

    expect($ticket)
        ->not->toBeNull()
        ->business_id->toBe($business->id)
        ->status->toBe('open');

    $this->actingAs($user)
        ->post("/business/tickets/{$ticket->id}/reply", [
            'message' => 'Adding more context for IT review.',
        ])
        ->assertRedirect();

    expect($ticket->replies()->first())
        ->message->toBe('Adding more context for IT review.')
        ->is_staff->toBeFalse();
});

it('keeps ticket details scoped to the authenticated business', function () {
    [$user] = businessOwner();
    [, $otherBusiness] = businessOwner();
    $ticket = Ticket::factory()->for($otherBusiness)->create();

    $this->actingAs($user)
        ->get("/business/tickets/{$ticket->id}")
        ->assertNotFound();
});

it('creates loyalty card templates with perks and branch assignments', function () {
    [$user, $business] = businessOwner();
    $branch = Branch::factory()->for($business)->create();

    $this->actingAs($user)
        ->post('/business/card-templates', [
            'name' => 'Coffee Rewards',
            'heading' => 'Collect coffee stamps',
            'subheading' => 'Every visit counts',
            'valid_until' => now()->addMonth()->toDateString(),
            'stampsNeeded' => 2,
            'mechanics' => 'Collect two stamps to complete the card.',
            'backgroundColor' => '#FFFFFF',
            'textColor' => '#000000',
            'stampColor' => '#111111',
            'stampFilledColor' => '#222222',
            'stampEmptyColor' => '#CCCCCC',
            'stampShape' => 'circle',
            'perks' => [
                ['stampNumber' => 1, 'reward' => 'Free syrup', 'color' => '#000000', 'details' => 'Any flavor'],
                ['stampNumber' => 2, 'reward' => 'Free coffee', 'color' => '#000000', 'details' => 'Regular size'],
            ],
            'branch_ids' => [$branch->id],
        ])
        ->assertRedirect(route('card-templates.index'));

    $card = LoyaltyCard::firstWhere('name', 'Coffee Rewards');

    expect($card)
        ->not->toBeNull()
        ->business_id->toBe($business->id);

    expect($card->perks)->toHaveCount(2);
    expect($card->branches()->pluck('branches.id')->all())->toBe([$branch->id]);
});
