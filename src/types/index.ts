// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  company?: string;
  phone?: string;
  is_admin: boolean;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  company?: string;
  phone?: string;
}

// SMTP Account Types
export interface SMTPAccount {
  id: number;
  user_id: number;
  name: string;
  email: string;
  smtp_server: string;
  smtp_port: number;
  use_tls: boolean;
  use_ssl: boolean;
  is_active: boolean;
  is_default: boolean;
  provider?: string;
  from_name?: string;
  reply_to?: string;
  description?: string;
  max_emails_per_hour: number;
  connection_timeout: number;
  last_tested?: string;
  last_test_result?: 'success' | 'failed' | 'pending';
  last_test_error?: string;
  total_emails_sent: number;
  last_used?: string;
  created_at: string;
  updated_at: string;
}

export interface SMTPAccountForm {
  name: string;
  email: string;
  password: string;
  smtp_server: string;
  smtp_port: number;
  use_tls: boolean;
  use_ssl: boolean;
  provider?: string;
  from_name?: string;
  reply_to?: string;
  description?: string;
  max_emails_per_hour?: number;
  connection_timeout?: number;
  is_default?: boolean;
  is_active?: boolean;
}

export interface SMTPTestResult {
  connection_success: boolean;
  message: string;
  tested_at?: string;
}

export interface SMTPProvider {
  name: string;
  smtp_server: string;
  smtp_port: number;
  use_tls: boolean;
  use_ssl: boolean;
  description: string;
  setup_instructions: string;
}

export interface SMTPStats {
  total_accounts: number;
  active_accounts: number;
  inactive_accounts: number;
  default_account?: SMTPAccount;
  provider_distribution: Array<{
    provider: string;
    count: number;
  }>;
  recent_tests: Array<{
    account_name: string;
    test_result: string;
    tested_at?: string;
    error?: string;
  }>;
}

// Recipient Types
export interface RecipientList {
  id: number;
  name: string;
  description?: string;
  total_recipients: number;
  created_at: string;
  updated_at: string;
}

export interface Recipient {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  phone?: string;
  custom_fields?: Record<string, any>;
  status: 'active' | 'inactive' | 'bounced' | 'unsubscribed';
  created_at: string;
  updated_at: string;
}

export interface RecipientListForm {
  name: string;
  description?: string;
}

export interface RecipientForm {
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  phone?: string;
  custom_fields?: Record<string, any>;
}

// Campaign Types
export interface Campaign {
  id: number;
  name: string;
  subject: string;
  content: string;
  from_name: string;
  from_email: string;
  recipient_list_id: number;
  smtp_account_id: number;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  scheduled_at?: string;
  sent_at?: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignForm {
  name: string;
  subject: string;
  content: string;
  from_name: string;
  from_email: string;
  recipient_list_id: number;
  smtp_account_id: number;
  scheduled_at?: string;
}

// Template Types
export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  content: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateForm {
  name: string;
  subject: string;
  content: string;
  is_default: boolean;
}

// Upload Types
export interface UploadResult {
  success: boolean;
  total_processed: number;
  successful_imports: number;
  failed_imports: number;
  errors?: string[];
  duplicates?: number;
}

export interface FileUploadOptions {
  file_format: 'csv' | 'xlsx' | 'txt';
  include_email: boolean;
  include_first_name: boolean;
  include_last_name: boolean;
  include_company: boolean;
  include_phone: boolean;
  email_column?: string;
  first_name_column?: string;
  last_name_column?: string;
  company_column?: string;
  phone_column?: string;
}

// Settings Types
export interface Settings {
  id: number;
  daily_email_limit: number;
  hourly_email_limit: number;
  max_contacts: number;
  max_smtp_accounts: number;
  spam_check_enabled: boolean;
  spam_threshold: number;
  default_sender_name: string;
  created_at: string;
  updated_at: string;
}

// Statistics Types
export interface Statistics {
  total_campaigns: number;
  total_recipients: number;
  active_campaigns: number;
  emails_sent_today: number;
  daily_limit: number;
  usage_percentage: number;
}

// Form State Types
export interface FormState {
  isLoading: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Navigation Types
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  current?: boolean;
}

// Modal Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// Table Types
export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginationParams;
  onPaginationChange?: (params: PaginationParams) => void;
  onRowClick?: (item: T) => void;
}
