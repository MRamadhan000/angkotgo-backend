-- ==========================================
-- Seed Data Vehicles
-- ==========================================

INSERT INTO vehicles (
    plate_number,
    vehicle_code,
    capacity,
    status,
    created_at,
    updated_at
) VALUES
('N 1201 XA', 'VH001', 12, 'ACTIVE', NOW(), NOW()),
('N 1202 XA', 'VH002', 12, 'ACTIVE', NOW(), NOW()),
('N 1203 XA', 'VH003', 12, 'ACTIVE', NOW(), NOW()),
('N 1204 XA', 'VH004', 12, 'ACTIVE', NOW(), NOW()),
('N 1205 XA', 'VH005', 12, 'ACTIVE', NOW(), NOW()),
('N 1206 XA', 'VH006', 12, 'ACTIVE', NOW(), NOW()),
('N 1207 XA', 'VH007', 12, 'ACTIVE', NOW(), NOW()),
('N 1208 XA', 'VH008', 12, 'MAINTENANCE', NOW(), NOW()),
('N 1209 XA', 'VH009', 12, 'INACTIVE', NOW(), NOW()),
('N 1210 XA', 'VH010', 12, 'ACTIVE', NOW(), NOW());