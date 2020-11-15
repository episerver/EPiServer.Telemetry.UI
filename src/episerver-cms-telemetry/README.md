# @episerver/telemetry

A telemetry API for consistent anonymous product feature tracking used in Episerver.

_Currently wraps [Application Insights JS SDK](https://github.com/microsoft/ApplicationInsights-JS) but this can change to another service or multiple services in the future._

## Installation

### yarn

```
yarn add @episerver/telemetry
```

### npm

```
npm install @episerver/telemetry
```

## Importing

```js
import { Owner, TrackerFactory, ITracker } from "@episerver/telemetry";
```

## Usage

The `@episerver/telemetry` package exports several classes to make telemetry usage consistent across Episerver's products. The main class being `TrackerFactory` that creates a factory object that can be used once in an application, to create multiple `ITracker` - one for each owning team.

When only one owner exists in the product the `TrackerFactory` can be used as a temporary object to create the `ITracker`, i.e.:

```js
import { Owner, TrackerFactory, ITracker } from "@episerver/telemetry";
const tracker: ITracker = (new TrackerFactory({
    config: {
        instrumentationKey: "[Application Insights key]"
    },
    authenticatedUserId: "[Hashed (SHA512) derived from the user email without salt. If the user email is not available, the username can be used instead.]",
    accountId: "[Hashed (SHA512) derived from a unique customer account identifier without salt. The license key should be used if it's available.]",
    customProperties: {
        // Any additional data that should be sent on each event.
    }
})).getTracker("['Owner' enum value or short lowercase alias for who owns the data]);
```

Then use that tracker object to send analytics where and when needed. Do not track more than you need to analyze a feature's worth to the user.

`ITracker` has two main methods:

* `trackPageView`: Send a page view tracking event. If the product uses [Platform Navigation](https://www.npmjs.com/package/@episerver/platform-navigation) this method is not needed.
* `trackEvent`: Send a custom tracking event.

> Read more about event naming under "Event naming convention" before publishing any events.

Example from [CMS UI task creation trackers](https://github.com/episerver/EPiServer.Telemetry.UI/blob/a1cc7d3a141d64710ff3a493e5df3c2553237731/src/AlloyMvcTemplates/modules/_protected/episerver-telemetry-ui/1.0.0/Scripts/track-creation.js#L22):

```js
tracker.trackEvent("edit_contentCreated", {
    contentType: isPage ? "page" : "block",
    entryPoint: entry.entryPoint,
    isLocalAsset: this.createAsLocalAsset
});
```

## Event naming convention

In order to keep the events tidy and clean across all our products we want to adhere to a naming convention.

### Pattern / Format

`Owner => Context(optional) => Action`

*   *Owner:* Which team does the event belong. Owner is required to be set before using the tracker. Use the `Owner` enum or if your team is not listed use an appropriate lowercase acronym similar to the enum.
*   *Context:* Which feature is the event from.
*   *Action:* What was the action taken.

All events are formatted like this with words  `camelCased.`

```text
ownerName_actionName
ownerName_contextName_actionName
```

Some examples:

*   cms_publish
*   cms_click
*   cms_projectView_batchApprove

### Property Name

Words are **camelCased**. **Underline** (_) is used as separator. `Context` is optional.

```text
propertyName
contextName_propertyName
```

#### Do

```text
cms_sign_in
cms_sign_out
```

Its good to be consistent.

#### Don't

```text
cms_Sign_IN
cms_Sign_out
```

The name should follow the naming convention and be consistent.

### What is the correct context?

The context is mainly good for sorting and grouping similar events to each other but that have distinct actions.

#### Do

```text
cms_project_create
cms_project_delete
```

We have the context of project but with two distinct actions.

#### Don't

```text
cms_edit_createProject
cms_edit_time
cms_edit_buttonClick
```

The shared context "edit" is too broad to be applied to all three events and some actions contain their own context.

## When should I use properties or not?

Always consider what you want to compare and what the question is that you want to answer.

#### Do

```text
cms_publish
    commandType => "smart" | "inline" | "default"
```

Comparing "commandType" from the same action "publish" makes sense.

#### Do

```text
cms_edit_time
    editMode => "formedit" | "onpageedit"

cms_edit_contentSaved
    editMode => "formedit" | "onpageedit"
```

Comparing "editMode" with identical values from two different edit events makes sense.

#### Do

```text
cms_create_page
    type => "My Special Page"
```

Adding user input into a property is totally fine.

#### Don't

```text
cms_edit
    commandType => "time" | "contentSaved"
    editMode => "formedit" | "onpageedit"
```

The "commandType" values "time" (minutes) and "contentSaved" (nr of edits) doesn't make sense to compare.

#### Don't

```text
cms_page_createSpecialFoobar
```

The action "createSpecialFoobar" is too specific and the page type should be a property instead.

## License

Apache 2.0 © Episerver
