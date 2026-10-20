<?php

use App\Models\{Business, Branch, Customer, Staff, LoyaltyCard, Perk, PerkClaim, StampCode, Ticket, CompletedLoyaltyCard};
use App\Services\{StampCodeService, LoyaltyStampService, PerkClaimService};
use Database\Seeders\E2ETestSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\{Auth, Notification, Password};

class ExecutionTest extends Tests\TestCase
{
    use RefreshDatabase;
    private $biz; private $customer; private $staff; private $card; private $input;
    protected function setUp(): void {
        parent::setUp(); $this->seed(E2ETestSeeder::class);
        $this->biz=Business::firstOrFail(); $this->customer=Customer::firstOrFail();
        $this->staff=Staff::where('is_active',true)->firstOrFail(); $this->card=LoyaltyCard::firstOrFail();
        $this->card->update(['stampsNeeded'=>5,'minimum_amount_spent'=>100]);
        $this->card->perks()->update(['stampNumber'=>3]);
        Perk::create(['loyalty_card_id'=>$this->card->id,'stampNumber'=>5,'reward'=>'QA Final Reward']);
        $sig=substr(hash_hmac('sha256',"{$this->customer->id}|{$this->biz->id}",config('app.key')),0,24);
        $this->input=['customer_qr'=>"stampbayan:customer:{$this->customer->id}:{$this->biz->id}:{$sig}",'loyalty_card_id'=>$this->card->id,'branch_id'=>$this->staff->branch_id,'transaction_number'=>'QA-RECEIPT','amount_spent'=>100];
    }
    private function url($role,$path){return 'https://'.config("portals.domains.$role").$path;}
    private function owner(){return $this->actingAs($this->biz->user,'web');}
    private function issue($amount=100){return app(StampCodeService::class)->recordStaffCustomerScan($this->staff,array_replace($this->input,['amount_spent'=>$amount]),app(LoyaltyStampService::class));}
    private function claim(){for($i=0;$i<3;$i++)$this->issue();return PerkClaim::firstOrFail();}
    private function cardData($replace=[]){return array_replace(['name'=>'QA New Card','heading'=>'Collect stamps','valid_until'=>now()->addYear()->toDateString(),'stampsNeeded'=>5,'minimum_amount_spent'=>100,'mechanics'=>'Collect five stamps','stampShape'=>'circle','perks'=>[['stampNumber'=>3,'reward'=>'QA Reward']],'branch_ids'=>[$this->staff->branch_id]],$replace);}
    public function test_QC_001_invalid_login_all_roles(){
        foreach(['admin'=>['email'=>$this->biz->user->email],'customer'=>['email'=>$this->customer->email],'staff'=>['username'=>$this->staff->username]] as $role=>$data){
            $this->postJson($this->url($role,'/login'),$data+['password'=>'wrong-password'])->assertUnprocessable();
            $this->postJson($this->url($role,'/login'),[$role==='staff'?'username':'email'=>'unknown@example.com','password'=>'wrong-password'])->assertUnprocessable();
        }
    }
    public function test_UAT_002_branch_create_update_reload(){
        $this->owner()->post($this->url('admin','/branches'),['name'=>'QA Branch A2','address'=>'Before'])->assertSessionHasNoErrors();
        $branch=Branch::where('name','QA Branch A2')->firstOrFail();
        $this->put($this->url('admin',"/branches/$branch->id"),['name'=>'QA Branch A2','address'=>'After'])->assertSessionHasNoErrors();
        $this->assertSame('After',$branch->fresh()->address);$this->get($this->url('admin','/branches'))->assertOk();
    }
    public function test_UAT_004_card_create_and_edit(){
        $this->owner()->post($this->url('admin','/card-templates'),$this->cardData())->assertSessionHasNoErrors();
        $card=LoyaltyCard::where('name','QA New Card')->firstOrFail();
        $this->assertEquals(100,$card->minimum_amount_spent);$this->assertEquals(3,$card->perks()->first()->stampNumber);
        $this->put($this->url('admin',"/card-templates/$card->id"),$this->cardData(['heading'=>'Updated heading']))->assertSessionHasNoErrors();
        $this->assertSame('Updated heading',$card->fresh()->heading);
        $this->get($this->url('admin',"/card-templates/$card->id/edit"))->assertOk();
    }
    public function test_QC_010_card_invalid_fields(){
        foreach(['name'=>'','heading'=>'','stampsNeeded'=>0,'minimum_amount_spent'=>-1,'mechanics'=>str_repeat('x',501)] as $key=>$value){
            $this->owner()->postJson($this->url('admin','/card-templates'),$this->cardData([$key=>$value]))->assertUnprocessable()->assertJsonValidationErrors($key);
        }
        $this->postJson($this->url('admin','/card-templates'),$this->cardData(['minimum_amount_spent'=>1.001]))->assertUnprocessable();
        $this->assertSame(1,LoyaltyCard::count());
    }
    public function test_QC_011_invalid_duplicate_milestones(){
        foreach([[['stampNumber'=>0,'reward'=>'a']],[['stampNumber'=>6,'reward'=>'a']],[['stampNumber'=>3,'reward'=>'a'],['stampNumber'=>3,'reward'=>'b']]] as $perks){
            $this->owner()->postJson($this->url('admin','/card-templates'),$this->cardData(['perks'=>$perks]))->assertUnprocessable();
        }
        $this->assertSame(1,LoyaltyCard::count());
    }
    public function test_QC_014_owner_and_staff_minimum_boundary(){
        foreach(['admin','staff'] as $role){
            $this->actingAs($role==='admin'?$this->biz->user:$this->staff,$role==='admin'?'web':'staff');
            $path=$role==='admin'?'/issue-stamp/scan-customer':'/scan-customer';
            $this->postJson($this->url($role,$path),array_replace($this->input,['amount_spent'=>99.99]))->assertUnprocessable();
            $this->post($this->url($role,$path),$this->input)->assertSessionHasNoErrors();
        }
        $this->assertSame(2,StampCode::whereNotNull('used_at')->count());
        $this->assertSame(2,StampCode::where('amount_spent',100)->whereNotNull('used_at')->count());
    }
    public function test_QC_015_code_generation_minimum_boundary(){
        $this->actingAs($this->staff,'staff')->postJson($this->url('staff','/dashboard/generate-code'),array_replace($this->input,['amount_spent'=>99.99]))->assertUnprocessable();
        $this->post($this->url('staff','/dashboard/generate-code'),$this->input)->assertSessionHasNoErrors();
        $this->assertSame(2,StampCode::count());
    }
    public function test_QC_016_invalid_receipt_and_amount_all_paths(){
        foreach(['admin','staff'] as $role){
            $this->actingAs($role==='admin'?$this->biz->user:$this->staff,$role==='admin'?'web':'staff');
            $paths=$role==='admin'?['/issue-stamp/scan-customer']:['/scan-customer','/dashboard/generate-code'];
            foreach($paths as $path)foreach([['transaction_number'=>''],['amount_spent'=>-1],['amount_spent'=>'abc'],['amount_spent'=>100.001]] as $bad){
                $this->postJson($this->url($role,$path),array_replace($this->input,$bad))->assertUnprocessable();
            }
        }$this->assertSame(1,StampCode::count());
    }
    public function test_QC_017_malformed_and_tampered_qr(){
        foreach(['admin','staff'] as $role){
            $this->actingAs($role==='admin'?$this->biz->user:$this->staff,$role==='admin'?'web':'staff');
            foreach(['random text',$this->input['customer_qr'].'tampered'] as $qr)$this->postJson($this->url($role,$role==='admin'?'/issue-stamp/scan-customer':'/scan-customer'),array_replace($this->input,['customer_qr'=>$qr]))->assertUnprocessable();
        }$this->assertSame(0,StampCode::whereNotNull('used_at')->count());
    }
    public function test_QC_018_foreign_customer_qr(){
        $foreign=Customer::factory()->create();$sig=substr(hash_hmac('sha256',"$foreign->id|$foreign->business_id",config('app.key')),0,24);
        foreach(['admin','staff'] as $role){$this->actingAs($role==='admin'?$this->biz->user:$this->staff,$role==='admin'?'web':'staff');
            $this->postJson($this->url($role,$role==='admin'?'/issue-stamp/scan-customer':'/scan-customer'),array_replace($this->input,['customer_qr'=>"stampbayan:customer:$foreign->id:$foreign->business_id:$sig"]))->assertUnprocessable();}
        $this->assertSame(0,StampCode::whereNotNull('used_at')->count());
    }
    public function test_QC_019_ineligible_branch(){
        $branch=Branch::create(['business_id'=>$this->biz->id,'name'=>'Other branch']);
        $this->owner()->postJson($this->url('admin','/issue-stamp/scan-customer'),array_replace($this->input,['branch_id'=>$branch->id]))->assertUnprocessable();
        $this->staff->update(['branch_id'=>$branch->id]);
        $this->actingAs($this->staff,'staff')->postJson($this->url('staff','/scan-customer'),$this->input)->assertUnprocessable();
        $this->postJson($this->url('staff','/dashboard/generate-code'),array_replace($this->input,['branch_id'=>$branch->id]))->assertForbidden();
        $this->assertSame(0,StampCode::whereNotNull('used_at')->count());
    }
    public function test_QC_020_expiry_all_paths(){
        $this->card->update(['valid_until'=>now()->subDay()->toDateString()]);
        $this->owner()->postJson($this->url('admin','/issue-stamp/scan-customer'),$this->input)->assertUnprocessable();
        $this->actingAs($this->staff,'staff')->postJson($this->url('staff','/scan-customer'),$this->input)->assertUnprocessable();
        $this->postJson($this->url('staff','/dashboard/generate-code'),$this->input)->assertForbidden();
        $this->actingAs($this->customer,'customer')->post($this->url('customer','/stamps/record'),['code'=>'E2ECODE1','loyalty_card_id'=>$this->card->id])->assertSessionHasErrors('code');
        $this->assertSame(0,StampCode::whereNotNull('used_at')->count());
    }
    public function test_QC_021_unknown_used_foreign_codes(){
        $foreign=Customer::factory()->create();
        $otherCard=LoyaltyCard::factory()->create(['business_id'=>$foreign->business_id]);
        StampCode::create(['business_id'=>$foreign->business_id,'loyalty_card_id'=>$otherCard->id,'code'=>'FOREIGN1']);
        $this->actingAs($this->customer,'customer')->post($this->url('customer','/stamps/record'),['code'=>'E2ECODE1','loyalty_card_id'=>$this->card->id])->assertSessionHasNoErrors();
        foreach(['UNKNOWN1','E2ECODE1','FOREIGN1'] as $code)$this->post($this->url('customer','/stamps/record'),['code'=>$code,'loyalty_card_id'=>$this->card->id])->assertSessionHasErrors('code');
        $this->assertSame(1,StampCode::where('customer_id',$this->customer->id)->count());
    }
    public function test_QC_026_milestone_awarded_only_at_three(){
        $this->issue();$this->issue();$this->assertSame(0,PerkClaim::count());$this->issue();$this->assertSame(1,PerkClaim::count());
    }
    public function test_QC_027_two_cycles_with_two_rewards_each(){
        for($i=0;$i<10;$i++){
            if($i%2===0){$this->issue();}else{
                $code=StampCode::create(['business_id'=>$this->biz->id,'loyalty_card_id'=>$this->card->id,'code'=>"CYCLE-$i",'is_offline_code'=>false]);
                $this->assertTrue(app(StampCodeService::class)->redeemForCustomer($this->customer,$code->code,app(LoyaltyStampService::class))['success']);
            }
        }
        $this->assertSame(2,CompletedLoyaltyCard::count());$this->assertSame(4,PerkClaim::count());$this->assertSame(0,StampCode::where('customer_id',$this->customer->id)->count());
        $this->assertSame([1,2],CompletedLoyaltyCard::orderBy('card_cycle')->pluck('card_cycle')->all());
    }
    public function test_UAT_013_014_redeem_and_undo(){
        $claim=$this->claim();
        $this->actingAs($this->staff,'staff')->post($this->url('staff',"/perk-claims/$claim->id/redeem"),['remarks'=>'QA redemption'])->assertSessionHasNoErrors();
        $this->assertTrue($claim->fresh()->is_redeemed);$this->assertSame($this->staff->id,$claim->fresh()->redeemed_by_staff_id);
        $this->owner()->post($this->url('admin',"/perk-claims/$claim->id/undo"))->assertSessionHasNoErrors();
        $claim->refresh();$this->assertFalse($claim->is_redeemed);$this->assertNull($claim->redeemed_at);$this->assertNull($claim->remarks);$this->assertNull($claim->redeemed_by_staff_id);
    }
    public function test_QC_031_foreign_claim_redeem_and_undo(){
        $claim=$this->claim();$other=Business::factory()->create();
        $this->actingAs($other->user,'web')->post($this->url('admin',"/perk-claims/$claim->id/redeem"))->assertForbidden();
        $this->post($this->url('admin',"/perk-claims/$claim->id/undo"))->assertForbidden();$this->assertFalse($claim->fresh()->is_redeemed);
    }
    public function test_QC_036_foreign_customer_hidden(){
        $foreign=Customer::factory()->create();
        $this->owner()->get($this->url('admin',"/customers/$foreign->id"))->assertNotFound();
        $this->get($this->url('admin','/customers?search='.urlencode($foreign->email)))->assertOk()->assertInertia(fn($page)=>$page->has('customers.data',0));
    }
    public function test_UAT_019_ticket_create_reply_and_reload(){
        $this->owner()->post($this->url('admin','/tickets'),['subject'=>'QA support','description'=>'QA description','priority'=>'medium'])->assertSessionHasNoErrors();
        $ticket=Ticket::firstOrFail();$this->get($this->url('admin',"/tickets/$ticket->id"))->assertOk();
        $this->post($this->url('admin',"/tickets/$ticket->id/reply"),['message'=>'QA reply'])->assertSessionHasNoErrors();
        $this->assertSame('QA reply',$ticket->replies()->first()->message);
        $this->get($this->url('admin',"/tickets/$ticket->id"))->assertOk()->assertInertia(fn($page)=>$page->where('ticket.replies.0.message','QA reply'));
    }
    public function test_QC_038_ticket_validation_and_foreign_access(){
        $this->owner()->postJson($this->url('admin','/tickets'),[])->assertUnprocessable();
        $foreign=Business::factory()->create();$ticket=$foreign->tickets()->create(['ticket_number'=>'QA-FOREIGN','subject'=>'Other','description'=>'Foreign','priority'=>'medium','status'=>'open']);
        $this->get($this->url('admin',"/tickets/$ticket->id"))->assertNotFound();
        $this->post($this->url('admin',"/tickets/$ticket->id/reply"),['message'=>'Unauthorized'])->assertNotFound();$this->assertSame(0,$ticket->replies()->count());
    }
    public function test_UAT_005_qr_settings_persist(){
        $this->owner()->post($this->url('admin','/qr-studio/update'),['heading'=>'QA QR Heading','subheading'=>'QA subheading','backgroundColor'=>'#FFF8F0','textColor'=>'#000000','branch_id'=>$this->staff->branch_id])->assertSessionHasNoErrors();
        $qr=$this->biz->qr_code()->firstOrFail();$this->assertSame('QA QR Heading',$qr->heading);$this->assertSame('#FFF8F0',$qr->background_color);
        $this->get($this->url('admin','/qr-studio'))->assertOk();
    }
    public function test_QC_037_filtered_export_download(){
        $this->issue();$foreign=Customer::factory()->create();$otherCard=LoyaltyCard::factory()->create(['business_id'=>$foreign->business_id]);
        StampCode::create(['business_id'=>$foreign->business_id,'loyalty_card_id'=>$otherCard->id,'code'=>'EXPORTOTHER']);
        $response=$this->owner()->get($this->url('admin','/stamp-codes/export?status=used&branch_id='.$this->staff->branch_id))->assertOk()->assertDownload();
        $book=\PhpOffice\PhpSpreadsheet\IOFactory::load($response->baseResponse->getFile()->getPathname());
        $export=$book->getActiveSheet()->toArray();
        $this->assertCount(2,$export);$this->assertStringNotContainsString('EXPORTOTHER',json_encode($export));
        $this->assertStringContainsString($this->customer->email,json_encode($export));
        $query=app(StampCodeService::class)->query($this->biz->id,['status'=>'used','branch_id'=>$this->staff->branch_id]);
        $this->assertSame(1,$query->count());$this->assertSame($this->customer->id,$query->first()->customer_id);
    }
    public function test_UAT_020_logout_all_roles(){
        foreach(['admin'=>[$this->biz->user,'web'],'customer'=>[$this->customer,'customer'],'staff'=>[$this->staff,'staff']] as $role=>[$account,$guard]){
            $this->actingAs($account,$guard)->post($this->url($role,'/logout'))->assertRedirect();$this->assertGuest($guard);
            $this->get($this->url($role,'/dashboard'))->assertRedirect($this->url($role,'/login'));
        }
    }
    public function test_QC_ticket_list_after_creation(){
        $this->owner()->post($this->url('admin','/tickets'),['subject'=>'QA support','description'=>'QA description','priority'=>'medium'])->assertSessionHasNoErrors();
        $this->get($this->url('admin','/tickets'))->assertOk();
    }
    public function test_QC_ticket_reply_data_after_post(){
        $ticket=$this->biz->tickets()->create(['ticket_number'=>'QA-REPLY','subject'=>'QA','description'=>'QA','priority'=>'medium','status'=>'open']);
        $this->owner()->post($this->url('admin',"/tickets/$ticket->id/reply"),['message'=>'QA reply'])->assertSessionHasNoErrors();
        $this->assertSame(1,$ticket->replies()->count());
        $data=app(\App\Services\TicketService::class)->show($this->biz,$ticket->id);
        $this->assertSame('QA reply',$data['replies'][0]['message']);
        $this->assertSame($this->biz->user->username,$data['replies'][0]['user']['name']);
    }
    public function test_QC_003_registration_validation(){
        $data=['branch_id'=>$this->staff->branch_id,'username'=>'qa-new-customer','email'=>$this->customer->email,'date_of_birth'=>'1990-01-01','phone_number'=>'09170001111','password'=>'qa-password-123','password_confirmation'=>'qa-password-123'];
        foreach([['email'=>$this->customer->email],['email'=>'not-an-email'],['username'=>''],['branch_id'=>'']] as $bad)$this->postJson($this->url('customer','/register'),array_replace($data,$bad))->assertUnprocessable();
        $this->assertSame(1,Customer::count());
    }
    public function test_UAT_006_customer_registration_verification_and_login(){
        Notification::fake();
        $data=['branch_id'=>$this->staff->branch_id,'username'=>'qa-new-customer','email'=>'qa-new@example.com','date_of_birth'=>'1990-01-01','phone_number'=>'09170001111','password'=>'qa-password-123','password_confirmation'=>'qa-password-123'];
        $this->post($this->url('customer','/register'),$data)->assertSessionHasNoErrors();
        $new=Customer::where('email',$data['email'])->firstOrFail();$this->assertSame($this->biz->id,$new->business_id);
        $this->actingAs($new,'customer')->get($this->url('customer','/dashboard'))->assertOk();
        $this->post($this->url('customer','/logout'))->assertRedirect();
        $this->post($this->url('customer','/login'),['email'=>$data['email'],'password'=>$data['password']])->assertSessionHasNoErrors();$this->assertAuthenticatedAs($new,'customer');
    }
    public function test_UAT_007_customer_password_reset_backend(){
        Notification::fake();
        $this->post($this->url('customer','/forgot-password'),['email'=>$this->customer->email])->assertSessionHasNoErrors();
        Notification::assertSentTo($this->customer,\App\Notifications\CustomerResetPasswordNotification::class);
        $token=Password::broker('customers')->createToken($this->customer);
        $this->post($this->url('customer','/reset-password'),['token'=>$token,'email'=>$this->customer->email,'password'=>'qa-new-password-123','password_confirmation'=>'qa-new-password-123'])->assertSessionHasNoErrors();
        $this->post($this->url('customer','/login'),['email'=>$this->customer->email,'password'=>'qa-new-password-123'])->assertSessionHasNoErrors();$this->assertAuthenticatedAs($this->customer,'customer');
    }
    public function test_QC_032_claim_status_filters(){
        $claim=$this->claim();
        $service=app(PerkClaimService::class);
        $this->assertCount(1,$service->pageData($this->biz->id,['status'=>'available'])['perkClaims']->items());
        $this->assertCount(0,$service->pageData($this->biz->id,['status'=>'redeemed'])['perkClaims']->items());
        $service->redeem($claim,$this->biz->id,null,$this->staff->id,'QA');
        $this->assertCount(0,$service->pageData($this->biz->id,['status'=>'available'])['perkClaims']->items());
        $this->assertCount(1,$service->pageData($this->biz->id,['status'=>'redeemed'])['perkClaims']->items());
    }
}
