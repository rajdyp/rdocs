---
title: Storage Services Quiz
linkTitle: Storage Services
type: docs
weight: 8
prev: /quiz/aws/07-identity-and-access-management
---

{{< quiz id="aws-storage-services-quiz" >}}
{
  "questions": [
    {
      "type": "mcq",
      "question": "Which storage service should you choose if you need a boot volume for an EC2 instance?",
      "options": [
        "Amazon EBS",
        "Amazon EFS",
        "Amazon S3",
        "Amazon Glacier"
      ],
      "answer": 0,
      "explanation": "Amazon EBS (Elastic Block Store) is designed for block storage and is the appropriate choice for EC2 boot volumes. EBS volumes behave like raw, unformatted block devices that can be formatted with a file system.",
      "hint": "Think about which service provides block-level storage that can be attached to a single EC2 instance."
    },
    {
      "type": "multiple-select",
      "question": "Which of the following are characteristics of EBS gp3 volumes?",
      "options": [
        "Baseline performance of 3,000 IOPS",
        "Can be configured up to 16,000 IOPS",
        "Throughput of 125 MB/s baseline",
        "Lower cost than gp2",
        "Maximum size of 64 TiB"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "EBS gp3 volumes offer baseline performance of 3,000 IOPS and 125 MB/s throughput, can be configured up to 16,000 IOPS and 1,000 MB/s, have lower cost than gp2, and support sizes from 1 GiB to 16 TiB (not 64 TiB).",
      "hint": "Review the gp3 specifications in the EBS Volume Types section."
    },
    {
      "type": "true-false",
      "question": "EBS snapshots are full backups of the entire EBS volume every time a snapshot is created.",
      "answer": false,
      "explanation": "EBS snapshots are incremental backups. Only the first snapshot is a full backup; subsequent snapshots only store the changes (blocks that have been modified) since the previous snapshot, making them space-efficient.",
      "hint": "Consider how AWS optimizes storage costs for multiple snapshots of the same volume."
    },
    {
      "type": "mcq",
      "question": "What is the key difference between EFS Regional (Standard) and EFS One Zone file systems?",
      "options": [
        "Regional supports NFSv4, One Zone supports NFSv3",
        "Regional replicates data across multiple AZs, One Zone stores data in a single AZ",
        "Regional is faster than One Zone",
        "One Zone cannot use mount targets"
      ],
      "answer": 1,
      "explanation": "The key difference is availability and redundancy: EFS Regional replicates data across multiple Availability Zones (≥3 AZs) for high availability, while EFS One Zone stores data in a single AZ at a lower cost but with single-AZ failure risk.",
      "hint": "Think about the 'Regional' and 'One Zone' naming and what it implies about data placement."
    },
    {
      "type": "fill-blank",
      "question": "EFS mount targets require one mount target per _____ and use port _____ for NFS communication.",
      "answer": "Availability Zone, 2049",
      "caseSensitive": false,
      "explanation": "EFS architecture requires one mount target per Availability Zone, and NFS communication occurs over port 2049, which must be allowed in security groups.",
      "hint": "The first blank relates to AWS regional architecture, the second is the standard NFS port number."
    },
    {
      "type": "code-output",
      "question": "Given this EFS mounting command, what protocol version is being used?",
      "code": "sudo mount -t nfs4 -o nfsvers=4.1 \\\n  fs-12345678.efs.us-east-1.amazonaws.com:/ /mnt/efs",
      "language": "bash",
      "options": [
        "NFSv3",
        "NFSv4.1",
        "NFSv4.0",
        "NFSv2"
      ],
      "answer": 1,
      "explanation": "The command explicitly specifies `nfsvers=4.1`, which indicates NFSv4.1 is being used. EFS supports NFSv4 protocol for file sharing.",
      "hint": "Look at the `-o` option parameters in the mount command."
    },
    {
      "type": "flashcard",
      "question": "What is an EFS Access Point and when should you use it?",
      "answer": "**EFS Access Point** is an application-specific entry point into an EFS file system that enforces POSIX user/group identity and root directory.\n\n**When to use:**\n- Multi-tenant SaaS applications requiring data isolation\n- Container workloads (ECS, EKS) with shared storage\n- Lambda functions accessing EFS\n- Enforcing separation between different applications\n\n**Benefits:**\n- Each application sees only its own directory\n- Simplified IAM-based access control\n- Automatic directory creation with correct permissions"
    },
    {
      "type": "drag-drop",
      "question": "Arrange these S3 storage classes from MOST expensive (storage cost per GB) to LEAST expensive:",
      "instruction": "Drag to arrange from highest to lowest storage cost",
      "items": [
        "S3 Express One Zone",
        "S3 Standard",
        "S3 Standard-IA",
        "S3 Glacier Instant Retrieval",
        "S3 Glacier Deep Archive"
      ],
      "correctOrder": [0, 1, 2, 3, 4],
      "explanation": "Storage costs decrease as access frequency decreases: S3 Express One Zone (highest performance) → S3 Standard → S3 Standard-IA → S3 Glacier Instant Retrieval → S3 Glacier Deep Archive (lowest cost for rarely accessed data)."
    },
    {
      "type": "mcq",
      "question": "You have data that you need to access quarterly but require millisecond retrieval time when accessed. Which S3 storage class is most appropriate?",
      "options": [
        "S3 Standard",
        "S3 Standard-IA",
        "S3 Glacier Instant Retrieval",
        "S3 Glacier Flexible Retrieval"
      ],
      "answer": 2,
      "explanation": "S3 Glacier Instant Retrieval is designed for data accessed rarely (quarterly) but requires millisecond retrieval time when accessed. S3 Standard and Standard-IA are for more frequent access, while Glacier Flexible requires minutes to hours for retrieval.",
      "hint": "The question emphasizes both 'quarterly access' and 'millisecond retrieval' - find the storage class that meets both requirements."
    },
    {
      "type": "multiple-select",
      "question": "Which statements are true about S3 Versioning?",
      "options": [
        "Once enabled, versioning can only be suspended, not disabled",
        "Each version has a unique Version ID",
        "Deleting an object creates a delete marker",
        "All versions are automatically deleted when a delete marker is created",
        "You can retrieve any previous version by specifying its Version ID"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "S3 Versioning, once enabled, can only be suspended (not fully disabled). Each version gets a unique ID. Deleting creates a delete marker but preserves all versions. You can retrieve any version by its ID. Versions are NOT automatically deleted - they remain preserved.",
      "hint": "Remember that versioning is designed to protect data, not delete it."
    },
    {
      "type": "true-false",
      "question": "S3 Lifecycle Policies automatically move objects between storage classes based on how frequently they are accessed.",
      "answer": false,
      "explanation": "S3 Lifecycle Policies are TIME-based, not access-based. They transition objects based on object age (days since creation), regardless of access patterns. S3 Intelligent-Tiering is the service that uses access patterns to optimize storage class.",
      "hint": "Consider the difference between Lifecycle Policies and Intelligent-Tiering discussed in the content."
    },
    {
      "type": "mcq",
      "question": "What is the minimum storage duration for objects stored in S3 Glacier Deep Archive before you can delete them without incurring additional charges?",
      "options": [
        "30 days",
        "90 days",
        "180 days",
        "365 days"
      ],
      "answer": 2,
      "explanation": "S3 Glacier Deep Archive has a minimum storage duration of 180 days (6 months). If you delete objects before this period, you are still charged for the full 180 days.",
      "hint": "Deep Archive has the longest minimum duration among all storage classes."
    },
    {
      "type": "code-completion",
      "question": "Complete the AWS CLI command to enable S3 Object Lock on a new bucket:",
      "instruction": "Fill in the missing parameter",
      "codeTemplate": "aws s3api create-bucket \\\n  --bucket my-locked-bucket \\\n  --_____________________",
      "answer": "object-lock-enabled-for-bucket",
      "caseSensitive": true,
      "acceptedAnswers": ["object-lock-enabled-for-bucket"],
      "explanation": "The parameter `--object-lock-enabled-for-bucket` must be specified at bucket creation time to enable Object Lock. It cannot be enabled on existing buckets."
    },
    {
      "type": "mcq",
      "question": "In S3 Object Lock, what is the key difference between Governance mode and Compliance mode?",
      "options": [
        "Governance mode is cheaper than Compliance mode",
        "Governance mode allows users with special permissions to override retention, Compliance mode does not",
        "Compliance mode supports longer retention periods",
        "Governance mode only works with S3 Standard storage class"
      ],
      "answer": 1,
      "explanation": "The key difference is that Governance mode allows users with `s3:BypassGovernanceRetention` permission to delete objects or shorten retention periods, while Compliance mode provides immutable protection - no one (not even root) can delete the object during the retention period.",
      "hint": "Think about the level of protection and who can override it."
    },
    {
      "type": "flashcard",
      "question": "Explain the difference between S3 Replication and S3 Backup (Versioning + Lifecycle)",
      "answer": "**S3 Replication:**\n- Real-time/near real-time copying of objects\n- Keeps destination in sync with source\n- Deletes in source can replicate to destination (if configured)\n- Purpose: Availability, performance, compliance\n\n**S3 Backup (Versioning + Lifecycle):**\n- Point-in-time snapshots of object versions\n- Retains historical versions over time\n- Protects against accidental deletion (versions preserved)\n- Purpose: Data recovery, compliance, audit trail\n\n**Best Practice:** Use BOTH - replication for availability/performance, versioning for backup/recovery."
    },
    {
      "type": "true-false",
      "question": "S3 Batch Operations can process billions of objects with a single API request and provides automatic retry mechanisms for failed operations.",
      "answer": true,
      "explanation": "S3 Batch Operations is designed for large-scale operations and can process billions of objects with a single request. It includes built-in retry mechanisms, progress tracking, and generates completion reports.",
      "hint": "Consider the purpose and capabilities of Batch Operations discussed in the content."
    },
    {
      "type": "multiple-select",
      "question": "Which operations can be performed using S3 Batch Operations?",
      "options": [
        "Copy objects to a different bucket",
        "Invoke Lambda function on each object",
        "Restore objects from Glacier",
        "Apply Object Lock retention settings",
        "Modify EC2 instance storage"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "S3 Batch Operations supports: copying objects, invoking Lambda functions, restoring from Glacier, applying Object Lock, replacing ACLs/tags, and more. It does NOT interact with EC2 storage - that's EBS.",
      "hint": "All correct answers relate to S3 object management operations."
    },
    {
      "type": "mcq",
      "question": "What is the primary difference between S3 Server Access Logs and AWS CloudTrail for S3 monitoring?",
      "options": [
        "Access Logs are real-time, CloudTrail has hours of delay",
        "Access Logs track every object request with best-effort delivery, CloudTrail tracks API calls with guaranteed delivery",
        "CloudTrail is free, Access Logs have per-request charges",
        "Access Logs only work with S3 Standard storage class"
      ],
      "answer": 1,
      "explanation": "S3 Server Access Logs provide detailed records of every object-level request (GET, PUT, DELETE) with best-effort delivery and hours of delay. CloudTrail tracks API calls (management and data events) with typically 15-minute delivery and guaranteed logging. They serve different purposes - use both for comprehensive monitoring.",
      "hint": "Consider the scope (what each service tracks) and delivery guarantees."
    },
    {
      "type": "fill-blank",
      "question": "When using S3 Intelligent-Tiering, AWS charges a small _____ fee per 1000 objects but does NOT charge _____ fees when objects are accessed.",
      "answer": "monitoring, retrieval",
      "caseSensitive": false,
      "explanation": "S3 Intelligent-Tiering charges a small monitoring fee (~$0.0025 per 1000 objects) to track access patterns, but unlike manual tier selections (Standard-IA, Glacier), it does not charge retrieval fees when objects are accessed.",
      "hint": "Think about the cost trade-offs of automated optimization versus manual tier selection."
    },
    {
      "type": "mcq",
      "question": "You need to ensure that financial records cannot be deleted or modified for 7 years to meet SEC Rule 17a-4 compliance. Which combination of S3 features should you use?",
      "options": [
        "S3 Versioning + Lifecycle Policy with 7-year expiration",
        "S3 Object Lock in Governance mode with 7-year retention",
        "S3 Object Lock in Compliance mode with 7-year retention",
        "S3 Glacier Deep Archive with 7-year minimum storage duration"
      ],
      "answer": 2,
      "explanation": "SEC Rule 17a-4 requires immutable, WORM (Write Once Read Many) storage. S3 Object Lock in Compliance mode provides guaranteed immutability - no one (including root) can delete or modify objects during the retention period. Governance mode can be overridden, and storage class alone doesn't prevent deletion.",
      "hint": "Look for the option that provides guaranteed immutability without any override capability."
    },
    {
      "type": "drag-drop",
      "question": "Arrange these steps in the correct order for using S3 Batch Operations:",
      "instruction": "Order the workflow from start to finish",
      "items": [
        "Create manifest (list of objects)",
        "Create batch job with operation type",
        "Review AWS cost estimate and confirm",
        "AWS executes job and generates completion report"
      ],
      "correctOrder": [0, 1, 2, 3],
      "explanation": "The S3 Batch Operations workflow: 1) Create manifest listing objects to process, 2) Create batch job specifying the operation, 3) Review scope/cost estimate and confirm, 4) AWS executes with automatic retries and generates a completion report."
    },
    {
      "type": "mcq",
      "question": "Which EBS volume type would be most appropriate for a mission-critical database requiring up to 256,000 IOPS with 99.999% durability?",
      "options": [
        "gp3 (General Purpose SSD)",
        "io2 Block Express (Provisioned IOPS SSD)",
        "st1 (Throughput Optimized HDD)",
        "sc1 (Cold HDD)"
      ],
      "answer": 1,
      "explanation": "io2 Block Express is designed for mission-critical databases with highest performance needs. It supports up to 256,000 IOPS, 4,000 MB/s throughput, and provides 99.999% durability. gp3 maxes out at 16,000 IOPS, and HDD types are not suitable for IOPS-intensive workloads.",
      "hint": "Focus on the IOPS requirement (256,000) and durability (99.999%) specifications."
    },
    {
      "type": "true-false",
      "question": "When you delete an S3 object in a versioned bucket, the object is permanently deleted and cannot be recovered.",
      "answer": false,
      "explanation": "In a versioned bucket, deleting an object creates a delete marker, which makes the object appear deleted but preserves all previous versions. You can recover the object by deleting the delete marker or accessing specific version IDs directly.",
      "hint": "Remember that versioning is designed to protect against data loss."
    },
    {
      "type": "multiple-select",
      "question": "Which statements are true about EFS Data Protection features?",
      "options": [
        "EFS integrates with AWS Backup for automated backup policies",
        "EFS Replication provides continuous automatic replication across regions",
        "The destination replica is read-only during replication",
        "Encryption at rest can be enabled or disabled at any time",
        "Encryption in transit uses TLS 1.2 and requires amazon-efs-utils"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "EFS supports AWS Backup integration, continuous cross-region replication with read-only destinations, and TLS 1.2 encryption in transit via amazon-efs-utils. However, encryption at rest must be enabled at file system creation and cannot be disabled once enabled.",
      "hint": "One statement about encryption at rest is incorrect - consider when encryption settings can be changed."
    },
    {
      "type": "code-output",
      "question": "Based on this Lifecycle Policy configuration, when will an object uploaded on January 1st be transitioned to Glacier?",
      "code": "{\n  \"Transitions\": [\n    {\n      \"Days\": 30,\n      \"StorageClass\": \"STANDARD_IA\"\n    },\n    {\n      \"Days\": 90,\n      \"StorageClass\": \"GLACIER\"\n    }\n  ]\n}",
      "language": "json",
      "options": [
        "January 31st (30 days later)",
        "March 1st (60 days later)",
        "April 1st (90 days later)",
        "April 30th (120 days later)"
      ],
      "answer": 2,
      "explanation": "The 'Days' parameter in Lifecycle Policies is counted from object creation. An object uploaded January 1st will transition to GLACIER on Day 90, which is April 1st (90 days after January 1st).",
      "hint": "Days are counted from the object upload date, and transitions happen at the specified day count, not as a sequence of transitions."
    },
    {
      "type": "mcq",
      "question": "What happens when you enable S3 Transfer Acceleration on a bucket?",
      "options": [
        "Objects are automatically compressed before upload",
        "Uploads use CloudFront edge locations for faster transfer over long distances",
        "Your bucket is replicated to all AWS regions",
        "The bucket storage class is changed to S3 Express One Zone"
      ],
      "answer": 1,
      "explanation": "S3 Transfer Acceleration uses CloudFront's globally distributed edge locations to accelerate uploads to S3, especially beneficial for uploads over long distances. It doesn't compress data, replicate buckets, or change storage classes.",
      "hint": "Think about how AWS's edge network infrastructure can speed up data transfers."
    },
    {
      "type": "flashcard",
      "question": "When should you use S3 Lifecycle Policies versus S3 Intelligent-Tiering?",
      "answer": "**Use S3 Lifecycle Policies when:**\n- You have predictable access patterns\n- Data naturally ages (logs, backups)\n- Compliance requires specific retention periods\n- You know when data becomes less valuable\n- Example: \"Move logs to IA after 30 days, Glacier after 90 days\"\n\n**Use S3 Intelligent-Tiering when:**\n- Access patterns are unknown or unpredictable\n- Data usage changes over time\n- You want \"set it and forget it\" optimization\n- Mixed workloads (some hot, some cold)\n- Example: Data lakes, user-generated content\n\n**Can use BOTH:** Lifecycle to move to Intelligent-Tiering after known active period, then let AWS optimize long-term storage."
    },
    {
      "type": "true-false",
      "question": "S3 Legal Hold and S3 Object Lock retention periods are the same feature with different names.",
      "answer": false,
      "explanation": "Legal Hold and retention periods are distinct features. Retention periods have a fixed duration and expire automatically. Legal Hold has no expiration date (indefinite) and must be manually removed. They work independently - an object can have both, and Legal Hold can be applied with or without a retention period.",
      "hint": "Consider the duration characteristics and use cases (compliance vs. litigation) discussed in the content."
    },
    {
      "type": "mcq",
      "question": "Which AWS service should you use to automate the creation, retention, and deletion of EBS snapshots?",
      "options": [
        "AWS Lambda with EventBridge",
        "Amazon Data Lifecycle Manager",
        "AWS Config Rules",
        "S3 Lifecycle Policies"
      ],
      "answer": 1,
      "explanation": "Amazon Data Lifecycle Manager (DLM) is purpose-built for automating EBS snapshot and AMI lifecycle management with policy-based automation, including creation schedules, retention rules, and automatic deletion.",
      "hint": "Look for the AWS-native service specifically designed for EBS snapshot automation."
    },
    {
      "type": "multiple-select",
      "question": "Which factors should you consider when choosing an S3 storage class?",
      "options": [
        "How often you need to access the data",
        "How quickly you need retrieval when accessed",
        "Whether you can tolerate single-AZ risk",
        "The size of individual objects",
        "The color scheme of your AWS console"
      ],
      "answers": [0, 1, 2],
      "explanation": "The three key factors for choosing S3 storage class are: access frequency (how often), retrieval speed (how fast), and availability requirements (single-AZ vs multi-AZ). Object size is less critical for storage class selection, and console appearance is irrelevant.",
      "hint": "The content explicitly lists three key factors at the beginning of the S3 Storage Classes section."
    },
    {
      "type": "fill-blank",
      "question": "S3 uses _____ storage architecture where objects are identified by unique _____ within a bucket, and folders are simulated using key _____.",
      "answer": "flat, keys, prefixes",
      "caseSensitive": false,
      "explanation": "S3 is a flat storage system (no real directory hierarchy). Objects are identified by unique keys, and folder-like structures are simulated using key prefixes (e.g., 'images/photo1.jpg' where 'images/' is the prefix).",
      "hint": "Think about how S3's object storage model differs from traditional file systems."
    }
  ]
}
{{< /quiz >}}
