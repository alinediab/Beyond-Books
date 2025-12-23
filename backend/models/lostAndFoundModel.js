// Insert a new lost-and-found record
exports.insert = `
INSERT INTO LostAndFound (recordID, itemName, itemDescription, category, dateReported, status, studentAffairsOfficerID)
VALUES (?, ?, ?, ?, ?, ?, ?)
`;

// Select a single record by ID
exports.selectById = `
SELECT recordID, itemName, itemDescription, category, dateReported, status, studentAffairsOfficerID
FROM LostAndFound
WHERE recordID = ?
`;

// Select all records
exports.selectAll = `
SELECT recordID, itemName, itemDescription, category, dateReported, status, studentAffairsOfficerID
FROM LostAndFound
`;

// Update a record by ID (dynamic fields)
exports.updateById = (fields) => `UPDATE LostAndFound SET ${fields} WHERE recordID = ?`;

// Delete a record by ID
exports.deleteById = `DELETE FROM LostAndFound WHERE recordID = ?`;
