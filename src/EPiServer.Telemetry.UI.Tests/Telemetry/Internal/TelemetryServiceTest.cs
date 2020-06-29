using System;
using System.Net;
using System.Net.Http;
using System.Security.Principal;
using System.Threading.Tasks;
using EPiServer.Framework.Serialization.Json.Internal;
using EPiServer.Licensing;
using EPiServer.Security;
using EPiServer.Shell.Modules;
using EPiServer.Shell.Security;
using Moq;
using Xunit;

namespace EPiServer.Telemetry.UI.Tests.Telemetry.Internal
{
    public class TelemetryServiceTest
    {
        private readonly TelemetryOptions _telemetryOptions;
        private readonly LicensingOptions _licensingOptions;
        private readonly HttpResponseMessage _httpResponseMessage;
        private readonly TelemetryService _telemetryService;
        private readonly IPrincipalAccessor _principalAccessor;
        private readonly Mock<UIUserProvider> _uiUserProviderMock;

        public TelemetryServiceTest()
        {
            _principalAccessor = Mock.Of<IPrincipalAccessor>();
            _principalAccessor.Principal = new GenericPrincipal(new GenericIdentity("username"), null);

            var moduleTable = new Mock<ModuleTable>();
            moduleTable
                .Setup(_ => _.GetModules())
                .Returns(new[] {new ShellModule("CMS", null, null)});

            _uiUserProviderMock = new Mock<UIUserProvider>();
            _uiUserProviderMock.Setup(x => x.GetUser("username"))
                .Returns(new FakeUser {CreationDate = new DateTime(2010, 1, 1)});

            _telemetryOptions = new TelemetryOptions {OptedIn = true};
            _licensingOptions = new LicensingOptions
            {
                LicenseKey = "LicenseKey"
            };
            _httpResponseMessage = new HttpResponseMessage
            {
                Content = new StringContent("{\"key\":true}")
            };
            _telemetryService = new TelemetryService(_telemetryOptions, _licensingOptions, _principalAccessor,
                moduleTable.Object, new JsonObjectSerializer(), _uiUserProviderMock.Object)
            {
                GetRequestAsync = (string url) => Task.FromResult(_httpResponseMessage),
            };
        }

        [Fact]
        public async void HashString_ShouldTrimTrailingEquals()
        {
            var result = await _telemetryService.Get();
            Assert.False(result.Client.EndsWith("="));
        }

        [Fact]
        public async void Get_WhenIsTelemetryEnabled_IsFalse_ShouldSetDisableTelemetry_AsTrue()
        {
            _telemetryOptions.OptedIn = false;
            var result = await _telemetryService.Get();
            Assert.True(result.Configuration["disableTelemetry"] as bool?);
        }

        [Fact]
        public async void Get_WhenIsTelemetryEnabled_IsFalse_ShouldNotCallAzureFunction()
        {
            _telemetryOptions.OptedIn = false;
            bool isDelegateCalled = false;
            _telemetryService.GetRequestAsync = (url) =>
            {
                isDelegateCalled = true;
                return Task.FromResult(_httpResponseMessage);
            };
            var result = await _telemetryService.Get();
            Assert.False(isDelegateCalled);
        }

        [Fact]
        public async void Get_WhenIsTelemetryEnabled_IsTrue_ShouldCallAzureFunction()
        {
            bool isDelegateCalled = false;
            _telemetryService.GetRequestAsync = (url) =>
            {
                isDelegateCalled = true;
                return Task.FromResult(_httpResponseMessage);
            };
            var result = await _telemetryService.Get();
            Assert.True(isDelegateCalled);
        }

        [Fact]
        public async void GetClientHash_WhenLicenseKey_IsNotNull_ShouldSetClient_AsHashedLicenseKey()
        {
            _licensingOptions.LicenseKey = "key";
            var result = await _telemetryService.Get();
            Assert.Equal("6Xs43pBpSkS2IjoYdY5NgQIWAY6gZwK7IQ2/BQB4I2umzGflnF0Ck1yAK3dRYN0vaqnaVGaNczOzJnUJWLE2Hg", result.Client);
        }

        [Fact]
        public async void GetClientHash_WhenLicenseKey_IsNull_AndWhenLicenseFile_IsNotNull_ShouldSetClient_AsHashedLicensedCompany()
        {
            _licensingOptions.LicenseKey = null;
            _telemetryService.LoadLicense = (string licenseFilePath) => new LicenseData { LicensedCompany = "company" };
            var result = await _telemetryService.Get();
            Assert.Equal("dR3n/AJAZiZtVmBnrJrEn+a9mlZiZjYSGrhEEFYiAl8vbA1HduH80e0oQJLdVgewrDIPZZLxUIgTayhaLT8ONQ", result.Client);
        }

        [Fact]
        public async void GetClientHash_WhenLicenseKey_IsNull_AndWhenLicenseFile_IsNull_ShouldSetClient_AsNull()
        {
            _licensingOptions.LicenseKey = null;
            _telemetryService.LoadLicense = (string licenseFilePath) => null;
            var result = await _telemetryService.Get();
            Assert.Null(result.Client);
        }

        [Fact]
        public async void GetClientHash_WhenLicenseKey_IsNull_AndLoadLicense_ThrowsLicenseException_ShouldSetClient_AsNull()
        {
            _licensingOptions.LicenseKey = null;
            _telemetryService.LoadLicense = (string licenseFilePath) => throw new LicenseException();
            var result = await _telemetryService.Get();
            Assert.Null(result.Client);
        }

        [Fact]
        public async void GetConfiguration_ShouldReturnResponse_AsDictionary()
        {
            var result = await _telemetryService.Get();
            Assert.Contains("key", result.Configuration);
        }

        [Fact]
        public async void GetConfiguration_WhenResponseCode_IsNotSuccessful_ShouldReturnDisableTelemetry()
        {
            _telemetryService.GetRequestAsync = (url) =>
            {
                _httpResponseMessage.StatusCode = HttpStatusCode.NotFound;
                return Task.FromResult(_httpResponseMessage);
            };
            var result = await _telemetryService.Get();
            Assert.True(result.Configuration["disableTelemetry"] as bool?);
        }

        [Fact]
        public async void GetConfiguration_WhenRequest_ThrowsException_ShouldReturnDisableTelemetry()
        {
            _telemetryService.GetRequestAsync = (url) =>
            {
                throw new HttpRequestException();
            };
            var result = await _telemetryService.Get();
            Assert.True(result.Configuration["disableTelemetry"] as bool?);
        }

        [Fact]
        public async void GetUserHash_WhenProfileEmail_IsNull_ShouldSetUser_AsHashedUsername()
        {
            _telemetryService.LoadEmailFromProfile = (string username) => null;
            var result = await _telemetryService.Get();
            Assert.Equal("KWAvYvtBvfvt5uSeb6LCxmsoDv7hgRO7q2Ad2snnk3u9/Hhpdm+ntJn0VAbz/OKUoLO30C7T4IHF/LQRxON2jw", result.User);
        }

        [Fact]
        public async void GetUserHash_WhenProfileEmail_IsEmpty_ShouldSetUser_AsHashedEmail()
        {
            _telemetryService.LoadEmailFromProfile = (string username) => "";
            var result = await _telemetryService.Get();
            Assert.Equal("KWAvYvtBvfvt5uSeb6LCxmsoDv7hgRO7q2Ad2snnk3u9/Hhpdm+ntJn0VAbz/OKUoLO30C7T4IHF/LQRxON2jw", result.User);
        }

        [Fact]
        public async void GetUserHash_WhenProfileEmail_IsNotNull_ShouldSetUser_AsHashedEmail()
        {
            _telemetryService.LoadEmailFromProfile = (string username) => "user@domain.com";
            var result = await _telemetryService.Get();
            Assert.Equal("+whYti3ku/zuRSJ4qsqGfHjtVkAesvlZpFkNJLSKGtGLgp6wHvpRuhGSGb/FPINjdNyY6KjukoaRiJbeHyh5Bg", result.User);
        }

        [Fact]
        public async void GetVersions_ShouldSetVersions_AsDictionary()
        {
            var result = await _telemetryService.Get();
            Assert.Contains("CMS", result.Versions);
        }

        [Fact]
        public async void Get_ShouldReturn_User_CreationDate()
        {
            var result = await _telemetryService.Get();
            Assert.Equal(new DateTime(2010, 1, 1), result.User_creationDate);
        }

        [Fact]
        public async void GetConfiguration_ShouldBeCalledWithClientParameter()
        {
            _telemetryService.GetRequestAsync = url =>
            {
                Assert.Contains("client=VWBImW05ulqZaZtOwhh5gV3JA5lPvfmhz3hFAITGce2ae0uBKy9tmyiow9D7DWa7lPpB0UCW%2bV%2bAj%2bRLBqIL1g", url);
                return Task.FromResult(_httpResponseMessage);
            };
            await _telemetryService.Get();
        }

        [Fact]
        public async void GetConfiguration_ShouldBeCalledWithUserParameter()
        {
            _telemetryService.GetRequestAsync = url =>
            {
                Assert.Contains("user=KWAvYvtBvfvt5uSeb6LCxmsoDv7hgRO7q2Ad2snnk3u9%2fHhpdm%2bntJn0VAbz%2fOKUoLO30C7T4IHF%2fLQRxON2jw", url);
                return Task.FromResult(_httpResponseMessage);
            };
            await _telemetryService.Get();
        }

        [Fact]
        public async void GetConfiguration_ShouldBeCalledWithModuleParameter()
        {
            _telemetryService.GetRequestAsync = url =>
            {
                Assert.Contains("version=0.0", url);
                return Task.FromResult(_httpResponseMessage);
            };
            await _telemetryService.Get();
        }

        [Fact]
        public async void GetConfiguration_WhenLicenseIsEmpty_ShouldBeCalledWithClientParameter_AsEmpty()
        {
            _licensingOptions.LicenseKey = null;

            _telemetryService.GetRequestAsync = url =>
            {
                Assert.Contains("client=&", url);
                return Task.FromResult(_httpResponseMessage);
            };
            await _telemetryService.Get();
        }

        [Fact]
        public async void GetConfiguration_WhenPrincipalIsNull_ShouldBeCalledWithUserParameter_AsEmpty()
        {
            _principalAccessor.Principal = null;

            _telemetryService.GetRequestAsync = url =>
            {
                Assert.Contains("user=&", url);
                return Task.FromResult(_httpResponseMessage);
            };
            await _telemetryService.Get();
        }
    }
}
