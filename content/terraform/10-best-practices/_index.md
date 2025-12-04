---
title: Best Practices
linkTitle: Best Practices
type: docs
weight: 10
prev: /terraform/09-advanced-topics
next: /terraform/11-terragrunt
---

## 1. Code Organization

### 1.1 Directory Structure for Large Projects

**Layered Architecture Pattern:**

```
infrastructure/
├── global/                           # Global resources (IAM, DNS, etc.)
│   ├── iam/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── backend.tf
│   ├── route53/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── backend.tf
│   └── s3-buckets/
│       ├── main.tf
│       └── backend.tf
│
├── environments/                     # Environment-specific configs
│   ├── dev/
│   │   ├── networking/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   ├── outputs.tf
│   │   │   ├── backend.tf
│   │   │   └── terraform.tfvars
│   │   ├── compute/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   ├── outputs.tf
│   │   │   ├── backend.tf
│   │   │   └── terraform.tfvars
│   │   └── data/
│   │       ├── main.tf
│   │       └── backend.tf
│   │
│   ├── staging/
│   │   ├── networking/
│   │   ├── compute/
│   │   └── data/
│   │
│   └── prod/
│       ├── networking/
│       ├── compute/
│       └── data/
│
├── modules/                          # Reusable modules
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── README.md
│   │   └── examples/
│   │       └── basic/
│   │           └── main.tf
│   │
│   ├── eks-cluster/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── versions.tf
│   │   ├── README.md
│   │   ├── CHANGELOG.md
│   │   └── examples/
│   │       ├── complete/
│   │       └── minimal/
│   │
│   └── rds-postgres/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── README.md
│
├── shared/                           # Shared configurations
│   └── terraform.tfvars
│
└── scripts/                          # Helper scripts
    ├── init-backend.sh
    ├── plan-all.sh
    └── validate-all.sh
```

**Alternative: Application-Centric Structure:**

```
my-application/
├── infrastructure/
│   ├── base/                        # Base infrastructure
│   │   ├── vpc/
│   │   ├── security-groups/
│   │   └── iam/
│   │
│   ├── app/                         # Application infrastructure
│   │   ├── ecs-cluster/
│   │   ├── alb/
│   │   └── service/
│   │
│   └── data/                        # Data layer
│       ├── rds/
│       ├── elasticache/
│       └── s3/
│
└── modules/
    └── ...
```

### 1.2 Environment Separation Strategies

**Strategy 1: Directory-Based Separation (Recommended)**

```
environments/
├── dev/
│   └── main.tf      # Uses dev.tfvars
├── staging/
│   └── main.tf      # Uses staging.tfvars
└── prod/
    └── main.tf      # Uses prod.tfvars
```

**Advantages:**
- Clear separation
- Different state files
- Different backends possible
- Easy to apply different security controls
- No risk of applying to wrong environment

**Strategy 2: Workspace-Based Separation**

```
infrastructure/
└── main.tf          # Uses terraform workspace to switch
```

**Advantages:**
- Single codebase
- Less duplication

**Disadvantages:**
- Easy to apply to wrong workspace
- Shared state backend
- Not recommended for production

### 1.3 Monorepo vs Multi-Repo

**Monorepo Approach:**

```
company-infrastructure/
├── modules/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── prod/
└── global/
```

**Advantages:**
- Single source of truth
- Easy to share modules
- Atomic changes across environments
- Simpler dependency management

**Multi-Repo Approach:**

```
terraform-modules/          # Separate repo
terraform-dev/              # Separate repo
terraform-staging/          # Separate repo
terraform-prod/             # Separate repo
```

**Advantages:**
- Isolated blast radius
- Different access controls per environment
- Independent versioning
- Better for large teams

**Recommendation:** Start with monorepo, split when team size or security requirements demand it.

## 2. Naming Conventions

### 2.1 Resource Naming

**Pattern:** `{environment}-{application}-{resource-type}-{purpose}`

<!-- hack to fix hcl rendering issue -->
```python
# Good examples
resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr

  tags = {
    Name        = "${var.environment}-${var.application}-vpc"
    Environment = var.environment
    Application = var.application
    ManagedBy   = "terraform"
  }
}

resource "aws_security_group" "web" {
  name        = "${var.environment}-${var.application}-sg-web"
  description = "Security group for web servers"
  vpc_id      = aws_vpc.main.id
}

resource "aws_instance" "web" {
  count = var.instance_count

  ami           = var.ami_id
  instance_type = var.instance_type

  tags = {
    Name = "${var.environment}-${var.application}-web-${count.index + 1}"
  }
}

# For resources in AWS, use hyphens (-)
# For Terraform identifiers, use underscores (_)
```

### 2.2 Variable Naming

```hcl
# Use descriptive names
variable "vpc_cidr_block" {          # Good
  description = "CIDR block for VPC"
  type        = string
}

variable "cidr" {                    # Bad - too vague
  type = string
}

# Boolean variables - use is_, has_, enable_
variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnets"
  type        = bool
  default     = true
}

variable "is_production" {
  description = "Whether this is production environment"
  type        = bool
}

# Lists - use plural names
variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
}

# Maps - use _map suffix or descriptive name
variable "instance_types_by_environment" {
  description = "Instance types per environment"
  type        = map(string)
}
```

### 2.3 Module Naming

```
modules/
├── aws-vpc/                         # Provider-resource pattern
├── aws-eks-cluster/
├── gcp-gke-cluster/
└── azure-aks-cluster/

# Or domain-specific
modules/
├── networking/
├── compute/
└── databases/
```

### 2.4 Output Naming

<!-- hack to fix hcl rendering issue -->
```python
# Use descriptive names
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "private_subnet_ids" {
  description = "IDs of private subnets"
  value       = aws_subnet.private[*].id
}

# For cross-module references
output "database_connection_string" {
  description = "Connection string for the database"
  value       = "postgresql://${aws_db_instance.main.endpoint}"
  sensitive   = true
}
```

### 2.5 Tag Naming Standards

```hcl
locals {
  common_tags = {
    Environment = var.environment
    Application = var.application
    ManagedBy   = "terraform"
    Owner       = var.team_name
    CostCenter  = var.cost_center
    Project     = var.project_name
    Terraform   = "true"
  }
}

resource "aws_instance" "example" {
  # ...

  tags = merge(
    local.common_tags,
    {
      Name = "${var.environment}-${var.application}-web"
      Role = "webserver"
    }
  )
}
```

## 3. State Management Best Practices

### 3.1 Remote State Always

**Never use local state for anything beyond experimentation.**

```hcl
# backend.tf - ALWAYS use remote backend
terraform {
  backend "s3" {
    bucket         = "mycompany-terraform-state"
    key            = "prod/networking/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"

    # Optional but recommended
    kms_key_id = "arn:aws:kms:us-east-1:123456789012:key/..."
  }
}
```

### 3.2 State Locking Always

**Always enable state locking to prevent concurrent modifications.**

<!-- hack to fix hcl rendering issue -->
```python
# AWS - Use DynamoDB
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-state-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name      = "Terraform State Lock Table"
    ManagedBy = "terraform"
  }
}

# Azure - Built into storage account
# GCP - Built into GCS
```

### 3.3 State File Organization

**Pattern 1: By Environment and Layer**

```
s3://terraform-state/
├── global/
│   ├── iam/terraform.tfstate
│   └── route53/terraform.tfstate
├── dev/
│   ├── networking/terraform.tfstate
│   ├── compute/terraform.tfstate
│   └── data/terraform.tfstate
├── staging/
│   ├── networking/terraform.tfstate
│   ├── compute/terraform.tfstate
│   └── data/terraform.tfstate
└── prod/
    ├── networking/terraform.tfstate
    ├── compute/terraform.tfstate
    └── data/terraform.tfstate
```

**Pattern 2: By Application and Component**

```
s3://terraform-state/
├── app-frontend/
│   ├── dev/terraform.tfstate
│   ├── staging/terraform.tfstate
│   └── prod/terraform.tfstate
└── app-backend/
    ├── dev/terraform.tfstate
    ├── staging/terraform.tfstate
    └── prod/terraform.tfstate
```

### 3.4 Separate States for Layers

**Why separate states?**
- Smaller blast radius
- Different change frequencies
- Different team ownership
- Better performance

```
# Layer 1: Networking (changes rarely)
environments/prod/networking/
└── main.tf

# Layer 2: Compute (changes occasionally)
environments/prod/compute/
└── main.tf      # References networking outputs

# Layer 3: Application (changes frequently)
environments/prod/application/
└── main.tf      # References compute outputs
```

**Example: Referencing across states**

```hcl
# In compute/main.tf
data "terraform_remote_state" "networking" {
  backend = "s3"

  config = {
    bucket = "mycompany-terraform-state"
    key    = "prod/networking/terraform.tfstate"
    region = "us-east-1"
  }
}

resource "aws_instance" "app" {
  subnet_id = data.terraform_remote_state.networking.outputs.private_subnet_ids[0]
  # ...
}
```

### 3.5 State Backup Strategy

```bash
#!/bin/bash
# backup-state.sh - Run via cron or CI/CD

DATE=$(date +%Y%m%d-%H%M%S)
BUCKET="mycompany-terraform-state"
BACKUP_BUCKET="mycompany-terraform-state-backup"

# Copy current state to backup bucket
aws s3 sync s3://$BUCKET/ s3://$BACKUP_BUCKET/$DATE/ \
  --exclude "*" \
  --include "*.tfstate"

# Keep backups for 90 days
aws s3api put-bucket-lifecycle-configuration \
  --bucket $BACKUP_BUCKET \
  --lifecycle-configuration file://lifecycle.json
```

**lifecycle.json:**

```json
{
  "Rules": [
    {
      "Id": "DeleteOldBackups",
      "Status": "Enabled",
      "Prefix": "",
      "Expiration": {
        "Days": 90
      }
    }
  ]
}
```

## 4. Security Best Practices

### 4.1 Never Commit Credentials

**Use .gitignore:**

```gitignore
# .gitignore
*.tfvars
*.tfstate
*.tfstate.backup
.terraform/
.terraform.lock.hcl
override.tf
override.tf.json
*_override.tf
*_override.tf.json
crash.log
crash.*.log

# Sensitive files
*.pem
*.key
.env
credentials.json
secrets.yaml
```

**Use environment variables or CI/CD secrets:**

```bash
# Set via environment
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export TF_VAR_db_password="..."

# Or use credential helpers
export AWS_PROFILE="production"
```

**Use secrets management:**

```hcl
# Retrieve from AWS Secrets Manager
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "prod/database/password"
}

resource "aws_db_instance" "main" {
  # ...
  password = data.aws_secretsmanager_secret_version.db_password.secret_string
}

# Or use HashiCorp Vault
data "vault_generic_secret" "db_creds" {
  path = "secret/database/prod"
}

resource "aws_db_instance" "main" {
  # ...
  password = data.vault_generic_secret.db_creds.data["password"]
}
```

### 4.2 Least Privilege IAM

**Terraform execution role:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "ec2:CreateTags",
        "ec2:RunInstances",
        "ec2:TerminateInstances"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": ["us-east-1", "us-west-2"]
        }
      }
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::mycompany-terraform-state/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/terraform-state-lock"
    }
  ]
}
```

### 4.3 Sensitive Data Handling

```hcl
# Mark outputs as sensitive
output "database_password" {
  description = "Master password for database"
  value       = random_password.db_password.result
  sensitive   = true
}

# Mark variables as sensitive
variable "api_key" {
  description = "API key for external service"
  type        = string
  sensitive   = true
}

# Sensitive values won't appear in logs or console output
resource "aws_secretsmanager_secret_version" "api_key" {
  secret_id     = aws_secretsmanager_secret.api_key.id
  secret_string = var.api_key
}
```

### 4.4 State File Encryption

```hcl
# S3 backend with encryption
terraform {
  backend "s3" {
    bucket         = "mycompany-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true                    # Enable encryption at rest
    kms_key_id     = "arn:aws:kms:..."      # Use customer-managed KMS key
    dynamodb_table = "terraform-state-lock"
  }
}

# Create KMS key for state encryption
resource "aws_kms_key" "terraform_state" {
  description             = "KMS key for Terraform state encryption"
  deletion_window_in_days = 10
  enable_key_rotation     = true

  tags = {
    Name      = "terraform-state-encryption"
    ManagedBy = "terraform"
  }
}

resource "aws_kms_alias" "terraform_state" {
  name          = "alias/terraform-state"
  target_key_id = aws_kms_key.terraform_state.key_id
}
```

### 4.5 Network Security for State Backend

```hcl
# VPC endpoint for S3 (avoid internet traffic)
resource "aws_vpc_endpoint" "s3" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${var.region}.s3"

  route_table_ids = [
    aws_route_table.private.id
  ]

  tags = {
    Name = "s3-vpc-endpoint"
  }
}

# Restrict S3 bucket to VPC endpoint only
resource "aws_s3_bucket_policy" "state" {
  bucket = aws_s3_bucket.terraform_state.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "DenyAccessFromInternet"
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

## 5. Module Design

### 5.1 Single Responsibility Principle

**Good module:**

```hcl
# modules/vpc/main.tf - Does ONE thing well
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = var.enable_dns_hostnames
  enable_dns_support   = var.enable_dns_support

  tags = merge(
    var.tags,
    {
      Name = var.vpc_name
    }
  )
}

resource "aws_subnet" "public" {
  count = length(var.public_subnet_cidrs)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = merge(
    var.tags,
    {
      Name = "${var.vpc_name}-public-${var.availability_zones[count.index]}"
      Type = "public"
    }
  )
}
```

**Bad module (does too much):**

```bash
# modules/infrastructure/main.tf - Does EVERYTHING
# VPC, EC2, RDS, S3, IAM, etc. all in one module
# This is an anti-pattern!
```

### 5.2 Module Versioning

**Use Git tags for versioning:**

```bash
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0
```

**Reference specific versions:**

<!-- hack to fix hcl rendering issue -->
```python
# Pin to specific version
module "vpc" {
  source = "git::https://github.com/myorg/terraform-modules.git//vpc?ref=v1.0.0"

  vpc_cidr = "10.0.0.0/16"
}

# Or use Terraform Registry
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"  # Allow patch updates, not major
}
```

**Semantic versioning:**

```
v1.0.0 - Initial release
v1.0.1 - Bug fix (safe to upgrade)
v1.1.0 - New feature (safe to upgrade)
v2.0.0 - Breaking change (requires migration)
```

### 5.3 Module Documentation

**Required documentation:**

```markdown
# VPC Module

## Description
Creates a VPC with public and private subnets across multiple AZs.

## Usage

```hcl
module "vpc" {
  source = "../modules/vpc"

  vpc_name             = "my-vpc"
  vpc_cidr             = "10.0.0.0/16"
  availability_zones   = ["us-east-1a", "us-east-1b"]
  public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnet_cidrs = ["10.0.10.0/24", "10.0.20.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = false

  tags = {
    Environment = "production"
  }
}
```

#### Requirements

| Name | Version |
|------|---------|
| terraform | >= 1.0 |
| aws | >= 5.0 |

#### Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| vpc_name | Name of the VPC | `string` | n/a | yes |
| vpc_cidr | CIDR block for VPC | `string` | n/a | yes |
| availability_zones | List of AZs | `list(string)` | n/a | yes |
| enable_nat_gateway | Enable NAT Gateway | `bool` | `true` | no |

#### Outputs

| Name | Description |
|------|-------------|
| vpc_id | ID of the VPC |
| public_subnet_ids | IDs of public subnets |
| private_subnet_ids | IDs of private subnets |

### 5.4 Module Testing

**Example test structure:**

```
modules/vpc/
├── main.tf
├── variables.tf
├── outputs.tf
├── README.md
├── examples/
│   ├── complete/
│   │   └── main.tf
│   └── minimal/
│       └── main.tf
└── tests/
    ├── vpc_test.go
    └── fixtures/
        └── test.tfvars
```

**Simple validation test:**

<!-- hack to fix hcl rendering issue -->
```python
# examples/complete/main.tf
module "vpc" {
  source = "../../"

  vpc_name             = "test-vpc"
  vpc_cidr             = "10.0.0.0/16"
  availability_zones   = ["us-east-1a", "us-east-1b"]
  public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnet_cidrs = ["10.0.10.0/24", "10.0.20.0/24"]
}

# Validate outputs
output "vpc_id" {
  value = module.vpc.vpc_id
}

# Can run: terraform init && terraform validate
```

## 6. Workflow and Collaboration

### 6.1 Git Workflows

**Feature Branch Workflow:**

```
main (protected)
  └── dev
       └── feature/vpc-updates
       └── feature/add-monitoring
```

**Process:**

```bash
# 1. Create feature branch
git checkout -b feature/vpc-updates

# 2. Make changes
terraform fmt
terraform validate
terraform plan

# 3. Commit changes
git add .
git commit -m "Add VPC flow logs"

# 4. Push and create PR
git push origin feature/vpc-updates

# 5. After review, merge to dev
# 6. Test in dev environment
# 7. Merge dev to main
# 8. Apply to production
```

### 6.2 Code Review Practices

**Pull Request Template:**

```markdown
## Description
Brief description of changes

## Checklist
- [ ] `terraform fmt` applied
- [ ] `terraform validate` passes
- [ ] `terraform plan` reviewed
- [ ] No hardcoded secrets
- [ ] Variables have descriptions
- [ ] Outputs have descriptions
- [ ] README updated if needed
- [ ] CHANGELOG updated
- [ ] Tested in dev environment

## Plan Output

<paste terraform plan output>
```

#### Breaking Changes
List any breaking changes

#### Rollback Plan
How to rollback if issues occur
```

### 6.3 Plan Before Apply - ALWAYS

**CI/CD Pipeline:**

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  pull_request:
    paths:
      - 'infrastructure/**'
  push:
    branches:
      - main

jobs:
  plan:
    name: Terraform Plan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: 1.6.0

      - name: Terraform Init
        run: terraform init
        working-directory: ./infrastructure/prod

      - name: Terraform Format Check
        run: terraform fmt -check -recursive

      - name: Terraform Validate
        run: terraform validate
        working-directory: ./infrastructure/prod

      - name: Terraform Plan
        run: terraform plan -out=tfplan
        working-directory: ./infrastructure/prod
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: Comment Plan on PR
        uses: actions/github-script@v6
        if: github.event_name == 'pull_request'
        with:
          script: |
            const fs = require('fs');
            const plan = fs.readFileSync('infrastructure/prod/tfplan', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Terraform Plan\n\`\`\`\n${plan}\n\`\`\``
            })

  apply:
    name: Terraform Apply
    needs: plan
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v3

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: 1.6.0

      - name: Terraform Init
        run: terraform init
        working-directory: ./infrastructure/prod

      - name: Terraform Apply
        run: terraform apply -auto-approve
        working-directory: ./infrastructure/prod
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### 6.4 Team Access Controls

**Separate permissions by environment:**

```hcl
# IAM policy for developers (dev environment only)
resource "aws_iam_policy" "developer_terraform" {
  name        = "DeveloperTerraformAccess"
  description = "Allow Terraform operations in dev environment"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::terraform-state/dev/*",
          "arn:aws:s3:::terraform-state"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem"
        ]
        Resource = "arn:aws:dynamodb:*:*:table/terraform-lock-dev"
      }
    ]
  })
}

# IAM policy for SRE (production)
resource "aws_iam_policy" "sre_terraform" {
  name        = "SRETerraformAccess"
  description = "Allow Terraform operations in all environments"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:*"]
        Resource = "arn:aws:s3:::terraform-state/*"
      }
    ]
  })
}
```

## 7. Performance Optimization

### 7.1 Resource Targeting

**Use targeting for specific updates:**

```bash
# Only update specific resource
terraform apply -target=aws_instance.web

# Multiple targets
terraform apply \
  -target=aws_instance.web \
  -target=aws_security_group.web

# Useful for:
# - Emergency fixes
# - Reducing blast radius
# - Debugging specific resources
```

**Warning:** Don't rely on targeting for normal operations. It can lead to drift.

### 7.2 Parallelism Tuning

```bash
# Default parallelism is 10
# Increase for large deployments
terraform apply -parallelism=20

# Decrease for rate-limited APIs
terraform apply -parallelism=5

# Set in environment variable
export TF_CLI_ARGS_apply="-parallelism=15"
```

### 7.3 State Size Management

**Split large states:**

```
# Instead of one large state
infrastructure/
└── main.tf (1000 resources)

# Split into layers
infrastructure/
├── networking/     (50 resources)
├── compute/        (300 resources)
├── data/           (100 resources)
└── monitoring/     (50 resources)
```

**Benefits:**
- Faster plan/apply
- Smaller blast radius
- Better team separation
- Reduced lock contention

### 7.4 Provider Plugin Caching

```bash
# Create plugin cache directory
mkdir -p $HOME/.terraform.d/plugin-cache

# Configure in ~/.terraformrc
cat > ~/.terraformrc <<EOF
plugin_cache_dir = "$HOME/.terraform.d/plugin-cache"
EOF

# Saves bandwidth and time on terraform init
```

**For CI/CD:**

```yaml
# Cache Terraform plugins
- name: Cache Terraform
  uses: actions/cache@v3
  with:
    path: |
      ~/.terraform.d/plugin-cache
    key: ${{ runner.os }}-terraform-${{ hashFiles('**/.terraform.lock.hcl') }}
```

## 8. Disaster Recovery

### 8.1 State File Backups

**Automated backup script:**

```bash
#!/bin/bash
# backup-terraform-state.sh

set -euo pipefail

BACKUP_DIR="/backups/terraform/$(date +%Y/%m/%d)"
STATE_BUCKET="mycompany-terraform-state"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Pull all state files
aws s3 sync "s3://$STATE_BUCKET" "$BACKUP_DIR" \
  --exclude "*" \
  --include "*.tfstate"

# Compress
tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"

# Upload to backup bucket
aws s3 cp "$BACKUP_DIR.tar.gz" \
  "s3://mycompany-terraform-backups/$(date +%Y/%m/%d)/"

echo "Backup completed: $BACKUP_DIR.tar.gz"
```

**S3 versioning for state:**

<!-- hack to fix hcl rendering issue -->
```python
resource "aws_s3_bucket" "terraform_state" {
  bucket = "mycompany-terraform-state"
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Can recover previous versions
# aws s3api list-object-versions --bucket mycompany-terraform-state
# aws s3api get-object --bucket ... --version-id ...
```

### 8.2 Version Control Everything

**.gitignore (what NOT to commit):**

```gitignore
# State files
*.tfstate
*.tfstate.*

# Sensitive files
*.tfvars
.env

# Build files
.terraform/
```

**What TO commit:**

```
✓ *.tf files
✓ *.tf.json files
✓ .terraform.lock.hcl
✓ README.md
✓ Example *.tfvars.example files
```

### 8.3 Runbooks for Common Issues

**Runbook: State Lock Timeout**

```bash
# Problem: State is locked and won't release

# Step 1: Verify lock status
terraform force-unlock <lock-id>

# Step 2: If that fails, check DynamoDB
aws dynamodb scan --table-name terraform-state-lock

# Step 3: Manually remove lock (LAST RESORT)
aws dynamodb delete-item \
  --table-name terraform-state-lock \
  --key '{"LockID": {"S": "mycompany-terraform-state/prod/terraform.tfstate"}}'
```

**Runbook: Corrupted State**

```bash
# Step 1: Restore from S3 versioning
aws s3api list-object-versions \
  --bucket mycompany-terraform-state \
  --prefix prod/terraform.tfstate

# Step 2: Download specific version
aws s3api get-object \
  --bucket mycompany-terraform-state \
  --key prod/terraform.tfstate \
  --version-id <version-id> \
  terraform.tfstate.backup

# Step 3: Push restored state
terraform state push terraform.tfstate.backup
```

**Runbook: Resource Drift**

```bash
# Step 1: Detect drift
terraform plan -detailed-exitcode
# Exit code 2 = drift detected

# Step 2: Review specific resource
terraform show

# Step 3: Options
# A. Import manual changes
terraform import aws_instance.web i-1234567890abcdef0

# B. Refresh to update state
terraform apply -refresh-only

# C. Recreate resource
terraform taint aws_instance.web
terraform apply
```

### 8.4 Recovery Testing

**Quarterly disaster recovery drill:**

```bash
# Test 1: State Recovery
# 1. Backup current state
terraform state pull > backup.tfstate

# 2. Simulate corruption
# (Don't actually do this in production!)

# 3. Restore from backup
terraform state push backup.tfstate

# 4. Verify
terraform plan

# Test 2: Complete Infrastructure Recreation
# 1. Document current state
terraform show > current-state.txt

# 2. Destroy in test environment
terraform destroy -target=module.test_environment

# 3. Recreate
terraform apply

# 4. Validate
# - Run integration tests
# - Check monitoring
# - Verify connectivity
```

## 9. Cost Optimization

### 9.1 Resource Tagging for Cost Allocation

```hcl
locals {
  cost_tags = {
    CostCenter  = var.cost_center
    Project     = var.project
    Environment = var.environment
    Owner       = var.team_email

    # For AWS Cost Explorer filtering
    ManagedBy   = "terraform"
    Application = var.application_name
  }
}

resource "aws_instance" "app" {
  # ...

  tags = merge(
    local.cost_tags,
    {
      Name = "${var.environment}-app-server"
    }
  )
}

# Apply to ALL resources
resource "aws_ebs_volume" "data" {
  tags = local.cost_tags
}

resource "aws_lb" "main" {
  tags = local.cost_tags
}
```

**Cost allocation report:**

```bash
# Query costs by tag
aws ce get-cost-and-usage \
  --time-period Start=2025-01-01,End=2025-01-31 \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=TAG,Key=Project
```

### 9.2 Right-Sizing Resources

<!-- hack to fix hcl rendering issue -->
```terraform
# Use variables for instance types
variable "instance_types" {
  description = "Instance types by environment"
  type        = map(string)
  default = {
    dev     = "t3.small"      # Smaller for dev
    staging = "t3.medium"
    prod    = "t3.large"
  }
}

resource "aws_instance" "app" {
  instance_type = var.instance_types[var.environment]
  # ...
}

# Spot instances for non-critical workloads
resource "aws_spot_instance_request" "batch" {
  count = var.environment == "prod" ? 0 : 1  # Only in non-prod

  ami           = var.ami_id
  instance_type = "t3.large"
  spot_price    = "0.05"
  # ...
}

# Auto-scaling for variable workloads
resource "aws_appautoscaling_target" "ecs" {
  max_capacity       = var.environment == "prod" ? 10 : 3
  min_capacity       = var.environment == "prod" ? 2 : 1
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.app.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}
```

### 9.3 Cleanup of Unused Resources

<!-- hack to fix hcl rendering issue -->
```python
# Add lifecycle rules
resource "aws_s3_bucket_lifecycle_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    id     = "cleanup-old-logs"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }
}

# Delete unused snapshots
resource "aws_ebs_snapshot" "backup" {
  volume_id = aws_ebs_volume.data.id

  tags = {
    ExpirationDate = timeadd(timestamp(), "168h") # 7 days
  }
}

# Lambda to cleanup old snapshots
# (This would require additional Lambda function code)
```

**Identify unused resources:**

```bash
# Find unattached EBS volumes
aws ec2 describe-volumes \
  --filters Name=status,Values=available \
  --query 'Volumes[*].[VolumeId,Size,CreateTime]'

# Find unused Elastic IPs
aws ec2 describe-addresses \
  --query 'Addresses[?AssociationId==null]'

# Find old AMIs
aws ec2 describe-images \
  --owners self \
  --query 'Images[*].[ImageId,CreationDate,Name]'
```

### 9.4 Terraform Destroy for Temporary Environments

<!-- hack to fix hcl rendering issue -->
```bash
# Use count for conditional resources
resource "aws_instance" "test" {
  count = var.environment == "temp" ? 1 : 0
  # ...
}

# Scheduled destruction (using external scheduler)
# Example: Destroy dev environment at night
```

**Scheduled cleanup script:**

```bash
#!/bin/bash
# scheduled-cleanup.sh

# Destroy temporary environments older than 7 days
ENVS=$(aws resourcegroupstaggingapi get-resources \
  --tag-filters Key=Environment,Values=temp \
  --query 'ResourceTagMappingList[].Tags[?Key==`CreatedDate`].Value' \
  --output text)

for env in $ENVS; do
  if [ $(days_since $env) -gt 7 ]; then
    cd terraform/temp/$env
    terraform destroy -auto-approve
  fi
done
```

## 10. Migration and Refactoring

### 10.1 Moving Resources Between States

**Scenario: Moving VPC from monolithic state to separate state**

```bash
# Step 1: In OLD state - remove from state (don't destroy)
cd terraform/old
terraform state rm aws_vpc.main
terraform state rm aws_subnet.public

# Step 2: In NEW state - import resources
cd terraform/new-networking
terraform import aws_vpc.main vpc-12345678
terraform import aws_subnet.public subnet-12345678

# Step 3: Verify no changes
terraform plan  # Should show no changes

# Step 4: Update references
# Change from direct reference to remote state data source
```

**Using `terraform state mv`**

```bash
# Move resource to different address
terraform state mv aws_instance.old aws_instance.new

# Move resource to module
terraform state mv aws_instance.web module.web.aws_instance.main

# Move entire module
terraform state mv module.old_module module.new_module
```

### 10.2 Renaming Resources Safely

```bash
# Option 1: Use state mv
terraform state mv aws_instance.server aws_instance.web_server

# Option 2: Use moved block (Terraform 1.1+)
```

<!-- hack to fix hcl rendering issue -->
```python
# In your .tf file
moved {
  from = aws_instance.server
  to   = aws_instance.web_server
}

resource "aws_instance" "web_server" {
  # Same configuration as before
}

# Run terraform plan - will show move, not destroy/create
```

### 10.3 Module Extraction

**Before: Monolithic configuration**

```hcl
# main.tf
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public" {
  count      = 2
  vpc_id     = aws_vpc.main.id
  cidr_block = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
}
```

**After: Extracted module**

```hcl
# modules/vpc/main.tf
resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr
}

resource "aws_subnet" "public" {
  count      = length(var.public_subnet_cidrs)
  vpc_id     = aws_vpc.main.id
  cidr_block = var.public_subnet_cidrs[count.index]
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
}
```

```hcl
# main.tf (using module)
module "vpc" {
  source = "./modules/vpc"

  vpc_cidr            = "10.0.0.0/16"
  public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
}
```

**Migration steps:**

```bash
# 1. Create module code
# 2. Run terraform plan to see what will happen
terraform plan

# 3. Use state mv to move resources into module
terraform state mv aws_vpc.main module.vpc.aws_vpc.main
terraform state mv 'aws_subnet.public[0]' 'module.vpc.aws_subnet.public[0]'
terraform state mv 'aws_subnet.public[1]' 'module.vpc.aws_subnet.public[1]'
terraform state mv aws_internet_gateway.main module.vpc.aws_internet_gateway.main

# 4. Verify
terraform plan  # Should show no changes
```

### 10.4 Handling Breaking Changes

**Example: Provider upgrade with breaking changes**

```hcl
# Before: AWS Provider 4.x
resource "aws_s3_bucket" "example" {
  bucket = "my-bucket"
  acl    = "private"  # Deprecated in 5.x

  versioning {
    enabled = true
  }
}

# After: AWS Provider 5.x
resource "aws_s3_bucket" "example" {
  bucket = "my-bucket"
}

resource "aws_s3_bucket_acl" "example" {
  bucket = aws_s3_bucket.example.id
  acl    = "private"
}

resource "aws_s3_bucket_versioning" "example" {
  bucket = aws_s3_bucket.example.id

  versioning_configuration {
    status = "Enabled"
  }
}
```

**Migration steps:**

```bash
# 1. Test in non-prod first
cd environments/dev
terraform init -upgrade

# 2. Run plan to see changes
terraform plan

# 3. If needed, import new resources
terraform import aws_s3_bucket_acl.example my-bucket
terraform import aws_s3_bucket_versioning.example my-bucket

# 4. Apply changes
terraform apply

# 5. Repeat for staging, then prod
```

## 11. Common Anti-Patterns to Avoid

### 11.1 Manual Changes to State

**DON'T:**

```bash
# Editing state file directly
vim terraform.tfstate  # NEVER DO THIS!
```

**DO:**

```bash
# Use state commands
terraform state rm aws_instance.old
terraform state mv aws_instance.old aws_instance.new
terraform import aws_instance.new i-1234567890
```

### 11.2 Hardcoded Values

**DON'T:**

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"  # Hardcoded
  instance_type = "t2.micro"              # Hardcoded
  subnet_id     = "subnet-12345678"       # Hardcoded

  tags = {
    Name = "production-web-server"        # Hardcoded
  }
}
```

**DO:**

```hcl
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type
  subnet_id     = var.subnet_id

  tags = merge(
    local.common_tags,
    {
      Name = "${var.environment}-${var.application}-web"
    }
  )
}
```

### 11.3 Overly Complex Modules

**DON'T:**

```hcl
# A module that does everything
module "infrastructure" {
  source = "./modules/everything"

  # 50+ variables
  # Creates VPC, EC2, RDS, S3, IAM, CloudFront, etc.
  # 1000+ lines of code
  # Impossible to reuse or test
}
```

**DO:**

```hcl
# Composable, focused modules
module "vpc" {
  source = "./modules/vpc"
  # 5-10 variables
}

module "ec2" {
  source = "./modules/ec2"
  vpc_id = module.vpc.vpc_id
  # 5-10 variables
}

module "rds" {
  source = "./modules/rds"
  vpc_id = module.vpc.vpc_id
  # 5-10 variables
}
```

### 11.4 Not Using Remote State

**DON'T:**

```bash
# terraform.tfstate in git repo
# Multiple team members with local state
# No locking
# State conflicts
```

**DO:**

```hcl
terraform {
  backend "s3" {
    bucket         = "terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

### 11.5 Ignoring Drift

**DON'T:**

```bash
# Manual changes in AWS console
# Never running terraform plan
# Terraform state diverges from reality
# "It works, don't touch it" mentality
```

**DO:**

```bash
# Regular drift detection
terraform plan -detailed-exitcode

# CI/CD pipeline to detect drift
# Alert on drift
# Document process for handling drift

# Import manual changes
terraform import aws_instance.web i-1234567890

# Or refresh state
terraform apply -refresh-only
```

### 11.6 Other Anti-Patterns

**DON'T:**

```hcl
# 1. Creating resources with count/for_each and no lifecycle block
resource "aws_instance" "web" {
  count = var.instance_count
  # If count changes, will destroy/recreate in wrong order
}

# 2. Not using depends_on when needed
resource "aws_iam_role_policy_attachment" "example" {
  role       = aws_iam_role.example.name
  policy_arn = aws_iam_policy.example.arn
  # May fail due to race condition
}

# 3. Using default VPC/subnets
resource "aws_instance" "web" {
  # Relies on default VPC - not portable
}

# 4. Not validating variables
variable "environment" {
  type = string
  # No validation - typos possible
}
```

**DO:**

```hcl
# 1. Use create_before_destroy
resource "aws_instance" "web" {
  count = var.instance_count

  lifecycle {
    create_before_destroy = true
  }
}

# 2. Explicit dependencies
resource "aws_iam_role_policy_attachment" "example" {
  role       = aws_iam_role.example.name
  policy_arn = aws_iam_policy.example.arn

  depends_on = [
    aws_iam_role.example,
    aws_iam_policy.example
  ]
}

# 3. Explicit VPC/subnets
resource "aws_instance" "web" {
  subnet_id = var.subnet_id
}

# 4. Validate inputs
variable "environment" {
  type        = string
  description = "Environment name"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod"
  }
}
```

## Summary Decision Trees

### 1. Environment Separation Strategy

```
Should I use workspaces or directories?
│
├─ Small team, simple infrastructure?
│  └─ Workspaces might be OK
│
└─ Production environment OR large team?
   └─ Use separate directories
      │
      ├─ Same AWS account?
      │  └─ Directories with shared backend
      │
      └─ Different AWS accounts?
         └─ Directories with separate backends
```

### 2. Module Organization

```
Should this be a module?
│
├─ Used in only one place?
│  └─ Keep inline, don't modularize yet
│
├─ Used in 2-3 places?
│  └─ Consider local module
│
└─ Used widely OR shared across teams?
   └─ Create published module
      │
      ├─ Organization-specific?
      │  └─ Private module registry
      │
      └─ General purpose?
         └─ Public module registry
```

### 3. State File Organization

```
How should I organize state files?
│
├─ < 50 resources?
│  └─ Single state file is fine
│
├─ 50-200 resources?
│  └─ Consider splitting by layer
│     (networking, compute, data)
│
└─ > 200 resources?
   └─ Definitely split by layer AND component
      Example:
      ├─ networking/vpc
      ├─ networking/security-groups
      ├─ compute/asg
      ├─ compute/alb
      ├─ data/rds
      └─ data/elasticache
```

### 4. Handling Drift

```
Drift detected - what to do?
│
├─ Manual change was correct?
│  │
│  ├─ Simple resource?
│  │  └─ terraform apply -refresh-only
│  │
│  └─ Complex resource?
│     └─ Update Terraform code
│        └─ terraform plan (verify)
│        └─ Commit to git
│
└─ Manual change was incorrect?
   │
   ├─ Non-critical resource?
   │  └─ terraform apply (revert to Terraform)
   │
   └─ Critical resource (production)?
      └─ terraform taint
         └─ Schedule replacement in maintenance window
```

## Complete Project Example

Here's a complete production-ready project structure:

```
my-company-infrastructure/
│
├── .github/
│   └── workflows/
│       ├── terraform-plan.yml
│       ├── terraform-apply.yml
│       └── drift-detection.yml
│
├── .gitignore
├── README.md
├── CHANGELOG.md
│
├── docs/
│   ├── architecture/
│   │   ├── overview.md
│   │   └── diagrams/
│   ├── runbooks/
│   │   ├── deployment.md
│   │   ├── rollback.md
│   │   └── troubleshooting.md
│   └── decisions/
│       └── adr-001-state-backend.md
│
├── scripts/
│   ├── init-backend.sh
│   ├── deploy.sh
│   ├── backup-state.sh
│   └── validate-all.sh
│
├── modules/
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── versions.tf
│   │   ├── README.md
│   │   ├── CHANGELOG.md
│   │   └── examples/
│   │       ├── basic/
│   │       └── complete/
│   │
│   ├── eks-cluster/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── versions.tf
│   │   ├── README.md
│   │   └── examples/
│   │
│   └── rds-postgres/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       ├── versions.tf
│       └── README.md
│
├── global/
│   ├── iam/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── backend.tf
│   │   └── terraform.tfvars.example
│   │
│   ├── route53/
│   │   ├── main.tf
│   │   ├── backend.tf
│   │   └── terraform.tfvars.example
│   │
│   └── terraform-backend/
│       ├── main.tf
│       └── README.md
│
└── environments/
    ├── dev/
    │   ├── networking/
    │   │   ├── main.tf
    │   │   ├── variables.tf
    │   │   ├── outputs.tf
    │   │   ├── backend.tf
    │   │   ├── versions.tf
    │   │   └── terraform.tfvars
    │   │
    │   ├── compute/
    │   │   ├── main.tf
    │   │   ├── variables.tf
    │   │   ├── outputs.tf
    │   │   ├── backend.tf
    │   │   └── terraform.tfvars
    │   │
    │   └── data/
    │       ├── main.tf
    │       ├── backend.tf
    │       └── terraform.tfvars
    │
    ├── staging/
    │   ├── networking/
    │   ├── compute/
    │   └── data/
    │
    └── prod/
        ├── networking/
        ├── compute/
        └── data/
```

**Example: environments/prod/networking/main.tf**

<!-- hack to fix hcl rendering issue -->
```python
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "mycompany-terraform-state"
    key            = "prod/networking/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    kms_key_id     = "arn:aws:kms:us-east-1:123456789012:key/..."
    dynamodb_table = "terraform-state-lock"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}

locals {
  common_tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
    Project     = var.project_name
    CostCenter  = var.cost_center
    Owner       = var.owner_email
  }
}

module "vpc" {
  source = "../../../modules/vpc"

  vpc_name             = "${var.environment}-${var.project_name}"
  vpc_cidr             = var.vpc_cidr
  availability_zones   = var.availability_zones
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs

  enable_nat_gateway   = true
  single_nat_gateway   = false
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = local.common_tags
}

module "security_groups" {
  source = "../../../modules/security-groups"

  vpc_id      = module.vpc.vpc_id
  environment = var.environment

  tags = local.common_tags
}
```

**Example: environments/prod/networking/variables.tf**

```hcl
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "cost_center" {
  description = "Cost center for billing"
  type        = string
}

variable "owner_email" {
  description = "Email of the team/person responsible"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
}
```

**Example: environments/prod/networking/terraform.tfvars**

```hcl
environment  = "prod"
project_name = "myapp"
cost_center  = "engineering"
owner_email  = "platform-team@mycompany.com"

aws_region = "us-east-1"

vpc_cidr           = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

public_subnet_cidrs = [
  "10.0.1.0/24",
  "10.0.2.0/24",
  "10.0.3.0/24"
]

private_subnet_cidrs = [
  "10.0.11.0/24",
  "10.0.12.0/24",
  "10.0.13.0/24"
]
```

**Example: environments/prod/networking/outputs.tf**

```hcl
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC"
  value       = module.vpc.vpc_cidr
}

output "public_subnet_ids" {
  description = "IDs of public subnets"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of private subnets"
  value       = module.vpc.private_subnet_ids
}

output "nat_gateway_ids" {
  description = "IDs of NAT gateways"
  value       = module.vpc.nat_gateway_ids
}

output "web_security_group_id" {
  description = "ID of web security group"
  value       = module.security_groups.web_sg_id
}

output "app_security_group_id" {
  description = "ID of app security group"
  value       = module.security_groups.app_sg_id
}

output "db_security_group_id" {
  description = "ID of database security group"
  value       = module.security_groups.db_sg_id
}
```

## Key Takeaways

1. **Organization**: Structure your code logically - by environment, layer, or application
2. **State Management**: Always use remote state with locking and encryption
3. **Security**: Never commit secrets, use least privilege, encrypt everything
4. **Modules**: Keep them focused, versioned, and well-documented
5. **Workflow**: Plan before apply, use CI/CD, enable code review
6. **Monitoring**: Detect drift, alert on changes, maintain runbooks
7. **Recovery**: Backup state, version control code, test recovery procedures
8. **Cost**: Tag resources, right-size, cleanup unused resources
9. **Migration**: Use state commands, plan carefully, test in non-prod first
10. **Avoid Anti-Patterns**: No manual state edits, no hardcoded values, use remote state

