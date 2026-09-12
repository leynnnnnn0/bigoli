import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

type NavigatorWithStandalone = Navigator & {
    standalone?: boolean;
};

function isStandalonePwa() {
    if (typeof window === 'undefined') {
        return false;
    }

    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as NavigatorWithStandalone).standalone === true
    );
}

export function PwaRefreshButton() {
    const [visible, setVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        setVisible(isStandalonePwa());
    }, []);

    const refreshApp = async () => {
        setRefreshing(true);

        if ('serviceWorker' in navigator) {
            const registration =
                await navigator.serviceWorker.getRegistration();

            if (registration) {
                await registration.update();

                if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
            }
        }

        window.location.reload();
    };

    if (!visible) {
        return null;
    }

    return (
        <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void refreshApp()}
            disabled={refreshing}
            className="fixed right-4 bottom-20 z-[90] h-10 rounded-full border border-border bg-background/95 px-3 text-foreground shadow-lg backdrop-blur sm:bottom-4"
            aria-label="Refresh app"
        >
            <RefreshCw
                className={cn('size-4', refreshing && 'animate-spin')}
                aria-hidden="true"
            />
            <span className="hidden sm:inline">
                {refreshing ? 'Refreshing' : 'Refresh'}
            </span>
        </Button>
    );
}
