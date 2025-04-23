import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import {
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';

// Mock data - will be replaced with API calls
const mockReports = [
  {
    id: 1,
    name: 'Revenue Report',
    description: 'Detailed revenue breakdown by vendor and category',
    lastGenerated: '2025-04-01T10:30:00',
    status: 'ready',
  },
  {
    id: 2,
    name: 'Vendor Performance',
    description: 'Vendor ratings, bookings, and revenue analysis',
    lastGenerated: '2025-04-01T09:15:00',
    status: 'ready',
  },
  {
    id: 3,
    name: 'Customer Analytics',
    description: 'Customer booking patterns and preferences',
    lastGenerated: '2025-03-31T15:45:00',
    status: 'ready',
  },
  {
    id: 4,
    name: 'Category Insights',
    description: 'Popular categories and seasonal trends',
    lastGenerated: '2025-03-31T14:20:00',
    status: 'ready',
  },
];

const Reports = () => {
  const [reportType, setReportType] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [format, setFormat] = useState('pdf');

  const handleGenerateReport = () => {
    // Will be replaced with actual API call
    console.log('Generating report:', {
      reportType,
      startDate,
      endDate,
      format,
    });
  };

  const handleDownload = (reportId) => {
    // Will be replaced with actual download functionality
    console.log('Downloading report:', reportId);
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Reports
        </Typography>

        {/* Report Generator */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Generate New Report
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  label="Report Type"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="revenue">Revenue Report</MenuItem>
                  <MenuItem value="vendor">Vendor Performance</MenuItem>
                  <MenuItem value="customer">Customer Analytics</MenuItem>
                  <MenuItem value="category">Category Insights</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Format</InputLabel>
                <Select
                  value={format}
                  label="Format"
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="excel">Excel</MenuItem>
                  <MenuItem value="csv">CSV</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleGenerateReport}
                disabled={!reportType || !startDate || !endDate}
                startIcon={<RefreshIcon />}
              >
                Generate Report
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Available Reports */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Available Reports
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Last Generated</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.name}</TableCell>
                    <TableCell>{report.description}</TableCell>
                    <TableCell>
                      {new Date(report.lastGenerated).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.status}
                        color={report.status === 'ready' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<FileDownloadIcon />}
                        onClick={() => handleDownload(report.id)}
                      >
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </AdminLayout>
  );
};

export default Reports;
