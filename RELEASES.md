## Creating a release: Episerver.Telemetry.UI

Releasing Episerver.Telemetry.UI follows the ordinary release process.

## Creating a release: @episerver/telemetry

1. Make sure you have the latest master and develop locally on your machine
1. Checkout develop and create a release commit where you:
    1. Bump the version in package.json (in the episerver-telemetry folder) according to semver convention
    1. Name the commit title `Release @episerver/telemetry v.x.y.z` and mention any notable changes that was added in the description

    ```
    example:

    Release @episerver/telemetry v0.1.1

    This release contains the following bugfixes and improvements.

    Tasks:
    CMS-XXXX
    CMS-YYYY

    Fixes:
    CMS-ZZZZ

    ** Additional important notes **

    ```
1. Tag the repository `git tag -a telemetry/vx.y.z -m "release: vx.y.z"` (eg. `git tag -a telemetry/v0.1.1 -m "release: v0.1.1`) and push `git push --follow-tags`. You might need to enable permission to do so
1. Finally, since this is a release done from develop, make sure it's synced with all remotes (github, stash)

### Publish to npm
1. Make sure you're in `episerver-telemetry` package folder
1. Run `yarn pack`
1. Run `yarn publish episerver-telemetry-vx.y.z.tgz`
1. Skip the prompt for a new version
1. Enter your credentials and 2FA
