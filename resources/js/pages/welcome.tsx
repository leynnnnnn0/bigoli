import { Head, router } from '@inertiajs/react';
import { Download, QrCode, Star, Utensils } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Reusing your existing image imports - ensure these paths match your new assets
import first from '../../../public/images/family1.jpg';
import third from '../../../public/images/family2.jpg';
import fourth from '../../../public/images/family3.jpg';
import fifth from '../../../public/images/family4.jpg';
import sixth from '../../../public/images/family5.jpg';
import seventh from '../../../public/images/family6.jpg';
import eight from '../../../public/images/family7.jpg';
import HeroPasta from '../../../public/images/mainLogo.png'; // Consider renaming/replacing with a pasta/pizza PNG
import MainLogo from '../../../public/images/mainLogo.png'; // Update to Bigoli Logo
import menu1 from '../../../public/images/menu1.jpg';
import menu2 from '../../../public/images/menu2.jpg';
import menu3 from '../../../public/images/menu3.jpg';
import menu4 from '../../../public/images/menu4.jpg';
import menu5 from '../../../public/images/menu5.jpg';

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';

export default function Welcome() {
    const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>(
        'other',
    );
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor;
        if (/iPad|iPhone|iPod/.test(userAgent)) {
            setPlatform('ios');
        } else if (/android/i.test(userAgent)) {
            setPlatform('android');
        } else {
            setPlatform('other');
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener(
            'beforeinstallprompt',
            handleBeforeInstallPrompt,
        );
        return () =>
            window.removeEventListener(
                'beforeinstallprompt',
                handleBeforeInstallPrompt,
            );
    }, []);

    const handleDownload = async () => {
        if (platform === 'ios') {
            toast.info(
                'To install: Tap the Share button, then "Add to Home Screen"',
                { duration: 6000 },
            );
        } else if (platform === 'android' && deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted')
                toast.success('Welcome to the Familia!');
            setDeferredPrompt(null);
        } else {
            toast.info(
                'Open this on your mobile browser to install the loyalty card.',
            );
        }
    };

    return (
        <>
            <Head>
                <title>
                    Restaurante Bigoli Loyalty - Authentic Italian Rewards
                </title>
                <meta
                    name="description"
                    content="Join the Restaurante Bigoli loyalty program. Earn stamps on every pasta and pizza order. Authentic Italian flavors, digital rewards."
                />
                {/* Keep your PWA links here */}
                <link rel="manifest" href="/site.webmanifest" />
            </Head>

            {/* Using --surface for the warm Italian feel */}
            <div className="min-h-screen bg-[var(--surface)] font-sans text-[var(--text)] selection:bg-[var(--primary)] selection:text-white">
                {/* Navigation */}
                <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--primary)]/10 bg-[var(--surface)]/90 p-6 backdrop-blur-md lg:px-20">
                    <img
                        src={MainLogo}
                        alt="Restaurante Bigoli"
                        className="h-12 w-auto"
                    />
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.get('/customer/login')}
                            className="cursor-pointer rounded-full border-2 border-[var(--primary)] px-6 py-2 text-xs font-bold tracking-widest text-[var(--primary)] uppercase transition-all hover:bg-[var(--primary)] hover:text-white"
                        >
                            Sign In
                        </button>
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-12 px-6 py-16 lg:flex-row lg:py-24">
                    <div className="flex-1 space-y-8 text-center lg:text-left">
                        <h1 className="font-serif text-6xl leading-tight tracking-tighter text-[var(--text)] md:text-8xl">
                            A Taste of <br />
                            <span className="text-[var(--secondary)] italic">
                                Loyalty.
                            </span>
                        </h1>
                        <p className="mx-auto max-w-md text-lg leading-relaxed text-gray-700 lg:mx-0">
                            Benvenuti! Turn your love for authentic Italian
                            cuisine into exclusive rewards. Collect stamps and
                            dine like royalty.
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                            <button
                                onClick={() => router.get('/customer/login')}
                                className="cursor-pointer rounded-full bg-[var(--primary)] px-12 py-4 font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-95"
                            >
                                Start Earning
                            </button>
                            <button
                                onClick={handleDownload}
                                className="flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-[var(--secondary)] px-12 py-4 font-bold text-[var(--secondary)] transition-all hover:bg-[var(--secondary)] hover:text-white active:scale-95"
                            >
                                <Download className="h-5 w-5" />
                                Get the App
                            </button>
                        </div>
                    </div>
                    <div className="relative flex flex-1 items-center justify-center">
                        <div className="absolute -z-10 h-[300px] w-[300px] rounded-full bg-[var(--secondary)]/10 md:h-[450px] md:w-[450px]" />
                        <img
                            src={HeroPasta}
                            alt="Authentic Italian Dish"
                            className="h-auto w-full max-w-[450px] object-contain drop-shadow-2xl"
                        />
                    </div>
                </main>

                {/* Menu Section */}
                <section className="px-6 py-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 font-serif text-5xl text-[var(--text)] md:text-6xl">
                                Our{' '}
                                <span className="text-[var(--primary)] italic">
                                    Specialità
                                </span>
                            </h2>
                            <p className="text-gray-600">
                                Earn rewards on these signature flavors
                            </p>
                        </div>

                        <Carousel
                            opts={{ align: 'start', loop: true }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-2 md:-ml-4">
                                {[menu1, menu2, menu3, menu4, menu5].map(
                                    (img, index) => (
                                        <CarouselItem
                                            key={index}
                                            className="pl-2 md:basis-1/2 lg:basis-1/3"
                                        >
                                            <div className="group relative overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
                                                <div className="aspect-[4/5] overflow-hidden">
                                                    <img
                                                        src={img}
                                                        alt="Menu Item"
                                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                </div>
                                            </div>
                                        </CarouselItem>
                                    ),
                                )}
                            </CarouselContent>
                            <CarouselPrevious className="border-[var(--primary)] text-[var(--primary)]" />
                            <CarouselNext className="border-[var(--primary)] text-[var(--primary)]" />
                        </Carousel>
                    </div>
                </section>

                {/* How It Works */}
                <section className="bg-[var(--primary)]/5 px-6 py-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-16 text-center">
                            <h2 className="font-serif text-5xl text-[var(--text)] md:text-6xl">
                                Come Funziona
                            </h2>
                        </div>
                        <div className="grid gap-8 md:grid-cols-3">
                            {[
                                {
                                    icon: <QrCode />,
                                    title: 'Visit Us',
                                    desc: 'Dine at any Bigoli branch and scan our QR Code at the counter.',
                                },
                                {
                                    icon: <Utensils />,
                                    title: 'Earn Stamps',
                                    desc: 'Get a digital stamp for every qualifying meal you enjoy.',
                                },
                                {
                                    icon: <Star />,
                                    title: 'Enjoy Rewards',
                                    desc: 'Redeem your stamps for free pastas, pizzas, and exclusive treats.',
                                },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="group flex flex-col items-center rounded-3xl border border-[var(--primary)]/10 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-2"
                                >
                                    <div className="mb-6 rounded-full bg-[var(--surface)] p-4 text-[var(--secondary)]">
                                        {item.icon}
                                    </div>
                                    <h3 className="mb-3 text-xl font-bold tracking-tighter uppercase">
                                        {item.title}
                                    </h3>
                                    <p className="leading-relaxed text-gray-600">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Gallery */}
                <section className="px-6 py-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-12 flex items-center justify-between border-b-2 border-[var(--secondary)] pb-4">
                            <h2 className="font-serif text-4xl text-[var(--text)] italic">
                                La Nostra Famiglia
                            </h2>
                            <span className="text-sm font-bold text-[var(--secondary)]">
                                @restaurantebigoli
                            </span>
                        </div>
                        <div className="grid auto-rows-[200px] grid-cols-2 gap-3 md:grid-cols-4">
                            <div className="overflow-hidden rounded-lg md:col-span-2 md:row-span-2">
                                <img
                                    src={first}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="overflow-hidden rounded-lg">
                                <img
                                    src={third}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="row-span-2 overflow-hidden rounded-lg">
                                <img
                                    src={fourth}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="overflow-hidden rounded-lg">
                                <img
                                    src={fifth}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="overflow-hidden rounded-lg">
                                <img
                                    src={sixth}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="overflow-hidden rounded-lg md:col-span-2">
                                <img
                                    src={seventh}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="overflow-hidden rounded-lg">
                                <img
                                    src={eight}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="bg-[var(--text)] py-12 text-center text-[var(--surface)]">
                    <p className="text-[10px] tracking-[0.4em] uppercase opacity-70">
                        © 2026 Restaurante Bigoli — Authentic Italian Cuisine
                    </p>
                </footer>
            </div>
        </>
    );
}
