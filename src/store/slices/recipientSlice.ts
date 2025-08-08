/**
 * Recipient Redux Slice
 * Manages recipient lists and recipients state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import recipientService from '../../services/recipientService';

// Async thunks for API calls
export const fetchRecipientLists = createAsyncThunk(
  'recipients/fetchRecipientLists',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await recipientService.getLists(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch recipient lists');
    }
  }
);

export const fetchRecipientList = createAsyncThunk(
  'recipients/fetchRecipientList',
  async ({ listId, params = {} }: any, { rejectWithValue }) => {
    try {
      const response = await recipientService.getList(listId, params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch recipient list');
    }
  }
);

export const createRecipientList = createAsyncThunk(
  'recipients/createRecipientList',
  async (listData: any, { rejectWithValue }) => {
    try {
      const response = await recipientService.createList(listData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create recipient list');
    }
  }
);

export const updateRecipientList = createAsyncThunk(
  'recipients/updateRecipientList',
  async ({ listId, listData }: any, { rejectWithValue }) => {
    try {
      const response = await recipientService.updateList(listId, listData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update recipient list');
    }
  }
);

export const deleteRecipientList = createAsyncThunk(
  'recipients/deleteRecipientList',
  async (listId: any, { rejectWithValue }) => {
    try {
      await recipientService.deleteList(listId);
      return listId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete recipient list');
    }
  }
);

export const addRecipient = createAsyncThunk(
  'recipients/addRecipient',
  async ({ listId, recipientData }: any, { rejectWithValue }) => {
    try {
      const response = await recipientService.addRecipient(listId, recipientData);
      return { listId, recipient: (response as any).recipient };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add recipient');
    }
  }
);

export const uploadRecipients = createAsyncThunk(
  'recipients/uploadRecipients',
  async ({ file, listId, listName, description }: any, { rejectWithValue }) => {
    try {
      const response = await recipientService.uploadRecipients(file, listId, listName, description);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to upload recipients');
    }
  }
);

export const exportRecipients = createAsyncThunk(
  'recipients/exportRecipients',
  async (listId: any, { rejectWithValue }) => {
    try {
      const response = await recipientService.exportRecipients(listId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to export recipients');
    }
  }
);

const initialState: any = {
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
    clearError: (state: any) => {
      state.error = null;
    },
    clearCurrentList: (state: any) => {
      state.currentList = null;
      state.recipients = [];
    },
    clearUploadResult: (state: any) => {
      state.uploadResult = null;
      state.uploadProgress = 0;
    },
    setUploadProgress: (state: any, action: any) => {
      state.uploadProgress = action.payload;
    },
    updateListRecipientCount: (state: any, action: any) => {
      const { listId, count } = action.payload;
      const list = state.lists.find((l: any) => l.id === listId);
      if (list) {
        list.recipient_count = count;
      }
      if (state.currentList && state.currentList.id === listId) {
        state.currentList.recipient_count = count;
      }
    },
  },
  extraReducers: (builder: any) => {
    builder
      // Fetch Recipient Lists
      .addCase(fetchRecipientLists.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipientLists.fulfilled, (state: any, action: any) => {
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
      .addCase(fetchRecipientLists.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Recipient List
      .addCase(fetchRecipientList.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipientList.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.currentList = action.payload.list;
        state.recipients = action.payload.recipients;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchRecipientList.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create Recipient List
      .addCase(createRecipientList.pending, (state: any) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createRecipientList.fulfilled, (state: any, action: any) => {
        state.isCreating = false;
        state.lists.unshift(action.payload.list);
        state.error = null;
      })
      .addCase(createRecipientList.rejected, (state: any, action: any) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      // Update Recipient List
      .addCase(updateRecipientList.pending, (state: any) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateRecipientList.fulfilled, (state: any, action: any) => {
        state.isUpdating = false;
        const index = state.lists.findIndex((l: any) => l.id === action.payload.list.id);
        if (index !== -1) {
          state.lists[index] = { ...state.lists[index], ...action.payload.list };
        }
        if (state.currentList && state.currentList.id === action.payload.list.id) {
          state.currentList = { ...state.currentList, ...action.payload.list };
        }
        state.error = null;
      })
      .addCase(updateRecipientList.rejected, (state: any, action: any) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Delete Recipient List
      .addCase(deleteRecipientList.pending, (state: any) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteRecipientList.fulfilled, (state: any, action: any) => {
        state.isDeleting = false;
        state.lists = state.lists.filter((l: any) => l.id !== action.payload);
        if (state.currentList && state.currentList.id === action.payload) {
          state.currentList = null;
          state.recipients = [];
        }
        state.error = null;
      })
      .addCase(deleteRecipientList.rejected, (state: any, action: any) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      
      // Add Recipient
      .addCase(addRecipient.pending, (state: any) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(addRecipient.fulfilled, (state: any, action: any) => {
        state.isCreating = false;
        const { listId, recipient } = action.payload;
        
        // Add to recipients if viewing the same list
        if (state.currentList && state.currentList.id === listId) {
          state.recipients.unshift(recipient);
          state.currentList.recipient_count += 1;
        }
        
        // Update list count
        const list = state.lists.find((l: any) => l.id === listId);
        if (list) {
          list.recipient_count += 1;
        }
        
        state.error = null;
      })
      .addCase(addRecipient.rejected, (state: any, action: any) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      // Upload Recipients
      .addCase(uploadRecipients.pending, (state: any) => {
        state.isUploading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadRecipients.fulfilled, (state: any, action: any) => {
        state.isUploading = false;
        state.uploadResult = action.payload;
        state.uploadProgress = 100;
        
        // Update or add list
        const existingListIndex = state.lists.findIndex((l: any) => l.id === action.payload.list_id);
        if (existingListIndex !== -1) {
          state.lists[existingListIndex].recipient_count = action.payload.successful;
        } else {
          // If new list was created, we might want to fetch lists again
          // For now, just clear the error
        }
        
        state.error = null;
      })
      .addCase(uploadRecipients.rejected, (state: any, action: any) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload;
      })
      
      // Export Recipients
      .addCase(exportRecipients.pending, (state: any) => {
        state.isExporting = true;
        state.error = null;
      })
      .addCase(exportRecipients.fulfilled, (state: any) => {
        state.isExporting = false;
        state.error = null;
      })
      .addCase(exportRecipients.rejected, (state: any, action: any) => {
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
export const selectRecipientLists = (state: any) => state.recipients.lists;
export const selectCurrentRecipientList = (state: any) => state.recipients.currentList;
export const selectRecipients = (state: any) => state.recipients.recipients;
export const selectRecipientPagination = (state: any) => state.recipients.pagination;
export const selectRecipientLoading = (state: any) => state.recipients.isLoading;
export const selectRecipientError = (state: any) => state.recipients.error;
export const selectUploadResult = (state: any) => state.recipients.uploadResult;
export const selectUploadProgress = (state: any) => state.recipients.uploadProgress;
export const selectIsUploading = (state: any) => state.recipients.isUploading;

export default recipientSlice.reducer;
