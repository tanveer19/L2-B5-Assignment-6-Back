import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { Server } from "http";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";

require("dotenv").config();
let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.DB_URL!);
    console.log("connected to db");
    server = app.listen(envVars.PORT, () => {
      console.log(`server is listening to port ${envVars.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  await startServer();
  await seedSuperAdmin();
})();

//1.  unhandled rejection error

process.on("unhandledRejection", (err) => {
  console.log("unhandled rejection detected .... server shutting down", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// Promise.reject(new Error("forgot to catch this promise"));

//2. uncaught rejection error

process.on("uncaughtException", (err) => {
  console.log("unhandled exception detected .... server shutting down", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// throw new Error("forgot handle this uncaught rejection err");

// 3. signal termination sigterm
process.on("SIGTERM", (err) => {
  console.log("SIGTERM signal received .... server shutting down", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
