-- Corrigo sample data for facility-chatbot
-- Run after corrigo_schema.sql

-- Portfolio
INSERT OR REPLACE INTO portfolio (portfolio_id, database_id, parent_id, type_id, portfolio_name, portfolio_type_description, primary_portfolio_path) VALUES
(1, 1, NULL, 1, 'North America Portfolio', 'Regional', 'North America'),
(2, 1, 1, 2, 'East Region', 'Sub-Portfolio', 'North America / East Region'),
(3, 1, 1, 2, 'West Region', 'Sub-Portfolio', 'North America / West Region');

-- Properties (WorkZones)
INSERT OR REPLACE INTO properties (property_id, database_id, workzone_name, workzone_number, workzone_short_name, workzone_address_1, workzone_city_or_town, workzone_state_or_prov, workzone_country, workzone_postal_code, workzone_latitude, workzone_longitude, property_status, critical_facilities, organization) VALUES
(101, 1, 'Building A - HQ', 'WZ-101', 'BldgA', '100 Main Street', 'Boston', 'MA', 'USA', '02101', 42.3601, -71.0589, 'Active', 1, 'Facilities East'),
(102, 1, 'Building B - Operations', 'WZ-102', 'BldgB', '200 Oak Avenue', 'Boston', 'MA', 'USA', '02102', 42.3550, -71.0620, 'Active', 0, 'Facilities East'),
(103, 1, 'Warehouse East', 'WZ-103', 'WH-E', '150 Industrial Blvd', 'Cambridge', 'MA', 'USA', '02139', 42.3655, -71.1040, 'Active', 0, 'Facilities East');

-- Billing accounts
INSERT OR REPLACE INTO billing_accounts (billing_account_id, database_id, billing_account, billing_account_number, address_1, city_town, state_prov, country, postal_code, currency, account_balance, payment_terms) VALUES
(201, 1, 'Corporate Billing', 'BA-001', '100 Main Street', 'Boston', 'MA', 'USA', '02101', 'USD', 0, 'Net 30'),
(202, 1, 'Operations Billing', 'BA-002', '200 Oak Avenue', 'Boston', 'MA', 'USA', '02102', 'USD', 0, 'Net 30');

-- Customers
INSERT OR REPLACE INTO customers (customer_id, database_id, property_id, billing_account_id, customer_number, customer_name, doing_business_as, customer_main_contact) VALUES
(301, 1, 101, 201, 'CUST-001', 'Corporate HQ', 'HQ', 'Jane Smith'),
(302, 1, 102, 202, 'CUST-002', 'Operations Center', 'Ops', 'John Doe'),
(303, 1, 103, 202, 'CUST-003', 'Warehouse East', 'WH-E', 'Alice Brown');

-- Users
INSERT OR REPLACE INTO users (user_id, database_id, user_number, display_name, first_name, last_name, email1, office_phone, mobile_phone, job_title, user_organization, status) VALUES
(401, 1, 'U-001', 'Jane Smith', 'Jane', 'Smith', 'jane.smith@example.com', '617-555-1001', '617-555-1002', 'Facility Manager', 'Facilities East', 'Active'),
(402, 1, 'U-002', 'Mike Johnson', 'Mike', 'Johnson', 'mike.johnson@example.com', '617-555-1003', '617-555-1004', 'Technician', 'Facilities East', 'Active'),
(403, 1, 'U-003', 'Sarah Williams', 'Sarah', 'Williams', 'sarah.williams@example.com', '617-555-1005', '617-555-1006', 'Maintenance Lead', 'Facilities East', 'Active');

-- Providers
INSERT OR REPLACE INTO providers (provider_id, database_id, provider_number, provider_display_name, provider_organization, provider_address_1, provider_city_or_town, provider_state_or_prov, country, zip_postal_code, email, phone, provider_connection_status) VALUES
(501, 1, 'PROV-001', 'ABC HVAC Services', 'ABC HVAC', '500 Service Rd', 'Boston', 'MA', 'USA', '02110', 'contact@abchvac.com', '617-555-2001', 'Connected'),
(502, 1, 'PROV-002', 'QuickFix Plumbing', 'QuickFix', '300 Trade St', 'Cambridge', 'MA', 'USA', '02140', 'info@quickfix.com', '617-555-2002', 'Connected'),
(503, 1, 'PROV-003', 'SafeElevator Inc', 'SafeElevator', '100 Elevator Way', 'Boston', 'MA', 'USA', '02111', 'service@safeelevator.com', '617-555-2003', 'Connected');

-- Labor codes
INSERT OR REPLACE INTO labor_codes (cost_code_id, database_id, labor_code, labor_code_number, labor_description, labor_rate) VALUES
(601, 1, 'HVAC', 'LC-001', 'HVAC Repair', 85.00),
(602, 1, 'PLUMB', 'LC-002', 'Plumbing', 75.00),
(603, 1, 'ELEC', 'LC-003', 'Electrical', 90.00),
(604, 1, 'PM', 'LC-004', 'Preventive Maintenance', 70.00),
(605, 1, 'INSP', 'LC-005', 'Inspection', 65.00);

-- Assets
INSERT OR REPLACE INTO assets (asset_id, database_id, property_id, asset_name, asset_model, asset_category, asset_address_1, asset_city_town, asset_country, asset_level, condition_asset_attribute, original_cost_asset_attribute, replacement_cost_asset_attribute, cumulative_total_spend, flag_asset_has_pmrm_schedule) VALUES
(701, 1, 101, 'HVAC Unit - Building A Roof', 'Carrier 50XC', 'HVAC', '100 Main Street', 'Boston', 'USA', 1, 'Good', 125000.00, 140000.00, 12500.00, 1),
(702, 1, 101, 'Elevator System - Tower', 'Otis Gen2', 'Elevator', '100 Main Street', 'Boston', 'USA', 1, 'Fair', 180000.00, 200000.00, 8200.00, 1),
(703, 1, 102, 'Roof - Building B', 'Built-up', 'Structure', '200 Oak Avenue', 'Boston', 'USA', 1, 'Good', 95000.00, 110000.00, 6100.00, 0),
(704, 1, 101, 'Generator - Basement', 'Caterpillar C15', 'Electrical', '100 Main Street', 'Boston', 'USA', 1, 'Good', 85000.00, 95000.00, 4800.00, 1),
(705, 1, 102, 'Chiller Plant', 'Trane CenTraVac', 'HVAC', '200 Oak Avenue', 'Boston', 'USA', 1, 'Good', 320000.00, 350000.00, 4200.00, 1);

-- Work orders
INSERT OR REPLACE INTO workorders (work_order_id, database_id, property_id, customer_id, assignee_user_id, assignee_provider_id, work_order_number, work_order_description, work_order_status, work_order_priority, work_order_type, work_order_datetime_created, work_order_datetime_completed_last, work_order_due_date, work_order_total_expense, work_order_workzone_name, work_order_is_critical, parent_work_order_id) VALUES
(1001, 1, 101, 301, 402, NULL, 'WO-101-001', 'HVAC filter replacement - Building A', 'Open', 'High', 'Corrective', '2025-02-20 08:00:00', NULL, '2025-02-28 17:00:00', NULL, 'Building A - HQ', 1, NULL),
(1002, 1, 101, 301, NULL, 501, 'WO-101-002', 'Light fixture repair - Floor 2', 'Open', 'Medium', 'Corrective', '2025-02-21 09:15:00', NULL, '2025-03-01 17:00:00', NULL, 'Building A - HQ', 0, NULL),
(1003, 1, 102, 302, NULL, 502, 'WO-102-001', 'Plumbing leak - Restroom 2B', 'In Progress', 'High', 'Corrective', '2025-02-22 07:30:00', NULL, '2025-02-25 17:00:00', 450.00, 'Building B - Operations', 0, NULL),
(1004, 1, 101, 301, NULL, 503, 'WO-101-003', 'Elevator annual inspection', 'Open', 'Medium', 'Preventive', '2025-02-23 10:00:00', NULL, '2025-03-05 17:00:00', NULL, 'Building A - HQ', 1, NULL),
(1005, 1, 101, 301, 402, NULL, 'WO-101-004', 'Fire alarm test - Building A', 'Completed', 'Low', 'Preventive', '2025-02-18 08:00:00', '2025-02-18 14:30:00', '2025-02-18 17:00:00', 320.00, 'Building A - HQ', 0, NULL),
(1006, 1, 103, 303, 403, NULL, 'WO-103-001', 'HVAC filter replacement - Warehouse', 'Completed', 'Medium', 'Preventive', '2025-02-19 09:00:00', '2025-02-19 16:00:00', '2025-02-19 17:00:00', 280.00, 'Warehouse East', 0, NULL),
(1007, 1, 102, 302, NULL, 501, 'WO-102-002', 'Chiller maintenance - Quarterly', 'On Hold', 'Medium', 'Preventive', '2025-02-24 08:00:00', NULL, '2025-03-10 17:00:00', NULL, 'Building B - Operations', 0, NULL);

-- Check-in/check-out (sample)
INSERT OR REPLACE INTO checkinouts (work_order_id, database_id, actor_id, actor_type_id, user_id, actor_name, check_in_date, check_out_date, check_in_status, check_out_status) VALUES
(1003, 1, 1, 2, NULL, 'QuickFix Plumbing', '2025-02-24 09:00:00', '2025-02-24 12:30:00', 'On Site', 'Complete'),
(1005, 1, 1, 1, 402, 'Mike Johnson', '2025-02-18 08:15:00', '2025-02-18 14:30:00', 'On Site', 'Complete'),
(1006, 1, 1, 1, 403, 'Sarah Williams', '2025-02-19 09:00:00', '2025-02-19 16:00:00', 'On Site', 'Complete');

-- Incidents
INSERT OR REPLACE INTO incidents (incident_id, database_id, work_order_id, incident_number, incident_description, incident_summary, incident_category, incident_type, incident_status, incident_severity, incident_occurrence, incident_property_name, incident_creator) VALUES
(801, 1, 1003, 'INC-001', 'Water leak in restroom 2B caused minor damage to ceiling tiles.', 'Restroom leak - Building B', 'Property Damage', 'Facility', 'Resolved', 'Medium', '2025-02-22 06:00:00', 'Building B - Operations', 'Jane Smith'),
(802, 1, NULL, 'INC-002', 'Near-miss report: ladder not secured in mechanical room.', 'Safety near-miss - Building A', 'Safety', 'Safety', 'Open', 'Low', '2025-02-23 14:00:00', 'Building A - HQ', 'Mike Johnson');

-- PMRM Schedules
INSERT OR REPLACE INTO pmrm_schedules (schedule_id, database_id, property_id, customer_id, schedule_name, pmrm_customer_name, pmrm_contact, pmrm_next_occurrence_date, pmrm_last_occurrence_date, pmrm_recurrence_type, pmrm_specialty, assignee_name, hours_duration) VALUES
(901, 1, 101, 301, 'HVAC Filter Replacement - Bldg A', 'Corporate HQ', 'Jane Smith', '2025-03-01 08:00:00', '2025-02-01 08:00:00', 'Monthly', 'HVAC', 'ABC HVAC Services', 2.0),
(902, 1, 101, 301, 'Elevator Annual Inspection', 'Corporate HQ', 'Jane Smith', '2025-03-05 09:00:00', '2024-03-05 09:00:00', 'Annual', 'Elevator', 'SafeElevator Inc', 4.0),
(903, 1, 102, 302, 'Chiller Quarterly Maintenance', 'Operations Center', 'John Doe', '2025-03-10 08:00:00', '2024-12-10 08:00:00', 'Quarterly', 'HVAC', 'ABC HVAC Services', 6.0);

-- Customer invoices
INSERT OR REPLACE INTO customer_invoices (customer_invoice_id, database_id, customer_invoice_number, customer_invoice_billing_account_name, customer_invoice_date, customer_invoice_due_by, customer_invoice_total, posted_date_of_customer_invoice, payment_terms_of_customer_invoice, total_tax_of_customer_invoice) VALUES
(1001, 1, 'INV-2025-001', 'Corporate Billing', '2025-02-01', '2025-03-03', 12500.00, '2025-02-01', 'Net 30', 0.00),
(1002, 1, 'INV-2025-002', 'Operations Billing', '2025-02-15', '2025-03-17', 8300.00, '2025-02-15', 'Net 30', 0.00);

-- Approval templates
INSERT OR REPLACE INTO approval_templates (approval_template_id, database_id, approval_template_name, approval_template_type, is_critical, is_removed) VALUES
(1, 1, 'Default IR Completion Approval', 'Critical Incident', 1, 0),
(2, 1, 'Standard WO Approval', 'Work Order', 0, 0);

-- Asset actions (sample log)
INSERT OR REPLACE INTO asset_actions (asset_action_id, database_id, asset_id, actor_id, user_id, asset_action_logged_by, asset_action_type, asset_log_comments, asset_log_date) VALUES
(1, 1, 701, 1, 402, 'Mike Johnson', 'Inspection', 'Quarterly filter check completed.', '2025-02-15 10:00:00'),
(2, 1, 702, 1, 401, 'Jane Smith', 'Downtime', 'Scheduled maintenance window 3/5.', '2025-02-20 14:00:00');
