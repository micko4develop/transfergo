import { defineConfig } from "vite";
import type { Plugin, ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import { POST as postOrder } from "./api/order";

const apiDevServer = (): Plugin => ({
  name: "api-dev-server",
  configureServer(server: ViteDevServer) {
    server.middlewares.use("/api/order", async (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed." }));
        return;
      }

      let rawBody = "";

      req.on("data", (chunk: Buffer) => {
        rawBody += chunk;
      });

      req.on("end", async () => {
        try {
          const response = await postOrder(
            new Request("http://localhost/api/order", {
              method: "POST",
              headers: {
                "Content-Type": req.headers["content-type"] || "application/json",
              },
              body: rawBody,
            })
          );

          res.statusCode = response.status;
          res.setHeader("Content-Type", response.headers.get("content-type") || "application/json");
          res.end(await response.text());
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : "API error." }));
        }
      });
    });
  },
});

export default defineConfig({
  plugins: [react(), apiDevServer()],
});
