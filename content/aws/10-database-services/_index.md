---
title: Database Services
linkTitle: Database Services
type: docs
weight: 10
prev: /aws/09-systems-management
next: /aws/11-monitoring-observability
---

## Overview

AWS offers a comprehensive portfolio of purpose-built database services designed to support different data models and use cases. Understanding when to use relational databases (RDS, Aurora) versus NoSQL databases (DynamoDB) is fundamental to designing scalable, cost-effective architectures.

## Database Selection

### Database Types Overview

```
┌─────────────────────────────────────────────────────────────┐
│          AWS Database Service Selection                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Relational (SQL)                                           │
│  ├─ Amazon RDS                                              │
│  │  ├─ Engines: MySQL, PostgreSQL, MariaDB, Oracle, SQL     │
│  │  │  Server                                               │
│  │  ├─ Use case: Traditional applications, ACID compliance  │
│  │  └─ Best for: Structured data, complex queries           │
│  │                                                          │
│  └─ Amazon Aurora                                           │
│     ├─ MySQL/PostgreSQL compatible                          │
│     ├─ 5x MySQL performance, 3x PostgreSQL                  │
│     ├─ Use case: High-performance applications              │
│     └─ Best for: Enterprise workloads, scaling needs        │
│                                                             │
│  NoSQL (Non-Relational)                                     │
│  └─ Amazon DynamoDB                                         │
│     ├─ Key-value and document database                      │
│     ├─ Serverless, auto-scaling                             │
│     ├─ Use case: High-scale applications, gaming, IoT       │
│     └─ Best for: Single-digit millisecond latency at scale  │
│                                                             │
│  In-Memory                                                  │
│  └─ Amazon ElastiCache                                      │
│     ├─ Redis or Memcached                                   │
│     ├─ Use case: Caching, session storage, leaderboards     │
│     └─ Best for: Sub-millisecond latency requirements       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Decision Framework

```
┌─────────────────────────────────────────────────────────────┐
│          When to Use Which Database?                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Use RDS/Aurora When:                                       │
│  ├─ Need ACID transactions                                  │
│  ├─ Complex queries with JOINs                              │
│  ├─ Existing application uses relational DB                 │
│  ├─ Structured data with relationships                      │
│  └─ Need strong consistency                                 │
│                                                             │
│  Use DynamoDB When:                                         │
│  ├─ Need single-digit millisecond latency                   │
│  ├─ Massive scale (millions of requests/second)             │
│  ├─ Serverless architecture preferred                       │
│  ├─ Key-value access patterns                               │
│  ├─ Flexible schema requirements                            │
│  └─ Predictable query patterns                              │
│                                                             │
│  Use ElastiCache When:                                      │
│  ├─ Need sub-millisecond latency                            │
│  ├─ Session storage                                         │
│  ├─ Frequently accessed data                                │
│  ├─ Reducing database load                                  │
│  └─ Real-time analytics                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Amazon Relational Database Service (RDS)

### What is Amazon RDS?

**Amazon RDS** is a managed relational database service that automates database administration tasks such as hardware provisioning, database setup, patching, and backups.

### RDS Core Concepts

```
┌─────────────────────────────────────────────────────────────┐
│          RDS Architecture                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  RDS DB Instance                                            │
│  ├─ Database Engine (MySQL, PostgreSQL, etc.)               │
│  ├─ Compute (instance type)                                 │
│  ├─ Storage (EBS volumes)                                   │
│  ├─ Network (VPC, security groups)                          │
│  └─ Backups (automated and manual snapshots)                │
│                                                             │
│  Single-AZ Deployment                                       │
│  ┌──────────────────────────────────────┐                   │
│  │  Availability Zone A                 │                   │
│  │  ┌────────────────────────────────┐  │                   │
│  │  │  RDS Primary Instance          │  │                   │
│  │  │  10.0.1.10                     │  │                   │
│  │  │  ┌──────────────────────────┐  │  │                   │
│  │  │  │  EBS Volume (Storage)    │  │  │                   │
│  │  │  └──────────────────────────┘  │  │                   │
│  │  └────────────────────────────────┘  │                   │
│  └──────────────────────────────────────┘                   │
│                                                             │
│  Use case: Development, testing                             │
│  Risk: Single point of failure                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Multi-AZ Deployment

```
┌─────────────────────────────────────────────────────────────┐
│          RDS Multi-AZ Architecture                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Application connects to: mydb.xxxxx.rds.amazonaws.com      │
│  (DNS endpoint automatically points to primary)             │
│                           │                                 │
│                           ▼                                 │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Availability Zone A                               │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │  RDS Primary Instance                        │  │     │
│  │  │  10.0.1.10 (receives all traffic)            │  │     │
│  │  │  ┌────────────────────────────────────────┐  │  │     │
│  │  │  │  EBS Volume                            │  │  │     │
│  │  │  └────────────────────────────────────────┘  │  │     │
│  │  └───────────────┬──────────────────────────────┘  │     │
│  └──────────────────┼─────────────────────────────────┘     │
│                     │                                       │
│                     │ Synchronous Replication               │
│                     │ (Every write replicated)              │
│                     ▼                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Availability Zone B                                 │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  RDS Standby Instance (Passive)                │  │   │
│  │  │  10.0.2.10 (no traffic normally)               │  │   │
│  │  │  ┌──────────────────────────────────────────┐  │  │   │
│  │  │  │  EBS Volume (Replica)                    │  │  │   │
│  │  │  └──────────────────────────────────────────┘  │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  Automatic Failover:                                        │
│  1. Primary failure detected                                │
│  2. DNS endpoint updated to standby (1-2 minutes)           │
│  3. Standby promoted to primary                             │
│  4. Application reconnects automatically                    │
│                                                             │
│  Benefits:                                                  │
│  ├─ High availability                                       │
│  ├─ Automatic failover                                      │
│  ├─ No data loss (synchronous replication)                  │
│  └─ Minimal downtime during maintenance                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Read Replicas

```
┌─────────────────────────────────────────────────────────────┐
│          RDS Read Replica Architecture                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Write Traffic                 Read Traffic                 │
│       │                             │                       │
│       ▼                             ▼                       │
│  ┌──────────────────┐          ┌────────────────┐           │
│  │  Primary (R/W)   │          │ Read Replica 1 │           │
│  │  us-east-1a      │──────────│  us-east-1b    │           │
│  └──────────────────┘   Async  └────────────────┘           │
│         │               Repl.           │                   │
│         │                               │                   │
│         │                          ┌────▼────────────┐      │
│         │                          │ Read Replica 2  │      │
│         └──────────────────────────│  us-west-2      │      │
│                  Cross-Region      └─────────────────┘      │
│                  Replication                                │
│                                                             │
│  Key Characteristics:                                       │
│  ├─ Asynchronous replication                                │
│  ├─ Up to 15 read replicas per primary                      │
│  ├─ Can be in different regions                             │
│  ├─ Can be promoted to standalone database                  │
│  └─ Separate endpoint for each replica                      │
│                                                             │
│  Use Cases:                                                 │
│  ├─ Scale read-heavy workloads                              │
│  ├─ Run analytics queries without impacting primary         │
│  ├─ Disaster recovery (cross-region replica)                │
│  └─ Low-latency reads in different geographic regions       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### RDS Instance Types

```
┌─────────────────────────────────────────────────────────────┐
│          RDS Instance Class Selection                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  General Purpose (db.t3, db.m6i)                            │
│  ├─ Balanced compute, memory, network                       │
│  ├─ Burstable (T3) for variable workloads                   │
│  └─ Use case: Most applications, dev/test                   │
│                                                             │
│  Memory Optimized (db.r6i, db.x2iedn)                       │
│  ├─ High memory-to-CPU ratio                                │
│  ├─ Best for: In-memory databases, caching                  │
│  └─ Use case: Large datasets, complex queries               │
│                                                             │
│  Burstable Performance (db.t3, db.t4g)                      │
│  ├─ Baseline CPU with burst capability                      │
│  ├─ Most cost-effective                                     │
│  └─ Use case: Development, low-traffic applications         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### RDS Storage Types

```
General Purpose SSD (gp3) - Recommended
├─ Baseline: 3,000 IOPS, 125 MB/s
├─ Configurable performance
├─ Size: 20 GiB - 64 TiB
└─ Use case: Most database workloads

Provisioned IOPS SSD (io1)
├─ Up to 256,000 IOPS
├─ Up to 4,000 MB/s throughput
├─ Size: 100 GiB - 64 TiB
└─ Use case: I/O-intensive, mission-critical workloads

Magnetic (Standard) - Legacy
├─ Lowest cost
├─ Limited performance
└─ Use case: Backward compatibility only
```

### RDS Backup and Recovery

```
┌─────────────────────────────────────────────────────────────┐
│          RDS Backup Strategy                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Automated Backups                                          │
│  ├─ Daily full snapshot                                     │
│  ├─ Transaction logs backed up every 5 minutes              │
│  ├─ Point-in-time recovery (PITR)                           │
│  ├─ Retention: 0-35 days (default: 7 days)                  │
│  ├─ Stored in S3                                            │
│  └─ Deleted when DB instance is deleted                     │
│                                                             │
│  Manual Snapshots                                           │
│  ├─ User-initiated backups                                  │
│  ├─ Retained until manually deleted                         │
│  ├─ Can be shared across accounts                           │
│  └─ Can be copied to other regions                          │
│                                                             │
│  Point-in-Time Recovery                                     │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Timeline                                          │     │
│  │  ──────────────────────────────────────────────    │     │
│  │  Mon    Tue    Wed    Thu    Fri    Sat    Sun     │     │
│  │  │      │      │      │      │      │      │       │     │
│  │  Snap   Snap   Snap   Snap   Snap   Snap   Snap    │     │
│  │                              ▲                     │     │
│  │                              │                     │     │
│  │  Restore to: Thu 2:37 PM ────┘                     │     │
│  │  (Any time within retention period)                │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  Recovery Process:                                          │
│  1. Select restore point (date/time)                        │
│  2. RDS creates new instance from backup                    │
│  3. Applies transaction logs to reach exact time            │
│  4. New instance gets new endpoint                          │
│  5. Update application to use new endpoint                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### RDS Security

```
Network Security
├─ VPC placement (private subnet recommended)
├─ Security groups (port 3306 MySQL, 5432 PostgreSQL)
└─ No public IP for production databases

Encryption
├─ At rest: EBS encryption using KMS
├─ In transit: SSL/TLS connections
├─ Cannot enable encryption on existing unencrypted DB
└─ Must create encrypted snapshot and restore

Access Control
├─ IAM database authentication (MySQL, PostgreSQL)
├─ Native database users and passwords
└─ IAM policies for AWS API actions

Auditing
├─ CloudWatch Logs for database logs
├─ Enhanced Monitoring for OS-level metrics
└─ CloudTrail for API calls
```

### RDS Supported Engines

```
┌─────────────────────────────────────────────────────────────┐
│          RDS Database Engines                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Amazon Aurora (MySQL/PostgreSQL compatible)                │
│  ├─ AWS's proprietary database engine                       │
│  ├─ Covered in detail in next section                       │
│  └─ Best for: High performance, scalability                 │
│                                                             │
│  MySQL                                                      │
│  ├─ Versions: 5.7, 8.0                                      │
│  ├─ Most popular open-source database                       │
│  └─ Use case: Web applications, e-commerce                  │
│                                                             │
│  PostgreSQL                                                 │
│  ├─ Versions: 12, 13, 14, 15, 16                            │
│  ├─ Advanced features, extensibility                        │
│  └─ Use case: Complex queries, data warehouse               │
│                                                             │
│  MariaDB                                                    │
│  ├─ MySQL fork with additional features                     │
│  └─ Use case: MySQL replacement, open-source preference     │
│                                                             │
│  Oracle                                                     │
│  ├─ Editions: SE2, EE, Standard, Standard One               │
│  ├─ Bring Your Own License (BYOL) or License Included       │
│  └─ Use case: Enterprise applications, migrations           │
│                                                             │
│  SQL Server                                                 │
│  ├─ Editions: Express, Web, Standard, Enterprise            │
│  ├─ License Included or BYOL                                │
│  └─ Use case: .NET applications, Windows environments       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Amazon Aurora

### What is Amazon Aurora?

**Amazon Aurora** is a MySQL and PostgreSQL-compatible relational database built for the cloud, combining the performance and availability of commercial databases with the simplicity and cost-effectiveness of open-source databases.

### Aurora Architecture

```
┌─────────────────────────────────────────────────────────────┐
│          Aurora Cluster Architecture                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                  Cluster Endpoint                           │
│                  (Write traffic)                            │
│                        │                                    │
│                        ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Primary Instance (Writer)                           │   │
│  │  Availability Zone A                                 │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│                   │ Replicate                               │
│                   │                                         │
│       ┌───────────┼───────────┬─────────────┐               │
│       │           │           │             │               │
│       ▼           ▼           ▼             ▼               │
│  ┌────────┐  ┌────────┐  ┌────────┐   ┌────────┐            │
│  │Reader 1│  │Reader 2│  │Reader 3│   │Reader 4│            │
│  │  AZ-A  │  │  AZ-B  │  │  AZ-C  │   │  AZ-A  │            │
│  └────────┘  └────────┘  └────────┘   └────────┘            │
│                                                             │
│       └───────────┬───────────┴─────────────┘               │
│                   │                                         │
│              Reader Endpoint                                │
│          (Load balanced reads)                              │
│                                                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Shared Storage Volume                             │     │
│  │  (Auto-scales up to 128 TiB)                       │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │  6 copies across 3 AZs                       │  │     │
│  │  │  Self-healing, auto-repair                   │  │     │
│  │  └──────────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Aurora Key Features

```
┌─────────────────────────────────────────────────────────────┐
│          Aurora vs RDS MySQL/PostgreSQL                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Performance                                                │
│  ├─ Aurora MySQL: 5x faster than RDS MySQL                  │
│  ├─ Aurora PostgreSQL: 3x faster than RDS PostgreSQL        │
│  └─ Optimized storage layer                                 │
│                                                             │
│  Storage                                                    │
│  ├─ Auto-scales in 10GB increments (up to 128 TiB)          │
│  ├─ 6 copies across 3 AZs automatically                     │
│  ├─ Self-healing (automatic bad block repair)               │
│  ├─ No storage provisioning needed                          │
│  └─ Only pay for used storage                               │
│                                                             │
│  High Availability                                          │
│  ├─ Up to 15 read replicas                                  │
│  ├─ Sub-10ms replica lag                                    │
│  ├─ Automatic failover (<30 seconds)                        │
│  └─ Multi-AZ by default                                     │
│                                                             │
│  Endpoints                                                  │
│  ├─ Cluster endpoint: Connects to primary (writes)          │
│  ├─ Reader endpoint: Load balances across read replicas     │
│  ├─ Custom endpoint: User-defined replica groups            │
│  └─ Instance endpoint: Direct connection to specific instance
│                                                             │
│  Backups                                                    │
│  ├─ Continuous backup to S3                                 │
│  ├─ Point-in-time recovery (1 sec granularity)              │
│  ├─ No performance impact during backups                    │
│  └─ Retention: Up to 35 days                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Aurora Serverless

```
┌─────────────────────────────────────────────────────────────┐
│          Aurora Serverless                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  On-Demand Auto-Scaling Database                            │
│                                                             │
│  Capacity Units (ACUs)                                      │
│  ├─ Configure min and max ACUs                              │
│  ├─ Aurora automatically scales between limits              │
│  ├─ Scales based on database load                           │
│  └─ 1 ACU = 2 GB RAM + corresponding CPU/networking         │
│                                                             │
│  ┌───────────────────────────────────────────────────┐      │
│  │  Database Activity Over Time                      │      │
│  │                                                   │      │
│  │  ACU                                              │      │
│  │  64 ──┐                                           │      │
│  │       │                      ┌───┐                │      │
│  │  32 ──┤                      │   │                │      │
│  │       │         ┌────────────┘   └──────┐         │      │
│  │  16 ──┤    ┌────┘                       │         │      │
│  │       │    │                            │         │      │
│  │   8 ──┼────┘                            └─────────│      │
│  │       │                                           │      │
│  │   0 ──┴───────────────────────────────────────────┘      │
│  │       Time →                                      │      │
│  │                                                   │      │
│  │  Auto-scales up during peak, down during low load │      │
│  │  Can pause when idle (no charges for compute)     │      │
│  └───────────────────────────────────────────────────┘      │
│                                                             │
│  Use Cases:                                                 │
│  ├─ Infrequently used applications                          │
│  ├─ Variable or unpredictable workloads                     │
│  ├─ Development and test databases                          │
│  ├─ Multi-tenant applications                               │
│  └─ New applications with unknown demand                    │
│                                                             │
│  Pricing:                                                   │
│  ├─ Pay per second for ACUs used                            │
│  ├─ Pay for storage (GB-month)                              │
│  └─ No charges when database is paused                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Aurora Global Database

```
┌─────────────────────────────────────────────────────────────┐
│          Aurora Global Database                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Primary Region: us-east-1                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Primary Cluster (Read/Write)                        │   │
│  │  ├─ 1 Primary Instance                               │   │
│  │  └─ Up to 15 Read Replicas                           │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│                   │ Physical Replication                    │
│                   │ (<1 second lag typically)               │
│                   │                                         │
│       ┌───────────┴────────────┬───────────────────┐        │
│       │                        │                   │        │
│       ▼                        ▼                   ▼        │
│  Secondary Region 1      Secondary Region 2   Secondary...  │
│  (eu-west-1)             (ap-south-1)                       │
│  ┌──────────────────┐   ┌──────────────────┐                │
│  │  Read-Only       │   │  Read-Only       │                │
│  │  Cluster         │   │  Cluster         │                │
│  │  ├─ 0-15 Replicas│   │  ├─ 0-15 Replicas│                │
│  │  └─ Serve local  │   │  └─ Serve local  │                │
│  │    read traffic  │   │    read traffic  │                │
│  └──────────────────┘   └──────────────────┘                │
│                                                             │
│  Benefits:                                                  │
│  ├─ Low latency global reads                                │
│  ├─ Fast cross-region disaster recovery (<1 minute RTO)     │
│  ├─ Up to 5 secondary regions                               │
│  ├─ Dedicated storage layer in each region                  │
│  └─ Can promote secondary to primary for DR                 │
│                                                             │
│  Use Cases:                                                 │
│  ├─ Globally distributed applications                       │
│  ├─ Disaster recovery with minimal data loss                │
│  ├─ Reduce read latency worldwide                           │
│  └─ Business continuity planning                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Amazon DynamoDB

### What is DynamoDB?

**Amazon DynamoDB** is a fully managed, serverless NoSQL database service designed for applications requiring single-digit millisecond latency at any scale. It automatically scales throughput and storage based on application needs.

### DynamoDB Core Concepts

```
┌─────────────────────────────────────────────────────────────┐
│          DynamoDB Data Model                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Table: Users                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Partition Key: UserID (Required)                   │    │
│  │  Sort Key: Timestamp (Optional)                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Items (Rows):                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ UserID    Timestamp    Name      Email      Age      │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ "123"     1234567890   "Alice"   "a@..."    28       │   │
│  │ "456"     1234567891   "Bob"     "b@..."    32       │   │
│  │ "789"     1234567892   "Charlie" "c@..."    —        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  Key Points:                                                │
│  ├─ Schema-less (flexible attributes per item)              │
│  ├─ Each item can have different attributes                 │
│  ├─ Partition key uniquely identifies item                  │
│  ├─ Sort key (optional) enables range queries               │
│  └─ Maximum item size: 400 KB                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### DynamoDB Keys and Indexes

```
┌─────────────────────────────────────────────────────────────┐
│          Primary Key Types                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Partition Key Only (Simple Primary Key)                    │
│  ├─ Single attribute as unique identifier                   │
│  ├─ Example: UserID                                         │
│  └─ Query pattern: Get item by UserID                       │
│                                                             │
│  Partition Key + Sort Key (Composite Primary Key)           │
│  ├─ Two attributes together form unique identifier          │
│  ├─ Example: UserID (partition) + OrderDate (sort)          │
│  └─ Query pattern:                                          │
│     • Get all orders for UserID                             │
│     • Get orders for UserID between dates                   │
│     • Get latest order for UserID                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────┐
│          Secondary Indexes                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Global Secondary Index (GSI)                               │
│  ├─ Different partition key and/or sort key from table      │
│  ├─ Spans all partitions in table                           │
│  ├─ Eventually consistent reads                             │
│  ├─ Can be created after table creation                     │
│  ├─ Has own throughput settings                             │
│  └─ Example: Query users by email instead of UserID         │
│                                                             │
│  Local Secondary Index (LSI)                                │
│  ├─ Same partition key, different sort key                  │
│  ├─ Scoped to partition                                     │
│  ├─ Strongly consistent or eventually consistent reads      │
│  ├─ Must be created at table creation time                  │
│  ├─ Shares throughput with base table                       │
│  └─ Example: Query orders by UserID and status              │
│                                                             │
│  Base Table: Orders                                         │
│  PK: UserID, SK: OrderDate                                  │
│                                                             │
│  GSI: Orders-by-Status                                      │
│  PK: Status, SK: OrderDate                                  │
│  └─ Query all pending orders                                │
│                                                             │
│  LSI: Orders-by-Total                                       │
│  PK: UserID, SK: TotalAmount                                │
│  └─ Query user's highest value orders                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### DynamoDB Capacity Modes

```
┌─────────────────────────────────────────────────────────────┐
│          Capacity Modes                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  On-Demand Mode                                             │
│  ├─ Pay per request                                         │
│  ├─ No capacity planning needed                             │
│  ├─ Automatically scales to workload                        │
│  ├─ Pricing: $1.25 per million write requests               │
│  │            $0.25 per million read requests               │
│  └─ Use case: Unpredictable traffic, new applications       │
│                                                             │
│  Provisioned Mode                                           │
│  ├─ Specify read/write capacity units                       │
│  ├─ RCU (Read Capacity Unit):                               │
│  │  • 1 strongly consistent read/sec for 4 KB item          │
│  │  • 2 eventually consistent reads/sec for 4 KB item       │
│  ├─ WCU (Write Capacity Unit):                              │
│  │  • 1 write/sec for 1 KB item                             │
│  ├─ Auto Scaling available                                  │
│  ├─ Reserved Capacity for cost savings                      │
│  └─ Use case: Predictable traffic, cost optimization        │
│                                                             │
│  Capacity Calculation Example:                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Application needs:                                │     │
│  │  • 80 reads/sec of 3 KB items (strong consistency) │     │
│  │  • 50 writes/sec of 2 KB items                     │     │
│  │                                                    │     │
│  │  Calculation:                                      │     │
│  │  Reads: (80 * 4KB) / 4KB = 80 RCUs                 │     │
│  │  Writes: (50 * 2KB) / 1KB = 100 WCUs               │     │
│  │                                                    │     │
│  │  Provision: 80 RCUs, 100 WCUs                      │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### DynamoDB Streams

```
┌─────────────────────────────────────────────────────────────┐
│          DynamoDB Streams                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Ordered stream of item-level changes                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  DynamoDB Table: Orders                              │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│                   │ Write/Update/Delete                     │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  DynamoDB Stream                                     │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ Record 1: INSERT Order (#123)                  │  │   │
│  │  │ Record 2: UPDATE Order (#123) (status=shipped) │  │   │
│  │  │ Record 3: INSERT Order (#123)                  │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│                   │ Trigger                                 │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Lambda Function                                     │   │
│  │  ├─ Process order changes                            │   │
│  │  ├─ Send notifications                               │   │
│  │  ├─ Update analytics                                 │   │
│  │  └─ Replicate to another table/region                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  Stream View Types:                                         │
│  ├─ KEYS_ONLY: Only key attributes                          │
│  ├─ NEW_IMAGE: Entire item after modification               │
│  ├─ OLD_IMAGE: Entire item before modification              │
│  └─ NEW_AND_OLD_IMAGES: Both before and after               │
│                                                             │
│  Use Cases:                                                 │
│  ├─ Real-time analytics                                     │
│  ├─ Messaging/notifications                                 │
│  ├─ Data replication                                        │
│  └─ Materialized views                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### DynamoDB Global Tables

```
┌─────────────────────────────────────────────────────────────┐
│          DynamoDB Global Tables                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Multi-Region, Multi-Active Replication                     │
│                                                             │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────┐ │
│  │  us-east-1   │<─────>│  eu-west-1   │<─────>│ap-south-1│ │
│  │  Table Copy  │       │  Table Copy  │       │Table Copy│ │
│  │  (Read/Write)│       │  (Read/Write)│       │(R/W)     │ │
│  └──────────────┘       └──────────────┘       └──────────┘ │
│         ▲                      ▲                      ▲     │
│         │                      │                      │     │
│    Application             Application           Application│
│    (US users)              (EU users)            (Asia users)
│                                                             │
│  Characteristics:                                           │
│  ├─ Multi-region, active-active replication                 │
│  ├─ Typically <1 second replication lag                     │
│  ├─ Last writer wins conflict resolution                    │
│  ├─ Strongly consistent reads within region                 │
│  ├─ Eventually consistent reads across regions              │
│  └─ Automatic failover between regions                      │
│                                                             │
│  Benefits:                                                  │
│  ├─ Low-latency reads/writes globally                       │
│  ├─ Disaster recovery (multi-region redundancy)             │
│  ├─ Business continuity                                     │
│  └─ Improved user experience worldwide                      │
│                                                             │
│  Use Cases:                                                 │
│  ├─ Global applications (gaming, social media)              │
│  ├─ Multi-region active-active                              │
│  └─ Global e-commerce platforms                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### DynamoDB Best Practices

```
┌─────────────────────────────────────────────────────────────┐
│          DynamoDB Best Practices                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Data Modeling                                              │
│  ├─ Design for access patterns first (not entity model)     │
│  ├─ Denormalize data for single-table design                │
│  ├─ Use composite sort keys for flexible queries            │
│  ├─ Avoid hot partitions (distribute load evenly)           │
│  └─ Keep item size under 400 KB                             │
│                                                             │
│  Performance Optimization                                   │
│  ├─ Use GSI for alternate query patterns                    │
│  ├─ Enable DynamoDB Accelerator (DAX) for caching           │
│  ├─ Use batch operations (BatchGetItem, BatchWriteItem)     │
│  ├─ Implement exponential backoff for throttling            │
│  └─ Use projection expressions to limit returned data       │
│                                                             │
│  Cost Optimization                                          │
│  ├─ Choose on-demand for unpredictable workloads            │
│  ├─ Use provisioned mode with auto-scaling for steady load  │
│  ├─ Archive old data to S3 using TTL                        │
│  ├─ Use sparse indexes to reduce index costs                │
│  └─ Monitor CloudWatch metrics for right-sizing             │
│                                                             │
│  Security                                                   │
│  ├─ Encrypt at rest using KMS                               │
│  ├─ Encrypt in transit using TLS                            │
│  ├─ Use IAM roles for fine-grained access control           │
│  ├─ Enable point-in-time recovery (PITR)                    │
│  └─ Use VPC endpoints for private access                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Amazon ElastiCache

### What is ElastiCache?

**Amazon ElastiCache** is a fully managed in-memory data store and cache service supporting Redis and Memcached engines.

```
┌─────────────────────────────────────────────────────────────┐
│          ElastiCache Use Cases                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Database Caching                                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Application                                         │   │
│  │       │                                              │   │
│  │       ▼                                              │   │
│  │  1. Check ElastiCache                                │   │
│  │       │                                              │   │
│  │       ├─ Cache Hit → Return data (fast)              │   │
│  │       │                                              │   │
│  │       └─ Cache Miss ──┐                              │   │
│  │                       ▼                              │   │
│  │                  2. Query RDS                        │   │
│  │                       │                              │   │
│  │                       ▼                              │   │
│  │                  3. Store in cache                   │   │
│  │                       │                              │   │
│  │                       ▼                              │   │
│  │                  4. Return data                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  Other Use Cases:                                           │
│  ├─ Session storage (user authentication state)             │
│  ├─ Leaderboards (gaming)                                   │
│  ├─ Rate limiting                                           │
│  ├─ Real-time analytics                                     │
│  ├─ Message queues (Redis pub/sub)                          │
│  └─ Geospatial data (Redis)                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

```
Redis vs Memcached

Redis
├─ Advanced data structures (lists, sets, sorted sets, hashes)
├─ Persistence (snapshots, append-only log)
├─ Pub/Sub messaging
├─ Replication (Multi-AZ with automatic failover)
├─ Backup and restore
├─ Geospatial support
└─ Use case: Complex caching, session store, real-time analytics

Memcached
├─ Simple key-value store
├─ Multi-threaded (better CPU utilization)
├─ No persistence
├─ Horizontal scaling (add nodes easily)
├─ Simpler, faster for basic caching
└─ Use case: Simple caching, large cache nodes
```

## Database Comparison Summary

```
┌─────────────────────────────────────────────────────────────┐
│          When to Use Each Database Service                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  RDS                                                        │
│  ├─ Need: SQL, ACID transactions, complex queries           │
│  ├─ Scale: Up to 64 TB, vertical scaling primarily          │
│  └─ Example: E-commerce transactions, ERP systems           │
│                                                             │
│  Aurora                                                     │
│  ├─ Need: RDS benefits + higher performance                 │
│  ├─ Scale: Up to 128 TB, read scaling with replicas         │
│  └─ Example: SaaS applications, high-traffic web apps       │
│                                                             │
│  DynamoDB                                                   │
│  ├─ Need: Massive scale, single-digit ms latency            │
│  ├─ Scale: Unlimited storage, millions of requests/sec      │
│  └─ Example: Gaming, IoT, mobile apps, real-time bidding    │
│                                                             │
│  ElastiCache                                                │
│  ├─ Need: Sub-millisecond latency, reduce DB load           │
│  ├─ Scale: GB to TB of in-memory data                       │
│  └─ Example: Session store, database cache, leaderboards    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Summary

**Key Takeaways:**

1. **RDS** provides managed relational databases with automated backups and Multi-AZ
2. **Aurora** offers 5x MySQL and 3x PostgreSQL performance with auto-scaling storage
3. **Multi-AZ** provides high availability with automatic failover for RDS/Aurora
4. **Read Replicas** enable read scaling and cross-region disaster recovery
5. **DynamoDB** delivers single-digit millisecond performance at any scale
6. **DynamoDB Streams** enable real-time reaction to table changes
7. **Global Tables** provide multi-region, active-active replication
8. **ElastiCache** accelerates applications with in-memory caching

**Best Practices:**

- Use Multi-AZ deployments for production databases
- Implement read replicas to scale read-heavy workloads
- Enable automated backups and test recovery procedures
- Choose DynamoDB for massive scale and microsecond latency requirements
- Use Aurora for applications needing high performance relational databases
- Implement ElastiCache to reduce database load and improve response times
- Design DynamoDB tables around access patterns, not entities
- Monitor database performance metrics in CloudWatch
- Use IAM database authentication where supported
- Encrypt databases at rest and in transit
- Plan capacity based on workload patterns
- Implement proper indexing strategies
