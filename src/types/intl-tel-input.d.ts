declare module 'intl-tel-input' {
  type IntlTelInputPlugin = {
    getNumber: () => string;
    isValidNumber: () => boolean;
    getSelectedCountryData: () => {
      name?: string;
      iso2?: string;
      dialCode?: string;
    };
    destroy: () => void;
  };

  type IntlTelInputOptions = {
    initialCountry?: string;
    preferredCountries?: string[];
    separateDialCode?: boolean;
    autoPlaceholder?: 'off' | 'polite' | 'aggressive';
    allowDropdown?: boolean;
    countrySearch?: boolean;
    loadUtils?: () => Promise<unknown>;
  };

  export default function intlTelInput(
    input: HTMLInputElement,
    options?: IntlTelInputOptions
  ): IntlTelInputPlugin;
}

declare module 'intl-tel-input/build/js/utils.js';
