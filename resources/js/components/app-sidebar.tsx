import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { AwardIcon, Building, Code2Icon, IdCard, LayoutGrid, QrCodeIcon, StampIcon, StoreIcon, TicketIcon, Users2Icon } from 'lucide-react';
import LOGO from '../../images/mainLogo.png';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Staff Accounts',
        href: '/staffs',
        icon: StoreIcon,
    },
    {
        title: 'Issue Stamp',
        href: '/issue-stamp',
        icon: StampIcon,
    },
    {
        title: 'Perk Claims',
        href: '/perk-claims',
        icon: AwardIcon,
    },
    {
        title: 'Stamp Codes',
        href: '/stamp-codes',
        icon: Code2Icon,
    },
    {
        title: 'Loyalty Cards',
        href: '/card-templates',
        icon: IdCard,
    },
    {
        title: 'Customers',
        href: '/customers',
        icon: Users2Icon,
    },
    {
        title: 'QR Studio',
        href: '/qr-studio',
        icon: QrCodeIcon,
    },
    {
        title: 'Tickets',
        href: '/tickets',
        icon: TicketIcon,
    },
    {
        title: 'Branches',
        href: '/branches',
        icon: Building,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href='/dashboard' prefetch>
                                <img src={LOGO} alt="logo" className='w-full h-12' />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
