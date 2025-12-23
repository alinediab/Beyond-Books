// models/researchProjectModel.js

// Insert a new research project
exports.insert = `
INSERT INTO ResearchProject (projectID, title, description, professorID)
VALUES (?, ?, ?, ?)
`;

// Select a project by ID
exports.selectById = `
SELECT projectID, title, description, professorID
FROM ResearchProject
WHERE projectID = ?
`;

// Select all projects
exports.selectAll = `
SELECT projectID, title, description, professorID
FROM ResearchProject
`;

// Update a project by ID (dynamic fields)
exports.updateById = (fields) =>
  `UPDATE ResearchProject SET ${fields} WHERE projectID = ?`;

// Delete a project by ID
exports.deleteById = `
DELETE FROM ResearchProject
WHERE projectID = ?
`;
