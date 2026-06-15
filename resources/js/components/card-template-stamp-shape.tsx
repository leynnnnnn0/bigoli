import { cn } from '@/lib/utils';
import { normalizeStampShape } from '@/types/card-template';
import type { StampShapeType } from '@/types/card-template';
import { Sparkles } from 'lucide-react';

export interface CardTemplateStampShapeProps {
    shape: StampShapeType | string | null | undefined;
    isFilled: boolean;
    isReward: boolean;
    rewardText?: string | null;
    color: string;
    filledColor?: string | null;
    emptyColor?: string | null;
    stampImage?: string | null;
    details?: string | null;
    patternId?: string;
    className?: string;
    rewardTextClassName?: string;
    showSparkles?: boolean;
    strokeWidth?: string;
}

export function CardTemplateStampShape({
    shape,
    isFilled,
    isReward,
    rewardText,
    color,
    filledColor,
    emptyColor,
    stampImage,
    details,
    patternId = 'stampPattern',
    className,
    rewardTextClassName,
    showSparkles = true,
    strokeWidth = '3',
}: CardTemplateStampShapeProps) {
    const shapeKey = normalizeStampShape(shape);
    const fillColor = isFilled ? filledColor || color : emptyColor || '#E5E7EB';
    const strokeColor = isFilled ? '#FFFFFF' : '#D1D5DB';
    const fill = stampImage && isFilled ? `url(#${patternId})` : fillColor;
    const svgClassName = cn(
        'h-full w-full drop-shadow-lg transition-all duration-300 hover:scale-110',
        className,
    );

    const pattern = stampImage ? (
        <defs>
            <pattern id={patternId} x="0" y="0" width="1" height="1">
                <image
                    href={stampImage}
                    x="0"
                    y="0"
                    width="100"
                    height="100"
                    preserveAspectRatio="xMidYMid slice"
                />
            </pattern>
        </defs>
    ) : null;

    const shapes = {
        circle: (
            <svg width="70" height="70" viewBox="0 0 100 100" className={svgClassName}>
                {pattern}
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill={fill}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                />
            </svg>
        ),
        star: (
            <svg width="70" height="70" viewBox="0 0 100 100" className={svgClassName}>
                {pattern}
                <path
                    d="M50 5 L55 20 L70 15 L70 30 L85 35 L75 47 L85 59 L70 64 L70 79 L55 74 L50 89 L45 74 L30 79 L30 64 L15 59 L25 47 L15 35 L30 30 L30 15 L45 20 Z"
                    fill={fill}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                />
            </svg>
        ),
        square: (
            <svg width="70" height="70" viewBox="0 0 100 100" className={svgClassName}>
                {pattern}
                <rect
                    x="10"
                    y="10"
                    width="80"
                    height="80"
                    rx="12"
                    fill={fill}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                />
            </svg>
        ),
        hexagon: (
            <svg width="70" height="70" viewBox="0 0 100 100" className={svgClassName}>
                {pattern}
                <path
                    d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
                    fill={fill}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                />
            </svg>
        ),
    };

    return (
        <div className="group relative">
            {shapes[shapeKey]}
            {isReward && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span
                        className={cn(
                            'px-1 text-center text-[10px] leading-tight font-bold text-white drop-shadow-lg',
                            rewardTextClassName,
                        )}
                        style={{
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                        }}
                    >
                        {rewardText}
                    </span>
                </div>
            )}
            {isFilled && !isReward && !stampImage && showSparkles && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={20} className="animate-pulse text-white" />
                </div>
            )}
            {isReward && details && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <div className="max-w-[200px] rounded-lg bg-gray-900 px-3 py-2 text-center text-xs whitespace-nowrap text-white shadow-xl">
                        <div className="mb-1 font-bold">{rewardText}</div>
                        <div className="text-gray-300">{details}</div>
                        <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2">
                            <div className="border-4 border-transparent border-t-gray-900" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
