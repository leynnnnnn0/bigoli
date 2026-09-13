import { cn } from '@/lib/utils';
import { ImgHTMLAttributes, useState } from 'react';

interface ProgressiveImageProps
    extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'className'> {
    className?: string;
    imageClassName?: string;
}

export default function ProgressiveImage({
    className,
    imageClassName,
    alt,
    onLoad,
    onError,
    ...props
}: ProgressiveImageProps) {
    const [loaded, setLoaded] = useState(false);

    return (
        <span
            className={cn(
                'relative block overflow-hidden bg-[#eadfca]',
                className,
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    'absolute inset-0 bg-[linear-gradient(105deg,transparent_25%,rgba(255,255,255,0.65)_45%,transparent_65%)] bg-[length:200%_100%] motion-safe:animate-[shimmer_1.5s_ease-in-out_infinite]',
                    loaded && 'opacity-0',
                )}
            />
            <img
                {...props}
                alt={alt}
                className={cn(
                    'h-full w-full opacity-0 transition-opacity duration-500',
                    loaded && 'opacity-100',
                    imageClassName,
                )}
                onLoad={(event) => {
                    setLoaded(true);
                    onLoad?.(event);
                }}
                onError={(event) => {
                    setLoaded(true);
                    onError?.(event);
                }}
            />
        </span>
    );
}
