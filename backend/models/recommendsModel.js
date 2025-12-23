// models/recommendsModel.js

// Professor recommends an internship
exports.insert = `
INSERT INTO Recommends (professorID, internshipID)
VALUES (?, ?)
`;

// Get internships recommended by a professor
exports.selectByProfessor = `
SELECT r.professorID, r.internshipID, i.companyName
FROM Recommends r
JOIN Internship i ON r.internshipID = i.internshipID
WHERE r.professorID = ?
`;

// Remove a recommendation
exports.deleteByProfessorAndInternship = `
DELETE FROM Recommends
WHERE professorID = ? AND internshipID = ?
`;
