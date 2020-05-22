import { Owner, TrackerFactory } from './tracker-factory';

describe("#TrackerFactory", () => {
    describe("when trying to trackEvent while the factory is uninitialized", () => {
        let trackerFactory: TrackerFactory;
        let trackEventSpy;

        beforeEach(() => {
            trackerFactory = new TrackerFactory();
            // @ts-ignore
            trackEventSpy = jest.spyOn(trackerFactory, "send");
            const cmsTracker = trackerFactory.getTracker(Owner.Cms);
            cmsTracker.trackEvent("foo", {
                foo: "foo"
            });
            cmsTracker.trackEvent("bar", {
                bar: "bar"
            });
        });

        test("should not send the event to appInsights", () => {
            expect(trackEventSpy).not.toHaveBeenCalled();
        });

        describe("after initializing the factory", () => {
            let fakeConfig = { instrumentationKey: "fake" };
            beforeEach(() => {
                trackerFactory.initialize({
                    config: fakeConfig,
                    authenticatedUserId: "johndoe",
                    accountId: "foo"
                });
            });

            test("should send the events with concatenated owner and eventName to appInsights in correct order", () => {
                expect(trackEventSpy).toHaveBeenNthCalledWith(1, "cms_foo", {
                    foo: "foo"
                });

                expect(trackEventSpy).toHaveBeenNthCalledWith(2, "cms_bar", {
                    bar: "bar"
                });
            });
        })
    });
});

