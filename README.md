# Episerver Telemetry UI

In a quest to understand our users more and effectivize our resources so that we can deliver the best user experience possible, we've decided to gather some useful telemetry so that we can make more informed decisions on what we should improve, support
and maybe not pursue when developing new features for CMS and its addons. We assure that the data we collect is completely anonymized and will only be used internally for making decisions on improving the user experience.

## Install

### CMS add-ons

Episerver Telemetry UI is available as a [Nuget](https://nuget.episerver.com/package/?id=EPiServer.Telemetry.UI) package for CMS add-ons.
To use it in a project, install the `EPiServer.Telemetry.UI` package:

```console
Install-Package EPiServer.Telemetry.UI
```

> NOTE: Telemetry is automatically enabled in DXC environment and can not be opted-out.

In non-DXC environments telemetry is not enabled by default. To opt-in to telemetry, add the following code to your initialization module.

```csharp
public void ConfigureContainer(ServiceConfigurationContext context)
{
    context.Services.Configure<TelemetryOptions>(options => options.OptedIn = true);
}
```

## Working with Telemetry

### Protect the data from naming collisions

To start tracking you should first create a wrapper as its own module, and set the `owner`
of the tracking data. The `owner` should match the JIRA key for your project. For example:

* Cms = `"cms"`
* Commerce = `"com"`
* Find = `"find"`
* ProfileStore = `"prof"`
* The Add-ons team has many addons, these are some commonly used ones:
    * HeadlessAPI = `"hapi"`
    * ChangeApproval = `"capp"`
    * Forms = `"aform"`
    * LanguageManager = `"lm"`
    * LiveMonitor = `"limo"`
    * PdfViewer = `"pdv"`
    * SocialReach = `"sr"`
    * PowerSlice = `"pslice"`

This will help all teams keep their data separate from each other, so make sure to use the correct value.

**All** tracking event details must be documented in the TRACKER document with its intention, **before** adding trackers in code.

> Tip: Every git commit adding or changing a tracking event should include a KQL query in the commit message that can be used to test and validate it.

To make telemetry work, these two URL's should not be blocked:

* Live Configuration: `https://cmsui.episerver.net/api/telemetryconfig`
* Tracking: `https://dc.services.visualstudio.com/v2/track` (this can change on Microsoft's discretion)

### Live configuration of tracked clients

When opted, an initial GET request should be made to `https://cmsui.episerver.net/api/telemetryconfig` in order to retrieve the telemetry config that should be used. This is done automatically by the `TelemetryConfigStore` through the `Episerver.Telemetry.UI.TelemetryService`, but if you cannot use them you must make the call yourself.

The *request* should include the following, as queries:

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

## Using this Telemetry package

> Make sure you read the "Working with Telemetry" section first.

Episerver Telemetry UI package can be used in two ways:

* Using it with dojo and the EPiServer Shell client modules framework
* Using it as a node module without EPiserver Shell client modules framework

### Using it with dojo and the EPiServer Shell client modules framework

This is the default setup. It doesn't require additional configuration or initialization.

#### Creating the tracker wrapper

Add dependency on `episerver-telemetry-ui/tracker-factory` to the module that
should be tracked. Call `trackerFactory.getTracker` with your owner key (see
the section above for a list of owner values).

```javascript
// episerver-labs-changeapproval-enhancements/telemetry/tracker.js
define([
    "episerver-telemetry-ui/tracker-factory"
], function (
    trackerFactory
) {
    return trackerFactory.getTracker("capp");
});
```

Now you import that module wherever you need to add some telemetry tracking.

The tracker instance only has a `trackEvent` method with the two parameters:

* `eventName`: string - name of the tracking event. It will be prefixed with `owner`.
* `data`: object - tracking event parameters

For example to track the `_execute` method of a command:

```javascript
// episerver-labs-changeapproval-enhancements/preview.js
define([
    "dojo/_base/declare",
    "epi/shell/command/_Command",
    "episerver-labs-changeapproval-enhancements/telemetry/tracker"
], function(
    declare,
    _Command,
    tracker
) {

    return declare([_Command], {

        label: "Preview",

        iconClass: "epi-iconEye",

        enabled: false,

        _execute: function() {
            this.enabled = !this.enabled;

            tracker.trackEvent("preview", {
                enabled: this.enabled
            });
        }
    });
});
```

In the example above the event named `preview` will be sent as `capp_preview`.

### Using it as a node module without EPiserver Shell client modules framework

> Make sure you read the "Working with Telemetry" section first.

> **Note: This is in untested preview mode and is not published to npm yet. Use at your on discretion.**

When dojo initialization module is not available, then the node module has to be used.

Before starting to track events the TrackerFactory has to be initialized with the proper configuration:

| Parameter           | Type                    | Required | Description                                                                                                       |
|---------------------|-------------------------|----------|-------------------------------------------------------------------------------------------------------------------|
| config              | TelemetryConfiguration  | true     | An object with AppInsights configuration.                                                                         |
| authenticatedUserId | string                  | true     | Anonymized user ID. A SHA512 hash without salt, using user email if available and username otherwise.             |
| accountId           | string                  | true     | Anonymized client ID. A SHA512 hash without salt, using the License key if available and customer name otherwise. |
| customProperties    | Dictionary<string, any> | false    | List of custom properties that should be included in every tracked event.                                         |

If you're using TypeScript, you can use the `Owner` enum.

```javascript
// my-changeapproval-react-addon/tracker.ts
import { Owner, TrackerFactory } from "@episerver/telemetry-ui/tracker-factory";

const config = await getConfig(); // get config for example using xhr request to the server. The config could look like this:
/* {
    config: {
        instrumentationKey: 'abc-123',
        authenticatedUserId: 'ab87sdfd0fwsf89',
        accountId: 'lj3546lkj3kh1klh',
        customProperties: {
            multiSiteEnabled: false,
            moduleVersion: "1.3.2"
        }
    }
} */

const trackerFactory = new TrackerFactory(config);

export const tracker = trackerFactory.getTracker(Owner.ChangeApproval);
```

Now you import the `tracker` wherever you need to add some telemetry tracking.

The tracker instance only has a `trackEvent` method with the two parameters:

* `eventName`: string - name of the tracking event. It will be prefixed with `owner`.
* `data`: object - tracking event parameters

For example to track the `_execute` method of a command:

```javascript
// my-changeapproval-react-addon/magicalFeature.js
import { tracker } from "./tracker.js"
tracker.trackEvent("languageSetting_approved");
```

In the example above the event named `languageSetting_approved` will be sent as `capp_languageSetting_approved`.

To get the trackerFactory configuration for .NET solutions you can:

* make a request to the `TelemetryConfigStore`
* create your own API controller that uses the `Episerver.Telemetry.UI.TelemetryService`

## Development in this repository

```console
>> build\tools\nuget.exe restore
>> setup.cmd
>> build.cmd
>> test.cmd
>> site.cmd
```

### Implementation details

Tracking mechanism is initialized inside telemetry dojo module and runs automatically
without a need to call initializers explicitly.

### Adding new trackers

1. Events/Properties must be documented in the TRACKER document with its intention.
1. Every commit adding or changing a tracking event must include a KQL query in the commit message that can be used to test and validate it.
1. Use the wrapped tracker `tracker.js` to get the correct `owner` pre-configured.
    ```javascript
    // src/alloy/modules/_protected/episerver-telemetry-ui/1.0.0/Scripts/track-project-mode.js
    define([
        "dojo/topic",
        "episerver-telemetry-ui/tracker"
    ], function(
        topic,
        tracker
    ) {
        return function () {

            function onViewChanged(type, args, data) {
                tracker.trackEvent("projects_viewChanged", {
                    viewName: data.viewName || "";
                });
            }

            topic.subscribe("/epi/shell/action/viewchanged", onViewChanged);
        });
    });
    ```

## Taxonomy of tracking events included in this package

### Always included

Every tracking event includes [standard Application Insights dimensions](https://docs.microsoft.com/en-us/azure/azure-monitor/app/api-custom-events-metrics#trackevent). The [authenticated user and client ID](https://docs.microsoft.com/en-us/azure/azure-monitor/app/api-custom-events-metrics#authenticated-users) are set as:

* `ai.user.authUserId`: String, a SHA512 hash without salt, using user email if available and username otherwise. To anonymize user but allow tracking between products.
* `ai.user.accountId`: String, a SHA512 hash without salt, using the License key. To allow for grouping of users.

> See the anonymization code [here](https://github.com/episerver/EPiServer.Telemetry.UI/blob/master/src/Episerver.Telemetry.UI/Internal/TelemetryConfigStore.cs).

### Current tracking events

See the tracking events and their purpose in this file: [Trackers.xlsx](./Trackers.xlsx)
