// models/authModel.js
// For central login queries (student/professor/studentAffairsOfficer)
exports.getStudentByEmail = `SELECT studentID AS id, password FROM Student WHERE universityMail = ?`;
exports.getProfessorByEmail = `SELECT professorID AS id, password FROM Professor WHERE email = ?`;
exports.getStudentAffairsByEmail = `SELECT studentAffairsOfficerID AS id, password FROM StudentAffairsOfficer WHERE email = ?`;
// Admin table if exists: add similar query
