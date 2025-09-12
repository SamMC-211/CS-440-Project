import { BrowserRouter as Router, Routes, Route } from "react-router";
import Home from "./Home";
// MUI Rec.
import { CssBaseline } from "@mui/material";

function App() {
  return (
    <>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />}></Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
