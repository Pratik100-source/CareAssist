const cron = require("node-cron");
const OBooking = require("./models/onlinebooking");
const NepaliDate = require("nepali-datetime");
const emailController = require("./controllers/emailController");
const { createJitsiMeetLink } = require("./jitsiMeet");

// Check for bookings 10 minutes ahead and current bookings in NPT with Gregorian date
cron.schedule("* * * * *", async () => {
  const now = new NepaliDate(); // Current date and time in NPT (Nepali calendar)
  const futureTime = new NepaliDate(now.getTime() + 10 * 60 * 1000); // 10 minutes ahead in NPT

  const formattedDate = futureTime.formatEnglishDate("YYYY-MM-DD"); // Gregorian date (e.g., 2025-03-15)
  const targetStartTime = futureTime.format("HH:mm"); // NPT time (e.g., 00:17)
  const currentDate = now.formatEnglishDate("YYYY-MM-DD");
  const currentTime = now.format("HH:mm");

  console.log(
    `Cron job running at ${now.format(
      "YYYY-MM-DD HH:mm:ss"
    )} (BS, NPT), targeting ${formattedDate} ${targetStartTime} (AD, NPT)`
  );

  try {
    // First, update status to Ongoing for current appointments
    const startingAppointments = await OBooking.updateMany(
      {
        date: currentDate,
        startTime: currentTime,
        status: "Pending"
      },
      { status: "Ongoing" }
    );

    if (startingAppointments.modifiedCount > 0) {
      console.log(`${startingAppointments.modifiedCount} appointments marked as Ongoing`);
    }

    // Then, handle upcoming appointments that need meet links
    const upcomingAppointments = await OBooking.find({
      date: formattedDate,
      startTime: targetStartTime,
      meetLink: null,
      status: "Pending",
    });

    console.log(`Found ${upcomingAppointments.length} upcoming appointments`);
    console.log("Appointments:", JSON.stringify(upcomingAppointments, null, 2));

    for (let booking of upcomingAppointments) {
      console.log(
        `Processing booking ${booking._id}, startTime: ${booking.startTime} (NPT)`
      );
      const meetLink = await createJitsiMeetLink(booking);
      if (meetLink) {
        await OBooking.updateOne({ _id: booking._id }, { meetLink });
        console.log(
          `Meet link created for ${booking.patientEmail}: ${meetLink}`
        );

        const emailSubject = "Your Appointment Video Call Link";
        const emailBody = `
          Hello,

          Your appointment details:
          - Patient: ${booking.patient || "N/A"}
          - Professional: ${booking.professional || "N/A"}
          - Date: ${booking.date} (Gregorian/AD)
          - Time: ${booking.startTime} - ${booking.endTime} (NPT)
          - Video Call Link: ${meetLink}

          Please click on the link to join your scheduled session.

          Regards,
          Healthcare Team
        `;

        try {
          await emailController.sendMeetLink(
            booking.patientEmail,
            emailSubject,
            emailBody
          );
          console.log(`Email sent to ${booking.patientEmail}`);
          await emailController.sendMeetLink(
            booking.professionalEmail,
            emailSubject,
            emailBody
          );
          console.log(`Email sent to ${booking.professionalEmail}`);
        } catch (emailError) {
          console.error(`Email sending failed: ${emailError.message}`);
        }
      } else {
        console.log(`Failed to create Meet link for booking ${booking._id}`);
      }
    }
  } catch (error) {
    console.error("Error in Meet link cron job:", error.message);
    console.error("Stack trace:", error.stack);
  }
});

// Mark bookings as "Completed" after they end in NPT with Gregorian date
cron.schedule("* * * * *", async () => {
  const now = new NepaliDate(); // Current date and time in NPT
  const formattedDate = now.formatEnglishDate("YYYY-MM-DD"); // Gregorian date
  const formattedTime = now.format("HH:mm"); // NPT time

  console.log(
    `Completion check at ${now.format(
      "YYYY-MM-DD HH:mm:ss"
    )} (BS, NPT), date: ${formattedDate}, time: ${formattedTime} (NPT)`
  );
  console.log(
    `Query: { date: "${formattedDate}", endTime: { $lte: "${formattedTime}" }, status: "Ongoing" }`
  );

  try {
    const pastAppointments = await OBooking.updateMany(
      {
        date: formattedDate,
        endTime: { $lte: formattedTime },
        status: "Ongoing",
      },
      { status: "Completed" }
    );
    if (pastAppointments.modifiedCount > 0) {
      console.log(
        `${
          pastAppointments.modifiedCount
        } appointments marked as Completed at ${now.format(
          "YYYY-MM-DD HH:mm:ss"
        )} (BS, NPT)`
      );
    } else {
      console.log("No appointments marked as Completed");
    }
  } catch (error) {
    console.error("Error in completion cron job:", error.message);
    console.error("Stack trace:", error.stack);
  }
});

module.exports = cron;
