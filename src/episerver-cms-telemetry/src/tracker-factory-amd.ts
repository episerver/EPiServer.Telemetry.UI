import TrackerFactory, { Dictionary, Owner, TelemetryConfiguration } from "./tracker-factory";

let factory: TrackerFactory = new TrackerFactory();

const trackerFactory = {
    initialize(config: TelemetryConfiguration, authenticatedUserId: string, accountId: string, customProperties?: Dictionary<any>) {
        factory.initialize({ config, authenticatedUserId, accountId, customProperties });
    },

    getTracker(owner: Owner | string) {
        return factory.getTracker(owner);
    }
}

export default trackerFactory;
