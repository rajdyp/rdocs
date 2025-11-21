---
title: Security Quiz
linkTitle: Security
type: docs
weight: 13
prev: /quiz/kubernetes/12-configuration
next: /quiz/kubernetes/14-autoscaling
---

{{< quiz id="kubernetes-security-quiz" >}}
{
  "questions": [
    {
      "type": "mcq",
      "question": "In the Kubernetes security layers model, which layer answers the question 'What can you do?'",
      "options": [
        "Authentication",
        "Authorization (RBAC)",
        "Admission Control",
        "Pod Security"
      ],
      "answer": 1,
      "explanation": "Authorization (RBAC) determines what actions a user can perform after their identity is verified through authentication.",
      "hint": "Think about which layer defines permissions and roles."
    },
    {
      "type": "multiple-select",
      "question": "Which of the following are considered 'Admin-Level Verbs' that pose security risks in RBAC?",
      "options": [
        "get",
        "impersonate",
        "bind",
        "list",
        "escalate"
      ],
      "answers": [1, 2, 4],
      "explanation": "impersonate (act as another user), bind (assign roles), and escalate (modify roles with more permissions) are admin-level verbs that can lead to privilege escalation.",
      "hint": "These verbs allow gaining additional privileges beyond normal operations."
    },
    {
      "type": "true-false",
      "question": "By default, Kubernetes network policies deny all traffic between pods.",
      "answer": false,
      "explanation": "Kubernetes default is ALLOW ALL (no isolation). NetworkPolicy must be explicitly created to enable isolation. Once a NetworkPolicy's podSelector matches a pod, that pod becomes isolated.",
      "hint": "Consider what happens when no NetworkPolicy exists in a namespace."
    },
    {
      "type": "fill-blank",
      "question": "What field is used to disable automatic mounting of service account tokens in a ServiceAccount spec?",
      "answer": "automountServiceAccountToken",
      "caseSensitive": true,
      "explanation": "Setting `automountServiceAccountToken: false` in a ServiceAccount or Pod spec prevents automatic token mounting, reducing credential exposure risk.",
      "hint": "It's a boolean field that controls automatic mounting behavior."
    },
    {
      "type": "code-output",
      "question": "What does this kubectl command check?",
      "code": "kubectl auth can-i create pods --as=system:serviceaccount:default:my-sa",
      "language": "bash",
      "options": [
        "Creates a pod using the service account",
        "Simulates checking if the service account can create pods",
        "Lists all pods created by the service account",
        "Deletes pods owned by the service account"
      ],
      "answer": 1,
      "explanation": "The `kubectl auth can-i` command with `--as` flag simulates permission checking for a specific user or service account without actually performing the action.",
      "hint": "The 'can-i' subcommand is for permission checking, and '--as' is for impersonation."
    },
    {
      "type": "flashcard",
      "question": "What is the difference between a Role and a ClusterRole in Kubernetes RBAC?",
      "answer": "**Role**: Namespace-scoped - permissions apply only within a single namespace.\n\n**ClusterRole**: Cluster-scoped - permissions apply across the entire cluster.\n\n**Hybrid use**: A ClusterRole can be bound with a RoleBinding to reuse cluster-defined roles in specific namespaces."
    },
    {
      "type": "drag-drop",
      "question": "Arrange the Kubernetes API request flow in correct order:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Authentication Module",
        "Mutating Admission",
        "Authorization (RBAC)",
        "Validating Admission",
        "Persist to etcd"
      ],
      "correctOrder": [0, 2, 1, 3, 4],
      "explanation": "Requests flow: Authentication → Authorization (RBAC) → Mutating Admission → Schema Validation → Validating Admission → Persist to etcd."
    },
    {
      "type": "code-completion",
      "question": "Complete the security context to drop all Linux capabilities:",
      "instruction": "Fill in the missing keyword",
      "codeTemplate": "capabilities:\n  drop:\n  - _____",
      "answer": "ALL",
      "caseSensitive": true,
      "acceptedAnswers": ["ALL"],
      "explanation": "Using `drop: [ALL]` removes all Linux capabilities from the container. You can then selectively add back only the capabilities needed using the `add` field."
    },
    {
      "type": "mcq",
      "question": "What is the purpose of the `seccompProfile` field in a Pod's security context?",
      "options": [
        "Controls network access for the pod",
        "Restricts which system calls the container can make",
        "Limits CPU and memory usage",
        "Defines which users can access the pod"
      ],
      "answer": 1,
      "explanation": "Seccomp (Secure Computing Mode) restricts system calls a container can make, preventing containers from exploiting kernel vulnerabilities.",
      "hint": "Seccomp uses BPF (Berkeley Packet Filter) for syscall filtering."
    },
    {
      "type": "multiple-select",
      "question": "Which of the following are valid Pod Security Standards (PSS) levels?",
      "options": [
        "Privileged",
        "Standard",
        "Baseline",
        "Restricted",
        "Minimal"
      ],
      "answers": [0, 2, 3],
      "explanation": "The three Pod Security Standards levels are: Privileged (no restrictions), Baseline (minimal restrictions), and Restricted (most secure).",
      "hint": "There are exactly three levels, from least to most restrictive."
    },
    {
      "type": "true-false",
      "question": "In Kubernetes RBAC, a RoleBinding can reference a ClusterRole to grant permissions within a specific namespace.",
      "answer": true,
      "explanation": "This is the 'Hybrid' pattern: ClusterRole + RoleBinding allows reusing a cluster-defined role within specific namespaces, limiting its scope.",
      "hint": "Consider how you might reuse common permission sets across namespaces."
    },
    {
      "type": "mcq",
      "question": "What happens when a NetworkPolicy's podSelector matches a pod?",
      "options": [
        "The pod is deleted",
        "The pod becomes isolated and only explicitly allowed traffic is permitted",
        "All traffic to the pod is blocked permanently",
        "The pod gains elevated network privileges"
      ],
      "answer": 1,
      "explanation": "Once a NetworkPolicy's podSelector matches a pod, that pod becomes isolated and ONLY explicitly allowed traffic (defined in ingress/egress rules) is permitted.",
      "hint": "NetworkPolicy enables isolation on a per-pod basis."
    },
    {
      "type": "flashcard",
      "question": "What is IRSA and why is it important for AWS EKS security?",
      "answer": "**IRSA (IAM Roles for Service Accounts)** allows Kubernetes ServiceAccounts to assume AWS IAM roles.\n\n**Benefits:**\n- Separate IAM role per service account\n- Fine-grained AWS permissions\n- Automatic credential rotation\n- No hardcoded AWS secrets in pods\n\nPods annotated with `eks.amazonaws.com/role-arn` automatically receive temporary AWS credentials."
    },
    {
      "type": "code-output",
      "question": "What does this namespace label configuration enforce?",
      "code": "labels:\n  pod-security.kubernetes.io/enforce: restricted\n  pod-security.kubernetes.io/audit: restricted\n  pod-security.kubernetes.io/warn: restricted",
      "language": "yaml",
      "options": [
        "Allows all pods regardless of security settings",
        "Rejects non-compliant pods, logs violations, and warns users",
        "Only logs violations without blocking pods",
        "Disables all security checks for the namespace"
      ],
      "answer": 1,
      "explanation": "This configures all three PSA modes: enforce (reject non-compliant pods), audit (log violations), and warn (show warning to user) - all at the 'restricted' level.",
      "hint": "Each label controls a different enforcement mode."
    },
    {
      "type": "fill-blank",
      "question": "What Linux capability allows a container to bind to ports below 1024?",
      "answer": "NET_BIND_SERVICE",
      "caseSensitive": true,
      "explanation": "CAP_NET_BIND_SERVICE allows binding to privileged ports (< 1024) without requiring full root access.",
      "hint": "It's related to network and service binding."
    },
    {
      "type": "multiple-select",
      "question": "Which authentication methods are supported by Kubernetes?",
      "options": [
        "x509 Certificates",
        "Service Account Tokens",
        "OIDC (OAuth)",
        "Biometric authentication",
        "Bearer Tokens"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "Kubernetes supports x509 certificates, service account tokens, OIDC/OAuth, and bearer tokens for authentication. Biometric authentication is not a native Kubernetes feature.",
      "hint": "Think about methods that can be verified by the API server."
    },
    {
      "type": "drag-drop",
      "question": "Arrange Pod Security Standards from LEAST secure to MOST secure:",
      "instruction": "Drag to arrange from least to most secure",
      "items": [
        "Baseline",
        "Restricted",
        "Privileged"
      ],
      "correctOrder": [2, 0, 1],
      "explanation": "Privileged (no restrictions) → Baseline (minimal restrictions) → Restricted (most secure with non-root, no host access, limited capabilities)."
    },
    {
      "type": "mcq",
      "question": "What is the key difference between Built-in Admission Controllers and Admission Webhooks?",
      "options": [
        "Built-in controllers are slower than webhooks",
        "Webhooks can only validate, not mutate requests",
        "Built-in controllers are compiled into the API server; webhooks are external HTTP services",
        "Webhooks run before built-in controllers"
      ],
      "answer": 2,
      "explanation": "Built-in admission controllers are compiled into the API server binary and cannot be modified without recompiling. Admission webhooks are custom logic in external HTTP services that you write and deploy.",
      "hint": "Consider where each type of controller runs and how it's modified."
    },
    {
      "type": "true-false",
      "question": "Setting `readOnlyRootFilesystem: true` means the container cannot write to any filesystem location.",
      "answer": false,
      "explanation": "With readOnlyRootFilesystem: true, the root filesystem is immutable, but you can still mount writable volumes (like emptyDir) at specific paths for temporary files or caches.",
      "hint": "Consider how applications that need to write temporary files would work."
    },
    {
      "type": "flashcard",
      "question": "Explain the RBAC mental model: WHO can do WHAT on WHICH resources WHERE?",
      "answer": "**WHO**: Subjects - User, Group, or ServiceAccount\n\n**WHAT**: Verbs - get, list, create, delete, update, patch, watch, etc.\n\n**WHICH**: Resources - pods, services, deployments, secrets, etc.\n\n**WHERE**: Scope - Namespace-scoped (Role) or Cluster-wide (ClusterRole)\n\nRoleBindings connect WHO to WHAT+WHICH+WHERE by linking subjects to roles."
    },
    {
      "type": "code-completion",
      "question": "Complete the Pod spec to run as non-root user with UID 1000:",
      "instruction": "Fill in the missing field name",
      "codeTemplate": "securityContext:\n  _____: 1000\n  runAsNonRoot: true",
      "answer": "runAsUser",
      "caseSensitive": true,
      "acceptedAnswers": ["runAsUser"],
      "explanation": "The `runAsUser` field specifies the UID to run the container process. Combined with `runAsNonRoot: true`, it ensures the container runs as a non-root user."
    },
    {
      "type": "mcq",
      "question": "Why is granting the 'bind' verb in RBAC considered a security risk?",
      "options": [
        "It allows deleting all resources",
        "It allows users to assign roles, enabling privilege escalation",
        "It exposes sensitive network ports",
        "It disables all authentication"
      ],
      "answer": 1,
      "explanation": "The 'bind' verb allows assigning roles to users, which can be used for privilege escalation - a user could grant themselves higher permissions than intended.",
      "hint": "Think about what happens when someone can assign any role to themselves."
    },
    {
      "type": "multiple-select",
      "question": "Which securityContext fields are available ONLY at the container level (not pod level)?",
      "options": [
        "runAsUser",
        "capabilities",
        "fsGroup",
        "readOnlyRootFilesystem",
        "allowPrivilegeEscalation"
      ],
      "answers": [1, 3, 4],
      "explanation": "capabilities, readOnlyRootFilesystem, and allowPrivilegeEscalation are container-level only. runAsUser works at both levels, and fsGroup is pod-level only.",
      "hint": "Container-level fields typically control container-specific runtime behavior."
    },
    {
      "type": "true-false",
      "question": "Every Kubernetes namespace automatically gets a 'default' ServiceAccount created.",
      "answer": true,
      "explanation": "The ServiceAccount admission controller automatically creates a 'default' ServiceAccount in every namespace. Pods use this by default unless a different ServiceAccount is specified.",
      "hint": "Consider what happens when you create a new namespace."
    }
  ]
}
{{< /quiz >}}
