// models/managesModel.js

// Assign an officer to manage a lost-and-found record
exports.insert = `
INSERT INTO Manages (studentAffairsOfficerID, recordID)
VALUES (?, ?)
`;

// Get all records managed by a specific officer
exports.selectByOfficer = `
SELECT studentAffairsOfficerID, recordID
FROM Manages
WHERE studentAffairsOfficerID = ?
`;

// Remove management relation
exports.deleteByOfficerAndRecord = `
DELETE FROM Manages
WHERE studentAffairsOfficerID = ? AND recordID = ?
`;
