export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'reader' | 'editor' | 'admin';
export type ArticleStatus = 'draft' | 'published' | 'archived';
export type CommentStatus = 'visible' | 'pending' | 'hidden' | 'deleted' | 'spam';
export type ReportReason = 'spam' | 'harassment' | 'abusive' | 'off_topic' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url: string;
  bio: string;
  role: UserRole;
  website?: string;
  twitter?: string;
  github?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Article {
  id: string;
  author_id: string;
  category_id: string | null;
  title: string;
  subtitle: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  cover_image_alt: string;
  cover_image_caption: string;
  status: ArticleStatus;
  published_at: string | null;
  reading_time_minutes: number;
  seo_title: string;
  seo_description: string;
  canonical_url: string;
  social_image: string;
  draft_content: any;
  published_content: any | null;
  current_version: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
  category?: Category | null;
  tags?: Tag[];
}

export interface ArticleVersion {
  id: string;
  article_id: string;
  version_number: number;
  title: string;
  subtitle: string;
  excerpt: string;
  content: any;
  metadata: Record<string, any>;
  created_by: string | null;
  change_summary: string;
  created_at: string;
  creator?: Profile;
}

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  status: CommentStatus;
  created_at: string;
  updated_at: string;
  user?: Profile;
  replies?: Comment[];
}

export interface CommentReport {
  id: string;
  comment_id: string;
  reported_by: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  created_at: string;
  comment?: Comment;
  reporter?: Profile;
}

export interface MediaItem {
  id: string;
  user_id: string;
  filename: string;
  file_path: string;
  public_url: string;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  alt_text: string;
  caption: string;
  created_at: string;
  uploader?: Profile;
}

export interface EditorRequest {
  id: string;
  user_id: string;
  reason: string;
  sample_link?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  user?: Profile;
  reviewer?: Profile;
}
