import { StrictMode } from "react";
//why dont I need
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// React Router
import ReactDOM from "react-dom/client";

// const root = document.getElementById("root");

//why doesnt this work?
// ReactDOM.createRoot(root).render (

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )
