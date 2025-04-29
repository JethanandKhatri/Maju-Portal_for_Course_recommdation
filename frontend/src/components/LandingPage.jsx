import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Paper, Typography, Button } from '@mui/material';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
        <Box sx={{ textAlign: 'center' }}>
          <img src="https://nexus.maju.edu.pk/aarsol_custom_loginpage/static/img/maju.png" alt="MAJU Logo" style={{ width: 180, marginBottom: 16 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 2 }}>
            MAJU ONLINE ACADEMIC SUITE
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 4 }}>
            Select Portal
          </Typography>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mb: 3, py: 2, fontSize: 20 }}
            onClick={() => navigate('/student/login')}
          >
            Student Portal
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            sx={{ py: 2, fontSize: 20 }}
            onClick={() => navigate('/admin/login')}
          >
            Admin Portal
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default LandingPage; 