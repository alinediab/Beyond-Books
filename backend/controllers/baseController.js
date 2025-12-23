const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { ERROR_MESSAGES } = require('../utils/constants');

/**
 * Generic CRUD controller factory
 * @param {Object} config - Configuration object
 * @param {string} config.tableName - Database table name
 * @param {string} config.idField - Primary key field name
 * @param {string} config.selectFields - Fields to select (comma-separated)
 * @param {Array} config.insertFields - Fields for insert (excluding ID)
 * @param {Array} config.allowedUpdateFields - Fields allowed for update
 * @param {string} config.resourceName - Resource name for error messages
 */
exports.createCRUDController = (config) => {
  const {
    tableName,
    idField,
    selectFields,
    insertFields,
    allowedUpdateFields,
    resourceName = 'Resource'
  } = config;

  return {
    // Create
    create: asyncHandler(async (req, res) => {
      const values = insertFields.map(field => req.body[field] || null);
      const placeholders = insertFields.map(() => '?').join(', ');
      const fieldNames = insertFields.join(', ');
      
      const [result] = await db.query(
        `INSERT INTO ${tableName} (${fieldNames}) VALUES (${placeholders})`,
        values
      );
      
      const [rows] = await db.query(
        `SELECT ${selectFields} FROM ${tableName} WHERE ${idField} = ?`,
        [result.insertId]
      );
      
      res.status(201).json({
        success: true,
        data: rows[0] || rows
      });
    }),

    // Get by ID
    get: asyncHandler(async (req, res) => {
      const id = req.params.id;
      const [rows] = await db.query(
        `SELECT ${selectFields} FROM ${tableName} WHERE ${idField} = ?`,
        [id]
      );
      
      if (!rows.length) {
        return res.status(404).json({
          success: false,
          message: `${resourceName} not found`
        });
      }
      
      res.json({
        success: true,
        data: rows[0]
      });
    }),

    // List all
    list: asyncHandler(async (req, res) => {
      const [rows] = await db.query(
        `SELECT ${selectFields} FROM ${tableName}`
      );
      
      res.json({
        success: true,
        data: rows
      });
    }),

    // Update
    update: asyncHandler(async (req, res) => {
      const id = req.params.id;
      const updates = [];
      const params = [];
      
      allowedUpdateFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates.push(`${field} = ?`);
          params.push(req.body[field]);
        }
      });
      
      if (!updates.length) {
        return res.status(400).json({
          success: false,
          message: ERROR_MESSAGES.NO_FIELDS_TO_UPDATE
        });
      }
      
      params.push(id);
      const sql = `UPDATE ${tableName} SET ${updates.join(', ')} WHERE ${idField} = ?`;
      await db.query(sql, params);
      
      const [rows] = await db.query(
        `SELECT ${selectFields} FROM ${tableName} WHERE ${idField} = ?`,
        [id]
      );
      
      res.json({
        success: true,
        data: rows[0]
      });
    }),

    // Delete
    delete: asyncHandler(async (req, res) => {
      const id = req.params.id;
      await db.query(
        `DELETE FROM ${tableName} WHERE ${idField} = ?`,
        [id]
      );
      
      res.json({
        success: true,
        message: `${resourceName} deleted successfully`
      });
    })
  };
};

