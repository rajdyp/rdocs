---
title: Modules
linkTitle: Modules
type: docs
weight: 7
prev: /terraform/06-expressions-and-functions
next: /terraform/08-state-management
---

## Module Fundamentals

Modules are containers for multiple resources that are used together. A module is simply a set of Terraform configuration files (`.tf` files) in a single directory.

```
┌────────────────────────────────────────────────────────────┐
│                    WHAT ARE MODULES?                       │
└────────────────────────────────────────────────────────────┘

Module = Collection of .tf files in a directory
         ├─ main.tf           (primary resources)
         ├─ variables.tf      (input variables)
         ├─ outputs.tf        (output values)
         ├─ versions.tf       (version constraints)
         └─ README.md         (documentation)
```

### Why Use Modules?

**1. Reusability**
```
Write once, use everywhere
  ├─ VPC module used in dev, staging, prod
  ├─ EC2 module used for web, app, db servers
  └─ S3 module used for logs, backups, assets
```

**2. Organization**
```
Logical grouping of related resources
  ├─ Network module (VPC, subnets, routes)
  ├─ Compute module (EC2, ASG, ALB)
  └─ Database module (RDS, security groups)
```

**3. Encapsulation**
```
Hide complexity behind simple interface
  ├─ Complex networking setup
  └─ Simple inputs: environment, cidr_block
```

**4. Consistency**
```
Enforce standards across environments
  ├─ Same security configurations
  ├─ Same naming conventions
  └─ Same tagging strategies
```

### Module Benefits Visualization

```
┌────────────────────────────────────────────────────────────┐
│                     MODULE BENEFITS                        │
└────────────────────────────────────────────────────────────┘

WITHOUT MODULES:
  main.tf (1000+ lines)
    ├─ 20 resources for VPC
    ├─ 15 resources for EC2
    ├─ 10 resources for RDS
    └─ Duplicated across dev, staging, prod

WITH MODULES:
  main.tf (50 lines)
    ├─ module "vpc" { ... }      ─┐
    ├─ module "ec2" { ... }      ─┤ Clean, readable
    └─ module "rds" { ... }      ─┘

  modules/
    ├─ vpc/    (reusable VPC setup)
    ├─ ec2/    (reusable EC2 setup)
    └─ rds/    (reusable RDS setup)
```

## Module Types

### 1. Root Module

The **root module** is the primary module containing all `.tf` files in your main working directory.

```
┌────────────────────────────────────────────────────────────┐
│                       ROOT MODULE                          │
└────────────────────────────────────────────────────────────┘

/terraform-project/          ← ROOT MODULE
  ├─ main.tf
  ├─ variables.tf
  ├─ outputs.tf
  └─ terraform.tfvars

Characteristics:
  ✓ Entry point for Terraform commands
  ✓ Variables set via CLI, env vars, or .tfvars
  ✓ Can call child modules
  ✓ Cannot be called by other modules
```

**Root Module Example:**

<!-- hack to fix hcl rendering issue -->
```python
# main.tf (root module)
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# Call child modules
module "vpc" {
  source = "./modules/vpc"

  environment = var.environment
  vpc_cidr    = var.vpc_cidr
}

module "ec2" {
  source = "./modules/ec2"

  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
}

# variables.tf (root module)
variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}
```

### 2. Child Module

A **child module** is any module that is called by another module.

```
┌────────────────────────────────────────────────────────────┐
│                      CHILD MODULE                          │
└────────────────────────────────────────────────────────────┘

/terraform-project/modules/vpc/    ← CHILD MODULE
  ├─ main.tf
  ├─ variables.tf
  └─ outputs.tf

Characteristics:
  ✓ Called using 'module' block
  ✓ Requires 'source' argument
  ✓ Variables set by parent module
  ✓ Exposes values via outputs
```

**Parent-Child Relationship:**

```
┌──────────────────────────────────────────────────────────────┐
│                     MODULE HIERARCHY                         │
└──────────────────────────────────────────────────────────────┘

ROOT MODULE (main.tf)
  │
  ├─ module "vpc" ──────────────> CHILD MODULE (./modules/vpc/)
  │   └─ Inputs: environment, vpc_cidr
  │   └─ Outputs: vpc_id, subnet_ids
  │
  ├─ module "ec2" ──────────────> CHILD MODULE (./modules/ec2/)
  │   └─ Inputs: vpc_id, subnet_ids
  │   └─ Outputs: instance_ids
  │
  └─ module "rds" ──────────────> CHILD MODULE (./modules/rds/)
      └─ Inputs: vpc_id, subnet_ids
      └─ Outputs: db_endpoint
```

### 3. Public Modules (Terraform Registry)

Public modules are published on the [Terraform Registry](https://registry.terraform.io/).

```
┌────────────────────────────────────────────────────────────┐
│                    PUBLIC MODULES                          │
└────────────────────────────────────────────────────────────┘

Terraform Registry: registry.terraform.io
  ├─ AWS modules (VPC, EC2, RDS, S3, etc.)
  ├─ Azure modules (Virtual Network, VM, etc.)
  ├─ GCP modules (VPC, Compute, etc.)
  └─ Community contributed modules

Benefits:
  ✓ Battle-tested, production-ready
  ✓ Well-documented
  ✓ Semantic versioning
  ✓ Community maintained
```

## Module Structure

### Standard Module Structure

```
┌────────────────────────────────────────────────────────────┐
│              RECOMMENDED MODULE STRUCTURE                  │
└────────────────────────────────────────────────────────────┘

terraform-project/
├─ main.tf              # Root module entry point
├─ variables.tf         # Root module inputs
├─ outputs.tf           # Root module outputs
├─ terraform.tfvars     # Variable values
├─ versions.tf          # Provider version constraints
│
└─ modules/             # Child modules directory
   │
   ├─ vpc/              # VPC module
   │  ├─ main.tf        # VPC resources
   │  ├─ variables.tf   # Module inputs
   │  ├─ outputs.tf     # Module outputs
   │  ├─ versions.tf    # Provider requirements
   │  └─ README.md      # Module documentation
   │
   ├─ ec2/              # EC2 module
   │  ├─ main.tf
   │  ├─ variables.tf
   │  ├─ outputs.tf
   │  └─ README.md
   │
   └─ rds/              # RDS module
      ├─ main.tf
      ├─ variables.tf
      ├─ outputs.tf
      └─ README.md
```

### Input Variables in Modules

Modules accept inputs through variables, just like the root module.

```hcl
# modules/vpc/variables.tf

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "Must be a valid IPv4 CIDR block."
  }
}

variable "public_subnets" {
  description = "List of public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnets" {
  description = "List of private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24"]
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnets"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Additional tags for all resources"
  type        = map(string)
  default     = {}
}
```

### Output Values from Modules

Modules export values through outputs that can be referenced by the calling module.

<!-- hack to fix hcl rendering issue -->
```python
# modules/vpc/outputs.tf

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of private subnets"
  value       = aws_subnet.private[*].id
}

output "nat_gateway_ids" {
  description = "IDs of NAT Gateways"
  value       = aws_nat_gateway.main[*].id
}

output "internet_gateway_id" {
  description = "ID of the Internet Gateway"
  value       = aws_internet_gateway.main.id
}
```

### Data Flow in Modules

```
┌──────────────────────────────────────────────────────────────────┐
│                         MODULE DATA FLOW                         │
└──────────────────────────────────────────────────────────────────┘

ROOT MODULE
  │
  ├─ Variables (inputs)
  │   ├─ CLI: -var="key=value"
  │   ├─ Files: terraform.tfvars
  │   └─ Environment: TF_VAR_key
  │
  ├─ module "vpc" {
  │     source = "./modules/vpc"
  │
  │     Inputs ──────────────────────┐
  │       environment  = "prod"      │
  │       vpc_cidr     = "10.0.0.0/16"
  │   }                              │
  │                                  ▼
  │                          CHILD MODULE (VPC)
  │                            ├─ variables.tf (receives inputs)
  │                            ├─ main.tf (uses variables)
  │                            └─ outputs.tf (exposes values)
  │                                  │
  │   Outputs <──────────────────────┘
  │     vpc_id
  │     subnet_ids
  │
  ├─ module "ec2" {
  │     source = "./modules/ec2"
  │
  │     Uses VPC outputs ──────────┐
  │       vpc_id    = module.vpc.vpc_id
  │       subnet_ids = module.vpc.private_subnet_ids
  │   }                            │
  │                                ▼
  │                          CHILD MODULE (EC2)
  │                            └─ Creates EC2 instances in VPC
  │
  └─ Root outputs
      └─ Exposes final values to users
```

## Calling Modules

### Module Block Syntax

The `module` block is used to call a child module from another module.

```
┌────────────────────────────────────────────────────────────┐
│                   MODULE BLOCK SYNTAX                      │
└────────────────────────────────────────────────────────────┘

module "MODULE_NAME" {
  ├─ source          (required) - Module location
  ├─ version         (optional) - Module version
  ├─ providers       (optional) - Provider configuration
  ├─ count           (optional) - Create multiple instances
  ├─ for_each        (optional) - Create instance per item
  ├─ depends_on      (optional) - Explicit dependencies
  └─ INPUT_VARIABLES (required) - Module-specific inputs
}
```

### Source Parameter

The `source` argument tells Terraform where to find the module source code.

```
┌──────────────────────────────────────────────────────────────────┐
│                       SOURCE TYPES                               │
└──────────────────────────────────────────────────────────────────┘

1. Local Path
   source = "./modules/vpc"
   source = "../shared-modules/vpc"
   source = "/absolute/path/to/module"

2. Terraform Registry
   source = "terraform-aws-modules/vpc/aws"
   source = "hashicorp/consul/aws"

3. GitHub
   source = "github.com/organization/repo//modules/vpc"
   source = "github.com/organization/repo//modules/vpc?ref=v1.0.0"

4. Git
   source = "git::https://github.com/org/repo.git//modules/vpc"
   source = "git::ssh://git@github.com/org/repo.git//modules/vpc"

5. HTTP URL
   source = "https://example.com/modules/vpc.zip"

6. S3 Bucket
   source = "s3::https://s3.amazonaws.com/bucket/modules/vpc.zip"
```

### Local Module Example

```hcl
# main.tf (root module)

# Call local VPC module
module "vpc" {
  source = "./modules/vpc"

  # Pass inputs to module
  environment     = var.environment
  vpc_cidr        = var.vpc_cidr
  public_subnets  = var.public_subnets
  private_subnets = var.private_subnets

  tags = {
    Project = "MyApp"
    ManagedBy = "Terraform"
  }
}

# Call local EC2 module
module "web_servers" {
  source = "./modules/ec2"

  environment    = var.environment
  instance_count = 2
  instance_type  = "t3.small"

  # Use outputs from VPC module
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.public_subnet_ids

  tags = {
    Role = "WebServer"
  }
}
```

### Version Pinning

For external modules, always specify a version to ensure reproducibility.

<!-- hack to fix hcl rendering issue -->
```python
# Using Terraform Registry modules with version constraints

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.2"  # Exact version

  name = "my-vpc"
  cidr = "10.0.0.0/16"
}

module "s3_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 3.0"  # Any 3.x version >= 3.0

  bucket = "my-unique-bucket"
}

module "ec2_instance" {
  source  = "terraform-aws-modules/ec2-instance/aws"
  version = ">= 5.0, < 6.0"  # Range

  name = "my-instance"
}
```

**Version Constraint Operators:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    VERSION CONSTRAINTS                          │
└─────────────────────────────────────────────────────────────────┘

Operator    Meaning                Example
──────────────────────────────────────────────────────────────────
=           Exact version          = 1.2.3
!=          Not this version       != 1.2.3
>           Greater than           > 1.2.3
>=          Greater or equal       >= 1.2.3
<           Less than              < 1.2.3
<=          Less or equal          <= 1.2.3
~>          Pessimistic            ~> 1.2  (1.2.x, but not 1.3)
                                   ~> 1.2.3 (1.2.x, but not 1.3)
```

### Passing Multiple Inputs

```hcl
module "vpc" {
  source = "./modules/vpc"

  # Simple values
  environment        = "production"
  vpc_cidr           = "10.0.0.0/16"
  enable_nat_gateway = true

  # Lists
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
  public_subnets     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  private_subnets    = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]

  # Maps
  tags = {
    Environment = "production"
    Project     = "MyApp"
    ManagedBy   = "Terraform"
    CostCenter  = "Engineering"
  }

  # Objects
  nat_gateway_config = {
    create_eip = true
    single_nat = false
  }
}
```

## Module Outputs

### Defining Outputs in Child Modules

Child modules expose values through outputs that can be accessed by the parent module.

<!-- hack to fix hcl rendering issue -->
```python
# modules/vpc/main.tf

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(
    var.tags,
    {
      Name = "${var.environment}-vpc"
    }
  )
}

resource "aws_subnet" "public" {
  count = length(var.public_subnets)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnets[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = merge(
    var.tags,
    {
      Name = "${var.environment}-public-subnet-${count.index + 1}"
      Type = "Public"
    }
  )
}

resource "aws_subnet" "private" {
  count = length(var.private_subnets)

  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnets[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = merge(
    var.tags,
    {
      Name = "${var.environment}-private-subnet-${count.index + 1}"
      Type = "Private"
    }
  )
}

# modules/vpc/outputs.tf

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "availability_zones" {
  description = "List of availability zones used"
  value       = var.availability_zones
}
```

### Accessing Module Outputs

Use the syntax `module.<MODULE_NAME>.<OUTPUT_NAME>` to access outputs from child modules.

```
┌────────────────────────────────────────────────────────────┐
│               ACCESSING MODULE OUTPUTS                     │
└────────────────────────────────────────────────────────────┘

Syntax: module.<module_name>.<output_name>

module "vpc" {
  source = "./modules/vpc"
  ...
}
        │
        ├─ Outputs:
        │   ├─ vpc_id
        │   ├─ public_subnet_ids
        │   └─ private_subnet_ids
        │
        ▼
Access in parent:
  - module.vpc.vpc_id
  - module.vpc.public_subnet_ids
  - module.vpc.private_subnet_ids
```

**Example:**

```hcl
# main.tf (root module)

module "vpc" {
  source = "./modules/vpc"

  environment     = var.environment
  vpc_cidr        = "10.0.0.0/16"
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.11.0/24", "10.0.12.0/24"]
}

# Use VPC outputs in EC2 module
module "web_servers" {
  source = "./modules/ec2"

  vpc_id     = module.vpc.vpc_id              # ← Access VPC output
  subnet_ids = module.vpc.public_subnet_ids   # ← Access VPC output

  instance_count = 2
  instance_type  = "t3.micro"
}

# Use VPC outputs in RDS module
module "database" {
  source = "./modules/rds"

  vpc_id     = module.vpc.vpc_id              # ← Access VPC output
  subnet_ids = module.vpc.private_subnet_ids  # ← Access VPC output

  engine         = "mysql"
  instance_class = "db.t3.small"
}

# Expose module outputs to end users
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "web_server_ips" {
  description = "Public IPs of web servers"
  value       = module.web_servers.public_ips
}

output "database_endpoint" {
  description = "Database connection endpoint"
  value       = module.database.endpoint
  sensitive   = true
}
```

### Output Chaining

Modules can chain outputs from one module to another.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        OUTPUT CHAINING                                  │
└─────────────────────────────────────────────────────────────────────────┘

module "vpc"
  └─ Outputs: vpc_id, subnet_ids
           │
           ▼
module "security_groups" (uses VPC outputs)
  └─ Inputs: vpc_id (from module.vpc.vpc_id)
  └─ Outputs: web_sg_id, db_sg_id
           │
           ▼
module "ec2" (uses VPC and SG outputs)
  └─ Inputs: subnet_ids (from module.vpc.subnet_ids)
           : security_group_ids (from module.security_groups.web_sg_id)
  └─ Outputs: instance_ids, public_ips
           │
           ▼
module "alb" (uses EC2 outputs)
  └─ Inputs: instance_ids (from module.ec2.instance_ids)
  └─ Outputs: alb_dns_name
```

**Example:**

```hcl
module "vpc" {
  source = "./modules/vpc"
  cidr   = "10.0.0.0/16"
}

module "security_groups" {
  source = "./modules/security-groups"
  vpc_id = module.vpc.vpc_id  # ← Use VPC output
}

module "ec2" {
  source             = "./modules/ec2"
  subnet_ids         = module.vpc.public_subnet_ids       # ← VPC output
  security_group_ids = [module.security_groups.web_sg_id] # ← SG output
}

module "alb" {
  source      = "./modules/alb"
  vpc_id      = module.vpc.vpc_id                # ← VPC output
  subnet_ids  = module.vpc.public_subnet_ids     # ← VPC output
  instance_ids = module.ec2.instance_ids         # ← EC2 output
}
```

## Provider Configuration in Modules

### Default Provider Inheritance

By default, provider configurations are automatically inherited by child modules from their parent module.

```
┌────────────────────────────────────────────────────────────┐
│              DEFAULT PROVIDER INHERITANCE                  │
└────────────────────────────────────────────────────────────┘

ROOT MODULE
  │
  ├─ provider "aws" {
  │    region = "us-east-1"
  │  }
  │
  │          Automatically inherited ↓
  │
  └─ module "vpc" {
       source = "./modules/vpc"
       ...
     }
     └─ Uses AWS provider from root (us-east-1)
```

**Example:**

```hcl
# Root module - providers.tf

provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# main.tf

module "vpc" {
  source = "./modules/vpc"

  environment = var.environment
  vpc_cidr    = var.vpc_cidr

  # No providers block needed - inherits default AWS provider
}

module "ec2" {
  source = "./modules/ec2"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.public_subnet_ids

  # No providers block needed - inherits default AWS provider
}
```

### Aliased Provider Configuration

Aliased provider configurations are NOT automatically inherited. They must be explicitly passed to child modules using the `providers` meta-argument.

```
┌────────────────────────────────────────────────────────────┐
│             ALIASED PROVIDER PASSING                       │
└────────────────────────────────────────────────────────────┘

ROOT MODULE
  │
  ├─ provider "aws" {
  │    alias  = "primary"
  │    region = "us-east-1"
  │  }
  │
  ├─ provider "aws" {
  │    alias  = "dr"
  │    region = "us-west-2"
  │  }
  │
  │          Must explicitly pass ↓
  │
  ├─ module "app_primary" {
  │    source = "./modules/app"
  │    providers = {
  │      aws = aws.primary  ← Explicit
  │    }
  │  }
  │
  └─ module "app_dr" {
       source = "./modules/app"
       providers = {
         aws = aws.dr  ← Explicit
       }
     }
```

**Multi-Region Example:**

```hcl
# providers.tf

provider "aws" {
  alias  = "primary"
  region = var.primary_region

  default_tags {
    tags = {
      Region = "Primary"
    }
  }
}

provider "aws" {
  alias  = "dr"
  region = var.dr_region

  default_tags {
    tags = {
      Region = "DR"
    }
  }
}

# main.tf

# Deploy app in primary region
module "app_primary" {
  source = "./modules/app"

  environment = var.environment
  vpc_id      = module.vpc_primary.vpc_id
  subnet_ids  = module.vpc_primary.private_subnet_ids

  # Explicitly pass the primary provider
  providers = {
    aws = aws.primary
  }
}

# Deploy app in DR region
module "app_dr" {
  source = "./modules/app"

  environment = "${var.environment}-dr"
  vpc_id      = module.vpc_dr.vpc_id
  subnet_ids  = module.vpc_dr.private_subnet_ids

  # Explicitly pass the DR provider
  providers = {
    aws = aws.dr
  }
}
```

### Multi-Provider Modules

Modules can require multiple providers.

```hcl
# Module that requires both AWS and Datadog providers

# modules/monitored-app/versions.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    datadog = {
      source  = "datadog/datadog"
      version = "~> 3.0"
    }
  }
}

# Root module

provider "aws" {
  region = "us-east-1"
}

provider "datadog" {
  api_key = var.datadog_api_key
  app_key = var.datadog_app_key
}

module "monitored_app" {
  source = "./modules/monitored-app"

  # Both providers are inherited automatically
  # if they use default configuration names
}

# If using aliases:
provider "aws" {
  alias  = "prod"
  region = "us-east-1"
}

provider "datadog" {
  alias   = "prod"
  api_key = var.datadog_api_key
  app_key = var.datadog_app_key
}

module "monitored_app" {
  source = "./modules/monitored-app"

  providers = {
    aws     = aws.prod
    datadog = datadog.prod
  }
}
```

## Creating Reusable Modules

### Design Principles

```
┌────────────────────────────────────────────────────────────┐
│              MODULE DESIGN PRINCIPLES                      │
└────────────────────────────────────────────────────────────┘

1. Single Responsibility
   ✓ One module = One logical purpose
   ✗ Don't mix VPC + EC2 + RDS in one module

2. Minimal Required Inputs
   ✓ Required vars for essential config only
   ✓ Optional vars with sensible defaults

3. Expose Useful Outputs
   ✓ Output values that users might need
   ✓ Output IDs, ARNs, endpoints, URLs

4. Documentation
   ✓ README with examples
   ✓ Variable descriptions
   ✓ Output descriptions

5. Validation
   ✓ Input validation where possible
   ✓ Clear error messages

6. Versioning
   ✓ Use semantic versioning
   ✓ Document breaking changes
```

### Example: VPC Module

Complete, production-ready VPC module.

```
┌────────────────────────────────────────────────────────────┐
│                  VPC MODULE STRUCTURE                      │
└────────────────────────────────────────────────────────────┘

modules/vpc/
├─ main.tf          # VPC, subnets, gateways, routes
├─ variables.tf     # Input variables
├─ outputs.tf       # Output values
├─ versions.tf      # Provider requirements
└─ README.md        # Documentation
```

**modules/vpc/variables.tf:**

```hcl
variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "Must be a valid IPv4 CIDR block."
  }
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "public_subnets" {
  description = "List of public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnets" {
  description = "List of private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnets"
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "Use a single NAT Gateway for all AZs (cost savings)"
  type        = bool
  default     = false
}

variable "enable_dns_hostnames" {
  description = "Enable DNS hostnames in VPC"
  type        = bool
  default     = true
}

variable "enable_dns_support" {
  description = "Enable DNS support in VPC"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Additional tags for all resources"
  type        = map(string)
  default     = {}
}
```

**modules/vpc/main.tf:**

<!-- hack to fix hcl rendering issue -->
```terraform
# VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = var.enable_dns_hostnames
  enable_dns_support   = var.enable_dns_support

  tags = merge(
    var.tags,
    {
      Name        = "${var.environment}-vpc"
      Environment = var.environment
    }
  )
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(
    var.tags,
    {
      Name        = "${var.environment}-igw"
      Environment = var.environment
    }
  )
}

# Public Subnets
resource "aws_subnet" "public" {
  count = length(var.public_subnets)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnets[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = merge(
    var.tags,
    {
      Name        = "${var.environment}-public-subnet-${count.index + 1}"
      Environment = var.environment
      Type        = "Public"
      AZ          = var.availability_zones[count.index]
    }
  )
}

# Private Subnets
resource "aws_subnet" "private" {
  count = length(var.private_subnets)

  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnets[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = merge(
    var.tags,
    {
      Name        = "${var.environment}-private-subnet-${count.index + 1}"
      Environment = var.environment
      Type        = "Private"
      AZ          = var.availability_zones[count.index]
    }
  )
}

# Elastic IPs for NAT Gateways
resource "aws_eip" "nat" {
  count = var.enable_nat_gateway ? (var.single_nat_gateway ? 1 : length(var.public_subnets)) : 0

  domain = "vpc"

  tags = merge(
    var.tags,
    {
      Name        = "${var.environment}-nat-eip-${count.index + 1}"
      Environment = var.environment
    }
  )

  depends_on = [aws_internet_gateway.main]
}

# NAT Gateways
resource "aws_nat_gateway" "main" {
  count = var.enable_nat_gateway ? (var.single_nat_gateway ? 1 : length(var.public_subnets)) : 0

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = merge(
    var.tags,
    {
      Name        = "${var.environment}-nat-${count.index + 1}"
      Environment = var.environment
    }
  )

  depends_on = [aws_internet_gateway.main]
}

# Public Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  tags = merge(
    var.tags,
    {
      Name        = "${var.environment}-public-rt"
      Environment = var.environment
      Type        = "Public"
    }
  )
}

# Public Route (to Internet Gateway)
resource "aws_route" "public_internet" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.main.id
}

# Public Route Table Associations
resource "aws_route_table_association" "public" {
  count = length(var.public_subnets)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Private Route Tables
resource "aws_route_table" "private" {
  count = var.enable_nat_gateway ? (var.single_nat_gateway ? 1 : length(var.private_subnets)) : 1

  vpc_id = aws_vpc.main.id

  tags = merge(
    var.tags,
    {
      Name        = "${var.environment}-private-rt-${count.index + 1}"
      Environment = var.environment
      Type        = "Private"
    }
  )
}

# Private Routes (to NAT Gateway)
resource "aws_route" "private_nat" {
  count = var.enable_nat_gateway ? (var.single_nat_gateway ? 1 : length(var.private_subnets)) : 0

  route_table_id         = aws_route_table.private[count.index].id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.main[count.index].id
}

# Private Route Table Associations
resource "aws_route_table_association" "private" {
  count = length(var.private_subnets)

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = var.enable_nat_gateway ? (
    var.single_nat_gateway ? aws_route_table.private[0].id : aws_route_table.private[count.index].id
  ) : aws_route_table.private[0].id
}
```

**modules/vpc/outputs.tf:**

<!-- hack to fix hcl rendering issue -->
```python
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "vpc_arn" {
  description = "ARN of the VPC"
  value       = aws_vpc.main.arn
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "public_subnet_cidrs" {
  description = "List of public subnet CIDR blocks"
  value       = aws_subnet.public[*].cidr_block
}

output "private_subnet_cidrs" {
  description = "List of private subnet CIDR blocks"
  value       = aws_subnet.private[*].cidr_block
}

output "internet_gateway_id" {
  description = "ID of the Internet Gateway"
  value       = aws_internet_gateway.main.id
}

output "nat_gateway_ids" {
  description = "List of NAT Gateway IDs"
  value       = aws_nat_gateway.main[*].id
}

output "nat_gateway_public_ips" {
  description = "List of NAT Gateway public IPs"
  value       = aws_eip.nat[*].public_ip
}

output "public_route_table_id" {
  description = "ID of the public route table"
  value       = aws_route_table.public.id
}

output "private_route_table_ids" {
  description = "List of private route table IDs"
  value       = aws_route_table.private[*].id
}

output "availability_zones" {
  description = "List of availability zones used"
  value       = var.availability_zones
}
```

**modules/vpc/versions.tf:**

<!-- hack to fix hcl rendering issue -->
```python
terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}
```

**Using the VPC Module:**

```hcl
# main.tf (root module)

module "vpc" {
  source = "./modules/vpc"

  environment        = "production"
  vpc_cidr           = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
  public_subnets     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  private_subnets    = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]

  enable_nat_gateway  = true
  single_nat_gateway  = false  # NAT Gateway per AZ for HA

  tags = {
    Project   = "MyApp"
    ManagedBy = "Terraform"
  }
}

# Use VPC outputs
output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnets" {
  value = module.vpc.public_subnet_ids
}

output "private_subnets" {
  value = module.vpc.private_subnet_ids
}
```

### Example: EC2 Module

**modules/ec2/variables.tf:**

```hcl
variable "environment" {
  description = "Environment name"
  type        = string
}

variable "name" {
  description = "Name prefix for instances"
  type        = string
  default     = "instance"
}

variable "instance_count" {
  description = "Number of instances to create"
  type        = number
  default     = 1

  validation {
    condition     = var.instance_count > 0 && var.instance_count <= 10
    error_message = "Instance count must be between 1 and 10."
  }
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "ami_id" {
  description = "AMI ID to use for instances"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where instances will be created"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for instance placement"
  type        = list(string)
}

variable "security_group_ids" {
  description = "List of security group IDs"
  type        = list(string)
  default     = []
}

variable "key_name" {
  description = "SSH key pair name"
  type        = string
  default     = null
}

variable "user_data" {
  description = "User data script"
  type        = string
  default     = null
}

variable "root_volume_size" {
  description = "Size of root volume in GB"
  type        = number
  default     = 20
}

variable "enable_monitoring" {
  description = "Enable detailed monitoring"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Additional tags for instances"
  type        = map(string)
  default     = {}
}
```

**modules/ec2/main.tf:**

<!-- hack to fix hcl rendering issue -->
```python
# Security Group for instances
resource "aws_security_group" "instance" {
  name_prefix = "${var.environment}-${var.name}-"
  description = "Security group for ${var.name} instances"
  vpc_id      = var.vpc_id

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(
    var.tags,
    {
      Name        = "${var.environment}-${var.name}-sg"
      Environment = var.environment
    }
  )
}

# Allow outbound traffic
resource "aws_security_group_rule" "egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.instance.id
}

# EC2 Instances
resource "aws_instance" "main" {
  count = var.instance_count

  ami           = var.ami_id
  instance_type = var.instance_type

  # Distribute instances across subnets
  subnet_id = var.subnet_ids[count.index % length(var.subnet_ids)]

  # Combine module SG with additional SGs
  vpc_security_group_ids = concat(
    [aws_security_group.instance.id],
    var.security_group_ids
  )

  key_name  = var.key_name
  user_data = var.user_data

  monitoring = var.enable_monitoring

  root_block_device {
    volume_size           = var.root_volume_size
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  tags = merge(
    var.tags,
    {
      Name        = "${var.environment}-${var.name}-${count.index + 1}"
      Environment = var.environment
    }
  )
}
```

**modules/ec2/outputs.tf:**

<!-- hack to fix hcl rendering issue -->
```python
output "instance_ids" {
  description = "List of instance IDs"
  value       = aws_instance.main[*].id
}

output "private_ips" {
  description = "List of private IP addresses"
  value       = aws_instance.main[*].private_ip
}

output "public_ips" {
  description = "List of public IP addresses"
  value       = aws_instance.main[*].public_ip
}

output "security_group_id" {
  description = "ID of the instance security group"
  value       = aws_security_group.instance.id
}

output "availability_zones" {
  description = "List of availability zones where instances are placed"
  value       = aws_instance.main[*].availability_zone
}
```

**Using the EC2 Module:**

<!-- hack to fix hcl rendering issue -->
```python
# main.tf (root module)

module "vpc" {
  source = "./modules/vpc"

  environment = "production"
  vpc_cidr    = "10.0.0.0/16"
}

module "web_servers" {
  source = "./modules/ec2"

  environment = "production"
  name        = "web"

  instance_count = 3
  instance_type  = "t3.small"
  ami_id         = "ami-0c55b159cbfafe1f0"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.public_subnet_ids

  key_name = "my-key-pair"

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y httpd
              systemctl start httpd
              systemctl enable httpd
              EOF

  root_volume_size  = 30
  enable_monitoring = true

  tags = {
    Role = "WebServer"
  }
}

# Add HTTP access to web servers
resource "aws_security_group_rule" "web_http" {
  type              = "ingress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = module.web_servers.security_group_id
}

output "web_server_ips" {
  value = module.web_servers.public_ips
}
```

## Using Public Modules

### Terraform Registry

The [Terraform Registry](https://registry.terraform.io/) hosts thousands of publicly available modules.

```
┌────────────────────────────────────────────────────────────┐
│                  TERRAFORM REGISTRY                        │
└────────────────────────────────────────────────────────────┘

registry.terraform.io
  │
  ├─ Verified Modules (official partners)
  │   ├─ terraform-aws-modules/*    (AWS)
  │   ├─ Azure/*                    (Azure)
  │   └─ terraform-google-modules/* (GCP)
  │
  ├─ Community Modules
  │   └─ User-contributed modules
  │
  └─ Private Registry (Terraform Cloud/Enterprise)
      └─ Organization-specific modules
```

### Finding and Using Registry Modules

**1. Browse the Registry:**
- Visit https://registry.terraform.io/
- Search for module type (e.g., "AWS VPC", "Azure VM")
- Filter by provider (aws, azurerm, google)
- Check verification status (verified = official)

**2. Review Documentation:**
```
Module Page Contains:
  ├─ README with examples
  ├─ Input variables (required and optional)
  ├─ Output values
  ├─ Dependencies
  ├─ Versions
  └─ Example usage
```

**3. Use in Your Configuration:**

```hcl
# Terraform Registry module syntax:
# source = "NAMESPACE/NAME/PROVIDER"

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.2"

  name = "my-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  enable_vpn_gateway = false

  tags = {
    Environment = "production"
  }
}
```

### Popular AWS Modules

**VPC Module:**

<!-- hack to fix hcl rendering issue -->
```python
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "my-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway   = false
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Environment = "production"
  }
}

# Outputs available:
# - module.vpc.vpc_id
# - module.vpc.private_subnets
# - module.vpc.public_subnets
# - module.vpc.nat_public_ips
# - and many more...
```

**EC2 Instance Module:**

<!-- hack to fix hcl rendering issue -->
```python
module "ec2_instance" {
  source  = "terraform-aws-modules/ec2-instance/aws"
  version = "~> 5.0"

  name = "my-instance"

  ami                    = "ami-0c55b159cbfafe1f0"
  instance_type          = "t3.micro"
  key_name               = "my-key"
  monitoring             = true
  vpc_security_group_ids = [module.security_group.security_group_id]
  subnet_id              = module.vpc.private_subnets[0]

  tags = {
    Environment = "production"
  }
}

# Outputs available:
# - module.ec2_instance.id
# - module.ec2_instance.arn
# - module.ec2_instance.private_ip
# - module.ec2_instance.public_ip
```

**S3 Bucket Module:**

<!-- hack to fix hcl rendering issue -->
```python
module "s3_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 3.0"

  bucket = "my-unique-bucket-name"

  # Block public access
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  # Versioning
  versioning = {
    enabled = true
  }

  # Server-side encryption
  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  tags = {
    Environment = "production"
  }
}

# Outputs available:
# - module.s3_bucket.s3_bucket_id
# - module.s3_bucket.s3_bucket_arn
# - module.s3_bucket.s3_bucket_region
```

**Security Group Module:**

<!-- hack to fix hcl rendering issue -->
```python
module "security_group" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name        = "web-server-sg"
  description = "Security group for web servers"
  vpc_id      = module.vpc.vpc_id

  # Ingress rules
  ingress_with_cidr_blocks = [
    {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      description = "HTTP"
      cidr_blocks = "0.0.0.0/0"
    },
    {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      description = "HTTPS"
      cidr_blocks = "0.0.0.0/0"
    },
  ]

  # Egress rules
  egress_rules = ["all-all"]

  tags = {
    Environment = "production"
  }
}

# Outputs available:
# - module.security_group.security_group_id
# - module.security_group.security_group_name
```

**RDS Module:**

<!-- hack to fix hcl rendering issue -->
```python
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier = "mydb"

  engine            = "mysql"
  engine_version    = "8.0"
  instance_class    = "db.t3.small"
  allocated_storage = 20

  db_name  = "mydb"
  username = "admin"
  port     = 3306

  # Network
  vpc_security_group_ids = [module.security_group_db.security_group_id]
  db_subnet_group_name   = module.vpc.database_subnet_group

  # Backup
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  # Encryption
  storage_encrypted = true

  # Multi-AZ
  multi_az = true

  tags = {
    Environment = "production"
  }
}

# Outputs available:
# - module.rds.db_instance_endpoint
# - module.rds.db_instance_arn
# - module.rds.db_instance_id
```

### Complete Example: Multi-Tier Application

<!-- hack to fix hcl rendering issue -->
```python
# main.tf - Complete application using public modules

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# VPC
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.environment}-vpc"
  cidr = "10.0.0.0/16"

  azs              = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets   = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  database_subnets = ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway   = false
  enable_dns_hostnames = true

  create_database_subnet_group = true

  tags = {
    Environment = var.environment
  }
}

# Web Server Security Group
module "web_sg" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name        = "${var.environment}-web-sg"
  description = "Security group for web servers"
  vpc_id      = module.vpc.vpc_id

  ingress_with_cidr_blocks = [
    {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = "0.0.0.0/0"
    },
    {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = "0.0.0.0/0"
    },
  ]

  egress_rules = ["all-all"]
}

# Database Security Group
module "db_sg" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name        = "${var.environment}-db-sg"
  description = "Security group for database"
  vpc_id      = module.vpc.vpc_id

  ingress_with_source_security_group_id = [
    {
      from_port                = 3306
      to_port                  = 3306
      protocol                 = "tcp"
      description              = "MySQL from web servers"
      source_security_group_id = module.web_sg.security_group_id
    },
  ]

  egress_rules = ["all-all"]
}

# Web Servers
module "web_servers" {
  source  = "terraform-aws-modules/ec2-instance/aws"
  version = "~> 5.0"

  count = 2

  name = "${var.environment}-web-${count.index + 1}"

  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = "t3.small"
  vpc_security_group_ids = [module.web_sg.security_group_id]
  subnet_id              = module.vpc.public_subnets[count.index % length(module.vpc.public_subnets)]

  user_data = file("${path.module}/user-data.sh")

  tags = {
    Environment = var.environment
    Role        = "WebServer"
  }
}

# Application Load Balancer
module "alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 9.0"

  name = "${var.environment}-alb"

  load_balancer_type = "application"
  vpc_id             = module.vpc.vpc_id
  subnets            = module.vpc.public_subnets
  security_groups    = [module.web_sg.security_group_id]

  target_groups = [
    {
      name_prefix      = "web-"
      backend_protocol = "HTTP"
      backend_port     = 80
      target_type      = "instance"
      targets = {
        for idx, instance in module.web_servers : idx => {
          target_id = instance.id
          port      = 80
        }
      }
    }
  ]

  http_tcp_listeners = [
    {
      port               = 80
      protocol           = "HTTP"
      target_group_index = 0
    }
  ]

  tags = {
    Environment = var.environment
  }
}

# RDS Database
module "db" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier = "${var.environment}-db"

  engine            = "mysql"
  engine_version    = "8.0"
  instance_class    = "db.t3.small"
  allocated_storage = 20

  db_name  = "myapp"
  username = "admin"
  password = var.db_password
  port     = 3306

  vpc_security_group_ids = [module.db_sg.security_group_id]
  db_subnet_group_name   = module.vpc.database_subnet_group

  backup_retention_period = 7
  storage_encrypted       = true
  multi_az                = true

  tags = {
    Environment = var.environment
  }
}

# S3 Bucket for static assets
module "s3_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 3.0"

  bucket = "${var.environment}-myapp-assets"

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  versioning = {
    enabled = true
  }

  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  tags = {
    Environment = var.environment
  }
}

# Data source for Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# Outputs
output "alb_dns_name" {
  description = "DNS name of the load balancer"
  value       = module.alb.lb_dns_name
}

output "db_endpoint" {
  description = "Database connection endpoint"
  value       = module.db.db_instance_endpoint
  sensitive   = true
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = module.s3_bucket.s3_bucket_id
}
```

## Best Practices

### 1. Module Organization

```
┌────────────────────────────────────────────────────────────┐
│                MODULE ORGANIZATION                         │
└────────────────────────────────────────────────────────────┘

✓ DO:
  ├─ One module = One logical component
  ├─ Clear, descriptive module names
  ├─ Consistent file structure
  └─ Comprehensive documentation

✗ DON'T:
  ├─ Mix unrelated resources
  ├─ Create overly complex modules
  ├─ Hard-code values
  └─ Skip documentation
```

### 2. Input Variables

```hcl
variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Must be dev, staging, or prod."
  }
}
```

```
✓ DO:
  - Use descriptive variable names
  - Add descriptions to all variables
  - Set sensible defaults where appropriate
  - Use validation blocks
  - Document valid values

✗ DON'T:
  - Use vague names (var.x, var.config)
  - Skip descriptions
  - Require unnecessary inputs
  - Use overly complex types
```

### 3. Output Values

```hcl
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "db_password" {
  description = "Database password"
  value       = random_password.db.result
  sensitive   = true
}
```

```
✓ DO:
  - Output useful values
  - Add descriptions
  - Mark sensitive outputs
  - Use consistent naming

✗ DON'T:
  - Output everything
  - Skip descriptions
  - Expose sensitive data without marking
```

### 4. Module Versioning

```
┌────────────────────────────────────────────────────────────┐
│                  MODULE VERSIONING                         │
└────────────────────────────────────────────────────────────┘

Semantic Versioning: MAJOR.MINOR.PATCH

MAJOR (1.0.0 → 2.0.0)
  - Breaking changes
  - Incompatible API changes
  - Require code updates

MINOR (1.0.0 → 1.1.0)
  - New features
  - Backwards compatible
  - No breaking changes

PATCH (1.0.0 → 1.0.1)
  - Bug fixes
  - Backwards compatible
  - No new features

Version Constraints:
  version = "1.0.0"          # Exact version
  version = "~> 1.0"         # 1.x (but not 2.0)
  version = ">= 1.0"         # 1.0 or higher
  version = ">= 1.0, < 2.0"  # Range
```

### 5. Documentation

```markdown
# Module: VPC

Creates a VPC with public and private subnets across multiple AZs.

## Features
- Multi-AZ deployment
- Public and private subnets
- NAT Gateway for private subnet internet access
- Optional single NAT Gateway for cost savings

## Usage

```hcl
module "vpc" {
  source = "./modules/vpc"

  environment     = "production"
  vpc_cidr        = "10.0.0.0/16"
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.11.0/24", "10.0.12.0/24"]
}
```

#### Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|----------|
| environment | Environment name | string | - | yes |
| vpc_cidr | VPC CIDR block | string | "10.0.0.0/16" | no |

#### Outputs

| Name | Description |
|------|-------------|
| vpc_id | ID of the VPC |
| public_subnet_ids | List of public subnet IDs |

### 6. Testing Modules

```
┌────────────────────────────────────────────────────────────┐
│                   MODULE TESTING                           │
└────────────────────────────────────────────────────────────┘

1. Manual Testing
   ├─ Create examples/ directory
   ├─ Add example configurations
   └─ Test with terraform plan/apply

2. Automated Testing
   ├─ Use Terratest (Go)
   ├─ Use kitchen-terraform (Ruby)
   └─ Use terraform test (native)

3. Validation
   ├─ terraform validate
   ├─ terraform fmt -check
   ├─ tflint
   └─ checkov / tfsec (security)
```

### 7. Module Structure Example

```
modules/vpc/
├─ main.tf              # Primary resources
├─ variables.tf         # Input variables
├─ outputs.tf           # Output values
├─ versions.tf          # Provider requirements
├─ README.md            # Documentation
├─ CHANGELOG.md         # Version history
├─ LICENSE              # License file
│
├─ examples/            # Usage examples
│  ├─ basic/
│  │  ├─ main.tf
│  │  └─ outputs.tf
│  └─ complete/
│     ├─ main.tf
│     └─ outputs.tf
│
└─ tests/               # Automated tests
   ├─ vpc_test.go
   └─ fixtures/
```

### 8. Common Pitfalls to Avoid

```
┌────────────────────────────────────────────────────────────┐
│                    COMMON PITFALLS                         │
└────────────────────────────────────────────────────────────┘

1. Hard-coding values
   ✗ region = "us-east-1"
   ✓ region = var.region

2. Not using outputs
   ✗ Manually copying resource IDs
   ✓ Reference via module outputs

3. Circular dependencies
   ✗ Module A depends on Module B, Module B depends on A
   ✓ Proper dependency hierarchy

4. Overly complex modules
   ✗ 1000-line module doing everything
   ✓ Smaller, focused modules

5. No version pinning
   ✗ source = "..." (no version)
   ✓ version = "~> 1.0"

6. Ignoring state
   ✗ Sharing state files
   ✓ Remote state with locking

7. Poor naming
   ✗ module "m1" { ... }
   ✓ module "vpc_production" { ... }

8. Missing validation
   ✗ No input validation
   ✓ validation blocks on variables
```

## Summary

```
┌────────────────────────────────────────────────────────────┐
│                  MODULES CHEAT SHEET                       │
└────────────────────────────────────────────────────────────┘

MODULE TYPES:
  Root Module    → Main working directory
  Child Module   → Called by other modules
  Public Module  → From Terraform Registry

CALLING MODULES:
  module "name" {
    source  = "./path" or "registry/module"
    version = "~> 1.0"

    # Input variables
    var1 = value1
    var2 = value2
  }

ACCESSING OUTPUTS:
  module.<module_name>.<output_name>

PROVIDER INHERITANCE:
  Default providers    → Automatically inherited
  Aliased providers    → Must explicitly pass

  providers = {
    aws = aws.primary
  }

BEST PRACTICES:
  ✓ Single responsibility per module
  ✓ Clear input/output interfaces
  ✓ Comprehensive documentation
  ✓ Version pinning for stability
  ✓ Input validation
  ✓ Sensible defaults
  ✓ Testing and examples

FILE STRUCTURE:
  modules/
  └─ my-module/
     ├─ main.tf
     ├─ variables.tf
     ├─ outputs.tf
     ├─ versions.tf
     └─ README.md
```

