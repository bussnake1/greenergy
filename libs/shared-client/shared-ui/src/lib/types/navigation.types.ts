export interface NavigationItem {
  label: string;
  to: string;
  icon?: string;
  children?: NavigationItem[];
  requiresAuth?: boolean;
  permissions?: string[];
}

export interface BreadcrumbItem {
  label: string;
  to?: string;
  icon?: string;
}

export interface NavigationState {
  collapsed: boolean;
  menuItems: NavigationItem[];
  breadcrumbs: BreadcrumbItem[];
}
