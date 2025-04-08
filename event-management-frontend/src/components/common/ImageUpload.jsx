import { useState, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const ImageUpload = ({
  images = [],
  onChange,
  maxImages = 5,
  title = 'Upload Images',
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;

    const files = [...e.dataTransfer.files].filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      await handleFiles(files);
    }
  };

  const handleFileSelect = async (e) => {
    const files = [...e.target.files];
    await handleFiles(files);
    e.target.value = ''; // Reset input
  };

  const handleFiles = async (files) => {
    if (images.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    setUploading(true);
    try {
      const newImages = files.map(file => ({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        isNew: true
      }));

      onChange([...images, ...newImages]);
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Failed to process images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (index) => {
    const newImages = [...images];
    // If the image has a URL.createObjectURL, revoke it to prevent memory leaks
    if (newImages[index].isNew && newImages[index].url.startsWith('blob:')) {
      URL.revokeObjectURL(newImages[index].url);
    }
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        {title} ({images.length}/{maxImages})
      </Typography>

      {/* Drop Zone */}
      <Box
        onDragEnter={disabled ? null : handleDrag}
        onDragLeave={disabled ? null : handleDrag}
        onDragOver={disabled ? null : handleDrag}
        onDrop={disabled ? null : handleDrop}
        sx={{
          border: 2,
          borderRadius: 1,
          borderStyle: 'dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.300',
          bgcolor: disabled ? 'action.disabledBackground' : (dragActive ? 'action.hover' : 'background.paper'),
          p: 3,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: disabled ? 'action.disabledBackground' : 'action.hover',
          },
          opacity: disabled ? 0.7 : 1,
        }}
        onClick={disabled ? null : () => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={disabled || uploading}
        />
        
        <UploadIcon color={disabled ? "disabled" : "primary"} sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Drag & Drop Images Here
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to select files
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
          Supported formats: JPG, PNG, GIF (max {maxImages} images)
        </Typography>
      </Box>

      {/* Image Preview */}
      {(images.length > 0 || uploading) && (
        <Box sx={{ mt: 2 }}>
          <ImageList cols={3} gap={8}>
            {images.map((image, index) => (
              <ImageListItem key={index}>
                <img
                  src={image.url}
                  alt={image.name || 'Product image'}
                  loading="lazy"
                  style={{
                    height: '200px',
                    width: '100%',
                    objectFit: 'cover',
                  }}
                />
                <ImageListItemBar
                  title={image.name || 'Image ' + (index + 1)}
                  subtitle={image.size ? formatFileSize(image.size) : ''}
                  actionIcon={
                    !disabled && (
                      <IconButton
                        sx={{ color: 'white' }}
                        onClick={() => handleDelete(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )
                  }
                />
              </ImageListItem>
            ))}
            {uploading && (
              <ImageListItem>
                <Box
                  sx={{
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'action.hover',
                  }}
                >
                  <CircularProgress />
                </Box>
              </ImageListItem>
            )}
            {!uploading && images.length < maxImages && !disabled && (
              <ImageListItem>
                <Box
                  sx={{
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'action.hover',
                    cursor: 'pointer',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AddIcon sx={{ fontSize: 48 }} />
                </Box>
              </ImageListItem>
            )}
          </ImageList>
        </Box>
      )}
    </Box>
  );
};

export default ImageUpload;
