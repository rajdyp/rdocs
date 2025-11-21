---
title: Advanced Topics Quiz
linkTitle: Advanced Topics
type: docs
weight: 16
prev: /quiz/kubernetes/15-observability
---

{{< quiz id="kubernetes-advanced-topics-quiz" >}}
{
  "questions": [
    {
      "type": "mcq",
      "question": "What is the primary purpose of a Finalizer in Kubernetes?",
      "options": [
        "To speed up resource deletion",
        "To block deletion until cleanup tasks are completed",
        "To automatically scale resources",
        "To encrypt resource data"
      ],
      "answer": 1,
      "explanation": "A Finalizer is a metadata key that blocks Kubernetes from deleting a resource until the controller has completed its cleanup tasks. It ensures graceful deletion by allowing cleanup of external resources, closing connections, etc.",
      "hint": "Think about what happens when you need to release external resources before deletion."
    },
    {
      "type": "true-false",
      "question": "Creating a Custom Resource Definition (CRD) automatically provisions the underlying infrastructure (like pods or services) for that resource.",
      "answer": false,
      "explanation": "CRDs alone only define the schema - they don't create actual infrastructure. To automate actions when CRD instances are created, you need a controller/operator that watches for those resources and creates the necessary Kubernetes objects.",
      "hint": "Consider what happens when you apply a Database CRD without any operator installed."
    },
    {
      "type": "multiple-select",
      "question": "Which of the following are true about the relationship between Operators and CRDs?",
      "options": [
        "An Operator combines a CRD with a Controller",
        "CRDs can function independently without Operators",
        "Operators encapsulate domain-specific operational knowledge",
        "Operators can only manage database applications"
      ],
      "answers": [0, 1, 2],
      "explanation": "Operator = CRD + Controller. CRDs can exist independently (just storing data in etcd), but Operators add automation. Operators encapsulate domain knowledge and can manage any type of application, not just databases.",
      "hint": "Think about what each component does independently and together."
    },
    {
      "type": "drag-drop",
      "question": "Arrange the deletion flow with Finalizers in the correct order:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "User runs kubectl delete",
        "deletionTimestamp is set, resource enters Terminating state",
        "Controller detects deletionTimestamp and performs cleanup",
        "Controller removes finalizers after cleanup completes",
        "Resource is removed from etcd"
      ],
      "correctOrder": [0, 1, 2, 3, 4],
      "explanation": "The finalizer flow is: deletion initiated → deletionTimestamp set → controller performs cleanup → finalizers removed → actual deletion from etcd."
    },
    {
      "type": "mcq",
      "question": "In admission webhook execution, which type of webhook runs first?",
      "options": [
        "Validating webhooks run first",
        "Mutating webhooks run first",
        "They run simultaneously",
        "The order depends on webhook priority"
      ],
      "answer": 1,
      "explanation": "Mutating webhooks run first to modify the object (inject sidecars, set defaults), then validating webhooks run to approve or reject the (possibly modified) object before it's persisted to etcd.",
      "hint": "Consider why you'd want one type to see the results of the other."
    },
    {
      "type": "fill-blank",
      "question": "In Istio, what CRD is used to control routing and define where traffic goes (e.g., for canary deployments)?",
      "answer": "VirtualService",
      "caseSensitive": false,
      "explanation": "VirtualService controls routing decisions - where traffic goes. It's used for traffic splitting (canary deployments), URL-based routing, and more. DestinationRule, in contrast, defines how traffic behaves at the destination.",
      "hint": "It's a two-word resource that describes the 'virtual' nature of the service routing."
    },
    {
      "type": "code-output",
      "question": "What does this kubectl command do?",
      "code": "kubectl patch pod my-pod -p '{\"metadata\":{\"finalizers\":[]}}' --type=merge",
      "language": "bash",
      "options": [
        "Adds a new finalizer to the pod",
        "Removes all finalizers from the pod (force cleanup)",
        "Lists all finalizers on the pod",
        "Restarts the pod with new finalizers"
      ],
      "answer": 1,
      "explanation": "This command manually removes all finalizers by setting an empty array. This is typically used when a resource is stuck in 'Terminating' state because the controller that should remove the finalizer is not functioning.",
      "hint": "Setting an empty array effectively clears all existing values."
    },
    {
      "type": "true-false",
      "question": "Service Mesh primarily handles north-south (ingress/egress) traffic rather than east-west (service-to-service) traffic.",
      "answer": false,
      "explanation": "Service Mesh primarily handles east-west (service-to-service) traffic within the cluster through sidecar proxies. North-south traffic handling is an optional integration typically through gateway components like Istio Ingress Gateway.",
      "hint": "Think about what 'mesh' implies - connections between many services."
    },
    {
      "type": "multiple-select",
      "question": "Which features does a Service Mesh typically provide?",
      "options": [
        "Mutual TLS (mTLS) encryption between services",
        "Circuit breaker patterns",
        "Container image building",
        "Distributed tracing",
        "Pod scheduling decisions"
      ],
      "answers": [0, 1, 3],
      "explanation": "Service Mesh provides mTLS for encryption, circuit breakers for resilience, and distributed tracing for observability. Container image building and pod scheduling are handled by other components (CI/CD and kube-scheduler respectively).",
      "hint": "Focus on features related to service-to-service communication and observability."
    },
    {
      "type": "mcq",
      "question": "What is the key difference between a Validating Webhook and a Mutating Webhook?",
      "options": [
        "Validating webhooks run before mutating webhooks",
        "Validating webhooks can modify requests, mutating webhooks cannot",
        "Mutating webhooks can modify requests, validating webhooks can only approve/reject",
        "They serve identical purposes with different naming conventions"
      ],
      "answer": 2,
      "explanation": "Mutating webhooks can modify the request (inject sidecars, set defaults) while validating webhooks can only approve or reject the request. Mutating runs first so validating can check the final modified object.",
      "hint": "The names indicate their primary action: mutate (change) vs validate (check)."
    },
    {
      "type": "fill-blank",
      "question": "In Helm terminology, what is a running instance of a chart called?",
      "answer": "release",
      "caseSensitive": false,
      "explanation": "A Release is an instance of a chart running in the cluster. You can have multiple releases of the same chart (e.g., my-postgres-dev and my-postgres-prod from the same postgresql chart).",
      "hint": "Think about what happens when you 'install' a chart."
    },
    {
      "type": "code-completion",
      "question": "Complete the Helm command to install a chart with custom values:",
      "instruction": "Fill in the flag to specify a values file",
      "codeTemplate": "helm install my-postgres bitnami/postgresql _____ values.yaml",
      "answer": "-f",
      "caseSensitive": true,
      "acceptedAnswers": ["-f", "--values"],
      "explanation": "The `-f` or `--values` flag specifies a YAML file containing custom values to override chart defaults."
    },
    {
      "type": "drag-drop",
      "question": "Arrange these Helm hook types in their typical execution order during an upgrade:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "pre-upgrade",
        "post-upgrade",
        "pre-rollback",
        "post-rollback"
      ],
      "correctOrder": [0, 1, 2, 3],
      "explanation": "During an upgrade: pre-upgrade runs before upgrade, post-upgrade runs after. If rollback is needed: pre-rollback runs before rollback, post-rollback runs after."
    },
    {
      "type": "mcq",
      "question": "In Kustomize, what is the purpose of an 'overlay'?",
      "options": [
        "To define the common base configuration",
        "To apply environment-specific customizations on top of the base",
        "To generate ConfigMaps and Secrets",
        "To validate YAML syntax"
      ],
      "answer": 1,
      "explanation": "An overlay applies environment-specific customizations (dev/staging/prod) on top of the base configuration. This avoids duplication by keeping common config in base and only differences in overlays.",
      "hint": "Think of it as a 'layer' that goes on top of something else."
    },
    {
      "type": "true-false",
      "question": "Kustomize is built into kubectl and doesn't require installation of a separate tool.",
      "answer": true,
      "explanation": "Kustomize is built into kubectl. You can use `kubectl apply -k` or `kubectl kustomize` directly without installing any additional tools.",
      "hint": "Consider the '-k' flag available in kubectl commands."
    },
    {
      "type": "multiple-select",
      "question": "Which are valid use cases for Kustomize Components?",
      "options": [
        "Optional features that can be enabled in multiple environments",
        "Bundling related resources that are enabled/disabled together",
        "Replacing Helm charts entirely",
        "Avoiding duplication of configuration across overlays"
      ],
      "answers": [0, 1, 3],
      "explanation": "Components are for optional, reusable features (like monitoring) that can be enabled across environments. They bundle related resources and avoid duplication. Kustomize and Helm serve different purposes and aren't direct replacements.",
      "hint": "Think about features that are optional but might be needed in multiple environments."
    },
    {
      "type": "mcq",
      "question": "What is the fundamental principle of GitOps?",
      "options": [
        "All deployments must use GitHub Actions",
        "Git repository is the single source of truth for infrastructure state",
        "Manual kubectl commands are preferred over automation",
        "Infrastructure changes should never be version controlled"
      ],
      "answer": 1,
      "explanation": "GitOps treats Git as the single source of truth. All changes are made via commits, and operators automatically sync the cluster state to match what's defined in Git, providing audit trails and easy rollbacks.",
      "hint": "Consider what makes Git valuable for tracking changes over time."
    },
    {
      "type": "fill-blank",
      "question": "In Istio, what resource type configures traffic policies like connection pools and circuit breakers for a destination?",
      "answer": "DestinationRule",
      "caseSensitive": false,
      "explanation": "DestinationRule configures how traffic behaves at the destination - connection pools, circuit breakers, load balancing, and subsets. VirtualService controls where traffic goes, DestinationRule controls how it behaves.",
      "hint": "It's a rule that applies to the destination of traffic."
    },
    {
      "type": "flashcard",
      "question": "What is the relationship between CRDs, Controllers, and Operators?",
      "answer": "**Operator = CRD + Controller**\n\n- **CRD**: Extends Kubernetes API with custom resource types (defines the schema)\n- **Controller**: Watches for resources and takes action to reconcile actual state with desired state\n- **Operator**: Combines both to automate complex application management, encapsulating domain-specific operational knowledge"
    },
    {
      "type": "code-output",
      "question": "What does this Kustomize command do?",
      "code": "kubectl diff -k overlays/production",
      "language": "bash",
      "options": [
        "Deletes the production overlay",
        "Shows differences between current cluster state and what would be applied",
        "Creates a diff file for the overlay",
        "Compares two different overlays"
      ],
      "answer": 1,
      "explanation": "The `kubectl diff -k` command shows what changes would be made if you applied the kustomization, comparing the desired state (from overlays/production) with the current cluster state. Useful for reviewing changes before applying.",
      "hint": "The 'diff' subcommand typically compares current vs proposed state."
    },
    {
      "type": "mcq",
      "question": "Which patching strategy in Kustomize is best for adding a sidecar container to a deployment?",
      "options": [
        "JSON 6902 Patch",
        "Strategic Merge Patch",
        "Inline Patch",
        "Binary Patch"
      ],
      "answer": 1,
      "explanation": "Strategic Merge Patch is best for adding/modifying large sections like containers, volumes, or complex nested structures. JSON 6902 Patch is better for precise modifications of single values.",
      "hint": "Consider which approach handles complex nested structures more naturally."
    },
    {
      "type": "true-false",
      "question": "In Helm, the `helm template` command applies resources directly to the cluster.",
      "answer": false,
      "explanation": "`helm template` only renders the templates locally and outputs the generated YAML - it doesn't apply anything to the cluster. Use `helm install` or `helm upgrade` to actually deploy resources.",
      "hint": "Think about what 'template' implies - generating output vs taking action."
    },
    {
      "type": "multiple-select",
      "question": "Which are valid GitOps benefits?",
      "options": [
        "Complete audit trail of all changes",
        "Easy rollbacks using git revert",
        "Faster container builds",
        "Reproducible deployments",
        "Reduced manual errors"
      ],
      "answers": [0, 1, 3, 4],
      "explanation": "GitOps provides audit trails (git history), easy rollbacks (git revert), reproducible deployments (same commit = same state), and fewer manual errors (automation). Container builds are handled by CI/CD, not GitOps specifically.",
      "hint": "Focus on benefits related to using Git as source of truth for infrastructure."
    },
    {
      "type": "flashcard",
      "question": "When should you use Kustomize vs Helm?",
      "answer": "**Use Kustomize when:**\n- Managing multiple environments (dev/staging/prod)\n- Simple overlay/patch patterns needed\n- Want to avoid templating complexity\n- Team prefers pure YAML\n- GitOps workflows\n\n**Use Helm when:**\n- Complex applications with many parameters\n- Need reusable packages across teams\n- Dependency management required\n- Installing third-party applications\n- Want package versioning"
    },
    {
      "type": "mcq",
      "question": "What happens when a GitOps operator detects that the cluster state differs from what's defined in Git?",
      "options": [
        "It alerts the user and waits for manual intervention",
        "It automatically applies changes to make the cluster match Git",
        "It updates Git to match the current cluster state",
        "It deletes the affected resources"
      ],
      "answer": 1,
      "explanation": "GitOps operators (like FluxCD or ArgoCD) automatically reconcile the cluster state to match the desired state defined in Git. Git is the source of truth, so the cluster is updated to match Git, not the other way around.",
      "hint": "In GitOps, which direction does the synchronization flow?"
    },
    {
      "type": "fill-blank",
      "question": "What Helm command would you use to revert to a previous release version?",
      "answer": "rollback",
      "caseSensitive": false,
      "explanation": "The `helm rollback` command reverts a release to a previous revision. For example: `helm rollback my-release 1` reverts to revision 1.",
      "hint": "Think about what action undoes an upgrade."
    },
    {
      "type": "code-completion",
      "question": "Complete the kubectl command to apply a Kustomize overlay:",
      "instruction": "Fill in the flag that specifies a kustomization directory",
      "codeTemplate": "kubectl apply _____ overlays/production",
      "answer": "-k",
      "caseSensitive": true,
      "acceptedAnswers": ["-k", "--kustomize"],
      "explanation": "The `-k` or `--kustomize` flag tells kubectl to process the directory as a kustomization and apply the rendered output."
    },
    {
      "type": "true-false",
      "question": "In a Service Mesh like Istio, sidecar proxies are automatically injected into pods when the namespace has the label `istio-injection: enabled`.",
      "answer": true,
      "explanation": "Istio uses a mutating admission webhook to automatically inject Envoy sidecar proxies into pods created in namespaces labeled with `istio-injection: enabled`.",
      "hint": "Think about how Istio gets sidecars into pods without modifying deployment manifests."
    },
    {
      "type": "mcq",
      "question": "Which command shows the actual Kubernetes manifests that were deployed by a Helm release?",
      "options": [
        "`helm show manifest my-release`",
        "`helm get manifest my-release`",
        "`helm template my-release`",
        "`helm list --manifest my-release`"
      ],
      "answer": 1,
      "explanation": "`helm get manifest` shows the actual rendered manifests that were deployed for an existing release. `helm template` renders templates locally without deploying, and `helm show` displays chart information, not deployed resources.",
      "hint": "You want to 'get' information about an existing release."
    },
    {
      "type": "flashcard",
      "question": "What is the difference between East-West and North-South traffic in the context of Service Mesh?",
      "answer": "**East-West Traffic (Primary Service Mesh Focus):**\n- Service-to-service communication within the cluster\n- Pod A ↔ Pod B ↔ Pod C\n- Handled by sidecar proxies\n\n**North-South Traffic (Optional Integration):**\n- Traffic entering or leaving the cluster\n- External clients → Ingress → Services\n- Services → External APIs/Databases\n- Handled by optional gateway components"
    }
  ]
}
{{< /quiz >}}
