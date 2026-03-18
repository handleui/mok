import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import React from "react";
import { createRoot } from "react-dom/client";
import { setupMok } from "./lib/mok";
import { queryClient } from "./lib/query-client";
import { router } from "./routes";
import "./styles.css";

async function bootstrap() {
  if (import.meta.env.DEV) {
    await import("@mok/mok/dev");
  }

  await setupMok(router);

  const rootElement = document.querySelector<HTMLDivElement>("#root");

  if (!rootElement) {
    throw new Error('Missing root element "#root".');
  }

  createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>
  );
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap the mok demo.", error);
});
