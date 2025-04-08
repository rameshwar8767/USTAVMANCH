import { Box, Typography, IconButton, Link, Stack, useTheme, Grid, Divider, Container } from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Phone,
  Email,
  LocationOn,
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { title: 'About Us', url: '/about' },
      { title: 'Contact', url: '/contact' },
      { title: 'Careers', url: '/careers' },
      { title: 'Blog', url: '/blog' },
    ],
    vendors: [
      { title: 'Become a Vendor', url: '/register' },
      { title: 'Vendor Login', url: '/login' },
      { title: 'Success Stories', url: '/success-stories' },
      { title: 'Guidelines', url: '/guidelines' },
    ],
    support: [
      { title: 'Help Center', url: '/help' },
      { title: 'Terms of Service', url: '/terms' },
      { title: 'Privacy Policy', url: '/privacy' },
      { title: 'FAQ', url: '/faq' },
    ],
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: theme.palette.primary.main,
        color: 'white',
        width: '100vw',
        maxWidth: '100%',
        mt: 'auto',
        py: { xs: 4, md: 6 },
        boxShadow: '0 -4px 10px rgba(0,0,0,0.1)',
        position: 'relative',
        left: 0,
        right: 0,
        marginLeft: 0,
        marginRight: 0,
      }}
    >
      {/* Main footer content */}
      <Container 
        maxWidth={false} 
        disableGutters 
        sx={{ 
          px: { xs: 2, sm: 3, md: 4 },
          width: '100%',
        }}
      >
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'white' }}>
              Event Management
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9, maxWidth: '90%' }}>
              Your one-stop solution for all event planning needs. We connect you with the best vendors and venues to make your events memorable.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }} component={Link} href="https://facebook.com" target="_blank">
                <Facebook />
              </IconButton>
              <IconButton sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }} component={Link} href="https://twitter.com" target="_blank">
                <Twitter />
              </IconButton>
              <IconButton sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }} component={Link} href="https://instagram.com" target="_blank">
                <Instagram />
              </IconButton>
              <IconButton sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }} component={Link} href="https://linkedin.com" target="_blank">
                <LinkedIn />
              </IconButton>
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={{ xs: 2, md: 4 }}>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'white' }}>
                  Company
                </Typography>
                <Stack spacing={1.5}>
                  {footerLinks.company.map((link) => (
                    <Link
                      key={link.title}
                      href={link.url}
                      underline="hover"
                      sx={{ 
                        display: 'block', 
                        color: 'rgba(255,255,255,0.85)',
                        '&:hover': { color: 'white' },
                        transition: 'color 0.2s'
                      }}
                    >
                      {link.title}
                    </Link>
                  ))}
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'white' }}>
                  For Vendors
                </Typography>
                <Stack spacing={1.5}>
                  {footerLinks.vendors.map((link) => (
                    <Link
                      key={link.title}
                      href={link.url}
                      underline="hover"
                      sx={{ 
                        display: 'block', 
                        color: 'rgba(255,255,255,0.85)',
                        '&:hover': { color: 'white' },
                        transition: 'color 0.2s'
                      }}
                    >
                      {link.title}
                    </Link>
                  ))}
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'white' }}>
                  Support
                </Typography>
                <Stack spacing={1.5}>
                  {footerLinks.support.map((link) => (
                    <Link
                      key={link.title}
                      href={link.url}
                      underline="hover"
                      sx={{ 
                        display: 'block', 
                        color: 'rgba(255,255,255,0.85)',
                        '&:hover': { color: 'white' },
                        transition: 'color 0.2s'
                      }}
                    >
                      {link.title}
                    </Link>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Contact Info */}
        <Divider sx={{ my: 4, opacity: 0.2, borderColor: 'rgba(255,255,255,0.3)' }} />
        <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} sm={4}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Phone fontSize="small" sx={{ color: 'rgba(255,255,255,0.8)' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                7896541230
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Email fontSize="small" sx={{ color: 'rgba(255,255,255,0.8)' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                support@eventmanagement.com
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <LocationOn fontSize="small" sx={{ color: 'rgba(255,255,255,0.8)' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                123 Navi Peth, Pune
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Typography 
          variant="body2" 
          align="center" 
          sx={{ 
            mt: 4, 
            pt: 2, 
            opacity: 0.7,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          {currentYear} Event Management System. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
