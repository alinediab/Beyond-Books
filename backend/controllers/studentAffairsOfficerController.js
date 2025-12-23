// controllers/studentAffairsOfficerController.js
const db = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

exports.getOfficerById = asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT studentAffairsOfficerID, firstName, lastName, email, phoneNumber, staffDepartment FROM StudentAffairsOfficer WHERE studentAffairsOfficerID = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: rows[0] });
});

exports.getOfficers = asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT studentAffairsOfficerID, firstName, lastName, email, phoneNumber, staffDepartment FROM StudentAffairsOfficer');
  res.json({ success: true, data: rows });
});

exports.updateOfficer = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const updates = [];
  const params = [];
  for (const key of ['firstName','lastName','phoneNumber','staffDepartment']) {
    if (req.body[key] !== undefined) {
      // Convert empty strings to null, keep other values as-is
      let value = req.body[key];
      if (value === '' || value === null || value === undefined) {
        value = null;
      } else {
        // Ensure phoneNumber is always a string (not a number)
        if (key === 'phoneNumber') {
          value = String(value).trim();
        }
      }
      updates.push(`${key} = ?`);
      params.push(value);
    }
  }
  if (!updates.length) return res.status(400).json({ success: false, message: 'No fields to update' });
  params.push(id);
  const sql = `UPDATE StudentAffairsOfficer SET ${updates.join(', ')} WHERE studentAffairsOfficerID = ?`;
  try {
    await db.query(sql, params);
    const [rows] = await db.query('SELECT studentAffairsOfficerID, firstName, lastName, email, phoneNumber, staffDepartment FROM StudentAffairsOfficer WHERE studentAffairsOfficerID = ?', [id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Update officer error:', err);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    console.error('SQL:', sql);
    console.error('Params:', params);
    // Return a more helpful error message
    if (err.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD' || err.code === 'ER_WRONG_VALUE_FOR_TYPE') {
      return res.status(400).json({ success: false, message: `Invalid value for one of the fields: ${err.message}` });
    }
    throw err;
  }
});

exports.deleteOfficer = asyncHandler(async (req, res) => {
  await db.query('DELETE FROM StudentAffairsOfficer WHERE studentAffairsOfficerID = ?', [req.params.id]);
  res.json({ success: true, message: 'Officer deleted' });
});

// Get Student Affairs Officer statistics (managed clubs, recommended internships, lost & found items)
exports.getOfficerStats = asyncHandler(async (req, res) => {
  const officerID = req.params.id;
  
  console.log('Getting stats for officerID:', officerID);

  // Count managed clubs (all clubs since StudentAffairsOfficer manages all clubs)
  const [clubsRows] = await db.query(
    `SELECT COUNT(*) as count 
     FROM Club`,
    []
  );
  const managedClubs = clubsRows[0]?.count || 0;

  // Count recommended internships (internships that have been recommended by professors)
  const [recommendationsRows] = await db.query(
    `SELECT COUNT(DISTINCT internshipID) as count 
     FROM Recommends`,
    []
  );
  const recommendedInternships = recommendationsRows[0]?.count || 0;

  // Count lost & found items (items created/managed by this specific officer)
  // Convert officerID to integer for comparison (handles both string and number formats)
  const officerIDInt = parseInt(officerID);
  const [lostFoundRows] = await db.query(
    `SELECT COUNT(*) as count 
     FROM LostAndFound 
     WHERE studentAffairsOfficerID = ?`,
    [officerIDInt]
  );
  const lostFoundItems = lostFoundRows[0]?.count || 0;
  
  console.log('Stats for officerID:', officerID, '->', { managedClubs, recommendedInternships, lostFoundItems });

  res.json({ 
    success: true, 
    data: { 
      managedClubs, 
      recommendedInternships, 
      lostFoundItems 
    } 
  });
});
