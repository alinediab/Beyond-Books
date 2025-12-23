// Insert a new internship
exports.insert = `
INSERT INTO Internship (internshipID, companyName, location, description, startDate, endDate, duration, duration_unit)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

// Select a single internship by ID
exports.selectById = `
SELECT internshipID, companyName, location, description, startDate, endDate, duration, duration_unit as durationUnit
FROM Internship
WHERE internshipID = ?
`;

// Select all internships
exports.selectAll = `
SELECT internshipID, companyName, location, description, startDate, endDate, duration, duration_unit as durationUnit
FROM Internship
`;

// Update an internship by ID (dynamic fields)
exports.updateById = (fields) => `UPDATE Internship SET ${fields} WHERE internshipID = ?`;

// Delete an internship by ID
exports.deleteById = `DELETE FROM Internship WHERE internshipID = ?`;
