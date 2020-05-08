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

### Current tracking events

The list of current tracking events will be provided soon.

### Adding new trackers

* Every commit adding or changing a tracking event must include a KQL query in the commit message that can be used to test and validate it.
* Events/Properties must be documented in the list with its intention.
* Event name:
    * An event's name should follow the format `Owner => Context(optional) => Action`
        * Owner: Which team does the event belong. Owner is required to be set before using the tracker. The JIRA shorthand is used as team name (owner), e.g. ncd (if Core starts doing server-side API tracking), cms (for both Core and UI), com (Commerce), hapi/capp/etc
        * Context: Which feature is the event from
        * Action: What was the action taken
    * All events are formatted using `camelCase`
    * Examples of event names: cms_edit_publish, cms_projectView_batchApprove
    * Example code
        ```
            // Set owner when get a tracker object from TrackerFactory
            var tracker = TrackerFactory.getTracker("cms");
            
            // When tracking events, owner is automatically added to the eventName.
            // In this case, event "cms_edit_buttonClick" is sent to AppInsights
            tracker.track("edit_buttonClick", {
            contentType: "block"
            });
        ```
* Property name:
    * Property name's format is `Context(optional) => propertyName`
    * All property names are formatted using `camelCase`, underline(_) is used as separator.
    * Example of property names: inlineEditing, projectView_publish
