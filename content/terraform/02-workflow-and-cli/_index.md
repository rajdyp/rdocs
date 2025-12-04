---
title: Workflow and CLI
linkTitle: Workflow and CLI
type: docs
weight: 2
prev: /terraform/01-introduction
next: /terraform/03-configuration-basics
---

## The Terraform Workflow

Terraform follows a consistent workflow pattern that ensures safe and predictable infrastructure changes:

```
┌────────────────────────────────────────────────────────────────────┐
│                    CORE TERRAFORM WORKFLOW                         │
└────────────────────────────────────────────────────────────────────┘

1. WRITE                2. INIT                3. PLAN
┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│ Author code │        │ Initialize  │        │   Preview   │
│   in .tf    │───────>│  workspace  │───────>│   changes   │
│   files     │        │             │        │             │
└─────────────┘        └─────────────┘        └─────────────┘
                              │                       │
                              ▼                       ▼
                  • Download providers      • Read current state
                  • Setup backend           • Compare with config
                  • Install modules         • Show diff


4. APPLY               5. UPDATE              6. DESTROY (optional)
┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│   Execute   │        │   Modify    │        │   Tear      │
│   planned   │───────>│    code     │        │    down     │
│   changes   │        │             │        │             │
└─────────────┘        └──────┬──────┘        └─────────────┘
       │                      │
       ▼                      │
  • Update state              │
  • Create/modify/            └──────> (Loop back to PLAN)
    delete resources
```

### Workflow Steps Detail

```
┌────────────────────────────────────────────────────────────────────┐
│ STEP 1: WRITE                                                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Create configuration files:                                       │
│    • main.tf         (resources)                                   │
│    • variables.tf    (input variables)                             │
│    • outputs.tf      (output values)                               │
│    • providers.tf    (provider config)                             │
│                                                                    │
│  $ vim main.tf                                                     │
│  $ terraform fmt           # Format code                           │
│  $ terraform validate      # Check syntax                          │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ STEP 2: INIT                                                       │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  $ terraform init                                                  │
│                                                                    │
│  What happens:                                                     │
│    • Creates .terraform/ directory                                 │
│    • Downloads provider plugins                                    │
│    • Initializes backend (state storage)                           │
│    • Downloads modules (if any)                                    │
│    • Creates/updates .terraform.lock.hcl                           │
│                                                                    │
│  When to run:                                                      │
│    • First time in a new directory                                 │
│    • After adding new providers                                    │
│    • After changing backend configuration                          │
│    • When cloning a repository                                     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ STEP 3: PLAN                                                       │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  $ terraform plan                                                  │
│                                                                    │
│  What happens:                                                     │
│    1. Reads current state file                                     │
│    2. Queries provider for actual resource state                   │
│    3. Compares actual vs. desired state                            │
│    4. Generates execution plan                                     │
│    5. Shows what will be created/modified/destroyed                │
│                                                                    │
│  Symbols in output:                                                │
│    + create                                                        │
│    ~ update in-place                                               │
│    - destroy                                                       │
│    -/+ destroy and recreate                                        │
│    <= read (data source)                                           │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ STEP 4: APPLY                                                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  $ terraform apply                                                 │
│                                                                    │
│  What happens:                                                     │
│    1. Generates plan (unless using saved plan)                     │
│    2. Prompts for confirmation (unless -auto-approve)              │
│    3. Locks state file (prevents concurrent changes)               │
│    4. Executes changes in dependency order                         │
│    5. Updates state file                                           │
│    6. Unlocks state file                                           │
│    7. Shows outputs (if defined)                                   │
│                                                                    │
│  Safety features:                                                  │
│    • State locking (with supported backends)                       │
│    • Confirmation prompt                                           │
│    • Dependency resolution                                         │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Understanding the .terraform Directory

When you run `terraform init`, Terraform creates a `.terraform` directory. This is the local workspace cache.

```
project/
├── .terraform/
│   ├── providers/
│   │   └── registry.terraform.io/
│   │       └── hashicorp/
│   │           └── aws/
│   │               └── 5.84.0/
│   │                   └── linux_amd64/
│   │                       └── terraform-provider-aws_v5.84.0
│   │
│   ├── modules/
│   │   └── vpc/              # If using modules
│   │       └── ...
│   │
│   ├── environment           # Current workspace name
│   └── terraform.tfstate     # Backend config cache
│
├── .terraform.lock.hcl       # Dependency lock file
├── main.tf
└── terraform.tfstate         # State file (if local backend)
```

### Directory Breakdown

| Path | Purpose | Should Commit? |
|------|---------|----------------|
| `.terraform/providers/` | Downloaded provider plugins | ❌ No (in .gitignore) |
| `.terraform/modules/` | Downloaded remote modules | ❌ No |
| `.terraform/environment` | Tracks active workspace | ❌ No |
| `.terraform.lock.hcl` | Provider version lock | ✅ Yes |
| `terraform.tfstate` | Infrastructure state | ⚠️ Depends (never if contains secrets) |

## State Files Explained

The state file is Terraform's database of managed infrastructure.

```
┌────────────────────────────────────────────────────────────────┐
│                    STATE FILE PURPOSE                          │
└────────────────────────────────────────────────────────────────┘

  CONFIGURATION        STATE FILE         ACTUAL RESOURCES
     (main.tf)      (terraform.tfstate)   (in AWS/Azure/etc.)
         │                  │                      │
         │                  │                      │
         ▼                  ▼                      ▼
    ┌─────────┐       ┌──────────┐         ┌──────────┐
    │ Desired │       │  Maps    │         │  Real    │
    │  State  │<─────>│ Config   │<───────>│  World   │
    │         │       │    to    │         │          │
    │ What    │       │ Reality  │         │ Current  │
    │ you     │       │          │         │  State   │
    │ want    │       │          │         │          │
    └─────────┘       └──────────┘         └──────────┘

Terraform uses state to:
  1. Map configuration to real world resources
  2. Track metadata (dependencies, provider info)
  3. Improve performance (cache attribute values)
  4. Enable collaboration (shared state)
```

### State File Structure

```json
{
  "version": 4,
  "terraform_version": "1.5.0",
  "serial": 1,
  "lineage": "unique-id",
  "outputs": {},
  "resources": [
    {
      "mode": "managed",
      "type": "aws_instance",
      "name": "web",
      "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
      "instances": [
        {
          "schema_version": 1,
          "attributes": {
            "id": "i-0abc123def456",
            "ami": "ami-0c55b159cbfafe1f0",
            "instance_type": "t2.micro",
            "public_ip": "54.123.45.67"
          }
        }
      ]
    }
  ]
}
```

### State Files Variants

| File | Purpose |
|------|---------|
| `terraform.tfstate` | Current state of infrastructure |
| `terraform.tfstate.backup` | Previous state (automatic backup) |

### Critical State File Notes

⚠️ **WARNINGS:**
- Contains sensitive data (passwords, keys, etc.)
- Never manually edit (use `terraform state` commands)
- Always use remote state for teams
- Enable versioning on remote backends
- Implement state locking to prevent corruption

## Understanding State Drift

**State drift** occurs when the actual infrastructure differs from what's recorded in Terraform's state file. This is a common real-world scenario that Terraform detects and reports automatically (during the plan phase).

### How Drift Happens

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAUSES OF STATE DRIFT                        │
└─────────────────────────────────────────────────────────────────┘

1. Manual Changes
   Someone logs into AWS Console → Changes instance type
   State file still shows old value → DRIFT!

2. External Tools
   Ansible/scripts modify infrastructure outside Terraform

3. Deletion
   Someone deletes resource in cloud console
   State file still references it → DRIFT!

4. Emergency Changes
   Hotfix applied directly during incident
   Terraform not updated → DRIFT!
```

### How Terraform Handles Drift

During `terraform plan`, Terraform refreshes its **in-memory state** by querying the actual cloud resources listed in the state file. It only checks resources that already exist in the state file, using the state as the index of what to query.

```
┌─────────────────────────────────────────────────────────────────┐
│                    DRIFT DETECTION FLOW                         │
└─────────────────────────────────────────────────────────────────┘

Step 1: Read State File
  State file says: "I manage aws_instance.web with ID i-12345"
                   "Instance type should be: t2.micro"

Step 2: Query Cloud Provider (Refresh)
  Terraform asks AWS: "What's the current state of instance i-12345?"
  AWS API returns: instance_type = "t2.small"  ← DRIFT DETECTED!

  Note: Terraform ONLY queries resources listed in the state file.
        It does NOT scan for new/unmanaged resources.

Step 3: Compare with Desired State (.tf file)
  Configuration says: instance_type = "t2.micro"

Step 4: Calculate Required Changes
  Plan shows:
    ~ aws_instance.web
      ~ instance_type: "t2.small" -> "t2.micro"
      (will revert manual change)
```

### Drift Detection Commands

```bash
# Detect drift without making changes
terraform plan -refresh-only

# Update state to match reality (no infrastructure changes)
terraform apply -refresh-only

# See what Terraform thinks exists (from state file)
terraform show

# See actual state from cloud provider
terraform plan  # includes refresh by default
```

### Best Practices for Managing Drift

| Practice | Description |
|----------|-------------|
| **Avoid manual changes** | Always make changes through Terraform |
| **Regular drift detection** | Run `terraform plan` regularly to catch drift early |
| **Use terraform refresh** | Explicitly refresh state: `terraform apply -refresh-only` |
| **Read-only cloud access** | Limit who can manually modify infrastructure |
| **Import existing resources** | Use `terraform import` for resources created outside Terraform |
| **State locking** | Prevents concurrent modifications (automatic with backends like S3) |

### Important Notes

- **Cloud provider is the source of truth** - If state and reality conflict, Terraform trusts the cloud provider
- **Refresh happens automatically** - Every `plan` and `apply` includes a refresh step (unless `-refresh=false`)
- **State drift is normal** - Don't panic! It's why Terraform has drift detection
- **Apply reconciles drift** - Running `terraform apply` will bring infrastructure back to desired state

### Critical Limitation: Scope of Drift Detection

⚠️ **IMPORTANT**: Terraform can **only** detect drift for resources it already manages (i.e., resources in its state file).

```
┌─────────────────────────────────────────────────────────────────┐
│              WHAT TERRAFORM CAN AND CANNOT DETECT               │
└─────────────────────────────────────────────────────────────────┘

✅ CAN DETECT (Managed Resources):
   • Terraform created an EC2 instance (t2.micro)
   • Someone manually changed it to t2.small
   • Drift detected! Terraform will revert it

❌ CANNOT DETECT (Unmanaged Resources):
   • Someone manually creates a new S3 bucket in AWS Console
   • Terraform has no idea this bucket exists
   • Not in state file = Terraform completely ignores it
```

**Why this matters:**
- Terraform only tracks resources in its state file
- New resources created outside Terraform are invisible to drift detection
- This is not a bug—it's by design. Terraform manages only what you tell it to manage.

**Solutions for unmanaged resources:**

1. **Import into Terraform state:**
   ```bash
   # Import existing resource
   terraform import aws_s3_bucket.my_bucket existing-bucket-name

   # Then add corresponding configuration to .tf files
   ```

2. **Use cloud inventory tools to discover unmanaged resources:**
   - AWS Config / CloudTrail
   - Terraform Cloud drift detection (can scan for unmanaged resources)
   - Third-party tools: `driftctl`, `InfraCost`, `Checkov`

**Key distinction:**
- **Terraform drift detection** = "Were MY managed resources modified?"
- **Cloud inventory tools** = "What resources exist in the entire cloud account?"

## Initialize: terraform init

`terraform init` prepares your working directory for Terraform operations.

```
┌──────────────────────────────────────────────────────────────────┐
│                    terraform init PROCESS                        │
└──────────────────────────────────────────────────────────────────┘

$ terraform init

Step 1: Backend Initialization
├─> Read backend configuration
├─> Initialize backend (local/S3/Terraform Cloud)
└─> Create/verify state storage

Step 2: Provider Plugin Installation
├─> Parse required_providers block
├─> Check .terraform.lock.hcl for versions
├─> Download providers to .terraform/providers/
└─> Verify checksums

Step 3: Module Installation (if any)
├─> Identify module sources
├─> Download to .terraform/modules/
└─> Process module dependencies

Step 4: Lock File Management
└─> Create or update .terraform.lock.hcl

Output:
✓ Terraform has been successfully initialized!
```

### Init Command Options

```bash
# Basic initialization
terraform init

# Upgrade providers to latest allowed version
terraform init -upgrade

# Reconfigure backend (migrate state)
terraform init -reconfigure

# Backend configuration via command line
terraform init -backend-config="bucket=my-terraform-state"

# Skip plugin installation (if already installed)
terraform init -plugin-dir=/path/to/plugins
```

### Example Output

```
$ terraform init

Initializing the backend...

Initializing provider plugins...
- Finding latest version of hashicorp/aws...
- Installing hashicorp/aws v5.84.0...
- Installed hashicorp/aws v5.84.0 (signed by HashiCorp)

Terraform has created a lock file .terraform.lock.hcl to record the provider
selections it made above. Include this file in your version control repository
so that Terraform can guarantee to make the same selections by default when
you run "terraform init" in the future.

Terraform has been successfully initialized!

You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure.
```

### When to Run terraform init

✅ **Required when:**
- First time using a configuration
- Adding new providers
- Adding new modules
- Changing backend configuration
- Cloning a repository with Terraform code
- Upgrading provider versions

❌ **Not needed when:**
- Just modifying resource configurations
- Changing variable values
- Updating outputs

## Plan: terraform plan

`terraform plan` creates an execution plan showing what Terraform will do.

```
┌──────────────────────────────────────────────────────────────────┐
│                    terraform plan PROCESS                        │
└──────────────────────────────────────────────────────────────────┘

$ terraform plan

Step 1: Read State File
├─> Load state file from disk (or remote backend)
├─> Build inventory of managed resources
└─> Identify what resources to query

Step 2: Refresh (Query Cloud Provider)
├─> Query providers for actual state of resources in state file
├─> Update in-memory state with current reality
└─> Detect drift (compare state file vs actual)

Step 3: Build Dependency Graph
├─> Parse configuration files
├─> Identify resource dependencies
└─> Determine execution order

Step 4: Calculate Diff
├─> Compare desired (config) vs actual (refreshed state)
├─> Identify changes needed
└─> Group by action type

Step 5: Display Plan
├─> Show resources to add (+)
├─> Show resources to modify (~)
├─> Show resources to destroy (-)
└─> Show resources to replace (-/+)

Output:
Plan: X to add, Y to change, Z to destroy.
```

### Plan Output Symbols

```
Symbol  Action              Description
────────────────────────────────────────────────────────────────────────
  +     create              Resource will be created
  ~     update in-place     Attribute will change, resource stays
  -     destroy             Resource will be destroyed
 -/+    replace             Destroy then recreate (resource ID changes)
 <=     read                Data source will be read
```

### Example Plan Output

```
$ terraform plan

Terraform used the selected providers to generate the following execution
plan. Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # aws_instance.web will be created
  + resource "aws_instance" "web" {
      + ami                          = "ami-0c55b159cbfafe1f0"
      + instance_type                = "t2.micro"
      + id                           = (known after apply)
      + public_ip                    = (known after apply)
      + subnet_id                    = (known after apply)

      + tags = {
          + "Name" = "WebServer"
        }
    }

Plan: 1 to add, 0 to change, 0 to destroy.
```

### Plan Command Options

```bash
# Standard plan
terraform plan

# Save plan to file
terraform plan -out=tfplan

# Specify variable values
terraform plan -var="instance_type=t2.large"

# Use variable file
terraform plan -var-file="production.tfvars"

# Detailed exit codes (for CI/CD)
terraform plan -detailed-exitcode
# Exit codes: 0=no changes, 1=error, 2=changes present

# Target specific resource
terraform plan -target=aws_instance.web

# Refresh state but don't plan changes
terraform plan -refresh-only
```

### Understanding "known after apply"

```
  + public_ip = (known after apply)
```

This means the value isn't known until the resource is created. AWS assigns the IP address, so Terraform can't know it during planning.

## Apply: terraform apply

`terraform apply` executes the planned changes to reach the desired state.

```
┌──────────────────────────────────────────────────────────────────┐
│                    terraform apply PROCESS                       │
└──────────────────────────────────────────────────────────────────┘

$ terraform apply

Step 1: Generate Plan
└─> Same as terraform plan (unless using saved plan)

Step 2: Show Plan & Request Approval
├─> Display planned changes
└─> Prompt: "Do you want to perform these actions?"

Step 3: Lock State
├─> Acquire state lock (if backend supports it)
└─> Prevents concurrent modifications

Step 4: Execute Changes
├─> Create resources (in dependency order)
├─> Update resources
├─> Destroy resources
└─> Handle errors and rollback if needed

Step 5: Update State
├─> Write new state
└─> Update resource metadata

Step 6: Unlock State
└─> Release state lock

Step 7: Display Outputs
└─> Show output values (if defined)
```

### Apply Command Options

```bash
# Interactive apply (prompts for confirmation)
terraform apply

# Auto-approve (skip confirmation)
terraform apply -auto-approve

# Apply a saved plan
terraform apply tfplan

# Apply with variables
terraform apply -var="environment=production"

# Target specific resource
terraform apply -target=aws_instance.web

# Apply with parallelism control (default is 10)
terraform apply -parallelism=5
```

### Example Apply Output

```
$ terraform apply

Terraform will perform the following actions:

  # aws_instance.web will be created
  + resource "aws_instance" "web" {
      ...
    }

Plan: 1 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

aws_instance.web: Creating...
aws_instance.web: Still creating... [10s elapsed]
aws_instance.web: Still creating... [20s elapsed]
aws_instance.web: Creation complete after 23s [id=i-0abc123def456]

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.

Outputs:

instance_ip = "54.123.45.67"
```

### State Locking During Apply

```
┌─────────────────────────────────────────────────────────────────┐
│              STATE LOCKING WITH S3 + DYNAMODB                   │
└─────────────────────────────────────────────────────────────────┘

User A                     DynamoDB Lock Table              User B
  │                               │                            │
  │  terraform apply              │                            │
  ├──> Acquire lock               │                            │
  │  ✓ Lock obtained              │                            │
  │                               │                            │
  │  Making changes...            │      terraform apply       │
  │                               │ <───────────────────────── │
  │                               │  Try to acquire lock       │
  │                               │  ✗ Lock held by User A     │
  │                               │                            │
  │                               │  Error: state locked       │
  │                               │ ─────────────────────────> │
  │  Changes complete             │                            │
  │  Release lock                 │                            │
  │ <─────────────────────────────│                            │
  │                               │                            │
  │                               │  Now User B can proceed    │
  │                               │ <───────────────────────── │
  │                               │  ✓ Lock obtained           │
```

## Essential CLI Commands

### Formatting and Validation

```bash
# Format code to canonical style
terraform fmt
terraform fmt -recursive  # Format all subdirectories

# Check configuration syntax
terraform validate

# Both together (common workflow)
terraform fmt && terraform validate
```

### Inspection Commands

```bash
# Show current state
terraform show

# Show state in JSON format
terraform show -json

# List all resources in state
terraform state list

# Show specific resource from state
terraform state show aws_instance.web

# Show output values
terraform output
terraform output instance_ip  # Specific output
terraform output -json        # JSON format
```

### State Management Commands

```bash
# List resources
terraform state list

# Show resource details
terraform state show aws_instance.web

# Move resource to new address
terraform state mv aws_instance.web aws_instance.app

# Remove resource from state (doesn't destroy)
terraform state rm aws_instance.web

# Import existing resource
terraform import aws_instance.web i-0abc123def456

# Replace a resource (force recreation)
terraform apply -replace=aws_instance.web
```

### Destroy Resources

```bash
# Destroy all resources
terraform destroy

# Destroy specific resource
terraform destroy -target=aws_instance.web

# Auto-approve destruction (dangerous!)
terraform destroy -auto-approve
```

### Workspace Commands

```bash
# List workspaces
terraform workspace list

# Show current workspace
terraform workspace show

# Create new workspace
terraform workspace new staging

# Switch workspace
terraform workspace select production

# Delete workspace
terraform workspace delete staging
```

### Other Useful Commands

```bash
# Get provider documentation
terraform providers

# Dependency graph (requires graphviz)
terraform graph | dot -Tpng > graph.png

# Show Terraform version
terraform version

# Unlock state (if lock is stuck)
terraform force-unlock <lock-id>

# Login to Terraform Cloud
terraform login

# Logout from Terraform Cloud
terraform logout
```

## Lock Files

The `.terraform.lock.hcl` file ensures consistent provider versions across team members and environments.

```hcl
# .terraform.lock.hcl

provider "registry.terraform.io/hashicorp/aws" {
  version     = "5.84.0"
  constraints = "~> 5.0"
  hashes = [
    "h1:abc123...",
    "zh:def456...",
  ]
}
```

### Lock File Purpose

```
┌───────────────────────────────────────────────────────────────┐
│               WHY LOCK FILES MATTER                           │
└───────────────────────────────────────────────────────────────┘

Without Lock File:
  Developer A (Monday)    →  AWS provider 5.84.0
  Developer B (Tuesday)   →  AWS provider 5.85.0 (new release!)
  CI/CD (Wednesday)       →  AWS provider 5.86.0

  Result: Inconsistent behavior, potential bugs


With Lock File:
  Developer A  →  AWS provider 5.84.0
  Developer B  →  AWS provider 5.84.0 (locked)
  CI/CD        →  AWS provider 5.84.0 (locked)

  Result: Consistent, predictable behavior
```

### Managing Lock Files

```bash
# Commit lock file to version control
git add .terraform.lock.hcl
git commit -m "Lock provider versions"

# Upgrade providers within constraints
terraform init -upgrade

# This updates the lock file to latest allowed version
```

## Practical Workflow Example

Let's walk through a complete workflow:

### Step 1: Create Configuration

```bash
mkdir my-infrastructure
cd my-infrastructure
```

Create `main.tf`:
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

provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name = "WebServer"
  }
}
```

Create `outputs.tf`:
```hcl
output "instance_id" {
  value = aws_instance.web.id
}

output "public_ip" {
  value = aws_instance.web.public_ip
}
```

### Step 2: Initialize

```bash
$ terraform init
```

### Step 3: Format and Validate

```bash
$ terraform fmt
$ terraform validate
```

### Step 4: Plan

```bash
$ terraform plan
```

Review the output carefully.

### Step 5: Apply

```bash
$ terraform apply
```

Type `yes` when prompted.

### Step 6: Inspect

```bash
$ terraform show
$ terraform output
```

### Step 7: Modify Configuration

Edit `main.tf` to add a tag:
```hcl
  tags = {
    Name        = "WebServer"
    Environment = "Development"  # Added
  }
```

### Step 8: Plan Changes

```bash
$ terraform plan
```

You'll see:
```
~ update in-place
  tags = {
      + "Environment" = "Development"
  }
```

### Step 9: Apply Changes

```bash
$ terraform apply
```

### Step 10: Cleanup

```bash
$ terraform destroy
```

Type `yes` to confirm.

## Troubleshooting Common Issues

### Issue: State Lock Error

```
Error: Error locking state: Error acquiring the state lock
```

**Solutions:**
```bash
# Wait for other operations to complete, or
terraform force-unlock <lock-id>

# Be careful! Only do this if you're sure no one else is running terraform
```

### Issue: Provider Download Fails

```
Error: Failed to install provider
```

**Solutions:**
```bash
# Clear the plugin cache
rm -rf .terraform
terraform init

# Or specify a different plugin directory
terraform init -plugin-dir=/path/to/plugins
```

## Key Takeaways

1. **terraform init**: Sets up your workspace (first command to run)
2. **terraform plan**: Preview changes before applying (always run this!)
3. **terraform apply**: Execute changes to infrastructure
4. **State files**: Critical for Terraform's operation (never delete!)
5. **Lock files**: Ensure consistent provider versions (commit to Git)
6. **.terraform directory**: Local cache (add to .gitignore)

## Additional Resources

- [Terraform CLI Documentation](https://developer.hashicorp.com/terraform/cli)
- [Terraform State](https://developer.hashicorp.com/terraform/language/state)
- [CLI Configuration](https://developer.hashicorp.com/terraform/cli/config/config-file)
