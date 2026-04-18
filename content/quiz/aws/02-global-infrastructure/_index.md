---
title: Global Infrastructure Quiz
linkTitle: Global Infrastructure
type: docs
weight: 2
prev: /quiz/aws/01-introduction
next: /quiz/aws/03-networking-fundamentals
---

{{< quiz id="aws-global-infrastructure-quiz" >}}
{
  "questions": [
    {
      "id": "aws-global-infrastructure-quiz-01",
      "type": "flashcard",
      "question": "Why are AWS Regions geographically separated?",
      "answer": "**Geographic Separation Provides Three Core Benefits:**\n\n- **Disaster recovery**: A failure in one Region does not affect others — protects against natural disasters, power outages, and infrastructure failures\n- **Data residency compliance**: AWS never moves data between Regions without explicit customer action — enables GDPR, data localization law compliance\n- **Business continuity**: Independent, isolated Regions prevent failure cascades across the global infrastructure\n\n*Side effects: pricing varies by Region; new services launch in us-east-1 first, then expand gradually.*"
    },
    {
      "id": "aws-global-infrastructure-quiz-02",
      "type": "multiple-select",
      "question": "Which factors should you consider when choosing an AWS Region for your application?",
      "options": [
        "Latency and user proximity",
        "Data sovereignty and compliance requirements",
        "Service availability in the Region",
        "Cost and pricing differences",
        "The number of Availability Zones in the Region",
        "The total number of edge locations adjacent to the Region"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "The five key factors for choosing a Region are: latency/user proximity, data sovereignty/compliance, service availability, cost, and disaster recovery requirements. The number of AZs and proximity to edge locations are not primary Region selection criteria — AZ count matters for architecture design within a chosen Region, and edge locations serve CloudFront content delivery, not core application deployment.",
      "hint": "The content lists five specific factors to consider when selecting a Region."
    },
    {
      "id": "aws-global-infrastructure-quiz-03",
      "type": "true-false",
      "question": "Availability Zones within a Region are connected via the public internet to ensure maximum accessibility.",
      "answer": false,
      "explanation": "False. Availability Zones within a Region are connected via low-latency, high-bandwidth, redundant fiber optic networks—not the public internet. This provides single-digit millisecond latency and enables synchronous replication.",
      "hint": "Consider what type of network would provide the best performance and security."
    },
    {
      "id": "aws-global-infrastructure-quiz-04",
      "type": "code-completion",
      "question": "Complete the ARN for an EC2 instance in the us-east-1 Region:",
      "instruction": "Fill in the missing partition identifier",
      "codeTemplate": "arn:___:ec2:us-east-1:123456789012:instance/i-1234567890abcdef0",
      "answer": "aws",
      "caseSensitive": false,
      "acceptedAnswers": ["aws"],
      "explanation": "The partition for standard AWS Regions is 'aws'. Other partitions include 'aws-cn' for AWS China Regions and 'aws-us-gov' for AWS GovCloud (US) Regions."
    },
    {
      "id": "aws-global-infrastructure-quiz-05",
      "type": "mcq",
      "question": "How many data centers does an Availability Zone contain?",
      "options": [
        "Exactly one data center",
        "Two or more data centers",
        "One or more discrete data centers",
        "At least three data centers"
      ],
      "answer": 2,
      "explanation": "An Availability Zone consists of one or more discrete data centers within an AWS Region. The minimum is one, but most AZs contain multiple data centers. 'Two or more' is a common near-miss — it applies the redundancy-requires-at-least-two logic incorrectly; the actual minimum per the definition is one.",
      "hint": "The definition mentions 'one or more' data centers."
    },
    {
      "id": "aws-global-infrastructure-quiz-06",
      "type": "fill-blank",
      "question": "What is the typical inter-AZ latency within a Region (in milliseconds)?",
      "answer": "single-digit milliseconds",
      "caseSensitive": false,
      "acceptedAnswers": ["single-digit milliseconds", "single-digit", "single digit milliseconds", "single digit"],
      "explanation": "Typical inter-AZ latency within a Region is single-digit milliseconds. This low latency enables synchronous replication for databases and storage systems.",
      "hint": "Think about the order of magnitude—less than 10ms."
    },
    {
      "id": "aws-global-infrastructure-quiz-07",
      "type": "multiple-select",
      "question": "Which of the following are characteristics of AWS Local Zones?",
      "options": [
        "Designed for single-digit millisecond latency",
        "All AWS services are available",
        "Associated with a parent AWS Region",
        "Connected via AWS's private network backbone",
        "Completely independent from AWS Regions"
      ],
      "answers": [0, 2, 3],
      "explanation": "Local Zones are designed for ultra-low (single-digit millisecond) latency, are associated with a parent AWS Region, and connected via AWS's private network. However, not all services are available in Local Zones (only select compute, storage, and database services), and they are not independent from Regions.",
      "hint": "Local Zones extend AWS infrastructure but have limitations compared to full Regions."
    },
    {
      "id": "aws-global-infrastructure-quiz-08",
      "type": "flashcard",
      "question": "What does Multi-AZ deployment provide?",
      "answer": "**High Availability and (enables) Fault Tolerance**\n\nDistributing resources across multiple Availability Zones within a Region provides:\n- Protection against AZ-level failures\n- Automatic failover capabilities\n- Continuous operation during infrastructure issues\n- Best practice: use at least 2 AZs for production (3+ preferred)"
    },
    {
      "id": "aws-global-infrastructure-quiz-09",
      "type": "drag-drop",
      "question": "Arrange these AWS Global Infrastructure components from largest to smallest scope:",
      "instruction": "Drag to arrange in order from broadest to most specific",
      "items": [
        "AWS Region",
        "Availability Zone",
        "Data Center",
        "AWS Global Infrastructure"
      ],
      "correctOrder": [3, 0, 1, 2],
      "explanation": "The hierarchy is: AWS Global Infrastructure (worldwide) → Region (geographic location) → Availability Zone (isolated location within Region) → Data Center (physical facility)."
    },
    {
      "id": "aws-global-infrastructure-quiz-10",
      "type": "code-output",
      "question": "Given this S3 bucket ARN, what can you determine about the bucket?",
      "code": "arn:aws:s3:::my-application-bucket",
      "language": "text",
      "options": [
        "The bucket is in us-east-1 and owned by account 123456789012",
        "The bucket name is globally unique and no region/account is specified in the ARN",
        "The bucket is a global resource accessible from all Regions",
        "The ARN is incomplete and missing required components"
      ],
      "answer": 1,
      "explanation": "S3 bucket ARNs do not include region or account ID because bucket names are globally unique across all AWS accounts. However, buckets themselves exist in a specific Region—the ARN format simply doesn't show it. Objects stay in their Region unless explicitly replicated.",
      "hint": "S3 bucket names must be globally unique, which affects the ARN format."
    },
    {
      "id": "aws-global-infrastructure-quiz-11",
      "type": "mcq",
      "question": "Which statement about IAM (Identity and Access Management) is most accurate?",
      "options": [
        "IAM is a regional service with separate configurations per Region",
        "IAM is a global service with no regional dependencies",
        "IAM is a global service but can have regional impact through services like STS",
        "IAM is a global service, but each AWS account has a home region where IAM data is primarily stored"
      ],
      "answer": 2,
      "explanation": "IAM is a global service, but it has regional dependencies. IAM uses AWS STS (Security Token Service) for temporary credentials, which has regional endpoints. If a region hosting STS fails, IAM operations in that region may be affected. IAM does not have a per-account home region — credential data replicates globally. Option A confuses IAM with regional services like EC2; option B misses the STS dependency; option D incorrectly applies the 'home region' concept (used by some other services) to IAM.",
      "hint": "Consider the relationship between IAM and Security Token Service (STS)."
    },
    {
      "id": "aws-global-infrastructure-quiz-12",
      "type": "true-false",
      "question": "Amazon S3 bucket names must be globally unique, but the data in buckets is always stored regionally.",
      "answer": true,
      "explanation": "True. S3 bucket names are globally unique (cannot be reused across accounts), but buckets exist in a specific Region and objects remain in that Region unless Cross-Region Replication (CRR) is configured.",
      "hint": "Think about the difference between naming and storage location."
    },
    {
      "id": "aws-global-infrastructure-quiz-13",
      "type": "multiple-select",
      "question": "Which AWS services are global in scope?",
      "options": [
        "IAM (Identity and Access Management)",
        "EC2 (Elastic Compute Cloud)",
        "Route 53 (DNS Service)",
        "Amazon S3 (Simple Storage Service)",
        "CloudFront (CDN)",
        "RDS (Relational Database Service)"
      ],
      "answers": [0, 2, 4],
      "explanation": "Global services include IAM, Route 53, CloudFront, and AWS Organizations. Regional services include EC2, RDS, and S3. S3 is a common misconception — because bucket names must be globally unique and buckets are accessible via global URLs, learners often assume S3 is a global service. However, S3 buckets exist in a specific Region and data stays there unless explicitly replicated via Cross-Region Replication.",
      "hint": "Global services typically relate to identity, DNS, or content delivery — not compute, storage, or databases."
    },
    {
      "id": "aws-global-infrastructure-quiz-14",
      "type": "mcq",
      "question": "What is the minimum recommended number of Availability Zones for production workloads?",
      "options": [
        "1 AZ is sufficient for cost optimization",
        "At least 2 AZs (3+ preferred)",
        "Exactly 3 AZs are required",
        "Running multiple EC2 instances in a single AZ achieves the same fault tolerance as Multi-AZ"
      ],
      "answer": 1,
      "explanation": "Best practice recommends using at least 2 Availability Zones for production workloads, with 3 or more preferred. Running multiple instances in a single AZ does not achieve the same fault tolerance — a power, network, or physical failure affecting that AZ would take down all instances simultaneously. Fault tolerance requires physical isolation across AZs, not just instance count.",
      "hint": "Think about the minimum needed for redundancy versus the ideal setup."
    },
    {
      "id": "aws-global-infrastructure-quiz-15",
      "type": "fill-blank",
      "question": "Traffic between AWS Regions stays on AWS's private ________ network and does not traverse the public internet.",
      "answer": "backbone",
      "caseSensitive": false,
      "explanation": "Regions are interconnected via AWS's private, high-speed global backbone network. Traffic between Regions stays on this AWS backbone and doesn't traverse the public internet, enabling secure, low-latency inter-region communication.",
      "hint": "It's a term referring to the main high-capacity network infrastructure."
    },
    {
      "id": "aws-global-infrastructure-quiz-16",
      "type": "code-completion",
      "question": "Complete the IAM role ARN:",
      "instruction": "Fill in what belongs in the region field for IAM resources",
      "codeTemplate": "arn:aws:iam:___:123456789012:role/MyApplicationRole",
      "answer": "",
      "caseSensitive": false,
      "acceptedAnswers": [""],
      "explanation": "IAM is a global service, so the region field is left empty (represented by ::). The ARN format shows two colons with nothing between them where the region would normally appear."
    },
    {
      "id": "aws-global-infrastructure-quiz-17",
      "type": "mcq",
      "question": "When would you use AWS Local Zones instead of standard Availability Zones?",
      "options": [
        "When you need access to all AWS services",
        "When you require sub-10ms latency for end users in specific geographic areas",
        "When you want the lowest possible cost",
        "When you need maximum disaster recovery options"
      ],
      "answer": 1,
      "explanation": "Local Zones are designed for applications requiring single-digit millisecond (sub-10ms) latency to end users in geographic areas not served by nearby AWS Regions. They're ideal for latency-sensitive workloads like media rendering and real-time gaming, though they have limited service availability.",
      "hint": "Local Zones prioritize one specific performance characteristic."
    },
    {
      "id": "aws-global-infrastructure-quiz-18",
      "type": "multiple-select",
      "question": "What information can you extract from this ARN: arn:aws:lambda:eu-west-1:123456789012:function:my-function",
      "options": [
        "The resource is a Lambda function",
        "The function is in the Europe (Ireland) region",
        "The function belongs to account ID 123456789012",
        "The function name is 'my-function'",
        "The function uses Python runtime",
        "The function's execution role is embedded in the ARN"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "From the ARN, you can determine: it's a Lambda function (service: lambda), located in eu-west-1 region, owned by account 123456789012, and named 'my-function'. The runtime language and execution role are not part of the ARN — they are separate configuration attributes stored in the function's settings, not encoded in its identifier.",
      "hint": "ARNs contain structural information (where, what, whose) but not runtime configuration details."
    },
    {
      "id": "aws-global-infrastructure-quiz-19",
      "type": "true-false",
      "question": "Resources in one AWS Region automatically replicate to other Regions for disaster recovery purposes.",
      "answer": false,
      "explanation": "False. Resources in one Region do not automatically replicate to another. Regions are designed to be completely independent and isolated. Cross-region replication must be explicitly configured using services like S3 Cross-Region Replication, DynamoDB Global Tables, or Aurora Global Database.",
      "hint": "Think about the principle of regional independence and isolation."
    },
    {
      "id": "aws-global-infrastructure-quiz-20",
      "type": "flashcard",
      "question": "What are the key components of an AWS ARN?",
      "answer": "**ARN Format: arn:partition:service:region:account-id:resource**\n\n- **Partition**: aws, aws-cn, or aws-us-gov\n- **Service**: The AWS service (ec2, s3, iam, lambda, etc.)\n- **Region**: AWS Region (omitted for global services)\n- **Account ID**: 12-digit AWS account (omitted for globally unique names)\n- **Resource**: Resource type and identifier (format varies by service)"
    },
    {
      "id": "aws-global-infrastructure-quiz-21",
      "type": "drag-drop",
      "question": "Arrange these deployment patterns from least resilient to most resilient:",
      "instruction": "Drag to order by increasing fault tolerance",
      "items": [
        "Multi-Region with Cross-Region Replication",
        "Single Region, Multi-AZ",
        "Single Region, Single AZ",
        "Multi-Region without data replication"
      ],
      "correctOrder": [2, 1, 3, 0],
      "explanation": "Resilience increases with geographic distribution and data availability: Single AZ (single point of failure) → Multi-AZ (protects against AZ failures, data is local) → Multi-Region without replication (infrastructure exists in multiple regions but data is not replicated, so a region failure means data loss or unavailability) → Multi-Region with Cross-Region Replication (full protection: infrastructure and data survive region-wide failures)."
    },
    {
      "id": "aws-global-infrastructure-quiz-22",
      "type": "mcq",
      "question": "Which architectural pattern provides protection against both AZ failures and region-wide failures?",
      "options": [
        "Single Region, Multi-AZ with automated Cross-Region backups",
        "Single Region, Multi-AZ deployment with RDS standby",
        "Multi-Region deployment with Cross-Region Replication",
        "Local Zone deployment with parent Region backup"
      ],
      "answer": 2,
      "explanation": "Multi-Region deployment with replication (CRR, Global Tables, Aurora Global Database) protects against both AZ-level and region-wide failures. Single Region Multi-AZ protects only against AZ failures. Cross-Region backups (option A) are a tempting near-miss — they provide data durability across regions but require manual failover with significant RTO/RPO, and do not provide automatic failover the way live replication does.",
      "hint": "Think about what's needed to survive a complete regional outage with automatic failover."
    },
    {
      "id": "aws-global-infrastructure-quiz-23",
      "type": "code-output",
      "question": "What does this IAM policy statement allow?",
      "code": "{\n  \"Effect\": \"Allow\",\n  \"Action\": \"s3:GetObject\",\n  \"Resource\": \"arn:aws:s3:::my-bucket/*\"\n}",
      "language": "json",
      "options": [
        "Read access to the bucket metadata only",
        "Read access to all objects in my-bucket",
        "Read and write access to all objects in my-bucket",
        "Access to all S3 buckets in the account"
      ],
      "answer": 1,
      "explanation": "This policy grants read access (GetObject) to all objects (`/*`) in the specific bucket 'my-bucket'. The wildcard (`*`) after the bucket name matches all object keys. It does not grant write access or access to other buckets.",
      "hint": "Focus on the Action (GetObject) and the Resource ARN with the wildcard."
    },
    {
      "id": "aws-global-infrastructure-quiz-24",
      "type": "true-false",
      "question": "Each AWS Availability Zone has independent power, cooling, and networking infrastructure to provide fault isolation.",
      "answer": true,
      "explanation": "True. Each AZ is designed with independent power, cooling, and networking infrastructure. This independence means that a failure in one AZ (power outage, network issue, etc.) should not affect other AZs within the same Region.",
      "hint": "This is a core design principle of Availability Zones."
    },
    {
      "id": "aws-global-infrastructure-quiz-25",
      "type": "multiple-select",
      "question": "Which services offer features for global distribution despite being regional by default?",
      "options": [
        "Amazon S3 with Cross-Region Replication",
        "DynamoDB with Global Tables",
        "Amazon Aurora with Global Database",
        "IAM with regional endpoints",
        "Amazon RDS with Multi-AZ deployment"
      ],
      "answers": [0, 1, 2],
      "explanation": "S3 (via Cross-Region Replication), DynamoDB (via Global Tables), and Aurora (via Global Database) are regional services with explicit global distribution features. IAM is already global (though it has regional STS dependencies, not a global distribution 'feature'). RDS Multi-AZ is a common trap — Multi-AZ means high availability within a single Region across multiple AZs, not global distribution across Regions.",
      "hint": "Look for services that explicitly mention cross-region or global replication capabilities."
    },
    {
      "id": "aws-global-infrastructure-quiz-26",
      "type": "mcq",
      "question": "What is the naming pattern for an AWS Local Zone in Boston associated with the us-east-1 Region?",
      "options": [
        "us-east-boston-1a",
        "us-east-1-bos-1a",
        "boston-us-east-1a",
        "lz-us-east-1-boston"
      ],
      "answer": 1,
      "explanation": "Local Zone identifiers follow the pattern: `<parent-region>-<metro-code>-<zone-id><letter>`. For Boston associated with us-east-1, it would be 'us-east-1-bos-1a'. Other examples include us-west-2-lax-1a (Los Angeles) and us-west-2-phx-1a (Phoenix).",
      "hint": "The format includes the parent region, a city abbreviation, and zone identifier."
    },
    {
      "id": "aws-global-infrastructure-quiz-27",
      "type": "flashcard",
      "question": "What are best practices for using Availability Zones?",
      "answer": "**AZ Best Practices:**\n\n1. Deploy resources across **multiple AZs** for high availability\n2. Use **at least 2 AZs** for production (3+ preferred)\n3. **Design for AZ failure**—applications should gracefully handle outages\n4. **Leverage AZ-aware services** (ELB, RDS Multi-AZ, Auto Scaling)\n5. **Monitor AZ health** and balance traffic appropriately"
    },
    {
      "id": "aws-global-infrastructure-quiz-28",
      "type": "fill-blank",
      "question": "In the region code 'us-east-1', the number '1' represents the ________ number.",
      "answer": "region",
      "caseSensitive": false,
      "explanation": "In AWS Region naming (e.g., us-east-1), the components are: geographic area (us) - location within area (east) - region number (1). The number distinguishes between multiple regions in the same geographic area.",
      "hint": "What does the '1' distinguish from potential future regions in the same area?"
    },
    {
      "id": "aws-global-infrastructure-quiz-29",
      "type": "mcq",
      "question": "If you need to comply with GDPR data residency requirements, which Region selection factor is most critical?",
      "options": [
        "Cost optimization",
        "Service availability",
        "Data sovereignty and compliance",
        "The Region's compliance certifications (ISO 27001, SOC 2)"
      ],
      "answer": 2,
      "explanation": "Data sovereignty and compliance is the most critical factor for GDPR. GDPR requires data to remain within specific geographic boundaries (Europe) — this is a data residency requirement. AWS does not move data between Regions without explicit customer action, so choosing an EU Region is essential. Option D is a common trap: all AWS Regions hold ISO 27001 and SOC 2 certifications, but those certifications cover security practices, not where data physically resides. GDPR is about residency (which Region), not certification (how secure).",
      "hint": "GDPR is a European regulation about data protection and privacy — specifically about where data must reside."
    },
    {
      "id": "aws-global-infrastructure-quiz-30",
      "type": "true-false",
      "question": "New AWS services typically launch in all Regions simultaneously to ensure global availability.",
      "answer": false,
      "explanation": "False. New AWS services typically launch in us-east-1 first, then gradually expand to other Regions. Not all services are available in all Regions, which is why service availability is a factor to consider when choosing a Region.",
      "hint": "Think about how technology companies typically roll out new features."
    },
    {
      "id": "aws-global-infrastructure-quiz-31",
      "type": "code-completion",
      "question": "Complete the S3 object ARN for a file in a bucket:",
      "instruction": "Add the correct separator between bucket name and object path",
      "codeTemplate": "arn:aws:s3:::my-bucket___path/to/file.txt",
      "answer": "/",
      "caseSensitive": true,
      "acceptedAnswers": ["/"],
      "explanation": "S3 object ARNs use a forward slash (/) to separate the bucket name from the object key: arn:aws:s3:::my-bucket/path/to/file.txt. This follows standard path notation."
    },
    {
      "id": "aws-global-infrastructure-quiz-32",
      "type": "true-false",
      "question": "An Amazon VPC exists within a single Availability Zone and cannot span multiple AZs within a Region.",
      "answer": false,
      "explanation": "False. A VPC is Regional — it spans all Availability Zones in a Region by default. Subnets are AZ-scoped (each subnet lives in exactly one AZ), which is the source of this misconception. Multi-AZ architecture works by creating separate subnets in each AZ inside the same VPC. The VPC is the regional container; the subnet is the AZ-specific boundary.",
      "hint": "Think about what is AZ-scoped: the VPC itself, or the subnets inside it?"
    },
    {
      "id": "aws-global-infrastructure-quiz-33",
      "type": "ordered-recall",
      "question": "List the four steps to start using an AWS Local Zone (first to last)",
      "steps": [
        {"answer": "Opt in to the Local Zone", "acceptedAnswers": ["Opt in to the Local Zone", "opt in", "enable the local zone", "opt-in", "opt in to local zone", "enable local zone in account settings"]},
        {"answer": "Create a subnet in your VPC for the Local Zone", "acceptedAnswers": ["Create a subnet", "create subnet", "create a subnet in vpc", "add subnet to vpc", "create vpc subnet for local zone"]},
        {"answer": "Launch supported resources in the Local Zone subnet", "acceptedAnswers": ["Launch resources", "launch supported resources", "deploy resources", "launch ec2 instances", "launch resources in subnet"]},
        {"answer": "Configure routing for local traffic", "acceptedAnswers": ["Configure routing", "set up routing", "configure routing for local traffic", "update route table", "configure route table"]}
      ],
      "caseSensitive": false,
      "explanation": "Local Zones require explicit opt-in before any resources can be deployed: (1) opt in via account settings, (2) create a subnet in your existing VPC associated with the Local Zone, (3) launch supported compute/storage resources in that subnet, (4) configure routing so end-user traffic is directed to the Local Zone. Unlike standard AZs, Local Zones are not automatically available — skipping step 1 means the Local Zone doesn't appear as an option when creating subnets.",
      "hint": "Start with account-level enablement before any network or compute steps."
    },
    {
      "id": "aws-global-infrastructure-quiz-34",
      "type": "mcq",
      "question": "What is the difference between these two IAM Resource values in an S3 policy: `arn:aws:s3:::my-bucket/*` vs `arn:aws:s3:::my-bucket*`?",
      "options": [
        "They are equivalent — both grant access to all objects inside my-bucket",
        "`/*` grants access to objects inside my-bucket only; `*` matches any bucket whose name starts with 'my-bucket'",
        "`/*` grants access to the bucket and all objects; `*` grants access to objects only",
        "`/*` is valid for object-level actions; `*` is required for bucket-level actions like s3:ListBucket"
      ],
      "answer": 1,
      "explanation": "ARN wildcards apply to the literal string. `arn:aws:s3:::my-bucket/*` matches only object keys inside the bucket named exactly 'my-bucket' — the `/*` is part of the S3 key path. `arn:aws:s3:::my-bucket*` applies the wildcard to the bucket name itself, matching my-bucket, my-bucket-prod, my-bucket-dev, and any other bucket whose name starts with 'my-bucket'. This is a common IAM misconfiguration: a developer intending to scope permissions to one bucket accidentally grants access to all similarly-named buckets across the account.",
      "hint": "The wildcard position determines what part of the ARN string it expands — the bucket name or the object key path."
    },
    {
      "id": "aws-global-infrastructure-quiz-35",
      "type": "true-false",
      "question": "An EC2 Amazon Machine Image (AMI) created in us-east-1 can be launched directly in eu-west-1 without any additional steps.",
      "answer": false,
      "explanation": "False. AMIs are Region-specific. To use an AMI in a different Region, you must first copy it to the target Region using the 'Copy AMI' action — this creates a new AMI with a different AMI ID in the destination Region. A common point of confusion: AWS Marketplace AMIs appear to be globally available, but under the hood AWS provides a per-region copy when you subscribe — you cannot take a us-east-1 AMI ID and use it directly as a launch parameter in eu-west-1.",
      "hint": "Think about what happens when you try to specify a us-east-1 AMI ID in an eu-west-1 launch template."
    },
    {
      "id": "aws-global-infrastructure-quiz-36",
      "type": "multiple-select",
      "question": "Which AWS services are typically available in Local Zones?",
      "options": [
        "Amazon EC2",
        "Amazon EBS",
        "Amazon RDS",
        "Amazon VPC",
        "AWS Lambda",
        "Elastic Load Balancing (ELB)",
        "Amazon S3"
      ],
      "answers": [0, 1, 3, 5],
      "explanation": "Local Zones provide a subset of AWS services focused on compute and networking close to end users: EC2 (compute), EBS (block storage), VPC (networking), ELB (load balancing), and FSx (file storage). RDS and Lambda are not available in Local Zones — managed databases and serverless compute require the full Region infrastructure. S3 is also not available directly in Local Zones; applications in Local Zones access S3 through the parent Region over the private backbone. The limited service set is why Local Zones are suited for latency-sensitive compute workloads, not full-stack deployments.",
      "hint": "Local Zones support compute, block storage, and networking — not managed databases or serverless."
    },
    {
      "id": "aws-global-infrastructure-quiz-37",
      "type": "mcq",
      "question": "Your application has an RDS primary database in us-east-1. You want European users to experience lower read latency without modifying your write path. What should you configure?",
      "options": [
        "RDS Multi-AZ in us-east-1 with the standby configured to serve reads from a European AZ",
        "A cross-region Read Replica in eu-west-1",
        "A second RDS Multi-AZ cluster in eu-west-1 with manual data synchronization",
        "DynamoDB Global Tables to replace RDS for global read distribution"
      ],
      "answer": 1,
      "explanation": "Cross-region Read Replicas replicate asynchronously from the primary to a replica in another Region, letting European users query eu-west-1 at local latency while writes still go to us-east-1. Option A is the most common trap: Multi-AZ standby instances cannot serve reads — they exist solely for automatic failover. More fundamentally, AZs are within a single Region, so there is no such thing as a 'European AZ' inside us-east-1. Option C creates an isolated cluster with no automatic replication. Option D swaps the database technology entirely, which is out of scope.",
      "hint": "Multi-AZ is for fault tolerance within one Region; cross-region read scaling is a different feature entirely."
    },
    {
      "id": "aws-global-infrastructure-quiz-38",
      "type": "code-output",
      "question": "What does this S3 bucket policy grant?",
      "code": "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [{\n    \"Effect\": \"Allow\",\n    \"Principal\": {\n      \"AWS\": \"arn:aws:iam::987654321098:role/DataProcessingRole\"\n    },\n    \"Action\": \"s3:GetObject\",\n    \"Resource\": \"arn:aws:s3:::shared-data-bucket/*\"\n  }]\n}",
      "language": "json",
      "options": [
        "Allows any IAM role named DataProcessingRole across all AWS accounts to read objects",
        "Allows the DataProcessingRole in account 987654321098 to read all objects in shared-data-bucket",
        "Allows account 987654321098 full administrative access to shared-data-bucket",
        "Allows any principal in account 987654321098 to read from shared-data-bucket"
      ],
      "answer": 1,
      "explanation": "The Principal ARN `arn:aws:iam::987654321098:role/DataProcessingRole` precisely identifies one specific role in one specific account — the 12-digit account ID makes it unambiguous. The Action is s3:GetObject (read-only) and `/*` scopes it to all objects in the bucket. Option A is wrong because IAM role names are not globally unique — without the account ID, the same role name could exist in thousands of accounts; the account ID in the ARN removes that ambiguity. Option C confuses the specific Action (GetObject) with full access. Option D confuses a specific role ARN with a whole-account principal, which would be `arn:aws:iam::987654321098:root`.",
      "hint": "The Principal ARN contains both an account ID and a specific role — both matter for what is granted."
    },
    {
      "id": "aws-global-infrastructure-quiz-39",
      "type": "mcq",
      "question": "Your RDS instance has Multi-AZ enabled with a synchronous standby in AZ-B. The primary in AZ-A experiences a complete failure. What happens next?",
      "options": [
        "The database becomes unavailable until AZ-A recovers; the standby serves read-only traffic during the outage",
        "AWS automatically promotes the AZ-B standby to primary, typically completing within 60-120 seconds",
        "You must manually trigger failover via the RDS console before the standby becomes writable",
        "Both the primary and standby fail simultaneously because they share the same underlying network within the Region"
      ],
      "answer": 1,
      "explanation": "RDS Multi-AZ failover is automatic and requires no manual action — AWS detects the primary failure and promotes the synchronous standby within roughly 60-120 seconds, after which your DNS endpoint resolves to the new primary. Option A describes the most common Multi-AZ misconception: the standby is not a read replica and serves no traffic during normal operation. It exists purely as a hot standby for failover; if you want read scaling, you need a Read Replica. Option C is wrong — manual failover exists as an option but is not required for automatic recovery. Option D confuses AZ-level isolation: each AZ has independent networking; an AZ-A failure does not cascade to AZ-B, which is the entire design goal of Multi-AZ.",
      "hint": "The key word in 'Multi-AZ' is automatic — what does that mean for the DBA during an outage?"
    }
  ]
}
{{< /quiz >}}
