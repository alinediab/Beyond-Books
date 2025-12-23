// models/professorModel.js
exports.insert = `
INSERT INTO Professor (firstName, lastName, email, officeHours, officeLocation, facultyName, password)
VALUES (?, ?, ?, ?, ?, ?, ?)
`;

exports.selectById = `SELECT professorID, firstName, lastName, email, phoneNumber, officeHours, officeLocation, facultyName FROM Professor WHERE professorID = ?`;
exports.selectAll = `SELECT professorID, firstName, lastName, email, phoneNumber, officeHours, officeLocation, facultyName FROM Professor`;
exports.selectByEmail = `SELECT professorID, password FROM Professor WHERE email = ?`;
exports.updateById = (fields) => `UPDATE Professor SET ${fields} WHERE professorID = ?`;
exports.deleteById = `DELETE FROM Professor WHERE professorID = ?`;