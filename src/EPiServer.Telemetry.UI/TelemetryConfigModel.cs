using System;
using System.Collections.Generic;

namespace EPiServer.Telemetry.UI
{
    public class TelemetryConfigModel
    {
        public string Client { get; internal set; }

        public IDictionary<string, object> Configuration { get; internal set; }

        public string User { get; internal set; }

        public IDictionary<string, string> Versions { get; internal set; }

        public DateTime? User_creationDate { get; internal set; }

        public bool User_hasAdminAccess { get; internal set; }

        internal static TelemetryConfigModel Disabled = new TelemetryConfigModel
        {
            Configuration = new Dictionary<string, object>
            {
                ["disableTelemetry"] = true
            }
        };
    }
}
