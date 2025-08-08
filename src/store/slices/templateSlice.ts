/**
 * Template Redux Slice
 * Manages email template state and actions
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import templateService from '../../services/templateService';

// Async thunks for API calls
export const fetchTemplates = createAsyncThunk(
  'templates/fetchTemplates',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await templateService.getTemplates(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch templates');
    }
  }
);

export const fetchTemplate = createAsyncThunk(
  'templates/fetchTemplate',
  async (templateId: any, { rejectWithValue }) => {
    try {
      const response = await templateService.getTemplate(templateId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch template');
    }
  }
);

export const createTemplate = createAsyncThunk(
  'templates/createTemplate',
  async (templateData: any, { rejectWithValue }) => {
    try {
      const response = await templateService.createTemplate(templateData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create template');
    }
  }
);

export const updateTemplate = createAsyncThunk(
  'templates/updateTemplate',
  async ({ templateId, templateData }: any, { rejectWithValue }) => {
    try {
      const response = await templateService.updateTemplate(templateId, templateData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update template');
    }
  }
);

export const deleteTemplate = createAsyncThunk(
  'templates/deleteTemplate',
  async (templateId: any, { rejectWithValue }) => {
    try {
      await templateService.deleteTemplate(templateId);
      return templateId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete template');
    }
  }
);

export const duplicateTemplate = createAsyncThunk(
  'templates/duplicateTemplate',
  async (templateId: any, { rejectWithValue }) => {
    try {
      const response = await templateService.duplicateTemplate(templateId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to duplicate template');
    }
  }
);

export const fetchDefaultTemplates = createAsyncThunk(
  'templates/fetchDefaultTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await templateService.getDefaultTemplates();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch default templates');
    }
  }
);

const initialState: any = {
  templates: [],
  defaultTemplates: [],
  currentTemplate: null,
  pagination: {
    page: 1,
    pages: 1,
    per_page: 10,
    total: 0,
    has_next: false,
    has_prev: false,
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isDuplicating: false,
  error: null,
  filters: {
    search: '',
    is_active: null,
  },
};

const templateSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    clearError: (state: any) => {
      state.error = null;
    },
    setFilters: (state: any, action: any) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentTemplate: (state: any) => {
      state.currentTemplate = null;
    },
    setCurrentTemplate: (state: any, action: any) => {
      state.currentTemplate = action.payload;
    },
  },
  extraReducers: (builder: any) => {
    builder
      // Fetch Templates
      .addCase(fetchTemplates.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.templates = action.payload.templates;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchTemplates.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Template
      .addCase(fetchTemplate.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTemplate.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.currentTemplate = action.payload.template;
        state.error = null;
      })
      .addCase(fetchTemplate.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create Template
      .addCase(createTemplate.pending, (state: any) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createTemplate.fulfilled, (state: any, action: any) => {
        state.isCreating = false;
        state.templates.unshift(action.payload.template);
        state.error = null;
      })
      .addCase(createTemplate.rejected, (state: any, action: any) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      // Update Template
      .addCase(updateTemplate.pending, (state: any) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateTemplate.fulfilled, (state: any, action: any) => {
        state.isUpdating = false;
        const index = state.templates.findIndex((t: any) => t.id === action.payload.template.id);
        if (index !== -1) {
          state.templates[index] = { ...state.templates[index], ...action.payload.template };
        }
        if (state.currentTemplate && state.currentTemplate.id === action.payload.template.id) {
          state.currentTemplate = { ...state.currentTemplate, ...action.payload.template };
        }
        state.error = null;
      })
      .addCase(updateTemplate.rejected, (state: any, action: any) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Delete Template
      .addCase(deleteTemplate.pending, (state: any) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteTemplate.fulfilled, (state: any, action: any) => {
        state.isDeleting = false;
        state.templates = state.templates.filter((t: any) => t.id !== action.payload);
        if (state.currentTemplate && state.currentTemplate.id === action.payload) {
          state.currentTemplate = null;
        }
        state.error = null;
      })
      .addCase(deleteTemplate.rejected, (state: any, action: any) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      
      // Duplicate Template
      .addCase(duplicateTemplate.pending, (state: any) => {
        state.isDuplicating = true;
        state.error = null;
      })
      .addCase(duplicateTemplate.fulfilled, (state: any, action: any) => {
        state.isDuplicating = false;
        state.templates.unshift(action.payload.template);
        state.error = null;
      })
      .addCase(duplicateTemplate.rejected, (state: any, action: any) => {
        state.isDuplicating = false;
        state.error = action.payload;
      })
      
      // Fetch Default Templates
      .addCase(fetchDefaultTemplates.pending, (state: any) => {
        state.isLoading = true;
      })
      .addCase(fetchDefaultTemplates.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.defaultTemplates = action.payload.templates;
      })
      .addCase(fetchDefaultTemplates.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setFilters, 
  clearCurrentTemplate, 
  setCurrentTemplate 
} = templateSlice.actions;

// Selectors
export const selectTemplates = (state: any) => state.templates.templates;
export const selectDefaultTemplates = (state: any) => state.templates.defaultTemplates;
export const selectCurrentTemplate = (state: any) => state.templates.currentTemplate;
export const selectTemplatePagination = (state: any) => state.templates.pagination;
export const selectTemplateLoading = (state: any) => state.templates.isLoading;
export const selectTemplateError = (state: any) => state.templates.error;
export const selectTemplateFilters = (state: any) => state.templates.filters;

export default templateSlice.reducer;
