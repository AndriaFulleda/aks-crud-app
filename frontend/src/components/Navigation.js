import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, Tab, Box } from '@mui/material';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleChange = (event, newValue) => {
    navigate(newValue);
  };
  
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={location.pathname} onChange={handleChange} aria-label="navigation tabs">
        <Tab label="Products List" value="/products" />
        <Tab label="Add Product" value="/products/new" />
      </Tabs>
    </Box>
  );
}

export default Navigation;