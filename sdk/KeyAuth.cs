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
        public string secret = "";   // Default empty
        public string version = "1.0"; // Default version

        /*
         * ═══════════════════════════════════════════════════════
         * DEVELOPMENT SETTINGS
         * ═══════════════════════════════════════════════════════
         */
        public bool is_demo = true; // Set to TRUE for Localhost Dashboard, FALSE for real KeyAuth.win

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
            }
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
                    // DIRECT CONNECT TO LOCALHOST IF DEMO IS TRUE
                    string url = is_demo ? "http://localhost:5173/api/1.2/" : "https://keyauth.win/api/1.2/";
                    byte[] raw = client.UploadValues(url, post_data);
                    return Encoding.UTF8.GetString(raw);
                }
            }
            catch (WebException ex)
            {
                return "{\"success\":false,\"message\":\"Connection failed: " + ex.Status + "\"}";
            }
        }

        private string get_json_val(string json, string key, string obj = "")
        {
            try {
                json = json.Replace("\r", "").Replace("\n", "");
                string pattern = string.IsNullOrEmpty(obj) ? "\"" + key + "\":\\s*\"(.*?)\"" : "\"" + obj + "\":\\s*\\{.*?\"" + key + "\":\\s*\"(.*?)\"";
                Match match = Regex.Match(json, pattern);
                if (match.Success) return match.Groups[1].Value;
                pattern = string.IsNullOrEmpty(obj) ? "\"" + key + "\":\\s*(true|false|[0-9\\.]+)" : "\"" + obj + "\":\\s*\\{.*?\"" + key + "\":\\s*(true|false|[0-9\\.]+)";
                match = Regex.Match(json, pattern);
                return match.Success ? match.Groups[1].Value : "";
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
        public class app_data_class { public string numUsers, numOnlineUsers, numKeys, version, customerPanelLink, downloadLink; }
        public class response_class { public bool success; public string message; }

        #endregion
    }
}

