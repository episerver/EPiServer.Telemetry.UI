import TrackerFactory, { Dictionary, ITrackerFactory, TelemetryConfiguration } from "./tracker-factory";

let factory: ITrackerFactory;

const trackerFactory = {
    initialize(config: TelemetryConfiguration, authenticatedUserId: string, accountId: string, customProperties?: Dictionary<any>) {
        if (factory) {
            return;
        }

        factory = new TrackerFactory({ config, authenticatedUserId, accountId, customProperties });
    },

    getTracker(owner: string) {
        return factory.getTracker(owner);
    }
}

export default trackerFactory;
