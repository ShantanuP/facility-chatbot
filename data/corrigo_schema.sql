-- Corrigo CD and ReactBI Tables and Fields
-- Schema derived from "Cursor of CD and ReactBI Tables and fields.xlsx"
-- SQLite-compatible DDL; table/column names normalized to snake_case.

-- Portfolio
CREATE TABLE IF NOT EXISTS portfolio (
  portfolio_id INTEGER PRIMARY KEY,
  database_id INTEGER,
  parent_id INTEGER,
  type_id INTEGER,
  portfolio_name TEXT,
  portfolio_type_description TEXT,
  primary_portfolio_critical_facilities INTEGER,
  primary_portfolio_path TEXT
);

-- Properties (WorkZone)
CREATE TABLE IF NOT EXISTS properties (
  property_id INTEGER PRIMARY KEY,
  database_id INTEGER,
  language_id INTEGER,
  portal_theme_id INTEGER,
  workzone_name TEXT,
  workzone_number TEXT,
  workzone_short_name TEXT,
  workzone_address_1 TEXT,
  workzone_address_2 TEXT,
  workzone_city_or_town TEXT,
  workzone_state_or_prov TEXT,
  workzone_country TEXT,
  workzone_postal_code TEXT,
  workzone_latitude REAL,
  workzone_longitude REAL,
  workzone_time_zone TEXT,
  workzone_billing_account TEXT,
  workzone_billing_account_number TEXT,
  property_status TEXT,
  critical_facilities INTEGER,
  organization TEXT,
  customer_service_email TEXT,
  customer_service_phone TEXT
);

-- Billing accounts
CREATE TABLE IF NOT EXISTS billing_accounts (
  billing_account_id INTEGER PRIMARY KEY,
  database_id INTEGER,
  billing_contact_id INTEGER,
  currency_id INTEGER,
  billing_account TEXT,
  billing_account_number TEXT,
  address_1 TEXT,
  address_2 TEXT,
  city_town TEXT,
  state_prov TEXT,
  country TEXT,
  postal_code TEXT,
  currency TEXT,
  account_balance REAL,
  payment_terms TEXT,
  credit_hold INTEGER,
  removed INTEGER
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  customer_id INTEGER PRIMARY KEY,
  database_id INTEGER,
  property_id INTEGER,
  billing_account_id INTEGER,
  customer_number TEXT,
  customer_name TEXT,
  doing_business_as TEXT,
  customer_billing_address TEXT,
  customer_main_contact TEXT,
  special_instructions TEXT
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY,
  database_id INTEGER,
  reports_to_id INTEGER,
  user_number TEXT,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  email1 TEXT,
  email2 TEXT,
  office_phone TEXT,
  mobile_phone TEXT,
  emergency_phone TEXT,
  city_town TEXT,
  state_or_prov TEXT,
  country TEXT,
  zip_postal_code TEXT,
  job_title TEXT,
  user_organization TEXT,
  status TEXT,
  user_language TEXT,
  last_login_date_time TEXT,
  last_wo_acceptance_date TEXT,
  last_wo_completion_date TEXT
);

-- Providers
CREATE TABLE IF NOT EXISTS providers (
  provider_id INTEGER PRIMARY KEY,
  database_id INTEGER,
  provider_branch_id_clean INTEGER,
  provider_number TEXT,
  provider_display_name TEXT,
  provider_organization TEXT,
  provider_address_1 TEXT,
  provider_address_2 TEXT,
  provider_city_or_town TEXT,
  provider_state_or_prov TEXT,
  country TEXT,
  zip_postal_code TEXT,
  email TEXT,
  phone TEXT,
  provider_connection_status TEXT,
  provider_score REAL,
  is_supplier INTEGER
);

-- Labor codes
CREATE TABLE IF NOT EXISTS labor_codes (
  cost_code_id INTEGER PRIMARY KEY,
  database_id INTEGER,
  labor_code TEXT,
  labor_code_number TEXT,
  labor_description TEXT,
  labor_rate REAL
);

-- Assets
CREATE TABLE IF NOT EXISTS assets (
  asset_id INTEGER PRIMARY KEY,
  database_id INTEGER,
  property_id INTEGER,
  asset_parent_id INTEGER,
  asset_name TEXT,
  asset_model TEXT,
  asset_category TEXT,
  asset_address_1 TEXT,
  asset_city_town TEXT,
  asset_country TEXT,
  asset_postal_code TEXT,
  asset_level INTEGER,
  condition_asset_attribute TEXT,
  manufacturer_asset_attribute TEXT,
  model_number_asset_attribute TEXT,
  date_in_service_asset_attribute TEXT,
  original_cost_asset_attribute REAL,
  replacement_cost_asset_attribute REAL,
  cumulative_total_spend REAL,
  is_asset_offline INTEGER,
  flag_asset_has_pmrm_schedule INTEGER,
  system_id INTEGER,
  tag_id TEXT
);

-- Work orders (subset of key columns from workorders table)
CREATE TABLE IF NOT EXISTS workorders (
  work_order_id INTEGER PRIMARY KEY,
  database_id INTEGER,
  property_id INTEGER,
  customer_id INTEGER,
  assignee_user_id INTEGER,
  assignee_provider_id INTEGER,
  work_order_number TEXT,
  work_order_description TEXT,
  work_order_status TEXT,
  work_order_priority TEXT,
  work_order_type TEXT,
  work_order_datetime_created TEXT,
  work_order_datetime_completed_last TEXT,
  work_order_due_date TEXT,
  work_order_scheduled_start TEXT,
  work_order_total_expense REAL,
  work_order_total_labor_cost REAL,
  work_order_total_materials_cost REAL,
  work_order_contact TEXT,
  work_order_address_1 TEXT,
  work_order_city_town TEXT,
  work_order_state_prov TEXT,
  work_order_postal_code TEXT,
  work_order_workzone_name TEXT,
  work_order_workzone_number TEXT,
  work_order_is_critical INTEGER,
  work_order_emergency_escalation_reason TEXT,
  days_create_to_complete REAL,
  parent_work_order_id INTEGER
);

-- Check-in/check-out
CREATE TABLE IF NOT EXISTS checkinouts (
  work_order_id INTEGER NOT NULL,
  database_id INTEGER,
  actor_id INTEGER,
  actor_type_id INTEGER,
  user_id INTEGER,
  provider_id INTEGER,
  asset_id INTEGER,
  actor_name TEXT,
  check_in_date TEXT,
  check_out_date TEXT,
  check_in_latitude REAL,
  check_in_longitude REAL,
  check_out_latitude REAL,
  check_out_longitude REAL,
  check_in_method TEXT,
  check_in_status TEXT,
  check_out_method TEXT,
  check_out_status TEXT,
  PRIMARY KEY (work_order_id, check_in_date)
);

-- Incidents
CREATE TABLE IF NOT EXISTS incidents (
  incident_id INTEGER PRIMARY KEY,
  database_id INTEGER,
  work_order_id INTEGER,
  employee_gid INTEGER,
  incident_number TEXT,
  incident_description TEXT,
  incident_summary TEXT,
  incident_category TEXT,
  incident_type TEXT,
  incident_status TEXT,
  incident_severity TEXT,
  incident_occurrence TEXT,
  incident_property_name TEXT,
  incident_creator TEXT,
  business_impact_of_incident TEXT,
  incident_sensitivity INTEGER,
  incident_is_suppressed INTEGER
);

-- PMRM Schedules
CREATE TABLE IF NOT EXISTS pmrm_schedules (
  schedule_id INTEGER PRIMARY KEY,
  database_id INTEGER,
  property_id INTEGER,
  customer_id INTEGER,
  type_id INTEGER,
  assignee_type_id INTEGER,
  schedule_name TEXT,
  pmrm_customer_name TEXT,
  pmrm_contact TEXT,
  pmrm_contact_at TEXT,
  pmrm_next_occurrence_date TEXT,
  pmrm_last_occurrence_date TEXT,
  pmrm_recurrence_type TEXT,
  pmrm_specialty TEXT,
  pmrm_suspend INTEGER,
  assignee_name TEXT,
  customer_number_of_pmrm TEXT,
  doing_business_as_for_pmrm TEXT,
  hours_duration REAL,
  arrival_time TEXT,
  arrival_end TEXT
);

-- Customer invoices
CREATE TABLE IF NOT EXISTS customer_invoices (
  customer_invoice_id INTEGER PRIMARY KEY,
  database_id INTEGER,
  customer_invoice_number TEXT,
  customer_invoice_billing_account_name TEXT,
  customer_invoice_date TEXT,
  customer_invoice_due_by TEXT,
  customer_invoice_total REAL,
  customer_invoice_created_date TEXT,
  posted_date_of_customer_invoice TEXT,
  payment_terms_of_customer_invoice TEXT,
  total_tax_of_customer_invoice REAL
);

-- Approval templates
CREATE TABLE IF NOT EXISTS approval_templates (
  approval_template_id INTEGER PRIMARY KEY,
  database_id INTEGER,
  approval_template_name TEXT,
  approval_template_type TEXT,
  is_critical INTEGER,
  is_removed INTEGER
);

-- Asset actions
CREATE TABLE IF NOT EXISTS asset_actions (
  asset_action_id INTEGER PRIMARY KEY,
  database_id INTEGER,
  asset_id INTEGER,
  actor_id INTEGER,
  actor_type_id INTEGER,
  user_id INTEGER,
  asset_action_logged_by TEXT,
  asset_action_type TEXT,
  asset_log_comments TEXT,
  asset_log_date TEXT
);

-- Labor codes link to work orders via workorder_spend_items; workorders link to properties, customers, users, providers.
