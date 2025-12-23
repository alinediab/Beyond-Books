// models/clubModel.js
exports.insert = `INSERT INTO Club (clubID, clubName, description, meetingLocation, boardMemberID) VALUES (?, ?, ?, ?)`;
exports.selectById = `SELECT clubID, clubName, description, meetingLocation, boardMemberID FROM Club WHERE clubID = ?`;
exports.selectAll = `SELECT clubID, clubName, description, meetingLocation, boardMemberID FROM Club`;
exports.updateById = (fields) => `UPDATE Club SET ${fields} WHERE clubID = ?`;
exports.deleteById = `DELETE FROM Club WHERE clubID = ?`;
