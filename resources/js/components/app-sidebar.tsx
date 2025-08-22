import { NavFooter } from '@/components/nav-footer';
import { NavMainCategorized } from '@/components/nav-main-categorized';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavCategory } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    Home,
    Building,
    Users,
    Wrench,
    DollarSign,
    FileText,
    ArrowRightLeft,
    UserCheck,
    AlertTriangle,
    Settings,
    CreditCard,
    ClipboardList
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavCategories: NavCategory[] = [
    {
        title: 'Overview',
        icon: Home,
        items: [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutGrid,
            },
        ],
    },
    {
        title: 'Property Management',
        icon: Building,
        items: [
            {
                title: 'properties Insurances',
                href: '/properties-info',
                icon: Building,
            },
            {
                title: 'Units',
                href: '/units',
                icon: LayoutGrid,
            },
        ],
    },
    {
        title: 'People',
        icon: Users,
        items: [
            {
                title: 'Tenants',
                href: '/tenants',
                icon: Users,
            },
            {
                title: 'Vendors',
                href: '/vendors',
                icon: Wrench,
            },
        ],
    },
    {
        title: 'Operations',
        icon: Settings,
        items: [
            {
                title: 'Move In',
                href: '/move-in',
                icon: ArrowRightLeft,
            },
            {
                title: 'Move Out',
                href: '/move-out',
                icon: ArrowRightLeft,
            },
            {
                title: 'Tasks',
                href: '/vendor-task-tracker',
                icon: ClipboardList,
            },
        ],
    },
    {
        title: 'Financial',
        icon: DollarSign,
        items: [
            {
                title: 'Payments',
                href: '/payments',
                icon: CreditCard,
            },
            {
                title: 'Payment Plan',
                href: '/payment-plans',
                icon: CreditCard,
            },
        ],
    },
    {
        title: 'Leasing',
        icon: FileText,
        items: [
            {
                title: 'Applications',
                href: '/applications',
                icon: FileText,
            },
            {
                title: 'Offers And Renewals',
                href: '/offers_and_renewals',
                icon: UserCheck,
            },
            {
                title: 'Notice And Evictions',
                href: '/notice_and_evictions',
                icon: AlertTriangle,
            },
        ],
    },
];

const footerNavItems: NavCategory['items'] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMainCategorized categories={mainNavCategories} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
