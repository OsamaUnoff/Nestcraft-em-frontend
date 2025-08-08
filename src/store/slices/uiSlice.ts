/**
 * UI Redux Slice
 * Manages UI state like modals, notifications, loading states
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState: any = {
  // Sidebar state
  sidebarOpen: true,
  sidebarCollapsed: false,
  
  // Modal states
  modals: {
    createCampaign: false,
    editCampaign: false,
    createSMTPAccount: false,
    editSMTPAccount: false,
    createRecipientList: false,
    editRecipientList: false,
    uploadRecipients: false,
    createTemplate: false,
    editTemplate: false,
    confirmDelete: false,
    userProfile: false,
  },
  
  // Notification system
  notifications: [],
  
  // Loading states for global operations
  globalLoading: false,
  
  // Theme
  theme: localStorage.getItem('theme') || 'light',
  
  // Current page/section
  currentPage: 'dashboard',
  
  // Breadcrumbs
  breadcrumbs: [],
  
  // Search states
  globalSearch: '',
  
  // Filters panel
  filtersOpen: false,
  
  // Mobile responsive
  isMobile: false,
  
  // Confirmation dialog
  confirmDialog: {
    open: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'default', // 'default', 'danger', 'warning'
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar actions
    toggleSidebar: (state: any) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state: any, action: any) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarCollapsed: (state: any) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state: any, action: any) => {
      state.sidebarCollapsed = action.payload;
    },
    
    // Modal actions
    openModal: (state: any, action: any) => {
      const modalName = action.payload;
      if (modalName in state.modals) {
        state.modals[modalName] = true;
      }
    },
    closeModal: (state: any, action: any) => {
      const modalName = action.payload;
      if (modalName in state.modals) {
        state.modals[modalName] = false;
      }
    },
    closeAllModals: (state: any) => {
      Object.keys(state.modals).forEach((modal: any) => {
        state.modals[modal] = false;
      });
    },
    
    // Notification actions
    addNotification: (state: any, action: any) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        ...action.payload,
      };
      state.notifications.unshift(notification);
      
      // Limit to 10 notifications
      if (state.notifications.length > 10) {
        state.notifications = state.notifications.slice(0, 10);
      }
    },
    removeNotification: (state: any, action: any) => {
      state.notifications = state.notifications.filter(
        (notification: any) => notification.id !== action.payload
      );
    },
    clearNotifications: (state: any) => {
      state.notifications = [];
    },
    
    // Global loading
    setGlobalLoading: (state: any, action: any) => {
      state.globalLoading = action.payload;
    },
    
    // Theme actions
    setTheme: (state: any, action: any) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme: (state: any) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      localStorage.setItem('theme', newTheme);
    },
    
    // Page navigation
    setCurrentPage: (state: any, action: any) => {
      state.currentPage = action.payload;
    },
    
    // Breadcrumbs
    setBreadcrumbs: (state: any, action: any) => {
      state.breadcrumbs = action.payload;
    },
    addBreadcrumb: (state: any, action: any) => {
      state.breadcrumbs.push(action.payload);
    },
    
    // Search
    setGlobalSearch: (state: any, action: any) => {
      state.globalSearch = action.payload;
    },
    
    // Filters
    toggleFilters: (state: any) => {
      state.filtersOpen = !state.filtersOpen;
    },
    setFiltersOpen: (state: any, action: any) => {
      state.filtersOpen = action.payload;
    },
    
    // Mobile responsive
    setIsMobile: (state: any, action: any) => {
      state.isMobile = action.payload;
    },
    
    // Confirmation dialog
    openConfirmDialog: (state: any, action: any) => {
      state.confirmDialog = {
        ...state.confirmDialog,
        open: true,
        ...action.payload,
      };
    },
    closeConfirmDialog: (state: any) => {
      state.confirmDialog = {
        ...initialState.confirmDialog,
        open: false,
      };
    },
    
    // Utility actions
    showSuccessNotification: (state: any, action: any) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: 'success',
        title: 'Success',
        message: action.payload,
        timestamp: Date.now(),
        autoHide: true,
        duration: 5000,
      };
      state.notifications.unshift(notification);
    },
    
    showErrorNotification: (state: any, action: any) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: 'error',
        title: 'Error',
        message: action.payload,
        timestamp: Date.now(),
        autoHide: true,
        duration: 8000,
      };
      state.notifications.unshift(notification);
    },
    
    showWarningNotification: (state: any, action: any) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: 'warning',
        title: 'Warning',
        message: action.payload,
        timestamp: Date.now(),
        autoHide: true,
        duration: 6000,
      };
      state.notifications.unshift(notification);
    },
    
    showInfoNotification: (state: any, action: any) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: 'info',
        title: 'Info',
        message: action.payload,
        timestamp: Date.now(),
        autoHide: true,
        duration: 5000,
      };
      state.notifications.unshift(notification);
    },
  },
});

export const {
  // Sidebar
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  
  // Modals
  openModal,
  closeModal,
  closeAllModals,
  
  // Notifications
  addNotification,
  removeNotification,
  clearNotifications,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
  
  // Global loading
  setGlobalLoading,
  
  // Theme
  setTheme,
  toggleTheme,
  
  // Navigation
  setCurrentPage,
  setBreadcrumbs,
  addBreadcrumb,
  
  // Search
  setGlobalSearch,
  
  // Filters
  toggleFilters,
  setFiltersOpen,
  
  // Mobile
  setIsMobile,
  
  // Confirmation dialog
  openConfirmDialog,
  closeConfirmDialog,
} = uiSlice.actions;

// Selectors
export const selectSidebarOpen = (state: any) => state.ui.sidebarOpen;
export const selectSidebarCollapsed = (state: any) => state.ui.sidebarCollapsed;
export const selectModals = (state: any) => state.ui.modals;
export const selectNotifications = (state: any) => state.ui.notifications;
export const selectGlobalLoading = (state: any) => state.ui.globalLoading;
export const selectTheme = (state: any) => state.ui.theme;
export const selectCurrentPage = (state: any) => state.ui.currentPage;
export const selectBreadcrumbs = (state: any) => state.ui.breadcrumbs;
export const selectGlobalSearch = (state: any) => state.ui.globalSearch;
export const selectFiltersOpen = (state: any) => state.ui.filtersOpen;
export const selectIsMobile = (state: any) => state.ui.isMobile;
export const selectConfirmDialog = (state: any) => state.ui.confirmDialog;

export default uiSlice.reducer;
