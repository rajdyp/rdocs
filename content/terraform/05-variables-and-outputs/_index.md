---
title: Variables and Outputs
linkTitle: Variables and Outputs
type: docs
weight: 5
prev: /terraform/04-resources-and-meta-arguments
next: /terraform/06-expressions-and-functions
---

## Introduction to Variables

Variables make Terraform configurations flexible and reusable by avoiding hardcoded values.

```
┌─────────────────────────────────────────────────────────────┐
│                  TERRAFORM VARIABLE FLOW                    │
└─────────────────────────────────────────────────────────────┘

Input Variables          Configuration          Output Values
      ↓                        ↓                       ↓
  var.region    →    resource "..." {    →    output "ip" {
  var.env       →      region = var.region      value = ...
  var.count     →      ...                      }
                      }
```

### Why Use Variables?

Variables provide several critical benefits:

1. **Reusability**: Use the same configuration across multiple environments by changing only variable values
2. **No Code Changes**: Switch between environments without modifying your Terraform code
3. **Single Source of Truth**: Update a value once in variables, and it applies everywhere that variable is used
4. **Team Collaboration**: Different team members can use different values without code conflicts
5. **Security**: Keep sensitive values separate from code (don't commit secrets to git)

<!-- hack to fix hcl rendering issue -->
```python
# Without variables (hardcoded - BAD)
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"  # ❌ Must edit code to change
  instance_type = "t2.micro"               # ❌ Same for all environments

  tags = {
    Environment = "production"             # ❌ Can't reuse for dev/staging
  }
}
# Problem: To deploy to staging, you must edit the code!

# With variables (flexible - GOOD)
resource "aws_instance" "web" {
  ami           = var.ami_id               # ✅ Provide different AMI per environment
  instance_type = var.instance_type        # ✅ t2.micro for dev, t2.large for prod

  tags = {
    Environment = var.environment          # ✅ Set to "dev", "staging", or "prod"
  }
}
# Benefit: Same code works for all environments! Just change variable values.
```

**Real-world example:**
```bash
# Deploy to development
terraform apply -var-file="dev.tfvars"    # Uses: t2.micro, dev environment

# Deploy to production (same code!)
terraform apply -var-file="prod.tfvars"   # Uses: t2.large, prod environment
```

## Input Variables Deep Dive

Input variables are defined using `variable` blocks.

```
┌────────────────────────────────────────────────────────────┐
│                   VARIABLE BLOCK STRUCTURE                 │
└────────────────────────────────────────────────────────────┘

variable "NAME" {
  ├─ type         (optional, recommended)
  ├─ description  (optional, recommended)
  ├─ default      (optional)
  ├─ validation   (optional)
  ├─ sensitive    (optional)
  └─ nullable     (optional)
}
```

### Basic Variable Declaration

```hcl
# variables.tf

# Simple variable with default
variable "instance_type" {
  description = "Type of EC2 instance"
  type        = string
  default     = "t2.micro"
}

# Variable without default (must be provided)
variable "project_name" {
  description = "Name of the project"
  type        = string
}

# Variable with validation
variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "development"

  # Validates that the environment value is one of the allowed options
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}
```

### Referencing Variables

```hcl
# main.tf

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_type  # ← Reference variable

  tags = {
    Name        = "${var.project_name}-web"  # ← String interpolation
    Environment = var.environment
  }
}
```

### Understanding Default Values

Variables with `default` values are **optional**. If you don't provide a value, Terraform uses the default. If you do provide a value, it overrides the default.

**Example variable:**
```hcl
variable "instance_type" {
  type    = string
  default = "t2.micro"  # ← Default value
}
```

**Scenario 1: No value provided → Uses default**
```bash
# Just run terraform apply without providing instance_type
terraform apply

# Terraform uses: instance_type = "t2.micro" (default)
```

**Scenario 2: Custom value provided → Overrides default**
<!-- hack to fix hcl rendering issue -->
```python
# terraform.tfvars
instance_type = "t2.large"  # ← Custom value
```
```bash
terraform apply

# Terraform uses: instance_type = "t2.large" (custom value)
```

**Variables without defaults are required:**
```hcl
variable "project_name" {
  type = string
  # No default - must be provided!
}
```
```bash
terraform apply
# Error: No value for required variable "project_name"
```

This behavior applies to **all variable types**: strings, numbers, lists, maps, objects, etc.

## Variable Type Constraints

Type constraints ensure only valid values are accepted.

```
┌────────────────────────────────────────────────────────────┐
│                     TYPE HIERARCHY                         │
└────────────────────────────────────────────────────────────┘

Types
├─ Primitive Types
│  ├─ string
│  ├─ number
│  └─ bool
│
└─ Complex Types
   ├─ Collection Types
   │  ├─ list(type)
   │  ├─ map(type)
   │  └─ set(type)
   │
   └─ Structural Types
      ├─ object({...})
      └─ tuple([...])
```

### Primitive Types

```hcl
# String
variable "region" {
  type    = string
  default = "us-east-1"
}

# Number
variable "instance_count" {
  type    = number
  default = 3
}

# Boolean
variable "enable_monitoring" {
  type    = bool
  default = true
}
```

### List Type

Ordered collection of values of the same type.

```hcl
# List of strings
variable "availability_zones" {
  type    = list(string)
  default = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

# Using list variable
resource "aws_subnet" "public" {
  count             = length(var.availability_zones)  # length = 3, so creates 3 subnets
  availability_zone = var.availability_zones[count.index]
  cidr_block        = "10.0.${count.index}.0/24"
}
```

**This creates 3 subnets:**
```
Subnet 1 (count.index = 0):
  ├─ Resource name: aws_subnet.public[0]
  ├─ availability_zone: "us-east-1a"
  └─ cidr_block: "10.0.0.0/24"

Subnet 2 (count.index = 1):
  ├─ Resource name: aws_subnet.public[1]
  ├─ availability_zone: "us-east-1b"
  └─ cidr_block: "10.0.1.0/24"

Subnet 3 (count.index = 2):
  ├─ Resource name: aws_subnet.public[2]
  ├─ availability_zone: "us-east-1c"
  └─ cidr_block: "10.0.2.0/24"
```

**How it works:**
- `length(var.availability_zones)` = 3, so `count = 3`
- Terraform loops 3 times with `count.index` = 0, 1, 2
- Each iteration uses the list value at that index
- CIDR blocks auto-increment: 10.0.**0**.0/24, 10.0.**1**.0/24, 10.0.**2**.0/24

```hcl
# List of numbers
variable "allowed_ports" {
  type    = list(number)
  default = [80, 443, 8080]
}
```

### Map Type

Key-value pairs where all values are of the same type.

```hcl
# Map of strings
variable "common_tags" {
  type = map(string)
  default = {
    Owner       = "DevOps"
    ManagedBy   = "Terraform"
    Environment = "Production"
  }
}

# Using map variable
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  tags          = var.common_tags  # ← Apply all tags
}

# Map lookup
variable "instance_types" {
  type = map(string)
  default = {
    dev     = "t2.micro"
    staging = "t2.small"
    prod    = "t2.large"
  }
}

resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_types[var.environment]  # ← Lookup
}
```

### Set Type

An unordered collection of **unique values** of the same type. Sets automatically prevent duplicates and are perfect when order doesn't matter.

<!-- hack to fix hcl rendering issue -->
```python
# Set of bucket names (no duplicates allowed)
variable "bucket_names" {
  type    = set(string)
  default = ["app-logs", "app-backups", "app-artifacts"]
}

resource "aws_s3_bucket" "buckets" {
  for_each = var.bucket_names  # Iterates over each unique bucket name

  bucket = "${each.key}-prod"  # each.key = current bucket name

  tags = {
    Name    = each.key
    Purpose = "Production"
  }
}

# Reference specific bucket
output "backup_bucket_id" {
  value = aws_s3_bucket.buckets["app-backups"].id
}
```

**This creates 3 S3 buckets:**
```
Bucket 1:
  ├─ Resource name: aws_s3_bucket.buckets["app-logs"]
  ├─ Bucket name: app-logs-prod
  └─ Tags: Name=app-logs, Purpose=Production

Bucket 2:
  ├─ Resource name: aws_s3_bucket.buckets["app-backups"]
  ├─ Bucket name: app-backups-prod
  └─ Tags: Name=app-backups, Purpose=Production

Bucket 3:
  ├─ Resource name: aws_s3_bucket.buckets["app-artifacts"]
  ├─ Bucket name: app-artifacts-prod
  └─ Tags: Name=app-artifacts, Purpose=Production
```

**Why use Set instead of List?**
- **Prevents duplicates**: `["app-logs", "app-logs"]` automatically becomes `["app-logs"]`
- **Meaningful resource names**: Reference by name: `aws_s3_bucket.buckets["app-backups"]`
- **Safe updates**: Removing "app-logs" doesn't affect other buckets (unlike `count`)

**How `for_each` works with sets:**
- `for_each` loops through each unique element in the set
- `each.key` = the element value (e.g., "app-logs", "app-backups")
- `each.value` = same as `each.key` for sets
- Creates one resource per set element

**Key difference from `count`:**
<!-- hack to fix hcl rendering issue -->
```python
# With count (numeric indexes) - FRAGILE
aws_s3_bucket.buckets[0]  # app-logs
aws_s3_bucket.buckets[1]  # app-backups
aws_s3_bucket.buckets[2]  # app-artifacts
# Problem: Remove [1] → [2] shifts to [1] → bucket destroyed & recreated!

# With for_each on set (value-based keys) - SAFE
aws_s3_bucket.buckets["app-logs"]
aws_s3_bucket.buckets["app-backups"]
aws_s3_bucket.buckets["app-artifacts"]
# Benefit: Remove "app-backups" → only that bucket removed, others untouched
```

### Object Type

Structured data with specific schema.

```hcl
# Object with fixed schema
variable "instance_config" {
  type = object({
    instance_type = string
    ami           = string
    monitoring    = bool
    volume_size   = number
  })

  default = {
    instance_type = "t2.micro"
    ami           = "ami-0c55b159cbfafe1f0"
    monitoring    = true
    volume_size   = 20
  }
}

# Using object variable
resource "aws_instance" "web" {
  ami           = var.instance_config.ami
  instance_type = var.instance_config.instance_type
  monitoring    = var.instance_config.monitoring

  root_block_device {
    volume_size = var.instance_config.volume_size
  }
}
```

### Map vs Object - When to Use Which?

Understanding the difference between maps and objects is crucial for effective Terraform variable design.

| Type | Use Case | Keys | Value Types | Example |
|------|----------|------|-------------|---------|
| **Map** | Dynamic, arbitrary key-value pairs | Any string | All same type | Tags, labels, environment variables |
| **Object** | Fixed structure with specific fields | Predefined | Can be different types | Configuration blocks, structured data |

**Why Map is flexible:**

<!-- hack to fix hcl rendering issue -->
```python
# Map variable definition
variable "tags" {
  type = map(string)
  default = { ... }
}

# Usage in dev environment - terraform.tfvars
tags = {
  Environment = "dev"
  Team        = "backend"
}

resource "aws_instance" "dev" {
  ami           = "ami-123"
  instance_type = "t2.micro"
  tags          = var.tags  # ✅ Works! 2 tags
}

# Usage in prod environment - terraform.tfvars
tags = {
  Environment = "prod"
  Owner       = "john"
  CostCenter  = "12345"
  Application = "web"
}

resource "aws_instance" "prod" {
  ami           = "ami-123"
  instance_type = "t2.micro"
  tags          = var.tags  # ✅ Works! 4 different tags
}

# Both valid! Different keys, different number of entries - all allowed
```

**Why Object is strict:**

```hcl
# Object variable definition
variable "instance_config" {
  type = object({
    instance_type = string
    ami           = string
    monitoring    = bool
  })
  default = { ... }
}

# Usage - terraform.tfvars
instance_config = {
  instance_type = "t2.micro"  # ✅ Required
  ami           = "ami-123"   # ✅ Required
  monitoring    = true        # ✅ Required
}

resource "aws_instance" "app" {
  ami           = var.instance_config.ami
  instance_type = var.instance_config.instance_type
  monitoring    = var.instance_config.monitoring
}
# ✅ All three fields provided

# This would FAIL - terraform.tfvars
instance_config = {
  instance_type = "t2.micro"
  # ❌ Missing ami and monitoring - ERROR!
}

# This would also FAIL - terraform.tfvars
instance_config = {
  instance_type = "t2.micro"
  ami           = "ami-123"
  monitoring    = true
  extra_field   = "value"  # ❌ Extra field not in schema - ERROR!
}
```

**Key Differences:**

1. **Map**:
   - Flexible keys (can be any name)
   - All values must be the same type
   - Great for tags, labels, or dynamic data
   - Example: `map(string)`, `map(number)`

2. **Object**:
   - Fixed keys (defined in the schema)
   - Each field can have a different type
   - Great for structured configuration
   - Schema enforces required fields

### Tuple Type

Fixed-length collection where each element has its own specific type.

```hcl
# Tuple with mixed types
variable "network_config" {
  type    = tuple([string, number, bool])
  default = ["10.0.0.0/16", 3, true]
  # [0] = VPC CIDR (string)
  # [1] = Subnet count (number)
  # [2] = Enable DNS (bool)
}

# Accessing tuple elements
locals {
  vpc_cidr     = var.network_config[0]
  subnet_count = var.network_config[1]
  enable_dns   = var.network_config[2]
}
```

### The "any" Type

Placeholder when the type is not yet determined.

<!-- hack to fix hcl rendering issue -->
```python
# Using "any" type
variable "custom_config" {
  type        = any
  description = "Flexible configuration (not recommended)"
}

# Type is determined by the value provided:
# custom_config = "string"     → string
# custom_config = 123          → number
# custom_config = ["a", "b"]   → list
# custom_config = {key="val"}  → map/object
```

```
⚠️  "any" Type Considerations:

✅  Use when:
   - Building generic modules
   - Type varies based on input

❌  Avoid when:
   - You know the expected type
   - Type safety is important

Better: Use specific types for clarity and validation
```

### Complex Types

You can combine basic types to create more sophisticated data structures. Here are common patterns:

#### 1. Map of Objects

Managing multiple similar resources with different configurations.

**Use case:** You need to create multiple EC2 instances (web, app, db), where each instance has its own configuration (instance type, AMI, monitoring), but all follow the same structure.

```hcl
# Map of objects - combines flexibility of maps with structure of objects
variable "instances" {
  type = map(object({        # ← Map: flexible keys ("web", "app", "db")
    instance_type = string   # ← Object: fixed schema for each instance
    ami           = string
    monitoring    = bool
    tags          = map(string)
  }))

  default = {
    web = {                  # ← Key: instance name
      instance_type = "t2.micro"
      ami           = "ami-web"
      monitoring    = true
      tags = {
        Role = "WebServer"
      }
    }
    app = {                  # ← Key: instance name
      instance_type = "t2.small"
      ami           = "ami-app"
      monitoring    = false
      tags = {
        Role = "AppServer"
      }
    }
  }
}

# Using complex object with for_each
resource "aws_instance" "server" {
  for_each = var.instances  # Iterate over map keys: "web", "app"

  ami           = each.value.ami           # Access object fields
  instance_type = each.value.instance_type
  monitoring    = each.value.monitoring

  tags = merge(
    each.value.tags,
    {
      Name = each.key  # Use map key as instance name
    }
  )
}
```

**This creates 2 EC2 instances:**
```
Instance 1:
  ├─ Resource name: aws_instance.server["web"]
  ├─ Instance type: t2.micro
  ├─ AMI: ami-web
  ├─ Monitoring: true
  └─ Tags: Role=WebServer, Name=web

Instance 2:
  ├─ Resource name: aws_instance.server["app"]
  ├─ Instance type: t2.small
  ├─ AMI: ami-app
  ├─ Monitoring: false
  └─ Tags: Role=AppServer, Name=app
```

**Why this pattern is useful:**
- **Map** provides flexibility: Add/remove instances easily ("db", "cache", etc.)
- **Object** provides structure: Each instance has consistent configuration fields
- **for_each** creates resources: One instance per map key
- **each.key** = map key ("web", "app")
- **each.value** = object with configuration fields

**Adding a new instance is easy:**
```hcl
# terraform.tfvars
instances = {
  web = { instance_type = "t2.micro", ami = "ami-web", monitoring = true, tags = {...} }
  app = { instance_type = "t2.small", ami = "ami-app", monitoring = false, tags = {...} }
  db  = { instance_type = "t2.large", ami = "ami-db", monitoring = true, tags = {...} }
  # ↑ Just add a new entry!
}
```

#### 2. List of Objects

Managing ordered collections with structured data.

**Use case:** Security group rules where each rule has multiple attributes (port, protocol, CIDR).

<!-- hack to fix hcl rendering issue -->
```python
# List of objects - ordered collection of structured data
variable "security_rules" {
  type = list(object({
    port        = number
    protocol    = string
    cidr_blocks = list(string)
    description = string
  }))

  default = [
    {
      port        = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "HTTP from anywhere"
    },
    {
      port        = 443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "HTTPS from anywhere"
    },
    {
      port        = 22
      protocol    = "tcp"
      cidr_blocks = ["10.0.0.0/8"]
      description = "SSH from internal network"
    }
  ]
}

# Using list of objects
resource "aws_security_group_rule" "ingress" {
  count = length(var.security_rules)  # length = 3, so creates 3 rules

  type              = "ingress"
  from_port         = var.security_rules[count.index].port
  to_port           = var.security_rules[count.index].port
  protocol          = var.security_rules[count.index].protocol
  cidr_blocks       = var.security_rules[count.index].cidr_blocks
  description       = var.security_rules[count.index].description
  security_group_id = aws_security_group.main.id
}
```

**This creates 3 security group rules:**
```
Rule 1 (index 0):
  ├─ Resource name: aws_security_group_rule.ingress[0]
  ├─ Port: 80
  ├─ Protocol: tcp
  ├─ CIDR blocks: ["0.0.0.0/0"]
  └─ Description: HTTP from anywhere

Rule 2 (index 1):
  ├─ Resource name: aws_security_group_rule.ingress[1]
  ├─ Port: 443
  ├─ Protocol: tcp
  ├─ CIDR blocks: ["0.0.0.0/0"]
  └─ Description: HTTPS from anywhere

Rule 3 (index 2):
  ├─ Resource name: aws_security_group_rule.ingress[2]
  ├─ Port: 22
  ├─ Protocol: tcp
  ├─ CIDR blocks: ["10.0.0.0/8"]
  └─ Description: SSH from internal network
```

**Why use list of objects:**
- Order matters (rules are processed in order)
- Each item has consistent structure
- Easy to add/remove rules
- Access by index: `var.security_rules[0].port`

#### 3. Other Common Patterns

```hcl
# List of maps - flexible but ordered
variable "environments" {
  type = list(map(string))
  default = [
    { name = "dev", region = "us-east-1" },
    { name = "prod", region = "us-west-2" }
  ]
}

# Map of lists - categories with multiple values
variable "user_groups" {
  type = map(list(string))
  default = {
    admins     = ["alice", "bob"]
    developers = ["charlie", "dave", "eve"]
    readonly   = ["frank"]
  }
}

# Nested objects - hierarchical configuration
variable "app_config" {
  type = object({
    database = object({
      engine  = string
      storage = number
    })
    cache = object({
      node_type = string
      nodes     = number
    })
  })
  # Access: var.app_config.database.engine
}

# Object with mixed complex types
variable "network_config" {
  type = object({
    vpc_cidr    = string
    azs         = list(string)              # List
    subnet_tags = map(string)               # Map
    nat_gateway = object({                  # Nested object
      enabled = bool
      count   = number
    })
  })
}
```

## Variable Files and Loading

Multiple ways to provide variable values.

```
┌────────────────────────────────────────────────────────────┐
│                  VARIABLE VALUE SOURCES                    │
└────────────────────────────────────────────────────────────┘

1. Default values (in variable block)
2. Environment variables (TF_VAR_*)
3. terraform.tfvars file
4. terraform.tfvars.json file
5. *.auto.tfvars files
6. *.auto.tfvars.json files
7. -var command-line flag
8. -var-file command-line flag
```

### terraform.tfvars

Main variable values file (automatically loaded).

```hcl
# terraform.tfvars

# Simple values
region          = "us-west-2"
environment     = "production"
instance_count  = 5

# Complex values
availability_zones = ["us-west-2a", "us-west-2b", "us-west-2c"]

common_tags = {
  Owner     = "DevOps Team"
  Project   = "WebApp"
  ManagedBy = "Terraform"
}

# Object values
database_config = {
  engine         = "postgres"
  engine_version = "14.5"
  instance_class = "db.t3.medium"
  storage_size   = 100
}
```

### *.auto.tfvars Files

Automatically loaded in alphabetical order.

```hcl
# dev.auto.tfvars
environment     = "development"
instance_type   = "t2.micro"
enable_backup   = false
```

```hcl
# prod.auto.tfvars
environment     = "production"
instance_type   = "t2.large"
enable_backup   = true
```

### JSON Variable Files

```json
// terraform.tfvars.json
{
  "region": "us-east-1",
  "environment": "production",
  "instance_count": 3,
  "availability_zones": [
    "us-east-1a",
    "us-east-1b",
    "us-east-1c"
  ],
  "common_tags": {
    "Owner": "DevOps",
    "Project": "WebApp"
  }
}
```

### Environment Variables

```bash
# Set environment variables
export TF_VAR_region="us-west-2"
export TF_VAR_environment="staging"
export TF_VAR_instance_count=3

# Complex types as JSON
export TF_VAR_availability_zones='["us-west-2a","us-west-2b"]'
export TF_VAR_common_tags='{"Owner":"DevOps","Project":"WebApp"}'

# Run terraform
terraform plan
```

### Command-Line Variables

```bash
# Single variable
terraform plan -var="region=us-east-1"

# Multiple variables
terraform plan \
  -var="region=us-east-1" \
  -var="environment=production" \
  -var="instance_count=5"

# Variable file
terraform plan -var-file="production.tfvars"

# Multiple variable files
terraform plan \
  -var-file="common.tfvars" \
  -var-file="production.tfvars"
```

### Organizing Variable Files

```
┌────────────────────────────────────────────────────────────┐
│              RECOMMENDED FILE STRUCTURE                    │
└────────────────────────────────────────────────────────────┘

/terraform-project
├── variables.tf           # Variable declarations
├── terraform.tfvars       # Default/common values
├── dev.tfvars             # Development values
├── staging.tfvars         # Staging values
├── prod.tfvars            # Production values
└── main.tf                # Main configuration

Usage:
  terraform plan -var-file="dev.tfvars"
  terraform plan -var-file="prod.tfvars"
```

## Variable Precedence

Variable values are loaded in specific order, with later sources overriding earlier ones.

```
┌────────────────────────────────────────────────────────────┐
│              VARIABLE PRECEDENCE HIERARCHY                 │
└────────────────────────────────────────────────────────────┘

LOWEST PRECEDENCE (evaluated first)
    ↓
1. Default value in variable block
    ↓
2. Environment variables (TF_VAR_name)
    ↓
3. terraform.tfvars file
    ↓
4. terraform.tfvars.json file
    ↓
5. *.auto.tfvars files (alphabetical order)
    ↓
6. *.auto.tfvars.json files (alphabetical order)
    ↓
7. -var-file command-line flags (order specified)
    ↓
8. -var command-line flags (order specified)
    ↓
HIGHEST PRECEDENCE (wins)
```

### Precedence Flow Diagram

```
┌────────────────────────────────────────────────────────────┐
│                  PRECEDENCE FLOW EXAMPLE                   │
└────────────────────────────────────────────────────────────┘

Variable: instance_type

Step 1: Check variable block default
        ├─ Found: "t2.micro"
        └─ Current value: "t2.micro"

Step 2: Check TF_VAR_instance_type
        ├─ Found: "t2.small"
        └─ Current value: "t2.small" (overrides default)

Step 3: Check terraform.tfvars
        ├─ Found: "t2.medium"
        └─ Current value: "t2.medium" (overrides env var)

Step 4: Check *.auto.tfvars
        ├─ Not found
        └─ Current value: "t2.medium" (unchanged)

Step 5: Check -var-file flag
        ├─ Not used
        └─ Current value: "t2.medium" (unchanged)

Step 6: Check -var flag
        ├─ Found: "t2.large"
        └─ Final value: "t2.large" (highest precedence)

RESULT: instance_type = "t2.large"
```

## Variable Validation

Custom validation rules ensure variables meet specific requirements.

### Basic Validation

```hcl
variable "environment" {
  type        = string
  description = "Deployment environment"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}
```

### Multiple Validations

<!-- hack to fix hcl rendering issue -->
```python
variable "instance_count" {
  type        = number
  description = "Number of instances to create"

  validation {
    condition     = var.instance_count > 0
    error_message = "Instance count must be greater than 0."
  }

  validation {
    condition     = var.instance_count <= 10
    error_message = "Instance count must not exceed 10."
  }
}
```

### String Pattern Validation

```hcl
variable "project_name" {
  type        = string
  description = "Project name (lowercase, alphanumeric, hyphens only)"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Project name must contain only lowercase letters, numbers, and hyphens."
  }

  validation {
    condition     = length(var.project_name) >= 3 && length(var.project_name) <= 32
    error_message = "Project name must be between 3 and 32 characters."
  }
}
```

### CIDR Block Validation

```hcl
variable "vpc_cidr" {
  type        = string
  description = "VPC CIDR block"

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "Must be a valid IPv4 CIDR block."
  }

  validation {
    condition     = can(regex("^10\\.", var.vpc_cidr))
    error_message = "VPC CIDR must be in 10.0.0.0/8 range."
  }
}
```

### Complex Object Validation

```hcl
variable "database_config" {
  type = object({
    engine         = string
    engine_version = string
    instance_class = string
    storage_size   = number
  })

  validation {
    condition     = contains(["postgres", "mysql"], var.database_config.engine)
    error_message = "Database engine must be postgres or mysql."
  }

  validation {
    condition     = var.database_config.storage_size >= 20 && var.database_config.storage_size <= 1000
    error_message = "Storage size must be between 20 and 1000 GB."
  }

  validation {
    condition     = can(regex("^db\\.", var.database_config.instance_class))
    error_message = "Instance class must start with 'db.'."
  }
}
```

## Output Values

Outputs expose information about your infrastructure.

```
┌────────────────────────────────────────────────────────────┐
│                    OUTPUT VALUE PURPOSES                   │
└────────────────────────────────────────────────────────────┘

1. Display information after apply
2. Share data between configurations
3. Provide values to module consumers
4. Query infrastructure state
```

### Output Examples

<!-- hack to fix hcl rendering issue -->
```python
# outputs.tf

# Simple string output
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

# List output - multiple IDs
output "subnet_ids" {
  description = "List of subnet IDs"
  value       = aws_subnet.public[*].id
}

# Map output - key-value pairs
output "instance_ips" {
  description = "Map of instance names to IPs"
  value = {
    for name, instance in aws_instance.server :
    name => instance.public_ip
  }
}

# Object output - structured data
output "instance_info" {
  description = "EC2 instance information"
  value = {
    id         = aws_instance.web.id
    public_ip  = aws_instance.web.public_ip
    private_ip = aws_instance.web.private_ip
  }
}

# Computed output - string interpolation
output "full_url" {
  description = "Full application URL"
  value       = "https://${aws_instance.web.public_ip}:443"
}
```

### Viewing Outputs

```bash
# View all outputs
terraform output

# View specific output
terraform output instance_id

# Output as JSON (useful for scripts)
terraform output -json

# Output specific value as JSON
terraform output -json instance_info
```

### Conditional Outputs

<!-- hack to fix hcl rendering issue -->
```terraform
variable "create_load_balancer" {
  type    = bool
  default = false
}

resource "aws_lb" "main" {
  count = var.create_load_balancer ? 1 : 0
  # ... configuration
}

output "load_balancer_dns" {
  description = "Load balancer DNS name"
  value       = var.create_load_balancer ? aws_lb.main[0].dns_name : null
}
```

## Sensitive Data Handling

Mark variables and outputs as `sensitive` to hide their values in logs and console output.

### Sensitive Variables

```hcl
# variables.tf

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true  # ← Marks variable as sensitive
}

variable "api_key" {
  description = "API key for external service"
  type        = string
  sensitive   = true
}
```

```bash
# Terraform hides sensitive values in output
$ terraform plan

# Shown: <sensitive>
# Instead of actual value
```

### Sensitive Outputs

```hcl
# outputs.tf

output "db_password" {
  description = "Database password"
  value       = aws_db_instance.main.password
  sensitive   = true  # ← Marks output as sensitive
}

output "connection_string" {
  description = "Database connection string"
  value       = "postgres://${aws_db_instance.main.username}:${aws_db_instance.main.password}@${aws_db_instance.main.endpoint}"
  sensitive   = true
}
```

```bash
# View sensitive output
$ terraform output
# db_password = <sensitive>

# Force display sensitive output
$ terraform output db_password
# "actual_password_value"
```

### Handling Sensitive Data in Files

```hcl
# DON'T commit sensitive values to version control

# .gitignore
secrets.tfvars

# Use environment variables for sensitive data
export TF_VAR_db_password="SuperSecret123!"

# Or use separate sensitive file (not in git)
terraform plan -var-file="secrets.tfvars"
```

### Best Practice: Store Secrets Externally

Even with `sensitive = true`, secrets in `.tfvars` files can be accidentally committed to git or exposed. Store secrets in external secret management systems (AWS Secrets Manager, HashiCorp Vault, etc.) and fetch them at runtime.

**Benefits:**
- Secrets never stored in Terraform code or state files
- Centralized secret management with access controls
- Secret rotation without changing Terraform code
- Audit logging for secret access

**Example: Using AWS Secrets Manager**

```hcl
# Fetch secret from AWS Secrets Manager (not stored in code!)
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "production/db/password"
}

locals {
  db_password = jsondecode(data.aws_secretsmanager_secret_version.db_password.secret_string)["password"]
}

resource "aws_db_instance" "main" {
  password = local.db_password  # Uses secret from Secrets Manager
  # ... other configuration
}
```

**How it works:**
1. Store the actual password in AWS Secrets Manager (outside Terraform)
2. Terraform fetches the password at runtime using a data source
3. Password never appears in your code, `.tfvars`, or git repository
4. Only IAM permissions control who can access the secret

## Module Outputs

Outputs enable data sharing between modules.

```
┌───────────────────────────────────────────────────────────────┐
│                    MODULE OUTPUT FLOW                         │
└───────────────────────────────────────────────────────────────┘

Child Module (vpc/)         Root Module
     ↓                           ↓
output "vpc_id" {        module "vpc" {
  value = ...              source = "./vpc"
}                        }
     ↓                           ↓
output "subnet_ids" {    resource "..." {
  value = ...              vpc_id = module.vpc.vpc_id
}                          subnet_ids = module.vpc.subnet_ids
                         }
```

### Child Module Example

<!-- hack to fix hcl rendering issue -->
```python
# modules/vpc/main.tf
resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr
}

resource "aws_subnet" "public" {
  count      = 3
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.${count.index}.0/24"
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
```

### Using Module Outputs in Root Module

```hcl
# main.tf (root module)

module "vpc" {
  source   = "./modules/vpc"
  vpc_cidr = "10.0.0.0/16"
}

module "app" {
  source     = "./modules/app"
  vpc_id     = module.vpc.vpc_id              # ← Use module output
  subnet_ids = module.vpc.public_subnet_ids   # ← Use module output
}

# Root module outputs
output "vpc_info" {
  description = "VPC information"
  value = {
    id   = module.vpc.vpc_id
    cidr = module.vpc.vpc_cidr
  }
}
```

## Best Practices

### Variable Organization

```
┌────────────────────────────────────────────────────────────┐
│               VARIABLE FILE ORGANIZATION                   │
└────────────────────────────────────────────────────────────┘

1. Separate declaration from values
   variables.tf      → Declarations only
   terraform.tfvars  → Values

2. Group related variables
   # Network variables
   variable "vpc_cidr" { ... }
   variable "subnet_cidrs" { ... }

   # Instance variables
   variable "instance_type" { ... }
   variable "instance_count" { ... }

3. Use descriptive names
   ✅  instance_type
   ❌  type

   ✅  database_password
   ❌  pwd

4. Always provide descriptions
   variable "region" {
     description = "AWS region for resources"
     type        = string
   }
```

### Naming Conventions

<!-- hack to fix hcl rendering issue -->
```python
# Use snake_case for variable names
variable "instance_type" { }        # ✅ Good
variable "instanceType" { }         # ❌ Bad

# Be specific and descriptive
variable "db_password" { }          # ✅ Good
variable "password" { }             # ❌ Too generic

# Use prefixes for related variables
variable "vpc_cidr" { }
variable "vpc_name" { }
variable "vpc_enable_dns" { }

# Use suffixes for type indication
variable "allowed_ports" { }        # List implied
variable "common_tags" { }          # Map implied
variable "enable_monitoring" { }    # Boolean implied
```

### Type Specification

```hcl
# Always specify types
variable "region" {
  type = string                     # ✅ Good
}

variable "count" {                  # ❌ Missing type
  default = 3
}

# Use specific types over "any"
variable "tags" {
  type = map(string)                # ✅ Good
}

variable "config" {
  type = any                        # ❌ Too permissive
}
```

### Default Values

```hcl
# Provide defaults for optional variables
variable "environment" {
  type    = string
  default = "development"           # ✅ Sensible default
}

# No default for required values
variable "project_name" {
  type        = string
  description = "Project name (required)"
  # No default - must be provided
}

# Use null for truly optional values
variable "backup_retention_days" {
  type    = number
  default = null                    # Optional, no backup if null
}
```

### Security Considerations

```hcl
# Mark sensitive variables
variable "database_password" {
  type      = string
  sensitive = true                  # ✅ Hides in logs
}

# DON'T store secrets in code
variable "api_key" {
  default = "secret123"             # ❌ Never do this!
}

# Use external secret management
data "aws_secretsmanager_secret_version" "api_key" {
  secret_id = "prod/api/key"
}

# Add validation for security requirements
variable "db_password" {
  type      = string
  sensitive = true

  validation {
    condition     = length(var.db_password) >= 16
    error_message = "Password must be at least 16 characters."
  }
}
```

### Output Best Practices

```hcl
# Always add descriptions
output "vpc_id" {
  description = "ID of the VPC"     # ✅ Clear description
  value       = aws_vpc.main.id
}

# Group related outputs
output "network_info" {
  description = "Network configuration details"
  value = {
    vpc_id     = aws_vpc.main.id
    vpc_cidr   = aws_vpc.main.cidr_block
    subnet_ids = aws_subnet.public[*].id
  }
}

# Mark sensitive outputs
output "db_connection_string" {
  description = "Database connection string"
  value       = "postgres://..."
  sensitive   = true                # ✅ Protect sensitive data
}
```

### Documentation

<!-- hack to fix hcl rendering issue -->
```python
# Document complex variables with examples
variable "instance_config" {
  description = <<-EOT
    Instance configuration object.

    Example:
    {
      instance_type = "t2.micro"
      ami           = "ami-12345"
      monitoring    = true
      volume_size   = 20
    }
  EOT

  type = object({
    instance_type = string
    ami           = string
    monitoring    = bool
    volume_size   = number
  })
}
```

## Complete Example: Variables and Outputs

```hcl
# variables.tf

# Network variables
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

# Instance variables
variable "instances" {
  description = "Map of instance configurations"
  type = map(object({
    instance_type = string
    ami           = string
    monitoring    = bool
  }))

  default = {
    web = {
      instance_type = "t2.micro"
      ami           = "ami-0c55b159cbfafe1f0"
      monitoring    = true
    }
    app = {
      instance_type = "t2.small"
      ami           = "ami-0c55b159cbfafe1f0"
      monitoring    = false
    }
  }
}

# Environment variable
variable "environment" {
  description = "Deployment environment"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

# Common tags
variable "common_tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
```

```hcl
# main.tf

# VPC
resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.environment}-vpc"
      Environment = var.environment
    }
  )
}

# Subnets
resource "aws_subnet" "public" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index}.0/24"
  availability_zone = var.availability_zones[count.index]

  tags = merge(
    var.common_tags,
    {
      Name = "${var.environment}-public-${count.index + 1}"
    }
  )
}

# Instances
resource "aws_instance" "server" {
  for_each = var.instances

  ami           = each.value.ami
  instance_type = each.value.instance_type
  monitoring    = each.value.monitoring
  subnet_id     = aws_subnet.public[0].id

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.environment}-${each.key}"
      Environment = var.environment
      Role        = each.key
    }
  )
}
```

<!-- hack to fix hcl rendering issue -->
```python
# outputs.tf

# VPC outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

# Subnet outputs
output "subnet_ids" {
  description = "List of subnet IDs"
  value       = aws_subnet.public[*].id
}

# Instance outputs
output "instance_details" {
  description = "Details of all instances"
  value = {
    for name, instance in aws_instance.server :
    name => {
      id         = instance.id
      public_ip  = instance.public_ip
      private_ip = instance.private_ip
    }
  }
}

output "web_server_url" {
  description = "URL of the web server"
  value       = "http://${aws_instance.server["web"].public_ip}"
}
```

```hcl
# terraform.tfvars

environment        = "production"
vpc_cidr          = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

instances = {
  web = {
    instance_type = "t2.small"
    ami           = "ami-0c55b159cbfafe1f0"
    monitoring    = true
  }
  app = {
    instance_type = "t2.medium"
    ami           = "ami-0c55b159cbfafe1f0"
    monitoring    = true
  }
  db = {
    instance_type = "t2.large"
    ami           = "ami-0c55b159cbfafe1f0"
    monitoring    = true
  }
}

common_tags = {
  Owner     = "DevOps Team"
  Project   = "WebApp"
  ManagedBy = "Terraform"
}
```

## Key Takeaways

1. **Variables**: Make configurations flexible and reusable
2. **Type constraints**: Ensure data validity and prevent errors
3. **Validation**: Add custom rules for business requirements
4. **Precedence**: Understand the order of variable value loading
5. **Outputs**: Share data between modules and display information
6. **Sensitive data**: Protect secrets with sensitive flag
7. **Organization**: Keep variable declarations and values separate
8. **Documentation**: Always add descriptions for clarity

## Additional Resources

- [Input Variables](https://developer.hashicorp.com/terraform/language/values/variables)
- [Output Values](https://developer.hashicorp.com/terraform/language/values/outputs)
- [Type Constraints](https://developer.hashicorp.com/terraform/language/expressions/type-constraints)
- [Variable Definition Precedence](https://developer.hashicorp.com/terraform/language/values/variables#variable-definition-precedence)
