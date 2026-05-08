using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Net;
using System.Text;
using System.Security.Principal;
using System.Text.RegularExpressions;
using System.IO;

/*
 * ═══════════════════════════════════════════════════════
 * SYN AUTH SECURITY SDK - OFFICIAL C# INTEGRATION
 * ═══════════════════════════════════════════════════════
 */

namespace KeyAuth
{
    public class api
    {
        // Application Credentials
        public string name = "ENTER_NAME_HERE";
        public string ownerid = "ENTER_OWNERID_HERE";
        public string secret = ""; 
        public string version = "1.0";

        // Development Settings
        // Set to TRUE for local testing (localhost:5173)
        // Set to FALSE for production testing on Render (syn-auth.onrender.com)
        public bool is_demo = true; 

        // Production API Endpoint
        private string prod_url = "https://syn-auth.onrender.com/api/1.2/";
        private string local_url = "http://localhost:5173/api/1.2/";

        private string sessionid;
        public user_data_class user_data = new user_data_class();
        public app_data_class app_data = new app_data_class();
        public response_class response = new response_class();

        public api(string name, string ownerid)
        {
            this.name = name;
            this.ownerid = ownerid;
            
            try {
                // SSL/TLS security protocols
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
                
                // Parse app info
                app_data.numUsers = get_json_val(res, "numUsers", "appinfo");
                app_data.numOnlineUsers = get_json_val(res, "numOnlineUsers", "appinfo");
                app_data.numKeys = get_json_val(res, "numKeys", "appinfo");
                app_data.version = get_json_val(res, "version", "appinfo");
                app_data.customerPanelLink = get_json_val(res, "customerPanelLink", "appinfo");

                response.success = true;
                response.message = "Initialized successfully.";
                if (is_demo) Console.WriteLine(" [SYN AUTH] ✅ Initialized.");
            }
            else
            {
                response.success = false;
                response.message = get_json_val(res, "message");
                if (is_demo) Console.WriteLine(" [SYN AUTH] ❌ Init failed: " + response.message);
            }
        }

        public void login(string user, string pass)
        {
            NameValueCollection values = new NameValueCollection();
            values.Add("type", "login");
            values.Add("username", user);
            values.Add("pass", pass);
            values.Add("sessionid", sessionid);
            values.Add("name", name);
            values.Add("ownerid", ownerid);
            values.Add("hwid", get_hwid());

            string res = req(values);

            if (get_json_val(res, "success") == "true")
            {
                load_user_data(res);
                response.success = true;
                response.message = "Logged in successfully.";
            }
            else
            {
                response.success = false;
                response.message = get_json_val(res, "message");
            }
        }

        public void license(string key)
        {
            NameValueCollection values = new NameValueCollection();
            values.Add("type", "license");
            values.Add("key", key);
            values.Add("sessionid", sessionid);
            values.Add("name", name);
            values.Add("ownerid", ownerid);
            values.Add("hwid", get_hwid());

            string res = req(values);

            if (get_json_val(res, "success") == "true")
            {
                load_user_data(res);
                response.success = true;
                response.message = "License activated.";
            }
            else
            {
                response.success = false;
                response.message = get_json_val(res, "message");
            }
        }

        public string create_license(string mask, string time, string amount)
        {
            NameValueCollection values = new NameValueCollection();
            values.Add("type", "create_license");
            values.Add("mask", mask);
            values.Add("time", time);
            values.Add("amount", amount);
            values.Add("sessionid", sessionid);
            values.Add("name", name);
            values.Add("ownerid", ownerid);

            string res = req(values);

            if (get_json_val(res, "success") == "true")
            {
                return get_json_val(res, "key");
            }
            return "";
        }

        #endregion

        #region Internal Logic

        private void load_user_data(string json)
        {
            user_data.username = get_json_val(json, "username", "info");
            user_data.ip = get_json_val(json, "ip", "info");
            user_data.hwid = get_json_val(json, "hwid", "info");
            user_data.createdate = get_json_val(json, "createdate", "info");
            user_data.lastlogin = get_json_val(json, "lastlogin", "info");
            user_data.expiry = get_json_val(json, "expiry", "info");
        }

        private string req(NameValueCollection post_data)
        {
            try
            {
                using (WebClient client = new WebClient())
                {
                    string url = is_demo ? local_url : prod_url;
                    byte[] raw = client.UploadValues(url, post_data);
                    return Encoding.UTF8.GetString(raw);
                }
            }
            catch (Exception ex)
            {
                if (is_demo) Console.WriteLine(" [SYN AUTH] ❌ Connection Error: " + ex.Message);
                return "{\"success\":false,\"message\":\"Connection failed. Ensure dashboard is running.\"}";
            }
        }

        private string get_json_val(string json, string key, string obj = "")
        {
            try {
                if (string.IsNullOrEmpty(json)) return "";
                
                // If it's HTML, return empty (prevents parsing errors)
                if (json.TrimStart().StartsWith("<")) return "";

                string pattern;
                if (!string.IsNullOrEmpty(obj)) {
                    // Try to find the object first, then the key inside it
                    // Support both "appinfo" and "info" for compatibility
                    if (obj == "appinfo") {
                        Match m = Regex.Match(json, "\"info\"\\s*:\\s*\\{");
                        if (!m.Success) m = Regex.Match(json, "\"appinfo\"\\s*:\\s*\\{");
                        if (m.Success) {
                            // Extract content between braces for this object
                            int start = m.Index + m.Length;
                            int end = json.IndexOf('}', start);
                            if (end > start) {
                                string sub = json.Substring(start, end - start);
                                return get_json_val(sub, key);
                            }
                        }
                    }

                    pattern = "\"" + obj + "\":\\s*[\\{\\[][^\\{\\[]*?\"" + key + "\":\\s*\"(.*?)\"";
                    Match match = Regex.Match(json, pattern);
                    if (match.Success) return match.Groups[1].Value;

                    pattern = "\"" + obj + "\":\\s*[\\{\\[][^\\{\\[]*?\"" + key + "\":\\s*(true|false|[0-9\\.]+)";
                    match = Regex.Match(json, pattern);
                    if (match.Success) return match.Groups[1].Value;
                } else {
                    pattern = "\"" + key + "\":\\s*\"(.*?)\"";
                    Match match = Regex.Match(json, pattern, RegexOptions.IgnoreCase);
                    if (match.Success) return match.Groups[1].Value;

                    pattern = "\"" + key + "\":\\s*(true|false|[0-9\\.]+)";
                    match = Regex.Match(json, pattern, RegexOptions.IgnoreCase);
                    if (match.Success) return match.Groups[1].Value;
                }
                return "";
            } catch { return ""; }
        }

        private string get_hwid()
        {
            try { return WindowsIdentity.GetCurrent().User.Value; }
            catch { return "unknown_hwid"; }
        }

        #endregion

        #region Data Classes

        public class user_data_class { public string username, ip, hwid, createdate, lastlogin, expiry; }
        public class app_data_class { public string numUsers, numOnlineUsers, numKeys, version, customerPanelLink; }
        public class response_class { public bool success; public string message; }

        #endregion
    }
}
