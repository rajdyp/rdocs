---
title: Configuration Basics
linkTitle: Configuration Basics
type: docs
weight: 3
prev: /terraform/02-workflow-and-cli
next: /terraform/04-resources-and-meta-arguments
---

## HashiCorp Configuration Language (HCL)

HCL is Terraform's configuration language - designed to be both human-readable and machine-friendly.

### Basic Syntax Structure

<!-- hack to fix hcl rendering issue -->
```python
# Basic block syntax
<BLOCK_TYPE> "<BLOCK_LABEL>" "<BLOCK_LABEL>" {
  # Block body
  <IDENTIFIER> = <EXPRESSION>  # Argument
}
```

### Example Configuration

```hcl
# Terraform configuration example
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  # arguments with map/object value (uses =)
  tags = {
    Name = "WebServer"
  }
}
```

**Breakdown:**
- `resource` - Block type
- `"aws_instance"` - First label (resource type)
- `"web"` - Second label (resource name)
- `ami`, `instance_type` - Arguments
- `tags` - Argument with map value
- `{ }` - Block body

### HCL Syntax Elements

```
┌──────────────────────────────────────────────────────────────┐
│                    HCL SYNTAX ELEMENTS                       │
└──────────────────────────────────────────────────────────────┘

1. BLOCKS
   ┌─────────────────────────────┐
   │ resource "aws_instance" "x" │ ← Block Type + Labels
   │ {                           │
   │   ami = "ami-123"           │ ← Arguments
   │                             │
   │   nested_block {            │ ← Nested Block (no =)
   │     key = "value"           │
   │   }                         │
   │ }                           │
   └─────────────────────────────┘

2. ARGUMENTS
   identifier = expression
   ↑            ↑
   Key          Value

3. EXPRESSIONS
   - Literal values:    "hello", 42, true
   - References:        var.name, aws_instance.web.id
   - Operators:         2 + 2, a == b
   - Function calls:    max(5, 12, 9)
   - Conditionals:      condition ? true_val : false_val

4. COMMENTS
   # Single line comment
   // Also single line
   /* Multi-line
      comment */
```

## Terraform Block

The `terraform` block configures Terraform's own behavior.

```
┌──────────────────────────────────────────────────────────────┐
│                    TERRAFORM BLOCK                           │
└──────────────────────────────────────────────────────────────┘

terraform {
  ├─ required_version     (Terraform version constraint)
  ├─ required_providers   (Provider requirements)
  ├─ backend              (State storage configuration)
  └─ cloud                (Terraform Cloud/Enterprise config)
}
```

### Complete Terraform Block Example

<!-- hack to fix hcl rendering issue -->
```python
terraform {
  # Require minimum Terraform version
  required_version = ">= 1.2.0"

  # Specify required providers
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  # Configure backend for state storage
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
```

### Version Constraints

Version constraints control which versions of Terraform and providers can be used.

```bash
# Version constraint operators

">= 1.2.0"       # Greater than or equal to 1.2.0
"<= 1.5.0"       # Less than or equal to 1.5.0
"~> 1.2"         # Any version in 1.x range (>= 1.2.0, < 2.0.0)
"~> 1.2.0"       # Any version in 1.2.x range (>= 1.2.0, < 1.3.0)
"!= 1.3.0"       # Any version except 1.3.0
">= 1.0, < 2.0"  # Multiple constraints (AND)
```

**Pessimistic Constraint (~>) Explained:**

```
┌────────────────────────────────────────────────────────────┐
│         PESSIMISTIC CONSTRAINT OPERATOR (~>)               │
└────────────────────────────────────────────────────────────┘

"~> 1.2"
  ↓
  Allows: 1.2.0, 1.2.1, 1.3.0, 1.4.0, 1.9.9
  Blocks: 2.0.0, 2.1.0

  Rule: Increment rightmost specified version component


"~> 1.2.0"
  ↓
  Allows: 1.2.0, 1.2.1, 1.2.9
  Blocks: 1.3.0, 1.4.0, 2.0.0

  Rule: More specific = tighter constraint
```

### Backend Configuration

The backend determines where Terraform stores its state file.

```hcl
# Local Backend (default)
# State stored in local file: terraform.tfstate
terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
}

# S3 Backend (recommended for teams)
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "path/to/my/key"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"  # For state locking
  }
}

# Terraform Cloud
terraform {
  cloud {
    organization = "my-org"

    workspaces {
      name = "my-workspace"
    }
  }
}
```

**Important Backend Notes:**

⚠️ **Backend configuration does NOT support variables or expressions**

```hcl
# ❌ WRONG - Variables not allowed
terraform {
  backend "s3" {
    bucket = var.state_bucket  # ERROR!
  }
}

# ✅ CORRECT - Use -backend-config flag instead
# terraform.tf
terraform {
  backend "s3" {}
}

# Command line:
# terraform init -backend-config="bucket=my-bucket"
```

**Why?** Backend is processed before Terraform loads variables.

**Workaround:**
```hcl
# Use partial configuration in terraform block
terraform {
  backend "s3" {}
}

# Create backend.hcl
bucket         = "my-terraform-state"
key            = "prod/terraform.tfstate"
region         = "us-east-1"
dynamodb_table = "terraform-locks"

# Initialize with backend config file
terraform init -backend-config=backend.hcl
```

## Providers

Providers are plugins that enable Terraform to interact with cloud platforms, SaaS providers, and other APIs.

```
┌──────────────────────────────────────────────────────────────┐
│                    PROVIDER ARCHITECTURE                     │
└──────────────────────────────────────────────────────────────┘

Terraform Core
      │
      ├─── AWS Provider ────────> AWS API
      │         │
      │         └── Resources: aws_instance, aws_s3_bucket, etc.
      │
      ├─── Azure Provider ──────> Azure API
      │         │
      │         └── Resources: azurerm_vm, azurerm_storage, etc.
      │
      └─── GCP Provider ────────> Google Cloud API
                │
                └── Resources: google_compute_instance, etc.
```

### Provider Configuration

```hcl
# Basic provider configuration
provider "aws" {
  region = "us-east-1"
}

# Provider with credentials
provider "aws" {
  region     = "us-east-1"
  access_key = "AKIA..."   # Not recommended - use env vars or IAM roles
  secret_key = "..."       # Not recommended
}

# Recommended: Use shared credentials file
provider "aws" {
  region                   = "us-east-1"
  shared_credentials_files = ["~/.aws/credentials"]
  profile                  = "default"
}

# Best: Use environment variables or IAM roles
# AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
# or EC2 Instance Profile / ECS Task Role
provider "aws" {
  region = "us-east-1"
  # Credentials automatically detected
}
```

### Multiple Provider Configurations (Aliases)

Use aliases when you need multiple configurations of the same provider.

**Common Use Cases:**
- **Multi-region deployments** - Deploy resources across different AWS regions
- **Disaster recovery** - Replicate infrastructure in backup regions
- **Multi-account** - Manage resources across different AWS accounts
- **Cross-region dependencies** - Create resources that span regions (e.g., CloudFront + S3)

```hcl
# Primary region (default provider)
provider "aws" {
  region = "us-east-1"  # Region is required for AWS provider
}

# Disaster recovery region (aliased provider)
provider "aws" {
  alias  = "west"
  region = "us-west-2"  # Different region for DR
}

# This creates an EC2 instance in us-east-1
resource "aws_instance" "primary" {
  # Uses default provider (us-east-1)
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name = "Primary-Instance"
  }
}

# This creates a SEPARATE EC2 instance in us-west-2
resource "aws_instance" "dr" {
  # Uses aliased provider (us-west-2)
  provider      = aws.west
  ami           = "ami-0d1cd67c26f5fca19"
  instance_type = "t2.micro"

  tags = {
    Name = "DR-Instance"
  }
}
```

**How It Works:**

1. **Default Provider**: The first provider without an `alias` becomes the default
   - Resources without explicit `provider` argument use this one
   - In this example: `us-east-1`

2. **Aliased Provider**: Use `alias` to create additional provider configurations
   - Format: `alias = "name"`
   - Reference it in resources as: `provider = aws.alias_name`

3. **Resource Assignment**:
   - `aws_instance.primary` → Uses default provider (us-east-1)
   - `aws_instance.dr` → Explicitly uses `aws.west` (us-west-2)

**Important Notes:**
- You can have only **one default provider** (no alias) per provider type
- You can have **multiple aliased providers**
- Alias names must be unique within the same provider type
- When using modules, you must explicitly pass provider configurations

**About the `region` argument:**
- For AWS provider, `region` is **required** (either in config or via environment variable)
- Can be set via: provider config, `AWS_REGION` env var, or AWS config file
- If omitted from provider block, Terraform will look for `AWS_REGION` or `AWS_DEFAULT_REGION` env var
- Different providers have different required arguments (check provider documentation)

### Common Providers

| Provider | Source | Use Case |
|----------|--------|----------|
| AWS | `hashicorp/aws` | Amazon Web Services resources |
| Azure | `hashicorp/azurerm` | Microsoft Azure resources |
| GCP | `hashicorp/google` | Google Cloud Platform |
| Kubernetes | `hashicorp/kubernetes` | Kubernetes clusters |
| Docker | `kreuzwerker/docker` | Docker containers |
| GitHub | `integrations/github` | GitHub repositories, teams |
| Random | `hashicorp/random` | Random values generation |
| Null | `hashicorp/null` | Testing and debugging |

### Provider Version Locking

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"  # Lock to 5.x
    }
  }
}

provider "aws" {
  region = "us-east-1"
}
```

After `terraform init`, this creates `.terraform.lock.hcl`:

```hcl
provider "registry.terraform.io/hashicorp/aws" {
  version     = "5.84.0"
  constraints = "~> 5.0"
  hashes = [
    "h1:abc123...",
    "zh:def456...",
  ]
}
```

## Resources Fundamentals

Resources are the most important element in Terraform - they represent infrastructure objects.

### Resource Syntax

<!-- hack to fix hcl rendering issue -->
```python
resource "<PROVIDER>_<TYPE>" "<NAME>" {
  # Configuration arguments
  <ARGUMENT> = <VALUE>

  # Nested blocks
  <NESTED_BLOCK> {
    <ARGUMENT> = <VALUE>
  }
}
```

### Resource Examples

```hcl
# AWS EC2 Instance
resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name = "WebServer"
  }
}

# AWS S3 Bucket
resource "aws_s3_bucket" "data" {
  bucket = "my-data-bucket-12345"
}

# AWS Security Group
resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Security group for web servers"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

### Resource Addressing

Every resource has a unique address that combines its type and name.

```
┌────────────────────────────────────────────────────────────┐
│                  RESOURCE ADDRESSING                       │
└────────────────────────────────────────────────────────────┘

resource "aws_instance" "web_server" { ... }
         ↑                ↑
         │                │
    Resource Type    Resource Name

Full Address: aws_instance.web_server
```

**Using resource addresses:**

```hcl
# Create an EC2 instance
resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}

# Create an Elastic IP
resource "aws_eip" "web_ip" {
  domain = "vpc"
}

# Associate the EIP with the instance
resource "aws_eip_association" "web_eip_assoc" {
  instance_id   = aws_instance.web_server.id   # ← Reference instance address
  allocation_id = aws_eip.web_ip.id            # ← Reference EIP address
}

# Output the instance's public IP after apply
output "instance_ip" {
  value = aws_instance.web_server.public_ip    # ← Reference resource attribute
}
```

**In CLI commands:**
```bash
# Show resource details
terraform state show aws_instance.web_server

# Destroy specific resource
terraform destroy -target=aws_instance.web_server

# Taint a resource (mark for recreation)
terraform taint aws_instance.web_server
```

### Resource Dependencies

Terraform automatically handles dependencies based on references:

```hcl
# VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

# Subnet (depends on VPC)
resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id  # ← Creates implicit dependency
  cidr_block = "10.0.1.0/24"
}

# Instance (depends on Subnet)
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.public.id  # ← Implicit dependency
}
```

**Dependency Graph:**

```
┌─────────────────────────────────────────────────────────┐
│              RESOURCE DEPENDENCY GRAPH                  │
└─────────────────────────────────────────────────────────┘

     aws_vpc.main
          │
          │ (vpc_id reference)
          ▼
   aws_subnet.public
          │
          │ (subnet_id reference)
          ▼
   aws_instance.web

Creation Order:
  1. aws_vpc.main
  2. aws_subnet.public
  3. aws_instance.web

Destruction Order (reverse):
  1. aws_instance.web
  2. aws_subnet.public
  3. aws_vpc.main
```

### Resource Attributes

Every resource has attributes you can reference. There are two types:

1. **Input attributes** - Arguments you define in the configuration
2. **Computed attributes** - Values automatically created by the provider after resource creation

<!-- hack to fix hcl rendering issue -->
```python
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"   # ← Input attribute (you provide)
  instance_type = "t2.micro"                # ← Input attribute (you provide)
}

# Reference computed attributes (created by AWS after instance is launched)
output "instance_ip" {
  value = aws_instance.web.public_ip  # ← Computed attribute
}

output "instance_id" {
  value = aws_instance.web.id         # ← Computed attribute
}

# Common computed attributes for aws_instance:
# aws_instance.web.id                  - Instance ID (e.g., "i-1234567890abcdef0")
# aws_instance.web.public_ip           - Public IP address
# aws_instance.web.private_ip          - Private IP address
# aws_instance.web.arn                 - Amazon Resource Name
# aws_instance.web.availability_zone   - AZ where instance is running
```

**Key Points:**
- You **cannot know** computed attribute values until `terraform apply` runs
- Computed attributes are read-only (you can't set them manually)
- Each resource type has different computed attributes (check provider docs)

## Comments and Code Style

### Comment Styles

<!-- hack to fix hcl rendering issue -->
```python
# Single-line comment (most common)

// Alternative single-line comment

/*
  Multi-line comment
  Useful for larger blocks
*/

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"  # Inline comment
  instance_type = "t2.micro"
}
```

### Formatting Best Practices

Terraform provides `terraform fmt` to automatically format code:

```bash
# Format current directory
terraform fmt

# Format recursively
terraform fmt -recursive

# Check if files are formatted (useful in CI/CD)
terraform fmt -check
```

### Style Guide

```hcl
# ✅ GOOD PRACTICES

# 1. Align equals signs
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  #            ↑
  #            Aligned
}

# 2. Blank lines between blocks
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}
# ← Blank line
resource "aws_subnet" "public" {
  vpc_id = aws_vpc.main.id
}

# 3. Use descriptive names
resource "aws_instance" "web_server" {  # ✅ Descriptive
  # not:
  # resource "aws_instance" "x" {      # ❌ Too short
}

# 4. Group related arguments
resource "aws_instance" "web" {
  # Instance configuration
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  # Network configuration
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]

  # Tags
  tags = {
    Name = "WebServer"
  }
}
```

## File Organization

### Standard File Structure

```
project/
├── main.tf          # Primary resource definitions
├── variables.tf     # Variable declarations
├── outputs.tf       # Output definitions
├── providers.tf     # Provider configurations
├── versions.tf      # Version constraints
├── terraform.tfvars # Variable values (don't commit if sensitive!)
└── README.md        # Documentation
```

### File Purpose

| File | Purpose | Example Content |
|------|---------|-----------------|
| `main.tf` | Primary configuration | Resources, data sources |
| `variables.tf` | Variable declarations | `variable "instance_type" { }` |
| `outputs.tf` | Output values | `output "instance_ip" { }` |
| `providers.tf` | Provider config | `provider "aws" { }` |
| `versions.tf` | Version constraints | `terraform { required_version... }` |
| `terraform.tfvars` | Variable values | `instance_type = "t2.large"` |

### Example Files

**versions.tf:**
<!-- hack to fix hcl rendering issue -->
```python
terraform {
  required_version = ">= 1.2.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
```

**providers.tf:**
```hcl
provider "aws" {
  region = var.aws_region
}
```

**variables.tf:**
```hcl
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}
```

**main.tf:**
```hcl
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  tags = {
    Name = "WebServer"
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]  # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
}
```

**outputs.tf:**
```hcl
output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.web.id
}

output "instance_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.web.public_ip
}
```

**terraform.tfvars:**
```hcl
aws_region    = "us-west-2"
instance_type = "t2.small"
```

### Alternative: Single-File Configuration

For small projects, a single `main.tf` is acceptable:

<!-- hack to fix hcl rendering issue -->
```python
# main.tf (everything in one file)

terraform {
  required_version = ">= 1.2.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

variable "instance_type" {
  default = "t2.micro"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_type
}

output "instance_ip" {
  value = aws_instance.web.public_ip
}
```

### Modular Organization (Large Projects)

```
project/
├── modules/
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── compute/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── database/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   ├── staging/
│   │   └── ...
│   └── prod/
│       └── ...
├── main.tf
├── variables.tf
└── outputs.tf
```

## Configuration Syntax

### Argument Syntax

```hcl
# Simple assignment
name = "web-server"

# List
availability_zones = ["us-east-1a", "us-east-1b"]

# Map
tags = {
  Name        = "WebServer"
  Environment = "Production"
}

# Boolean
enable_monitoring = true

# Number
count = 3
```

### Block Syntax

```hcl
# Block with labels
resource "aws_instance" "web" {
  ami = "ami-123"
}

# Nested blocks
resource "aws_security_group" "web" {
  name = "web-sg"

  # Nested block
  ingress {
    from_port = 80
    to_port   = 80
    protocol  = "tcp"
  }

  # Multiple nested blocks
  ingress {
    from_port = 443
    to_port   = 443
    protocol  = "tcp"
  }
}
```

### Object and Map Syntax

Two important complex types for structuring data:

```hcl
# Map (string keys and values - all same type)
variable "tags" {
  type = map(string)
  default = {
    "Environment" = "dev"
    "Team"        = "engineering"
  }
}

# Object (structured with different types)
variable "instance_config" {
  type = object({
    instance_type = string
    ami           = string
    monitoring    = bool
  })

  default = {
    instance_type = "t2.micro"
    ami           = "ami-123"
    monitoring    = true
  }
}
```

**Quick Comparison:**

- **Map**: Flexible keys, all values same type → Use for tags, labels, dynamic data
- **Object**: Fixed keys, different value types → Use for structured configuration

## Complete Configuration Example

Here's a complete, well-organized Terraform configuration:

**versions.tf:**
<!-- hack to fix hcl rendering issue -->
```python
terraform {
  required_version = ">= 1.2.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "web-server/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

**providers.tf:**
```hcl
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      ManagedBy = "Terraform"
      Project   = "WebServer"
    }
  }
}
```

**variables.tf:**
```hcl
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "development"
}
```

**main.tf:**
```hcl
# Get latest Ubuntu AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
}

# Security Group
resource "aws_security_group" "web" {
  name        = "${var.environment}-web-sg"
  description = "Security group for web server"

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-web-sg"
  }
}

# EC2 Instance
resource "aws_instance" "web" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.web.id]

  tags = {
    Name        = "${var.environment}-web-server"
    Environment = var.environment
  }
}
```

**outputs.tf:**
```hcl
output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.web.id
}

output "instance_public_ip" {
  description = "Public IP address"
  value       = aws_instance.web.public_ip
}

output "security_group_id" {
  description = "ID of the security group"
  value       = aws_security_group.web.id
}
```

**terraform.tfvars:**
```hcl
aws_region    = "us-west-2"
instance_type = "t2.small"
environment   = "production"
```

## Key Takeaways

1. **HCL is declarative**: You describe what you want, not how to build it
2. **Terraform block**: Configures Terraform itself (version, providers, backend)
3. **Providers**: Plugins that interact with APIs (AWS, Azure, etc.)
4. **Resources**: The infrastructure objects you create
5. **File organization**: Separate concerns (main, variables, outputs)
6. **Use terraform fmt**: Always format your code
7. **Backend can't use variables**: Use `-backend-config` instead

## Additional Resources

- [Terraform Configuration Language](https://developer.hashicorp.com/terraform/language)
- [HCL Syntax](https://developer.hashicorp.com/terraform/language/syntax/configuration)
- [Provider Configuration](https://developer.hashicorp.com/terraform/language/providers/configuration)
