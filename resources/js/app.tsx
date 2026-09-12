import '../css/app.css';

import { Toaster } from '@/components/ui/sonner';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PwaInstallPrompt } from './components/pwa-install-prompt';
import { PwaRefreshButton } from './components/pwa-refresh-button';
import { initializeTheme } from './hooks/use-appearance';

const appName = 'Stamp Bayan';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <Toaster position="top-right" />
                <App {...props} />
                <PwaInstallPrompt />
                <PwaRefreshButton />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        void navigator.serviceWorker.register('/sw.js').then((registration) => {
            void registration.update();
        });
    });
}
