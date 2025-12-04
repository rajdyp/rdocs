---
title: Advanced Topics
linkTitle: Advanced Topics
type: docs
weight: 9
prev: /terraform/08-state-management
next: /terraform/10-best-practices
---

## Backend Migration

Backend migration is the process of moving your Terraform state from one backend to another. This is a common operation when scaling from development to production or switching storage solutions.

### Understanding Backend Types

```
┌──────────────────────────────────────────────────────────────┐
│                    TERRAFORM BACKENDS                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  LOCAL BACKEND                                               │
│  └─ terraform.tfstate (file on disk)                         │
│     ✅ Simple, no setup                                      │
│     ❌ No collaboration, no locking                          │
│                                                              │
│  REMOTE BACKENDS                                             │
│  ├─ S3 + DynamoDB (AWS)                                      │
│  ├─ Azure Blob Storage                                       │
│  ├─ Google Cloud Storage                                     │
│  ├─ Terraform Cloud                                          │
│  └─ Consul, etcd, PostgreSQL, etc.                           │
│     ✅ Team collaboration                                    │
│     ✅ State locking                                         │
│     ✅ Encryption at rest                                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Migration Scenario 1: Local to S3

#### Step 1: Current Configuration (Local Backend)

<!-- hack to fix hcl rendering issue -->
```python
# No backend block = local backend
# State stored in: terraform.tfstate

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
  region = "us-east-1"
}

resource "aws_s3_bucket" "example" {
  bucket = "my-terraform-test-bucket"
}
```

#### Step 2: Create S3 Backend Infrastructure

First, create the S3 bucket and DynamoDB table for state storage:

```hcl
# backend-resources.tf
# Run this separately first to create backend infrastructure

resource "aws_s3_bucket" "terraform_state" {
  bucket = "my-terraform-state-bucket-12345"

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name        = "Terraform State Bucket"
    Environment = "production"
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-state-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name        = "Terraform State Lock Table"
    Environment = "production"
  }
}
```

#### Step 3: Add Backend Configuration

<!-- hack to fix hcl rendering issue -->
```python
# main.tf - Updated with backend configuration

terraform {
  required_version = ">= 1.0"

  backend "s3" {
    bucket         = "my-terraform-state-bucket-12345"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-locks"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
```

#### Step 4: Execute Migration

```bash
# Initialize with the new backend
terraform init

# Terraform will detect the backend change and prompt:
#
# Initializing the backend...
# Do you want to copy existing state to the new backend?
#   Pre-existing state was found while migrating the previous "local" backend to the
#   newly configured "s3" backend. No existing state was found in the newly
#   configured "s3" backend. Do you want to copy this state to the new "s3"
#   backend? Enter "yes" to copy and "no" to start with an empty state.
#
#   Enter a value: yes

# Type 'yes' to migrate

# Verify migration
terraform state list

# Check S3 bucket
aws s3 ls s3://my-terraform-state-bucket-12345/production/
```

### Migration Scenario 2: Changing Backend Types (S3 to Terraform Cloud)

#### Current State: S3 Backend

```hcl
terraform {
  backend "s3" {
    bucket         = "my-terraform-state-bucket-12345"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-locks"
  }
}
```

#### Target State: Terraform Cloud

```hcl
terraform {
  cloud {
    organization = "my-company"

    workspaces {
      name = "production"
    }
  }
}
```

#### Migration Steps

```bash
# 1. Login to Terraform Cloud
terraform login

# 2. Update the backend configuration in your .tf files
# (Replace 's3' backend with 'cloud' backend shown above)

# 3. Reinitialize
terraform init -migrate-state

# 4. Verify migration
terraform workspace show
terraform state list
```

### Migration Best Practices

```
┌──────────────────────────────────────────────────────────────┐
│              BACKEND MIGRATION CHECKLIST                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  BEFORE MIGRATION:                                           │
│  • Backup current state file                                 │
│  • Document current backend configuration                    │
│  • Ensure no one else is running terraform apply             │
│  • Run 'terraform plan' - should show no changes             │
│  • Create destination backend infrastructure                 │
│  • Test access to new backend                                │
│                                                              │
│  DURING MIGRATION:                                           │
│  • Update backend configuration                              │
│  • Run 'terraform init -migrate-state'                       │
│  • Verify state migration prompt                             │
│  • Type 'yes' to confirm                                     │
│                                                              │
│  AFTER MIGRATION:                                            │
│  • Run 'terraform plan' - should show no changes             │
│  • Verify state in new backend                               │
│  • Test state locking (if applicable)                        │
│  • Update team documentation                                 │
│  • Archive old state file securely                           │
│  • Update CI/CD pipelines                                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Manual State Migration (Advanced)

Sometimes you need to manually migrate state:

```bash
# 1. Pull current state
terraform state pull > backup.tfstate

# 2. Update backend configuration

# 3. Initialize new backend
terraform init

# 4. Push state to new backend
terraform state push backup.tfstate

# 5. Verify
terraform state list
```

### Workspace Migration

When migrating backends with multiple workspaces:

```bash
# List current workspaces
terraform workspace list

# For each workspace:
terraform workspace select dev
terraform init -migrate-state

terraform workspace select staging
terraform init -migrate-state

terraform workspace select production
terraform init -migrate-state
```

## Terraform Cloud & Enterprise

Terraform Cloud is HashiCorp's managed service offering for Terraform. Enterprise is the self-hosted version with additional features.

### Features Overview

```
┌──────────────────────────────────────────────────────────────┐
│           TERRAFORM CLOUD/ENTERPRISE FEATURES                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  CORE FEATURES (Free Tier Available):                        │
│  ├─ Remote State Storage                                     │
│  ├─ State Locking                                            │
│  ├─ Workspace Management                                     │
│  ├─ VCS Integration (GitHub, GitLab, Bitbucket)              │
│  ├─ Remote Plan/Apply                                        │
│  ├─ Run History & Audit Logs                                 │
│  └─ Secure Variable Storage                                  │
│                                                              │
│  PAID FEATURES:                                              │
│  ├─ Team Management & RBAC                                   │
│  ├─ Policy as Code (Sentinel)                                │
│  ├─ Cost Estimation                                          │
│  ├─ Private Module Registry                                  │
│  ├─ SSO/SAML Integration                                     │
│  ├─ Audit Logging                                            │
│  └─ Concurrent Runs                                          │
│                                                              │
│  ENTERPRISE-ONLY:                                            │
│  ├─ Self-hosted Deployment                                   │
│  ├─ Air-gapped Installations                                 │
│  ├─ Clustering & High Availability                           │
│  └─ Advanced Security Features                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Setting Up Terraform Cloud

#### Step 1: Configure Terraform Cloud Backend

```hcl
# main.tf

terraform {
  cloud {
    organization = "my-company"

    workspaces {
      name = "my-app-production"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
```

#### Step 2: Login and Initialize

```bash
# Login to Terraform Cloud
terraform login

# This opens browser for authentication
# Or manually create token at: https://app.terraform.io/app/settings/tokens

# Initialize
terraform init
```

#### Step 3: Configure Variables

In Terraform Cloud UI or via CLI:

```bash
# Set environment variables (for AWS credentials)
# In Terraform Cloud UI:
# - Navigate to Workspace > Variables
# - Add Environment Variables:
#   AWS_ACCESS_KEY_ID (sensitive)
#   AWS_SECRET_ACCESS_KEY (sensitive)

# Terraform Variables (for your .tf files)
# Add Terraform Variables:
#   region = "us-east-1"
#   instance_type = "t3.micro"
```

### Remote Execution Workflow

```
┌──────────────────────────────────────────────────────────────┐
│              TERRAFORM CLOUD EXECUTION FLOW                  │
└──────────────────────────────────────────────────────────────┘

    LOCAL MACHINE                    TERRAFORM CLOUD

    ┌──────────────┐                ┌──────────────┐
    │              │                │              │
    │  git push    │───────────────>│  VCS Trigger │
    │              │                │              │
    └──────────────┘                └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │              │
                                    │  Queue Run   │
                                    │              │
                                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │              │
                                    │ Terraform    │
                                    │ Plan (Auto)  │
                                    │              │
                                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │              │
                                    │ Wait for     │
                                    │ Approval     │
                                    │              │
                                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │              │
                                    │ Terraform    │
                                    │ Apply        │
                                    │              │
                                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │              │
                                    │ Update State │
                                    │              │
                                    └──────────────┘
```

### Policy as Code (Sentinel)

Sentinel is HashiCorp's policy as code framework available in Terraform Cloud/Enterprise.

#### Example Sentinel Policy: Enforce Instance Types

```python
# enforce-instance-type.sentinel

import "tfplan/v2" as tfplan

# Allowed instance types
allowed_types = ["t3.micro", "t3.small", "t3.medium"]

# Get all EC2 instances
ec2_instances = filter tfplan.resource_changes as _, rc {
  rc.type is "aws_instance" and
  rc.mode is "managed" and
  (rc.change.actions contains "create" or rc.change.actions contains "update")
}

# Validation function
validate_instance_type = func(instance) {
  instance_type = instance.change.after.instance_type
  return instance_type in allowed_types
}

# Main rule
main = rule {
  all ec2_instances as _, instance {
    validate_instance_type(instance)
  }
}
```

#### Policy Set Configuration

```hcl
# sentinel.hcl

policy "enforce-instance-type" {
  enforcement_level = "hard-mandatory"  # Blocks apply if fails
}

policy "require-tags" {
  enforcement_level = "soft-mandatory"  # Warning, can be overridden
}

policy "cost-limit" {
  enforcement_level = "advisory"  # Just a warning
}
```

### Cost Estimation

Terraform Cloud provides cost estimates before applying changes.

```
┌──────────────────────────────────────────────────────────────┐
│                    COST ESTIMATION EXAMPLE                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Plan: 3 to add, 0 to change, 0 to destroy.                  │
│                                                              │
│  Cost Estimation:                                            │
│                                                              │
│  + aws_instance.web                                          │
│    └─ Instance usage (Linux/UNIX, on-demand, t3.medium)      │
│       $30.37/mo                                              │
│                                                              │
│  + aws_db_instance.postgres                                  │
│    └─ Database instance (db.t3.medium)                       │
│       $60.74/mo                                              │
│    └─ Storage (100 GB)                                       │
│       $11.50/mo                                              │
│                                                              │
│  + aws_lb.application                                        │
│    └─ Application load balancer                              │
│       $22.63/mo                                              │
│                                                              │
│  Monthly Cost Estimate: $125.24                              │
│  ─────────────────────────────────────────                   │
│  Previous: $0.00                                             │
│  Delta: +$125.24/mo (+100%)                                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Private Module Registry

Share modules privately within your organization.

#### Publishing a Module

```
Repository Structure:
terraform-aws-vpc/
├── main.tf
├── variables.tf
├── outputs.tf
└── README.md

Repository naming convention:
terraform-<PROVIDER>-<NAME>

Example: terraform-aws-vpc
```

#### Using Private Modules

```hcl
# main.tf

module "vpc" {
  source  = "app.terraform.io/my-company/vpc/aws"
  version = "1.2.0"

  cidr_block = "10.0.0.0/16"
  name       = "production-vpc"
}
```

### VCS-Driven Workflow

```bash
# Workspace Settings in Terraform Cloud UI:

VCS Connection:
  Repository: github.com/my-company/infrastructure
  Branch: main
  Working Directory: environments/production

Trigger Settings:
  ✅ Automatic run triggering
  ☐ Automatic speculative plans on PR

Apply Method:
  ◉ Manual apply
  ○ Auto apply
```

## Secrets Management

Properly managing secrets is critical for security. Never store secrets in plain text in your Terraform code or state files.

### The Problem

```hcl
# ❌ NEVER DO THIS - Hardcoded secrets

resource "aws_db_instance" "database" {
  identifier = "mydb"

  # BAD: Hardcoded credentials
  username = "admin"
  password = "SuperSecret123!"  # This will be in state file!

  engine         = "postgres"
  instance_class = "db.t3.micro"
}
```

### Solution 1: Using the `sensitive` Attribute

```hcl
# variables.tf

variable "db_password" {
  description = "Database administrator password"
  type        = string
  sensitive   = true  # Won't show in logs
}

# main.tf

resource "aws_db_instance" "database" {
  identifier = "mydb"
  username   = "admin"
  password   = var.db_password

  engine         = "postgres"
  instance_class = "db.t3.micro"
}

# outputs.tf

output "db_endpoint" {
  value     = aws_db_instance.database.endpoint
  sensitive = false
}

output "db_password" {
  value     = aws_db_instance.database.password
  sensitive = true  # Won't display in terraform output
}
```

```bash
# Pass secrets via command line (not ideal for automation)
terraform apply -var="db_password=SecretValue123"

# Or via environment variable (better)
export TF_VAR_db_password="SecretValue123"
terraform apply
```

### Solution 2: AWS Secrets Manager

```hcl
# Create secret in AWS Secrets Manager
resource "aws_secretsmanager_secret" "db_password" {
  name        = "production/database/password"
  description = "RDS database password"
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = random_password.db_password.result
}

# Generate random password
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Use secret in RDS
resource "aws_db_instance" "database" {
  identifier = "mydb"
  username   = "admin"
  password   = random_password.db_password.result

  engine         = "postgres"
  instance_class = "db.t3.micro"
}

# Application can retrieve secret at runtime
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = aws_secretsmanager_secret.db_password.id
}
```

### Solution 3: HashiCorp Vault

```hcl
# Configure Vault provider
provider "vault" {
  address = "https://vault.example.com:8200"
  # Token from environment variable: VAULT_TOKEN
}

# Read secret from Vault
data "vault_generic_secret" "db_credentials" {
  path = "secret/database/production"
}

# Use in RDS
resource "aws_db_instance" "database" {
  identifier = "mydb"
  username   = data.vault_generic_secret.db_credentials.data["username"]
  password   = data.vault_generic_secret.db_credentials.data["password"]

  engine         = "postgres"
  instance_class = "db.t3.micro"
}
```

### Solution 4: AWS SSM Parameter Store

```hcl
# Store parameter
resource "aws_ssm_parameter" "db_password" {
  name        = "/production/database/password"
  description = "RDS database password"
  type        = "SecureString"
  value       = random_password.db_password.result

  tags = {
    Environment = "production"
  }
}

# Read parameter
data "aws_ssm_parameter" "db_password" {
  name            = "/production/database/password"
  with_decryption = true
}

# Use in resource
resource "aws_db_instance" "database" {
  identifier = "mydb"
  username   = "admin"
  password   = data.aws_ssm_parameter.db_password.value

  engine         = "postgres"
  instance_class = "db.t3.micro"
}
```

### Best Practices for Secrets

```
┌──────────────────────────────────────────────────────────────┐
│                 SECRETS MANAGEMENT BEST PRACTICES            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  DO:                                                         │
│  ✅ Use environment variables (TF_VAR_*)                     │
│  ✅ Use external secret managers (Vault, AWS Secrets)        │
│  ✅ Mark variables as sensitive = true                       │
│  ✅ Use random_password for generating secrets               │
│  ✅ Encrypt state files (backend encryption)                 │
│  ✅ Limit access to state files                              │
│  ✅ Use IAM roles instead of access keys when possible       │
│  ✅ Rotate secrets regularly                                 │
│                                                              │
│  DON'T:                                                      │
│  ❌ Hardcode secrets in .tf files                            │
│  ❌ Commit secrets to version control                        │
│  ❌ Use plain text in .tfvars files for secrets              │
│  ❌ Share state files publicly                               │
│  ❌ Log sensitive values                                     │
│  ❌ Store secrets in CI/CD logs                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Avoiding Secrets in State

Even with `sensitive = true`, secrets still appear in state files. Strategies to minimize this:

```hcl
# Strategy 1: Generate secrets outside Terraform
# Use AWS Lambda, Cloud Functions to generate and rotate

# Strategy 2: Reference existing secrets
data "aws_secretsmanager_secret_version" "existing" {
  secret_id = "arn:aws:secretsmanager:us-east-1:123456789:secret:prod-db"
}

# Strategy 3: Use provider-managed passwords
resource "aws_db_instance" "database" {
  identifier = "mydb"
  username   = "admin"

  # Let AWS manage the password
  manage_master_user_password = true

  engine         = "postgres"
  instance_class = "db.t3.micro"
}
```

## Testing Terraform Code

Testing ensures your infrastructure code works as expected before deploying to production.

### Testing Pyramid for Terraform

```
┌──────────────────────────────────────────────────────────────────────┐
│                     TERRAFORM TESTING PYRAMID                        │
└──────────────────────────────────────────────────────────────────────┘

                    ┌───────────────┐
                    │   Manual      │  Slowest, most expensive
                    │   Testing     │  Production validation
                    └───────────────┘
                  ┌───────────────────┐
                  │  Integration      │  Deploy to test environment
                  │  Tests            │  Terratest, Kitchen-Terraform
                  │  (Terratest)      │
                  └───────────────────┘
              ┌──────────────────────────┐
              │   Unit Tests             │  Test modules in isolation
              │   (terraform plan)       │  Fast feedback
              └──────────────────────────┘
          ┌────────────────────────────────────┐
          │   Static Analysis                  │  Fastest, cheapest
          │   (validate, fmt, tflint)          │  Run on every commit
          └────────────────────────────────────┘
```

### Level 1: Static Analysis

#### terraform validate

```bash
# Validates configuration syntax and internal consistency
terraform validate

# Example output for valid config:
# Success! The configuration is valid.

# Example output for invalid config:
# Error: Unsupported argument
#   on main.tf line 5, in resource "aws_instance" "web":
#   5:   invalid_argument = "value"
# An argument named "invalid_argument" is not expected here.
```

#### terraform fmt

```bash
# Format code to canonical style
terraform fmt

# Check formatting without making changes
terraform fmt -check

# Format recursively
terraform fmt -recursive

# Use in CI/CD:
if ! terraform fmt -check -recursive; then
  echo "Terraform files are not formatted correctly"
  exit 1
fi
```

#### TFLint

TFLint is a pluggable linter for Terraform.

```bash
# Install tflint
curl -s https://raw.githubusercontent.com/terraform-linters/tflint/master/install_linux.sh | bash

# Configure tflint
cat > .tflint.hcl <<EOF
plugin "aws" {
  enabled = true
  version = "0.27.0"
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}

rule "terraform_deprecated_interpolation" {
  enabled = true
}

rule "terraform_unused_declarations" {
  enabled = true
}

rule "terraform_naming_convention" {
  enabled = true
}
EOF

# Run tflint
tflint --init
tflint
```

### Level 2: Unit Testing with Terraform Plan

```bash
# Create a test to ensure plan shows expected resources

#!/bin/bash
# test-plan.sh

set -e

# Initialize
terraform init

# Create plan
terraform plan -out=tfplan

# Convert to JSON
terraform show -json tfplan > plan.json

# Test assertions using jq
INSTANCE_COUNT=$(jq '[.planned_values.root_module.resources[] | select(.type=="aws_instance")] | length' plan.json)

if [ "$INSTANCE_COUNT" -ne 2 ]; then
  echo "Expected 2 instances, got $INSTANCE_COUNT"
  exit 1
fi

echo "✓ Plan validation passed"
```

### Level 3: Integration Testing with Terratest

Terratest is a Go library for automated infrastructure testing.

#### Installation

```bash
# Install Go
# Download from: https://golang.org/dl/

# Create test directory
mkdir -p test
cd test
go mod init github.com/mycompany/infrastructure-tests
go get github.com/gruntwork-io/terratest/modules/terraform
```

#### Example Terratest

```go
// test/terraform_aws_example_test.go

package test

import (
    "testing"
    "github.com/gruntwork-io/terratest/modules/terraform"
    "github.com/stretchr/testify/assert"
)

func TestTerraformAwsInstance(t *testing.T) {
    t.Parallel()

    // Terraform options
    terraformOptions := terraform.WithDefaultRetryableErrors(t, &terraform.Options{
        // Path to Terraform code
        TerraformDir: "../examples/basic",

        // Variables to pass
        Vars: map[string]interface{}{
            "instance_type": "t3.micro",
            "environment":   "test",
        },

        // Environment variables
        EnvVars: map[string]string{
            "AWS_DEFAULT_REGION": "us-east-1",
        },
    })

    // Clean up resources after test
    defer terraform.Destroy(t, terraformOptions)

    // Run terraform init and apply
    terraform.InitAndApply(t, terraformOptions)

    // Run validations
    instanceId := terraform.Output(t, terraformOptions, "instance_id")
    assert.NotEmpty(t, instanceId)

    instanceType := terraform.Output(t, terraformOptions, "instance_type")
    assert.Equal(t, "t3.micro", instanceType)
}
```

#### Running Terratest

```bash
# Run all tests
cd test
go test -v -timeout 30m

# Run specific test
go test -v -timeout 30m -run TestTerraformAwsInstance

# Run tests in parallel
go test -v -timeout 30m -parallel 10
```

### Pre-commit Hooks

Automatically run tests before commits.

#### Installation

```bash
# Install pre-commit
pip install pre-commit

# Or on macOS
brew install pre-commit
```

#### Configuration

```yaml
# .pre-commit-config.yaml

repos:
  - repo: https://github.com/antonbabenko/pre-commit-terraform
    rev: v1.83.5
    hooks:
      - id: terraform_fmt
      - id: terraform_validate
      - id: terraform_docs
      - id: terraform_tflint
        args:
          - --args=--config=__GIT_WORKING_DIR__/.tflint.hcl
      - id: terraform_tfsec
        args:
          - --args=--config-file=__GIT_WORKING_DIR__/.tfsec.yml

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: check-merge-conflict
```

#### Setup

```bash
# Install git hooks
pre-commit install

# Run manually on all files
pre-commit run --all-files

# Update hooks
pre-commit autoupdate
```

### Automated Testing Strategy

```
┌──────────────────────────────────────────────────────────────┐
│            AUTOMATED TESTING WORKFLOW                        │
└──────────────────────────────────────────────────────────────┘

DEVELOPER WORKFLOW:

  ┌─────────────────┐
  │ Write Code      │
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ Pre-commit      │  - terraform fmt
  │ Hooks Run       │  - terraform validate
  └────────┬────────┘  - tflint
           │           - tfsec
           ▼
  ┌─────────────────┐
  │ Git Commit      │
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ Git Push        │
  └────────┬────────┘
           │
           ▼

CI/CD PIPELINE:

  ┌─────────────────┐
  │ Trigger CI      │
  └────────┬────────┘
           │
           ├────────────┬────────────┬────────────┐
           ▼            ▼            ▼            ▼
  ┌──────────────┐ ┌────────┐ ┌──────────┐ ┌────────┐
  │ Format Check │ │ Lint   │ │ Validate │ │ Plan   │
  └──────────────┘ └────────┘ └──────────┘ └────────┘
           │            │            │            │
           └────────────┴────────────┴────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │ Unit Tests       │
              │ (terraform plan) │
              └─────────┬────────┘
                        │
                        ▼
              ┌──────────────────┐
              │ Integration Tests│
              │ (Terratest)      │
              └─────────┬────────┘
                        │
                        ▼
              ┌──────────────────┐
              │ Manual Approval  │
              └─────────┬────────┘
                        │
                        ▼
              ┌──────────────────┐
              │ Deploy           │
              └──────────────────┘
```

## CI/CD Integration

Integrating Terraform with CI/CD pipelines enables automated, consistent infrastructure deployments.

### GitOps Workflow

```
┌──────────────────────────────────────────────────────────────┐
│                    GITOPS WORKFLOW                           │
└──────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │ Developer    │
    │ commits code │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ Pull Request │
    │ Created      │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────┐
    │ CI Pipeline:     │
    │ - terraform fmt  │
    │ - terraform plan │
    │ - Post plan to PR│
    └──────┬───────────┘
           │
           ▼
    ┌──────────────┐
    │ Code Review  │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ Merge to     │
    │ main branch  │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────┐
    │ CD Pipeline:     │
    │ - terraform apply│
    └──────────────────┘
```

### GitHub Actions Example

```yaml
# .github/workflows/terraform.yml

name: Terraform CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

env:
  TF_VERSION: 1.6.0
  AWS_REGION: us-east-1

jobs:
  terraform-check:
    name: Terraform Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - name: Terraform Format Check
        run: terraform fmt -check -recursive

      - name: Terraform Init
        run: terraform init
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: Terraform Validate
        run: terraform validate

      - name: TFLint
        uses: terraform-linters/setup-tflint@v4
        with:
          tflint_version: latest

      - name: Run TFLint
        run: |
          tflint --init
          tflint -f compact

  terraform-plan:
    name: Terraform Plan
    runs-on: ubuntu-latest
    needs: terraform-check
    if: github.event_name == 'pull_request'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - name: Terraform Init
        run: terraform init
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: Terraform Plan
        id: plan
        run: terraform plan -no-color -out=tfplan
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        continue-on-error: true

      - name: Post Plan to PR
        uses: actions/github-script@v7
        if: github.event_name == 'pull_request'
        env:
          PLAN: "terraform\n${{ steps.plan.outputs.stdout }}"
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const output = `#### Terraform Plan 📖

            <details><summary>Show Plan</summary>

            \`\`\`hcl
            ${process.env.PLAN}
            \`\`\`

            </details>

            *Pushed by: @${{ github.actor }}, Action: \`${{ github.event_name }}\`*`;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: output
            })

  terraform-apply:
    name: Terraform Apply
    runs-on: ubuntu-latest
    needs: terraform-check
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - name: Terraform Init
        run: terraform init
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: Terraform Apply
        run: terraform apply -auto-approve
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### GitLab CI Example

```yaml
# .gitlab-ci.yml

image:
  name: hashicorp/terraform:1.6
  entrypoint: [""]

variables:
  TF_ROOT: ${CI_PROJECT_DIR}
  TF_IN_AUTOMATION: "true"

cache:
  paths:
    - ${TF_ROOT}/.terraform

stages:
  - validate
  - plan
  - apply

before_script:
  - cd ${TF_ROOT}
  - terraform --version
  - terraform init

validate:
  stage: validate
  script:
    - terraform fmt -check -recursive
    - terraform validate
  only:
    - merge_requests
    - main

plan:
  stage: plan
  script:
    - terraform plan -out=tfplan
    - terraform show -no-color tfplan > plan.txt
  artifacts:
    paths:
      - ${TF_ROOT}/tfplan
      - ${TF_ROOT}/plan.txt
    expire_in: 1 week
  only:
    - merge_requests
    - main

apply:
  stage: apply
  script:
    - terraform apply -auto-approve tfplan
  dependencies:
    - plan
  only:
    - main
  when: manual
  environment:
    name: production
```

### Atlantis for PR Automation

Atlantis is a tool for automating Terraform via pull requests.

#### Atlantis Server Configuration

```yaml
# atlantis.yaml (in repository root)

version: 3

automerge: false
delete_source_branch_on_merge: false

projects:
  - name: production
    dir: environments/production
    workspace: default
    autoplan:
      when_modified: ["*.tf", "*.tfvars"]
      enabled: true
    apply_requirements:
      - approved
      - mergeable

  - name: staging
    dir: environments/staging
    workspace: default
    autoplan:
      when_modified: ["*.tf", "*.tfvars"]
      enabled: true
    apply_requirements:
      - approved

workflows:
  default:
    plan:
      steps:
        - init
        - plan
    apply:
      steps:
        - apply

  custom:
    plan:
      steps:
        - run: terraform fmt -check
        - init
        - plan
    apply:
      steps:
        - run: echo "Applying changes..."
        - apply
        - run: echo "Apply complete!"
```

#### Atlantis Commands

```bash
# In Pull Request comments:

# Run plan
atlantis plan

# Run plan for specific project
atlantis plan -p production

# Apply changes
atlantis apply

# Apply for specific project
atlantis apply -p production

# Show help
atlantis help
```

### Best Practices for CI/CD

```
┌──────────────────────────────────────────────────────────────┐
│              CI/CD BEST PRACTICES                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  SECURITY:                                                   │
│  ✅ Store credentials in CI/CD secrets                       │
│  ✅ Use OIDC/assume role instead of static credentials       │
│  ✅ Minimize permissions (least privilege)                   │
│  ✅ Encrypt state backend                                    │
│  ✅ Enable state locking                                     │
│                                                              │
│  AUTOMATION:                                                 │
│  ✅ Run terraform plan on every PR                           │
│  ✅ Post plan output to PR comments                          │
│  ✅ Require approval before apply                            │
│  ✅ Run validate and fmt checks                              │
│  ✅ Use consistent Terraform versions                        │
│                                                              │
│  WORKFLOW:                                                   │
│  ✅ Separate plan and apply jobs                             │
│  ✅ Use manual approval for production                       │
│  ✅ Tag releases                                             │
│  ✅ Keep plan artifacts                                      │
│  ✅ Set timeouts for jobs                                    │
│                                                              │
│  VISIBILITY:                                                 │
│  ✅ Post plan results to PR                                  │
│  ✅ Send notifications on failures                           │
│  ✅ Track apply history                                      │
│  ✅ Monitor infrastructure drift                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Handling Terraform Apply Failures

Understanding how Terraform handles failures is crucial for recovery and maintaining infrastructure integrity.

### What Happens During a Failed Apply

```
┌──────────────────────────────────────────────────────────────┐
│              TERRAFORM APPLY FAILURE SCENARIO                │
└──────────────────────────────────────────────────────────────┘

Planned Changes:
  + Create VPC
  + Create Subnet (depends on VPC)
  + Create EC2 Instance (depends on Subnet)
  + Create RDS Database

Execution:

  ✅ VPC Created (state updated)
  ✅ Subnet Created (state updated)
  ❌ EC2 Instance FAILED (API timeout)
  ⏸  RDS Database (not attempted)

Result:
  - VPC and Subnet exist in AWS and state
  - EC2 Instance doesn't exist (or partially exists)
  - RDS Database not created
  - State file reflects only successful operations
```

### Understanding Tainted Resources

Before Terraform 0.15.2, resources could be "tainted" when creation partially succeeded.

```bash
# Legacy command (deprecated)
terraform taint aws_instance.web

# Modern approach: use -replace
terraform apply -replace="aws_instance.web"

# The -replace flag tells Terraform to destroy and recreate the resource
```

### Recovery Strategies

#### Strategy 1: Simply Re-run Apply

```bash
# Most common solution - just run apply again
terraform apply

# Terraform will:
# 1. Skip resources already in desired state
# 2. Retry failed operations
# 3. Continue with remaining operations
```

#### Strategy 2: Targeted Apply

```bash
# Apply only specific resources
terraform apply -target=aws_instance.web

# Apply multiple targets
terraform apply \
  -target=aws_instance.web \
  -target=aws_db_instance.database

# Warning: Use sparingly - can lead to dependency issues
```

#### Strategy 3: Import Partially Created Resources

```bash
# If resource was partially created but state wasn't updated
# Find the resource ID in AWS console
INSTANCE_ID="i-1234567890abcdef0"

# Import into state
terraform import aws_instance.web $INSTANCE_ID

# Then run plan to see if any updates needed
terraform plan

# Apply any remaining changes
terraform apply
```

#### Strategy 4: Manual Cleanup and Retry

```bash
# 1. Check what exists in AWS
aws ec2 describe-instances --filters "Name=tag:Name,Values=my-instance"

# 2. If resource exists but not in state, import it
terraform import aws_instance.web i-1234567890abcdef0

# 3. If resource is broken, manually delete it
aws ec2 terminate-instances --instance-ids i-1234567890abcdef0

# 4. Remove from state if needed
terraform state rm aws_instance.web

# 5. Re-run apply
terraform apply
```

### Common Failure Scenarios

#### Scenario 1: API Rate Limiting

```
Error: Error creating EC2 Instance: RequestLimitExceeded
```

```bash
# Solution: Wait and retry
sleep 60
terraform apply

# Or use auto-retry in provider configuration
provider "aws" {
  region = "us-east-1"

  max_retries = 10
}
```

#### Scenario 2: Resource Already Exists

```
Error: Error creating S3 Bucket: BucketAlreadyOwnedByYou
```

```bash
# Solution: Import the existing resource
terraform import aws_s3_bucket.example my-bucket-name

# Then apply
terraform apply
```

#### Scenario 3: Dependency Failure

```
Error: Error creating EC2 Instance: InvalidSubnetID.NotFound
```

```bash
# Solution 1: Check dependencies
terraform state show aws_subnet.main

# Solution 2: Recreate dependencies
terraform apply -target=aws_subnet.main
terraform apply
```

#### Scenario 4: Insufficient Permissions

```
Error: Error creating EC2 Instance: UnauthorizedOperation
```

```bash
# Solution: Check IAM permissions
aws sts get-caller-identity

# Verify required permissions
# Fix IAM policy, then retry
terraform apply
```

### Rollback Approaches

Terraform doesn't have built-in rollback, but you can achieve it:

#### Approach 1: Version Control Rollback

```bash
# Revert to previous commit
git log --oneline
git revert HEAD

# Apply previous configuration
terraform apply
```

#### Approach 2: State Rollback

```bash
# List state backups (if using remote backend)
terraform state list

# For S3 backend, restore previous version
aws s3api list-object-versions \
  --bucket my-terraform-state \
  --prefix production/terraform.tfstate

# Download specific version
aws s3api get-object \
  --bucket my-terraform-state \
  --key production/terraform.tfstate \
  --version-id <VERSION_ID> \
  terraform.tfstate.backup

# Restore (be very careful!)
cp terraform.tfstate.backup terraform.tfstate
terraform state push terraform.tfstate.backup
```

#### Approach 3: Destroy and Recreate

```bash
# For non-critical resources
terraform destroy -target=aws_instance.broken
terraform apply
```

### Prevention Best Practices

```
┌──────────────────────────────────────────────────────────────┐
│           PREVENTING APPLY FAILURES                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  BEFORE APPLY:                                               │
│  ✅ Always run terraform plan first                          │
│  ✅ Review plan output carefully                             │
│  ✅ Test in non-production environment                       │
│  ✅ Check provider credentials                               │
│  ✅ Verify resource limits and quotas                        │
│  ✅ Ensure state locking is working                          │
│                                                              │
│  DURING APPLY:                                               │
│  ✅ Monitor apply progress                                   │
│  ✅ Don't interrupt running applies                          │
│  ✅ Have rollback plan ready                                 │
│                                                              │
│  CONFIGURATION:                                              │
│  ✅ Use lifecycle blocks for critical resources              │
│  ✅ Set appropriate timeouts                                 │
│  ✅ Use create_before_destroy when needed                    │
│  ✅ Implement proper error handling                          │
│                                                              │
│  STATE MANAGEMENT:                                           │
│  ✅ Enable state file versioning                             │
│  ✅ Regular state backups                                    │
│  ✅ Use remote backend with locking                          │
│  ✅ Monitor state file integrity                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Lifecycle Configuration for Safety

```hcl
resource "aws_instance" "critical" {
  ami           = "ami-12345678"
  instance_type = "t3.micro"

  lifecycle {
    # Prevent accidental deletion
    prevent_destroy = true

    # Create new before destroying old
    create_before_destroy = true

    # Ignore changes to specific attributes
    ignore_changes = [
      tags["LastModified"],
      user_data,
    ]
  }

  # Set timeouts
  timeouts {
    create = "60m"
    update = "30m"
    delete = "30m"
  }
}
```

## Multi-Region and Multi-Account Strategies

Managing infrastructure across multiple regions and AWS accounts requires careful planning and organization.

### Provider Aliases for Multi-Region

```hcl
# Configure multiple providers for different regions

provider "aws" {
  region = "us-east-1"
  alias  = "primary"
}

provider "aws" {
  region = "us-west-2"
  alias  = "secondary"
}

provider "aws" {
  region = "eu-west-1"
  alias  = "europe"
}

# Use primary region
resource "aws_vpc" "primary" {
  provider = aws.primary

  cidr_block = "10.0.0.0/16"

  tags = {
    Name   = "primary-vpc"
    Region = "us-east-1"
  }
}

# Use secondary region
resource "aws_vpc" "secondary" {
  provider = aws.secondary

  cidr_block = "10.1.0.0/16"

  tags = {
    Name   = "secondary-vpc"
    Region = "us-west-2"
  }
}

# Use Europe region
resource "aws_vpc" "europe" {
  provider = aws.europe

  cidr_block = "10.2.0.0/16"

  tags = {
    Name   = "europe-vpc"
    Region = "eu-west-1"
  }
}
```

### Cross-Region Replication Example

```hcl
# S3 bucket replication across regions

# Primary bucket (us-east-1)
resource "aws_s3_bucket" "primary" {
  provider = aws.primary
  bucket   = "my-replicated-bucket-primary"
}

resource "aws_s3_bucket_versioning" "primary" {
  provider = aws.primary
  bucket   = aws_s3_bucket.primary.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Replica bucket (us-west-2)
resource "aws_s3_bucket" "replica" {
  provider = aws.secondary
  bucket   = "my-replicated-bucket-replica"
}

resource "aws_s3_bucket_versioning" "replica" {
  provider = aws.secondary
  bucket   = aws_s3_bucket.replica.id

  versioning_configuration {
    status = "Enabled"
  }
}

# IAM role for replication
resource "aws_iam_role" "replication" {
  provider = aws.primary
  name     = "s3-bucket-replication"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "s3.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "replication" {
  provider = aws.primary
  role     = aws_iam_role.replication.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetReplicationConfiguration",
          "s3:ListBucket"
        ]
        Effect = "Allow"
        Resource = [
          aws_s3_bucket.primary.arn
        ]
      },
      {
        Action = [
          "s3:GetObjectVersionForReplication",
          "s3:GetObjectVersionAcl"
        ]
        Effect = "Allow"
        Resource = [
          "${aws_s3_bucket.primary.arn}/*"
        ]
      },
      {
        Action = [
          "s3:ReplicateObject",
          "s3:ReplicateDelete"
        ]
        Effect = "Allow"
        Resource = [
          "${aws_s3_bucket.replica.arn}/*"
        ]
      }
    ]
  })
}

# Replication configuration
resource "aws_s3_bucket_replication_configuration" "replication" {
  provider = aws.primary

  depends_on = [aws_s3_bucket_versioning.primary]

  role   = aws_iam_role.replication.arn
  bucket = aws_s3_bucket.primary.id

  rule {
    id     = "replicate-all"
    status = "Enabled"

    destination {
      bucket        = aws_s3_bucket.replica.arn
      storage_class = "STANDARD"
    }
  }
}
```

### Multi-Account Strategy with Assume Role

```hcl
# Provider configuration for multiple AWS accounts

# Account 1: Development (default)
provider "aws" {
  region = "us-east-1"
  alias  = "dev"
}

# Account 2: Staging (assume role)
provider "aws" {
  region = "us-east-1"
  alias  = "staging"

  assume_role {
    role_arn     = "arn:aws:iam::222222222222:role/TerraformRole"
    session_name = "terraform-staging"
  }
}

# Account 3: Production (assume role)
provider "aws" {
  region = "us-east-1"
  alias  = "production"

  assume_role {
    role_arn     = "arn:aws:iam::333333333333:role/TerraformRole"
    session_name = "terraform-production"
    external_id  = "unique-external-id"
  }
}

# Resources in different accounts
resource "aws_vpc" "dev" {
  provider   = aws.dev
  cidr_block = "10.0.0.0/16"

  tags = {
    Environment = "development"
    Account     = "111111111111"
  }
}

resource "aws_vpc" "staging" {
  provider   = aws.staging
  cidr_block = "10.1.0.0/16"

  tags = {
    Environment = "staging"
    Account     = "222222222222"
  }
}

resource "aws_vpc" "production" {
  provider   = aws.production
  cidr_block = "10.2.0.0/16"

  tags = {
    Environment = "production"
    Account     = "333333333333"
  }
}
```

### IAM Role Setup for Cross-Account Access

```hcl
# In the target account (e.g., production account)
# Create a role that Terraform can assume

resource "aws_iam_role" "terraform_role" {
  name = "TerraformRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::111111111111:root"  # Dev account
        }
        Condition = {
          StringEquals = {
            "sts:ExternalId" = "unique-external-id"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "terraform_role" {
  role       = aws_iam_role.terraform_role.name
  policy_arn = "arn:aws:iam::aws:policy/PowerUserAccess"
}
```

### Directory Structure for Multi-Account/Region

```
terraform/
├── modules/
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── ec2/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
├── environments/
│   ├── dev/
│   │   ├── us-east-1/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── terraform.tfvars
│   │   └── us-west-2/
│   │       ├── main.tf
│   │       ├── variables.tf
│   │       └── terraform.tfvars
│   │
│   ├── staging/
│   │   ├── us-east-1/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── terraform.tfvars
│   │   └── eu-west-1/
│   │       ├── main.tf
│   │       ├── variables.tf
│   │       └── terraform.tfvars
│   │
│   └── production/
│       ├── us-east-1/
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   └── terraform.tfvars
│       ├── us-west-2/
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   └── terraform.tfvars
│       └── eu-west-1/
│           ├── main.tf
│           ├── variables.tf
│           └── terraform.tfvars
│
└── global/
    ├── iam/
    │   ├── main.tf
    │   └── variables.tf
    └── route53/
        ├── main.tf
        └── variables.tf
```

### Account Isolation Patterns

```
┌──────────────────────────────────────────────────────────────┐
│           MULTI-ACCOUNT ISOLATION PATTERNS                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  PATTERN 1: Environment-Based Accounts                       │
│  ├─ Development Account (111111111111)                       │
│  ├─ Staging Account (222222222222)                           │
│  └─ Production Account (333333333333)                        │
│                                                              │
│  PATTERN 2: Team-Based Accounts                              │
│  ├─ Platform Team Account                                    │
│  ├─ Application Team A Account                               │
│  └─ Application Team B Account                               │
│                                                              │
│  PATTERN 3: Service-Based Accounts                           │
│  ├─ Networking Account (VPC, Transit Gateway)                │
│  ├─ Security Account (GuardDuty, SecurityHub)                │
│  ├─ Logging Account (CloudWatch, CloudTrail)                 │
│  └─ Application Accounts                                     │
│                                                              │
│  PATTERN 4: Regional Isolation                               │
│  ├─ US Operations Account                                    │
│  ├─ EU Operations Account                                    │
│  └─ APAC Operations Account                                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Best Practices for Multi-Account/Region

```
┌──────────────────────────────────────────────────────────────┐
│         MULTI-ACCOUNT/REGION BEST PRACTICES                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ORGANIZATION:                                               │
│  ✅ Use consistent naming conventions                        │
│  ✅ Separate state files per account/region                  │
│  ✅ Use modules for reusable components                      │
│  ✅ Document account/region mappings                         │
│                                                              │
│  SECURITY:                                                   │
│  ✅ Use assume role for cross-account access                 │
│  ✅ Implement least privilege IAM policies                   │
│  ✅ Use external IDs for added security                      │
│  ✅ Rotate credentials regularly                             │
│  ✅ Enable CloudTrail in all accounts                        │
│                                                              │
│  STATE MANAGEMENT:                                           │
│  ✅ Separate backend per environment                         │
│  ✅ Use workspace or directory structure                     │
│  ✅ Enable state locking                                     │
│  ✅ Implement state file naming convention                   │
│                                                              │
│  NETWORKING:                                                 │
│  ✅ Plan CIDR blocks to avoid conflicts                      │
│  ✅ Use Transit Gateway for cross-account connectivity       │
│  ✅ Implement DNS resolution across accounts                 │
│  ✅ Document network topology                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Debugging and Troubleshooting

Effective debugging is essential for diagnosing and resolving Terraform issues.

### TF_LOG Environment Variable

Terraform provides detailed logging through the `TF_LOG` environment variable.

```bash
# Log levels (from least to most verbose)
# - OFF (default)
# - ERROR
# - WARN
# - INFO
# - DEBUG
# - TRACE

# Enable debug logging
export TF_LOG=DEBUG
terraform apply

# Enable trace logging (most verbose)
export TF_LOG=TRACE
terraform apply

# Log specific components
export TF_LOG_CORE=TRACE    # Terraform core
export TF_LOG_PROVIDER=DEBUG # Provider plugin

# Save logs to file
export TF_LOG=TRACE
export TF_LOG_PATH=./terraform.log
terraform apply

# Disable logging
unset TF_LOG
unset TF_LOG_PATH
```

### Example Debug Session

```bash
# Step 1: Enable logging
export TF_LOG=DEBUG
export TF_LOG_PATH=./debug.log

# Step 2: Run terraform command
terraform apply

# Step 3: Review logs
less debug.log

# Step 4: Search for specific errors
grep -i "error" debug.log
grep -i "failed" debug.log

# Step 5: Check provider API calls
grep -i "http" debug.log
```

### Crash Logs

When Terraform crashes, it creates a crash log.

```bash
# Crash log location
# - Linux/Mac: ./crash.log
# - Windows: .\crash.log

# View crash log
cat crash.log

# Example crash log content:
# panic: runtime error: invalid memory address
#
# goroutine 1 [running]:
# github.com/hashicorp/terraform/...
```

### Common Errors and Solutions

#### Error 1: Resource Already Exists

```
Error: Error creating S3 Bucket: BucketAlreadyOwnedByYou:
Your previous request to create the named bucket succeeded and you already own it.
```

```bash
# Solution: Import existing resource
terraform import aws_s3_bucket.example my-bucket-name
terraform apply
```

#### Error 2: Dependency Violations

```
Error: Error deleting VPC: DependencyViolation:
The vpc 'vpc-xxxxx' has dependencies and cannot be deleted.
```

```bash
# Solution: Check dependencies
terraform state list | grep vpc

# Destroy dependent resources first
terraform destroy -target=aws_instance.web
terraform destroy -target=aws_vpc.main
```

#### Error 3: State Lock Error

```
Error: Error locking state: Error acquiring the state lock:
ConditionalCheckFailedException: The conditional request failed
Lock Info:
  ID:        abc123-def456-ghi789
  Path:      terraform.tfstate
  Operation: OperationTypeApply
  Who:       user@hostname
  Version:   1.6.0
  Created:   2024-01-15 10:30:00 UTC
```

```bash
# Solution 1: Wait for lock to be released
# Someone else is running terraform

# Solution 2: Force unlock (use with caution!)
terraform force-unlock abc123-def456-ghi789

# Solution 3: Check who has the lock
# Look at DynamoDB table (for S3 backend)
aws dynamodb get-item \
  --table-name terraform-state-locks \
  --key '{"LockID": {"S": "my-state-bucket/terraform.tfstate"}}'
```

#### Error 4: Provider Configuration Error

```
Error: Failed to instantiate provider "aws" to obtain schema:
Incompatible provider version
```

```bash
# Solution: Check provider version constraints
cat <<EOF > versions.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
EOF

# Reinitialize
terraform init -upgrade
```

#### Error 5: Invalid Credentials

```
Error: Error configuring the AWS Provider:
error validating provider credentials:
error calling sts:GetCallerIdentity: InvalidClientTokenId
```

```bash
# Solution: Verify credentials
aws sts get-caller-identity

# Check environment variables
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
echo $AWS_REGION

# Verify AWS CLI configuration
cat ~/.aws/credentials
cat ~/.aws/config

# Test with explicit profile
export AWS_PROFILE=terraform
terraform apply
```

#### Error 6: Cycle Dependency

```
Error: Cycle: aws_security_group.web, aws_security_group.db
```

```bash
# Problem: Circular dependency between resources

# Bad example:
resource "aws_security_group" "web" {
  # ... other config ...

  egress {
    security_groups = [aws_security_group.db.id]
  }
}

resource "aws_security_group" "db" {
  # ... other config ...

  egress {
    security_groups = [aws_security_group.web.id]
  }
}

# Solution: Break the cycle using security group rules
resource "aws_security_group" "web" {
  # ... config without db reference ...
}

resource "aws_security_group" "db" {
  # ... config without web reference ...
}

resource "aws_security_group_rule" "web_to_db" {
  type                     = "egress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.web.id
  source_security_group_id = aws_security_group.db.id
}
```

### Debugging Techniques

#### Technique 1: Graph Visualization

```bash
# Generate dependency graph
terraform graph > graph.dot

# Convert to PNG (requires graphviz)
sudo apt-get install graphviz  # Ubuntu/Debian
brew install graphviz           # macOS

dot -Tpng graph.dot > graph.png

# View graph
open graph.png  # macOS
xdg-open graph.png  # Linux
```

#### Technique 2: State Inspection

```bash
# List all resources in state
terraform state list

# Show specific resource
terraform state show aws_instance.web

# Show all state
terraform show

# Show in JSON format
terraform show -json | jq
```

#### Technique 3: Console for Testing

```bash
# Launch Terraform console
terraform console

# Test expressions interactively
> var.instance_type
"t3.micro"

> aws_vpc.main.cidr_block
"10.0.0.0/16"

> length(aws_subnet.public)
3

> [for s in aws_subnet.public : s.id]
[
  "subnet-abc123",
  "subnet-def456",
  "subnet-ghi789"
]
```

#### Technique 4: Refresh State

```bash
# Refresh state to match reality (pre-1.5)
terraform refresh

# In Terraform 1.5+, refresh is automatic during plan
terraform plan -refresh-only

# Apply the refresh
terraform apply -refresh-only
```

### Troubleshooting Checklist

```
┌──────────────────────────────────────────────────────────────┐
│              TROUBLESHOOTING CHECKLIST                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  INITIAL CHECKS:                                             │
│  • Is Terraform version compatible?                          │
│  • Are provider versions compatible?                         │
│  • Is state file accessible?                                 │
│  • Are credentials valid?                                    │
│  • Is network connectivity working?                          │
│                                                              │
│  CONFIGURATION VALIDATION:                                   │
│  • Run terraform validate                                    │
│  • Run terraform fmt -check                                  │
│  • Check for syntax errors                                   │
│  • Verify variable values                                    │
│  • Check provider configuration                              │
│                                                              │
│  STATE ISSUES:                                               │
│  • Check state lock status                                   │
│  • Verify state backend configuration                        │
│  • Compare state with reality (refresh)                      │
│  • Look for state corruption                                 │
│  • Check state file permissions                              │
│                                                              │
│  PROVIDER ISSUES:                                            │
│  • Verify API credentials                                    │
│  • Check service quotas/limits                               │
│  • Look for API rate limiting                                │
│  • Verify region configuration                               │
│  • Check for provider-specific errors                        │
│                                                              │
│  RESOURCE ISSUES:                                            │
│  • Check resource dependencies                               │
│  • Verify required arguments                                 │
│  • Look for naming conflicts                                 │
│  • Check resource-specific constraints                       │
│  • Verify IAM permissions                                    │
│                                                              │
│  DEBUGGING STEPS:                                            │
│  • Enable debug logging (TF_LOG)                             │
│  • Review crash logs if applicable                           │
│  • Use terraform console for testing                         │
│  • Generate and review graph                                 │
│  • Inspect state with terraform show                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Performance Troubleshooting

```bash
# Measure plan performance
time terraform plan

# Use parallelism control
terraform apply -parallelism=2  # Default is 10

# For large state files, use targeted operations
terraform plan -target=module.specific_module

# Optimize by splitting into smaller state files
# Use separate workspaces or separate root modules
```

### Getting Help

```bash
# Terraform built-in help
terraform -help
terraform plan -help
terraform apply -help

# Check version
terraform version

# Validate configuration
terraform validate

# Format and validate
terraform fmt -recursive && terraform validate
```

## Summary

This chapter covered advanced Terraform topics essential for mastery:

1. **Backend Migration**: Moving state between backends safely
2. **Terraform Cloud & Enterprise**: Leveraging managed services for team collaboration
3. **Secrets Management**: Protecting sensitive data in infrastructure code
4. **Testing**: Validating Terraform code through multiple layers
5. **CI/CD Integration**: Automating infrastructure deployments
6. **Failure Handling**: Understanding and recovering from apply failures
7. **Multi-Region/Account**: Managing infrastructure across boundaries
8. **Debugging**: Troubleshooting issues effectively

### Key Takeaways

- Always backup state before migrations
- Never commit secrets to version control
- Implement automated testing at multiple levels
- Use GitOps workflows for infrastructure changes
- Plan for failure recovery before applying changes
- Organize multi-account/region infrastructure logically
- Enable debug logging when troubleshooting
- Use remote backends with state locking for team environments

**External Resources:**
- [Terraform Cloud Documentation](https://www.terraform.io/cloud-docs)
- [Terratest Documentation](https://terratest.gruntwork.io/)
- [Atlantis Documentation](https://www.runatlantis.io/)
- [HashiCorp Learn](https://learn.hashicorp.com/terraform)
