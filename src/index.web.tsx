import { hydrateRoot } from "react-dom/client";
import { App } from "./component";

hydrateRoot(document.getElementById("root"), <App />, {
  onRecoverableError(error) {
    console.log("recoverable error", error);
  },
});

console.log("rendered?", document.body.innerHTML);
