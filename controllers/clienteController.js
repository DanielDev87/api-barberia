const {pool} = require('../config/databaseconfig');

//CREATE - Crear un nuevo cliente
const createClient = async(req, res)=>{
    try {
        const {nombre, apellido, telefono, email, vip } = req.body;
        if (!nombre || !apellido || !telefono) {
            return res.status(400).json({
                success: false,
                message: 'Los campos nombre, apellido y teléfono son requeridos'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO cliente (nombre, apellido, telefono, email, vip) 
            VALUES (?,?,?,?,?)`,
            [nombre, apellido, telefono, email, vip || false]
        );

        const [newCliente]= await pool.query(
            'SELECT * FROM cliente WHERE id_cliente = ?',
            [result.insertId]
        )

        res.status(201).json({
            success: true,
            message: 'Cliente creado exitosamente',
            data: newCliente[0]
        })


    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'El teléfono o email ya está registrado'
            });
        }
         res.status(500).json({
            success: false,
            message: 'Error al crear el cliente',
            error: error.message
        });
        
    }
}

// READ - Obtener todos los clientes
const getClientes = async (req, res) => {
    try {
        // Obtener todos los clientes con estadísticas de citas
        const [clientes] = await pool.query(`
            SELECT 
                c.id_cliente,
                c.nombre,
                c.apellido,
                c.telefono,
                c.email,
                c.vip,
                c.fecha_registro,
                COUNT(DISTINCT ct.id_cita) AS total_citas,
                COALESCE(SUM(dc.precio_aplicado), 0) AS total_gastado,
                MAX(ct.fecha) AS ultima_cita
            FROM cliente c
            LEFT JOIN cita ct ON c.id_cliente = ct.id_cliente AND ct.estado = 'completada'
            LEFT JOIN detalle_cita dc ON ct.id_cita = dc.id_cita
            GROUP BY c.id_cliente
            ORDER BY c.apellido, c.nombre
        `);
        
        res.json({
            success: true,
            count: clientes.length,
            data: clientes
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los clientes',
            error: error.message
        });
    }
};
// READ - Obtener un cliente por ID

const getClienteById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtener datos del cliente
        const [clientes] = await pool.query(`
            SELECT 
                c.*,
                COUNT(DISTINCT ct.id_cita) AS total_citas,
                COALESCE(SUM(dc.precio_aplicado), 0) AS total_gastado
            FROM cliente c
            LEFT JOIN cita ct ON c.id_cliente = ct.id_cliente AND ct.estado = 'completada'
            LEFT JOIN detalle_cita dc ON ct.id_cita = dc.id_cita
            WHERE c.id_cliente = ?
            GROUP BY c.id_cliente
        `, [id]);
        
        if (clientes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }
        
        // Obtener historial de citas del cliente
        const [citas] = await pool.query(`
            SELECT 
                ct.id_cita,
                ct.fecha,
                ct.hora,
                ct.estado,
                b.nombre AS barbero_nombre,
                b.apellido AS barbero_apellido,
                GROUP_CONCAT(s.nombre SEPARATOR ', ') AS servicios,
                SUM(dc.precio_aplicado) AS total
            FROM cita ct
            JOIN barbero b ON ct.id_barbero = b.id_barbero
            JOIN detalle_cita dc ON ct.id_cita = dc.id_cita
            JOIN servicio s ON dc.id_servicio = s.id_servicio
            WHERE ct.id_cliente = ?
            GROUP BY ct.id_cita
            ORDER BY ct.fecha DESC, ct.hora DESC
        `, [id]);
        
        res.json({
            success: true,
            data: {
                ...clientes[0],
                citas
            }
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el cliente',
            error: error.message
        });
    }
};
// UPDATE - Actualizar un cliente

const updateCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, telefono, email, vip } = req.body;
        
        // Verificar si el cliente existe
        const [existe] = await pool.query(
            'SELECT id_cliente FROM cliente WHERE id_cliente = ?',
            [id]
        );
        
        if (existe.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }
        
        // Construir la consulta dinámicamente
        const updates = [];
        const values = [];
        
        if (nombre !== undefined) {
            updates.push('nombre = ?');
            values.push(nombre);
        }
        if (apellido !== undefined) {
            updates.push('apellido = ?');
            values.push(apellido);
        }
        if (telefono !== undefined) {
            updates.push('telefono = ?');
            values.push(telefono);
        }
        if (email !== undefined) {
            updates.push('email = ?');
            values.push(email);
        }
        if (vip !== undefined) {
            updates.push('vip = ?');
            values.push(vip);
        }
                
        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No hay datos para actualizar'
            });
        }
        
        values.push(id);
        
        const [result] = await pool.query(
            `UPDATE cliente SET ${updates.join(', ')} WHERE id_cliente = ?`,
            values
        );
        
        // Obtener el cliente actualizado
        const [updatedCliente] = await pool.query(
            'SELECT * FROM cliente WHERE id_cliente = ?',
            [id]
        );
        
        res.json({
            success: true,
            message: 'Cliente actualizado exitosamente',
            data: updatedCliente[0]
        });
        
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'El teléfono o email ya está registrado por otro cliente'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el cliente',
            error: error.message
        });
    }
};

// DELETE - Eliminar un cliente

const deleteCliente = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si el cliente existe
        const [existe] = await pool.query(
            'SELECT id_cliente FROM cliente WHERE id_cliente = ?',
            [id]
        );
        
        if (existe.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }
        
        // Verificar si tiene citas (por la restricción FOREIGN KEY)
        const [citas] = await pool.query(
            'SELECT COUNT(*) as total FROM cita WHERE id_cliente = ?',
            [id]
        );
        
        if (citas[0].total > 0) {
            return res.status(400).json({
                success: false,
                message: `No se puede eliminar el cliente porque tiene ${citas[0].total} cita(s) asociada(s)`
            });
        }
        
        // Eliminar cliente
        const [result] = await pool.query(
            'DELETE FROM cliente WHERE id_cliente = ?',
            [id]
        );
        
        res.json({
            success: true,
            message: 'Cliente eliminado exitosamente',
            data: { id_cliente: parseInt(id) }
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el cliente',
            error: error.message
        });
    }
};

module.exports = {
    createClient,
    getClientes,
    getClienteById,
    updateCliente,
    deleteCliente
};