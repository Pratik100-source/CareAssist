const crypto = require("crypto");

const createJitsiMeetLink = async (booking) => {
  const meetingId = crypto.randomBytes(16).toString("hex");
  const meetLink = `https://meet.jit.si/${meetingId}`;
  return meetLink;
};

module.exports = { createJitsiMeetLink };
