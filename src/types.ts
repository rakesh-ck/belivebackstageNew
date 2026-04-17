// Database Models derived from documentation

export type UserRole = 'artist' | 'label' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  clientNumber: string; // 6-digit unique auto-gen
  avatar?: string;
  isVerified: boolean;
  legalIdentity?: string;
  fanContactEmail?: string;
  timezone?: string;
  promotionSetupDone: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ReleaseType = 'audio' | 'video' | 'ringtone';
export type ReleaseGenre = 'any' | 'western_classic' | 'jazz';
export type ReleaseDistributionType = 'digital' | 'physical';
export type ReleaseStatus = 'draft' | 'submitted' | 'delivered' | 'correction_requested' | 'takedown' | 'deleted';

export interface Release {
  id: string;
  userId: string;
  title: string;
  type: ReleaseType;
  genre: ReleaseGenre;
  subgenre?: string;
  label?: string;
  upc?: string;
  catalogNumber?: string;
  cLine?: string;
  pLine?: string;
  productionYear?: string;
  explicitLyrics: boolean;
  coverArt?: string; // S3/Storage URL
  releaseDate?: string;
  releaseHour?: string;
  releaseTimezone?: string;
  distributionType: ReleaseDistributionType;
  status: ReleaseStatus;
  containsExistingTrack: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Track {
  id: string;
  releaseId: string;
  trackNumber: number;
  title: string;
  version?: string;
  artistName: string;
  authors: string[]; // JSON array
  composers: string[]; // JSON array
  duration: string; // HH:MM:SS.mmm
  genre: string;
  isrc?: string;
  audioUrl?: string;
  previewStart?: number; // seconds
  explicitLyrics: boolean;
  createdAt: string;
}

export interface Territory {
  id: string;
  releaseId: string;
  count: number;
  storeCount: number;
  stores: string[]; // JSON array
}

export interface RightsIssue {
  id: string;
  userId: string;
  store: 'youtube' | 'other';
  category: 'copyright_check' | 'release_claim' | 'takedown_video';
  assetTitle: string;
  albumTitle?: string;
  trackTitle?: string;
  artistName: string;
  assetId: string;
  upc?: string;
  otherParty?: string;
  dailyViews: number;
  expiry?: string;
  status: 'new' | 'pending' | 'rejected' | 'resolved';
  createdAt: string;
}

export interface PromotionLink {
  id: string;
  userId: string;
  releaseId: string;
  slug: string;
  customUrl?: string;
  brandColor?: string;
  platformLinks: Record<string, string>; // JSON object
  fanEmails: string[]; // JSON array
  clicks: number;
  isActive: boolean;
  createdAt: string;
}

export interface BulkImport {
  id: string;
  userId: string;
  filename: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  totalRows: number;
  successRows: number;
  failedRows: number;
  errorLog?: Record<string, any>; // JSON object
  createdAt: string;
}
