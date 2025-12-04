---
title: Resources and Meta-Arguments
linkTitle: Resources and Meta-Arguments
type: docs
weight: 4
prev: /terraform/03-configuration-basics
next: /terraform/05-variables-and-outputs
---

## Resource Deep Dive

Resources are the core building blocks of Terraform configurations.

```bash
┌────────────────────────────────────────────────────────────┐
│                    RESOURCE STRUCTURE                      │
└────────────────────────────────────────────────────────────┘

resource "PROVIDER_TYPE" "NAME" {
  ├─ Required Arguments      # depends on resource type
  ├─ Optional Arguments      # customize behavior
  ├─ Meta-Arguments          # Terraform-specific
  │   ├─ count
  │   ├─ for_each
  │   ├─ depends_on
  │   ├─ provider
  │   └─ lifecycle
  └─ Provisioners            # last resort
}
```

### Resource Behavior

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  # Terraform manages complete lifecycle:
  # • Create (when first applied)
  # • Read (refresh state)
  # • Update (when arguments change)
  # • Delete (when removed from config or destroyed)
}
```

## Meta-Arguments Overview

Meta-arguments are special arguments that work with any resource type.

```
  ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
  │                                   META-ARGUMENTS MATRIX                                         │
  └─────────────────────────────────────────────────────────────────────────────────────────────────┘

  Meta-Argument   Purpose                        Use When                        Example
  ──────────────────────────────────────────────────────────────────────────────────────────────────
  count          Create N identical resources   Static, known quantity          3 EC2 instances
  for_each       Create resources per map/set   Dynamic items w/ unique attrs   S3 bucket per env
  depends_on     Enforce explicit dependencies  Hidden dependency exists        App waits for DB creation
  provider       Use specific provider config   Multi-region/account setups     Deploy to 3 AWS regions
  lifecycle      Control resource lifecycle     Prevent delete, ignore changes  Prevent DB destroy
```

## count Meta-Argument

Creates multiple instances of a resource based on a specified count.

```
┌────────────────────────────────────────────────────────────┐
│                      count VISUALIZATION                   │
└────────────────────────────────────────────────────────────┘

resource "aws_instance" "server" {
  count = 3
  ...
}

Creates:
  aws_instance.server[0]  ─┐
  aws_instance.server[1]  ─┤ 3 instances
  aws_instance.server[2]  ─┘

Access via index:
  aws_instance.server[0].id
  aws_instance.server[count.index].id  (within resource)
```

### Basic count Example

<!-- hack to fix hcl rendering issue -->
```python
resource "aws_instance" "server" {
  count = 3

  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name = "Server-${count.index + 1}"
    # Produces: Server-1, Server-2, Server-3
  }
}

# Reference specific instance
output "first_server_ip" {
  value = aws_instance.server[0].public_ip
}

# Reference all instances
output "all_server_ips" {
  value = aws_instance.server[*].public_ip
}
```

### Conditional count

<!-- hack to fix hcl rendering issue -->
```terraform
variable "create_instance" {
  type    = bool
  default = true
}

resource "aws_instance" "web" {
  count = var.create_instance ? 1 : 0

  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}
```
When `count = 1` (i.e. `terraform apply -var="create_instance=true"`), the resource is created. When `count = 0`, it destroys the resource (or does not create it).

### count with length()

Dynamically create resources based on list size.

<!-- hack to fix hcl rendering issue -->
```python
variable "availability_zones" {
  default = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

resource "aws_subnet" "public" {
  count = length(var.availability_zones)  # Creates 3 subnets (one per AZ)

  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index}.0/24"              # 10.0.0.0/24, 10.0.1.0/24, 10.0.2.0/24
  availability_zone = var.availability_zones[count.index]     # Uses count.index to access list items

  tags = {
    Name = "Public-${var.availability_zones[count.index]}"   # Public-us-east-1a, Public-us-east-1b, ...
  }
}
```

### count Pitfalls

```
⚠️  WARNING: Order Matters with count

resource "aws_instance" "server" {
  count = 3
}

Creates:
  [0] server-1
  [1] server-2
  [2] server-3

If you remove server-2:
  [0] server-1
  [1] server-3  ← Was [2], now shifted!

Result: Terraform destroys [1] and [2], recreates [1]
This is usually NOT what you want!

Solution: Use for_each instead for items that might be removed
```

## for_each Meta-Argument

Creates an instance for each item in a map or set.

```
┌────────────────────────────────────────────────────────────┐
│                    for_each VISUALIZATION                  │
└────────────────────────────────────────────────────────────┘

resource "aws_instance" "server" {
  for_each = toset(["web", "app", "db"])
  ...
}

Creates:
  aws_instance.server["web"]  ─┐
  aws_instance.server["app"]  ─┤ 3 instances
  aws_instance.server["db"]   ─┘

Access via key:
  aws_instance.server["web"].id
  each.key    (within resource - key)
  each.value  (within resource - value)
```

### for_each with Set

<!-- hack to fix hcl rendering issue -->
```python
variable "server_names" {
  default = ["web", "app", "db"]
}

resource "aws_instance" "server" {
  for_each = toset(var.server_names)

  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name = "${each.key}-server"
    # Produces: web-server, app-server, db-server
  }
}

# Reference specific instance
output "web_server_ip" {
  value = aws_instance.server["web"].public_ip
}

# Reference all instances
output "all_server_ips" {
  value = {
    for k, v in aws_instance.server : k => v.public_ip
  }
}
```

### for_each with Map

```hcl
variable "instances" {
  type = map(string)
  default = {
    web = "t2.micro"
    app = "t2.small"
    db  = "t2.medium"
  }
}

resource "aws_instance" "server" {
  for_each = var.instances

  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = each.value  # t2.micro, t2.small, t2.medium

  tags = {
    Name = "${each.key}-server"  # web, app, db
    Type = each.value
  }
}
```

### for_each with Objects

```hcl
variable "instances" {
  type = map(object({
    instance_type = string
    ami           = string
    monitoring    = bool
  }))

  default = {
    web = {
      instance_type = "t2.micro"
      ami           = "ami-web"
      monitoring    = true
    }
    app = {
      instance_type = "t2.small"
      ami           = "ami-app"
      monitoring    = false
    }
  }
}

resource "aws_instance" "server" {
  for_each = var.instances                  # Creates 2 instances: "web" and "app"

  ami           = each.value.ami            # "ami-web" or "ami-app"
  instance_type = each.value.instance_type  # "t2.micro" or "t2.small"
  monitoring    = each.value.monitoring     # true or false

  tags = {
    Name = each.key
  }
}
```

### for_each Advantages

```
✅  Benefits over count:

1. Stable addressing
   - Removing "app" doesn't affect "web" or "db"
   - Each instance has a unique, stable identifier

2. Better readability
   - server["web"] is clearer than server[0]

3. Easier to manage
   - Add/remove items without affecting others
```

## depends_on Meta-Argument

Explicitly declares dependencies between resources when Terraform can't infer them automatically.

```
┌────────────────────────────────────────────────────────────┐
│                   DEPENDENCY TYPES                         │
└────────────────────────────────────────────────────────────┘

IMPLICIT (Automatic):
  resource "aws_subnet" "public" {
    vpc_id = aws_vpc.main.id  ← Reference creates dependency
  }

EXPLICIT (Manual with depends_on):
  resource "aws_instance" "web" {
    depends_on = [aws_iam_role_policy.example]
                  ↑
           Hidden dependency (no direct reference)
  }
```

### When to Use depends_on
To ensure that resources are created or modified in the correct order.

```hcl
# Example: IAM role must exist and be configured before EC2 instance

# IAM Role
resource "aws_iam_role" "instance" {
  name = "instance-role"
  # ... configuration
}

# IAM Policy Attachment
resource "aws_iam_role_policy_attachment" "instance" {
  role       = aws_iam_role.instance.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "instance" {
  name = "instance-profile"
  role = aws_iam_role.instance.name
}

# EC2 Instance
resource "aws_instance" "web" {
  ami                  = "ami-0c55b159cbfafe1f0"
  instance_type        = "t2.micro"
  iam_instance_profile = aws_iam_instance_profile.instance.name

  # Ensure policy is attached before launching instance
  depends_on = [aws_iam_role_policy_attachment.instance]
  #            ↑
  #  Without this, instance might start before policy is attached
}
```

## provider Meta-Argument

Selects a non-default provider configuration.

```hcl
# Primary region
provider "aws" {
  region = "us-east-1"
}

# DR region
provider "aws" {
  alias  = "west"
  region = "us-west-2"
}

# Use default provider (us-east-1)
resource "aws_instance" "primary" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}

# Use aliased provider (us-west-2)
resource "aws_instance" "dr" {
  provider      = aws.west
  ami           = "ami-0d1cd67c26f5fca19"
  instance_type = "t2.micro"
}
```

### Multi-Region Deployment

```hcl
# Providers
provider "aws" {
  alias  = "primary"
  region = "us-east-1"
}

provider "aws" {
  alias  = "dr"
  region = "us-west-2"
}

# S3 bucket in primary region
resource "aws_s3_bucket" "primary" {
  provider = aws.primary
  bucket   = "my-app-primary"
}

# S3 bucket in DR region
resource "aws_s3_bucket" "dr" {
  provider = aws.dr
  bucket   = "my-app-dr"
}

# Replication configuration
resource "aws_s3_bucket_replication_configuration" "replication" {
  provider = aws.primary

  bucket = aws_s3_bucket.primary.id
  role   = aws_iam_role.replication.arn

  rule {
    id     = "replicate-everything"
    status = "Enabled"

    destination {
      bucket = aws_s3_bucket.dr.arn
    }
  }
}
```

## lifecycle Meta-Argument

Customizes resource lifecycle behavior.

```
┌────────────────────────────────────────────────────────────┐
│                  lifecycle ARGUMENTS                       │
└────────────────────────────────────────────────────────────┘

lifecycle {
  ├─ create_before_destroy   (replace strategy)
  ├─ prevent_destroy         (safety guard)
  ├─ ignore_changes          (ignore drift)
  └─ replace_triggered_by    (force replacement)
}
```

### create_before_destroy

<!-- hack to fix hcl rendering issue -->
```python
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  lifecycle {
    create_before_destroy = true
  }
}

# Default behavior:
#   1. Destroy old instance
#   2. Create new instance
#   ⚠️  Downtime during replacement

# With create_before_destroy:
#   1. Create new instance
#   2. Destroy old instance
#   ✅  Zero downtime
```

### prevent_destroy

<!-- hack to fix hcl rendering issue -->
```python
resource "aws_db_instance" "production" {
  identifier = "prod-db"
  # ... configuration

  lifecycle {
    prevent_destroy = true
  }
}

# Attempting to destroy:
# $ terraform destroy
# Error: Instance cannot be destroyed
#
# Protection against accidental deletion of critical resources
```

### ignore_changes

<!-- hack to fix hcl rendering issue -->
```python
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name = "WebServer"
  }

  lifecycle {
    ignore_changes = [
      tags,  # Ignore tag changes (maybe managed externally)
    ]
  }
}

# Use cases:
# - Auto-scaling modifies capacity
# - Tags managed by other tools
# - Attributes changed by AWS automatically
```

### replace_triggered_by

<!-- hack to fix hcl rendering issue -->
```python
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  lifecycle {
    replace_triggered_by = [
      aws_security_group.web.id
    ]
  }
}

# Recreates instance whenever security group changes
```

## Provisioners

Provisioners run scripts or commands on local or remote machines during resource creation or deletion.
- Local machine → Where Terraform is running
- Remote machine → The resource being provisioned

```
⚠️  IMPORTANT: Provisioners are a LAST RESORT

Prefer these alternatives:
  1. cloud-init / user_data
  2. Packer for AMI building
  3. Configuration management (Ansible, Chef)

Use provisioners only when no other option exists
```

### local-exec Provisioner

Runs commands on the machine executing Terraform.

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  provisioner "local-exec" {
    command = "echo ${self.public_ip} >> ips.txt"
  }

  provisioner "local-exec" {
    when    = destroy
    command = "echo 'Destroying instance ${self.id}'"
  }
}
```

### remote-exec Provisioner

Runs commands on the remote resource.

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  key_name      = aws_key_pair.deployer.key_name

  connection {
    type        = "ssh"
    user        = "ubuntu"
    private_key = file("~/.ssh/id_rsa")
    host        = self.public_ip
  }

  provisioner "remote-exec" {
    inline = [
      "sudo apt-get update",
      "sudo apt-get install -y nginx",
      "sudo systemctl start nginx",
    ]
  }
}
```

### file Provisioner

Copies files from the local machine to the remote machine.

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  key_name      = aws_key_pair.deployer.key_name

  connection {
    type        = "ssh"
    user        = "ubuntu"
    private_key = file("~/.ssh/id_rsa")
    host        = self.public_ip
  }

  # Copy single file
  provisioner "file" {
    source      = "app.conf"
    destination = "/tmp/app.conf"
  }

  # Copy directory
  provisioner "file" {
    source      = "configs/"
    destination = "/etc/app/"
  }

  # Copy using content
  provisioner "file" {
    content     = templatefile("script.sh", { ip = self.private_ip })
    destination = "/tmp/script.sh"
  }
}
```

### Provisioner Failure Behavior

<!-- hack to fix hcl rendering issue -->
```python
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  provisioner "remote-exec" {
    inline = ["exit 1"]    # This will fail

    on_failure = continue  # or "fail" (default)
  }
}

# on_failure = fail (default)
#   - Resource marked as tainted
#   - Terraform apply fails
#   - Next apply will recreate resource

# on_failure = continue
#   - Error logged but ignored
#   - Apply continues
#   - Resource not tainted
```

## Data Sources

Data sources allow Terraform to fetch information defined outside of Terraform.

```
┌────────────────────────────────────────────────────────────────┐
│                  RESOURCES vs DATA SOURCES                     │
└────────────────────────────────────────────────────────────────┘

RESOURCE                         DATA SOURCE
  ↓                                 ↓
Creates/manages infrastructure    Reads existing infrastructure
  ↓                                 ↓
resource "aws_instance" "web"     data "aws_instance" "existing"
  ↓                                 ↓
Terraform controls                Terraform just queries
```

### Basic Data Source Example

```hcl
# Get latest Ubuntu AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]  # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Use data source in resource
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id  # ← Data source reference
  instance_type = "t2.micro"
}

output "ubuntu_ami_id" {
  value = data.aws_ami.ubuntu.id
}
```

### Common Data Sources

```hcl
# Get availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

# Get VPC information
data "aws_vpc" "default" {
  default = true
}

# Get subnet IDs
data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }

  tags = {
    Tier = "Private"
  }
}

# Get caller identity
data "aws_caller_identity" "current" {}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}
```

### Data Source with Dependencies

```hcl
# Create a VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

# Data source queries the VPC we just created
data "aws_vpc" "selected" {
  id = aws_vpc.main.id  # ← Depends on the resource above
}

# Use data source output
resource "aws_subnet" "example" {
  vpc_id     = data.aws_vpc.selected.id
  cidr_block = "10.0.1.0/24"
}
```

## count vs for_each: Choosing the Right Tool

```
┌────────────────────────────────────────────────────────────┐
│              count vs for_each DECISION TREE               │
└────────────────────────────────────────────────────────────┘

Question 1: Do you need multiple instances?
  No  → Don't use count or for_each
  Yes → Continue to Question 2

Question 2: Fixed number or conditional?
  Conditional (0 or 1) → Use count
  Fixed number         → Continue to Question 3
  Dynamic list         → Continue to Question 3

Question 3: Do items have stable identifiers?
  No  → Use count (but be careful with removals)
  Yes → Use for_each

Question 4: Will items be added/removed?
  Yes → Use for_each (safer)
  No  → Either works, for_each preferred
```

### Comparison Table

| Criteria | count | for_each |
|----------|-------|----------|
| **Input type** | Number | Map or Set |
| **Addressing** | `[index]` | `["key"]` |
| **Stability** | Order-dependent | Key-based |
| **Best for** | Fixed quantity, conditional | Dynamic items |
| **Removals** | Can cause recreates | Stable |
| **Readability** | Less clear | More descriptive |

### Migration: count to for_each

<!-- hack to fix hcl rendering issue -->
```python
# Before (using count)
variable "instance_names" {
  default = ["web", "app", "db"]
}

resource "aws_instance" "server" {
  count = length(var.instance_names)

  ami           = "ami-123"
  instance_type = "t2.micro"

  tags = {
    Name = var.instance_names[count.index]
  }
}

# After (using for_each)
resource "aws_instance" "server" {
  for_each = toset(var.instance_names)

  ami           = "ami-123"
  instance_type = "t2.micro"

  tags = {
    Name = each.key
  }
}

# Migration requires state move:
# terraform state mv 'aws_instance.server[0]' 'aws_instance.server["web"]'
# terraform state mv 'aws_instance.server[1]' 'aws_instance.server["app"]'
# terraform state mv 'aws_instance.server[2]' 'aws_instance.server["db"]'
```

## Key Takeaways

1. **count**: Use for fixed numbers or conditional creation (0 or 1)
2. **for_each**: Use for dynamic collections with stable identifiers
3. **depends_on**: Only when Terraform can't infer dependencies
4. **lifecycle**: Customize behavior (prevent deletion, ignore drift)
5. **Provisioners**: Last resort - prefer cloud-init or Packer
6. **Data sources**: Read existing infrastructure or external data

## Additional Resources

- [Meta-Arguments](https://developer.hashicorp.com/terraform/language/meta-arguments/count)
- [Provisioners](https://developer.hashicorp.com/terraform/language/resources/provisioners/syntax)
- [Data Sources](https://developer.hashicorp.com/terraform/language/data-sources)
