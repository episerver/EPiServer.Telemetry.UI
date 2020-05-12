import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { validate } from "./event-validation";

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
    getTracker(/* owner or list of owners */) {
        const array = [...arguments];
        if (array.length === 0) {
            throw new Error("No owner provided");
        }
        const owner = array.join("_");

        return {
            track(eventName, data) {
                // appInsights is undefined if initialize has not been called.
                if (!appInsights) {
                    return;
                }
                if (!validate(eventName, data)) {
                    return;
                }
                console.log("track:", eventName, data);
                appInsights.trackEvent({ name: owner + "_" + eventName }, data);
            }
        };
    }
};

export default TrackerFactory;
