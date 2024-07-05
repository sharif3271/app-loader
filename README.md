# app-pre-loader

This an old code for pre-loading a SPA where we can't serve it `https` so we can't use `ServiceWorkers`. For instance think of an App running in an Intranet network.
In here, I used `fetch API` and it's cashe-control options to simulate something like what we can normally do with service-workers.
