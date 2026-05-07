// ═══════════════════════════════════════════════════════
// KEYAUTH JAVASCRIPT INTEGRATION
// ═══════════════════════════════════════════════════════

/**
 * Initialize KeyAuth with your application credentials.
 * These are automatically generated from your Syn-Auth dashboard.
 */
const KeyAuthApp = new KeyAuth({
    name: "Your Application Name",     // Your application name
    ownerid: "OWN-XXXX-XXXX-XXXX"      // Your owner ID
});

(async () => {
    try {
        // 1. Initialize connection
        await KeyAuthApp.Initialize();
        console.log("KeyAuth Initialized successfully");

        // 2. Example Usage (License login)
        /*
        const licenseKey = "SYNAUTH-XXXX-XXXX";
        const success = await KeyAuthApp.license(licenseKey);
        
        if (success) {
            console.log("Login Successful! Welcome", KeyAuthApp.user_data.username);
        } else {
            console.log("Error:", KeyAuthApp.response.message);
        }
        */
    } catch (err) {
        console.error("Failed to connect to KeyAuth:", err);
    }
})();