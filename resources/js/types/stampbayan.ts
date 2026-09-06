export interface BranchOption {
    id: number;
    name: string;
}

export interface LoyaltyCardOption {
    id: number;
    name: string;
    logo?: string | null;
}

export interface Perk {
    id: number;
    reward: string;
    details: string | null;
    stampNumber: number;
}

export interface PerkClaim {
    id: number;
    customer_id: number;
    loyalty_card_id: number;
    perk_id: number;
    stamps_at_claim: number;
    is_redeemed: boolean;
    redeemed_at: string | null;
    remarks: string | null;
    created_at: string;
    customer: {
        id: number;
        username: string;
        email: string;
    };
    perk: Perk;
    loyalty_card: {
        id: number;
        name: string;
        logo: string | null;
    };
    redeemed_by?: {
        id: number;
        username: string;
    };
    redeemed_by_staff?: {
        id: number;
        username: string;
    };
}

export interface StampCodeRecord {
    id: number;
    code: string;
    customer: {
        username: string;
        email: string;
    } | null;
    staff?: {
        username: string;
    } | null;
    user?: {
        username?: string;
        email: string;
    } | null;
    branch?: BranchOption | null;
    reference_number?: string | null;
    used_at: string | null;
    created_at: string;
    loyalty_card: {
        name: string;
    };
}
