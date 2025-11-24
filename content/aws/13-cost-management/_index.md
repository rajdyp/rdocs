---
title: Cost Management and Governance
linkTitle: Cost Management
type: docs
weight: 13
prev: /aws/12-application-integration
---

## Overview

Managing costs and implementing governance are essential skills for anyone working with AWS. Without proper cost management, cloud bills can quickly spiral out of control. This chapter covers AWS tools and strategies for understanding, monitoring, optimizing, and controlling your AWS spending.

## AWS Pricing Fundamentals

### Core Pricing Models

```
┌─────────────────────────────────────────────────────────────┐
│          AWS Pricing Models                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Pay-As-You-Go (On-Demand)                                  │
│  ├─ Pay for what you use, when you use it                   │
│  ├─ No upfront commitment                                   │
│  ├─ Billed by hour or second                                │
│  └─ Use case: Variable workloads, testing, short-term       │
│                                                             │
│  Save When You Commit (Reserved/Savings Plans)              │
│  ├─ Commit to 1 or 3 years                                  │
│  ├─ Discount: 30-75% vs On-Demand                           │
│  ├─ Payment: All upfront, partial, or no upfront            │
│  └─ Use case: Steady-state, predictable workloads           │
│                                                             │
│  Pay Less When You Use More (Volume Discounts)              │
│  ├─ Tiered pricing for services like S3, Data Transfer      │
│  ├─ Automatic discounts as usage increases                  │
│  └─ Use case: Large-scale data storage, transfer            │
│                                                             │
│  Pay Even Less (Spot Instances)                             │
│  ├─ Bid on unused EC2 capacity                              │
│  ├─ Discount: Up to 90% vs On-Demand                        │
│  ├─ Can be interrupted with 2-minute warning                │
│  └─ Use case: Flexible start/end, fault-tolerant apps       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Common Service Pricing

```
┌─────────────────────────────────────────────────────────────┐
│          Key Service Pricing Models                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  EC2 (Elastic Compute Cloud)                                │
│  ├─ Instance hours (per second billing, 1 min minimum)      │
│  ├─ Instance type determines price                          │
│  ├─ Data transfer out (charged)                             │
│  ├─ Data transfer in (free)                                 │
│  └─ EBS volumes charged separately                          │
│                                                             │
│  S3 (Simple Storage Service)                                │
│  ├─ Storage: GB per month (varies by storage class)         │
│  ├─ Requests: GET, PUT, DELETE operations                   │
│  ├─ Data transfer out (charged after 100 GB/month free)     │
│  └─ Data transfer in (free)                                 │
│                                                             │
│  RDS (Relational Database Service)                          │
│  ├─ Instance hours                                          │
│  ├─ Storage: GB per month                                   │
│  ├─ Provisioned IOPS (if used)                              │
│  ├─ Backup storage beyond DB size (charged)                 │
│  └─ Data transfer out (charged)                             │
│                                                             │
│  Lambda                                                     │
│  ├─ Requests: First 1M/month free, then $0.20 per 1M        │
│  ├─ Duration: GB-seconds (memory × execution time)          │
│  ├─ First 400,000 GB-seconds/month free                     │
│  └─ No charge when not executing                            │
│                                                             │
│  Data Transfer                                              │
│  ├─ Between AZs: $0.01 - $0.02 per GB (both directions)     │
│  ├─ Between regions: Varies by region pair                  │
│  ├─ To internet: First 100 GB/month free, then tiered       │
│  └─ From internet: Free                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Free Tier

```
AWS Free Tier (For 12 months from signup)
├─ EC2: 750 hours/month of t2.micro or t3.micro
├─ S3: 5 GB standard storage, 20,000 GET, 2,000 PUT requests
├─ RDS: 750 hours/month of db.t2.micro, 20 GB storage
├─ Lambda: 1M requests/month, 400,000 GB-seconds compute
├─ DynamoDB: 25 GB storage, 25 read/write capacity units
├─ CloudWatch: 10 custom metrics, 10 alarms
└─ Many other services with limited free usage

Always Free (No expiration)
├─ DynamoDB: 25 GB storage, 25 WCU, 25 RCU
├─ Lambda: 1M requests, 400,000 GB-seconds per month
├─ SNS: 1,000 email deliveries
├─ CloudWatch: 10 metrics, 10 alarms
└─ More services with perpetual free tier
```

## AWS Billing Dashboard

### Understanding Your Bill

```
┌─────────────────────────────────────────────────────────────┐
│          AWS Billing Dashboard                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Current Month Charges (Month-to-Date)                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Total: $1,245.67                                  │     │
│  │                                                    │     │
│  │  By Service:                                       │     │
│  │  ├─ EC2: $678.90 (54%)                             │     │
│  │  ├─ RDS: $234.56 (19%)                             │     │
│  │  ├─ S3: $123.45 (10%)                              │     │
│  │  ├─ Data Transfer: $89.12 (7%)                     │     │
│  │  └─ Other: $119.64 (10%)                           │     │
│  │                                                    │     │
│  │  By Region:                                        │     │
│  │  ├─ us-east-1: $789.00 (63%)                       │     │
│  │  ├─ us-west-2: $345.67 (28%)                       │     │
│  │  └─ eu-west-1: $111.00 (9%)                        │     │
│  │                                                    │     │
│  │  Forecast:                                         │     │
│  │  └─ Estimated end-of-month: $1,890.00              │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  Cost and Usage Reports                                     │
│  ├─ Detailed line-item billing data                         │
│  ├─ Delivered to S3 bucket                                  │
│  ├─ Hourly or daily granularity                             │
│  └─ Analyze with Athena, QuickSight, or BI tools            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## AWS Cost Explorer

### What is Cost Explorer?

**AWS Cost Explorer** is a tool that enables you to visualize, understand, and manage your AWS costs and usage over time.

```
┌─────────────────────────────────────────────────────────────┐
│          Cost Explorer Capabilities                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Cost Visualization                                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Monthly Costs (Last 6 Months)                     │     │
│  │                                                    │     │
│  │  $2000│                            ████            │     │
│  │       │                    ████    ████            │     │
│  │  $1500│            ████    ████    ████    ████    │     │
│  │       │    ████    ████    ████    ████    ████    │     │
│  │  $1000│    ████    ████    ████    ████    ████    │     │
│  │       │    ████    ████    ████    ████    ████    │     │
│  │   $500│    ████    ████    ████    ████    ████    │     │
│  │       │    ████    ████    ████    ████    ████    │     │
│  │     $0└────┴───────┴───────┴───────┴───────┴────   │     │
│  │        Jan    Feb    Mar    Apr    May    Jun      │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  Filtering and Grouping                                     │
│  ├─ Time period: Days, months, custom ranges                │
│  ├─ Granularity: Daily, monthly, hourly (for RI)            │
│  ├─ Group by:                                               │
│  │  • Service (EC2, S3, RDS, etc.)                          │
│  │  • Region (us-east-1, eu-west-1, etc.)                   │
│  │  • Linked account (in Organizations)                     │
│  │  • Instance type (t3.micro, m5.large, etc.)              │
│  │  • Tag (Environment, Project, Owner, etc.)               │
│  │  • Purchase option (On-Demand, Reserved, Spot)           │
│  └─ Filter by: Any dimension above                          │
│                                                             │
│  Built-in Reports                                           │
│  ├─ Cost and usage                                          │
│  ├─ Reservation utilization and coverage                    │
│  ├─ Reserved Instance recommendations                       │
│  ├─ Savings Plans recommendations                           │
│  └─ Right-sizing recommendations                            │
│                                                             │
│  Forecasting                                                │
│  ├─ Predicts future costs based on historical usage         │
│  ├─ Uses machine learning                                   │
│  └─ Helps with budget planning                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Common Cost Explorer Use Cases

```
Use Case 1: Identify Cost Spikes
├─ View daily costs for last 30 days
├─ Identify days with unexpected charges
├─ Drill down by service to find root cause
└─ Example: Forgot to delete test EC2 instances

Use Case 2: Compare Costs Month-over-Month
├─ View monthly costs for last 6 months
├─ Identify growing services
├─ Plan for capacity and budget
└─ Example: S3 costs growing 20% per month

Use Case 3: Analyze Costs by Team/Project
├─ Group by tag (Project: ProjectA, ProjectB)
├─ Identify which projects cost most
├─ Allocate costs to cost centers
└─ Example: Marketing vs Engineering costs

Use Case 4: Optimize Instance Types
├─ View Right Sizing Recommendations
├─ Identify over-provisioned instances
├─ Estimate savings from downsizing
└─ Example: m5.xlarge instances at 10% CPU
```

## AWS Budgets

### What are AWS Budgets?

**AWS Budgets** enables you to set custom cost and usage budgets that alert you when you exceed (or are forecasted to exceed) your budgeted amount.

```
┌─────────────────────────────────────────────────────────────┐
│          AWS Budgets Workflow                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Step 1: Create Budget                                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Budget Name: Monthly EC2 Budget                   │     │
│  │  Budget Type: Cost budget                          │     │
│  │  Amount: $500/month                                │     │
│  │  Filters: Service = EC2, Region = us-east-1        │     │
│  └────────────────────────────────────────────────────┘     │
│                   │                                         │
│                   ▼                                         │
│  Step 2: Configure Alerts                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Alert 1: 80% of budget ($400)                     │     │
│  │  Alert 2: 100% of budget ($500)                    │     │
│  │  Alert 3: 120% forecasted                          │     │
│  │  Notification: Email to ops-team@company.com       │     │
│  └────────────────────────────────────────────────────┘     │
│                   │                                         │
│                   ▼                                         │
│  Step 3: Monitor Usage                                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Current Spend: $420 (84% of budget)               │     │
│  │  Forecasted: $630 (126% of budget)                 │     │
│  │                                                    │     │
│  │  Alert triggered:                                  │     │
│  │  • 80% threshold exceeded                          │     │
│  │  • Forecasted to exceed budget                     │     │
│  └────────────────────────────────────────────────────┘     │
│                   │                                         │
│                   ▼                                         │
│  Step 4: Take Action                                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │  ├─ Investigate cost increase in Cost Explorer     │     │
│  │  ├─ Identify unused resources                      │     │
│  │  ├─ Right-size or terminate instances              │     │
│  │  └─ Adjust budget if needed                        │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Budget Types

```
┌─────────────────────────────────────────────────────────────┐
│          Budget Types                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Cost Budget                                                │
│  ├─ Set monthly, quarterly, or annual cost limits           │
│  ├─ Alert when spending exceeds threshold                   │
│  └─ Example: Alert if monthly costs exceed $1,000           │
│                                                             │
│  Usage Budget                                               │
│  ├─ Track usage of specific services or resources           │
│  ├─ Monitor in units (hours, GB, requests)                  │
│  └─ Example: Alert if EC2 usage exceeds 1,000 hours         │
│                                                             │
│  Reservation Budget                                         │
│  ├─ Track Reserved Instance or Savings Plans utilization    │
│  ├─ Alert if utilization falls below threshold              │
│  └─ Example: Alert if RI utilization < 80%                  │
│                                                             │
│  Savings Plans Budget                                       │
│  ├─ Monitor Savings Plans coverage and utilization          │
│  └─ Example: Alert if coverage < 90%                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Budget Actions (Automated Responses)

```
Budget Actions (Automated Cost Controls)

┌──────────────────────────────────────────┐
│  Budget exceeded                         │
└────────────────┬─────────────────────────┘
                 │
                 │ Automatically trigger
                 ▼
┌────────────────────────────────────────────────────────┐
│  Actions:                                              │
│  ├─ Apply IAM policy (deny specific actions)           │
│  │  Example: Prevent launching new EC2 instances       │
│  │                                                     │
│  ├─ Apply Service Control Policy (SCPs in Orgs)        │
│  │  Example: Block all EC2 launches org-wide           │
│  │                                                     │
│  └─ Run SSM automation documents                       │
│     Example: Stop non-production instances             │
└────────────────────────────────────────────────────────┘

Use Cases:
├─ Prevent runaway costs automatically
├─ Enforce spending limits on dev/test accounts
└─ Compliance and governance
```

## AWS Organizations

### What is AWS Organizations?

**AWS Organizations** enables you to centrally manage and govern multiple AWS accounts in a hierarchical structure.

```
┌─────────────────────────────────────────────────────────────┐
│          AWS Organizations Structure                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Root (Management Account)                           │   │
│  │  └─ Consolidated billing                             │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│          ┌────────┼────────┬──────────────┐                 │
│          │        │        │              │                 │
│          ▼        ▼        ▼              ▼                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│  │ Production │ │Development │ │   Shared   │               │
│  │    OU      │ │     OU     │ │ Services OU│               │
│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘               │
│        │              │              │                      │
│   ┌────┴───┐     ┌────┴───┐     ┌────┴───┐                  │
│   │        │     │        │     │        │                  │
│   ▼        ▼     ▼        ▼     ▼        ▼                  │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                │
│ │Prod  │ │Prod  │ │Dev   │ │Test  │ │Log   │                │
│ │Web   │ │DB    │ │Env   │ │Env   │ │Acct  │                │
│ │Acct  │ │Acct  │ │Acct  │ │Acct  │ │      │                │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                │
│                                                             │
│  Key Concepts:                                              │
│  ├─ Root: Top-level container                               │
│  ├─ Organizational Unit (OU): Container for accounts        │
│  ├─ Account: Individual AWS account                         │
│  ├─ Management Account: Root account (billing, SCPs)        │
│  └─ Member Accounts: All other accounts in organization     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Organizations Benefits

```
┌─────────────────────────────────────────────────────────────┐
│          AWS Organizations Benefits                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Consolidated Billing                                       │
│  ├─ Single bill for all accounts                            │
│  ├─ Volume discounts across all accounts                    │
│  ├─ Share Reserved Instances and Savings Plans              │
│  └─ Centralized payment method                              │
│                                                             │
│  Example Savings:                                           │
│  Without Organizations:                                     │
│  • Account A: 100 GB S3 → $0.023/GB = $2.30                 │
│  • Account B: 100 GB S3 → $0.023/GB = $2.30                 │
│  • Total: $4.60                                             │
│                                                             │
│  With Organizations (Combined 200 GB):                      │
│  • 0-50 GB: $0.023/GB = $1.15                               │
│  • 50-200 GB: $0.022/GB = $3.30                             │
│  • Total: $4.45 (savings of $0.15)                          │
│                                                             │
│  Centralized Management                                     │
│  ├─ Create accounts programmatically                        │
│  ├─ Invite existing accounts to organization                │
│  ├─ Organize accounts hierarchically (OUs)                  │
│  └─ Apply policies across accounts                          │
│                                                             │
│  Security and Compliance                                    │
│  ├─ Service Control Policies (SCPs)                         │
│  ├─ Tag policies (enforce tagging standards)                │
│  ├─ AI services opt-out policies                            │
│  └─ Backup policies (centralized backup rules)              │
│                                                             │
│  Cost Allocation                                            │
│  ├─ Track costs per account                                 │
│  ├─ Allocate costs to departments/teams                     │
│  └─ Chargeback and showback                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Service Control Policies (SCPs)

```
┌─────────────────────────────────────────────────────────────┐
│          Service Control Policies (SCPs)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  What are SCPs?                                             │
│  ├─ Permission boundaries for accounts and OUs              │
│  ├─ Define maximum available permissions                    │
│  ├─ Do NOT grant permissions (only limit)                   │
│  └─ Applied to OUs or individual accounts                   │
│                                                             │
│  Example 1: Deny Specific Regions                           │
│  {                                                          │
│    "Version": "2012-10-17",                                 │
│    "Statement": [{                                          │
│      "Effect": "Deny",                                      │
│      "Action": "*",                                         │
│      "Resource": "*",                                       │
│      "Condition": {                                         │
│        "StringNotEquals": {                                 │
│          "aws:RequestedRegion": [                           │
│            "us-east-1",                                     │
│            "us-west-2"                                      │
│          ]                                                  │
│        }                                                    │
│      }                                                      │
│    }]                                                       │
│  }                                                          │
│  → Prevents any service usage outside us-east-1, us-west-2  │
│                                                             │
│  Example 2: Deny Root User Actions                          │
│  {                                                          │
│    "Version": "2012-10-17",                                 │
│    "Statement": [{                                          │
│      "Effect": "Deny",                                      │
│      "Action": "*",                                         │
│      "Resource": "*",                                       │
│      "Condition": {                                         │
│        "StringLike": {                                      │
│          "aws:PrincipalArn": "arn:aws:iam::*:root"          │
│        }                                                    │
│      }                                                      │
│    }]                                                       │
│  }                                                          │
│  → Prevents root user from performing any actions           │
│                                                             │
│  Example 3: Deny Stopping EC2 in Production                 │
│  {                                                          │
│    "Version": "2012-10-17",                                 │
│    "Statement": [{                                          │
│      "Effect": "Deny",                                      │
│      "Action": [                                            │
│        "ec2:StopInstances",                                 │
│        "ec2:TerminateInstances"                             │
│      ],                                                     │
│      "Resource": "*",                                       │
│      "Condition": {                                         │
│        "StringEquals": {                                    │
│          "ec2:ResourceTag/Environment": "Production"        │
│        }                                                    │
│      }                                                      │
│    }]                                                       │
│  }                                                          │
│  → Prevents stopping/terminating production instances       │
│                                                             │
│  Important: SCPs do NOT apply to management account         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Resource Tagging

### Tagging Strategy

```
┌─────────────────────────────────────────────────────────────┐
│          Resource Tagging Best Practices                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  What are Tags?                                             │
│  ├─ Key-value pairs attached to AWS resources               │
│  ├─ User-defined metadata                                   │
│  ├─ Maximum 50 tags per resource                            │
│  └─ Used for organization, cost allocation, automation      │
│                                                             │
│  Example Resource Tags:                                     │
│  EC2 Instance: i-1234567890abcdef0                          │
│  ├─ Name: web-server-01                                     │
│  ├─ Environment: Production                                 │
│  ├─ Project: WebApp                                         │
│  ├─ Owner: engineering@company.com                          │
│  ├─ CostCenter: 12345                                       │
│  ├─ Backup: Daily                                           │
│  └─ Compliance: HIPAA                                       │
│                                                             │
│  Recommended Tag Categories                                 │
│                                                             │
│  Technical Tags                                             │
│  ├─ Name: Resource name                                     │
│  ├─ Environment: Dev, Test, Staging, Production             │
│  ├─ Application: Application name                           │
│  └─ Version: Software version                               │
│                                                             │
│  Business Tags                                              │
│  ├─ Project: Project name                                   │
│  ├─ Owner: Team or person responsible                       │
│  ├─ CostCenter: For chargeback                              │
│  └─ BusinessUnit: Department or division                    │
│                                                             │
│  Security Tags                                              │
│  ├─ Compliance: Regulatory requirements (PCI, HIPAA)        │
│  ├─ Confidentiality: Data classification level              │
│  └─ SecurityGroup: Security posture                         │
│                                                             │
│  Automation Tags                                            │
│  ├─ Backup: Backup frequency/policy                         │
│  ├─ Patch: Patching schedule                                │
│  ├─ Schedule: Start/stop schedule                           │
│  └─ Monitoring: Monitoring requirements                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Cost Allocation Tags

```
Cost Allocation Tags enable cost tracking by tag

Activation Process:
1. Define tags in billing console
2. Tag resources with cost allocation tags
3. Activate tags in billing console (takes 24 hours)
4. View costs grouped by tags in Cost Explorer

Example: Track costs by project
├─ Tag all resources: Project=ProjectA or Project=ProjectB
├─ Activate "Project" tag in billing
├─ Cost Explorer: Group by Tag → Project
└─ Result: See costs per project

Use Cases:
├─ Chargeback: Bill internal teams for their usage
├─ Showback: Show teams their spending
├─ Project accounting: Track project budgets
└─ Environment costs: Compare prod vs dev costs
```

## Cost Optimization Strategies

```
┌─────────────────────────────────────────────────────────────┐
│          Cost Optimization Strategies                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Right-Sizing                                            │
│  ├─ Analyze CloudWatch metrics (CPU, memory, network)       │
│  ├─ Use Cost Explorer Right Sizing recommendations          │
│  ├─ Downsize over-provisioned instances                     │
│  └─ Potential savings: 20-40%                               │
│                                                             │
│  Example:                                                   │
│  • Current: m5.2xlarge (8 vCPU, 32 GB) at 10% CPU           │
│  • Recommendation: m5.large (2 vCPU, 8 GB)                  │
│  • Savings: $0.384/hr → $0.096/hr (75% reduction)           │
│                                                             │
│  2. Reserved Instances and Savings Plans                    │
│  ├─ Commit to 1 or 3 years for steady-state workloads       │
│  ├─ Savings Plans: Flexible across instance families        │
│  ├─ Reserved Instances: Specific instance commitment        │
│  └─ Potential savings: 30-75%                               │
│                                                             │
│  Comparison:                                                │
│  • On-Demand: $0.096/hr → $841/year                         │
│  • Savings Plan (1-year): $0.064/hr → $561/year (33% off)   │
│  • Savings Plan (3-year): $0.041/hr → $359/year (57% off)   │
│                                                             │
│  3. Spot Instances                                          │
│  ├─ Use for fault-tolerant, flexible workloads              │
│  ├─ Combine with Auto Scaling for high availability         │
│  ├─ Mix Spot, On-Demand, and Reserved for optimal blend     │
│  └─ Potential savings: Up to 90%                            │
│                                                             │
│  4. Idle Resource Cleanup                                   │
│  ├─ Identify and delete unused resources                    │
│  │  • Unattached EBS volumes                                │
│  │  • Old EBS snapshots                                     │
│  │  • Unused Elastic IPs                                    │
│  │  • Old AMIs                                              │
│  ├─ Stop instances during off-hours (dev/test)              │
│  └─ Use AWS Config rules to find idle resources             │
│                                                             │
│  5. Storage Optimization                                    │
│  S3 Lifecycle Policies:                                     │
│  ├─ Transition old data to cheaper storage classes          │
│  │  Standard → Standard-IA → Glacier → Deep Archive         │
│  ├─ Delete objects after expiration                         │
│  └─ Use S3 Intelligent-Tiering for unknown access patterns  │
│                                                             │
│  EBS Optimization:                                          │
│  ├─ Delete unattached volumes                               │
│  ├─ Use gp3 instead of gp2 (cheaper, better performance)    │
│  ├─ Snapshot older data, delete volumes                     │
│  └─ Use EBS Snapshot Archive for long-term retention        │
│                                                             │
│  6. Monitor and Set Budgets                                 │
│  ├─ Create budgets with alerts                              │
│  ├─ Review Cost Explorer regularly                          │
│  ├─ Set up anomaly detection                                │
│  └─ Use Cost Anomaly Detection for unexpected spikes        │
│                                                             │
│  7. Data Transfer Optimization                              │
│  ├─ Use CloudFront CDN to reduce data transfer costs        │
│  ├─ Keep traffic within same region when possible           │
│  ├─ Use VPC endpoints to avoid NAT Gateway costs            │
│  └─ Review cross-region data transfer charges               │
│                                                             │
│  8. Serverless Where Appropriate                            │
│  ├─ Lambda instead of always-on EC2 for sporadic workloads  │
│  ├─ Aurora Serverless for variable database workloads       │
│  ├─ DynamoDB On-Demand for unpredictable traffic            │
│  └─ Pay only for actual usage, not idle time                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## AWS Backup

### What is AWS Backup?

**AWS Backup** is a fully managed backup service that centralizes and automates data protection across AWS services.

```
┌─────────────────────────────────────────────────────────────┐
│          AWS Backup Architecture                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Resources to Backup                                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │  • EBS volumes                                     │     │
│  │  • EC2 instances                                   │     │
│  │  • RDS databases                                   │     │
│  │  • DynamoDB tables                                 │     │
│  │  • EFS file systems                                │     │
│  │  • Storage Gateway volumes                         │     │
│  └────────────────┬───────────────────────────────────┘     │
│                   │                                         │
│                   │ Tagged with Backup: Daily               │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Backup Plan                                         │   │
│  │  ├─ Name: DailyBackups                               │   │
│  │  ├─ Frequency: Daily at 1:00 AM                      │   │
│  │  ├─ Retention: 7 days                                │   │
│  │  ├─ Lifecycle: Move to cold storage after 30 days    │   │
│  │  └─ Copy to: us-west-2 (cross-region)                │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│                   │ Automatically executes                  │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Backup Vault                                        │   │
│  │  ├─ Encrypted backups stored                         │   │
│  │  ├─ Access policies (who can restore)                │   │
│  │  └─ Notifications on job completion/failure          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  Benefits:                                                  │
│  ├─ Centralized backup management                           │
│  ├─ Automated backup scheduling                             │
│  ├─ Lifecycle management (move to cold storage)             │
│  ├─ Cross-region and cross-account backups                  │
│  ├─ Compliance reporting                                    │
│  └─ Point-in-time restore                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Backup Strategies

```
Backup Frequency Options
├─ Continuous: For DynamoDB, RDS (PITR)
├─ Hourly: Critical databases
├─ Daily: Most workloads
├─ Weekly: Dev/test environments
└─ Monthly: Long-term archives

Retention Strategies
├─ Short-term: 7-30 days (operational recovery)
├─ Long-term: 1-7 years (compliance, audit)
└─ Permanent: Never expire (legal hold)

3-2-1 Backup Rule
├─ 3 copies of data
├─ 2 different storage types
└─ 1 offsite backup (different region)
```

## Best Practices Summary

```
┌─────────────────────────────────────────────────────────────┐
│          Cost Management Best Practices                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Visibility                                                 │
│  ├─ Enable Cost and Usage Reports                           │
│  ├─ Review Cost Explorer regularly                          │
│  ├─ Create operational dashboards                           │
│  └─ Set up cost anomaly detection                           │
│                                                             │
│  Control                                                    │
│  ├─ Create budgets with alerts                              │
│  ├─ Use AWS Organizations for consolidated billing          │
│  ├─ Implement Service Control Policies                      │
│  └─ Automate responses with Budget Actions                  │
│                                                             │
│  Optimization                                               │
│  ├─ Right-size resources regularly                          │
│  ├─ Use Reserved Instances/Savings Plans for steady state   │
│  ├─ Delete idle resources                                   │
│  ├─ Implement S3 lifecycle policies                         │
│  └─ Review Right Sizing recommendations monthly             │
│                                                             │
│  Governance                                                 │
│  ├─ Implement mandatory tagging strategy                    │
│  ├─ Use tag policies to enforce standards                   │
│  ├─ Enable cost allocation tags                             │
│  ├─ Organize accounts with AWS Organizations                │
│  └─ Review IAM policies to prevent unauthorized spending    │
│                                                             │
│  Backup and DR                                              │
│  ├─ Use AWS Backup for centralized backup management        │
│  ├─ Implement cross-region backups for DR                   │
│  ├─ Test restore procedures regularly                       │
│  └─ Define and document RTO/RPO requirements                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Summary

**Key Takeaways:**

1. **AWS pricing** uses multiple models: pay-as-you-go, reserved, spot, and volume discounts
2. **Cost Explorer** visualizes spending patterns and provides optimization recommendations
3. **AWS Budgets** set spending limits with automated alerts and actions
4. **AWS Organizations** enables multi-account management with consolidated billing
5. **Service Control Policies** enforce security and compliance guardrails
6. **Resource tagging** enables cost allocation and resource organization
7. **Reserved Instances and Savings Plans** provide 30-75% discounts for committed usage
8. **Right-sizing** identifies over-provisioned resources for optimization
9. **AWS Backup** centralizes data protection across AWS services

**Best Practices:**

- Review Cost Explorer weekly to identify trends and anomalies
- Create budgets for all accounts with appropriate alert thresholds
- Use AWS Organizations for consolidated billing and volume discounts
- Implement comprehensive tagging strategy from day one
- Activate cost allocation tags for detailed cost tracking
- Purchase Reserved Instances or Savings Plans for steady-state workloads
- Right-size resources based on CloudWatch metrics
- Delete idle resources regularly (unattached volumes, old snapshots)
- Implement S3 lifecycle policies to move data to cheaper storage classes
- Use Spot Instances for fault-tolerant workloads
- Stop non-production instances during off-hours
- Enable Cost Anomaly Detection for unexpected spending
- Use Service Control Policies to prevent costly mistakes
- Implement automated backups with AWS Backup
- Review and optimize data transfer costs
- Document chargeback/showback processes for internal teams
- Conduct monthly cost optimization reviews

