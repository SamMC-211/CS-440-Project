// Backround image needs to be imported
import gymImage from "./assets/gym_image.jpg";
// MUI
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Backdrop,
} from "@mui/material";

// Login Page Imports
import React, { useState } from "react";
import { useNavigate, Link } from "react-router";

function Login() {
  // Backend login stuff
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    //Tries a post request
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // << important to include cookies
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }
      // success -> navigate to home
      navigate("/home");
    } catch (err) {
      setError("Network error");
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  //Actual page content
  return (
    <>
      <Box
        sx={{
          minHeight: "100vh", // full viewport height
          minWidth: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          // Backticks to insert JS into CSS
          backgroundImage: `url(${gymImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0, // shorthand for top/right/bottom/left: 0
            background:
              "linear-gradient(45deg,rgba(19, 22, 24, 1) 0%, rgba(19, 22, 24, 0.27) 100%)",
          }}
        />
        <Typography
          component={Link}
          to="/"
          variant="h1"
          fontWeight="bold"
          sx={{
            position: "absolute",
            top: "25%",
            left: "50%",
            transform: "translateX(-50%) translateY(-50%)",
            color: "#a93331",
            textAlign: "center",
            zIndex: 3,
            textShadow: "2px 2px 20px #494746",
            textDecoration: "none",
          }}
        >
          Schedule Fit
        </Typography>
        <Typography
          variant="h1"
          fontWeight="bold"
          sx={{
            position: "absolute",
            top: "25%",
            left: "50.3%",
            transform: "translateX(-50%) translateY(-45%)",
            color: "#494746",
            textAlign: "center",
            zIndex: 2,
          }}
        >
          Schedule Fit
        </Typography>
        <Card sx={{ width: 350, padding: 2, zIndex: 1, position: "relative" }}>
          <CardContent>
            <Typography
              variant="h5"
              component="div"
              textAlign="center"
              gutterBottom
            >
              Login
            </Typography>

            {/* Login stuff??? */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Wrap in a form element */}
            <form onSubmit={submit}>
              <Stack spacing={2}>
                <TextField
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  label="Password"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  fullWidth
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Sign In
                </Button>
              </Stack>
            </form>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              mt={2}
            >
              Don't have an account? <a href="#">Sign Up</a>
            </Typography>
          </CardContent>
        </Card>
        {/* Loading overlay */}
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Box>
    </>
  );
}

export default Login;
