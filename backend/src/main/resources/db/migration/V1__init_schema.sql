-- NIRMAN V1 Initial Schema
-- Compatible with MySQL 8.x and H2 (MySQL Mode)

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30) NOT NULL UNIQUE,
    description TEXT,
    site_address VARCHAR(255),
    client VARCHAR(100),
    project_manager VARCHAR(100),
    start_date DATE NOT NULL,
    planned_completion_date DATE NOT NULL,
    actual_completion_date DATE,
    total_budget DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    progress_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE construction_zones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    code VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    zone_type VARCHAR(50) NOT NULL,
    floor_level INT DEFAULT 0,
    area_sqm DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'IN_PROGRESS',
    risk_level VARCHAR(20) DEFAULT 'LOW',
    progress_percentage DECIMAL(5, 2) DEFAULT 0.00,
    bounding_box_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_zone_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_code VARCHAR(30) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    project_id BIGINT NOT NULL,
    zone_id BIGINT,
    assigned_team VARCHAR(100),
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    actual_completion_date DATE,
    estimated_duration_days INT NOT NULL DEFAULT 1,
    progress_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(30) NOT NULL DEFAULT 'NOT_STARTED',
    estimated_cost DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    actual_cost DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    weight DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
    override_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_zone FOREIGN KEY (zone_id) REFERENCES construction_zones(id) ON DELETE SET NULL
);

CREATE TABLE task_dependencies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL,
    prerequisite_task_id BIGINT NOT NULL,
    dependency_type VARCHAR(20) NOT NULL DEFAULT 'FINISH_TO_START',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dep_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_dep_prereq FOREIGN KEY (prerequisite_task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE milestones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    target_date DATE NOT NULL,
    actual_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    progress_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_milestone_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE workers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    worker_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    project_id BIGINT NOT NULL,
    zone_id BIGINT,
    shift VARCHAR(20) NOT NULL DEFAULT 'DAY',
    phone VARCHAR(30),
    email VARCHAR(100),
    skill_category VARCHAR(50),
    certification_status VARCHAR(30) DEFAULT 'ACTIVE',
    safety_training_status VARCHAR(30) DEFAULT 'CERTIFIED',
    availability VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_worker_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_worker_zone FOREIGN KEY (zone_id) REFERENCES construction_zones(id) ON DELETE SET NULL
);

CREATE TABLE worker_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    worker_id BIGINT NOT NULL,
    task_id BIGINT NOT NULL,
    assigned_date DATE NOT NULL,
    release_date DATE,
    role_in_task VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wa_worker FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    CONSTRAINT fk_wa_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE equipment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    equipment_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    project_id BIGINT NOT NULL,
    zone_id BIGINT,
    operational_status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    utilization_percentage DECIMAL(5, 2) DEFAULT 0.00,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    ownership_status VARCHAR(30) DEFAULT 'OWNED',
    operating_cost_per_day DECIMAL(10, 2) DEFAULT 0.00,
    assigned_operator VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_equip_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_equip_zone FOREIGN KEY (zone_id) REFERENCES construction_zones(id) ON DELETE SET NULL
);

CREATE TABLE equipment_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    equipment_id BIGINT NOT NULL,
    task_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    hours_used DECIMAL(8, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ea_equip FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
    CONSTRAINT fk_ea_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE materials (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    material_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    available_quantity DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    reserved_quantity DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    reorder_threshold DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    supplier_name VARCHAR(100),
    storage_zone_id BIGINT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mat_zone FOREIGN KEY (storage_zone_id) REFERENCES construction_zones(id) ON DELETE SET NULL
);

CREATE TABLE inventory_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    material_id BIGINT NOT NULL,
    transaction_type VARCHAR(30) NOT NULL,
    quantity DECIMAL(12, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    reference_task_id BIGINT,
    notes TEXT,
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_it_mat FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
    CONSTRAINT fk_it_task FOREIGN KEY (reference_task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

CREATE TABLE risks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    zone_id BIGINT,
    category VARCHAR(30) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    risk_score DECIMAL(5, 2) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    contributing_factors TEXT,
    dynamic_explanation TEXT,
    recommended_action TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'IDENTIFIED',
    assigned_to VARCHAR(100),
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    CONSTRAINT fk_risk_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_risk_zone FOREIGN KEY (zone_id) REFERENCES construction_zones(id) ON DELETE SET NULL
);

CREATE TABLE risk_assessments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    overall_score DECIMAL(5, 2) NOT NULL,
    schedule_score DECIMAL(5, 2) NOT NULL,
    resource_score DECIMAL(5, 2) NOT NULL,
    safety_score DECIMAL(5, 2) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    summary TEXT,
    assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ra_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE safety_incidents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    incident_code VARCHAR(30) NOT NULL UNIQUE,
    project_id BIGINT NOT NULL,
    zone_id BIGINT,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    reported_by VARCHAR(100),
    assigned_to VARCHAR(100),
    incident_date DATE NOT NULL,
    target_resolution_date DATE,
    corrective_actions TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_si_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_si_zone FOREIGN KEY (zone_id) REFERENCES construction_zones(id) ON DELETE SET NULL
);

CREATE TABLE budget_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    planned_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    committed_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    actual_expenditure DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    period_month VARCHAR(20),
    fiscal_year INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_be_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE simulation_scenarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    baseline_completion_date DATE NOT NULL,
    projected_completion_date DATE NOT NULL,
    delay_days INT NOT NULL DEFAULT 0,
    cost_delta DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    baseline_risk_score DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    projected_risk_score DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    is_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ss_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE simulation_scenario_changes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    scenario_id BIGINT NOT NULL,
    task_id BIGINT NOT NULL,
    parameter_name VARCHAR(50) NOT NULL,
    original_value VARCHAR(100) NOT NULL,
    simulated_value VARCHAR(100) NOT NULL,
    rationale TEXT,
    CONSTRAINT fk_ssc_scenario FOREIGN KEY (scenario_id) REFERENCES simulation_scenarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_ssc_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    project_id BIGINT,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'INFO',
    category VARCHAR(30) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT,
    actor VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    change_summary TEXT NOT NULL,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal querying
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_zone ON tasks(zone_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_workers_project ON workers(project_id);
CREATE INDEX idx_equip_project ON equipment(project_id);
CREATE INDEX idx_materials_zone ON materials(storage_zone_id);
CREATE INDEX idx_risks_project ON risks(project_id);
CREATE INDEX idx_incidents_project ON safety_incidents(project_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_audit_project ON audit_logs(project_id);
