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
      "type": "mcq",
      "question": "What is the primary purpose of AWS Regions being geographically separated?",
      "options": [
        "To reduce costs by distributing infrastructure",
        "To provide disaster recovery and comply with data residency requirements",
        "To increase the number of available services",
        "To improve internet speed globally"
      ],
      "answer": 1,
      "explanation": "AWS Regions are geographically separated to provide disaster recovery options, business continuity, and allow compliance with data residency requirements. AWS does not move data between Regions without explicit customer action.",
      "hint": "Think about regulatory compliance and disaster scenarios."
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
        "The number of Availability Zones"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "The five key factors for choosing a Region are: latency/user proximity, data sovereignty/compliance, service availability, cost, and disaster recovery requirements. While the number of AZs matters for architecture, it's not a primary Region selection criterion.",
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
        "Always two data centers",
        "One or more discrete data centers",
        "At least three data centers"
      ],
      "answer": 2,
      "explanation": "An Availability Zone consists of one or more discrete data centers within an AWS Region. Each AZ has redundant power, networking, and connectivity, and may contain multiple data centers working together.",
      "hint": "The definition mentions 'one or more' data centers."
    },
    {
      "id": "aws-global-infrastructure-quiz-06",
      "type": "fill-blank",
      "question": "What is the typical inter-AZ latency within a Region (in milliseconds)?",
      "answer": "single-digit",
      "caseSensitive": false,
      "acceptedAnswers": ["single-digit", "single digit"],
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
      "answer": "**High Availability and Fault Tolerance**\n\nDistributing resources across multiple Availability Zones within a Region provides:\n- Protection against AZ-level failures\n- Automatic failover capabilities\n- Continuous operation during infrastructure issues\n- Best practice: use at least 2 AZs for production (3+ preferred)"
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
        "IAM must be configured separately in each Availability Zone"
      ],
      "answer": 2,
      "explanation": "IAM is a global service, but it has regional dependencies. IAM uses AWS STS (Security Token Service) for temporary credentials, which has regional endpoints. If a region hosting STS fails, IAM operations in that region may be affected.",
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
      "question": "Which AWS services are truly global in scope?",
      "options": [
        "IAM (Identity and Access Management)",
        "EC2 (Elastic Compute Cloud)",
        "Route 53 (DNS Service)",
        "VPC (Virtual Private Cloud)",
        "CloudFront (CDN)",
        "RDS (Relational Database Service)"
      ],
      "answers": [0, 2, 4],
      "explanation": "Global services include IAM, Route 53, CloudFront, and AWS Organizations. Regional services include EC2, VPC, RDS, and DynamoDB (though DynamoDB offers Global Tables for multi-region replication).",
      "hint": "Global services typically relate to identity, DNS, or content delivery."
    },
    {
      "id": "aws-global-infrastructure-quiz-14",
      "type": "mcq",
      "question": "What is the minimum recommended number of Availability Zones for production workloads?",
      "options": [
        "1 AZ is sufficient for cost optimization",
        "At least 2 AZs (3+ preferred)",
        "Exactly 3 AZs are required",
        "All available AZs in the Region must be used"
      ],
      "answer": 1,
      "explanation": "Best practice recommends using at least 2 Availability Zones for production workloads, with 3 or more preferred. This provides high availability and fault tolerance while balancing cost and complexity.",
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
      "codeTemplate": "arn:aws:iam::___:123456789012:role/MyApplicationRole",
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
        "The function uses Python runtime"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "From the ARN, you can determine: it's a Lambda function (service: lambda), located in eu-west-1 region, owned by account 123456789012, and named 'my-function'. The runtime language is not part of the ARN—that's a separate configuration attribute.",
      "hint": "ARNs contain structural information but not runtime configuration details."
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
        "Multi-Region with replication",
        "Single Region, Multi-AZ",
        "Single Region, Single AZ"
      ],
      "correctOrder": [2, 1, 0],
      "explanation": "Resilience increases with geographic distribution: Single AZ (single point of failure) → Multi-AZ (protects against AZ failures) → Multi-Region (protects against region-wide failures and provides global redundancy)."
    },
    {
      "id": "aws-global-infrastructure-quiz-22",
      "type": "mcq",
      "question": "Which architectural pattern provides protection against both AZ failures and region-wide failures?",
      "options": [
        "Single Region, Single AZ deployment",
        "Single Region, Multi-AZ deployment with RDS standby",
        "Multi-Region deployment with Cross-Region Replication",
        "Local Zone deployment with parent Region backup"
      ],
      "answer": 2,
      "explanation": "Multi-Region deployment with replication (CRR, Global Tables, Aurora Global Database) protects against both AZ-level and region-wide failures. Single Region Multi-AZ protects only against AZ failures, while Local Zones don't provide region-level redundancy.",
      "hint": "Think about what's needed to survive a complete regional outage."
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
      "explanation": "This policy grants read access (GetObject) to all objects (/*) in the specific bucket 'my-bucket'. The wildcard (*) after the bucket name matches all object keys. It does not grant write access or access to other buckets.",
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
        "EC2 with Auto Scaling groups"
      ],
      "answers": [0, 1, 2],
      "explanation": "S3 (via Cross-Region Replication), DynamoDB (via Global Tables), and Aurora (via Global Database) are regional services with global distribution features. IAM is already global (though it has regional dependencies), and EC2 Auto Scaling groups are regional only.",
      "hint": "Look for services that explicitly mention cross-region or global capabilities."
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
      "explanation": "Local Zone identifiers follow the pattern: parent-region-city-code-zone-letter. For Boston associated with us-east-1, it would be 'us-east-1-bos-1a'. Other examples include us-west-2-lax-1a (Los Angeles) and us-west-2-phx-1a (Phoenix).",
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
      "explanation": "In AWS Region naming (e.g., us-east-1), the components are: partition (aws) - country/continent code (us) - geographic area (east) - region number (1). The number distinguishes between multiple regions in the same geographic area.",
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
        "Proximity to US markets"
      ],
      "answer": 2,
      "explanation": "Data sovereignty and compliance is the most critical factor for GDPR. GDPR requires data to remain within specific geographic boundaries (Europe). AWS does not move data between Regions without explicit customer action, so choosing an EU region is essential for GDPR compliance.",
      "hint": "GDPR is a European regulation about data protection and privacy."
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
    }
  ]
}
{{< /quiz >}}

