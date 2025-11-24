---
title: Load Balancing and Auto Scaling
linkTitle: Load Balancing and Scaling
type: docs
weight: 6
prev: /aws/05-compute-services
next: /aws/07-identity-and-access-management
---

## Overview

Building highly available and scalable applications requires automatically distributing incoming traffic across multiple targets and dynamically adjusting capacity based on demand. AWS provides Elastic Load Balancing (ELB) for traffic distribution and EC2 Auto Scaling for automatic capacity management.

## Elastic Load Balancing

### What is Elastic Load Balancing?

**Elastic Load Balancing** automatically distributes incoming traffic across multiple targets (EC2 instances, IP addresses, Lambda function) in one or more Availability Zones to improve availability, fault tolerance, and scalability.

### Load Balancing Benefits

```
┌─────────────────────────────────────────────────────────────┐
│          Benefits of Load Balancing                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  High Availability                                          │
│  ├─ Distributes traffic across multiple targets             │
│  ├─ Automatically routes around unhealthy targets           │
│  └─ Operates across multiple Availability Zones             │
│                                                             │
│  Fault Tolerance                                            │
│  ├─ Detects unhealthy targets via health checks             │
│  ├─ Removes unhealthy targets from rotation                 │
│  └─ Automatically recovers when targets become healthy      │
│                                                             │
│  Scalability                                                │
│  ├─ Scales to handle millions of requests                   │
│  ├─ Integrates with Auto Scaling                            │
│  └─ Distributes load evenly across targets                  │
│                                                             │
│  Security                                                   │
│  ├─ SSL/TLS termination                                     │
│  ├─ Integration with AWS Certificate Manager                │
│  ├─ Security group protection                               │
│  └─ VPC isolation                                           │
│                                                             │
│  Monitoring                                                 │
│  ├─ CloudWatch metrics                                      │
│  ├─ Access logs                                             │
│  └─ Request tracing                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Load Balancer Types

```
┌─────────────────────────────────────────────────────────────┐
│          Load Balancer Type Comparison                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Application Load Balancer (ALB) - Layer 7                  │
│  ├─ Protocol: HTTP, HTTPS, gRPC                             │
│  ├─ Routing: Path, host, header, query string based         │
│  ├─ Targets: EC2, IP, Lambda, containers                    │
│  ├─ Features: WebSocket, HTTP/2, redirects, fixed response  │
│  └─ Use case: Web applications, microservices, APIs         │
│                                                             │
│  Network Load Balancer (NLB) - Layer 4                      │
│  ├─ Protocol: TCP, UDP, TLS                                 │
│  ├─ Performance: Ultra-low latency, millions of req/sec     │
│  ├─ IP: Static IP and Elastic IP support                    │
│  ├─ Targets: EC2, IP addresses, ALB                         │
│  └─ Use case: Extreme performance, gaming, IoT, TCP/UDP     │
│                                                             │
│  Gateway Load Balancer (GWLB) - Layer 3                     │
│  ├─ Protocol: All IP packets                                │
│  ├─ Purpose: Deploy, scale, manage third-party appliances   │
│  ├─ Targets: Virtual appliances (firewall, IDS/IPS)         │
│  └─ Use case: Firewalls, DPI, intrusion detection           │
│                                                             │
│  Classic Load Balancer (CLB) - Legacy (Layer 4/7)           │
│  ├─ Protocol: HTTP, HTTPS, TCP, SSL/TLS                     │
│  ├─ EC2-Classic support                                     │
│  └─ Use case: Legacy applications (migrate to ALB/NLB)      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Application Load Balancer (ALB)

### ALB Architecture

```
┌─────────────────────────────────────────────────────────────┐
│        Application Load Balancer Architecture               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                 ┌──────────────┐                            │
│                 │    Client    │                            │
│                 └──────┬───────┘                            │
│                        │                                    │
│                        │ HTTPS Request                      │
│                        │ example.com/api/users              │
│                        ▼                                    │
│            ┌──────────────────────────────┐                 │
│            │  Application Load Balancer   │                 │
│            │  (Spans multiple AZs)        │                 │
│            └───────────┬──────────────────┘                 │
│                        │                                    │
│          Step 1: Listener receives request                  │
│                        │                                    │
│                        ▼                                    │
│            ┌──────────────────────────────┐                 │
│            │  Listener (HTTPS:443)        │                 │
│            │  • Protocol: HTTPS           │                 │
│            │  • Port: 443                 │                 │
│            │  • SSL Certificate           │                 │
│            └───────────┬──────────────────┘                 │
│                        │                                    │
│          Step 2: Evaluate listener rules                    │
│                        │                                    │
│                        ▼                                    │
│            ┌──────────────────────────────┐                 │
│            │  Listener Rules              │                 │
│            │  ┌────────────────────────┐  │                 │
│            │  │ Rule 1: /api/* → TG-1  │  │                 │
│            │  │ Rule 2: /images/* →TG-2│  │                 │
│            │  │ Default: → TG-3        │  │                 │
│            │  └────────────────────────┘  │                 │
│            └───────────┬──────────────────┘                 │
│                        │                                    │
│          Step 3: Route to target group                      │
│                        │                                    │
│            ┌───────────┴────────────┐                       │
│            │                        │                       │
│            ▼                        ▼                       │
│  ┌──────────────────┐     ┌──────────────────┐              │
│  │  Target Group 1  │     │  Target Group 2  │              │
│  │  (API Servers)   │     │  (Web Servers)   │              │
│  └────────┬─────────┘     └────────┬─────────┘              │
│           │                        │                        │
│  Step 4: Health check and load balance                      │
│           │                        │                        │
│    ┌──────┴──────┐          ┌──────┴──────┐                 │
│    │             │          │             │                 │
│    ▼             ▼          ▼             ▼                 │
│  ┌────┐        ┌────┐    ┌────┐        ┌────┐               │
│  │EC2 │ healthy│EC2 │    │EC2 │ healthy│EC2 │               │
│  │AZ-A│        │AZ-B│    │AZ-A│        │AZ-B│               │
│  └────┘        └────┘    └────┘        └────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Listeners

A **listener** is a process that listens for incoming connection requests using the configured protocol and port.

```
┌─────────────────────────────────────────────────────────────┐
│              Listener Configuration                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Listener Components:                                       │
│  ├─ Protocol: HTTP, HTTPS                                   │
│  ├─ Port: 80, 443, or custom (1-65535)                      │
│  ├─ Default action: Forward, redirect, fixed response       │
│  └─ Rules: Conditional routing based on request attributes  │
│                                                             │
│  Example Listeners:                                         │
│                                                             │
│  Listener 1                                                 │
│  ├─ Protocol: HTTP                                          │
│  ├─ Port: 80                                                │
│  └─ Default action: Redirect to HTTPS                       │
│                                                             │
│  Listener 2                                                 │
│  ├─ Protocol: HTTPS                                         │
│  ├─ Port: 443                                               │
│  ├─ SSL Certificate: *.example.com                          │
│  └─ Default action: Forward to target group                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Listener Rules

**Listener rules** determine how incoming requests are routed to one or more target groups based on specified conditions.

```
┌─────────────────────────────────────────────────────────────┐
│              Listener Rule Conditions                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Path-Based Routing                                         │
│  ├─ /api/*         → API Target Group                       │
│  ├─ /images/*      → Static Content Target Group            │
│  └─ /admin/*       → Admin Target Group                     │
│                                                             │
│  Host-Based Routing                                         │
│  ├─ api.example.com    → API Target Group                   │
│  ├─ www.example.com    → Web Target Group                   │
│  └─ admin.example.com  → Admin Target Group                 │
│                                                             │
│  HTTP Header Routing                                        │
│  ├─ X-Platform: mobile → Mobile Target Group                │
│  └─ X-Platform: desktop → Desktop Target Group              │
│                                                             │
│  HTTP Method Routing                                        │
│  ├─ GET, HEAD      → Read-Only Target Group                 │
│  └─ POST, PUT      → Read-Write Target Group                │
│                                                             │
│  Query String Routing                                       │
│  ├─ ?version=v1    → V1 Target Group                        │
│  └─ ?version=v2    → V2 Target Group                        │
│                                                             │
│  Source IP Routing                                          │
│  ├─ 10.0.0.0/8     → Internal Target Group                  │
│  └─ 0.0.0.0/0      → Public Target Group                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Rule Priority:**
```
Priority   Condition              Action
-----------------------------------------------
1          Path: /api/*           → API-TG
10         Host: admin.*          → Admin-TG
100        Header: X-User: admin  → Admin-TG
Default    (No match)             → Default-TG

Lower priority number = evaluated first
```

**Listener Actions:**
```
Forward                → Send to target group
Redirect               → HTTP redirect (e.g., HTTP → HTTPS)
Fixed Response         → Return custom HTTP response
Authenticate (OIDC)    → Authenticate using OIDC provider
Authenticate (Cognito) → Authenticate using Cognito
```

### Target Groups

A **target group** routes requests to registered targets using the specified protocol and port.

```
┌─────────────────────────────────────────────────────────────┐
│              Target Group Configuration                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Target Types:                                              │
│  ├─ Instance: EC2 instance IDs                              │
│  ├─ IP: IP addresses (on-premises, other VPCs)              │
│  ├─ Lambda: Lambda function                                 │
│  └─ ALB: Application Load Balancer                          │
│                                                             │
│  Protocol & Port:                                           │
│  ├─ Protocol: HTTP, HTTPS, gRPC                             │
│  └─ Port: Target port (e.g., 8080, 3000)                    │
│                                                             │
│  Health Check Settings:                                     │
│  ├─ Protocol: HTTP, HTTPS                                   │
│  ├─ Path: /health, /api/health                              │
│  ├─ Interval: 30 seconds (default)                          │
│  ├─ Timeout: 5 seconds                                      │
│  ├─ Healthy threshold: 2 consecutive successes              │
│  ├─ Unhealthy threshold: 2 consecutive failures             │
│  └─ Success codes: 200, 200-299, 200,301                    │
│                                                             │
│  Attributes:                                                │
│  ├─ Deregistration delay: 300 seconds (default)             │
│  ├─ Stickiness: Enable/disable session affinity             │
│  ├─ Load balancing algorithm: Round robin, least outstanding│
│  └─ Slow start mode: Gradually increase traffic to new targets
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Health Checks

```
┌─────────────────────────────────────────────────────────────┐
│              Health Check Workflow                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Initial State: All targets unknown                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Load Balancer sends health check request            │   │
│  │  GET /health HTTP/1.1                                │   │
│  └───────────────────┬──────────────────────────────────┘   │
│                      │                                      │
│                      ▼                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Target 1                    Target 2                │   │
│  │  ├─ Response: 200 OK         ├─ Response: 500 Error  │   │
│  │  └─ Healthy                  └─ Unhealthy            │   │
│  └──────────────────────────────────────────────────────┘   │
│                      │                                      │
│                      ▼                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Health Check Results                                │   │
│  │  ├─ Target 1: Healthy (receives traffic)             │   │
│  │  └─ Target 2: Unhealthy (removed from rotation)      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  Continuous Monitoring:                                     │
│  • Health checks run every [interval] seconds               │
│  • [healthy_threshold] successes → healthy                  │
│  • [unhealthy_threshold] failures → unhealthy               │
│  • Unhealthy targets automatically removed                  │
│  • Recovered targets automatically added back               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Target Deregistration Delay (Connection Draining)

```
┌─────────────────────────────────────────────────────────────┐
│          Target Deregistration Delay                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Purpose: Allow time for in-flight requests to complete     │
│           before fully de-registering a target from the LB  │
│                                                             │
│  Workflow:                                                  │
│                                                             │
│  Step 1: Target marked for deregistration                   │
│  ├─ No new connections sent to target                       │
│  └─ Existing connections remain active                      │
│                                                             │
│  Step 2: Deregistration delay period (default: 300s)        │
│  ├─ Load balancer waits for active connections to complete  │
│  └─ Target continues processing existing requests           │
│                                                             │
│  Step 3: Complete deregistration                            │
│  ├─ After delay or all connections closed (whichever first) │
│  └─ Target fully removed from load balancer                 │
│                                                             │
│  Configuration:                                             │
│  ├─ Range: 0 - 3600 seconds                                 │
│  ├─ Default: 300 seconds (5 minutes)                        │
│  └─ Set to 0 for immediate deregistration                   │
│                                                             │
│  Use case: Graceful shutdowns, deployments, scaling in      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Complete ALB Example

```
Example: Multi-Tier Web Application

┌─────────────────────────────────────────────────────────────┐
│              Client Request Flow                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User: https://www.example.com/api/users                    │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ALB: example-alb (internet-facing)                  │   │
│  │  ├─ Listener: HTTPS:443                              │   │
│  │  │  ├─ SSL Cert: *.example.com                       │   │
│  │  │  └─ Rules:                                        │   │
│  │  │     ├─ Path /api/* → API-TG                       │   │
│  │  │     ├─ Path /images/* → Static-TG                 │   │
│  │  │     └─ Default → Web-TG                           │   │
│  │  └─ Listener: HTTP:80                                │   │
│  │     └─ Redirect to HTTPS                             │   │
│  └────────────┬─────────────────────────────────────────┘   │
│               │ (Matched /api/* → API-TG)                   │
│               ▼                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Target Group: API-TG                                │   │
│  │  ├─ Protocol: HTTP                                   │   │
│  │  ├─ Port: 8080                                       │   │
│  │  ├─ Health check: GET /api/health                    │   │
│  │  ├─ Targets:                                         │   │
│  │  │  ├─ i-abc123 (AZ-A) - Healthy                     │   │
│  │  │  ├─ i-def456 (AZ-B) - Healthy                     │   │
│  │  │  └─ i-ghi789 (AZ-C) - Unhealthy (no traffic)      │   │
│  │  └─ Deregistration delay: 120s                       │   │
│  └────────────┬─────────────────────────────────────────┘   │
│               │                                             │
│               ▼                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  EC2 Instance: i-abc123                              │   │
│  │  ├─ Receives request                                 │   │
│  │  ├─ Processes /api/users                             │   │
│  │  └─ Returns JSON response                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Network Load Balancer (NLB)

### NLB Characteristics

```
┌─────────────────────────────────────────────────────────────┐
│          Network Load Balancer Features                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Performance                                                │
│  ├─ Ultra-low latency (~100 microseconds)                   │
│  ├─ Millions of requests per second                         │
│  ├─ Sudden traffic spikes                                   │
│  └─ Connection-based load balancing                         │
│                                                             │
│  Static IP                                                  │
│  ├─ One static IP per Availability Zone                     │
│  ├─ Supports Elastic IP assignment                          │
│  └─ Ideal for firewall whitelisting                         │
│                                                             │
│  Protocol Support                                           │
│  ├─ TCP (Layer 4)                                           │
│  ├─ UDP                                                     │
│  ├─ TLS                                                     │
│  └─ TCP_UDP                                                 │
│                                                             │
│  Preserve Source IP                                         │
│  ├─ Client IP address visible to targets                    │
│  └─ No X-Forwarded-For header needed                        │
│                                                             │
│  Target Types                                               │
│  ├─ EC2 instances                                           │
│  ├─ IP addresses (on-premises, containers)                  │
│  └─ Application Load Balancer                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### NLB Use Cases

```
Gaming Servers
├─ Ultra-low latency required
├─ TCP/UDP protocol support
└─ Static IP for player connections

IoT Applications
├─ Millions of devices connecting
├─ High connection rate
└─ TCP for MQTT, CoAP protocols

Financial Applications
├─ Sub-millisecond latency
├─ High throughput requirements
└─ Static IP for regulatory compliance

VoIP and Real-Time Communications
├─ UDP protocol support
├─ Low jitter
└─ High packet throughput
```

## Amazon EC2 Auto Scaling

### What is Auto Scaling?

**Amazon EC2 Auto Scaling** automatically adjusts the number of EC2 instances based on resource demand using scaling policies that we define.

### Auto Scaling Benefits

```
┌─────────────────────────────────────────────────────────────┐
│          Auto Scaling Benefits                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Dynamic Capacity Management                                │
│  ├─ Automatically add instances during demand spikes        │
│  └─ Remove instances during low demand periods              │
│                                                             │
│  Cost Optimization                                          │
│  ├─ Pay only for instances you need                         │
│  ├─ Reduce over-provisioning                                │
│  └─ Optimize for predictable and unpredictable workloads    │
│                                                             │
│  High Availability                                          │
│  ├─ Distribute instances across multiple AZs                │
│  ├─ Replace unhealthy instances automatically               │
│  └─ Maintain desired capacity                               │
│                                                             │
│  Better Application Performance                             │
│  ├─ Ensure sufficient capacity during peak load             │
│  └─ Reduce response time by adding capacity proactively     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Auto Scaling Groups (ASG)

```
┌─────────────────────────────────────────────────────────────┐
│          Auto Scaling Group Components                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Auto Scaling Group                                │     │
│  │                                                    │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │  Launch Template / Configuration             │  │     │
│  │  │  • AMI ID                                    │  │     │
│  │  │  • Instance type                             │  │     │
│  │  │  • Key pair                                  │  │     │
│  │  │  • Security groups                           │  │     │
│  │  │  • User data                                 │  │     │
│  │  └──────────────────────────────────────────────┘  │     │
│  │                                                    │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │  Capacity Settings                           │  │     │
│  │  │  • Minimum: 2 instances                      │  │     │
│  │  │  • Desired: 4 instances                      │  │     │
│  │  │  • Maximum: 10 instances                     │  │     │
│  │  └──────────────────────────────────────────────┘  │     │
│  │                                                    │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │  Network Configuration                       │  │     │
│  │  │  • VPC: vpc-xxxxx                            │  │     │
│  │  │  • Subnets: subnet-a, subnet-b, subnet-c     │  │     │
│  │  │    (multiple AZs for HA)                     │  │     │
│  │  └──────────────────────────────────────────────┘  │     │
│  │                                                    │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │  Load Balancer Integration                   │  │     │
│  │  │  • Target group: TG-Web                      │  │     │
│  │  │  • Health check type: ELB                    │  │     │
│  │  │  • Health check grace period: 300s           │  │     │
│  │  └──────────────────────────────────────────────┘  │     │
│  │                                                    │     │
│  │  ┌──────────────────────────────────────────────┐  │     │
│  │  │  Scaling Policies                            │  │     │
│  │  │  • Target tracking (CPU 50%)                 │  │     │
│  │  │  • Step scaling                              │  │     │
│  │  │  • Scheduled scaling                         │  │     │
│  │  └──────────────────────────────────────────────┘  │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Launch Templates

**Launch templates** specify instance configuration that Auto Scaling Groups use to launch EC2 instances.

```
Launch Template vs Launch Configuration

Launch Template (Recommended)
├─ Supports versioning
├─ Can be modified after creation
├─ Supports multiple instance types
├─ Supports Spot and On-Demand mix
├─ Supports T2/T3 unlimited mode
└─ Supports latest features

Launch Configuration (Legacy)
├─ Immutable (cannot modify)
├─ Single instance type only
├─ Limited to On-Demand or Spot
└─ Missing modern features
```

**Launch Template Components:**
```
┌─────────────────────────────────────────────────────────────┐
│              Launch Template Configuration                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  AMI                                                        │
│  ├─ AMI ID: ami-xxxxx                                       │
│  └─ Source: AWS, Marketplace, Custom                        │
│                                                             │
│  Instance Type                                              │
│  ├─ Default: t3.medium                                      │
│  └─ Can override in ASG with multiple types                 │
│                                                             │
│  Key Pair                                                   │
│  └─ SSH access key pair                                     │
│                                                             │
│  Network Settings                                           │
│  ├─ Network interfaces                                      │
│  ├─ Auto-assign public IP                                   │
│  └─ Security groups                                         │
│                                                             │
│  Storage                                                    │
│  ├─ EBS volumes configuration                               │
│  ├─ Volume type, size, IOPS                                 │
│  └─ Delete on termination                                   │
│                                                             │
│  IAM Role                                                   │
│  └─ Instance profile for AWS API access                     │
│                                                             │
│  User Data                                                  │
│  └─ Bootstrap script (install software, configure)          │
│                                                             │
│  Tags                                                       │
│  └─ Resource tags (Name, Environment, etc.)                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Scaling Policies

```
┌─────────────────────────────────────────────────────────────┐
│              Auto Scaling Policies                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Default                                                    │
│  ├─ Maintain fixed number of instances                      │
│  ├─ Set desired capacity manually                           │
│  └─ Use case: Stable, predictable load                      │
│                                                             │
│  Manual Scaling                                             │
│  ├─ Manually change desired, min, or max capacity  (ASG)    │
│  ├─ Terminate specific instances                            │
│  └─ Use case: One-time adjustments, testing                 │
│                                                             │
│  Scheduled Scaling                                          │
│  ├─ Scale based on date and time                            │
│  ├─ One-time or recurring schedules                         │
│  ├─ Example: Scale up at 8 AM, scale down at 6 PM           │
│  └─ Use case: Predictable traffic patterns                  │
│                                                             │
│  Dynamic Scaling                                            │
│  │                                                          │
│  ├─ Target Tracking Scaling                                 │
│  │  ├─ Maintain specific metric at target value             │
│  │  ├─ Example: Keep CPU utilization at 50%                 │
│  │  ├─ ASG adjusts capacity automatically                   │
│  │  └─ Easiest to configure                                 │
│  │                                                          │
│  ├─ Step Scaling                                            │
│  │  ├─ Scale based on metric breach severity                │
│  │  ├─ Different actions for different thresholds           │
│  │  ├─ Example:                                             │
│  │  │  • CPU 50-60%: Add 1 instance                         │
│  │  │  • CPU 60-70%: Add 2 instances                        │
│  │  │  • CPU >70%:   Add 3 instances                        │
│  │  └─ More granular control                                │
│  │                                                          │
│  └─ Simple Scaling                                          │
│     ├─ Scale based on single alarm                          │
│     ├─ Cooldown period after each action                    │
│     └─ Legacy (use step or target tracking instead)         │
│                                                             │
│  Predictive Scaling                                         │
│  ├─ Scales proactively before demand                        │
│  ├─ ML-based forecasting                                    │
│  ├─ Analyzes historical CloudWatch data                     │
│  ├─ Predicts future traffic                                 │
│  └─ Use case: Recurring patterns (daily, weekly)            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Target Tracking Scaling Example

```
Target Tracking: Maintain Average CPU at 50%

Current State:
├─ Instances: 4
├─ Average CPU: 50%
└─ Status: Stable

Scenario: Traffic Increases
├─ Average CPU: 75% (exceeds target)
├─ Action: Scale out (add instances)
├─ New instances: +2
├─ Total instances: 6
└─ Average CPU: ~50% (back to target)

Scenario: Traffic Decreases
├─ Average CPU: 25% (below target)
├─ Action: Scale in (remove instances)
├─ Instances removed: -1
├─ Total instances: 5
└─ Average CPU: ~50% (back to target)
```

### Scaling Cooldown

```
┌─────────────────────────────────────────────────────────────┐
│              Scaling Cooldown                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Purpose: Prevent rapid scaling actions                     │
│                                                             │
│  Timeline:                                                  │
│                                                             │
│  T+0:  Scaling action triggered                             │
│  │     (Add 2 instances)                                    │
│  │                                                          │
│  ├─ Cooldown period starts (default: 300 seconds)           │
│  │                                                          │
│  T+1:  Alarm triggers again                                 │
│  │     → Ignored (cooldown in progress)                     │
│  │                                                          │
│  T+5:  Cooldown period ends                                 │
│        → New scaling actions allowed                        │
│                                                             │
│  Configuration:                                             │
│  ├─ Default cooldown: 300 seconds                           │
│  ├─ Can customize per policy                                │
│  └─ Target tracking: Managed automatically                  │
│                                                             │
│  Note: Cooldown does NOT apply to:                          │
│  • Target tracking scaling (uses warmup/cooldown)           │
│  • Instance health checks                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### ASG Availability Zone Distribution Strategies

```
┌─────────────────────────────────────────────────────────────┐
│          AZ Distribution Strategies                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Balanced Best Effort (Default)                             │
│  ├─ Tries to evenly distribute across all AZs               │
│  ├─ Prioritizes capacity over strict balance                │
│  ├─ May be unbalanced if AZ capacity unavailable            │
│  └─ Example:                                                │
│     Desired: 6 instances, 3 AZs                             │
│     AZ-A unavailable → AZ-B:4, AZ-C:2 (meets capacity)      │
│                                                             │
│  Balanced Only                                              │
│  ├─ Maintains strict balance across AZs                     │
│  ├─ Prioritizes balance over capacity                       │
│  ├─ May not meet desired capacity if AZ down                │
│  └─ Example:                                                │
│     Desired: 6 instances, 3 AZs                             │
│     AZ-A unavailable → AZ-B:2, AZ-C:2 (balanced but only 4) │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## High Availability Pattern

### Complete HA Architecture

```
┌─────────────────────────────────────────────────────────────┐
│      Highly Available Web Application Architecture          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                  ┌─────────────────┐                        │
│                  │  Route 53 DNS   │                        │
│                  │  example.com    │                        │
│                  └────────┬────────┘                        │
│                           │                                 │
│                           ▼                                 │
│          ┌────────────────────────────────┐                 │
│          │  Application Load Balancer     │                 │
│          │  (Multi-AZ, Auto-scaling)      │                 │
│          └───────────┬────────────────────┘                 │
│                      │                                      │
│          ┌───────────┴───────────┐                          │
│          │                       │                          │
│  ┌───────▼────────┐      ┌───────▼────────┐                 │
│  │  AZ-A          │      │  AZ-B          │                 │
│  │                │      │                │                 │
│  │  ┌──────────┐  │      │  ┌──────────┐  │                 │
│  │  │Public    │  │      │  │Public    │  │                 │
│  │  │Subnet    │  │      │  │Subnet    │  │                 │
│  │  │NAT-GW    │  │      │  │NAT-GW    │  │                 │
│  │  └────┬─────┘  │      │  └────┬─────┘  │                 │
│  │       │        │      │       │        │                 │
│  │  ┌────▼─────┐  │      │  ┌────▼─────┐  │                 │
│  │  │Private   │  │      │  │Private   │  │                 │
│  │  │Subnet    │  │      │  │Subnet    │  │                 │
│  │  │          │  │      │  │          │  │                 │
│  │  │┌────────┐│  │      │  │┌────────┐│  │                 │
│  │  ││Auto    ││  │      │  ││Auto    ││  │                 │
│  │  ││Scaling ││  │      │  ││Scaling ││  │                 │
│  │  ││Group   ││  │      │  ││Group   ││  │                 │
│  │  ││EC2 Inst││  │      │  ││EC2 Inst││  │                 │
│  │  │└────────┘│  │      │  │└────────┘│  │                 │
│  │  └────┬─────┘  │      │  └────┬─────┘  │                 │
│  │       │        │      │       │        │                 │
│  │  ┌────▼─────┐  │      │  ┌────▼─────┐  │                 │
│  │  │Private   │  │      │  │Private   │  │                 │
│  │  │Subnet    │  │      │  │Subnet    │  │                 │
│  │  │RDS       │  │      │  │RDS       │  │                 │
│  │  │Primary   │──┼──────┼──│Standby   │  │                 │
│  │  │          │  │      │  │(Failover)│  │                 │
│  │  └──────────┘  │      │  └──────────┘  │                 │
│  └────────────────┘      └────────────────┘                 │
│                                                             │
│  Features:                                                  │
│  • Multi-AZ deployment                                      │
│  • Auto Scaling based on demand                             │
│  • Load balancing across instances                          │
│  • Database replication and failover                        │
│  • NAT Gateway redundancy                                   │
│  • Health checks and automatic recovery                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Summary

**Key Takeaways:**

1. **ELB** distributes traffic across multiple targets for high availability
2. **ALB** provides Layer 7 routing with path, host, and header-based rules
3. **NLB** delivers ultra-low latency Layer 4 load balancing
4. **Listeners** receive traffic and route to target groups based on rules
5. **Target Groups** route requests to healthy registered targets
6. **Health Checks** automatically detect and remove unhealthy targets
7. **Auto Scaling Groups** automatically adjust capacity based on demand
8. **Launch Templates** define instance configuration for consistent deployments
9. **Scaling Policies** enable dynamic, scheduled, and predictive scaling

**Best Practices:**

- Use ALB for HTTP/HTTPS applications with content-based routing
- Use NLB for extreme performance and static IP requirements
- Enable cross-zone load balancing for even distribution
- Configure health checks with appropriate thresholds and intervals
- Set deregistration delay for graceful connection draining
- Deploy Auto Scaling Groups across multiple AZs
- Use target tracking scaling for simplicity
- Combine scheduled and dynamic scaling for predictable patterns
- Set appropriate min, max, and desired capacity values
- Monitor metrics and adjust policies based on application behavior

