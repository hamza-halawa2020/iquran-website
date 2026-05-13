import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingService, Settings } from '../../shared/services/setting.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-whatsapp-float',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './whatsapp-float.component.html',
    styleUrls: ['./whatsapp-float.component.scss']
})
export class WhatsappFloatComponent implements OnDestroy {
    phone: string = '201034100565'; // Default WhatsApp
    private subscription: Subscription = new Subscription();
    private hasLoadedSettings = false;
    private isResolvingSettings = false;

    constructor(
        private settingService: SettingService,
        private translateService: TranslateService
    ) { }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    openWhatsApp() {
        if (this.hasLoadedSettings) {
            this.openCurrentWhatsAppLink();
            return;
        }

        if (this.isResolvingSettings) {
            return;
        }

        this.isResolvingSettings = true;
        this.subscription.add(
            this.settingService.getSettings().subscribe({
                next: (data: Settings) => {
                    if (data.whatsapp) {
                        this.phone = data.whatsapp.replace('+', '');
                    } else if (data.phone) {
                        this.phone = data.phone.replace('+', '');
                    }

                    this.hasLoadedSettings = true;
                    this.isResolvingSettings = false;
                    this.openCurrentWhatsAppLink();
                },
                error: () => {
                    this.isResolvingSettings = false;
                    this.openCurrentWhatsAppLink();
                }
            })
        );
    }

    private openCurrentWhatsAppLink(): void {
        this.subscription.add(
            this.translateService.get('WHATSAPP_MESSAGE').subscribe((msg: string) => {
                const message = encodeURIComponent(msg);
                const whatsappUrl = `https://wa.me/${this.phone}?text=${message}`;
                window.open(whatsappUrl, '_blank', 'noopener');
            })
        );
    }
}
