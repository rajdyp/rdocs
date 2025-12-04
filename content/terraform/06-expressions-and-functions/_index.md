---
title: Expressions and Functions
linkTitle: Expressions and Functions
type: docs
weight: 6
prev: /terraform/05-variables-and-outputs
next: /terraform/07-modules
---

## Expressions Overview

Expressions in Terraform refer to or compute values within a configuration. They are the building blocks for creating dynamic, flexible infrastructure definitions.

```
┌────────────────────────────────────────────────────────────┐
│                   EXPRESSION TYPES                         │
└────────────────────────────────────────────────────────────┘

1. Literal Expressions     → Constant values
2. References              → Access named values
3. Function Calls          → Invoke built-in functions
4. Conditional Expressions → Ternary operations
5. For Expressions         → Transform collections
6. Splat Expressions       → Extract attributes
```

### Literal Expressions

Literal expressions represent constant values of various types.

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                LITERAL TYPES                               │
└────────────────────────────────────────────────────────────────────────────┘

Type          Syntax                           Example
─────────────────────────────────────────────────────────────────────────────
string        "text"                           "hello world"
number        integer or decimal               15 or 6.283185
bool          true or false                    true
list          ["item1", "item2"]               ["us-west-1a", "us-west-1c"]
set           distinct collection              toset(["a", "b", "c"])
map           {key = value}                    {name = "Alice", age = 30}
null          null                             null
```

### Examples of Literal Expressions

```hcl
# String literal
variable "region" {
  default = "us-west-2"
}

# Number literals
variable "instance_count" {
  default = 3
}

variable "disk_size" {
  default = 100.5
}

# Boolean literal
variable "enable_monitoring" {
  default = true
}

# List literal
variable "availability_zones" {
  default = ["us-west-1a", "us-west-1b", "us-west-1c"]
}

# Map literal
variable "tags" {
  default = {
    Environment = "production"
    Project     = "web-app"
    Owner       = "platform-team"
  }
}

# Null literal
variable "optional_value" {
  default = null
}
```

### References to Values

References access named values directly without additional evaluation.

```
┌───────────────────────────────────────────────────────────────────────┐
│                          REFERENCE TYPES                              │
└───────────────────────────────────────────────────────────────────────┘

Reference Type        Syntax                    Example
────────────────────────────────────────────────────────────────────────
Variable              var.NAME                  var.instance_type
Resource Attribute    TYPE.NAME.ATTR            aws_instance.web.id
Data Source           data.TYPE.NAME.ATTR       data.aws_ami.latest.id
Local Value           local.NAME                local.common_tags
Module Output         module.NAME.OUTPUT        module.vpc.subnet_id
Count Index           count.index               count.index
For Each              each.key / each.value     each.key
```

### Reference Examples

```hcl
# Variable reference
resource "aws_instance" "web" {
  instance_type = var.instance_type
  ami           = var.ami_id
}

# Resource attribute reference
resource "aws_eip" "web" {
  instance = aws_instance.web.id
}

# Data source reference
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
}

resource "aws_instance" "web" {
  ami = data.aws_ami.ubuntu.id
}

# Local value reference
locals {
  common_tags = {
    Environment = "production"
    ManagedBy   = "terraform"
  }
}

resource "aws_instance" "web" {
  tags = local.common_tags
}

# Module output reference
module "vpc" {
  source = "./modules/vpc"
}

resource "aws_instance" "web" {
  subnet_id = module.vpc.public_subnet_id
}
```

## String Interpolation

String interpolation allows you to embed expressions within strings using `${}` syntax.

```
┌────────────────────────────────────────────────────────────┐
│                STRING INTERPOLATION SYNTAX                 │
└────────────────────────────────────────────────────────────┘

"prefix-${expression}-suffix"
         ──────────────
              ↓
         Evaluated and inserted into string
```

### Basic Interpolation Examples

```hcl
variable "environment" {
  default = "production"
}

variable "region" {
  default = "us-west-2"
}

# Simple variable interpolation
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name = "${var.environment}-web-server"
    # Result: "production-web-server"
  }
}

# Multiple interpolations
resource "aws_s3_bucket" "data" {
  bucket = "${var.environment}-${var.region}-data-bucket"
  # Result: "production-us-west-2-data-bucket"
}

# Interpolation with resource attributes
resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}

resource "aws_eip" "app_ip" {
  instance = aws_instance.app.id
}

output "server_info" {
  value = "Server ${aws_instance.app.id} has IP ${aws_eip.app_ip.public_ip}"
  # Result: "Server i-1234567890abcdef0 has IP 54.123.45.67"
}
```

### Advanced Interpolation

<!-- hack to fix hcl rendering issue -->
```python
# Interpolation with functions
resource "aws_instance" "web" {
  count = 3

  tags = {
    Name = "${var.environment}-web-${count.index + 1}"
    # Results: "production-web-1", "production-web-2", "production-web-3"
  }
}

# Interpolation with conditional expressions
resource "aws_instance" "web" {
  tags = {
    Name = "${var.environment == "prod" ? "production" : "non-production"}-server"
  }
}

# Multi-line strings (heredoc) with interpolation
resource "aws_instance" "web" {
  user_data = <<-EOF
              #!/bin/bash
              echo "Environment: ${var.environment}"
              echo "Region: ${var.region}"
              echo "Instance ID: ${aws_instance.web.id}"
              EOF
}
```

### When Interpolation is NOT Needed

<!-- hack to fix hcl rendering issue -->
```python
# DON'T use interpolation for simple references
instance_type = "${var.instance_type}"  # Unnecessary

# DO use direct reference
instance_type = var.instance_type       # Correct

# USE interpolation when building strings
name = "${var.prefix}-server"           # Necessary
```

## Operators

Terraform supports various operators for building expressions.

```
┌─────────────────────────────────────────────────────────────────┐
│                        OPERATOR TYPES                           │
└─────────────────────────────────────────────────────────────────┘

Category          Operators              Example
──────────────────────────────────────────────────────────────────
Arithmetic        + - * / %              5 + 3 = 8
Comparison        == != < > <= >=        var.count > 5
Logical           && || !                var.enabled && var.ready
Numeric           - (negation)           -var.offset
```

### Arithmetic Operators

<!-- hack to fix hcl rendering issue -->
```python
locals {
  # Addition
  total_instances = var.web_count + var.app_count
  # 3 + 2 = 5

  # Subtraction
  available_capacity = var.max_capacity - var.current_usage
  # 100 - 75 = 25

  # Multiplication
  total_storage = var.instance_count * var.storage_per_instance
  # 5 * 100 = 500

  # Division
  average_cpu = var.total_cpu / var.instance_count
  # 800 / 4 = 200

  # Modulo (remainder)
  is_even = var.number % 2 == 0
  # 10 % 2 = 0 (true)
}

# Practical example: Calculate port numbers
resource "aws_security_group_rule" "app_ports" {
  count = 3

  from_port = 8000 + count.index
  to_port   = 8000 + count.index
  # Creates ports: 8000, 8001, 8002
}
```

### Comparison Operators

<!-- hack to fix hcl rendering issue -->
```terraform
locals {
  # Equal to
  is_production = var.environment == "production"

  # Not equal to
  is_not_dev = var.environment != "development"

  # Greater than
  needs_scaling = var.cpu_usage > 80

  # Less than
  under_budget = var.cost < var.budget

  # Greater than or equal
  can_proceed = var.ready_count >= var.minimum_required

  # Less than or equal
  within_limit = var.connections <= var.max_connections
}

# Practical example
resource "aws_instance" "web" {
  instance_type = var.user_count > 1000 ? "t3.large" : "t3.micro"
}
```

### Logical Operators

<!-- hack to fix hcl rendering issue -->
```terraform
locals {
  # AND operator (&&)
  can_deploy = var.tests_passed && var.approved
  # true only if both are true

  # OR operator (||)
  needs_review = var.security_issue || var.compliance_issue
  # true if either is true

  # NOT operator (!)
  is_disabled = !var.enabled
  # inverts the boolean value
}

# Practical examples
resource "aws_instance" "web" {
  count = var.environment == "production" && var.enable_ha ? 3 : 1
  # Deploy 3 instances only in production with HA enabled
}

resource "aws_cloudwatch_alarm" "high_cpu" {
  count = var.enable_monitoring && var.environment != "development" ? 1 : 0
  # Create alarm only if monitoring enabled and not in dev
}

locals {
  # Complex logical expression
  should_backup = (var.environment == "production" || var.environment == "staging") &&
                  var.enable_backups &&
                  !var.maintenance_mode
}
```

### Operator Precedence

```
┌────────────────────────────────────────────────────────────┐
│                  OPERATOR PRECEDENCE                       │
│                  (highest to lowest)                       │
└────────────────────────────────────────────────────────────┘

1. ! - (unary)              Negation
2. * / %                    Multiplication, Division, Modulo
3. + -                      Addition, Subtraction
4. > >= < <=                Comparison
5. == !=                    Equality
6. &&                       Logical AND
7. ||                       Logical OR
```

<!-- hack to fix hcl rendering issue -->
```python
# Use parentheses for clarity
locals {
  # Without parentheses (relies on precedence)
  result1 = var.a + var.b * var.c  # b * c happens first

  # With parentheses (explicit)
  result2 = (var.a + var.b) * var.c  # addition happens first

  # Complex logical expression
  is_valid = (var.count > 0 && var.count <= 10) || var.override
}
```

## Conditional Expressions

Conditional expressions (ternary operator) select between two values based on a boolean condition.

```
┌────────────────────────────────────────────────────────────┐
│              CONDITIONAL EXPRESSION SYNTAX                 │
└────────────────────────────────────────────────────────────┘

condition ? true_value : false_value
─────────   ──────────   ───────────
    ↓            ↓            ↓
Evaluates   Returned      Returned
to bool     if true       if false
```

### Basic Conditional Examples

<!-- hack to fix hcl rendering issue -->
```terraform
variable "environment" {
  type = string
}

# Simple conditional
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.environment == "production" ? "t3.large" : "t3.micro"
  # Production gets larger instance
}

# Conditional count (create resource or not)
resource "aws_eip" "web" {
  count = var.environment == "production" ? 1 : 0
  # Only create Elastic IP in production
}

# Conditional with numbers
locals {
  min_instances = var.environment == "production" ? 3 : 1
  max_instances = var.environment == "production" ? 10 : 2
}
```

### Real-World Conditional Examples

<!-- hack to fix hcl rendering issue -->
```terraform
# Example 1: Environment-based configuration
variable "environment" {
  type    = string
  default = "development"
}

resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.environment == "production" ? "t3.large" : "t3.micro"

  root_block_device {
    volume_size = var.environment == "production" ? 100 : 20
    volume_type = var.environment == "production" ? "gp3" : "gp2"
  }

  tags = {
    Name        = "WebServer-${var.environment}"
    Backup      = var.environment == "production" ? "daily" : "none"
    Monitoring  = var.environment == "production" ? "detailed" : "basic"
  }
}

# Example 2: Feature flags
variable "enable_cdn" {
  type    = bool
  default = false
}

resource "aws_cloudfront_distribution" "cdn" {
  count = var.enable_cdn ? 1 : 0
  # Only create CDN if enabled

  # ... configuration ...
}

output "cdn_url" {
  value = var.enable_cdn ? aws_cloudfront_distribution.cdn[0].domain_name : "CDN not enabled"
}

# Example 3: Cost optimization
variable "business_hours_only" {
  type    = bool
  default = false
}

variable "is_business_hours" {
  type    = bool
  default = true
}

resource "aws_instance" "app" {
  count = var.business_hours_only ? (var.is_business_hours ? 1 : 0) : 1
  # Nested conditional: scale down outside business hours if enabled
}

# Example 4: Multi-condition selection
variable "tier" {
  type = string
  validation {
    condition     = contains(["basic", "standard", "premium"], var.tier)
    error_message = "Tier must be basic, standard, or premium"
  }
}

locals {
  instance_type = var.tier == "premium" ? "t3.xlarge" : (
                  var.tier == "standard" ? "t3.large" : "t3.micro"
                  )
  # Chain conditionals for multiple options
}

# Example 5: Database backup strategy
variable "environment" {
  type = string
}

resource "aws_db_instance" "database" {
  backup_retention_period = var.environment == "production" ? 30 : (
                           var.environment == "staging" ? 7 : 1
                           )

  deletion_protection = var.environment == "production" ? true : false

  multi_az = var.environment == "production" ? true : false
}
```

### Conditional with Different Types

<!-- hack to fix hcl rendering issue -->
```terraform
# String conditionals
locals {
  log_level = var.debug_mode ? "DEBUG" : "INFO"

  region_name = var.use_eu ? "eu-west-1" : "us-west-2"
}

# List conditionals
locals {
  allowed_cidrs = var.public_access ? ["0.0.0.0/0"] : ["10.0.0.0/8"]
}

# Map conditionals
locals {
  common_tags = var.environment == "production" ? {
    Environment = "production"
    Compliance  = "required"
    Backup      = "daily"
  } : {
    Environment = var.environment
    Compliance  = "optional"
    Backup      = "weekly"
  }
}

# Null conditionals
resource "aws_instance" "web" {
  key_name = var.enable_ssh ? var.ssh_key_name : null
  # null means the argument is not set
}
```

## For Expressions

For expressions create a new collection by transforming another collection. They're similar to list comprehensions in Python.

```
┌────────────────────────────────────────────────────────────┐
│                  FOR EXPRESSION SYNTAX                     │
└────────────────────────────────────────────────────────────┘

List comprehension:
  [for ITEM in COLLECTION : EXPRESSION]

Map comprehension:
  {for ITEM in COLLECTION : KEY => VALUE}

With filtering:
  [for ITEM in COLLECTION : EXPRESSION if CONDITION]

With index:
  [for INDEX, ITEM in COLLECTION : EXPRESSION]
```

### List Transformations

<!-- hack to fix hcl rendering issue -->
```python
variable "server_names" {
  default = ["web", "app", "db"]
}

# Basic transformation
locals {
  # Convert to uppercase
  uppercase_names = [for name in var.server_names : upper(name)]
  # Result: ["WEB", "APP", "DB"]

  # Add prefix
  full_names = [for name in var.server_names : "srv-${name}"]
  # Result: ["srv-web", "srv-app", "srv-db"]

  # Numeric transformation
  numbers = [1, 2, 3, 4, 5]
  doubled = [for n in local.numbers : n * 2]
  # Result: [2, 4, 6, 8, 10]
}

# Practical example: Create multiple CIDR blocks
variable "subnet_count" {
  default = 3
}

locals {
  subnet_cidrs = [for i in range(var.subnet_count) : cidrsubnet("10.0.0.0/16", 8, i)]
  # Result: ["10.0.0.0/24", "10.0.1.0/24", "10.0.2.0/24"]
}

resource "aws_subnet" "private" {
  count = var.subnet_count

  vpc_id     = aws_vpc.main.id
  cidr_block = local.subnet_cidrs[count.index]

  tags = {
    Name = "private-subnet-${count.index + 1}"
  }
}
```

### List Filtering

<!-- hack to fix hcl rendering issue -->
```python
locals {
  all_instances = ["web-1", "web-2", "db-1", "cache-1"]

  # Filter web instances only
  web_instances = [for name in local.all_instances : name if startswith(name, "web-")]
  # Result: ["web-1", "web-2"]

  # Filter by condition
  numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  even_numbers = [for n in local.numbers : n if n % 2 == 0]
  # Result: [2, 4, 6, 8, 10]
}

# Practical example: Filter availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  # Only use AZs that end with 'a' or 'b'
  selected_azs = [
    for az in data.aws_availability_zones.available.names :
    az if can(regex("(a|b)$", az))
  ]
}
```

### Map Transformations

<!-- hack to fix hcl rendering issue -->
```python
variable "instance_types" {
  default = {
    web   = "t3.micro"
    app   = "t3.small"
    db    = "t3.medium"
  }
}

# Transform map values
locals {
  # Create new map with transformed values
  upgraded_types = {
    for name, type in var.instance_types :
    name => replace(type, "micro", "small")
  }
  # Result: {web = "t3.small", app = "t3.small", db = "t3.medium"}

  # Transform keys and values
  instance_configs = {
    for name, type in var.instance_types :
    upper(name) => "${type}-instance"
  }
  # Result: {WEB = "t3.micro-instance", APP = "t3.small-instance", ...}
}

# Practical example: Convert list to map
variable "users" {
  default = ["alice", "bob", "charlie"]
}

locals {
  user_emails = {
    for user in var.users :
    user => "${user}@example.com"
  }
  # Result: {alice = "alice@example.com", bob = "bob@example.com", ...}
}
```

### Nested For Expressions

<!-- hack to fix hcl rendering issue -->
```python
variable "environments" {
  default = {
    dev = {
      regions = ["us-east-1", "us-west-2"]
    }
    prod = {
      regions = ["us-east-1", "us-west-2", "eu-west-1"]
    }
  }
}

locals {
  # Flatten nested structure
  all_combinations = flatten([
    for env, config in var.environments : [
      for region in config.regions : {
        environment = env
        region      = region
        name        = "${env}-${region}"
      }
    ]
  ])
  # Result: [{environment="dev", region="us-east-1", name="dev-us-east-1"}, ...]
}
```

### For Expressions with Objects

<!-- hack to fix hcl rendering issue -->
```python
variable "instances" {
  default = [
    { name = "web-1", type = "t3.micro", disk = 20 },
    { name = "web-2", type = "t3.micro", disk = 20 },
    { name = "db-1", type = "t3.large", disk = 100 }
  ]
}

locals {
  # Extract specific fields
  instance_names = [for i in var.instances : i.name]
  # Result: ["web-1", "web-2", "db-1"]

  # Transform objects
  instance_configs = [
    for i in var.instances : {
      name      = upper(i.name)
      type      = i.type
      disk_gb   = i.disk
      disk_bytes = i.disk * 1024 * 1024 * 1024
    }
  ]

  # Filter and transform
  large_instances = [
    for i in var.instances : i.name
    if i.type == "t3.large"
  ]
  # Result: ["db-1"]
}
```

### Practical For Expression Examples

<!-- hack to fix hcl rendering issue -->
```python
# Example 1: Create tags for multiple resources
variable "resource_names" {
  default = ["web-server", "app-server", "db-server"]
}

variable "environment" {
  default = "production"
}

locals {
  resource_tags = {
    for name in var.resource_names :
    name => {
      Name        = name
      Environment = var.environment
      ManagedBy   = "terraform"
      CreatedAt   = timestamp()
    }
  }
}

# Example 2: Generate security group rules
variable "allowed_ports" {
  default = [80, 443, 8080, 8443]
}

resource "aws_security_group" "web" {
  name = "web-sg"

  dynamic "ingress" {
    for_each = var.allowed_ports
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }
}

# Example 3: Create subnet configurations
variable "availability_zones" {
  default = ["us-west-2a", "us-west-2b", "us-west-2c"]
}

locals {
  private_subnets = [
    for idx, az in var.availability_zones : {
      name              = "private-${idx + 1}"
      availability_zone = az
      cidr_block        = cidrsubnet("10.0.0.0/16", 8, idx)
    }
  ]
}
```

## Splat Expressions

Splat expressions provide a concise way to extract specific attributes from a collection of resources.

```
┌────────────────────────────────────────────────────────────┐
│                  SPLAT EXPRESSION SYNTAX                   │
└────────────────────────────────────────────────────────────┘

RESOURCE[*].ATTRIBUTE

Equivalent to:
  [for item in RESOURCE : item.ATTRIBUTE]
```

### Basic Splat Examples

<!-- hack to fix hcl rendering issue -->
```python
# Create multiple instances
resource "aws_instance" "web_servers" {
  count         = 3
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name = "WebServer-${count.index + 1}"
  }
}

# Extract all instance IDs using splat
output "instance_ids" {
  value = aws_instance.web_servers[*].id
  # Result: ["i-1234", "i-5678", "i-9012"]
}

# Extract all public IPs
output "public_ips" {
  value = aws_instance.web_servers[*].public_ip
  # Result: ["54.1.2.3", "54.4.5.6", "54.7.8.9"]
}

# Extract all private IPs
output "private_ips" {
  value = aws_instance.web_servers[*].private_ip
  # Result: ["10.0.1.10", "10.0.1.11", "10.0.1.12"]
}
```

### Splat vs For Expression

<!-- hack to fix hcl rendering issue -->
```python
resource "aws_instance" "servers" {
  count = 3
  ami   = "ami-0c55b159cbfafe1f0"

  tags = {
    Name = "server-${count.index}"
  }
}

locals {
  # Using splat (concise)
  ids_splat = aws_instance.servers[*].id

  # Using for expression (equivalent but verbose)
  ids_for = [for instance in aws_instance.servers : instance.id]

  # Both produce the same result
  # ["i-1234", "i-5678", "i-9012"]
}
```

### Splat with for_each

<!-- hack to fix hcl rendering issue -->
```python
variable "server_configs" {
  default = {
    web = { type = "t3.micro", az = "us-west-2a" }
    app = { type = "t3.small", az = "us-west-2b" }
    db  = { type = "t3.medium", az = "us-west-2c" }
  }
}

resource "aws_instance" "servers" {
  for_each = var.server_configs

  ami               = "ami-0c55b159cbfafe1f0"
  instance_type     = each.value.type
  availability_zone = each.value.az

  tags = {
    Name = "${each.key}-server"
  }
}

# Splat doesn't work with for_each, use for expression instead
output "server_ids" {
  value = [for instance in aws_instance.servers : instance.id]
  # OR using values()
  value = values(aws_instance.servers)[*].id
}
```

### Nested Attribute Splat

<!-- hack to fix hcl rendering issue -->
```python
resource "aws_instance" "web" {
  count = 2

  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  root_block_device {
    volume_size = 20
    volume_type = "gp2"
  }
}

# Access nested attributes
output "volume_ids" {
  value = aws_instance.web[*].root_block_device[0].volume_id
  # Extracts volume ID from each instance
}
```

### Practical Splat Examples

<!-- hack to fix hcl rendering issue -->
```python
# Example 1: Load balancer targets
resource "aws_instance" "app" {
  count = 3
  # ... configuration ...
}

resource "aws_lb_target_group_attachment" "app" {
  count = length(aws_instance.app)

  target_group_arn = aws_lb_target_group.app.arn
  target_id        = aws_instance.app[count.index].id
}

output "registered_targets" {
  value = aws_instance.app[*].id
  description = "IDs of instances registered with load balancer"
}

# Example 2: DNS records for multiple servers
resource "aws_instance" "web" {
  count = 3
  # ... configuration ...
}

resource "aws_route53_record" "web" {
  count = length(aws_instance.web)

  zone_id = aws_route53_zone.main.zone_id
  name    = "web-${count.index + 1}.example.com"
  type    = "A"
  ttl     = 300
  records = [aws_instance.web[count.index].public_ip]
}

output "web_urls" {
  value = formatlist("https://%s", aws_route53_record.web[*].name)
  # Result: ["https://web-1.example.com", "https://web-2.example.com", ...]
}

# Example 3: Security group IDs for multiple groups
resource "aws_security_group" "apps" {
  count = 3
  name  = "app-sg-${count.index + 1}"
  # ... rules ...
}

resource "aws_instance" "server" {
  ami                    = "ami-0c55b159cbfafe1f0"
  instance_type          = "t2.micro"
  vpc_security_group_ids = aws_security_group.apps[*].id
  # Attach all security groups to the instance
}
```

## Dynamic Blocks

Dynamic blocks allow you to dynamically construct repeatable nested blocks within resources.

```
┌────────────────────────────────────────────────────────────┐
│                  DYNAMIC BLOCK SYNTAX                      │
└────────────────────────────────────────────────────────────┘

dynamic "BLOCK_TYPE" {
  for_each = COLLECTION

  content {
    # Use BLOCK_TYPE.key and BLOCK_TYPE.value
  }
}
```

### Dynamic Block Structure

```
┌──────────────────────────────────────────────────────────────┐
│                  DYNAMIC BLOCK COMPONENTS                    │
└──────────────────────────────────────────────────────────────┘

dynamic "ingress" {           ← Block type to generate
  for_each = var.rules        ← Collection to iterate over
  iterator = rule             ← Optional: custom iterator name

  content {                   ← Block content template
    from_port = rule.value.from_port
    to_port   = rule.value.to_port
    # Use iterator.key and iterator.value
  }
}
```

### Basic Dynamic Block Example

```hcl
# WITHOUT dynamic block (repetitive)
resource "aws_security_group" "web" {
  name = "web-sg"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# WITH dynamic block (concise)
variable "ingress_ports" {
  default = [80, 443, 8080]
}

resource "aws_security_group" "web" {
  name = "web-sg"

  dynamic "ingress" {
    for_each = var.ingress_ports

    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }
}
```

### Dynamic Blocks with Maps

```hcl
variable "ingress_rules" {
  default = {
    http = {
      port        = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "HTTP access"
    }
    https = {
      port        = 443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "HTTPS access"
    }
    ssh = {
      port        = 22
      protocol    = "tcp"
      cidr_blocks = ["10.0.0.0/8"]
      description = "SSH access from internal"
    }
  }
}

resource "aws_security_group" "app" {
  name = "app-sg"

  dynamic "ingress" {
    for_each = var.ingress_rules

    content {
      from_port   = ingress.value.port
      to_port     = ingress.value.port
      protocol    = ingress.value.protocol
      cidr_blocks = ingress.value.cidr_blocks
      description = ingress.value.description
    }
  }
}
```

### Dynamic Blocks with Lists of Objects

```hcl
variable "security_rules" {
  type = list(object({
    from_port   = number
    to_port     = number
    protocol    = string
    cidr_blocks = list(string)
    description = string
  }))

  default = [
    {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "HTTP"
    },
    {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "HTTPS"
    }
  ]
}

resource "aws_security_group" "web" {
  name = "web-sg"

  dynamic "ingress" {
    for_each = var.security_rules

    content {
      from_port   = ingress.value.from_port
      to_port     = ingress.value.to_port
      protocol    = ingress.value.protocol
      cidr_blocks = ingress.value.cidr_blocks
      description = ingress.value.description
    }
  }
}
```

### Custom Iterator Names

```hcl
variable "settings" {
  default = {
    web  = { port = 80, protocol = "HTTP" }
    app  = { port = 8080, protocol = "HTTP" }
    api  = { port = 443, protocol = "HTTPS" }
  }
}

resource "aws_lb_target_group" "services" {
  for_each = var.settings

  name     = "${each.key}-tg"
  port     = each.value.port
  protocol = each.value.protocol

  dynamic "health_check" {
    for_each = [1]  # Create exactly one health_check block
    iterator = hc   # Custom iterator name

    content {
      enabled             = true
      healthy_threshold   = 2
      interval            = 30
      path                = "/${each.key}/health"
      port                = each.value.port
      protocol            = each.value.protocol
      unhealthy_threshold = 2
    }
  }
}
```

### Nested Dynamic Blocks

```hcl
variable "listeners" {
  default = {
    http = {
      port     = 80
      protocol = "HTTP"
      rules = [
        { path = "/api/*", target = "api-tg" },
        { path = "/app/*", target = "app-tg" }
      ]
    }
    https = {
      port     = 443
      protocol = "HTTPS"
      rules = [
        { path = "/api/*", target = "api-tg" },
        { path = "/app/*", target = "app-tg" }
      ]
    }
  }
}

resource "aws_lb_listener" "main" {
  for_each = var.listeners

  load_balancer_arn = aws_lb.main.arn
  port              = each.value.port
  protocol          = each.value.protocol

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Not found"
      status_code  = "404"
    }
  }

  # Nested dynamic block
  dynamic "action" {
    for_each = each.value.rules

    content {
      type             = "forward"
      target_group_arn = "arn:aws:elasticloadbalancing:...:${action.value.target}"

      dynamic "forward" {
        for_each = [1]

        content {
          target_group {
            arn = "arn:aws:elasticloadbalancing:...:${action.value.target}"
          }
        }
      }
    }
  }
}
```

### When to Use Dynamic Blocks

```
┌────────────────────────────────────────────────────────────┐
│            DYNAMIC BLOCKS: WHEN TO USE                     │
└────────────────────────────────────────────────────────────┘

✓ USE when:
  • Number of nested blocks is variable/unknown
  • Nested blocks come from external data
  • Configuration is provided by users/modules
  • Reducing repetitive code significantly

✗ AVOID when:
  • Number of blocks is fixed and small
  • Makes code harder to read
  • Simple repetition (2-3 blocks)
  • Type checking is important
```

### Practical Dynamic Block Examples

<!-- hack to fix hcl rendering issue -->
```python
# Example 1: Multi-region VPC peering
variable "peer_regions" {
  default = ["us-east-1", "us-west-1", "eu-west-1"]
}

resource "aws_vpc_peering_connection" "regional" {
  for_each = toset(var.peer_regions)

  vpc_id      = aws_vpc.main.id
  peer_vpc_id = aws_vpc.regional[each.key].id
  peer_region = each.key
  auto_accept = false

  tags = {
    Name = "peering-to-${each.key}"
  }
}

# Example 2: ECS container definitions
variable "environment_variables" {
  type = map(string)
  default = {
    APP_ENV     = "production"
    LOG_LEVEL   = "info"
    API_TIMEOUT = "30"
  }
}

locals {
  container_env_vars = [
    for key, value in var.environment_variables : {
      name  = key
      value = value
    }
  ]
}

resource "aws_ecs_task_definition" "app" {
  family = "app"

  container_definitions = jsonencode([
    {
      name  = "app"
      image = "app:latest"

      environment = local.container_env_vars
      # Results in:
      # [
      #   {name = "APP_ENV", value = "production"},
      #   {name = "LOG_LEVEL", value = "info"},
      #   {name = "API_TIMEOUT", value = "30"}
      # ]
    }
  ])
}

# Example 3: CloudWatch log metric filters
variable "error_patterns" {
  default = {
    error_500 = "HTTP 500"
    error_404 = "HTTP 404"
    timeout   = "Request timeout"
  }
}

resource "aws_cloudwatch_log_group" "app" {
  name = "/aws/app/logs"
}

resource "aws_cloudwatch_log_metric_filter" "errors" {
  for_each = var.error_patterns

  name           = "${each.key}_filter"
  log_group_name = aws_cloudwatch_log_group.app.name
  pattern        = each.value

  metric_transformation {
    name      = each.key
    namespace = "AppErrors"
    value     = "1"
  }
}
```

## Built-in Functions

Terraform provides numerous built-in functions for transforming and combining values.

```
┌────────────────────────────────────────────────────────────┐
│                   FUNCTION CATEGORIES                      │
└────────────────────────────────────────────────────────────┘

• Numeric Functions       → Mathematical operations
• String Functions        → Text manipulation
• Collection Functions    → Lists, maps, sets operations
• Encoding Functions      → JSON, YAML, Base64
• Filesystem Functions    → Read files and templates
• Date/Time Functions     → Timestamps and formatting
• Hash/Crypto Functions   → Hashing and encryption
• IP Network Functions    → CIDR calculations
• Type Conversion         → Convert between types
```

### Numeric Functions

<!-- hack to fix hcl rendering issue -->
```python
locals {
  numbers = [5, 12, 8, 20, 3]

  # min - Returns smallest number
  minimum = min(local.numbers...)
  # Result: 3
  minimum_explicit = min(5, 12, 8, 20, 3)
  # Result: 3

  # max - Returns largest number
  maximum = max(local.numbers...)
  # Result: 20

  # abs - Absolute value
  absolute = abs(-42)
  # Result: 42

  # ceil - Round up to nearest integer
  ceiling = ceil(4.3)
  # Result: 5

  # floor - Round down to nearest integer
  flooring = floor(4.8)
  # Result: 4

  # log - Natural logarithm
  logarithm = log(10, 10)
  # Result: 1 (log base 10 of 10)

  # pow - Power/exponentiation
  power = pow(2, 8)
  # Result: 256 (2^8)

  # signum - Sign of number (-1, 0, or 1)
  sign = signum(-42)
  # Result: -1
}

# Practical example: Calculate optimal instance count
variable "expected_requests_per_second" {
  default = 1500
}

variable "requests_per_instance" {
  default = 100
}

locals {
  # Round up to ensure enough capacity
  instance_count = ceil(var.expected_requests_per_second / var.requests_per_instance)
  # If 1500 / 100 = 15, result is 15
  # If 1550 / 100 = 15.5, result is 16 (rounded up)
}
```

### String Functions

```hcl
locals {
  # join - Combine list elements with delimiter
  servers = ["web", "app", "db"]
  server_list = join(", ", local.servers)
  # Result: "web, app, db"

  # split - Split string into list
  csv_data = "web,app,db,cache"
  server_array = split(",", local.csv_data)
  # Result: ["web", "app", "db", "cache"]

  # lower - Convert to lowercase
  environment = "PRODUCTION"
  env_lower = lower(local.environment)
  # Result: "production"

  # upper - Convert to uppercase
  region = "us-west-2"
  region_upper = upper(local.region)
  # Result: "US-WEST-2"

  # title - Title case
  name = "john doe"
  name_title = title(local.name)
  # Result: "John Doe"

  # replace - Replace substring
  ami_name = "ubuntu-20.04-amd64"
  ami_modified = replace(local.ami_name, "20.04", "22.04")
  # Result: "ubuntu-22.04-amd64"

  # trimspace - Remove leading/trailing whitespace
  messy_string = "  hello world  "
  clean_string = trimspace(local.messy_string)
  # Result: "hello world"

  # substr - Extract substring
  full_string = "HelloWorld"
  sub = substr(local.full_string, 0, 5)
  # Result: "Hello"

  # format - Sprintf-style formatting
  instance_name = format("%s-%s-%03d", "web", "server", 5)
  # Result: "web-server-005"

  # formatlist - Apply format to each list element
  indices = [1, 2, 3]
  names = formatlist("server-%02d", local.indices)
  # Result: ["server-01", "server-02", "server-03"]

  # chomp - Remove trailing newline
  text_with_newline = "hello\n"
  text_clean = chomp(local.text_with_newline)
  # Result: "hello"

  # indent - Add indentation
  yaml_value = "key: value"
  indented = indent(2, local.yaml_value)
  # Result: "  key: value"

  # startswith - Check if string starts with prefix
  is_prod = startswith(var.environment, "prod")
  # Result: true or false

  # endswith - Check if string ends with suffix
  is_json_file = endswith("config.json", ".json")
  # Result: true

  # strrev - Reverse string
  reversed = strrev("hello")
  # Result: "olleh"
}

# Practical examples
variable "environment" {
  default = "production"
}

variable "application" {
  default = "web-app"
}

locals {
  # Create standardized resource names
  resource_prefix = lower("${var.environment}-${var.application}")
  # Result: "production-web-app"

  # Parse version from string
  ami_description = "Ubuntu Server 20.04 LTS"
  version = regex("([0-9.]+)", local.ami_description)
  # Result: "20.04"

  # Clean and format user input
  user_tags = {
    owner = trimspace("  DevOps Team  ")
    env   = lower(var.environment)
  }
}
```

### Collection Functions

<!-- hack to fix hcl rendering issue -->
```python
locals {
  list1 = ["a", "b", "c"]
  list2 = ["d", "e", "f"]
  map1  = { name = "Alice", age = 30 }
  map2  = { city = "NYC", country = "USA" }

  # concat - Combine multiple lists
  combined_list = concat(local.list1, local.list2)
  # Result: ["a", "b", "c", "d", "e", "f"]

  # length - Number of elements
  list_length = length(local.list1)
  # Result: 3
  map_length = length(local.map1)
  # Result: 2

  # element - Get element at index (with wrap-around)
  first = element(local.list1, 0)
  # Result: "a"
  wrapped = element(local.list1, 5)
  # Result: "c" (5 % 3 = 2, so index 2)

  # index - Find index of value
  position = index(local.list1, "b")
  # Result: 1

  # contains - Check if list contains value
  has_b = contains(local.list1, "b")
  # Result: true

  # lookup - Get value from map with default
  name = lookup(local.map1, "name", "Unknown")
  # Result: "Alice"
  missing = lookup(local.map1, "missing", "default")
  # Result: "default"

  # merge - Combine maps
  merged_map = merge(local.map1, local.map2)
  # Result: {name="Alice", age=30, city="NYC", country="USA"}

  # If keys overlap, later values win
  override = merge({env="dev"}, {env="prod"})
  # Result: {env="prod"}

  # keys - Get all keys from map
  map_keys = keys(local.map1)
  # Result: ["name", "age"] (order not guaranteed)

  # values - Get all values from map
  map_values = values(local.map1)
  # Result: ["Alice", 30] (order not guaranteed)

  # distinct - Remove duplicates
  duplicates = ["a", "b", "a", "c", "b"]
  unique = distinct(local.duplicates)
  # Result: ["a", "b", "c"]

  # flatten - Flatten nested lists
  nested = [["a", "b"], ["c", "d"]]
  flat = flatten(local.nested)
  # Result: ["a", "b", "c", "d"]

  # reverse - Reverse list order
  reversed = reverse(local.list1)
  # Result: ["c", "b", "a"]

  # slice - Extract portion of list
  sliced = slice(["a", "b", "c", "d", "e"], 1, 4)
  # Result: ["b", "c", "d"] (from index 1 up to but not including 4)

  # sort - Sort list alphabetically
  unsorted = ["c", "a", "b"]
  sorted = sort(local.unsorted)
  # Result: ["a", "b", "c"]

  # setproduct - Cartesian product of sets
  envs = ["dev", "prod"]
  regions = ["us-east-1", "us-west-2"]
  combinations = setproduct(local.envs, local.regions)
  # Result: [["dev","us-east-1"], ["dev","us-west-2"], ["prod","us-east-1"], ["prod","us-west-2"]]

  # setintersection - Common elements
  set1 = ["a", "b", "c"]
  set2 = ["b", "c", "d"]
  common = setintersection(local.set1, local.set2)
  # Result: ["b", "c"]

  # setunion - All unique elements from both sets
  union = setunion(local.set1, local.set2)
  # Result: ["a", "b", "c", "d"]

  # setsubtract - Elements in first set but not second
  difference = setsubtract(local.set1, local.set2)
  # Result: ["a"]

  # zipmap - Create map from two lists
  keys_list = ["name", "age", "city"]
  values_list = ["Alice", "30", "NYC"]
  zipped = zipmap(local.keys_list, local.values_list)
  # Result: {name="Alice", age="30", city="NYC"}
}

# Practical examples
variable "availability_zones" {
  default = ["us-west-2a", "us-west-2b", "us-west-2c"]
}

variable "subnet_count" {
  default = 5
}

locals {
  # Distribute subnets across AZs using element with wrap-around
  subnet_azs = [
    for i in range(var.subnet_count) :
    element(var.availability_zones, i)
  ]
  # Result: ["us-west-2a", "us-west-2b", "us-west-2c", "us-west-2a", "us-west-2b"]

  # Merge default and custom tags
  default_tags = {
    ManagedBy   = "Terraform"
    Environment = "production"
  }

  custom_tags = {
    Project = "web-app"
    Owner   = "platform-team"
  }

  all_tags = merge(local.default_tags, local.custom_tags)
}
```

### Encoding Functions

<!-- hack to fix hcl rendering issue -->
```python
locals {
  # jsonencode - Convert to JSON string
  config = {
    name    = "web-server"
    port    = 80
    enabled = true
  }
  json_string = jsonencode(local.config)
  # Result: '{"name":"web-server","port":80,"enabled":true}'

  # jsondecode - Parse JSON string
  json_data = '{"name":"Alice","age":30}'
  parsed = jsondecode(local.json_data)
  # Result: {name="Alice", age=30}

  # yamlencode - Convert to YAML string
  yaml_string = yamlencode(local.config)
  # Result:
  # name: web-server
  # port: 80
  # enabled: true

  # yamldecode - Parse YAML string
  yaml_data = <<-EOT
    name: Alice
    age: 30
  EOT
  yaml_parsed = yamldecode(local.yaml_data)
  # Result: {name="Alice", age=30}

  # base64encode - Encode to base64
  text = "Hello World"
  encoded = base64encode(local.text)
  # Result: "SGVsbG8gV29ybGQ="

  # base64decode - Decode from base64
  decoded = base64decode("SGVsbG8gV29ybGQ=")
  # Result: "Hello World"

  # base64gzip - Compress and encode
  large_text = "This is a long text that will be compressed..."
  compressed = base64gzip(local.large_text)

  # urlencode - URL encode string
  url_unsafe = "hello world & special=chars"
  url_safe = urlencode(local.url_unsafe)
  # Result: "hello+world+%26+special%3Dchars"
}

# Practical example: User data for EC2
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  user_data = base64encode(templatefile("${path.module}/init-script.sh", {
    environment = var.environment
    app_port    = var.app_port
  }))
}
```

### Filesystem Functions

<!-- hack to fix hcl rendering issue -->
```python
# file - Read file contents as string
locals {
  # Read SSH public key
  ssh_key = file("${path.module}/keys/id_rsa.pub")

  # Read JSON configuration
  config_raw = file("${path.module}/config.json")
  config = jsondecode(local.config_raw)

  # Read policy document
  policy = file("${path.module}/policies/s3-policy.json")
}

# fileexists - Check if file exists
locals {
  config_file = "${path.module}/config.json"
  has_config = fileexists(local.config_file)
}

# fileset - List files matching pattern
locals {
  # Find all .tf files
  tf_files = fileset(path.module, "*.tf")
  # Result: ["main.tf", "variables.tf", "outputs.tf"]

  # Find all files in subdirectories
  all_configs = fileset(path.module, "configs/**/*.json")
}

# templatefile - Read and render template
resource "aws_instance" "web" {
  user_data = templatefile("${path.module}/user-data.sh", {
    environment = var.environment
    region      = var.region
    app_name    = "web-app"
  })
}

# dirname - Get directory from path
locals {
  file_path = "/home/user/config.json"
  directory = dirname(local.file_path)
  # Result: "/home/user"
}

# basename - Get filename from path
locals {
  file_path = "/home/user/config.json"
  filename = basename(local.file_path)
  # Result: "config.json"
}

# abspath - Convert to absolute path
locals {
  relative = "configs/app.json"
  absolute = abspath(local.relative)
  # Result: "/full/path/to/configs/app.json"
}

# pathexpand - Expand ~ in path
locals {
  home_path = "~/.ssh/id_rsa"
  expanded = pathexpand(local.home_path)
  # Result: "/home/username/.ssh/id_rsa"
}

# Practical example: Load multiple policy files
locals {
  policy_files = fileset(path.module, "policies/*.json")

  policies = {
    for filename in local.policy_files :
    basename(filename) => file("${path.module}/policies/${filename}")
  }
}

resource "aws_iam_policy" "policies" {
  for_each = local.policies

  name   = trimsuffix(each.key, ".json")
  policy = each.value
}
```

### Date and Time Functions

<!-- hack to fix hcl rendering issue -->
```python
locals {
  # timestamp - Current UTC timestamp
  now = timestamp()
  # Result: "2024-01-15T10:30:00Z"

  # formatdate - Format timestamp
  formatted_date = formatdate("YYYY-MM-DD", timestamp())
  # Result: "2024-01-15"

  formatted_datetime = formatdate("DD MMM YYYY hh:mm:ss", timestamp())
  # Result: "15 Jan 2024 10:30:00"

  # timeadd - Add duration to timestamp
  future = timeadd(timestamp(), "24h")
  # One day from now

  one_week_later = timeadd(timestamp(), "168h")
  # One week from now (24 * 7 = 168 hours)

  # timecmp - Compare two timestamps
  # Returns -1 if first is earlier, 0 if equal, 1 if first is later
  comparison = timecmp("2024-01-15T00:00:00Z", "2024-01-16T00:00:00Z")
  # Result: -1 (first timestamp is earlier)
}

# Practical examples
resource "aws_instance" "web" {
  tags = {
    Name      = "web-server"
    CreatedAt = timestamp()
    ExpiresAt = timeadd(timestamp(), "720h")  # 30 days
  }
}

# Generate time-based resource names
locals {
  backup_name = "backup-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  # Result: "backup-2024-01-15-1030"
}

# Conditional based on time
locals {
  maintenance_window_start = "2024-01-15T02:00:00Z"
  maintenance_window_end   = "2024-01-15T04:00:00Z"

  in_maintenance = (
    timecmp(timestamp(), local.maintenance_window_start) >= 0 &&
    timecmp(timestamp(), local.maintenance_window_end) <= 0
  )
}
```

### Type Conversion Functions

```hcl
locals {
  # tostring - Convert to string
  number_str = tostring(42)
  # Result: "42"
  bool_str = tostring(true)
  # Result: "true"

  # tonumber - Convert to number
  str_number = tonumber("42")
  # Result: 42

  # tobool - Convert to boolean
  str_bool = tobool("true")
  # Result: true

  # tolist - Convert to list
  set_to_list = tolist(toset(["a", "b", "c"]))
  # Result: ["a", "b", "c"]

  # toset - Convert to set (removes duplicates)
  list_to_set = toset(["a", "b", "a", "c"])
  # Result: Set with unique values: ["a", "b", "c"]

  # tomap - Convert to map
  converted_map = tomap({
    name = "Alice"
    age  = "30"
  })

  # type - Get type of value
  type_of_string = type("hello")
  # Result: "string"
  type_of_list = type([1, 2, 3])
  # Result: "list"
}

# Practical example: Ensure consistent types
variable "instance_count" {
  # User might provide as string from environment variable
}

locals {
  # Ensure it's a number
  instance_count = tonumber(var.instance_count)
}

# Convert environment variable strings to proper types
variable "enable_monitoring" {
  type    = string
  default = "true"
}

locals {
  monitoring_enabled = tobool(var.enable_monitoring)
}

resource "aws_instance" "web" {
  monitoring = local.monitoring_enabled
}
```

### Hash and Crypto Functions

```hcl
locals {
  data = "sensitive-data"

  # md5 - MD5 hash (128-bit)
  md5_hash = md5(local.data)
  # Result: 32-character hex string

  # sha1 - SHA1 hash (160-bit)
  sha1_hash = sha1(local.data)
  # Result: 40-character hex string

  # sha256 - SHA256 hash (256-bit)
  sha256_hash = sha256(local.data)
  # Result: 64-character hex string

  # sha512 - SHA512 hash (512-bit)
  sha512_hash = sha512(local.data)
  # Result: 128-character hex string

  # base64sha256 - SHA256 hash, base64-encoded
  b64_sha256 = base64sha256(local.data)

  # base64sha512 - SHA512 hash, base64-encoded
  b64_sha512 = base64sha512(local.data)

  # filemd5 - MD5 hash of file
  file_hash = filemd5("${path.module}/config.json")

  # filesha256 - SHA256 hash of file
  file_sha256 = filesha256("${path.module}/config.json")

  # filesha512 - SHA512 hash of file
  file_sha512 = filesha512("${path.module}/config.json")

  # filebase64sha256 - Base64-encoded SHA256 of file
  file_b64sha256 = filebase64sha256("${path.module}/config.json")

  # uuid - Generate UUID
  unique_id = uuid()
  # Result: "550e8400-e29b-41d4-a716-446655440000"

  # uuidv5 - Generate deterministic UUID from namespace and name
  deterministic_uuid = uuidv5("dns", "example.com")
  # Same inputs always produce same UUID
}

# Practical examples

# Generate consistent resource IDs
resource "aws_s3_bucket" "data" {
  # Use hash of configuration to generate consistent name
  bucket = "data-${substr(sha256("${var.project}-${var.environment}"), 0, 8)}"
}

# Detect file changes
resource "aws_s3_object" "config" {
  bucket = aws_s3_bucket.configs.id
  key    = "app-config.json"
  source = "${path.module}/configs/app.json"

  # Trigger update when file content changes
  etag = filemd5("${path.module}/configs/app.json")
}

# Lambda function updates based on code changes
resource "aws_lambda_function" "app" {
  filename         = "lambda.zip"
  source_code_hash = filebase64sha256("lambda.zip")

  # Lambda redeploys when zip file changes
}
```

### IP Network Functions

<!-- hack to fix hcl rendering issue -->
```python
locals {
  # cidrhost - Get IP address from CIDR range
  first_ip = cidrhost("10.0.0.0/24", 0)
  # Result: "10.0.0.0"

  tenth_ip = cidrhost("10.0.0.0/24", 10)
  # Result: "10.0.0.10"

  # cidrnetmask - Get netmask from CIDR
  netmask = cidrnetmask("10.0.0.0/24")
  # Result: "255.255.255.0"

  # cidrsubnet - Calculate subnet CIDR
  # cidrsubnet(prefix, newbits, netnum)
  subnet_1 = cidrsubnet("10.0.0.0/16", 8, 0)
  # Result: "10.0.0.0/24"

  subnet_2 = cidrsubnet("10.0.0.0/16", 8, 1)
  # Result: "10.0.1.0/24"

  subnet_3 = cidrsubnet("10.0.0.0/16", 8, 2)
  # Result: "10.0.2.0/24"

  # cidrsubnets - Calculate multiple subnets at once
  subnets = cidrsubnets("10.0.0.0/16", 8, 8, 8, 4)
  # Result: ["10.0.0.0/24", "10.0.1.0/24", "10.0.2.0/24", "10.0.16.0/20"]
}

# Practical example: Create subnets across availability zones
variable "vpc_cidr" {
  default = "10.0.0.0/16"
}

variable "availability_zones" {
  default = ["us-west-2a", "us-west-2b", "us-west-2c"]
}

locals {
  # Generate public subnet CIDRs
  public_subnet_cidrs = [
    for idx in range(length(var.availability_zones)) :
    cidrsubnet(var.vpc_cidr, 8, idx)
  ]
  # Result: ["10.0.0.0/24", "10.0.1.0/24", "10.0.2.0/24"]

  # Generate private subnet CIDRs
  private_subnet_cidrs = [
    for idx in range(length(var.availability_zones)) :
    cidrsubnet(var.vpc_cidr, 8, idx + 10)
  ]
  # Result: ["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"]
}

resource "aws_subnet" "public" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.main.id
  cidr_block        = local.public_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "public-subnet-${count.index + 1}"
  }
}

resource "aws_subnet" "private" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.main.id
  cidr_block        = local.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "private-subnet-${count.index + 1}"
  }
}

# Complex network setup
locals {
  # Split /16 into different subnet types with different sizes
  all_subnets = cidrsubnets(
    "10.0.0.0/16",
    4,  # Public subnets  /20 (4096 IPs)
    4,  # Private subnets /20 (4096 IPs)
    8,  # Database subnets /24 (256 IPs)
    8   # Management subnets /24 (256 IPs)
  )

  public_cidrs  = slice(local.all_subnets, 0, 1)
  private_cidrs = slice(local.all_subnets, 1, 2)
  db_cidrs      = slice(local.all_subnets, 2, 3)
  mgmt_cidrs    = slice(local.all_subnets, 3, 4)
}
```

### Miscellaneous Useful Functions

<!-- hack to fix hcl rendering issue -->
```bash
# can - Test if expression succeeds
locals {
  # Safe type conversion
  maybe_number = "not-a-number"

  safe_number = can(tonumber(local.maybe_number)) ? tonumber(local.maybe_number) : 0
  # Result: 0 (because conversion fails)

  # Test if value exists in map
  config = { name = "Alice" }
  has_age = can(local.config.age)
  # Result: false
}

# try - Return first successful expression
locals {
  config = {}

  # Try multiple ways to get a value
  name = try(
    local.config.name,
    local.config.user_name,
    "default-name"
  )
  # Returns first value that doesn't error, or last value
}

# coalesce - Return first non-null value
locals {
  # From multiple possible sources
  region = coalesce(
    var.override_region,
    var.default_region,
    "us-west-2"
  )
  # Returns first non-null value
}

# coalescelist - Return first non-empty list
locals {
  custom_azs = []
  default_azs = ["us-west-2a", "us-west-2b"]

  availability_zones = coalescelist(
    local.custom_azs,
    local.default_azs
  )
  # Result: ["us-west-2a", "us-west-2b"]
}

# compact - Remove empty strings from list
locals {
  messy_list = ["a", "", "b", "", "c"]
  clean_list = compact(local.messy_list)
  # Result: ["a", "b", "c"]
}

# chunklist - Split list into chunks
locals {
  items = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  chunks = chunklist(local.items, 3)
  # Result: [[1,2,3], [4,5,6], [7,8,9]]
}

# range - Generate sequence of numbers
locals {
  # range(max) - from 0 to max-1
  zero_to_four = range(5)
  # Result: [0, 1, 2, 3, 4]

  # range(start, end) - from start to end-1
  five_to_nine = range(5, 10)
  # Result: [5, 6, 7, 8, 9]

  # range(start, end, step)
  evens = range(0, 11, 2)
  # Result: [0, 2, 4, 6, 8, 10]
}

# regex - Match regular expression
locals {
  email = "user@example.com"

  # Extract username
  username = regex("^([^@]+)@", local.email)[0]
  # Result: "user"

  # Extract domain
  domain = regex("@(.+)$", local.email)[0]
  # Result: "example.com"
}

# regexall - Find all matches
locals {
  text = "The IP is 192.168.1.1 and 10.0.0.1"

  # Find all IP addresses
  ips = regexall("\\d+\\.\\d+\\.\\d+\\.\\d+", local.text)
  # Result: ["192.168.1.1", "10.0.0.1"]
}

# alltrue - Check if all values are true
locals {
  checks = [true, true, true]
  all_passed = alltrue(local.checks)
  # Result: true

  mixed_checks = [true, false, true]
  all_passed_2 = alltrue(local.mixed_checks)
  # Result: false
}

# anytrue - Check if any value is true
locals {
  checks = [false, true, false]
  any_passed = anytrue(local.checks)
  # Result: true

  all_false = [false, false, false]
  any_passed_2 = anytrue(local.all_false)
  # Result: false
}

# Practical examples
variable "instance_type" {
  type = string
}

locals {
  # Safe validation with can()
  is_valid_instance = can(regex("^t[23]\\.", var.instance_type))

  instance_type = local.is_valid_instance ? var.instance_type : "t3.micro"
}

# Graceful degradation with try()
variable "config" {
  type = object({
    name = string
    settings = optional(object({
      debug = bool
    }))
  })
}

locals {
  # Safely access nested optional value
  debug_enabled = try(var.config.settings.debug, false)
}
```

## Key Takeaways

1. **Expressions** enable dynamic, flexible configurations
2. **String interpolation** (`${}`) builds strings from variables and expressions
3. **Operators** support arithmetic, comparison, and logical operations
4. **Conditional expressions** (`? :`) select values based on conditions
5. **For expressions** transform and filter collections
6. **Splat expressions** (`[*]`) concisely extract attributes
7. **Dynamic blocks** generate repeatable nested blocks
8. **Built-in functions** provide powerful data transformation capabilities
9. Use `terraform console` to test expressions interactively
10. Combine multiple expressions and functions for complex logic

## Additional Resources

- [Expressions](https://developer.hashicorp.com/terraform/language/expressions)
- [Functions](https://developer.hashicorp.com/terraform/language/functions)
- [Dynamic Blocks](https://developer.hashicorp.com/terraform/language/expressions/dynamic-blocks)
- [Type Constraints](https://developer.hashicorp.com/terraform/language/expressions/type-constraints)
