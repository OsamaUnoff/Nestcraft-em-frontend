/**
 * Campaign Redux Slice
 * Manages email campaign state and actions
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import campaignService from '../../services/campaignService';

// Async thunks for API calls
export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchCampaigns',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await campaignService.getCampaigns(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch campaigns');
    }
  }
);

export const fetchCampaign = createAsyncThunk(
  'campaigns/fetchCampaign',
  async (campaignId: any, { rejectWithValue }) => {
    try {
      const response = await campaignService.getCampaign(campaignId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch campaign');
    }
  }
);

export const createCampaign = createAsyncThunk(
  'campaigns/createCampaign',
  async (campaignData: any, { rejectWithValue }) => {
    try {
      const response = await campaignService.createCampaign(campaignData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create campaign');
    }
  }
);

export const updateCampaign = createAsyncThunk(
  'campaigns/updateCampaign',
  async ({ campaignId, campaignData }: any, { rejectWithValue }) => {
    try {
      const response = await campaignService.updateCampaign(campaignId, campaignData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update campaign');
    }
  }
);

export const deleteCampaign = createAsyncThunk(
  'campaigns/deleteCampaign',
  async (campaignId: any, { rejectWithValue }) => {
    try {
      await campaignService.deleteCampaign(campaignId);
      return campaignId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete campaign');
    }
  }
);

export const sendCampaign = createAsyncThunk(
  'campaigns/sendCampaign',
  async (campaignId: any, { rejectWithValue }) => {
    try {
      const response = await campaignService.sendCampaign(campaignId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send campaign');
    }
  }
);

export const getCampaignStats = createAsyncThunk(
  'campaigns/getCampaignStats',
  async (campaignId: any, { rejectWithValue }) => {
    try {
      const response = await campaignService.getCampaignStats(campaignId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get campaign stats');
    }
  }
);

const initialState: any = {
  campaigns: [],
  currentCampaign: null,
  campaignStats: null,
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
  isSending: false,
  error: null,
  filters: {
    status: '',
    search: '',
  },
};

const campaignSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    clearError: (state: any) => {
      state.error = null;
    },
    setFilters: (state: any, action: any) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentCampaign: (state: any) => {
      state.currentCampaign = null;
    },
    clearCampaignStats: (state: any) => {
      state.campaignStats = null;
    },
    updateCampaignStatus: (state: any, action: any) => {
      const { campaignId, status } = action.payload;
      const campaign = state.campaigns.find((c: any) => c.id === campaignId);
      if (campaign) {
        campaign.status = status;
      }
      if (state.currentCampaign && state.currentCampaign.id === campaignId) {
        state.currentCampaign.status = status;
      }
    },
  },
  extraReducers: (builder: any) => {
    builder
      // Fetch Campaigns
      .addCase(fetchCampaigns.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        // Handle nested API response structure
        if (action.payload && Array.isArray(action.payload.data)) {
          state.campaigns = action.payload.data;
          state.pagination = action.payload.pagination || { page: 1, pages: 1, total: 0, per_page: 10 };
        } else if (Array.isArray(action.payload.campaigns)) {
          state.campaigns = action.payload.campaigns;
          state.pagination = action.payload.pagination || { page: 1, pages: 1, total: 0, per_page: 10 };
        } else if (Array.isArray(action.payload)) {
          state.campaigns = action.payload;
          state.pagination = { page: 1, pages: 1, total: action.payload.length, per_page: 10 };
        } else {
          state.campaigns = [];
          state.pagination = { page: 1, pages: 1, total: 0, per_page: 10 };
        }
        state.error = null;
      })
      .addCase(fetchCampaigns.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Campaign
      .addCase(fetchCampaign.pending, (state: any) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCampaign.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.currentCampaign = action.payload.campaign;
        state.error = null;
      })
      .addCase(fetchCampaign.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create Campaign
      .addCase(createCampaign.pending, (state: any) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createCampaign.fulfilled, (state: any, action: any) => {
        state.isCreating = false;
        state.campaigns.unshift(action.payload.campaign);
        state.error = null;
      })
      .addCase(createCampaign.rejected, (state: any, action: any) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      // Update Campaign
      .addCase(updateCampaign.pending, (state: any) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCampaign.fulfilled, (state: any, action: any) => {
        state.isUpdating = false;
        const index = state.campaigns.findIndex((c: any) => c.id === action.payload.campaign.id);
        if (index !== -1) {
          state.campaigns[index] = { ...state.campaigns[index], ...action.payload.campaign };
        }
        if (state.currentCampaign && state.currentCampaign.id === action.payload.campaign.id) {
          state.currentCampaign = { ...state.currentCampaign, ...action.payload.campaign };
        }
        state.error = null;
      })
      .addCase(updateCampaign.rejected, (state: any, action: any) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Delete Campaign
      .addCase(deleteCampaign.pending, (state: any) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteCampaign.fulfilled, (state: any, action: any) => {
        state.isDeleting = false;
        state.campaigns = state.campaigns.filter((c: any) => c.id !== action.payload);
        if (state.currentCampaign && state.currentCampaign.id === action.payload) {
          state.currentCampaign = null;
        }
        state.error = null;
      })
      .addCase(deleteCampaign.rejected, (state: any, action: any) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      
      // Send Campaign
      .addCase(sendCampaign.pending, (state: any) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendCampaign.fulfilled, (state: any, action: any) => {
        state.isSending = false;
        const { campaignId } = action.payload;
        const campaign = state.campaigns.find((c: any) => c.id === campaignId);
        if (campaign) {
          campaign.status = 'sending';
        }
        if (state.currentCampaign && state.currentCampaign.id === campaignId) {
          state.currentCampaign.status = 'sending';
        }
        state.error = null;
      })
      .addCase(sendCampaign.rejected, (state: any, action: any) => {
        state.isSending = false;
        state.error = action.payload;
      })
      
      // Get Campaign Stats
      .addCase(getCampaignStats.pending, (state: any) => {
        state.isLoading = true;
      })
      .addCase(getCampaignStats.fulfilled, (state: any, action: any) => {
        state.isLoading = false;
        state.campaignStats = action.payload;
      })
      .addCase(getCampaignStats.rejected, (state: any, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setFilters, 
  clearCurrentCampaign, 
  clearCampaignStats,
  updateCampaignStatus 
} = campaignSlice.actions;

// Selectors
export const selectCampaigns = (state: any) => state.campaigns.campaigns;
export const selectCurrentCampaign = (state: any) => state.campaigns.currentCampaign;
export const selectCampaignStats = (state: any) => state.campaigns.campaignStats;
export const selectCampaignPagination = (state: any) => state.campaigns.pagination;
export const selectCampaignLoading = (state: any) => state.campaigns.isLoading;
export const selectCampaignError = (state: any) => state.campaigns.error;
export const selectCampaignFilters = (state: any) => state.campaigns.filters;

export default campaignSlice.reducer;
