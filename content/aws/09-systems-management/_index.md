---
title: Systems Management
linkTitle: Systems Management
type: docs
weight: 9
prev: /aws/08-storage-services
next: /aws/10-database-services
---

## Overview

AWS Systems Manager is a unified service that provides operational visibility and control over your AWS infrastructure. It enables you to automate operational tasks, manage configurations, patch systems, and maintain compliance at scale across both AWS and on-premises environments.

## AWS Systems Manager

### What is AWS Systems Manager?

**AWS Systems Manager** is an operations hub that provides a unified interface for viewing and controlling your AWS infrastructure. It reduces the time to detect and resolve operational problems while helping maintain security and compliance.

### Core Concepts

```
┌─────────────────────────────────────────────────────────────┐
│          Systems Manager Core Concepts                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Managed Nodes                                              │
│  ├─ EC2 instances with SSM Agent installed                  │
│  ├─ On-premises servers with SSM Agent                      │
│  ├─ Virtual machines in hybrid environments                 │
│  └─ Automatically registered with Systems Manager           │
│                                                             │
│  SSM Agent                                                  │
│  ├─ Software installed on managed nodes                     │
│  ├─ Enables Systems Manager to update, manage, configure    │
│  ├─ Pre-installed on Amazon Linux 2, Ubuntu, Windows        │
│  └─ Communicates with Systems Manager service               │
│                                                             │
│  IAM Role for EC2                                           │
│  ├─ Required for EC2 instances to be managed                │
│  ├─ Managed policy: AmazonSSMManagedInstanceCore            │
│  └─ Grants permissions to communicate with Systems Manager  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Systems Manager Architecture

```
┌─────────────────────────────────────────────────────────────┐
│          AWS Systems Manager Architecture                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                  ┌─────────────────────┐                    │
│                  │  Systems Manager    │                    │
│                  │  Service            │                    │
│                  └──────────┬──────────┘                    │
│                             │                               │
│          ┌──────────────────┼──────────────────┐            │
│          │                  │                  │            │
│     ┌────▼────┐       ┌─────▼─────┐      ┌────▼────┐        │
│     │ Managed │       │ Managed   │      │ On-Prem │        │
│     │ EC2     │       │ EC2       │      │ Server  │        │
│     │ us-east │       │ us-west   │      │ (Hybrid)│        │
│     └────┬────┘       └─────┬─────┘      └────┬────┘        │
│          │                  │                  │            │
│     ┌────▼────────────┐ ┌───▼──────────┐  ┌───▼─────────┐   │
│     │ SSM Agent       │ │ SSM Agent    │  │ SSM Agent   │   │
│     │ IAM Role        │ │ IAM Role     │  │ Activation  │   │
│     └─────────────────┘ └──────────────┘  └─────────────┘   │
│                                                             │
│  Communication Flow:                                        │
│  1. SSM Agent polls Systems Manager for commands            │
│  2. Systems Manager sends commands to agents                │
│  3. Agents execute commands and report status               │
│  4. Results visible in Systems Manager console              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Node Management Tools

### Fleet Manager

**Fleet Manager** provides a unified interface to remotely view and manage nodes without SSH or RDP.

```
┌─────────────────────────────────────────────────────────────┐
│              Fleet Manager Capabilities                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Remote Desktop (RDP/GUI)                                   │
│  ├─ Access Windows servers via web browser                  │
│  ├─ No bastion host needed                                  │
│  └─ Fully audited sessions (CloudTrail)                     │
│                                                             │
│  File System Browser                                        │
│  ├─ Browse directories and files                            │
│  ├─ Download and upload files                               │
│  └─ View file permissions                                   │
│                                                             │
│  Performance Monitoring                                     │
│  ├─ Real-time CPU, memory, disk usage                       │
│  ├─ Process monitoring                                      │
│  └─ Network statistics                                      │
│                                                             │
│  Log Viewing                                                │
│  ├─ View system logs                                        │
│  ├─ Application logs                                        │
│  └─ Filter and search logs                                  │
│                                                             │
│  Registry Editor (Windows)                                  │
│  └─ View and modify Windows registry                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Session Manager

**Session Manager** provides secure, auditable shell access to managed nodes without opening inbound ports or managing SSH keys.

```
┌─────────────────────────────────────────────────────────────┐
│              Session Manager Benefits                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Security                                                   │
│  ├─ No inbound ports needed (no port 22/3389)               │
│  ├─ No SSH keys to manage                                   │
│  ├─ No bastion hosts required                               │
│  └─ IAM-based access control                                │
│                                                             │
│  Auditability                                               │
│  ├─ All session activity logged to CloudWatch Logs          │
│  ├─ All API calls logged to CloudTrail                      │
│  ├─ Session recordings available                            │
│  └─ Compliance-friendly                                     │
│                                                             │
│  Cross-Platform                                             │
│  ├─ Linux, macOS, Windows support                           │
│  ├─ Browser-based or CLI access                             │
│  └─ Consistent experience across OS types                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Session Manager vs SSH:**

```
Traditional SSH Access
┌──────────────────────────────────────────┐
│  User                                    │
│    │                                     │
│    │ SSH Key                             │
│    ▼                                     │
│  ┌─────────────┐      ┌──────────────┐   │
│  │ Bastion Host│──────│ EC2 Instance │   │
│  │ Public IP   │ SSH  │ Private IP   │   │
│  └─────────────┘ :22  └──────────────┘   │
│                                          │
│  Challenges:                             │
│  • Inbound port 22 open                  │
│  • SSH keys to manage                    │
│  • Bastion host to maintain              │
│  • Security group rules                  │
└──────────────────────────────────────────┘

Session Manager Access
┌──────────────────────────────────────────┐
│  User                                    │
│    │                                     │
│    │ IAM Permissions                     │
│    ▼                                     │
│  ┌────────────────────┐                  │
│  │ Systems Manager    │                  │
│  └──────────┬─────────┘                  │
│             │                            │
│             ▼                            │
│        ┌──────────────┐                  │
│        │ EC2 Instance │                  │
│        │ SSM Agent    │                  │
│        └──────────────┘                  │
│                                          │
│  Benefits:                               │
│  • No inbound ports needed               │
│  • No SSH keys                           │
│  • No bastion host                       │
│  • Full audit trail                      │
└──────────────────────────────────────────┘
```

### Run Command

**Run Command** allows you to remotely execute commands or scripts on managed nodes at scale without SSH/RDP.

```
┌─────────────────────────────────────────────────────────────┐
│              Run Command Use Cases                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Software Installation                                      │
│  ├─ Install packages on multiple servers                    │
│  └─ Example: Install Apache on 100 web servers              │
│                                                             │
│  Configuration Changes                                      │
│  ├─ Update config files across fleet                        │
│  └─ Example: Update nginx.conf on all load balancers        │
│                                                             │
│  Operational Tasks                                          │
│  ├─ Restart services                                        │
│  ├─ Clear caches                                            │
│  └─ Check disk usage                                        │
│                                                             │
│  Troubleshooting                                            │
│  ├─ Collect logs from multiple instances                    │
│  ├─ Run diagnostic scripts                                  │
│  └─ Check service status                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Run Command Example:**

```
Command: AWS-RunShellScript

Parameters:
├─ Commands:
│  └─ sudo yum update -y && sudo systemctl restart httpd
├─ Targets:
│  └─ Tag: Environment=Production
└─ Concurrency: 10 instances at a time

Execution:
1. Systems Manager identifies targets (all prod instances)
2. Sends command to SSM Agents
3. Agents execute command
4. Results returned to Systems Manager
5. View output in console or S3
```

### Patch Manager

**Patch Manager** automates the process of patching managed nodes with security updates and other types of updates.

```
┌─────────────────────────────────────────────────────────────┐
│              Patch Manager Workflow                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Patch Baseline                                          │
│     ├─ Defines which patches to approve                     │
│     ├─ Predefined baselines (Amazon Linux, Windows, Ubuntu) │
│     ├─ Custom baselines (specific patch criteria)           │
│     └─ Example: "Install critical and security patches"     │
│                                                             │
│  2. Patch Groups                                            │
│     ├─ Organize instances for patching                      │
│     ├─ Based on tags (e.g., PatchGroup: WebServers)         │
│     └─ Different groups can have different baselines        │
│                                                             │
│  3. Maintenance Windows                                     │
│     ├─ Schedule when patches are applied                    │
│     ├─ Example: Every Sunday at 2 AM                        │
│     └─ Prevents patching during business hours              │
│                                                             │
│  4. Patch Compliance                                        │
│     ├─ Track which instances are compliant                  │
│     ├─ Missing patches identified                           │
│     └─ Compliance reports generated                         │
│                                                             │
│  5. Patch Installation                                      │
│     ├─ Scans instances for missing patches                  │
│     ├─ Installs approved patches                            │
│     ├─ Reboots if required                                  │
│     └─ Reports installation status                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Inventory

**Inventory** collects metadata about managed nodes and the software installed on them.

```
Collected Information:
├─ Applications (installed software)
├─ AWS components (CLI, CloudWatch agent)
├─ Network configuration
├─ Windows updates
├─ Instance details
├─ Custom inventory (user-defined)
└─ Files and folders

Use Cases:
• Software audit and license compliance
• Security vulnerability tracking
• Configuration management
• Capacity planning
```

### Compliance

**Compliance** scans managed nodes for patch compliance and configuration inconsistencies.

```
┌─────────────────────────────────────────────────────────────┐
│              Compliance Dashboard                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Patch Compliance                                           │
│  ├─ Compliant: 45 instances                                 │
│  ├─ Non-compliant: 5 instances                              │
│  └─ Details: Missing critical security updates              │
│                                                             │
│  Association Compliance                                     │
│  ├─ Compliant: 48 instances                                 │
│  ├─ Non-compliant: 2 instances                              │
│  └─ Details: CloudWatch agent not running                   │
│                                                             │
│  Actions:                                                   │
│  ├─ View non-compliant resources                            │
│  ├─ Apply patches or configurations                         │
│  └─ Generate compliance reports                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### State Manager

**State Manager** maintains managed nodes in a defined and consistent state using associations.

```
┌─────────────────────────────────────────────────────────────┐
│              State Manager Associations                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Association Example: CloudWatch Agent                      │
│  ├─ Document: AWS-ConfigureAWSPackage                       │
│  ├─ Parameters:                                             │
│  │  ├─ Name: AmazonCloudWatchAgent                          │
│  │  └─ Action: Install                                      │
│  ├─ Targets: Tag:Environment=Production                     │
│  ├─ Schedule: Every 30 minutes                              │
│  └─ Compliance: Ensure CloudWatch agent is installed        │
│                                                             │
│  Association Example: Security Baseline                     │
│  ├─ Document: Custom-SecurityBaseline                       │
│  ├─ Parameters: Various security configurations             │
│  ├─ Targets: All managed instances                          │
│  ├─ Schedule: Daily                                         │
│  └─ Compliance: Ensures security settings are applied       │
│                                                             │
│  Workflow:                                                  │
│  1. Association defined with target and schedule            │
│  2. Systems Manager applies configuration                   │
│  3. Agents report compliance status                         │
│  4. Drift detection identifies changes                      │
│  5. Remediation applied automatically                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Application Management Tools

### Parameter Store

**Parameter Store** provides secure, hierarchical storage for configuration data and secrets.

```
┌─────────────────────────────────────────────────────────────┐
│              Parameter Store                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Parameter Types                                            │
│                                                             │
│  String                                                     │
│  ├─ Plain text values                                       │
│  └─ Example: /app/config/database-url                       │
│                                                             │
│  StringList                                                 │
│  ├─ Comma-separated values                                  │
│  └─ Example: /app/config/allowed-ips                        │
│                                                             │
│  SecureString                                               │
│  ├─ Encrypted with KMS                                      │
│  ├─ Passwords, API keys, secrets                            │
│  └─ Example: /app/config/database-password                  │
│                                                             │
│  Hierarchical Organization                                  │
│  /myapp/                                                    │
│  ├─ dev/                                                    │
│  │  ├─ database-url                                         │
│  │  └─ api-key                                              │
│  ├─ staging/                                                │
│  │  ├─ database-url                                         │
│  │  └─ api-key                                              │
│  └─ prod/                                                   │
│     ├─ database-url                                         │
│     └─ api-key                                              │
│                                                             │
│  Benefits                                                   │
│  ├─ Centralized configuration management                    │
│  ├─ Version history of parameters                           │
│  ├─ IAM-based access control                                │
│  ├─ Integration with other AWS services                     │
│  └─ No additional cost (standard parameters)                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Parameter Store vs Secrets Manager:**

```
Parameter Store (SSM)
├─ Use case: Configuration data, non-sensitive and sensitive
├─ Cost: Free (standard), $ (advanced)
├─ Rotation: Manual or Lambda-based
├─ Size limit: 4 KB (standard), 8 KB (advanced)
└─ Best for: Application configuration

Secrets Manager
├─ Use case: Database credentials, API keys
├─ Cost: $ per secret + API calls
├─ Rotation: Native automatic rotation
├─ Size limit: 64 KB
└─ Best for: Secrets requiring automatic rotation
```

### AppConfig

**AppConfig** helps deploy application configuration changes safely with validation and monitoring.

```
┌─────────────────────────────────────────────────────────────┐
│              AppConfig Workflow                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Configuration Profile                                   │
│     └─ Define configuration (JSON, YAML, text)              │
│                                                             │
│  2. Deployment Strategy                                     │
│     ├─ How fast to deploy (e.g., 10% every 5 min)           │
│     ├─ Bake time (monitor before proceeding)                │
│     └─ Rollback on alarm                                    │
│                                                             │
│  3. Validators                                              │
│     ├─ JSON Schema validation                               │
│     └─ Lambda function validation                           │
│                                                             │
│  4. Deployment                                              │
│     ├─ Gradual rollout to targets                           │
│     ├─ Monitor CloudWatch alarms                            │
│     └─ Automatic rollback on errors                         │
│                                                             │
│  Example Use Case:                                          │
│  Deploy feature flag to enable new UI                       │
│  ├─ Start: 5% of users                                      │
│  ├─ Monitor: Error rates, latency                           │
│  ├─ Expand: 25%, 50%, 100% (if healthy)                     │
│  └─ Rollback: Automatic if alarms trigger                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Change Management Tools

### Automation

**Automation** uses runbooks (documents) to automate common operational tasks and respond to events.

```
Common Automation Runbooks:

AWS-RestartEC2Instance
├─ Stops and starts EC2 instance
└─ Use case: Automated recovery

AWS-CreateSnapshot
├─ Creates EBS snapshot
└─ Use case: Scheduled backups

AWS-PatchInstanceWithRollback
├─ Patches instance and validates
├─ Rolls back if validation fails
└─ Use case: Safe patching

Custom Runbook Example:
├─ Trigger: CloudWatch alarm (high CPU)
├─ Action 1: Create snapshot for safety
├─ Action 2: Scale out Auto Scaling Group
├─ Action 3: Send SNS notification
└─ Use case: Auto-remediation
```

### Documents (SSM Documents)

**Documents** define actions that Systems Manager performs on managed instances.

```
Document Types:

Command Documents
├─ Execute commands on instances
└─ Used by: Run Command, State Manager

Automation Documents
├─ Define automation workflows
└─ Used by: Automation runbooks

Policy Documents
├─ Enforce policies on instances
└─ Used by: State Manager associations

Session Documents
├─ Configure Session Manager settings
└─ Used by: Session Manager
```

## Operational Workflow Example

```
┌─────────────────────────────────────────────────────────────┐
│     Complete Systems Manager Operational Workflow           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Inventory (Discover)                                    │
│     └─ Identifies all managed nodes and their software      │
│                                                             │
│  2. Compliance (Detect)                                     │
│     └─ Detects non-compliant instances                      │
│          (missing patches, incorrect configs)               │
│                                                             │
│  3. Patch Manager & State Manager (Resolve)                 │
│     ├─ Patch Manager: Applies missing patches               │
│     └─ State Manager: Applies correct configurations        │
│                                                             │
│  4. Run Command & Session Manager (Edge Cases)              │
│     ├─ Run Command: Custom scripts for specific issues      │
│     └─ Session Manager: Manual troubleshooting              │
│                                                             │
│  5. Fleet Manager (Visibility)                              │
│     └─ Provides unified view of all nodes                   │
│          Ensures all are operational and compliant          │
│                                                             │
│  6. Automation (Continuous Improvement)                     │
│     └─ Automates repetitive operational tasks               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Summary

**Key Takeaways:**

1. **Systems Manager** provides unified operational management for AWS and on-premises
2. **SSM Agent** enables Systems Manager to manage nodes
3. **Fleet Manager** offers remote node management without SSH/RDP
4. **Session Manager** provides secure, auditable shell access
5. **Run Command** executes commands at scale
6. **Patch Manager** automates patching with compliance tracking
7. **State Manager** maintains consistent configurations via associations
8. **Parameter Store** centralizes configuration and secrets management
9. **Automation** streamlines operational tasks with runbooks

**Best Practices:**

- Install SSM Agent on all managed nodes
- Use IAM roles (not access keys) for EC2 instances
- Implement Session Manager instead of bastion hosts
- Create patch baselines aligned with security policies
- Use maintenance windows for disruptive changes
- Leverage State Manager for configuration drift prevention
- Store configuration in Parameter Store for centralized management
- Use Automation runbooks for common operational tasks
- Monitor compliance status regularly
- Enable CloudWatch Logs for Session Manager auditing
- Tag resources appropriately for targeted operations
- Test automation runbooks in non-production first

