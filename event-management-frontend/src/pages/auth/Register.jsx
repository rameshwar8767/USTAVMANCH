import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Alert,
  useTheme,
  alpha,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Lock,
  Visibility,
  VisibilityOff,
  ArrowForward,
  Store,
  PersonOutline,
  HowToReg
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('type') || 'customer';

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: defaultType
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const steps = [
    'Basic Information',
    'Contact Details',
    'Security'
  ];

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0:
        if (!formData.name) {
          newErrors.name = 'Name is required';
        } else if (formData.name.length < 3) {
          newErrors.name = 'Name must be at least 3 characters';
        }
        if (!formData.role) {
          newErrors.role = 'Please select account type';
        }
        break;

      case 1:
        if (!formData.email) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email';
        }
        if (!formData.phone) {
          newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone)) {
          newErrors.phone = 'Please enter a valid 10-digit phone number';
        }
        break;

      case 2:
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        }
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(activeStep)) return;

    setIsLoading(true);
    setApiError('');

    try {
      const { confirmPassword, ...registrationData } = formData;
      const result = await register(registrationData);
      if (result.success) {
        navigate(formData.role === 'vendor' ? '/vendor/dashboard' : '/');
      } else {
        setApiError(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setApiError(error.response?.data?.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormLabel component="legend">Account Type</FormLabel>
              <RadioGroup
                row
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="customer"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonOutline sx={{ mr: 1 }} />
                      Customer
                    </Box>
                  }
                />
                <FormControlLabel
                  value="vendor"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Store sx={{ mr: 1 }} />
                      Vendor
                    </Box>
                  }
                />
              </RadioGroup>
              {errors.role && (
                <Typography color="error" variant="caption">
                  {errors.role}
                </Typography>
              )}
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
        }}
      >
        <Avatar
          sx={{
            m: 1,
            bgcolor: 'primary.main',
            width: 56,
            height: 56,
          }}
        >
          <HowToReg />
        </Avatar>

        <Typography component="h1" variant="h5" gutterBottom>
          Create Account
        </Typography>

        {apiError && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box component="form" noValidate sx={{ width: '100%' }}>
          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowForward sx={{ transform: 'rotate(180deg)' }} />}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              disabled={isLoading}
              endIcon={activeStep === steps.length - 1 ? (
                isLoading ? <CircularProgress size={20} /> : <HowToReg />
              ) : (
                <ArrowForward />
              )}
            >
              {activeStep === steps.length - 1 ? 'Register' : 'Next'}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ width: '100%', my: 3 }} />

        <Typography variant="body2" color="text.secondary" align="center">
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: theme.palette.primary.main,
              textDecoration: 'none'
            }}
          >
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Register;
