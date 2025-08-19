import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Units',
        href: '/units',
        icon: LayoutGrid,
    },
    {
        title: 'Tenants',
        href: '/tenants',
        icon: LayoutGrid,
    },
    {
        title: 'Vendors',
        href: '/vendors',
        icon: LayoutGrid,
    },
    {
        title: 'Properties',
        href: '/properties-info',
        icon: LayoutGrid,
    },
    {
        title: 'Payments',
        href: '/payments',
        icon: LayoutGrid,
    },
    {
        title: 'Vendor TaskTracker',
        href: '/vendor-task-tracker',
        icon: LayoutGrid,
    },
    {
        title: 'Move In',
        href: '/move-in',
        icon: LayoutGrid,
    },
    {
        title: 'Move Out',
        href: '/move-out',
        icon: LayoutGrid,
    },
    {
        title: 'Offers And Renewals',
        href: '/offers_and_renewals',
        icon: LayoutGrid,
    },
    {
        title: 'Notice And Evictions',
        href: '/notice_and_evictions',
        icon: LayoutGrid,
    },
    {
        title: 'Applications',
        href: '/applications',
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
