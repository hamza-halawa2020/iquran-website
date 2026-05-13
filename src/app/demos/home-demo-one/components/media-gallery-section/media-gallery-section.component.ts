import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { Router } from '@angular/router';
import { MediaGalleryService } from '../../../../pages/media-gallery-page/media-gallery.service';

interface MediaItem {
  id: number;
  title: string;
  type: 'image' | 'video';
  file: string | null;
  video_url: string | null;
  media_url?: string | null;
  thumbnail_url?: string | null;
  created_at: string;
}

@Component({
  selector: 'app-media-gallery-section',
  standalone: true,
  imports: [CommonModule, TranslateModule, PaginationComponent],
  templateUrl: './media-gallery-section.component.html',
  styleUrls: ['./media-gallery-section.component.scss']
})
export class MediaGallerySectionComponent implements OnInit, OnChanges {
  @Input() items: MediaItem[] = [];
  @Input() openInPage: boolean = false;

  allMedia: MediaItem[] = [];
  filteredMedia: MediaItem[] = [];
  activeFilter: 'all' | 'image' | 'video' = 'all';
  isLoading: boolean = true;
  lightboxOpen: boolean = false;
  videoModalOpen: boolean = false;
  selectedMedia: MediaItem | null = null;
  selectedVideoUrl: string | null = null;
  meta: any = null;
  currentPage: number = 1;

  constructor(
    private mediaService: MediaGalleryService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.shouldUseInputItems()) {
      this.syncInputItems();
      return;
    }

    this.loadMedia();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && this.shouldUseInputItems()) {
      this.syncInputItems();
    }
  }

  loadMedia(page: number = 1): void {
    this.isLoading = true;
    this.currentPage = page;
    this.mediaService.getAllMedia(page, this.activeFilter).subscribe({
      next: (response: any) => {
        this.allMedia = Array.isArray(response) ? response : (response.data || []);
        this.filteredMedia = this.allMedia;
        this.meta = response.meta || null;
        this.isLoading = false;
      },
      error: (error: any) => {
        
        this.isLoading = false;
      }
    });
  }

  filterMedia(type: 'all' | 'image' | 'video'): void {
    this.activeFilter = type;
    this.currentPage = 1;

    if (this.shouldUseInputItems()) {
      this.syncInputItems();
      return;
    }

    this.loadMedia(1);
  }

  onPageChange(page: number): void {
    if (this.meta && page >= 1 && page <= this.meta.last_page && page !== this.meta.current_page) {
      this.loadMedia(page);
    }
  }

  navigateToMediaPage(item: MediaItem): void {
    this.router.navigate(
      ['/media'],
      { queryParams: { mediaId: item.id } }
    );
  }

  playVideo(media: MediaItem): void {
    this.selectedMedia = media;
    this.selectedVideoUrl = this.getVideoUrl(media);
    this.videoModalOpen = true;
  }

  closeVideoModal(): void {
    this.videoModalOpen = false;
    this.selectedMedia = null;
    this.selectedVideoUrl = null;
  }

  openLightbox(media: MediaItem): void {
    this.selectedMedia = media;
    this.lightboxOpen = true;
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
    this.selectedMedia = null;
  }

  getVideoEmbedUrl(url: string | null | undefined): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('');

    const trimmedUrl = url.trim();
    const videoId = this.extractYouTubeId(trimmedUrl);
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : trimmedUrl;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  getVideoThumbnail(item: MediaItem): string {
    if (item.file) {
      return item.file;
    }
    if (item.thumbnail_url) {
      return item.thumbnail_url;
    }
    if (item.video_url) {
      const videoId = this.extractYouTubeId(item.video_url);
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }
    const fallbackVideoUrl = this.getVideoUrl(item);
    if (fallbackVideoUrl) {
      const videoId = this.extractYouTubeId(fallbackVideoUrl);
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }
    return 'assets/images/logo.svg';
  }

  private getVideoUrl(item: MediaItem | null): string | null {
    if (!item) return null;
    return (item.video_url || item.media_url || null);
  }

  private extractYouTubeId(url: string): string | null {
    const trimmedUrl = (url || '').trim();
    if (!trimmedUrl) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmedUrl)) {
      return trimmedUrl;
    }

    try {
      const parsedUrl = new URL(trimmedUrl);
      const hostname = parsedUrl.hostname.replace(/^www\./, '').replace(/^m\./, '');
      if (hostname === 'youtu.be') {
        return this.cleanYouTubeId(parsedUrl.pathname.split('/').filter(Boolean)[0] || null);
      }
      if (hostname === 'youtube.com' || hostname === 'youtube-nocookie.com') {
        if (parsedUrl.pathname === '/watch') {
          return this.cleanYouTubeId(parsedUrl.searchParams.get('v'));
        }
        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
        const prefix = pathParts[0];
        const candidateId = pathParts[1] || null;
        if (prefix && ['embed', 'shorts', 'live', 'v'].includes(prefix)) {
          return this.cleanYouTubeId(candidateId);
        }
      }
    } catch {
    }
    const patterns = [
      /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|shorts\/|live\/|v\/)|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})(?:[?&#/]|$)/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})(?:[?&#]|$)/,
    ];

    for (const pattern of patterns) {
      const match = trimmedUrl.match(pattern);
      const id = match?.[1] || null;
      const cleaned = this.cleanYouTubeId(id);
      if (cleaned) return cleaned;
    }

    return null;
  }

  private cleanYouTubeId(candidate: string | null | undefined): string | null {
    if (!candidate) return null;
    const cleaned = candidate.split('?')[0].split('&')[0].split('#')[0].replace(/\/+$/, '');
    return /^[a-zA-Z0-9_-]{11}$/.test(cleaned) ? cleaned : null;
  }

  private shouldUseInputItems(): boolean {
    return this.openInPage || this.items.length > 0;
  }

  private syncInputItems(): void {
    this.isLoading = false;
    this.meta = null;
    this.allMedia = [...this.items];
    this.filteredMedia = this.activeFilter === 'all'
      ? this.allMedia
      : this.allMedia.filter((item) => item.type === this.activeFilter);
  }
}

