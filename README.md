# An attempt to help to choose the right region for your app

When selecting a region to deploy your agent to, you need to make a decsion based on the model you want to use and which features you need.

This matrix is bringing together features and models to help you make that decision.

At this point in time there are multiple approaches to visualize and help you select the best region:

- https://model-availability.azurewebsites.net/
- https://foundry-models.azurewebsites.net/
- https://jubilant-memory-jzjn29p.pages.github.io/foundry-offers/areas/regional-strategy/data/foundry-regional-model-availability-matrix.html

## Keeping the data up to date

### Models / Regions

I am using the data provided by the az cli

Every day, the model chache is updated if there are any changes. Changes get pushed automatically.

### Features

Parsed from the websites. See documentation on the website to see the source.

Every week the websites get queried and checked if they changed.

If so, an issue will be created that has to be reviewed manually.