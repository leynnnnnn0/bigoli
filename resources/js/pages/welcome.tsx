import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import {useForm} from '@inertiajs/react';
import { Phone, Mail, Menu, Award, Gift, Tag, ChevronDown, QrCode, BarChart3, Palette, Wifi, WifiOff, Headphones, LogIn, Play, CheckCircle2, TrendingUp, Users, Sparkles, Globe, ShieldCheck } from 'lucide-react';
import { Facebook, Instagram } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import homeBackground from '../../images/homeBackground.png';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import APP from '../../images/app.png';
import LOGO from '../../images/mainLogo.png';
import { router } from '@inertiajs/react';
import BUSINESSPOV from "../../videos/business pov.mov";
import CUSTOMERPOV from "../../videos/customer pov.mov"; 
import CUSTOMERTHUMBNAIL from "../../images/customer thumbnail.png";
import BUSINESSTHUMBANAIL from "../../images/business thumbnail.png";
import { MessageSquare, X, Send } from 'lucide-react';
import { toast } from 'sonner';


export default function Welcome() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const [loginDialogOpen, setLoginDialogOpen] = useState(false);
    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const heroSection = document.querySelector('main');
            if (heroSection) {
                const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
                setIsScrolled(window.scrollY > heroBottom - 100);
            }

            const sections = ['benefits', 'features', 'how-it-works', 'pricing', 'faq'];
            const scrollPosition = window.scrollY + 150;

            for (const sectionId of sections) {
                const section = document.getElementById(sectionId);
                if (section) {
                    const sectionTop = section.offsetTop;
                    const sectionBottom = sectionTop + section.offsetHeight;
                    
                    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                        setActiveSection(sectionId);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (e, id) => {
        e.preventDefault();
        const element = document.querySelector(id);
        if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const handleLoginChoice = (type : string) => {
        let route = "/login";
        setLoginDialogOpen(false);
        if(type == "customer") {
            route = '/customer/login';
        }
        if(isDemo){
            router.get(route, {
            data: {
                is_demo: true
            }
        });
        }else{
            router.get(route);
        }
    };

    useEffect(() => {
        if(!loginDialogOpen){
            setIsDemo(false);
        }
    },[loginDialogOpen])

    const handleDemoClick = () => {
        setIsDemo(true);
        setLoginDialogOpen(true);
    }

    const [isOpen, setIsOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { data, setData, post, processing, reset, errors } = useForm({
    email: '',
    suggestion: ''
  });

  const handleSubmit = () => {
    if (!data.suggestion.trim()) return;
    
    post('/suggestions', {
      onSuccess: () => {
        setSubmitSuccess(true);

        toast.success("Thank you for your feedback!");
        
        // Reset form and close modal after 2 seconds
        setTimeout(() => {
          reset();
          setSubmitSuccess(false);
          setIsOpen(false);
        }, 3000);
      },
      onError: (errors) => {
        console.error('Submission error:', errors);
      }
    });
  };

    return (
        <>
            {/* SEO HEAD TAGS - THIS IS THE MOST IMPORTANT PART */}
            <Head>
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="96x96"
                    href="/favicon-96x96.png"
                />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/site.webmanifest" />

                <title>
                    StampBayan - Free Digital Loyalty Card System for Philippine
                    Businesses
                </title>
                <meta
                    name="title"
                    content="StampBayan - Free Digital Loyalty Card System"
                />
                <meta
                    name="description"
                    content="FREE digital loyalty card system for Philippine businesses. Replace punch cards with QR scanning. No fees, unlimited customers. Start in 5 minutes."
                />
                <meta
                    name="keywords"
                    content="free loyalty program Philippines, customer loyalty card, digital stamp card, Filipino business tools"
                />
                <link rel="canonical" href="https://www.stampbayan.com" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.stampbayan.com" />
                <meta
                    property="og:title"
                    content="StampBayan - Free Digital Loyalty Card System"
                />
                <meta
                    property="og:description"
                    content="StampBayan is a FREE digital loyalty card system for Philippine businesses. Replace paper punch cards with QR code scanning. Track customer analytics, boost repeat sales, and build lasting relationships. No setup fees, unlimited customers. Start in 5 minutes."
                />
                <meta
                    property="og:image"
                    content="https://www.stampbayan.com/images/og-image.jpg"
                />
                <meta property="og:site_name" content="StampBayan" />
                <meta property="og:locale" content="en_PH" />
                <meta name="robots" content="index, follow" />

                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'SoftwareApplication',
                        name: 'StampBayan',
                        applicationCategory: 'BusinessApplication',
                        offers: {
                            '@type': 'Offer',
                            price: '0',
                            priceCurrency: 'PHP',
                        },
                        description:
                            'Free digital loyalty card system for Philippine businesses. Create, manage and track customer loyalty programs with QR code scanning.',
                        operatingSystem: 'Web-based',
                        countryOfOrigin: 'PH',
                    })}
                </script>
            </Head>

            <div className="relative min-h-screen overflow-hidden bg-transparent">
                {/* Header */}
                <header
                    className={`fixed top-0 right-0 left-0 z-50 px-4 py-4 transition-all duration-300 sm:px-6 lg:px-8 lg:py-6 xl:px-12 ${
                        isScrolled ? 'bg-primary shadow-lg' : 'bg-transparent'
                    }`}
                >
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div className="flex flex-shrink-0 items-center gap-2">
                            <img
                                src={LOGO}
                                alt="StampBayan Logo"
                                className="h-8 w-24 sm:h-10 sm:w-32"
                            />
                        </div>

                        <nav
                            className={`hidden items-center gap-4 transition-all duration-300 lg:flex xl:gap-8 ${
                                isScrolled
                                    ? 'translate-y-0 opacity-100'
                                    : 'pointer-events-none -translate-y-4 opacity-0'
                            }`}
                        >
                            <a
                                href="#benefits"
                                onClick={(e) => scrollToSection(e, '#benefits')}
                                className={`relative px-4 py-2 text-sm font-medium transition-all xl:px-5 ${activeSection === 'benefits' ? 'text-white' : 'text-white/90 hover:text-white'}`}
                            >
                                BENEFITS
                                {activeSection === 'benefits' && (
                                    <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-white"></span>
                                )}
                            </a>
                            <a
                                href="#features"
                                onClick={(e) => scrollToSection(e, '#features')}
                                className={`relative px-4 py-2 text-sm font-medium transition-all xl:px-5 ${activeSection === 'features' ? 'text-white' : 'text-white/90 hover:text-white'}`}
                            >
                                FEATURES
                                {activeSection === 'features' && (
                                    <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-white"></span>
                                )}
                            </a>

                            <a
                                href="#how-it-works"
                                onClick={(e) =>
                                    scrollToSection(e, '#how-it-works')
                                }
                                className={`relative px-4 py-2 text-sm font-medium transition-all xl:px-5 ${activeSection === 'how-it-works' ? 'text-white' : 'text-white/90 hover:text-white'}`}
                            >
                                HOW IT WORKS
                                {activeSection === 'how-it-works' && (
                                    <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-white"></span>
                                )}
                            </a>
                            <a
                                href="#pricing"
                                onClick={(e) => scrollToSection(e, '#pricing')}
                                className={`relative px-4 py-2 text-sm font-medium transition-all xl:px-5 ${activeSection === 'pricing' ? 'text-white' : 'text-white/90 hover:text-white'}`}
                            >
                                PRICING
                                {activeSection === 'pricing' && (
                                    <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-white"></span>
                                )}
                            </a>
                            {/* PRICING LINK REMOVED */}
                            <a
                                href="#faq"
                                onClick={(e) => scrollToSection(e, '#faq')}
                                className={`relative px-4 py-2 text-sm font-medium transition-all xl:px-5 ${activeSection === 'faq' ? 'text-white' : 'text-white/90 hover:text-white'}`}
                            >
                                FAQ
                                {activeSection === 'faq' && (
                                    <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-white"></span>
                                )}
                            </a>
                        </nav>

                        <div className="flex items-center gap-3">
                            <Dialog
                                open={loginDialogOpen}
                                onOpenChange={setLoginDialogOpen}
                            >
                                <DialogTrigger asChild>
                                    <button className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-medium text-primary transition hover:bg-white/30 sm:px-8 sm:text-sm">
                                        Login
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="mb-2 text-center text-2xl font-bold">
                                            Welcome Back!
                                        </DialogTitle>
                                        <DialogDescription className="text-center">
                                            Choose your account type to continue
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <button
                                            onClick={() =>
                                                handleLoginChoice('business')
                                            }
                                            className="group relative rounded-xl border-2 border-gray-200 p-6 transition-all duration-300 hover:border-blue-500 hover:shadow-lg"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 transition-colors group-hover:bg-blue-500">
                                                    <svg
                                                        className="h-6 w-6 text-blue-600 transition-colors group-hover:text-white"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        Business Login
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        Access your business
                                                        dashboard
                                                    </p>
                                                </div>
                                                <ChevronDown className="h-5 w-5 -rotate-90 text-gray-400 transition-colors group-hover:text-blue-500" />
                                            </div>
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleLoginChoice('customer')
                                            }
                                            className="group relative rounded-xl border-2 border-gray-200 p-6 transition-all duration-300 hover:border-green-500 hover:shadow-lg"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 transition-colors group-hover:bg-green-500">
                                                    <svg
                                                        className="h-6 w-6 text-green-600 transition-colors group-hover:text-white"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        Customer Login
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        View your loyalty
                                                        rewards
                                                    </p>
                                                </div>
                                                <ChevronDown className="h-5 w-5 -rotate-90 text-gray-400 transition-colors group-hover:text-green-500" />
                                            </div>
                                        </button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </header>

                <main className="relative z-10 px-4 py-8 sm:px-4 sm:py-12 lg:py-16 xl:py-20">
                    {/* Background with gradient overlay */}
                    <div className="absolute inset-0 -z-10">
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{
                                backgroundImage: `url(${homeBackground})`,
                            }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/50 to-primary/70"></div>
                    </div>

                    <div className="mt-15 sm:mx-auto sm:max-w-7xl lg:mt-10">
                        <div className="sm:mx-auto sm:max-w-7xl">
                            <div className="mx-auto text-center leading-0 sm:max-w-5xl">
                                <h1 className="mb-2 px-4 text-2xl leading-tight font-bold text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                                    Stop Losing Customers to Competitors
                                </h1>

                                <p className="mx-auto mb-8 max-w-3xl px-4 text-xs text-white/80 sm:mb-12 sm:text-base lg:text-lg">
                                    Turn one-time buyers into loyal regulars
                                    with a digital loyalty program that actually
                                    works. No more lost punch cards. No more
                                    forgotten rewards.
                                </p>

                                {/* UPDATED: Free Forever Messages */}
                                <div className="mx-auto mb-8 flex flex-wrap justify-center gap-4 text-white/90 sm:mb-10 sm:gap-8">
                                    <p className="flex flex-col text-xs sm:text-base">
                                        <strong>✓ 100% Free</strong>
                                        <span className="text-[10px] sm:text-xs">
                                            Grow your business at zero cost
                                        </span>
                                    </p>
                                    <p className="flex flex-col text-xs sm:text-base">
                                        <strong>✓ Set up in 5 minutes</strong>
                                        <span className="text-[10px] sm:text-xs">
                                            Print QR code, start today
                                        </span>
                                    </p>
                                    <p className="flex flex-col text-xs sm:text-base">
                                        <strong>✓ Unlimited Access</strong>
                                        <span className="text-[10px] sm:text-xs">
                                            No subscription fees
                                        </span>
                                    </p>
                                </div>

                                <button
                                    onClick={() => setLoginDialogOpen(true)}
                                    className="cursor-pointer rounded-full bg-white px-5 py-2 text-xs font-semibold text-primary shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl sm:px-10 sm:py-4 sm:text-lg md:text-base lg:px-12"
                                >
                                    <div className="flex flex-col items-center justify-between">
                                        Create Free Account
                                        <span className="text-[8px] sm:text-xs">
                                            No Credit Card Required
                                        </span>
                                    </div>
                                </button>

                                <div className="mt-6 text-xs text-white sm:text-sm">
                                    ✓ No hidden fees • ✓ No setup fees • ✓ 24/7
                                    support
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Stats Section */}
                <section
                    id="benefits"
                    className="relative z-10 bg-white px-4 py-8 sm:px-6 sm:py-12 lg:py-16"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-12 text-center sm:mb-16">
                            <h2 className="mb-4 text-lg font-bold sm:mb-6 sm:text-4xl lg:text-3xl">
                                Why Loyalty Programs Work
                            </h2>
                            <p className="mx-auto -mt-2 max-w-3xl px-4 text-xs text-black/80 sm:text-lg lg:text-lg">
                                The numbers speak for themselves
                            </p>
                        </div>
                        <div className="-mt-5 grid gap-6 md:grid-cols-3 lg:gap-8">
                            <div className="rounded-2xl border border-primary bg-white/10 p-6 shadow-2xl">
                                <div className="mb-4 flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-400/20">
                                        <TrendingUp className="h-6 w-6 text-green-400" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-black">
                                            67%
                                        </div>
                                        <div className="text-sm text-black/70">
                                            More spending from loyal customers
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-black/60">
                                    <a
                                        href="https://emarsys.com/learn/blog/increase-customer-loyalty-retention/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold text-green-600 underline decoration-green-400 hover:text-green-700"
                                    >
                                        Studies
                                    </a>{' '}
                                    show loyal customers spend significantly
                                    more than new ones
                                </p>
                            </div>

                            <div className="rounded-2xl border border-primary bg-white/10 p-6 shadow-2xl">
                                <div className="mb-4 flex items-center gap-4">
                                    <div className="bg-white-400/20 flex h-12 w-12 items-center justify-center rounded-xl">
                                        <Users className="text-white-400 h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-black">
                                            5x
                                        </div>
                                        <div className="text-sm text-black/70">
                                            More likely to return
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-black/60">
                                    Customers with{' '}
                                    <a
                                        href="https://www.businessdasher.com/customer-loyalty-statistics/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-black-600 decoration-black-400 font-semibold underline hover:text-blue-700"
                                    >
                                        loyalty cards
                                    </a>{' '}
                                    visit 5 times more often
                                </p>
                            </div>

                            <div className="rounded-2xl border border-primary bg-white/10 p-6 shadow-2xl">
                                <div className="mb-4 flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400/20">
                                        <BarChart3 className="h-6 w-6 text-yellow-400" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-black">
                                            25-95%
                                        </div>
                                        <div className="text-sm text-black/70">
                                            Profit increase potential
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-black/60">
                                    Just{' '}
                                    <a
                                        href="https://www.bain.com/insights/retaining-customers-is-the-real-challenge/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold text-yellow-600 underline decoration-yellow-400 hover:text-yellow-700"
                                    >
                                        5% increase in retention
                                    </a>{' '}
                                    can boost profits dramatically
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Video Demo Section */}
                <section className="relative z-10 bg-gradient-to-b from-[#f8f9fa] to-white px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-black sm:text-4xl lg:text-5xl">
                                See It In Action (No Need To Download)
                            </h2>
                            <p className="mx-auto max-w-2xl text-base text-black/90 sm:text-lg">
                                Watch how easy it is for both businesses and
                                customers
                            </p>
                        </div>
                        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:gap-8">
                            <div className="group">
                                <div className="rounded-2xl bg-white p-4 shadow-xl transition-all duration-300 hover:shadow-2xl">
                                    <div
                                        className="relative mx-auto mb-4 overflow-hidden rounded-xl bg-white"
                                        style={{ maxWidth: '400px' }}
                                    >
                                        <div
                                            className="relative w-full"
                                            style={{ paddingBottom: '177.78%' }}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-center">
                                                    <Play className="mx-auto mb-3 h-16 w-16 text-white/80" />
                                                    <p className="text-sm text-white/60">
                                                        Business Demo Video
                                                    </p>
                                                </div>
                                            </div>
                                            <video
                                                className="absolute inset-0 h-full w-full object-contain"
                                                controls
                                                poster={BUSINESSTHUMBANAIL}
                                            >
                                                <source
                                                    src={BUSINESSPOV}
                                                    type="video/mp4"
                                                />
                                            </video>
                                        </div>
                                    </div>
                                    <h3 className="mb-2 text-center text-xl font-bold text-gray-900">
                                        Business View
                                    </h3>
                                    <p className="text-center text-sm text-gray-600">
                                        See how simple it is to manage your
                                        loyalty program and track customer
                                        activity
                                    </p>
                                </div>
                            </div>

                            <div className="group">
                                <div className="rounded-2xl bg-white p-4 shadow-xl transition-all duration-300 hover:shadow-2xl">
                                    <div
                                        className="relative mx-auto mb-4 overflow-hidden rounded-xl bg-white"
                                        style={{ maxWidth: '400px' }}
                                    >
                                        <div
                                            className="relative w-full"
                                            style={{ paddingBottom: '177.78%' }}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-center">
                                                    <Play className="mx-auto mb-3 h-16 w-16 text-white/80" />
                                                    <p className="text-sm text-white/60">
                                                        Customer Demo Video
                                                    </p>
                                                </div>
                                            </div>
                                            <video
                                                className="absolute inset-0 h-full w-full object-contain"
                                                controls
                                                poster={CUSTOMERTHUMBNAIL}
                                            >
                                                <source
                                                    src={CUSTOMERPOV}
                                                    type="video/mp4"
                                                />
                                            </video>
                                        </div>
                                    </div>
                                    <h3 className="mb-2 text-center text-xl font-bold text-gray-900">
                                        Customer Experience
                                    </h3>
                                    <p className="text-center text-sm text-gray-600">
                                        Watch how customers scan, collect
                                        stamps, and redeem rewards in seconds
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section
                    id="features"
                    className="relative z-10 px-4 py-16 sm:px-6 sm:py-20 lg:py-28"
                    style={{ backgroundColor: '#f8f9fa' }}
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-12 text-center sm:mb-16 lg:mb-20">
                            <h2
                                className="mb-4 text-3xl font-bold sm:mb-6 sm:text-4xl lg:text-5xl"
                                style={{ color: '#333333' }}
                            >
                                Powerful Features for Your Business
                            </h2>
                            <p className="mx-auto max-w-3xl px-4 text-base text-gray-600 sm:text-lg lg:text-xl">
                                Everything you need to run a successful loyalty
                                program
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                            <article className="group rounded-3xl border-2 border-gray-100 bg-white p-6 transition-all duration-300 hover:border-primary hover:shadow-xl lg:p-8">
                                <div
                                    className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 lg:h-16 lg:w-16"
                                    style={{ backgroundColor: '#F4B942' }}
                                >
                                    <BarChart3 className="h-7 w-7 text-white lg:h-8 lg:w-8" />
                                </div>
                                <h3
                                    className="mb-3 text-xl font-bold lg:text-2xl"
                                    style={{ color: '#333333' }}
                                >
                                    Customer Analytics
                                </h3>
                                <p className="text-sm text-gray-600 lg:text-base">
                                    Track customer traffic by day, visit
                                    frequency, and new customer counts to make
                                    data-driven decisions and plan better.
                                </p>
                            </article>

                            <article className="group rounded-3xl border-2 border-gray-100 bg-white p-6 transition-all duration-300 hover:border-primary hover:shadow-xl lg:p-8">
                                <div
                                    className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 lg:h-16 lg:w-16"
                                    style={{ backgroundColor: '#F4B942' }}
                                >
                                    <Palette className="h-7 w-7 text-white lg:h-8 lg:w-8" />
                                </div>
                                <h3
                                    className="mb-3 text-xl font-bold lg:text-2xl"
                                    style={{ color: '#333333' }}
                                >
                                    Customizable Cards
                                </h3>
                                <p className="text-sm text-gray-600 lg:text-base">
                                    Design loyalty cards that match your brand
                                    with custom colors, logos, and reward
                                    structures.
                                </p>
                            </article>

                            <article className="group rounded-3xl border-2 border-gray-100 bg-white p-6 transition-all duration-300 hover:border-primary hover:shadow-xl lg:p-8">
                                <div
                                    className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 lg:h-16 lg:w-16"
                                    style={{ backgroundColor: '#F4B942' }}
                                >
                                    <QrCode className="h-7 w-7 text-white lg:h-8 lg:w-8" />
                                </div>
                                <h3
                                    className="mb-3 text-xl font-bold lg:text-2xl"
                                    style={{ color: '#333333' }}
                                >
                                    Custom QR Codes
                                </h3>
                                <p className="text-sm text-gray-600 lg:text-base">
                                    Generate unique QR codes for your business
                                    to display at your location for easy
                                    customer scanning.
                                </p>
                            </article>

                            <article className="group rounded-3xl border-2 border-gray-100 bg-white p-6 transition-all duration-300 hover:border-primary hover:shadow-xl lg:p-8">
                                <div
                                    className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 lg:h-16 lg:w-16"
                                    style={{ backgroundColor: '#F4B942' }}
                                >
                                    <Wifi className="h-7 w-7 text-white lg:h-8 lg:w-8" />
                                </div>
                                <h3
                                    className="mb-3 text-xl font-bold lg:text-2xl"
                                    style={{ color: '#333333' }}
                                >
                                    Scan to Stamp
                                </h3>
                                <p className="text-sm text-gray-600 lg:text-base">
                                    Customers can instantly earn stamps by
                                    scanning your QR code with their smartphone.
                                </p>
                            </article>

                            <article className="group rounded-3xl border-2 border-gray-100 bg-white p-6 transition-all duration-300 hover:border-primary hover:shadow-xl lg:p-8">
                                <div
                                    className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 lg:h-16 lg:w-16"
                                    style={{ backgroundColor: '#F4B942' }}
                                >
                                    <WifiOff className="h-7 w-7 text-white lg:h-8 lg:w-8" />
                                </div>
                                <h3
                                    className="mb-3 text-xl font-bold lg:text-2xl"
                                    style={{ color: '#333333' }}
                                >
                                    Offline Stamp Codes
                                </h3>
                                <p className="text-sm text-gray-600 lg:text-base">
                                    Award stamps even without internet
                                    connection using unique offline codes.
                                </p>
                            </article>

                            <article className="group rounded-3xl border-2 border-gray-100 bg-white p-6 transition-all duration-300 hover:border-primary hover:shadow-xl lg:p-8">
                                <div
                                    className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 lg:h-16 lg:w-16"
                                    style={{ backgroundColor: '#F4B942' }}
                                >
                                    <Headphones className="h-7 w-7 text-white lg:h-8 lg:w-8" />
                                </div>
                                <h3
                                    className="mb-3 text-xl font-bold lg:text-2xl"
                                    style={{ color: '#333333' }}
                                >
                                    24/7 Customer Support
                                </h3>
                                <p className="text-sm text-gray-600 lg:text-base">
                                    Get help anytime with our ticket-based
                                    support system. We're always here to assist
                                    you.
                                </p>
                            </article>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section
                    id="how-it-works"
                    className="relative z-10 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:py-28"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-12 text-center sm:mb-16 lg:mb-20">
                            <h2
                                className="mb-4 text-3xl font-bold sm:mb-6 sm:text-4xl lg:text-5xl"
                                style={{ color: '#333333' }}
                            >
                                How It Works
                            </h2>
                            <p className="mx-auto max-w-3xl px-4 text-base text-gray-600 sm:text-lg lg:text-xl">
                                Get started in minutes with our simple
                                three-step process
                            </p>
                        </div>

                        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                            {/* Left Side - Image */}
                            <img
                                src={APP}
                                alt="application user interface"
                                className="w-full rounded-2xl"
                            />

                            {/* Right Side - Steps */}
                            <div className="order-1 space-y-1 lg:order-2 lg:space-y-3">
                                {/* Step 1 */}
                                <div className="group flex gap-4 sm:gap-3">
                                    <div className="flex-shrink-0">
                                        <div
                                            className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold transition-all duration-300 group-hover:scale-110 sm:h-16 sm:w-16 sm:text-2xl"
                                            style={{
                                                backgroundColor: '#F4B942',
                                                color: '#ffffff',
                                            }}
                                        >
                                            1
                                        </div>
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <h3
                                            className="mb-2 text-xl font-bold sm:mb-3 sm:text-2xl"
                                            style={{ color: '#333333' }}
                                        >
                                            Create Business Account
                                        </h3>
                                        <p className="text-sm leading-relaxed text-gray-600 sm:text-base lg:text-lg">
                                            Sign up in seconds and set up your
                                            business profile. Customize your
                                            loyalty program with your brand
                                            colors and rewards.
                                        </p>
                                    </div>
                                </div>

                                {/* Connector Line */}
                                <div className="ml-6 h-8 w-0.5 bg-gradient-to-b from-gray-300 to-transparent sm:ml-8"></div>

                                {/* Step 2 */}
                                <div className="group flex gap-4 sm:gap-6">
                                    <div className="flex-shrink-0">
                                        <div
                                            className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold transition-all duration-300 group-hover:scale-110 sm:h-16 sm:w-16 sm:text-2xl"
                                            style={{
                                                backgroundColor: '#F4B942',
                                                color: '#ffffff',
                                            }}
                                        >
                                            2
                                        </div>
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <h3
                                            className="mb-2 text-xl font-bold sm:mb-3 sm:text-2xl"
                                            style={{ color: '#333333' }}
                                        >
                                            Print Your QR Code
                                        </h3>
                                        <p className="text-sm leading-relaxed text-gray-600 sm:text-base lg:text-lg">
                                            Generate and print your unique QR
                                            code. Display it at your counter,
                                            entrance, or anywhere customers can
                                            easily scan it.
                                        </p>
                                    </div>
                                </div>

                                {/* Connector Line */}
                                <div className="ml-6 h-8 w-0.5 bg-gradient-to-b from-gray-300 to-transparent sm:ml-8"></div>

                                {/* Step 3 */}
                                <div className="group flex gap-4 sm:gap-6">
                                    <div className="flex-shrink-0">
                                        <div
                                            className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold transition-all duration-300 group-hover:scale-110 sm:h-16 sm:w-16 sm:text-2xl"
                                            style={{
                                                backgroundColor: '#F4B942',
                                                color: '#ffffff',
                                            }}
                                        >
                                            3
                                        </div>
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <h3
                                            className="mb-2 text-xl font-bold sm:mb-3 sm:text-2xl"
                                            style={{ color: '#333333' }}
                                        >
                                            Customers Scan & Join
                                        </h3>
                                        <p className="text-sm leading-relaxed text-gray-600 sm:text-base lg:text-lg">
                                            Customers scan the QR code,
                                            register, and instantly join your
                                            loyalty program. No paper cards, no
                                            hassle!
                                        </p>
                                    </div>
                                </div>

                                {/* CTA Button */}

                                <div className="mt-6 flex w-full cursor-pointer items-center justify-center rounded-full bg-primary py-3 text-base font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl sm:w-auto sm:py-4 sm:text-lg">
                                    <a
                                        href="/documentation"
                                        target="_blank"
                                        className=""
                                        style={{
                                            backgroundColor: '#F4B942',
                                            color: '#ffffff',
                                        }}
                                    >
                                        Full guide
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PRICING SECTION */}
                <section
                    id="pricing"
                    className="relative z-10 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:py-28"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-12 text-center sm:mb-16">
                            <h2 className="mb-4 text-3xl font-bold text-black sm:text-4xl lg:text-5xl">
                                Simple, Transparent Pricing
                            </h2>
                            <p className="mx-auto max-w-2xl text-base text-black/70 sm:text-lg">
                                Start now for free.
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-1 lg:mx-auto lg:max-w-5xl">
                            {/* Free Plan (Starter) */}
                            <div className="flex flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Starter
                                    </h3>
                                    <div className="mt-4 flex items-baseline">
                                        <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                                            ₱0
                                        </span>
                                        <span className="ml-1 text-xl font-semibold text-gray-500">
                                            /forever
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Perfect for small shops starting out.
                                    </p>
                                </div>
                                <ul className="mb-8 flex-1 space-y-4">
                                    <li className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        Unlimited customers
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        Unlimited stamps and rewards
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        Full access to Customer Analytics
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        Custom Card & QR Code Builder
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        Dedicated Support (Email/Chat)
                                    </li>
                                </ul>
                                <button
                                    onClick={() => setLoginDialogOpen(true)}
                                    className="w-full rounded-xl border-2 border-primary py-3 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                                >
                                    Get Started
                                </button>
                            </div>

                            {/* Pro Plan only */}
                            {/* <div className="relative flex flex-col rounded-3xl border-2 border-primary bg-white p-8 shadow-xl transition-all hover:scale-[1.02]">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-white">
                                    FOR GROWING BRANDS
                                </div>
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Pro
                                    </h3>
                                    <div className="mt-4 flex items-baseline">
                                        <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                                            ₱199
                                        </span>
                                        <span className="ml-1 text-xl font-semibold text-gray-500">
                                            /month
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Everything in Free, plus branding tools.
                                    </p>
                                </div>
                                <ul className="mb-8 flex-1 space-y-4">
                                    <li className="flex items-center gap-3 text-sm font-bold text-gray-900">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                        Custom landing page
                                    </li>
                                    <li className="flex items-center gap-3 text-sm font-bold text-gray-900">
                                        <Globe className="h-5 w-5 text-primary" />
                                        yourbusiness.stampbayan.com
                                    </li>
                                    <li className="flex items-center gap-3 text-sm font-bold text-gray-900">
                                        <Palette className="h-5 w-5 text-primary" />
                                        Show your logo
                                    </li>
                                    <li className="flex items-center gap-3 text-sm font-bold text-gray-900">
                                        <Headphones className="h-5 w-5 text-primary" />
                                        Priority support
                                    </li>
                                    <hr className="my-4 border-gray-100" />
                                    <li className="flex items-center gap-3 text-sm text-gray-500 italic">
                                        <CheckCircle2 className="h-4 w-4 text-gray-400" />
                                        Includes all Free features
                                    </li>
                                </ul>
                                <button
                                    onClick={() => setLoginDialogOpen(true)}
                                    className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                                >
                                    Learn more
                                </button>
                            </div> */}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section
                    id="faq"
                    className="relative z-10 bg-white px-4 py-4 sm:px-6 sm:py-12 lg:py-16"
                >
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-12 text-center sm:mb-16 lg:mb-20">
                            <h2
                                className="mb-4 text-3xl font-bold sm:mb-6 sm:text-4xl lg:text-5xl"
                                style={{ color: '#333333' }}
                            >
                                Frequently Asked Questions
                            </h2>
                            <p className="px-4 text-base text-gray-600 sm:text-lg lg:text-xl">
                                Everything you need to know about StampBayan
                            </p>
                        </div>

                        <Accordion
                            type="single"
                            collapsible
                            className="space-y-4"
                        >
                            <AccordionItem
                                value="item-1"
                                className="rounded-2xl border-2 border-gray-100 px-6 transition-colors hover:border-primary"
                            >
                                <AccordionTrigger
                                    className="py-6 text-left text-lg font-bold hover:no-underline sm:text-xl"
                                    style={{ color: '#333333' }}
                                >
                                    What is StampBayan?
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 text-base leading-relaxed text-gray-600 sm:text-lg">
                                    StampBayan is a modern Customer Loyalty Card
                                    system where businesses can reward their
                                    customers for coming back and build
                                    relationships with them to strengthen
                                    customer loyalty. Say goodbye to paper punch
                                    cards and hello to a digital solution that's
                                    easy for both you and your customers.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem
                                value="item-2"
                                className="rounded-2xl border-2 border-gray-100 px-6 transition-colors hover:border-primary"
                            >
                                <AccordionTrigger
                                    className="py-6 text-left text-lg font-bold hover:no-underline sm:text-xl"
                                    style={{ color: '#333333' }}
                                >
                                    What is your goal?
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 text-base leading-relaxed text-gray-600 sm:text-lg">
                                    Our goal is to introduce businesses to
                                    modern systems so they can see the benefits
                                    and advantages of using digital loyalty
                                    programs. We want to show businesses that
                                    having a system doesn't have to be expensive
                                    to maintain—it's actually a powerful tool to
                                    help you grow and thrive.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem
                                value="item-3"
                                className="rounded-2xl border-2 border-gray-100 px-6 transition-colors hover:border-primary"
                            >
                                <AccordionTrigger
                                    className="py-6 text-left text-lg font-bold hover:no-underline sm:text-xl"
                                    style={{ color: '#333333' }}
                                >
                                    How will this help my business?
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 text-base leading-relaxed text-gray-600 sm:text-lg">
                                    Building strong connections with your
                                    customers keeps them coming back. Research
                                    shows that increasing customer retention by
                                    just 5% can boost profits by 25-95%. Loyal
                                    customers spend 67% more than new customers
                                    and are five times more likely to make
                                    repeat purchases. With StampBayan, you
                                    create meaningful relationships that turn
                                    one-time visitors into lifelong patrons.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem
                                value="item-4"
                                className="rounded-2xl border-2 border-gray-100 px-6 transition-colors hover:border-primary"
                            >
                                <AccordionTrigger
                                    className="py-6 text-left text-lg font-bold hover:no-underline sm:text-xl"
                                    style={{ color: '#333333' }}
                                >
                                    What is Customer Analytics?
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 text-base leading-relaxed text-gray-600 sm:text-lg">
                                    Our Customer Analytics feature gives you
                                    valuable insights into your business
                                    performance. You'll see:
                                    <ul className="mt-3 ml-2 list-inside list-disc space-y-2">
                                        <li>
                                            Customer traffic by day - Know when
                                            your store is busiest
                                        </li>
                                        <li>
                                            Customer visit frequency -
                                            Understand how often customers
                                            return
                                        </li>
                                        <li>
                                            New customer count - Track your
                                            business growth
                                        </li>
                                        <li>
                                            Peak hours and trends - Plan
                                            staffing and inventory better
                                        </li>
                                    </ul>
                                    <span className="mt-3 block">
                                        All this data helps you make smarter
                                        business decisions and serve your
                                        customers better.
                                    </span>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem
                                value="item-6"
                                className="rounded-2xl border-2 border-gray-100 px-6 transition-colors hover:border-primary"
                            >
                                <AccordionTrigger
                                    className="py-6 text-left text-lg font-bold hover:no-underline sm:text-xl"
                                    style={{ color: '#333333' }}
                                >
                                    What makes StampBayan different from other
                                    loyalty systems?
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 text-base leading-relaxed text-gray-600 sm:text-lg">
                                    At StampBayan, we believe that even small
                                    businesses deserve access to powerful
                                    systems. We've designed our platform to be
                                    affordable because we know that useful tools
                                    don't have to be expensive. Our system
                                    focuses on delivering real benefits to your
                                    business while being incredibly easy to use.
                                    No complicated setup, no hidden costs—just a
                                    straightforward solution that helps you
                                    grow.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </section>

                {/* Footer - The approved dark footer */}
                <footer className="bg-primary px-4 py-12 sm:px-6">
                    <div className="mx-auto grid max-w-7xl gap-8 text-sm text-white/70 md:grid-cols-4">
                        <div className="md:col-span-1">
                            <img
                                src={LOGO}
                                alt="StampBayan Logo"
                                className="mb-4 h-8"
                            />
                            <p className="mb-4">
                                Digital Loyalty for Filipino Businesses.
                            </p>
                            <div className="flex gap-4">
                                <Facebook className="h-5 w-5 cursor-pointer transition hover:text-white" />
                                <Instagram className="h-5 w-5 cursor-pointer transition hover:text-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:col-span-3">
                            <div>
                                <h4 className="mb-3 font-bold text-white">
                                    Navigate
                                </h4>
                                <ul>
                                    <li>
                                        <a
                                            href="#benefits"
                                            onClick={(e) =>
                                                scrollToSection(e, '#benefits')
                                            }
                                            className="hover:text-white"
                                        >
                                            Benefits
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#features"
                                            onClick={(e) =>
                                                scrollToSection(e, '#features')
                                            }
                                            className="hover:text-white"
                                        >
                                            Features
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#pricing"
                                            onClick={(e) =>
                                                scrollToSection(e, '#pricing')
                                            }
                                            className="hover:text-white"
                                        >
                                            Pricing
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#faq"
                                            onClick={(e) =>
                                                scrollToSection(e, '#faq')
                                            }
                                            className="hover:text-white"
                                        >
                                            FAQ
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-3 font-bold text-white">
                                    Contact
                                </h4>
                                <p className="mb-2 flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-white/50" />{' '}
                                    stampbayan@gmail.com
                                </p>
                                <p className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-white/50" />{' '}
                                    +63 9266887267
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/50">
                        &copy; {new Date().getFullYear()} StampBayan. All rights
                        reserved.
                    </div>
                </footer>
            </div>

            {/* <button
        onClick={() => setIsOpen(true)}
        className="cursor-pointer fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 group animate-bounce"
        style={{
          animation: 'bounce 2s infinite'
        }}
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
      </button> */}

            {/* Suggestion Form Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-primary">
                            We'd Love Your Feedback! 💡
                        </DialogTitle>
                        <DialogDescription>
                            Help us improve StampBayan by sharing your
                            suggestions or ideas.
                        </DialogDescription>
                    </DialogHeader>

                    {submitSuccess ? (
                        <div className="py-8 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <Send className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-gray-900">
                                Thank You!
                            </h3>
                            <p className="text-gray-600">
                                Your suggestion has been received. We appreciate
                                your feedback!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 py-4">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Email (Optional)
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 transition outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
                                    placeholder="your@email.com"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="suggestion"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Your Suggestion{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="suggestion"
                                    name="suggestion"
                                    value={data.suggestion}
                                    onChange={(e) =>
                                        setData('suggestion', e.target.value)
                                    }
                                    rows={4}
                                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 transition outline-none focus:border-transparent focus:ring-2 focus:ring-primary"
                                    placeholder="Tell us what you think..."
                                />
                                {errors.suggestion && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.suggestion}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={processing || !data.suggestion.trim()}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-white transition-all duration-300 hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-gray-300"
                            >
                                {processing ? (
                                    <>
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-5 w-5" />
                                        Submit Suggestion
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
        </>
    );
}

