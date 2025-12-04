---
title: State Management
linkTitle: State Management
type: docs
weight: 8
prev: /terraform/07-modules
next: /terraform/09-advanced-topics
---

## State File Deep Dive

### What is State and Why It Exists

**Terraform State** is a critical component that maps your Terraform configuration to real-world infrastructure resources.

**Why State Exists:**

* **Resource Tracking** → Maps configuration to actual infrastructure
* **Performance** → Caches resource attributes to avoid constant API calls
* **Dependency Resolution** → Tracks relationships between resources
* **Metadata Storage** → Stores resource-specific metadata not in configuration
* **Change Detection** → Determines what needs to be created, updated, or destroyed

**Key Concepts:**

* State is the **source of truth** for Terraform
* Contains sensitive information (IPs, passwords, etc.)
* Required for Terraform to function properly
* Must be properly managed and secured

### State File Structure

The state file (`terraform.tfstate`) is a JSON file containing:

```json
{
  "version": 4,
  "terraform_version": "1.5.0",
  "serial": 3,
  "lineage": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "outputs": {},
  "resources": [
    {
      "mode": "managed",
      "type": "aws_instance",
      "name": "my_server",
      "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
      "instances": [
        {
          "schema_version": 1,
          "attributes": {
            "id": "i-0123456789abcdef0",
            "ami": "ami-027951e78de46a00e",
            "instance_type": "t2.micro",
            "public_ip": "54.123.45.67",
            "private_ip": "10.0.1.25"
          }
        }
      ]
    }
  ]
}
```

**State File Components:**

* **version** → State file format version
* **terraform_version** → Terraform version that created the state
* **serial** → Increments with each state modification
* **lineage** → Unique ID to prevent mixing states from different configurations
* **outputs** → Output values from your configuration
* **resources** → All managed resources with their attributes

### terraform.tfstate vs terraform.tfstate.backup

**terraform.tfstate:**

* Current state of your infrastructure
* Updated after every successful `terraform apply`
* Primary file Terraform reads during operations

**terraform.tfstate.backup:**

* Previous version of the state file
* Created automatically before state modifications
* Safety net for recovering from errors
* Only one backup is kept (previous state)

**State File Workflow:**

```
Initial State (terraform.tfstate)
         |
         | terraform apply
         v
Current state → terraform.tfstate
Previous state → terraform.tfstate.backup
```

**Important Notes:**

* Never edit state files manually
* Always use `terraform state` commands
* Keep both files in version control (.gitignore for local state)
* Use remote state for team collaboration

## Remote State Backends

### Local vs Remote Backends

**Local Backend (Default):**

```bash
# No backend configuration needed - stores state locally
# State stored in: terraform.tfstate
```

**Limitations:**

* Not suitable for teams
* No state locking by default
* Risk of state file loss
* No encryption at rest
* Manual state management

**Remote Backend:**

* Stores state in a remote location
* Enables team collaboration
* Provides state locking
* Offers encryption and backup
* Centralized state management

**Remote State Architecture:**

```
┌─────────────────────────────────────────────────────────┐
│                    Team Members                         │
│  Developer 1    Developer 2    Developer 3    CI/CD     │
└────────┬──────────────┬──────────────┬──────────┬───────┘
         │              │              │          │
         └──────────────┴──────────────┴──────────┘
                              │
                              v
            ┌───────────────────────────────┐
            │   Remote State Backend        │
            │   (S3, Terraform Cloud, etc.) │
            │                               │
            │  - Centralized State          │
            │  - State Locking              │
            │  - Encryption                 │
            │  - Versioning                 │
            └───────────────────────────────┘
                              │
                              v
            ┌───────────────────────────────┐
            │    Cloud Provider API         │
            │    (AWS, Azure, GCP, etc.)    │
            └───────────────────────────────┘
```

### S3 Backend Configuration

**S3 Backend Setup:**

```hcl
# backend.tf

terraform {
  backend "s3" {
    bucket         = "my-terraform-state-bucket"
    key            = "project/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"

    # Optional: Use specific AWS profile
    profile = "terraform"

    # Optional: Server-side encryption with KMS
    kms_key_id = "arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012"
  }
}
```

**S3 Bucket Configuration:**

```hcl
# s3-backend-setup.tf

# Create S3 bucket for state storage
resource "aws_s3_bucket" "terraform_state" {
  bucket = "my-terraform-state-bucket"

  tags = {
    Name        = "Terraform State Bucket"
    Environment = "Production"
  }
}

# Enable versioning for state file history
resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Enable server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
      # Or use KMS for more control
      # sse_algorithm     = "aws:kms"
      # kms_master_key_id = aws_kms_key.terraform_state.arn
    }
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

**Migrating from Local to S3 Backend:**

```bash
# Step 1: Add backend configuration to your terraform block
# Step 2: Re-initialize Terraform
$ terraform init -migrate-state

# Terraform will prompt:
# "Do you want to copy existing state to the new backend?"
# Type: yes

# Step 3: Verify migration
$ terraform state list

# Step 4: Remove local state files (after verification)
$ rm terraform.tfstate
$ rm terraform.tfstate.backup
```

### State Locking with DynamoDB

**DynamoDB Table for Locking:**

```hcl
# dynamodb-lock-table.tf

resource "aws_dynamodb_table" "terraform_locks" {
  name           = "terraform-state-lock"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name        = "Terraform State Lock Table"
    Environment = "Production"
  }
}
```

**How State Locking Works:**

```
Developer 1                    DynamoDB Table              Developer 2
     |                              |                           |
     | terraform apply              |                           |
     |----------------------------->|                           |
     |                              |                           |
     | Creates lock entry           |                           |
     | (LockID: unique identifier)  |                           |
     |<-----------------------------|                           |
     |                              |                           |
     | Performing changes...        |                           |
     |                              |      terraform apply      |
     |                              |<--------------------------|
     |                              |                           |
     |                              | Lock exists - WAIT        |
     |                              |-------------------------->|
     |                              |                           |
     | terraform apply complete     |                           |
     |----------------------------->|                           |
     |                              |                           |
     | Removes lock entry           |                           |
     |<-----------------------------|                           |
     |                              |                           |
     |                              | Lock available            |
     |                              |-------------------------->|
     |                              |                           |
     |                              | Creates lock entry        |
     |                              |<--------------------------|
```

### Terraform Cloud Backend

**Terraform Cloud Configuration:**

```hcl
# backend.tf

terraform {
  cloud {
    organization = "my-organization"

    workspaces {
      name = "my-app-production"
      # Or use tags for dynamic workspace selection
      # tags = ["app:myapp", "env:production"]
    }
  }
}
```

**Terraform Cloud Features:**

* **Remote Operations** → Run Terraform in the cloud
* **State Management** → Automatic state locking and versioning
* **Private Registry** → Host private modules
* **Policy as Code** → Enforce compliance with Sentinel
* **Cost Estimation** → Estimate infrastructure costs
* **Team Management** → Role-based access control
* **VCS Integration** → Connect to GitHub, GitLab, Bitbucket

**Login to Terraform Cloud:**

```bash
# Login to Terraform Cloud
$ terraform login

# Terraform will prompt for an API token
# Generate token at: https://app.terraform.io/app/settings/tokens

# Initialize with cloud backend
$ terraform init
```

### Other Backends

**Azure Backend (Azure Storage):**

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-rg"
    storage_account_name = "terraformstate"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }
}
```

**Google Cloud Storage (GCS) Backend:**

```hcl
terraform {
  backend "gcs" {
    bucket  = "my-terraform-state-bucket"
    prefix  = "terraform/state"
  }
}
```

**Consul Backend:**

```hcl
terraform {
  backend "consul" {
    address = "consul.example.com:8500"
    scheme  = "https"
    path    = "terraform/state"
  }
}
```

**HTTP Backend:**

```hcl
terraform {
  backend "http" {
    address        = "https://myapi.example.com/terraform/state"
    lock_address   = "https://myapi.example.com/terraform/lock"
    unlock_address = "https://myapi.example.com/terraform/unlock"
  }
}
```

**Backend Comparison:**

| Backend | State Locking | Encryption | Versioning | Team Support | Cost |
|---------|--------------|------------|------------|--------------|------|
| Local | No* | No | No | No | Free |
| S3 + DynamoDB | Yes | Yes | Yes | Yes | Low |
| Terraform Cloud | Yes | Yes | Yes | Yes | Free/Paid |
| Azure Storage | Yes | Yes | Yes | Yes | Low |
| GCS | Yes | Yes | Yes | Yes | Low |
| Consul | Yes | Yes | No | Yes | Medium |

*Local backend supports locking on some filesystems

## State Locking

### Why Locking is Critical

**State Locking Prevents:**

* **Concurrent Modifications** → Multiple users changing state simultaneously
* **State Corruption** → Inconsistent state due to race conditions
* **Resource Conflicts** → Two operations trying to modify the same resource
* **Data Loss** → Overwriting changes from other team members

**Example Scenario Without Locking:**

```
Time    Developer 1              State File           Developer 2
───────────────────────────────────────────────────────────────────────────────
10:00   Reads state              1 EC2 instance
        (1 instance)
10:01                                                 Reads state
                                                      (1 instance)
10:02   Adds 1 instance
        Writes state
        (2 instances)             2 instances
10:03                                                 Adds 1 instance
                                                      Writes state
10:04                            2 instances ❌       (2 instances - WRONG!)
                                 Should be 3!
```

**With State Locking:**

```
Time    Developer 1              Lock Status          Developer 2
────────────────────────────────────────────────────────────────────────
10:00   terraform apply          Unlocked
        Acquires lock            Locked by Dev1
10:01                            Locked by Dev1       terraform apply
                                                      Waiting...
10:02   Changes infrastructure   Locked by Dev1       Waiting...
10:03   Completes                                     Waiting...
        Releases lock            Unlocked
10:04                            Locked by Dev2       Acquires lock
                                                      Proceeds safely
```

### DynamoDB Table Configuration

**Complete DynamoDB Setup:**

```hcl
# dynamodb-lock-table.tf

resource "aws_dynamodb_table" "terraform_locks" {
  name           = "terraform-state-lock"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  # Optional: Enable point-in-time recovery
  point_in_time_recovery {
    enabled = true
  }

  # Optional: Enable server-side encryption
  server_side_encryption {
    enabled = true
  }

  tags = {
    Name        = "Terraform State Lock Table"
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}
```

**Lock Entry Structure:**

When Terraform acquires a lock, it creates an entry in DynamoDB:

```json
{
  "LockID": "my-terraform-state-bucket/project/terraform.tfstate-md5",
  "Info": {
    "ID": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "Operation": "OperationTypeApply",
    "Who": "user@example.com",
    "Version": "1.5.0",
    "Created": "2024-01-15T10:30:45Z",
    "Path": "my-terraform-state-bucket/project/terraform.tfstate"
  }
}
```

### Handling Lock Conflicts

**Lock Conflict Error:**

```bash
$ terraform apply

Error: Error acquiring the state lock

Error message: ConditionalCheckFailedException: The conditional request failed
Lock Info:
  ID:        a1b2c3d4-e5f6-7890-abcd-ef1234567890
  Path:      my-terraform-state-bucket/project/terraform.tfstate
  Operation: OperationTypeApply
  Who:       john@example.com
  Version:   1.5.0
  Created:   2024-01-15 10:30:45.123456789 +0000 UTC
  Info:

Terraform acquires a state lock to protect the state from being written
by multiple users at the same time. Please resolve the issue above and try
again. For most commands, you can disable locking with the "-lock=false"
flag, but this is not recommended.
```

**Best Practices for Lock Conflicts:**

```bash
# 1. Wait for the lock to be released (recommended)
# Check with the user who has the lock

# 2. Check if the process is still running
# If the user's terraform process crashed, you may need to force unlock

# 3. Verify the lock is stale
$ aws dynamodb get-item \
    --table-name terraform-state-lock \
    --key '{"LockID": {"S": "my-terraform-state-bucket/project/terraform.tfstate-md5"}}'

# 4. Only if necessary, force unlock (see next section)
```

### Force Unlock (with Warnings)

**When to Force Unlock:**

* Process crashed and lock wasn't released
* CI/CD job terminated unexpectedly
* Network interruption during apply
* User's machine shut down during operation

**Force Unlock Command:**

```bash
# Get the Lock ID from the error message
$ terraform force-unlock <LOCK_ID>

# Example:
$ terraform force-unlock a1b2c3d4-e5f6-7890-abcd-ef1234567890

Do you really want to force-unlock?
  Terraform will remove the lock on the remote state.
  This will allow local Terraform commands to modify this state, even though it
  may still be in use. Only 'yes' will be accepted to confirm.

  Enter a value: yes

Terraform state has been successfully unlocked!
```

**WARNINGS:**

* **Never force unlock** if another operation is actually running
* **Verify** the lock is stale before unlocking
* **Communicate** with team members first
* **Risk of state corruption** if done incorrectly
* **Check for backup** state before proceeding

**Safe Force Unlock Process:**

```bash
# Step 1: Confirm lock is stale
# Contact the user who has the lock

# Step 2: Verify no operations are running
# Check CI/CD pipelines, developer workstations

# Step 3: Create a backup of current state (if using S3)
$ aws s3 cp s3://my-terraform-state-bucket/project/terraform.tfstate ./backup-$(date +%Y%m%d-%H%M%S).tfstate

# Step 4: Force unlock
$ terraform force-unlock <LOCK_ID>

# Step 5: Verify state integrity
$ terraform plan
```

## Workspaces

### What are Workspaces

**Terraform Workspaces** allow you to manage multiple environments (dev, staging, prod) with a single configuration by maintaining separate state files.

**Key Concepts:**

* Each workspace has its own state file
* Same configuration, different state
* Default workspace is named "default"
* Workspaces are not a complete solution for environment separation

**Workspace State Organization:**

```
terraform.tfstate.d/
├── dev/
│   └── terraform.tfstate
├── staging/
│   └── terraform.tfstate
└── production/
    └── terraform.tfstate

# Default workspace uses: terraform.tfstate
```

**When to Use Workspaces:**

* ✅ Testing different configurations
* ✅ Temporary environments
* ✅ Individual developer environments
* ✅ Simple environment separation

**When NOT to Use Workspaces:**

* ❌ Production vs non-production isolation
* ❌ Different AWS accounts/regions
* ❌ Completely different configurations
* ❌ Strong isolation requirements

### Creating and Switching Workspaces

**Workspace Commands:**

```bash
# List all workspaces (* indicates current workspace)
$ terraform workspace list
  default
* dev
  staging
  production

# Show current workspace
$ terraform workspace show
dev

# Create a new workspace
$ terraform workspace new staging
Created and switched to workspace "staging"!

You are now on a new, empty workspace. Workspaces isolate their state,
so if you run "terraform plan" Terraform will not see any existing state
for this configuration.

# Switch to an existing workspace
$ terraform workspace select production
Switched to workspace "production".

# Delete a workspace (must not be current workspace)
$ terraform workspace delete staging
Deleted workspace "staging"!
```

**Creating Workspaces:**

```bash
# Create and switch to new workspace
$ terraform workspace new dev
$ terraform workspace new staging
$ terraform workspace new production

# Verify workspaces
$ terraform workspace list
  default
  dev
  staging
* production
```

### Use Cases (dev, staging, prod)

**Configuration with Workspace Variables:**

```hcl
# main.tf

locals {
  environment = terraform.workspace

  # Environment-specific configurations
  instance_types = {
    dev        = "t2.micro"
    staging    = "t2.small"
    production = "t3.medium"
  }

  instance_counts = {
    dev        = 1
    staging    = 2
    production = 5
  }

  enable_monitoring = {
    dev        = false
    staging    = true
    production = true
  }
}

resource "aws_instance" "app" {
  count         = local.instance_counts[local.environment]
  ami           = "ami-027951e78de46a00e"
  instance_type = local.instance_types[local.environment]

  tags = {
    Name        = "app-${local.environment}-${count.index + 1}"
    Environment = local.environment
  }

  monitoring = local.enable_monitoring[local.environment]
}

# S3 bucket with workspace-specific naming
resource "aws_s3_bucket" "app_data" {
  bucket = "myapp-data-${terraform.workspace}"

  tags = {
    Environment = terraform.workspace
  }
}
```

**Workflow Example:**

```bash
# Development workflow
$ terraform workspace select dev
$ terraform plan
$ terraform apply

# Staging deployment
$ terraform workspace select staging
$ terraform plan
$ terraform apply

# Production deployment
$ terraform workspace select production
$ terraform plan
$ terraform apply
```

**Workspace-Specific Backend Configuration:**

```hcl
# backend.tf

terraform {
  backend "s3" {
    bucket         = "my-terraform-state-bucket"

    # Workspace-specific state files
    key            = "project/${terraform.workspace}/terraform.tfstate"

    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

This creates state files like:

```
s3://my-terraform-state-bucket/
└── project/
    ├── dev/
    │   └── terraform.tfstate
    ├── staging/
    │   └── terraform.tfstate
    └── production/
        └── terraform.tfstate
```

### Workspace Commands

**Complete Command Reference:**

```bash
# List workspaces
$ terraform workspace list
$ terraform workspace list -h  # Show help

# Show current workspace
$ terraform workspace show

# Create new workspace
$ terraform workspace new <workspace_name>
$ terraform workspace new dev

# Switch workspace
$ terraform workspace select <workspace_name>
$ terraform workspace select production

# Delete workspace
$ terraform workspace delete <workspace_name>
$ terraform workspace delete dev

# Note: Cannot delete current workspace
# Note: Cannot delete workspace with resources (must destroy first)
```

**Workspace Best Practices:**

```bash
# Always verify current workspace before applying
$ terraform workspace show
$ terraform plan

# Use workspace interpolation in resource names
# ${terraform.workspace} in configurations

# Document workspace usage in README
# Specify naming conventions
# Define workspace-specific variables
```

### Limitations and Alternatives

**Workspace Limitations:**

* **Weak Isolation** → All workspaces in same backend
* **Shared Backend** → Same S3 bucket, same access controls
* **Accidental Changes** → Easy to apply to wrong workspace
* **Limited Visibility** → Hard to see all environments at once
* **No Forced Separation** → Can't prevent cross-workspace access
* **State File Risks** → All states in one location

**Better Alternatives:**

**1. Separate Directories:**

```
infrastructure/
├── dev/
│   ├── main.tf
│   ├── variables.tf
│   ├── terraform.tfvars
│   └── backend.tf
├── staging/
│   ├── main.tf
│   ├── variables.tf
│   ├── terraform.tfvars
│   └── backend.tf
└── production/
    ├── main.tf
    ├── variables.tf
    ├── terraform.tfvars
    └── backend.tf
```

**Benefits:**

* ✅ Complete isolation
* ✅ Different backends possible
* ✅ Environment-specific configurations
* ✅ Clear separation of concerns

**2. Separate Repositories:**

```
company-terraform-dev/
company-terraform-staging/
company-terraform-production/
```

**Benefits:**

* ✅ Strongest isolation
* ✅ Different access controls
* ✅ Independent CI/CD pipelines
* ✅ No accidental cross-environment changes

**3. Terragrunt:**

```
infrastructure/
├── terragrunt.hcl
├── dev/
│   └── terragrunt.hcl
├── staging/
│   └── terragrunt.hcl
└── production/
    └── terragrunt.hcl
```

**Benefits:**

* ✅ DRY configurations
* ✅ Environment separation
* ✅ Dependency management
* ✅ Multiple backend configurations

**Workspace Organization Comparison:**

```
┌──────────────────────────────────────────────────────────────┐
│                     Workspaces                               │
│  ┌────────┐  ┌────────┐  ┌────────┐                          │
│  │  dev   │  │staging │  │  prod  │                          │
│  └────────┘  └────────┘  └────────┘                          │
│       └──────────┴──────────┘                                │
│              │                                               │
│      Single Backend (S3)                                     │
│      ⚠️ Weak Isolation                                       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              Separate Directories/Backends                   │
│  ┌────────┐      ┌────────┐      ┌────────┐                  │
│  │  dev   │      │staging │      │  prod  │                  │
│  └───┬────┘      └───┬────┘      └───┬────┘                  │
│      │               │               │                       │
│  Backend 1        Backend 2      Backend 3                   │
│  ✅ Strong Isolation                                         │
└──────────────────────────────────────────────────────────────┘
```

**Recommendation:**

* Use **workspaces** for temporary/development environments
* Use **separate directories** for production isolation
* Use **separate repositories** for maximum security
* Use **Terragrunt** for complex multi-environment setups

## State Operations

### terraform state list

**List all resources in the state:**

```bash
# List all resources
$ terraform state list
aws_instance.app_server
aws_security_group.app_sg
aws_s3_bucket.app_data
aws_db_instance.app_db

# List resources matching a pattern
$ terraform state list aws_instance
aws_instance.app_server
aws_instance.web_server

# List resources in a module
$ terraform state list module.vpc
module.vpc.aws_vpc.main
module.vpc.aws_subnet.public
module.vpc.aws_subnet.private

# List with specific resource type
$ terraform state list aws_s3_bucket
aws_s3_bucket.app_data
aws_s3_bucket.logs
```

**Use Cases:**

* Verify resources in state
* Find resource addresses for other state commands
* Audit state contents
* Troubleshoot missing resources

### terraform state show

**Show detailed information about a specific resource:**

```bash
# Show resource details
$ terraform state show aws_instance.app_server

# aws_instance.app_server:
resource "aws_instance" "app_server" {
    ami                          = "ami-027951e78de46a00e"
    arn                          = "arn:aws:ec2:us-east-1:123456789012:instance/i-0123456789abcdef0"
    associate_public_ip_address  = true
    availability_zone            = "us-east-1a"
    id                           = "i-0123456789abcdef0"
    instance_type                = "t2.micro"
    private_ip                   = "10.0.1.25"
    public_ip                    = "54.123.45.67"
    subnet_id                    = "subnet-0123456789abcdef0"
    vpc_id                       = "vpc-0123456789abcdef0"

    tags = {
        "Name" = "app-server"
        "Environment" = "production"
    }
}

# Show resource in JSON format
$ terraform state show -json aws_instance.app_server | jq
```

**Use Cases:**

* Inspect resource attributes
* Verify resource configuration
* Extract specific attribute values
* Debug resource issues

### terraform state mv

**Move/rename resources in state:**

```bash
# Rename a resource
$ terraform state mv aws_instance.old_name aws_instance.new_name

# Move resource to a module
$ terraform state mv aws_instance.app_server module.app.aws_instance.app_server

# Move resource out of a module
$ terraform state mv module.app.aws_instance.app_server aws_instance.app_server

# Move resource to different index (in count/for_each)
$ terraform state mv 'aws_instance.app[0]' 'aws_instance.app[1]'

# Move entire module
$ terraform state mv module.old_module module.new_module
```

**Example Workflow - Refactoring into Modules:**

**Before:**

```hcl
# main.tf
resource "aws_instance" "web" {
  ami           = "ami-027951e78de46a00e"
  instance_type = "t2.micro"
}

resource "aws_security_group" "web_sg" {
  name = "web-sg"
}
```

**After:**

```hcl
# main.tf
module "web" {
  source = "./modules/web"
}

# modules/web/main.tf
resource "aws_instance" "web" {
  ami           = "ami-027951e78de46a00e"
  instance_type = "t2.micro"
}

resource "aws_security_group" "web_sg" {
  name = "web-sg"
}
```

**Migration Steps:**

```bash
# Step 1: Update configuration files (above)

# Step 2: Move resources in state
$ terraform state mv aws_instance.web module.web.aws_instance.web
$ terraform state mv aws_security_group.web_sg module.web.aws_security_group.web_sg

# Step 3: Verify no changes needed
$ terraform plan
No changes. Infrastructure is up-to-date.
```

### terraform state rm

**Remove resources from state (without destroying):**

```bash
# Remove a single resource
$ terraform state rm aws_instance.app_server

# Remove multiple resources
$ terraform state rm aws_instance.app_server aws_security_group.app_sg

# Remove resource with count
$ terraform state rm 'aws_instance.app[0]'

# Remove all instances of a resource with count
$ terraform state rm aws_instance.app

# Remove entire module
$ terraform state rm module.app
```

**Important Notes:**

* **Does NOT destroy** the actual infrastructure
* Only removes from Terraform management
* Resource continues to exist in cloud provider
* Use when you want Terraform to stop managing a resource

**Use Cases:**

```bash
# 1. Resource created by mistake in Terraform but want to keep it
$ terraform state rm aws_instance.accidental_resource

# 2. Moving resource to different Terraform project
$ terraform state rm aws_instance.app_server
# Then import in different project

# 3. Decomissioning Terraform management but keeping infrastructure
$ terraform state rm module.legacy_app

# 4. Removing duplicate resources
$ terraform state rm 'aws_instance.app[1]'
```

### terraform state pull/push

**terraform state pull:**

```bash
# Pull current state from remote backend
$ terraform state pull > current-state.json

# View state in readable format
$ terraform state pull | jq

# Extract specific information
$ terraform state pull | jq '.resources[] | select(.type=="aws_instance")'

# Save state backup
$ terraform state pull > backup-$(date +%Y%m%d-%H%M%S).json
```

**terraform state push:**

```bash
# Push local state to remote backend
$ terraform state push terraform.tfstate

# Force push (override remote state)
$ terraform state push -force terraform.tfstate
```

**WARNING - State Push:**

* **Dangerous operation** - can corrupt state
* **Use with extreme caution**
* **Always backup** state before pushing
* **Verify state** contents before pushing
* **Coordinate with team** before pushing

**Safe State Push Process:**

```bash
# Step 1: Backup current remote state
$ terraform state pull > backup-before-push.json

# Step 2: Verify local state file
$ cat terraform.tfstate | jq

# Step 3: Push state
$ terraform state push terraform.tfstate

# Step 4: Verify state was pushed correctly
$ terraform plan
```

**Use Cases for pull/push:**

```bash
# 1. Manual state inspection
$ terraform state pull | jq '.resources[].type' | sort | uniq

# 2. State backup before major changes
$ terraform state pull > backup-before-migration.json

# 3. Disaster recovery
$ terraform state push backup-state.json

# 4. Migrating between backends
$ terraform state pull > local-backup.json
# Update backend configuration
$ terraform init -migrate-state
```

## Importing Existing Resources

### import Command Syntax

**Basic Import Syntax:**

```bash
$ terraform import <resource_type>.<resource_name> <resource_id>
```

**Examples:**

```bash
# Import AWS EC2 instance
$ terraform import aws_instance.my_server i-0123456789abcdef0

# Import AWS S3 bucket
$ terraform import aws_s3_bucket.my_bucket my-existing-bucket

# Import AWS VPC
$ terraform import aws_vpc.main vpc-0123456789abcdef0

# Import AWS Security Group
$ terraform import aws_security_group.app_sg sg-0123456789abcdef0

# Import resource with count
$ terraform import 'aws_instance.web[0]' i-0123456789abcdef0

# Import module resource
$ terraform import module.vpc.aws_vpc.main vpc-0123456789abcdef0
```

**Important Notes:**

* Resource must be defined in configuration BEFORE importing
* Import does NOT generate configuration files
* Must manually write the resource block
* Only imports state, not configuration
* Resource ID format varies by resource type

### import Blocks (Declarative Import)

**New in Terraform 1.5+:**

Import blocks provide a declarative way to import resources.

```hcl
# Define the import block
import {
  to = aws_s3_bucket.my_bucket
  id = "my-existing-bucket"
}

# Define the corresponding resource
resource "aws_s3_bucket" "my_bucket" {
  bucket = "my-existing-bucket"

  tags = {
    Name        = "My Existing Bucket"
    Environment = "Production"
  }
}
```

**Multiple Resources:**

```hcl
# Import multiple S3 buckets
import {
  to = aws_s3_bucket.logs
  id = "my-logs-bucket"
}

import {
  to = aws_s3_bucket.data
  id = "my-data-bucket"
}

resource "aws_s3_bucket" "logs" {
  bucket = "my-logs-bucket"
}

resource "aws_s3_bucket" "data" {
  bucket = "my-data-bucket"
}
```

**Using for_each with Import Blocks:**

```hcl
# Import multiple instances
locals {
  instances = {
    web1 = "i-0123456789abcdef0"
    web2 = "i-0123456789abcdef1"
    web3 = "i-0123456789abcdef2"
  }
}

import {
  for_each = local.instances
  to       = aws_instance.web[each.key]
  id       = each.value
}

resource "aws_instance" "web" {
  for_each = local.instances

  ami           = "ami-027951e78de46a00e"
  instance_type = "t2.micro"

  tags = {
    Name = each.key
  }
}
```

### Process and Examples

**Complete Import Workflow:**

**Step 1: Identify the resource to import**

```bash
# Find the resource ID from cloud provider
$ aws ec2 describe-instances --filters "Name=tag:Name,Values=my-server" \
  --query 'Reservations[0].Instances[0].InstanceId' --output text
i-0123456789abcdef0
```

**Step 2: Define the resource in Terraform**

```hcl
# main.tf
resource "aws_instance" "my_server" {
  # Minimum required attributes for initial import
  ami           = "ami-027951e78de46a00e"   # Temporary, will be updated
  instance_type = "t2.micro"                # Temporary, will be updated

  # Leave other attributes empty initially
}
```

**Step 3: Run the import command**

```bash
$ terraform import aws_instance.my_server i-0123456789abcdef0

aws_instance.my_server: Importing from ID "i-0123456789abcdef0"...
aws_instance.my_server: Import prepared!
  Prepared aws_instance for import
aws_instance.my_server: Refreshing state... [id=i-0123456789abcdef0]

Import successful!

The resources that were imported are shown above. These resources are now in
your Terraform state and will henceforth be managed by Terraform.
```

**Step 4: Get the actual resource attributes**

```bash
$ terraform state show aws_instance.my_server

# aws_instance.my_server:
resource "aws_instance" "my_server" {
    ami                          = "ami-0c55b159cbfafe1f0"
    arn                          = "arn:aws:ec2:us-east-1:123456789012:instance/i-0123456789abcdef0"
    availability_zone            = "us-east-1a"
    instance_type                = "t3.medium"
    subnet_id                    = "subnet-0123456789abcdef0"
    vpc_id                       = "vpc-0123456789abcdef0"

    tags = {
        "Name" = "my-server"
        "Environment" = "production"
    }

    # ... many more attributes
}
```

**Step 5: Update the configuration**

```hcl
# main.tf - Updated with actual values
resource "aws_instance" "my_server" {
  ami                    = "ami-0c55b159cbfafe1f0"
  instance_type          = "t3.medium"
  subnet_id              = "subnet-0123456789abcdef0"

  tags = {
    Name        = "my-server"
    Environment = "production"
  }

  # Add lifecycle to prevent accidental recreation
  lifecycle {
    prevent_destroy = true
  }
}
```

**Step 6: Verify the import**

```bash
$ terraform plan

No changes. Your infrastructure matches the configuration.

Terraform has compared your real infrastructure against your configuration
and found no differences, so no changes are needed.
```

**Complete Example - Importing Multiple Resources:**

**Scenario:** Import existing AWS infrastructure (VPC, Subnet, Security Group, EC2 Instance)

```bash
# Step 1: Find resource IDs
$ aws ec2 describe-vpcs --filters "Name=tag:Name,Values=my-vpc" \
  --query 'Vpcs[0].VpcId' --output text
vpc-0123456789abcdef0

$ aws ec2 describe-subnets --filters "Name=tag:Name,Values=my-subnet" \
  --query 'Subnets[0].SubnetId' --output text
subnet-0123456789abcdef0

$ aws ec2 describe-security-groups --filters "Name=tag:Name,Values=my-sg" \
  --query 'SecurityGroups[0].GroupId' --output text
sg-0123456789abcdef0

$ aws ec2 describe-instances --filters "Name=tag:Name,Values=my-instance" \
  --query 'Reservations[0].Instances[0].InstanceId' --output text
i-0123456789abcdef0
```

**Step 2: Create import configuration**

```hcl
# imports.tf
import {
  to = aws_vpc.main
  id = "vpc-0123456789abcdef0"
}

import {
  to = aws_subnet.public
  id = "subnet-0123456789abcdef0"
}

import {
  to = aws_security_group.app
  id = "sg-0123456789abcdef0"
}

import {
  to = aws_instance.app
  id = "i-0123456789abcdef0"
}
```

**Step 3: Create minimal resource definitions**

```hcl
# main.tf
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"  # Will be updated after import
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"  # Will be updated after import
}

resource "aws_security_group" "app" {
  name   = "app-sg"
  vpc_id = aws_vpc.main.id
}

resource "aws_instance" "app" {
  ami           = "ami-027951e78de46a00e"
  instance_type = "t2.micro"
}
```

**Step 4: Run terraform plan to import**

```bash
$ terraform plan -generate-config-out=generated.tf

# Terraform will:
# 1. Import the resources into state
# 2. Generate configuration in generated.tf
# 3. Show differences between minimal and actual config
```

**Step 5: Review and merge generated configuration**

```bash
# Review generated configuration
$ cat generated.tf

# Merge into main.tf or keep separate
# Update resource definitions with actual values
```

**Step 6: Verify**

```bash
$ terraform plan
No changes. Infrastructure is up-to-date.
```

**Import with Generate Config (Terraform 1.5+):**

```bash
# Generate configuration automatically during import
$ terraform plan -generate-config-out=generated_resources.tf

# This will:
# - Import resources defined in import blocks
# - Generate configuration for those resources
# - Save generated config to specified file
```

## State Security

### Sensitive Data in State

**What's Stored in State:**

Terraform state files contain **all resource attributes**, including sensitive data:

* **Passwords** → Database passwords, API keys
* **Private Keys** → SSH keys, TLS certificates
* **Access Tokens** → OAuth tokens, service account keys
* **Connection Strings** → Database URLs with credentials
* **IP Addresses** → Private IPs, internal network topology
* **Resource IDs** → ARNs, resource identifiers

**Example State File Content:**

```json
{
  "resources": [
    {
      "type": "aws_db_instance",
      "name": "database",
      "instances": [
        {
          "attributes": {
            "id": "mydb",
            "endpoint": "mydb.abc123.us-east-1.rds.amazonaws.com:5432",
            "username": "admin",
            "password": "SuperSecret123!",  // ⚠️ EXPOSED
            "address": "10.0.1.25"
          }
        }
      ]
    },
    {
      "type": "tls_private_key",
      "name": "ssh_key",
      "instances": [
        {
          "attributes": {
            "private_key_pem": "-----BEGIN RSA PRIVATE KEY-----\nMIIE..."  // ⚠️ EXPOSED
          }
        }
      ]
    }
  ]
}
```

**Security Risks:**

* State files are plain text (JSON)
* Accidental exposure through version control
* Unauthorized access to remote backends
* State file backups not secured
* Leaked state in CI/CD logs

**Mitigation Strategies:**

```hcl
# 1. Use sensitive = true for outputs
output "db_password" {
  value     = aws_db_instance.database.password
  sensitive = true
}

# 2. Store secrets in dedicated services
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "prod/db/password"
}

resource "aws_db_instance" "database" {
  username = "admin"
  password = data.aws_secretsmanager_secret_version.db_password.secret_string
}

# 3. Use lifecycle ignore_changes for sensitive attributes
resource "aws_instance" "app" {
  ami           = "ami-027951e78de46a00e"
  instance_type = "t2.micro"

  lifecycle {
    ignore_changes = [user_data]  # If user_data contains secrets
  }
}
```

### Encryption at Rest

**S3 Backend Encryption:**

```hcl
# backend.tf with encryption
terraform {
  backend "s3" {
    bucket         = "my-terraform-state-bucket"
    key            = "terraform.tfstate"
    region         = "us-east-1"

    # Server-side encryption with AES256
    encrypt        = true

    # Optional: Use KMS for encryption
    kms_key_id     = "arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012"

    dynamodb_table = "terraform-state-lock"
  }
}
```

**S3 Bucket Encryption Configuration:**

```hcl
# s3-backend-setup.tf

# KMS key for state encryption
resource "aws_kms_key" "terraform_state" {
  description             = "KMS key for Terraform state encryption"
  deletion_window_in_days = 10
  enable_key_rotation     = true

  tags = {
    Name = "terraform-state-encryption-key"
  }
}

resource "aws_kms_alias" "terraform_state" {
  name          = "alias/terraform-state"
  target_key_id = aws_kms_key.terraform_state.key_id
}

# S3 bucket for state
resource "aws_s3_bucket" "terraform_state" {
  bucket = "my-terraform-state-bucket"
}

# Enable encryption with KMS
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.terraform_state.arn
    }
    bucket_key_enabled = true
  }
}

# Enable versioning
resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

**Azure Backend Encryption:**

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-rg"
    storage_account_name = "terraformstate"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"

    # Encryption enabled by default in Azure Storage
    # Optionally use customer-managed keys
    use_azuread_auth     = true
  }
}
```

**Terraform Cloud Encryption:**

* Encryption at rest (default)
* Encryption in transit (TLS)
* Vault integration for secrets
* No additional configuration needed

### Access Controls

**S3 Backend Access Control:**

```hcl
# iam-terraform-state.tf

# IAM policy for Terraform state access
data "aws_iam_policy_document" "terraform_state_access" {
  # Allow read/write to state bucket
  statement {
    sid    = "AllowTerraformStateAccess"
    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]

    resources = [
      "${aws_s3_bucket.terraform_state.arn}/*",
    ]
  }

  statement {
    sid    = "AllowListBucket"
    effect = "Allow"

    actions = [
      "s3:ListBucket",
    ]

    resources = [
      aws_s3_bucket.terraform_state.arn,
    ]
  }

  # Allow DynamoDB lock table access
  statement {
    sid    = "AllowDynamoDBLocking"
    effect = "Allow"

    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
    ]

    resources = [
      aws_dynamodb_table.terraform_locks.arn,
    ]
  }

  # Allow KMS key usage
  statement {
    sid    = "AllowKMSKeyUsage"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:Encrypt",
      "kms:GenerateDataKey",
    ]

    resources = [
      aws_kms_key.terraform_state.arn,
    ]
  }
}

# IAM role for Terraform
resource "aws_iam_role" "terraform" {
  name = "terraform-executor"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::123456789012:user/terraform-user"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy" "terraform_state_access" {
  name   = "terraform-state-access"
  role   = aws_iam_role.terraform.id
  policy = data.aws_iam_policy_document.terraform_state_access.json
}
```

**S3 Bucket Policy - Restrict Access:**

```hcl
# S3 bucket policy - Allow only specific IAM roles
resource "aws_s3_bucket_policy" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "DenyUnencryptedObjectUploads"
        Effect = "Deny"
        Principal = "*"
        Action = "s3:PutObject"
        Resource = "${aws_s3_bucket.terraform_state.arn}/*"
        Condition = {
          StringNotEquals = {
            "s3:x-amz-server-side-encryption" = "aws:kms"
          }
        }
      },
      {
        Sid    = "AllowTerraformRoleAccess"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_role.terraform.arn
        }
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.terraform_state.arn}/*"
      }
    ]
  })
}
```

**Terraform Cloud Access Controls:**

```bash
# Terraform Cloud teams and permissions
# Configure via Terraform Cloud UI or API

# Example team structure:
# - Admins: Full access to all workspaces
# - Developers: Plan and apply access to dev/staging
# - Viewers: Read-only access to production
```

**Role-Based Access Control (RBAC):**

```
┌─────────────────────────────────────────────────────────┐
│                   Access Control Layers                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Cloud Provider IAM                                  │
│     └── Who can access the backend?                     │
│                                                         │
│  2. Backend-Level Permissions                           │
│     └── What operations are allowed?                    │
│                                                         │
│  3. Workspace/Environment Separation                    │
│     └── Which resources can be managed?                 │
│                                                         │
│  4. State File Encryption                               │
│     └── How is data protected at rest?                  │
│                                                         │
│  5. Audit Logging                                       │
│     └── Who did what and when?                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Backend Security Best Practices

**1. Enable Versioning:**

```hcl
resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}
```

**Benefits:**

* Recover from accidental state corruption
* Audit trail of state changes
* Rollback capability

**2. Enable Lifecycle Policies:**

```hcl
resource "aws_s3_bucket_lifecycle_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    id     = "delete-old-versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }

  rule {
    id     = "abort-incomplete-multipart-uploads"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}
```

**3. Enable Logging:**

```hcl
# S3 access logging
resource "aws_s3_bucket" "log_bucket" {
  bucket = "terraform-state-access-logs"
}

resource "aws_s3_bucket_logging" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  target_bucket = aws_s3_bucket.log_bucket.id
  target_prefix = "state-access-logs/"
}

# CloudTrail for S3 data events
resource "aws_cloudtrail" "terraform_state" {
  name                          = "terraform-state-trail"
  s3_bucket_name                = aws_s3_bucket.cloudtrail_logs.id
  include_global_service_events = true

  event_selector {
    read_write_type           = "All"
    include_management_events = true

    data_resource {
      type = "AWS::S3::Object"

      values = [
        "${aws_s3_bucket.terraform_state.arn}/*",
      ]
    }
  }
}
```

**4. MFA Delete Protection:**

```bash
# Enable MFA delete on S3 bucket (AWS CLI)
$ aws s3api put-bucket-versioning \
    --bucket my-terraform-state-bucket \
    --versioning-configuration Status=Enabled,MFADelete=Enabled \
    --mfa "arn:aws:iam::123456789012:mfa/root-account-mfa-device XXXXXX"
```

**5. Restrict Network Access:**

```hcl
# S3 bucket policy - Restrict to specific VPC endpoint
resource "aws_s3_bucket_policy" "terraform_state_vpc_only" {
  bucket = aws_s3_bucket.terraform_state.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowVPCEndpointAccess"
        Effect = "Deny"
        Principal = "*"
        Action = "s3:*"
        Resource = [
          aws_s3_bucket.terraform_state.arn,
          "${aws_s3_bucket.terraform_state.arn}/*"
        ]
        Condition = {
          StringNotEquals = {
            "aws:sourceVpce" = aws_vpc_endpoint.s3.id
          }
        }
      }
    ]
  })
}
```

**6. Regular State Backups:**

```bash
#!/bin/bash
# backup-terraform-state.sh

# Backup script for Terraform state
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/backup/terraform-state"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Pull current state
terraform state pull > "$BACKUP_DIR/terraform-state-$DATE.json"

# Verify backup
if [ $? -eq 0 ]; then
  echo "State backed up successfully: terraform-state-$DATE.json"

  # Optionally upload to separate backup location
  aws s3 cp "$BACKUP_DIR/terraform-state-$DATE.json" \
    s3://terraform-state-backups/
else
  echo "State backup failed!"
  exit 1
fi

# Clean up old backups (keep last 30 days)
find "$BACKUP_DIR" -name "terraform-state-*.json" -mtime +30 -delete
```

**7. State File Rotation:**

```hcl
# Use workspace-specific or dated state file keys
terraform {
  backend "s3" {
    bucket = "my-terraform-state-bucket"

    # Include date or version in key
    key    = "project/${var.environment}/terraform-${formatdate("YYYYMM", timestamp())}.tfstate"

    region = "us-east-1"
    encrypt = true
  }
}
```

**Complete Security Checklist:**

- [ ] Enable encryption at rest (KMS)
- [ ] Enable encryption in transit (TLS)
- [ ] Configure state locking (DynamoDB)
- [ ] Enable versioning on state bucket
- [ ] Block public access to state bucket
- [ ] Implement least-privilege IAM policies
- [ ] Enable access logging
- [ ] Enable CloudTrail for audit trail
- [ ] Configure MFA delete protection
- [ ] Restrict network access (VPC endpoints)
- [ ] Regular state backups
- [ ] Separate backends for different environments
- [ ] Never commit state files to version control
- [ ] Use .gitignore for state files
- [ ] Rotate backend access credentials regularly
- [ ] Monitor state access with alerts
- [ ] Document state management procedures
- [ ] Test state recovery procedures

**State Security Architecture:**

```
┌───────────────────────────────────────────────────────────┐
│                  Terraform Operations                     │
│                  (Developers, CI/CD)                      │
└─────────────────────┬─────────────────────────────────────┘
                      │
                      │ IAM Role/User
                      │ (MFA Required)
                      v
         ┌────────────────────────────┐
         │   Network Access Control   │
         │   (VPC Endpoint, VPN)      │
         └────────────┬───────────────┘
                      │
                      v
         ┌────────────────────────────┐
         │   DynamoDB Lock Table      │
         │   - State Locking          │
         │   - Encrypted              │
         └────────────┬───────────────┘
                      │
                      v
         ┌────────────────────────────┐
         │   S3 State Bucket          │
         │   - Encryption (KMS)       │
         │   - Versioning Enabled     │
         │   - Public Access Blocked  │
         │   - MFA Delete             │
         │   - Access Logging         │
         └────────────┬───────────────┘
                      │
                      v
         ┌────────────────────────────┐
         │   Audit & Monitoring       │
         │   - CloudTrail             │
         │   - S3 Access Logs         │
         │   - CloudWatch Alerts      │
         └────────────────────────────┘
```

## Summary

**Key Takeaways:**

1. **State is Critical**
   * Maps configuration to real infrastructure
   * Required for Terraform operations
   * Contains sensitive information
   * Must be properly secured

2. **Use Remote Backends**
   * Enable team collaboration
   * Provide state locking
   * Offer encryption and versioning
   * S3, Terraform Cloud, Azure, GCS

3. **State Locking is Essential**
   * Prevents concurrent modifications
   * Protects against state corruption
   * DynamoDB for S3 backend
   * Built-in for most remote backends

4. **Workspaces for Simple Isolation**
   * Multiple environments, single configuration
   * Separate state files per workspace
   * Not suitable for strong isolation
   * Consider alternatives for production

5. **State Operations**
   * list, show, mv, rm, pull, push
   * Powerful but dangerous
   * Always backup before modifications
   * Use with caution

6. **Import Existing Resources**
   * Bring unmanaged resources under Terraform
   * Define configuration before importing
   * Use import blocks (Terraform 1.5+)
   * Verify with terraform plan

7. **Security is Paramount**
   * Encrypt state at rest and in transit
   * Implement least-privilege access
   * Enable versioning and logging
   * Regular backups and audits
   * Never commit state to version control

**Best Practices:**

* Always use remote state for teams
* Enable state locking
* Encrypt state files
* Use version control for configuration (not state)
* Implement proper access controls
* Regular state backups
* Test disaster recovery procedures
* Document state management practices

## Additional Resources

* [Terraform State Documentation](https://developer.hashicorp.com/terraform/language/state)
* [Remote State Backends](https://developer.hashicorp.com/terraform/language/settings/backends)
* [State Locking](https://developer.hashicorp.com/terraform/language/state/locking)
* [Import Resources](https://developer.hashicorp.com/terraform/cli/import)
* [Terraform Cloud](https://developer.hashicorp.com/terraform/cloud-docs)
* [Security Best Practices](https://developer.hashicorp.com/terraform/tutorials/security)

