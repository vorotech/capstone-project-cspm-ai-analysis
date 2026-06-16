Goal: Create a detailed, multi-tier AWS reference architecture diagram for a modern application handling external web traffic, containerized microservices, and a real-time data lake pipeline. No legend or explanation needed on side panels.

Core Components & Logical Flow:

Edge & Perimeter Security: External Users connect via Amazon CloudFront (CDN) for caching. Traffic passes through AWS WAF to mitigate common web exploits and enforce security controls before reaching the VPC.

Public Subnet (Ingress): An Internet Gateway routes traffic to an Application Load Balancer (ALB) spanning multiple Availability Zones. NAT Gateways are deployed here to allow outbound internet access for private resources.

Private Subnet (Compute Tier): The ALB routes traffic to an Amazon EKS Cluster, where application microservices run. EKS worker nodes utilize Amazon EBS for local, persistent storage requirements.

Isolated Subnet (Data & State): Microservices persist relational state to an Amazon RDS (Multi-AZ) database. This subnet has zero inbound internet routing, ensuring maximum data protection.

Asynchronous Messaging: Amazon SQS and Amazon SNS decouple internal microservices, managing background tasks and event-driven notifications securely.

Real-Time Data Pipeline & Analytics: EKS microservices produce high-volume event data into Amazon Kinesis Data Streams (or Amazon MSK). AWS Lambda functions consume this stream, applying transformations and routing data to two destinations.

Data Lake & Internal Dashboards: Processed data lands in an Amazon S3 Data Lake for durable storage. Amazon OpenSearch Service indexes the immediate event data to provide low-latency, real-time analytics dashboards. AWS Glue catalogs the S3 data, and internal teams use Amazon Athena for ad-hoc querying.

Kinesis Data Streams / Amazon MSK: Essential for ingesting high-velocity event streams without dropping packets or bottlenecking the EKS pods.

AWS Glue & Athena: The standard, serverless combination for structuring and querying an S3-backed data lake without provisioning heavy database servers.

Amazon OpenSearch: This is the most effective way to serve near real-time telemetry and operational dashboards directly to your internal teams.
