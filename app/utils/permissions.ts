// @/app/utils/permissions.ts

export type UserRole = 'Admin' | 'SalesManager' | 'BusinessDevelopmentManager' | 'SalesRep';

export const PERMISSIONS = {
    // ============ ADMIN ONLY ============
    DELETE_CONTRACT: ['Admin'],
    
    // ============ ADMIN & SALESMANAGER ============
    APPROVE_PROPOSAL: ['Admin', 'SalesManager'],
    REJECT_PROPOSAL: ['Admin', 'SalesManager'],
    DELETE_PROPOSAL: ['Admin', 'SalesManager'],
    ASSIGN_OPPORTUNITY: ['Admin', 'SalesManager'],
    ASSIGN_PRICING_REQUEST: ['Admin', 'SalesManager'],
    ACTIVATE_CONTRACT: ['Admin', 'SalesManager'],
    RENEW_CONTRACT: ['Admin', 'SalesManager'],
    CANCEL_CONTRACT: ['Admin', 'SalesManager'],
    DELETE_CLIENT: ['Admin', 'SalesManager'],
    DELETE_OPPORTUNITY: ['Admin', 'SalesManager'],
    DELETE_ACTIVITY: ['Admin', 'SalesManager'],
    DELETE_DOCUMENT: ['Admin', 'SalesManager'],
    VIEW_SALES_PERFORMANCE: ['Admin', 'SalesManager'],
    VIEW_REPORTS: ['Admin', 'SalesManager'],
    VIEW_PENDING_PRICING: ['Admin', 'SalesManager'],

    // ============ ADMIN, SALESMANAGER, & BDM ============
    DELETE_CONTACT: ['Admin', 'SalesManager', 'BusinessDevelopmentManager'],
    CREATE_OPPORTUNITY: ['Admin', 'SalesManager', 'BusinessDevelopmentManager'],
    MOVE_OPPORTUNITY: ['Admin', 'SalesManager', 'BusinessDevelopmentManager'],
    CREATE_PROPOSAL: ['Admin', 'SalesManager', 'BusinessDevelopmentManager'],
    CREATE_CONTRACT: ['Admin', 'SalesManager', 'BusinessDevelopmentManager'],
    CREATE_PRICING_REQUEST: ['Admin', 'SalesManager', 'BusinessDevelopmentManager'],
    CREATE_ACTIVITY: ['Admin', 'SalesManager', 'BusinessDevelopmentManager'],
    UPLOAD_DOCUMENT: ['Admin', 'SalesManager', 'BusinessDevelopmentManager'],

    // ============ ALL ROLES (can create basic data) ============
    CREATE_CLIENT: ['Admin', 'SalesManager', 'BusinessDevelopmentManager', 'SalesRep'],
    CREATE_CONTACT: ['Admin', 'SalesManager', 'BusinessDevelopmentManager', 'SalesRep'],
    UPDATE_OWN_OPPORTUNITY: ['Admin', 'SalesManager', 'BusinessDevelopmentManager', 'SalesRep'],
    CREATE_NOTE: ['Admin', 'SalesManager', 'BusinessDevelopmentManager', 'SalesRep'],
} as const;

export type PermissionType = keyof typeof PERMISSIONS;