import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { ScanLine } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

type ScannerControls = { stop: () => void };

interface Props {
    endpoint: string;
    data: Record<string, string | undefined>;
    disabled?: boolean;
}

export function CustomerQrScanner({ endpoint, data, disabled = false }: Props) {
    const [open, setOpen] = useState(false);
    const [scanning, setScanning] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const controlsRef = useRef<ScannerControls | null>(null);
    const submittedRef = useRef(false);

    const stop = () => {
        controlsRef.current?.stop();
        controlsRef.current = null;
        const stream = videoRef.current?.srcObject as MediaStream | null;
        stream?.getTracks().forEach((track) => track.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
        setScanning(false);
        setOpen(false);
    };

    useEffect(() => stop, []);

    const scan = async () => {
        submittedRef.current = false;
        setOpen(true);
        setScanning(true);
        await new Promise((resolve) => setTimeout(resolve, 100));

        try {
            if (!videoRef.current) throw new Error('Video element not ready');
            const devices = await BrowserQRCodeReader.listVideoInputDevices();
            if (!devices.length) throw new Error('No camera devices found');
            const camera = devices.find((device) => /back|rear|environment/i.test(device.label)) ?? devices.at(-1);
            const controls = await new BrowserQRCodeReader().decodeFromVideoDevice(
                camera?.deviceId,
                videoRef.current,
                (result, _error, activeControls) => {
                    controlsRef.current = activeControls;
                    if (!result || submittedRef.current) return;
                    submittedRef.current = true;
                    activeControls.stop();
                    router.post(endpoint, { ...data, customer_qr: result.getText() }, {
                        preserveScroll: true,
                        onSuccess: () => toast.success('Stamp issued successfully.'),
                        onError: (errors) => {
                            toast.error(errors.customer_qr || errors.loyalty_card_id || errors.reference_number || 'Unable to issue a stamp.');
                            submittedRef.current = false;
                        },
                        onFinish: stop,
                    });
                },
            );
            controlsRef.current = controls;
        } catch (error) {
            const name = error instanceof Error ? error.name : '';
            toast.error(name === 'NotAllowedError' ? 'Camera permission denied.' : name === 'NotFoundError' ? 'No camera found.' : 'Unable to access the camera.');
            stop();
        }
    };

    return (
        <>
            <Button type="button" variant="outline" onClick={scan} disabled={disabled} className="w-full">
                <ScanLine className="mr-2 h-4 w-4" /> Scan customer loyalty QR
            </Button>
            <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && stop()}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Scan customer loyalty QR</DialogTitle>
                        <DialogDescription>Position the customer’s QR code inside the frame.</DialogDescription>
                    </DialogHeader>
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-black">
                        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                        {scanning && <div className="absolute inset-0 grid place-items-center"><div className="h-52 w-52 rounded-2xl border-4 border-dashed border-white/90" /></div>}
                    </div>
                    <div className="flex justify-end"><Button type="button" variant="outline" onClick={stop}>Cancel</Button></div>
                </DialogContent>
            </Dialog>
        </>
    );
}
