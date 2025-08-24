<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define all your resource permissions
        $resources = [
            'users',
            'roles',
            'properties-info',
            'applications',
            'vendors',
            'tenants',
            'units',
            'payments',
            'vendor-task-tracker',
            'move-in',
            'move-out',
            'notices',
            'offers_and_renewals',
            'notice_and_evictions',
            'payment-plans',
            'cities'
        ];

        $actions = ['view', 'create', 'edit', 'delete'];

        // Create permissions for all resources
        foreach ($resources as $resource) {
            foreach ($actions as $action) {
                Permission::create([
                    'name' => "{$action}-{$resource}",
                    'guard_name' => 'web'
                ]);
            }
        }

        // Additional specific permissions
        $specificPermissions = [
            'edit-profile', // For users to edit their own profile
            'view-dashboard', // For dashboard access
        ];

        foreach ($specificPermissions as $permission) {
            Permission::create([
                'name' => $permission,
                'guard_name' => 'web'
            ]);
        }

        // Create the three roles you specified
        $adminRole = Role::create(['name' => 'admin']);
        $managerRole = Role::create(['name' => 'manager']);
        $viewerRole = Role::create(['name' => 'viewer']);

        // ADMIN: Gets all permissions
        $adminRole->givePermissionTo(Permission::all());

        // MANAGER: Gets all permissions EXCEPT role management
        $managerPermissions = Permission::whereNotIn('name', [
            'view-roles',
            'create-roles',
            'edit-roles',
            'delete-roles'
        ])->get();

        $managerRole->givePermissionTo($managerPermissions);

        // VIEWER: Can only view indexes and edit profile
        $viewerPermissions = [];

        // Add view permissions for all resources
        foreach ($resources as $resource) {
            $viewerPermissions[] = "view-{$resource}";
        }

        // Add profile editing and dashboard access
        $viewerPermissions[] = 'edit-profile';
        $viewerPermissions[] = 'view-dashboard';

        $viewerRole->givePermissionTo($viewerPermissions);
    }
}
