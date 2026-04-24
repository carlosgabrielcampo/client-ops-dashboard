import { QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter } from "react-router-dom"
import { queryClient } from "./lib/query-client"
import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import App from "./App"
import "./index.css"
import { Toaster } from "sonner"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster />
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)