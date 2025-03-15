"use client";

import { Key, SetStateAction, JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Card, CardContent, Typography, Box, Grid, Divider, Chip, Button, Dialog, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { updateBookingStatus } from "@/redux/slices/bookingSlice";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

interface BoardingUpdatesProps {
  selectedMonth: number;
}

export default function BoardingUpdates({ selectedMonth }: BoardingUpdatesProps) {
  const bookings = useSelector((state: RootState) => state.booking.bookings.bookings) || [];
  const [currentBooking, setCurrentBooking] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedKennel, setSelectedKennel] = useState("");
  const [selectedSubKennel, setSelectedSubKennel] = useState("");
  const [kennels, setKennelsData] = useState([]);
  const dispatch=useDispatch()
  // Get today's and tomorrow's dates
  const today = dayjs().startOf("day");
  const tomorrow = today.add(1, "day");
  const [searchQuery, setSearchQuery] = useState(""); // Search input state

  const handleConfirmCheckIn = async (bookingId: any) => {
    console.log("bookingId", bookingId)
    try {
      const response = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          boardingStatus: "CheckedIn",
        }),
      });
  
      const data = await response.json();
      
      if (response.ok) {
      //  dispatch(updateBookingStatus({ id: bookingId, boardingStatus: "Checked-In" }));
  
        // Close your dialog after successful update
        setOpenDialog(false);
      } else {
        console.error("Error updating booking status:", data.error);
      }
    } catch (error) {
      console.error("Failed to update booking status:", error);
    }
  };
  

  const fetchKennels = async () => {
  //  setLoadingKennels(true);
    try {
      const response = await fetch("/api/get-kennels");
      const data = await response.json();
  
      if (response.ok) {
       // dispatch(setKennels(data.kennels)); // storing in redux if needed
        setKennelsData(data.kennels); // setting local state
        setOpenDialog(true);
      } else {
        console.error("Failed fetching kennels:", data.message);
      }
    } catch (error) {
      console.error("Error fetching kennels:", error);
    } finally {
     // setLoadingKennels(false);
    }
  };

  
  // Filter bookings for the selected month
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking: { checkInDate: string | number | Date | dayjs.Dayjs | null | undefined; }) => {
      if (!booking.checkInDate) return false; // Skip if check-in date is missing
      const bookingDate = dayjs.utc(booking.checkInDate).local();
      return bookingDate.isValid() && bookingDate.month() === selectedMonth;
    });
  }, [bookings, selectedMonth]);

  // Categorize bookings into sections
  const todayCheckOuts = filteredBookings.filter(
    (b: { checkOutDate: string | number | Date | dayjs.Dayjs | null | undefined; }) => dayjs.utc(b.checkOutDate).local().isSame(today, "day")
  );
  const todayCheckIns = filteredBookings.filter(
    (b: { checkInDate: string | number | Date | dayjs.Dayjs | null | undefined; }) => dayjs.utc(b.checkInDate).local().isSame(today, "day")
  );
  const tomorrowCheckOuts = filteredBookings.filter(
    (b: { checkOutDate: string | number | Date | dayjs.Dayjs | null | undefined; }) => dayjs.utc(b.checkOutDate).local().isSame(tomorrow, "day")
  );
  const tomorrowCheckIns = filteredBookings.filter(
    (b: { checkInDate: string | number | Date | dayjs.Dayjs | null | undefined; }) => dayjs.utc(b.checkInDate).local().isSame(tomorrow, "day")
  );
  const futureBookings = filteredBookings.filter(
    (b: { checkInDate: string | number | Date | dayjs.Dayjs | null | undefined; checkOutDate: string | number | Date | dayjs.Dayjs | null | undefined; }) =>
      !dayjs.utc(b.checkInDate).local().isSame(today, "day") &&
      !dayjs.utc(b.checkOutDate).local().isSame(today, "day") &&
      !dayjs.utc(b.checkInDate).local().isSame(tomorrow, "day") &&
      !dayjs.utc(b.checkOutDate).local().isSame(tomorrow, "day")
  );

  // Helper function to render booking cards
  const renderBookings = (bookingsArray: typeof bookings) => (
    <Grid container spacing={3}>
      {bookingsArray.map((booking: { ownerId: {}; dogId: {}; checkInDate: string | number | Date | dayjs.Dayjs | null | undefined; checkInTime: any; checkOutDate: string | number | Date | dayjs.Dayjs | null | undefined; checkOutTime: any; }, index: Key | null | undefined) => {
        const owner = booking.ownerId || {};
        const dog = booking.dogId || {};

        // Parse and format check-in and check-out dates
        const checkInDateOnly = dayjs.utc(booking.checkInDate).format("YYYY-MM-DD");
        const checkInDateTime = dayjs.utc(`${checkInDateOnly} ${booking.checkInTime}`, "YYYY-MM-DD HH:mm")
          .local()
          .format("MMMM D, YYYY hh:mm A");

        const checkOutDateOnly = dayjs.utc(booking.checkOutDate).format("YYYY-MM-DD");
        const checkOutDateTime = dayjs.utc(`${checkOutDateOnly} ${booking.checkOutTime}`, "YYYY-MM-DD HH:mm")
          .local()
          .format("MMMM D, YYYY hh:mm A");

          const handleCheckInClick = (booking: SetStateAction<null>) => {
            fetchKennels()
            setCurrentBooking(booking);
            setOpenDialog(true);
          };

        return (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0px 3px 10px rgba(0,0,0,0.1)",
                transition: "0.3s",
                "&:hover": { transform: "scale(1.02)", boxShadow: "0px 5px 15px rgba(0,0,0,0.2)" },
                background: "#fff",
                p: 2,
              }}
            >
              <CardContent sx={{ textAlign: "left" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", mb: 1 }}>
                  {owner.firstName || "Unknown"} {owner.lastName || ""}
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  📞 {owner.phoneNumber || "N/A"}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ff9800" }}>
                  {dog.name || "Unknown"} ({dog.breed || "Unknown Breed"})
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>Gender: {dog.sex || "N/A"}</Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>Age: {dog.age ? `${dog.age} years` : "N/A"}</Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
                  Booking Details
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  📅 Check-In: {checkInDateTime}
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  📅 Check-Out: {checkOutDateTime}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Status Badge */}
                <Button variant="contained" onClick={() => handleCheckInClick(booking)}>
                  Check-In
                </Button>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}>
        Boarding Updates - {dayjs().month(selectedMonth).format("MMMM")}
      </Typography>
     {/* Search Input */}
      <TextField
        label="Search by Owner Name, Phone Number, or Dog Name"
        variant="outlined"
        fullWidth
        sx={{ mb: 3 }}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {filteredBookings.length === 0 ? (
        <Typography variant="h6" sx={{ textAlign: "center", color: "#777", mt: 3 }}>
          🚨 No bookings for this month.
        </Typography>
      ) : (
        <>
          {/* Today's Check-Outs */}
          {todayCheckOuts.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#D32F2F", mb: 2 }}>
               {` 📤 Today's Check-Outs (${todayCheckOuts.length})`}
              </Typography>
              {renderBookings(todayCheckOuts)}
            </Box>
          )}

          {/* Today's Check-Ins */}
          {todayCheckIns.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#388E3C", mb: 2 }}>
                {`📥 Today's Check-Ins (${todayCheckIns.length})`}
              </Typography>
              {renderBookings(todayCheckIns)}
            </Box>
          )}

          {/* Tomorrow's Check-Outs & Check-Ins */}
          {(tomorrowCheckIns.length > 0) && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#FFA000", mb: 2 }}>
                {`🔜 Tomorrow's Check-Ins (${tomorrowCheckIns.length})`}
              </Typography>
              {renderBookings([...tomorrowCheckIns, ...tomorrowCheckOuts])}
            </Box>
          )}

{tomorrowCheckOuts.length > 0  && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#388E3C", mb: 2 }}>
                {`📥 Tomorrow's Check-Outs (${tomorrowCheckOuts.length})`}
              </Typography>
              {renderBookings(tomorrowCheckOuts)}
            </Box>
          )}

          {/* Other Future Bookings */}
          {futureBookings.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1565C0", mb: 2 }}>
                📅 Upcoming Bookings
              </Typography>
              {renderBookings(futureBookings)}
            </Box>
          )}
        </>
      )}
      {openDialog&&
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>Select Kennel & Sub-Kennel</DialogTitle>
        <DialogContent>
         
        <FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel>Select Kennel</InputLabel>
  <Select value={selectedKennel} onChange={(e) => setSelectedKennel(e.target.value)}>
    {kennels.map((kennel) => (
      <MenuItem key={kennel._id} value={kennel._id}>
        {kennel.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>

{selectedKennel && (
  <Typography variant="body1" sx={{ mt: 2, color: "#1976d2", fontWeight: "bold" }}>
    Guardian: {kennels.find((k) => k._id === selectedKennel)?.guardianName || "N/A"}
  </Typography>
)}
          <FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel>Select Sub-Kennel</InputLabel>
  <Select value={selectedSubKennel} onChange={(e) => setSelectedSubKennel(e.target.value)}>
    {kennels?.map((kennel) => (
      kennel.subKennels.map((subKennel: { number: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => (
        <MenuItem key={`${kennel._id}-${subKennel.number}`} value={subKennel.number}>
          {kennel.name} - Sub-Kennel #{subKennel.number}
        </MenuItem>
      ))
    ))}
  </Select>
</FormControl>  
          <Button variant="contained" sx={{ mt: 3 }} onClick={()=>handleConfirmCheckIn(currentBooking._id)}>
            Confirm Check-In
          </Button>
        </DialogContent>
      </Dialog>}
    </Box>
  );
}

