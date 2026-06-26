/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadToCloudinary, CloudinaryResponse } from '../../lib/cloudinary';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useImage } from '../../hooks/useFirestore';

interface ImageUploadProps {
  onUploadSuccess?: (url: string, publicId: string) => void;
  currentImageUrl?: string;
  label?: string;
  pageName: string;
  sectionName: string;
  title?: string;
  altText?: string;
  mode?: 'singleton' | 'collection';
}

export default function ImageUpload({ 
  onUploadSuccess, 
  currentImageUrl, 
  label,
  pageName,
  sectionName,
  title = '',
  altText = '',
  mode = 'singleton'
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear local preview when prop changes from outside
  useEffect(() => {
    setLocalPreview(null);
    setImageError(false);
  }, [currentImageUrl]);

  // Real-time listener for this specific image (only for singletons)
  const { data: persistentImage } = useImage(mode === 'singleton' ? pageName : 'DISABLED', mode === 'singleton' ? sectionName : 'DISABLED');
  
  // Final preview source: priority to local upload, then persistent data, then prop
  const preview = localPreview || persistentImage?.secure_url || currentImageUrl || '';

  const saveToFirestore = async (cloudinaryData: CloudinaryResponse) => {
    try {
      console.log('Saving image metadata to Firestore...', { pageName, sectionName, mode });
      
      const imagesRef = collection(db, 'images');
      const imageData = {
        title: title || `${pageName} ${sectionName}`,
        altText: altText || `${pageName} ${sectionName} image`,
        pageName,
        sectionName,
        secure_url: cloudinaryData.secure_url,
        public_id: cloudinaryData.public_id,
        format: cloudinaryData.format,
        width: cloudinaryData.width,
        height: cloudinaryData.height,
        updatedAt: serverTimestamp()
      };

      if (mode === 'singleton') {
        const q = query(
          imagesRef, 
          where('pageName', '==', pageName), 
          where('sectionName', '==', sectionName)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Update existing singleton
          const docRef = doc(db, 'images', querySnapshot.docs[0].id);
          await updateDoc(docRef, imageData);
          console.log('Singleton Firestore document updated:', docRef.id);
        } else {
          // Create new singleton
          const newDoc = await addDoc(imagesRef, {
            ...imageData,
            createdAt: serverTimestamp()
          });
          console.log('New Singleton Firestore document created:', newDoc.id);
        }
      } else {
        // Collection mode: always add new
        const newDoc = await addDoc(imagesRef, {
          ...imageData,
          createdAt: serverTimestamp()
        });
        console.log('New Collection Firestore document created:', newDoc.id);
      }
    } catch (err) {
      console.error('Error saving to Firestore:', err);
      throw new Error('Failed to save image metadata to database.');
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPG, PNG or WEBP.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log('Starting Cloudinary upload for:', file.name);
      const cloudinaryData = await uploadToCloudinary(file);
      console.log('Cloudinary upload success:', cloudinaryData.secure_url);
      
      await saveToFirestore(cloudinaryData);
      
      if (onUploadSuccess) {
        onUploadSuccess(cloudinaryData.secure_url, cloudinaryData.public_id);
      }
      
      setLocalPreview(cloudinaryData.secure_url);
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Upload process failed:', err);
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        {label && <label className="text-[10px] font-black tracking-[0.2em] text-white/30 uppercase">{label}</label>}
        {success && (
          <span className="text-green-500 text-[10px] font-bold flex items-center gap-1 animate-in fade-in slide-in-from-right-4">
            <CheckCircle2 size={12} /> SAVED PERMANENTLY
          </span>
        )}
      </div>
      
      <div 
        onClick={() => !loading && fileInputRef.current?.click()}
        className={`relative aspect-square md:aspect-video rounded-sm border border-dashed border-white/10 hover:border-[#FACC15]/50 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center bg-white/5 group ${loading ? 'opacity-50' : ''}`}
      >
        {preview && !imageError ? (
          <>
            <img 
              src={preview} 
              alt="Upload preview" 
              onError={() => setImageError(true)}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <div className="p-4 bg-white/10 border border-white/20 rounded-full text-white">
                <Upload size={32} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-white/10">
              <ImageIcon className="text-white/20" size={32} />
            </div>
            <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">Click to upload image</p>
            <p className="text-[9px] text-white/20 mt-2 uppercase tracking-widest">JPG, PNG, WEBP (MAX 5MB)</p>
          </>
        )}

        {loading && (
          <div className="absolute inset-0 bg-[#050505]/90 flex flex-col items-center justify-center z-20">
            <Loader2 className="animate-spin text-[#FACC15] mb-6" size={48} />
            <p className="text-[#FACC15] font-black tracking-[0.3em] text-[10px] animate-pulse uppercase">Syncing to Cloud...</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/5 border border-red-500/20 rounded-sm text-red-500 text-[10px] font-bold uppercase tracking-wider">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
      />
    </div>
  );
}
