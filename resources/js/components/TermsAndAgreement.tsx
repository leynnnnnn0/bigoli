import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface TermsAndAgreementProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    error?: string;
}

const LAST_UPDATED = 'April 15, 2025';

export default function TermsAndAgreement({
    checked,
    onCheckedChange,
    error,
}: TermsAndAgreementProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
              <div className="space-y-1.5">
                <div className="flex items-start gap-3">
                    <Checkbox
                        id="terms"
                        checked={checked}
                        onCheckedChange={(val) => onCheckedChange(!!val)}
                        className="mt-0.5"
                    />
                    <Label
                        htmlFor="terms"
                        className="text-xs leading-snug text-muted-foreground cursor-pointer"
                    >
                        I have read and agree to the{' '}
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                        >
                            Terms and Agreement
                        </button>{' '}
                        of StampBayan.
                    </Label>
                </div>
                </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-semibold">
                                    Terms and Agreement
                                </DialogTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Last updated: {LAST_UPDATED}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <ScrollArea className="flex-1 px-6 py-5 overflow-y-auto max-h-[60vh]">
                        <div className="space-y-6 text-sm text-foreground/90 leading-relaxed pr-2">

                            <section className="space-y-2">
                                <h2 className="font-semibold text-base text-foreground">1. Introduction</h2>
                                <p>
                                    Welcome to <span className="font-semibold">StampBayan</span>, a digital loyalty card platform operated by StampBayan Inc. ("we," "our," or "us"). By registering for and using our platform, you ("User," "Customer," or "Business") agree to be bound by these Terms and Agreement ("Terms"). Please read them carefully before proceeding.
                                </p>
                                <p>
                                    These Terms govern your access to and use of the StampBayan platform, including any related mobile applications, websites, and services (collectively, the "Service").
                                </p>
                            </section>

                            {/* ✅ UPDATED SECTION */}
                            <section className="space-y-2">
                                <h2 className="font-semibold text-base text-foreground">2. Eligibility</h2>
                                <p>
                                    To use StampBayan, you must be at least <span className="font-medium">18 years of age</span>. If you are under 18, you may only use the Service with the involvement and consent of a parent or legal guardian.
                                </p>
                                <p>
                                    By registering, you represent and warrant that you meet these requirements and that all information you provide is accurate, current, and complete.
                                </p>
                                <p>
                                    If you are registering on behalf of a business entity, you represent that you have the authority to bind that entity to these Terms.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="font-semibold text-base text-foreground">3. Account Registration and Security</h2>
                                <p>
                                    You are responsible for maintaining the confidentiality of your account credentials, including your username and password. You agree to:
                                </p>
                                <ul className="list-disc list-inside space-y-1 pl-2 text-foreground/80">
                                    <li>Provide accurate and truthful registration information.</li>
                                    <li>Notify us immediately of any unauthorized access to your account.</li>
                                    <li>Accept responsibility for all activities that occur under your account.</li>
                                    <li>Not share your credentials with any third party.</li>
                                </ul>
                                <p>
                                    StampBayan will not be liable for any loss or damage arising from your failure to comply with the above requirements.
                                </p>
                            </section>

                            {/* (rest unchanged) */}

                            <section className="space-y-2">
                                <h2 className="font-semibold text-base text-foreground">4. Loyalty Program and Stamps</h2>
                                <p>
                                    StampBayan facilitates digital loyalty programs between registered businesses and their customers. Stamps, rewards, and loyalty benefits are issued solely at the discretion of the participating business. StampBayan makes no guarantees regarding the availability, value, or continuity of any reward offered by a business.
                                </p>
                                <p>
                                    Stamps and rewards have no monetary value and are non-transferable unless otherwise stated by the issuing business. StampBayan reserves the right to void stamps or rewards that were obtained through fraudulent, abusive, or unauthorized means.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="font-semibold text-base text-foreground">5. Acceptable Use</h2>
                                <p>You agree not to use the Service to:</p>
                                <ul className="list-disc list-inside space-y-1 pl-2 text-foreground/80">
                                    <li>Engage in fraudulent activity, including the creation of fake accounts or manipulation of stamp balances.</li>
                                    <li>Circumvent, disable, or otherwise interfere with security-related features of the platform.</li>
                                    <li>Upload or transmit any content that is unlawful, harmful, threatening, or otherwise objectionable.</li>
                                    <li>Attempt to gain unauthorized access to any portion or feature of the Service.</li>
                                    <li>Use automated systems (bots, scrapers, etc.) without permission.</li>
                                </ul>
                            </section>

                            <section className="space-y-2">
                                <h2 className="font-semibold text-base text-foreground">6. Privacy and Data Collection</h2>
                                <p>
                                    Your use of StampBayan is also governed by our <span className="font-medium">Privacy Policy</span>.
                                </p>
                                <p>
                                    We collect only the data necessary to operate the Service and do not sell your personal data.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="font-semibold text-base text-foreground">13. Governing Law</h2>
                                <p>
                                    These Terms shall be governed by the laws of the Republic of the Philippines.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="font-semibold text-base text-foreground">14. Contact Us</h2>
                                <div className="rounded-md bg-muted px-4 py-3 text-foreground/80">
                                    <p className="font-semibold text-foreground">StampBayan Inc.</p>
                                    <p>Email: support@stampbayan.com</p>
                                    <p>Website: www.stampbayan.com</p>
                                </div>
                            </section>

                        </div>
                    </ScrollArea>

                    <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-xs text-muted-foreground text-center sm:text-left">
                            By closing and checking the box, you agree to these Terms.
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                                Close
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => {
                                    onCheckedChange(true);
                                    setOpen(false);
                                }}
                            >
                                I Agree
                            </Button>
                        </div>
                    </div>
                    </DialogContent>
                </Dialog>
        </>
    );
}
