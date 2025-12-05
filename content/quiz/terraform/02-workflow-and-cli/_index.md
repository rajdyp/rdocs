---
title: "Terraform Workflow and CLI Quiz"
linkTitle: Terraform Workflow and CLI
type: docs
weight: 2
prev: /quiz/terraform/01-introduction
next: /quiz/terraform/03-configuration-basics
---

{{< quiz id="terraform-workflow-cli-quiz" >}}
{
  "questions": [
    {
      "type": "drag-drop",
      "question": "Arrange the core Terraform workflow steps in the correct order:",
      "instruction": "Drag to arrange from first to last",
      "items": [
        "WRITE (author .tf files)",
        "INIT (initialize workspace)",
        "PLAN (preview changes)",
        "APPLY (execute changes)"
      ],
      "correctOrder": [0, 1, 2, 3],
      "explanation": "The correct Terraform workflow is: Write configuration → Init workspace → Plan changes → Apply changes. This ensures you always initialize before planning and preview before applying."
    },
    {
      "type": "mcq",
      "question": "What is the primary purpose of the `terraform init` command?",
      "options": [
        "To preview infrastructure changes",
        "To prepare the working directory for Terraform operations",
        "To apply configuration changes",
        "To validate syntax"
      ],
      "answer": 1,
      "explanation": "`terraform init` prepares your working directory by downloading provider plugins, initializing the backend, installing modules, and creating/updating the lock file.",
      "hint": "Think about what happens when you first set up a Terraform project."
    },
    {
      "type": "multiple-select",
      "question": "What does `terraform init` do?",
      "options": [
        "Creates .terraform/ directory",
        "Downloads provider plugins",
        "Initializes backend for state storage",
        "Applies infrastructure changes",
        "Downloads modules if any",
        "Creates or updates .terraform.lock.hcl"
      ],
      "answers": [0, 1, 2, 4, 5],
      "explanation": "`terraform init` creates the .terraform/ directory, downloads providers, initializes the backend, downloads modules, and manages the lock file. It does NOT apply infrastructure changes.",
      "hint": "Init prepares the workspace but doesn't make infrastructure changes."
    },
    {
      "type": "fill-blank",
      "question": "What directory does `terraform init` create to store downloaded provider plugins?",
      "answer": ".terraform",
      "caseSensitive": true,
      "explanation": "The `.terraform/` directory is created during initialization and contains downloaded provider plugins, modules, and workspace information. It should be excluded from version control.",
      "hint": "It's a hidden directory that starts with a dot."
    },
    {
      "type": "true-false",
      "question": "The `.terraform/` directory should be committed to version control.",
      "answer": false,
      "explanation": "The `.terraform/` directory should NOT be committed to version control (add to .gitignore) because it contains downloaded plugins and can be regenerated with `terraform init`. However, `.terraform.lock.hcl` should be committed.",
      "hint": "Think about whether downloaded plugins should be in Git."
    },
    {
      "type": "flashcard",
      "question": "What is the purpose of the Terraform State File?",
      "answer": "**Terraform State File (terraform.tfstate)**\n\nThe state file is Terraform's database of managed infrastructure. It serves to:\n\n1. **Map configuration to real-world resources** - Links your .tf code to actual cloud resources\n2. **Track metadata** - Stores dependencies and provider information\n3. **Improve performance** - Caches attribute values to avoid constant API queries\n4. **Enable collaboration** - Allows teams to share infrastructure state\n\n⚠️ Contains sensitive data (passwords, keys) and should never be manually edited."
    },
    {
      "type": "mcq",
      "question": "During `terraform plan`, how does Terraform detect state drift?",
      "options": [
        "It only reads the local state file",
        "It queries the cloud provider for actual resource state and compares with the state file",
        "It scans the entire cloud account for all resources",
        "It checks Git history for changes"
      ],
      "answer": 1,
      "explanation": "During plan, Terraform refreshes its in-memory state by querying the actual cloud resources listed in the state file. It compares the actual state with what's recorded in the state file to detect drift.",
      "hint": "Think about how Terraform knows if someone made manual changes in the console."
    },
    {
      "type": "multiple-select",
      "question": "Which scenarios cause state drift?",
      "options": [
        "Manual changes in the cloud console",
        "Running terraform plan",
        "External tools (Ansible/scripts) modifying infrastructure",
        "Resource deletion in the console",
        "Running terraform apply",
        "Emergency hotfixes applied directly"
      ],
      "answers": [0, 2, 3, 5],
      "explanation": "State drift occurs when actual infrastructure differs from what's recorded in the state file. This happens through manual console changes, external tools, resource deletions, and emergency hotfixes. terraform plan and apply don't cause drift—they detect and reconcile it.",
      "hint": "Drift happens when changes are made outside of Terraform."
    },
    {
      "type": "true-false",
      "question": "Terraform can detect drift for any resource that exists in your cloud account.",
      "answer": false,
      "explanation": "FALSE. Terraform can ONLY detect drift for resources it already manages (i.e., resources in its state file). Resources created outside Terraform are invisible to drift detection. This is by design—Terraform only manages what you tell it to manage.",
      "hint": "Think about the scope of what Terraform tracks."
    },
    {
      "type": "code-completion",
      "question": "Complete the command to detect drift without making any infrastructure changes:",
      "instruction": "Fill in the missing flag",
      "codeTemplate": "terraform plan _____",
      "answer": "-refresh-only",
      "caseSensitive": true,
      "acceptedAnswers": ["-refresh-only"],
      "explanation": "`terraform plan -refresh-only` detects drift by refreshing the state without planning any infrastructure changes. To update the state to match reality, use `terraform apply -refresh-only`."
    },
    {
      "type": "mcq",
      "question": "What symbol in `terraform plan` output indicates a resource will be destroyed and then recreated?",
      "options": [
        "+",
        "~",
        "-",
        "-/+"
      ],
      "answer": 3,
      "explanation": "The `-/+` symbol indicates a resource will be replaced (destroyed then recreated). This happens when certain attributes change that require replacement, causing the resource ID to change.",
      "hint": "It combines the destroy and create symbols."
    },
    {
      "type": "flashcard",
      "question": "What does 'known after apply' mean in Terraform plan output?",
      "answer": "**'known after apply'**\n\nThis appears in plan output when a value cannot be determined until the resource is actually created.\n\nExample:\n```\n+ public_ip = (known after apply)\n```\n\nThis happens because:\n- The cloud provider assigns the value (e.g., AWS assigns the public IP)\n- Terraform can't predict what the provider will assign\n- The value becomes known only after the resource is created\n\nCommon examples: resource IDs, auto-assigned IPs, generated ARNs"
    },
    {
      "type": "drag-drop",
      "question": "Arrange these steps in the correct order during `terraform apply`:",
      "instruction": "Drag to arrange in execution order",
      "items": [
        "Generate plan",
        "Request approval",
        "Lock state",
        "Execute changes",
        "Update state",
        "Unlock state"
      ],
      "correctOrder": [0, 1, 2, 3, 4, 5],
      "explanation": "The apply process: Generate plan → Request approval → Lock state → Execute changes → Update state → Unlock state. State locking prevents concurrent modifications."
    },
    {
      "type": "fill-blank",
      "question": "What is the default parallelism value for `terraform apply` (how many resources can be created simultaneously)?",
      "answer": "10",
      "caseSensitive": false,
      "explanation": "Terraform applies changes with a default parallelism of 10, meaning it can create/modify up to 10 resources simultaneously. This can be controlled with the `-parallelism` flag.",
      "hint": "It's a two-digit number."
    },
    {
      "type": "mcq",
      "question": "What happens when you run `terraform apply` without a saved plan?",
      "options": [
        "It fails with an error",
        "It applies the last plan that was run",
        "It re-generates the plan and prompts for approval",
        "It applies changes without showing them"
      ],
      "answer": 2,
      "explanation": "When you run `terraform apply` without a saved plan, it re-generates the plan (same as running terraform plan), shows you the changes, and then prompts for approval before applying.",
      "hint": "Terraform always shows you what will happen before applying."
    },
    {
      "type": "true-false",
      "question": "During `terraform apply`, Terraform acquires a state lock to prevent concurrent modifications.",
      "answer": true,
      "explanation": "TRUE. When using backends that support locking (like S3 with DynamoDB), Terraform acquires a state lock during apply to prevent multiple users from modifying state simultaneously, which prevents state corruption.",
      "hint": "Think about what happens when two people run terraform apply at the same time."
    },
    {
      "type": "code-completion",
      "question": "Complete the command to apply changes without the confirmation prompt:",
      "instruction": "Fill in the missing flag",
      "codeTemplate": "terraform apply _____",
      "answer": "-auto-approve",
      "caseSensitive": true,
      "acceptedAnswers": ["-auto-approve"],
      "explanation": "The `-auto-approve` flag skips the interactive approval prompt. Use with caution, especially in production!"
    },
    {
      "type": "multiple-select",
      "question": "Which commands should you run after writing Terraform configuration files but before applying changes?",
      "options": [
        "terraform fmt",
        "terraform validate",
        "terraform destroy",
        "terraform init",
        "terraform plan",
        "terraform output"
      ],
      "answers": [0, 1, 3, 4],
      "explanation": "The proper workflow is: terraform fmt (format code) → terraform validate (check syntax) → terraform init (initialize) → terraform plan (preview changes) → terraform apply. Destroy and output come later.",
      "hint": "Think about the logical order: format, validate, initialize, preview."
    },
    {
      "type": "mcq",
      "question": "What does the `terraform fmt` command do?",
      "options": [
        "Validates configuration syntax",
        "Formats code to canonical style",
        "Creates a new configuration file",
        "Shows the state file contents"
      ],
      "answer": 1,
      "explanation": "`terraform fmt` formats Terraform configuration files to a canonical style, ensuring consistent formatting. Use `terraform fmt -recursive` to format all subdirectories.",
      "hint": "fmt is short for format."
    },
    {
      "type": "flashcard",
      "question": "What is the purpose of the .terraform.lock.hcl file?",
      "answer": "**Provider Dependency Lock File (.terraform.lock.hcl)**\n\nEnsures consistent provider versions across team members and environments.\n\n**Without lock file:**\n- Developer A uses AWS provider 5.84.0\n- Developer B uses AWS provider 5.85.0 (newer release)\n- CI/CD uses AWS provider 5.86.0\n- Result: Inconsistent behavior, potential bugs\n\n**With lock file:**\n- All developers use the exact same provider version\n- Prevents unexpected changes from provider updates\n- Should be committed to version control\n\n**Update providers:** `terraform init -upgrade`"
    },
    {
      "type": "true-false",
      "question": "The .terraform.lock.hcl file should be committed to version control.",
      "answer": true,
      "explanation": "TRUE. The lock file should be committed to ensure all team members and CI/CD systems use the same provider versions, preventing inconsistent behavior.",
      "hint": "Think about ensuring consistency across the team."
    },
    {
      "type": "mcq",
      "question": "How do you upgrade provider versions within the constraints defined in your configuration?",
      "options": [
        "terraform update",
        "terraform init -upgrade",
        "terraform apply -upgrade",
        "terraform provider upgrade"
      ],
      "answer": 1,
      "explanation": "`terraform init -upgrade` upgrades providers to the latest version allowed by your version constraints and updates the lock file accordingly.",
      "hint": "It's a flag added to the init command."
    },
    {
      "type": "code-completion",
      "question": "Complete the command to save a plan to a file named 'tfplan':",
      "instruction": "Fill in the missing part",
      "codeTemplate": "terraform plan _____",
      "answer": "-out=tfplan",
      "caseSensitive": true,
      "acceptedAnswers": ["-out=tfplan", "-out tfplan"],
      "explanation": "`terraform plan -out=tfplan` saves the plan to a file. You can then apply this exact plan with `terraform apply tfplan`, which skips the approval prompt since the plan was already reviewed."
    },
    {
      "type": "mcq",
      "question": "What exit codes does `terraform plan -detailed-exitcode` return?",
      "options": [
        "0=success, 1=error",
        "0=no changes, 1=error, 2=changes present",
        "0=no changes, 1=changes present",
        "0=success, 2=error"
      ],
      "answer": 1,
      "explanation": "With `-detailed-exitcode`, terraform plan returns: 0 (no changes needed), 1 (error occurred), or 2 (changes are present). This is useful in CI/CD pipelines to determine if infrastructure drift exists.",
      "hint": "There are three possible exit codes."
    },
    {
      "type": "multiple-select",
      "question": "Which `terraform state` commands DO NOT modify actual cloud infrastructure?",
      "options": [
        "terraform state list",
        "terraform state show",
        "terraform state mv",
        "terraform state rm",
        "terraform destroy"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "All `terraform state` commands only modify the state file, not actual infrastructure. `terraform state rm` removes from state but doesn't destroy the resource. Only `terraform destroy` actually deletes cloud resources.",
      "hint": "State commands modify the state file, not the cloud."
    },
    {
      "type": "flashcard",
      "question": "What is the difference between 'terraform state rm' and 'terraform destroy'?",
      "answer": "**terraform state rm vs terraform destroy**\n\n**`terraform state rm <resource>`**\n- Removes resource from state file only\n- Resource continues to exist in the cloud\n- Terraform stops managing it\n- Use case: Move resource out of Terraform management\n\n**`terraform destroy`**\n- Actually deletes resources from the cloud\n- Updates state file to reflect deletion\n- Resource is permanently removed\n- Use case: Clean up infrastructure\n\n⚠️ **Critical:** `state rm` doesn't destroy—it just stops tracking!"
    },
    {
      "type": "mcq",
      "question": "How do you bring an existing cloud resource under Terraform management?",
      "options": [
        "terraform state add",
        "terraform import <resource_address> <resource_id>",
        "terraform adopt <resource_id>",
        "terraform state create"
      ],
      "answer": 1,
      "explanation": "`terraform import` brings existing resources into Terraform management. Syntax: `terraform import aws_instance.web i-0abc123`. You must also add the corresponding configuration to your .tf files.",
      "hint": "The command is 'import'."
    },
    {
      "type": "code-completion",
      "question": "Complete the command to force recreation of a specific resource:",
      "instruction": "Fill in the missing flag",
      "codeTemplate": "terraform apply _____ aws_instance.web",
      "answer": "-replace=",
      "caseSensitive": true,
      "acceptedAnswers": ["-replace="],
      "explanation": "`terraform apply -replace=aws_instance.web` forces Terraform to destroy and recreate the specified resource, even if no configuration changes require it. This replaced the deprecated `-taint` flag."
    },
    {
      "type": "multiple-select",
      "question": "When should you run `terraform init`?",
      "options": [
        "First time in a new directory",
        "After adding new providers",
        "After changing backend configuration",
        "Every time before terraform plan",
        "When cloning a repository",
        "After modifying resource configurations"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "Run `terraform init` when first using a directory, adding providers, changing backends, cloning a repo, or upgrading provider versions. You don't need to run it every time or after just modifying resources.",
      "hint": "Init is needed when the workspace setup changes, not for every operation."
    },
    {
      "type": "mcq",
      "question": "What does the `~` symbol mean in terraform plan output?",
      "options": [
        "Resource will be created",
        "Resource will be updated in-place",
        "Resource will be destroyed",
        "Resource will be replaced"
      ],
      "answer": 1,
      "explanation": "The `~` symbol indicates an in-place update—the resource will be modified without destroying and recreating it. The resource ID stays the same.",
      "hint": "Think of the tilde as representing a small change."
    },
    {
      "type": "flashcard",
      "question": "What are Terraform Workspaces and when should you use them?",
      "answer": "**Terraform Workspaces**\n\nWorkspaces are named state instances for the same configuration, allowing you to manage multiple environments.\n\n**Commands:**\n- `terraform workspace list` - Show all workspaces\n- `terraform workspace new staging` - Create workspace\n- `terraform workspace select prod` - Switch workspace\n- `terraform workspace show` - Show current workspace\n\n**Use case:** Same code, different environments (dev/staging/prod)\n- Each workspace has its own state file\n- Easy to switch between environments\n\n⚠️ **Note:** For production use, many teams prefer separate directories/repos rather than workspaces for better isolation."
    },
    {
      "type": "true-false",
      "question": "The terraform.tfstate.backup file is automatically created by Terraform as a backup of the previous state.",
      "answer": true,
      "explanation": "TRUE. Terraform automatically creates a backup of the previous state in `terraform.tfstate.backup` before updating the state file. This provides a safety net if the state gets corrupted.",
      "hint": "Think about Terraform's built-in safety mechanisms."
    },
    {
      "type": "mcq",
      "question": "You encounter a state lock error. What command can force-unlock the state?",
      "options": [
        "terraform unlock",
        "terraform state unlock",
        "terraform force-unlock <lock-id>",
        "terraform apply -force"
      ],
      "answer": 2,
      "explanation": "`terraform force-unlock <lock-id>` can force-release a stuck state lock. Use with extreme caution—only when you're certain no one else is running Terraform, as forcing unlock during an active operation can corrupt the state.",
      "hint": "The command includes 'force-unlock'."
    },
    {
      "type": "multiple-select",
      "question": "Which files/directories should be committed to version control in a Terraform project?",
      "options": [
        "main.tf",
        ".terraform/",
        ".terraform.lock.hcl",
        "terraform.tfstate",
        "variables.tf",
        "outputs.tf"
      ],
      "answers": [0, 2, 4, 5],
      "explanation": "Commit: Configuration files (.tf files) and the lock file (.terraform.lock.hcl). Do NOT commit: .terraform/ directory (regenerable) and terraform.tfstate (contains secrets, use remote backend instead).",
      "hint": "Commit code and lock file, not cache or state."
    },
    {
      "type": "mcq",
      "question": "What command displays the current state in JSON format?",
      "options": [
        "terraform state json",
        "terraform show -json",
        "terraform output -json",
        "terraform export -json"
      ],
      "answer": 1,
      "explanation": "`terraform show -json` displays the current state in JSON format. This is useful for parsing state data in scripts or for integration with other tools.",
      "hint": "It's the show command with a flag."
    },
    {
      "type": "code-completion",
      "question": "Complete the command to list all resources in the state file:",
      "instruction": "Fill in the missing subcommand",
      "codeTemplate": "terraform state _____",
      "answer": "list",
      "caseSensitive": false,
      "acceptedAnswers": ["list"],
      "explanation": "`terraform state list` shows all resources currently managed in the state file. This is useful for getting an overview of what Terraform is managing."
    },
    {
      "type": "true-false",
      "question": "Terraform state files can contain sensitive information like passwords and API keys.",
      "answer": true,
      "explanation": "TRUE. State files often contain sensitive data including passwords, API keys, and other secrets. This is why you should never commit state files to version control and should use remote backends with encryption.",
      "hint": "Think about what data Terraform needs to track about resources."
    },
    {
      "type": "mcq",
      "question": "What is the purpose of the `terraform validate` command?",
      "options": [
        "Validates that infrastructure is running correctly",
        "Checks configuration syntax and internal consistency",
        "Validates credentials with cloud providers",
        "Checks if the state file is valid"
      ],
      "answer": 1,
      "explanation": "`terraform validate` checks the syntax and internal consistency of your configuration files. It validates the configuration without accessing remote state or provider APIs.",
      "hint": "It validates the configuration files themselves."
    },
    {
      "type": "flashcard",
      "question": "What is the scope of Terraform's state drift detection?",
      "answer": "**Scope of Drift Detection**\n\n**CAN DETECT (Managed Resources):**\n✅ Changes to resources in the state file\n✅ Modified attributes (e.g., instance type changed from t2.micro to t2.small)\n✅ Deleted resources that Terraform manages\n✅ Tags added/removed from managed resources\n\n**CANNOT DETECT (Unmanaged Resources):**\n❌ New resources created outside Terraform\n❌ Resources in other regions not managed by Terraform\n❌ Resources created by other teams/tools\n\n**Key Point:** Terraform only queries resources listed in its state file. It does NOT scan your entire cloud account.\n\n**Solution:** Use `terraform import` for existing resources or cloud inventory tools to discover unmanaged resources."
    },
    {
      "type": "mcq",
      "question": "During the plan phase, Terraform queries the cloud provider. What does this step accomplish?",
      "options": [
        "It creates new resources",
        "It refreshes in-memory state by getting actual resource state from the provider",
        "It deletes resources",
        "It validates credentials"
      ],
      "answer": 1,
      "explanation": "During plan, Terraform refreshes its in-memory state by querying the cloud provider for the actual current state of resources listed in the state file. This allows it to detect drift and calculate required changes.",
      "hint": "Think about what Terraform needs to know before planning changes."
    },
    {
      "type": "multiple-select",
      "question": "What are best practices for managing state drift?",
      "options": [
        "Avoid manual changes in cloud console",
        "Delete the state file and regenerate it",
        "Run terraform plan regularly",
        "Use terraform apply -refresh-only to reconcile drift",
        "Edit the state file manually",
        "Limit who can manually modify infrastructure"
      ],
      "answers": [0, 2, 3, 5],
      "explanation": "Best practices: Avoid manual changes, run plan regularly, use refresh-only to reconcile, and limit manual access. NEVER delete or manually edit state files—this can cause serious issues.",
      "hint": "Think about preventing drift and safely handling it when it occurs."
    },
    {
      "type": "code-completion",
      "question": "Complete the command to target a specific resource during apply:",
      "instruction": "Fill in the missing flag",
      "codeTemplate": "terraform apply _____ aws_instance.web",
      "answer": "-target=",
      "caseSensitive": true,
      "acceptedAnswers": ["-target="],
      "explanation": "`terraform apply -target=aws_instance.web` applies changes only to the specified resource and its dependencies. Use sparingly—targeting can cause inconsistencies."
    },
    {
      "type": "mcq",
      "question": "What command would you use to see details about a specific resource from the state file?",
      "options": [
        "terraform state get aws_instance.web",
        "terraform state show aws_instance.web",
        "terraform show aws_instance.web",
        "terraform inspect aws_instance.web"
      ],
      "answer": 1,
      "explanation": "`terraform state show aws_instance.web` displays detailed information about a specific resource from the state file, including all its attributes.",
      "hint": "It's a state subcommand."
    },
    {
      "type": "true-false",
      "question": "Running 'terraform plan' with the -refresh=false flag will skip querying the cloud provider for actual resource state.",
      "answer": true,
      "explanation": "TRUE. The `-refresh=false` flag skips the refresh step, meaning Terraform won't query the cloud provider and will use only what's in the state file. This is faster but won't detect drift.",
      "hint": "The flag name indicates what it does."
    },
    {
      "type": "mcq",
      "question": "What happens to a resource when you run `terraform state rm` on it?",
      "options": [
        "The resource is destroyed in the cloud",
        "The resource is removed from state but continues to exist in the cloud",
        "The resource is moved to a different state file",
        "The resource is marked for deletion"
      ],
      "answer": 1,
      "explanation": "`terraform state rm` removes the resource from the state file only—the actual resource continues to exist in the cloud. Terraform simply stops managing it. The resource is NOT destroyed.",
      "hint": "State commands don't affect actual infrastructure."
    },
    {
      "type": "flashcard",
      "question": "How does State Locking work in Terraform?",
      "answer": "**State Locking**\n\nPrevents concurrent state modifications that could corrupt the state file.\n\n**How it works:**\n1. User A runs `terraform apply`\n2. Terraform acquires a lock (e.g., in DynamoDB)\n3. User B tries to run `terraform apply`\n4. User B gets an error: \"state is locked by User A\"\n5. User A completes, releases the lock\n6. User B can now proceed\n\n**Backends with locking:**\n- S3 (with DynamoDB table)\n- Terraform Cloud\n- Azure Blob Storage\n- Google Cloud Storage\n\n**Local backend:** No locking support (not safe for teams)\n\n**Force unlock (emergency only):** `terraform force-unlock <lock-id>`"
    }
  ]
}
{{< /quiz >}}

