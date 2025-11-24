---
title: Monitoring and Observability
linkTitle: Monitoring and Observability
type: docs
weight: 11
prev: /aws/10-database-services
next: /aws/12-application-integration
---

## Overview

Monitoring and observability are critical for understanding the health, performance, and behavior of your AWS infrastructure and applications. Amazon CloudWatch is the central service for collecting, viewing, and analyzing metrics, logs, and events from AWS resources and applications.

## Amazon CloudWatch

### What is CloudWatch?

**Amazon CloudWatch** is a monitoring and observability service that provides data and actionable insights for AWS resources, applications, and services. It collects monitoring and operational data in the form of logs, metrics, and events.

### CloudWatch Core Concepts

```
┌─────────────────────────────────────────────────────────────┐
│          CloudWatch Architecture                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AWS Resources                                       │   │
│  │  ├─ EC2 Instances                                    │   │
│  │  ├─ RDS Databases                                    │   │
│  │  ├─ Lambda Functions                                 │   │
│  │  ├─ Load Balancers                                   │   │
│  │  └─ Custom Applications                              │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│                   │ Emit Metrics, Logs, Events              │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  CloudWatch                                          │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Metrics                                       │  │   │
│  │  │  • Time-series data points                     │  │   │
│  │  │  • CPU, Memory, Network, Disk                  │  │   │
│  │  │  • Custom application metrics                  │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Logs                                          │  │   │
│  │  │  • Application logs                            │  │   │
│  │  │  • System logs                                 │  │   │
│  │  │  • API logs                                    │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Events                                        │  │   │
│  │  │  • State changes                               │  │   │
│  │  │  • Scheduled events                            │  │   │
│  │  │  • Custom events                               │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│                   │ Triggers                                │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Actions                                             │   │
│  │  ├─ Alarms (SNS notifications)                       │   │
│  │  ├─ Auto Scaling                                     │   │
│  │  ├─ Lambda Functions                                 │   │
│  │  ├─ EC2 Actions (stop, terminate, reboot)            │   │
│  │  └─ Systems Manager Automation                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## CloudWatch Metrics

### What are Metrics?

**Metrics** are time-ordered data points representing measurements of resource or application performance.

```
┌─────────────────────────────────────────────────────────────┐
│          CloudWatch Metrics Structure                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Metric Anatomy                                             │
│  ├─ Namespace: Logical container (e.g., AWS/EC2)            │
│  ├─ Metric Name: What is measured (e.g., CPUUtilization)    │
│  ├─ Dimensions: Name/value pairs (e.g., InstanceId=i-123)   │
│  ├─ Timestamp: When measurement was taken                   │
│  ├─ Value: The actual measurement                           │
│  ├─ Unit: Measurement unit (Percent, Bytes, Count, etc.)    │
│  └─ Statistics: Aggregations (Average, Sum, Min, Max)       │
│                                                             │
│  Example Metric:                                            │
│  {                                                          │
│    "Namespace": "AWS/EC2",                                  │
│    "MetricName": "CPUUtilization",                          │
│    "Dimensions": [                                          │
│      { "Name": "InstanceId", "Value": "i-1234567890abcdef0" }
│    ],                                                       │
│    "Timestamp": "2024-01-15T10:00:00Z",                     │
│    "Value": 75.5,                                           │
│    "Unit": "Percent"                                        │
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### AWS Service Metrics

```
┌─────────────────────────────────────────────────────────────┐
│          Common AWS Service Metrics                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  EC2 Metrics (AWS/EC2)                                      │
│  ├─ CPUUtilization: Percentage of allocated compute         │
│  ├─ DiskReadOps, DiskWriteOps: Disk I/O operations          │
│  ├─ NetworkIn, NetworkOut: Network bytes transferred        │
│  ├─ StatusCheckFailed: Instance/system check failures       │
│  └─ Note: Memory, disk space NOT included (need agent)      │
│                                                             │
│  RDS Metrics (AWS/RDS)                                      │
│  ├─ CPUUtilization: Database CPU usage                      │
│  ├─ DatabaseConnections: Active connections                 │
│  ├─ FreeableMemory: Available RAM                           │
│  ├─ FreeStorageSpace: Available disk space                  │
│  ├─ ReadLatency, WriteLatency: I/O latency                  │
│  └─ ReplicaLag: Replication delay for read replicas         │
│                                                             │
│  ELB Metrics (AWS/ApplicationELB)                           │
│  ├─ RequestCount: Number of requests                        │
│  ├─ TargetResponseTime: Response time from targets          │
│  ├─ HealthyHostCount: Number of healthy targets             │
│  ├─ UnHealthyHostCount: Number of unhealthy targets         │
│  ├─ HTTPCode_Target_4XX_Count: Target 4xx errors            │
│  └─ HTTPCode_ELB_5XX_Count: Load balancer 5xx errors        │
│                                                             │
│  Lambda Metrics (AWS/Lambda)                                │
│  ├─ Invocations: Number of invocations                      │
│  ├─ Duration: Execution time                                │
│  ├─ Errors: Invocation errors                               │
│  ├─ Throttles: Throttled invocations                        │
│  └─ ConcurrentExecutions: Concurrent executions             │
│                                                             │
│  DynamoDB Metrics (AWS/DynamoDB)                            │
│  ├─ ConsumedReadCapacityUnits: Read capacity used           │
│  ├─ ConsumedWriteCapacityUnits: Write capacity used         │
│  ├─ UserErrors: 4xx errors                                  │
│  └─ SystemErrors: 5xx errors                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Metric Resolution and Retention

```
Standard Resolution (Default)
├─ Data point interval: 1 minute or 5 minutes
├─ Cost: Included with AWS services
└─ Use case: Most monitoring scenarios

High Resolution
├─ Data point interval: 1 second
├─ Cost: Additional charges apply
└─ Use case: Real-time monitoring, immediate response

Metric Retention
├─ Data points < 60 seconds: 3 hours
├─ Data points = 60 seconds: 15 days
├─ Data points = 300 seconds (5 min): 63 days
└─ Data points = 3600 seconds (1 hour): 455 days
```

### Custom Metrics

```
┌─────────────────────────────────────────────────────────────┐
│          Custom Metrics                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Publishing Custom Metrics                                  │
│                                                             │
│  Method 1: CloudWatch Agent                                 │
│  ├─ Install CloudWatch agent on EC2/on-premises             │
│  ├─ Collects system metrics (memory, disk usage)            │
│  ├─ Collects custom application metrics                     │
│  └─ Automatically sends to CloudWatch                       │
│                                                             │
│  Method 2: AWS SDK/CLI                                      │
│  ├─ Use PutMetricData API                                   │
│  ├─ From application code                                   │
│  └─ Example use case: Business metrics (orders, users)      │
│                                                             │
│  Example Custom Metric:                                     │
│  Namespace: MyApp/Orders                                    │
│  Metric: OrdersPlaced                                       │
│  Dimensions: Environment=Production, Region=us-east-1       │
│  Value: 150                                                 │
│  Unit: Count                                                │
│                                                             │
│  Common Custom Metrics:                                     │
│  ├─ Application performance (response time, throughput)     │
│  ├─ Business metrics (orders, revenue, active users)        │
│  ├─ System metrics (memory, disk usage, process count)      │
│  └─ Custom health checks                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## CloudWatch Alarms

### What are CloudWatch Alarms?

**CloudWatch Alarms** watch a single metric and perform actions based on the value of that metric relative to a threshold over time.

### Alarm States

```
┌─────────────────────────────────────────────────────────────┐
│          CloudWatch Alarm States                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  OK                                                         │
│  ├─ Metric is within defined threshold                      │
│  └─ No action needed                                        │
│                                                             │
│  ALARM                                                      │
│  ├─ Metric breached threshold                               │
│  ├─ Triggers configured actions                             │
│  └─ Example: CPU > 80% for 5 minutes                        │
│                                                             │
│  INSUFFICIENT_DATA                                          │
│  ├─ Not enough data to determine state                      │
│  ├─ Alarm just created                                      │
│  └─ Metric not being published                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Alarm Configuration

```
┌─────────────────────────────────────────────────────────────┐
│          Alarm Configuration Example                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Alarm: High CPU Usage                                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Metric: EC2 CPUUtilization                        │     │
│  │  Namespace: AWS/EC2                                │     │
│  │  Dimension: InstanceId = i-1234567890abcdef0       │     │
│  │                                                    │     │
│  │  Threshold: Static > 80%                           │     │
│  │  Evaluation Period: 2 periods of 5 minutes         │     │
│  │  Datapoints to Alarm: 2 out of 2                   │     │
│  │  Treat Missing Data: As missing (not breaching)    │     │
│  │                                                    │     │
│  │  Actions:                                          │     │
│  │  When ALARM:                                       │     │
│  │  ├─ Send SNS notification to ops-team              │     │
│  │  └─ Trigger Auto Scaling policy (add instances)    │     │
│  │                                                    │     │
│  │  When OK:                                          │     │
│  │  └─ Send SNS notification (recovery)               │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  Timeline Visualization:                                    │
│  CPU %                                                      │
│  100 ──┐                                                    │
│        │                    ┌────┐                          │
│   80 ──┼────────────Threshold────┼─────────                 │
│        │           ┌────────┘    └────────┐                 │
│   60 ──┤      ┌────┘                      └────┐            │
│        │  ┌───┘                                └───┐        │
│   40 ──┼──┘                                        └──      │
│        │                                                    │
│    0 ──┴────────────────────────────────────────────────    │
│        T1   T2   T3   T4   T5   T6   T7   T8   T9           │
│                      ↑         ↑                            │
│                   Breach    Alarm triggers                  │
│                   starts    (2 consecutive)                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Alarm Actions

```
┌─────────────────────────────────────────────────────────────┐
│          CloudWatch Alarm Actions                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SNS Notifications                                          │
│  ├─ Send email, SMS, or push notifications                  │
│  ├─ Integrate with ticketing systems                        │
│  └─ Trigger Lambda for custom processing                    │
│                                                             │
│  Auto Scaling Actions                                       │
│  ├─ Scale out: Add instances when alarm triggers            │
│  └─ Scale in: Remove instances when alarm resolves          │
│                                                             │
│  EC2 Actions                                                │
│  ├─ Stop instance                                           │
│  ├─ Terminate instance                                      │
│  ├─ Reboot instance                                         │
│  └─ Recover instance (migrate to new hardware)              │
│                                                             │
│  Systems Manager Actions                                    │
│  ├─ Run automation documents                                │
│  ├─ Execute remediation runbooks                            │
│  └─ Trigger OpsItems                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Composite Alarms

```
┌─────────────────────────────────────────────────────────────┐
│          Composite Alarms                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Combine multiple alarms using boolean logic                │
│                                                             │
│  Example: Alert only if CPU AND Memory are high             │
│                                                             │
│  ┌────────────────────┐      ┌────────────────────┐         │
│  │  Alarm A:          │      │  Alarm B:          │         │
│  │  CPU > 80%         │      │  Memory > 90%      │         │
│  │  State: ALARM      │      │  State: ALARM      │         │
│  └──────────┬─────────┘      └──────────┬─────────┘         │
│             │                           │                   │
│             └────────────┬──────────────┘                   │
│                          ▼                                  │
│             ┌────────────────────────────┐                  │
│             │  Composite Alarm           │                  │
│             │  (A AND B)                 │                  │
│             │  State: ALARM              │                  │
│             └────────────┬───────────────┘                  │
│                          │                                  │
│                          ▼                                  │
│             ┌────────────────────────────┐                  │
│             │  Action: Send critical     │                  │
│             │  notification to on-call   │                  │
│             └────────────────────────────┘                  │
│                                                             │
│  Boolean Operators:                                         │
│  ├─ AND: All child alarms must be in ALARM state            │
│  ├─ OR: At least one child alarm in ALARM state             │
│  └─ NOT: Invert alarm state                                 │
│                                                             │
│  Use Cases:                                                 │
│  ├─ Reduce false positives                                  │
│  ├─ Alert on complex conditions                             │
│  └─ Implement escalation logic                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## CloudWatch Logs

### What are CloudWatch Logs?

**CloudWatch Logs** enables you to centralize logs from all your systems, applications, and AWS services in a single, scalable service.

### Log Structure

```
┌─────────────────────────────────────────────────────────────┐
│          CloudWatch Logs Hierarchy                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Log Group                                                  │
│  └─ /aws/lambda/my-function                                 │
│     │                                                       │
│     ├─ Log Stream: 2024/01/15/[$LATEST]abc123               │
│     │  ├─ Log Event 1: [INFO] Function started              │
│     │  ├─ Log Event 2: [INFO] Processing request            │
│     │  └─ Log Event 3: [INFO] Function completed            │
│     │                                                       │
│     └─ Log Stream: 2024/01/15/[$LATEST]def456               │
│        ├─ Log Event 1: [ERROR] Connection timeout           │
│        └─ Log Event 2: [INFO] Retrying request              │
│                                                             │
│  Concepts:                                                  │
│  ├─ Log Group: Container for log streams                    │
│  │  • Defines retention, permissions, encryption            │
│  │  • Example: /aws/ec2/myapp, /aws/rds/instance/db1        │
│  │                                                          │
│  ├─ Log Stream: Sequence of log events from same source     │
│  │  • Usually represents single resource instance           │
│  │  • Example: EC2 instance ID, Lambda execution context    │
│  │                                                          │
│  └─ Log Event: Single log entry with timestamp and message  │
│     • Timestamp, message, and optional metadata             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Common Log Sources

```
┌─────────────────────────────────────────────────────────────┐
│          AWS Service Log Integration                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Lambda                                                     │
│  ├─ Automatic: All console.log() output                     │
│  └─ Log Group: /aws/lambda/function-name                    │
│                                                             │
│  EC2 (via CloudWatch Agent)                                 │
│  ├─ System logs: /var/log/messages, /var/log/syslog         │
│  ├─ Application logs: Custom paths                          │
│  └─ Log Group: Custom (e.g., /aws/ec2/myapp)                │
│                                                             │
│  RDS                                                        │
│  ├─ Error logs, slow query logs, general logs               │
│  └─ Log Group: /aws/rds/instance/db-name/logtype            │
│                                                             │
│  VPC Flow Logs                                              │
│  ├─ Network traffic logs                                    │
│  └─ Log Group: Custom (e.g., /aws/vpc/flowlogs)             │
│                                                             │
│  CloudTrail                                                 │
│  ├─ API activity logs                                       │
│  └─ Log Group: /aws/cloudtrail/logs                         │
│                                                             │
│  API Gateway                                                │
│  ├─ Execution logs, access logs                             │
│  └─ Log Group: API-Gateway-Execution-Logs_api-id/stage      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Log Insights

```
┌─────────────────────────────────────────────────────────────┐
│          CloudWatch Logs Insights                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Purpose: Query and analyze log data using SQL-like syntax  │
│                                                             │
│  Example Query: Find errors in last hour                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │  fields @timestamp, @message                       │     │
│  │  | filter @message like /ERROR/                    │     │
│  │  | sort @timestamp desc                            │     │
│  │  | limit 100                                       │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  Example Query: Count requests by status code               │
│  ┌────────────────────────────────────────────────────┐     │
│  │  fields statusCode                                 │     │
│  │  | stats count() by statusCode                     │     │
│  │  | sort count desc                                 │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  Example Query: Average response time                       │
│  ┌────────────────────────────────────────────────────┐     │
│  │  fields @timestamp, duration                       │     │
│  │  | stats avg(duration) as avg_duration             │     │
│  │        by bin(5m)                                  │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  Built-in Fields:                                           │
│  ├─ @timestamp: Event timestamp                             │
│  ├─ @message: Log message                                   │
│  ├─ @logStream: Log stream name                             │
│  └─ @log: Log group identifier                              │
│                                                             │
│  Capabilities:                                              │
│  ├─ Filter and search logs                                  │
│  ├─ Aggregate and calculate statistics                      │
│  ├─ Visualize data with charts                              │
│  ├─ Save queries for reuse                                  │
│  └─ Export results to S3                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Metric Filters

```
┌─────────────────────────────────────────────────────────────┐
│          Metric Filters                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Purpose: Extract metrics from logs and create alarms       │
│                                                             │
│  Workflow:                                                  │
│  ┌────────────────────────────────────────────────────┐     │
│  │  1. Application writes logs                        │     │
│  │     [ERROR] Database connection failed             │     │
│  └────────────────┬───────────────────────────────────┘     │
│                   │                                         │
│                   ▼                                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │  2. CloudWatch Logs receives log events            │     │
│  │     Log Group: /aws/application/myapp              │     │
│  └────────────────┬───────────────────────────────────┘     │
│                   │                                         │
│                   ▼                                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │  3. Metric Filter matches pattern                  │     │
│  │     Pattern: [ERROR]                               │     │
│  │     Metric: ErrorCount                             │     │
│  │     Value: 1 (increment per match)                 │     │
│  └────────────────┬───────────────────────────────────┘     │
│                   │                                         │
│                   ▼                                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │  4. CloudWatch Metric created                      │     │
│  │     Namespace: MyApp/Errors                        │     │
│  │     Metric: ErrorCount                             │     │
│  └────────────────┬───────────────────────────────────┘     │
│                   │                                         │
│                   ▼                                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │  5. CloudWatch Alarm monitors metric               │     │
│  │     Alert if ErrorCount > 10 in 5 minutes          │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  Common Use Cases:                                          │
│  ├─ Count error occurrences                                 │
│  ├─ Track specific event patterns                           │
│  ├─ Monitor application-level metrics                       │
│  └─ Alert on log-based conditions                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Log Retention and Export

```
Retention Policies
├─ Never expire (default for some log groups)
├─ 1 day to 10 years
├─ Configure per log group
└─ Reduces costs for old logs

Export to S3
├─ Long-term archival
├─ Compliance requirements
├─ Analysis with Athena or other tools
└─ CreateExportTask API or console

Streaming to Other Services
├─ Kinesis Data Streams (real-time processing)
├─ Kinesis Data Firehose (delivery to S3, Elasticsearch)
└─ Lambda (real-time processing and alerting)
```

## Amazon EventBridge

### What is EventBridge?

**Amazon EventBridge** (formerly CloudWatch Events) is a serverless event bus service that enables event-driven architectures by connecting applications using events.

### EventBridge Architecture

```
┌─────────────────────────────────────────────────────────────┐
│          EventBridge Event Flow                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Event Sources                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  AWS Services                                      │     │
│  │  ├─ EC2 state changes                              │     │
│  │  ├─ Auto Scaling events                            │     │
│  │  ├─ CloudTrail API calls                           │     │
│  │  └─ 90+ AWS services                               │     │
│  └────────────────┬───────────────────────────────────┘     │
│                   │                                         │
│  ┌────────────────▼───────────────────────────────────┐     │
│  │  Custom Applications                               │     │
│  │  └─ PutEvents API                                  │     │
│  └────────────────┬───────────────────────────────────┘     │
│                   │                                         │
│  ┌────────────────▼───────────────────────────────────┐     │
│  │  SaaS Partners                                     │     │
│  │  ├─ Datadog, PagerDuty, Zendesk                    │     │
│  │  └─ Auth0, MongoDB, Shopify                        │     │
│  └────────────────┬───────────────────────────────────┘     │
│                   │                                         │
│                   │ Emit Events                             │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  EventBridge Event Bus                               │   │
│  │  (default, custom, or partner event bus)             │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│                   │ Match Event Patterns                    │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  EventBridge Rules                                   │   │
│  │  Rule 1: EC2 state = "stopping" → Lambda             │   │
│  │  Rule 2: S3 object created → SNS                     │   │
│  │  Rule 3: Schedule (cron) → ECS task                  │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│                   │ Route to Targets                        │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Targets                                             │   │
│  │  ├─ Lambda functions                                 │   │
│  │  ├─ SNS topics                                       │   │
│  │  ├─ SQS queues                                       │   │
│  │  ├─ Kinesis streams                                  │   │
│  │  ├─ Step Functions                                   │   │
│  │  ├─ ECS tasks                                        │   │
│  │  ├─ Systems Manager Run Command                      │   │
│  │  └─ 20+ target types                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Event Pattern Examples

```
┌─────────────────────────────────────────────────────────────┐
│          EventBridge Event Patterns                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Example 1: EC2 Instance State Change                       │
│  {                                                          │
│    "source": ["aws.ec2"],                                   │
│    "detail-type": ["EC2 Instance State-change Notification"],
│    "detail": {                                              │
│      "state": ["terminated"]                                │
│    }                                                        │
│  }                                                          │
│  → Trigger when any EC2 instance is terminated              │
│                                                             │
│  Example 2: Scheduled Event (Cron)                          │
│  Schedule: cron(0 12 * * ? *)                               │
│  → Trigger every day at 12:00 PM UTC                        │
│                                                             │
│  Example 3: Custom Application Event                        │
│  {                                                          │
│    "source": ["myapp.orders"],                              │
│    "detail-type": ["Order Placed"],                         │
│    "detail": {                                              │
│      "amount": [{"numeric": [">", 1000]}]                   │
│    }                                                        │
│  }                                                          │
│  → Trigger when order amount > $1000                        │
│                                                             │
│  Example 4: S3 Event via CloudTrail                         │
│  {                                                          │
│    "source": ["aws.s3"],                                    │
│    "detail-type": ["AWS API Call via CloudTrail"],          │
│    "detail": {                                              │
│      "eventName": ["PutObject"],                            │
│      "requestParameters": {                                 │
│        "bucketName": ["my-important-bucket"]                │
│      }                                                      │
│    }                                                        │
│  }                                                          │
│  → Trigger when object uploaded to specific bucket          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### EventBridge Use Cases

```
Event-Driven Automation
├─ Auto-remediation (restart failed instance)
├─ Resource tagging (tag new resources automatically)
└─ Compliance checks (detect and fix misconfigurations)

Scheduled Tasks
├─ Daily backups (snapshot EBS volumes)
├─ Cleanup jobs (delete old logs, temp files)
└─ Report generation

Application Integration
├─ Microservices communication
├─ Order processing workflows
└─ Real-time notifications

Cross-Account Event Delivery
├─ Centralized monitoring
├─ Multi-account governance
└─ Security incident response
```

## CloudWatch Dashboards

### What are Dashboards?

**CloudWatch Dashboards** are customizable pages in the CloudWatch console that display metrics and alarms for your resources in one view.

```
┌─────────────────────────────────────────────────────────────┐
│          CloudWatch Dashboard Example                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Dashboard: Production Application Overview                 │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐         │
│  │  EC2 CPU Usage       │  │  RDS Connections     │         │
│  │  ┌────────────────┐  │  │  ┌────────────────┐  │         │
│  │  │     ╱╲  ╱╲      │  │  │  │    ┌───────── │  │         │
│  │  │    ╱  ╲╱  ╲     │  │  │  │  ──┘          │  │         │
│  │  │   ╱        ╲    │  │  │  │               │  │         │
│  │  │  ╱          ╲   │  │  │  │               │  │         │
│  │  └────────────────┘  │  │  └────────────────┘  │         │
│  │  Current: 45%        │  │  Current: 23         │         │
│  └──────────────────────┘  └──────────────────────┘         │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐         │
│  │  ALB Request Count   │  │  Lambda Errors       │         │
│  │  ┌────────────────┐  │  │  ┌────────────────┐  │         │
│  │  │  ████████████  │  │  │  │  █             │  │         │
│  │  │  ████████████  │  │  │  │  █ █           │  │         │
│  │  │  ████████████  │  │  │  │  █ █ █         │  │         │
│  │  │  ████████████  │  │  │  │  █ █ █ █       │  │         │
│  │  └────────────────┘  │  │  └────────────────┘  │         │
│  │  Total: 15.2K        │  │  Total: 4            │         │
│  └──────────────────────┘  └──────────────────────┘         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Active Alarms                                       │   │
│  │  • High CPU on i-123456 (AZ: us-east-1a)             │   │
│  │  • All other alarms OK                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

```
Widget Types
├─ Line graphs: Time-series metrics
├─ Number widgets: Single metric value
├─ Bar charts: Compare metrics
├─ Pie charts: Distribution
├─ Logs widget: Log Insights query results
├─ Alarms widget: Alarm status
└─ Text widget: Markdown documentation

Dashboard Features
├─ Multiple metrics per widget
├─ Cross-region metrics
├─ Cross-account metrics
├─ Automatic refresh
├─ Time range selection
└─ Sharing via URL
```

## AWS X-Ray (Distributed Tracing)

### What is X-Ray?

**AWS X-Ray** helps developers analyze and debug distributed applications by providing end-to-end request tracing.

```
┌─────────────────────────────────────────────────────────────┐
│          X-Ray Service Map                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Request → API Gateway → Lambda → DynamoDB             │
│                     │                                       │
│                     └──────> S3                             │
│                                                             │
│  Trace ID: 1-67891234-12456789abcdef012345678               │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Request Timeline                                  │     │
│  │                                                    │     │
│  │  API Gateway ████░░░░░░ 150ms                      │     │
│  │  Lambda      ░░░░████░░ 400ms                      │     │
│  │    └─ DynamoDB   ░░░░██░░ 50ms                     │     │
│  │    └─ S3         ░░░░░░██ 30ms                     │     │
│  │                                                    │     │
│  │  Total: 480ms                                      │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  X-Ray identifies:                                          │
│  ├─ Performance bottlenecks                                 │
│  ├─ Error root causes                                       │
│  ├─ Service dependencies                                    │
│  └─ Request path visualization                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Best Practices

```
┌─────────────────────────────────────────────────────────────┐
│          Monitoring Best Practices                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Metrics                                                    │
│  ├─ Enable detailed monitoring for critical resources       │
│  ├─ Use custom metrics for application-level monitoring     │
│  ├─ Create dashboards for operational visibility            │
│  └─ Set appropriate alarm thresholds (avoid false positives)│
│                                                             │
│  Alarms                                                     │
│  ├─ Use composite alarms for complex conditions             │
│  ├─ Configure multiple notification targets                 │
│  ├─ Test alarms by manually setting state                   │
│  └─ Document alarm response procedures                      │
│                                                             │
│  Logs                                                       │
│  ├─ Centralize logs from all applications and services      │
│  ├─ Set appropriate retention policies                      │
│  ├─ Use structured logging (JSON) for better querying       │
│  ├─ Create metric filters for key application events        │
│  └─ Use Log Insights for troubleshooting and analysis       │
│                                                             │
│  Cost Optimization                                          │
│  ├─ Set log retention based on compliance requirements      │
│  ├─ Export infrequently accessed logs to S3                 │
│  ├─ Use CloudWatch Logs Insights instead of streaming all   │
│  └─ Delete unused custom metrics and dashboards             │
│                                                             │
│  Security                                                   │
│  ├─ Encrypt log data at rest using KMS                      │
│  ├─ Use IAM policies to control access to logs              │
│  ├─ Enable CloudTrail for API activity logging              │
│  └─ Monitor for security events and anomalies               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Summary

**Key Takeaways:**

1. **CloudWatch Metrics** provide time-series data for resource monitoring
2. **CloudWatch Alarms** automate responses to metric thresholds
3. **CloudWatch Logs** centralize log management across AWS resources
4. **Log Insights** enables SQL-like queries for log analysis
5. **Metric Filters** extract CloudWatch metrics from log data
6. **EventBridge** enables event-driven architectures and automation
7. **Dashboards** provide unified visualization of metrics and alarms
8. **X-Ray** offers distributed tracing for debugging applications

**Best Practices:**

- Implement comprehensive monitoring for all critical resources
- Set up actionable alarms with appropriate thresholds
- Use composite alarms to reduce false positives
- Centralize logs in CloudWatch Logs for all applications
- Implement log retention policies to manage costs
- Create metric filters for key application events
- Use EventBridge for event-driven automation and remediation
- Build operational dashboards for different teams and purposes
- Enable detailed monitoring for production workloads
- Use structured logging (JSON) for easier analysis
- Regularly review and optimize monitoring costs
- Test alarm notifications and runbook procedures
- Use X-Ray for performance troubleshooting in distributed systems

