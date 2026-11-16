# Japanese practice site

Production is https://maxbye.co/japanese/ (lowercase path). The custom domain is served by `maxbye3/max-game`, whose `Deploy game` workflow checks out this repository's `main` branch and packages it under `/japanese/`.

After pushing changes here, publish the combined site through `maxbye3/max-game`'s `Deploy game` workflow. This repository's standalone Pages deployment only updates https://maxbye3.github.io/japanese/. Before reporting a change as live, verify the HTML and JavaScript served from https://maxbye.co/japanese/ and exercise the affected control there.

Preserve existing browser progress and calendar stamp storage when changing practice controls.
