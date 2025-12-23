// models/joinsModel.js
exports.insert = `INSERT INTO Joins (studentID, clubID, joinDate, role) VALUES (?, ?, ?, ?)`;
exports.selectByStudent = `SELECT * FROM Joins WHERE studentID = ?`;
exports.delete = `DELETE FROM Joins WHERE studentID = ? AND clubID = ?`;
