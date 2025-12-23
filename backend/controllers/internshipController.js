// controllers/internshipController.js
const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { createCRUDController } = require('./baseController');

const internshipController = createCRUDController({
  tableName: 'Internship',
  idField: 'internshipID',
  selectFields: 'internshipID, companyName, location, description, startDate, endDate, duration, duration_unit as durationUnit',
  insertFields: ['companyName', 'location', 'description', 'startDate', 'endDate', 'duration', 'durationUnit'],
  allowedUpdateFields: ['companyName', 'location', 'description', 'startDate', 'endDate', 'duration', 'durationUnit'],
  resourceName: 'Internship'
});

// Override create to auto-generate internshipID and add validation
exports.createInternship = asyncHandler(async (req, res) => {
  const { companyName, location, description, startDate, endDate, duration, durationUnit } = req.body;
  
  // Validation: Company name is required
  if (!companyName || companyName.trim() === '') {
    return res.status(400).json({ success: false, message: 'Company name is required' });
  }

  // Validation: Location is required
  if (!location || location.trim() === '') {
    return res.status(400).json({ success: false, message: 'Location is required' });
  }

  // Validation: If both dates are provided, start date must be before end date
  if (startDate && endDate) {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    // Reset time to start of day for comparison
    startDateObj.setHours(0, 0, 0, 0);
    endDateObj.setHours(0, 0, 0, 0);
    
    if (startDateObj >= endDateObj) {
      return res.status(400).json({ success: false, message: 'Start date must be before end date' });
    }

    // Validation: Start date cannot be in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDateObj < today) {
      return res.status(400).json({ success: false, message: 'Start date cannot be in the past' });
    }
  }

  // Validation: If only start date is provided, it cannot be in the past
  if (startDate && !endDate) {
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDateObj < today) {
      return res.status(400).json({ success: false, message: 'Start date cannot be in the past' });
    }
  }

  // Validation: If only end date is provided, it cannot be in the past
  if (endDate && !startDate) {
    const endDateObj = new Date(endDate);
    endDateObj.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (endDateObj < today) {
      return res.status(400).json({ success: false, message: 'End date cannot be in the past' });
    }
  }

  // Generate unique internshipID (INT primary key - auto-increment in schema, but we'll use a number)
  let internshipID;
  let isUnique = false;
  let attempts = 0;
  const MAX_ATTEMPTS = 10;

  while (!isUnique && attempts < MAX_ATTEMPTS) {
    internshipID = Math.floor(10000000 + Math.random() * 90000000); // Random integer
    const [existing] = await db.query('SELECT internshipID FROM Internship WHERE internshipID = ?', [internshipID]);
    if (existing.length === 0) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    return res.status(500).json({ success: false, message: 'Failed to generate a unique internship ID' });
  }

  const [result] = await db.query(
    'INSERT INTO Internship (internshipID, companyName, location, description, startDate, endDate, duration, duration_unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      internshipID,
      companyName.trim(),
      location.trim(),
      description && description.trim() !== '' ? description.trim() : null,
      startDate || null,
      endDate || null,
      duration ? parseInt(duration) : null,
      durationUnit || null
    ]
  );

  const [rows] = await db.query(
    'SELECT internshipID, companyName, location, description, startDate, endDate, duration, duration_unit as durationUnit FROM Internship WHERE internshipID = ?',
    [internshipID]
  );

  res.status(201).json({
    success: true,
    data: rows[0] || rows
  });
});

exports.getInternship = internshipController.get;
exports.listInternships = internshipController.list;

// Override update to add validation
exports.updateInternship = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { companyName, location, description, startDate, endDate, duration, durationUnit } = req.body;

  // Get current internship data for validation
  const [currentInternshipRows] = await db.query('SELECT startDate, endDate FROM Internship WHERE internshipID = ?', [id]);
  if (!currentInternshipRows || currentInternshipRows.length === 0) {
    return res.status(404).json({ success: false, message: 'Internship not found' });
  }

  const currentInternship = currentInternshipRows[0];
  const finalStartDate = startDate !== undefined ? startDate : currentInternship.startDate;
  const finalEndDate = endDate !== undefined ? endDate : currentInternship.endDate;

  // Validation: If company name is being updated, it cannot be empty
  if (companyName !== undefined && (!companyName || companyName.trim() === '')) {
    return res.status(400).json({ success: false, message: 'Company name cannot be empty' });
  }

  // Validation: If location is being updated, it cannot be empty
  if (location !== undefined && (!location || location.trim() === '')) {
    return res.status(400).json({ success: false, message: 'Location cannot be empty' });
  }

  // Validation: If both dates are provided, start date must be before end date
  if (finalStartDate && finalEndDate) {
    const startDateObj = new Date(finalStartDate);
    const endDateObj = new Date(finalEndDate);
    
    startDateObj.setHours(0, 0, 0, 0);
    endDateObj.setHours(0, 0, 0, 0);
    
    if (startDateObj >= endDateObj) {
      return res.status(400).json({ success: false, message: 'Start date must be before end date' });
    }

    // Validation: Start date cannot be in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDateObj < today) {
      return res.status(400).json({ success: false, message: 'Start date cannot be in the past' });
    }
  }

  // Validation: If start date is being updated, it cannot be in the past
  if (startDate !== undefined) {
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDateObj < today) {
      return res.status(400).json({ success: false, message: 'Start date cannot be in the past' });
    }
  }

  // Validation: If end date is being updated, it cannot be in the past
  if (endDate !== undefined) {
    const endDateObj = new Date(endDate);
    endDateObj.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (endDateObj < today) {
      return res.status(400).json({ success: false, message: 'End date cannot be in the past' });
    }
  }

  // Use base controller update logic but with our validated data
  const updates = [];
  const params = [];

  if (companyName !== undefined) {
    updates.push('companyName = ?');
    params.push(companyName.trim());
  }
  if (location !== undefined) {
    updates.push('location = ?');
    params.push(location.trim());
  }
  if (description !== undefined) {
    updates.push('description = ?');
    params.push(description && description.trim() !== '' ? description.trim() : null);
  }
  if (startDate !== undefined) {
    updates.push('startDate = ?');
    params.push(startDate || null);
  }
  if (endDate !== undefined) {
    updates.push('endDate = ?');
    params.push(endDate || null);
  }
  if (duration !== undefined) {
    updates.push('duration = ?');
    params.push(duration ? parseInt(duration) : null);
  }
  if (durationUnit !== undefined) {
    updates.push('duration_unit = ?');
    params.push(durationUnit || null);
  }

  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update' });
  }

  params.push(id);

  await db.query(
    `UPDATE Internship SET ${updates.join(', ')} WHERE internshipID = ?`,
    params
  );

  const [rows] = await db.query(
    'SELECT internshipID, companyName, location, description, startDate, endDate, duration, duration_unit as durationUnit FROM Internship WHERE internshipID = ?',
    [id]
  );

  if (!rows.length) {
    return res.status(404).json({ success: false, message: 'Internship not found' });
  }

  res.json({ success: true, data: rows[0] });
});

exports.deleteInternship = internshipController.delete;
