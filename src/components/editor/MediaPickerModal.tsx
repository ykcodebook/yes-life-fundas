import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  UploadCloud,
  Check,
  Search,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import type { MediaItem } from '../../lib/supabase/types';
import { formatShortDate } from '../../lib/utils/format-date';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageAttrs: {
    src: string;
    alt: string;
    caption: string;
    width: string;
    alignment: 'left' | 'center' | 'right';
  }) => void;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
}) => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWidth, setSelectedWidth] = useState<string>('100%');
  const [selectedAlignment, setSelectedAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [altText, setAltText] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  const loadMedia = async () => {
    const { data } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setMediaList(data);
      if (data.length > 0 && !selectedMedia) {
        setSelectedMedia(data[0]);
        setAltText(data[0].alt_text || data[0].filename.replace(/\.[^/.]+$/, ''));
        setCaption(data[0].caption || '');
      }
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `editor-uploads/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('article-media')
        .upload(filePath, file);

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from('article-media')
        .getPublicUrl(filePath);

      let newMediaItem: any = {
        id: `temp_${Date.now()}`,
        filename: file.name,
        file_path: filePath,
        public_url: publicUrl,
        mime_type: file.type,
        file_size: file.size,
        alt_text: file.name.replace(/\.[^/.]+$/, ''),
        caption: '',
        created_at: new Date().toISOString(),
      };

      if (user) {
        const { data: inserted } = await supabase
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

        if (inserted) newMediaItem = inserted;
      }

      setMediaList([newMediaItem, ...mediaList]);
      setSelectedMedia(newMediaItem);
      setAltText(newMediaItem.alt_text);
      setCaption('');
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleInsert = () => {
    if (!selectedMedia) return;

    onSelectImage({
      src: selectedMedia.public_url,
      alt: altText || selectedMedia.filename,
      caption,
      width: selectedWidth,
      alignment: selectedAlignment,
    });

    onClose();
  };

  if (!isOpen) return null;

  const filteredMedia = mediaList.filter((m) =>
    m.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.alt_text?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs font-sans">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-50">Media Library & Image Insert</h2>
              <p className="text-xs text-zinc-500">Select or upload an image, customize size and position.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          {/* Left / Center 2 Columns: Media Browser */}
          <div className="md:col-span-2 p-5 border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
            {/* Search & Upload Bar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search media..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand-500"
                />
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                accept="image/*"
                className="hidden"
              />

              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-xs disabled:opacity-50 transition-all shrink-0"
              >
                {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                Upload New
              </button>
            </div>

            {/* Media Thumbnails Grid */}
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {filteredMedia.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-xs text-zinc-400">
                    No images found. Upload one to get started.
                  </div>
                ) : (
                  filteredMedia.map((item) => {
                    const isSelected = selectedMedia?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedMedia(item);
                          setAltText(item.alt_text || item.filename.replace(/\.[^/.]+$/, ''));
                          setCaption(item.caption || '');
                        }}
                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          isSelected
                            ? 'border-brand-500 ring-2 ring-brand-500/30'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                        }`}
                      >
                        <img
                          src={item.public_url}
                          alt={item.filename}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Customization & Controls (Position, Size, Alt, Caption) */}
          <div className="p-5 flex flex-col justify-between overflow-y-auto bg-zinc-50/50 dark:bg-zinc-900/50">
            {selectedMedia ? (
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Image Configuration
                </div>

                {/* Thumbnail Preview */}
                <div className="aspect-[16/10] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={selectedMedia.public_url}
                    alt={altText}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Size / Width Selector */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                    Image Size
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: '25%', value: '25%' },
                      { label: '50%', value: '50%' },
                      { label: '75%', value: '75%' },
                      { label: '100%', value: '100%' },
                    ].map((sz) => (
                      <button
                        key={sz.value}
                        type="button"
                        onClick={() => setSelectedWidth(sz.value)}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          selectedWidth === sz.value
                            ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                            : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alignment / Positioning Selector */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                    Alignment & Flow
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedAlignment('left')}
                      className={`flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        selectedAlignment === 'left'
                          ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <AlignLeft className="w-3.5 h-3.5" /> Left
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAlignment('center')}
                      className={`flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        selectedAlignment === 'center'
                          ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <AlignCenter className="w-3.5 h-3.5" /> Center
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAlignment('right')}
                      className={`flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        selectedAlignment === 'right'
                          ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <AlignRight className="w-3.5 h-3.5" /> Right
                    </button>
                  </div>
                </div>

                {/* Alt Text */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Alt Text (Accessibility & SEO)
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe this image..."
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand-500"
                  />
                </div>

                {/* Caption */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Caption (Optional)
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Photo caption or credit..."
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-zinc-400">
                Select an image from the library to configure.
              </div>
            )}

            {/* Insert Button */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedMedia}
                onClick={handleInsert}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                Insert into Article
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPickerModal;
