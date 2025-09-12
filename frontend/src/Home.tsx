import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
// MUI
import Button from "@mui/material/Button";

function Home() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>MUI Testing</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <Button
          onClick={() => setCount((count) => count + 1)}
          variant="contained"
        >
          This count is also {count}
        </Button>
        <p>
          Ran{" "}
          <code>npm install @mui/material @emotion/react @emotion/styled</code>{" "}
          to add MUI to the project
        </p>
      </div>
    </>
  );
}

export default Home;
