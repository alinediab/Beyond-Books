// models/conductsModel.js
exports.insert = `INSERT INTO Conducts (studentID, projectID, appliedDate) VALUES (?, ?, ?)`;
exports.selectByStudent = `SELECT * FROM Conducts WHERE studentID = ?`;
exports.delete = `DELETE FROM Conducts WHERE studentID = ? AND projectID = ?`;
