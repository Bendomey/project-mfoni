## Search Implementation

We're using opensearch technology (an open-sourced version of elasticsearch by amazon.)

### Process Flow
- Main service publishes a job to a queue
- Search service pickups it up by subscribing as a queue worker and then process the request by connecting to our opensearch index and then ingest the data.
- Search service exposes an rpc function that helps main service request for a search by submitting a keyword. Search service performs an advanced search on the opensearch index and return with matches.