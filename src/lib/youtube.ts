/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Extracts the YouTube video ID from various YouTube URL formats.
 * @param url The YouTube URL
 * @returns The video ID or null if not found
 */
export function getYoutubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Generates a YouTube thumbnail URL from a video ID.
 * @param videoId The YouTube video ID
 * @param quality The quality of the thumbnail (default: hqdefault)
 * @returns The thumbnail URL
 */
export function getYoutubeThumbnail(videoId: string, quality: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault' = 'hqdefault'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}
