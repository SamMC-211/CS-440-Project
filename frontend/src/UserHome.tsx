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
