/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HeroContent {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  backgroundUrl: string;
}

export interface Song {
  id?: string;
  title: string;
  coverUrl: string;
  releaseDate: any; // Timestamp
  description: string;
  spotifyUrl: string;
  youtubeUrl: string;
  lyrics: string;
  order: number;
}

export interface Video {
  id?: string;
  title: string;
  thumbnailUrl: string;
  youtubeUrl: string;
  description: string;
  releaseDate: any; // Timestamp
  order: number;
}

export interface GalleryItem {
  id?: string;
  imageUrl: string;
  altText: string;
  category: string;
  createdAt: any; // Timestamp
  order: number;
}

export interface TimelineItem {
  year: string;
  event: string;
}

export interface BiographyData {
  id?: string;
  content: string;
  profileImageUrl: string;
  timeline: TimelineItem[];
  occupation: string[];
  genres: string[];
  languages: string[];
  achievements: string[];
}

export interface AboutData {
  id?: string;
  mission: string;
  vision: string;
  story: string;
  goals: string;
  future: string;
  lyricistTitle?: string;
  lyricistContent?: string;
  digitalTitle?: string;
  digitalContent?: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: any; // Timestamp
  status: 'read' | 'unread';
}

export interface CloudinaryImage {
  id?: string;
  secureUrl: string;
  publicId: string;
  page: string;
  section: string;
  title: string;
  alt: string;
  createdAt: any; // Timestamp
}

export interface SEOData {
  id?: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  twitterCard: string;
  structuredData: string;
  robots: string;
  sitemap: string;
  canonicalUrl: string;
}

export interface SiteSettings {
  id?: string;
  siteName: string;
  logoUrl: string;
}
