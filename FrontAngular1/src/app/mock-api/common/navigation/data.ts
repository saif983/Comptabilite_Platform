/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';
var tab: FuseNavigationItem[]=[{
    id: 'dashboards.listreclamation',
    title: 'List Reclamation',
    type: 'basic' as 'basic',
    icon: 'heroicons_outline:exclamation-circle', 
    link: '/dashboards/listreclamation',
    
},
{
    id: 'dashboards.listoffre',
    title: 'List Offre',
    type: 'basic' as 'basic',
    icon: 'heroicons_outline:tag',
    link: '/dashboards/listoffre',
},
{
    id: 'dashboards.listventes',
    title: 'List Ventes',
    type: 'basic' as 'basic',
    icon: 'heroicons_outline:receipt-refund', 
    link: '/dashboards/listventes',
},

{
    id: 'dashboards.listclients',
    title: 'List Clients',
    type: 'basic' as 'basic',
    icon: 'heroicons_outline:user-group', 
    link: '/dashboards/listclients',
},
{
    id: "dashboards.listachats",
    title: "List Achats",
    type: "basic" as 'basic',
    icon: "heroicons_outline:shopping-cart", 
    link: "/dashboards/listachats"
}
,
{
    id: 'dashboards.listproduits',
    title: 'Produits',
    type: 'basic' as 'basic',
    icon: 'heroicons_outline:clipboard-document-check',
    link: '/dashboards/listproduits'
},
{
    id: 'dashboards.listfactures',
    title: 'Factures',
    type: 'basic' as 'basic',
    icon: 'heroicons_outline:clipboard-document-check',
    link: '/dashboards/listfactures'
},
{
    id: 'dashboards.listdevis',
    title: 'Devis',
    type: 'basic' as 'basic',
    icon: 'heroicons_outline:document-text',
    link: '/dashboards/listdevis'
},

{
    id: "dashboards.listfournisseurs",
    title: "List Fournisseurs",
    type: "basic" as 'basic',
    icon: "heroicons_outline:truck", 
    link: "/dashboards/listfournisseurs"
},
{
    id: "dashboards.calendar",
    title: "Calendar",
    type: "basic" as 'basic',
    icon: "heroicons_outline:calendar", 
    link: "/dashboards/calendar"
},
{ 
    id: "dashboards.chat",
    title: "Chat",
   type: "basic" as 'basic',
    icon: "heroicons_outline:chat-bubble-bottom-center-text", 
    link: "/dashboards/chatgemini"
    
},
{ 
    id: "dashboards.meeting",
    title: "Meeting",
    type: "basic" as 'basic',
    icon: "heroicons_outline:user-group-outline",
    link: "/dashboards/meeting"
}

]

// Menu pour la gestion des entreprises
const entrepriseMenu: FuseNavigationItem[] = [
    {
        id      : 'entreprises',
        title   : 'Entreprises',
        type    : 'basic' as 'basic',
        icon    : 'heroicons_outline:building-office',
        link    : '/entreprises'
    },
    {
        id      : 'entreprise.nouvelle',
        title   : 'Créer une entreprise',
        type    : 'basic' as 'basic',
        icon    : 'heroicons_outline:plus-circle',
        link    : '/entreprises/new'
    },
];

export const defaultNavigation: FuseNavigationItem[] = [
    localStorage.getItem('employe') ? {
        id      : 'employe',
        title   : 'employe',
        subtitle: 'Unique dashboard designs',
        type    : 'group' as 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'employe.profile',
                title: 'Profile',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/profileE',
            },
            
            ...tab.map(item => ({
                id: item.id,
                title: item.title,
                type: item.type,
                icon: item.icon,
                link: item.link
            })),
            ...entrepriseMenu,
            {
                id      : 'employe.bilan',
                title   : 'Bilan Comptable',
                type    : 'basic' as 'basic',
                icon    : 'heroicons_outline:document-chart-bar',
                link    : '/bilan-comptable'
            },
            {
                id   : 'employe.abonnement',
                title: 'Abonnement',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:credit-card',
                link : '/abonnement',
            },
            {
                id   : 'employe.deconnexion',
                title: 'Deconnexion',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/deconnexion',
            },
            
           
        ],
    } :
    {
        id      : 'admin',
        title   : 'admin',
        subtitle: 'Unique dashboard designs',
        type    : 'group' as 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'admin.employe',
                title: 'Employe',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/listemployeA',
            },
           
            ...tab.map(item => ({
                id: item.id,
                title: item.title,
                type: item.type,
                icon: item.icon,
                link: item.link
            })),
            ...entrepriseMenu,
            {
                id      : 'admin.bilan',
                title   : 'Bilan Comptable',
                type    : 'basic' as 'basic',
                icon    : 'heroicons_outline:document-chart-bar',
                link    : '/bilan-comptable'
            },
            {
                id   : 'admin.abonnement',
                title: 'Abonnement',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:credit-card',
                link : '/abonnement',
            },
            {
                id   : 'admin.deconnexion',
                title: 'Deconnexion',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/deconnexion',
            },
           
        ],
     
    }
    
    ,
    {
        id      : 'dashboards',
        title   : 'Dashboards',
        subtitle: 'Unique dashboard designs',
        type    : 'group' as 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'dashboards.project',
                title: 'Project',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/dashboards/project',
            },
            {
                id   : 'dashboards.analytics',
                title: 'Analytics',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:chart-pie',
                link : '/dashboards/analytics',
            },
            {
                id   : 'dashboards.finance',
                title: 'Finance',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:banknotes',
                link : '/dashboards/finance',
            },
            {
                id   : 'dashboards.crypto',
                title: 'Crypto',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:currency-dollar',
                link : '/dashboards/crypto',
            },
        ],
    },
    {
        id      : 'apps',
        title   : 'Applications',
        subtitle: 'Custom made application designs',
        type    : 'group' as 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'apps.academy',
                title: 'Academy',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:academic-cap',
                link : '/apps/academy',
            },
            {
                id   : 'apps.chat',
                title: 'Chat',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:chat-bubble-bottom-center-text',
                link : '/apps/chat',
            },
            {
                id   : 'apps.contacts',
                title: 'Contacts',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:user-group',
                link : '/apps/contacts',
            },
            {
                id      : 'apps.ecommerce',
                title   : 'ECommerce',
                type    : 'collapsable' as 'collapsable',
                icon    : 'heroicons_outline:shopping-cart',
                children: [
                    {
                        id   : 'apps.ecommerce.inventory',
                        title: 'Inventory',
                        type : 'basic' as 'basic',
                        link : '/apps/ecommerce/inventory',
                    },
                ],
            },
            {
                id   : 'apps.file-manager',
                title: 'File Manager',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:cloud',
                link : '/apps/file-manager',
            },
            {
                id      : 'apps.help-center',
                title   : 'Help Center',
                type    : 'collapsable' as 'collapsable',
                icon    : 'heroicons_outline:information-circle',
                link    : '/apps/help-center',
                children: [
                    {
                        id        : 'apps.help-center.home',
                        title     : 'Home',
                        type      : 'basic' as 'basic',
                        link      : '/apps/help-center',
                        exactMatch: true,
                    },
                    {
                        id   : 'apps.help-center.faqs',
                        title: 'FAQs',
                        type : 'basic' as 'basic',
                        link : '/apps/help-center/faqs',
                    },
                    {
                        id   : 'apps.help-center.guides',
                        title: 'Guides',
                        type : 'basic' as 'basic',
                        link : '/apps/help-center/guides',
                    },
                    {
                        id   : 'apps.help-center.support',
                        title: 'Support',
                        type : 'basic' as 'basic',
                        link : '/apps/help-center/support',
                    },
                ],
            },
            {
                id   : 'apps.mailbox',
                title: 'Mailbox',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:envelope',
                link : '/apps/mailbox',
                badge: {
                    title  : '27',
                    classes: 'px-2 bg-pink-600 text-white rounded-full',
                },
            },
            {
                id   : 'apps.notes',
                title: 'Notes',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:pencil-square',
                link : '/apps/notes',
            },
            {
                id   : 'apps.scrumboard',
                title: 'Scrumboard',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:view-columns',
                link : '/apps/scrumboard',
            },
            {
                id   : 'apps.tasks',
                title: 'Tasks',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:check-circle',
                link : '/apps/tasks',
            },
        ],
    },
    {
        id      : 'pages',
        title   : 'Pages',
        subtitle: 'Custom made page designs',
        type    : 'group' as 'group',
        icon    : 'heroicons_outline:document',
        children: [
            {
                id   : 'pages.activities',
                title: 'Activities',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:bars-3-bottom-left',
                link : '/pages/activities',
            },
            {
                id      : 'pages.authentication',
                title   : 'Authentication',
                type    : 'collapsable' as 'collapsable',
                icon    : 'heroicons_outline:lock-closed',
                children: [
                    {
                        id      : 'pages.authentication.sign-in',
                        title   : 'Sign in',
                        type    : 'collapsable' as 'collapsable',
                        children: [
                            {
                                id   : 'pages.authentication.sign-in.classic',
                                title: 'Classic',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/sign-in/classic',
                            },
                            {
                                id   : 'pages.authentication.sign-in.modern',
                                title: 'Modern',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/sign-in/modern',
                            },
                            {
                                id   : 'pages.authentication.sign-in.modern-reversed',
                                title: 'Modern Reversed',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/sign-in/modern-reversed',
                            },
                            {
                                id   : 'pages.authentication.sign-in.split-screen',
                                title: 'Split Screen',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/sign-in/split-screen',
                            },
                            {
                                id   : 'pages.authentication.sign-in.split-screen-reversed',
                                title: 'Split Screen Reversed',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/sign-in/split-screen-reversed',
                            },
                            {
                                id   : 'pages.authentication.sign-in.fullscreen',
                                title: 'Fullscreen',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/sign-in/fullscreen',
                            },
                            {
                                id   : 'pages.authentication.sign-in.fullscreen-reversed',
                                title: 'Fullscreen Reversed',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/sign-in/fullscreen-reversed',
                            },
                        ],
                    },
                    {
                        id      : 'pages.authentication.sign-up',
                        title   : 'Sign up',
                        type    : 'collapsable' as 'collapsable',
                        link    : '/pages/authentication/sign-up',
                        children: [
                            {
                                id   : 'pages.authentication.sign-up.classic',
                                title: 'Classic',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/sign-up/classic',
                            },
                            {
                                id   : 'pages.authentication.sign-up.modern',
                                title: 'Modern',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/sign-up/modern',
                            },
                            {
                                id   : 'pages.authentication.sign-up.modern-reversed',
                                title: 'Modern Reversed',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/sign-up/modern-reversed',
                            },
                            {
                                id   : 'pages.authentication.sign-up.split-screen',
                                title: 'Split Screen',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/sign-up/split-screen',
                            },
                            {
                                id   : 'pages.authentication.sign-up.split-screen-reversed',
                                title: 'Split Screen Reversed',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/sign-up/split-screen-reversed',
                            },
                            {
                                id   : 'pages.authentication.sign-up.fullscreen',
                                title: 'Fullscreen',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/sign-up/fullscreen',
                            },
                            {
                                id   : 'pages.authentication.sign-up.fullscreen-reversed',
                                title: 'Fullscreen Reversed',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/sign-up/fullscreen-reversed',
                            },
                        ],
                    },
                    {
                        id      : 'pages.authentication.sign-out',
                        title   : 'Sign out',
                        type    : 'collapsable' as 'collapsable',
                        link    : '/pages/authentication/sign-out',
                        children: [
                            {
                                id   : 'pages.authentication.sign-out.classic',
                                title: 'Classic',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/sign-out/classic',
                            },
                            {
                                id   : 'pages.authentication.sign-out.modern',
                                title: 'Modern',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/sign-out/modern',
                            },
                            {
                                id   : 'pages.authentication.sign-out.modern-reversed',
                                title: 'Modern Reversed',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/sign-out/modern-reversed',
                            },
                            {
                                id   : 'pages.authentication.sign-out.split-screen',
                                title: 'Split Screen',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/sign-out/split-screen',
                            },
                            {
                                id   : 'pages.authentication.sign-out.split-screen-reversed',
                                title: 'Split Screen Reversed',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/sign-out/split-screen-reversed',
                            },
                            {
                                id   : 'pages.authentication.sign-out.fullscreen',
                                title: 'Fullscreen',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/sign-out/fullscreen',
                            },
                            {
                                id   : 'pages.authentication.sign-out.fullscreen-reversed',
                                title: 'Fullscreen Reversed',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/sign-out/fullscreen-reversed',
                            },
                        ],
                    },
                    {
                        id      : 'pages.authentication.forgot-password',
                        title   : 'Forgot password',
                        type    : 'collapsable' as 'collapsable',
                        link    : '/pages/authentication/forgot-password',
                        children: [
                            {
                                id   : 'pages.authentication.forgot-password.classic',
                                title: 'Classic',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/forgot-password/classic',
                            },
                            {
                                id   : 'pages.authentication.forgot-password.modern',
                                title: 'Modern',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/forgot-password/modern',
                            },
                            {
                                id   : 'pages.authentication.forgot-password.modern-reversed',
                                title: 'Modern Reversed',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/forgot-password/modern-reversed',
                            },
                            {
                                id   : 'pages.authentication.forgot-password.split-screen',
                                title: 'Split Screen',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/forgot-password/split-screen',
                            },
                            {
                                id   : 'pages.authentication.forgot-password.split-screen-reversed',
                                title: 'Split Screen Reversed',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/forgot-password/split-screen-reversed',
                            },
                            {
                                id   : 'pages.authentication.forgot-password.fullscreen',
                                title: 'Fullscreen',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/forgot-password/fullscreen',
                            },
                            {
                                id   : 'pages.authentication.forgot-password.fullscreen-reversed',
                                title: 'Fullscreen Reversed',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/forgot-password/fullscreen-reversed',
                            },
                        ],
                    },
                    {
                        id      : 'pages.authentication.reset-password',
                        title   : 'Reset password',
                        type    : 'collapsable' as 'collapsable',
                        link    : '/pages/authentication/reset-password',
                        children: [
                            {
                                id   : 'pages.authentication.reset-password.classic',
                                title: 'Classic',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/reset-password/classic',
                            },
                            {
                                id   : 'pages.authentication.reset-password.modern',
                                title: 'Modern',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/reset-password/modern',
                            },
                            {
                                id   : 'pages.authentication.reset-password.modern-reversed',
                                title: 'Modern Reversed',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/reset-password/modern-reversed',
                            },
                            {
                                id   : 'pages.authentication.reset-password.split-screen',
                                title: 'Split Screen',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/reset-password/split-screen',
                            },
                            {
                                id   : 'pages.authentication.reset-password.split-screen-reversed',
                                title: 'Split Screen Reversed',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/reset-password/split-screen-reversed',
                            },
                            {
                                id   : 'pages.authentication.reset-password.fullscreen',
                                title: 'Fullscreen',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/reset-password/fullscreen',
                            },
                            {
                                id   : 'pages.authentication.reset-password.fullscreen-reversed',
                                title: 'Fullscreen Reversed',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/reset-password/fullscreen-reversed',
                            },
                        ],
                    },
                    {
                        id      : 'pages.authentication.unlock-session',
                        title   : 'Unlock session',
                        type    : 'collapsable' as 'collapsable',
                        link    : '/pages/authentication/unlock-session',
                        children: [
                            {
                                id   : 'pages.authentication.unlock-session.classic',
                                title: 'Classic',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/unlock-session/classic',
                            },
                            {
                                id   : 'pages.authentication.unlock-session.modern',
                                title: 'Modern',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/unlock-session/modern',
                            },
                            {
                                id   : 'pages.authentication.unlock-session.modern-reversed',
                                title: 'Modern Reversed',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/unlock-session/modern-reversed',
                            },
                            {
                                id   : 'pages.authentication.unlock-session.split-screen',
                                title: 'Split Screen',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/unlock-session/split-screen',
                            },
                            {
                                id   : 'pages.authentication.unlock-session.split-screen-reversed',
                                title: 'Split Screen Reversed',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/unlock-session/split-screen-reversed',
                            },
                            {
                                id   : 'pages.authentication.unlock-session.fullscreen',
                                title: 'Fullscreen',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/unlock-session/fullscreen',
                            },
                            {
                                id   : 'pages.authentication.unlock-session.fullscreen-reversed',
                                title: 'Fullscreen Reversed',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/unlock-session/fullscreen-reversed',
                            },
                        ],
                    },
                    {
                        id      : 'pages.authentication.confirmation-required',
                        title   : 'Confirmation required',
                        type    : 'collapsable' as 'collapsable',
                        link    : '/pages/authentication/confirmation-required',
                        children: [
                            {
                                id   : 'pages.authentication.confirmation-required.classic',
                                title: 'Classic',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/confirmation-required/classic',
                            },
                            {
                                id   : 'pages.authentication.confirmation-required.modern',
                                title: 'Modern',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/confirmation-required/modern',
                            },
                            {
                                id   : 'pages.authentication.confirmation-required.modern-reversed',
                                title: 'Modern Reversed',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/confirmation-required/modern-reversed',
                            },
                            {
                                id   : 'pages.authentication.confirmation-required.split-screen',
                                title: 'Split Screen',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/confirmation-required/split-screen',
                            },
                            {
                                id   : 'pages.authentication.confirmation-required.split-screen-reversed',
                                title: 'Split Screen Reversed',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/confirmation-required/split-screen-reversed',
                            },
                            {
                                id   : 'pages.authentication.confirmation-required.fullscreen',
                                title: 'Fullscreen',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/confirmation-required/fullscreen',
                            },
                            {
                                id   : 'pages.authentication.confirmation-required.fullscreen-reversed',
                                title: 'Fullscreen Reversed',
                                type : 'basic' as 'basic',
                                link : '/pages/authentication/confirmation-required/fullscreen-reversed',
                            },
                        ],
                    },
                ],
            },
            {
                id      : 'pages.coming-soon',
                title   : 'Coming Soon',
                type    : 'collapsable' as 'collapsable',
                icon    : 'heroicons_outline:clock',
                link    : '/pages/coming-soon',
                children: [
                    {
                        id   : 'pages.coming-soon.classic',
                        title: 'Classic',
                        type : 'basic' as 'basic',
                        link : '/pages/coming-soon/classic',
                    },
                    {
                        id   : 'pages.coming-soon.modern',
                        title: 'Modern',
                        type : 'basic' as 'basic',
                        link : '/pages/coming-soon/modern',
                    },
                    {
                        id   : 'pages.coming-soon.modern-reversed',
                        title: 'Modern Reversed',
                        type : 'basic' as 'basic',
                        link : '/pages/coming-soon/modern-reversed',
                    },
                    {
                        id   : 'pages.coming-soon.split-screen',
                        title: 'Split Screen',
                        type : 'basic' as 'basic',
                        link : '/pages/coming-soon/split-screen',
                    },
                    {
                        id   : 'pages.coming-soon.split-screen-reversed',
                        title: 'Split Screen Reversed',
                        type : 'basic' as 'basic',
                        link : '/pages/coming-soon/split-screen-reversed',
                    },
                    {
                        id   : 'pages.coming-soon.fullscreen',
                        title: 'Fullscreen',
                        type : 'basic' as 'basic',
                        link : '/pages/coming-soon/fullscreen',
                    },
                    {
                        id   : 'pages.coming-soon.fullscreen-reversed',
                        title: 'Fullscreen Reversed',
                        type : 'basic' as 'basic',
                        link : '/pages/coming-soon/fullscreen-reversed',
                    },
                ],
            },
            {
                id      : 'pages.error',
                title   : 'Error',
                type    : 'collapsable' as 'collapsable',
                icon    : 'heroicons_outline:exclamation-circle',
                children: [
                    {
                        id   : 'pages.error.404',
                        title: '404',
                        type : 'basic' as 'basic',
                        link : '/pages/error/404',
                    },
                    {
                        id   : 'pages.error.500',
                        title: '500',
                        type : 'basic' as 'basic',
                        link : '/pages/error/500',
                    },
                ],
            },
            {
                id      : 'pages.invoice',
                title   : 'Invoice',
                type    : 'collapsable' as 'collapsable',
                icon    : 'heroicons_outline:calculator',
                children: [
                    {
                        id      : 'pages.invoice.printable',
                        title   : 'Printable',
                        type    : 'collapsable' as 'collapsable',
                        children: [
                            {
                                id   : 'pages.invoice.printable.compact',
                                title: 'Compact',
                                type : 'basic' as 'basic',
                                link : '/pages/invoice/printable/compact',
                            },
                            {
                                id   : 'pages.invoice.printable.modern',
                                title: 'Modern',
                                type : 'basic' as 'basic',
                                link : '/pages/invoice/printable/modern',
                            },
                        ],
                    },
                ],
            },
            {
                id   : 'pages.maintenance',
                title: 'Maintenance',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:exclamation-triangle',
                link : '/pages/maintenance',
            },
            {
                id      : 'pages.pricing',
                title   : 'Pricing',
                type    : 'collapsable' as 'collapsable',
                icon    : 'heroicons_outline:banknotes',
                children: [
                    {
                        id   : 'pages.pricing.modern',
                        title: 'Modern',
                        type : 'basic' as 'basic',
                        link : '/pages/pricing/modern',
                    },
                    {
                        id   : 'pages.pricing.simple',
                        title: 'Simple',
                        type : 'basic' as 'basic',
                        link : '/pages/pricing/simple',
                    },
                    {
                        id   : 'pages.pricing.single',
                        title: 'Single',
                        type : 'basic' as 'basic',
                        link : '/pages/pricing/single',
                    },
                    {
                        id   : 'pages.pricing.table',
                        title: 'Table',
                        type : 'basic' as 'basic',
                        link : '/pages/pricing/table',
                    },
                ],
            },
            {
                id   : 'pages.profile',
                title: 'Profile',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:user-circle',
                link : '/pages/profile',
            },
            {
                id   : 'pages.settings',
                title: 'Settings',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:cog-8-tooth',
                link : '/pages/settings',
            },
            {
                id: 'pages.facture',
                title: 'Factures',
                type: 'basic' as 'basic',
                icon: 'heroicons_outline:document-text',
                link: '/pages/facture'
            },
            {
                id: 'pages.devis',
                title: 'Devis',
                type: 'basic' as 'basic',
                icon: 'heroicons_outline:document',
                link: '/pages/devis'
            },
            {
                id: 'pages.depense',
                title: 'Dépenses',
                type: 'basic' as 'basic',
                icon: 'heroicons_outline:banknotes',
                link: '/pages/depense'
            },
        ],
    },
    {
        id      : 'user-interface',
        title   : 'User Interface',
        subtitle: 'Building blocks of the UI & UX',
        type    : 'group' as 'group',
        icon    : 'heroicons_outline:rectangle-stack',
        children: [
            {
                id   : 'user-interface.material-components',
                title: 'Material Components',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:square-3-stack-3d',
                link : '/ui/material-components',
            },
            {
                id   : 'user-interface.fuse-components',
                title: 'Fuse Components',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:square-3-stack-3d',
                link : '/ui/fuse-components',
            },
            {
                id   : 'user-interface.other-components',
                title: 'Other Components',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:square-3-stack-3d',
                link : '/ui/other-components',
            },
            {
                id   : 'user-interface.tailwindcss',
                title: 'TailwindCSS',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:sparkles',
                link : '/ui/tailwindcss',
            },
            {
                id   : 'user-interface.advanced-search',
                title: 'Advanced Search',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:magnifying-glass-circle',
                link : '/ui/advanced-search',
            },
            {
                id   : 'user-interface.animations',
                title: 'Animations',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:play',
                link : '/ui/animations',
            },
            {
                id   : 'user-interface.cards',
                title: 'Cards',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:square-2-stack',
                link : '/ui/cards',
            },
            {
                id   : 'user-interface.colors',
                title: 'Colors',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:swatch',
                link : '/ui/colors',
            },
            {
                id   : 'user-interface.confirmation-dialog',
                title: 'Confirmation Dialog',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:question-mark-circle',
                link : '/ui/confirmation-dialog',
            },
            {
                id   : 'user-interface.datatable',
                title: 'Datatable',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:table-cells',
                link : '/ui/datatable',
            },
            {
                id      : 'user-interface.forms',
                title   : 'Forms',
                type    : 'collapsable' as 'collapsable',
                icon    : 'heroicons_outline:pencil-square',
                children: [
                    {
                        id   : 'user-interface.forms.fields',
                        title: 'Fields',
                        type : 'basic' as 'basic',
                        link : '/ui/forms/fields',
                    },
                    {
                        id   : 'user-interface.forms.layouts',
                        title: 'Layouts',
                        type : 'basic' as 'basic',
                        link : '/ui/forms/layouts',
                    },
                    {
                        id   : 'user-interface.forms.wizards',
                        title: 'Wizards',
                        type : 'basic' as 'basic',
                        link : '/ui/forms/wizards',
                    },
                ],
            },
            {
                id      : 'user-interface.icons',
                title   : 'Icons',
                type    : 'collapsable' as 'collapsable',
                icon    : 'heroicons_outline:bolt',
                children: [
                    {
                        id   : 'user-interface.icons.heroicons-outline',
                        title: 'Heroicons Outline',
                        type : 'basic' as 'basic',
                        link : '/ui/icons/heroicons-outline',
                    },
                    {
                        id   : 'user-interface.icons.heroicons-solid',
                        title: 'Heroicons Solid',
                        type : 'basic' as 'basic',
                        link : '/ui/icons/heroicons-solid',
                    },
                    {
                        id   : 'user-interface.icons.heroicons-mini',
                        title: 'Heroicons Mini',
                        type : 'basic' as 'basic',
                        link : '/ui/icons/heroicons-mini',
                    },
                    {
                        id   : 'user-interface.icons.material-twotone',
                        title: 'Material Twotone',
                        type : 'basic' as 'basic',
                        link : '/ui/icons/material-twotone',
                    },
                    {
                        id   : 'user-interface.icons.material-outline',
                        title: 'Material Outline',
                        type : 'basic' as 'basic',
                        link : '/ui/icons/material-outline',
                    },
                    {
                        id   : 'user-interface.icons.material-solid',
                        title: 'Material Solid',
                        type : 'basic' as 'basic',
                        link : '/ui/icons/material-solid',
                    },
                    {
                        id   : 'user-interface.icons.feather',
                        title: 'Feather',
                        type : 'basic' as 'basic',
                        link : '/ui/icons/feather',
                    },
                ],
            },
            {
                id      : 'user-interface.page-layouts',
                title   : 'Page Layouts',
                type    : 'collapsable' as 'collapsable',
                icon    : 'heroicons_outline:rectangle-group',
                children: [
                    {
                        id   : 'user-interface.page-layouts.overview',
                        title: 'Overview',
                        type : 'basic' as 'basic',
                        link : '/ui/page-layouts/overview',
                    },
                    {
                        id   : 'user-interface.page-layouts.empty',
                        title: 'Empty',
                        type : 'basic' as 'basic',
                        link : '/ui/page-layouts/empty',
                    },
                    {
                        id: 'user-interface.page-layouts.carded',

                        title   : 'Carded',
                        type    : 'collapsable' as 'collapsable',
                        children: [
                            {
                                id   : 'user-interface.page-layouts.carded.fullwidth',
                                title: 'Fullwidth',
                                type : 'basic' as 'basic',
                                link : '/ui/page-layouts/carded/fullwidth',
                            },
                            {
                                id   : 'user-interface.page-layouts.carded.left-sidebar-1',
                                title: 'Left Sidebar #1',
                                type : 'basic' as 'basic',
                                link : '/ui/page-layouts/carded/left-sidebar-1',
                            },
                            {
                                id   : 'user-interface.page-layouts.carded.left-sidebar-2',
                                title: 'Left Sidebar #2',
                                type : 'basic' as 'basic',
                                link : '/ui/page-layouts/carded/left-sidebar-2',
                            },
                            {
                                id   : 'user-interface.page-layouts.carded.right-sidebar-1',
                                title: 'Right Sidebar #1',
                                type : 'basic' as 'basic',
                                link : '/ui/page-layouts/carded/right-sidebar-1',
                            },
                            {
                                id   : 'user-interface.page-layouts.carded.right-sidebar-2',
                                title: 'Right Sidebar #2',
                                type : 'basic' as 'basic',
                                link : '/ui/page-layouts/carded/right-sidebar-2',
                            },
                        ],
                    },
                    {
                        id      : 'user-interface.page-layouts.simple',
                        title   : 'Simple',
                        type    : 'collapsable' as 'collapsable',
                        children: [
                            {
                                id   : 'user-interface.page-layouts.simple.fullwidth-1',
                                title: 'Fullwidth #1',
                                type : 'basic' as 'basic',
                                link : '/ui/page-layouts/simple/fullwidth-1',
                            },
                            {
                                id   : 'user-interface.page-layouts.simple.fullwidth-2',
                                title: 'Fullwidth #2',
                                type : 'basic' as 'basic',
                                link : '/ui/page-layouts/simple/fullwidth-2',
                            },
                            {
                                id   : 'user-interface.page-layouts.simple.left-sidebar-1',
                                title: 'Left Sidebar #1',
                                type : 'basic' as 'basic',
                                link : '/ui/page-layouts/simple/left-sidebar-1',
                            },
                            {
                                id   : 'user-interface.page-layouts.simple.left-sidebar-2',
                                title: 'Left Sidebar #2',
                                type : 'basic' as 'basic',
                                link : '/ui/page-layouts/simple/left-sidebar-2',
                            },
                            {
                                id   : 'user-interface.page-layouts.simple.left-sidebar-3',
                                title: 'Left Sidebar #3',
                                type : 'basic' as 'basic',
                                link : '/ui/page-layouts/simple/left-sidebar-3',
                            },
                            {
                                id   : 'user-interface.page-layouts.simple.right-sidebar-1',
                                title: 'Right Sidebar #1',
                                type : 'basic' as 'basic',
                                link : '/ui/page-layouts/simple/right-sidebar-1',
                            },
                            {
                                id   : 'user-interface.page-layouts.simple.right-sidebar-2',
                                title: 'Right Sidebar #2',
                                type : 'basic' as 'basic',
                                link : '/ui/page-layouts/simple/right-sidebar-2',
                            },
                            {
                                id   : 'user-interface.page-layouts.simple.right-sidebar-3',
                                title: 'Right Sidebar #3',
                                type : 'basic' as 'basic',
                                link : '/ui/page-layouts/simple/right-sidebar-3',
                            },
                        ],
                    },
                ],
            },
            {
                id   : 'user-interface.typography',
                title: 'Typography',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:pencil',
                link : '/ui/typography',
            },
        ],
    },
    {
        id  : 'divider-1',
        type: 'divider',
    },
    {
        id      : 'documentation',
        title   : 'Documentation',
        subtitle: 'Everything you need to know about Fuse',
        type    : 'group' as 'group',
        icon    : 'heroicons_outline:information-circle',
        children: [
            {
                id   : 'documentation.changelog',
                title: 'Changelog',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:megaphone',
                link : '/docs/changelog',
                badge: {
                    title  : '19.0.0',
                    classes: 'px-2 bg-yellow-300 text-black rounded-full',
                },
            },
            {
                id   : 'documentation.guides',
                title: 'Guides',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:book-open',
                link : '/docs/guides',
            },
            {
                id   : 'user-interface.material-components',
                title: 'Material Components',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:square-3-stack-3d',
                link : '/ui/material-components',
            },
            {
                id   : 'user-interface.fuse-components',
                title: 'Fuse Components',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:square-3-stack-3d',
                link : '/ui/fuse-components',
            },
            {
                id   : 'user-interface.other-components',
                title: 'Other Components',
                type : 'basic' as 'basic',
                icon : 'heroicons_outline:square-3-stack-3d',
                link : '/ui/other-components',
            },
        ],
    },
    {
        id  : 'divider-2',
        type: 'divider',
    },
    {
        id      : 'navigation-features',
        title   : 'Navigation features',
        subtitle: 'Collapsable levels & badge styles',
        type    : 'group' as 'group',
        icon    : 'heroicons_outline:bars-3',
        children: [
            {
                id      : 'navigation-features.level.0',
                title   : 'Level 0',
                icon    : 'heroicons_outline:check-circle',
                type    : 'collapsable' as 'collapsable',
                children: [
                    {
                        id      : 'navigation-features.level.0.1',
                        title   : 'Level 1',
                        type    : 'collapsable' as 'collapsable',
                        children: [
                            {
                                id      : 'navigation-features.level.0.1.2',
                                title   : 'Level 2',
                                type    : 'collapsable' as 'collapsable',
                                children: [
                                    {
                                        id      : 'navigation-features.level.0.1.2.3',
                                        title   : 'Level 3',
                                        type    : 'collapsable' as 'collapsable',
                                        children: [
                                            {
                                                id      : 'navigation-features.level.0.1.2.3.4',
                                                title   : 'Level 4',
                                                type    : 'collapsable' as 'collapsable',
                                                children: [
                                                    {
                                                        id      : 'navigation-features.level.0.1.2.3.4.5',
                                                        title   : 'Level 5',
                                                        type    : 'collapsable' as 'collapsable',
                                                        children: [
                                                            {
                                                                id   : 'navigation-features.level.0.1.2.3.4.5.6',
                                                                title: 'Level 6',
                                                                type : 'basic' as 'basic',
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id      : 'navigation-features.level.0',
                title   : 'Level 0',
                subtitle: 'With subtitle',
                icon    : 'heroicons_outline:check-circle',
                type    : 'collapsable' as 'collapsable',
                children: [
                    {
                        id   : 'navigation-features.level.0.1-1',
                        title: 'Level 1.1',
                        type : 'basic' as 'basic',
                    },
                    {
                        id   : 'navigation-features.level.0.1-2',
                        title: 'Level 1.2',
                        type : 'basic' as 'basic',
                    },
                ],
            },
            {
                id      : 'navigation-features.active',
                title   : 'Active item',
                subtitle: 'Manually marked as active',
                icon    : 'heroicons_outline:check-circle',
                type    : 'basic' as 'basic',
                active  : true,
            },
            {
                id      : 'navigation-features.disabled-collapsable',
                title   : 'Disabled collapsable',
                subtitle: 'Some subtitle',
                icon    : 'heroicons_outline:check-circle',
                type    : 'collapsable' as 'collapsable',
                disabled: true,
                children: [
                    {
                        id   : 'navigation-features.disabled-collapsable.child',
                        title: 'You shouldn\'t be able to see this child',
                        type : 'basic' as 'basic',
                    },
                ],
            },
            {
                id      : 'navigation-features.disabled-basic',
                title   : 'Disabled basic',
                subtitle: 'Some subtitle',
                icon    : 'heroicons_outline:check-circle',
                type    : 'basic' as 'basic',
                disabled: true,
            },
            {
                id   : 'navigation-features.badge-style-oval',
                title: 'Oval badge',
                icon : 'heroicons_outline:tag',
                type : 'basic' as 'basic',
                badge: {
                    title  : '8',
                    classes: 'w-5 h-5 bg-teal-400 text-black rounded-full',
                },
            },
            {
                id   : 'navigation-features.badge-style-rectangle',
                title: 'Rectangle badge',
                icon : 'heroicons_outline:tag',
                type : 'basic' as 'basic',
                badge: {
                    title  : 'Updated!',
                    classes: 'px-2 bg-teal-400 text-black rounded',
                },
            },
            {
                id   : 'navigation-features.badge-style-rounded',
                title: 'Rounded badge',
                icon : 'heroicons_outline:tag',
                type : 'basic' as 'basic',
                badge: {
                    title  : 'NEW',
                    classes: 'px-2.5 bg-teal-400 text-black rounded-full',
                },
            },
            {
                id   : 'navigation-features.badge-style-simple',
                title: 'Simple badge',
                icon : 'heroicons_outline:tag',
                type : 'basic' as 'basic',
                badge: {
                    title  : '87 Unread',
                    classes: 'text-teal-500',
                },
            },
            {
                id   : 'navigation-features.multi-line',
                title: 'A multi line navigation item title example which works just fine',
                icon : 'heroicons_outline:check-circle',
                type : 'basic' as 'basic',
            },
        ],
    },
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id      : 'dashboards',
        title   : 'Dashboards',
        tooltip : 'Dashboards',
        type    : 'aside' as 'aside',
        icon    : 'heroicons_outline:home',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'apps',
        title   : 'Apps',
        tooltip : 'Apps',
        type    : 'aside' as 'aside',
        icon    : 'heroicons_outline:qrcode',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'pages',
        title   : 'Pages',
        tooltip : 'Pages',
        type    : 'aside' as 'aside',
        icon    : 'heroicons_outline:document-duplicate',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'user-interface',
        title   : 'UI',
        tooltip : 'UI',
        type    : 'aside' as 'aside',
        icon    : 'heroicons_outline:rectangle-stack',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'navigation-features',
        title   : 'Navigation',
        tooltip : 'Navigation',
        type    : 'aside' as 'aside',
        icon    : 'heroicons_outline:bars-3',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id      : 'dashboards',
        title   : 'DASHBOARDS',
        type    : 'group' as 'group',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'apps',
        title   : 'APPS',
        type    : 'group' as 'group',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id   : 'others',
        title: 'OTHERS',
        type : 'group' as 'group',
    },
    {
        id      : 'pages',
        title   : 'Pages',
        type    : 'aside' as 'aside',
        icon    : 'heroicons_outline:document-duplicate',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'user-interface',
        title   : 'User Interface',
        type    : 'aside' as 'aside',
        icon    : 'heroicons_outline:rectangle-stack',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'navigation-features',
        title   : 'Navigation Features',
        type    : 'aside' as 'aside',
        icon    : 'heroicons_outline:bars-3',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id      : 'dashboards',
        title   : 'Dashboards',
        type    : 'group' as 'group',
        icon    : 'heroicons_outline:home',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'apps',
        title   : 'Apps',
        type    : 'group' as 'group',
        icon    : 'heroicons_outline:qrcode',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'pages',
        title   : 'Pages',
        type    : 'group' as 'group',
        icon    : 'heroicons_outline:document-duplicate',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'user-interface',
        title   : 'UI',
        type    : 'group' as 'group',
        icon    : 'heroicons_outline:rectangle-stack',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'navigation-features',
        title   : 'Misc',
        type    : 'group' as 'group',
        icon    : 'heroicons_outline:bars-3',
        children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
];
