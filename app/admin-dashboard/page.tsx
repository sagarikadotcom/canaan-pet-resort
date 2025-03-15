"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setBookings } from "@/redux/slices/bookingSlice";
import { setOwners } from "@/redux/slices/ownerSlice";
import { setDogs } from "@/redux/slices/dogSlice";

import { 
  Box, CssBaseline, Drawer, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Toolbar, Typography, CircularProgress, AppBar, IconButton, Select, MenuItem
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import PetsIcon from "@mui/icons-material/Pets";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import VerifiedIcon from "@mui/icons-material/Verified";
import MenuIcon from "@mui/icons-material/Menu";

import BookingList from "../components/BookingList";
import OwnerList from "../components/OwnerList";
import DogList from "../components/DogList";
import BoardingUpdates from "../components/BoardingUpdates";
import BoardedDogs from "../components/BoardedDogs";

import dayjs from "dayjs";

const drawerWidth = 240;

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState("Bookings");
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month());

  const fetchData = async (tab: string) => {
    setSelectedTab(tab);
    setLoading(true);
    let apiUrl = "";

    switch (tab) {
      case "Bookings":
        apiUrl = "/api/get-bookings";
        break;
      case "Owners":
        apiUrl = "/api/get-owners";
        break;
      case "Dogs":
        apiUrl = "/api/get-dogs";
        break;
      case "Boarding Updates":
        apiUrl = "/api/get-boardings";
        break;
      case "Boarded Dogs":
        apiUrl = "/api/get-bookings?status=CheckedIn";
        break;
      default:
        return;
    }

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`Failed to fetch ${tab.toLowerCase()}`);

      const data = await response.json();
      if (tab === "Bookings" || tab === "Boarded Dogs") dispatch(setBookings(data));
      if (tab === "Owners") dispatch(setOwners(data));
      if (tab === "Dogs") dispatch(setDogs(data));
      if (tab === "Boarding Updates") dispatch(setBookings(data));
    } catch (error) {
      console.error(`Error fetching ${tab.toLowerCase()}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData("Bookings");
  }, []);

  return (
    <>
      {!loading && <CircularProgress />}
      <Box sx={{ display: "flex" }}>
        <CssBaseline />

        <AppBar position="fixed" sx={{ zIndex: 1201, bgcolor: "#1976d2" }}>
          <Toolbar>
            <IconButton 
              color="inherit" edge="start" sx={{ mr: 2, display: { md: "none" } }} 
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ fontWeight: "bold" }}>
              Admin Dashboard
            </Typography>
          </Toolbar>
        </AppBar>

        <Drawer
          sx={{ width: drawerWidth, flexShrink: 0, "& .MuiDrawer-paper": { width: drawerWidth } }}
          variant="permanent" anchor="left"
        >
          <Toolbar />
          <List>
            {["Bookings", "Owners", "Dogs", "Boarding Updates", "Boarded Dogs"].map((text) => (
              <ListItem key={text} disablePadding>
                <ListItemButton onClick={() => fetchData(text)}>
                  <ListItemIcon>
                    {text === "Bookings" && <EventIcon />}
                    {text === "Owners" && <PeopleIcon />}
                    {text === "Dogs" && <PetsIcon />}
                    {text === "Boarding Updates" && <CalendarMonthIcon />}
                    {text === "Boarded Dogs" && <VerifiedIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>{selectedTab}</Typography>

          {selectedTab === "Boarding Updates" && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Select
  value={selectedMonth}
  onChange={(e) => setSelectedMonth(Number(e.target.value))}
>
  {Array.from({ length: 12 }, (_, i) => (
    <MenuItem key={i} value={i}>
      {dayjs().month(i).format("MMMM")}
    </MenuItem>
  ))}
</Select>

            </Box>
          )}

          {loading ? <CircularProgress /> : (
            <>
              {selectedTab === "Bookings" && <BookingList />}
              {selectedTab === "Owners" && <OwnerList />}
              {selectedTab === "Dogs" && <DogList />}
              {selectedTab === "Boarding Updates" && <BoardingUpdates selectedMonth={selectedMonth} />}
              {selectedTab === "Boarded Dogs" && <BoardedDogs />}
            </>
          )}
        </Box>
      </Box>
    </>
  );
}