---
title: AWS Global Infrastructure
linkTitle: Global Infrastructure
type: docs
weight: 2
prev: /aws/01-introduction
next: /aws/03-networking-fundamentals
---

## Overview

AWS provides a globally distributed infrastructure designed for high availability, fault tolerance, low latency, and data sovereignty. Understanding how AWS organizes its physical and logical infrastructure is fundamental to designing resilient and performant applications.

## AWS Global Infrastructure Components

```
┌──────────────────────────────────────────────────────────┐
│              AWS Global Infrastructure                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                   AWS Region                       │  │
│  │  (e.g., us-east-1, eu-west-1, ap-south-1)          │  │
│  │                                                    │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │  │
│  │  │     AZ-A     │  │     AZ-B     │  │   AZ-C   │  │  │
│  │  │              │  │              │  │          │  │  │
│  │  │  ┌────────┐  │  │  ┌────────┐  │  │ ┌──────┐ │  │  │
│  │  │  │   DC   │  │  │  │   DC   │  │  │ │  DC  │ │  │  │
│  │  │  ├────────┤  │  │  ├────────┤  │  │ ├──────┤ │  │  │
│  │  │  │   DC   │  │  │  │   DC   │  │  │ │  DC  │ │  │  │
│  │  │  └────────┘  │  │  └────────┘  │  │ └──────┘ │  │  │
│  │  │              │  │              │  │          │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────┘  │  │
│  │         │                  │                │      │  │
│  │         └──────────────────┴────────────────┘      │  │
│  │          Low-latency, high-bandwidth links         │  │
│  └────────────────────────────────────────────────────┘  │
│                          │                               │
│          ┌───────────────┴───────────────┐               │
│          │   AWS Private Global Network  │               │
│          └───────────────┬───────────────┘               │
│                          │                               │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Other AWS Regions                     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │          Edge Locations (CloudFront, Route53)      │  │
│  │  - Content delivery                                │  │
│  │  - DNS resolution                                  │  │
│  │  - DDoS protection                                 │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## AWS Regions

### What is an AWS Region?

An **AWS Region** is a physical geographical location around the world where AWS clusters multiple data centers. Each Region is designed to be completely independent and isolated from other Regions.

### Key Characteristics

**Geographic Separation**
- Regions are geographically dispersed (e.g., North Virginia, London, Mumbai, Sydney)
- Provides disaster recovery and business continuity options
- Allows compliance with data residency requirements

**Regional Independence**
- Resources in one Region do not automatically replicate to another
- Most AWS services are Region-scoped
- Pricing may vary between Regions

**Private Network Connectivity**
- Regions are interconnected via AWS's private, high-speed global network infrastructure
- Traffic between Regions stays on AWS backbone (doesn't traverse public internet)
- Enables secure, low-latency inter-region communication

### Region Naming Convention

AWS Regions follow a naming pattern:

```
Region Name: US East (N. Virginia)
Region Code: us-east-1
             ││  │    │
             ││  │    └─ Region number
             ││  └────── Geographic area
             │└───────── Country/continent code
             └────────── Partition (aws, aws-cn, aws-us-gov)
```

**Common Regions:**
- `us-east-1` - US East (N. Virginia)
- `us-west-2` - US West (Oregon)
- `eu-west-1` - Europe (Ireland)
- `ap-south-1` - Asia Pacific (Mumbai)
- `ap-southeast-1` - Asia Pacific (Singapore)

### Choosing an AWS Region

When selecting a Region, consider these factors:

**1. Latency and User Proximity**
- Choose a Region close to your primary users
- Reduces network latency and improves application responsiveness
- Example: For users in India, `ap-south-1` (Mumbai) provides lower latency than `us-east-1`

**2. Data Sovereignty and Compliance**
- Certain regulations require data to remain within specific geographic boundaries
- GDPR (Europe), data localization laws (India, China, Russia)
- AWS does not move data between Regions without explicit customer action

**3. Service Availability**
- Not all AWS services are available in all Regions
- New services typically launch in `us-east-1` first
- Check [AWS Regional Services list](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/)

**4. Cost**
- Pricing varies by Region
- Generally, US Regions are less expensive than Asia-Pacific or South America
- Data transfer costs between Regions can be significant

**5. Disaster Recovery Requirements**
- Multi-region deployments provide geographic redundancy
- Protects against region-wide failures (rare but possible)

## Availability Zones (AZs)

### What is an Availability Zone?

An **Availability Zone (AZ)** is one or more discrete data centers within an AWS Region, each with redundant power, networking, and connectivity. Each Region contains multiple, physically separated and isolated AZs.

### Key Characteristics

**Physical Isolation**
- AZs are physically separate locations within a Region
- Separated by meaningful distances (typically several miles/kilometers)
- Designed to minimize the impact of natural disasters or infrastructure failures

**Low-Latency Connectivity**
- AZs within a Region are connected via low-latency, high-bandwidth, redundant fiber optic networks
- Typical inter-AZ latency: single-digit milliseconds
- Enables synchronous replication for databases and storage

**Independent Infrastructure**
- Each AZ has independent power, cooling, and networking
- Failure in one AZ should not affect other AZs
- Provides fault isolation boundaries

### AZ Architecture

```
┌──────────────────────────────────────────────────────────┐
│         Availability Zone A (us-east-1a)                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐         ┌────────────────┐           │
│  │  Data Center 1 │         │  Data Center 2 │           │
│  │                │         │                │           │
│  │  - Power Grid A│         │  - Power Grid A│           │
│  │  - Network A   │ <──────>│  - Network A   │           │
│  │  - Cooling     │         │  - Cooling     │           │
│  └────────────────┘         └────────────────┘           │
│                                                          │
└──────────────────────────────────────────────────────────┘
                           ↕
              Low-latency redundant fiber
                           ↕
┌──────────────────────────────────────────────────────────┐
│         Availability Zone B (us-east-1b)                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐         ┌────────────────┐           │
│  │  Data Center 3 │         │  Data Center 4 │           │
│  │                │         │                │           │
│  │  - Power Grid B│         │  - Power Grid B│           │
│  │  - Network B   │ <──────>│  - Network B   │           │
│  │  - Cooling     │         │  - Cooling     │           │
│  └────────────────┘         └────────────────┘           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Fault Tolerance Through Multi-AZ Deployment

Distributing resources across multiple AZs provides high availability:

```
Multi-AZ Architecture Example

┌──────────────────────────────────────────────────────────┐
│                Application Load Balancer                 │
│              (Automatically multi-AZ aware)              │
└────────────────┬─────────────────────┬───────────────────┘
                 │                     │
    ┌────────────┴──────────┐  ┌───────┴──────────────┐
    │                       │  │                      │
┌───▼─────────────────┐ ┌───▼──▼─────────────┐ ┌──────▼─────────────┐
│  Availability Zone A│ │ Availability Zone B│ │ Availability Zone C│
│                     │ │                    │ │                    │
│  ┌──────────────┐   │ │  ┌──────────────┐  │ │  ┌──────────────┐  │
│  │  EC2 Instance│   │ │  │  EC2 Instance│  │ │  │  EC2 Instance│  │
│  │  Web Server  │   │ │  │  Web Server  │  │ │  │  Web Server  │  │
│  └──────┬───────┘   │ │  └──────┬───────┘  │ │  └──────┬───────┘  │
│         │           │ │         │          │ │         │          │
│  ┌──────▼───────┐   │ │  ┌──────▼───────┐  │ │  ┌──────▼───────┐  │
│  │  RDS Primary │   │ │  │ RDS Standby  │  │ │  │              │  │
│  │   Database   │───┼─┼──│  (sync repl) │  │ │  │              │  │
│  └──────────────┘   │ │  └──────────────┘  │ │  └──────────────┘  │
│                     │ │                    │ │                    │
└─────────────────────┘ └────────────────────┘ └────────────────────┘

If AZ-A fails → Traffic automatically routes to AZ-B and AZ-C
              → RDS Standby in AZ-B promotes to Primary
```

### Best Practices for Using AZs

1. **Deploy resources across multiple AZs** for high availability
2. **Use at least 2 AZs** for production workloads (3+ preferred)
3. **Design for AZ failure** - applications should gracefully handle AZ outages
4. **Leverage AZ-aware services** (ELB, RDS Multi-AZ, Auto Scaling)
5. **Monitor AZ health** and balance traffic appropriately

## Local Zones

### What are Local Zones?

**Local Zones** are extensions of AWS Regions that place select AWS compute, storage, and database services closer to large population centers, industry hubs, or geographic areas not currently served by an AWS Region.

### Key Characteristics

**Ultra-Low Latency**
- Designed for applications requiring single-digit millisecond latency
- Ideal for real-time gaming, live video streaming, virtual workstations

**Parent Region Association**
- Each Local Zone is associated with a parent AWS Region
- Connected to the parent Region via AWS's private network backbone

**Limited Service Availability**
- Not all AWS services are available in Local Zones
- Typically includes: EC2, EBS, VPC, ELB, FSx

### Local Zone Architecture

```
┌────────────────────────────────────────────────────────────┐
│              Parent Region: us-east-1                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    AZ-1a    │  │    AZ-1b    │  │    AZ-1c    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│         │                                                  │
│         │ AWS Private Backbone Network                     │
│         ▼                                                  │
│  ┌──────────────────────────────────────────────┐          │
│  │         VPC (172.16.0.0/16)                  │          │
│  │  ┌──────────────┐  ┌──────────────────────┐  │          │
│  │  │ Subnet (AZ-A)│  │  Subnet (Local Zone) │  │          │
│  │  │ 172.16.1.0/24│  │   172.16.10.0/24     │  │          │
│  │  └──────────────┘  └──────────────────────┘  │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────┬──────────────────────────────────┘
                          │
                          │ Low-latency private connection
                          ▼
              ┌───────────────────────────┐
              │  Local Zone: Boston       │
              │  (us-east-1-bos-1a)       │
              │                           │
              │  ┌──────────────────────┐ │
              │  │  EC2 Instances       │ │
              │  │  EBS Volumes         │ │
              │  │  Application Load    │ │
              │  │  Balancer            │ │
              │  └──────────────────────┘ │
              │          ↕                │
              │  [End Users in Boston]    │
              │   ~1-5ms latency          │
              └───────────────────────────┘
```

### Using Local Zones

To use a Local Zone:

1. **Opt in to the Local Zone** in your AWS account settings
2. **Create a subnet in your VPC** associated with the Local Zone
3. **Launch supported resources** (EC2, EBS) in the Local Zone subnet
4. **Configure routing** to direct local traffic to Local Zone resources

Example Local Zone identifiers:
- `us-east-1-bos-1a` - Boston
- `us-west-2-lax-1a` - Los Angeles
- `us-west-2-phx-1a` - Phoenix

### When to Use Local Zones

Use Local Zones when:
- Application requires **sub-10ms latency** to end users
- Serving users in geographic areas without nearby AWS Regions
- Running **latency-sensitive workloads** (media rendering, real-time gaming)
- **Hybrid cloud** scenarios where on-premises infrastructure needs AWS extension

## AWS Service Scope: Global vs Regional

AWS services operate at different scopes, which affects how they're managed and where data resides.

### Global Services

**Definition**: Services that operate across all AWS Regions and are not tied to a specific Region.

```
┌──────────────────────────────────────────────────────────┐
│                 Global Service Examples                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  IAM (Identity and Access Management)                    │
│  ├─ Users, Groups, Roles, Policies                       │
│  └─ Applies to all Regions in your account               │
│                                                          │
│  Route 53 (DNS Service)                                  │
│  ├─ Global DNS resolution                                │
│  └─ Hosted zones accessible from anywhere                │
│                                                          │
│  CloudFront (CDN)                                        │
│  ├─ Content delivery from edge locations                 │
│  └─ Global distribution network                          │
│                                                          │
│  AWS Organizations                                       │
│  ├─ Account management                                   │
│  └─ Centralized billing and policies                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Characteristics:**
- Managed from a single console endpoint
- Configuration applies globally (with some exceptions)
- Can experience regional impact during outages

**Important Note**: Global services can have regional dependencies. For example:
- **IAM uses AWS STS (Security Token Service)** for temporary credentials
- STS has regional endpoints
- If a region hosting STS fails, IAM operations in that region may be affected

### Regional Services

**Definition**: Services that operate within a specific AWS Region. Data and operations are Region-scoped.

```
┌──────────────────────────────────────────────────────────┐
│               Regional Service Examples                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  EC2 (Elastic Compute Cloud)                             │
│  ├─ Instances exist in specific Regions and AZs          │
│  └─ AMIs are Region-specific                             │
│                                                          │
│  VPC (Virtual Private Cloud)                             │
│  ├─ Each VPC exists in one Region                        │
│  └─ Can span multiple AZs within that Region             │
│                                                          │
│  RDS (Relational Database Service)                       │
│  ├─ Database instances are Regional                      │
│  └─ Read replicas can be cross-Region                    │
│                                                          │
│  S3 (Simple Storage Service)                             │
│  ├─ Bucket names are globally unique                     │
│  ├─ But buckets exist in a specific Region               │
│  └─ Data stays in the Region unless replicated           │
│                                                          │
│  DynamoDB                                                │
│  ├─ Tables are Regional by default                       │
│  └─ Global Tables enable multi-region replication        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Characteristics:**
- Must be configured separately in each Region
- Data residency is controlled
- Resources don't automatically replicate across Regions

### Regional Services with Global Capabilities

Some regional services offer features for global distribution:

**Amazon S3**
- Bucket names are globally unique (cannot reuse across accounts)
- Buckets themselves are regional
- Objects stored in a bucket remain in that Region
- Cross-Region Replication (CRR) available for multi-region data presence

**DynamoDB**
- Tables are regional by default
- DynamoDB Global Tables enable automatic multi-region replication
- Provides local read/write access in multiple Regions

**Amazon Aurora**
- Database clusters are regional
- Aurora Global Database enables cross-region replication
- Allows read access from multiple Regions

## Amazon Resource Names (ARNs)

### What is an ARN?

An **Amazon Resource Name (ARN)** is a unique identifier for AWS resources. ARNs are required when you need to specify a resource unambiguously across all of AWS.

### ARN Format

```
arn:partition:service:region:account-id:resource-id
arn:partition:service:region:account-id:resource-type/resource-id
arn:partition:service:region:account-id:resource-type:resource-id
```

### ARN Components

```
arn:aws:ec2:us-east-1:123456789012:instance/i-1234567890abcdef0
│   │   │      │         │              │
│   │   │      │         │              └─ Resource ID
│   │   │      │         └──────────────── Account ID
│   │   │      └────────────────────────── Region
│   │   └───────────────────────────────── Service
│   └───────────────────────────────────── Partition
└───────────────────────────────────────── ARN prefix
```

**Partition**
- Identifies the AWS partition
- `aws` - Standard AWS Regions
- `aws-cn` - AWS China Regions
- `aws-us-gov` - AWS GovCloud (US) Regions

**Service**
- The AWS service (e.g., `ec2`, `s3`, `iam`, `lambda`)

**Region**
- The AWS Region where the resource resides
- Omitted for global services or when not applicable

**Account ID**
- The 12-digit AWS account ID
- Omitted for resources with globally unique names (e.g., S3 buckets)

**Resource**
- Resource type and identifier
- Format varies by service

### ARN Examples and Patterns

**EC2 Instance**
```
arn:aws:ec2:us-east-1:123456789012:instance/i-1234567890abcdef0
              │          │           │        └─ Instance ID
              │          │           └────────── Resource type
              │          └────────────────────── Account ID
              └───────────────────────────────── Region included
```

**S3 Bucket**
```
arn:aws:s3:::my-bucket-name
             └─ No region or account (globally unique name)

arn:aws:s3:::my-bucket-name/path/to/object.txt
             └─ Bucket name followed by object key
```

**IAM Role**
```
arn:aws:iam::123456789012:role/MyApplicationRole
              │                └─ Role name
              └──────────────────── No region (IAM is global)
```

**Lambda Function**
```
arn:aws:lambda:eu-west-1:123456789012:function:my-function
                 │          │            │       └─ Function name
                 │          │            └───────── Resource type
                 │          └────────────────────── Account ID
                 └───────────────────────────────── Region included
```

### ARN Wildcards

ARNs support wildcards (`*`, `?`) in IAM policies for flexible permissions:

```json
{
  "Effect": "Allow",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::my-bucket/*"
}
```
This allows access to all objects in `my-bucket`.

```json
{
  "Effect": "Allow",
  "Action": "ec2:DescribeInstances",
  "Resource": "*"
}
```
The `*` means the action can be performed on all resources.

### When Are ARNs Used?

**IAM Policies**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}
```

**Resource-Based Policies**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:role/MyRole"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}
```

**Service Integration**
- Lambda triggers from S3 require S3 bucket ARN
- EventBridge rules targeting SNS require topic ARN
- Cross-account access requires ARN of the resource

**AWS CLI and SDKs**
```bash
# Describe a specific EC2 instance
aws ec2 describe-instances \
  --instance-ids i-1234567890abcdef0

# Get an S3 object
aws s3api get-object \
  --bucket my-bucket \
  --key path/to/file.txt
```

## Infrastructure Design Patterns

### Single Region, Single AZ (Not Recommended for Production)

```
┌─────────────────────────────────┐
│       Region: us-east-1         │
│  ┌───────────────────────────┐  │
│  │   Availability Zone A     │  │
│  │  ┌─────────────────────┐  │  │
│  │  │  Application Tier   │  │  │
│  │  ├─────────────────────┤  │  │
│  │  │  Database Tier      │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘

Risk: Single point of failure
Use case: Dev/test environments only
```

### Single Region, Multi-AZ (Recommended for Production)

```
┌────────────────────────────────────────────────────────┐
│                Region: us-east-1                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   AZ-A       │  │   AZ-B       │  │   AZ-C       │  │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │  │
│  │ │   App    │ │  │ │   App    │ │  │ │   App    │ │  │
│  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │  │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │              │  │
│  │ │ Primary  │─┼──┼>│ Standby  │ │  │              │  │
│  │ │   DB     │ │  │ │   DB     │ │  │              │  │
│  │ └──────────┘ │  │ └──────────┘ │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────────────────────────────────────┘

Benefits: High availability, fault tolerance
Use case: Production applications
```

### Multi-Region (Disaster Recovery / Global Applications)

```
┌────────────────────────────┐      ┌────────────────────────────┐
│   Region: us-east-1        │      │   Region: eu-west-1        │
│   (Primary)                │      │   (Secondary/DR)           │
│  ┌──────┐  ┌──────┐        │      │  ┌──────┐  ┌──────┐        │
│  │ AZ-A │  │ AZ-B │        │      │  │ AZ-A │  │ AZ-B │        │
│  │ App  │  │ App  │        │      │  │ App  │  │ App  │        │
│  │ DB-P │  │ DB-S │        │      │  │ DB-S │  │ DB-S │        │
│  └──────┘  └──────┘        │      │  └──────┘  └──────┘        │
└────────────┬───────────────┘      └─────────────┬──────────────┘
             │                                    │
             └──────────── Replication ───────────┘
                      (CRR, Global Tables, etc.)

Benefits: Disaster recovery, global low latency
Use case: Business-critical apps, global user base
```

## Summary

**Key Takeaways:**

1. **Regions** are geographically distributed locations containing multiple Availability Zones
2. **Availability Zones** are isolated data centers within a Region, providing fault tolerance
3. **Local Zones** extend AWS infrastructure closer to end users for ultra-low latency
4. **Global services** (IAM, Route 53) operate across all Regions
5. **Regional services** (EC2, VPC, RDS) are scoped to specific Regions
6. **ARNs** uniquely identify AWS resources across accounts and Regions

**Best Practices:**

- Deploy production workloads across multiple AZs for high availability
- Choose Regions based on latency, compliance, cost, and service availability
- Use multi-region architectures for disaster recovery and global applications
- Understand service scope (global vs regional) for proper resource planning
- Use ARNs for precise resource identification in policies and automation
