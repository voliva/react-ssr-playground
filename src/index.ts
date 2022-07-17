import express from "express";
import streamRender from "./streamRender";

const PORT = process.env.PORT || 4000;

const app = express();

app.use(
  express.static("public", {
    index: false,
  })
);
app.use((req, res, next) => {
  try {
    streamRender(req.url, res);
  } catch (ex) {
    next(ex);
  }
});

app
  .listen(PORT, () => {
    console.log(`Listening at ${PORT}...`);
  })
  .on("error", function (error: any) {
    if (error.syscall !== "listen") {
      throw error;
    }
    const isPipe = (portOrPipe: string | number) => Number.isNaN(portOrPipe);
    const bind = isPipe(PORT) ? "Pipe " + PORT : "Port " + PORT;
    switch (error.code) {
      case "EACCES":
        console.error(bind + " requires elevated privileges");
        process.exit(1);
      case "EADDRINUSE":
        console.error(bind + " is already in use");
        process.exit(1);
      default:
        throw error;
    }
  });
