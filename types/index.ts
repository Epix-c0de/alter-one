export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  role: 'admin' | 'moderator' | 'member';
}

export interface FeedItem {
  id: string;
  type: 'announcement' | 'reading' | 'song' | 'prayer' | 'event';
  title: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  authorPhotoUrl?: string;
  createdAt: Date;
  pinned: boolean;
  likes: number;
  comments: number;
  liked?: boolean;
  saved?: boolean;
}

export interface Reading {
  id: string;
  date: Date;
  readings: {
    first?: { citation: string; text: string };
    psalm?: { citation: string; text: string };
    second?: { citation: string; text: string };
    gospel: { citation: string; text: string };
  };
  reflection?: string;
}

export interface Prayer {
  id: string;
  title: string;
  text: string;
  category: 'morning' | 'evening' | 'meal' | 'traditional' | 'intercession' | 'other';
  language: string;
  author?: string;
  saved?: boolean;
}

export interface Song {
  id: string;
  title: string;
  artist?: string;
  youtubeVideoId?: string;
  thumbnailUrl?: string;
  duration?: number;
  lyrics?: SongLyrics;
  tags: string[];
  language: string;
  sourceType: 'youtube' | 'ocr';
  published: boolean;
  createdAt: Date;
  saved?: boolean;
}

export interface SongLyrics {
  verses: { label: string; lines: string[] }[];
  chorus?: string[];
  bridge?: string[];
  chords?: { lineIndex: number; chords: string[] }[];
}

export interface SongDraft {
  id: string;
  imageUrl: string;
  rawOcrText: string;
  parsedData?: Song;
  confidence: number;
  status: 'processing' | 'review' | 'approved' | 'rejected';
  createdAt: Date;
  createdBy: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  memberCount: number;
  unreadCount: number;
  lastMessage?: {
    text: string;
    senderName: string;
    timestamp: Date;
  };
  isAdmin: boolean;
  isMuted: boolean;
}

export interface Message {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderPhotoUrl?: string;
  text: string;
  imageUrl?: string;
  timestamp: Date;
  isOwn: boolean;
}
