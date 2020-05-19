import TrackerFactory, { Owner } from './tracker-factory';

describe("#TrackerFactory", () => {
    describe("when trying to track while the factory is uninitialized", () => {
        let trackerFactory: TrackerFactory;
        let trackEventSpy;

        beforeEach(() => {
            trackerFactory = new TrackerFactory();
            // @ts-ignore
            trackEventSpy = jest.spyOn(trackerFactory, "send");
            const cmsTracker = trackerFactory.getTracker(Owner.Cms);
            cmsTracker.track("foo", {
                foo: "bar"
            });
        })

        test("should not send the event to appInsights", () => {
            expect(trackEventSpy).not.toHaveBeenCalled();
        })

        describe("after initializing the factory", () => {
            let fakeConfig = { instrumentationKey: "fake" };
            beforeEach(() => {
                trackerFactory.initialize({
                    config: fakeConfig,
                    authenticatedUserId: "johndoe",
                    accountId: "foo"
                });
            });

            test("should send the event to appInsights", () => {
                expect(trackEventSpy).toHaveBeenCalled();
            })
        })
    });
});

