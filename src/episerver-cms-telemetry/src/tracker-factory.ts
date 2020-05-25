import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { validate } from "./event-validation";

/**
 * List of predefined owner names described as JIRA project keys
 */
export enum Owner {
    Cms = "cms",
    Commerce = "com",
    Find = "find",
    ProfileStore = "prof",
    // The Add-ons team is one team with many addons, these are some commonly used ones:
    HeadlessAPI = "hapi",
    ChangeApproval = "capp",
    Forms = "aform",
    LanguageManager = "lm",
    LiveMonitor = "limo",
    PdfViewer = "pdv",
    SocialReach = "sr",
    PowerSlice = "pslice"
}

/**
 * Tracker
 */
export interface ITracker {
    /**
     * Send a tracking event
     * @param eventName - Event name
     * @param data - Tracked object
     */
    trackEvent(eventName: string, data: object);
}

type TrackEventCallback = (eventName: string, data: object) => void;

/**
 * AppInsights ITracker implementation
 */
class Tracker implements ITracker {
    private readonly owner: Owner | string;
    private readonly trackEventCallback: TrackEventCallback;

    constructor(owner: Owner | string, trackEventCallback: TrackEventCallback) {
        this.owner = owner;
        this.trackEventCallback = trackEventCallback;
    }

    trackEvent(eventName: string, data: object) {
        if (!validate(eventName, data)) {
            return;
        }

        const name = this.owner + "_" + eventName;
        console.log("trackEvent:", name, data);
        this.trackEventCallback(name, data);
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
export class TrackerFactory {
    private appInsights = null;
    private queuedEvents = [];

    /**
     * Initializes the TrackerFactory instance with configuration settings.
     * @param factoryConfiguration - Configuration object
     */
    initialize(factoryConfiguration: TrackerFactoryConfiguration) {
        if (this.appInsights) {
            return;
        }

        const { config, authenticatedUserId, accountId, customProperties } = factoryConfiguration;

        this.appInsights = new ApplicationInsights({ config });
        this.appInsights.loadAppInsights();
        this.appInsights.setAuthenticatedUserContext(authenticatedUserId, accountId);
        if (customProperties) {
            this.appInsights.addTelemetryInitializer((envelope) => {
                Object.keys(customProperties).forEach((key: string) => {
                    envelope.data[key] = customProperties[key];
                });
            });
        }

        this.processQueuedEvents();
    }

    /**
     * Creates an instance of TrackerFactory.
     * @param factoryConfiguration - Configuration object, no events will be tracked unless configuration is provided
     */
    constructor(factoryConfiguration?: TrackerFactoryConfiguration) {
        if (factoryConfiguration) {
            this.initialize(factoryConfiguration);
        }
    }

    /**
     * Creates an instance of TrackerFactory.
     * @param owner - Owner is required to be set before using the tracker. If it's team name then please use the JIRA project key e.g cms or com.
     */
    getTracker(owner: Owner | string): ITracker {
        if (!owner) {
            throw new Error("Owner is required to be set before using the tracker. If it's team name then please use the JIRA shorthand e.g cms or com.");
        }

        return new Tracker(owner, (eventName, data) => {
            if (!this.appInsights) {
                this.queuedEvents.push({ eventName, data });
                return;
            }

            this.send(eventName, data);
        });
    }

    private processQueuedEvents() {
        while (this.queuedEvents.length > 0) {
            const nextEvent = this.queuedEvents.shift();
            this.send(nextEvent.eventName, nextEvent.data);
        }
    }

    private send(eventName, data) {
        this.appInsights.trackEvent({ name: eventName }, data);
    }
}
