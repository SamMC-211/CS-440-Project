import gymImage from "./assets/gym_image.jpg";
// MUI
import DrawerButton from "./components/DrawerButton";
import SnackBarButton from "./components/SnackBarButton";
import SlotList from "./components/SlotList";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  Container,
  Grid,
  Box,
  Button,
  Paper,
  Stack,
  FormGroup,
  FormControlLabel,
  AppBar,
  Typography,
  Toolbar,
  Card,
  CardContent,
  TextField,
  Switch
} from "@mui/material";
import { Link } from "react-router";
import { useCallback, useEffect, useState } from "react";

function UserHome() {
  //Add privilege chekc to this operation??
  useEffect(() => {
    fetch("/api/users?limit=10&sort=lastname", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json()) //res(ponse) object recieved from fetch gets the .json method called on it, this method returns another promise (this time the parsed json)
      //same as doing
      // .then((res) => {
      //     return res.json();
      // })
      .then((data) => {
        //data is whatever I passed to res.json on the express side
        if (data.success) {
          setRows(data.results);
        } else {
          setError(data.message);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  //optimizing so only calls once
  useEffect(() => {
    fetch("/api/users/active", { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setUser({
            firstName: data.user.first_name,
            lastName: data.user.last_name,
            role: data.user.role,
            email: data.user.email
          });
        } else {
          setError("Failed to fetch user");
        }
      })
      .catch((err) => console.error(err));
  }, []);

  //User table definition
  const columns: GridColDef[] = [
    { field: "firstname", headerName: "First Name", flex: 1 },
    { field: "lastname", headerName: " Last Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "password", headerName: "Password", flex: 1 },
  ];

  //active user data
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    role: "",
    email: ""
  });


  // appointment data
  const [appointment, setAppointment] = useState({
    title: "",
    type: "",
    room: "",
    time: "",
    description: ""
  });
  

  // Add appointment (not users)
  const addAppointment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    //TODO, Check if appointment in room exists, make sure it is an hour span.
  };

  //States
  const [rows, setRows] = useState([]);
  const [error, setError] = useState<string | null>(null);

  //useCallback: React hook to "memoize" function, meaning react will reuse the same function object between renders unless its dependencies change
  const getRowID = useCallback((row: any) => row.email, []);

  return (
    <>
      {/* Background */}
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column", // default is column
          justifyContent: "center", // vertical centering
          alignItems: "center", // horizontal centering if needed
        }}
      >
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            minHeight: "100vh",
            width: "100vw",
            backgroundImage: `url(${gymImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed", // keeps background static
            zIndex: -1,
          }}
        ></Box>
        {/* Background gradient cover */}
        <Box
          sx={{
            position: "absolute",
            inset: 0, // shorthand for top/right/bottom/left: 0
            minHeight: "100vh",
            width: "100vw",
            background:
              "linear-gradient(45deg,rgba(19, 22, 24, 1) 0%, rgba(19, 22, 24, 0.27) 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed", // keeps background static
            zIndex: 0,
          }}
        />
        {/*only displays the user display if is user role. */}
        { user.role == "user" && 
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ flexGrow: 1, marginTop: 5, marginBottom: 5 }}>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Hello, {user.firstName}
                </Typography>
              </Toolbar>
            </AppBar>
          </Box>
          <Grid container spacing={6}>
            <Grid size={4}>
              <Paper elevation={3} sx={{ p: 2, background: "#c1c3c5ff" }}>
                <SlotList />
              </Paper>
            </Grid>
            <Grid size={8}>
              <Paper elevation={3} sx={{ p: 2, background: "#c1c3c5ff" }}>
                {/* TODO: Dynamically update?? */}
                <DataGrid
                  rows={rows}
                  columns={columns}
                  getRowId={getRowID}
                  checkboxSelection
                  disableRowSelectionOnClick
                />
              </Paper>
            </Grid>
            <Grid size={6}>
              <Paper elevation={3} sx={{ p: 2, background: "#c1c3c5ff" }}>
                <Stack spacing={2} direction={"row"}>
                  <DrawerButton />
                  <SnackBarButton />
                </Stack>
              </Paper>
            </Grid>
            <Grid size={6}>
              <Paper elevation={3} sx={{ p: 2, background: "#c1c3c5ff" }}>
                <Button component={Link} to="/Login" variant="contained">
                  Login Page
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Container> }

        { user.role == "provider" && 
        <span>
        <Box sx={{ flexGrow: 1, marginTop: 5, marginBottom: 5 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Hello, {user.firstName}
              </Typography>
            </Toolbar>
          </AppBar>
        </Box> 
          <Container>
            <Card sx={{ width: 650, padding: 2, zIndex: 1, position: 'relative' }}>
              <CardContent>
                  <Typography variant='h5' component='div' textAlign='center' gutterBottom>
                      Create Appointment
                  </Typography>

                  {/* Wrap in a form element */}
                  <form onSubmit={addAppointment}>
                     <Stack spacing={2}>
                    <TextField label="Appointment Title" value={appointment.title} onChange={(e) => setAppointment({ ...appointment, title: e.target.value })} fullWidth/>

                    <TextField select label="Type" value={appointment.type} onChange={(e) => setAppointment({ ...appointment, type: e.target.value })} fullWidth
                      SelectProps={{
                        native: true, // uses native HTML select
                      }}
                    >
                      <option value=""></option>
                      <option value="Consultation">Consultation</option>
                      <option value="Training">Training</option>
                      <option value="Follow-up">Follow-up</option>
                    </TextField>

                    <TextField select label="Room" value={appointment.room} onChange={(e) => setAppointment({ ...appointment, room: e.target.value })} fullWidth
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value=""></option>
                      <option value="Room 101">Room 101</option>
                      <option value="Room 102">Room 102</option>
                      <option value="Room 103">Room 103</option>
                    </TextField>

                    <TextField select label="Timeslot" value={appointment.time} onChange={(e) => setAppointment({ ...appointment, time: e.target.value })} fullWidth
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value=""></option>
                      <option value="9:00-10:00">9:00-10:00</option>
                      <option value="10:00-11:00">10:00-11:00</option>
                      <option value="11:00-12:00">11:00-12:00</option>
                    </TextField>

                    <TextField label="Description" value={appointment.description} onChange={(e) => setAppointment({ ...appointment, description: e.target.value })} multiline rows={4} fullWidth/>
                    
                    {/* Submit Button */}
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                      Create Appointment
                    </Button>

                    </Stack>
                </form>
              </CardContent>
          </Card>
            
              </Container>
          </span>
        }

        { user.role == "dev" &&  //admin I guess
        <Box sx={{ flexGrow: 1, marginTop: 5, marginBottom: 5 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Hello, {user.firstName}
              </Typography>
            </Toolbar>
          </AppBar>
        </Box> }
      </Box>
    </>
  );
}

export default UserHome;
