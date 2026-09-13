import { Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ReactNode } from 'react';
import Logo from '../../images/mainLogo.png';

export type AuthVariant =
    | 'customer-login'
    | 'customer-register'
    | 'staff-login'
    | 'business-login';

interface BrandedAuthShellProps {
    children: ReactNode;
    title: string;
    description: ReactNode;
    variant: AuthVariant;
    businessLogo?: string;
    businessName?: string;
}

const variantContent: Record<
    AuthVariant,
    {
        eyebrow: string;
        label: string;
        title: string;
        benefits: string[];
        footer: string;
    }
> = {
    'customer-login': {
        eyebrow: 'Customer loyalty',
        label: 'Bigoli Rewards',
        title: 'Good food tastes even better with rewards.',
        benefits: [
            'Your stamps stay in one place',
            'See your progress anytime',
            'Unlock delicious rewards',
        ],
        footer: 'Everyday Italian. Everyday rewards.',
    },
    'customer-register': {
        eyebrow: 'Customer loyalty',
        label: 'Bigoli Rewards',
        title: 'Good food tastes even better with rewards.',
        benefits: [
            'Collect stamps digitally',
            'Track rewards in one place',
            'Never lose a loyalty card',
        ],
        footer: 'Everyday Italian. Everyday rewards.',
    },
    'staff-login': {
        eyebrow: 'Team access',
        label: 'Bigoli Staff',
        title: 'Serve customers faster, one stamp at a time.',
        benefits: [
            'Issue secure stamp codes',
            'Redeem customer rewards',
            'Review recent activity',
        ],
        footer: 'Built for smooth service, every shift.',
    },
    'business-login': {
        eyebrow: 'Business portal',
        label: 'Bigoli Business',
        title: 'Keep every branch and reward in sync.',
        benefits: [
            'Manage loyalty programs',
            'Monitor customer activity',
            'Support every branch',
        ],
        footer: 'A clearer view of your loyalty business.',
    },
};

export default function BrandedAuthShell({
    children,
    title,
    description,
    variant,
    businessLogo,
    businessName,
}: BrandedAuthShellProps) {
    const content = variantContent[variant];

    return (
        <main className="grid min-h-screen place-items-center bg-[#f7f3ea] px-4 py-6 text-[#173e31] sm:px-6 sm:py-10 lg:px-10">
            <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#173e31]/10 bg-white shadow-[0_28px_80px_rgba(23,62,49,0.12)] lg:min-h-[680px] lg:grid-cols-[0.82fr_1.18fr]">
                <aside className="relative hidden overflow-hidden bg-[#075238] p-10 text-[#fffaf0] lg:flex lg:flex-col lg:justify-between">
                    <div className="absolute -top-20 -right-24 h-64 w-64 rounded-full border-[44px] border-[#f0a928]/20" />
                    <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full border-[52px] border-[#e64a35]/18" />

                    <Link
                        href="/"
                        className="relative inline-flex w-fit items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
                    >
                        <ArrowLeft className="size-4" />
                        Back to home
                    </Link>

                    <div className="relative">
                        <p className="mb-5 text-xs font-semibold tracking-[0.22em] text-[#f2b642] uppercase">
                            {content.label}
                        </p>
                        <h2 className="max-w-xs text-4xl leading-[1.12] font-semibold tracking-[-0.035em]">
                            {content.title}
                        </h2>
                        <div className="mt-8 space-y-4">
                            {content.benefits.map((benefit) => (
                                <div
                                    key={benefit}
                                    className="flex items-center gap-3 text-sm text-white/80"
                                >
                                    <CheckCircle2 className="size-5 text-[#f2b642]" />
                                    {benefit}
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="relative text-xs text-white/50">
                        {content.footer}
                    </p>
                </aside>

                <section className="flex min-w-0 flex-col px-5 py-7 sm:px-10 sm:py-10 lg:justify-center lg:px-14 lg:py-12">
                    <Link
                        href="/"
                        aria-label="Return to the Bigoli home page"
                        className="mb-7 inline-flex w-fit rounded-md focus-visible:ring-2 focus-visible:ring-[#008c45] focus-visible:ring-offset-4 focus-visible:outline-none lg:mb-8"
                    >
                        <img
                            src={businessLogo || Logo}
                            alt={businessName || 'Bigoli'}
                            className="h-12 max-w-40 object-contain object-left sm:h-14"
                        />
                    </Link>

                    <div className="mb-8">
                        <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-[#008c45] uppercase">
                            {content.eyebrow}
                        </p>
                        <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#173e31] sm:text-4xl">
                            {title}
                        </h1>
                        <div className="mt-2.5 text-sm leading-6 text-[#64736d] sm:text-base">
                            {description}
                        </div>
                    </div>

                    {children}
                </section>
            </div>
        </main>
    );
}
