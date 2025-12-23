// Insert a new event
exports.insert = `
INSERT INTO Event (eventID, eventName, eventDescription, eventDate, startTime, endTime, location, duration, durationUnit, clubID, semesterID)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

// Select a single event by ID
exports.selectById = `
SELECT eventID, eventName, eventDescription, eventDate, startTime, endTime, location, duration, durationUnit, clubID, semesterID
FROM Event
WHERE eventID = ?
`;

// Select all events
exports.selectAll = `
SELECT eventID, eventName, eventDescription, eventDate, startTime, endTime, location, duration, durationUnit, clubID, semesterID
FROM Event
`;

// Select events by club, with attendee count
exports.selectByClub = `
SELECT e.eventID, e.eventName, e.eventDescription, e.eventDate, e.startTime, e.endTime, e.location, e.duration, e.durationUnit, e.clubID, e.semesterID,
       (SELECT COUNT(*) FROM Attends WHERE eventID = e.eventID) as attendeeCount
FROM Event e
WHERE e.clubID = ?
ORDER BY e.eventDate DESC
`;

// Update an event by ID (dynamic fields)
exports.updateById = (fields) => `UPDATE Event SET ${fields} WHERE eventID = ?`;

// Delete an event by ID
exports.deleteById = `DELETE FROM Event WHERE eventID = ?`;