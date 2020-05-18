import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { validate } from "./event-validation";

/**
 * Tracker
 */
export interface ITracker {
    /**
     * Send a tracking event
     * @param eventName - Event name
     * @param data - Tracked object
     */
    track(eventName: string, data: object);
}

/**
 * AppInsights ITracker implementation
 */
class Tracker implements ITracker {
    private readonly team: string;
    private readonly appInsights: ApplicationInsights;

    constructor(team: string, appInsights: ApplicationInsights) {
        this.team = team;
        this.appInsights = appInsights;
    }

    track(eventName: string, data: object) {
        if (!validate(eventName, data)) {
            return;
        }

        const name = this.team + "_" + eventName;
        console.log("track:", name, data);
        this.appInsights.trackEvent({name: name}, data);
    }
}

/**
 * NullValue ITracker implementation, does not send any events
 */
class NullTracker implements ITracker {
    track(eventName: string, data: object) {
    }
}

export interface ITrackerFactory {
    /**
     * Creates an instance of TrackerFactory.
     * @param team -  Team is required to be set before using the tracker. If it's team name then please use the JIRA shorthand e.g cms or com.
     */
    getTracker(team: string): ITracker;
}

class NullTrackerFactory implements ITrackerFactory {
    getTracker(team: string): ITracker {
        return new NullTracker()
    }
}

export interface TelemetryConfiguration {
    /**
     * AppInsights instrumentation key
     */
    instrumentationKey: string;
}

export interface Dictionary<T> {
    [key: string]: T;
}

export interface TrackerFactoryConfiguration {
    /**
     * config - An object with AppInsights configuration
     */
    config: TelemetryConfiguration;

    /**
     * authenticatedUserId - Anonymized user ID
     */
    authenticatedUserId: string;

    /**
     * accountId - Anonymized client ID
     */
    accountId: string;

    /**
     * customProperties - List of custom properties that should be included in every tracked event
     */
    customProperties?: Dictionary<any>;
}

/**
 * Tracker factory
 */
export default class TrackerFactory implements ITrackerFactory {
    appInsights = null;

    /**
     * Creates an instance of TrackerFactory.
     * @param factoryConfiguration - Configuration object
     */
    constructor(factoryConfiguration: TrackerFactoryConfiguration) {
        const { config, authenticatedUserId, accountId, customProperties } = factoryConfiguration;

        this.appInsights = new ApplicationInsights({config});
        this.appInsights.loadAppInsights();
        this.appInsights.setAuthenticatedUserContext(authenticatedUserId, accountId);
        if (customProperties) {
            this.appInsights.addTelemetryInitializer((envelope) => {
                Object.keys(customProperties).forEach((key: string) => {
                    envelope.data[key] = customProperties[key];
                });
            });
        }
    }

    /**
     * Creates a null-value implementation of the factory that will not send any events
     */
    static NullTracker(): ITrackerFactory {
        return new NullTrackerFactory();
    }

    /**
     * Creates an instance of TrackerFactory.
     * @param team - Team is required to be set before using the tracker. If it's team name then please use the JIRA shorthand e.g cms or com.
     */
    getTracker(team: string): ITracker {
        if (!team) {
            throw new Error("Team is required to be set before using the tracker. If it's team name then please use the JIRA shorthand e.g cms or com.");
        }

        return new Tracker(team, this.appInsights);
    }
}
