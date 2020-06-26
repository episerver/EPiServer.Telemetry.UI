using System;
using EPiServer.Shell.Security;

namespace EPiServer.Telemetry.UI.Tests.Telemetry.Internal
{
    public class FakeUser : IUIUser
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public bool IsApproved { get; set; }
        public bool IsLockedOut { get; set; }
        public string PasswordQuestion { get; }
        public string ProviderName { get; }
        public string Comment { get; set; }
        public DateTime CreationDate { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public DateTime? LastLockoutDate { get; }
    }
}
