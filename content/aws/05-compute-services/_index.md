---
title: Compute Services
linkTitle: Compute Services
type: docs
weight: 5
prev: /aws/04-edge-and-hybrid-networking
next: /aws/06-load-balancing-and-scaling
---

## Overview

Amazon Elastic Compute Cloud (EC2) is the foundational compute service in AWS, providing resizable virtual servers in the cloud. Understanding EC2 is crucial for building scalable, cost-effective applications in AWS.

## Amazon Elastic Compute Cloud (EC2)

### What is Amazon EC2?

**Amazon EC2** is a web service that provides on-demand, scalable computing capacity in the AWS Cloud. It allows you to obtain and configure virtual servers (instances) in minutes and scale capacity as your computing requirements change.

### EC2 Core Concepts

```
┌─────────────────────────────────────────────────────────────┐
│              EC2 Instance Components                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                 EC2 Instance                          │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Amazon Machine Image (AMI)                     │  │  │
│  │  │  • Operating System (Amazon Linux, Ubuntu, etc.)│  │  │
│  │  │  • Application software                         │  │  │
│  │  │  • Configuration                                │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Instance Type (t3.micro, m5.large, etc.)       │  │  │
│  │  │  • vCPUs                                        │  │  │
│  │  │  • Memory (RAM)                                 │  │  │
│  │  │  • Network performance                          │  │  │
│  │  │  • Storage type                                 │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Storage                                        │  │  │
│  │  │  • EBS Volume (persistent)                      │  │  │
│  │  │  • Instance Store (ephemeral)                   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Networking                                     │  │  │
│  │  │  • Elastic Network Interface (ENI)              │  │  │
│  │  │  • Private IP address                           │  │  │
│  │  │  • Public IP address (optional)                 │  │  │
│  │  │  • Security Groups                              │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Security                                       │  │  │
│  │  │  • Key Pair (SSH/RDP access)                    │  │  │
│  │  │  • IAM Role (AWS API access)                    │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### EC2 Instance Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│              EC2 Instance Lifecycle                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│      ┌──────────┐                                           │
│      │ Pending  │ ← Instance is being launched              │
│      └────┬─────┘                                           │
│           │                                                 │
│           ▼                                                 │
│      ┌──────────┐                                           │
│   ┌─>│ Running  │<─┐ ← Instance is running                  │
│   │  └────┬─────┘  │   • Billed by the second               │
│   │       │        │                                        │
│   │       │ Stop   │ Start                                  │
│   │       ▼        │                                        │
│   │  ┌──────────┐  │                                        │
│   │  │ Stopping │──┘ ← Instance is stopping                 │
│   │  └────┬─────┘                                           │
│   │       │                                                 │
│   │       ▼                                                 │
│   │  ┌──────────┐                                           │
│   └──│ Stopped  │ ← Instance is stopped                     │
│      └────┬─────┘   • No compute charges                    │
│           │         • EBS charges still apply               │
│           │                                                 │
│           │ Terminate                                       │
│           ▼                                                 │
│      ┌──────────┐                                           │
│      │Shutting  │ ← Instance is terminating                 │
│      │  Down    │                                           │
│      └────┬─────┘                                           │
│           │                                                 │
│           ▼                                                 │
│      ┌──────────┐                                           │
│      │Terminated│ ← Instance is terminated                  │
│      └──────────┘   • Resources released                    │
│                     • Cannot be restarted                   │
│                                                             │
│  Additional States:                                         │
│  • Rebooting: Equivalent to OS reboot                       │
│  • Hibernating: Save RAM to EBS, stop instance              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## EC2 Instance Types

### Instance Type Naming Convention

EC2 instance types follow a specific naming pattern:

```
Instance Type: m5.2xlarge
               ││ │
               ││ └─── Size (nano, micro, small, medium, large, xlarge, 2xlarge, etc.)     
               ││
               │└───── Generation (5 = 5th generation)
               │
               └─────── Family (m = General Purpose)

Additional Attributes:
m5a.large  → 'a' = AMD processors
m5g.large  → 'g' = AWS Graviton processors
m5i.large  → 'i' = Intel processors
m5d.large  → 'd' = Instance store volumes
m5n.large  → 'n' = Network optimization
c6b.large  → 'b' = Block storage optimization
r5e.large  → 'e' = Extra storage or memory
z1d.large  → 'z' = High frequency
```

### EC2 Instance Families

```
┌─────────────────────────────────────────────────────────────┐
│              EC2 Instance Families                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  General Purpose (M, T)                                     │
│  ├─ Balanced compute, memory, and networking                │
│  ├─ Use cases: Web servers, small databases, dev/test       │
│  ├─ M7: Latest generation, balanced resources               │
│  ├─ M6: Previous generation                                 │
│  └─ T3/T4: Burstable performance, cost-effective            │
│                                                             │
│  Compute Optimized (C)                                      │
│  ├─ High-performance processors                             │
│  ├─ Use cases: Batch processing, HPC, gaming servers        │
│  ├─ C7: Latest generation                                   │
│  └─ C6: Previous generation                                 │
│                                                             │
│  Memory Optimized (R, X, High Memory u-series)              │
│  ├─ Large amounts of RAM                                    │
│  ├─ Use cases: In-memory databases, big data analytics      │
│  ├─ R7: Latest generation, high memory-to-vCPU ratio        │
│  └─ X2: Lowest cost per GiB of memory                       │
│                                                             │
│  Storage Optimized (I, D, H)                                │
│  ├─ High sequential read/write to local storage             │
│  ├─ Use cases: NoSQL databases, data warehousing            │
│  ├─ I4i: NVMe SSD, high IOPS                                │
│  ├─ D3: Dense HDD storage                                   │
│  └─ H1: High disk throughput                                │
│                                                             │
│  Accelerated Computing (P, G, F, Inf, Trn)                  │
│  ├─ Hardware accelerators (GPUs, FPGAs)                     │
│  ├─ Use cases: ML, graphics rendering, genomics             │
│  ├─ P5: Latest GPU instances for ML training                │
│  ├─ G5: Graphics-intensive applications                     │
│  ├─ Inf2: AWS Inferentia chips for ML inference             │
│  └─ Trn1: AWS Trainium chips for ML training                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Instance Type Selection Guide

```
┌─────────────────────────────────────────────────────────────┐
│          How to Select an Instance Type?                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Identify Business Requirements                          │
│     • What is the application?                              │
│     • Performance requirements (CPU, memory, network)?      │
│     • Storage requirements (IOPS, throughput)?              │
│                                                             │
│  2. Analyze Bottlenecks                                     │
│     • CPU-bound → Compute Optimized (C family)              │
│     • Memory-bound → Memory Optimized (R, X family)         │
│     • I/O-bound → Storage Optimized (I, D family)           │
│     • GPU-bound → Accelerated Computing (P, G family)       │
│                                                             │
│  3. Use AWS Compute Optimizer                               │
│     • Machine learning-based recommendations                │
│     • Analyzes historical resource usage                    │
│     • Suggests optimal instance types                       │
│     • Identifies cost savings opportunities                 │
│                                                             │
│  4. Right-Size Iteratively                                  │
│     • Start with an estimate                                │
│     • Monitor using CloudWatch metrics                      │
│     • Adjust based on actual usage patterns                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Amazon Machine Images (AMIs)

### What is an AMI?

An **Amazon Machine Image (AMI)** is a preconfigured template that contains the operating system, application software, and configuration settings required to launch an EC2 instance.

### AMI Components

```
┌─────────────────────────────────────────────────────────────┐
│              AMI Components                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Root Volume Template                                 │  │
│  │  • Operating system (Linux, Windows)                  │  │
│  │  • Application software                               │  │
│  │  │  Configuration files                               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Launch Permissions                                   │  │
│  │  • Public: Anyone can launch                          │  │
│  │  • Explicit: Specific AWS accounts                    │  │
│  │  • Implicit: Owner account only (private)             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Block Device Mapping                                 │  │
│  │  • Specifies volumes to attach                        │  │
│  │  • EBS snapshots or instance store volumes            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### AMI Types

**By Source:**

```
AWS-Provided AMIs (Quick Start)
├─ Amazon Linux 2023
├─ Amazon Linux 2
├─ Ubuntu Server
├─ Red Hat Enterprise Linux
└─ Windows Server

AWS Marketplace AMIs
├─ Pre-configured third-party software
├─ Commercial and open-source
├─ Examples: WordPress, Docker, databases
└─ May include additional software costs

Community AMIs
├─ Shared by other AWS users
├─ Use with caution (verify source)
└─ Free to use

Custom AMIs (Your Own)
├─ Created from your configured instances
├─ Include your applications and settings
└─ Faster deployments with consistent configuration
```

**By Virtualization Type:**

```
Hardware Virtual Machine (HVM)
├─ Fully virtualized hardware
├─ Better performance
├─ Supports all instance types
└─ Recommended for all new instances

Paravirtual (PV) - Legacy
├─ Older virtualization type
├─ Limited instance type support
└─ Not recommended for new deployments
```

**By Root Device Type:**

```
EBS-Backed AMI
├─ Root volume is an EBS volume
├─ Can be stopped without losing data
├─ Faster boot time
├─ Can change instance type
└─ Recommended

Instance Store-Backed AMI
├─ Root volume is an instance store volume
├─ Data lost if instance stops/terminates
├─ Cannot be stopped (only terminated)
└─ Use case: Temporary processing, caching
```

### Creating a Custom AMI

```
Custom AMI Creation Workflow

Step 1: Launch and Configure Instance
┌────────────────────────────────────┐
│  Launch EC2 from base AMI          │
│  ├─ Install applications           │
│  ├─ Configure settings             │
│  ├─ Apply security updates         │
│  └─ Test configuration             │
└──────────────┬─────────────────────┘
               │
Step 2: Create AMI
               ▼
┌────────────────────────────────────┐
│  Create Image (AMI)                │
│  ├─ Stops instance (EBS-backed)    │
│  ├─ Takes EBS snapshots            │
│  ├─ Registers AMI                  │
│  └─ Instance-id: i-xxxxx           │
└──────────────┬─────────────────────┘
               │
Step 3: AMI Available
               ▼
┌────────────────────────────────────┐
│  AMI: ami-xxxxxxxxx                │
│  ├─ Regional resource              │
│  ├─ Can copy to other regions      │
│  └─ Ready to launch instances      │
└────────────────────────────────────┘
```

### AMI Sharing and Distribution

**Cross-Region Copy:**
```
us-east-1 (Source AMI)
    │
    │ Copy AMI
    ▼
eu-west-1 (Destination)

Use case: Multi-region deployments, disaster recovery
```

**Cross-Account Sharing:**
```
Account A (Owner)
    │
    │ Add launch permission
    ▼
Account B (Can launch instances)

Use case: Organizational sharing, partner collaboration
```

## EC2 Storage Options

### Storage Types Overview

```
┌─────────────────────────────────────────────────────────────┐
│              EC2 Storage Options                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Amazon EBS (Elastic Block Store)                           │
│  ├─ Network-attached block storage                          │
│  ├─ Persistent (survives instance stop/terminate)           │
│  ├─ Can detach and reattach to different instances          │
│  ├─ Snapshots for backup and replication                    │
│  └─ Use case: Boot volumes, databases, file systems         │
│                                                             │
│  Instance Store (Ephemeral Storage)                         │
│  ├─ Physically attached to host computer                    │
│  ├─ Temporary storage (lost on stop/terminate/failure)      │
│  ├─ Very high IOPS and throughput                           │
│  ├─ No additional cost (included with instance)             │
│  └─ Use case: Buffers, caches, temporary data               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Amazon EBS Volumes

**EBS Volume Types:**

```
┌─────────────────────────────────────────────────────────────┐
│              EBS Volume Types                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SSD-Backed Volumes (IOPS-Intensive)                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │  General Purpose SSD (gp3)                         │     │
│  │  ├─ IOPS: 3,000 - 16,000 (baseline 3,000)          │     │
│  │  ├─ Throughput: 125 - 1,000 MB/s                   │     │
│  │  ├─ Size: 1 GiB - 16 TiB                           │     │
│  │  ├─ Cost: Lower cost than gp2                      │     │
│  │  └─ Use case: Boot volumes, general workloads      │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │  General Purpose SSD (gp2) - Legacy                │     │
│  │  ├─ IOPS: 100 - 16,000 (burst up to 3,000)         │     │
│  │  ├─ 3 IOPS per GiB (baseline)                      │     │
│  │  ├─ Size: 1 GiB - 16 TiB                           │     │
│  │  └─ Use case: Migrating existing gp2 volumes       │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Provisioned IOPS SSD (io2 Block Express)          │     │
│  │  ├─ IOPS: Up to 256,000                            │     │
│  │  ├─ Throughput: Up to 4,000 MB/s                   │     │
│  │  ├─ Size: 4 GiB - 64 TiB                           │     │
│  │  ├─ 99.999% durability                             │     │
│  │  └─ Use case: Critical databases, high-performance │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  HDD-Backed Volumes (Throughput-Intensive)                  │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Throughput Optimized HDD (st1)                    │     │
│  │  ├─ Throughput: Up to 500 MB/s                     │     │
│  │  ├─ IOPS: Up to 500                                │     │
│  │  ├─ Size: 125 GiB - 16 TiB                         │     │
│  │  └─ Use case: Big data, data warehouses, log proc  │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Cold HDD (sc1)                                    │     │
│  │  ├─ Throughput: Up to 250 MB/s                     │     │
│  │  ├─ IOPS: Up to 250                                │     │
│  │  ├─ Size: 125 GiB - 16 TiB                         │     │
│  │  ├─ Lowest cost HDD volume                         │     │
│  │  └─ Use case: Infrequent access, cold storage      │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### EBS Volume Characteristics

**Availability Zone Bound:**
```
┌──────────────────────────────────────┐
│  Availability Zone A                 │
│  ┌────────────────────────────────┐  │
│  │  EC2 Instance (i-xxxxx)        │  │
│  │  ┌──────────────────────────┐  │  │
│  │  │  Attached EBS Volume     │  │  │
│  │  │  (vol-xxxxx)             │  │  │
│  │  └──────────────────────────┘  │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘

• EBS volume and EC2 instance must be in same AZ
• Can detach from one instance and attach to another in same AZ
• Use EBS snapshots to copy data across AZs
```

**EBS Multi-Attach (io2 only):**
```
┌─────────────────────────────────────────┐
│         Multi-Attach Enabled            │
│  (io2 Block Express or io2 volumes)     │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  EBS Volume (vol-xxxxx)          │   │
│  │  Multi-Attach: Enabled           │   │
│  └────┬────────────┬─────────────┬──┘   │
│       │            │             │      │
│  ┌────▼───┐   ┌────▼───┐   ┌────▼───┐   │
│  │Instance│   │Instance│   │Instance│   │
│  │   #1   │   │   #2   │   │   #3   │   │
│  └────────┘   └────────┘   └────────┘   │
│                                         │
│  Use case: Clustered applications,      │
│  shared file systems                    │
│  Note: Application must handle          │
│  concurrent writes                      │
└─────────────────────────────────────────┘
```

### Instance Store Volumes

```
┌─────────────────────────────────────────────────────────────┐
│              Instance Store Volumes                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Characteristics:                                           │
│  ├─ Physically attached to host computer                    │
│  ├─ Temporary storage (ephemeral)                           │
│  ├─ Very high IOPS (millions of IOPS possible)              │
│  ├─ Very high throughput (GB/s range)                       │
│  ├─ No additional cost                                      │
│  └─ Size and number depend on instance type                 │
│                                                             │
│  Data Persistence:                                          │
│  ├─ Persists: During reboots                                │
│  └─ Lost: Stop, terminate, or hardware failure              │
│                                                             │
│  Use Cases:                                                 │
│  ├─ Temporary data (caches, buffers, scratch)               │
│  ├─ Data replicated across instances                        │
│  ├─ High-performance temporary storage                      │
│  └─ Applications designed for data replication              │
│                                                             │
│  Examples:                                                  │
│  ├─ i3.large: 1 x 475 GB NVMe SSD                           │
│  ├─ i3.2xlarge: 1 x 1,900 GB NVMe SSD                       │
│  ├─ d3.xlarge: 3 x 2,000 GB HDD                             │
│  └─ m5d.large: 1 x 75 GB NVMe SSD                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Elastic IP Addresses

### What is an Elastic IP?

An **Elastic IP address** is a static, public IPv4 address in the AWS cloud. It's associated with your AWS account and can be remapped to different instances.

### Elastic IP Characteristics

```
┌─────────────────────────────────────────────────────────────┐
│              Elastic IP Addresses                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Static Public IP                                           │
│  ├─ Does not change when instance stops/starts              │
│  ├─ Remains with your account until released                │
│  └─ Can be remapped to different instances instantly        │
│                                                             │
│  Allocation and Association                                 │
│  ├─ Allocate: Reserve from AWS's pool                       │
│  ├─ Associate: Attach to an instance or ENI                 │
│  ├─ Disassociate: Detach from instance                      │
│  └─ Release: Return to AWS pool                             │
│                                                             │
│  Charges                                                    │
│  ├─ Free: When associated with a running instance           │
│  ├─ Charged: When allocated but not associated              │
│  ├─ Charged: When associated with stopped instance          │
│  └─ Purpose: Encourage efficient use of IPs                 │
│                                                             │
│  Limitations                                                │
│  ├─ 5 Elastic IPs per region (default quota)                │
│  └─ Can request quota increase                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Elastic IP Use Cases

```
High Availability Failover

Primary Instance (Running)
├─ Elastic IP: 54.x.x.x
└─ Serving traffic

        │
        │ (Instance fails)
        ▼

Secondary Instance (Running)
├─ Elastic IP: 54.x.x.x (reassigned)
└─ Now serving traffic

Benefit: Same public IP, minimal downtime
```

## Key Pairs

### What are Key Pairs?

**Key Pairs** are security credentials consisting of a public and private key used to prove identity when connecting to an EC2 instance.

### Key Pair Types

```
┌─────────────────────────────────────────────────────────────┐
│              EC2 Key Pairs                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  RSA Key Pair (Traditional)                                 │
│  ├─ Public key: Stored by AWS on instance                   │
│  ├─ Private key: Downloaded once, stored by you             │
│  ├─ Used for: SSH (Linux) and RDP (Windows)                 │
│  └─ Format: PEM or PPK                                      │
│                                                             │
│  ED25519 Key Pair (Modern)                                  │
│  ├─ Supported on Linux instances only                       │
│  ├─ More secure than RSA                                    │
│  └─ Smaller key size                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### SSH Connection Workflow

```
SSH Connection to EC2 Instance

Step 1: Launch Instance
┌────────────────────────────────────┐
│  Launch EC2 instance               │
│  ├─ Select/Create key pair         │
│  └─ Download private key (.pem)    │
└──────────────┬─────────────────────┘
               │
Step 2: Protect Private Key
               ▼
┌────────────────────────────────────┐
│  chmod 400 my-key-pair.pem         │
│  (Read-only for owner)             │
└──────────────┬─────────────────────┘
               │
Step 3: Connect
               ▼
┌────────────────────────────────────┐
│  ssh -i my-key-pair.pem \          │
│      ec2-user@54.x.x.x             │
│                                    │
│  ├─ Client presents private key    │
│  ├─ Server verifies with public key│
│  └─ Connection established         │
└────────────────────────────────────┘
```

## EC2 Pricing Models

### Pricing Model Overview

```
┌─────────────────────────────────────────────────────────────┐
│              EC2 Pricing Models                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  On-Demand Instances                                        │
│  ├─ Pay by the second (minimum 60 seconds)                  │
│  ├─ No upfront commitment                                   │
│  ├─ Highest per-hour cost                                   │
│  └─ Use case: Short-term, unpredictable workloads           │
│                                                             │
│  Savings Plans                                              │
│  ├─ Commit to consistent usage ($/hour)                     │
│  ├─ Flexible across instance families, regions, OS          │
│  ├─ Compute Savings Plan: Most flexible                     │
│  ├─ EC2 Instance Savings Plan: Specific instance family     │
│  └─ Use case: Predictable, steady-state usage               │
│                                                             │
│  Reserved Instances                                         │
│  ├─ Commit to specific instance type                        │
│  ├─ Payment options: All upfront, Partial upfront, No upfront
│  ├─ Standard RI: Cannot change instance type                │
│  ├─ Convertible RI: Can change instance family              │
│  └─ Use case: Known, long-term capacity needs               │
│                                                             │
│  Spot Instances                                             │
│  ├─ Request unused EC2 capacity                             │
│  ├─ Can be interrupted with 2-minute warning                │
│  ├─ Spot price fluctuates based on supply/demand            │
│  └─ Use case: Fault-tolerant, flexible workloads            │
│                                                             │
│  Dedicated Hosts                                            │
│  ├─ Physical server dedicated to your use                   │
│  ├─ Use existing server-bound software licenses             │
│  ├─ Compliance requirements (physical isolation)            │
│  └─ Use case: Licensing, compliance, regulatory             │
│                                                             │
│  Dedicated Instances                                        │
│  ├─ Instances run on hardware dedicated to single customer  │
│  ├─ May share hardware with other instances in same account │
│  └─ Use case: Compliance requiring hardware isolation       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## EC2 Image Builder

### What is EC2 Image Builder?

**EC2 Image Builder** is a service that automates the creation, management, and distribution of secure and up-to-date machine images (AMIs) and container images.

### Image Builder Architecture

```
┌─────────────────────────────────────────────────────────────┐
│          EC2 Image Builder Workflow                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │  1. Image Recipe                                   │     │
│  │  ├─ Base AMI (e.g., Amazon Linux 2023)             │     │
│  │  ├─ Build components (install software)            │     │
│  │  ├─ Test components (validate image)               │     │
│  │  └─ Output settings                                │     │
│  └──────────────────────┬─────────────────────────────┘     │
│                         │                                   │
│                         ▼                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │  2. Infrastructure Configuration                   │     │
│  │  ├─ Instance type (e.g., t3.medium)                │     │
│  │  ├─ IAM role                                       │     │
│  │  ├─ VPC/Subnet                                     │     │
│  │  └─ Security group                                 │     │
│  └──────────────────────┬─────────────────────────────┘     │
│                         │                                   │
│                         ▼                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │  3. Build Process                                  │     │
│  │  ├─ Launch build instance                          │     │
│  │  ├─ Apply build components                         │     │
│  │  ├─ Run tests                                      │     │
│  │  ├─ Create AMI                                     │     │
│  │  └─ Terminate build instance                       │     │
│  └──────────────────────┬─────────────────────────────┘     │
│                         │                                   │
│                         ▼                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │  4. Distribution                                   │     │
│  │  ├─ Copy AMI to target regions                     │     │
│  │  ├─ Set launch permissions                         │     │
│  │  ├─ Share with accounts                            │     │
│  │  └─ Create launch template (optional)              │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │  5. Automation (Optional)                          │     │
│  │  ├─ Schedule: Weekly, monthly, etc.                │     │
│  │  ├─ Trigger: Base image updates                    │     │
│  │  └─ Result: Always up-to-date images               │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Image Builder Benefits

```
Manual AMI Creation          EC2 Image Builder
-------------------          ------------------
✗ Manual process             ✓ Automated pipeline
✗ Time-consuming             ✓ Fast, repeatable
✗ Error-prone                ✓ Consistent results
✗ Hard to maintain           ✓ Easy to update
✗ No built-in testing        ✓ Integrated testing
✗ Manual distribution        ✓ Automated distribution
```

## Summary

**Key Takeaways:**

1. **EC2** provides resizable virtual servers with full control over configuration
2. **Instance Types** are optimized for different workloads (general, compute, memory, storage, accelerated)
3. **AMIs** are templates that enable rapid, consistent instance deployments
4. **EBS Volumes** provide persistent block storage with multiple performance tiers
5. **Instance Store** offers high-performance temporary storage
6. **Elastic IPs** provide static public addresses that can be remapped instantly
7. **Key Pairs** enable secure SSH/RDP access to instances
8. **Pricing Models** offer flexibility (On-Demand, Savings Plans, Reserved, Spot)
9. **EC2 Image Builder** automates the creation and maintenance of AMIs

**Best Practices:**

- Right-size instances based on actual workload requirements
- Use AWS Compute Optimizer for instance type recommendations
- Implement tagging strategy for cost allocation and organization
- Use Savings Plans or Reserved Instances for predictable workloads
- Leverage Spot Instances for fault-tolerant, flexible applications
- Create custom AMIs for standardized deployments
- Protect private keys and use IAM roles for AWS API access
- Automate AMI creation and updates with EC2 Image Builder

