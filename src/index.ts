import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import "dotenv/config";
import api from "./api";

const app = new Hono();

app.use("/*", cors());

app.route("/api", api);

app.use("/exports/*", serveStatic({ root: "./" }));
app.use("/*", serveStatic({ root: "./views/dist" }));

export default app;
