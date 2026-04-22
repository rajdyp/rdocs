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
      "type": "flashcard",
      "question": "What is Amazon EC2 and what core capabilities does it provide?",
      "answer": "**Amazon EC2 (Elastic Compute Cloud)**\n- On-demand, scalable virtual servers in the AWS Cloud\n- Launch instances in minutes; scale up or down as needed\n- Full control: instance type, OS, storage, security groups, key pair\n- Billed by the second (minimum 60 seconds)\n- Multiple pricing models: On-Demand, Reserved, Savings Plans, Spot, Dedicated"
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
        "Key Pair",
        "Elastic Load Balancer"
      ],
      "answers": [0, 1, 3, 4],
      "explanation": "Essential EC2 components include AMI (operating system template), Instance Type (compute resources), Security Groups (firewall rules), and Key Pair (access credentials). Lambda Functions are a separate serverless service. Elastic Load Balancers work alongside EC2 instances but are not part of an individual instance's configuration.",
      "hint": "Lambda and load balancers are separate services that work alongside EC2, not part of an instance's own configuration."
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
        "'a'",
        "'i'",
        "'g'",
        "'d'"
      ],
      "answer": 2,
      "explanation": "The 'g' suffix in instance type names (e.g., m5g.large) indicates AWS Graviton processors, which are ARM-based processors designed by AWS. Other suffixes: 'a' = AMD processors, 'i' = Intel processors, 'd' = instance store volumes.",
      "hint": "Think about what letter 'Graviton' starts with."
    },
    {
      "id": "aws-compute-services-quiz-07",
      "type": "multiple-select",
      "question": "Which instance families are specifically designed for workloads requiring large amounts of RAM?",
      "options": [
        "R family",
        "C family",
        "X family",
        "T family",
        "High Memory u-series"
      ],
      "answers": [0, 2, 4],
      "explanation": "Memory Optimized instances include the R family, X family, and High Memory u-series, all designed for workloads requiring large amounts of RAM like in-memory databases and big data analytics. C family is Compute Optimized; T family is Burstable Performance.",
      "hint": "Look for families specifically mentioned as 'Memory Optimized'."
    },
    {
      "id": "aws-compute-services-quiz-08",
      "type": "drag-drop",
      "question": "Arrange these steps in the correct order for selecting an EC2 instance type:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Use AWS Compute Optimizer",
        "Identify Business Requirements",
        "Analyze Bottlenecks",
        "Right-Size Iteratively"
      ],
      "correctOrder": [1, 2, 0, 3],
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
        "EBS snapshots, Instance store, Virtualization type"
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
        "Lambda Container Images",
        "ECR Container Images"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "AMI types include AWS-Provided (official AWS images), AWS Marketplace (third-party commercial/open-source), Community (shared by users), and Custom (your own). Lambda Container Images and ECR Container Images are for containerized workloads, not EC2 instance templates.",
      "hint": "Container images from Lambda and ECR are for containerized runtimes, not EC2 instance templates."
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
        "General Purpose SSD (gp3)",
        "General Purpose SSD (gp2)",
        "Provisioned IOPS SSD (io2 Block Express)",
        "Throughput Optimized HDD (st1)"
      ],
      "answer": 2,
      "explanation": "Provisioned IOPS SSD (io2 Block Express) provides up to 256,000 IOPS, making it the highest performance option for critical databases and high-performance workloads. For comparison: gp3 and gp2 offer up to 16,000 IOPS; st1 (HDD) offers up to 500 IOPS.",
      "hint": "Look for 'Provisioned IOPS' and the highest number."
    },
    {
      "id": "aws-compute-services-quiz-16",
      "type": "multiple-select",
      "question": "Which statements are true about EBS volumes?",
      "options": [
        "EBS volumes are network-attached block storage",
        "EBS volumes must be in the same Availability Zone as the EC2 instance",
        "EBS volumes can span multiple Availability Zones to improve availability",
        "EBS volumes can be detached and reattached to different instances",
        "EBS Multi-Attach allows a volume to be shared across different Availability Zones"
      ],
      "answers": [0, 1, 3],
      "explanation": "EBS volumes are network-attached and AZ-bound (must be in the same AZ as the instance), and can be detached and reattached within that AZ. EBS volumes cannot span multiple AZs — use snapshots to copy data across AZs. Multi-Attach also requires all instances to be in the same AZ.",
      "hint": "EBS is tightly bound to a single Availability Zone — any option suggesting cross-AZ reach is wrong."
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
        "Data is lost on stop, terminate, or hardware failure",
        "Can be backed up using EBS snapshots"
      ],
      "answers": [0, 2, 3, 4],
      "explanation": "Instance Store is physically attached, provides very high IOPS, costs nothing extra, but is ephemeral (data lost on stop/terminate/failure). Data only persists during reboots. Instance Store volumes cannot be snapshotted — that capability is exclusive to EBS.",
      "hint": "Instance Store is ephemeral and physically attached — EBS snapshot capability does not extend to it."
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
        "Assigning a permanent public IP to each instance in an Auto Scaling group"
      ],
      "answer": 2,
      "explanation": "The primary use case for Elastic IPs is high availability failover. You can instantly remap an Elastic IP from a failed instance to a standby instance, maintaining the same public IP with minimal downtime. Elastic IPs are tied to individual instances, not Auto Scaling groups.",
      "hint": "Think about why a 'static' IP that can be 'remapped' is valuable."
    },
    {
      "id": "aws-compute-services-quiz-23",
      "type": "fill-blank",
      "question": "What is the default quota limit for Elastic IP addresses per AWS region?",
      "answer": "5",
      "caseSensitive": false,
      "explanation": "The default quota is 5 Elastic IPs per region. AWS enforces this limit to encourage efficient IP usage. You can request a quota increase through the Service Quotas console if you need more.",
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
      "explanation": "Compute Savings Plans are the most flexible, allowing changes across instance families, regions, and operating systems, while still providing significant savings for committed usage. Standard Reserved Instances are locked to a specific instance family and region. Convertible Reserved Instances allow family/OS changes but not region changes. EC2 Instance Savings Plans are flexible on size/OS but locked to a specific family and region.",
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
      "answer": "**Use Spot for:**\n- Fault-tolerant, stateless workloads (batch jobs, ML training with checkpointing)\n- Kubernetes worker nodes with termination handling and node draining\n- Up to ~90% savings vs On-Demand\n\n**Avoid Spot for:**\n- Stateful workloads, databases, or apps that can't handle sudden termination\n\n**Key mechanics:**\n- 2-minute interruption warning via EC2 metadata endpoint\n- Mix On-Demand base + Spot; diversify instance types and AZs\n- Use capacity-optimized allocation strategy"
    },
    {
      "id": "aws-compute-services-quiz-29",
      "type": "drag-drop",
      "question": "Arrange these EC2 Image Builder workflow steps in the correct order:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Infrastructure Configuration (Instance type, IAM, VPC)",
        "Image Recipe (Base AMI + Components)",
        "Build Process (Launch, Apply, Test, Create AMI)",
        "Distribution (Copy to regions, Set permissions)"
      ],
      "correctOrder": [1, 0, 2, 3],
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
        "Automated distribution to multiple regions",
        "Automatic patch management for running instances"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "EC2 Image Builder provides automation, built-in testing, consistency, and distribution capabilities. It does not reduce costs for running instances or patch running instances — it creates new AMIs with updates baked in. Existing instances must be replaced or patched separately.",
      "hint": "Image Builder creates new AMIs — it doesn't manage running instances or their costs."
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
        "Terminated",
        "Idle"
      ],
      "answers": [0, 1, 3, 4],
      "explanation": "Valid EC2 lifecycle states include: Pending, Running, Stopping, Stopped, Shutting Down, Terminated, Rebooting, and Hibernating. 'Paused' and 'Idle' are not valid EC2 states — there is no pause or idle concept in the EC2 lifecycle.",
      "hint": "EC2 has no 'pause' concept — an instance is either running, stopped, or terminated."
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
        "sc1",
        "st1",
        "gp3",
        "io2"
      ],
      "answer": 1,
      "explanation": "st1 (Throughput Optimized HDD) is designed for frequently accessed, throughput-intensive workloads like big data, data warehouses, and log processing. sc1 (Cold HDD) is for infrequently accessed data; gp3 is General Purpose SSD; io2 is Provisioned IOPS SSD.",
      "hint": "The words 'Throughput Optimized' and 'frequently accessed' match the question."
    },
    {
      "id": "aws-compute-services-quiz-40",
      "type": "true-false",
      "question": "AWS Compute Optimizer uses machine learning to analyze historical resource usage and recommend optimal instance types.",
      "answer": true,
      "explanation": "AWS Compute Optimizer uses machine learning to analyze your historical utilization metrics (from CloudWatch) and provides recommendations for optimal instance types and sizes, helping you identify cost savings opportunities.",
      "hint": "The name suggests it 'optimizes'—how would it do that without analyzing your usage?"
    },
    {
      "id": "aws-compute-services-quiz-41",
      "type": "multiple-select",
      "question": "Which EC2 instance family letters represent Storage Optimized instances?",
      "options": [
        "I family (NVMe SSD, high IOPS)",
        "D family (Dense HDD storage)",
        "H family (High disk throughput)",
        "M family (General Purpose)",
        "T family (Burstable Performance)",
        "G family (Accelerated Computing)"
      ],
      "answers": [0, 1, 2],
      "explanation": "Storage Optimized instances include the I family (NVMe SSD, high IOPS — e.g., i4i for NoSQL databases), D family (dense HDD storage — e.g., d3 for data warehousing), and H family (high disk throughput — e.g., h1 for Hadoop). These are designed for workloads requiring high sequential read/write access to large local datasets. M (General Purpose), T (Burstable), and G (Accelerated Computing/GPU) belong to separate families.",
      "hint": "Think about which letters could stand for 'I/O-intensive', 'Dense storage', and 'High throughput' — all storage-related."
    },
    {
      "id": "aws-compute-services-quiz-42",
      "type": "mcq",
      "question": "Your EC2 application needs to read objects from an S3 bucket programmatically. What is the correct approach?",
      "options": [
        "Create an EC2 key pair and use its private key to authenticate AWS API calls",
        "Embed IAM user access keys directly in the application code on the instance",
        "Configure a Security Group rule that allows outbound traffic to S3 endpoints",
        "Attach an IAM instance role with the appropriate S3 permissions to the EC2 instance"
      ],
      "answer": 3,
      "explanation": "An IAM instance role is the correct approach. It provides temporary, automatically-rotating credentials to the application at runtime — no static secrets to manage or rotate. EC2 key pairs authenticate SSH/RDP connections TO the instance; they cannot authenticate AWS API calls. Embedding IAM user access keys in code is a critical security risk: they are static, long-lived, and easily leaked via source control. Security Groups control network traffic, not API authorization.",
      "hint": "Key pairs are for connecting TO the instance. How does code running ON the instance call other AWS services safely?"
    },
    {
      "id": "aws-compute-services-quiz-43",
      "type": "mcq",
      "question": "What happens to an EC2 instance's RAM contents when it is hibernated?",
      "options": [
        "RAM contents are discarded and the instance restarts from scratch on next launch",
        "RAM contents are saved to Amazon S3 for long-term durability",
        "RAM contents are saved to the EBS root volume, then the instance stops",
        "The instance pauses in-memory and remains in the Running state"
      ],
      "answer": 2,
      "explanation": "Hibernation saves the in-memory (RAM) state to the EBS root volume, then stops the instance. On the next start, the RAM is restored from EBS, allowing the instance to resume exactly where it left off — including in-memory application state and open connections. This is fundamentally different from a regular stop (which discards RAM) or a reboot (which restarts the OS). The EBS root volume must have enough free space to hold the RAM contents.",
      "hint": "Think about what 'hibernate' means on a laptop — the screen turns off but your work is exactly where you left it."
    },
    {
      "id": "aws-compute-services-quiz-44",
      "type": "code-output",
      "question": "You have an EC2 instance with EBS and Instance Store volumes. What happens to the data after the action shown?",
      "code": "Initial state:\n- EBS Root Volume: Contains OS and app (10 GB)\n- Instance Store: Contains cache data (100 GB)\n\nAction: Reboot instance (OS restart via console or OS command)\n\nResult:",
      "language": "text",
      "options": [
        "Both EBS and Instance Store data are preserved",
        "EBS data is preserved, Instance Store data is lost",
        "Both EBS and Instance Store data are lost",
        "EBS data is lost, Instance Store data is preserved"
      ],
      "answer": 0,
      "explanation": "A reboot keeps the instance on the same physical host — it never transitions through Stopped. Because the host does not change, Instance Store data is preserved alongside EBS data. Instance Store data is only lost on stop, terminate, or host hardware failure. This is the critical distinction from a stop/start cycle: after a stop, the instance may land on a different physical host, making any locally-attached Instance Store inaccessible and its data gone.",
      "hint": "Reboot keeps the instance on the same physical host. What happens to physically-attached storage that never leaves its host?"
    },
    {
      "id": "aws-compute-services-quiz-45",
      "type": "mcq",
      "question": "What is the key technical advantage of gp3 over gp2 EBS volumes?",
      "options": [
        "gp3 supports larger maximum volume sizes (up to 64 TiB vs 16 TiB for gp2)",
        "gp3 allows IOPS and throughput to be provisioned independently of volume size",
        "gp3 supports EBS Multi-Attach, enabling shared access across multiple instances",
        "gp3 provides 99.999% durability, compared to gp2's lower durability rating"
      ],
      "answer": 1,
      "explanation": "The defining advantage of gp3 is that IOPS (up to 16,000) and throughput (up to 1,000 MB/s) are configured independently of volume size. With gp2, IOPS are tied to size at 3 IOPS per GiB — to get 3,000 IOPS you must provision at least 1,000 GiB, even if you only need a small volume. gp3 eliminates this coupling, making it more cost-effective when IOPS requirements exceed what the needed storage size would naturally provide. Both types max at 16 TiB; Multi-Attach requires io2.",
      "hint": "In gp2, need more IOPS? Buy more gigabytes. In gp3, is that constraint still there?"
    },
    {
      "id": "aws-compute-services-quiz-46",
      "type": "true-false",
      "question": "An AMI you create in us-east-1 can be used directly to launch instances in eu-west-1 without any additional steps.",
      "answer": false,
      "explanation": "AMIs are regional resources — they exist within and can only launch instances in the region where they were created or copied. To use an AMI in another region, you must explicitly copy it to the target region using the 'Copy AMI' action. Unlike IAM (which is global), EC2 AMIs are region-scoped. This is a common gotcha in multi-region deployments: referencing an AMI ID from another region will fail.",
      "hint": "Unlike IAM, most EC2 resources are region-scoped. Does that apply to AMIs?"
    },
    {
      "id": "aws-compute-services-quiz-47",
      "type": "mcq",
      "question": "You need a 3-year commitment that still allows you to shift workloads across instance families AND switch AWS regions. Which pricing option supports both requirements?",
      "options": [
        "Standard Reserved Instances",
        "Convertible Reserved Instances",
        "Compute Savings Plans",
        "EC2 Instance Savings Plans"
      ],
      "answer": 2,
      "explanation": "Compute Savings Plans are the only commitment model that allows changes across instance families, sizes, regions, and operating systems while still providing significant savings. Convertible Reserved Instances allow changing instance family and OS, but they are locked to a single region — a critical limitation that trips up many users who assume 'Convertible' means fully flexible. Standard RIs are locked to a specific instance type and region. EC2 Instance Savings Plans flex on size and OS within a family, but are locked to a specific family and region.",
      "hint": "Convertible sounds like maximum flexibility — but is it flexible on region? Which model truly has the fewest constraints?"
    },
    {
      "id": "aws-compute-services-quiz-48",
      "type": "mcq",
      "question": "You need to migrate data from an EBS volume attached to an instance in us-east-1a to an instance in us-east-1b. What is the correct approach?",
      "options": [
        "Detach the EBS volume from the instance in us-east-1a and reattach it directly to the instance in us-east-1b",
        "Enable EBS Multi-Attach so both instances can simultaneously access the volume",
        "Create an EBS snapshot of the volume, then create a new EBS volume from the snapshot in us-east-1b",
        "Use the AWS Console to move the volume to a different Availability Zone directly"
      ],
      "answer": 2,
      "explanation": "EBS volumes are bound to a single Availability Zone and cannot be directly detached and reattached across AZ boundaries. The correct workflow is: (1) take a snapshot of the volume, (2) create a new EBS volume from that snapshot specifying us-east-1b as the AZ, (3) attach the new volume to the target instance. EBS Multi-Attach requires all instances to be in the same AZ — it does not enable cross-AZ sharing. There is no direct 'move' action for EBS volumes in the console.",
      "hint": "EBS volumes cannot cross AZ boundaries by detach/reattach. What AWS mechanism lets you duplicate block storage across AZ or region boundaries?"
    },
    {
      "id": "aws-compute-services-quiz-49",
      "type": "mcq",
      "question": "A gp2 EBS volume is sized at 200 GiB. What is its baseline IOPS performance?",
      "options": [
        "200 IOPS",
        "600 IOPS",
        "3,000 IOPS",
        "16,000 IOPS"
      ],
      "answer": 1,
      "explanation": "gp2 volumes deliver 3 IOPS per GiB of storage as the baseline. For 200 GiB: 200 × 3 = 600 baseline IOPS. Volumes smaller than 1,000 GiB can burst up to 3,000 IOPS using a credit system, but burst is not guaranteed sustained performance. The maximum gp2 IOPS is 16,000 (requiring a volume ≥ 5,334 GiB). This forced size-to-IOPS coupling is what gp3 eliminates — with gp3, you could get 3,000 IOPS on a 1 GiB volume without paying for 1,000 GiB of storage.",
      "hint": "gp2 has a fixed 3 IOPS per GiB ratio. Multiply that by 200."
    },
    {
      "id": "aws-compute-services-quiz-50",
      "type": "mcq",
      "question": "Which workload is LEAST suitable for Spot Instances?",
      "options": [
        "Batch processing job that saves progress to S3 every 5 minutes",
        "Machine learning training with automatic checkpoint-based fault tolerance",
        "Primary relational database server storing customer transaction records",
        "HPC simulation that can resume from checkpoints stored in EFS"
      ],
      "answer": 2,
      "explanation": "A primary relational database with customer transaction data is the worst fit for Spot Instances. Spot Instances can be reclaimed with only a 2-minute warning, and stateful databases are not designed to handle sudden termination — this risks data corruption or unrecoverable writes in flight. The other options are all fault-tolerant: they checkpoint their work to durable storage (S3, EFS) and can resume from the last checkpoint with no data loss. The pattern for Spot compatibility is: stateless or checkpoint-enabled, fault-tolerant, and flexible on timing.",
      "hint": "Spot instances disappear with 2 minutes notice. Which workload cannot safely tolerate sudden termination?"
    },
    {
      "id": "aws-compute-services-quiz-51",
      "type": "mcq",
      "question": "Your company has existing Windows Server licenses that are bound per physical CPU socket. Which EC2 option enables you to use these licenses in AWS?",
      "options": [
        "Dedicated Instances",
        "Dedicated Hosts",
        "Standard Reserved Instances with Windows pricing",
        "On-Demand Instances with the Windows AMI"
      ],
      "answer": 1,
      "explanation": "Dedicated Hosts provide visibility into the physical server's socket and core count, which is required for Bring Your Own License (BYOL) scenarios where licensing is per physical CPU socket or per core. Dedicated Instances run on hardware dedicated to your account, but they do not expose physical server details — you cannot determine socket count and therefore cannot prove per-socket license compliance. Reserved Instances and On-Demand Instances run on shared hardware with no physical isolation or server-level visibility.",
      "hint": "BYOL requires knowing the physical hardware specification. Which option exposes that level of detail?"
    },
    {
      "id": "aws-compute-services-quiz-52",
      "type": "mcq",
      "question": "How does CPU bursting work on T-series EC2 instances (e.g., T3, T4g)?",
      "options": [
        "T instances always deliver maximum vCPU capacity; throttling only occurs if the instance health check fails",
        "T instances accumulate CPU credits when running below the baseline, then spend those credits to burst above the baseline",
        "T instances automatically scale horizontally by launching additional instances when CPU demand exceeds the baseline",
        "T instances borrow CPU capacity from neighboring instances on the same host when bursting is needed"
      ],
      "answer": 1,
      "explanation": "T-series instances use a credit-based CPU model. When the instance runs below its baseline CPU utilization percentage, it earns CPU credits at a steady rate. When demand exceeds the baseline, it spends those credits to burst. Once credits are exhausted, CPU is throttled back to the baseline. T3 Unlimited mode lets you burst beyond your credit balance indefinitely at an extra charge — useful for sustained spiky workloads. This model makes T instances very cost-effective for low-average, intermittently-busy applications like dev/test servers and small web apps.",
      "hint": "T instances have a 'baseline' CPU level. Think of credits as a bank — what happens when you earn them vs spend them?"
    },
    {
      "id": "aws-compute-services-quiz-53",
      "type": "multiple-select",
      "question": "Which payment options are available when purchasing Reserved Instances?",
      "options": [
        "All Upfront",
        "Partial Upfront",
        "No Upfront",
        "Monthly subscription only (billed like On-Demand, no commitment discount)",
        "Annual lump sum billed at On-Demand rates",
        "Pay-as-you-go (usage billed per second, no term commitment)"
      ],
      "answers": [0, 1, 2],
      "explanation": "Reserved Instances offer exactly three payment options: All Upfront (highest discount, one-time payment for the entire term), Partial Upfront (moderate discount, split between an upfront payment and monthly charges), and No Upfront (lowest discount, all monthly charges, no initial payment). All three still require committing to a 1-year or 3-year term — that commitment is what earns the discount. The other options describe On-Demand billing or fictional structures not offered by AWS.",
      "hint": "The three RI payment options cover the spectrum: pay everything now, pay some now, or pay nothing now."
    }
  ]
}
{{< /quiz >}}
