using System.Threading.Tasks;
using System.Web.Mvc;
using EPiServer.Shell.Services.Rest;

namespace Episerver.Telemetry.UI.Internal
{
    [RestStore("telemetryconfig")]
    public class TelemetryConfigStore : RestControllerBase
    {
        private readonly TelemetryService _service;

        public TelemetryConfigStore(TelemetryService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<RestResult> Get()
        {
            var config = await _service.Get();
            return Rest(config);
        }
    }
}
