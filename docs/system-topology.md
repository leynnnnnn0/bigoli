# StampBayan System Topology

This diagram shows the current StampBayan application topology based on the system parts currently used.

```mermaid
flowchart TB
    Users["Users"]
    BusinessUser["Business Owner/Admin"]
    CustomerUser["Customer"]
    StaffUser["Staff"]

    Users --> BusinessUser
    Users --> CustomerUser
    Users --> StaffUser

    BusinessUser --> Browser["Browser"]
    CustomerUser --> Browser
    StaffUser --> Browser

    Browser --> Laravel["Laravel 12 App\nPHP / Artisan Server"]

    Laravel --> Inertia["Inertia Laravel"]
    Inertia --> ReactPages["React 19 + TypeScript Pages\nresources/js/pages"]
    ReactPages --> Vite["Vite Asset Pipeline"]

    Laravel --> WebRoutes["Web Routes\nroutes/web.php"]

    WebRoutes --> BusinessPortal["Business Portal\n/business/*"]
    WebRoutes --> CustomerPortal["Customer Portal\n/customer/*"]
    WebRoutes --> StaffPortal["Staff Portal\n/staff/*"]

    BusinessPortal --> BusinessControllers["Business Controllers\nDashboard, Staff, Branch,\nCards, QR Studio, Issue Stamp,\nClaims, Tickets"]
    CustomerPortal --> CustomerControllers["Customer Controllers\nAuth, Dashboard, Profile,\nPassword"]
    StaffPortal --> StaffControllers["Staff Controllers\nAuth, Dashboard, Offline\nStamps, Claims"]

    BusinessControllers --> Eloquent["Eloquent Models"]
    CustomerControllers --> Eloquent
    StaffControllers --> Eloquent

    Eloquent --> Database["Database\nMySQL"]

    Laravel --> Sessions["Sessions\nDefault: database"]
    Laravel --> Cache["Cache\nDefault: database"]
    Laravel --> Mail["Mail / Notifications\nDefault local mailer: log"]
    Laravel --> Storage["Local/Public Storage\nuploads, generated assets"]
    Laravel --> Excel["Excel Export\nLaravel Excel"]
    Laravel --> PDF["PDF Generation\nDompdf / Spatie PDF"]
    Laravel --> QRService["External QR Image Service\napi.qrserver.com"]

    QRService --> PDF
    PDF --> Browser
    Excel --> Browser
    Storage --> Browser
```

## Included Components

- **Users:** Business owners/admins, customers, and staff.
- **Browser:** Main access point for all portals.
- **Laravel Application:** Main backend runtime for routes, controllers, authentication, business logic, PDF generation, exports, storage, and notifications.
- **Inertia + React:** Frontend rendering layer used by the browser-facing pages.
- **Web Routes:** Main route layer used by the application.
- **Role-Based Portals:** Separate business, customer, and staff areas.
- **Eloquent Models:** Application data model layer.
- **Database:** Stores business, branch, user, customer, staff, loyalty card, stamp, perk, claim, ticket, session, and cache data.
- **Supporting Services:** Mail notifications, local/public storage, Excel exports, PDF generation, and QR image generation.

## Removed From This Diagram

- **API routes:** Removed because this topology is focused on the active browser-facing system flow.
- **JSON API / API Controllers:** Removed from the diagram as requested.
- **Queue Worker:** Removed because it is not currently used in the active system setup.
