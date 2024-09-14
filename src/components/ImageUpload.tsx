import React, { ReactNode } from 'react';

interface ImageUploadProps {
  onUpload: (image: string) => void;
  children: ReactNode;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, children }) => {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const image = e.target?.result as string;
        onUpload(image);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
      {children}
    </label>
  );
};

export default ImageUpload;