// controllers/eventController.js
const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { createCRUDController } = require('./baseController');

const eventController = createCRUDController({
  tableName: 'Event',
  idField: 'eventID',
  selectFields: 'eventID, eventName, eventDescription, eventDate, startTime, endTime, location, duration, durationUnit, semesterID, clubID',
  insertFields: ['eventName', 'eventDescription', 'eventDate', 'startTime', 'endTime', 'location', 'duration', 'durationUnit', 'semesterID', 'clubID'],
  allowedUpdateFields: ['eventName', 'eventDescription', 'eventDate', 'startTime', 'endTime', 'location', 'duration', 'durationUnit', 'semesterID', 'clubID'],
  resourceName: 'Event'
});

// Override list to include attendee count and filter future events
exports.listEvents = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT e.eventID, e.eventName, e.eventDescription, e.eventDate, e.startTime, e.endTime, e.location, e.duration, e.durationUnit, e.semesterID, e.clubID,
     (SELECT COUNT(*) FROM Attends WHERE eventID = e.eventID) as attendeeCount
     FROM Event e
     WHERE e.eventDate >= CURDATE()
     ORDER BY e.eventDate ASC`
  );
  res.json({ success: true, data: rows });
});

// Get events by club
exports.getEventsByClub = asyncHandler(async (req, res) => {
  const { clubId } = req.params;
  const eventModel = require('../models/eventModel');
  const [rows] = await db.query(eventModel.selectByClub, [clubId]);
  res.json({ success: true, data: rows });
});

// Override create to generate eventID and handle clubID
exports.createEvent = asyncHandler(async (req, res) => {
  const { eventName, eventDescription, eventDate, startTime, endTime, location, duration, durationUnit, semesterID, clubID } = req.body;
  
  // Validation: Event name is required
  if (!eventName || eventName.trim() === '') {
    return res.status(400).json({ success: false, message: 'Event name is required' });
  }

  // Validation: Event date is required
  if (!eventDate) {
    return res.status(400).json({ success: false, message: 'Event date is required' });
  }

  // Validation: Check if event date is in the past
  const eventDateObj = new Date(eventDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
  eventDateObj.setHours(0, 0, 0, 0);
  
  if (eventDateObj < today) {
    return res.status(400).json({ success: false, message: 'Event date cannot be in the past' });
  }

  // Validation: If both times are provided, start time must be before end time
  if (startTime && endTime && startTime.trim() !== '' && endTime.trim() !== '') {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    // Validate time format
    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
      return res.status(400).json({ success: false, message: 'Invalid time format. Use HH:MM format' });
    }
    
    // Validate time ranges
    if (startH < 0 || startH > 23 || startM < 0 || startM > 59 || endH < 0 || endH > 23 || endM < 0 || endM > 59) {
      return res.status(400).json({ success: false, message: 'Invalid time values. Hours must be 0-23, minutes must be 0-59' });
    }
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    
    if (startMinutes >= endMinutes) {
      return res.status(400).json({ success: false, message: 'Start time must be before end time' });
    }
  }

  // Generate a unique integer eventID
  let eventID;
  let exists = true;
  let attempts = 0;
  while (exists && attempts < 100) {
    eventID = Math.floor(10000000 + Math.random() * 90000000);
    const [rows] = await db.query('SELECT eventID FROM Event WHERE eventID = ?', [eventID]);
    exists = rows.length > 0;
    attempts++;
  }
  
  if (exists) {
    return res.status(500).json({ success: false, message: 'Failed to generate unique event ID' });
  }

  // Format time values for DATETIME columns - combine date and time
  const formatDateTime = (date, time) => {
    if (!date || !time || time.trim() === '') return null;
    // Format time to HH:MM:SS
    let formattedTime = time;
    if (time.match(/^\d{2}:\d{2}$/)) {
      formattedTime = time + ':00';
    } else if (!time.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return null; // Invalid time format
    }
    // Combine date and time: 'YYYY-MM-DD HH:MM:SS'
    return `${date} ${formattedTime}`;
  };

  await db.query(
    'INSERT INTO Event (eventID, eventName, eventDescription, eventDate, startTime, endTime, location, duration, durationUnit, semesterID, clubID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      eventID,
      eventName,
      eventDescription && eventDescription.trim() !== '' ? eventDescription : null,
      eventDate || null,
      formatDateTime(eventDate, startTime),
      formatDateTime(eventDate, endTime),
      location && location.trim() !== '' ? location : null,
      duration ? parseInt(duration) : null,
      durationUnit || null,
      semesterID || null,
      clubID ? parseInt(clubID) : null
    ]
  );

  const [rows] = await db.query(
    'SELECT eventID, eventName, eventDescription, eventDate, startTime, endTime, location, duration, durationUnit, semesterID, clubID FROM Event WHERE eventID = ?',
    [eventID]
  );

  res.status(201).json({ success: true, data: rows[0] });
});

exports.getEvent = eventController.get;

// Override update to handle clubID
exports.updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { eventName, eventDescription, eventDate, startTime, endTime, location, duration, durationUnit, semesterID, clubID } = req.body;

  // Get current event data for validation
  const [currentEventRows] = await db.query('SELECT eventDate, startTime, endTime FROM Event WHERE eventID = ?', [id]);
  if (!currentEventRows || currentEventRows.length === 0) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  const currentEvent = currentEventRows[0];
  let currentEventDate = eventDate !== undefined ? eventDate : currentEvent.eventDate;
  
  // Convert current event date to YYYY-MM-DD format if needed
  if (currentEventDate instanceof Date) {
    currentEventDate = currentEventDate.toISOString().split('T')[0];
  } else if (typeof currentEventDate === 'string') {
    currentEventDate = currentEventDate.split('T')[0];
  }

  // Validation: If event name is being updated, it cannot be empty
  if (eventName !== undefined && (!eventName || eventName.trim() === '')) {
    return res.status(400).json({ success: false, message: 'Event name cannot be empty' });
  }

  // Validation: If event date is being updated, check if it's in the past
  if (eventDate !== undefined) {
    const eventDateObj = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDateObj.setHours(0, 0, 0, 0);
    
    if (eventDateObj < today) {
      return res.status(400).json({ success: false, message: 'Event date cannot be in the past' });
    }
    currentEventDate = eventDate;
  }

  // Helper function to extract time from datetime string or return time string
  const extractTime = (datetimeValue) => {
    if (!datetimeValue) return null;
    if (typeof datetimeValue === 'string') {
      // If it's already just time (HH:MM or HH:MM:SS)
      if (datetimeValue.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
        return datetimeValue;
      }
      // If it's datetime string, extract time part
      const parts = datetimeValue.split(' ');
      if (parts.length > 1) {
        return parts[1].substring(0, 5); // Get HH:MM part
      }
      // If it's datetime without space (YYYY-MM-DDTHH:MM:SS)
      const tIndex = datetimeValue.indexOf('T');
      if (tIndex !== -1) {
        return datetimeValue.substring(tIndex + 1, tIndex + 6); // Get HH:MM part
      }
    }
    return null;
  };

  // Validation: If both times are provided, start time must be before end time
  const finalStartTime = startTime !== undefined ? startTime : extractTime(currentEvent.startTime);
  const finalEndTime = endTime !== undefined ? endTime : extractTime(currentEvent.endTime);

  if (finalStartTime && finalEndTime && finalStartTime.trim() !== '' && finalEndTime.trim() !== '') {
    const [startH, startM] = finalStartTime.split(':').map(Number);
    const [endH, endM] = finalEndTime.split(':').map(Number);
    
    // Validate time format
    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
      return res.status(400).json({ success: false, message: 'Invalid time format. Use HH:MM format' });
    }
    
    // Validate time ranges
    if (startH < 0 || startH > 23 || startM < 0 || startM > 59 || endH < 0 || endH > 23 || endM < 0 || endM > 59) {
      return res.status(400).json({ success: false, message: 'Invalid time values. Hours must be 0-23, minutes must be 0-59' });
    }
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    
    if (startMinutes >= endMinutes) {
      return res.status(400).json({ success: false, message: 'Start time must be before end time' });
    }
  }

  // Format time values for DATETIME columns - combine date and time
  const formatDateTime = (date, time) => {
    if (!date || !time || time.trim() === '') return null;
    // Format time to HH:MM:SS
    let formattedTime = time;
    if (time.match(/^\d{2}:\d{2}$/)) {
      formattedTime = time + ':00';
    } else if (!time.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return null; // Invalid time format
    }
    // Combine date and time: 'YYYY-MM-DD HH:MM:SS'
    return `${date} ${formattedTime}`;
  };

  const updates = [];
  const params = [];

  if (eventName !== undefined) {
    updates.push('eventName = ?');
    params.push(eventName);
  }
  if (eventDescription !== undefined) {
    updates.push('eventDescription = ?');
    params.push(eventDescription && eventDescription.trim() !== '' ? eventDescription : null);
  }
  if (eventDate !== undefined) {
    updates.push('eventDate = ?');
    params.push(eventDate || null);
  }
  if (startTime !== undefined) {
    updates.push('startTime = ?');
    params.push(formatDateTime(currentEventDate, startTime));
  }
  if (endTime !== undefined) {
    updates.push('endTime = ?');
    params.push(formatDateTime(currentEventDate, endTime));
  }
  if (location !== undefined) {
    updates.push('location = ?');
    params.push(location && location.trim() !== '' ? location : null);
  }
  if (duration !== undefined) {
    updates.push('duration = ?');
    params.push(duration ? parseInt(duration) : null);
  }
  if (durationUnit !== undefined) {
    updates.push('durationUnit = ?');
    params.push(durationUnit || null);
  }
  if (semesterID !== undefined) {
    updates.push('semesterID = ?');
    params.push(semesterID || null);
  }
  if (clubID !== undefined) {
    updates.push('clubID = ?');
    params.push(clubID ? parseInt(clubID) : null);
  }

  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update' });
  }

  params.push(id);

  await db.query(
    `UPDATE Event SET ${updates.join(', ')} WHERE eventID = ?`,
    params
  );

  const [rows] = await db.query(
    'SELECT eventID, eventName, eventDescription, eventDate, startTime, endTime, location, duration, durationUnit, semesterID, clubID FROM Event WHERE eventID = ?',
    [id]
  );

  if (!rows.length) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  res.json({ success: true, data: rows[0] });
});

exports.deleteEvent = eventController.delete;