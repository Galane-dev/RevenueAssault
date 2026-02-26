// types/auth.ts
export type UserRole = 'Admin' | 'SalesManager' | 'BusinessDevelopmentManager' | 'SalesRep';

export const PERMISSIONS = {
  DELETE_CLIENT: ['Admin', 'SalesManager'],
  APPROVE_PROPOSAL: ['Admin', 'SalesManager'],
  ASSIGN_OPPORTUNITY: ['Admin', 'SalesManager'],
  ACTIVATE_CONTRACT: ['Admin', 'SalesManager'],
  VIEW_SALES_PERFORMANCE: ['Admin', 'SalesManager'],
  VIEW_REPORTS: ['Admin', 'SalesManager'],
  DELETE_CONTACT: ['Admin', 'SalesManager', 'BusinessDevelopmentManager'],
  MANAGE_PROPOSALS: ['Admin', 'SalesManager', 'BusinessDevelopmentManager'],
  VIEW_OWN_ONLY: ['SalesRep'],
} as const;