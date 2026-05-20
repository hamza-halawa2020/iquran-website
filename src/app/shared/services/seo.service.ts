import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

type FaqItem = {
    question: string;
    answer: string;
};

type SeoConfig = {
    title: string;
    description: string;
    image?: string;
    locale?: string;
    type?: string;
    canonicalPath?: string;
    faq?: FaqItem[];
};

@Injectable({ providedIn: 'root' })
export class SeoService {
    constructor(
        private title: Title,
        private meta: Meta,
        @Inject(DOCUMENT) private document: Document,
        @Inject(PLATFORM_ID) private platformId: object
    ) { }

    update(config: SeoConfig): void {
        const siteUrl = this.getSiteUrl();
        const canonicalUrl = `${siteUrl}${config.canonicalPath ?? ''}`;
        const pageType = config.type ?? 'website';
        const locale = config.locale ?? 'en_US';
        const image = config.image ?? `${siteUrl}/assets/images/logo.svg`;

        this.title.setTitle(config.title);
        this.meta.updateTag({ name: 'description', content: config.description });

        this.meta.updateTag({ property: 'og:title', content: config.title });
        this.meta.updateTag({ property: 'og:description', content: config.description });
        this.meta.updateTag({ property: 'og:type', content: pageType });
        this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
        this.meta.updateTag({ property: 'og:image', content: image });
        this.meta.updateTag({ property: 'og:locale', content: locale });

        this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
        this.meta.updateTag({ name: 'twitter:title', content: config.title });
        this.meta.updateTag({ name: 'twitter:description', content: config.description });
        this.meta.updateTag({ name: 'twitter:image', content: image });

        this.updateCanonical(canonicalUrl);
        this.updateFaqSchema(config.faq);
    }

    private updateCanonical(href: string): void {
        let link = this.document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
        if (!link) {
            link = this.document.createElement('link');
            link.setAttribute('rel', 'canonical');
            this.document.head.appendChild(link);
        }
        link.setAttribute('href', href);
    }

    private updateFaqSchema(faq?: FaqItem[]): void {
        const scriptId = 'seo-faq-schema';
        const existingScript = this.document.getElementById(scriptId);
        if (existingScript) {
            existingScript.remove();
        }

        if (!faq || faq.length === 0) {
            return;
        }

        const script = this.document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        script.text = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faq.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: item.answer
                }
            }))
        });

        this.document.head.appendChild(script);
    }

    private getSiteUrl(): string {
        if (isPlatformBrowser(this.platformId)) {
            return window.location.origin;
        }

        const baseTag = this.document.querySelector('base');
        const href = baseTag?.getAttribute('href') || 'https://iquran.co.uk/';
        return href.endsWith('/') ? href.slice(0, -1) : href;
    }
}
