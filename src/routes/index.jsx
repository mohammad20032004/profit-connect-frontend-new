import { createBrowserRouter, Outlet } from "react-router-dom"
import Header from "../components/Header"
import ThemeProvider from "../theme/ThemeProvider"

import DashboardView from "../features/MainFeedLayout/view"
import LandingView from "../features/landing/view"
import SignInView from "../features/auth/sign-in/view"
import SignUpView from "../features/auth/sign-up/view"
import ProfileView from "../features/profile/view"
import SavedPostsView from "../features/profile/savedPosts/view"
import ProfileUserIdView from "../features/profile/[userId]/view"
import UserProfileUserIdView from "../features/user-profile/[userId]/view"
import AboutView from "../features/about/view"
import AlertsView from "../features/alerts/view"
import SettingsView from "../features/settings/view"

import NotFoundView from "../features/not-found/view"
import PostPage from "../features/post/view"
import CompaniesList from "../features/companies/view"
import CompanyDetail from "../features/companies/[id]/view"
import ProjectsList from "../features/projects/view"
import ProjectDetail from "../features/projects/[id]/view"
import CreateProject from "../features/projects/create/view"
import MyProjectDetail from "../features/myProject/[id]/view"

import EmployerWelcome from "../features/employer/welcome/view"
import EmployerDashboard from "../features/employer/dashboard/view"
import EmployerSetup from "../features/employer/setup/view"
import EmployerPending from "../features/employer/pending/view"

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
      { path: "/profile/savedPosts", element: <SavedPostsView /> },
      { path: "/profile/:userId", element: <ProfileUserIdView /> },
      { path: "/user-profile/:userId", element: <UserProfileUserIdView /> },
      { path: "/about", element: <AboutView /> },
      { path: "/alerts", element: <AlertsView /> },
      { path: "/settings", element: <SettingsView /> },

      { path: "/posts/:postId", element: <PostPage /> },
      { path: "/companies", element: <CompaniesList /> },
      { path: "/companies/:id", element: <CompanyDetail /> },
      { path: "/network", element: <div>Network</div> },
      { path: "/projects", element: <ProjectsList /> },
      { path: "/projects/create", element: <CreateProject /> },
      { path: "/projects/:id", element: <ProjectDetail /> },
      { path: "/myProject/:id", element: <MyProjectDetail /> },

      { path: "/employer/welcome", element: <EmployerWelcome /> },
      { path: "/employer/dashboard", element: <EmployerDashboard /> },
      { path: "/employer/setup", element: <EmployerSetup /> },
      { path: "/employer/pending", element: <EmployerPending /> },

      { path: "*", element: <NotFoundView /> },
    ],
  },
])

export default router
