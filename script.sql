-- Crear base de datos
DROP DATABASE IF EXISTS evaluacion_barberia;
CREATE DATABASE evaluacion_barberia;
USE evaluacion_barberia;

-- Tabla: barbero
CREATE TABLE barbero (
    id_barbero INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    especialidad VARCHAR(100),
    telefono VARCHAR(20),
    fecha_contratacion DATE,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla: cliente
CREATE TABLE cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    telefono VARCHAR(20) UNIQUE,
    email VARCHAR(100),
    vip BOOLEAN DEFAULT FALSE,
    fecha_registro DATE DEFAULT (CURDATE())
);

-- Tabla: servicio
CREATE TABLE servicio (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    duracion_minutos INT NOT NULL,
    categoria VARCHAR(50)
);

-- Tabla: cita
CREATE TABLE cita (
    id_cita INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_barbero INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente',
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_barbero) REFERENCES barbero(id_barbero)
);

-- Tabla: detalle_cita
CREATE TABLE detalle_cita (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_cita INT NOT NULL,
    id_servicio INT NOT NULL,
    precio_aplicado DECIMAL(10,2),
    FOREIGN KEY (id_cita) REFERENCES cita(id_cita),
    FOREIGN KEY (id_servicio) REFERENCES servicio(id_servicio)
);

-- =====================================================
-- DATOS DE PRUEBA
-- =====================================================

INSERT INTO barbero (nombre, apellido, especialidad, telefono, fecha_contratacion, activo) VALUES
('Carlos', 'Martínez', 'Cortes clásicos', '555-1001', '2020-01-15', TRUE),
('Juan', 'González', 'Barbas', '555-1002', '2019-06-20', TRUE),
('Pedro', 'Sánchez', 'Cortes modernos', '555-1003', '2021-03-10', TRUE),
('Ana', 'López', 'Peinados', '555-1004', '2023-02-15', FALSE);

INSERT INTO cliente (nombre, apellido, telefono, email, vip, fecha_registro) VALUES
('Roberto', 'García', '555-2001', 'roberto@email.com', TRUE, '2023-01-10'),
('Javier', 'López', '555-2002', 'javier@email.com', FALSE, '2023-02-15'),
('Mario', 'Pérez', '555-2003', 'mario@email.com', TRUE, '2023-03-20'),
('Fernando', 'Torres', '555-2004', 'fernando@email.com', FALSE, '2023-04-25'),
('Ricardo', 'Ruiz', '555-2005', 'ricardo@email.com', FALSE, '2023-05-30'),
('Sergio', 'Ramírez', '555-2006', 'sergio@email.com', TRUE, '2023-06-05');

INSERT INTO servicio (nombre, precio, duracion_minutos, categoria) VALUES
('Corte de cabello', 250.00, 30, 'cabello'),
('Arreglo de barba', 180.00, 20, 'barba'),
('Corte + Barba', 380.00, 45, 'paquete'),
('Afeitado clásico', 220.00, 35, 'barba'),
('Corte infantil', 200.00, 25, 'cabello'),
('Tinte completo', 550.00, 90, 'color'),
('Tratamiento capilar', 300.00, 40, 'tratamiento');

INSERT INTO cita (id_cliente, id_barbero, fecha, hora, estado) VALUES
(1, 1, '2024-01-10', '10:00:00', 'completada'),
(1, 1, '2024-01-24', '10:00:00', 'completada'),
(2, 2, '2024-01-15', '11:30:00', 'completada'),
(2, 2, '2024-01-29', '11:30:00', 'cancelada'),
(3, 2, '2024-01-18', '09:00:00', 'completada'),
(3, 2, '2024-02-01', '09:00:00', 'completada'),
(4, 3, '2024-01-20', '12:00:00', 'completada'),
(5, 1, '2024-02-05', '14:30:00', 'completada'),
(6, 4, '2024-01-22', '17:00:00', 'completada'),
(1, 1, '2024-02-07', '10:00:00', 'completada'),
(3, 2, '2024-02-15', '09:00:00', 'pendiente'),
(2, 3, '2024-02-12', '16:00:00', 'completada');

INSERT INTO detalle_cita (id_cita, id_servicio, precio_aplicado) VALUES
(1, 1, 250.00), (1, 2, 180.00),
(2, 3, 380.00),
(3, 1, 250.00),
(4, 2, 180.00),
(5, 1, 250.00),
(6, 1, 250.00), (6, 2, 180.00),
(7, 3, 380.00),
(8, 1, 250.00),
(9, 6, 550.00),
(10, 1, 250.00), (10, 2, 180.00),
(11, 1, 250.00),
(12, 1, 250.00), (12, 4, 220.00);
