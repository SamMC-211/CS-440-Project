import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

// React router: link (doesnt need active styling)
// What is this compared to routes??
import { Link } from "react-router";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import Home from "./Home";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<App />}></Route>
          <Route path="/Home" element={<Home />}></Route>
        </Routes>
      </Router>

      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <Link to="/Home">
        <h2>
          {/* This adds /Home to url doesn't route to page ask gpt */}
          {/* <Link to="/Home">Sample Home Page</Link> */}
        </h2>
      </Link>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
