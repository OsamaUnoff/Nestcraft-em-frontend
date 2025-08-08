/**
 * Recipient Redux Slice
 * Manages recipient lists and recipients state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import recipientService from '../../services/recipientService';

// Async thunks for API calls
export const fetchRecipientLists = createAsyncThunk(
  'recipients/fetchLists',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await recipientService.getLists(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch recipient lists');
    }
  }
);

export const fetchRecipientList = createAsyncThunk(
  'recipients/fetchList',
  async ({ listId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await recipientService.getList(listId, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch recipient list');
    }
  }
);

export const createRecipientList = createAsyncThunk(
  'recipients/createList',
  async (listData, { rejectWithValue }) => {
    try {
      const response = await recipientService.createList(listData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create recipient list');
    }
  }
);

export const updateRecipientList = createAsyncThunk(
  'recipients/updateList',
  async ({ listId, listData }, { rejectWithValue }) => {
    try {
      const response = await recipientService.updateList(listId, listData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update recipient list');
    }
  }
);

export const deleteRecipientList = createAsyncThunk(
  'recipients/deleteList',
  async (listId, { rejectWithValue }) => {
    try {
      await recipientService.deleteList(listId);
      return listId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete recipient list');
    }
  }
);

export const addRecipient = createAsyncThunk(
  'recipients/addRecipient',
  async ({ listId, recipientData }, { rejectWithValue }) => {
    try {
      const response = await recipientService.addRecipient(listId, recipientData);
      return { listId, recipient: response.recipient };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add recipient');
    }
  }
);

export const uploadRecipients = createAsyncThunk(
  'recipients/uploadRecipients',
  async ({ file, listId, listName, description }, { rejectWithValue }) => {
    try {
      const response = await recipientService.uploadRecipients(file, listId, listName, description);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to upload recipients');
    }
  }
);

export const exportRecipients = createAsyncThunk(
  'recipients/exportRecipients',
  async (listId, { rejectWithValue }) => {
    try {
      const response = await recipientService.exportRecipients(listId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to export recipients');
    }
  }
);

const initialState = {
  lists: [],
  currentList: null,
  recipients: [],
  pagination: {
    page: 1,
    pages: 1,
    per_page: 50,
    total: 0,
    has_next: false,
    has_prev: false,
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isUploading: false,
  isExporting: false,
  uploadProgress: 0,
  error: null,
  uploadResult: null,
};

const recipientSlice = createSlice({
  name: 'recipients',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentList: (state) => {
      state.currentList = null;
      state.recipients = [];
    },
    clearUploadResult: (state) => {
      state.uploadResult = null;
      state.uploadProgress = 0;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    updateListRecipientCount: (state, action) => {
      const { listId, count } = action.payload;
      const list = state.lists.find(l => l.id === listId);
      if (list) {
        list.recipient_count = count;
      }
      if (state.currentList && state.currentList.id === listId) {
        state.currentList.recipient_count = count;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Recipient Lists
      .addCase(fetchRecipientLists.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipientLists.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle nested API response structure
        if (action.payload && Array.isArray(action.payload.data)) {
          state.lists = action.payload.data;
          state.pagination = action.payload.pagination || { page: 1, pages: 1, total: 0, per_page: 10 };
        } else if (Array.isArray(action.payload.lists)) {
          state.lists = action.payload.lists;
          state.pagination = action.payload.pagination || { page: 1, pages: 1, total: 0, per_page: 10 };
        } else if (Array.isArray(action.payload)) {
          state.lists = action.payload;
          state.pagination = { page: 1, pages: 1, total: action.payload.length, per_page: 10 };
        } else {
          state.lists = [];
          state.pagination = { page: 1, pages: 1, total: 0, per_page: 10 };
        }
        state.error = null;
      })
      .addCase(fetchRecipientLists.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Recipient List
      .addCase(fetchRecipientList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipientList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentList = action.payload.list;
        state.recipients = action.payload.recipients;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchRecipientList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create Recipient List
      .addCase(createRecipientList.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createRecipientList.fulfilled, (state, action) => {
        state.isCreating = false;
        state.lists.unshift(action.payload.list);
        state.error = null;
      })
      .addCase(createRecipientList.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      // Update Recipient List
      .addCase(updateRecipientList.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateRecipientList.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.lists.findIndex(l => l.id === action.payload.list.id);
        if (index !== -1) {
          state.lists[index] = { ...state.lists[index], ...action.payload.list };
        }
        if (state.currentList && state.currentList.id === action.payload.list.id) {
          state.currentList = { ...state.currentList, ...action.payload.list };
        }
        state.error = null;
      })
      .addCase(updateRecipientList.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Delete Recipient List
      .addCase(deleteRecipientList.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteRecipientList.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.lists = state.lists.filter(l => l.id !== action.payload);
        if (state.currentList && state.currentList.id === action.payload) {
          state.currentList = null;
          state.recipients = [];
        }
        state.error = null;
      })
      .addCase(deleteRecipientList.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      
      // Add Recipient
      .addCase(addRecipient.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(addRecipient.fulfilled, (state, action) => {
        state.isCreating = false;
        const { listId, recipient } = action.payload;
        
        // Add to recipients if viewing the same list
        if (state.currentList && state.currentList.id === listId) {
          state.recipients.unshift(recipient);
          state.currentList.recipient_count += 1;
        }
        
        // Update list count
        const list = state.lists.find(l => l.id === listId);
        if (list) {
          list.recipient_count += 1;
        }
        
        state.error = null;
      })
      .addCase(addRecipient.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      // Upload Recipients
      .addCase(uploadRecipients.pending, (state) => {
        state.isUploading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadRecipients.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadResult = action.payload;
        state.uploadProgress = 100;
        
        // Update or add list
        const existingListIndex = state.lists.findIndex(l => l.id === action.payload.list_id);
        if (existingListIndex !== -1) {
          state.lists[existingListIndex].recipient_count = action.payload.successful;
        } else {
          // If new list was created, we might want to fetch lists again
          // For now, just clear the error
        }
        
        state.error = null;
      })
      .addCase(uploadRecipients.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload;
      })
      
      // Export Recipients
      .addCase(exportRecipients.pending, (state) => {
        state.isExporting = true;
        state.error = null;
      })
      .addCase(exportRecipients.fulfilled, (state) => {
        state.isExporting = false;
        state.error = null;
      })
      .addCase(exportRecipients.rejected, (state, action) => {
        state.isExporting = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearCurrentList, 
  clearUploadResult, 
  setUploadProgress,
  updateListRecipientCount 
} = recipientSlice.actions;

// Selectors
export const selectRecipientLists = (state) => state.recipients.lists;
export const selectCurrentRecipientList = (state) => state.recipients.currentList;
export const selectRecipients = (state) => state.recipients.recipients;
export const selectRecipientPagination = (state) => state.recipients.pagination;
export const selectRecipientLoading = (state) => state.recipients.isLoading;
export const selectRecipientError = (state) => state.recipients.error;
export const selectUploadResult = (state) => state.recipients.uploadResult;
export const selectUploadProgress = (state) => state.recipients.uploadProgress;
export const selectIsUploading = (state) => state.recipients.isUploading;

export default recipientSlice.reducer;
