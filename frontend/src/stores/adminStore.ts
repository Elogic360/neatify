/**
 * Admin Store - Zustand store for admin state management
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  dashboardAPI,
  productsAdminAPI,
  ordersAdminAPI,
  usersAdminAPI,
  categoriesAdminAPI,
  type AdminStats,
  type SalesData,
  type TopProduct,
  type CategorySales,
  type AdminProduct,
  type AdminOrder,
  type AdminUser,
  type AdminCategory,
  type ProductFilters,
  type OrderFilters,
  type UserFilters,
} from '@/services/adminService';

// =============================================================================
// TYPES
// =============================================================================

interface DashboardState {
  stats: AdminStats | null;
  salesData: SalesData[];
  topProducts: TopProduct[];
  categorySales: CategorySales[];
  recentOrders: AdminOrder[];
  lowStockProducts: AdminProduct[];
  isLoading: boolean;
  error: string | null;
}

interface ProductsState {
  items: AdminProduct[];
  selected: AdminProduct | null;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: ProductFilters;
  selectedIds: number[];
  isLoading: boolean;
  error: string | null;
}

interface OrdersState {
  items: AdminOrder[];
  selected: AdminOrder | null;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: OrderFilters;
  isLoading: boolean;
  error: string | null;
}

interface UsersState {
  items: AdminUser[];
  selected: AdminUser | null;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: UserFilters;
  isLoading: boolean;
  error: string | null;
}

interface CategoriesState {
  items: AdminCategory[];
  isLoading: boolean;
  error: string | null;
}

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  confirmDialog: {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm?: () => void;
    onCancel?: () => void;
  };
  toast: {
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  };
}

interface AdminStore {
  // Dashboard
  dashboard: DashboardState;
  fetchDashboardStats: () => Promise<void>;
  fetchSalesData: (period?: 'daily' | 'weekly' | 'monthly', days?: number) => Promise<void>;
  fetchDashboardData: () => Promise<void>;

  // Products
  products: ProductsState;
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchProduct: (id: number) => Promise<void>;
  createProduct: (data: Partial<AdminProduct>) => Promise<AdminProduct>;
  updateProduct: (id: number, data: Partial<AdminProduct>) => Promise<AdminProduct>;
  deleteProduct: (id: number) => Promise<void>;
  bulkDeleteProducts: (ids: number[]) => Promise<void>;
  bulkUpdateProducts: (ids: number[], data: Partial<AdminProduct>) => Promise<void>;
  setProductFilters: (filters: Partial<ProductFilters>) => void;
  setSelectedProductIds: (ids: number[]) => void;
  toggleProductSelection: (id: number) => void;
  clearProductSelection: () => void;

  // Orders
  orders: OrdersState;
  fetchOrders: (filters?: OrderFilters) => Promise<void>;
  fetchOrder: (id: number) => Promise<void>;
  updateOrderStatus: (id: number, status: string, notes?: string) => Promise<void>;
  updatePaymentStatus: (id: number, status: string) => Promise<void>;
  cancelOrder: (id: number, reason?: string) => Promise<void>;
  setOrderFilters: (filters: Partial<OrderFilters>) => void;

  // Users
  users: UsersState;
  fetchUsers: (filters?: UserFilters) => Promise<void>;
  fetchUser: (id: number) => Promise<void>;
  updateUser: (id: number, data: Partial<AdminUser>) => Promise<void>;
  updateUserRole: (id: number, role: string) => Promise<void>;
  activateUser: (id: number) => Promise<void>;
  deactivateUser: (id: number) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  setUserFilters: (filters: Partial<UserFilters>) => void;

  // Categories
  categories: CategoriesState;
  fetchCategories: () => Promise<void>;
  createCategory: (data: Partial<AdminCategory>) => Promise<AdminCategory>;
  updateCategory: (id: number, data: Partial<AdminCategory>) => Promise<AdminCategory>;
  deleteCategory: (id: number) => Promise<void>;

  // UI
  ui: UIState;
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  setSidebarOpen: (open: boolean) => void;
  showConfirmDialog: (options: Omit<UIState['confirmDialog'], 'open'>) => void;
  hideConfirmDialog: () => void;
  showToast: (message: string, type?: UIState['toast']['type']) => void;
  hideToast: () => void;

  // Reset
  resetStore: () => void;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialDashboardState: DashboardState = {
  stats: null,
  salesData: [],
  topProducts: [],
  categorySales: [],
  recentOrders: [],
  lowStockProducts: [],
  isLoading: false,
  error: null,
};

const initialProductsState: ProductsState = {
  items: [],
  selected: null,
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
  filters: {},
  selectedIds: [],
  isLoading: false,
  error: null,
};

const initialOrdersState: OrdersState = {
  items: [],
  selected: null,
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
  filters: {},
  isLoading: false,
  error: null,
};

const initialUsersState: UsersState = {
  items: [],
  selected: null,
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
  filters: {},
  isLoading: false,
  error: null,
};

const initialCategoriesState: CategoriesState = {
  items: [],
  isLoading: false,
  error: null,
};

const initialUIState: UIState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  confirmDialog: {
    open: false,
    title: '',
    message: '',
  },
  toast: {
    open: false,
    message: '',
    type: 'info',
  },
};

// =============================================================================
// STORE
// =============================================================================

export const useAdminStore = create<AdminStore>()(
  devtools(
    (set, get) => ({
      // =========================================================================
      // DASHBOARD
      // =========================================================================
      dashboard: initialDashboardState,

      fetchDashboardStats: async () => {
        set((state) => ({
          dashboard: { ...state.dashboard, isLoading: true, error: null },
        }));

        try {
          const stats = await dashboardAPI.getStats();
          set((state) => ({
            dashboard: { ...state.dashboard, stats, isLoading: false },
          }));
        } catch (error: any) {
          set((state) => ({
            dashboard: {
              ...state.dashboard,
              isLoading: false,
              error: error.message || 'Failed to fetch dashboard stats',
            },
          }));
        }
      },

      fetchSalesData: async (period = 'daily', days = 30) => {
        try {
          const salesData = await dashboardAPI.getSalesData(period, days);
          set((state) => ({
            dashboard: { ...state.dashboard, salesData },
          }));
        } catch (error: any) {
          console.error('Failed to fetch sales data:', error);
        }
      },

      fetchDashboardData: async () => {
        set((state) => ({
          dashboard: { ...state.dashboard, isLoading: true, error: null },
        }));

        try {
          const [stats, salesData, topProducts, categorySales, recentOrders, lowStockProducts] =
            await Promise.all([
              dashboardAPI.getStats(),
              dashboardAPI.getSalesData('daily', 30),
              dashboardAPI.getTopProducts(5),
              dashboardAPI.getCategorySales(),
              dashboardAPI.getRecentOrders(5),
              dashboardAPI.getLowStockProducts(5),
            ]);

          set((state) => ({
            dashboard: {
              ...state.dashboard,
              stats,
              salesData,
              topProducts,
              categorySales,
              recentOrders,
              lowStockProducts,
              isLoading: false,
            },
          }));
        } catch (error: any) {
          set((state) => ({
            dashboard: {
              ...state.dashboard,
              isLoading: false,
              error: error.message || 'Failed to fetch dashboard data',
            },
          }));
        }
      },

      // =========================================================================
      // PRODUCTS
      // =========================================================================
      products: initialProductsState,

      fetchProducts: async (filters?: ProductFilters) => {
        const currentFilters = filters || get().products.filters;
        set((state) => ({
          products: { ...state.products, isLoading: true, error: null, filters: currentFilters },
        }));

        try {
          const response = await productsAdminAPI.getAll(currentFilters);
          set((state) => ({
            products: {
              ...state.products,
              items: response.items,
              total: response.total,
              page: response.page,
              pageSize: response.page_size,
              totalPages: response.total_pages,
              isLoading: false,
            },
          }));
        } catch (error: any) {
          set((state) => ({
            products: {
              ...state.products,
              isLoading: false,
              error: error.message || 'Failed to fetch products',
            },
          }));
        }
      },

      fetchProduct: async (id: number) => {
        set((state) => ({
          products: { ...state.products, isLoading: true, error: null },
        }));

        try {
          const product = await productsAdminAPI.getById(id);
          set((state) => ({
            products: { ...state.products, selected: product, isLoading: false },
          }));
        } catch (error: any) {
          set((state) => ({
            products: {
              ...state.products,
              isLoading: false,
              error: error.message || 'Failed to fetch product',
            },
          }));
        }
      },

      createProduct: async (data: Partial<AdminProduct>) => {
        const product = await productsAdminAPI.create(data);
        get().fetchProducts();
        get().showToast('Product created successfully', 'success');
        return product;
      },

      updateProduct: async (id: number, data: Partial<AdminProduct>) => {
        const product = await productsAdminAPI.update(id, data);
        set((state) => ({
          products: {
            ...state.products,
            items: state.products.items.map((p) => (p.id === id ? product : p)),
            selected: state.products.selected?.id === id ? product : state.products.selected,
          },
        }));
        get().showToast('Product updated successfully', 'success');
        return product;
      },

      deleteProduct: async (id: number) => {
        await productsAdminAPI.delete(id);
        set((state) => ({
          products: {
            ...state.products,
            items: state.products.items.filter((p) => p.id !== id),
            selectedIds: state.products.selectedIds.filter((i) => i !== id),
          },
        }));
        get().showToast('Product deleted successfully', 'success');
      },

      bulkDeleteProducts: async (ids: number[]) => {
        await productsAdminAPI.bulkDelete(ids);
        set((state) => ({
          products: {
            ...state.products,
            items: state.products.items.filter((p) => !ids.includes(p.id)),
            selectedIds: [],
          },
        }));
        get().showToast(`${ids.length} products deleted successfully`, 'success');
      },

      bulkUpdateProducts: async (ids: number[], data: Partial<AdminProduct>) => {
        await productsAdminAPI.bulkUpdate(ids, data);
        get().fetchProducts();
        get().showToast(`${ids.length} products updated successfully`, 'success');
      },

      setProductFilters: (filters: Partial<ProductFilters>) => {
        set((state) => ({
          products: {
            ...state.products,
            filters: { ...state.products.filters, ...filters },
          },
        }));
      },

      setSelectedProductIds: (ids: number[]) => {
        set((state) => ({
          products: { ...state.products, selectedIds: ids },
        }));
      },

      toggleProductSelection: (id: number) => {
        set((state) => ({
          products: {
            ...state.products,
            selectedIds: state.products.selectedIds.includes(id)
              ? state.products.selectedIds.filter((i) => i !== id)
              : [...state.products.selectedIds, id],
          },
        }));
      },

      clearProductSelection: () => {
        set((state) => ({
          products: { ...state.products, selectedIds: [] },
        }));
      },

      // =========================================================================
      // ORDERS
      // =========================================================================
      orders: initialOrdersState,

      fetchOrders: async (filters?: OrderFilters) => {
        const currentFilters = filters || get().orders.filters;
        set((state) => ({
          orders: { ...state.orders, isLoading: true, error: null, filters: currentFilters },
        }));

        try {
          const response = await ordersAdminAPI.getAll(currentFilters);
          set((state) => ({
            orders: {
              ...state.orders,
              items: response.items,
              total: response.total,
              page: response.page,
              pageSize: response.page_size,
              totalPages: response.total_pages,
              isLoading: false,
            },
          }));
        } catch (error: any) {
          set((state) => ({
            orders: {
              ...state.orders,
              isLoading: false,
              error: error.message || 'Failed to fetch orders',
            },
          }));
        }
      },

      fetchOrder: async (id: number) => {
        set((state) => ({
          orders: { ...state.orders, isLoading: true, error: null },
        }));

        try {
          const order = await ordersAdminAPI.getById(id);
          set((state) => ({
            orders: { ...state.orders, selected: order, isLoading: false },
          }));
        } catch (error: any) {
          set((state) => ({
            orders: {
              ...state.orders,
              isLoading: false,
              error: error.message || 'Failed to fetch order',
            },
          }));
        }
      },

      updateOrderStatus: async (id: number, status: string, notes?: string) => {
        const order = await ordersAdminAPI.updateStatus(id, status, notes);
        set((state) => ({
          orders: {
            ...state.orders,
            items: state.orders.items.map((o) => (o.id === id ? order : o)),
            selected: state.orders.selected?.id === id ? order : state.orders.selected,
          },
        }));
        get().showToast('Order status updated', 'success');
      },

      updatePaymentStatus: async (id: number, status: string) => {
        const order = await ordersAdminAPI.updatePaymentStatus(id, status);
        set((state) => ({
          orders: {
            ...state.orders,
            items: state.orders.items.map((o) => (o.id === id ? order : o)),
            selected: state.orders.selected?.id === id ? order : state.orders.selected,
          },
        }));
        get().showToast('Payment status updated', 'success');
      },

      cancelOrder: async (id: number, reason?: string) => {
        const order = await ordersAdminAPI.cancel(id, reason);
        set((state) => ({
          orders: {
            ...state.orders,
            items: state.orders.items.map((o) => (o.id === id ? order : o)),
            selected: state.orders.selected?.id === id ? order : state.orders.selected,
          },
        }));
        get().showToast('Order cancelled', 'success');
      },

      setOrderFilters: (filters: Partial<OrderFilters>) => {
        set((state) => ({
          orders: {
            ...state.orders,
            filters: { ...state.orders.filters, ...filters },
          },
        }));
      },

      // =========================================================================
      // USERS
      // =========================================================================
      users: initialUsersState,

      fetchUsers: async (filters?: UserFilters) => {
        const currentFilters = filters || get().users.filters;
        set((state) => ({
          users: { ...state.users, isLoading: true, error: null, filters: currentFilters },
        }));

        try {
          const response = await usersAdminAPI.getAll(currentFilters);
          set((state) => ({
            users: {
              ...state.users,
              items: response.items,
              total: response.total,
              page: response.page,
              pageSize: response.page_size,
              totalPages: response.total_pages,
              isLoading: false,
            },
          }));
        } catch (error: any) {
          set((state) => ({
            users: {
              ...state.users,
              isLoading: false,
              error: error.message || 'Failed to fetch users',
            },
          }));
        }
      },

      fetchUser: async (id: number) => {
        set((state) => ({
          users: { ...state.users, isLoading: true, error: null },
        }));

        try {
          const user = await usersAdminAPI.getById(id);
          set((state) => ({
            users: { ...state.users, selected: user, isLoading: false },
          }));
        } catch (error: any) {
          set((state) => ({
            users: {
              ...state.users,
              isLoading: false,
              error: error.message || 'Failed to fetch user',
            },
          }));
        }
      },

      updateUser: async (id: number, data: Partial<AdminUser>) => {
        const user = await usersAdminAPI.update(id, data);
        set((state) => ({
          users: {
            ...state.users,
            items: state.users.items.map((u) => (u.id === id ? user : u)),
            selected: state.users.selected?.id === id ? user : state.users.selected,
          },
        }));
        get().showToast('User updated successfully', 'success');
      },

      updateUserRole: async (id: number, role: string) => {
        const user = await usersAdminAPI.updateRole(id, role);
        set((state) => ({
          users: {
            ...state.users,
            items: state.users.items.map((u) => (u.id === id ? user : u)),
            selected: state.users.selected?.id === id ? user : state.users.selected,
          },
        }));
        get().showToast('User role updated', 'success');
      },

      activateUser: async (id: number) => {
        const user = await usersAdminAPI.activate(id);
        set((state) => ({
          users: {
            ...state.users,
            items: state.users.items.map((u) => (u.id === id ? user : u)),
            selected: state.users.selected?.id === id ? user : state.users.selected,
          },
        }));
        get().showToast('User activated', 'success');
      },

      deactivateUser: async (id: number) => {
        const user = await usersAdminAPI.deactivate(id);
        set((state) => ({
          users: {
            ...state.users,
            items: state.users.items.map((u) => (u.id === id ? user : u)),
            selected: state.users.selected?.id === id ? user : state.users.selected,
          },
        }));
        get().showToast('User deactivated', 'success');
      },

      deleteUser: async (id: number) => {
        await usersAdminAPI.delete(id);
        set((state) => ({
          users: {
            ...state.users,
            items: state.users.items.filter((u) => u.id !== id),
          },
        }));
        get().showToast('User deleted', 'success');
      },

      setUserFilters: (filters: Partial<UserFilters>) => {
        set((state) => ({
          users: {
            ...state.users,
            filters: { ...state.users.filters, ...filters },
          },
        }));
      },

      // =========================================================================
      // CATEGORIES
      // =========================================================================
      categories: initialCategoriesState,

      fetchCategories: async () => {
        set((state) => ({
          categories: { ...state.categories, isLoading: true, error: null },
        }));

        try {
          const items = await categoriesAdminAPI.getAll();
          set((state) => ({
            categories: { ...state.categories, items, isLoading: false },
          }));
        } catch (error: any) {
          set((state) => ({
            categories: {
              ...state.categories,
              isLoading: false,
              error: error.message || 'Failed to fetch categories',
            },
          }));
        }
      },

      createCategory: async (data: Partial<AdminCategory>) => {
        const category = await categoriesAdminAPI.create(data);
        set((state) => ({
          categories: {
            ...state.categories,
            items: [...state.categories.items, category],
          },
        }));
        get().showToast('Category created successfully', 'success');
        return category;
      },

      updateCategory: async (id: number, data: Partial<AdminCategory>) => {
        const category = await categoriesAdminAPI.update(id, data);
        set((state) => ({
          categories: {
            ...state.categories,
            items: state.categories.items.map((c) => (c.id === id ? category : c)),
          },
        }));
        get().showToast('Category updated successfully', 'success');
        return category;
      },

      deleteCategory: async (id: number) => {
        await categoriesAdminAPI.delete(id);
        set((state) => ({
          categories: {
            ...state.categories,
            items: state.categories.items.filter((c) => c.id !== id),
          },
        }));
        get().showToast('Category deleted', 'success');
      },

      // =========================================================================
      // UI
      // =========================================================================
      ui: initialUIState,

      toggleSidebar: () => {
        set((state) => ({
          ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen },
        }));
      },

      toggleSidebarCollapse: () => {
        set((state) => ({
          ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed },
        }));
      },

      setSidebarOpen: (open: boolean) => {
        set((state) => ({
          ui: { ...state.ui, sidebarOpen: open },
        }));
      },

      showConfirmDialog: (options) => {
        set((state) => ({
          ui: {
            ...state.ui,
            confirmDialog: { ...options, open: true },
          },
        }));
      },

      hideConfirmDialog: () => {
        set((state) => ({
          ui: {
            ...state.ui,
            confirmDialog: { ...state.ui.confirmDialog, open: false },
          },
        }));
      },

      showToast: (message: string, type: UIState['toast']['type'] = 'info') => {
        set((state) => ({
          ui: {
            ...state.ui,
            toast: { open: true, message, type },
          },
        }));

        // Auto-hide after 5 seconds
        setTimeout(() => {
          get().hideToast();
        }, 5000);
      },

      hideToast: () => {
        set((state) => ({
          ui: {
            ...state.ui,
            toast: { ...state.ui.toast, open: false },
          },
        }));
      },

      // =========================================================================
      // RESET
      // =========================================================================
      resetStore: () => {
        set({
          dashboard: initialDashboardState,
          products: initialProductsState,
          orders: initialOrdersState,
          users: initialUsersState,
          categories: initialCategoriesState,
          ui: initialUIState,
        });
      },
    }),
    { name: 'admin-store' }
  )
);

export default useAdminStore;
