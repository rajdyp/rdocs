---
title: "Resources and Meta-Arguments Quiz"
linkTitle: Resources and Meta-Arguments
type: docs
weight: 4
prev: /quiz/terraform/03-configuration-basics
next: /quiz/terraform/05-variables-and-outputs
---

{{< quiz id="terraform-resources-meta-arguments" >}}
{
  "questions": [
    {
      "type": "mcq",
      "question": "What are the five core meta-arguments that work with any Terraform resource type?",
      "options": [
        "`count`, `for_each`, `depends_on`, `provider`, `lifecycle`",
        "`count`, `for_each`, `if`, `else`, `lifecycle`",
        "`count`, `for_each`, `depends_on`, `tags`, `name`",
        "`count`, `each`, `depends_on`, `provider`, `destroy`"
      ],
      "answer": 0,
      "explanation": "The five meta-arguments available for all resource types are: `count`, `for_each`, `depends_on`, `provider`, and `lifecycle`. These are Terraform-specific arguments that control resource behavior.",
      "hint": "Think about the arguments shown in the meta-arguments matrix."
    },
    {
      "type": "code-completion",
      "question": "Complete the code to create 3 identical EC2 instances:",
      "instruction": "Fill in the missing meta-argument",
      "codeTemplate": "resource \"aws_instance\" \"server\" {\n  _____ = 3\n  ami = \"ami-123\"\n  instance_type = \"t2.micro\"\n}",
      "answer": "count",
      "caseSensitive": false,
      "acceptedAnswers": ["count"],
      "explanation": "The `count` meta-argument creates multiple identical instances of a resource. Setting `count = 3` creates three instances addressed as `[0]`, `[1]`, `[2]`."
    },
    {
      "type": "true-false",
      "question": "When using `count`, if you remove an item from the middle of the list, Terraform will only destroy that specific item without affecting others.",
      "answer": false,
      "explanation": "This is FALSE and a major pitfall of `count`. When using `count`, items are indexed by position. Removing an item from the middle causes all subsequent items to shift down, resulting in Terraform destroying and recreating those shifted items. This is why `for_each` is often preferred for dynamic collections.",
      "hint": "Think about how count uses array indices."
    },
    {
      "type": "mcq",
      "question": "What is the primary advantage of using `for_each` over `count`?",
      "options": [
        "`for_each` is faster than `count`",
        "`for_each` provides stable addressing using keys instead of indices",
        "`for_each` can only be used with maps, making it simpler",
        "`for_each` automatically creates backups of resources"
      ],
      "answer": 1,
      "explanation": "`for_each` provides stable addressing using keys instead of numeric indices. This means adding or removing items doesn't affect other items. For example, `server[\"web\"]` remains stable even if `server[\"app\"]` is removed.",
      "hint": "Consider what happens when you remove an item from the middle of a collection."
    },
    {
      "type": "fill-blank",
      "question": "Within a resource using `for_each`, what variable gives you access to the current map value?",
      "answer": "each.value",
      "caseSensitive": true,
      "explanation": "Inside a resource with `for_each`, you access the current key with `each.key` and the current value with `each.value`. For example, in `for_each = var.instances`, `each.key` might be \"web\" and `each.value` would be the corresponding value.",
      "hint": "It starts with 'each.' and refers to the data, not the identifier."
    },
    {
      "type": "code-output",
      "question": "Given this Terraform code, what will be the reference address for the 'app' instance?",
      "code": "variable \"servers\" {\n  default = [\"web\", \"app\", \"db\"]\n}\n\nresource \"aws_instance\" \"server\" {\n  for_each = toset(var.servers)\n  ami = \"ami-123\"\n  instance_type = \"t2.micro\"\n}",
      "language": "hcl",
      "options": [
        "`aws_instance.server[1]`",
        "`aws_instance.server.app`",
        "`aws_instance.server[\"app\"]`",
        "`aws_instance.server.server[\"app\"]`"
      ],
      "answer": 2,
      "explanation": "When using `for_each` with a set, resources are addressed using the key in brackets: `aws_instance.server[\"app\"]`. This is different from `count`, which uses numeric indices like `[0]`, `[1]`, `[2]`.",
      "hint": "for_each uses key-based addressing, not numeric indices."
    },
    {
      "type": "multiple-select",
      "question": "Which of the following are valid use cases for the `depends_on` meta-argument?",
      "options": [
        "When an IAM policy must be attached before an EC2 instance starts",
        "When a subnet needs to reference its VPC ID",
        "When an application server needs a database to be created first but doesn't directly reference it",
        "When you want to explicitly set the order of all resource creation"
      ],
      "answers": [0, 2],
      "explanation": "`depends_on` should only be used for hidden dependencies that Terraform cannot automatically infer. Option 1 (IAM policy) and Option 3 (database without direct reference) are valid uses. Option 2 (subnet referencing VPC) creates an implicit dependency automatically. Option 4 is not recommended - only use `depends_on` when necessary, not for all resources.",
      "hint": "depends_on is for HIDDEN dependencies that Terraform can't automatically detect through references."
    },
    {
      "type": "flashcard",
      "question": "What does the `provider` meta-argument do?",
      "answer": "**Selects a non-default provider configuration**\n\nThe `provider` meta-argument allows you to use an aliased provider instead of the default one. This is essential for multi-region or multi-account deployments.\n\nExample: `provider = aws.west` uses the AWS provider with alias \"west\" instead of the default provider."
    },
    {
      "type": "drag-drop",
      "question": "Arrange these lifecycle argument options in order from most to least restrictive:",
      "instruction": "Drag to arrange from most restrictive (prevents changes) to least restrictive",
      "items": [
        "prevent_destroy",
        "create_before_destroy",
        "ignore_changes",
        "replace_triggered_by"
      ],
      "correctOrder": [0, 2, 3, 1],
      "explanation": "From most to least restrictive: 1) `prevent_destroy` - blocks destruction entirely, 2) `ignore_changes` - prevents Terraform from making changes to specified attributes, 3) `replace_triggered_by` - forces replacement based on other resource changes, 4) `create_before_destroy` - just changes replacement order but doesn't prevent changes."
    },
    {
      "type": "mcq",
      "question": "What is the default behavior when a `remote-exec` provisioner fails during resource creation?",
      "options": [
        "The error is logged but ignored, and apply continues",
        "The resource is marked as tainted and apply fails",
        "Terraform automatically retries the provisioner 3 times",
        "The resource is created but marked with a warning"
      ],
      "answer": 1,
      "explanation": "By default (`on_failure = fail`), when a provisioner fails, the resource is marked as **tainted** and the apply fails. On the next apply, Terraform will recreate the tainted resource. You can change this with `on_failure = continue` to ignore errors.",
      "hint": "Think about what happens to resources that fail during creation."
    },
    {
      "type": "true-false",
      "question": "Provisioners are recommended as the first choice for configuring resources in Terraform.",
      "answer": false,
      "explanation": "FALSE. Provisioners are a **LAST RESORT**. The documentation explicitly warns about this. Prefer alternatives like cloud-init/user_data, Packer for AMI building, or configuration management tools (Ansible, Chef). Use provisioners only when no other option exists.",
      "hint": "Review the warning box in the Provisioners section."
    },
    {
      "type": "fill-blank",
      "question": "What provisioner type runs commands on the machine executing Terraform?",
      "answer": "local-exec",
      "caseSensitive": true,
      "explanation": "The `local-exec` provisioner runs commands on the local machine where Terraform is being executed, not on the resource being created. In contrast, `remote-exec` runs commands on the remote resource.",
      "hint": "Think about where the command executes - locally or remotely."
    },
    {
      "type": "mcq",
      "question": "What is the fundamental difference between a resource and a data source in Terraform?",
      "options": [
        "Resources are faster than data sources",
        "Resources create/manage infrastructure, data sources read existing infrastructure",
        "Data sources can only be used with AWS",
        "Resources require providers, data sources don't"
      ],
      "answer": 1,
      "explanation": "Resources (`resource` blocks) create and manage infrastructure - Terraform controls their lifecycle. Data sources (`data` blocks) only read/query existing infrastructure - Terraform just fetches information about them but doesn't manage them.",
      "hint": "Think about what Terraform controls vs. what it just reads."
    },
    {
      "type": "code-completion",
      "question": "Complete the code to reference a data source for an existing VPC:",
      "instruction": "Fill in the missing keyword",
      "codeTemplate": "_____ \"aws_vpc\" \"existing\" {\n  id = \"vpc-123456\"\n}\n\nresource \"aws_subnet\" \"main\" {\n  vpc_id = data.aws_vpc.existing.id\n}",
      "answer": "data",
      "caseSensitive": false,
      "acceptedAnswers": ["data"],
      "explanation": "Data sources are declared with the `data` keyword, not `resource`. The syntax is `data \"provider_type\" \"name\"`. They allow you to fetch information about existing infrastructure."
    },
    {
      "type": "multiple-select",
      "question": "According to the decision tree, when should you use `for_each` instead of `count`?",
      "options": [
        "When items have stable identifiers (like names)",
        "When you're creating exactly 3 resources",
        "When items will be added or removed dynamically",
        "When you need conditional creation (0 or 1 instances)"
      ],
      "answers": [0, 2],
      "explanation": "Use `for_each` when: 1) Items have stable identifiers that won't change, and 2) Items will be added/removed dynamically (for_each handles this safely without recreating other resources). Use `count` for conditional creation (0 or 1) or when you just need a fixed number without dynamic changes.",
      "hint": "Think about stability and dynamic changes."
    },
    {
      "type": "code-output",
      "question": "What happens when you apply this configuration with `var.create_instance = false`?",
      "code": "variable \"create_instance\" {\n  type = bool\n  default = true\n}\n\nresource \"aws_instance\" \"web\" {\n  count = var.create_instance ? 1 : 0\n  ami = \"ami-123\"\n  instance_type = \"t2.micro\"\n}",
      "language": "hcl",
      "options": [
        "Creates one instance with default settings",
        "Terraform throws an error",
        "Destroys the instance if it exists, or creates nothing if it doesn't exist",
        "Creates a placeholder instance"
      ],
      "answer": 2,
      "explanation": "When `count = 0`, the resource is not created (or is destroyed if it existed). The ternary `var.create_instance ? 1 : 0` evaluates to 0 when false, resulting in zero instances. This is a common pattern for conditional resource creation.",
      "hint": "What does count = 0 mean for resource creation?"
    },
    {
      "type": "flashcard",
      "question": "What is the purpose of `create_before_destroy` in the lifecycle block?",
      "answer": "**Changes resource replacement order to eliminate downtime**\n\nDefault behavior: Destroy old → Create new (causes downtime)\n\nWith `create_before_destroy = true`: Create new → Destroy old (zero downtime)\n\nThis is critical for resources that must always be available, like load balancers or DNS records."
    },
    {
      "type": "mcq",
      "question": "If you need to convert a list to work with `for_each`, which function should you use?",
      "options": [
        "`tolist()`",
        "`tomap()`",
        "`toset()`",
        "`foreach()`"
      ],
      "answer": 2,
      "explanation": "`for_each` requires either a map or a set, not a list. Use `toset()` to convert a list to a set. Example: `for_each = toset([\"web\", \"app\", \"db\"])`. You can also use `tomap()` if you need key-value pairs.",
      "hint": "for_each accepts maps or sets, not lists."
    },
    {
      "type": "true-false",
      "question": "The `ignore_changes` lifecycle argument prevents Terraform from detecting any changes to the specified attributes, even in plan output.",
      "answer": true,
      "explanation": "TRUE. When you use `ignore_changes = [attribute]`, Terraform completely ignores drift in those attributes. This is useful when attributes are managed externally (like auto-scaling capacity or tags managed by other tools). Terraform won't show changes or attempt to update those attributes.",
      "hint": "Think about what 'ignore' means in this context."
    },
    {
      "type": "multiple-select",
      "question": "Which of the following statements about provisioners are correct?",
      "options": [
        "The `file` provisioner can copy files from local to remote machines",
        "Provisioners are idempotent by default",
        "The `when = destroy` parameter runs provisioners during resource destruction",
        "Provisioners can be used with the `self` object to reference the resource being created"
      ],
      "answers": [0, 2, 3],
      "explanation": "Correct statements: 1) `file` provisioner copies files local→remote, 2) `when = destroy` runs provisioners during destruction, 3) `self` references the current resource. INCORRECT: Provisioners are NOT idempotent by default - you must design them to be idempotent yourself.",
      "hint": "Think about provisioner capabilities and limitations."
    },
    {
      "type": "code-output",
      "question": "How many subnets will this code create?",
      "code": "variable \"availability_zones\" {\n  default = [\"us-east-1a\", \"us-east-1b\", \"us-east-1c\"]\n}\n\nresource \"aws_subnet\" \"public\" {\n  count = length(var.availability_zones)\n  vpc_id = aws_vpc.main.id\n  cidr_block = \"10.0.${count.index}.0/24\"\n  availability_zone = var.availability_zones[count.index]\n}",
      "language": "hcl",
      "options": [
        "1 subnet",
        "2 subnets",
        "3 subnets",
        "Error: cannot use length() with count"
      ],
      "answer": 2,
      "explanation": "The `length()` function returns 3 (the number of AZs in the list), so `count = 3`, creating 3 subnets. The subnets will have CIDR blocks 10.0.0.0/24, 10.0.1.0/24, and 10.0.2.0/24 using `count.index`.",
      "hint": "What does length([\"us-east-1a\", \"us-east-1b\", \"us-east-1c\"]) return?"
    },
    {
      "type": "mcq",
      "question": "When should you use an aliased provider with the `provider` meta-argument?",
      "options": [
        "When you need better performance",
        "When deploying to multiple regions or accounts",
        "When you want to use a newer provider version",
        "When creating more than 10 resources"
      ],
      "answer": 1,
      "explanation": "Use aliased providers (with the `provider` meta-argument) when deploying across multiple regions, accounts, or configurations. For example, deploying resources in both `us-east-1` and `us-west-2` requires two provider configurations, one as default and one with an alias.",
      "hint": "Think about scenarios requiring different provider configurations simultaneously."
    },
    {
      "type": "fill-blank",
      "question": "What lifecycle argument would you use to force a resource to be replaced whenever another resource changes?",
      "answer": "replace_triggered_by",
      "caseSensitive": true,
      "explanation": "`replace_triggered_by` forces a resource to be replaced when specified resources or attributes change. Example: `replace_triggered_by = [aws_security_group.web.id]` recreates an instance whenever the security group changes.",
      "hint": "Look for the lifecycle argument that 'triggers' replacement based on other resources."
    },
    {
      "type": "drag-drop",
      "question": "Arrange these steps in the order Terraform manages a resource lifecycle:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Create (when first applied)",
        "Read (refresh state)",
        "Update (when arguments change)",
        "Delete (when removed or destroyed)"
      ],
      "correctOrder": [0, 1, 2, 3],
      "explanation": "Terraform manages the complete resource lifecycle: 1) **Create** - when first applied, 2) **Read** - refresh state to detect drift, 3) **Update** - when configuration changes, 4) **Delete** - when removed from config or destroyed."
    },
    {
      "type": "true-false",
      "question": "Data sources can have dependencies on resources, meaning Terraform will wait for the resource to be created before querying the data source.",
      "answer": true,
      "explanation": "TRUE. Data sources can depend on resources. For example, if a data source references `aws_vpc.main.id`, Terraform will create the VPC first, then query the data source. This allows you to query resources you just created.",
      "hint": "Think about whether data sources can reference resource attributes."
    },
    {
      "type": "mcq",
      "question": "What is the splat operator used for when working with `count`?",
      "options": [
        "To multiply resource counts",
        "To reference all instances created by count",
        "To split strings in resource names",
        "To delete all resources at once"
      ],
      "answer": 1,
      "explanation": "The splat operator `[*]` references all instances created by `count`. Example: `aws_instance.server[*].public_ip` returns a list of all public IPs from all instances, instead of accessing them individually with `[0]`, `[1]`, etc.",
      "hint": "Think about accessing all instances at once instead of individually."
    }
  ]
}
{{< /quiz >}}
