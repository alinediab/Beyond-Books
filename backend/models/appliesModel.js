// models/appliesModel.js
exports.insert = `INSERT INTO Applies (studentID, internshipID, applicationDate, status) VALUES (?, ?, ?, ?)`;
exports.selectByStudent = `SELECT a.*, i.companyName, i.location FROM Applies a JOIN Internship i ON a.internshipID = i.internshipID WHERE a.studentID = ?`;
exports.delete = `DELETE FROM Applies WHERE studentID = ? AND internshipID = ?`;
