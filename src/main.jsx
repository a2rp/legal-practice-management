import { createRoot } from "react-dom/client";
import { OverlayScrollbars } from "overlayscrollbars";
import "overlayscrollbars/overlayscrollbars.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

OverlayScrollbars(document.body, {
    overflow: { x: "hidden", y: "scroll" },
    scrollbars: {
        theme: "os-theme-matterline",
        autoHide: "move",
        autoHideSuspend: false,
    },
});

createRoot(document.getElementById("root")).render(
    <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
    </BrowserRouter>,
);
