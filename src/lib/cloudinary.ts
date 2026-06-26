/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  original_filename: string;
  format: string;
  width: number;
  height: number;
  [key: string]: any;
}

export const uploadToCloudinary = async (file: File): Promise<CloudinaryResponse> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'doupwfrsw';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ashishbarele_upload';

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload image to Cloudinary');
  }

  return await response.json();
};

export const deleteFromCloudinary = async (publicId: string) => {
  // Note: Deleting from client-side requires a signature or a backend proxy.
  // For security reasons, we do not expose API Secret in the frontend.
  // We will only remove the reference from Firestore in the frontend.
  console.log('Requesting deletion of image metadata for:', publicId);
};
