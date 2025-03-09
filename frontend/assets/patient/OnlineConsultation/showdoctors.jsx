import React, { useEffect, useState } from "react";
import "./showdoctors.css";
import PatientTopbar from "../Topbar/topbar";
import { useNavigate } from "react-router-dom";

function ShowDoctors() {
  const [professionalData, setProfessionalsData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfessional = async () => {
      try {
        const response = await fetch(
          "http://localhost:3003/api/display/getprofessional"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch professional data");
        }
        const data = await response.json();
        setProfessionalsData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfessional();
  }, []);

  // Function to find next available dates
  const getNextAvailableDates = (availableDays = []) => {
    if (!availableDays.length) return [];

    const daysOfWeek = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const today = new Date();
    const todayDay = today.getDay(); // 0 = Sunday, 6 = Saturday

    let nextDates = availableDays.map((day) => {
      const targetDay = daysOfWeek[day];
      if (targetDay === undefined) return null;

      let diff = targetDay - todayDay;
      if (diff <= 0) diff += 7; // Get the next occurrence

      const nextDate = new Date();
      nextDate.setDate(today.getDate() + diff);

      return {
        day,
        date: nextDate.toISOString().split("T")[0], // Format YYYY-MM-DD
      };
    });

    return nextDates.filter(Boolean).slice(0, 3); // Ensure valid dates & limit to 3
  };

  // Function to generate time slots
  const generateTimeSlots = (startTime, endTime, selectedDate) => {
    if (!startTime || !endTime) return []; // Ensure valid times

    const slots = [];
    const now = new Date();
    const isToday =
      new Date(selectedDate).toDateString() === now.toDateString();

    let currentTime = new Date(`${selectedDate}T${startTime}`);
    const end = new Date(`${selectedDate}T${endTime}`);

    while (currentTime < end) {
      const slotStart = currentTime.toTimeString().substring(0, 5);
      currentTime.setMinutes(currentTime.getMinutes() + 30);
      if (currentTime > end) break;
      const slotEnd = currentTime.toTimeString().substring(0, 5);

      if (!isToday || currentTime > now) {
        slots.push(`${slotStart} - ${slotEnd}`);
      }

      currentTime.setMinutes(currentTime.getMinutes() + 15); // 15 min break
    }

    return slots.slice(0, 3); // Only return first 4 slots
  };

  return (
    <div className="doctor-container">
      <div className="doctor-container-submain">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          professionalData.map((professional, index) => {
            if (!professional.availableDays || !professional.availability)
              return null;

            const availableDates = getNextAvailableDates(
              professional.availableDays
            );

            return (
              <div className="display_professional_card" key={index}>
                <div className="professional_left">
                  <div className="professional_image">
                    <img src={professional.photoUrl} alt={professional.name} />
                  </div>
                  <div className="professional_basic_info">
                    <h3>{professional.name}</h3>
                    <p>Experience: {professional.experience} years</p>
                    <p>Profession: {professional.profession}</p>
                    {professional.specialization && (
                      <p>Specialization: {professional.specialization}</p>
                    )}
                  </div>
                </div>
                <div className="professional_right">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Available Time</th>
                        <th>Available Schedule</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableDates.map((dateInfo, idx) => {
                        const timeSlots = generateTimeSlots(
                          professional.availability.startTime,
                          professional.availability.endTime,
                          dateInfo.date
                        );

                        return (
                          <tr key={idx}>
                            <td>
                              {dateInfo.date} ({dateInfo.day})
                            </td>
                            <td>
                              {professional.availability.startTime} -{" "}
                              {professional.availability.endTime}
                            </td>
                            <td className="time-slot">
                              {timeSlots.length > 0 ? (
                                timeSlots.map((slot, sIdx) => (
                                  <p
                                    key={sIdx}
                                    className="available_slots"
                                    onClick={() =>
                                      navigate("/bookAppointment", {
                                        state: {
                                          slot,
                                          date: dateInfo.date,
                                          day: dateInfo.day,
                                          professional: professional.name,
                                          experience: professional.experience,
                                          profession: professional.profession,
                                          specialization:
                                            professional.specialization
                                              ? professional.specialization
                                              : "",
                                          photoUrl: professional.photoUrl,
                                        },
                                      })
                                    }
                                  >
                                    {slot}
                                  </p>
                                ))
                              ) : (
                                <span>No Available Slots</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="see_schedule_button">
                    <p>Check other schedule times</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ShowDoctors;
