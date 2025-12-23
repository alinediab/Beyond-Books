// models/registerInModel.js
exports.insert = `INSERT INTO RegisterIn (studentID, semesterID) VALUES (?, ?)`;
exports.selectByStudent = `SELECT r.*, s.year, s.semesterName FROM RegisterIn r JOIN Semester s ON r.semesterID = s.semesterID WHERE r.studentID = ?`;
exports.delete = `DELETE FROM RegisterIn WHERE studentID = ? AND semesterID = ?`;
