import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import SubstitutionPage from './pages/SubstitutionPage'
import KnowYourSparePage from './pages/KnowYourSparePage'
import UploadPage from './pages/UploadPage'
import NearbyShopsPage from './pages/NearbyShopsPage'
import ReservationPage from './pages/ReservationPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-navy-950">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/substitution" element={<SubstitutionPage />} />
            <Route path="/substitution/:partId" element={<SubstitutionPage />} />
            <Route path="/spare/:partId" element={<KnowYourSparePage />} />
            <Route path="/know-your-spare" element={<KnowYourSparePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/shops" element={<NearbyShopsPage />} />
            <Route path="/shops/:partId" element={<NearbyShopsPage />} />
            <Route path="/reserve" element={<ReservationPage />} />
            <Route path="/reserve/:partId" element={<ReservationPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
