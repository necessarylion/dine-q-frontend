/**
 * API endpoint constants
 * Centralized endpoint definitions to avoid magic strings
 */

export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/user",
    verifyEmail: "/auth/verify-email",
    resendVerification: "/auth/resend-verification",
  },

  restaurants: {
    list: "/restaurants",
    create: "/restaurants",
    get: (id: number) => `/restaurants/${id}`,
    update: (id: number) => `/restaurants/${id}`,
    delete: (id: number) => `/restaurants/${id}`,
    guest: (id: number) => `/guest/restaurants/${id}`,
  },

  invitations: {
    list: "/invitations",
    accept: (token: string) => `/invitations/${token}/accept`,
  },

  members: {
    list: (restaurantId: number) => `/restaurants/${restaurantId}/members`,
    invite: (restaurantId: number) => `/restaurants/${restaurantId}/invitations`,
    remove: (restaurantId: number, memberId: number) =>
      `/restaurants/${restaurantId}/members/${memberId}`,
    updateRole: (restaurantId: number, memberId: number) =>
      `/restaurants/${restaurantId}/members/${memberId}/role`,
    acceptInvitation: (token: string) => `/invitations/${token}/accept`,
  },

  categories: {
    list: (restaurantId: number) => `/restaurants/${restaurantId}/categories`,
    create: (restaurantId: number) => `/restaurants/${restaurantId}/categories`,
    get: (restaurantId: number, categoryId: number) =>
      `/restaurants/${restaurantId}/categories/${categoryId}`,
    update: (restaurantId: number, categoryId: number) =>
      `/restaurants/${restaurantId}/categories/${categoryId}`,
    delete: (restaurantId: number, categoryId: number) =>
      `/restaurants/${restaurantId}/categories/${categoryId}`,
  },

  menuItems: {
    list: (restaurantId: number) => `/restaurants/${restaurantId}/menu-items`,
    guestList: (restaurantId: number) => `/guest/restaurants/${restaurantId}/menu-items`,
    guestAISearch: (restaurantId: number) => `/guest/restaurants/${restaurantId}/menu-items/ai-search`,
    create: (restaurantId: number) => `/restaurants/${restaurantId}/menu-items`,
    get: (restaurantId: number, itemId: number) =>
      `/restaurants/${restaurantId}/menu-items/${itemId}`,
    update: (restaurantId: number, itemId: number) =>
      `/restaurants/${restaurantId}/menu-items/${itemId}`,
    delete: (restaurantId: number, itemId: number) =>
      `/restaurants/${restaurantId}/menu-items/${itemId}`,
    generateDescription: (restaurantId: number) =>
      `/restaurants/${restaurantId}/menu-items/generate-description`,
  },

  zones: {
    list: (restaurantId: number) => `/restaurants/${restaurantId}/zones`,
    create: (restaurantId: number) => `/restaurants/${restaurantId}/zones`,
    get: (restaurantId: number, zoneId: number) =>
      `/restaurants/${restaurantId}/zones/${zoneId}`,
    update: (restaurantId: number, zoneId: number) =>
      `/restaurants/${restaurantId}/zones/${zoneId}`,
    delete: (restaurantId: number, zoneId: number) =>
      `/restaurants/${restaurantId}/zones/${zoneId}`,
  },

  tables: {
    list: (restaurantId: number) => `/restaurants/${restaurantId}/tables`,
    create: (restaurantId: number) => `/restaurants/${restaurantId}/tables`,
    get: (restaurantId: number, tableId: number) =>
      `/restaurants/${restaurantId}/tables/${tableId}`,
    update: (restaurantId: number, tableId: number) =>
      `/restaurants/${restaurantId}/tables/${tableId}`,
    delete: (restaurantId: number, tableId: number) =>
      `/restaurants/${restaurantId}/tables/${tableId}`,
    floorPlan: (restaurantId: number) =>
      `/restaurants/${restaurantId}/tables/floor-plan`,
    generateToken: (restaurantId: number, tableId: number) =>
      `/restaurants/${restaurantId}/tables/${tableId}/order-token`,
  },

  bookings: {
    list: (restaurantId: number) => `/restaurants/${restaurantId}/bookings`,
    create: (restaurantId: number) => `/restaurants/${restaurantId}/bookings`,
    get: (restaurantId: number, bookingId: number) =>
      `/restaurants/${restaurantId}/bookings/${bookingId}`,
    update: (restaurantId: number, bookingId: number) =>
      `/restaurants/${restaurantId}/bookings/${bookingId}`,
    delete: (restaurantId: number, bookingId: number) =>
      `/restaurants/${restaurantId}/bookings/${bookingId}`,
  },

  orders: {
    list: (restaurantId: number) => `/restaurants/${restaurantId}/orders`,
    create: (restaurantId: number) => `/restaurants/${restaurantId}/orders`,
    createGuest: (restaurantId: number) => `/guest/restaurants/${restaurantId}/orders`,
    get: (restaurantId: number, orderId: number) =>
      `/restaurants/${restaurantId}/orders/${orderId}`,
    update: (restaurantId: number, orderId: number) =>
      `/restaurants/${restaurantId}/orders/${orderId}`,
    delete: (restaurantId: number, orderId: number) =>
      `/restaurants/${restaurantId}/orders/${orderId}`,
    removeItem: (restaurantId: number, orderId: number, itemId: number) =>
      `/restaurants/${restaurantId}/orders/${orderId}/items/${itemId}`,
  },

  aiSettings: {
    list: (restaurantId: number) => `/restaurants/${restaurantId}/ai-settings`,
    create: (restaurantId: number) => `/restaurants/${restaurantId}/ai-settings`,
    get: (restaurantId: number, aiSettingId: number) =>
      `/restaurants/${restaurantId}/ai-settings/${aiSettingId}`,
    update: (restaurantId: number, aiSettingId: number) =>
      `/restaurants/${restaurantId}/ai-settings/${aiSettingId}`,
    delete: (restaurantId: number, aiSettingId: number) =>
      `/restaurants/${restaurantId}/ai-settings/${aiSettingId}`,
    models: (restaurantId: number, aiSettingId: number) =>
      `/restaurants/${restaurantId}/ai-settings/${aiSettingId}/models`,
  },

  dashboard: {
    get: (restaurantId: number) => `/restaurants/${restaurantId}/dashboard`,
    insights: (restaurantId: number) => `/restaurants/${restaurantId}/dashboard/insights`,
  },

  payments: {
    list: (restaurantId: number) => `/restaurants/${restaurantId}/payments`,
    create: (restaurantId: number) => `/restaurants/${restaurantId}/payments`,
    delete: (restaurantId: number, paymentId: number) =>
      `/restaurants/${restaurantId}/payments/${paymentId}`,
  },
} as const;
