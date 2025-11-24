---
title: Identity and Access Management
linkTitle: Identity and Access Management
type: docs
weight: 7
prev: /aws/06-load-balancing-and-scaling
next: /aws/08-storage-services
---

## Overview

AWS Identity and Access Management (IAM) is a fundamental service for controlling who can access what in your AWS environment. IAM enables you to securely manage access to AWS services and resources by creating and managing AWS users, groups, roles, and permissions.

## AWS IAM Fundamentals

### What is AWS IAM?

**AWS IAM** allows you to securely manage identities and access to AWS services and resources. It handles authentication (who can sign in) and authorization (what actions they can perform).

### Core Principles

```
┌─────────────────────────────────────────────────────────────┐
│              IAM Core Principles                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Authentication (Who are you?)                              │
│  ├─ AWS root account                                        │
│  ├─ IAM users (long-term credentials)                       │
│  ├─ IAM roles (temporary credentials)                       │
│  └─ Federated identities (external IDs)                     │
│                                                             │
│  Authorization (What can you do?)                           │
│  ├─ Identity-based policies                                 │
│  ├─ Resource-based policies                                 │
│  ├─ Permissions boundaries                                  │
│  └─ Service control policies (Organizations)                │
│                                                             │
│  Principle of Least Privilege                               │
│  ├─ Grant only minimum permissions needed                   │
│  ├─ Start with no permissions                               │
│  ├─ Add permissions as required                             │
│  └─ Regularly review and revoke unused permissions          │
│                                                             │
│  Deny by Default                                            │
│  ├─ All actions denied unless explicitly allowed            │
│  ├─ Explicit deny always wins                               │
│  └─ Cannot override explicit deny                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### IAM Access Flow

```
┌─────────────────────────────────────────────────────────────┐
│              Complete IAM Access Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. IAM Identity                                            │
│     ├─ User (developer@example.com)                         │
│     ├─ Group (Developers)                                   │
│     └─ Role (EC2-S3-Access-Role)                            │
│                │                                            │
│                ▼                                            │
│  2. Assign Permissions                                      │
│     ├─ Identity-based policies                              │
│     ├─ Permissions boundaries (optional limit)              │
│     └─ Resource-based policies (on resource)                │
│                │                                            │
│                ▼                                            │
│  3. Access Request                                          │
│     └─ User/Role attempts action on resource                │
│        (e.g., s3:GetObject on bucket/file.txt)              │
│                │                                            │
│                ▼                                            │
│  4. Access Evaluation (Decision flow)                       │
│     ├─ Is there an explicit DENY? → Access DENIED           │
│     ├─ Is there an identity-based ALLOW? ┐                  │
│     ├─ Is there a resource-based ALLOW?  ├→ Check all       │
│     ├─ Within permissions boundary?      ┘                  │
│     └─ If all checks pass → Access GRANTED                  │
│                │                                            │
│                ▼                                            │
│  5. Access Result                                           │
│     ├─ GRANTED: Action proceeds                             │
│     └─ DENIED: Action blocked                               │
│                │                                            │
│                ▼                                            │
│  6. Logging (CloudTrail)                                    │
│     └─ All API calls logged for auditing                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## IAM Identities

### IAM Users

**IAM Users** represent a person or application interacting with AWS resources.

```
┌─────────────────────────────────────────────────────────────┐
│              IAM User Characteristics                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Long-Term Credentials                                      │
│  ├─ Username and password (console access)                  │
│  ├─ Access keys (programmatic access)                       │
│  │  ├─ Access Key ID (public)                               │
│  │  └─ Secret Access Key (private)                          │
│  └─ Can have both console and programmatic access           │
│                                                             │
│  Multi-Factor Authentication (MFA)                          │
│  ├─ Virtual MFA device (app-based)                          │
│  ├─ Hardware MFA device                                     │
│  └─ U2F security key                                        │
│                                                             │
│  Permissions                                                │
│  ├─ Attached directly to user (not recommended)             │
│  ├─ Through group membership (recommended)                  │
│  └─ Inline policies (rare, specific use cases)              │
│                                                             │
│  Best Practices                                             │
│  ├─ One user per person/application                         │
│  ├─ Enable MFA for console access                           │
│  ├─ Rotate access keys regularly                            │
│  ├─ Use groups for permission management                    │
│  └─ Never share credentials                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### IAM Groups

**IAM Groups** are collections of IAM users that simplify permission management.

```
Example: Organizing Users with Groups

┌──────────────────────────────────────────────────────────┐
│  IAM Group: Developers                                   │
│  ├─ Permissions:                                         │
│  │  ├─ EC2 full access                                   │
│  │  ├─ S3 read/write (dev-bucket only)                   │
│  │  └─ CloudWatch read-only                              │
│  └─ Members:                                             │
│     ├─ alice@example.com                                 │
│     ├─ bob@example.com                                   │
│     └─ charlie@example.com                               │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  IAM Group: Administrators                               │
│  ├─ Permissions:                                         │
│  │  └─ Administrator Access (full AWS access)            │
│  └─ Members:                                             │
│     └─ admin@example.com                                 │
└──────────────────────────────────────────────────────────┘

Benefits:
• Easier to manage permissions at scale
• Users can belong to multiple groups
• Update group policy affects all members
• No direct AWS resource, just logical grouping
```

### IAM Roles

**IAM Roles** provide temporary access to AWS resources without long-term credentials.

```
┌─────────────────────────────────────────────────────────────┐
│              IAM Role Characteristics                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Temporary Credentials                                      │
│  ├─ Generated by AWS STS (Security Token Service)           │
│  ├─ Automatically rotated                                   │
│  ├─ Time-limited (15 min - 12 hours)                        │
│  └─ No permanent access keys                                │
│                                                             │
│  Trust Policy                                               │
│  ├─ Defines who can assume the role                         │
│  ├─ AWS services (EC2, Lambda)                              │
│  ├─ AWS accounts (cross-account access)                     │
│  ├─ Web identity providers (Google, Facebook)               │
│  └─ SAML identity providers (corporate IdP)                 │
│                                                             │
│  Permissions Policy                                         │
│  └─ Defines what the role can do                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Common Role Use Cases:**

```
1. EC2 Instance Role
┌──────────────────────────────────────────┐
│  Role: EC2-S3-Read-Role                  │
│  ├─ Trust policy: EC2 service            │
│  └─ Permissions: S3 read-only            │
└────────────┬─────────────────────────────┘
             │
             ▼
     EC2 Instance (attached role)
     ├─ No hardcoded credentials
     ├─ Temporary credentials auto-rotated
     └─ Application uses AWS SDK

2. Cross-Account Access
┌──────────────────────────────────────────┐
│  Account A (Production)                  │
│  Role: CrossAccountAuditRole             │
│  ├─ Trust policy: Account B              │
│  └─ Permissions: Read-only access        │
└────────────┬─────────────────────────────┘
             │ AssumeRole
             ▼
┌──────────────────────────────────────────┐
│  Account B (Audit)                       │
│  User: auditor@example.com               │
│  └─ Switches role to access Account A    │
└──────────────────────────────────────────┘

3. Lambda Execution Role
┌──────────────────────────────────────────┐
│  Role: Lambda-DynamoDB-Role              │
│  ├─ Trust policy: Lambda service         │
│  └─ Permissions:                         │
│     ├─ DynamoDB read/write               │
│     └─ CloudWatch Logs write             │
└────────────┬─────────────────────────────┘
             │
             ▼
     Lambda Function (uses role)
     └─ Access DynamoDB and logs
```

**Assuming a Role:**

```
Process: sts:AssumeRole

Step 1: Identity requests to assume role
├─ IAM user, service, or federated identity
└─ Calls STS AssumeRole API

Step 2: STS evaluates trust policy
├─ Is requester in trust policy?
└─ If yes, proceed; if no, deny

Step 3: STS generates temporary credentials
├─ Access Key ID (temporary)
├─ Secret Access Key (temporary)
├─ Session Token
└─ Expiration time

Step 4: Use temporary credentials
└─ Make AWS API calls with permissions from role
```

## IAM Policies

### What is an IAM Policy?

An **IAM Policy** is a JSON document that defines permissions, specifying which actions are allowed or denied on which resources.

### Policy Structure

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3ReadAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-bucket/*",
        "arn:aws:s3:::my-bucket"
      ],
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": "203.0.113.0/24"
        }
      }
    }
  ]
}
```

**Policy Elements:**

```
Version
└─ Policy language version (always "2012-10-17")

Statement (array of statements)
├─ Sid: Statement ID (optional, descriptive)
├─ Effect: "Allow" or "Deny"
├─ Principal: Who (only for resource-based policies)
├─ Action: What actions (e.g., s3:GetObject, ec2:*)
├─ Resource: Which resources (ARNs)
└─ Condition: When (optional constraints)
```

### Policy Types

```
┌─────────────────────────────────────────────────────────────┐
│              IAM Policy Types                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Identity-Based Policies                                    │
│  └─ Attached to IAM identities (users, groups, roles)       │
│                                                             │
│     Managed Policies                                        │
│     ├─ Standalone policies                                  │
│     ├─ Can be attached to multiple identities               │
│     │                                                       │
│     ├─ AWS Managed Policies                                 │
│     │  ├─ Created and managed by AWS                        │
│     │  ├─ Examples: AdministratorAccess, ReadOnlyAccess     │
│     │  ├─ Updated by AWS as needed                          │
│     │  └─ Cannot be modified                                │
│     │                                                       │
│     └─ Customer Managed Policies                            │
│        ├─ Created and managed by you                        │
│        ├─ Full control over policy                          │
│        ├─ Can be versioned                                  │
│        └─ Reusable across identities                        │
│                                                             │
│     Inline Policies                                         │
│     ├─ Can be attached to only one IAM user, group, or role │
│     ├─ Cannot be reused                                     │
│     ├─ Deleted when identity is deleted                     │
│     └─ Use case: Strict 1:1 relationship needed             │
│                                                             │
│  Resource-Based Policies                                    │
│  ├─ Attached to AWS resources (S3, Lambda, etc.)            │
│  ├─ Always inline (not standalone)                          │
│  ├─ Include Principal element                               │
│  └─ Examples: S3 bucket policy, Lambda function policy      │
│                                                             │
│  Permissions Boundaries                                     │
│  ├─ Define maximum permissions for identity                 │
│  ├─ Do not grant permissions themselves                     │
│  ├─ Used to delegate permission management safely           │
│  └─ Apply to users and roles only                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Identity-Based vs Resource-Based Policies

The fundamental difference is **where the policy is attached**:

```
┌─────────────────────────────────────────────────────────────┐
│         Identity-Based vs Resource-Based Policies           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Identity-Based Policy                                      │
│  ├─ Attached to: IAM user, group, or role                   │
│  ├─ Defines: What that identity can do                      │
│  ├─ Principal: Implicit (the identity it's attached to)     │
│  ├─ Specified in policy: Actions and Resources              │
│  └─ Use cases:                                              │
│     ├─ Managing user permissions ("What can Alice do?")     │
│     ├─ Organizing permissions by team/role                  │
│     ├─ Centralized IAM management                           │
│     └─ Most common scenario (default choice)                │
│                                                             │
│  Resource-Based Policy                                      │
│  ├─ Attached to: The resource (S3 bucket, SQS queue, etc.)  │
│  ├─ Defines: Who can access this resource                   │
│  ├─ Principal: Explicitly specified in the policy           │
│  ├─ Specified in policy: Principal, Actions, Resources      │
│  └─ Use cases:                                              │
│     ├─ Cross-account access (Account A → Account B)         │
│     ├─ Resource-centric security ("Who can access this?")   │
│     ├─ Service-to-service communication                     │
│     └─ Simpler than creating roles for sharing              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

```
Identity-Based Policy (on IAM User/Role)
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::my-bucket/*"
  }]
}
→ Grants user/role permission to get objects from my-bucket

Resource-Based Policy (on S3 Bucket)
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "AWS": "arn:aws:iam::123456789012:user/Bob"
    },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::my-bucket/*"
  }]
}
→ Grants Bob permission to get objects (defined on bucket)
```

**Practical Scenario Comparison:**

Imagine you have 3 users (Alice, Bob, Charlie) and 2 buckets (bucket-A, bucket-B):

```
Approach 1: Identity-Based Policies
┌──────────────────────────────────────────────────────────┐
│  Alice's IAM Policy:                                     │
│  └─ "Can read from bucket-A and bucket-B"                │
│                                                          │
│  Bob's IAM Policy:                                       │
│  └─ "Can read from bucket-A only"                        │
│                                                          │
│  Charlie's IAM Policy:                                   │
│  └─ "Can write to bucket-B"                              │
└──────────────────────────────────────────────────────────┘
→ Manage permissions by looking at each user
→ Good for: "What can this user do?"

Approach 2: Resource-Based Policies
┌──────────────────────────────────────────────────────────┐
│  bucket-A's Policy:                                      │
│  └─ "Alice and Bob can read"                             │
│                                                          │
│  bucket-B's Policy:                                      │
│  └─ "Alice can read, Charlie can write"                  │
└──────────────────────────────────────────────────────────┘
→ Manage permissions by looking at each bucket
→ Good for: "Who can access this bucket?"
```

**Working Together:**

For access to be granted, **both must allow** (if both exist):

```
┌──────────────────────────────────────────────────────────┐
│  Cross-Account Access Example                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Account A (User's Account)                              │
│  └─ Alice's Identity Policy:                             │
│     "Allow s3:GetObject on bucket-in-B/*"                │
│                     │                                    │
│                     ▼                                    │
│              Both Required                               │
│                     │                                    │
│                     ▼                                    │
│  Account B (Bucket Owner)                                │
│  └─ Bucket-in-B's Resource Policy:                       │
│     "Allow Account-A:Alice to s3:GetObject"              │
│                                                          │
│  Result: ✅ Alice can access the bucket                  │
│  (Both IAM admin and resource owner agreed)              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Permissions Boundaries

**What are Permissions Boundaries?**

A permissions boundary is an advanced IAM feature that sets the **maximum permissions** an identity-based policy can grant to an IAM user or role. Think of it as a "safety fence" that defines what permissions are allowed, regardless of what policies grant.

**Key Concepts:**
- **Applied to**: IAM users and roles only (not groups or resource-based policies)
- **Never grants permissions**: Only restricts what can be granted
- **Works through intersection**: Effective permissions = Identity policy ∩ Permissions boundary
- **Use case**: Delegate administrative tasks safely without risk of privilege escalation

**How it works:**
1. You attach an identity-based policy that grants permissions (e.g., full S3, EC2, IAM access)
2. You attach a permissions boundary that limits allowed permissions (e.g., only S3 and EC2)
3. The user/role can only use permissions that exist in BOTH policies (S3 and EC2, but NOT IAM)

```
┌─────────────────────────────────────────────────────────────┐
│              Permissions Boundaries                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Purpose: Limit maximum permissions                         │
│                                                             │
│  Example:                                                   │
│                                                             │
│  Identity-Based Policy (grants permissions)                 │
│  ├─ S3: *                                                   │
│  ├─ EC2: *                                                  │
│  └─ IAM: *                                                  │
│                                                             │
│  Permissions Boundary (limits permissions)                  │
│  ├─ S3: *                                                   │
│  └─ EC2:*                                                   │
│                                                             │
│  Effective Permissions (intersection)                       │
│  ├─ S3: * ✓ (in both)                                       │
│  ├─ EC2: * ✓ (in both)                                      │
│  └─ IAM: ✗ (not in boundary, denied)                        │
│                                                             │
│  Use Case: Delegated Administration                         │
│  ├─ Allow developers to create IAM roles                    │
│  ├─ But limit roles to specific permissions                 │
│  └─ Prevents privilege escalation                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Trust Policy vs Permissions Policy (IAM Policy)

Every IAM role has **two distinct policies** that work together:

**Trust Policy (Assume Role Policy):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```
- Defines **WHO** can assume the role
- Contains a `Principal` element (who is trusted)
- Uses `sts:AssumeRole` action
- Attached only to IAM roles
- Cannot be reused (always inline)

**Permissions Policy (IAM Policy):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}
```
- Defines **WHAT** actions are allowed
- No `Principal` element (attached to identity)
- Uses service-specific actions (s3, ec2, etc.)
- Can be attached to users, groups, or roles
- Can be managed (reusable) or inline

**How They Work Together:**

```
┌─────────────────────────────────────────────────────────────┐
│              Role with Both Policies                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Role: EC2-S3-Access-Role                                   │
│                                                             │
│  1. Trust Policy (who can use this role)                    │
│     {                                                       │
│       "Principal": {                                        │
│         "Service": "ec2.amazonaws.com"                      │
│       },                                                    │
│       "Action": "sts:AssumeRole"                            │
│     }                                                       │
│     → EC2 service is allowed to assume this role            │
│                                                             │
│  2. Permissions Policy (what the role can do)               │
│     {                                                       │
│       "Action": ["s3:GetObject", "s3:PutObject"],           │
│       "Resource": "arn:aws:s3:::my-bucket/*"                │
│     }                                                       │
│     → Role can read/write to S3 bucket                      │
│                                                             │
│  Flow:                                                      │
│  EC2 Instance → Assumes Role (trust policy allows)          │
│               → Gets Temporary Credentials                  │
│               → Accesses S3 (permissions policy allows)     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Differences:**

| Aspect | Trust Policy | Permissions Policy |
|--------|--------------|-------------------|
| **Purpose** | Authentication (who) | Authorization (what) |
| **Applied to** | IAM roles only | Users, groups, roles |
| **Principal** | Yes (required) | No |
| **Action** | `sts:AssumeRole` | Service actions (s3:*, ec2:*, etc.) |
| **Resource** | Not used | ARNs of resources |
| **Reusable** | No (always inline) | Yes (can be managed) |

**Common Trust Policy Examples:**

```json
// Trust AWS Service (EC2)
{
  "Principal": {
    "Service": "ec2.amazonaws.com"
  },
  "Action": "sts:AssumeRole"
}

// Trust Another AWS Account
{
  "Principal": {
    "AWS": "arn:aws:iam::123456789012:root"
  },
  "Action": "sts:AssumeRole"
}

// Trust Specific IAM User
{
  "Principal": {
    "AWS": "arn:aws:iam::123456789012:user/alice"
  },
  "Action": "sts:AssumeRole"
}

// Trust Web Identity Provider (Google)
{
  "Principal": {
    "Federated": "accounts.google.com"
  },
  "Action": "sts:AssumeRoleWithWebIdentity"
}

// Trust SAML Identity Provider
{
  "Principal": {
    "Federated": "arn:aws:iam::123456789012:saml-provider/ExampleCorpIdP"
  },
  "Action": "sts:AssumeRoleWithSAML"
}
```

### External ID (Preventing Confused Deputy Problem)

**What is External ID?**

External ID is a **secret value** added to cross-account trust policies to prevent the "confused deputy problem." It's essential when granting third-party services (like Datadog, New Relic, monitoring tools) access to your AWS resources.

**The Confused Deputy Problem:**

```
┌─────────────────────────────────────────────────────────────┐
│           Without External ID (Vulnerable)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Scenario:                                                  │
│  ├─ Third-party service (Datadog) has AWS Account           │
│  ├─ Multiple customers grant Datadog access via IAM roles   │
│  └─ Each customer creates role trusting Datadog's account   │
│                                                             │
│  Attack:                                                    │
│  Malicious Customer A knows Customer B's AWS Account ID     │
│                                                             │
│  Customer A → Tells Datadog: "Monitor account 111122223333" │
│  (Customer B's account)                                     │
│                    ▼                                        │
│  Datadog → Assumes role in account 111122223333             │
│          → SUCCESS! Now accessing Customer B's data         │
│                                                             │
│  Problem: Datadog was "confused" about which customer       │
│           it was acting on behalf of (the "deputy")         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**How External ID Solves This:**

```
┌─────────────────────────────────────────────────────────────┐
│            With External ID (Secure)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Setup:                                                     │
│  1. Customer generates unique External ID                   │
│     Example: "abc123xyz789"                                 │
│                                                             │
│  2. Customer creates role with External ID condition        │
│     Trust Policy requires BOTH:                             │
│     ├─ Datadog's AWS Account ID (public info)               │
│     └─ Customer's External ID (secret, unique per customer) │
│                                                             │
│  3. Customer provides External ID to Datadog                │
│     (via Datadog's integration setup UI)                    │
│                                                             │
│  Attack Attempt:                                            │
│  Malicious Customer A → "Monitor account 111122223333"      │
│                       → Provides WRONG External ID          │
│                              ▼                              │
│  Datadog → Attempts to assume role                          │
│          → DENIED! External ID mismatch                     │
│                                                             │
│  Legitimate Access:                                         │
│  Customer B → Configured correct External ID in Datadog     │
│             → Datadog uses correct External ID              │
│                      ▼                                      │
│  Datadog → Assumes role successfully                        │
│          → Can only access Customer B's data                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Trust Policy Example with External ID:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::464622532012:root"  // Datadog's AWS account
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "abc123xyz789-unique-secret"  // Your unique secret
        }
      }
    }
  ]
}
```

**Key Points:**
- **Required**: Two pieces of information to assume the role:
  1. Principal (Datadog's AWS account) - public information
  2. External ID (your unique secret) - private information
- **Unique per customer**: Each customer has a different External ID
- **Generated by**: Usually the third-party service provides it, or you generate it
- **Length**: Typically 32-64 characters, alphanumeric
- **Not a password**: Stored in the trust policy (not encrypted), but acts as a shared secret

**Common Use Cases:**
- **Monitoring tools**: Datadog, New Relic, CloudHealth
- **Security tools**: GuardDuty integrations, SIEM tools
- **CI/CD platforms**: Third-party deployment services
- **Backup services**: Cross-account backup solutions
- **Any third-party**: Service that needs to assume roles in multiple customer accounts

**Best Practices:**
1. Always use External ID for cross-account third-party access
2. Generate cryptographically random External IDs (don't use guessable values)
3. Keep External ID values confidential (treat like API keys)
4. Rotate External IDs if compromised
5. Document which External ID is used for which service

**Real-World Example (Datadog Integration):**

```
Step 1: Create IAM Role in Your AWS Account
└─ Role Name: DatadogIntegrationRole
   └─ Trust Policy:
      {
        "Principal": {"AWS": "arn:aws:iam::464622532012:root"},
        "Condition": {"StringEquals": {"sts:ExternalId": "xyz789abc123"}}
      }

Step 2: Configure in Datadog UI
├─ AWS Account ID: 111122223333 (your account)
├─ IAM Role Name: DatadogIntegrationRole
└─ External ID: xyz789abc123

Step 3: Datadog Assumes Role
├─ Provides Account ID: 111122223333
├─ Provides External ID: xyz789abc123
└─ Gets temporary credentials to access your AWS resources
```

## Access Evaluation Logic

### Policy Evaluation Flow

```
┌─────────────────────────────────────────────────────────────┐
│          AWS Policy Evaluation Logic                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Request arrives (User wants to perform Action on Resource) │
│                    │                                        │
│                    ▼                                        │
│  ┌────────────────────────────────────────────────┐         │
│  │  1. Is there an EXPLICIT DENY?                 │         │
│  │     (Any policy with Effect: Deny)             │         │
│  └────────────┬──────────────────────┬────────────┘         │
│               │ YES                  │ NO                   │
│               ▼                      │                      │
│         DENY ACCESS                  │                      │
│         (stop evaluation)            │                      │
│                                      ▼                      │
│  ┌────────────────────────────────────────────────┐         │
│  │  2. Is there an ALLOW?                         │         │
│  │     Check all applicable policies:             │         │
│  │     • Identity-based policies                  │         │
│  │     • Resource-based policies                  │         │
│  │     • Permissions boundaries                   │         │
│  │     • Service control policies (if Org)        │         │
│  └────────────┬──────────────────────┬────────────┘         │
│               │ YES (all required)   │ NO                   │
│               ▼                      ▼                      │
│         ALLOW ACCESS            DENY ACCESS                 │
│         (implicit)              (default deny)              │
│                                                             │
│  Key Points:                                                │
│  • Explicit Deny always wins                                │
│  • Default is Deny (if no Allow found)                      │
│  • Must have Allow from ALL applicable policy types         │
│  • Permissions boundary does not grant, only limits         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Evaluation Examples

**Example 1: Simple Allow**
```
Identity Policy: Allow s3:GetObject on bucket/*
Resource Policy: (none)

Request: Get object from bucket/file.txt
Evaluation:
├─ Explicit Deny? No
├─ Identity Policy Allow? Yes
└─ Result: ALLOW
```

**Example 2: Explicit Deny Wins**
```
Identity Policy: Allow s3:* on *
Boundary Policy: Deny s3:DeleteBucket on *

Request: Delete bucket
Evaluation:
├─ Explicit Deny? Yes (boundary denies)
└─ Result: DENY (evaluation stops)
```

**Example 3: Permissions Boundary Limits**
```
Identity Policy: Allow s3:*, ec2:*, iam:*
Boundary Policy: Allow s3:*, ec2:*

Request: Create IAM user
Evaluation:
├─ Explicit Deny? No
├─ Identity Allow? Yes (iam:*)
├─ Within Boundary? No (iam:* not in boundary)
└─ Result: DENY
```

**Example 4: Cross-Account with Resource Policy**
```
Account A - Identity Policy: Allow s3:GetObject on bucket-in-B/*
Account B - Bucket Policy: Allow Account-A to s3:GetObject

Request: Account A user gets object from Account B bucket
Evaluation:
├─ Explicit Deny? No
├─ Identity Policy Allow? Yes
├─ Resource Policy Allow? Yes
└─ Result: ALLOW (both needed for cross-account)
```

## IAM Best Practices

```
┌─────────────────────────────────────────────────────────────┐
│              IAM Security Best Practices                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Root Account Security                                      │
│  ├─ Enable MFA on root account                              │
│  ├─ Never use root for daily tasks                          │
│  ├─ Delete root access keys                                 │
│  └─ Use root only for account management tasks              │
│                                                             │
│  User Management                                            │
│  ├─ Create individual IAM users (no sharing)                │
│  ├─ Use groups to assign permissions                        │
│  ├─ Enable MFA for privileged users                         │
│  ├─ Enforce strong password policy                          │
│  └─ Rotate credentials regularly                            │
│                                                             │
│  Least Privilege                                            │
│  ├─ Grant minimum permissions needed                        │
│  ├─ Start with deny all, add permissions as needed          │
│  ├─ Use AWS managed policies for common patterns            │
│  ├─ Review and remove unused permissions                    │
│  └─ Use IAM Access Analyzer                                 │
│                                                             │
│  Use Roles Instead of Users                                 │
│  ├─ EC2 instances: Use instance roles                       │
│  ├─ Lambda functions: Use execution roles                   │
│  ├─ Cross-account: Use assume role                          │
│  └─ Avoid embedding long-term credentials                   │
│                                                             │
│  Monitoring and Auditing                                    │
│  ├─ Enable CloudTrail for all API calls                     │
│  ├─ Monitor with CloudWatch                                 │
│  ├─ Review IAM credential reports                           │
│  ├─ Use IAM Access Analyzer for external access             │
│  └─ Regular access reviews and cleanup                      │
│                                                             │
│  Policy Management                                          │
│  ├─ Use customer managed policies for reusability           │
│  ├─ Version policies for change tracking                    │
│  ├─ Test policies before applying to production             │
│  ├─ Use policy simulator for validation                     │
│  └─ Document policy purpose and ownership                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Summary

**Key Takeaways:**

1. **IAM** controls authentication (who) and authorization (what)
2. **IAM Users** represent individuals with long-term credentials
3. **IAM Groups** simplify permission management for multiple users
4. **IAM Roles** provide temporary credentials for services and cross-account access
5. **Identity-Based Policies** attach to users/groups/roles
6. **Resource-Based Policies** attach to AWS resources
7. **Permissions Boundaries** limit maximum permissions
8. **Explicit Deny** always wins in policy evaluation
9. **Default Deny** applies when no explicit allow exists
10. **IAM Access Analyzer** identifies external and unused access

**Best Practices:**

- Enable MFA on root and privileged accounts
- Use IAM roles instead of hardcoded credentials
- Follow principle of least privilege
- Use groups for permission assignment
- Regularly rotate credentials and review access
- Enable CloudTrail for audit logging
- Use IAM Access Analyzer to identify security risks
- Test policies with IAM Policy Simulator
- Document policies and access patterns
- Implement permissions boundaries for delegated administration

