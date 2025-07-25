import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { resolve } from "path";
// import { app } from "./src/server/app.dev";
// import { getRequestListener } from "@hono/node-server";

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    template: "./index.html",
  },
  source: {
    entry: {
      index: "./src/main.tsx",
    },
  },
  output: {
    distPath: {
      root: "dist/web",
    },
    legalComments: "none",
  },
  dev: {
    watchFiles: {
      paths: ["./src/server"],
      type: "reload-server",
    }
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
