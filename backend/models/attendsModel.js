// models/attendsModel.js
exports.insert = `INSERT INTO Attends (studentID, eventID) VALUES (?, ?)`;
exports.selectByStudent = `SELECT a.eventID, e.eventName, e.eventDate FROM Attends a JOIN Event e ON a.eventID = e.eventID WHERE a.studentID = ?`;
exports.delete = `DELETE FROM Attends WHERE studentID = ? AND eventID = ?`;
