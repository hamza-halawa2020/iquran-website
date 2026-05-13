export const environment = {
    backEndUrl: 'https://dashboard.onlineislamicmadrasah.com/api',
    imgUrl: 'https://dashboard.onlineislamicmadrasah.com/',
    // Disable optional home endpoints that may not exist on the backend yet (avoids noisy 404s in the console).
    features: {
        workSamples: false,
        staff: false,
        successPartners: false,
    },
};

