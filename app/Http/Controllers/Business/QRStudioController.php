<?php
namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Models\QrCode as ModelsQrCode;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;


class QRStudioController extends Controller
{
    public function index(Request $request)
    {
        $business = Auth::user()->business;
        $qrCode = $business->qr_code;

        $branches = \App\Models\Branch::where('business_id', $business->id)
            ->select('id', 'name')
            ->get();

        return Inertia::render('Business/QRStudio/Index', [
            'qrCode'    => $qrCode,
            'branches'  => $branches,
            'branch_id' => $request->input('branch_id'),
        ]);
    }

  public function download()
{
    $busines = Auth::user()->business;
    $qrCode = $busines->qr_code;;
    
    if(!$qrCode){
        $qrCode = ModelsQrCode::create([
            'business_id' => $busines->id,
            'heading' => 'Taylora',
            'subheading' => 'Join our loyalty program by scanning the QR code',
        ]);
    }

    $qrUrl = $busines->subdomain ? $busines->subdomain : 'https://stampbayan.com/customer/register?business=' . $busines->qr_token;
    $data = [
        'heading' => $qrCode->heading ?? 'Loyalty Program',
        'subheading' => $qrCode->subheading ?? 'Join our loyalty program by scanning the QR code',
        'backgroundColor' => $qrCode->background_color ?? '#FFFFFF',
        'textColor' => $qrCode->text_color ?? '#000000',
        'qrUrl' => $qrUrl,
        'logo' => $qrCode->logo ? public_path($qrCode->logo) : null,
        'backgroundImage' => $qrCode->background_image ? public_path($qrCode->background_image) : null,
    ];

    // Generate QR code and convert to base64
    if ($data['qrUrl']) {
        $qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=' . urlencode($data['qrUrl']);
        $qrImageData = file_get_contents($qrImageUrl);
        $data['qrCodeBase64'] = 'data:image/png;base64,' . base64_encode($qrImageData);
    }

    // Convert logo to base64
    if ($data['logo'] && file_exists($data['logo'])) {
        $data['logoBase64'] = 'data:image/' . pathinfo($data['logo'], PATHINFO_EXTENSION) . ';base64,' . base64_encode(file_get_contents($data['logo']));
    }
    
    // Convert background image to base64
    if ($data['backgroundImage'] && file_exists($data['backgroundImage'])) {
        $data['backgroundImageBase64'] = 'data:image/' . pathinfo($data['backgroundImage'], PATHINFO_EXTENSION) . ';base64,' . base64_encode(file_get_contents($data['backgroundImage']));
    }

    $pdf = Pdf::loadView('pdf.qr-code', $data);
    $pdf->setPaper('letter', 'portrait');
    
    return $pdf->download("qr-code.pdf");
}

    public function update(Request $request)
    {
        $business = Auth::user()->business;
        
        // Get existing QR code record
        $existingQrCode = ModelsQrCode::where('business_id', $business->id)->first();
        
        // Validation
        $validated = $request->validate([
            'heading'         => 'required|string|max:100',
            'subheading'      => 'required|string|max:500',
            'backgroundColor' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'textColor'       => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'logo'            => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'backgroundImage' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'branch_id'       => 'nullable|integer|exists:branches,id',
        ], [
            'heading.required' => 'Heading is required',
            'heading.max' => 'Heading must not exceed 100 characters',
            'subheading.required' => 'Subheading is required',
            'subheading.max' => 'Subheading must not exceed 500 characters',
            'backgroundColor.regex' => 'Background color must be a valid hex color',
            'textColor.regex' => 'Text color must be a valid hex color',
            'logo.image' => 'Logo must be an image file',
            'logo.max' => 'Logo file size must not exceed 5MB',
            'backgroundImage.image' => 'Background image must be an image file',
            'backgroundImage.max' => 'Background image file size must not exceed 10MB',
        ]);


        // Prepare data for updateOrCreate
        $data = [
            'heading'          => $validated['heading'],
            'subheading'       => $validated['subheading'],
            'background_color' => $validated['backgroundColor'],
            'text_color'       => $validated['textColor'],
            'branch_id'        => $validated['branch_id'] ?? null,
        ];

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($existingQrCode && $existingQrCode->logo) {
                $this->deleteImage($existingQrCode->logo);
            }
            
            $logoPath = $this->uploadImage($request->file('logo'), 'uploads/qr-codes/logos');
            if ($logoPath) {
                $data['logo'] = $logoPath;
            }
        } elseif ($request->input('logo') === null && $existingQrCode && $existingQrCode->logo) {
            // If logo is explicitly set to null (removed), delete the old logo
            $this->deleteImage($existingQrCode->logo);
            $data['logo'] = null;
        }

        // Handle background image upload
        if ($request->hasFile('backgroundImage')) {
            // Delete old background image if exists
            if ($existingQrCode && $existingQrCode->background_image) {
                $this->deleteImage($existingQrCode->background_image);
            }
            
            $backgroundPath = $this->uploadImage($request->file('backgroundImage'), 'uploads/qr-codes/backgrounds');
            if ($backgroundPath) {
                $data['background_image'] = $backgroundPath;
            }
        } elseif ($request->input('backgroundImage') === null && $existingQrCode && $existingQrCode->background_image) {
            // If background image is explicitly set to null (removed), delete the old image
            $this->deleteImage($existingQrCode->background_image);
            $data['background_image'] = null;
        }

        // Update or create QR code settings
         ModelsQrCode::updateOrCreate(
            ['business_id' => $business->id],
            $data
        );

        return redirect()->back()->with('success', 'QR Code settings saved successfully!');
    }


    /**
     * Upload image file to public folder
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @param string $folder
     * @return string|null
     */
    private function uploadImage($file, $folder)
    {
        try {
            $extension = $file->getClientOriginalExtension();
            
            // Validate image type
            if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                throw new \Exception('Invalid image type');
            }

            // Generate unique filename
            $filename = uniqid() . '_' . time() . '.' . $extension;

            // Create directory if it doesn't exist
            $directory = public_path($folder);
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }

            // Move the file
            $file->move($directory, $filename);

            // Return the relative path for database storage
            return $folder . '/' . $filename;
        } catch (\Exception $e) {
            Log::error('Image upload failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete image file from public folder
     *
     * @param string $filePath
     * @return bool
     */
    private function deleteImage($filePath)
    {
        try {
            if ($filePath) {
                $fullPath = public_path($filePath);
                if (file_exists($fullPath)) {
                    unlink($fullPath);
                    Log::info('Image deleted successfully: ' . $filePath);
                    return true;
                }
            }
            return false;
        } catch (\Exception $e) {
            Log::error('Image deletion failed: ' . $e->getMessage());
            return false;
        }
    }
}