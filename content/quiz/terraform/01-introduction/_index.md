---
title: "Terraform Introduction Quiz"
linkTitle: Terraform Introduction
type: docs
weight: 1
prev: /quiz/terraform
next: /quiz/terraform/02-workflow-and-cli
---

{{< quiz id="terraform-introduction-quiz" >}}
{
  "questions": [
    {
      "id": "terraform-introduction-quiz-01",
      "type": "mcq",
      "question": "What is Terraform primarily used for?",
      "options": [
        "Application deployment and CI/CD automation",
        "Infrastructure provisioning using Infrastructure as Code",
        "Configuration management for servers",
        "Real-time infrastructure monitoring"
      ],
      "answer": 1,
      "explanation": "Terraform is an Infrastructure as Code (IaC) tool that allows you to define, provision, and manage infrastructure resources across multiple cloud providers using configuration files.",
      "hint": "Think about what 'Infrastructure as Code' means."
    },
    {
      "id": "terraform-introduction-quiz-02",
      "type": "multiple-select",
      "question": "Which of the following are core principles of Terraform?",
      "options": [
        "Declarative approach",
        "Cloud-agnostic",
        "Immutable infrastructure",
        "Version controlled",
        "Procedural execution"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "Terraform's core principles include being declarative (describe desired state), cloud-agnostic (works with multiple providers), immutable infrastructure (replace rather than modify), and version controlled (track changes like code). Procedural execution is not a Terraform principle—it's declarative, not procedural.",
      "hint": "Terraform follows a declarative model, not procedural."
    },
    {
      "id": "terraform-introduction-quiz-03",
      "type": "true-false",
      "question": "Terraform was originally open-source under MPL 2.0, but changed to Business Source License v1.1 in August 2023.",
      "answer": true,
      "explanation": "Terraform changed from MPL 2.0 to Business Source License v1.1 (BSL 1.1) in August 2023, making it source-available but not fully open-source. This led to the creation of the OpenTofu fork.",
      "hint": "Check the note about licensing in the introduction."
    },
    {
      "id": "terraform-introduction-quiz-04",
      "type": "drag-drop",
      "question": "Arrange the Terraform workflow steps in the correct execution order:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "WRITE (.tf files)",
        "PLAN (preview changes)",
        "APPLY (execute changes)",
        "MANAGE (iterate and update)"
      ],
      "correctOrder": [0, 1, 2, 3],
      "explanation": "The Terraform workflow follows: Write configuration → Plan (preview) → Apply (execute) → Manage (iterate). This ensures you always preview changes before applying them."
    },
    {
      "id": "terraform-introduction-quiz-05",
      "type": "flashcard",
      "question": "What is the State File in Terraform?",
      "answer": "**Terraform State File (terraform.tfstate)**\n\nThe state file is Terraform's record of managed infrastructure that:\n- Maps configuration to real-world resources\n- Tracks metadata and resource dependencies\n- Enables Terraform to know what currently exists\n- Is critical for determining what changes to make\n- Helps Terraform calculate the difference between desired and actual state"
    },
    {
      "id": "terraform-introduction-quiz-06",
      "type": "fill-blank",
      "question": "What does HCL stand for in Terraform?",
      "answer": "HashiCorp Configuration Language",
      "caseSensitive": false,
      "explanation": "HCL stands for HashiCorp Configuration Language, which is the human-readable language used to write Terraform configuration files (.tf).",
      "hint": "It's a language created by HashiCorp."
    },
    {
      "id": "terraform-introduction-quiz-07",
      "type": "mcq",
      "question": "During the `terraform plan` phase, what does Terraform do to detect state drift?",
      "options": [
        "Only reads the local state file",
        "Queries the cloud provider to compare actual resources with the state file",
        "Automatically fixes any drift it finds",
        "Sends an email notification about changes"
      ],
      "answer": 1,
      "explanation": "During the plan phase, Terraform queries the cloud provider to check whether actual resources differ from what's recorded in the state file. This difference is called state drift. Terraform detects and reports drift during plan but only reconciles it when you run apply.",
      "hint": "Think about how Terraform knows if someone made manual changes in the console."
    },
    {
      "id": "terraform-introduction-quiz-08",
      "type": "multiple-select",
      "question": "What are the benefits of Infrastructure as Code compared to traditional manual approaches?",
      "options": [
        "Fast and repeatable deployments",
        "Requires more time per deployment",
        "Full version history",
        "Error-prone manual steps",
        "Team collaboration through Git",
        "Automatically documented"
      ],
      "answers": [0, 2, 4, 5],
      "explanation": "IaC provides fast and repeatable deployments, full version history, team collaboration through Git, and automatic documentation. Traditional manual approaches are time-consuming and error-prone, which IaC solves.",
      "hint": "Look for the benefits listed under the IaC approach section."
    },
    {
      "id": "terraform-introduction-quiz-09",
      "type": "code-completion",
      "question": "Complete the command to initialize a Terraform working directory:",
      "instruction": "Fill in the missing command",
      "codeTemplate": "terraform _____",
      "answer": "init",
      "caseSensitive": false,
      "acceptedAnswers": ["init"],
      "explanation": "The `terraform init` command initializes a Terraform working directory by downloading providers, initializing modules, and setting up the backend."
    },
    {
      "id": "terraform-introduction-quiz-10",
      "type": "mcq",
      "question": "What component in Terraform's architecture translates Terraform commands to API calls for cloud providers?",
      "options": [
        "Terraform Core",
        "Configuration Files",
        "Providers",
        "State File"
      ],
      "answer": 2,
      "explanation": "Providers are plugins that interface with APIs, translate Terraform commands to API calls, handle authentication, and manage resource lifecycle. Examples include AWS, Azure, and GCP providers.",
      "hint": "Think about what sits between Terraform Core and the cloud infrastructure."
    },
    {
      "id": "terraform-introduction-quiz-11",
      "type": "fill-blank",
      "question": "What is the default name of Terraform's state file when using a local backend?",
      "answer": "terraform.tfstate",
      "caseSensitive": true,
      "explanation": "The state file is named `terraform.tfstate` by default when using a local backend. Terraform also creates a `terraform.tfstate.backup` file for the previous state.",
      "hint": "Check the file and directory structure section."
    },
    {
      "id": "terraform-introduction-quiz-12",
      "type": "flashcard",
      "question": "What is a Terraform Provider?",
      "answer": "**Terraform Provider**\n\nA provider is a plugin that interfaces with an API (cloud provider, SaaS platform, etc.). Providers:\n- Translate Terraform commands to API calls\n- Handle authentication with the service\n- Manage resource lifecycle (create, read, update, delete)\n- Examples: AWS, Azure, GCP, Kubernetes, CloudFlare\n\nTerraform supports 100+ providers, enabling multi-cloud infrastructure management."
    },
    {
      "id": "terraform-introduction-quiz-13",
      "type": "mcq",
      "question": "Which directory is created by `terraform init` and should typically be excluded from version control?",
      "options": [
        "terraform.tfvars",
        ".terraform/",
        "outputs.tf",
        ".terraform.lock.hcl"
      ],
      "answer": 1,
      "explanation": "The `.terraform/` directory is created by `terraform init` and contains the local cache, downloaded provider plugins, and modules. It should be excluded from version control as it can be regenerated. The `.terraform.lock.hcl` file should be committed to lock provider versions.",
      "hint": "This directory contains downloaded providers and is a local cache."
    },
    {
      "id": "terraform-introduction-quiz-14",
      "type": "true-false",
      "question": "Terraform follows a procedural approach where you specify the exact steps to create infrastructure.",
      "answer": false,
      "explanation": "Terraform follows a declarative approach, not procedural. You describe WHAT you want (the desired end state), and Terraform figures out HOW to create it. Procedural approaches require you to specify the exact steps.",
      "hint": "Think about whether you write 'what you want' or 'how to do it' in Terraform."
    },
    {
      "id": "terraform-introduction-quiz-15",
      "type": "multiple-select",
      "question": "What operations does Terraform Core perform?",
      "options": [
        "Read and parse configuration files",
        "Build dependency graph",
        "Manage state",
        "Execute plans",
        "Directly interact with cloud APIs"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "Terraform Core reads and parses configuration files, builds dependency graphs, manages state, and executes plans. However, it doesn't directly interact with cloud APIs—that's the job of provider plugins.",
      "hint": "Core handles the logic, but providers handle the API interaction."
    },
    {
      "id": "terraform-introduction-quiz-16",
      "type": "mcq",
      "question": "What happens when you run `terraform apply` without a saved plan?",
      "options": [
        "Terraform immediately applies changes without showing them",
        "Terraform re-runs the plan before applying",
        "Terraform throws an error",
        "Terraform only reads the state file"
      ],
      "answer": 1,
      "explanation": "When you run `terraform apply` without a saved plan, Terraform re-runs the plan phase to show you what will change and asks for approval before applying. This ensures you always see what's about to happen.",
      "hint": "Check the detailed workflow diagram for the apply phase."
    },
    {
      "id": "terraform-introduction-quiz-17",
      "type": "flashcard",
      "question": "What is a Terraform Module?",
      "answer": "**Terraform Module**\n\nA module is a reusable unit that groups related resources together. Modules enable:\n- Code reusability across projects\n- Abstraction of complex configurations\n- Standardization of infrastructure patterns\n- Better organization and maintainability\n\nExamples: VPC module, ECS cluster module, networking module.\n\nAll Terraform configurations are technically modules—even a single `.tf` file is considered the root module."
    },
    {
      "id": "terraform-introduction-quiz-18",
      "type": "mcq",
      "question": "Which comparison is accurate regarding Terraform vs CloudFormation?",
      "options": [
        "Both are limited to AWS only",
        "Terraform is multi-cloud while CloudFormation is AWS only",
        "CloudFormation uses HCL syntax",
        "Both use implicit state management"
      ],
      "answer": 1,
      "explanation": "Terraform is multi-cloud and works with 100+ providers, while CloudFormation is AWS only. Terraform uses HCL (not CloudFormation), and Terraform uses explicit state files while CloudFormation uses implicit state managed within AWS.",
      "hint": "Think about which tool is cloud-agnostic."
    },
    {
      "id": "terraform-introduction-quiz-19",
      "type": "drag-drop",
      "question": "Arrange these layers in Terraform's architecture from top to bottom:",
      "instruction": "Drag to arrange from user-facing to infrastructure",
      "items": [
        "User Layer (Configuration Files)",
        "Terraform Core",
        "Provider Layer (AWS, Azure, GCP)",
        "Cloud Infrastructure (Resources)"
      ],
      "correctOrder": [0, 1, 2, 3],
      "explanation": "The architecture flows: User Layer (where you write .tf files) → Terraform Core (execution engine) → Provider Layer (plugins for cloud APIs) → Cloud Infrastructure (actual resources like EC2, VPC, etc.)."
    },
    {
      "id": "terraform-introduction-quiz-20",
      "type": "multiple-select",
      "question": "Which scenarios are good use cases for Terraform?",
      "options": [
        "Provisioning cloud infrastructure",
        "Application deployment and CI/CD",
        "Multi-cloud environments",
        "Infrastructure versioning",
        "Real-time configuration changes",
        "Collaborative infrastructure management"
      ],
      "answers": [0, 2, 3, 5],
      "explanation": "Terraform is ideal for provisioning cloud infrastructure, multi-cloud environments, infrastructure versioning, and collaborative management. However, it's not ideal for application deployment (use CI/CD tools instead) or real-time changes (Terraform is plan-based, not real-time).",
      "hint": "Think about what Terraform was designed to manage versus what other tools handle better."
    },
    {
      "id": "terraform-introduction-quiz-21",
      "type": "true-false",
      "question": "During `terraform apply`, Terraform acquires a state lock to prevent concurrent modifications.",
      "answer": true,
      "explanation": "During the apply phase, Terraform acquires a state lock to prevent multiple users or processes from modifying the state simultaneously. This prevents conflicts and ensures safe concurrent operations. The lock is released after the apply completes.",
      "hint": "Check the detailed workflow diagram for the apply phase."
    },
    {
      "id": "terraform-introduction-quiz-22",
      "type": "fill-blank",
      "question": "What is the term for when actual cloud resources differ from what's recorded in Terraform's state file?",
      "answer": "state drift",
      "caseSensitive": false,
      "explanation": "State drift occurs when actual resources in the cloud differ from what's recorded in the state file (e.g., manual changes made in the console). Terraform detects drift during `terraform plan` but only reconciles it during `terraform apply`.",
      "hint": "It's a two-word term describing how resources 'move away' from the recorded state."
    },
    {
      "id": "terraform-introduction-quiz-23",
      "type": "mcq",
      "question": "In what order does Terraform create resources when there are dependencies?",
      "options": [
        "Alphabetically by resource name",
        "Random order",
        "Based on the dependency graph, creating dependencies first",
        "In the order they appear in the .tf file"
      ],
      "answer": 2,
      "explanation": "Terraform automatically builds a dependency graph and creates resources in the correct order based on dependencies. For example, it creates a VPC before subnets, and subnets before EC2 instances. Resources without dependencies can be created in parallel.",
      "hint": "Think about the resource graph example with VPC, subnets, and EC2."
    },
    {
      "id": "terraform-introduction-quiz-24",
      "type": "mcq",
      "question": "When comparing Terraform and Ansible, what is the primary difference in their use cases?",
      "options": [
        "Both are primarily for infrastructure provisioning",
        "Terraform is for infrastructure provisioning, Ansible is for configuration management",
        "Terraform is procedural, Ansible is declarative",
        "Both maintain state by default"
      ],
      "answer": 1,
      "explanation": "Terraform is primarily for infrastructure provisioning (creating infrastructure), while Ansible is primarily for configuration management (configuring servers). They're often used together: Terraform creates the infrastructure (EC2, VPC), and Ansible configures the servers (install packages, deploy apps).",
      "hint": "Think about which tool creates infrastructure vs. which tool configures it."
    },
    {
      "id": "terraform-introduction-quiz-25",
      "type": "flashcard",
      "question": "What is a Terraform Workspace?",
      "answer": "**Terraform Workspace**\n\nA workspace is a named state instance for the same configuration. Workspaces allow you to:\n- Manage multiple environments (dev, staging, prod) with the same configuration\n- Keep separate state files for each environment\n- Switch between environments easily\n- Avoid duplicating configuration files\n\nExample: Same codebase can deploy to `dev`, `staging`, and `prod` workspaces with different state files for each."
    },
    {
      "id": "terraform-introduction-quiz-26",
      "type": "code-completion",
      "question": "Complete the command to preview infrastructure changes before applying them:",
      "instruction": "Fill in the missing command",
      "codeTemplate": "terraform _____",
      "answer": "plan",
      "caseSensitive": false,
      "acceptedAnswers": ["plan"],
      "explanation": "The `terraform plan` command shows a preview of changes Terraform will make, displaying what will be added (+), changed (~), or destroyed (-) before you apply them."
    },
    {
      "id": "terraform-introduction-quiz-27",
      "type": "multiple-select",
      "question": "Which files or directories in a Terraform project are typically committed to version control?",
      "options": [
        "main.tf",
        ".terraform/",
        "variables.tf",
        ".terraform.lock.hcl",
        "terraform.tfstate",
        "outputs.tf"
      ],
      "answers": [0, 2, 3, 5],
      "explanation": "Configuration files (main.tf, variables.tf, outputs.tf) and the lock file (.terraform.lock.hcl) should be committed. The .terraform/ directory and terraform.tfstate file should NOT be committed—the former can be regenerated, and the latter may contain sensitive data and should use remote backends.",
      "hint": "Think about what needs to be shared with the team vs. what can be regenerated."
    },
    {
      "id": "terraform-introduction-quiz-28",
      "type": "true-false",
      "question": "Terraform follows the principle of immutable infrastructure, meaning it replaces resources rather than modifying them in place.",
      "answer": true,
      "explanation": "Terraform follows the immutable infrastructure principle—resources are replaced rather than modified. This ensures consistency, predictability, and eliminates configuration drift that can occur with in-place modifications.",
      "hint": "Check the core principles section."
    },
    {
      "id": "terraform-introduction-quiz-29",
      "type": "mcq",
      "question": "What type of information does a Terraform Data Source provide?",
      "options": [
        "It creates new infrastructure resources",
        "It provides read-only information fetched from providers",
        "It stores Terraform state",
        "It defines reusable modules"
      ],
      "answer": 1,
      "explanation": "A data source provides read-only information fetched from providers. Examples include querying an existing VPC ID, AMI ID, or availability zones. Data sources don't create or modify resources—they only read existing information.",
      "hint": "The key word in the definition is 'read-only'."
    },
    {
      "id": "terraform-introduction-quiz-30",
      "type": "flashcard",
      "question": "What is a Terraform Backend?",
      "answer": "**Terraform Backend**\n\nA backend is where Terraform stores its state file. Backend types include:\n- **Local**: State stored on local filesystem (default)\n- **Remote**: State stored remotely (S3, Terraform Cloud, Azure Blob, etc.)\n\nRemote backends enable:\n- Team collaboration (shared state)\n- State locking (prevent concurrent modifications)\n- Secure storage of sensitive data\n- State versioning and backup\n\nProduction environments should always use remote backends."
    },
    {
      "id": "terraform-introduction-quiz-31",
      "type": "mcq",
      "question": "What file extension do Terraform configuration files use?",
      "options": [
        ".tf",
        ".hcl",
        ".terraform",
        ".tfstate"
      ],
      "answer": 0,
      "explanation": "Terraform configuration files use the `.tf` extension (e.g., main.tf, variables.tf, outputs.tf). These files are written in HCL (HashiCorp Configuration Language).",
      "hint": "It's a two-letter extension."
    }
  ]
}
{{< /quiz >}}

