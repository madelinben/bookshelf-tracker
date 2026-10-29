import { createRoot } from "react-dom/client";
import { BookshelfApp } from "../src";
import "./demo.css";

createRoot(document.getElementById("root") as HTMLElement).render(<BookshelfApp />);
