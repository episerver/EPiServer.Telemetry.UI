import { ApplicationInsights } from "@microsoft/applicationinsights-web";

let appInsights = null;

const TrackerFactory = {
    initialize(config, customProperties, authenticatedUserId, accountId) {
        if (!appInsights) {
            appInsights = new ApplicationInsights({ config });
            appInsights.loadAppInsights();
            appInsights.setAuthenticatedUserContext(authenticatedUserId, accountId);
            appInsights.addTelemetryInitializer((envelope) => {
                for (var key in customProperties) {
                    envelope.data[key] = customProperties[key];
                }
            });
        }
    },
    getTracker(owner) {
        if (!owner) {
            throw new Error("Owner cannot be empty");
        }
        return {
            track: (eventName, data) => {
                // appInsights is undefined if initialize has not been called.
                if (!appInsights) {
                    return;
                }
                console.log("track:", eventName, data);
                appInsights.trackEvent({ name: owner + "_" + eventName }, data);
            }
        }
    }
};

export default TrackerFactory;
