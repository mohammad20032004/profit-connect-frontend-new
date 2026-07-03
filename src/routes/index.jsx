import { createBrowserRouter, Outlet } from "react-router-dom"
import Header from "../components/Header"
import ThemeProvider from "../theme/ThemeProvider"

import DashboardView from "../features/dashboard/view"
import LandingView from "../features/landing/view"
import SignInView from "../features/auth/sign-in/view"
import SignUpView from "../features/auth/sign-up/view"
import ProfileView from "../features/profile/view"
import ProfileUserIdView from "../features/profile/[userId]/view"
import UserProfileUserIdView from "../features/user-profile/[userId]/view"
import AboutView from "../features/about/view"
import AlertsView from "../features/alerts/view"
import JobsView from "../features/jobs/view"
import JobsCompaniesView from "../features/jobs/companies/view"
import JobsSalariesView from "../features/jobs/salaries/view"
import NotFoundView from "../features/not-found/view"

function Layout() {
  return (
    <ThemeProvider>
      <Header />
      <Outlet />
    </ThemeProvider>
  )
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <DashboardView /> },
      { path: "/landing", element: <LandingView /> },
      { path: "/sign-in", element: <SignInView /> },
      { path: "/sign-up", element: <SignUpView /> },
      { path: "/profile", element: <ProfileView /> },
      { path: "/profile/:userId", element: <ProfileUserIdView /> },
      { path: "/user-profile/:userId", element: <UserProfileUserIdView /> },
      { path: "/about", element: <AboutView /> },
      { path: "/alerts", element: <AlertsView /> },
      { path: "/jobs", element: <JobsView /> },
      { path: "/jobs/companies", element: <JobsCompaniesView /> },
      { path: "/jobs/salaries", element: <JobsSalariesView /> },
      { path: "/network", element: <div>Network</div> },
      { path: "*", element: <NotFoundView /> },
    ],
  },
])

export default router
