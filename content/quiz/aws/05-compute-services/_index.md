---
title: Compute Services Quiz
linkTitle: Compute Services
type: docs
weight: 5
prev: /quiz/aws/04-edge-and-hybrid-networking
next: /quiz/aws/06-load-balancing-and-scaling
---

{{< quiz id="aws-compute-services-quiz" >}}
{
  "questions": [
    {
      "id": "aws-compute-services-quiz-01",
      "type": "mcq",
      "question": "What is the core capability that Amazon EC2 provides?",
      "options": [
        "Managed database services in the cloud",
        "On-demand, scalable computing capacity with virtual servers",
        "Content delivery network for static assets",
        "Serverless function execution"
      ],
      "answer": 1,
      "explanation": "Amazon EC2 (Elastic Compute Cloud) provides on-demand, scalable computing capacity in the AWS Cloud, allowing you to obtain and configure virtual servers (instances) in minutes.",
      "hint": "Think about what 'Elastic Compute Cloud' literally means."
    },
    {
      "id": "aws-compute-services-quiz-02",
      "type": "multiple-select",
      "question": "Which components are essential parts of an EC2 instance configuration?",
      "options": [
        "Amazon Machine Image (AMI)",
        "Instance Type",
        "Lambda Function",
        "Security Groups",
        "Key Pair"
      ],
      "answers": [0, 1, 3, 4],
      "explanation": "Essential EC2 components include AMI (operating system template), Instance Type (compute resources), Security Groups (firewall rules), and Key Pair (access credentials). Lambda Functions are a separate serverless service.",
      "hint": "Lambda is a different AWS service, not part of EC2 configuration."
    },
    {
      "id": "aws-compute-services-quiz-03",
      "type": "true-false",
      "question": "When an EC2 instance is in the 'Stopped' state, you are still charged for compute resources.",
      "answer": false,
      "explanation": "When an EC2 instance is stopped, you are NOT charged for compute resources (billed by the second only when running). However, EBS storage charges still apply for attached volumes.",
      "hint": "Think about what 'stopped' means—is the compute running?"
    },
    {
      "id": "aws-compute-services-quiz-04",
      "type": "mcq",
      "question": "In the instance type naming 'm5.2xlarge', what does the 'm' represent?",
      "options": [
        "Memory optimized family",
        "General purpose family",
        "Maximum performance tier",
        "Micro instance size"
      ],
      "answer": 1,
      "explanation": "The 'm' in instance type naming represents the General Purpose family, which provides balanced compute, memory, and networking resources. Memory optimized instances use 'R' or 'X'.",
      "hint": "General purpose instances are balanced—think about what letter might represent 'middle ground'."
    },
    {
      "id": "aws-compute-services-quiz-05",
      "type": "fill-blank",
      "question": "What instance family letter designation is used for compute optimized instances that are ideal for high-performance processors?",
      "answer": "C",
      "caseSensitive": false,
      "explanation": "The 'C' family represents Compute Optimized instances, which feature high-performance processors and are ideal for batch processing, HPC, and gaming servers.",
      "hint": "It's a single letter that might stand for 'Compute'."
    },
    {
      "id": "aws-compute-services-quiz-06",
      "type": "mcq",
      "question": "Which instance attribute suffix indicates that the instance includes AWS Graviton processors?",
      "options": [
        "'a' - AMD processors",
        "'i' - Intel processors",
        "'g' - AWS Graviton processors",
        "'d' - Instance store volumes"
      ],
      "answer": 2,
      "explanation": "The 'g' suffix in instance type names (e.g., m5g.large) indicates AWS Graviton processors, which are ARM-based processors designed by AWS.",
      "hint": "Think about what letter 'Graviton' starts with."
    },
    {
      "id": "aws-compute-services-quiz-07",
      "type": "multiple-select",
      "question": "Which instance families are specifically designed for workloads requiring large amounts of RAM?",
      "options": [
        "R family (Memory Optimized)",
        "C family (Compute Optimized)",
        "X family (Memory Optimized)",
        "T family (Burstable)",
        "High Memory u-series"
      ],
      "answers": [0, 2, 4],
      "explanation": "Memory Optimized instances include the R family, X family, and High Memory u-series, all designed for workloads requiring large amounts of RAM like in-memory databases and big data analytics.",
      "hint": "Look for families specifically mentioned as 'Memory Optimized'."
    },
    {
      "id": "aws-compute-services-quiz-08",
      "type": "drag-drop",
      "question": "Arrange these steps in the correct order for selecting an EC2 instance type:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Identify Business Requirements",
        "Analyze Bottlenecks",
        "Use AWS Compute Optimizer",
        "Right-Size Iteratively"
      ],
      "correctOrder": [0, 1, 2, 3],
      "explanation": "The correct workflow is: 1) Identify what the application needs, 2) Analyze where bottlenecks occur (CPU, memory, I/O, GPU), 3) Use AWS Compute Optimizer for ML-based recommendations, 4) Monitor and adjust based on actual usage."
    },
    {
      "id": "aws-compute-services-quiz-09",
      "type": "true-false",
      "question": "An Amazon Machine Image (AMI) contains only the operating system and cannot include application software.",
      "answer": false,
      "explanation": "An AMI is a preconfigured template that can contain the operating system, application software, AND configuration settings. This allows for rapid, consistent deployments with all necessary software pre-installed.",
      "hint": "Think about why custom AMIs are useful—would they be helpful if they only had the OS?"
    },
    {
      "id": "aws-compute-services-quiz-10",
      "type": "mcq",
      "question": "What are the three main components of an AMI?",
      "options": [
        "Root volume template, Security groups, Instance type",
        "Root volume template, Launch permissions, Block device mapping",
        "Operating system, VPC configuration, Key pairs",
        "EBS snapshots, Instance store, CloudWatch metrics"
      ],
      "answer": 1,
      "explanation": "The three main AMI components are: 1) Root Volume Template (OS and software), 2) Launch Permissions (who can use it), and 3) Block Device Mapping (volumes to attach).",
      "hint": "Think about what's needed to define an image: the template itself, who can use it, and what storage to attach."
    },
    {
      "id": "aws-compute-services-quiz-11",
      "type": "multiple-select",
      "question": "Which AMI types are available for use in AWS?",
      "options": [
        "AWS-Provided AMIs (Quick Start)",
        "AWS Marketplace AMIs",
        "Community AMIs",
        "Custom AMIs",
        "Lambda Container Images"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "AMI types include AWS-Provided (official AWS images), AWS Marketplace (third-party commercial/open-source), Community (shared by users), and Custom (your own). Lambda Container Images are for Lambda, not EC2.",
      "hint": "Lambda is a different service—focus on EC2-specific image types."
    },
    {
      "id": "aws-compute-services-quiz-12",
      "type": "mcq",
      "question": "Which AMI virtualization type is recommended for all new EC2 instances?",
      "options": [
        "Paravirtual (PV)",
        "Hardware Virtual Machine (HVM)",
        "Container-based virtualization",
        "Bare metal"
      ],
      "answer": 1,
      "explanation": "Hardware Virtual Machine (HVM) is recommended for all new instances. It provides fully virtualized hardware, better performance, and supports all instance types. Paravirtual (PV) is legacy.",
      "hint": "The question asks for 'new' instances—which technology is modern vs. legacy?"
    },
    {
      "id": "aws-compute-services-quiz-13",
      "type": "true-false",
      "question": "An EBS-backed AMI allows you to stop an instance without losing data, while an instance store-backed AMI does not.",
      "answer": true,
      "explanation": "EBS-backed AMIs store the root volume on EBS, which persists when stopped. Instance store-backed AMIs use ephemeral storage, so data is lost when the instance stops or terminates.",
      "hint": "Think about what 'persistent' vs 'ephemeral' storage means."
    },
    {
      "id": "aws-compute-services-quiz-14",
      "type": "code-completion",
      "question": "Complete the command to change permissions on an SSH key pair file to read-only for the owner:",
      "instruction": "Fill in the missing permission code",
      "codeTemplate": "chmod _____ my-key-pair.pem",
      "answer": "400",
      "caseSensitive": false,
      "acceptedAnswers": ["400"],
      "explanation": "The command 'chmod 400' sets read-only permissions for the owner and no permissions for group/others. This is required for SSH private key security."
    },
    {
      "id": "aws-compute-services-quiz-15",
      "type": "mcq",
      "question": "Which EBS volume type provides the highest IOPS performance?",
      "options": [
        "General Purpose SSD (gp3) - up to 16,000 IOPS",
        "General Purpose SSD (gp2) - up to 16,000 IOPS",
        "Provisioned IOPS SSD (io2 Block Express) - up to 256,000 IOPS",
        "Throughput Optimized HDD (st1) - up to 500 IOPS"
      ],
      "answer": 2,
      "explanation": "Provisioned IOPS SSD (io2 Block Express) provides up to 256,000 IOPS, making it the highest performance option for critical databases and high-performance workloads.",
      "hint": "Look for 'Provisioned IOPS' and the highest number."
    },
    {
      "id": "aws-compute-services-quiz-16",
      "type": "multiple-select",
      "question": "Which statements are true about EBS volumes?",
      "options": [
        "EBS volumes are network-attached block storage",
        "EBS volumes must be in the same Availability Zone as the EC2 instance",
        "EBS volumes are lost when an instance is terminated",
        "EBS volumes can be detached and reattached to different instances",
        "EBS snapshots enable backup and cross-AZ replication"
      ],
      "answers": [0, 1, 3, 4],
      "explanation": "EBS volumes are network-attached, AZ-bound, detachable/reattachable, and support snapshots. They persist by default when instances terminate (unless configured otherwise).",
      "hint": "Think about what makes EBS 'elastic' and persistent vs ephemeral."
    },
    {
      "id": "aws-compute-services-quiz-17",
      "type": "mcq",
      "question": "Which EBS volume type would be most cost-effective for infrequently accessed data with low performance requirements?",
      "options": [
        "General Purpose SSD (gp3)",
        "Provisioned IOPS SSD (io2)",
        "Throughput Optimized HDD (st1)",
        "Cold HDD (sc1)"
      ],
      "answer": 3,
      "explanation": "Cold HDD (sc1) is the lowest cost HDD volume, designed specifically for infrequently accessed data and cold storage scenarios with low performance requirements.",
      "hint": "The word 'Cold' in the name suggests infrequent access."
    },
    {
      "id": "aws-compute-services-quiz-18",
      "type": "true-false",
      "question": "EBS Multi-Attach allows a single EBS volume to be attached to multiple EC2 instances simultaneously, but only works with io2 volume types.",
      "answer": true,
      "explanation": "EBS Multi-Attach is only available for io2 Block Express and io2 volumes, allowing attachment to multiple instances in the same AZ. Applications must handle concurrent writes.",
      "hint": "Think about which volume type is designed for the highest performance and most advanced features."
    },
    {
      "id": "aws-compute-services-quiz-19",
      "type": "multiple-select",
      "question": "What are the key characteristics of Instance Store volumes?",
      "options": [
        "Physically attached to the host computer",
        "Data persists across instance stops",
        "Very high IOPS (millions possible)",
        "No additional cost beyond instance price",
        "Data is lost on stop, terminate, or hardware failure"
      ],
      "answers": [0, 2, 3, 4],
      "explanation": "Instance Store is physically attached, provides very high IOPS, costs nothing extra, but is ephemeral (data lost on stop/terminate/failure). Data only persists during reboots.",
      "hint": "Instance Store is 'ephemeral'—what does that mean for data persistence?"
    },
    {
      "id": "aws-compute-services-quiz-20",
      "type": "flashcard",
      "question": "What is the difference between EBS and Instance Store?",
      "answer": "**EBS (Elastic Block Store)**\n- Network-attached storage\n- Persistent (survives stop/terminate)\n- Can detach and reattach\n- Snapshots for backup\n- Use case: Boot volumes, databases\n\n**Instance Store**\n- Physically attached storage\n- Ephemeral (lost on stop/terminate/failure)\n- Very high IOPS/throughput\n- No additional cost\n- Use case: Caches, buffers, temporary data"
    },
    {
      "id": "aws-compute-services-quiz-21",
      "type": "true-false",
      "question": "An Elastic IP address is free when allocated but not associated with a running instance.",
      "answer": false,
      "explanation": "Elastic IP addresses are FREE when associated with a running instance. You are CHARGED when they are allocated but not associated, or associated with a stopped instance. This encourages efficient IP usage.",
      "hint": "AWS charges for unused resources to encourage efficiency."
    },
    {
      "id": "aws-compute-services-quiz-22",
      "type": "mcq",
      "question": "What is the primary use case for Elastic IP addresses?",
      "options": [
        "Providing dynamic IP addresses that change with each restart",
        "Reducing costs by sharing IPs across multiple instances",
        "Enabling high availability failover by remapping IPs to different instances",
        "Replacing security groups for network access control"
      ],
      "answer": 2,
      "explanation": "The primary use case for Elastic IPs is high availability failover. You can instantly remap an Elastic IP from a failed instance to a standby instance, maintaining the same public IP with minimal downtime.",
      "hint": "Think about why a 'static' IP that can be 'remapped' is valuable."
    },
    {
      "id": "aws-compute-services-quiz-23",
      "type": "mcq",
      "question": "What is the default quota limit for Elastic IP addresses per region?",
      "options": [
        "1 Elastic IP per region",
        "5 Elastic IPs per region",
        "10 Elastic IPs per region",
        "Unlimited Elastic IPs"
      ],
      "answer": 1,
      "explanation": "The default quota is 5 Elastic IPs per region. You can request a quota increase if you need more.",
      "hint": "It's a small single-digit number to encourage efficient use."
    },
    {
      "id": "aws-compute-services-quiz-24",
      "type": "multiple-select",
      "question": "Which EC2 pricing models require a commitment to reduce costs?",
      "options": [
        "On-Demand Instances",
        "Savings Plans",
        "Reserved Instances",
        "Spot Instances",
        "Dedicated Hosts"
      ],
      "answers": [1, 2],
      "explanation": "Savings Plans and Reserved Instances both require a commitment (1 or 3 years) to achieve cost savings. On-Demand has no commitment, Spot is market-based, and Dedicated Hosts can be On-Demand or Reserved.",
      "hint": "Which models explicitly mention 'commit' in their descriptions?"
    },
    {
      "id": "aws-compute-services-quiz-25",
      "type": "mcq",
      "question": "Which pricing model offers the most flexibility to change instance families and regions?",
      "options": [
        "Standard Reserved Instances",
        "Convertible Reserved Instances",
        "Compute Savings Plans",
        "EC2 Instance Savings Plans"
      ],
      "answer": 2,
      "explanation": "Compute Savings Plans are the most flexible, allowing changes across instance families, regions, and operating systems, while still providing significant savings for committed usage.",
      "hint": "The word 'Compute' suggests it's not tied to specific instance configurations."
    },
    {
      "id": "aws-compute-services-quiz-26",
      "type": "true-false",
      "question": "Spot Instances can be interrupted by AWS with a 2-minute warning when AWS needs the capacity back.",
      "answer": true,
      "explanation": "Spot Instances use unused EC2 capacity at steep discounts but can be interrupted with a 2-minute warning. They're ideal for fault-tolerant, flexible workloads like batch processing.",
      "hint": "Spot instances are cheap because they're interruptible—how much notice do you get?"
    },
    {
      "id": "aws-compute-services-quiz-27",
      "type": "mcq",
      "question": "What is the primary difference between Dedicated Hosts and Dedicated Instances?",
      "options": [
        "Dedicated Hosts cost less than Dedicated Instances",
        "Dedicated Hosts give you visibility into physical server details and socket/core count, while Dedicated Instances do not",
        "Dedicated Instances provide better performance than Dedicated Hosts",
        "Dedicated Hosts can be shared across multiple AWS accounts"
      ],
      "answer": 1,
      "explanation": "Dedicated Hosts provide visibility into the physical server (sockets, cores) and allow you to use existing server-bound software licenses. Dedicated Instances just ensure your instances run on dedicated hardware without that visibility.",
      "hint": "Think about use cases like software licensing that require physical server details."
    },
    {
      "id": "aws-compute-services-quiz-28",
      "type": "flashcard",
      "question": "When should you use Spot Instances?",
      "answer": "**Spot Instances are ideal for:**\n- Fault-tolerant workloads\n- Flexible start/end times\n- Batch processing jobs\n- Data analysis\n- Background processing\n- Testing and development\n\n**Avoid Spot Instances for:**\n- Critical production workloads\n- Databases requiring high availability\n- Applications that can't handle interruptions\n\n**Key benefit:** Up to 90% cost savings vs On-Demand"
    },
    {
      "id": "aws-compute-services-quiz-29",
      "type": "drag-drop",
      "question": "Arrange these EC2 Image Builder workflow steps in the correct order:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Image Recipe (Base AMI + Components)",
        "Infrastructure Configuration (Instance type, IAM, VPC)",
        "Build Process (Launch, Apply, Test, Create AMI)",
        "Distribution (Copy to regions, Set permissions)"
      ],
      "correctOrder": [0, 1, 2, 3],
      "explanation": "EC2 Image Builder workflow: 1) Define Image Recipe (what to build), 2) Infrastructure Configuration (where/how to build), 3) Build Process (actually build and test), 4) Distribution (deploy to regions/accounts)."
    },
    {
      "id": "aws-compute-services-quiz-30",
      "type": "multiple-select",
      "question": "What are the key benefits of using EC2 Image Builder over manual AMI creation?",
      "options": [
        "Automated pipeline reduces manual effort",
        "Built-in testing validates images",
        "Consistent, repeatable results",
        "Automatic cost reduction for running instances",
        "Automated distribution to multiple regions"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "EC2 Image Builder provides automation, testing, consistency, and distribution capabilities. It doesn't directly reduce instance costs but saves operational time and reduces errors.",
      "hint": "Image Builder is about image creation and management, not runtime cost optimization."
    },
    {
      "id": "aws-compute-services-quiz-31",
      "type": "mcq",
      "question": "Which key pair type is more secure and uses a smaller key size?",
      "options": [
        "RSA Key Pair",
        "ED25519 Key Pair",
        "DSA Key Pair",
        "ECDSA Key Pair"
      ],
      "answer": 1,
      "explanation": "ED25519 Key Pairs are more secure than RSA and use smaller key sizes. However, they're only supported on Linux instances (not Windows).",
      "hint": "The question mentions 'more secure' and 'smaller'—which is the modern alternative to RSA?"
    },
    {
      "id": "aws-compute-services-quiz-32",
      "type": "code-output",
      "question": "You launch an EC2 instance with an EBS root volume and instance store volumes. You stop the instance and then start it again. What happens to the data?",
      "code": "Initial state:\n- EBS Root Volume: Contains OS and app (10 GB)\n- Instance Store: Contains cache data (100 GB)\n\nAction: Stop instance → Start instance\n\nResult:",
      "language": "text",
      "options": [
        "Both EBS and Instance Store data are preserved",
        "EBS data is preserved, Instance Store data is lost",
        "Both EBS and Instance Store data are lost",
        "EBS data is lost, Instance Store data is preserved"
      ],
      "answer": 1,
      "explanation": "EBS volumes are persistent and survive stop/start operations. Instance Store is ephemeral and data is lost when you stop the instance. Only reboots preserve Instance Store data.",
      "hint": "Remember: EBS = persistent, Instance Store = ephemeral"
    },
    {
      "id": "aws-compute-services-quiz-33",
      "type": "fill-blank",
      "question": "What is the minimum time period in seconds that you are billed for when running an On-Demand EC2 instance?",
      "answer": "60",
      "caseSensitive": false,
      "explanation": "On-Demand instances are billed by the second with a minimum of 60 seconds. After the first minute, you're charged for each second the instance runs.",
      "hint": "There's a minimum charge period, then billing is per-second."
    },
    {
      "id": "aws-compute-services-quiz-34",
      "type": "mcq",
      "question": "You need to run a high-memory workload for in-memory databases. Which instance family should you choose?",
      "options": [
        "C family (Compute Optimized)",
        "M family (General Purpose)",
        "R family (Memory Optimized)",
        "I family (Storage Optimized)"
      ],
      "answer": 2,
      "explanation": "The R family (Memory Optimized) is designed for workloads requiring large amounts of RAM, such as in-memory databases and big data analytics. It provides high memory-to-vCPU ratios.",
      "hint": "Think about what letter might represent 'RAM'."
    },
    {
      "id": "aws-compute-services-quiz-35",
      "type": "true-false",
      "question": "You can change the instance type of a running EC2 instance without stopping it first.",
      "answer": false,
      "explanation": "You must stop an EC2 instance before you can change its instance type. This only applies to EBS-backed instances; instance store-backed instances cannot have their type changed at all.",
      "hint": "Think about whether hardware changes can happen while a server is running."
    },
    {
      "id": "aws-compute-services-quiz-36",
      "type": "multiple-select",
      "question": "Which of the following are valid EC2 instance lifecycle states?",
      "options": [
        "Pending",
        "Running",
        "Paused",
        "Stopped",
        "Terminated"
      ],
      "answers": [0, 1, 3, 4],
      "explanation": "Valid EC2 lifecycle states include: Pending, Running, Stopping, Stopped, Shutting Down, Terminated, Rebooting, and Hibernating. 'Paused' is not a valid EC2 state.",
      "hint": "Think about what actions you can take on an EC2 instance—there's no 'pause' button."
    },
    {
      "id": "aws-compute-services-quiz-37",
      "type": "mcq",
      "question": "What happens to an EC2 instance's public IP address when you stop and then start the instance?",
      "options": [
        "The public IP remains the same",
        "The public IP changes to a new address",
        "The instance loses all IP addresses",
        "The public IP becomes an Elastic IP automatically"
      ],
      "answer": 1,
      "explanation": "When you stop and start an EC2 instance, it receives a new public IP address. The private IP address remains the same. If you need a persistent public IP, use an Elastic IP.",
      "hint": "Think about why Elastic IPs exist—what problem do they solve?"
    },
    {
      "id": "aws-compute-services-quiz-38",
      "type": "flashcard",
      "question": "What is the difference between Stopping and Terminating an EC2 instance?",
      "answer": "**Stopping an Instance:**\n- Instance is shut down but can be restarted\n- EBS root volume data is preserved\n- No compute charges (EBS storage charges apply)\n- Instance ID and private IP retained\n- Can change instance type\n\n**Terminating an Instance:**\n- Instance is permanently deleted\n- Cannot be restarted\n- Resources are released\n- EBS volumes deleted (unless configured to persist)\n- Instance ID cannot be reused"
    },
    {
      "id": "aws-compute-services-quiz-39",
      "type": "mcq",
      "question": "Which HDD-backed EBS volume type is optimized for frequently accessed, throughput-intensive workloads like big data and data warehouses?",
      "options": [
        "Cold HDD (sc1)",
        "Throughput Optimized HDD (st1)",
        "General Purpose SSD (gp3)",
        "Provisioned IOPS SSD (io2)"
      ],
      "answer": 1,
      "explanation": "Throughput Optimized HDD (st1) is designed for frequently accessed, throughput-intensive workloads like big data, data warehouses, and log processing. Cold HDD (sc1) is for infrequent access.",
      "hint": "The words 'Throughput Optimized' and 'frequently accessed' match the question."
    },
    {
      "id": "aws-compute-services-quiz-40",
      "type": "true-false",
      "question": "AWS Compute Optimizer uses machine learning to analyze historical resource usage and recommend optimal instance types.",
      "answer": true,
      "explanation": "AWS Compute Optimizer uses machine learning to analyze your historical utilization metrics (from CloudWatch) and provides recommendations for optimal instance types and sizes, helping you identify cost savings opportunities.",
      "hint": "The name suggests it 'optimizes'—how would it do that without analyzing your usage?"
    }
  ]
}
{{< /quiz >}}

