import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { ProtectedRoute } from '@/router/ProtectedRoute'
import { CreateDonationPage } from '@/pages/CreateDonationPage'
import { CreateEventPage, EditEventPage } from '@/pages/CreateEventPage'
import { DonationDetailsPage } from '@/pages/DonationDetailsPage'
import { EventDetailsPage } from '@/pages/EventDetailsPage'
import { EventsPage } from '@/pages/EventsPage'
import { FeedPage } from '@/pages/FeedPage'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { MyDonationsPage } from '@/pages/MyDonationsPage'
import { MyRequestsPage } from '@/pages/MyRequestsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { RegisterPage } from '@/pages/RegisterPage'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/donations/:id" element={<DonationDetailsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/donate" element={<CreateDonationPage />} />
        <Route path="/donations/:id/edit" element={<CreateDonationPage />} />
        <Route path="/my-donations" element={<MyDonationsPage />} />
        <Route path="/my-requests" element={<MyRequestsPage />} />
        <Route path="/events/create" element={<CreateEventPage />} />
        <Route path="/events/:id/edit" element={<EditEventPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}
