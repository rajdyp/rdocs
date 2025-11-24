---
title: Identity and Access Management Quiz
linkTitle: Identity and Access Management
type: docs
weight: 7
prev: /quiz/aws/06-load-balancing-and-scaling
next: /quiz/aws/08-storage-services
---

{{< quiz id="aws-iam-quiz" >}}
{
  "questions": [
    {
      "type": "mcq",
      "question": "In AWS IAM's policy evaluation logic, what happens when there is an explicit DENY in any policy?",
      "options": [
        "It is overridden by an ALLOW in a resource-based policy",
        "Access is immediately denied and evaluation stops",
        "It is ignored if the user has administrator access",
        "It depends on whether the permissions boundary allows it"
      ],
      "answer": 1,
      "explanation": "Explicit DENY always wins in IAM policy evaluation. Once an explicit deny is found, evaluation stops immediately and access is denied. This cannot be overridden by any ALLOW, regardless of policy type or user privileges.",
      "hint": "Think about the most restrictive rule in IAM security."
    },
    {
      "type": "multiple-select",
      "question": "Which of the following are characteristics of IAM Roles? (Select all that apply)",
      "options": [
        "They provide temporary credentials",
        "They require permanent access keys",
        "Credentials are automatically rotated",
        "They have a trust policy defining who can assume them",
        "Time-limited between 15 minutes and 12 hours"
      ],
      "answers": [0, 2, 3, 4],
      "explanation": "IAM Roles provide temporary credentials (not permanent access keys) that are automatically rotated. They include a trust policy that defines who can assume them, and the credentials are time-limited from 15 minutes to 12 hours.",
      "hint": "Roles are designed for temporary access without long-term credentials."
    },
    {
      "type": "true-false",
      "question": "Permissions boundaries grant permissions to IAM users and roles.",
      "answer": false,
      "explanation": "Permissions boundaries do NOT grant permissions themselves. They only define the maximum permissions that identity-based policies can grant. Effective permissions are the intersection of the identity policy and the permissions boundary.",
      "hint": "Think about whether boundaries add or limit permissions."
    },
    {
      "type": "fill-blank",
      "question": "What AWS service generates temporary credentials when an IAM role is assumed?",
      "answer": "STS",
      "caseSensitive": false,
      "explanation": "AWS STS (Security Token Service) generates temporary credentials when a role is assumed. These credentials include an access key ID, secret access key, session token, and expiration time.",
      "hint": "It's a three-letter abbreviation for a service related to security tokens."
    },
    {
      "type": "code-output",
      "question": "Given the following IAM setup, what is the effective permission for IAM action `iam:CreateUser`?",
      "code": "Identity-Based Policy:\n  Allow: s3:*, ec2:*, iam:*\n\nPermissions Boundary:\n  Allow: s3:*, ec2:*\n\nRequest: iam:CreateUser",
      "language": "text",
      "options": [
        "ALLOW - The identity policy grants iam:*",
        "DENY - Not within permissions boundary",
        "ALLOW - Permissions boundary doesn't restrict IAM",
        "DENY - Explicit deny in boundary"
      ],
      "answer": 1,
      "explanation": "The effective permissions are the intersection of the identity policy and permissions boundary. While the identity policy allows iam:*, the permissions boundary only allows s3:* and ec2:*. Since iam:CreateUser is not in the boundary, the request is DENIED.",
      "hint": "Effective permissions = Identity Policy ∩ Permissions Boundary"
    },
    {
      "type": "flashcard",
      "question": "What is the Confused Deputy Problem in AWS IAM?",
      "answer": "**The Confused Deputy Problem** occurs when a trusted third-party service (the \"deputy\") can be tricked into accessing resources on behalf of the wrong customer.\n\n**Solution:** Use **External ID** in cross-account trust policies. This adds a secret value that must be provided when assuming the role, ensuring the service acts on behalf of the correct customer.\n\n**Example:** Without External ID, a malicious customer could trick Datadog into accessing another customer's AWS account by providing their account ID."
    },
    {
      "type": "drag-drop",
      "question": "Arrange these IAM policy evaluation steps in the correct order:",
      "instruction": "Drag to arrange in the order AWS evaluates policies",
      "items": [
        "Request arrives (user attempts action)",
        "Check for explicit DENY",
        "Check for ALLOW in applicable policies",
        "Apply default DENY if no ALLOW found",
        "Grant or deny access"
      ],
      "correctOrder": [0, 1, 2, 3, 4],
      "explanation": "AWS evaluates policies in this order: 1) Request arrives, 2) Check for explicit DENY (if found, deny immediately), 3) Check for ALLOW in all applicable policies, 4) If no ALLOW, apply default DENY, 5) Grant or deny access based on evaluation."
    },
    {
      "type": "code-completion",
      "question": "Complete this trust policy to allow an EC2 instance to assume the role:",
      "instruction": "Fill in the missing service principal",
      "codeTemplate": "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [{\n    \"Effect\": \"Allow\",\n    \"Principal\": {\n      \"Service\": \"_____\"\n    },\n    \"Action\": \"sts:AssumeRole\"\n  }]\n}",
      "answer": "ec2.amazonaws.com",
      "caseSensitive": false,
      "acceptedAnswers": ["ec2.amazonaws.com"],
      "explanation": "For EC2 instances to assume a role, the trust policy must specify `ec2.amazonaws.com` as the service principal. This allows the EC2 service to request temporary credentials on behalf of instances.",
      "hint": "What is the service domain for EC2?"
    },
    {
      "type": "mcq",
      "question": "What is the primary difference between identity-based policies and resource-based policies?",
      "options": [
        "Identity-based policies are JSON, resource-based are YAML",
        "Identity-based attach to users/roles, resource-based attach to resources",
        "Identity-based policies are temporary, resource-based are permanent",
        "Resource-based policies can only deny, not allow"
      ],
      "answer": 1,
      "explanation": "The fundamental difference is where the policy is attached. Identity-based policies attach to IAM users, groups, or roles and define what those identities can do. Resource-based policies attach to AWS resources (like S3 buckets) and define who can access them.",
      "hint": "Think about WHERE each policy type lives."
    },
    {
      "type": "mcq",
      "question": "In cross-account access, what is required for a user in Account A to access a resource in Account B?",
      "options": [
        "Only an identity-based policy in Account A allowing access",
        "Only a resource-based policy in Account B allowing access",
        "Both an identity-based policy in Account A AND a resource-based policy in Account B",
        "A permissions boundary in both accounts"
      ],
      "answer": 2,
      "explanation": "For cross-account access, BOTH policies must allow the action. The user's identity-based policy in Account A must grant permission to access the resource, AND the resource-based policy in Account B must allow the principal from Account A. Both owners must agree.",
      "hint": "Cross-account access requires consent from both sides."
    },
    {
      "type": "true-false",
      "question": "IAM Groups can be nested (a group can contain another group).",
      "answer": false,
      "explanation": "IAM Groups cannot be nested. A group can only contain IAM users, not other groups. If you need hierarchical organization, you must use separate groups and manage membership accordingly.",
      "hint": "Think about what IAM Groups can contain."
    },
    {
      "type": "multiple-select",
      "question": "Which of the following are IAM best practices? (Select all that apply)",
      "options": [
        "Enable MFA on the root account",
        "Share IAM user credentials among team members",
        "Use IAM roles for EC2 instances instead of embedding access keys",
        "Grant administrator access to all developers for flexibility",
        "Rotate credentials regularly",
        "Use groups to assign permissions rather than attaching directly to users"
      ],
      "answers": [0, 2, 4, 5],
      "explanation": "Best practices include: enabling MFA on root, using roles for services (no hardcoded keys), rotating credentials regularly, and using groups for permission management. Never share credentials or grant excessive permissions (principle of least privilege).",
      "hint": "Focus on security, least privilege, and automated credential management."
    },
    {
      "type": "fill-blank",
      "question": "What IAM principle states that all actions are denied unless explicitly allowed?",
      "answer": "deny by default",
      "caseSensitive": false,
      "explanation": "The 'Deny by Default' principle means all actions are implicitly denied unless there is an explicit ALLOW in a policy. This is a fundamental security concept in IAM that ensures restrictive access control.",
      "hint": "It's about the default state when no policy grants permission."
    },
    {
      "type": "mcq",
      "question": "What is the purpose of External ID in IAM trust policies?",
      "options": [
        "To encrypt the trust policy for security",
        "To prevent the confused deputy problem in cross-account access",
        "To define the maximum duration for assumed role credentials",
        "To specify which AWS regions the role can be assumed from"
      ],
      "answer": 1,
      "explanation": "External ID prevents the confused deputy problem by adding a secret value to trust policies. When a third-party service (like Datadog) needs access to multiple customer accounts, the External ID ensures they can only assume the role on behalf of the correct customer.",
      "hint": "It's about preventing unauthorized cross-account access by third parties."
    },
    {
      "type": "code-output",
      "question": "What is the effective permission for this scenario?",
      "code": "Policy 1 (Identity):\n  Effect: Allow\n  Action: s3:*\n  Resource: *\n\nPolicy 2 (Boundary):\n  Effect: Deny\n  Action: s3:DeleteBucket\n  Resource: *\n\nRequest: s3:DeleteBucket",
      "language": "text",
      "options": [
        "ALLOW - Identity policy grants s3:*",
        "DENY - Explicit deny in boundary",
        "ALLOW - Permissions boundaries don't deny",
        "Depends on resource-based policy"
      ],
      "answer": 1,
      "explanation": "Even though the identity policy grants s3:* (which includes DeleteBucket), there is an explicit DENY in the permissions boundary. Explicit DENY always wins, so the request is DENIED. Evaluation stops as soon as an explicit deny is found.",
      "hint": "Remember: Explicit DENY always wins."
    },
    {
      "type": "flashcard",
      "question": "What is the difference between a Trust Policy and a Permissions Policy in IAM roles?",
      "answer": "**Trust Policy (Assume Role Policy):**\n- Defines **WHO** can assume the role\n- Contains `Principal` element\n- Uses `sts:AssumeRole` action\n- Attached only to IAM roles\n- Always inline (cannot be reused)\n\n**Permissions Policy (IAM Policy):**\n- Defines **WHAT** actions are allowed\n- No `Principal` element\n- Uses service-specific actions (s3:*, ec2:*, etc.)\n- Can attach to users, groups, or roles\n- Can be managed (reusable) or inline\n\n**Together:** Trust policy controls access to the role, permissions policy controls what the role can do."
    },
    {
      "type": "mcq",
      "question": "Which of the following credentials types are considered long-term? (Select the best answer)",
      "options": [
        "IAM role temporary credentials",
        "IAM user access keys and passwords",
        "STS session tokens",
        "EC2 instance profile credentials"
      ],
      "answer": 1,
      "explanation": "IAM user access keys and passwords are long-term credentials that don't expire automatically. In contrast, IAM role credentials, STS tokens, and instance profile credentials are all temporary and automatically rotated.",
      "hint": "Which credentials require manual rotation?"
    },
    {
      "type": "true-false",
      "question": "AWS managed policies can be modified by customers to fit their specific requirements.",
      "answer": false,
      "explanation": "AWS managed policies are created and maintained by AWS and cannot be modified by customers. If you need custom permissions, you must create customer managed policies instead.",
      "hint": "Who controls AWS managed policies?"
    },
    {
      "type": "multiple-select",
      "question": "When should you use IAM roles instead of IAM users? (Select all that apply)",
      "options": [
        "For EC2 instances accessing AWS services",
        "For individual human developers needing console access",
        "For Lambda functions needing AWS permissions",
        "For cross-account access between AWS accounts",
        "For federated users from corporate identity providers"
      ],
      "answers": [0, 2, 3, 4],
      "explanation": "Use IAM roles for: EC2 instances (instance roles), Lambda functions (execution roles), cross-account access, and federated identities. Use IAM users for individual human access with long-term credentials. Roles provide temporary credentials without hardcoded keys.",
      "hint": "Roles are for temporary access and services; users are for people."
    },
    {
      "type": "code-completion",
      "question": "Complete this IAM policy to allow read-only access to a specific S3 bucket:",
      "instruction": "Fill in the missing action that allows listing bucket contents",
      "codeTemplate": "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [{\n    \"Effect\": \"Allow\",\n    \"Action\": [\n      \"s3:GetObject\",\n      \"_____\"\n    ],\n    \"Resource\": [\n      \"arn:aws:s3:::my-bucket/*\",\n      \"arn:aws:s3:::my-bucket\"\n    ]\n  }]\n}",
      "answer": "s3:ListBucket",
      "caseSensitive": false,
      "acceptedAnswers": ["s3:ListBucket"],
      "explanation": "`s3:ListBucket` allows listing the contents of the bucket. Together with `s3:GetObject` (which retrieves objects), this provides complete read-only access. Note that ListBucket applies to the bucket itself, while GetObject applies to objects within it.",
      "hint": "What action lets you see what's inside the bucket?"
    },
    {
      "type": "mcq",
      "question": "What happens when an IAM user belongs to multiple groups with different policies?",
      "options": [
        "Only the first group's policies apply",
        "Only the most restrictive policy applies",
        "All policies from all groups are combined (union of permissions)",
        "The policies conflict and access is denied"
      ],
      "answer": 2,
      "explanation": "When a user belongs to multiple groups, all policies from all groups are combined. The effective permissions are the union of all ALLOW statements (unless an explicit DENY exists). This makes group membership additive.",
      "hint": "Think about how multiple policies interact - additive or restrictive?"
    },
    {
      "type": "drag-drop",
      "question": "Arrange these IAM identity types in order from most specific to most general:",
      "instruction": "Drag to arrange from most granular to broadest",
      "items": [
        "IAM User (individual person/application)",
        "IAM Group (collection of users)",
        "IAM Role (assumable by multiple entities)",
        "AWS Account Root User (full account access)"
      ],
      "correctOrder": [0, 1, 2, 3],
      "explanation": "From most specific to most general: IAM User (individual), IAM Group (collection of users), IAM Role (can be assumed by various entities), Root User (complete account control). Specificity decreases as scope broadens.",
      "hint": "Think about scope and who/what can use each identity type."
    },
    {
      "type": "true-false",
      "question": "Inline policies can be attached to multiple IAM users, groups, or roles for reusability.",
      "answer": false,
      "explanation": "Inline policies have a strict 1:1 relationship with a single IAM identity. They cannot be reused across multiple users, groups, or roles. For reusability, use managed policies (AWS managed or customer managed) instead.",
      "hint": "What does 'inline' imply about the relationship?"
    },
    {
      "type": "flashcard",
      "question": "What is the Principle of Least Privilege in IAM?",
      "answer": "**Principle of Least Privilege** means granting only the minimum permissions necessary to perform required tasks.\n\n**Implementation:**\n- Start with no permissions (deny by default)\n- Add permissions only as needed\n- Regularly review and revoke unused permissions\n- Use specific actions and resources instead of wildcards\n\n**Benefits:**\n- Reduces security risk from compromised credentials\n- Limits blast radius of accidents or mistakes\n- Improves compliance and auditability\n- Forces intentional permission design\n\n**Example:** Give a developer read-only S3 access to specific buckets, not full S3 admin access to all buckets."
    },
    {
      "type": "mcq",
      "question": "Which element is REQUIRED in a resource-based policy but NOT in an identity-based policy?",
      "options": [
        "Effect",
        "Action",
        "Principal",
        "Resource"
      ],
      "answer": 2,
      "explanation": "The Principal element is required in resource-based policies to specify who can access the resource. Identity-based policies don't need Principal because it's implicit (the identity the policy is attached to).",
      "hint": "Resource-based policies need to specify WHO, identity-based policies don't."
    },
    {
      "type": "multiple-select",
      "question": "Which AWS services commonly use resource-based policies? (Select all that apply)",
      "options": [
        "Amazon S3 (bucket policies)",
        "IAM Users",
        "AWS Lambda (function policies)",
        "Amazon SQS (queue policies)",
        "IAM Groups"
      ],
      "answers": [0, 2, 3],
      "explanation": "S3 buckets, Lambda functions, and SQS queues all support resource-based policies. IAM Users and Groups only support identity-based policies, not resource-based policies.",
      "hint": "Which of these are AWS resources vs IAM identities?"
    },
    {
      "type": "code-output",
      "question": "For this cross-account scenario, will access be granted?",
      "code": "Account A (111111111111):\n  User: Alice\n  Identity Policy: Allow s3:GetObject on bucket-B/*\n\nAccount B (222222222222):\n  Bucket: bucket-B\n  Resource Policy: (no policy exists)\n\nRequest: Alice tries to get object from bucket-B",
      "language": "text",
      "options": [
        "ALLOW - Alice's identity policy grants access",
        "DENY - No resource policy in Account B allowing Account A",
        "ALLOW - Same-account access doesn't need resource policy",
        "Depends on Alice's permissions boundary"
      ],
      "answer": 1,
      "explanation": "For cross-account access, BOTH the identity policy (Account A) AND resource policy (Account B) must allow the action. Even though Alice's identity policy allows s3:GetObject, there's no resource policy on bucket-B permitting Account A access, so the request is DENIED.",
      "hint": "Cross-account requires two-way approval."
    },
    {
      "type": "fill-blank",
      "question": "What IAM tool helps identify resources shared with external entities and unused access?",
      "answer": "IAM Access Analyzer",
      "caseSensitive": false,
      "explanation": "IAM Access Analyzer continuously monitors your resources to identify those shared with external entities. It also helps identify unused access (unused roles, passwords, access keys) to help apply least privilege.",
      "hint": "It's a service that analyzes your IAM configuration for security insights."
    },
    {
      "type": "mcq",
      "question": "What is the maximum duration for temporary credentials from an assumed IAM role?",
      "options": [
        "1 hour",
        "6 hours",
        "12 hours",
        "24 hours"
      ],
      "answer": 2,
      "explanation": "IAM role temporary credentials can be configured for a duration between 15 minutes (minimum) and 12 hours (maximum). The default is typically 1 hour.",
      "hint": "It's measured in hours, and it's the longest option that doesn't exceed half a day."
    },
    {
      "type": "true-false",
      "question": "MFA (Multi-Factor Authentication) should be enabled for all IAM users in an AWS account.",
      "answer": false,
      "explanation": "While MFA is a security best practice, it should be enabled at minimum for the root account and privileged users (those with administrative or sensitive access). Enabling MFA for all users is ideal but not always required, especially for service accounts or limited-access users.",
      "hint": "Consider the difference between 'best practice' and 'minimum requirement.'"
    },
    {
      "type": "flashcard",
      "question": "What are the three main IAM identity types and when should each be used?",
      "answer": "**1. IAM Users**\n- For: Individual people or applications\n- Credentials: Long-term (username/password, access keys)\n- Use when: Need persistent human access or dedicated application credentials\n\n**2. IAM Groups**\n- For: Collections of IAM users with similar permissions\n- Credentials: None (users have credentials)\n- Use when: Managing permissions for multiple users (teams, roles)\n\n**3. IAM Roles**\n- For: Temporary access for services, cross-account, or federated users\n- Credentials: Temporary (STS-generated, auto-rotated)\n- Use when: EC2/Lambda need AWS access, cross-account access, or federated identity\n\n**Best Practice:** Prefer roles over users for services; use groups to manage user permissions."
    }
  ]
}
{{< /quiz >}}

