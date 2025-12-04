---
title: Terragrunt
linkTitle: Terragrunt
type: docs
weight: 11
prev: /terraform/10-best-practices
---

Terragrunt is a thin wrapper for Terraform that provides extra tools for keeping your Terraform configurations DRY (Don't Repeat Yourself), working with multiple modules, and managing remote state.

## What is Terragrunt?

Terragrunt addresses common pain points when working with Terraform at scale:

```
┌──────────────────────────────────────────────────────────────┐
│              PROBLEMS TERRAGRUNT SOLVES                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  PROBLEM 1: Backend Configuration Duplication                │
│  • Every environment needs the same backend config           │
│  • Copy-pasting backend blocks across environments           │
│  • Easy to make mistakes with state file paths               │
│                                                              │
│  PROBLEM 2: Provider Configuration Duplication               │
│  • Same provider config repeated in every module             │
│  • Region, account, and other settings duplicated            │
│                                                              │
│  PROBLEM 3: Module Source Duplication                        │
│  • Same module called with slightly different variables      │
│  • Difficult to update module versions across environments   │
│                                                              │
│  PROBLEM 4: Working with Multiple Modules                    │
│  • Need to run terraform apply in multiple directories       │
│  • Managing dependencies between modules manually            │
│  • No easy way to apply changes across all modules           │
│                                                              │
│  PROBLEM 5: Environment-Specific Variables                   │
│  • Managing different variable values per environment        │
│  • No inheritance or composition of configurations           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Installation

```bash
# macOS (Homebrew)
brew install terragrunt

# Linux (download binary)
TERRAGRUNT_VERSION="v0.55.0"
wget https://github.com/gruntwork-io/terragrunt/releases/download/${TERRAGRUNT_VERSION}/terragrunt_linux_amd64
chmod +x terragrunt_linux_amd64
sudo mv terragrunt_linux_amd64 /usr/local/bin/terragrunt

# Verify installation
terragrunt --version
```

## Basic Concepts

### The terragrunt.hcl File

Terragrunt uses `terragrunt.hcl` configuration files (HCL2 format) to define configuration that wraps your Terraform code.

```hcl
# terragrunt.hcl - Basic structure

# Specify the Terraform source
terraform {
  source = "../modules/vpc"
}

# Configure remote state
remote_state {
  backend = "s3"
  config = {
    bucket = "my-terraform-state"
    key    = "${path_relative_to_include()}/terraform.tfstate"
    region = "us-east-1"
  }
}

# Pass inputs to Terraform
inputs = {
  environment = "production"
  cidr_block  = "10.0.0.0/16"
}
```

### Directory Structure Convention

Terragrunt encourages a specific directory structure:

```
terraform/
├── terragrunt.hcl              # Root configuration
├── modules/                    # Reusable Terraform modules
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── ec2/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── rds/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
└── environments/               # Environment-specific configurations
    ├── dev/
    │   ├── terragrunt.hcl      # Dev environment config
    │   ├── vpc/
    │   │   └── terragrunt.hcl
    │   ├── ec2/
    │   │   └── terragrunt.hcl
    │   └── rds/
    │       └── terragrunt.hcl
    │
    ├── staging/
    │   ├── terragrunt.hcl
    │   ├── vpc/
    │   │   └── terragrunt.hcl
    │   ├── ec2/
    │   │   └── terragrunt.hcl
    │   └── rds/
    │       └── terragrunt.hcl
    │
    └── production/
        ├── terragrunt.hcl
        ├── vpc/
        │   └── terragrunt.hcl
        ├── ec2/
        │   └── terragrunt.hcl
        └── rds/
            └── terragrunt.hcl
```

## DRY Configuration

### Root terragrunt.hcl

Create a root configuration that child configurations can inherit from:

<!-- hack to fix hcl rendering issue -->
```python
# terraform/terragrunt.hcl (root)

# Configure remote state backend (inherited by all children)
remote_state {
  backend = "s3"

  generate = {
    path      = "backend.tf"
    if_exists = "overwrite"
  }

  config = {
    bucket         = "my-terraform-state-bucket"
    key            = "${path_relative_to_include()}/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

# Generate provider configuration (inherited by all children)
generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite"
  contents  = <<EOF
provider "aws" {
  region = "us-east-1"
}
EOF
}

# Common inputs for all environments
inputs = {
  aws_region = "us-east-1"

  common_tags = {
    ManagedBy = "Terragrunt"
    Project   = "MyProject"
  }
}
```

### Environment-Level Configuration

```hcl
# environments/production/terragrunt.hcl

# Include root configuration
include "root" {
  path = find_in_parent_folders()
}

# Environment-specific inputs
inputs = {
  environment = "production"

  # Merge with common_tags from root
  tags = merge(
    local.common_tags,
    {
      Environment = "production"
    }
  )
}

# Locals for reuse
locals {
  account_id = "333333333333"
  aws_region = "us-east-1"
}
```

### Module-Level Configuration

```hcl
# environments/production/vpc/terragrunt.hcl

# Include root configuration
include "root" {
  path = find_in_parent_folders()
}

# Include environment configuration
include "env" {
  path   = find_in_parent_folders("env.hcl")
  expose = true
}

# Specify Terraform module source
terraform {
  source = "../../../modules//vpc"
}

# Module-specific inputs
inputs = {
  cidr_block = "10.0.0.0/16"

  # Reference parent configs
  environment = include.env.inputs.environment

  # Add VPC-specific tags
  tags = merge(
    include.env.inputs.tags,
    {
      Name = "production-vpc"
    }
  )
}
```

## Remote State Management

### Automatic Backend Generation

Terragrunt can automatically generate backend configuration:

```hcl
# Root terragrunt.hcl

remote_state {
  backend = "s3"

  # Generate backend.tf file
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }

  config = {
    bucket = "my-terraform-state-${get_aws_account_id()}"

    # Automatic path based on directory structure
    key = "${path_relative_to_include()}/terraform.tfstate"

    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"

    # S3 bucket versioning
    s3_bucket_tags = {
      Name        = "Terraform State"
      Environment = "all"
    }
  }
}
```

This generates a `backend.tf` in each module directory:

```hcl
# Auto-generated backend.tf

terraform {
  backend "s3" {
    bucket         = "my-terraform-state-333333333333"
    key            = "environments/production/vpc/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

### Dynamic State Path

<!-- hack to fix hcl rendering issue -->
```python
# Use directory path as state key
key = "${path_relative_to_include()}/terraform.tfstate"

# Examples:
# environments/dev/vpc/terragrunt.hcl
#   → state key: environments/dev/vpc/terraform.tfstate
#
# environments/prod/rds/terragrunt.hcl
#   → state key: environments/prod/rds/terraform.tfstate
```

## Dependencies Between Modules

Terragrunt can manage dependencies between modules and pass outputs from one module as inputs to another.

### Defining Dependencies

```hcl
# environments/production/ec2/terragrunt.hcl

include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../modules//ec2"
}

# Declare dependencies
dependency "vpc" {
  config_path = "../vpc"

  # Mock outputs for terraform validate/plan
  mock_outputs = {
    vpc_id     = "vpc-12345678"
    subnet_ids = ["subnet-12345678"]
  }

  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
}

dependency "security_group" {
  config_path = "../security-group"

  mock_outputs = {
    security_group_id = "sg-12345678"
  }
}

# Use outputs from dependencies
inputs = {
  vpc_id            = dependency.vpc.outputs.vpc_id
  subnet_id         = dependency.vpc.outputs.subnet_ids[0]
  security_group_id = dependency.security_group.outputs.security_group_id

  instance_type = "t3.micro"
  ami_id        = "ami-12345678"
}
```

### Dependency Graph

```
┌──────────────────────────────────────────────────────────────┐
│                    DEPENDENCY EXAMPLE                        │
└──────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │     VPC     │
    └──────┬──────┘
           │
           ├──────────────────┬──────────────────┐
           ▼                  ▼                  ▼
    ┌─────────────┐    ┌─────────────┐   ┌─────────────┐
    │   Subnets   │    │  Security   │   │   Route     │
    │             │    │   Groups    │   │   Tables    │
    └──────┬──────┘    └──────┬──────┘   └─────────────┘
           │                  │
           └────────┬─────────┘
                    ▼
           ┌─────────────────┐
           │   EC2 Instance  │
           └─────────┬───────┘
                     │
                     ▼
           ┌─────────────────┐
           │   RDS Database  │
           └─────────────────┘

Terragrunt ensures resources are created in dependency order
```

## Working with Multiple Modules

### Run-all Commands

Terragrunt provides commands to work with multiple modules at once:

```bash
# Plan all modules in the current directory and subdirectories
terragrunt run-all plan

# Apply all modules (respecting dependencies)
terragrunt run-all apply

# Destroy all modules (in reverse dependency order)
terragrunt run-all destroy

# Validate all modules
terragrunt run-all validate

# Show output from all modules
terragrunt run-all output
```

### Execution Flow

```
┌──────────────────────────────────────────────────────────────────┐
│              TERRAGRUNT RUN-ALL EXECUTION                        │
└──────────────────────────────────────────────────────────────────┘

$ terragrunt run-all apply

Step 1: Scan Directory Tree
  └─ Find all terragrunt.hcl files
     └─ environments/production/
        ├─ vpc/terragrunt.hcl
        ├─ security-group/terragrunt.hcl
        ├─ ec2/terragrunt.hcl
        └─ rds/terragrunt.hcl

Step 2: Build Dependency Graph
  └─ Parse dependency blocks
     └─ vpc (no dependencies)
        ├─ security-group (depends on vpc)
        ├─ ec2 (depends on vpc, security-group)
        └─ rds (depends on vpc, security-group)

Step 3: Execute in Order
  1. Apply vpc/              ✓
  2. Apply security-group/   ✓ (after vpc)
  3. Apply ec2/ and rds/     ✓ (in parallel, after dependencies)
```

### Parallelism

```bash
# Control parallelism (default is unlimited)
terragrunt run-all apply --terragrunt-parallelism 2

# Run modules that can be run in parallel
# (those without interdependencies)
```

## Built-in Functions

Terragrunt provides many built-in functions:

### Path Functions

```hcl
# Find parent folder containing a file
path = find_in_parent_folders("terragrunt.hcl")

# Get relative path from include
key = "${path_relative_to_include()}/terraform.tfstate"

# Get relative path from current directory
path_relative_from_include()

# Get absolute path
get_terragrunt_dir()
get_parent_terragrunt_dir()
get_original_terragrunt_dir()
```

### AWS Functions

```hcl
# Get AWS account ID
bucket = "my-state-${get_aws_account_id()}"

# Get AWS caller identity
get_aws_caller_identity_arn()
get_aws_caller_identity_user_id()

# Get available AZs
availability_zones = get_aws_availability_zones()
```

### Environment Functions

```hcl
# Get environment variables
database_password = get_env("DB_PASSWORD", "default-value")

# Check if environment variable is set
run_cmd("echo", get_env("USER"))
```

### Other Functions

```hcl
# Read file contents
ssh_key = read_terragrunt_config("ssh_key.txt")

# Run shell command
git_branch = run_cmd("git", "rev-parse", "--abbrev-ref", "HEAD")

# Find files
tfvars_files = find_in_parent_folders("*.tfvars")
```

## Complete Example

### Project Structure

```
infrastructure/
├── terragrunt.hcl                    # Root config
├── modules/                          # Terraform modules
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── app/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
└── live/                            # Live environments
    ├── _envcommon/                  # Shared configs
    │   ├── vpc.hcl
    │   └── app.hcl
    │
    ├── dev/
    │   ├── account.hcl              # Account-level config
    │   ├── env.hcl                  # Environment-level config
    │   ├── vpc/
    │   │   └── terragrunt.hcl
    │   └── app/
    │       └── terragrunt.hcl
    │
    └── prod/
        ├── account.hcl
        ├── env.hcl
        ├── vpc/
        │   └── terragrunt.hcl
        └── app/
            └── terragrunt.hcl
```

### Root Configuration

<!-- hack to fix hcl rendering issue -->
```python
# infrastructure/terragrunt.hcl

locals {
  # Parse account configuration
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))

  # Parse environment configuration
  env_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))

  # Extract values
  account_id  = local.account_vars.locals.account_id
  aws_region  = local.account_vars.locals.aws_region
  environment = local.env_vars.locals.environment
}

# Remote state configuration
remote_state {
  backend = "s3"

  generate = {
    path      = "backend.tf"
    if_exists = "overwrite"
  }

  config = {
    bucket         = "terraform-state-${local.account_id}"
    key            = "${path_relative_to_include()}/terraform.tfstate"
    region         = local.aws_region
    encrypt        = true
    dynamodb_table = "terraform-locks-${local.environment}"

    s3_bucket_tags = {
      Name        = "Terraform State ${local.environment}"
      Environment = local.environment
    }
  }
}

# Generate provider
generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite"
  contents  = <<EOF
provider "aws" {
  region = "${local.aws_region}"

  default_tags {
    tags = {
      Environment = "${local.environment}"
      ManagedBy   = "Terragrunt"
    }
  }
}
EOF
}

# Common inputs
inputs = merge(
  local.account_vars.locals,
  local.env_vars.locals,
  {}
)
```

### Account Configuration

```hcl
# live/dev/account.hcl

locals {
  account_id = "111111111111"
  aws_region = "us-east-1"
}
```

### Environment Configuration

```hcl
# live/dev/env.hcl

locals {
  environment = "dev"

  # Environment-specific settings
  instance_type = "t3.micro"
  db_instance_class = "db.t3.micro"
}
```

### Shared Module Configuration

```hcl
# live/_envcommon/vpc.hcl

terraform {
  source = "${get_repo_root()}/modules//vpc"
}

inputs = {
  enable_nat_gateway = true
  enable_dns_hostnames = true

  # These will be overridden per environment
  cidr_block = ""
}
```

### Module Configuration (Dev)

```hcl
# live/dev/vpc/terragrunt.hcl

include "root" {
  path = find_in_parent_folders()
}

include "envcommon" {
  path   = "${dirname(find_in_parent_folders())}/_envcommon/vpc.hcl"
  expose = true
}

inputs = {
  cidr_block = "10.0.0.0/16"

  vpc_name = "dev-vpc"

  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.10.0/24", "10.0.11.0/24"]
}
```

### Module Configuration (Prod)

```hcl
# live/prod/vpc/terragrunt.hcl

include "root" {
  path = find_in_parent_folders()
}

include "envcommon" {
  path   = "${dirname(find_in_parent_folders())}/_envcommon/vpc.hcl"
  expose = true
}

inputs = {
  cidr_block = "10.1.0.0/16"

  vpc_name = "prod-vpc"

  public_subnets  = ["10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
  private_subnets = ["10.1.10.0/24", "10.1.11.0/24", "10.1.12.0/24"]
}
```

## Common Commands

```bash
# Initialize and download Terraform modules
terragrunt init

# Plan changes
terragrunt plan

# Apply changes
terragrunt apply

# Destroy resources
terragrunt destroy

# Show output values
terragrunt output

# Run arbitrary Terraform command
terragrunt <terraform-command>

# Work with multiple modules
terragrunt run-all plan
terragrunt run-all apply
terragrunt run-all destroy

# Show dependency graph
terragrunt graph-dependencies

# Validate all configurations
terragrunt run-all validate

# Format all terragrunt.hcl files
terragrunt hclfmt

# Show rendered configuration
terragrunt render-json
```

## Hooks

Terragrunt supports before/after hooks for running commands:

```hcl
terraform {
  source = "../../../modules//vpc"

  # Run before any terraform command
  before_hook "before_hook" {
    commands = ["apply", "plan"]
    execute  = ["echo", "Running Terraform"]
  }

  # Run after successful apply
  after_hook "after_hook" {
    commands     = ["apply"]
    execute      = ["echo", "Apply completed successfully"]
    run_on_error = false
  }

  # Run even on error
  error_hook "error_hook" {
    commands     = ["apply", "destroy"]
    execute      = ["echo", "Command failed"]
    run_on_error = true
  }
}
```

### Common Hook Use Cases

```hcl
# Initialize Terraform plugins
before_hook "init" {
  commands = ["plan", "apply"]
  execute  = ["terraform", "init", "-upgrade"]
}

# Validate before applying
before_hook "validate" {
  commands = ["apply"]
  execute  = ["terraform", "validate"]
}

# Run tflint
before_hook "tflint" {
  commands = ["plan", "apply"]
  execute  = ["tflint"]
}

# Notify on completion
after_hook "notify" {
  commands = ["apply"]
  execute  = ["./scripts/notify-slack.sh", "Apply completed"]
}

# Backup state before destroy
before_hook "backup_state" {
  commands = ["destroy"]
  execute  = ["./scripts/backup-state.sh"]
}
```

## Advanced Patterns

### Multi-Region Deployment

```
infrastructure/
└── live/
    └── prod/
        ├── us-east-1/
        │   ├── region.hcl
        │   ├── vpc/
        │   └── app/
        └── us-west-2/
            ├── region.hcl
            ├── vpc/
            └── app/
```

```hcl
# live/prod/us-east-1/region.hcl
locals {
  aws_region = "us-east-1"
}

# live/prod/us-east-1/vpc/terragrunt.hcl
include "root" {
  path = find_in_parent_folders()
}

locals {
  region_vars = read_terragrunt_config(find_in_parent_folders("region.hcl"))
}

terraform {
  source = "${get_repo_root()}/modules//vpc"
}

inputs = {
  aws_region = local.region_vars.locals.aws_region
  cidr_block = "10.0.0.0/16"
}
```

### Conditional Configuration

<!-- hack to fix hcl rendering issue -->
```terraform
# Enable/disable features per environment

locals {
  env_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))
  is_production = local.env_vars.locals.environment == "prod"
}

inputs = {
  # Enable backups only in production
  backup_retention_days = local.is_production ? 30 : 7

  # Multi-AZ only in production
  multi_az = local.is_production

  # Different instance sizes
  instance_type = local.is_production ? "t3.large" : "t3.micro"
}
```

### Using External Data

```hcl
# Read from JSON file
locals {
  config = jsondecode(file("${get_terragrunt_dir()}/config.json"))
}

inputs = {
  vpc_cidr    = local.config.vpc_cidr
  subnet_cidrs = local.config.subnet_cidrs
}

# Read from YAML file
locals {
  config = yamldecode(file("${get_terragrunt_dir()}/config.yaml"))
}
```

## Best Practices

```
┌──────────────────────────────────────────────────────────────┐
│              TERRAGRUNT BEST PRACTICES                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  STRUCTURE:                                                  │
│  ✅ Keep modules separate from live configurations           │
│  ✅ Use consistent directory structure across environments   │
│  ✅ Use _envcommon for shared configuration                  │
│  ✅ Separate account, region, and environment configs        │
│                                                              │
│  DRY PRINCIPLE:                                              │
│  ✅ Use include blocks to inherit configuration              │
│  ✅ Extract common values to parent configs                  │
│  ✅ Use locals for complex logic                             │
│  ✅ Leverage built-in functions                              │
│                                                              │
│  DEPENDENCIES:                                               │
│  ✅ Explicitly declare dependencies between modules          │
│  ✅ Use mock_outputs for faster planning                     │
│  ✅ Keep dependency chains shallow                           │
│  ✅ Document dependency relationships                        │
│                                                              │
│  STATE MANAGEMENT:                                           │
│  ✅ Use remote state with S3 backend                         │
│  ✅ Enable encryption and versioning                         │
│  ✅ Use DynamoDB for state locking                           │
│  ✅ Organize state files by environment                      │
│                                                              │
│  MODULES:                                                    │
│  ✅ Keep Terraform modules independent of Terragrunt         │
│  ✅ Make modules reusable across environments                │
│  ✅ Version your modules                                     │
│  ✅ Test modules independently                               │
│                                                              │
│  TESTING:                                                    │
│  ✅ Use terragrunt validate to check syntax                  │
│  ✅ Use run-all plan before run-all apply                    │
│  ✅ Test in dev before promoting to production               │
│  ✅ Use mock_outputs for faster validation                   │
│                                                              │
│  CI/CD:                                                      │
│  ✅ Run terragrunt run-all plan in CI                        │
│  ✅ Require approval for run-all apply                       │
│  ✅ Use hooks for validation and linting                     │
│  ✅ Cache .terragrunt-cache between runs                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Common Pitfalls

### 1. Circular Dependencies

<!-- hack to fix hcl rendering issue -->
```python
# ❌ BAD: Circular dependency

# moduleA/terragrunt.hcl
dependency "moduleB" {
  config_path = "../moduleB"
}

# moduleB/terragrunt.hcl
dependency "moduleA" {
  config_path = "../moduleA"
}

# ✅ GOOD: Break the cycle
# Create a third module or use data sources
```

### 2. Forgetting mock_outputs

```hcl
# ❌ BAD: No mock outputs

dependency "vpc" {
  config_path = "../vpc"
}

# Can't run 'plan' until VPC is applied!

# ✅ GOOD: Provide mock outputs

dependency "vpc" {
  config_path = "../vpc"

  mock_outputs = {
    vpc_id = "vpc-mock"
  }

  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
}
```

### 3. Not Using include

```hcl
# ❌ BAD: Duplicating backend config everywhere

remote_state {
  backend = "s3"
  config = {
    # Repeated in every terragrunt.hcl
  }
}

# ✅ GOOD: Use include to inherit

include "root" {
  path = find_in_parent_folders()
}
```

### 4. Hardcoding Paths

```hcl
# ❌ BAD: Hardcoded paths

terraform {
  source = "/home/user/projects/terraform/modules/vpc"
}

# ✅ GOOD: Use relative paths and functions

terraform {
  source = "${get_repo_root()}/modules//vpc"
}
```

## Terragrunt vs. Alternatives

```
┌──────────────────────────────────────────────────────────────┐
│          TERRAGRUNT VS. OTHER APPROACHES                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  TERRAGRUNT vs. WORKSPACES:                                  │
│  • Terragrunt: Separate state files, better isolation        │
│  • Workspaces: Single state file, easier state management    │
│  • Use Terragrunt for: Multi-account, complex environments   │
│  • Use Workspaces for: Simple environment separation         │
│                                                              │
│  TERRAGRUNT vs. TERRAFORM CLOUD:                             │
│  • Terragrunt: Open source, self-hosted                      │
│  • TF Cloud: Managed service, built-in features              │
│  • Use Terragrunt for: Cost savings, full control            │
│  • Use TF Cloud for: Managed experience, team features       │
│                                                              │
│  TERRAGRUNT vs. CUSTOM SCRIPTS:                              │
│  • Terragrunt: Standardized approach, community support      │
│  • Scripts: Full customization, no dependencies              │
│  • Use Terragrunt for: Standard workflows, DRY configs       │
│  • Use Scripts for: Highly custom workflows                  │
│                                                              │
│  TERRAGRUNT vs. MODULES ONLY:                                │
│  • Terragrunt: Less duplication, easier multi-env mgmt       │
│  • Modules Only: Simpler, no extra tooling                   │
│  • Use Terragrunt for: Many environments, complex setups     │
│  • Use Modules for: Simple projects, few environments        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## When to Use Terragrunt

### Good Use Cases:

1. **Multiple Environments**
   - Dev, staging, production with similar structure
   - Need to keep configurations DRY

2. **Multi-Account/Multi-Region**
   - AWS Organizations with multiple accounts
   - Deploying same infrastructure to multiple regions

3. **Complex Dependency Chains**
   - Many interdependent modules
   - Need automatic dependency resolution

4. **Large Teams**
   - Need consistent structure
   - Want to reduce configuration drift

5. **Heavy Module Reuse**
   - Same modules used across many environments
   - Want centralized module versioning

### When NOT to Use Terragrunt:

1. **Simple Projects**
   - Single environment
   - Few modules

2. **Learning Terraform**
   - Adds complexity for beginners
   - Master Terraform first

3. **Using Terraform Cloud**
   - TF Cloud provides similar features
   - May be redundant

4. **Team Unfamiliar with HCL**
   - Additional learning curve
   - Terragrunt has its own syntax

## Troubleshooting

### Common Issues

#### Issue 1: Module Not Found

```
Error: Module not found: ../../../modules//vpc
```

```bash
# Solution: Check source path
terraform {
  source = "${get_repo_root()}/modules//vpc"
}

# Or use relative path
terraform {
  source = "../../../modules//vpc"
}
```

#### Issue 2: Dependency Cycle

```
Error: Cycle detected in dependencies
```

```bash
# Solution: Visualize dependencies
terragrunt graph-dependencies | dot -Tpng > graph.png

# Identify and break the cycle
```

#### Issue 3: State Locking Error

```
Error: Error acquiring state lock
```

```bash
# Solution: Check lock table
aws dynamodb scan \
  --table-name terraform-locks-prod \
  --filter-expression "LockID = :lockid"

# Force unlock if needed (careful!)
cd specific/module/directory
terragrunt force-unlock <lock-id>
```

#### Issue 4: .terragrunt-cache Issues

```bash
# Clear Terragrunt cache
find . -type d -name ".terragrunt-cache" -prune -exec rm -rf {} \;

# Or for specific directory
rm -rf .terragrunt-cache

# Re-initialize
terragrunt init
```

### Debug Mode

```bash
# Enable debug logging
export TERRAGRUNT_DEBUG=true
terragrunt plan

# More verbose logging
export TF_LOG=DEBUG
export TERRAGRUNT_DEBUG=true
terragrunt apply

# Disable auto-init
export TERRAGRUNT_AUTO_INIT=false
```

## Migration to Terragrunt

### Step-by-Step Migration

#### Step 1: Organize Existing Terraform

```bash
# Current structure
terraform/
├── dev/
│   └── main.tf
├── staging/
│   └── main.tf
└── prod/
    └── main.tf

# Move to modules
terraform/
├── modules/
│   └── app/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── environments/
    ├── dev/
    ├── staging/
    └── prod/
```

#### Step 2: Create Root Configuration

```hcl
# terraform/terragrunt.hcl
remote_state {
  backend = "s3"
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite"
  }
  config = {
    bucket = "my-terraform-state"
    key    = "${path_relative_to_include()}/terraform.tfstate"
    region = "us-east-1"
    encrypt = true
  }
}
```

#### Step 3: Create Module Configurations

```hcl
# environments/dev/app/terragrunt.hcl
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../modules//app"
}

inputs = {
  environment = "dev"
  # ... other variables
}
```

#### Step 4: Migrate State

```bash
# For each environment
cd environments/dev/app

# Initialize Terragrunt
terragrunt init

# Import existing state
terragrunt state pull > /tmp/old-state.tfstate
terragrunt state push /tmp/old-state.tfstate

# Verify
terragrunt plan  # Should show no changes
```

#### Step 5: Test

```bash
# Test planning
terragrunt run-all plan

# Test in dev first
cd environments/dev
terragrunt run-all apply

# Then promote to other environments
```

## Summary

Terragrunt is a powerful wrapper for Terraform that solves common problems when managing infrastructure at scale:

### Key Benefits:

1. **DRY Configuration**: Reduce duplication through inheritance
2. **Remote State Management**: Automatic backend configuration
3. **Module Dependencies**: Automatic dependency resolution
4. **Multi-Module Operations**: Run commands across multiple modules
5. **Environment Management**: Easy management of multiple environments

### When to Use:

- Multiple environments (dev, staging, prod)
- Multi-account or multi-region deployments
- Complex module dependencies
- Large teams needing consistency
- Heavy module reuse

### Remember:

- Keep Terraform modules independent of Terragrunt
- Use `include` to avoid duplication
- Define dependencies explicitly
- Provide `mock_outputs` for faster planning
- Test in lower environments first
- Use `run-all` commands for multi-module operations

**External Resources:**
- [Terragrunt Documentation](https://terragrunt.gruntwork.io/)
- [Gruntwork Blog](https://blog.gruntwork.io/)
- [Terragrunt GitHub](https://github.com/gruntwork-io/terragrunt)
- [Terragrunt Examples](https://github.com/gruntwork-io/terragrunt-infrastructure-live-example)
