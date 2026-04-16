import ModuleHeading from '@/components/module-heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Download, RefreshCw, Save, Upload, X } from 'lucide-react';
import React, { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Branch {
    id: number;
    name: string;
}

interface QRCodeData {
    heading: string;
    subheading: string;
    backgroundColor: string;
    textColor: string;
    backgroundImage: File | null;
    logo: File | null;
    branch_id: number | null;
}

interface IndexProps {
    qrUrl: string;
    qrCode?: {
        heading: string;
        subheading: string;
        background_color: string;
        text_color: string;
        background_image: string | null;
        logo: string | null;
        branch_id: number | null;
    };
    branches?: Branch[];
    branch_id?: string;
    errors?: Record<string, string>;
}

export default function Index({
    qrUrl,
    qrCode,
    errors,
    branches = [],
    branch_id,
}: IndexProps) {
    const [logoPreview, setLogoPreview] = useState<string | null>(
        qrCode?.logo ? '/' + qrCode.logo : null,
    );
    const [backgroundPreview, setBackgroundPreview] = useState<string | null>(
        qrCode?.background_image ? '/' + qrCode.background_image : null,
    );
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const backgroundInputRef = useRef<HTMLInputElement>(null);

    const { post, data, setData, reset, processing } = useForm<QRCodeData>({
        heading: qrCode?.heading || 'Taylora',
        subheading:
            qrCode?.subheading ||
            'Join our loyalty program by scanning the QR code',
        backgroundColor: qrCode?.background_color || '#ffffff',
        textColor: qrCode?.text_color || '#000000',
        backgroundImage: null,
        logo: null,
        branch_id: qrCode?.branch_id ?? null,
    });

    const handleBranchChange = (value: string) => {
        const id = value === 'all' ? null : Number(value);
        setData('branch_id', id);

        // Update URL to reflect selected branch without reloading
        const params = id ? { branch_id: String(id) } : {};
        router.get('/business/qr-studio', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Logo file size must be less than 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => setLogoPreview(e.target?.result as string);
            reader.readAsDataURL(file);
            setData('logo', file);
        }
    };

    const handleBackgroundUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('Background image file size must be less than 10MB');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) =>
                setBackgroundPreview(e.target?.result as string);
            reader.readAsDataURL(file);
            setData('backgroundImage', file);
        }
    };

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        post('/business/qr-studio/update', {
            onSuccess: () =>
                toast.success('QR Code settings saved successfully!'),
            onError: () =>
                toast.error('An error occurred while trying to save.'),
        });
    };

    const handleDownload = () => {
        setIsDownloading(true);
        const url = data.branch_id
            ? `/business/qr-studio/download?branch_id=${data.branch_id}`
            : '/business/qr-studio/download';
        window.location.href = url;
        setTimeout(() => setIsDownloading(false), 2000);
    };

    const removeLogo = () => {
        setLogoPreview(null);
        setData('logo', null);
        if (logoInputRef.current) logoInputRef.current.value = '';
    };

    const removeBackground = () => {
        setBackgroundPreview(null);
        setData('backgroundImage', null);
        if (backgroundInputRef.current) backgroundInputRef.current.value = '';
    };

    const resetToDefault = () => {
        reset();
        setLogoPreview(null);
        setBackgroundPreview(null);
        if (logoInputRef.current) logoInputRef.current.value = '';
        if (backgroundInputRef.current) backgroundInputRef.current.value = '';
    };

    const previewStyle: React.CSSProperties = {
        backgroundColor: data.backgroundColor,
        color: data.textColor,
        ...(backgroundPreview && {
            backgroundImage: `url(${backgroundPreview})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }),
    };

    const selectedBranchLabel = branches.find(
        (b) => b.id === data.branch_id,
    )?.name;

    return (
        <AppLayout>
            <Head title="QR Studio" />
            <ModuleHeading
                title="QR Studio"
                description="Manage your business QR code settings."
            />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-8">
                    {/* Preview Panel */}
                    <div className="order-first lg:order-last">
                        <Card className="lg:sticky lg:top-8">
                            <CardHeader>
                                <CardTitle>Preview</CardTitle>
                                <CardDescription>
                                    This is how your QR code menu will look when
                                    printed
                                    {selectedBranchLabel && (
                                        <span className="ml-1 font-medium text-foreground">
                                            — {selectedBranchLabel}
                                        </span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div
                                    className="relative mx-auto aspect-[8.5/11] w-full max-w-sm overflow-hidden border-2 shadow-lg lg:max-w-md"
                                    style={previewStyle}
                                >
                                    {backgroundPreview && (
                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
                                    )}
                                    <div
                                        className="relative flex h-full flex-col items-center justify-center border-4 p-4 sm:border-8 sm:p-6 lg:p-8"
                                        style={{ borderColor: data.textColor }}
                                    >
                                        <h1
                                            className="mb-2 text-center font-serif text-xl italic lg:text-4xl"
                                            style={{ color: data.textColor }}
                                        >
                                            {data.heading}
                                        </h1>
                                        <p
                                            className="mb-4 px-2 text-center text-[10px] whitespace-pre-line sm:mb-6 md:text-xs lg:mb-8"
                                            style={{ color: data.textColor }}
                                        >
                                            {data.subheading}
                                        </p>
                                        <div className="mb-4 h-32 w-32 bg-white p-2 shadow-lg sm:mb-6 sm:h-40 sm:w-40 lg:mb-8 lg:h-48 lg:w-48">
                                            <div className="flex h-full w-full items-center justify-center bg-gray-300 text-center text-xs text-gray-600">
                                                QR Code will show here
                                            </div>
                                        </div>
                                        <div
                                            className="flex h-20 w-20 items-center justify-center p-2 sm:h-24 sm:w-24 sm:p-3 lg:h-32 lg:w-32 lg:p-4"
                                            style={{
                                                borderColor: data.textColor,
                                            }}
                                        >
                                            {logoPreview ? (
                                                <img
                                                    src={logoPreview}
                                                    alt="Logo"
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            ) : (
                                                <div
                                                    className="text-center text-xs font-bold sm:text-sm"
                                                    style={{
                                                        color: data.textColor,
                                                    }}
                                                >
                                                    <div>YOUR</div>
                                                    <div>LOGO</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleDownload}
                                    className="w-full"
                                    variant="outline"
                                    disabled={isDownloading}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    {isDownloading
                                        ? 'Generating PDF...'
                                        : 'Download QR Code PDF'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Customization Panel */}
                    <div className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Customize Your QR Code</CardTitle>
                                <CardDescription>
                                    Personalize your QR code menu to match your
                                    brand
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form onSubmit={handleSave}>
                                    {/* Branch Selector — only shown when branches exist */}
                                    {branches.length > 0 && (
                                        <div className="mb-6 space-y-2 border-b pb-6">
                                            <Label htmlFor="branch">
                                                Branch
                                            </Label>
                                            <Select
                                                value={
                                                    data.branch_id
                                                        ? String(data.branch_id)
                                                        : 'all'
                                                }
                                                onValueChange={
                                                    handleBranchChange
                                                }
                                            >
                                                <SelectTrigger
                                                    id="branch"
                                                    className="w-full"
                                                >
                                                    <SelectValue placeholder="Select a branch" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        All branches
                                                    </SelectItem>
                                                    {branches.map((branch) => (
                                                        <SelectItem
                                                            key={branch.id}
                                                            value={String(
                                                                branch.id,
                                                            )}
                                                        >
                                                            {branch.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">
                                                {data.branch_id
                                                    ? 'Customizing QR code for this specific branch.'
                                                    : 'Showing the default QR code for all branches.'}
                                            </p>
                                            {errors?.branch_id && (
                                                <p className="text-sm text-red-500">
                                                    {errors.branch_id}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Heading */}
                                    <div className="space-y-2">
                                        <Label htmlFor="heading">Heading</Label>
                                        <Input
                                            id="heading"
                                            value={data.heading}
                                            onChange={(e) =>
                                                setData(
                                                    'heading',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Menu"
                                            disabled={processing}
                                            className={
                                                errors?.heading
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {errors?.heading && (
                                            <p className="text-sm text-red-500">
                                                {errors.heading}
                                            </p>
                                        )}
                                    </div>

                                    {/* Subheading */}
                                    <div className="mt-4 space-y-2">
                                        <Label htmlFor="subheading">
                                            Subheading
                                        </Label>
                                        <Textarea
                                            id="subheading"
                                            value={data.subheading}
                                            onChange={(e) =>
                                                setData(
                                                    'subheading',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="For a contactless menu, scan the QR code"
                                            rows={3}
                                            disabled={processing}
                                            className={
                                                errors?.subheading
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {errors?.subheading && (
                                            <p className="text-sm text-red-500">
                                                {errors.subheading}
                                            </p>
                                        )}
                                    </div>

                                    {/* Background */}
                                    <div className="mt-4 space-y-4">
                                        <Label>Background</Label>
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="bg-color"
                                                className="text-sm text-gray-600"
                                            >
                                                Solid Color
                                            </Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="bg-color"
                                                    type="color"
                                                    value={data.backgroundColor}
                                                    onChange={(e) =>
                                                        setData(
                                                            'backgroundColor',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-10 w-20"
                                                    disabled={
                                                        !!backgroundPreview ||
                                                        processing
                                                    }
                                                />
                                                <Input
                                                    value={data.backgroundColor}
                                                    onChange={(e) =>
                                                        setData(
                                                            'backgroundColor',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="#ffffff"
                                                    className="flex-1"
                                                    disabled={
                                                        !!backgroundPreview ||
                                                        processing
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-600">
                                                Or Background Image
                                            </Label>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        backgroundInputRef.current?.click()
                                                    }
                                                    className="flex-1"
                                                    disabled={processing}
                                                >
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    {backgroundPreview
                                                        ? 'Change Background'
                                                        : 'Upload Background'}
                                                </Button>
                                                {backgroundPreview && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={
                                                            removeBackground
                                                        }
                                                        disabled={processing}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            <input
                                                ref={backgroundInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={
                                                    handleBackgroundUpload
                                                }
                                                className="hidden"
                                            />
                                            {errors?.background_image && (
                                                <p className="text-sm text-red-500">
                                                    {errors.background_image}
                                                </p>
                                            )}
                                            {backgroundPreview && (
                                                <div className="mt-2 rounded-lg border bg-gray-50 p-2">
                                                    <img
                                                        src={backgroundPreview}
                                                        alt="Background preview"
                                                        className="h-32 w-full rounded object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Text Color */}
                                    <div className="mt-4 space-y-2">
                                        <Label htmlFor="text-color">
                                            Text Color
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="text-color"
                                                type="color"
                                                value={data.textColor}
                                                onChange={(e) =>
                                                    setData(
                                                        'textColor',
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-10 w-20"
                                                disabled={processing}
                                            />
                                            <Input
                                                value={data.textColor}
                                                onChange={(e) =>
                                                    setData(
                                                        'textColor',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="#000000"
                                                className="flex-1"
                                                disabled={processing}
                                            />
                                        </div>
                                    </div>

                                    {/* Logo */}
                                    <div className="mt-4 space-y-2">
                                        <Label>Logo</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    logoInputRef.current?.click()
                                                }
                                                className="flex-1"
                                                disabled={processing}
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                {logoPreview
                                                    ? 'Change Logo'
                                                    : 'Upload Logo'}
                                            </Button>
                                            {logoPreview && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={removeLogo}
                                                    disabled={processing}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <input
                                            ref={logoInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                        />
                                        {errors?.logo && (
                                            <p className="text-sm text-red-500">
                                                {errors.logo}
                                            </p>
                                        )}
                                        {logoPreview && (
                                            <div className="mt-2 rounded-lg border bg-gray-50 p-4">
                                                <img
                                                    src={logoPreview}
                                                    alt="Logo preview"
                                                    className="mx-auto h-24 w-24 object-contain"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 pt-4 sm:flex-row">
                                        <Button
                                            type="submit"
                                            className="flex-1"
                                            disabled={processing}
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            {processing
                                                ? 'Saving...'
                                                : 'Save Settings'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={resetToDefault}
                                            disabled={processing}
                                            className="sm:w-auto"
                                        >
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Reset
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Printing Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-gray-600">
                                <p>
                                    • High-resolution PDF will be generated
                                    (8.5" x 11")
                                </p>
                                <p>
                                    • QR code will link to your business loyalty
                                    page
                                </p>
                                <p>
                                    • Print on standard 8.5" x 11" paper or
                                    cardstock
                                </p>
                                <p>
                                    • Test the QR code after printing to ensure
                                    it scans properly
                                </p>
                                <p>
                                    • Consider laminating for durability in
                                    high-traffic areas
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
