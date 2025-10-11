import React from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  sizes = '100vw',
  loading = 'lazy',
  width,
  height,
}) => {
  // Extract file extension to determine image type
  const fileExtension = src.split('.').pop()?.toLowerCase();
  
  // Create srcset for responsive images
  const generateSrcSet = () => {
    if (!fileExtension) return '';
    
    // Base path without extension
    const basePath = src.substring(0, src.lastIndexOf('.'));
    
    // Generate srcset with different sizes
    return [320, 480, 640, 768, 1024, 1280].map(size => 
      `${basePath}-${size}.${fileExtension} ${size}w`
    ).join(', ');
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`max-w-full h-auto ${className}`}
      loading={loading}
      width={width}
      height={height}
      sizes={sizes}
      srcSet={generateSrcSet()}
    />
  );
};

export default ResponsiveImage;