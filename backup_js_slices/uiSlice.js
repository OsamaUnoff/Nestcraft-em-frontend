/**
 * UI Redux Slice
 * Manages UI state like modals, notifications, loading states
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
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
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    
    // Modal actions
    openModal: (state, action) => {
      const modalName = action.payload;
      if (modalName in state.modals) {
        state.modals[modalName] = true;
      }
    },
    closeModal: (state, action) => {
      const modalName = action.payload;
      if (modalName in state.modals) {
        state.modals[modalName] = false;
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modal => {
        state.modals[modal] = false;
      });
    },
    
    // Notification actions
    addNotification: (state, action) => {
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
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Global loading
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    
    // Theme actions
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      localStorage.setItem('theme', newTheme);
    },
    
    // Page navigation
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    
    // Breadcrumbs
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
    addBreadcrumb: (state, action) => {
      state.breadcrumbs.push(action.payload);
    },
    
    // Search
    setGlobalSearch: (state, action) => {
      state.globalSearch = action.payload;
    },
    
    // Filters
    toggleFilters: (state) => {
      state.filtersOpen = !state.filtersOpen;
    },
    setFiltersOpen: (state, action) => {
      state.filtersOpen = action.payload;
    },
    
    // Mobile responsive
    setIsMobile: (state, action) => {
      state.isMobile = action.payload;
    },
    
    // Confirmation dialog
    openConfirmDialog: (state, action) => {
      state.confirmDialog = {
        ...state.confirmDialog,
        open: true,
        ...action.payload,
      };
    },
    closeConfirmDialog: (state) => {
      state.confirmDialog = {
        ...initialState.confirmDialog,
        open: false,
      };
    },
    
    // Utility actions
    showSuccessNotification: (state, action) => {
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
    
    showErrorNotification: (state, action) => {
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
    
    showWarningNotification: (state, action) => {
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
    
    showInfoNotification: (state, action) => {
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
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectModals = (state) => state.ui.modals;
export const selectNotifications = (state) => state.ui.notifications;
export const selectGlobalLoading = (state) => state.ui.globalLoading;
export const selectTheme = (state) => state.ui.theme;
export const selectCurrentPage = (state) => state.ui.currentPage;
export const selectBreadcrumbs = (state) => state.ui.breadcrumbs;
export const selectGlobalSearch = (state) => state.ui.globalSearch;
export const selectFiltersOpen = (state) => state.ui.filtersOpen;
export const selectIsMobile = (state) => state.ui.isMobile;
export const selectConfirmDialog = (state) => state.ui.confirmDialog;

export default uiSlice.reducer;
