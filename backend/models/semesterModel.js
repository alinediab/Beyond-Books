// models/semesterModel.js

exports.insert = `
    INSERT INTO Semester (semesterID, year, semesterName, startDate, endDate)
    VALUES (?, ?, ?, ?, ?)
`;

exports.selectById = `
    SELECT semesterID, year, semesterName, startDate, endDate
    FROM Semester
    WHERE semesterID = ?
`;

exports.selectAll = `
    SELECT semesterID, year, semesterName, startDate, endDate
    FROM Semester
`;

exports.updateById = (fields) => `
    UPDATE Semester
    SET ${fields}
    WHERE semesterID = ?
`;

exports.deleteById = `
    DELETE FROM Semester
    WHERE semesterID = ?
`;
