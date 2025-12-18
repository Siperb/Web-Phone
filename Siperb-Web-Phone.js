// -----------------------------------------------
//  Copyright © - SIPERB LTD - All Rights Reserved
// ===============================================
// File: Siperb-Web-Phone.js
// Date: August 2025
// Git: https://github.com/Siperb

// Define the Siperb namespace object
const Siperb = {
    /**
     * Login - fetches your session token using you access token.
     * @param {string} pat - Your Personal Access Token (PAT) generated from the Admin Control Panel
     * @returns {Promise<Object>} - resolves with session object
     */
    Login(pat){
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`https://api.siperb.com/Login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${pat}`
                    }
                });
                if (response.ok) {
                    try{
                        const data = await response.json();
                        console.log(`Login: %cSession retrieved successfully`, "color: green;");

                        if(typeof window !== 'undefined'){
                            window.SiperbAPI = window.SiperbAPI || {};
                            window.SiperbAPI.SESSION_TOKEN = data.SessionToken;
                            window.SiperbAPI.USER_ID = data.UserId;
                        }
                        return resolve(data);
                    }
                    catch (error) {
                        console.log(`Login: %cError occurred while parsing response: ${error.message}`, "color: red;");
                        return reject(error.message);
                    }
                }
                else {
                    console.log(`Login: %cFailed to retrieve session`, "color: red;");
                    return reject(response.statusText || 'Failed to retrieve session');
                }
            }
            catch (error) {
                console.log(`Login: %cError occurred: ${error.message}`, "color: red;");
                return reject(error.message);
            }
        });
    },
    /**
     * GetDevices - fetches session data and sets window.Siperb.SESSION
     * @param {Object} options - options for session retrieval
     * @returns {Promise<Object>} - resolves with session object
     */
    GetDevices(options) {
        return new Promise(async function (resolve, reject) {
            let isResolved = false;
            // Check if the session is already in localStorage
            if(typeof options.EnableCache === "boolean" && options.EnableCache === true){
                if(typeof options.SessionKey === "string" && options.SessionKey != ""){
                    // Use the sessionKey from options or default to 'SiperbSession'
                    console.log(`GetSession: %cUsing SessionKey: ${options.SessionKey}`, "color: blue;");
                    if(typeof window !== 'undefined' && typeof window.localStorage !== "undefined"){
                        let cachedSession = localStorage.getItem(options.SessionKey);
                        if (cachedSession) {
                            // Parse the JSON string to an object
                            try {
                                cachedSession = JSON.parse(cachedSession);
                                if (typeof window !== 'undefined') {
                                    window.SiperbAPI = window.SiperbAPI || {};
                                    window.SiperbAPI.SESSION = cachedSession;
                                }
                                // Resolve but don't return.
                                resolve(cachedSession);
                                isResolved = true;
                                console.log(`GetSession: %cUsing cached session`,  "color: green;");
                            }
                            catch (error) {
                                console.log(`GetSession: %cError parsing cached session: ${error.message}`, "color: red;");
                            }
                        }
                        // Nothing cached
                    }
                }
                else {
                    console.log(`GetSession: %cEnableCache is enabled, but no CacheKey provided`, "color: orange;");
                }
            }
            // Not using cache, fetch from API

            // Now perform the API call
            const url = `https://api.siperb.com/Users/${options.UserId}/Devices/`;
            const fetchOptions =  {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': options.SessionToken
                }
            };
            try{
                let response = await fetch(url, fetchOptions);
                if (response.ok) {
                    // If the response is ok, we can proceed
                    console.log(`GetSession: %cGot session from API`, "color: green;");
                    // Get the Session from the response
                    try{
                        let data = await response.json();
                        // Filter for Platform script
                        data = data.filter(item => item.Platform === 'script');
                        // Save the json data to the localStorage
                        if(typeof options.EnableCache === "boolean" && options.EnableCache === true){
                            if(typeof options.SessionKey === "string" && options.SessionKey !== ""){
                                if(typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'){
                                    window.localStorage.setItem(options.SessionKey, JSON.stringify(data));
                                    console.log(`GetSession: %cUpdated Session`, "color: green;");
                                }
                            }
                        }
                        if(typeof window !== 'undefined'){
                            window.SiperbAPI = window.SiperbAPI || {};
                            window.SiperbAPI.DEVICES = data;
                        }
                        if(!isResolved) resolve(data);
                    }
                    catch(e){
                        console.log(`GetSession: %cError getting Session: ${e.message}`, "color: red;");
                        if(!isResolved) resolve(null);
                    }
                }
                else {
                    console.log(`GetSession: %cBad Response ${response.status}`, "color: red;");
                    if(!isResolved) resolve(null);
                }
            }
            catch(e){
                console.log(`GetSession: %cError getting session: ${e.message}`, "color: red;");
                if(!isResolved) resolve(null);
            }
        });
    },
    /**
     * GetProvisioning - fetches provisioning data and sets window.Siperb.PROVISIONING
     * @param {Object} options - options for provisioning retrieval
     * @returns {Promise<Object>} - resolves with provisioning object
     */
    GetProvisioning(options) {
        return new Promise(async function (resolve, reject) {
            let isResolved = false;
            // Check if the Provisioning is already in localStorage
            if(typeof options.EnableCache === "boolean" && options.EnableCache === true){
                if(typeof options.ProvisioningKey === "string" && options.ProvisioningKey != ""){
                    // Use the ProvisioningKey from options or default to 'SiperbProvisioning'
                    console.log(`GetProvisioning: %cUsing ProvisioningKey: ${options.ProvisioningKey}`, "color: blue;");
                    if(typeof window !== 'undefined' && typeof window.localStorage !== "undefined"){
                        let cachedProvisioning = localStorage.getItem(options.ProvisioningKey);
                        if (cachedProvisioning) {
                            // Parse the JSON string to an object
                            try {
                                cachedProvisioning = JSON.parse(cachedProvisioning);
                                if (typeof window !== 'undefined') {
                                    window.SiperbAPI = window.SiperbAPI || {};
                                    window.SiperbAPI.PROVISIONING = cachedProvisioning;
                                }
                                // Resolve but don't return.
                                resolve(cachedProvisioning);
                                isResolved = true;
                                console.log(`GetProvisioning: %cUsing cached Provisioning`,  "color: green;");
                            }
                            catch (error) {
                                console.log(`GetProvisioning: %cError parsing cached Provisioning: ${error.message}`, "color: red;");
                            }
                        }
                        // Nothing cached
                    }
                }
                else {
                    console.log(`GetProvisioning: %cEnableCache is enabled, but no ProvisioningKey provided`, "color: orange;");
                }
            }
            // Not using cache, fetch from API

            // Now perform the API call
            const url = `https://api.siperb.com/Users/${options.UserId}/Devices/${options.DeviceToken}/?password=yes&settings_json=yes`;
            const fetchOptions =  {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': options.SessionToken
                }
            };
            try{
                let response = await fetch(url, fetchOptions);
                if (response.ok) {
                    // If the response is ok, we can proceed
                    console.log(`GetProvisioning: %cGot Provisioning from API`, "color: green;");
                    // Get the Provisioning from the response
                    try{
                        let data = await response.json();
                        if(data.Platform && data.Platform === 'script'){
                            data = data.Settings_json || {};

                            // Save the json data to the localStorage
                            if(typeof options.EnableCache === "boolean" && options.EnableCache === true){
                                if(typeof options.ProvisioningKey === "string" && options.ProvisioningKey !== ""){
                                    if(typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'){
                                        window.localStorage.setItem(options.ProvisioningKey, JSON.stringify(data));
                                        console.log(`GetProvisioning: %cUpdated Provisioning`, "color: green;");
                                    }
                                }
                            }
                            if(typeof window !== 'undefined'){
                                window.SiperbAPI = window.SiperbAPI || {};
                                window.SiperbAPI.PROVISIONING = data;
                            }
                            if(!isResolved) resolve(data);
                        }
                        else {
                            console.log(`GetProvisioning: %cNo valid Platform found`, "color: orange;");
                            if(!isResolved) resolve(null);
                        }
                    }
                    catch(e){
                        console.log(`GetProvisioning: %cError getting Provisioning: ${e.message}`, "color: red;");
                        if(!isResolved) resolve(null);
                    }
                }
                else {
                    console.log(`GetProvisioning: %cBad Response ${response.status}`, "color: red;");
                    if(!isResolved) resolve(null);
                }
            }
            catch(e){
                console.log(`GetProvisioning: %cError getting Provisioning: ${e.message}`, "color: red;");
                if(!isResolved) resolve(null);
            }
        });
    },
    /**
     * Load the Browser Phone into the IFRAME
     * @param {HTMLIFrameElement} The iframe element to load the phone into 
     * @returns {Promise<Object>} - resolves when done, or rejects with error
     */
    LoadBrowserPhone(iframeElement){
        return new Promise(async function(resolve, reject){
            // Load the Browser Phone into the IFRAME
            if (!iframeElement || !iframeElement.contentWindow || !iframeElement.contentWindow.document) {
                console.log(`LoadBrowserPhone: %cInvalid IFRAME element`, "color: red;");
                return reject("Invalid IFRAME element");
            }

            const PhoneWindow = iframeElement.contentWindow;
            const phoneDoc = PhoneWindow.document;
            // Load the Browser Phone Layer
            let phoneVersionTree = await Siperb.LoadVersionTree("https://y3amulnpc5icrmmnmvtfn44zba0ckjuq.lambda-url.eu-west-1.on.aws/", "BROWSER_PHONE_VERSION_TREE");
            if (!phoneVersionTree) {
                console.log(`LoadBrowserPhone: %cPhone Version tree could not be loaded`, "color: red;");
                return reject("Phone Version tree could not be loaded");
            }
            // Update versionTree to set all the Loaded properties to false
            phoneVersionTree.forEach(function(asset) {
                asset.Loaded = false;
            });
            // Load the HTML file
            await Siperb.LoadHtml(phoneVersionTree, "web", phoneDoc);
            // Load the CSS files
            await Siperb.LoadCss(phoneVersionTree, "web", phoneDoc);
            // Load the JS files, and star the phone
            await Siperb.LoadScripts(phoneVersionTree, "web", phoneDoc);

            // Show Phone Page
            const phone = (PhoneWindow.phone)? PhoneWindow.phone : null;
            if(phone){
                console.log("%cBrowser Phone loaded successfully", "color: green;");
                // At this point the phone should be loaded
                // all the scripts are downloaded from the network, but are designed
                // only to work if they are Initialized.
                return resolve();
            }
            else {
                console.log("%cBrowser Phone failed to load.", "color: red;");
                return reject("Browser Phone failed to load.");
            }
        });
    },
    // Internal Function to Load the Version Tree
    LoadVersionTree(url, cacheKey) {
        return new Promise(async function (resolve, reject) {
            // Check if the version tree is already in localStorage
            let isResolved = false;
            let versionTree = localStorage.getItem(cacheKey);
            if (versionTree) {
                // Parse the JSON string to an object
                versionTree = JSON.parse(versionTree);
                // Resolve the Promise but don't return the function
                console.log(`LoadVersionTree - ${cacheKey}: %cUsing cached version tree`,  "color: orange;");
                resolve(versionTree);
                isResolved = true;
            }
            // Update version tree even if you have it in localStorage
            if(window.navigator.onLine){
                let response = null;
                try{
                    response = await fetch(url);
                    if (response.ok) {
                        // Get the version from the response
                        versionTree = await response.json();
                        // Save the json data to the localStorage
                        localStorage.setItem(cacheKey, JSON.stringify(versionTree));
                        if (!isResolved) resolve(versionTree);
                    }
                    else {
                        console.log(`LoadVersionTree - ${cacheKey}: %cBad Response`, "color: orange;");
                        if (!isResolved) resolve(null);
                    }
                } catch(err){
                    console.log(`LoadVersionTree - ${cacheKey}: %cError: ${err.message}`, "color: red;");
                    if (!isResolved) resolve(null);
                }
            }
            else {
                console.log(`LoadVersionTree - ${cacheKey}: %cFetch Skipped, you are offline`,  "color: orange;");
                if (!isResolved) resolve(null);
            }
        });
    },
    // Internal Function to Load HTML files
    LoadHtml(versionTree, platform, target) {
        // Return a promise that resolves when all the HTML files are loaded
        return new Promise(function (resolve, reject) {
            // Load the HTML files
            versionTree.forEach(async function (asset) {
                if (!asset.Url.startsWith("/") & !asset.Url.startsWith("https://cdn.siperb.com/")) {
                    console.log(`LoadHtml: %cUnable to load HTML: ${asset.Url}`, "color: red;");
                    return; // Skip assets that are not from the CDN
                }
                if ((asset.Platform == "common" || asset.Platform == platform) && asset.Type == "html") {
                    try{
                        let response = await fetch(asset.Url);
                        if (!response.ok) {
                            console.log(`LoadHtml: %cError loading HTML: ${asset.Url}`, "color: red;");
                            resolve();
                            return;
                        }
                        else {
                            let html = await response.text();
                            if(html){
                                target.open();
                                target.write(html);
                                target.close();
                                asset.Loaded = true;
                                console.log("LoadHtml: %cAll HTML files loaded", "color: green;");
                                resolve();
                                return;
                            }
                            else {
                                console.log(`LoadHtml: %cError loading HTML: ${asset.Url}`, "color: red;");
                                resolve();
                                return;
                            }
                        }
                    }
                    catch(err){
                        console.log(`LoadHtml: %cError loading HTML: ${asset.Url}`, "color: red;");
                        resolve();
                        return;
                    }
                }
            });
        });
    },
    // Internal Function to Load CSS files
    LoadCss(versionTree, platform, target) {
        return new Promise(function (resolve, reject) {
            // Load the CSS files
            versionTree.forEach(function (asset) {
                if (!asset.Url.startsWith("/") & !asset.Url.startsWith("https://cdn.siperb.com/")) {
                    console.log(`LoadCss: %cUnable to load CSS: ${asset.Url}`, "color: red;");
                    return; // Skip assets that are not from the CDN
                }
                if ((asset.Platform == "common" || asset.Platform == platform) && asset.Type == "css") {
                    // Create a link element and set the href to the asset URL
                    let link = target.createElement("link");
                    link.href = asset.Url;
                    link.rel = "stylesheet";
                    link.type = "text/css";
                    // Append the link to the head of the phone iframe
                    target.head.appendChild(link);
                    // They will load in their own time, so we don't need to wait for them
                }
            });
            // Loading CSS done
            console.log("LoadCss: %cAll CSS files Added", "color: green;");
            return resolve();
        });
    },
    // Internal Function to Load JS files
    LoadScripts(versionTree, platform, target) {
        return new Promise(function (resolve, reject) {
            // Load the JS files
            versionTree.forEach(function (asset) {
                if (!asset.Url.startsWith("/") & !asset.Url.startsWith("https://cdn.siperb.com/")) {
                    console.log(`LoadScripts: %cUnable to load JS: ${asset.Url}`, "color: red;");
                    return; // Skip assets that are not from the CDN
                }
                if ((asset.Platform == "common" || asset.Platform == platform) && asset.Type == "js") {
                    // Create a script element and set the src to the asset URL
                    // We need to use the phone iframe's document to add the script
                    let script = target.createElement("script");
                    script.onload = function () {
                        // Check if the asset has dependencies
                        // Dependency files should be packed into a single file
                        if (asset.Dependencies) {
                            asset.Dependencies.forEach(function (dependency) {
                                if (!dependency.Url.startsWith("https://cdn.siperb.com/")) {
                                    return; // Skip assets that are not from the CDN
                                }
                                // Load the dependency
                                let depScript = target.createElement("script");
                                depScript.onload = function () {
                                    // Set the Loaded property to true
                                    dependency.Loaded = true;
                                };
                                depScript.onerror = function () {
                                    console.warn(`LoadScripts: %cError loading JS: ${dependency.Url}`, "color: red;");
                                };
                                depScript.src = dependency.Url;
                                // Append the script to the head of the phone iframe
                                target.head.appendChild(depScript);
                                // These can load in their own time, so we don't need to wait for them
                            });
                        }
                        // Set the Loaded property to true
                        asset.Loaded = true;
                        // Check if all the JS files are loaded, by looking at the .Loaded property
                        let allLoaded = true;
                        versionTree.forEach(function (asset) {
                            if ((asset.Platform == "common" || asset.Platform == platform) && asset.Type == "js" && asset.Loaded == false) allLoaded = false;
                        });
                        if (allLoaded) {
                            console.log("LoadScripts: %cAll JS files loaded", "color: green;");
                            resolve();
                        }
                    };
                    script.onerror = function () {
                        // There is no error handling for this, but we should probably do something
                        console.log(`LoadScripts: %cError loading JS: ${asset.Url}`, "color: red;");
                    };
                    script.src = asset.Url;
                    // Append the script to the head of the phone iframe
                    target.head.appendChild(script);
                }
            });
        });
    },
    /**
     * 
     * @param {Object} options object with the following properties:
     * @param {Object} options.Provisioning - The provisioning object
     * @param {HTMLIFrameElement} options.PhoneFrame - The iframe element containing the phone
     * @param {string} options.ProfileUserId - The Profile User ID (Device ID)
     * @param {string} options.SessionId - The current session ID
     * @param {string} options.UserId - The current user ID
     * @param {function} [options.OnLoad] - Optional OnLoad callback function
     * @returns {Promise} - Resolves when the phone is provisioned, or rejects with an error
     */
    ProvisionPhone(options){
        return new Promise(async function(resolve, reject){
            if (!options.Provisioning || !options.PhoneFrame || !options.ProfileUserId || !options.SessionId || !options.UserId) {
                console.log(`ProvisionPhone: %cInvalid options`, "color: red;");
                return reject("Invalid options");
            }
            const PhoneWindow = (options.PhoneFrame.contentWindow) ? options.PhoneFrame.contentWindow : null;
            if (!PhoneWindow) {
                console.log(`ProvisionPhone: %cInvalid PhoneFrame`, "color: red;");
                return reject("Invalid PhoneFrame");
            }
            const phoneDoc = (PhoneWindow.document) ? PhoneWindow.document : null;
            const phone = (PhoneWindow.phone) ? PhoneWindow.phone : null;
            if (!phoneDoc || !phone) {
                console.log(`ProvisionPhone: %cPhone not loaded`, "color: red;");
                return reject("Phone not loaded");
            }

            const provisioning = options.Provisioning;

            // Storage Settings
            // ================
            // The Phone Profile User ID is the Device ID
            phone.PROFILE_USER_ID = options.ProfileUserId;
            console.log("ProvisionPhone: %cCalling phone.InitStorage()", "color: blue;");
            await phone.InitStorage();
        
            // Core Settings
            // =============
            console.log("ProvisionPhone: %cCalling phone.InitBrowserPhone()", "color: blue;");
            await phone.InitBrowserPhone();

            // Media Manager Settings
            // ======================
            phone.Settings.MediaLocation = "https://cdn.siperb.com/media/";          // Defaults to "./media/"
            console.log("ProvisionPhone: %cCalling phone.InitMediaManager()", "color: blue;");
            await phone.InitMediaManager(phone.MediaManagerCore.Web);


            // Browser Phone UI
            // ================
            phone.Settings.MaxDidLength = (typeof options.MaxDidLength === "number") ? options.MaxDidLength : 16;
            phone.Settings.EnableAlphanumericDial = (typeof options.EnableAlphanumericDial === "boolean") ? options.EnableAlphanumericDial : false;
            phone.Settings.UiMaxWidth = (typeof options.UiMaxWidth === "number") ? options.UiMaxWidth : 1024;
            phone.Settings.DisplayDateFormat = (typeof options.DisplayDateFormat === "undefined")? options.DisplayDateFormat : "YYYY-MM-DD";
            phone.Settings.DisplayTimeFormat = (typeof options.DisplayTimeFormat === "undefined")? options.DisplayTimeFormat : "h:mm:ss A";
            phone.Settings.UiThemeStyle = (typeof options.UiThemeStyle !== "undefined") ? options.UiThemeStyle : "system";
            phone.Settings.Language = (typeof options.language !== "undefined" && options.language !== null) ? options.language : "auto";
            phone.Settings.BuddyAutoDeleteAtEnd = (typeof options.BuddyAutoDeleteAtEnd == "boolean") ? options.BuddyAutoDeleteAtEnd : false;
            phone.Settings.HideAutoDeleteBuddies = (typeof options.HideAutoDeleteBuddies == "boolean") ? options.HideAutoDeleteBuddies : false;
            phone.Settings.BuddySortBy = (typeof options.BuddySortBy !== "undefined") ? options.BuddySortBy : "activity";

            phone.Settings.ProfileUserName = (typeof provisioning.profileName !== "undefined") ? provisioning.profileName : "Siperb User";
            phone.Settings.AvatarLocation = "https://cdn.siperb.com/avatars/";       // Defaults to "./avatars/"
            phone.Settings.AvailableAvatar = ["default.0.webp", "default.1.webp", "default.2.webp", "default.3.webp", "default.4.webp", "default.5.webp", "default.6.webp", "default.7.webp", "default.8.webp"];

            phone.Settings.WallpaperLocation = "https://cdn.siperb.com/wallpaper/";  // Defaults to "./wallpaper/"
            phone.Settings.AvailableWallpaper = [{ "Dark": "wallpaper.0.dark.webp", "Light": "wallpaper.0.light.webp" }, { "Dark": "wallpaper.0.dark.webp", "Light": "wallpaper.0.light.webp" }];
            phone.Settings.WallpaperLight = "wallpaper.0.light.webp";                               // A file name from the above list. Defaults to "wallpaper.0.light.webp"
            phone.Settings.WallpaperDark = "wallpaper.0.dark.webp";                                 // A file name from the above list. Defaults to "wallpaper.0.dark.webp"

            phone.Settings.EnableAvatar = (typeof options.EnableAvatar === "boolean") ? options.EnableAvatar : false;
            phone.Settings.EnabledSettings = (typeof options.EnabledSettings === "boolean") ? options.EnabledSettings : false;
            phone.Settings.EnableCallRecording = (typeof options.EnableCallRecording === "boolean") ? options.EnableCallRecording : false;
            phone.Settings.EnableDialPad = (typeof options.EnableDialPad === "boolean") ? options.EnableDialPad : false;
            phone.Settings.EnableMessageStreamSearch = false;
            phone.Settings.EnableAutoAnswer = (typeof options.EnableAutoAnswer === "boolean") ? options.EnableAutoAnswer : false;
            phone.Settings.EnableDoNotDisturb =(typeof options.EnableDoNotDisturb === "boolean") ? options.EnableDoNotDisturb : false;
            phone.Settings.EnableCallWaiting = (typeof options.EnableCallWaiting === "boolean") ? options.EnableCallWaiting : false;
            phone.Settings.EnableConferenceCall = false
            phone.Settings.EnableCallTransfer = (typeof options.EnableCallTransfer === "boolean") ? options.EnableCallTransfer : false;
            phone.Settings.EnableCallHold = (typeof options.EnableCallHold === "boolean") ? options.EnableCallHold : false;
            phone.Settings.EnableCallMute = (typeof options.EnableCallMute === "boolean") ? options.EnableCallMute : false;
            phone.Settings.EnableVideoCalling = false;
            phone.Settings.EnableDeviceSelector = (typeof options.EnableDeviceSelector === "boolean") ? options.EnableDeviceSelector : false;
            phone.Settings.EnableVideoPresentation = false;
            phone.Settings.EnablePresentBlank = false;
            phone.Settings.EnablePresentPicture = false;
            phone.Settings.EnablePresentWebcam = false;
            phone.Settings.EnablePresentScreen = false;
            phone.Settings.EnablePresentVideo = false;
            phone.Settings.EnablePresentWhiteboard = false;
            phone.Settings.EnableSubscribe = false;
            phone.Settings.EnablePresence = false;
            phone.Settings.EnableText = false;
            phone.Settings.EnableFax = false;
            phone.Settings.EnableSMS = false;
            phone.Settings.EnablePush = true;
            phone.Settings.EnableDisplayCallDetailRecords = (typeof options.EnableDisplayCallDetailRecords === "boolean") ? options.EnableDisplayCallDetailRecords : false;

            // Before displaying the phone, you should save the settings
            phone.SaveSettings();

            // The Onload function must be set before the UI is initialized
            // Otherwise the rest can be set after
            if(typeof options.OnLoad == "function"){
                phone.OnLoad = options.OnLoad;
            }

            // Should call UI last
            console.log("Calling phone.InitUiApi()... ");
            await phone.InitUiApi();

            // Load Providers
            if (phone.InitSipProvider) {
                await phone.InitSipProvider(phone.SipProviderCore.Web);
                phone.AddProvider(phone.SipProvider);
                let phoneOptions  = {
                    // We set the SIP details, but don't save them
                    wssServer: provisioning.SipWssServer,
                    SipUsername: provisioning.SipUsername,
                    SipPassword: provisioning.SipPassword,
                    SipDomain: provisioning.SipDomain,
                    DisplayName: phone.Settings.ProfileUserName,
                    ContactUserName: provisioning.SipContact,
                    WebSocketPort: provisioning.SipWebsocketPort,
                    ServerPath: provisioning.SipServerPath,
                    UserAgentStr: "Siperb/0.4 (Script) "+ navigator.userAgent,
                    // RegisterContactParams : AdditionalContactParams //(this is for push notifications)
                }
                if(provisioning.RegistrationMode == "Proxy" || provisioning.SipWssServer.endsWith(".siperb.com")){
                    phoneOptions.ExtraRegisterHeaders = {
                        "X-Siperb-Sid": options.SessionId,
                        "X-Siperb-Uid": options.UserId,
                    }
                    // Optionally Add Bearer Token for JWT Authentication
                    if(provisioning.SipJwt && provisioning.SipJwt != ""){
                        phoneOptions.ExtraRegisterHeaders.Authorization = "Bearer " + provisioning.SipJwt;
                    }
                    phoneOptions.ExtraInviteHeaders = {
                        "X-Siperb-Sid": options.SessionId,
                        "X-Siperb-Uid": options.UserId,
                    }
                    // Optionally Add Bearer Token for JWT Authentication
                    if(provisioning.SipJwt && provisioning.SipJwt != ""){
                        phoneOptions.ExtraInviteHeaders.Authorization = "Bearer " + provisioning.SipJwt;
                    }
                }
                await phone.SipProvider.Init(phoneOptions);
                phone.SipProvider.Connect();
            }
            console.log("ProvisionPhone: %cProvisioning Complete", "color: green;");
            return resolve(phone);
        });
    },
};

// Export for modules (ESM/CommonJS)
export default Siperb;

// Attach to window for browser global usage
if (typeof window !== 'undefined') {
    window.SiperbAPI = window.SiperbAPI || {};
    Object.assign(window.SiperbAPI, Siperb);
}