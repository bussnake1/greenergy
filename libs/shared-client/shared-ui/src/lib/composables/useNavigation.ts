import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import type { NavigationItem, BreadcrumbItem } from '../types/navigation.types';

export function useNavigation(defaultItems: NavigationItem[] = []) {
  const collapsed = ref(false);
  const menuItems = ref<NavigationItem[]>(defaultItems);
  const route = useRoute();

  const toggleCollapsed = () => {
    collapsed.value = !collapsed.value;
  };

  const isActive = (path: string) => {
    // Handle dashboard root path special case
    if (path === '/dashboard') {
      return route.path === '/dashboard';
    }
    
    // For other paths, ensure exact match or proper child route
    return route.path === path || 
           (path !== '/' && route.path.startsWith(`${path}/`));
  };

  const currentBreadcrumbs = computed<BreadcrumbItem[]>(() => {
    // Safety check to ensure route is available
    if (!route || !route.path) {
      return [];
    }
    
    try {
      const paths = route.path.split('/').filter(Boolean);
      const breadcrumbs: BreadcrumbItem[] = [];
      
      // Add home breadcrumb only if we're not in the dashboard
      if (!route.path.startsWith('/dashboard')) {
        breadcrumbs.push({ 
          label: 'Home', 
          to: '/', 
          icon: 'i-heroicons-home' 
        });
      } else {
        // For dashboard routes, start with Dashboard as the root
        breadcrumbs.push({ 
          label: 'Dashboard', 
          to: '/dashboard', 
          icon: 'i-heroicons-squares-2x2' 
        });
      }

      let currentPath = route.path.startsWith('/dashboard') ? '/dashboard' : '';
      
      // Skip the first path segment if it's 'dashboard' since we already added it
      const pathsToProcess = route.path.startsWith('/dashboard') 
        ? paths.slice(1) 
        : paths;

      pathsToProcess.forEach((path) => {
        currentPath += `/${path}`;
        
        // Try to find a matching menu item for better labels
        const matchingItem = findMenuItemByPath(menuItems.value, currentPath);
        
        breadcrumbs.push({
          label: matchingItem?.label || path.charAt(0).toUpperCase() + path.slice(1),
          to: currentPath
        });
      });

      return breadcrumbs;
    } catch (error) {
      console.error('Error generating breadcrumbs:', error);
      return [];
    }
  });

  // Helper function to find a menu item by path
  const findMenuItemByPath = (items: NavigationItem[], path: string): NavigationItem | undefined => {
    for (const item of items) {
      if (item.to === path) {
        return item;
      }
      
      if (item.children?.length) {
        const found = findMenuItemByPath(item.children, path);
        if (found) {
          return found;
        }
      }
    }
    
    return undefined;
  };

  return {
    collapsed,
    menuItems,
    toggleCollapsed,
    isActive,
    currentBreadcrumbs,
    setMenuItems: (items: NavigationItem[]) => {
      menuItems.value = items;
    }
  };
}
