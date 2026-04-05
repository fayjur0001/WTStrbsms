import SiteOptions from "./src/lib/utils/site-options";
import apiUrl from "./src/lib/utils/api-url";

async function checkConfig() {
    try {
        const user = await SiteOptions.apiUser.get();
        const apiKey = await SiteOptions.apiKey.get();
        const hostUrl = await SiteOptions.hostUrl.get();

        console.log("Configuration Check:");
        console.log("--------------------");
        console.log("API URL (hardcoded):", apiUrl);
        console.log("API User (DB):", user);
        console.log("API Key (DB):", apiKey ? "********" : "NOT SET");
        console.log("Host URL (DB):", hostUrl);

        if (!user || !apiKey) {
            console.warn("\nWARNING: API User or API Key is missing in the database!");
        }

    } catch (error) {
        console.error("Failed to check configuration:", error);
    } finally {
        process.exit();
    }
}

checkConfig();
