import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MediaGalleryService } from './media-gallery.service';
import { ActivatedRoute } from '@angular/router';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

interface MediaItem {
  id: number;
  title: string;
  type: 'image' | 'video';
  file: string | null;
  video_url: string | null;
  // Backwards/forwards compatibility with API variants.
  media_url?: string | null;
  thumbnail_url?: string | null;
  created_at: string;
}

@Component({
  selector: 'app-media-gallery-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, PaginationComponent],
  templateUrl: './media-gallery-page.component.html',
  styleUrl: './media-gallery-page.component.scss'
})
export class MediaGalleryPageComponent implements OnInit {
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
  private initialMediaId: number | null = null;

  constructor(
    private mediaService: MediaGalleryService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Read query param (if coming from home page)
    this.route.queryParamMap.subscribe(params => {
      const idParam = params.get('mediaId');
      this.initialMediaId = idParam ? Number(idParam) : null;
      this.loadMedia();
    });
  }

  loadMedia(page: number = 1): void {
    this.isLoading = true;
    this.currentPage = page;
    
    this.mediaService.getAllMedia(page, this.activeFilter).subscribe({
      next: (response: any) => {
        
        // Handle both array and object with data property
        this.allMedia = Array.isArray(response) ? response : (response.data || []);
        this.filteredMedia = this.allMedia;
        this.meta = response.meta || null;
        this.isLoading = false;

        // If we came with a specific mediaId from home page, auto-open it once.
        if (this.initialMediaId) {
          const target = this.allMedia.find(m => m.id === this.initialMediaId);
          if (target) {
            if (target.type === 'video') {
              this.playVideo(target);
            } else {
              this.openLightbox(target);
            }
          }
          this.initialMediaId = null;
        }
      },
      error: (error) => {

        this.isLoading = false;
      }
    });
  }

  filterMedia(type: 'all' | 'image' | 'video'): void {
    this.activeFilter = type;
    this.currentPage = 1;
    this.loadMedia(1);
  }

  onPageChange(page: number): void {
    if (this.meta && page >= 1 && page <= this.meta.last_page && page !== this.meta.current_page) {
      this.loadMedia(page);
    }
  }

  openLightbox(media: MediaItem): void {
    this.selectedMedia = media;
    this.lightboxOpen = true;
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
    this.selectedMedia = null;
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

  // Scroll locking removed to avoid any interference with video playback,
  // especially on mobile browsers.

  getVideoEmbedUrl(url: string | null | undefined): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('');

    const trimmedUrl = url.trim();
    const videoId = this.extractYouTubeId(trimmedUrl);
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : trimmedUrl;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  getVideoThumbnail(item: MediaItem): string {
    // If there's a file (uploaded thumbnail), use it
    if (item.file) {
      return item.file;
    }
    if (item.thumbnail_url) {
      return item.thumbnail_url;
    }

    // If it's a YouTube video, get the thumbnail from YouTube
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

    // Default fallback image
    return 'assets/images/logo.svg';
  }

  private getVideoUrl(item: MediaItem | null): string | null {
    if (!item) return null;
    return (item.video_url || item.media_url || null);
  }

  private extractYouTubeId(url: string): string | null {
    const trimmedUrl = (url || '').trim();
    if (!trimmedUrl) return null;

    // Raw video id (11 chars).
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmedUrl)) {
      return trimmedUrl;
    }

    try {
      const parsedUrl = new URL(trimmedUrl);
      const hostname = parsedUrl.hostname.replace(/^www\./, '').replace(/^m\./, '');

      // https://youtu.be/<id>
      if (hostname === 'youtu.be') {
        return this.cleanYouTubeId(parsedUrl.pathname.split('/').filter(Boolean)[0] || null);
      }

      // https://youtube.com/watch?v=<id>
      if (hostname === 'youtube.com' || hostname === 'youtube-nocookie.com') {
        if (parsedUrl.pathname === '/watch') {
          return this.cleanYouTubeId(parsedUrl.searchParams.get('v'));
        }

        // https://youtube.com/embed/<id>, /shorts/<id>, /live/<id>, /v/<id>
        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
        const prefix = pathParts[0];
        const candidateId = pathParts[1] || null;
        if (prefix && ['embed', 'shorts', 'live', 'v'].includes(prefix)) {
          return this.cleanYouTubeId(candidateId);
        }
      }
    } catch {
      // Ignore invalid URLs and fall back to regex.
    }

    // Regex fallback: supports watch/embed/shorts/live/v and youtu.be.
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

    // Remove any trailing slashes or query/hash fragments.
    const cleaned = candidate.split('?')[0].split('&')[0].split('#')[0].replace(/\/+$/, '');
    return /^[a-zA-Z0-9_-]{11}$/.test(cleaned) ? cleaned : null;
  }
}
