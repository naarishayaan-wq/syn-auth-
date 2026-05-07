using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Net;
using System.Text;
using System.Security.Principal;
using System.Text.RegularExpressions;
using System.IO;

namespace KeyAuth
{
    public class api
    {
        /*
         * ═══════════════════════════════════════════════════════
         * APPLICATION CREDENTIALS
         * ═══════════════════════════════════════════════════════
         */
        public string name = "ENTER_NAME_HERE";     // Paste Name Here
        public string ownerid = "ENTER_OWNERID_HERE"; // Paste Owner ID Here
        public string secret = "";   // Not required for local testing
        public string version = "1.0"; // Must match your dashboard app version

        /*
         * ═══════════════════════════════════════════════════════
         * DEVELOPMENT SETTINGS
         * ═══════════════════════════════════════════════════════
         */
        public bool is_demo = true; // IMPORTANT: Set to TRUE for local dashboard, FALSE for production KeyAuth.win

        private string sessionid;
        public user_data_class user_data = new user_data_class();
        public app_data_class app_data = new app_data_class();
        public response_class response = new response_class();

        public api(string name, string ownerid)
        {
            this.name = name;
            this.ownerid = ownerid;
            
            try {
                ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072;
            } catch { }
        }

        #region API Methods

        public void init()
        {
            NameValueCollection values = new NameValueCollection();
            values.Add("type", "init");
            values.Add("ver", version);
            values.Add("name", name);
            values.Add("ownerid", ownerid);
            values.Add("secret", secret);

            string res = req(values);

            if (get_json_val(res, "success") == "true")
            {
                sessionid = get_json_val(res, "sessionid");
                app_data.numUsers = get_json_val(res, "numUsers", "appinfo");
                app_data.numOnlineUsers = get_json_val(res, "numOnlineUsers", "appinfo");
                app_data.numKeys = get_json_val(res, "numKeys", "appinfo");
                app_data.version = get_json_val(res, "version", "appinfo");
                app_data.customerPanelLink = get_json_val(res, "customerPanelLink", "appinfo");
                
                response.success = true;
                response.message = "Initialized successfully.";
            }
            else
            {
                response.success = false;
                response.message = get_json_val(res, "message");
            }
        }

        public void login(string user, string pass) => auth("login", user, pass);
        public void register(string user, string pass, string key) => auth("register", user, pass, key);
        public void license(string key) => auth("license", "", "", key);
        public void upgrade(string user, string key) => auth("upgrade", user, "", key);

        private void auth(string type, string user, string pass, string key = "")
        {
            if (string.IsNullOrEmpty(sessionid))
            {
                response.success = false;
                response.message = "Please initialize first.";
                return;
            }

            NameValueCollection values = new NameValueCollection();
            values.Add("type", type);
            values.Add("username", user);
            values.Add("pass", pass);
            values.Add("key", key);
            values.Add("hwid", get_hwid());
            values.Add("sessionid", sessionid);
            values.Add("name", name);
            values.Add("ownerid", ownerid);
            values.Add("secret", secret);

            string res = req(values);

            response.success = get_json_val(res, "success") == "true";
            response.message = get_json_val(res, "message");

            if (response.success)
            {
                user_data.username = get_json_val(res, "username", "info");
                user_data.ip = get_json_val(res, "ip", "info");
                user_data.hwid = get_json_val(res, "hwid", "info");
                user_data.createdate = get_json_val(res, "createdate", "info");
                user_data.lastlogin = get_json_val(res, "lastlogin", "info");
                user_data.expiry = get_json_val(res, "expiry", "info");
                
                var subs = get_json_val(res, "subscriptions", "info");
                if (!string.IsNullOrEmpty(subs)) {
                    // Simple parsing for the first subscription
                    user_data.subscriptions = new List<DataSubscription>();
                    user_data.subscriptions.Add(new DataSubscription {
                        subscription = get_json_val(res, "subscription", "subscriptions"),
                        expiry = get_json_val(res, "expiry", "subscriptions"),
                        timeleft = get_json_val(res, "timeleft", "subscriptions")
                    });
                }
            }
        }

        public void check()
        {
            if (string.IsNullOrEmpty(sessionid)) return;
            NameValueCollection values = new NameValueCollection();
            values.Add("type", "check");
            values.Add("sessionid", sessionid);
            values.Add("name", name);
            values.Add("ownerid", ownerid);
            req(values);
        }

        public string var(string varid)
        {
            if (string.IsNullOrEmpty(sessionid)) return "";
            NameValueCollection values = new NameValueCollection();
            values.Add("type", "var");
            values.Add("varid", varid);
            values.Add("sessionid", sessionid);
            values.Add("name", name);
            values.Add("ownerid", ownerid);
            string res = req(values);
            return (get_json_val(res, "success") == "true") ? get_json_val(res, "message") : "";
        }

        public void log(string message)
        {
            if (string.IsNullOrEmpty(sessionid)) return;
            NameValueCollection values = new NameValueCollection();
            values.Add("type", "log");
            values.Add("pcuser", Environment.UserName);
            values.Add("message", message);
            values.Add("sessionid", sessionid);
            values.Add("name", name);
            values.Add("ownerid", ownerid);
            req(values);
        }

        public string webhook(string webid, string param, string body = "", string conttype = "")
        {
            if (string.IsNullOrEmpty(sessionid)) return "";
            NameValueCollection values = new NameValueCollection();
            values.Add("type", "webhook");
            values.Add("webid", webid);
            values.Add("params", param);
            values.Add("body", body);
            values.Add("conttype", conttype);
            values.Add("sessionid", sessionid);
            values.Add("name", name);
            values.Add("ownerid", ownerid);
            string res = req(values);
            return (get_json_val(res, "success") == "true") ? get_json_val(res, "response") : "";
        }

        public string create_license(string mask, string time, string amount)
        {
            if (string.IsNullOrEmpty(sessionid)) return "";
            NameValueCollection values = new NameValueCollection();
            values.Add("type", "license_create");
            values.Add("mask", mask);
            values.Add("time", time);
            values.Add("amount", amount);
            values.Add("sessionid", sessionid);
            values.Add("name", name);
            values.Add("ownerid", ownerid);
            values.Add("secret", secret);

            string res = req(values);
            return (get_json_val(res, "success") == "true") ? get_json_val(res, "message") : "";
        }

        #endregion

        #region Internal Logic

        private string req(NameValueCollection post_data)
        {
            try
            {
                using (WebClient client = new WebClient())
                {
                    // If running on localhost, use the local dashboard. Otherwise use the production KeyAuth server.
                    string url = is_demo ? "http://localhost:5173/api/1.2/" : "https://keyauth.win/api/1.2/";
                    
                    if (is_demo && (name == "ENTER_NAME_HERE" || ownerid == "ENTER_OWNERID_HERE")) {
                        Console.WriteLine(" [KeyAuth] ⚠️ Warning: You are using placeholder credentials. Login might fail.");
                    }

                    byte[] raw = client.UploadValues(url, post_data);
                    string res = Encoding.UTF8.GetString(raw);
                    
                    if (is_demo) {
                        // In demo mode, we log the raw response for easier debugging
                        // Console.WriteLine(" [MOCK RESPONSE] " + res);
                    }
                        Console.WriteLine($" [KeyAuth] Request: {post_data["type"]} | Response: {res}");
                    }
                    
                    return res;
                }
            }
            catch (WebException ex)
            {
                string errorMsg = "Connection failed. ";
                if (ex.Status == WebExceptionStatus.ConnectFailure) {
                    errorMsg += "Is your local dashboard running? (npm run dev)";
                    if (is_demo) {
                        System.Windows.Forms.MessageBox.Show("Could not connect to local dashboard!\n\nMake sure 'npm run dev' is running in your terminal.", "KeyAuth Connection Error", System.Windows.Forms.MessageBoxButtons.OK, System.Windows.Forms.MessageBoxIcon.Error);
                    }
                } else {
                    using (var stream = ex.Response?.GetResponseStream())
                    using (var reader = new StreamReader(stream)) {
                        errorMsg += reader.ReadToEnd();
                    }
                }
                
                if (is_demo) Console.WriteLine($" [KeyAuth] ❌ Error: {errorMsg}");
                return "{\"success\":false,\"message\":\"" + errorMsg + "\"}";
            }
        }

        private string get_json_val(string json, string key, string obj = "")
        {
            try {
                if (string.IsNullOrEmpty(json)) return "";
                json = json.Replace("\r", "").Replace("\n", "").Trim();
                
                string pattern;
                if (!string.IsNullOrEmpty(obj)) {
                    // Match key inside a nested object/array
                    pattern = "\"" + obj + "\":\\s*[\\{\\[][^\\{\\[]*?\"" + key + "\":\\s*\"(.*?)\"";
                    Match match = Regex.Match(json, pattern);
                    if (match.Success) return match.Groups[1].Value;

                    pattern = "\"" + obj + "\":\\s*[\\{\\[][^\\{\\[]*?\"" + key + "\":\\s*(true|false|[0-9\\.]+)";
                    match = Regex.Match(json, pattern);
                    if (match.Success) return match.Groups[1].Value;
                } else {
                    // Match key at root level
                    pattern = "\"" + key + "\":\\s*\"(.*?)\"";
                    Match match = Regex.Match(json, pattern);
                    if (match.Success) return match.Groups[1].Value;

                    pattern = "\"" + key + "\":\\s*(true|false|[0-9\\.]+)";
                    match = Regex.Match(json, pattern);
                    if (match.Success) return match.Groups[1].Value;
                }
                
                return "";
            } catch { return ""; }
        }

        private string get_hwid()
        {
            try { 
                // Reliable HWID for Windows
                string id = WindowsIdentity.GetCurrent().User.Value;
                return id;
            }
            catch { return "unknown_hwid"; }
        }

        #endregion

        #region Data Classes

        public class user_data_class 
        { 
            public string username, ip, hwid, createdate, lastlogin, expiry;
            public List<DataSubscription> subscriptions = new List<DataSubscription>();
        }
        public class DataSubscription { public string subscription, expiry, timeleft; }
        public class app_data_class { public string numUsers, numOnlineUsers, numKeys, version, customerPanelLink, downloadLink; }
        public class response_class { public bool success; public string message; }

        #endregion
    }
}

