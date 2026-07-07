import { RouterProvider } from "react-router-dom"
import router from "./routes"
import NotificationProvider from "./components/NotificationProvider"

function App() {
  return (
    <NotificationProvider>
      <RouterProvider router={router} />
    </NotificationProvider>
  )
}

export default App
