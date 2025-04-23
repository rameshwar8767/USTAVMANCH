import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SocketProvider } from './contexts/SocketContext';
import { CategoryProvider } from './context/CategoryContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VendorList from './pages/VendorList';
import VendorDetails from './pages/VendorDetails';
import BookingDetailsDemo from './pages/BookingDetailsDemo';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminVendors from './pages/admin/Vendors';
import AdminBookings from './pages/admin/Bookings';
import AdminCategories from './pages/admin/Categories';

// Vendor Pages
import VendorDashboard from './pages/vendor/Dashboard';
import VendorProducts from './pages/vendor/Products';
import VendorBookings from './pages/vendor/Bookings';
import VendorProfile from './pages/vendor/Profile';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import UserBookings from './pages/user/Bookings';
import UserProfile from './pages/user/Profile';
import UserBrowseProducts from './pages/user/BrowseProducts';
import UserChat from './pages/user/Chat';

// Theme
import theme from './theme';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// App Content Component
function AppContent() {
  const { user } = useAuth();

  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Navbar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          width: '100%',
          pt: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 3, md: 4 },
          maxWidth: '100vw',
          overflow: 'hidden'
        }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vendors" element={<VendorList />} />
          <Route path="/vendors/:id" element={<VendorDetails />} />
          <Route path="/booking-details-demo" element={<BookingDetailsDemo />} />

          {/* Protected User Routes */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRoles={['user', 'customer']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/browse-products"
            element={
              <ProtectedRoute allowedRoles={['user', 'customer']}>
                <UserBrowseProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/chat"
            element={
              <ProtectedRoute allowedRoles={['user', 'customer']}>
                <UserChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['user', 'customer', 'vendor', 'admin']}>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/bookings"
            element={
              <ProtectedRoute allowedRoles={['user', 'customer']}>
                <UserBookings />
              </ProtectedRoute>
            }
          />

          {/* Protected Vendor Routes */}
          <Route
            path="/vendor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/products"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/bookings"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/profile"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorProfile />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vendors"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminVendors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCategories />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Box>
      <Footer sx={{ width: '100%' }} />
    </Box>
  );
}

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CategoryProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <SocketProvider>
                <AppContent />
              </SocketProvider>
            </ThemeProvider>
          </CategoryProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
