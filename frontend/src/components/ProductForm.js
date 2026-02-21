import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { productAPI } from '../services/api';

function ProductForm() {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    quantity: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id, isEdit]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getById(id);
      setProduct(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch product details. Please try again.');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!product.name || !product.price || !product.quantity) {
      setError('Please fill in all required fields.');
      return;
    }

    if (parseFloat(product.price) <= 0) {
      setError('Price must be greater than 0.');
      return;
    }

    if (parseInt(product.quantity) < 0) {
      setError('Quantity cannot be negative.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const productData = {
        ...product,
        price: parseFloat(product.price),
        quantity: parseInt(product.quantity)
      };

      if (isEdit) {
        await productAPI.update(id, productData);
        setSuccess('Product updated successfully!');
      } else {
        await productAPI.create(productData);
        setSuccess('Product created successfully!');
      }

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/products');
      }, 1500);

    } catch (err) {
      setError(`Failed to ${isEdit ? 'update' : 'create'} product. Please try again.`);
      console.error(`Error ${isEdit ? 'updating' : 'creating'} product:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  if (loading && isEdit && !product.name) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEdit ? 'Edit Product' : 'Add New Product'}
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Product Name"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
            margin="normal"
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={product.description}
            onChange={handleChange}
            multiline
            rows={3}
            margin="normal"
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Price"
            name="price"
            type="number"
            value={product.price}
            onChange={handleChange}
            required
            margin="normal"
            inputProps={{ min: 0, step: 0.01 }}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Quantity"
            name="quantity"
            type="number"
            value={product.quantity}
            onChange={handleChange}
            required
            margin="normal"
            inputProps={{ min: 0 }}
            disabled={loading}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : (isEdit ? 'Update' : 'Create')}
            </Button>

            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default ProductForm;