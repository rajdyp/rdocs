---
title: "Variables and Outputs Quiz"
linkTitle: Variables and Outputs
type: docs
weight: 5
prev: /quiz/terraform/04-resources-and-meta-arguments
---

{{< quiz id="terraform-variables-outputs-quiz" >}}
{
  "questions": [
    {
      "type": "mcq",
      "question": "What is the PRIMARY benefit of using variables in Terraform instead of hardcoded values?",
      "options": [
        "Variables make the code run faster",
        "Variables enable reusing the same configuration across multiple environments",
        "Variables are required by Terraform to run properly",
        "Variables automatically validate input values"
      ],
      "answer": 1,
      "explanation": "The primary benefit is reusability - you can use the same Terraform code across dev, staging, and production by simply changing variable values, without modifying the code itself.",
      "hint": "Think about deploying the same infrastructure to different environments."
    },
    {
      "type": "multiple-select",
      "question": "Which of the following are primitive types in Terraform?",
      "options": [
        "string",
        "list",
        "number",
        "bool",
        "map"
      ],
      "answers": [0, 2, 3],
      "explanation": "Primitive types in Terraform are: string, number, and bool. List and map are collection types (complex types).",
      "hint": "Primitive types are the simplest, most basic data types."
    },
    {
      "type": "true-false",
      "question": "A variable without a default value is optional and can be omitted when running Terraform.",
      "answer": false,
      "explanation": "Variables without default values are REQUIRED and must be provided either through .tfvars files, command-line flags, or environment variables. Only variables WITH default values are optional.",
      "hint": "Consider what happens when Terraform doesn't know what value to use."
    },
    {
      "type": "fill-blank",
      "question": "To reference a variable named 'region' in your Terraform configuration, you would use: _____",
      "answer": "var.region",
      "caseSensitive": false,
      "explanation": "Variables are referenced using the `var.` prefix followed by the variable name: `var.region`.",
      "hint": "All variable references start with a three-letter prefix."
    },
    {
      "type": "code-output",
      "question": "What will be the final value of `instance_type` given this precedence chain?",
      "code": "# variables.tf: default = \"t2.micro\"\n# TF_VAR_instance_type = \"t2.small\"\n# terraform.tfvars: instance_type = \"t2.medium\"\n# Command: terraform apply -var=\"instance_type=t2.large\"",
      "language": "bash",
      "options": [
        "t2.micro",
        "t2.small",
        "t2.medium",
        "t2.large"
      ],
      "answer": 3,
      "explanation": "Command-line `-var` flags have the highest precedence and override all other sources. The precedence order is: default < environment vars < .tfvars < -var flags.",
      "hint": "Command-line flags win over all other variable sources."
    },
    {
      "type": "flashcard",
      "question": "What is the difference between a Map and an Object in Terraform?",
      "answer": "**Map:** Flexible key-value pairs where all values must be the same type. Keys can be any string, and you can add/remove keys dynamically.\n\n**Object:** Fixed structure with predefined keys where each field can have a different type. Schema enforces required fields.\n\n**Example:**\n- Map: `map(string)` - any keys, all string values\n- Object: `object({name=string, age=number})` - fixed keys, mixed types"
    },
    {
      "type": "drag-drop",
      "question": "Arrange these variable value sources from LOWEST to HIGHEST precedence:",
      "instruction": "Drag to arrange in the correct order (lowest precedence first)",
      "items": [
        "Default value in variable block",
        "Environment variables (TF_VAR_*)",
        "terraform.tfvars file",
        "-var command-line flag"
      ],
      "correctOrder": [0, 1, 2, 3],
      "explanation": "Correct precedence order: 1) Default values (lowest), 2) Environment variables, 3) .tfvars files, 4) -var command-line flags (highest)."
    },
    {
      "type": "code-completion",
      "question": "Complete the variable declaration to accept a list of strings:",
      "instruction": "Fill in the missing type constraint",
      "codeTemplate": "variable \"availability_zones\" {\n  type = _____\n  default = [\"us-east-1a\", \"us-east-1b\"]\n}",
      "answer": "list(string)",
      "caseSensitive": false,
      "acceptedAnswers": ["list(string)"],
      "explanation": "For a list containing strings, the type constraint is `list(string)`. This ensures the variable only accepts a list where all elements are strings."
    },
    {
      "type": "mcq",
      "question": "When using `for_each` with a set variable to create multiple S3 buckets, what advantage does this provide over using `count` with a list?",
      "options": [
        "Sets are faster to process than lists",
        "Sets automatically prevent duplicate values",
        "Removing a bucket from the set won't affect other buckets (unlike count which uses indexes)",
        "Sets can contain different data types"
      ],
      "answer": 2,
      "explanation": "The key advantage is stability: with `for_each` on sets, resources are keyed by value (e.g., `aws_s3_bucket.buckets[\"app-logs\"]`). Removing one doesn't shift indexes like with `count`, preventing unintended resource destruction/recreation.",
      "hint": "Think about what happens when you remove the middle element from a list vs a set."
    },
    {
      "type": "multiple-select",
      "question": "Which validation functions can be used in variable validation blocks?",
      "options": [
        "contains() - check if value exists in list",
        "can() - test if expression succeeds",
        "regex() - match string patterns",
        "length() - check string/list length",
        "All of the above"
      ],
      "answers": [4],
      "explanation": "All of these functions (and more) can be used in validation blocks. Common patterns include: `contains()` for allowed values, `can(regex())` for pattern matching, `length()` for size constraints, and `can()` to safely test expressions.",
      "hint": "Validation blocks support a wide range of Terraform functions."
    },
    {
      "type": "true-false",
      "question": "Setting `sensitive = true` on a variable encrypts the value in the state file.",
      "answer": false,
      "explanation": "FALSE. The `sensitive` flag only hides the value in console output and logs. It does NOT encrypt the value - sensitive values are still stored in plain text in the state file. Use external secret management (AWS Secrets Manager, Vault) for true security.",
      "hint": "Think about where Terraform actually stores resource data."
    },
    {
      "type": "fill-blank",
      "question": "To mark a variable as sensitive and hide its value in Terraform output, set _____ = true",
      "answer": "sensitive",
      "caseSensitive": false,
      "explanation": "The `sensitive` attribute when set to `true` prevents Terraform from showing the variable value in plan and apply output, displaying `<sensitive>` instead.",
      "hint": "The attribute name describes what kind of data it protects."
    },
    {
      "type": "code-output",
      "question": "Given this configuration, how many subnets will be created?",
      "code": "variable \"availability_zones\" {\n  default = [\"us-east-1a\", \"us-east-1b\", \"us-east-1c\"]\n}\n\nresource \"aws_subnet\" \"public\" {\n  count = length(var.availability_zones)\n  availability_zone = var.availability_zones[count.index]\n  cidr_block = \"10.0.${count.index}.0/24\"\n}",
      "language": "hcl",
      "options": [
        "1 subnet",
        "2 subnets",
        "3 subnets",
        "4 subnets"
      ],
      "answer": 2,
      "explanation": "3 subnets will be created. `length(var.availability_zones)` returns 3 (number of items in the list), so `count = 3`. Each iteration creates one subnet in a different AZ: us-east-1a, us-east-1b, us-east-1c.",
      "hint": "Count the number of items in the availability_zones list."
    },
    {
      "type": "mcq",
      "question": "What is the correct way to access a module's output value in the root module?",
      "options": [
        "output.module_name.output_name",
        "module.output_name.module_name",
        "module.module_name.output_name",
        "var.module_name.output_name"
      ],
      "answer": 2,
      "explanation": "Module outputs are accessed using `module.<module_name>.<output_name>`. For example, if you have `module \"vpc\"` with `output \"vpc_id\"`, you reference it as `module.vpc.vpc_id`.",
      "hint": "The syntax starts with the keyword 'module'."
    },
    {
      "type": "flashcard",
      "question": "What is the purpose of output values in Terraform?",
      "answer": "**Output values serve four main purposes:**\n\n1. **Display information** after `terraform apply` (e.g., IP addresses, URLs)\n2. **Share data** between root and child modules\n3. **Query infrastructure** state using `terraform output`\n4. **Provide values** to external systems (via `-json` flag)\n\n**Example:**\n```hcl\noutput \"instance_ip\" {\n  value = aws_instance.web.public_ip\n}\n```\n\nQuery with: `terraform output instance_ip`"
    },
    {
      "type": "code-completion",
      "question": "Complete the validation block to ensure the environment is one of: dev, staging, or prod",
      "instruction": "Fill in the missing condition",
      "codeTemplate": "variable \"environment\" {\n  type = string\n  \n  validation {\n    condition     = _____\n    error_message = \"Environment must be dev, staging, or prod.\"\n  }\n}",
      "answer": "contains([\"dev\", \"staging\", \"prod\"], var.environment)",
      "caseSensitive": false,
      "acceptedAnswers": ["contains([\"dev\", \"staging\", \"prod\"], var.environment)", "contains([\"dev\",\"staging\",\"prod\"],var.environment)"],
      "explanation": "The `contains()` function checks if a value exists in a list. Syntax: `contains(list, value)`. This validates that `var.environment` is one of the allowed values."
    },
    {
      "type": "multiple-select",
      "question": "Which statements about complex types are TRUE?",
      "options": [
        "A map(object({...})) combines flexible keys with structured values",
        "A list(object({...})) maintains order and enforces a consistent schema",
        "An object can have fields of different types (string, number, bool)",
        "A map requires all values to be the same type",
        "All of the above"
      ],
      "answers": [4],
      "explanation": "All statements are true. Complex types combine basic types: map of objects gives flexibility + structure, list of objects gives order + schema, objects allow mixed types per field, and maps enforce same type for all values.",
      "hint": "Complex types build on the rules of their component types."
    },
    {
      "type": "true-false",
      "question": "When using *.auto.tfvars files, Terraform loads them automatically in alphabetical order without needing the -var-file flag.",
      "answer": true,
      "explanation": "TRUE. Files matching `*.auto.tfvars` or `*.auto.tfvars.json` are automatically loaded by Terraform in alphabetical order, without requiring explicit `-var-file` flags.",
      "hint": "The '.auto.' in the filename is a hint about its behavior."
    },
    {
      "type": "mcq",
      "question": "Which approach is BEST PRACTICE for storing database passwords in Terraform?",
      "options": [
        "Set sensitive = true in the variable block and store in terraform.tfvars",
        "Store in environment variables with TF_VAR_ prefix",
        "Fetch from external secret management system (AWS Secrets Manager, Vault) at runtime",
        "Encrypt the terraform.tfvars file with GPG"
      ],
      "answer": 2,
      "explanation": "Best practice is to fetch secrets from external secret management at runtime using data sources. This keeps secrets out of your code, state files, and git. The `sensitive` flag only hides display output but doesn't encrypt storage.",
      "hint": "Think about where secrets should actually be stored and managed."
    },
    {
      "type": "code-output",
      "question": "What will happen when you run terraform apply with this configuration?",
      "code": "variable \"project_name\" {\n  type = string\n  # No default value\n}\n\nresource \"aws_vpc\" \"main\" {\n  cidr_block = \"10.0.0.0/16\"\n  tags = {\n    Name = var.project_name\n  }\n}",
      "language": "hcl",
      "options": [
        "Terraform will use an empty string for project_name",
        "Terraform will prompt for the project_name value",
        "Terraform will skip creating the VPC",
        "Terraform will generate a random project_name"
      ],
      "answer": 1,
      "explanation": "Terraform will prompt you to enter a value for `project_name` because it's a required variable (no default). You can provide it interactively, via -var flag, environment variable, or .tfvars file.",
      "hint": "Required variables must be provided somehow."
    },
    {
      "type": "fill-blank",
      "question": "To set a Terraform variable via environment variable, use the prefix _____",
      "answer": "TF_VAR_",
      "caseSensitive": true,
      "explanation": "Environment variables for Terraform must use the `TF_VAR_` prefix. For example, to set variable `region`, use: `export TF_VAR_region=\"us-east-1\"`",
      "hint": "The prefix is three characters followed by an underscore."
    },
    {
      "type": "flashcard",
      "question": "Explain the difference between `count` and `for_each` when creating multiple resources.",
      "answer": "**count:**\n- Creates resources indexed by number: `[0]`, `[1]`, `[2]`\n- Order matters; removing middle item shifts indexes\n- Can cause unintended resource destruction/recreation\n- Use for: simple, fixed-count resources\n\n**for_each:**\n- Creates resources keyed by value: `[\"web\"]`, `[\"app\"]`\n- No index shifting; remove by name\n- Safer for dynamic resource sets\n- Works with: sets and maps\n- Use for: resources that change dynamically\n\n**Example impact:**\nWith `count`, removing `[1]` makes `[2]` become `[1]` → destroys & recreates.\nWith `for_each`, removing `[\"app\"]` only removes that one resource."
    },
    {
      "type": "mcq",
      "question": "In a map of objects variable, what does `each.key` represent when used with `for_each`?",
      "options": [
        "The index number of the current iteration",
        "The map key (e.g., 'web', 'app', 'db')",
        "The entire object value",
        "The first field of the object"
      ],
      "answer": 1,
      "explanation": "`each.key` represents the map key in a for_each loop. For `instances = {web = {...}, app = {...}}`, each.key would be \"web\" or \"app\". Use `each.value` to access the object fields.",
      "hint": "Think about the structure: map has keys and values."
    },
    {
      "type": "code-completion",
      "question": "Complete the object type definition for an instance configuration:",
      "instruction": "Fill in the missing type structure",
      "codeTemplate": "variable \"instance_config\" {\n  type = _____\n  \n  default = {\n    instance_type = \"t2.micro\"\n    ami = \"ami-12345\"\n    monitoring = true\n  }\n}",
      "answer": "object({instance_type = string, ami = string, monitoring = bool})",
      "caseSensitive": false,
      "acceptedAnswers": [
        "object({instance_type = string, ami = string, monitoring = bool})",
        "object({ instance_type = string, ami = string, monitoring = bool })",
        "object({ami=string,instance_type=string,monitoring=bool})"
      ],
      "explanation": "An object type requires defining the schema with field names and their types: `object({instance_type = string, ami = string, monitoring = bool})`. Field order doesn't matter, but all fields must be defined."
    },
    {
      "type": "multiple-select",
      "question": "Which are valid ways to provide variable values to Terraform? (Select all that apply)",
      "options": [
        "terraform.tfvars file (automatically loaded)",
        "Command-line: -var=\"key=value\"",
        "Environment variable: TF_VAR_key=value",
        "Custom file: terraform apply -var-file=\"custom.tfvars\"",
        "All of the above"
      ],
      "answers": [4],
      "explanation": "All of these are valid methods to provide variable values. Terraform supports multiple input methods with different precedence levels, giving flexibility in how you configure your infrastructure.",
      "hint": "Terraform provides multiple ways to set variables for flexibility."
    },
    {
      "type": "true-false",
      "question": "The 'any' type should be preferred over specific types like 'string' or 'number' because it provides more flexibility.",
      "answer": false,
      "explanation": "FALSE. While 'any' is more flexible, specific types are preferred because they provide type safety, better validation, and clearer documentation. Only use 'any' when the type truly varies based on input or when building generic modules.",
      "hint": "Consider the trade-off between flexibility and safety/clarity."
    },
    {
      "type": "drag-drop",
      "question": "Arrange these file organization elements in the recommended structure:",
      "instruction": "Drag to arrange in logical order for a Terraform project",
      "items": [
        "variables.tf (declarations)",
        "terraform.tfvars (common values)",
        "main.tf (resources)",
        "outputs.tf (output definitions)"
      ],
      "correctOrder": [0, 1, 2, 3],
      "explanation": "Recommended organization: 1) variables.tf for declarations, 2) terraform.tfvars for values, 3) main.tf for resources, 4) outputs.tf for outputs. This separation makes code easier to navigate and maintain."
    }
  ]
}
{{< /quiz >}}

