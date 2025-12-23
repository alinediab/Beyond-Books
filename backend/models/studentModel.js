
exports.insert = `
INSERT INTO Student (firstName, lastName, universityMail, phoneNumber, major, departmentName, password)
VALUES (?, ?, ?, ?, ?, ?, ?)
`;

exports.selectById = `SELECT studentID, firstName, lastName, universityMail, phoneNumber, major, departmentName FROM Student WHERE studentID = ?`;

exports.selectAll = `SELECT studentID, firstName, lastName, universityMail, phoneNumber, major, departmentName FROM Student`;

exports.selectByEmail = `SELECT studentID, password FROM Student WHERE universityMail = ?`;

exports.updateById = (fields) => `UPDATE Student SET ${fields} WHERE studentID = ?`;

exports.deleteById = `DELETE FROM Student WHERE studentID = ?`;

//Get all internships that students has applied to
exports.selectApplications = `
SELECT a.studentID, a.internshipID, a.applicationDate, a.status,
       i.companyName, i.location, i.startDate, i.endDate
FROM Applies a
JOIN Internship i ON a.internshipID = i.internshipID
WHERE a.studentID = ?
`;
