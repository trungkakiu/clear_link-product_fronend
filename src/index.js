import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, HashRouter } from "react-router-dom";
import "./scss/volt.scss";
import "react-datetime/css/react-datetime.css";

import HomePage from "./pages/HomePage";
import ScrollToTop from "./components/ScrollToTop";
import Aos from "aos";
import { UserProvider } from "./Context/UserContext";
import "aos/dist/aos.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import App from "./App";
import { SocketProvider } from "./Context/SocketProvider";

Aos.init({
  duration: 800,
  once: true,
});

ReactDOM.render(
  <BrowserRouter>
    <UserProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </UserProvider>
  </BrowserRouter>,
  document.getElementById("root"),
);
