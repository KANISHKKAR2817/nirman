-- NIRMAN V2 Seed Data
-- Demo dataset for NIRMAN Smart Residential Tower

-- BCrypt password for 'password123': $2a$10$VWmw0wyT7rQF544Zvhs5dOoM3Q5Z2T5NX3erDXGXcjOHOi2h6.p92
INSERT INTO users (username, email, password_hash, full_name, role, active) VALUES
('admin', 'admin@nirman.build', '$2a$10$VWmw0wyT7rQF544Zvhs5dOoM3Q5Z2T5NX3erDXGXcjOHOi2h6.p92', 'Vikramaditya Rao', 'ADMIN', true),
('pm_sharma', 'sharma@nirman.build', '$2a$10$VWmw0wyT7rQF544Zvhs5dOoM3Q5Z2T5NX3erDXGXcjOHOi2h6.p92', 'Rajesh Sharma', 'PROJECT_MANAGER', true),
('eng_patel', 'patel@nirman.build', '$2a$10$VWmw0wyT7rQF544Zvhs5dOoM3Q5Z2T5NX3erDXGXcjOHOi2h6.p92', 'Aakash Patel', 'SITE_ENGINEER', true),
('safety_singh', 'singh@nirman.build', '$2a$10$VWmw0wyT7rQF544Zvhs5dOoM3Q5Z2T5NX3erDXGXcjOHOi2h6.p92', 'Harpreet Singh', 'SAFETY_OFFICER', true);

-- Project
INSERT INTO projects (name, code, description, site_address, client, project_manager, start_date, planned_completion_date, total_budget, status, progress_percentage) VALUES
('NIRMAN Smart Residential Tower', 'NIRMAN-SRT-01', 'G+14 Premium Residential Twin Tower with Integrated Sustainable BIM Infrastructure', 'Plot 42, Cyber City Tech Corridor, Bangalore 560100', 'Apex Urban Developers Ltd', 'Rajesh Sharma', '2026-01-15', '2026-12-25', 85000000.00, 'ACTIVE', 48.50);

-- Construction Zones
INSERT INTO construction_zones (project_id, code, name, zone_type, floor_level, area_sqm, status, risk_level, progress_percentage, bounding_box_json) VALUES
(1, 'ZONE-FDN', 'Basement Raft & Foundation', 'FOUNDATION', -1, 1400.00, 'COMPLETED', 'LOW', 100.00, '{"minX": -20, "maxX": 20, "minZ": -20, "maxZ": 20, "minY": -2, "maxY": 0}'),
(1, 'ZONE-GF', 'Ground Floor Podium & Retail Slabs', 'SUPERSTRUCTURE', 0, 1200.00, 'COMPLETED', 'LOW', 100.00, '{"minX": -18, "maxX": 18, "minZ": -18, "maxZ": 18, "minY": 0, "maxY": 4}'),
(1, 'ZONE-F1-3', 'Floors 1 to 3 Residential Core', 'SUPERSTRUCTURE', 3, 3200.00, 'IN_PROGRESS', 'MODERATE', 78.00, '{"minX": -16, "maxX": 16, "minZ": -16, "maxZ": 16, "minY": 4, "maxY": 16}'),
(1, 'ZONE-F4-6', 'Floors 4 to 6 Structural Framing & Beams', 'SUPERSTRUCTURE', 6, 3200.00, 'IN_PROGRESS', 'HIGH', 32.00, '{"minX": -16, "maxX": 16, "minZ": -16, "maxZ": 16, "minY": 16, "maxY": 28}'),
(1, 'ZONE-F7-14', 'Upper Floors 7 to 14 Superstructure', 'SUPERSTRUCTURE', 14, 8500.00, 'NOT_STARTED', 'LOW', 0.00, '{"minX": -16, "maxX": 16, "minZ": -16, "maxZ": 16, "minY": 28, "maxY": 60}'),
(1, 'ZONE-YARD', 'Material Staging & Batching Yard', 'LOGISTICS', 0, 2500.00, 'ACTIVE', 'LOW', 85.00, '{"minX": 25, "maxX": 55, "minZ": -30, "maxZ": 10, "minY": 0, "maxY": 3}'),
(1, 'ZONE-CRANE', 'Tower Crane TC-01 Radial Zone', 'HEAVY_EQUIPMENT', 0, 900.00, 'ACTIVE', 'HIGH', 60.00, '{"minX": -5, "maxX": 5, "minZ": 15, "maxZ": 25, "minY": 0, "maxY": 70}');

-- Milestones
INSERT INTO milestones (project_id, name, description, target_date, actual_date, status, progress_percentage) VALUES
(1, 'Substructure & Foundation Raft Pour', 'Completion of 1,800m3 deep raft concrete pour & curing', '2026-03-01', '2026-02-28', 'COMPLETED', 100.00),
(1, 'Ground Floor Podium Handover', 'Ground slab curing and load testing certification', '2026-04-15', '2026-04-18', 'COMPLETED', 100.00),
(1, 'Mid-Rise Structural Core (Lvl 6)', 'Concrete core casting up to floor level 6', '2026-08-30', NULL, 'IN_PROGRESS', 55.00),
(1, 'Superstructure Topping Out (Lvl 14)', 'Completion of topmost structural roof slab and parapets', '2026-10-30', NULL, 'PENDING', 0.00),
(1, 'Facade, MEP Rough-in & Final Handover', 'Complete exterior glazing, elevator testing, and fire clearance', '2026-12-20', NULL, 'PENDING', 0.00);

-- Tasks (16 Tasks with diverse statuses: COMPLETED, IN_PROGRESS, BLOCKED, OVERDUE, NOT_STARTED)
INSERT INTO tasks (id, task_code, name, description, project_id, zone_id, assigned_team, start_date, due_date, actual_completion_date, estimated_duration_days, progress_percentage, priority, status, estimated_cost, actual_cost, weight) VALUES
(1, 'TSK-101', 'Site Excavation & Shoring', 'Deep excavation down to -6m with contiguous piling shoring', 1, 1, 'Excavation Alpha', '2026-01-15', '2026-02-10', '2026-02-08', 26, 100.00, 'HIGH', 'COMPLETED', 3200000.00, 3150000.00, 1.50),
(2, 'TSK-102', 'Raft Foundation Rebar & Waterproofing', 'High tensile Fe550D rebar placement and double layer HDPE membrane', 1, 1, 'Steel Benders Team', '2026-02-11', '2026-02-25', '2026-02-25', 15, 100.00, 'CRITICAL', 'COMPLETED', 4500000.00, 4620000.00, 2.00),
(3, 'TSK-103', 'Raft Mass Concrete Pour (M40 Grade)', 'Continuous ready-mix batching of 1,800m3 self-compacting concrete', 1, 1, 'Concrete Pour Unit', '2026-02-26', '2026-03-05', '2026-03-04', 8, 100.00, 'CRITICAL', 'COMPLETED', 6800000.00, 6750000.00, 2.50),
(4, 'TSK-104', 'Basement Retaining Walls & Columns', 'Formwork, vertical reinforcement and concrete pour for retaining perimeter', 1, 1, 'Formwork Squad 1', '2026-03-06', '2026-03-25', '2026-03-24', 20, 100.00, 'HIGH', 'COMPLETED', 3900000.00, 3880000.00, 1.80),
(5, 'TSK-105', 'Ground Floor Transfer Slab Casting', 'Heavy duty shoring and 450mm post-tensioned transfer plate casting', 1, 2, 'PT Specialist Team', '2026-03-26', '2026-04-20', '2026-04-22', 25, 100.00, 'CRITICAL', 'COMPLETED', 7200000.00, 7450000.00, 2.80),
(6, 'TSK-106', 'Floors 1-3 Shear Wall Reinforcement', 'Prefabricated rebar cages erection and ultrasonic weld inspection', 1, 3, 'Steel Benders Team', '2026-04-23', '2026-05-20', '2026-05-18', 27, 100.00, 'HIGH', 'COMPLETED', 4100000.00, 4050000.00, 2.00),
(7, 'TSK-107', 'Floors 1-3 Floor Slabs & Concreting', 'Aluminium mivan formwork assembly and M35 concrete placement', 1, 3, 'Formwork Squad 2', '2026-05-21', '2026-06-25', '2026-06-28', 35, 100.00, 'HIGH', 'COMPLETED', 6200000.00, 6310000.00, 2.50),
(8, 'TSK-108', 'Floors 1-3 AAC Masonry & Conduit Rough-in', 'Lightweight AAC blockwork partitions with electrical conduit embedment', 1, 3, 'Masonry & MEP Unit', '2026-06-29', '2026-08-15', NULL, 47, 75.00, 'MEDIUM', 'IN_PROGRESS', 2900000.00, 2150000.00, 1.80),
(9, 'TSK-109', 'Floor 4 Structural Columns & Core Wall', 'Formwork fixing and column rebar for Level 4', 1, 4, 'Steel Benders Team', '2026-07-15', '2026-08-10', '2026-08-12', 26, 100.00, 'HIGH', 'COMPLETED', 3400000.00, 3420000.00, 1.80),
(10, 'TSK-110', 'Floor 4 Slab Formwork & Rebar Binding', 'Shuttering plywood erection and bottom mesh rebar fixing', 1, 4, 'Formwork Squad 1', '2026-08-13', '2026-09-05', NULL, 23, 60.00, 'CRITICAL', 'OVERDUE', 3800000.00, 2800000.00, 2.20),
(11, 'TSK-111', 'Floor 4 Concrete Slab Pour', 'Boom pump casting of Floor 4 slab using M35 mix', 1, 4, 'Concrete Pour Unit', '2026-09-06', '2026-09-15', NULL, 10, 0.00, 'CRITICAL', 'BLOCKED', 4200000.00, 0.00, 2.50),
(12, 'TSK-112', 'Floor 5 Columns & Shear Walls', 'Vertical framing for Level 5 residential units', 1, 4, 'Steel Benders Team', '2026-09-16', '2026-10-05', NULL, 20, 0.00, 'HIGH', 'NOT_STARTED', 3600000.00, 0.00, 1.90),
(13, 'TSK-113', 'Floor 5 Slab Shuttering & Casting', 'Slab formwork and casting cycle for Level 5', 1, 4, 'Formwork Squad 2', '2026-10-06', '2026-10-25', NULL, 20, 0.00, 'HIGH', 'NOT_STARTED', 4100000.00, 0.00, 2.20),
(14, 'TSK-114', 'Tower Crane TC-01 Mast Extension & Jacking', 'Adding 3 mast sections to support floors 7-14 elevation', 1, 7, 'Heavy Rigging Crew', '2026-09-10', '2026-09-18', NULL, 9, 30.00, 'CRITICAL', 'OVERDUE', 1200000.00, 500000.00, 1.20),
(15, 'TSK-115', 'Plumbing & Drainage Vertical Stack Installation', 'Cast iron & CPVC main riser pipe installation in shafts', 1, 3, 'Plumbing Crew', '2026-08-20', '2026-10-10', NULL, 51, 40.00, 'MEDIUM', 'IN_PROGRESS', 2100000.00, 950000.00, 1.50),
(16, 'TSK-116', 'Floors 7 to 10 Structural Frame Fabrication', 'Structural columns, slabs, and exterior perimeter for mid-high levels', 1, 5, 'Civil Mega Crew', '2026-10-26', '2026-11-30', NULL, 35, 0.00, 'HIGH', 'NOT_STARTED', 12500000.00, 0.00, 3.50);

-- Task Dependencies
INSERT INTO task_dependencies (task_id, prerequisite_task_id, dependency_type) VALUES
(2, 1, 'FINISH_TO_START'),
(3, 2, 'FINISH_TO_START'),
(4, 3, 'FINISH_TO_START'),
(5, 4, 'FINISH_TO_START'),
(6, 5, 'FINISH_TO_START'),
(7, 6, 'FINISH_TO_START'),
(8, 7, 'FINISH_TO_START'),
(9, 7, 'FINISH_TO_START'),
(10, 9, 'FINISH_TO_START'),
(11, 10, 'FINISH_TO_START'),
(12, 11, 'FINISH_TO_START'),
(13, 12, 'FINISH_TO_START'),
(14, 9, 'FINISH_TO_START'),
(15, 7, 'FINISH_TO_START'),
(16, 13, 'FINISH_TO_START');

-- Workers (11 Fictional Workers)
INSERT INTO workers (worker_code, name, role, project_id, zone_id, shift, phone, email, skill_category, certification_status, safety_training_status, availability) VALUES
('WRK-001', 'Arun Kumar', 'Senior Structural Foreman', 1, 4, 'DAY', '+91 98450 11201', 'arun.kumar@nirman.build', 'SUPERVISION', 'ACTIVE', 'CERTIFIED', 'ASSIGNED'),
('WRK-002', 'Devendra Yadav', 'Master Rebar Bender', 1, 4, 'DAY', '+91 98450 11202', 'devendra.y@nirman.build', 'STEEL_FIXING', 'ACTIVE', 'CERTIFIED', 'ASSIGNED'),
('WRK-003', 'Manoj Gowda', 'Heavy Crane Operator', 1, 7, 'DAY', '+91 98450 11203', 'manoj.g@nirman.build', 'EQUIPMENT_OPERATION', 'ACTIVE', 'CERTIFIED', 'ASSIGNED'),
('WRK-004', 'Suresh Nair', 'Concrete Quality Inspector', 1, 3, 'DAY', '+91 98450 11204', 'suresh.n@nirman.build', 'QUALITY_CONTROL', 'ACTIVE', 'CERTIFIED', 'AVAILABLE'),
('WRK-005', 'Irfan Sheikh', 'Lead Formwork Carpenter', 1, 4, 'DAY', '+91 98450 11205', 'irfan.s@nirman.build', 'CARPENTRY', 'ACTIVE', 'CERTIFIED', 'ASSIGNED'),
('WRK-006', 'Pradeep Verma', 'Scaffolding Safety Specialist', 1, 4, 'DAY', '+91 98450 11206', 'pradeep.v@nirman.build', 'SCAFFOLDING', 'RENEWAL_DUE', 'CERTIFIED', 'ASSIGNED'),
('WRK-007', 'Ganesh Murthy', 'MEP Lead Electrician', 1, 3, 'DAY', '+91 98450 11207', 'ganesh.m@nirman.build', 'ELECTRICAL', 'ACTIVE', 'CERTIFIED', 'ASSIGNED'),
('WRK-008', 'Ramesh Chand', 'Excavator Operator', 1, 6, 'DAY', '+91 98450 11208', 'ramesh.c@nirman.build', 'EQUIPMENT_OPERATION', 'ACTIVE', 'CERTIFIED', 'AVAILABLE'),
('WRK-009', 'Naveen Reddy', 'Surveyor & Geotechnical Tech', 1, 2, 'DAY', '+91 98450 11209', 'naveen.r@nirman.build', 'SURVEYING', 'ACTIVE', 'CERTIFIED', 'AVAILABLE'),
('WRK-010', 'Deepak Joshi', 'Safety Marshal', 1, 7, 'NIGHT', '+91 98450 11210', 'deepak.j@nirman.build', 'SAFETY', 'ACTIVE', 'CERTIFIED', 'ASSIGNED'),
('WRK-011', 'Santosh Pal', 'Junior Steel Tech', 1, 4, 'NIGHT', '+91 98450 11211', 'santosh.p@nirman.build', 'STEEL_FIXING', 'ACTIVE', 'EXPIRED', 'UNAVAILABLE');

-- Worker Assignments
INSERT INTO worker_assignments (worker_id, task_id, assigned_date, role_in_task) VALUES
(1, 10, '2026-08-13', 'Floor Lead Supervisor'),
(2, 10, '2026-08-13', 'Lead Rebar Binder'),
(5, 10, '2026-08-14', 'Formwork Carpenter Lead'),
(6, 10, '2026-08-15', 'Edge Protection Safety Lead'),
(3, 14, '2026-09-10', 'Lead Crane Jacking Operator'),
(7, 8, '2026-06-29', 'Electrical Conduit Router'),
(10, 14, '2026-09-10', 'Radial Zone Safety Marshal');

-- Equipment (8 Items)
INSERT INTO equipment (equipment_code, name, category, project_id, zone_id, operational_status, utilization_percentage, last_maintenance_date, next_maintenance_date, ownership_status, operating_cost_per_day, assigned_operator) VALUES
('EQ-TC-01', 'Potain MDT 389 L16 Tower Crane', 'LIFTING', 1, 7, 'IN_USE', 84.50, '2026-08-15', '2026-09-15', 'RENTED', 18500.00, 'Manoj Gowda'),
('EQ-EX-04', 'CAT 320D Hydraulic Excavator', 'EARTHMOVING', 1, 6, 'AVAILABLE', 45.00, '2026-08-01', '2026-10-01', 'OWNED', 12000.00, 'Ramesh Chand'),
('EQ-CP-02', 'Schwing Stetter Concrete Boom Pump 36X', 'CONCRETE', 1, 4, 'MAINTENANCE', 62.00, '2026-07-20', '2026-09-02', 'RENTED', 22000.00, 'Vikas Patil'),
('EQ-TM-07', 'Tata Transit Mixer 7m3', 'TRANSPORT', 1, 6, 'IN_USE', 78.00, '2026-08-22', '2026-09-22', 'OWNED', 6500.00, 'Sunil Kumar'),
('EQ-DG-01', 'Cummins 500 kVA Prime Silent DG Set', 'POWER', 1, 6, 'IN_USE', 91.00, '2026-08-10', '2026-09-10', 'OWNED', 8000.00, 'Site Power Team'),
('EQ-SL-03', 'Bobcat S650 Skid Steer Loader', 'EARTHMOVING', 1, 6, 'AVAILABLE', 35.00, '2026-08-05', '2026-10-05', 'RENTED', 5500.00, 'Unassigned'),
('EQ-SC-08', 'Haulotte Compact 12 DX Scissor Lift', 'ACCESS', 1, 3, 'IN_USE', 58.00, '2026-07-30', '2026-09-30', 'RENTED', 4200.00, 'MEP Team'),
('EQ-CO-02', 'Dynapac CA250D Vibratory Soil Compactor', 'COMPACTION', 1, 6, 'AVAILABLE', 20.00, '2026-07-10', '2026-10-10', 'OWNED', 7000.00, 'Unassigned');

-- Equipment Assignments
INSERT INTO equipment_assignments (equipment_id, task_id, start_date, hours_used) VALUES
(1, 10, '2026-08-13', 142.50),
(1, 14, '2026-09-10', 38.00),
(3, 11, '2026-09-06', 0.00),
(5, 10, '2026-08-13', 180.00);

-- Materials (10 Records with Realistic Quantities & Pricing in INR)
INSERT INTO materials (id, material_code, name, category, unit, available_quantity, reserved_quantity, reorder_threshold, unit_price, supplier_name, storage_zone_id) VALUES
(1, 'MAT-CEM-01', 'UltraTech OPC 53 Grade Cement', 'BINDER', 'BAGS', 420.00, 350.00, 500.00, 385.00, 'UltraTech Cement Distributors', 6),
(2, 'MAT-STL-01', 'Tata Tiscon 550D TMT Rebar (16mm & 20mm)', 'STEEL', 'METRIC_TONS', 18.50, 16.00, 25.00, 68500.00, 'Tata Steel Infra Direct', 6),
(3, 'MAT-SND-01', 'Washed M-Sand (Manufactured Sand)', 'AGGREGATE', 'CUBIC_METERS', 140.00, 60.00, 100.00, 1850.00, 'Karnataka Stone Aggregates', 6),
(4, 'MAT-AGG-01', 'Crushed Blue Granite Aggregate (20mm)', 'AGGREGATE', 'CUBIC_METERS', 210.00, 80.00, 120.00, 2100.00, 'Karnataka Stone Aggregates', 6),
(5, 'MAT-AAC-01', 'Birla Aerocon AAC Blocks (600x200x150mm)', 'MASONRY', 'PIECES', 2800.00, 1200.00, 1500.00, 72.00, 'Birla Nuvo Building Solutions', 6),
(6, 'MAT-RMC-01', 'Ready-Mix Concrete M35 Design Mix', 'CONCRETE', 'CUBIC_METERS', 45.00, 40.00, 60.00, 4800.00, 'RDC Concrete India Ltd', 6),
(7, 'MAT-CON-01', 'PolyCab 25mm FRLS Electrical PVC Conduits', 'ELECTRICAL', 'METERS', 1450.00, 600.00, 800.00, 48.00, 'Polycab Wires Ltd', 6),
(8, 'MAT-PIP-01', 'Astral CPVC Pro SDR 11 Plumbing Pipes', 'PLUMBING', 'METERS', 620.00, 250.00, 400.00, 165.00, 'Astral Poly Technik Ltd', 6),
(9, 'MAT-WPR-01', 'Dr. Fixit 2K Polymer Waterproofing Slurry', 'CHEMICALS', 'KG', 850.00, 300.00, 400.00, 240.00, 'Pidilite Industries', 6),
(10, 'MAT-PLY-01', 'Film Faced Shuttering Plywood 12mm', 'FORMWORK', 'SHEETS', 340.00, 280.00, 200.00, 1850.00, 'Kitply Industries', 6);

-- Inventory Transactions (Stock movement history)
INSERT INTO inventory_transactions (material_id, transaction_type, quantity, unit_price, reference_task_id, notes, created_by) VALUES
(1, 'RECEIVED', 1000.00, 385.00, NULL, 'Initial bulk dispatch from depot via Truck KA-04-E-8821', 'admin'),
(1, 'CONSUMED', 580.00, 385.00, 7, 'Floor 3 slab casting consumption', 'eng_patel'),
(2, 'RECEIVED', 45.00, 68500.00, NULL, 'Trailer lot delivery of TMT Rebar Bundles', 'admin'),
(2, 'CONSUMED', 26.50, 68500.00, 7, 'Floor 3 slab and column rebar mesh', 'eng_patel'),
(1, 'RESERVED', 350.00, 385.00, 10, 'Reserved for Floor 4 slab pour preparation', 'eng_patel'),
(2, 'RESERVED', 16.00, 68500.00, 10, 'Reserved for Floor 4 top reinforcement cage', 'eng_patel'),
(3, 'RECEIVED', 300.00, 1850.00, NULL, 'Sand tipper delivery 6x loads', 'admin'),
(3, 'CONSUMED', 160.00, 1850.00, 7, 'Batching on-site mortar and topping screed', 'eng_patel'),
(5, 'RECEIVED', 5000.00, 72.00, NULL, 'Palletized AAC shipment', 'admin'),
(5, 'CONSUMED', 2200.00, 72.00, 8, 'Floors 1-2 partition wall construction', 'eng_patel');

-- Safety Incidents
INSERT INTO safety_incidents (incident_code, project_id, zone_id, title, description, severity, status, reported_by, assigned_to, incident_date, target_resolution_date, corrective_actions) VALUES
('INC-2026-01', 1, 4, 'Missing Perimeter Edge Guardrails on Floor 4 West Edge', 'During site walk, workers noted 8 meters of missing safety toe-boards and top wire railings near western cantilever slab edge at Level 4.', 'HIGH', 'ACTION_REQUIRED', 'Deepak Joshi', 'Pradeep Verma', '2026-08-28', '2026-09-02', 'Immediately cordoned off zone with warning ribbon; ordered heavy tubular safety stanchions installation.'),
('INC-2026-02', 1, 7, 'Boom Pump Hydraulic Seal Leakage during Pre-Check', 'Hydraulic fluid seepage observed from main arm articulation cylinder of Schwing Stetter pump CP-02 before planned pour.', 'HIGH', 'INVESTIGATING', 'Vikas Patil', 'Aakash Patel', '2026-08-30', '2026-09-04', 'Pump locked out with red LOTO tag; authorized OEM service engineer dispatched for replacement seal.'),
('INC-2026-03', 1, 6, 'Dust Suppression Water Bowser Schedule Lapsed', 'Minor particulate dust blowing over neighbouring access road due to dry winds in material yard.', 'LOW', 'RESOLVED', 'Harpreet Singh', 'Site Logistics Team', '2026-08-10', '2026-08-11', 'Scheduled twice-daily water spraying routine and installed wind barrier netting along boundary.'),
('INC-2026-04', 1, 1, 'Deep Pit Ground Water Ingress after Flash Rain', 'Basement sump pump power trip caused minor water pooling in lift pit #2.', 'MEDIUM', 'CLOSED', 'Aakash Patel', 'Manoj Gowda', '2026-02-18', '2026-02-19', 'Installed auxiliary submersible pump with auto float switch and verified backup DG set auto-changeover.');

-- Risks (Explainable, deterministic records)
INSERT INTO risks (project_id, zone_id, category, title, description, risk_score, severity, contributing_factors, dynamic_explanation, recommended_action, status, assigned_to) VALUES
(1, 4, 'SCHEDULE', 'Floor 4 Slab Casting Schedule Slip & Downstream Delay', 'Task TSK-110 (Floor 4 Slab Formwork) is 6 days overdue, bottlenecking the critical concrete pour TSK-111 and upper floor staging.', 74.00, 'HIGH', 'Task TSK-110 overdue by 6 days; concrete pump EQ-CP-02 in maintenance; Floor 4 critical path slack = 0 days.', 'High Schedule Delay Risk: 1 of 6 active tasks is overdue, planned progress is 54.0% versus actual 48.5%, and critical path dependency chain for Level 4 pour has zero float buffer. Any additional delay pushes project topping-out by 14 days.', 'Deploy supplementary 4-man carpentry crew from Zone C; expedite mobile pump rental to bypass EQ-CP-02 overhaul.', 'IDENTIFIED', 'Rajesh Sharma'),
(1, 6, 'RESOURCE', 'TMT Rebar Fe550D & Cement Near Reorder Warning Threshold', 'Available cement (420 bags) and rebar (18.5 MT) unreserved quantities have dropped below safe buffer after Floor 4 reservations.', 62.00, 'HIGH', 'Available Cement = 70 bags unreserved vs 500 threshold; Rebar = 2.5 MT unreserved vs 25 threshold.', 'High Resource Shortage Risk: Material stock reserves for Floor 4 slab have exhausted 86% of warehouse safety inventory. Lead time for rebar mills is currently 5-7 business days.', 'Issue emergency purchase order PO-2026-88 to Tata Steel and UltraTech for 40 MT rebar and 1,200 cement bags.', 'IDENTIFIED', 'Aakash Patel'),
(1, 4, 'SAFETY', 'High-Elevation Fall Hazard & Equipment Lockout Overlap', 'Floor 4 edge guardrail defect INC-2026-01 unrectified while crane lifting activity occurs overhead in Zone Crane.', 68.00, 'HIGH', '1 unresolved HIGH-severity incident in Zone 4; 1 equipment LOTO maintenance lock in Zone 4; elevation height > 16m.', 'Significant Operational Safety Risk: Floor 4 slab work combines working-at-height hazards with compromised edge protection and nearby crane slewing radius. Safety compliance score reduced to 58%.', 'Halt all non-essential activities within 10m of Floor 4 west perimeter until steel barrier inspection signoff.', 'MITIGATING', 'Harpreet Singh');

-- Risk Assessment Snapshot
INSERT INTO risk_assessments (project_id, overall_score, schedule_score, resource_score, safety_score, severity, summary) VALUES
(1, 68.30, 74.00, 62.00, 68.00, 'HIGH', 'Project NIRMAN-SRT-01 shows elevated risk driven by Floor 4 formwork delay, cement/rebar safety stock depletion, and Level 4 edge barrier defect.');

-- Budget Entries (Category-wise Financial Overview in INR)
INSERT INTO budget_entries (project_id, category, planned_amount, committed_amount, actual_expenditure, period_month, fiscal_year, notes) VALUES
(1, 'CIVIL_WORKS', 32000000.00, 22000000.00, 19800000.00, 'AUGUST', 2026, 'Substructure and core superstructures casting stages'),
(1, 'STEEL_REBAR', 18500000.00, 14200000.00, 12950000.00, 'AUGUST', 2026, 'TMT Fe550D procurement through primary steel distributor'),
(1, 'EQUIPMENT_RENTAL', 12000000.00, 7800000.00, 6920000.00, 'AUGUST', 2026, 'Tower crane monthly lease, boom pump hire, and DG power fuel'),
(1, 'WORKFORCE_LABOR', 11500000.00, 7900000.00, 7150000.00, 'AUGUST', 2026, 'Direct labor contractor payroll and specialist scaffolding crews'),
(1, 'MEP_AND_SERVICES', 6500000.00, 3100000.00, 2450000.00, 'AUGUST', 2026, 'Conduits, plumbing risers, grounding grids, and earthing pits'),
(1, 'PERMITS_AND_QA', 4500000.00, 2800000.00, 2600000.00, 'AUGUST', 2026, 'Municipal structural approvals, third-party ultrasonic weld tests');

-- Simulation Scenarios
INSERT INTO simulation_scenarios (id, project_id, name, description, baseline_completion_date, projected_completion_date, delay_days, cost_delta, baseline_risk_score, projected_risk_score, is_applied) VALUES
(1, 1, 'Schedule Recovery: Double-Shift Floor 4 & Mobile Pump Backup', 'Deploy a second shift carpentry crew for TSK-110 and hire a temporary 42m mobile pump for TSK-111 to recover 8 days of delay.', '2026-12-25', '2026-12-17', -8, 380000.00, 68.30, 34.50, false);

-- Simulation Scenario Changes
INSERT INTO simulation_scenario_changes (scenario_id, task_id, parameter_name, original_value, simulated_value, rationale) VALUES
(1, 10, 'ESTIMATED_DURATION', '23', '15', 'Doubling carpentry workforce to complete Floor 4 shuttering in 15 days'),
(1, 11, 'STATUS', 'BLOCKED', 'READY_WITH_BACKUP', 'Utilize hired standby mobile pump while EQ-CP-02 undergoing seal overhaul');

-- Notifications
INSERT INTO notifications (user_id, project_id, title, message, severity, category, is_read, related_entity_type, related_entity_id) VALUES
(1, 1, 'Critical Task Overdue', 'Task TSK-110 (Floor 4 Slab Formwork & Rebar Binding) is 6 days behind scheduled completion date.', 'CRITICAL', 'TASK', false, 'TASK', 10),
(1, 1, 'Low Material Stock Alert', 'UltraTech OPC 53 Cement available free stock has dropped below 100 bags (Threshold: 500 bags).', 'WARNING', 'MATERIAL', false, 'MATERIAL', 1),
(1, 1, 'Equipment Scheduled Overhaul', 'Concrete Boom Pump EQ-CP-02 is in MAINTENANCE status due to cylinder seal leak.', 'WARNING', 'EQUIPMENT', false, 'EQUIPMENT', 3),
(1, 1, 'Open High Hazard Reported', 'Safety incident INC-2026-01 reported in Zone 4 (Missing Edge Guardrails). Immediate corrective action required.', 'CRITICAL', 'SAFETY', false, 'SAFETY_INCIDENT', 1),
(1, 1, 'Milestone Progress Update', 'Mid-Rise Structural Core (Lvl 6) reached 55% completion status.', 'INFO', 'TASK', true, 'MILESTONE', 3);

-- Audit Logs
INSERT INTO audit_logs (project_id, actor, action_type, entity_type, entity_id, change_summary, ip_address) VALUES
(1, 'admin', 'INITIALIZE', 'PROJECT', 1, 'Project NIRMAN-SRT-01 initialized with master BIM model and 7 construction zones', '127.0.0.1'),
(1, 'eng_patel', 'UPDATE_TASK', 'TASK', 10, 'Updated progress for Floor 4 Slab Formwork to 60.0%; flagged dependency bottleneck', '127.0.0.1'),
(1, 'safety_singh', 'REPORT_INCIDENT', 'SAFETY_INCIDENT', 1, 'Logged High-priority hazard INC-2026-01: Missing edge barriers on Floor 4 West', '127.0.0.1'),
(1, 'eng_patel', 'CONSUME_INVENTORY', 'MATERIAL', 1, 'Consumed 580 bags cement for Floor 3 slab casting batching', '127.0.0.1'),
(1, 'pm_sharma', 'RUN_SIMULATION', 'SIMULATION', 1, 'Executed What-If schedule acceleration simulation scenario with double shift', '127.0.0.1');
