import type { BranchOption } from '@/types/stampbayan';

export type StampShapeType = 'circle' | 'star' | 'square' | 'hexagon';

export interface CardTemplatePerk {
    id?: number;
    stampNumber: number;
    reward: string;
    color: string;
    details?: string | null;
}

export interface CardTemplateFormData {
    logo: string | null;
    name: string;
    heading: string;
    valid_until: string;
    subheading: string;
    stampsNeeded: number;
    mechanics: string;
    backgroundColor: string;
    textColor: string;
    stampColor: string;
    stampFilledColor: string;
    stampEmptyColor: string;
    stampImage: string | null;
    backgroundImage: string | null;
    footer: string;
    stampShape: StampShapeType;
    perks: CardTemplatePerk[];
    branch_ids: number[];
}

export interface CardTemplateRecord
    extends Omit<CardTemplateFormData, 'branch_ids'> {
    id: number;
    logo: string | null;
    valid_until_formatted?: string;
    is_expired?: boolean;
    branches?: BranchOption[];
}

export type CardTemplateImageField =
    | 'logo'
    | 'stampImage'
    | 'backgroundImage';

export type CardTemplatePerkField = keyof Pick<
    CardTemplatePerk,
    'stampNumber' | 'reward' | 'color' | 'details'
>;

export const DEFAULT_CARD_TEMPLATE_FORM: CardTemplateFormData = {
    logo: null,
    name: '',
    heading: 'LOYALTY CARD',
    valid_until: '',
    subheading: 'Collect stamps and earn rewards!',
    stampsNeeded: 10,
    mechanics: 'Get 1 stamp per purchase. Collect stamps to unlock rewards!',
    backgroundColor: '#4DB6AC',
    textColor: '#FFFFFF',
    stampColor: '#4DB6AC',
    stampFilledColor: '#FF6B6B',
    stampEmptyColor: '#E5E7EB',
    stampImage: null,
    backgroundImage: null,
    footer: 'your social media • your website',
    stampShape: 'star',
    perks: [
        {
            stampNumber: 5,
            reward: '10% OFF',
            color: '#FF6B6B',
            details: 'Get 10% discount on your next purchase',
        },
        {
            stampNumber: 10,
            reward: 'FREE ITEM',
            color: '#3F51B5',
            details: 'Choose any item from our menu for free!',
        },
    ],
    branch_ids: [],
};

export function normalizeStampShape(
    shape: string | null | undefined,
): StampShapeType {
    return ['circle', 'star', 'square', 'hexagon'].includes(shape ?? '')
        ? (shape as StampShapeType)
        : 'star';
}

export function buildCardTemplateForm(
    cardTemplate?: Partial<CardTemplateRecord>,
): CardTemplateFormData {
    if (!cardTemplate) return DEFAULT_CARD_TEMPLATE_FORM;

    return {
        logo: cardTemplate.logo ? `/${cardTemplate.logo}` : null,
        name: cardTemplate.name || '',
        heading: cardTemplate.heading || DEFAULT_CARD_TEMPLATE_FORM.heading,
        valid_until: cardTemplate.valid_until || '',
        subheading:
            cardTemplate.subheading ||
            DEFAULT_CARD_TEMPLATE_FORM.subheading,
        stampsNeeded:
            cardTemplate.stampsNeeded ||
            DEFAULT_CARD_TEMPLATE_FORM.stampsNeeded,
        mechanics:
            cardTemplate.mechanics || DEFAULT_CARD_TEMPLATE_FORM.mechanics,
        backgroundColor:
            cardTemplate.backgroundColor ||
            DEFAULT_CARD_TEMPLATE_FORM.backgroundColor,
        textColor: cardTemplate.textColor || DEFAULT_CARD_TEMPLATE_FORM.textColor,
        stampColor:
            cardTemplate.stampColor || DEFAULT_CARD_TEMPLATE_FORM.stampColor,
        stampFilledColor:
            cardTemplate.stampFilledColor ||
            DEFAULT_CARD_TEMPLATE_FORM.stampFilledColor,
        stampEmptyColor:
            cardTemplate.stampEmptyColor ||
            DEFAULT_CARD_TEMPLATE_FORM.stampEmptyColor,
        stampImage: cardTemplate.stampImage
            ? `/${cardTemplate.stampImage}`
            : null,
        backgroundImage: cardTemplate.backgroundImage
            ? `/${cardTemplate.backgroundImage}`
            : null,
        footer: cardTemplate.footer || DEFAULT_CARD_TEMPLATE_FORM.footer,
        stampShape: normalizeStampShape(cardTemplate.stampShape),
        perks: cardTemplate.perks || [],
        branch_ids: cardTemplate.branches?.map((branch) => branch.id) ?? [],
    };
}
