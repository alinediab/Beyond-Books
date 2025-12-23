// models/submitsModel.js
exports.insert = `INSERT INTO Submits (studentID, professorID, submissionDate, submissionType) VALUES (?, ?, ?, ?)`;
exports.selectByStudent = `SELECT * FROM Submits WHERE studentID = ?`;
exports.delete = `DELETE FROM Submits WHERE studentID = ? AND professorID = ?`;
