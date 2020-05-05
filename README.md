# Episerver Telemetry UI

In a quest to understand our users more and effectivize our resources so that we can deliver the best user experience possible, we've decided to gather some useful telemetry so that we can make more informed decisions on what we should improve, support
and maybe not pursue when developing new features for CMS UI. We assure that the data we collect is completely anonymized and will only be used internally for making decisions on improving the user experience.

> NOTE: Telemetry is automatically enabled in DXC environment and can not be opted-out.

In non-DXC environments telemetry is not enabled by default. To opt-in to telemetry, add the following code to your initialization module.

```csharp
public void ConfigureContainer(ServiceConfigurationContext context)
{
    context.Services.Configure<TelemetryOptions>(options => options.OptedIn = true);
}
```

## Install

Episerver Telemetry UI is available as [Nuget](https://nuget.episerver.com/package/?id=EPiServer.Telemetry.UI) package. 
To use it in project install EPiServer.Telemetry.UI package:

```Install-Package EPiServer.Telemetry.UI```

## Development

```console
>> build\tools\nuget.exe restore
>> setup.cmd
>> build.cmd
>> test.cmd
>> site.cmd
```

## Telemetry information

To make telemetry works, these two URL's should not be blocked:
* Live Configuration: `https://cmsui.episerver.net/api/telemetryconfig`
* Tracking: `https://dc.services.visualstudio.com/v2/track` (this can change on Microsoft's discretion)

### Live configuration

When opted in, the server will make an initial GET request to `https://cmsui.episerver.net/api/telemetryconfig` in order to retrieve the telemetry config that will be used.

The *request* includes the following as queries (see "Taxonomy of custom events" section for details):

* `user`: String, an anonymized user id.
* `client`: String, anonymized client id.
* `version`: String, of the CMS version.

The *response* is a [JSON AppInsights configuration object](https://github.com/microsoft/ApplicationInsights-JS/blob/master/README.md#configuration) to allow for telemetry configuration changes live. It will always include:

* `instrumentationKey`: In case the AppInsights resource is re-deployed and the key changes.

Examples of configuration options currently not used but are reasons to have this service:

* `disableTelemetry`: In case telemetry needs to be turned off. Such as a catastrophic failure.
* `samplingPercentage`: Tweak the sampling size to control cost.

> The default Application Insights setup auto collects some information and will auto generate some events. You might therefore find some additional event data being sent that is not listed under custom events. You can find more information about what is collected [here](https://github.com/microsoft/ApplicationInsights-JS#setting-up-autocollection).

> You can [visit the URL](https://cmsui.episerver.net/api/telemetryconfig) to see this object live.

### Taxonomy of custom events

#### Always included

Every tracking event includes [standard Application Insights dimensions](https://docs.microsoft.com/en-us/azure/azure-monitor/app/api-custom-events-metrics#trackevent). The [authenticated user and client ID](https://docs.microsoft.com/en-us/azure/azure-monitor/app/api-custom-events-metrics#authenticated-users) are set as:

* `ai.user.authUserId`: String, a SHA512 hash without salt, using user email if available and username otherwise. To anonymize user but allow tracking between products.
* `ai.user.accountId`: String, a SHA512 hash without salt, using the License key. To allow for grouping of users.

> See the anonymization code [here.](https://github.com/episerver/EPiServer.Labs.BlockEnhancements/blob/master/src/episerver-labs-block-enhancements/Telemetry/Internal/TelemetryConfigStore.cs)

These `customDimensions` are added:

* `versions`: All installed add-ons and their versions. The value is an object, and will always include these keys:
    * `cms`: String, for the CMS version. E.g. `11.11.0.0`.
    * `episerver-labs-block-enhancements`: String, for this add-on version. E.g. `0.6.3.0`.
    * `shell`: String, for the CMS Shell version. E.g. `11.11.0.0`.
* `resolutions`: Everything related to screen or window sizes:
    * `screenWidth`: Number, width of screen.
    * `screenHeight`: Number, height of screen.
    * `windowInnerWidth`: Number, inner width of browser window.
    * `windowInnerHeight`: Number, inner height of browser window.

#### `editing`

Includes the following `customDimensions`:

* `editMode`: String, `"onpageedit" | "formedit" | "view" | "allpropertiescompare"`, specifies what edit mode is being used.
* `commandType`: String, `"loadPage" | "changeView" | "heartbeat"`, specifies how the event is triggered

#### `editContentSaved`

Includes the following `customDimensions`:

* `editMode`: String, `"onpageedit" | "formedit"`, specifies what edit mode is being used.

#### `buttonClick`

Includes the following `customDimensions`:

* `action`: String, `"openSmartPublish"Dialogue`, specify what kind of action the button is doing.
* `contentType`: String, `"page" | "block"`, specifies what content type we have during the click.

#### Adding new trackers

* Every commit adding or changing a tracking event must include a KQL query in the commit message that can be used to test and validate it.
* Event name must be documented in this Readme with its intention.
    * `publish` events will have the same name but use different data to distinguish between them. Any new publish trackers should add what data it collects to the list in the repo readme.
    * Names should use `camelCase`. We stop using `kebab-case`, which is being used in `publish`, because it's harder to write KQL with it.
