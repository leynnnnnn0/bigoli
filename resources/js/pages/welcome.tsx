import { Head, Link, router } from '@inertiajs/react';
import { ArrowDown, ArrowUpRight, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Highlight from '../../images/highlight.jpg';
import Highlight1 from '../../images/highlight1.jpg';
import Highlight2 from '../../images/highlight2.jpg';
import Logo from '../../images/logo.png';
import LoyaltyMobile from '../../images/loyaltymobile.png';
import Meats from '../../images/meats.jpg';
import Pasta from '../../images/pasta.jpg';

const scriptFont = {
    fontFamily:
        "'Tomato Pasta', 'Brush Script MT', 'Segoe Script', 'Bradley Hand', cursive",
};

const titleFont = {
    fontFamily: "'Tuscany Shade', Georgia, 'Times New Roman', serif",
};

const copyFont = {
    fontFamily: "'Montserrat', ui-sans-serif, system-ui, sans-serif",
};

const navItems = [
    { label: 'Home', href: '#intro' },
    { label: 'Loyalty Program', href: '#story' },
    { label: 'How It Works', href: '#details' },
];

export default function Welcome() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        );
        const previousScrollBehavior = root.style.scrollBehavior;
        const updateScrollBehavior = () => {
            root.style.scrollBehavior = reducedMotion.matches
                ? 'auto'
                : 'smooth';
        };

        updateScrollBehavior();
        reducedMotion.addEventListener('change', updateScrollBehavior);

        return () => {
            reducedMotion.removeEventListener('change', updateScrollBehavior);
            root.style.scrollBehavior = previousScrollBehavior;
        };
    }, []);

    return (
        <>
            <Head>
                <title>Bigoli | Everyday Italian</title>
                <meta
                    name="description"
                    content="Discover Bigoli favorites and join our loyalty program to earn stamps and unlock delicious rewards."
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="min-h-screen bg-[#fff7e8] text-[#164d38] selection:bg-[#e24a32] selection:text-[#fff8e9]"
                style={copyFont}
            >
                <div className="w-full overflow-hidden bg-[#fff7e8]">
                    <header className="relative z-30 flex h-24 items-center justify-between px-6 md:h-28 md:px-12 lg:px-16">
                        <nav className="hidden flex-1 items-center gap-10 lg:flex">
                            {navItems.slice(0, 2).map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className="text-sm italic decoration-[#e24a32] decoration-1 underline-offset-4 transition-colors hover:text-[#e24a32] hover:underline"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>

                        <a
                            href="#intro"
                            aria-label="Back to the top"
                            className="text-center text-4xl leading-none font-black tracking-[-0.08em] text-[#e24a32] lowercase sm:text-5xl"
                            style={scriptFont}
                        >
                            <img
                                src={Logo}
                                alt="Bigoli"
                                className="h-10 sm:h-20"
                            />
                        </a>

                        <nav className="hidden flex-1 items-center justify-end gap-10 lg:flex">
                            <a
                                href={navItems[2].href}
                                className="text-sm italic decoration-[#e24a32] decoration-1 underline-offset-4 transition-colors hover:text-[#e24a32] hover:underline"
                            >
                                {navItems[2].label}
                            </a>
                            <button
                                type="button"
                                onClick={() => router.get('/customer/login')}
                                className="cursor-pointer text-sm italic decoration-[#e24a32] decoration-1 underline-offset-4 transition-colors hover:text-[#e24a32] hover:underline"
                            >
                                Sign in
                            </button>
                        </nav>

                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen((open) => !open)}
                            className="absolute right-6 grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[#164d38]/25 lg:hidden"
                            aria-label={
                                mobileMenuOpen ? 'Close menu' : 'Open menu'
                            }
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? (
                                <X size={18} />
                            ) : (
                                <Menu size={18} />
                            )}
                        </button>

                        {mobileMenuOpen && (
                            <div className="absolute top-[78px] right-5 left-5 flex flex-col rounded-2xl border border-[#164d38]/15 bg-[#fff7e8] p-4 shadow-xl lg:hidden">
                                {navItems.map((item) => (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="rounded-lg px-4 py-3 text-sm italic hover:bg-[#164d38]/5"
                                    >
                                        {item.label}
                                    </a>
                                ))}
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.get('/customer/login')
                                    }
                                    className="cursor-pointer rounded-lg px-4 py-3 text-left text-sm italic hover:bg-[#164d38]/5"
                                >
                                    Sign in
                                </button>
                            </div>
                        )}
                    </header>

                    <main>
                        <section
                            id="intro"
                            className="relative flex min-h-[610px] flex-col items-center justify-center overflow-hidden px-6 pt-7 pb-32 sm:min-h-[680px] md:px-12 lg:min-h-[720px] lg:px-16 lg:pt-0"
                        >
                            <div className="relative flex w-full max-w-[760px] flex-col items-center lg:block lg:h-[445px]">
                                <h1
                                    className="relative z-20 max-w-[320px] text-center text-[clamp(3.35rem,8vw,6.6rem)] leading-[0.78] font-normal tracking-[-0.055em] text-[#e24a32] lg:absolute lg:top-12 lg:left-0 lg:max-w-[250px] lg:text-right"
                                    style={titleFont}
                                >
                                    <span className="block">Taste</span>
                                    <span className="block">your</span>
                                    <span className="block">favorites.</span>
                                </h1>

                                <div className="relative z-10 mt-10 h-[295px] w-[230px] sm:h-[345px] sm:w-[265px] lg:absolute lg:top-4 lg:left-1/2 lg:mt-0 lg:-translate-x-1/2">
                                    <div className="absolute top-4 -left-6 h-[285px] w-[205px] rotate-[-8deg] sm:h-[330px] sm:w-[235px]">
                                        <img
                                            src={Highlight1}
                                            alt="A freshly prepared Bigoli dish"
                                            className="h-full w-full rounded-[18px] border-[7px] border-[#fff7e8] shadow-md"
                                        />
                                    </div>
                                    <div className="absolute top-0 right-[-18px] h-[285px] w-[205px] rotate-[8deg] sm:h-[330px] sm:w-[235px]">
                                        <img
                                            src={Highlight2}
                                            alt="A selection of Bigoli favorites"
                                            className="h-full w-full rounded-[18px] border-[7px] border-[#fff7e8] shadow-md"
                                        />
                                    </div>
                                    <div className="absolute top-6 left-1/2 h-[285px] w-[205px] -translate-x-1/2 sm:h-[330px] sm:w-[235px]">
                                        <img
                                            src={Highlight}
                                            alt="A signature Bigoli meal"
                                            className="h-full w-full rounded-[18px] border-[7px] border-[#fff7e8] shadow-lg"
                                        />
                                    </div>
                                </div>

                                <p
                                    className="relative z-20 mt-8 max-w-[260px] text-center text-5xl leading-[0.84] text-[#e24a32] lg:absolute lg:top-44 lg:right-0 lg:mt-0 lg:max-w-[230px] lg:text-left lg:text-6xl"
                                    style={scriptFont}
                                >
                                    Absolutely Good
                                </p>
                            </div>

                            <a
                                href="#story"
                                className="group mt-12 inline-flex items-center gap-3 rounded-full border border-[#82a99f] px-6 py-3 text-[10px] font-bold tracking-[0.18em] text-[#4f7d72] uppercase transition-colors hover:bg-[#164d38] hover:text-[#fff7e8] lg:mt-0"
                            >
                                Join Bigoli Rewards
                                <ArrowDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-1" />
                            </a>

                            <div
                                aria-hidden="true"
                                className="absolute right-0 bottom-0 left-0 h-7 bg-[#064b32] bg-[radial-gradient(ellipse_50%_62%_at_50%_0,#fff7e8_98%,transparent_100%)] bg-[length:96px_28px] bg-repeat-x sm:bg-[length:112px_28px] lg:bg-[length:128px_28px]"
                            />
                        </section>

                        <section
                            id="story"
                            className="relative z-10 h-fit rounded-b-[32px] bg-[#064b32] px-6 py-24 text-[#fff7e8] md:rounded-b-[42px] md:px-12 md:py-28 lg:px-20 lg:py-32"
                        >
                            <div className="mx-auto grid max-w-[930px] items-center gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
                                <div className="relative mx-auto h-[590px] w-full max-w-[350px] sm:h-[670px]">
                                    <div className="absolute -top-5 -left-5 h-full w-full rounded-[24px] border border-[#fff7e8]/30" />
                                    <img
                                        src={LoyaltyMobile}
                                        alt="Bigoli loyalty rewards on a mobile phone"
                                        className="relative h-full w-full rounded-[24px] bg-[#b9b2a2] shadow-[0_22px_45px_rgba(0,0,0,0.22)]"
                                    />
                                    <span className="absolute -right-7 -bottom-7 grid h-20 w-20 rotate-6 place-items-center rounded-full bg-[#f2aa24] text-xs font-black tracking-widest text-[#064b32] uppercase shadow-lg">
                                        +1 Stamp
                                    </span>
                                </div>

                                <div className="text-center lg:text-left">
                                    <p className="mb-3 text-[10px] font-semibold tracking-[0.28em] text-[#f2aa24] uppercase">
                                        Good food. Great rewards.
                                    </p>
                                    <h2
                                        className="text-6xl leading-none font-normal sm:text-7xl"
                                        style={titleFont}
                                    >
                                        Loyalty Program
                                    </h2>
                                    <div className="mx-auto mt-8 max-w-[510px] space-y-5 text-sm leading-7 text-[#fff7e8]/82 lg:mx-0">
                                        <p>
                                            Every meal at Bigoli can bring you
                                            closer to something delicious. Join
                                            our loyalty program and collect
                                            stamps whenever you make an eligible
                                            purchase.
                                        </p>
                                        <p>
                                            Keep your digital loyalty card on
                                            your phone, track your progress, and
                                            unlock rewards as you enjoy more of
                                            your Bigoli favorites.
                                        </p>
                                    </div>
                                    <a
                                        href="#details"
                                        className="mt-9 inline-flex items-center gap-2 border-b border-[#f2aa24] pb-1 text-[11px] font-bold tracking-[0.16em] text-[#f2aa24] uppercase"
                                    >
                                        How it works <ArrowUpRight size={14} />
                                    </a>
                                </div>
                            </div>
                        </section>

                        <section
                            id="details"
                            className="relative overflow-hidden px-5 py-20 sm:px-8 sm:py-24 md:px-12 md:py-28 lg:px-20 lg:py-32"
                        >
                            <div className="mx-auto max-w-[930px]">
                                <div className="grid gap-10 sm:gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
                                    <div>
                                        <p className="mb-3 text-[10px] font-bold tracking-[0.25em] text-[#e24a32] uppercase">
                                            Loyalty Program
                                        </p>
                                        <h2
                                            className="text-6xl leading-none font-normal text-[#164d38] sm:text-7xl"
                                            style={titleFont}
                                        >
                                            <Link
                                                href="/customer/register"
                                                className="group inline-flex items-center gap-3 rounded-sm focus-visible:ring-2 focus-visible:ring-[#e24a32] focus-visible:ring-offset-4 focus-visible:outline-none"
                                            >
                                                Join Now
                                                <ArrowUpRight className="h-8 w-8 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 sm:h-9 sm:w-9" />
                                            </Link>
                                        </h2>
                                    </div>

                                    <dl className="divide-y divide-[#164d38]/25 border-y border-[#164d38]/25 text-xs uppercase">
                                        {[
                                            [
                                                'First Step',
                                                'Scan the Bigoli loyalty QR code at any branch.',
                                            ],
                                            [
                                                'Second Step',
                                                'Create your loyalty account.',
                                            ],
                                            [
                                                'Third Step',
                                                'Order your favorite meal.',
                                            ],
                                            [
                                                'Final Step',
                                                'Receive a stamp and work toward your next reward.',
                                            ],
                                        ].map(([term, detail]) => (
                                            <div
                                                key={term}
                                                className="grid gap-1.5 py-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-center sm:gap-8"
                                            >
                                                <dt className="text-[11px] font-medium tracking-[0.08em] text-[#164d38]/65">
                                                    {term}
                                                </dt>
                                                <dd className="text-left leading-5 font-semibold normal-case sm:text-right">
                                                    {detail}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>

                                <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-[0.8fr_1.2fr] lg:ml-[32%]">
                                    <img
                                        src={Meats}
                                        alt="Bigoli meat dishes served family-style"
                                        className="aspect-[4/3] w-full rounded-[14px] object-cover sm:aspect-auto sm:h-64 lg:h-56"
                                    />
                                    <img
                                        src={Pasta}
                                        alt="A freshly prepared Bigoli pasta dish"
                                        className="aspect-[4/3] w-full rounded-[14px] object-cover sm:aspect-auto sm:h-64 lg:h-56"
                                    />
                                </div>
                            </div>

                            <div
                                aria-hidden="true"
                                className="absolute bottom-12 left-10 hidden h-24 w-24 -rotate-12 rounded-[60%_15%_60%_15%] border-[5px] border-[#f2aa24] opacity-90 lg:block"
                            >
                                <div className="absolute inset-[13px] rounded-[60%_15%_60%_15%] border-[3px] border-[#f2aa24]" />
                                <div className="absolute top-1/2 left-1/2 h-[3px] w-[62px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#f2aa24]" />
                                <div className="absolute top-1/2 left-1/2 h-[3px] w-[62px] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[#f2aa24]" />
                            </div>
                        </section>
                    </main>

                    <footer className="flex flex-col items-center justify-between gap-4 border-t border-[#164d38]/15 px-6 py-7 text-[10px] font-semibold tracking-[0.16em] text-[#164d38]/60 uppercase sm:flex-row md:px-12 lg:px-20">
                        <p>© 2026 Bigoli. All rights reserved.</p>
                        <a href="#intro" className="hover:text-[#e24a32]">
                            Back to top ↑
                        </a>
                    </footer>
                </div>
            </div>
        </>
    );
}
