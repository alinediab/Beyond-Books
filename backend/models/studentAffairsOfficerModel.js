// models/studentAffairsOfficerModel.js
exports.insert = `
INSERT INTO StudentAffairsOfficer (studentAffairsOfficerID, firstName, lastName, email, phoneNumber, staffDepartment, password)
VALUES (?, ?, ?, ?, ?, ?, ?)
`;
exports.selectById = `SELECT studentAffairsOfficerID, firstName, lastName, email, phoneNumber, staffDepartment FROM StudentAffairsOfficer WHERE studentAffairsOfficerID = ?`;
exports.selectByEmail = `SELECT studentAffairsOfficerID, password FROM StudentAffairsOfficer WHERE email = ?`;
exports.updateById = (fields) => `UPDATE StudentAffairsOfficer SET ${fields} WHERE studentAffairsOfficerID = ?`;
exports.deleteById = `DELETE FROM StudentAffairsOfficer WHERE studentAffairsOfficerID = ?`;
