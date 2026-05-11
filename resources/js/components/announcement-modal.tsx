import { Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// ============================================================
// CONFIG — change the key when you publish a new announcement
// so it shows again even to users who dismissed the last one.
// ============================================================
const ANNOUNCEMENT_KEY = 'stamp-bayan-announcement-april-2026';

interface Feature {
    icon: string;
    title: string;
    description: string;
}

const features: Feature[] = [
    {
        icon: '📱',
        title: 'New Customer UI',
        description: 'Redesigned interface for a smoother customer experience.',
    },
    {
        icon: '🔢',
        title: 'Multistamps in One StampCode',
        description: 'Give multiple stamps in a single scan — faster, easier.',
    },
    {
        icon: '🏢',
        title: 'Enterprise Plan',
        description:
            'Built for multi-branch businesses with advanced controls.',
    },
    {
        icon: '📶',
        title: 'Full Offline Support',
        description: 'The loyalty card app now works even without internet.',
    },
];

export default function AnnouncementModal() {
    const [visible, setVisible] = useState(false);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem(ANNOUNCEMENT_KEY);
        if (!dismissed) {
            // slight delay so dashboard renders first
            const t = setTimeout(() => setVisible(true), 600);
            return () => clearTimeout(t);
        }
    }, []);

    const dismiss = () => {
        setClosing(true);
        setTimeout(() => {
            localStorage.setItem(ANNOUNCEMENT_KEY, 'true');
            setVisible(false);
            setClosing(false);
        }, 300);
    };

    if (!visible) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={dismiss}
                className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
                    closing ? 'opacity-0' : 'opacity-100'
                }`}
            />

            {/* Modal */}
            <div
                className={`pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4`}
            >
                <div
                    className={`pointer-events-auto w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 ${closing ? 'translate-y-4 scale-95 opacity-0' : 'translate-y-0 scale-100 opacity-100'} `}
                    style={{ background: '#F5A623' }}
                >
                    {/* Header */}
                    <div className="relative px-6 pt-6 pb-4">
                        {/* Decorative stamp circles */}
                        <div
                            className="absolute top-0 right-0 h-32 w-32 rounded-full opacity-10"
                            style={{
                                background: '#000',
                                transform: 'translate(40%, -40%)',
                                border: '8px dashed #000',
                            }}
                        />
                        <div
                            className="absolute bottom-0 left-0 h-20 w-20 rounded-full opacity-10"
                            style={{
                                background: '#000',
                                transform: 'translate(-30%, 30%)',
                                border: '6px dashed #000',
                            }}
                        />

                        {/* Close button */}
                        <button
                            onClick={dismiss}
                            className="absolute top-4 right-4 rounded-full p-1.5 transition-colors hover:bg-black/10"
                            aria-label="Close announcement"
                        >
                            <X className="h-5 w-5 text-gray-800" />
                        </button>

                        {/* Brand */}
                        <div className="mb-3 flex items-center gap-2">
                            <span
                                className="text-2xl font-black tracking-tight uppercase"
                                style={{
                                    fontFamily: 'Georgia, serif',
                                    color: '#1a1a1a',
                                }}
                            >
                                STAMP{' '}
                                <span
                                    style={{
                                        background: '#1a1a1a',
                                        color: '#F5A623',
                                        padding: '0 6px',
                                        borderRadius: '4px',
                                    }}
                                >
                                    BAYAN
                                </span>
                            </span>
                        </div>

                        <p className="mb-1 text-sm font-medium text-gray-700">
                            Thank you for your continuous support!
                        </p>
                        <h2
                            className="text-2xl leading-tight font-black text-gray-900"
                            style={{ fontFamily: 'Georgia, serif' }}
                        >
                            New Amazing Features
                            <br />
                            Coming Soon! 🎉
                        </h2>
                    </div>

                    {/* Feature cards */}
                    <div className="px-6 pb-2">
                        <div className="grid grid-cols-2 gap-3">
                            {features.map((f) => (
                                <div
                                    key={f.title}
                                    className="flex flex-col gap-1 rounded-xl p-3"
                                    style={{
                                        background: 'rgba(255,255,255,0.85)',
                                    }}
                                >
                                    <span className="text-2xl">{f.icon}</span>
                                    <p className="text-xs leading-snug font-bold text-gray-900">
                                        {f.title}
                                    </p>
                                    <p className="text-xs leading-snug text-gray-600">
                                        {f.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-6 py-4">
                        <p className="flex items-center gap-1 text-xs font-medium text-gray-700">
                            <Sparkles className="h-3.5 w-3.5" />
                            Stay tuned for updates!
                        </p>
                        <button
                            onClick={dismiss}
                            className="rounded-xl bg-gray-900 px-5 py-2 text-sm font-bold text-amber-600 transition-all hover:bg-gray-800 active:scale-95"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
