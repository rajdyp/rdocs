---
title: Application Integration
linkTitle: Application Integration
type: docs
weight: 12
prev: /aws/11-monitoring-observability
next: /aws/13-cost-management
---

## Overview

Modern cloud applications are built as distributed systems with multiple independent components. AWS provides services to decouple these components, enabling them to communicate reliably, scale independently, and fail gracefully. This chapter covers the foundational services for building loosely coupled, event-driven architectures.

## Messaging Fundamentals

### Why Decouple Applications?

```
┌─────────────────────────────────────────────────────────────┐
│          Tightly Coupled vs Loosely Coupled                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tightly Coupled (Synchronous)                              │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐           │
│  │  Web App │─────>│ Order    │─────>│ Inventory│           │
│  │          │<─────│ Service  │<─────│ Service  │           │
│  └──────────┘      └──────────┘      └──────────┘           │
│       ▲                                      │              │
│       └──────────────────────────────────────┘              │
│            Direct, synchronous calls                        │
│                                                             │
│  Problems:                                                  │
│  ├─ One service failure breaks entire flow                  │
│  ├─ Difficult to scale components independently             │
│  ├─ High latency (wait for each response)                   │
│  └─ Cascading failures                                      │
│                                                             │
│  Loosely Coupled (Asynchronous with Queue)                  │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐           │
│  │  Web App │─────>│   SQS    │<─────│ Order    │           │
│  │          │      │  Queue   │      │ Service  │           │
│  └──────────┘      └────┬─────┘      └──────────┘           │
│                         │                                   │
│                         ▼                                   │
│                    ┌──────────┐                             │
│                    │Inventory │                             │
│                    │ Service  │                             │
│                    └──────────┘                             │
│                                                             │
│  Benefits:                                                  │
│  ├─ Services can fail independently                         │
│  ├─ Each service scales independently                       │
│  ├─ Low latency (async processing)                          │
│  ├─ Better fault tolerance                                  │
│  └─ Flexible processing (retry, delay, batch)               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Amazon Simple Notification Service (SNS)

### What is SNS?

**Amazon SNS** is a fully managed pub/sub messaging service that enables you to send messages to multiple subscribers through a "fan-out" pattern.

### SNS Architecture

```
┌─────────────────────────────────────────────────────────────┐
│          SNS Pub/Sub Architecture                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Publishers                                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Application Code                                    │   │
│  │  EC2 Instance                                        │   │
│  │  Lambda Function                                     │   │
│  │  CloudWatch Alarm                                    │   │
│  │  S3 Event                                            │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│                   │ Publish Message                         │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SNS Topic: OrderPlaced                              │   │
│  │  arn:aws:sns:us-east-1:123456789012:OrderPlaced      │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│          Fan-out to all subscribers                         │
│                   │                                         │
│       ┌───────────┼───────────┬───────────┐                 │
│       │           │           │           │                 │
│       ▼           ▼           ▼           ▼                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  │  SQS    │ │ Lambda  │ │  Email  │ │  SMS    │            │
│  │  Queue  │ │Function │ │Subscrip.│ │Subscrip.│            │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │
│  Inventory   Send receipt  Notify ops  Alert                │
│  processing  to customer   team        manager              │
│                                                             │
│  Key Characteristics:                                       │
│  ├─ Push-based (SNS pushes to subscribers)                  │
│  ├─ One-to-many (fan-out pattern)                           │
│  ├─ No message persistence (deliver and forget)             │
│  ├─ Multiple subscription protocols                         │
│  └─ Message filtering per subscription                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### SNS Subscription Protocols

```
┌─────────────────────────────────────────────────────────────┐
│          SNS Subscription Types                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SQS Queue                                                  │
│  ├─ SNS delivers messages to SQS queue                      │
│  ├─ Enables buffering and async processing                  │
│  └─ Use case: Fan-out to multiple processing queues         │
│                                                             │
│  Lambda Function                                            │
│  ├─ SNS invokes Lambda function with message                │
│  ├─ Serverless event processing                             │
│  └─ Use case: Real-time data processing, notifications      │
│                                                             │
│  HTTP/HTTPS Endpoint                                        │
│  ├─ SNS sends POST request to webhook                       │
│  ├─ Integration with external services                      │
│  └─ Use case: Third-party integrations, microservices       │
│                                                             │
│  Email / Email-JSON                                         │
│  ├─ SNS sends email to address                              │
│  ├─ Requires confirmation                                   │
│  └─ Use case: Operational alerts, human notifications       │
│                                                             │
│  SMS                                                        │
│  ├─ SNS sends text message                                  │
│  ├─ Mobile number notifications                             │
│  └─ Use case: Critical alerts, 2FA codes                    │
│                                                             │
│  Mobile Push                                                │
│  ├─ Push notifications to mobile apps                       │
│  ├─ Supports: Apple, Google, Amazon, Microsoft              │
│  └─ Use case: Mobile app notifications                      │
│                                                             │
│  Kinesis Data Firehose                                      │
│  ├─ Stream messages to data lakes                           │
│  └─ Use case: Analytics, archival                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### SNS Message Filtering

```
┌─────────────────────────────────────────────────────────────┐
│          SNS Message Filtering                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Problem: All subscribers receive all messages              │
│  Solution: Filter messages at subscription level            │
│                                                             │
│  Example: E-commerce Order Topic                            │
│                                                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │  SNS Topic: Orders                                 │     │
│  │  Messages include attribute: "order_type"          │     │
│  └────────────────┬───────────────────────────────────┘     │
│                   │                                         │
│          ┌────────┼────────┬──────────┐                     │
│          │        │        │          │                     │
│          ▼        ▼        ▼          ▼                     │
│  ┌─────────┐ ┌─────────┐ ┌────────┐ ┌────────┐              │
│  │Standard │ │Express  │ │Premium │ │  All   │              │
│  │  Queue  │ │ Queue   │ │ Queue  │ │ Queue  │              │
│  └─────────┘ └─────────┘ └────────┘ └────────┘              │
│                                                             │
│  Filter Policy Examples:                                    │
│                                                             │
│  Standard Queue Filter:                                     │
│  {                                                          │
│    "order_type": ["standard"]                               │
│  }                                                          │
│  → Receives only standard orders                            │
│                                                             │
│  Express Queue Filter:                                      │
│  {                                                          │
│    "order_type": ["express"]                                │
│  }                                                          │
│  → Receives only express orders                             │
│                                                             │
│  Premium Queue Filter:                                      │
│  {                                                          │
│    "order_type": ["premium"],                               │
│    "price": [{"numeric": [">", 1000]}]                      │
│  }                                                          │
│  → Receives only premium orders over $1000                  │
│                                                             │
│  All Orders Queue: No filter (receives everything)          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### SNS Use Cases

```
Application Alerts and Notifications
├─ CloudWatch Alarm → SNS → Email/SMS
├─ System health monitoring
└─ Critical error notifications

Fan-Out Pattern
├─ One event triggers multiple workflows
├─ Order placed → Inventory, Billing, Shipping
└─ SNS → Multiple SQS queues for parallel processing

Mobile Push Notifications
├─ User engagement messages
├─ Breaking news alerts
└─ In-app notifications

Workflow Coordination
├─ Trigger Lambda functions
├─ Start Step Functions workflows
└─ Cross-service integration
```

### SNS Message Structure

```
SNS Message Attributes
├─ Message: The actual content (up to 256 KB)
├─ Subject: Optional subject line (100 characters)
├─ Message Attributes: Metadata key-value pairs
├─ Message ID: Unique identifier
└─ Timestamp: When published

Example SNS Message:
{
  "Type": "Notification",
  "MessageId": "abc-123",
  "TopicArn": "arn:aws:sns:us-east-1:123:OrderTopic",
  "Subject": "New Order Placed",
  "Message": "{\"orderId\": \"12345\", \"amount\": 99.99}",
  "Timestamp": "2024-01-15T10:00:00.000Z",
  "MessageAttributes": {
    "order_type": {
      "Type": "String",
      "Value": "express"
    }
  }
}
```

## Amazon Simple Queue Service (SQS)

### What is SQS?

**Amazon SQS** is a fully managed message queuing service that enables decoupling and scaling of distributed systems and microservices.

### SQS Architecture

```
┌─────────────────────────────────────────────────────────────┐
│          SQS Queue Architecture                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Producers                           Consumers              │
│  ┌──────────┐                        ┌──────────┐           │
│  │  Web App │                        │  Worker  │           │
│  │          │                        │Instance 1│           │
│  └────┬─────┘                        └────▲─────┘           │
│       │                                   │                 │
│  ┌────▼─────┐                        ┌────┴─────┐           │
│  │  API     │                        │  Worker  │           │
│  │  Server  │                        │Instance 2│           │
│  └────┬─────┘                        └────▲─────┘           │
│       │                                   │                 │
│       │ Send Messages                     │ Poll for        │
│       │                                   │ Messages        │
│       ▼                                   │                 │
│  ┌──────────────────────────────────────────┐               │
│  │  SQS Queue: TaskQueue                    │               │
│  │  ┌────────────────────────────────┐      │               │
│  │  │  Message 1                     │      │               │
│  │  │  Message 2                     │      │               │
│  │  │  Message 3                     │      │               │
│  │  │  Message 4                     │      │               │
│  │  │  ...                           │      │               │
│  │  └────────────────────────────────┘      │               │
│  └──────────────────────────────────────────┘               │
│                                                             │
│  Message Lifecycle:                                         │
│  1. Producer sends message to queue                         │
│  2. Message stored across multiple servers (redundant)      │
│  3. Consumer polls and receives message                     │
│  4. Message hidden during processing (visibility timeout)   │
│  5. Consumer processes and deletes message                  │
│  6. If not deleted, message reappears after timeout         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Standard Queue vs FIFO Queue

```
┌─────────────────────────────────────────────────────────────┐
│          SQS Queue Types Comparison                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Standard Queue (Default)                                   │
│  ├─ Throughput: Nearly unlimited                            │
│  ├─ Delivery: At-least-once (may deliver duplicates)        │
│  ├─ Ordering: Best-effort (not guaranteed)                  │
│  ├─ Use case: High throughput, order not critical           │
│  └─ Example: Log processing, batch jobs                     │
│                                                             │
│  Message Flow (Standard):                                   │
│  Sent: A → B → C → D                                        │
│  Received: A → C → B → D → C (duplicate)                    │
│           ↑                   ↑                             │
│           Out of order        Duplicate                     │
│                                                             │
│  FIFO Queue (First-In-First-Out)                            │
│  ├─ Throughput: 300 msg/sec (3000 with batching)            │
│  ├─ Delivery: Exactly-once processing                       │
│  ├─ Ordering: Strict ordering preserved                     │
│  ├─ Deduplication: Content or message ID based              │
│  ├─ Must end with: .fifo suffix                             │
│  ├─ Use case: Order matters, no duplicates                  │
│  └─ Example: Financial transactions, command ordering       │
│                                                             │
│  Message Flow (FIFO):                                       │
│  Sent: A → B → C → D                                        │
│  Received: A → B → C → D                                    │
│           ↑                                                 │
│           Exact order, no duplicates                        │
│                                                             │
│  Feature Comparison:                                        │
│  ┌──────────────────┬────────────┬──────────────┐           │
│  │ Feature          │  Standard  │    FIFO      │           │
│  ├──────────────────┼────────────┼──────────────┤           │
│  │ Throughput       │ Unlimited  │  Limited     │           │
│  │ Ordering         │ Best-effort│  Guaranteed  │           │
│  │ Duplicates       │ Possible   │  Prevented   │           │
│  │ Complexity       │ Low        │  Higher      │           │
│  │ Cost             │ Lower      │  Slightly +  │           │
│  └──────────────────┴────────────┴──────────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### SQS Key Concepts

```
┌─────────────────────────────────────────────────────────────┐
│          SQS Configuration Parameters                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Visibility Timeout (0 seconds - 12 hours)                  │
│  ├─ Time message is hidden after being received             │
│  ├─ Default: 30 seconds                                     │
│  ├─ Consumer must delete or it reappears                    │
│  └─ Can be changed per message                              │
│                                                             │
│  Timeline:                                                  │
│  T0: Consumer receives message                              │
│  T0-T30: Message invisible to other consumers               │
│  T15: Consumer extends visibility timeout (if needed)       │
│  T25: Consumer completes processing, deletes message        │
│       OR                                                    │
│  T30: Timeout expires, message visible again (retry)        │
│                                                             │
│  Message Retention (1 minute - 14 days)                     │
│  ├─ How long message stays in queue                         │
│  ├─ Default: 4 days                                         │
│  └─ After retention, message automatically deleted          │
│                                                             │
│  Delivery Delay (0 seconds - 15 minutes)                    │
│  ├─ Delay before message becomes available                  │
│  ├─ Default: 0 seconds                                      │
│  └─ Use case: Rate limiting, scheduled tasks                │
│                                                             │
│  Receive Message Wait Time (0-20 seconds)                   │
│  ├─ Long polling: Wait if queue empty                       │
│  ├─ Short polling: Return immediately if empty              │
│  ├─ Long polling recommended (reduces costs)                │
│  └─ Default: 0 seconds (short polling)                      │
│                                                             │
│  Maximum Message Size                                       │
│  ├─ Up to 256 KB                                            │
│  └─ For larger: Store in S3, send S3 reference              │
│                                                             │
│  Dead-Letter Queue (DLQ)                                    │
│  ├─ Target queue for failed messages                        │
│  ├─ After maxReceiveCount, move to DLQ                      │
│  └─ Use case: Handle poison messages, debugging             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Dead-Letter Queue Pattern

```
┌─────────────────────────────────────────────────────────────┐
│          Dead-Letter Queue (DLQ) Workflow                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Source Queue: OrderProcessing                       │   │
│  │  MaxReceiveCount: 3                                  │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│                   │ Consumer receives message               │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Processing Attempt 1: Failed (exception)            │   │
│  │  Processing Attempt 2: Failed (exception)            │   │
│  │  Processing Attempt 3: Failed (exception)            │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│                   │ MaxReceiveCount exceeded                │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Dead-Letter Queue: OrderProcessing-DLQ              │   │
│  │  ├─ Message moved automatically                      │   │
│  │  ├─ Original message metadata preserved              │   │
│  │  └─ Available for investigation                      │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Actions:                                            │   │
│  │  ├─ CloudWatch Alarm on DLQ depth                    │   │
│  │  ├─ Manual inspection and debugging                  │   │
│  │  ├─ Fix issue and replay messages                    │   │
│  │  └─ Redrive back to source queue (after fix)         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  Benefits:                                                  │
│  ├─ Isolate problematic messages                            │
│  ├─ Prevent blocking healthy message processing             │
│  ├─ Investigate root causes                                 │
│  └─ Replay messages after fixing issues                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### SQS Use Cases

```
Decoupling Microservices
├─ Order service → Queue → Inventory service
├─ Each service scales independently
└─ Failure isolation

Buffering and Batch Processing
├─ Handle traffic spikes
├─ Batch process for efficiency
└─ Rate limiting to downstream systems

Asynchronous Processing
├─ Image resize: Upload → Queue → Worker
├─ Video transcoding
└─ Report generation

Work Distribution
├─ Distribute tasks to multiple workers
├─ Load leveling
└─ Priority queues (separate queues per priority)
```

## AWS Lambda Fundamentals

### What is AWS Lambda?

**AWS Lambda** is a serverless compute service that runs your code in response to events without provisioning or managing servers.

### Lambda Architecture

```
┌─────────────────────────────────────────────────────────────┐
│          Lambda Execution Model                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Event Sources (Triggers)                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │  API Gateway, S3, DynamoDB, SQS, SNS, EventBridge, │     │
│  │  CloudWatch Events, Kinesis, ALB, and more...      │     │
│  └────────────────┬───────────────────────────────────┘     │
│                   │                                         │
│                   │ Invokes                                 │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Lambda Service                                      │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Execution Environment (Container)             │  │   │
│  │  │  ┌──────────────────────────────────────────┐  │  │   │
│  │  │  │  Your Function Code                      │  │  │   │
│  │  │  │  • Runtime (Python, Node.js, Java, etc.) │  │  │   │
│  │  │  │  • Dependencies/Libraries                │  │  │   │
│  │  │  │  • Environment variables                 │  │  │   │
│  │  │  │  • IAM role for permissions              │  │  │   │
│  │  │  └──────────────────────────────────────────┘  │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│                   │ Returns response                        │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Destinations                                        │   │
│  │  • API response                                      │   │
│  │  • Write to DynamoDB, S3                             │   │
│  │  • Send to SQS, SNS                                  │   │
│  │  • Invoke another Lambda                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  Key Characteristics:                                       │
│  ├─ No servers to manage                                    │
│  ├─ Automatic scaling (0 to thousands of concurrent)        │
│  ├─ Pay only for compute time used (100ms increments)       │
│  ├─ Timeout: Up to 15 minutes                               │
│  ├─ Memory: 128 MB to 10,240 MB                             │
│  └─ CPU scales with memory allocation                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Lambda Invocation Types

```
┌─────────────────────────────────────────────────────────────┐
│          Lambda Invocation Models                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Synchronous (Request-Response)                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Client → Lambda                                   │     │
│  │           ├─ Executes function                     │     │
│  │           └─ Returns response                      │     │
│  │  Client ← Lambda (waits for response)              │     │
│  └────────────────────────────────────────────────────┘     │
│  Sources: API Gateway, CLI, SDK                             │
│  Use case: REST APIs, real-time processing                  │
│                                                             │
│  Asynchronous (Event-Based)                                 │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Event Source → Lambda                             │     │
│  │                 ├─ Queues event                    │     │
│  │                 └─ Returns 202 Accepted            │     │
│  │  Event Source ← Lambda (immediate response)        │     │
│  │                                                    │     │
│  │  Lambda processes event in background              │     │
│  └────────────────────────────────────────────────────┘     │
│  Sources: S3, SNS, EventBridge                              │
│  Retry: 2 automatic retries on failure                      │
│  Use case: Event processing, notifications                  │
│                                                             │
│  Polling (Stream/Queue)                                     │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Lambda polls Event Source                         │     │
│  │         ├─ SQS, Kinesis, DynamoDB Streams          │     │
│  │         └─ Invokes function with batch             │     │
│  │  Lambda processes batch                            │     │
│  │         └─ Deletes messages if successful          │     │
│  └────────────────────────────────────────────────────┘     │
│  Sources: SQS, Kinesis, DynamoDB Streams                    │
│  Use case: Stream processing, queue processing              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Lambda with SQS Integration

```
┌─────────────────────────────────────────────────────────────┐
│          Lambda Processing SQS Messages                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SQS Queue                                           │   │
│  │  ├─ Message 1                                        │   │
│  │  ├─ Message 2                                        │   │
│  │  └─ Message 3                                        │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│                   │ Lambda polls queue                      │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Lambda Event Source Mapping                         │   │
│  │  ├─ Polls queue every few seconds                    │   │
│  │  ├─ Retrieves batch of messages (1-10)               │   │
│  │  └─ Invokes Lambda with batch                        │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Lambda Function                                     │   │
│  │  ├─ Processes each message in batch                  │   │
│  │  ├─ If all succeed: Messages deleted from queue      │   │
│  │  ├─ If any fail: Entire batch returned to queue      │   │
│  │  └─ After maxReceiveCount: Move to DLQ               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  Configuration:                                             │
│  ├─ Batch size: 1-10 messages (standard), 1-10000 (FIFO)    │
│  ├─ Batch window: Wait up to 5 min to fill batch            │
│  ├─ Concurrency: Multiple Lambda instances for scale        │
│  └─ Error handling: DLQ for failed messages                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Integration Patterns

### SNS + SQS Fan-Out Pattern

```
┌─────────────────────────────────────────────────────────────┐
│          SNS to SQS Fan-Out Pattern                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Use Case: One event, multiple independent processing flows │
│                                                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Event: Order Placed                               │     │
│  │  Publisher: Order Service                          │     │
│  └────────────────┬───────────────────────────────────┘     │
│                   │                                         │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SNS Topic: OrderEvents                              │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│          ┌────────┼────────┬────────┬─────────┐             │
│          │        │        │        │         │             │
│          ▼        ▼        ▼        ▼         ▼             │
│  ┌─────────┐ ┌────────┐ ┌──────┐ ┌──────┐ ┌─────────┐       │
│  │Inventory│ │Billing │ │Email │ │Ship- │ │Analytics│       │
│  │  Queue  │ │ Queue  │ │Queue │ │Queue │ │ Queue   │       │
│  └────┬────┘ └───┬────┘ └──┬───┘ └──┬───┘ └───┬─────┘       │
│       │          │         │        │         │             │
│       ▼          ▼         ▼        ▼         ▼             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │
│  │Lambda 1│ │Lambda 2│ │Lambda 3│ │Lambda 4│ │Lambda 5│     │
│  │Update  │ │Charge  │ │Send    │ │Create  │ │Record  │     │
│  │Inv.    │ │Card    │ │Receipt │ │Label   │ │Metrics │     │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘     │
│                                                             │
│  Benefits:                                                  │
│  ├─ Parallel processing (faster overall)                    │
│  ├─ Independent scaling per workflow                        │
│  ├─ Failure isolation (one fails, others continue)          │
│  ├─ Easy to add new workflows (subscribe new queue)         │
│  └─ Message persistence (queue buffers if consumer down)    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Priority Queue Pattern

```
Use Case: Process high-priority items first

┌──────────────────────────────────────────┐
│  Application                             │
└────────────────┬─────────────────────────┘
                 │
          ┌──────┴──────┐
          │             │
          ▼             ▼
┌──────────────┐ ┌──────────────┐
│ High Priority│ │ Low Priority │
│    Queue     │ │    Queue     │
└──────┬───────┘ └──────┬───────┘
       │                │
       ▼                ▼
┌──────────────┐ ┌──────────────┐
│  Lambda      │ │  Lambda      │
│  (Higher     │ │  (Lower      │
│  concurrency)│ │  concurrency)│
└──────────────┘ └──────────────┘

Implementation:
├─ Route messages to different queues based on priority
├─ Configure more Lambda concurrency for high-priority queue
└─ High-priority queue processed first
```

## Best Practices

```
┌─────────────────────────────────────────────────────────────┐
│          Application Integration Best Practices             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SNS Best Practices                                         │
│  ├─ Use message filtering to reduce unnecessary processing  │
│  ├─ Enable encryption at rest and in transit                │
│  ├─ Implement idempotency in subscribers                    │
│  ├─ Monitor DeliveryAttempts and failures                   │
│  └─ Use Dead Letter Queues for failed deliveries            │
│                                                             │
│  SQS Best Practices                                         │
│  ├─ Use long polling to reduce costs and latency            │
│  ├─ Set appropriate visibility timeout (task duration + buffer)
│  ├─ Implement Dead-Letter Queues for poison messages        │
│  ├─ Use FIFO queues only when ordering is critical          │
│  ├─ Batch operations to reduce API calls                    │
│  ├─ Monitor queue depth (ApproximateNumberOfMessages)       │
│  └─ Set alarms on DLQ depth                                 │
│                                                             │
│  Lambda Best Practices                                      │
│  ├─ Design functions to be stateless and idempotent         │
│  ├─ Set appropriate timeout (don't use 15 min default)      │
│  ├─ Set appropriate memory (affects CPU and cost)           │
│  ├─ Use environment variables for configuration             │
│  ├─ Minimize cold start impact (smaller package, warm-up)   │
│  ├─ Use AWS SDK efficiently (reuse clients)                 │
│  ├─ Handle partial batch failures in SQS processing         │
│  ├─ Monitor duration, errors, throttles in CloudWatch       │
│  └─ Use Lambda Insights for detailed observability          │
│                                                             │
│  Integration Patterns                                       │
│  ├─ Use SNS for fan-out to multiple consumers               │
│  ├─ Use SQS to decouple producers and consumers             │
│  ├─ Combine SNS + SQS for scalable fan-out with persistence │
│  ├─ Use DLQs for error handling and debugging               │
│  ├─ Implement retry logic with exponential backoff          │
│  └─ Design for idempotency (handle duplicate processing)    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Summary

**Key Takeaways:**

1. **SNS** enables pub/sub messaging with fan-out to multiple subscribers
2. **SQS** provides reliable message queuing for decoupling services
3. **Standard queues** offer unlimited throughput with best-effort ordering
4. **FIFO queues** guarantee ordering and exactly-once processing
5. **Dead-Letter Queues** isolate failed messages for debugging
6. **Lambda** runs code serverlessly in response to events
7. **SNS + SQS fan-out** enables parallel, independent processing workflows
8. **Message filtering** reduces unnecessary processing at subscription level

**Best Practices:**

- Decouple application components using queues and topics
- Use SNS for one-to-many messaging patterns
- Use SQS for reliable buffering and asynchronous processing
- Implement Dead-Letter Queues for error handling
- Choose FIFO queues only when ordering is critical
- Design Lambda functions to be stateless and idempotent
- Use long polling with SQS to reduce costs
- Set appropriate visibility timeouts based on processing time
- Monitor queue depth and set alarms for issues
- Combine SNS + SQS for scalable fan-out with message persistence
- Implement retry logic with exponential backoff
- Handle partial batch failures appropriately
- Use CloudWatch for monitoring message metrics and Lambda execution

