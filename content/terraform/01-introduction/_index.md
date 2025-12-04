---
title: Introduction
linkTitle: Introduction
type: docs
weight: 1
prev: /terraform
next: /terraform/02-workflow-and-cli
---

## What is Terraform?

**Terraform** is an Infrastructure as Code (IaC) tool created by HashiCorp that allows you to define, provision, and manage infrastructure resources across multiple cloud providers and services using human-readable configuration files.

> **Note on Licensing**: Terraform was originally open-source under MPL 2.0, but HashiCorp changed the license to Business Source License v1.1 (BSL 1.1) in August 2023. This means Terraform is now source-available but not fully open-source. The open-source fork [OpenTofu](https://opentofu.org/) was created by the community in response.

### Core Principles

1. **Declarative**: You describe the desired end state, not the steps to get there
2. **Cloud-agnostic**: Works with AWS, Azure, GCP, and 100+ providers
3. **Immutable infrastructure**: Replace rather than modify resources
4. **Version controlled**: Track infrastructure changes like code

## Infrastructure as Code (IaC)

Infrastructure as Code (IaC) is a way to manage and provision infrastructure using code instead of manual processes.

### Traditional vs. IaC Approach

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRADITIONAL APPROACH                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Manual Steps:                                                  │
│  1. Log into AWS Console                                        │
│  2. Click through UI to create EC2 instance                     │
│  3. Configure security groups manually                          │
│  4. Set up networking                                           │
│  5. Document changes (maybe...)                                 │
│                                                                 │
│  Problems:                                                      │
│  ❌ Time-consuming                                              │
│  ❌ Error-prone                                                 │
│  ❌ Hard to replicate                                           │
│  ❌ No version history                                          │
│  ❌ Difficult to collaborate                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE AS CODE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Code-Based Approach:                                           │
│  1. Write configuration file (main.tf)                          │
│  2. Version control with Git                                    │
│  3. Review changes (terraform plan)                             │
│  4. Apply infrastructure (terraform apply)                      │
│  5. Automatically documented                                    │
│                                                                 │
│  Benefits:                                                      │
│  ✅ Fast and repeatable                                         │
│  ✅ Consistent and predictable                                  │
│  ✅ Easy to replicate across environments                       │
│  ✅ Full version history                                        │
│  ✅ Team collaboration through Git                              │
│  ✅ Automated testing possible                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## How Terraform Works

Terraform follows a simple but powerful workflow to manage infrastructure:

```
┌────────────────────────────────────────────────────────────────────┐
│                       TERRAFORM WORKFLOW                           │
└────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │   WRITE     │  Write infrastructure as code
    │   (.tf)     │  Define resources in HCL
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │    PLAN     │  Preview changes before applying
    │  (preview)  │  See what will be created/modified/destroyed
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │   APPLY     │  Provision infrastructure
    │  (execute)  │  Create/update/delete resources
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │   MANAGE    │  Update infrastructure
    │  (iterate)  │  Modify and version control changes
    └─────────────┘
```

### Detailed Workflow Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                      TERRAFORM EXECUTION FLOW                              │
└────────────────────────────────────────────────────────────────────────────┘

 Developer              Terraform Core           State File        Cloud Provider
     │                        │                       │                   │
     │                        │                       │                   │
┌────┴──────────────────────────────────────────────────────────────────────┐
│ 1. INITIALIZE (terraform init)                                            │
└───────────────────────────────────────────────────────────────────────────┘
     │                        │                       │                   │
     │   terraform init       │                       │                   │
     │───────────────────────>│                       │                   │
     │                        │                       │                   │
     │                        │  • Parse config (.tf files)               │
     │                        │  • Download providers (.terraform/)       │
     │                        │  • Initialize modules                     │
     │                        │  • Setup backend                          │
     │                        │                       │                   │
     │                        │   Connect to backend  │                   │
     │                        │──────────────────────>│                   │
     │                        │<──────────────────────│                   │
     │                        │                       │                   │
     │   ✓ Initialized        │                       │                   │
     │<───────────────────────│                       │                   │
     │                        │                       │                   │
┌────┴──────────────────────────────────────────────────────────────────────┐
│ 2. PLAN (terraform plan)                                                  │
└───────────────────────────────────────────────────────────────────────────┘
     │                        │                       │                   │
     │   terraform plan       │                       │                   │
     │───────────────────────>│                       │                   │
     │                        │                       │                   │
     │                        │  • Parse .tf files    │                   │
     │                        │  • Build resource graph                   │
     │                        │                       │                   │
     │                        │   Read current state  │                   │
     │                        │──────────────────────>│                   │
     │                        │<──────────────────────│                   │
     │                        │   (resource mappings) │                   │
     │                        │                       │                   │
     │                        │   Query actual state  │                   │
     │                        │──────────────────────────────────────────>│
     │                        │                       │    API: List/     │
     │                        │                       │    Describe       │
     │                        │<──────────────────────────────────────────│
     │                        │   (current resources) │                   │
     │                        │                       │                   │
     │                        │  • Compare desired vs actual              │
     │                        │  • Calculate changes (diff)               │
     │                        │  • Determine dependencies                 │
     │                        │                       │                   │
     │   Preview:             │                       │                   │
     │   + 3 to add           │                       │                   │
     │   ~ 1 to change        │                       │                   │
     │   - 0 to destroy       │                       │                   │
     │<───────────────────────│                       │                   │
     │                        │                       │                   │
     │   [Review changes]     │                       │                   │
     │                        │                       │                   │
┌────┴──────────────────────────────────────────────────────────────────────┐
│ 3. APPLY (terraform apply)                                                │
└───────────────────────────────────────────────────────────────────────────┘
     │                        │                       │                   │
     │   terraform apply      │                       │                   │
     │   (or approve plan)    │                       │                   │
     │───────────────────────>│                       │                   │
     │                        │                       │                   │
     │                        │  • Re-run plan (unless saved)             │
     │                        │  • Acquire state lock │                   │
     │                        │──────────────────────>│                   │
     │                        │<──────────────────────│                   │
     │                        │   (lock acquired)     │                   │
     │                        │                       │                   │
     │                        │  Execute changes in dependency order:     │
     │                        │                       │                   │
     │                        │   Create VPC          │                   │
     │                        │──────────────────────────────────────────>│
     │                        │                       │    API: Create    │
     │                        │<──────────────────────────────────────────│
     │                        │   (VPC ID: vpc-123)   │                   │
     │                        │                       │                   │
     │                        │   Update state        │                   │
     │                        │──────────────────────>│                   │
     │                        │                       │                   │
     │                        │   Create Subnet       │                   │
     │                        │──────────────────────────────────────────>│
     │                        │                       │    API: Create    │
     │                        │<──────────────────────────────────────────│
     │                        │   (Subnet ID)         │                   │
     │                        │                       │                   │
     │                        │   Update state        │                   │
     │                        │──────────────────────>│                   │
     │                        │                       │                   │
     │                        │  [Continue for all resources...]          │
     │                        │                       │                   │
     │                        │  • Write final state  │                   │
     │                        │──────────────────────>│                   │
     │                        │  • Release state lock │                   │
     │                        │──────────────────────>│                   │
     │                        │                       │                   │
     │   Apply complete!      │                       │                   │
     │   Resources: 3 added   │                       │                   │
     │<───────────────────────│                       │                   │
     │                        │                       │                   │
┌────┴──────────────────────────────────────────────────────────────────────┐
│ 4. MANAGE & ITERATE                                                       │
└───────────────────────────────────────────────────────────────────────────┘
     │                        │                       │                   │
     │  [Edit .tf files]      │                       │                   │
     │  terraform plan        │                       │                   │
     │  terraform apply       │                       │                   │
     │  terraform destroy     │  (when needed)        │                   │
     │                        │                       │                   │

Legend:
───> : Command/Request flow
<─── : Response/Data flow
  •  : Internal Terraform operation
```

> **Note on State Drift:** During the plan phase, Terraform queries the cloud provider to check whether actual resources differ from what’s recorded in the state file (e.g., manual changes in the console). This difference is called **state drift**. Terraform automatically detects and reports drift during `terraform plan`, but only reconciles it when you run `terraform apply`.

## Terraform Architecture

Understanding Terraform's architecture helps you use it effectively.

```
┌───────────────────────────────────────────────────────────────┐
│                    TERRAFORM ARCHITECTURE                     │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                        USER LAYER                             │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  main.tf     │  │ variables.tf │  │  outputs.tf  │         │
│  │              │  │              │  │              │         │
│  │ Configuration│  │   Variable   │  │   Output     │         │
│  │   Files      │  │  Definitions │  │   Values     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                               │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         ▼
┌───────────────────────────────────────────────────────────────┐
│                     TERRAFORM CORE                            │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  • Read and parse configuration files                  │   │
│  │  • Build dependency graph                              │   │
│  │  • Manage state                                        │   │
│  │  • Execute plans                                       │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌───────────────────┐           ┌──────────────┐             │
│  │  State File       │           │ Provider     │             │
│  │                   │           │ Plugins      │             │
│  │ terraform.tfstate │<─────────>│              │             │
│  │                   │           │ (AWS, Azure, │             │
│  │                   │           │  GCP, etc.)  │             │
│  └───────────────────┘           └───────┬──────┘             │
└──────────────────────────────────────────┼────────────────────┘
                                           │
                                           ▼
┌───────────────────────────────────────────────────────────────┐
│                    PROVIDER LAYER                             │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   AWS    │  │  Azure   │  │   GCP    │  │ Others   │       │
│  │ Provider │  │ Provider │  │ Provider │  │ (100+)   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                               │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         ▼
┌───────────────────────────────────────────────────────────────┐
│                   CLOUD INFRASTRUCTURE                        │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  EC2     │  │   VPC    │  │   S3     │  │   RDS    │       │
│  │Instances │  │ Networks │  │ Buckets  │  │Databases │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Component Breakdown

1. **Configuration Files (.tf)**
   - Written in HCL (HashiCorp Configuration Language)
   - Define desired infrastructure state
   - Human-readable and version-controlled

2. **Terraform Core**
   - Graph-based execution engine
   - Determines resource dependencies
   - Coordinates provider plugins
   - Manages state

3. **Providers**
   - Plugins that interface with APIs
   - Translate Terraform commands to API calls
   - Handle authentication
   - Manage resource lifecycle

4. **State File**
   - Maps configuration to real-world resources
   - Tracks metadata and resource dependencies
   - Critical for Terraform operations

## Key Terminology

### Essential Concepts

| Term | Definition | Example |
|------|------------|---------|
| **Provider** | Plugin that interfaces with an API (cloud provider, SaaS, etc.) | AWS, Azure, GCP, Kubernetes |
| **Resource** | Infrastructure object managed by Terraform | EC2 instance, S3 bucket, DNS record |
| **Data Source** | Read-only information fetched from providers | Existing VPC ID, AMI ID |
| **Module** | A reusable unit that groups related resources together. | VPC module, ECS cluster module |
| **State** | Terraform's record of managed infrastructure | terraform.tfstate file |
| **Plan** | Preview of changes Terraform will make | Output of `terraform plan` |
| **Backend** | Where Terraform stores its state file | Local, S3, Terraform Cloud |
| **Workspace** | Named state instances for the same configuration | dev, staging, prod |
| **HCL** | HashiCorp Configuration Language | .tf file syntax |

### File and Directory Structure

```
terraform-project/
├── .terraform/              # Local cache (created by terraform init)
│   ├── providers/           # Downloaded provider plugins
│   ├── modules/             # Downloaded modules
│   └── environment          # Current workspace name
│
├── .terraform.lock.hcl      # Provider version lock file
├── terraform.tfstate        # Current state (local backend)
├── terraform.tfstate.backup # Previous state backup
│
├── main.tf                  # Primary configuration
├── variables.tf             # Variable definitions
├── outputs.tf               # Output definitions
├── providers.tf             # Provider configuration
├── versions.tf              # Version constraints
└── terraform.tfvars         # Variable values (not committed if sensitive)
```

## Why Use Terraform?

### Key Benefits

#### 1. Multi-Cloud Support
```
Single tool for:
  AWS + Azure + GCP + Kubernetes + CloudFlare + ...

Instead of learning:
  AWS CloudFormation
  + Azure Resource Manager
  + Google Cloud Deployment Manager
  + etc.
```

#### 2. Declarative Syntax

<!-- hack to fix hcl rendering issue -->
```python
# You declare WHAT you want
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name = "WebServer"
  }
}

# Terraform figures out HOW to create it
```

#### 3. Execution Plans
```
$ terraform plan

Terraform will perform the following actions:

  # aws_instance.web will be created
  + resource "aws_instance" "web" {
      + ami           = "ami-0c55b159cbfafe1f0"
      + instance_type = "t2.micro"
      ...
    }

Plan: 1 to add, 0 to change, 0 to destroy.
```

#### 4. Resource Graph
Terraform automatically handles dependencies:

```
┌─────────────┐
│     VPC     │
└──────┬──────┘
       │
       ├──────────┬──────────┐
       ▼          ▼          ▼
  ┌────────┐ ┌────────┐ ┌────────┐
  │Subnet 1│ │Subnet 2│ │Security│
  │        │ │        │ │ Group  │
  └────┬───┘ └────┬───┘ └────┬───┘
       │          │          │
       └────┬─────┴──────────┘
            ▼
      ┌────────────┐
      │EC2 Instance│
      └────────────┘

Terraform creates in correct order:
1. VPC
2. Subnets + Security Group (parallel)
3. EC2 Instance
```

#### 5. State Management
Terraform knows:
- What currently exists (actual state)
- What you want (desired state)
- How to get from current → desired

#### 6. Change Automation
- Consistent deployments
- Reduced human error
- Faster iteration
- Documented changes (via Git)

## Terraform vs Other Tools

### Terraform vs CloudFormation (AWS)

| Feature | Terraform | CloudFormation |
|---------|-----------|----------------|
| Cloud Support | Multi-cloud | AWS only |
| Syntax | HCL (human-friendly) | JSON/YAML |
| State Management | Explicit state file | Implicit (in AWS) |
| Provider Ecosystem | 100+ providers | AWS services only |

### Terraform vs Ansible

| Feature | Terraform | Ansible |
|---------|-----------|---------|
| Primary Use | Infrastructure provisioning | Configuration management |
| Approach | Declarative | Procedural (playbooks) |
| State | Maintains state | Stateless |
| Idempotency | Built-in | Depends on modules |
| Best For | Creating infrastructure | Configuring servers |

**Note**: Terraform and Ansible are often used together:
- Terraform creates infrastructure (EC2, VPC, etc.)
- Ansible configures the servers (install packages, deploy apps)

### When to Use Terraform

✅ **Good fit:**
- Provisioning cloud infrastructure
- Multi-cloud environments
- Immutable infrastructure
- Infrastructure versioning
- Collaborative teams

❌ **Not ideal for:**
- Application deployment (use CI/CD tools)
- Configuration management (consider Ansible)
- Simple scripts (use cloud CLI)
- Real-time changes (Terraform is plan-based)

## Quick Installation

```bash
# macOS (using Homebrew)
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# Linux (Ubuntu/Debian)
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform

# Verify installation
terraform --version
```

## Key Takeaways

1. **Terraform is IaC**: Manage infrastructure through code, not manual processes
2. **Declarative approach**: Describe what you want, not how to create it
3. **Multi-cloud**: One tool for AWS, Azure, GCP, and more
4. **State-based**: Terraform tracks actual vs. desired state
5. **Preview changes**: Always see what will happen before it happens
6. **Version controlled**: Infrastructure changes tracked like application code

## Additional Resources

- [Terraform Documentation](https://developer.hashicorp.com/terraform/docs)
- [Why Infrastructure as Code?](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/infrastructure-as-code)
