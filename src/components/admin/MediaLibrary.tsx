import React, { useState, useRef } from 'react';
import type { MediaItem } from '../../lib/supabase/types';
import { formatShortDate } from '../../lib/utils/format-date';
import {
  Image as ImageIcon,
  UploadCloud,
  Copy,
  Check,
  Trash2,
  Search,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

interface MediaLibraryProps {
  initialMedia: MediaItem[];
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ initialMedia }) => {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from('article-media')
          .upload(filePath, file);

        if (uploadErr) throw uploadErr;

        const { data: { publicUrl } } = supabase.storage
          .from('article-media')
          .getPublicUrl(filePath);

        if (user) {
          const { data: mediaRecord } = await supabase
            .from('media')
            .insert({
              user_id: user.id,
              filename: file.name,
              file_path: filePath,
              public_url: publicUrl,
              mime_type: file.type,
              file_size: file.size,
              alt_text: file.name.replace(/\.[^/.]+$/, ''),
            })
            .select()
            .single();

          if (mediaRecord) {
            setMedia((prev) => [mediaRecord, ...prev]);
          }
        }
      }
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (item: MediaItem) => {
    if (!window.confirm(`Delete "${item.filename}"?`)) return;

    try {
      await supabase.storage.from('article-media').remove([item.file_path]);
      await supabase.from('media').delete().eq('id', item.id);
      setMedia(media.filter((m) => m.id !== item.id));
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const filteredMedia = media.filter((item) =>
    item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.alt_text?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        multiple
        accept="image/*"
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">Media Library</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Upload, optimize, and reuse assets across all articles.</p>
        </div>
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all self-start"
        >
          <UploadCloud className="w-4 h-4" />
          {isUploading ? 'Uploading...' : 'Upload Media'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search media by filename..."
          className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand-500 shadow-2xs"
        />
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredMedia.length === 0 ? (
          <div className="col-span-full py-16 text-center text-zinc-400 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <ImageIcon className="w-10 h-10 mx-auto mb-2 text-zinc-300 opacity-60" />
            <p className="font-semibold text-sm">No media files found</p>
            <p className="text-xs mt-1">Upload images to quickly embed them in your articles.</p>
          </div>
        ) : (
          filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col"
            >
              <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
                <img
                  src={item.public_url}
                  alt={item.alt_text || item.filename}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Hover overlay actions */}
                <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.public_url, item.id)}
                    className="p-2 rounded-lg bg-white/90 text-zinc-900 hover:bg-white text-xs shadow-xs"
                    title="Copy Public URL"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={item.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/90 text-zinc-900 hover:bg-white text-xs shadow-xs"
                    title="Open full size"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="p-2 rounded-lg bg-rose-600 text-white hover:bg-rose-500 text-xs shadow-xs"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-2.5">
                <div className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 truncate" title={item.filename}>
                  {item.filename}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5 flex items-center justify-between">
                  <span>{(item.file_size / 1024).toFixed(0)} KB</span>
                  <span>{formatShortDate(item.created_at)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MediaLibrary;
