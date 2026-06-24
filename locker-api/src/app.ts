import cors from "cors";
import express from "express";
import lockerRoutes from "./routes/routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/lockers", lockerRoutes);

export default app;
