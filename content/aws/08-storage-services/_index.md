---
title: Storage Services
linkTitle: Storage Services
type: docs
weight: 8
prev: /aws/07-identity-and-access-management
next: /aws/09-systems-management
---

## Overview

AWS offers multiple storage services designed for different use cases: block storage (EBS), file storage (EFS), and object storage (S3). Understanding the characteristics, use cases, and features of each service is essential for designing optimal storage architectures.

## Storage Service Comparison

```
┌─────────────────────────────────────────────────────────────┐
│          AWS Storage Services Comparison                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  EBS (Elastic Block Store)                                  │
│  ├─ Type: Block storage                                     │
│  ├─ Scope: Single AZ                                        │
│  ├─ Access: Single EC2 instance (multi-attach limited)      │
│  ├─ Use case: Boot volumes, databases, transactional data   │
│  └─ Performance: Low latency, high IOPS                     │
│                                                             │
│  EFS (Elastic File System)                                  │
│  ├─ Type: Network file storage (NFSv4)                      │
│  ├─ Scope: Regional (multi-AZ) or single-AZ                 │
│  ├─ Access: Multiple EC2 instances concurrently             │
│  ├─ Use case: Shared file systems, content management       │
│  └─ Performance: Scalable throughput, moderate latency      │
│                                                             │
│  S3 (Simple Storage Service)                                │
│  ├─ Type: Object storage                                    │
│  ├─ Scope: Regional (globally unique names)                 │
│  ├─ Access: HTTP/HTTPS API, multiple clients                │
│  ├─ Use case: Backups, archives, data lakes, static content │
│  └─ Performance: Highly scalable, higher latency than EBS   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Amazon Elastic Block Store (EBS)

### EBS Volume Overview

**Amazon EBS** provides persistent block storage volumes for EC2 instances. EBS volumes behave like raw, unformatted block devices that can be formatted with a file system.

### EBS Volume Types

```
┌─────────────────────────────────────────────────────────────┐
│              EBS Volume Types                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SSD-Backed (IOPS-Intensive Workloads)                      │
│                                                             │
│  gp3 (General Purpose SSD) - Recommended                    │
│  ├─ Baseline: 3,000 IOPS, 125 MB/s                          │
│  ├─ Configurable: Up to 16,000 IOPS, 1,000 MB/s             │
│  ├─ Size: 1 GiB - 16 TiB                                    │
│  ├─ Price: Lower cost than gp2                              │
│  └─ Use case: Most workloads, boot volumes                  │
│                                                             │
│  io2 Block Express (Provisioned IOPS SSD) - Highest Performance
│  ├─ IOPS: Up to 256,000                                     │
│  ├─ Throughput: Up to 4,000 MB/s                            │
│  ├─ Size: 4 GiB - 64 TiB                                    │
│  ├─ Durability: 99.999%                                     │
│  └─ Use case: Mission-critical databases                    │
│                                                             │
│  HDD-Backed (Throughput-Intensive Workloads)                │
│                                                             │
│  st1 (Throughput Optimized HDD)                             │
│  ├─ Throughput: Up to 500 MB/s                              │
│  ├─ IOPS: Up to 500                                         │
│  ├─ Size: 125 GiB - 16 TiB                                  │
│  └─ Use case: Big data, data warehouses                     │
│                                                             │
│  sc1 (Cold HDD) - Lowest Cost                               │
│  ├─ Throughput: Up to 250 MB/s                              │
│  ├─ IOPS: Up to 250                                         │
│  ├─ Size: 125 GiB - 16 TiB                                  │
│  └─ Use case: Infrequently accessed data                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### EBS Snapshots

**EBS Snapshots** are point-in-time backups of EBS volumes stored in S3.

```
┌─────────────────────────────────────────────────────────────┐
│              EBS Snapshot Workflow                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Initial Snapshot (Full Backup)                             │
│  ┌──────────────────────────────────────────┐               │
│  │  EBS Volume (100 GB used)                │               │
│  │  Data: A, B, C, D, E                     │               │
│  └────────────────┬─────────────────────────┘               │
│                   │ Create Snapshot                         │
│                   ▼                                         │
│  ┌──────────────────────────────────────────┐               │
│  │  Snapshot 1 (stored in S3)               │               │
│  │  Size: 100 GB                            │               │
│  │  Data: A, B, C, D, E                     │               │
│  └──────────────────────────────────────────┘               │
│                                                             │
│  Incremental Snapshot (Only Changes)                        │
│  ┌──────────────────────────────────────────┐               │
│  │  EBS Volume (110 GB used)                │               │
│  │  Data: A, B', C, D, E, F (B changed, F new)              │
│  └────────────────┬─────────────────────────┘               │
│                   │ Create Snapshot                         │
│                   ▼                                         │
│  ┌──────────────────────────────────────────┐               │
│  │  Snapshot 2 (stored in S3)               │               │
│  │  Size: Only 10 GB charged (incremental)  │               │
│  │  Data: B', F (only changes)              │               │
│  │  References: Snapshot 1 for A, C, D, E   │               │
│  └──────────────────────────────────────────┘               │
│                                                             │
│  Benefits:                                                  │
│  ├─ Space efficient (incremental)                           │
│  ├─ Can create volume from any snapshot                     │
│  ├─ Copy across regions                                     │
│  └─ Share with other accounts                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Lifecycle Manager

**Amazon Data Lifecycle Manager** automates the creation, retention, and deletion of EBS snapshots and EBS-backed AMIs using policy-based automation.

```
Example DLM Policy

Policy: Daily-Snapshots-Retain-7-Days
├─ Target: Volumes tagged with "Backup: Daily"
├─ Schedule: Daily at 2:00 AM UTC
├─ Retention: 7 snapshots
├─ Cross-region copy: To us-west-2
└─ Tagging: Auto-tag snapshots

Benefits:
• Automated backup scheduling
• Consistent snapshot retention
• Reduced manual management
• Cost optimization (auto-deletion)
```

## Amazon Elastic File System (EFS)

### EFS Overview

**Amazon EFS** provides scalable, elastic file storage that can be mounted on multiple EC2 instances simultaneously using NFSv4 protocol.

### EFS Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              EFS Architecture                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  EFS File System (Regional)                          │   │
│  │  efs-12345678                                        │   │
│  └────────┬──────────────────────────┬──────────────────┘   │
│           │                          │                      │
│  ┌────────▼────────┐        ┌────────▼────────┐             │
│  │  Mount Target   │        │  Mount Target   │             │
│  │  AZ-A           │        │  AZ-B           │             │
│  │  10.0.1.10      │        │  10.0.2.10      │             │
│  └────────┬────────┘        └────────┬────────┘             │
│           │                          │                      │
│     ┌─────┴─────┐              ┌─────┴─────┐                │
│     │           │              │           │                │
│  ┌──▼──┐    ┌──▼──┐        ┌──▼──┐    ┌──▼──┐               │
│  │ EC2 │    │ EC2 │        │ EC2 │    │ EC2 │               │
│  │ Web │    │ App │        │ Web │    │ App │               │
│  └─────┘    └─────┘        └─────┘    └─────┘               │
│                                                             │
│  • All instances access same file system concurrently       │
│  • Data is synchronized across all mount targets            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Mount Targets

**Mount targets** are network interfaces that provide access to an EFS file system from EC2 instances.

```
┌─────────────────────────────────────────────────────────────┐
│              Mount Target Architecture                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Requirements:                                              │
│  ├─ One mount target per Availability Zone                  │
│  ├─ Each mount target has a unique IP address in a subnet   │
│  ├─ Security groups control access to mount targets         │
│  └─ Multiple EC2 instances can use same mount target        │
│                                                             │
│  Example Configuration:                                     │
│                                                             │
│  VPC: 10.0.0.0/16                                           │
│  ├─ AZ-A: Subnet 10.0.1.0/24                                │
│  │  └─ Mount Target: fsmt-abc123 (IP: 10.0.1.10)            │
│  │     └─ Security Group: Allow NFS (port 2049) from VPC    │
│  │        └─ EC2 instances in AZ-A connect to this IP       │
│  │                                                          │
│  └─ AZ-B: Subnet 10.0.2.0/24                                │
│     └─ Mount Target: fsmt-def456 (IP: 10.0.2.10)            │
│        └─ Security Group: Allow NFS (port 2049) from VPC    │
│           └─ EC2 instances in AZ-B connect to this IP       │
│                                                             │
│  Mounting on EC2 (using DNS):                               │
│  $ sudo mount -t nfs4 -o nfsvers=4.1 \                      │
│    fs-12345678.efs.us-east-1.amazonaws.com:/ /mnt/efs       │
│                                                             │
│  Mounting with Specific Mount Target IP:                    │
│  $ sudo mount -t nfs4 -o nfsvers=4.1 \                      │
│    10.0.1.10:/ /mnt/efs                                     │
│                                                             │
│  Best Practices:                                            │
│  ├─ Create mount targets in all AZs where instances run     │
│  ├─ Use security groups to restrict NFS access              │
│  ├─ Mount from instances in same AZ for best performance    │
│  └─ Use EFS mount helper (amazon-efs-utils) for easy setup  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Access Points

**EFS Access Points** provide application-specific entry points into an EFS file system, simplifying access management and enforcing user identity and root directory.

```
┌─────────────────────────────────────────────────────────────┐
│              EFS Access Points                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  What are Access Points?                                    │
│  ├─ Application-specific entry points                       │
│  ├─ Enforce POSIX user/group and root directory             │
│  ├─ Simplify IAM-based access control                       │
│  └─ Ideal for multi-tenant and container environments       │
│                                                             │
│  Architecture Example:                                      │
│                                                             │
│  EFS File System: fs-12345678                               │
│  ├─ /                                                       │
│  │  ├─ /app-a                                               │
│  │  │  └─ data/                                             │
│  │  ├─ /app-b                                               │
│  │  │  └─ logs/                                             │
│  │  └─ /app-c                                               │
│  │     └─ uploads/                                          │
│  │                                                          │
│  Access Point 1: fsap-app-a                                 │
│  ├─ Root Directory: /app-a                                  │
│  ├─ POSIX User: UID 1000, GID 1000                          │
│  ├─ Permissions: Owner can read/write                       │
│  └─ IAM Policy: Allows App-A role only                      │
│                                                             │
│  Access Point 2: fsap-app-b                                 │
│  ├─ Root Directory: /app-b                                  │
│  ├─ POSIX User: UID 2000, GID 2000                          │
│  └─ IAM Policy: Allows App-B role only                      │
│                                                             │
│  Access Point 3: fsap-app-c                                 │
│  ├─ Root Directory: /app-c                                  │
│  ├─ POSIX User: UID 3000, GID 3000                          │
│  └─ IAM Policy: Allows App-C role only                      │
│                                                             │
│  Mounting with Access Point:                                │
│  $ sudo mount -t efs -o \                                   │
│    tls,accesspoint=fsap-app-a \                             │
│    fs-12345678 /mnt/app-a                                   │
│                                                             │
│  Benefits:                                                  │
│  ├─ Each app sees only its own directory                    │
│  ├─ Enforced user/group identity                            │
│  ├─ Simplified IAM policies per application                 │
│  ├─ Automatic directory creation with permissions           │
│  └─ Perfect for ECS/EKS containers with shared storage      │
│                                                             │
│  Use Cases:                                                 │
│  ├─ Multi-tenant SaaS applications                          │
│  ├─ Container workloads (ECS, EKS)                          │
│  ├─ Lambda functions with EFS                               │
│  └─ Enforcing data isolation between applications           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### EFS File System Types

**EFS offers two deployment types** with different availability and cost characteristics.

```
┌─────────────────────────────────────────────────────────────┐
│              EFS File System Types                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Regional (Standard) - Default                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  EFS File System                                     │   │
│  │  ├─ Availability: Multi-AZ (≥3 AZs)                  │   │
│  │  ├─ Durability: 99.999999999% (11 9's)               │   │
│  │  ├─ Availability SLA: 99.99%                         │   │
│  │  ├─ Redundancy: Data replicated across AZs           │   │
│  │  ├─ Cost: Higher storage cost                        │   │
│  │  └─ Use case: Production, HA applications            │   │
│  │                                                      │   │
│  │  Architecture:                                       │   │
│  │  ┌────────┐    ┌────────┐    ┌────────┐              │   │
│  │  │  AZ-A  │    │  AZ-B  │    │  AZ-C  │              │   │
│  │  │ Replica│<──>│ Replica│<──>│ Replica│              │   │
│  │  └────────┘    └────────┘    └────────┘              │   │
│  │     ▲             ▲             ▲                    │   │
│  │     │             │             │                    │   │
│  │  ┌──┴──┐       ┌──┴──┐       ┌──┴──┐                 │   │
│  │  │ EC2 │       │ EC2 │       │ EC2 │                 │   │
│  │  └─────┘       └─────┘       └─────┘                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  One Zone                                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  EFS One Zone File System                            │   │
│  │  ├─ Availability: Single AZ                          │   │
│  │  ├─ Durability: 99.999999999% (within single AZ)     │   │
│  │  ├─ Availability: Lower (single AZ failure risk)     │   │
│  │  ├─ Redundancy: Within single AZ only                │   │
│  │  ├─ Cost: Lower cost than Regional                   │   │
│  │  └─ Use case: Dev/test, non-critical workloads       │   │
│  │                                                      │   │
│  │  Architecture:                                       │   │
│  │  ┌──────────────────┐                                │   │
│  │  │      AZ-A        │                                │   │
│  │  │  EFS One Zone    │                                │   │
│  │  │  (Single copy)   │                                │   │
│  │  └────────┬─────────┘                                │   │
│  │           │                                          │   │
│  │     ┌─────┴────┐                                     │   │
│  │     │          │                                     │   │
│  │  ┌──▼──┐    ┌──▼──┐                                  │   │
│  │  │ EC2 │    │ EC2 │                                  │   │
│  │  └─────┘    └─────┘                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  Comparison:                                                │
│  ┌────────────┬──────────────┬──────────────────────────┐   │
│  │ Feature    │ Regional     │ One Zone                 │   │
│  ├────────────┼──────────────┼──────────────────────────┤   │
│  │ Durability │ 11 9's       │ 11 9's (single AZ)       │   │
│  │ Multi-AZ   │ Yes (≥3)     │ No (1 AZ)                │   │
│  │ Cost       │ Standard     │ Lower cost               │   │
│  │ Use Case   │ Production   │ Dev/test, backups        │   │
│  │ AZ Failure │ Survives     │ Data unavailable         │   │
│  └────────────┴──────────────┴──────────────────────────┘   │
│                                                             │
│  Choosing Between Types:                                    │
│  Regional: Production apps requiring HA                     │
│  One Zone: Development, testing, cost-sensitive workloads   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### EFS Data Protection

**EFS provides multiple layers of data protection** including backup, replication, and encryption.

```
┌─────────────────────────────────────────────────────────────┐
│              EFS Data Protection                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Backup (AWS Backup Integration)                            │
│  ├─ Automated backup policies                               │
│  ├─ Point-in-time recovery                                  │
│  ├─ Centralized backup management                           │
│  ├─ Cross-region backup copies                              │
│  └─ Retention: Customizable (days to years)                 │
│                                                             │
│  Backup Example:                                            │
│  Policy: Daily-EFS-Backups                                  │
│  ├─ Schedule: Daily at 3:00 AM UTC                          │
│  ├─ Retention: 30 days                                      │
│  ├─ Vault: Default                                          │
│  ├─ Lifecycle: Move to cold storage after 7 days            │
│  └─ Cross-region copy: To us-west-2 (7-day retention)       │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  EFS Replication                                            │
│  ┌──────────────────┐                    ┌──────────────┐   │
│  │  Source Region   │                    │ Destination  │   │
│  │  us-east-1       │                    │ eu-west-1    │   │
│  │                  │                    │              │   │
│  │  EFS File System │──── Replicate ────>│  EFS Replica │   │
│  │  fs-source-123   │  (Automatic)       │  fs-dest-456 │   │
│  └──────────────────┘                    └──────────────┘   │
│                                                             │
│  Replication Features:                                      │
│  ├─ Continuous, automatic replication                       │
│  ├─ Cross-region or same-region                             │
│  ├─ Recovery Point Objective (RPO): ~15 minutes             │
│  ├─ Destination is read-only                                │
│  ├─ Can fail over to destination in DR scenario             │
│  └─ Preserves file metadata and permissions                 │
│                                                             │
│  Use Cases:                                                 │
│  ├─ Disaster recovery                                       │
│  ├─ Compliance requirements                                 │
│  ├─ Business continuity                                     │
│  └─ Read replicas in different regions                      │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Encryption                                                 │
│                                                             │
│  Encryption at Rest                                         │
│  ├─ AWS KMS managed keys                                    │
│  ├─ Enabled at file system creation                         │
│  ├─ Cannot be disabled once enabled                         │
│  ├─ No performance impact                                   │
│  └─ Transparent to applications                             │
│                                                             │
│  Encryption in Transit                                      │
│  ├─ TLS 1.2 encryption                                      │
│  ├─ Enabled via mount options (tls)                         │
│  ├─ Requires amazon-efs-utils mount helper                  │
│  └─ Example: mount -t efs -o tls fs-12345678 /mnt/efs       │
│                                                             │
│  Encryption Example:                                        │
│  Creating Encrypted EFS:                                    │
│  $ aws efs create-file-system \                             │
│    --encrypted \                                            │
│    --kms-key-id arn:aws:kms:region:account:key/key-id \     │
│    --region us-east-1                                       │
│                                                             │
│  Mounting with Encryption in Transit:                       │
│  $ sudo mount -t efs -o tls,iam fs-12345678 /mnt/efs        │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Access Control                                             │
│  ├─ IAM policies for API operations                         │
│  ├─ Security groups for mount target access                 │
│  ├─ POSIX permissions for file/directory access             │
│  ├─ EFS Access Points for application isolation             │
│  └─ EFS File System Policies (resource-based)               │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Best Practices:                                            │
│  ├─ Enable encryption at rest for sensitive data            │
│  ├─ Use encryption in transit (TLS)                         │
│  ├─ Implement AWS Backup for automated backups              │
│  ├─ Configure replication for critical file systems         │
│  ├─ Use security groups to restrict NFS port access         │
│  ├─ Leverage IAM policies and Access Points for access      │
│  └─ Enable CloudWatch metrics and alarms for monitoring     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### EFS Storage Classes

```
┌─────────────────────────────────────────────────────────────┐
│              EFS Storage Classes                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  EFS Standard                                               │
│  ├─ Performance: SSD-backed                                 │
│  ├─ Access: Frequently accessed files                       │
│  └─ Cost: Higher per GB                                     │
│                                                             │
│  EFS Infrequent Access (IA)                                 │
│  ├─ Performance: Lower-cost storage                         │
│  ├─ Access: Infrequently accessed files                     │
│  ├─ Cost: Lower storage cost, retrieval fee applies         │
│  └─ Automatically moved by lifecycle policy                 │
│                                                             │
│  EFS Archive                                                │
│  ├─ Performance: Lowest cost storage                        │
│  ├─ Access: Rarely accessed files                           │
│  └─ Automatically moved by lifecycle policy                 │
│                                                             │
│  EFS Intelligent-Tiering                                    │
│  ├─ Automatically moves files between classes               │
│  ├─ Based on access patterns                                │
│  ├─ Lifecycle policy: After X days without access           │
│  └─ Moves back to Standard when accessed                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### EFS Use Case Example

```
Shared Content Management System

┌──────────────────────────────────────────┐
│  EFS File System: /var/www/shared        │
│  ├─ /images                              │
│  ├─ /documents                           │
│  └─ /uploads                             │
└────────┬─────────────────────────────────┘
         │
    ┌────┴────┬────────┬────────┐
    │         │        │        │
┌───▼──┐  ┌───▼──┐ ┌───▼──┐ ┌───▼──┐
│Web-1 │  │Web-2 │ │Web-3 │ │Web-4 │
│ AZ-A │  │ AZ-A │ │ AZ-B │ │ AZ-B │
└──────┘  └──────┘ └──────┘ └──────┘

Benefits:
• All web servers access same files
• Automatic synchronization
• Elastic capacity (no provisioning)
• High availability across AZs
```

## Amazon Simple Storage Service (S3)

### S3 Overview

**Amazon S3** is an object storage service offering industry-leading scalability, data availability, security, and performance.

### S3 Core Concepts

```
┌─────────────────────────────────────────────────────────────┐
│              S3 Fundamental Components                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  S3 Object                                                  │
│  ├─ Definition: A file and metadata describing the file     │
│  ├─ Object Key: Unique identifier within a bucket           │
│  ├─ Value: The actual data (0 bytes to 5 TB)                │
│  ├─ Metadata: Key-value pairs about the object              │
│  ├─ Version ID: (if versioning enabled)                     │
│  └─ Access control: Permissions for the object              │
│                                                             │
│  S3 Bucket                                                  │
│  ├─ Definition: Container for storing objects               │
│  ├─ Naming: Globally unique across all AWS accounts         │
│  ├─ Region: Specified at creation                           │
│  └─ Maximum: 100 buckets per account (soft limit)           │
│                                                             │
│  Bucket Types:                                              │
│                                                             │
│  General Purpose Bucket                                     │
│  ├─ Standard S3 bucket type                                 │
│  ├─ Supports all storage classes except S3 Express          │
│  └─ Most common bucket type                                 │
│                                                             │
│  Directory Bucket                                           │
│  ├─ Only supports S3 Express One Zone storage class         │
│  ├─ Faster data processing within single AZ                 │
│  ├─ Recommended for low-latency use cases                   │
│  └─ Optimized for high-performance workloads                │
│                                                             │
│  S3 Tables                                                  │
│  ├─ Optimized for analytics workloads                       │
│  ├─ Purpose-built for tabular data                          │
│  ├─ S3 Table Buckets: Store S3 tables and metadata          │
│  └─ Stores metadata and data as objects                     │
│                                                             │
│  Bucket Structure Example:                                  │
│  my-bucket/ (General Purpose)                               │
│  ├─ images/                                                 │
│  │  ├─ photo1.jpg (Key: images/photo1.jpg)                  │
│  │  └─ photo2.jpg (Key: images/photo2.jpg)                  │
│  ├─ documents/                                              │
│  │  └─ report.pdf (Key: documents/report.pdf)               │
│  └─ data.csv (Key: data.csv)                                │
│                                                             │
│  Note: S3 is flat storage - no real directories             │
│        Uses key prefixes to simulate folder structure       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### S3 Storage Classes

**Choose storage class based on three key factors:**
1. **Access Frequency** - How often do you need the data?
2. **Retrieval Speed** - How quickly do you need it when accessed?
3. **Availability Requirements** - Can you tolerate single-AZ risk?

```
┌─────────────────────────────────────────────────────────────┐
│              S3 Storage Classes                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FREQUENT ACCESS (Multiple times per month)                 │
│                                                             │
│  S3 Standard                                                │
│  ├─ Access: Frequent (daily/weekly)                         │
│  ├─ Retrieval: Milliseconds                                 │
│  ├─ Availability: 99.99% (Multi-AZ)                         │
│  ├─ Retrieval Fee: None                                     │
│  ├─ Example: Active website assets, mobile app data         │
│  └─ When: Default choice for frequently accessed data       │
│                                                             │
│  S3 Express One Zone                                        │
│  ├─ Access: Extremely frequent (thousands of requests/sec)  │
│  ├─ Retrieval: Single-digit milliseconds                    │
│  ├─ Availability: 99.95% (Single-AZ)                        │
│  ├─ Example: Real-time analytics, ML training data          │
│  └─ When: Need highest performance, single-AZ acceptable    │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  INFREQUENT ACCESS (Few times per month)                    │
│                                                             │
│  S3 Standard-IA (Infrequent Access)                         │
│  ├─ Access: Infrequent (monthly)                            │
│  ├─ Retrieval: Milliseconds                                 │
│  ├─ Availability: 99.9% (Multi-AZ)                          │
│  ├─ Retrieval Fee: Per GB retrieved                         │
│  ├─ Example: Disaster recovery, monthly backups             │
│  └─ When: Data accessed <1x/month, need multi-AZ            │
│                                                             │
│  S3 One Zone-IA                                             │
│  ├─ Access: Infrequent (monthly)                            │
│  ├─ Retrieval: Milliseconds                                 │
│  ├─ Availability: 99.5% (Single-AZ)                         │
│  ├─ Retrieval Fee: Per GB retrieved                         │
│  ├─ Example: Secondary backups, recreatable thumbnails      │
│  └─ When: Data can be recreated if AZ fails (20% cheaper)   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ARCHIVE (Rarely accessed, long-term retention)             │
│                                                             │
│  S3 Glacier Instant Retrieval                               │
│  ├─ Access: Rare (quarterly)                                │
│  ├─ Retrieval: Milliseconds (when needed)                   │
│  ├─ Min Duration: 90 days                                   │
│  ├─ Retrieval Fee: Higher per GB                            │
│  ├─ Example: Medical images, news archives                  │
│  └─ When: Archive but need instant access (not hours)       │
│                                                             │
│  S3 Glacier Flexible Retrieval                              │
│  ├─ Access: Rare (yearly)                                   │
│  ├─ Retrieval: Minutes to hours (planned retrieval)         │
│  │  • Expedited: 1-5 minutes (most expensive)               │
│  │  • Standard: 3-5 hours (moderate cost)                   │
│  │  • Bulk: 5-12 hours (cheapest)                           │
│  ├─ Min Duration: 90 days                                   │
│  ├─ Example: Compliance data, annual audit files            │
│  └─ When: Can wait hours for data, lowest cost archive      │
│                                                             │
│  S3 Glacier Deep Archive                                    │
│  ├─ Access: Very rare (once in years)                       │
│  ├─ Retrieval: 12-48 hours (batch retrieval only)           │
│  │  • Standard: 12 hours                                    │
│  │  • Bulk: 48 hours (cheapest)                             │
│  ├─ Min Duration: 180 days (6 months)                       │
│  ├─ Example: 7-year financial records, tape replacement     │
│  └─ When: Lowest cost, accessed <1x/year, can wait days     │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  AUTOMATIC OPTIMIZATION (Don't know access pattern)         │
│                                                             │
│  S3 Intelligent-Tiering                                     │
│  ├─ Access: Unknown or unpredictable                        │
│  ├─ Retrieval: Milliseconds (when in frequent tier)         │
│  ├─ Auto-moves: Frequent → Infrequent → Archive tiers       │
│  ├─ Retrieval Fee: None (only monitoring fee)               │
│  ├─ Example: Data lakes, user-generated content             │
│  └─ When: Access pattern unknown/changing (AWS optimizes)   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Decision Tree for Storage Class Selection

```
┌─────────────────────────────────────────────────────────────┐
│         "Which S3 Storage Class Should I Use?"              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  START: How often will you access this data?                │
│                                                             │
│  ┌─ Daily/Weekly (Frequent)                                 │
│  │  └─> Need highest performance?                           │
│  │      ├─ Yes → S3 Express One Zone                        │
│  │      └─ No → S3 Standard                                 │
│  │                                                          │
│  ┌─ Monthly (Infrequent)                                    │
│  │  └─> Critical data requiring multi-AZ?                   │
│  │      ├─ Yes → S3 Standard-IA                             │
│  │      └─ No (recreatable) → S3 One Zone-IA                │
│  │                                                          │
│  ┌─ Quarterly (Rare)                                        │
│  │  └─> Need instant retrieval when accessed?               │
│  │      ├─ Yes → S3 Glacier Instant Retrieval               │
│  │      └─ No (can wait hours) → S3 Glacier Flexible        │
│  │                                                          │
│  ┌─ Yearly or Less (Very Rare)                              │
│  │  └─> Can wait 12-48 hours for retrieval?                 │
│  │      ├─ Yes → S3 Glacier Deep Archive                    │
│  │      └─ No (need hours) → S3 Glacier Flexible            │
│  │                                                          │
│  ┌─ Unknown / Unpredictable                                 │
│  │  └─> S3 Intelligent-Tiering                              │
│  │      (Let AWS optimize automatically)                    │
│                                                             │
│  COST HIERARCHY (Storage per GB):                           │
│  1. Glacier Deep Archive (cheapest)                         │
│  2. Glacier Flexible Retrieval                              │
│  3. Glacier Instant Retrieval                               │
│  4. S3 One Zone-IA                                          │
│  5. S3 Standard-IA                                          │
│  6. S3 Standard                                             │
│  7. S3 Express One Zone (most expensive)                    │
│                                                             │
│  NOTE: Cheaper storage = higher retrieval fees              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### S3 Versioning

```
┌─────────────────────────────────────────────────────────────┐
│              S3 Versioning                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Overview:                                                  │
│  ├─ Maintains multiple versions of objects in same bucket   │
│  ├─ Must be explicitly enabled on bucket                    │
│  ├─ Once enabled, can only be suspended (not disabled)      │
│  └─ Each version has unique Version ID                      │
│                                                             │
│  Key Capabilities:                                          │
│  ├─ Preservation: Keeps all object versions automatically   │
│  ├─ Retrieval: Access any previous version by Version ID    │
│  └─ Restoration: Recover deleted or overwritten objects     │
│                                                             │
│  Version Lifecycle Example:                                 │
│                                                             │
│  T1: PUT file.txt (v1)                                      │
│  ├─ Version ID: abc123                                      │
│  ├─ Content: "Hello World"                                  │
│  └─ Current version: v1                                     │
│                                                             │
│  T2: PUT file.txt (v2) - Overwrites                         │
│  ├─ Version ID: def456                                      │
│  ├─ Content: "Hello AWS"                                    │
│  ├─ Current version: v2                                     │
│  └─ Previous version v1: Preserved (not deleted)            │
│                                                             │
│  T3: DELETE file.txt - Soft Delete                          │
│  ├─ Delete marker: ghi789                                   │
│  ├─ Current version: Delete marker                          │
│  └─ All previous versions: Still preserved                  │
│                                                             │
│  Note: Delete marker is a placeholder (not actual data)     │
│        that makes object appear deleted while preserving    │
│        all versions. Remove marker to restore the object.   │
│                                                             │
│  Retrieval Operations:                                      │
│  ├─ GET file.txt → 404 (delete marker active)               │
│  ├─ GET file.txt?versionId=def456 → "Hello AWS" (v2)        │
│  ├─ GET file.txt?versionId=abc123 → "Hello World" (v1)      │
│  └─ DELETE delete marker → Restores latest version          │
│                                                             │
│  Use Cases:                                                 │
│  ├─ Protect against accidental deletion                     │
│  ├─ Recover from unintended overwrites                      │
│  ├─ Audit and compliance (version history)                  │
│  └─ Rollback to previous object states                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### S3 Lifecycle Policies (Manual Rules)

**S3 Lifecycle Policies** automate the management of objects throughout their lifecycle using time-based rules to transition objects between storage classes or delete them.

```
┌─────────────────────────────────────────────────────────────┐
│              S3 Lifecycle Policies Overview                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  What are Lifecycle Policies?                               │
│  ├─ Time-based automation rules for object management       │
│  ├─ You define what happens after X days                    │
│  ├─ Automatically transitions or deletes objects            │
│  └─ Cost optimization through automatic archiving           │
│                                                             │
│  How They Work:                                             │
│                                                             │
│  Upload Date          Day 0                                 │
│  ┌──────────────────────────────────────────┐               │
│  │  my-file.log                             │               │
│  │  Storage Class: S3 Standard              │               │
│  │  Cost: $$$                               │               │
│  └──────────────────────────────────────────┘               │
│                  │                                          │
│                  │ Lifecycle Rule: After 30 days            │
│                  ▼                                          │
│  Day 30                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │  my-file.log                             │               │
│  │  Storage Class: S3 Standard-IA           │               │
│  │  Cost: $$                                │               │
│  └──────────────────────────────────────────┘               │
│                  │                                          │
│                  │ Lifecycle Rule: After 90 days            │
│                  ▼                                          │
│  Day 90                                                     │
│  ┌──────────────────────────────────────────┐               │
│  │  my-file.log                             │               │
│  │  Storage Class: Glacier Flexible         │               │
│  │  Cost: $                                 │               │
│  └──────────────────────────────────────────┘               │
│                  │                                          │
│                  │ Lifecycle Rule: After 365 days           │
│                  ▼                                          │
│  Day 365                                                    │
│  ┌──────────────────────────────────────────┐               │
│  │  my-file.log                             │               │
│  │  Storage Class: Glacier Deep Archive     │               │
│  │  Cost: ¢                                 │               │
│  └──────────────────────────────────────────┘               │
│                  │                                          │
│                  │ Lifecycle Rule: After 2555 days (7 years)│
│                  ▼                                          │
│  Day 2555                                                   │
│  [Object Deleted]                                           │
│                                                             │
│  Key Point: Transitions happen based on object AGE,         │
│            not access patterns!                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Lifecycle Policy Components

```
┌─────────────────────────────────────────────────────────────┐
│              Lifecycle Policy Structure                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Lifecycle Rule Components:                                 │
│                                                             │
│  1. SCOPE (What objects does this apply to?)                │
│     ├─ Entire bucket: All objects                           │
│     ├─ Prefix filter: "logs/", "temp/", "backups/"          │
│     ├─ Tag filter: Environment=Dev, Type=Archive            │
│     └─ Object size: Min/max size requirements               │
│                                                             │
│  2. ACTIONS (What should happen?)                           │
│                                                             │
│     Transition Actions:                                     │
│     ├─ Move to Standard-IA after X days                     │
│     ├─ Move to Glacier after Y days                         │
│     └─ Move to Deep Archive after Z days                    │
│                                                             │
│     Expiration Actions:                                     │
│     ├─ Delete objects after X days                          │
│     ├─ Delete incomplete multipart uploads after Y days     │
│     └─ Delete expired object delete markers                 │
│                                                             │
│  3. TIMELINE (When should it happen?)                       │
│     ├─ Days since object creation                           │
│     ├─ Days since last modification (for versioned objects) │
│     └─ Specific date (for one-time transitions)             │
│                                                             │
│  Example Rule Configuration:                                │
│  {                                                          │
│    "Rules": [{                                              │
│      "Id": "Archive-Application-Logs",                      │
│      "Status": "Enabled",                                   │
│      "Filter": {                                            │
│        "Prefix": "logs/app/",                               │
│        "Tags": [{                                           │
│          "Key": "Archive",                                  │
│          "Value": "true"                                    │
│        }]                                                   │
│      },                                                     │
│      "Transitions": [                                       │
│        {                                                    │
│          "Days": 30,                                        │
│          "StorageClass": "STANDARD_IA"                      │
│        },                                                   │
│        {                                                    │
│          "Days": 90,                                        │
│          "StorageClass": "GLACIER"                          │
│        }                                                    │
│      ],                                                     │
│      "Expiration": {                                        │
│        "Days": 365                                          │
│      }                                                      │
│    }]                                                       │
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Lifecycle vs Intelligent-Tiering

```
┌─────────────────────────────────────────────────────────────┐
│      S3 Lifecycle Policies vs S3 Intelligent-Tiering        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  LIFECYCLE POLICIES (Time-Based)                     │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  What triggers transitions?                          │   │
│  │  └─> Object AGE (days since creation)                │   │
│  │                                                      │   │
│  │  How do you configure it?                            │   │
│  │  └─> YOU define rules manually                       │   │
│  │                                                      │   │
│  │  Example scenario:                                   │   │
│  │  ├─ "All logs older than 30 days → Standard-IA"      │   │
│  │  ├─ "All logs older than 90 days → Glacier"          │   │
│  │  └─ Transitions happen on DAY 30 and DAY 90          │   │
│  │     regardless of whether the log was accessed       │   │
│  │                                                      │   │
│  │  Best for:                                           │   │
│  │  ├─ Predictable access patterns                      │   │
│  │  ├─ Data that naturally ages (logs, backups)         │   │
│  │  ├─ Compliance requirements (7-year retention)       │   │
│  │  └─ Known lifecycle (active 30 days, archive after)  │   │
│  │                                                      │   │
│  │  Costs:                                              │   │
│  │  ├─ No lifecycle management fees                     │   │
│  │  └─ You pay for each storage class used              │   │
│  │                                                      │   │
│  │  Control:                                            │   │
│  │  └─> YOU decide transition timing                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  INTELLIGENT-TIERING (Access-Based)                  │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  What triggers transitions?                          │   │
│  │  └─> ACTUAL ACCESS PATTERNS (how often accessed)     │   │
│  │                                                      │   │
│  │  How do you configure it?                            │   │
│  │  └─> AWS monitors and optimizes automatically        │   │
│  │                                                      │   │
│  │  Example scenario:                                   │   │
│  │  ├─ File uploaded on Day 0                           │   │
│  │  ├─ Accessed frequently Days 1-20 → Frequent tier    │   │
│  │  ├─ Not accessed Days 21-50 → Infrequent tier        │   │
│  │  ├─ Accessed again on Day 51 → Back to Frequent      │   │
│  │  └─ Transitions based on ACTUAL usage, not age       │   │
│  │                                                      │   │
│  │  Best for:                                           │   │
│  │  ├─ Unpredictable access patterns                    │   │
│  │  ├─ Unknown usage (data lakes, user content)         │   │
│  │  ├─ Mixed workloads (some hot, some cold)            │   │
│  │  └─ "Set it and forget it" optimization              │   │
│  │                                                      │   │
│  │  Costs:                                              │   │
│  │  ├─ Small monitoring fee (~$0.0025 per 1000 objects) │   │
│  │  ├─ No retrieval fees (unlike manual tiers)          │   │
│  │  └─ AWS automatically picks cheapest tier            │   │
│  │                                                      │   │
│  │  Control:                                            │   │
│  │  └─> AWS decides based on access behavior            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  CAN YOU USE BOTH?                                          │
│                                                             │
│  Yes! Common pattern:                                       │
│                                                             │
│  Day 0-30: S3 Standard (frequent access expected)           │
│      ↓                                                      │
│  Lifecycle Rule: After 30 days → Intelligent-Tiering        │
│      ↓                                                      │
│  Day 30+: Intelligent-Tiering monitors and optimizes        │
│  ├─ If accessed often → Frequent tier                       │
│  ├─ If not accessed 30 days → Infrequent tier               │
│  └─ If not accessed 90 days → Archive tier                  │
│                                                             │
│  This combines:                                             │
│  • Known early lifecycle (first 30 days = active)           │
│  • Unknown long-term pattern (AWS optimizes after)          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Lifecycle Policy Best Practices

```
┌─────────────────────────────────────────────────────────────┐
│              Lifecycle Policy Best Practices                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Understand Your Access Pattern First                    │
│     ├─ Known pattern → Use Lifecycle Policies               │
│     └─ Unknown pattern → Use Intelligent-Tiering            │
│                                                             │
│  2. Avoid Premature Transitions                             │
│     ├─ Don't transition to IA before 30 days                │
│     ├─ Objects deleted before 30 days still charged for 30  │
│     └─ Small objects (<128 KB) charged as 128 KB in IA/Glacier
│                                                             │
│  3. Use Filters Wisely                                      │
│     ├─ Prefix: Organize by lifecycle (logs/, temp/, etc.)   │
│     ├─ Tags: Mark objects for specific lifecycle treatment  │
│     └─ Size: Prevent small object transitions (cost-inefficient)
│                                                             │
│  4. Test Before Production                                  │
│     ├─ Use lifecycle analysis tools                         │
│     ├─ Monitor costs after implementing rules               │
│     └─ Adjust based on actual usage patterns                │
│                                                             │
│  5. Clean Up Incomplete Uploads                             │
│     ├─ Always include multipart upload expiration           │
│     ├─ Recommended: Delete after 7 days                     │
│     └─ Prevents hidden storage costs                        │
│                                                             │
│  6. Manage Versioned Objects                                │
│     ├─ Separate rules for current vs non-current versions   │
│     ├─ Expire old versions aggressively                     │
│     └─ Remove expired delete markers                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### S3 Object Lock

**S3 Object Lock** enables Write Once Read Many (WORM) functionality, preventing object deletion or modification for a specified retention period. This is critical for regulatory compliance and data protection.

```
┌─────────────────────────────────────────────────────────────┐
│              S3 Object Lock                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  What is Object Lock?                                       │
│  ├─ WORM (Write Once Read Many) model                       │
│  ├─ Prevents object deletion or overwrite                   │
│  ├─ Must be enabled at bucket creation                      │
│  ├─ Works with versioning (automatically enabled)           │
│  └─ Compliance with regulations (SEC, FINRA, HIPAA)         │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Retention Modes:                                           │
│                                                             │
│  Governance Mode                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Protection Level: Standard                          │   │
│  │                                                      │   │
│  │  Who can delete?                                     │   │
│  │  ├─ Users with special permissions                   │   │
│  │  │  (s3:BypassGovernanceRetention)                   │   │
│  │  └─ Must explicitly use x-amz-bypass-governance-     │   │
│  │     retention header                                 │   │
│  │                                                      │   │
│  │  Who can change retention?                           │   │
│  │  └─ Users with special permissions can shorten or    │   │
│  │     extend retention period                          │   │
│  │                                                      │   │
│  │  Use Cases:                                          │   │
│  │  ├─ Internal compliance requirements                 │   │
│  │  ├─ Testing WORM functionality before production     │   │
│  │  ├─ Situations requiring override capability         │   │
│  │  └─ Protecting against accidental deletion           │   │
│  │                                                      │   │
│  │  Example:                                            │   │
│  │  You upload a quarterly report with 90-day           │   │
│  │  governance retention. If urgent business need       │   │
│  │  arises, an admin can delete it with proper          │   │
│  │  permissions and explicit bypass flag.               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  Compliance Mode                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Protection Level: Strict (Immutable)                │   │
│  │                                                      │   │
│  │  Who can delete?                                     │   │
│  │  └─ NOBODY - Not even root account                   │   │
│  │                                                      │   │
│  │  Who can change retention?                           │   │
│  │  ├─ Can ONLY extend retention period                 │   │
│  │  └─ Cannot shorten or remove retention               │   │
│  │                                                      │   │
│  │  Use Cases:                                          │   │
│  │  ├─ Regulatory compliance (SEC Rule 17a-4)           │   │
│  │  ├─ Financial records (FINRA requirements)           │   │
│  │  ├─ Healthcare records (HIPAA)                       │   │
│  │  ├─ Legal hold scenarios                             │   │
│  │  └─ Any strict data retention requirement            │   │
│  │                                                      │   │
│  │  Example:                                            │   │
│  │  A bank uploads transaction records with 7-year      │   │
│  │  compliance retention. These records cannot be       │   │
│  │  deleted or modified by anyone until the 7 years     │   │
│  │  expire - guaranteed immutability.                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Retention Period:                                          │
│  ├─ Specified in days or years                              │
│  ├─ Applied to individual object versions                   │
│  ├─ Can be set at upload time or after                      │
│  ├─ Default retention can be configured on bucket           │
│  └─ Countdown starts from object creation timestamp         │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Legal Hold:                                                │
│                                                             │
│  What is a Legal Hold?                                      │
│  ├─ Independent lock separate from retention period         │
│  ├─ No expiration date (indefinite protection)              │
│  ├─ Can be applied/removed at any time                      │
│  ├─ Requires s3:PutObjectLegalHold permission               │
│  └─ Works with or without retention period                  │
│                                                             │
│  Legal Hold vs Retention:                                   │
│  ┌────────────────┬────────────────┬──────────────────────┐ │
│  │                │ Retention Mode │ Legal Hold           │ │
│  ├────────────────┼────────────────┼──────────────────────┤ │
│  │ Duration       │ Fixed period   │ Indefinite           │ │
│  │ Expiration     │ Automatic      │ Manual removal       │ │
│  │ Use Case       │ Compliance     │ Litigation, audits   │ │
│  │ Can remove?    │ No (Compliance)│ Yes (with permission)│ │
│  └────────────────┴────────────────┴──────────────────────┘ │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Enabling Object Lock:                                      │
│                                                             │
│  Creating Bucket with Object Lock:                          │
│  $ aws s3api create-bucket \                                │
│    --bucket my-locked-bucket \                              │
│    --object-lock-enabled-for-bucket                         │
│                                                             │
│  Setting Default Retention on Bucket:                       │
│  $ aws s3api put-object-lock-configuration \                │
│    --bucket my-locked-bucket \                              │
│    --object-lock-configuration '{                           │
│      "ObjectLockEnabled": "Enabled",                        │
│      "Rule": {                                              │
│        "DefaultRetention": {                                │
│          "Mode": "COMPLIANCE",                              │
│          "Days": 2555                                       │
│        }                                                    │
│      }                                                      │
│    }'                                                       │
│                                                             │
│  Uploading with Object Lock:                                │
│  $ aws s3api put-object \                                   │
│    --bucket my-locked-bucket \                              │
│    --key report.pdf \                                       │
│    --body report.pdf \                                      │
│    --object-lock-mode COMPLIANCE \                          │
│    --object-lock-retain-until-date 2032-01-01T00:00:00Z     │
│                                                             │
│  Applying Legal Hold:                                       │
│  $ aws s3api put-object-legal-hold \                        │
│    --bucket my-locked-bucket \                              │
│    --key contract.pdf \                                     │
│    --legal-hold Status=ON                                   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Important Considerations:                                  │
│                                                             │
│  1. Cannot Enable on Existing Buckets                       │
│     └─ Object Lock must be enabled at bucket creation       │
│                                                             │
│  2. Versioning Required                                     │
│     └─ Automatically enabled with Object Lock               │
│                                                             │
│  3. Retention Applies Per Version                           │
│     └─ Each object version can have different retention     │
│                                                             │
│  4. Cannot Disable Object Lock                              │
│     └─ Once enabled on bucket, cannot be turned off         │
│                                                             │
│  5. Storage Costs                                           │
│     ├─ You pay for all protected versions                   │
│     └─ Cannot delete to save costs during retention         │
│                                                             │
│  6. Lifecycle Policies                                      │
│     ├─ Cannot delete objects under retention                │
│     └─ Can transition to cheaper storage classes            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### S3 Replication

**S3 Replication** automatically copies objects between S3 buckets, either across different AWS regions (Cross-Region Replication) or within the same region (Same-Region Replication).

#### How S3 Replication Works

When you enable replication on a source bucket:
1. AWS monitors for new object uploads (PUT, POST, COPY operations)
2. Automatically copies those objects to the destination bucket
3. Preserves metadata, tags, and access control lists
4. Happens asynchronously (typically within minutes)
5. Only replicates objects created after replication is enabled

#### Replication Types

```
┌─────────────────────────────────────────────────────────────┐
│              S3 Replication Types                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Cross-Region Replication (CRR)                             │
│  ┌──────────────────┐         ┌───────────────────┐         │
│  │  Source Bucket   │         │ Destination Bucket│         │
│  │  us-east-1       │─────────│  eu-west-1        │         │
│  │  my-source       │   Auto  │  my-replica       │         │
│  └──────────────────┘   Copy  └───────────────────┘         │
│                                                             │
│  What: Copies objects to a bucket in a different region     │
│  Why: Disaster recovery, compliance, lower latency          │
│                                                             │
│  Use Cases:                                                 │
│  ├─ Compliance: Meet data residency requirements            │
│  ├─ Latency: Serve users closer to their location           │
│  ├─ DR: Protect against regional failures                   │
│  └─ Operational: Maintain copies for compute in other regions
│                                                             │
│  Example: A video streaming company stores original content │
│  in us-east-1 and replicates to eu-west-1 to serve European │
│  customers with lower latency.                              │
│                                                             │
│  Same-Region Replication (SRR)                              │
│  ┌──────────────────┐         ┌───────────────────┐         │
│  │  Source Bucket   │         │ Destination Bucket│         │
│  │  us-east-1       │─────────│  us-east-1        │         │
│  │  prod-data       │   Auto  │  analytics-copy   │         │
│  └──────────────────┘   Copy  └───────────────────┘         │
│                                                             │
│  What: Copies objects to another bucket in the same region  │
│  Why: Log aggregation, test/prod separation, live replication
│                                                             │
│  Use Cases:                                                 │
│  ├─ Log aggregation: Consolidate logs from multiple sources │
│  ├─ Live replication: Keep prod and test data in sync       │
│  ├─ Ownership: Replicate with ownership change              │
│  └─ Compliance: Maintain separate copies under different    │
│      AWS accounts for audit purposes                        │
│                                                             │
│  Example: A financial company replicates production data    │
│  from one account to an analytics account in the same region│
│  to separate operational and analytical workloads.          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Replication vs Backup

Understanding the difference between replication and backup is important:

```
Replication:
├─ Real-time/near real-time copying
├─ Keeps destination in sync with source
├─ Deletes in source can replicate to destination (if configured)
└─ Purpose: Availability, performance, compliance

Backup (S3 Versioning + Lifecycle):
├─ Point-in-time snapshots
├─ Retains historical versions
├─ Protects against accidental deletion (versions preserved)
└─ Purpose: Data recovery, compliance, audit

Best Practice: Use BOTH
├─ Replication: For availability and performance
└─ Versioning + Lifecycle: For backup and recovery
```

### S3 Access Control

```
┌─────────────────────────────────────────────────────────────┐
│              S3 Access Control Mechanisms                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  S3 Block Public Access                                     │
│  ├─ Account-level or bucket-level                           │
│  ├─ Overrides bucket policies and ACLs                      │
│  ├─ Settings:                                               │
│  │  ├─ Block public ACLs                                    │
│  │  ├─ Ignore public ACLs                                   │
│  │  ├─ Block public bucket policies                         │
│  │  └─ Restrict public bucket policies                      │
│  └─ Best practice: Enable for all buckets by default        │
│                                                             │
│  Bucket Policies                                            │
│  ├─ Resource-based JSON policies                            │
│  ├─ Can grant cross-account access                          │
│  └─ Applied at bucket level                                 │
│                                                             │
│  IAM Policies                                               │
│  ├─ Attached to IAM users/roles                             │
│  └─ Controls what actions identity can perform              │
│                                                             │
│  S3 Access Points                                           │
│  ├─ Named endpoints with dedicated policies                 │
│  ├─ Simplifies managing access to shared datasets           │
│  └─ Each access point has its own DNS and policy            │
│                                                             │
│  ACLs (Legacy - Not Recommended)                            │
│  ├─ Object-level or bucket-level                            │
│  └─ Use bucket policies instead                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Protection

```
┌─────────────────────────────────────────────────────────────┐
│                   S3 Data Protection                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Data in Transit                                            │
│  ├─ Use SSL/TLS encryption                                  │
│  ├─ HTTPS endpoints                                         │
│  └─ Client-side encryption before upload                    │
│                                                             │
│  Data at Rest - Server-Side Encryption (SSE)                │
│                                                             │
│  SSE-S3 (Default)                                           │
│  ├─ AWS-managed keys                                        │
│  ├─ AES-256 encryption                                      │
│  ├─ No additional cost                                      │
│  └─ Automatic key rotation                                  │
│                                                             │
│  SSE-KMS                                                    │
│  ├─ AWS KMS managed keys                                    │
│  ├─ Fine-grained access control                             │
│  ├─ Audit trail in CloudTrail                               │
│  └─ Additional KMS costs                                    │
│                                                             │
│  DSSE-KMS (Dual-Layer)                                      │
│  ├─ Two layers of encryption with KMS                       │
│  ├─ Enhanced security compliance                            │
│  └─ Additional KMS costs apply                              │
│                                                             │
│  SSE-C (Customer-Provided Keys)                             │
│  ├─ Customer manages keys                                   │
│  ├─ Must provide key with each request                      │
│  └─ AWS does not store the encryption key                   │
│                                                             │
│  Client-Side Encryption                                     │
│  ├─ Encrypt before uploading to S3                          │
│  ├─ Client manages encryption process                       │
│  ├─ Client manages keys                                     │
│  └─ S3 stores encrypted data                                │
│                                                             │
│  VPC Endpoints                                              │
│  ├─ Private connection to S3 from VPC                       │
│  ├─ Traffic doesn't traverse internet                       │
│  ├─ Enhanced security and performance                       │
│  └─ No data transfer charges for same region                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### S3 Batch Operations

**S3 Batch Operations** enables you to perform large-scale batch operations on S3 objects with a single request, providing a managed, audited, and serverless way to manage data at scale.

```
┌─────────────────────────────────────────────────────────────┐
│              S3 Batch Operations                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  What are S3 Batch Operations?                              │
│  ├─ Managed service for large-scale S3 object operations    │
│  ├─ Process billions of objects with single API call        │
│  ├─ Built-in retry and tracking mechanisms                  │
│  ├─ Generates completion reports                            │
│  └─ Serverless - no infrastructure to manage                │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  How It Works:                                              │
│                                                             │
│  1. CREATE MANIFEST (List of objects to process)            │
│     ├─ S3 Inventory report (recommended)                    │
│     ├─ CSV file with bucket and object keys                 │
│     └─ S3 Select query results                              │
│                                                             │
│  2. CREATE BATCH JOB                                        │
│     ├─ Specify operation to perform                         │
│     ├─ Reference manifest file                              │
│     ├─ Set priority (1-2147483647)                          │
│     └─ Configure completion report                          │
│                                                             │
│  3. REVIEW & CONFIRM                                        │
│     ├─ AWS estimates scope and cost                         │
│     ├─ Review objects to be processed                       │
│     └─ Confirm to start job                                 │
│                                                             │
│  4. EXECUTE                                                 │
│     ├─ AWS processes objects in parallel                    │
│     ├─ Automatic retries on failures                        │
│     ├─ Track progress in real-time                          │
│     └─ Generates completion report                          │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Supported Operations:                                      │
│                                                             │
│  1. Copy Objects                                            │
│     ├─ Copy objects to different bucket                     │
│     ├─ Copy within same bucket (rename via prefix)          │
│     ├─ Change storage class during copy                     │
│     └─ Modify metadata during copy                          │
│                                                             │
│  2. Invoke Lambda Function                                  │
│     ├─ Custom processing for each object                    │
│     ├─ Supports any Lambda-based transformation             │
│     ├─ Examples: Image processing, data validation          │
│     └─ Max function timeout: 15 minutes per object          │
│                                                             │
│  3. Replace Access Control List (ACL)                       │
│     ├─ Set ACLs on multiple objects                         │
│     └─ Use canned ACLs (private, public-read, etc.)         │
│                                                             │
│  4. Replace Object Tagging                                  │
│     ├─ Add/replace tags on multiple objects                 │
│     ├─ Remove all tags (empty tag set)                      │
│     └─ Useful for lifecycle or access policies              │
│                                                             │
│  5. Delete All Object Tags                                  │
│     └─ Remove all tags from specified objects               │
│                                                             │
│  6. Restore Objects from Glacier                            │
│     ├─ Restore archived objects in bulk                     │
│     ├─ Specify retrieval tier (Expedited/Standard/Bulk)     │
│     └─ Set restoration duration (days)                      │
│                                                             │
│  7. Object Lock Retention                                   │
│     ├─ Apply retention settings to multiple objects         │
│     ├─ Set retention mode and date                          │
│     └─ Apply legal hold                                     │
│                                                             │
│  8. Initiate Object Integrity Check                         │
│     └─ Verify checksums for data integrity                  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Benefits Over Manual Operations:                           │
│  ├─ Automatic retry on transient failures                   │
│  ├─ Built-in progress tracking and reporting                │
│  ├─ No need to manage worker infrastructure                 │
│  ├─ Cost-effective for large-scale operations               │
│  ├─ Audit trail via completion reports                      │
│  └─ Parallel processing for faster completion               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### S3 Access Logs

**S3 Server Access Logging** provides detailed records for requests made to your S3 bucket, essential for security audits, compliance, and understanding access patterns.

```
┌─────────────────────────────────────────────────────────────┐
│              S3 Server Access Logging                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  What are S3 Access Logs?                                   │
│  ├─ Detailed records of requests made to S3 bucket          │
│  ├─ Delivered as log files to a target S3 bucket            │
│  ├─ Best-effort delivery (not guaranteed)                   │
│  ├─ Logs delivered within a few hours of request            │
│  └─ No additional charge (only storage costs)               │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Enabling Access Logging:                                   │
│                                                             │
│  Prerequisites:                                             │
│  1. Create target bucket for storing logs                   │
│  2. Grant S3 Log Delivery Group write access to target      │
│                                                             │
│  Using AWS CLI:                                             │
│  $ aws s3api put-bucket-logging \                           │
│    --bucket my-source-bucket \                              │
│    --bucket-logging-status '{                               │
│      "LoggingEnabled": {                                    │
│        "TargetBucket": "my-log-bucket",                     │
│        "TargetPrefix": "logs/my-source-bucket/"             │
│      }                                                      │
│    }'                                                       │
│                                                             │
│  Target Bucket ACL (Grant to Log Delivery Group):           │
│  $ aws s3api put-bucket-acl \                               │
│    --bucket my-log-bucket \                                 │
│    --grant-write URI=http://acs.amazonaws.com/groups/s3/LogDelivery \
│    --grant-read-acp URI=http://acs.amazonaws.com/groups/s3/LogDelivery
│                                                             │
│  Using Bucket Policy (Recommended):                         │
│  {                                                          │
│    "Version": "2012-10-17",                                 │
│    "Statement": [{                                          │
│      "Sid": "S3ServerAccessLogsPolicy",                     │
│      "Effect": "Allow",                                     │
│      "Principal": {                                         │
│        "Service": "logging.s3.amazonaws.com"                │
│      },                                                     │
│      "Action": "s3:PutObject",                              │
│      "Resource": "arn:aws:s3:::my-log-bucket/*"             │
│    }]                                                       │
│  }                                                          │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Access Logs vs CloudTrail:                                 │
│                                                             │
│  S3 Server Access Logs:                                     │
│  ├─ Scope: Object-level operations (GET, PUT, DELETE)       │
│  ├─ Granularity: Every request to objects                   │
│  ├─ Delivery: Best-effort, hours delay                      │
│  ├─ Cost: Free (only storage costs)                         │
│  ├─ Format: Space-delimited log files                       │
│  └─ Use: High-volume request tracking, analytics            │
│                                                             │
│  AWS CloudTrail:                                            │
│  ├─ Scope: API calls (bucket-level and object-level)        │
│  ├─ Granularity: Management events + data events (opt-in)   │
│  ├─ Delivery: Typically within 15 minutes                   │
│  ├─ Cost: Charged per event recorded                        │
│  ├─ Format: JSON log files                                  │
│  └─ Use: Security auditing, compliance, who-did-what        │
│                                                             │
│  Recommendation: Use BOTH                                   │
│  ├─ CloudTrail: Who made what API calls (security)          │
│  └─ Access Logs: Detailed object access patterns (analytics)│
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Important Limitations:                                     │
│  ├─ Best-effort delivery (not 100% guaranteed)              │
│  ├─ Logs not delivered in real-time (hours delay)           │
│  ├─ Cannot filter which requests to log (all or nothing)    │
│  ├─ Log delivery may be out of chronological order          │
│  └─ Same-bucket logging creates infinite loop (don't do it!)│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### S3 Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│              S3 Performance Best Practices                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  S3 Transfer Acceleration                                   │
│  ├─ Uses CloudFront edge locations                          │
│  ├─ Faster uploads over long distances                      │
│  └─ URL: bucket.s3-accelerate.amazonaws.com                 │
│                                                             │
│  Multipart Upload                                           │
│  ├─ Required for objects >5 GB                              │
│  ├─ Recommended for objects >100 MB                         │
│  ├─ Upload parts in parallel                                │
│  └─ Resume failed uploads                                   │
│                                                             │
│  Byte-Range Fetches                                         │
│  ├─ Download specific byte ranges                           │
│  ├─ Parallelize downloads                                   │
│  └─ Resume failed downloads                                 │
│                                                             │
│  S3 Select                                                  │
│  ├─ Retrieve subset of data using SQL                       │
│  ├─ Filter on server side                                   │
│  └─ Reduce data transfer and cost                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Summary

**Key Takeaways:**

1. **EBS** provides high-performance block storage for EC2 instances
2. **EBS Snapshots** enable incremental backups stored in S3
3. **EFS** offers shared file storage accessible from multiple instances
4. **S3** delivers scalable object storage with multiple storage classes
5. **S3 Versioning** protects against accidental deletion
6. **S3 Object Lock** provides WORM functionality for compliance and data protection
7. **Lifecycle Policies** automate transitions and expirations for cost optimization
8. **S3 Replication** enables cross-region and same-region data replication
9. **S3 Batch Operations** enables large-scale operations on billions of objects
10. **S3 Access Logs** provide detailed audit trails for security and compliance
11. **Storage Classes** provide cost-optimized options based on access patterns
12. **S3 Access Controls** include policies, ACLs, access points, and block public access

**Best Practices:**

- Choose appropriate EBS volume type based on workload (IOPS vs throughput)
- Use EBS snapshots for backups and disaster recovery
- Implement Data Lifecycle Manager for automated snapshot management
- Use EFS for shared file system requirements across multiple instances
- Enable S3 versioning for critical data
- Use S3 Object Lock for regulatory compliance and WORM requirements
- Implement S3 lifecycle policies to optimize storage costs
- Use S3 Intelligent-Tiering for unknown access patterns
- Leverage S3 Batch Operations for large-scale object management
- Enable S3 Access Logs for security auditing and compliance
- Enable S3 Block Public Access by default
- Use S3 Transfer Acceleration for global uploads
- Implement encryption at rest (SSE) and in transit (TLS)
- Monitor storage metrics with CloudWatch
- Use S3 Access Points to simplify access management for shared datasets

