import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
}

const DISMISSED_AT_KEY = 'bigoli-pwa-install-dismissed-at';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000;

export function PwaInstallPrompt() {
    const [installPrompt, setInstallPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        const isAndroid = /Android/i.test(navigator.userAgent);
        const isStandalone = window.matchMedia(
            '(display-mode: standalone)',
        ).matches;

        if (!isAndroid || isStandalone) {
            return;
        }

        const dismissedAt = Number(
            window.localStorage.getItem(DISMISSED_AT_KEY) ?? 0,
        );
        const recentlyDismissed = Date.now() - dismissedAt < DISMISS_DURATION;

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();

            if (!recentlyDismissed) {
                setInstallPrompt(event as BeforeInstallPromptEvent);
            }
        };
        const handleInstalled = () => setInstallPrompt(null);

        window.addEventListener(
            'beforeinstallprompt',
            handleBeforeInstallPrompt,
        );
        window.addEventListener('appinstalled', handleInstalled);

        return () => {
            window.removeEventListener(
                'beforeinstallprompt',
                handleBeforeInstallPrompt,
            );
            window.removeEventListener('appinstalled', handleInstalled);
        };
    }, []);

    const dismiss = () => {
        window.localStorage.setItem(DISMISSED_AT_KEY, Date.now().toString());
        setInstallPrompt(null);
    };

    const install = async () => {
        if (!installPrompt) {
            return;
        }

        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;

        if (choice.outcome === 'dismissed') {
            window.localStorage.setItem(
                DISMISSED_AT_KEY,
                Date.now().toString(),
            );
        }

        setInstallPrompt(null);
    };

    if (!installPrompt) {
        return null;
    }

    return (
        <aside
            role="dialog"
            aria-label="Install Bigoli app"
            className="fixed right-4 bottom-4 left-4 z-[100] mx-auto flex max-w-md items-center gap-3 rounded-xl border border-border bg-background p-4 text-foreground shadow-2xl sm:right-6 sm:bottom-6 sm:left-auto"
        >
            <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Download className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="font-semibold">Install Bigoli</p>
                <p className="text-sm text-muted-foreground">
                    Add your loyalty card to your home screen.
                </p>
            </div>
            <Button type="button" size="sm" onClick={install}>
                Install app
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={dismiss}
                aria-label="Dismiss install prompt"
                className="size-8 shrink-0"
            >
                <X className="size-4" />
            </Button>
        </aside>
    );
}
