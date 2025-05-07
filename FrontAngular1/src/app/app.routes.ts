import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InscriptionComponent } from './inscription/inscription.component';
import { ConnexionComponent } from './connexion/connexion.component';
import { ProfileComponent } from './profile/profile.component';
import { DeconnexionComponent } from './deconnexion/deconnexion.component';
import { EmployeComponent } from './employe/employe.component';
import { EntrepriseListComponent } from './entreprise/entreprise-list.component';
import { EntrepriseFormComponent } from './entreprise/entreprise-form.component';
import { EntrepriseDetailComponent } from './entreprise/entreprise-detail.component';
import { AbonnementComponent } from './abonnement/abonnement.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [
    // Redirect empty path to '/dashboards/project'
    { path: '', pathMatch: 'full', redirectTo: 'sign-in' },


    {
        path: 'signed-in-redirect',
        pathMatch: 'full',
        redirectTo: 'entreprises',
    },
    { path: 'deconnexion', redirectTo: 'sign-out' },
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver,
        },
        children: [{ path: 'profileE', component: ProfileComponent }, { path: 'abonnement', component: AbonnementComponent }],
    },

    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver,
        },
        children: [{ path: 'listemployeA', component: EmployeComponent }],
    },

    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver,
        },
        children: [
            { path: 'entreprises', component: EntrepriseListComponent },
            { path: 'entreprises/new', component: EntrepriseFormComponent },
            { path: 'entreprises/:id', component: EntrepriseDetailComponent },
            { path: 'entreprises/:id/edit', component: EntrepriseFormComponent },
        ],
    },

    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [
            { path: 'inscription', redirectTo: 'sign-up' },
            { path: 'login', redirectTo: 'sign-in' },
        ],
    },

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [
            {
                path: 'confirmation-required',
                loadChildren: () =>
                    import(
                        'app/modules/auth/confirmation-required/confirmation-required.routes'
                    ),
            },
            {
                path: 'forgot-password',
                loadChildren: () =>
                    import(
                        'app/modules/auth/forgot-password/forgot-password.routes'
                    ),
            },
            {
                path: 'reset-password',
                loadChildren: () =>
                    import(
                        'app/modules/auth/reset-password/reset-password.routes'
                    ),
            },
            {
                path: 'sign-in',
                loadChildren: () =>
                    import('app/modules/auth/sign-in/sign-in.routes'),
            },
            {
                path: 'sign-up',
                loadChildren: () =>
                    import('app/modules/auth/sign-up/sign-up.routes'),
            },
        ],
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [
            {
                path: 'sign-out',
                loadChildren: () =>
                    import('app/modules/auth/sign-out/sign-out.routes'),
            },
            {
                path: 'unlock-session',
                loadChildren: () =>
                    import(
                        'app/modules/auth/unlock-session/unlock-session.routes'
                    ),
            },
        ],
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [
            {
                path: 'home',
                loadChildren: () =>
                    import('app/modules/landing/home/home.routes'),
            },
        ],
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver,
        },
        children: [
            // Dashboards
            { path: 'dashboards', redirectTo: 'pages/profile' },

            // App
            {
                path: 'apps',
                children: [
                    {
                        path: 'academy',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/apps/academy/academy.routes'
                            ),
                    },
                    {
                        path: 'chat',
                        loadChildren: () =>
                            import('app/modules/admin/apps/chat/chat.routes'),
                    },
                    {
                        path: 'contacts',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/apps/contacts/contacts.routes'
                            ),
                    },
                    {
                        path: 'ecommerce',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/apps/ecommerce/ecommerce.routes'
                            ),
                    },
                    {
                        path: 'file-manager',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/apps/file-manager/file-manager.routes'
                            ),
                    },
                    {
                        path: 'help-center',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/apps/help-center/help-center.routes'
                            ),
                    },
                    {
                        path: 'mailbox',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/apps/mailbox/mailbox.routes'
                            ),
                    },
                    {
                        path: 'notes',
                        loadChildren: () =>
                            import('app/modules/admin/apps/notes/notes.routes'),
                    },
                    {
                        path: 'scrumboard',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/apps/scrumboard/scrumboard.routes'
                            ),
                    },
                    {
                        path: 'tasks',
                        loadChildren: () =>
                            import('app/modules/admin/apps/tasks/tasks.routes'),
                    },
                ],
            },

            // Pages
            {
                path: 'pages',
                children: [
                    // Activities
                    {
                        path: 'activities',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/pages/activities/activities.routes'
                            ),
                    },
                    // Facture
                    {
                        path: 'facture',
                        loadComponent: () =>
                            import('./facture/facture.component').then(m => m.FactureComponent),
                    },
                    // Devis
                    {
                        path: 'devis',
                        loadComponent: () =>
                            import('./devis/devis.component').then(m => m.DevisComponent),
                    },
                    // Produits & Services
                    {
                        path: 'produit-service',
                        loadComponent: () =>
                            import('./produit-service/produit-service.component').then(m => m.ProduitServiceComponent),
                    },
                    // Authentication
                    {
                        path: 'authentication',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/pages/authentication/authentication.routes'
                            ),
                    },

                    // Coming Soon
                    {
                        path: 'coming-soon',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/pages/coming-soon/coming-soon.routes'
                            ),
                    },

                    // Error
                    {
                        path: 'error',
                        children: [
                            {
                                path: '404',
                                loadChildren: () =>
                                    import(
                                        'app/modules/admin/pages/error/error-404/error-404.routes'
                                    ),
                            },
                            {
                                path: '500',
                                loadChildren: () =>
                                    import(
                                        'app/modules/admin/pages/error/error-500/error-500.routes'
                                    ),
                            },
                        ],
                    },

                    // Invoice
                    {
                        path: 'invoice',
                        children: [
                            {
                                path: 'printable',
                                children: [
                                    {
                                        path: 'compact',
                                        loadChildren: () =>
                                            import(
                                                'app/modules/admin/pages/invoice/printable/compact/compact.routes'
                                            ),
                                    },
                                    {
                                        path: 'modern',
                                        loadChildren: () =>
                                            import(
                                                'app/modules/admin/pages/invoice/printable/modern/modern.routes'
                                            ),
                                    },
                                ],
                            },
                        ],
                    },

                    // Maintenance
                    {
                        path: 'maintenance',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/pages/maintenance/maintenance.routes'
                            ),
                    },

                    // Pricing
                    {
                        path: 'pricing',
                        children: [
                            {
                                path: 'modern',
                                loadChildren: () =>
                                    import(
                                        'app/modules/admin/pages/pricing/modern/modern.routes'
                                    ),
                            },
                            {
                                path: 'simple',
                                loadChildren: () =>
                                    import(
                                        'app/modules/admin/pages/pricing/simple/simple.routes'
                                    ),
                            },
                            {
                                path: 'single',
                                loadChildren: () =>
                                    import(
                                        'app/modules/admin/pages/pricing/single/single.routes'
                                    ),
                            },
                            {
                                path: 'table',
                                loadChildren: () =>
                                    import(
                                        'app/modules/admin/pages/pricing/table/table.routes'
                                    ),
                            },
                        ],
                    },

                    // Profile
                    {
                        path: 'profile',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/pages/profile/profile.routes'
                            ),
                    },

                    // Settings
                    {
                        path: 'settings',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/pages/settings/settings.routes'
                            ),
                    },
                ],
            },

            // User Interface
            {
                path: 'ui',
                children: [
                    // Material Components
                    {
                        path: 'material-components',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/material-components/material-components.routes'
                            ),
                    },

                    // Fuse Components
                    {
                        path: 'fuse-components',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/fuse-components/fuse-components.routes'
                            ),
                    },

                    // Other Components
                    {
                        path: 'other-components',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/other-components/other-components.routes'
                            ),
                    },

                    // TailwindCSS
                    {
                        path: 'tailwindcss',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/tailwindcss/tailwindcss.routes'
                            ),
                    },

                    // Advanced Search
                    {
                        path: 'advanced-search',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/advanced-search/advanced-search.routes'
                            ),
                    },

                    // Animations
                    {
                        path: 'animations',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/animations/animations.routes'
                            ),
                    },

                    // Cards
                    {
                        path: 'cards',
                        loadChildren: () =>
                            import('app/modules/admin/ui/cards/cards.routes'),
                    },

                    // Colors
                    {
                        path: 'colors',
                        loadChildren: () =>
                            import('app/modules/admin/ui/colors/colors.routes'),
                    },

                    // Confirmation Dialog
                    {
                        path: 'confirmation-dialog',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/confirmation-dialog/confirmation-dialog.routes'
                            ),
                    },

                    // Datatable
                    {
                        path: 'datatable',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/datatable/datatable.routes'
                            ),
                    },

                    // Forms
                    {
                        path: 'forms',
                        loadChildren: () =>
                            import('app/modules/admin/ui/forms/forms.routes'),
                    },

                    // Icons
                    {
                        path: 'icons',
                        loadChildren: () =>
                            import('app/modules/admin/ui/icons/icons.routes'),
                    },

                    // Page Layouts
                    {
                        path: 'page-layouts',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/page-layouts/page-layouts.routes'
                            ),
                    },

                    // Typography
                    {
                        path: 'typography',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/typography/typography.routes'
                            ),
                    },
                ],
            },

            // Documentation
            {
                path: 'docs',
                children: [
                    // Changelog
                    {
                        path: 'changelog',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/docs/changelog/changelog.routes'
                            ),
                    },

                    // Guides
                    {
                        path: 'guides',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/docs/guides/guides.routes'
                            ),
                    },
                ],
            },

            // 404 & Catch all
            {
                path: '404-not-found',
                pathMatch: 'full',
                loadChildren: () =>
                    import(
                        'app/modules/admin/pages/error/error-404/error-404.routes'
                    ),
            },
            { path: '**', redirectTo: '404-not-found' },
        ],
    },
];
