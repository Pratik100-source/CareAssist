import React, { useEffect, useState} from "react";
import "./showdoctors.css";
import PatientTopbar from "../Topbar/topbar";
import { useNavigate } from "react-router-dom";
import { setProfessionalInfo, NotAvailable } from "../../../features/professionalSlice";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

function ShowDoctors() {
  const [professionalData, setProfessionalsData] = useState([]);
  const [bookingData, setBookingData] = useState([]); // New state for bookings
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch professionals
        const professionalResponse = await fetch(
          "http://localhost:3003/api/display/getprofessional"
        );
        if (!professionalResponse.ok) {
          throw new Error("Failed to fetch professional data");
        }
        const data = await professionalResponse.json();
        const professionalData = data.filter(professional=>(professional.consultationMethod==="online" || professional.consultationMethod==="both")&&(professional.status===true));
        setProfessionalsData(professionalData);

        // Fetch bookings
        const bookingResponse = await fetch(
          "http://localhost:3003/api/booking/get-online-booking" 
        );
        if (!bookingResponse.ok) {
          throw new Error("Failed to fetch booking data");
        }
        const bookingData = await bookingResponse.json();
        setBookingData(bookingData);

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const token = Date.now().toString().slice(-8);
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

  const generateTimeSlots = (startTime, endTime, selectedDate, professionalEmail) => {
    if (!startTime || !endTime) return [];

    const slots = [];
    const now = new Date();
    const isToday = new Date(selectedDate).toDateString() === now.toDateString();

    let currentTime = new Date(`${selectedDate}T${startTime}`);
    const end = new Date(`${selectedDate}T${endTime}`);

    while (currentTime < end) {
      const slotStart = currentTime.toTimeString().substring(0, 5);
      currentTime.setMinutes(currentTime.getMinutes() + 30);
      if (currentTime > end) break;
      const slotEnd = currentTime.toTimeString().substring(0, 5);

      if (!isToday || currentTime > now) {
        const slot = `${slotStart} - ${slotEnd}`;
        // Check if this slot is booked
        const isBooked = bookingData.some(booking => 
          booking.professionalEmail === professionalEmail &&
          booking.date === selectedDate &&
          booking.startTime.trim() === slotStart.trim() &&
          booking.endTime.trim() === slotEnd.trim()
        );
        
        slots.push({
          time: slot,
          isBooked: isBooked
        });
      }
      currentTime.setMinutes(currentTime.getMinutes() + 15);
    }

    return slots.slice(0, 3);
  };
  const time_slot_clicked = async (slot, dateInfo, professional) => {
    // Only proceed if slot is not booked
    if (!slot.isBooked) {
      const professionalName = professional.name;
      const professionalEmail = professional.email;
      const [startTime, endTime] = slot.time.split("-");
      const date = dateInfo.date;
      const profession = professional.profession;
      const experience = professional.experience;
      const specialization = professional.specialization || "";
      const photoUrl = professional.photoUrl;
      const charge = professional.charge;
      const token = Date.now().toString().slice(-8);

      await dispatch(setProfessionalInfo({
        professionalName, professionalEmail, token, date, startTime, endTime,
        profession, experience, specialization, photoUrl, charge,
      }));

      navigate("/bookAppointment");
    }
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
            if (!professional.availableDays || !professional.availability) return null;

            const availableDates = getNextAvailableDates(professional.availableDays);

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
                          dateInfo.date,
                          professional.email // Pass email to identify bookings
                        );

                        return (
                          <tr key={idx}>
                            <td>{dateInfo.date} ({dateInfo.day})</td>
                            <td>
                              {professional.availability.startTime} -{" "}
                              {professional.availability.endTime}
                            </td>
                            <td className="time-slot">
                              {timeSlots.length > 0 ? (
                                timeSlots.map((slot, sIdx) => (
                                  <p
                                    key={sIdx}
                                    className={`available_slots ${slot.isBooked ? 'booked' : ''}`}
                                    onClick={() => !slot.isBooked && time_slot_clicked(slot, dateInfo, professional)}
                                    style={{
                                      cursor: slot.isBooked ? 'not-allowed' : 'pointer',
                                      opacity: slot.isBooked ? 0.5 : 1
                                    }}
                                  >
                                    {slot.time}
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
