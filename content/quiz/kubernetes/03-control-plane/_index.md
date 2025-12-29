---
title: Control Plane Components Quiz
linkTitle: Control Plane
type: docs
weight: 03
prev: /quiz/kubernetes/02-cluster-architecture
next: /quiz/kubernetes/04-worker-nodes
---

{{< quiz id="kubernetes-control-plane-quiz" >}}
{
  "questions": [
    {
      "type": "mcq",
      "question": "Which component is the ONLY one that directly interacts with etcd?",
      "options": [
        "kube-scheduler",
        "kube-api-server",
        "kube-controller-manager",
        "kubelet"
      ],
      "answer": 1,
      "explanation": "The kube-api-server is the only component that directly interacts with etcd. All other components communicate through the API server to read or modify cluster state.",
      "hint": "Think about which component serves as the central hub for all communication."
    },
    {
      "type": "multiple-select",
      "question": "What happens when the kube-api-server fails? Select all that apply.",
      "options": [
        "Existing workloads continue running",
        "Networking continues to function",
        "kubectl commands fail",
        "New pods can still be scheduled",
        "Controllers can still reconcile state"
      ],
      "answers": [0, 1, 2],
      "explanation": "When the API server fails, the data plane (existing workloads and networking) continues to function, but the control plane operations cease. No new changes are possible, kubectl fails, and controllers cannot reconcile because they cannot communicate without the API server.",
      "hint": "Consider the difference between control plane and data plane operations."
    },
    {
      "type": "true-false",
      "question": "The kube-scheduler both makes scheduling decisions AND executes the actual pod placement on nodes.",
      "answer": false,
      "explanation": "False. The kube-scheduler only makes scheduling DECISIONS by assigning pods to nodes (updating the nodeName field). The actual pod PLACEMENT and execution is done by the kubelet on the assigned node.",
      "hint": "Think about the division of responsibilities between control plane and worker nodes."
    },
    {
      "type": "fill-blank",
      "question": "The scheduling process has two main phases: the filtering phase removes unsuitable nodes, and the _______ phase ranks the remaining nodes.",
      "answer": "scoring",
      "caseSensitive": false,
      "explanation": "The scheduling process consists of two phases: 1) Filtering (predicate) phase that eliminates unsuitable nodes, and 2) Scoring (priority) phase that ranks the remaining nodes to select the best match.",
      "hint": "After filtering, nodes need to be ranked somehow."
    },
    {
      "type": "code-output",
      "question": "Given an etcd cluster configuration, what is the minimum number of nodes needed for quorum if you want to tolerate 2 node failures?",
      "code": "# etcd cluster configuration\n# Goal: Tolerate 2 failures\n# Formula: Quorum = (N/2) + 1\n# Quorum must be > 50% of total nodes\n\n# If 2 nodes can fail, how many total nodes needed?",
      "language": "bash",
      "options": [
        "3 nodes",
        "4 nodes",
        "5 nodes",
        "6 nodes"
      ],
      "answer": 2,
      "explanation": "To tolerate 2 failures, you need 5 nodes. With 5 nodes, quorum requires 3 nodes ((5/2)+1=3). If 2 nodes fail, you still have 3 nodes available to maintain quorum. With only 4 nodes, losing 2 would leave you with 2 nodes, which is not enough for quorum (need 3).",
      "hint": "Calculate backwards: if 2 fail, how many remain must still meet (N/2)+1?"
    },
    {
      "type": "flashcard",
      "question": "What is the reconciliation loop in Kubernetes?",
      "answer": "**Reconciliation Loop** is the continuous process where controllers compare the **desired state** (from resource specs in etcd) with the **actual state** (current reality) and take corrective action when they differ.\n\n**Key characteristics:**\n- Runs approximately every 30 seconds\n- Event-driven but also periodic\n- Ensures self-healing and state enforcement\n- Core mechanism for Kubernetes' declarative model"
    },
    {
      "type": "drag-drop",
      "question": "Arrange the API server request processing pipeline in the correct order:",
      "instruction": "Drag to arrange in the correct order from first to last",
      "items": [
        "Authentication",
        "Authorization",
        "Validation",
        "Admission Controllers",
        "Persistence to etcd"
      ],
      "correctOrder": [0, 1, 3, 2, 4],
      "explanation": "The correct pipeline is: 1) Authentication (Who are you?), 2) Authorization (What can you do?), 3) Admission Control (Should we allow this?), 4) Validation (Is this valid?), 5) Persistence to etcd. Each step must pass before proceeding to the next."
    },
    {
      "type": "code-completion",
      "question": "Complete the kubectl command to taint a node so that no pods will schedule on it:",
      "instruction": "Fill in the missing taint effect",
      "codeTemplate": "kubectl taint nodes node1 maintenance=true:_____",
      "answer": "NoSchedule",
      "caseSensitive": false,
      "acceptedAnswers": ["NoSchedule", "noschedule"],
      "explanation": "The NoSchedule effect prevents new pods from being scheduled on the node unless they have a matching toleration. Other effects include NoExecute (evicts existing pods) and PreferNoSchedule (soft version)."
    },
    {
      "type": "mcq",
      "question": "In a 3-node etcd cluster, what happens if 2 nodes fail?",
      "options": [
        "The cluster continues to operate normally",
        "The cluster becomes read-only",
        "The cluster immediately crashes",
        "The remaining node can still process writes"
      ],
      "answer": 1,
      "explanation": "With 2 out of 3 nodes failed, the cluster loses quorum (needs 2, has only 1). The cluster becomes read-only—existing workloads continue running, but no changes can be made. Quorum must be restored to resume write operations.",
      "hint": "Think about the quorum formula: (N/2) + 1"
    },
    {
      "type": "multiple-select",
      "question": "Which controllers are part of the kube-controller-manager? Select all that apply.",
      "options": [
        "Node Controller",
        "Endpoints Controller",
        "Ingress Controller",
        "Deployment Controller",
        "Service Mesh Controller",
        "StatefulSet Controller"
      ],
      "answers": [0, 1, 3, 5],
      "explanation": "The kube-controller-manager includes Node Controller, Endpoints Controller, Deployment Controller, and StatefulSet Controller (among others). Ingress Controller and Service Mesh Controller are typically separate components deployed in the cluster, not part of the core controller manager.",
      "hint": "Consider which controllers are fundamental to Kubernetes vs. add-ons."
    },
    {
      "type": "true-false",
      "question": "When the kube-controller-manager fails, Kubernetes can no longer perform self-healing operations like replacing failed pods.",
      "answer": true,
      "explanation": "True. The kube-controller-manager runs the reconciliation loops that enable self-healing. When it fails, controllers cannot detect and correct state discrepancies, so failed pods won't be replaced, scaling won't work, and rolling updates will stop.",
      "hint": "Think about what component enforces desired state."
    },
    {
      "type": "fill-blank",
      "question": "The kube-scheduler watches for pods where the _______ field is null, indicating they need to be assigned to a node.",
      "answer": "nodeName",
      "caseSensitive": false,
      "explanation": "The scheduler watches for pods with nodeName=null (unscheduled pods). After selecting an appropriate node through filtering and scoring, the scheduler updates the pod's nodeName field via the API server, which triggers the kubelet on that node to start the pod.",
      "hint": "What field identifies which node a pod should run on?"
    },
    {
      "type": "code-output",
      "question": "A Deployment specifies `replicas: 5` but only 3 pods are currently running. What action will the Deployment Controller take?",
      "code": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web-app\nspec:\n  replicas: 5\n\n# Current state: 3 pods running",
      "language": "yaml",
      "options": [
        "Delete 2 pods to match the lower number",
        "Create/update ReplicaSet to ensure 5 pods exist",
        "Wait for manual intervention",
        "Scale down to 3 to match current state"
      ],
      "answer": 1,
      "explanation": "The Deployment Controller detects the discrepancy (desired=5, actual=3) and takes action by creating or updating the ReplicaSet. The ReplicaSet Controller then creates the 2 missing pods. This is the reconciliation loop in action—continuously working to match actual state to desired state.",
      "hint": "Think about how reconciliation loops work."
    },
    {
      "type": "flashcard",
      "question": "What is the Raft consensus algorithm's role in etcd?",
      "answer": "**Raft Consensus Algorithm** ensures consistency across the distributed etcd cluster.\n\n**How it works:**\n- Elects a leader among etcd nodes\n- Leader handles all write operations\n- Writes must be acknowledged by quorum (majority)\n- Guarantees strong consistency\n- Automatically handles leader failures\n\n**Why it matters:** Prevents split-brain scenarios and ensures all nodes agree on the cluster state even during network partitions or node failures."
    },
    {
      "type": "drag-drop",
      "question": "Arrange the complete flow of pod creation in the correct order:",
      "instruction": "Order these steps from when a user creates a pod to when it's running",
      "items": [
        "kubectl creates pod request",
        "API server authenticates & validates",
        "Pod stored in etcd (nodeName=null)",
        "Scheduler detects and assigns node",
        "kubelet starts container",
        "Controller verifies desired state"
      ],
      "correctOrder": [0, 1, 2, 3, 4, 5],
      "explanation": "The complete flow: 1) User sends create request, 2) API server processes it (auth, authz, validation), 3) Pod saved to etcd without node assignment, 4) Scheduler watches, selects node, and binds pod, 5) kubelet on assigned node pulls image and starts container, 6) Controller monitors to ensure state is maintained."
    },
    {
      "type": "code-completion",
      "question": "Complete the etcdctl command to create a backup snapshot:",
      "instruction": "Fill in the missing subcommand",
      "codeTemplate": "ETCDCTL_API=3 etcdctl _____ save snapshot.db",
      "answer": "snapshot",
      "caseSensitive": false,
      "acceptedAnswers": ["snapshot"],
      "explanation": "The correct command is `etcdctl snapshot save`. The snapshot subcommand creates a point-in-time backup of the etcd database. This is critical for disaster recovery since etcd stores all cluster state."
    },
    {
      "type": "mcq",
      "question": "Which phase of the scheduling process eliminates nodes that lack sufficient CPU resources?",
      "options": [
        "Scoring phase (Priority phase)",
        "Filtering phase (Predicate phase)",
        "Binding phase",
        "Selection phase"
      ],
      "answer": 1,
      "explanation": "The Filtering phase (also called Predicate phase) eliminates unsuitable nodes based on hard constraints like insufficient resources, taints without tolerations, node selector mismatches, etc. The Scoring phase comes after and ranks the remaining nodes.",
      "hint": "Think about whether resource requirements are hard constraints or preferences."
    },
    {
      "type": "multiple-select",
      "question": "What data is stored in etcd? Select all that apply.",
      "options": [
        "Pod specifications and status",
        "Container logs",
        "Secrets and ConfigMaps",
        "Deployment definitions",
        "Prometheus metrics",
        "Service definitions"
      ],
      "answers": [0, 2, 3, 5],
      "explanation": "etcd stores all Kubernetes resource definitions and their current state: pods, deployments, services, secrets, configmaps, etc. It does NOT store container logs (stored on nodes) or metrics (stored in monitoring systems like Prometheus). etcd is for cluster state, not operational data.",
      "hint": "Consider what represents cluster state vs. runtime operational data."
    },
    {
      "type": "true-false",
      "question": "The cloud-controller-manager is required for all Kubernetes clusters to function properly.",
      "answer": false,
      "explanation": "False. The cloud-controller-manager is optional and only needed for clusters running on cloud providers (AWS, GCP, Azure). It manages cloud-specific resources like load balancers, volumes, and routes. On-premises or bare-metal clusters don't use it.",
      "hint": "Think about whether all Kubernetes clusters run in the cloud."
    },
    {
      "type": "fill-blank",
      "question": "All control plane components communicate through the _______, which serves as the central hub for the cluster.",
      "answer": "kube-api-server",
      "caseSensitive": false,
      "acceptedAnswers": ["kube-api-server", "api server", "api-server", "kube api server"],
      "explanation": "All control plane components communicate through the kube-api-server, which acts as the central hub. No component directly communicates with another—everything goes through the API server. This design simplifies security, consistency, and monitoring.",
      "hint": "What component is described as the 'front door' of Kubernetes?"
    },
    {
      "type": "code-output",
      "question": "What will happen if you try to run kubectl commands when the kube-api-server is down but the kube-scheduler and kube-controller-manager are running?",
      "code": "# Control plane status:\n# kube-api-server: DOWN ❌\n# kube-scheduler: UP ✅\n# kube-controller-manager: UP ✅\n# etcd: UP ✅\n\n$ kubectl get pods",
      "language": "bash",
      "options": [
        "Commands work normally since other components are up",
        "Commands fail—cannot connect to API server",
        "Commands work but data might be stale",
        "Commands are queued until API server returns"
      ],
      "answer": 1,
      "explanation": "kubectl commands will fail because kubectl communicates exclusively with the kube-api-server. Even though scheduler, controller-manager, and etcd are running, without the API server there is no way to access the cluster. The API server is the only entry point for all external communication.",
      "hint": "How does kubectl communicate with the cluster?"
    },
    {
      "type": "flashcard",
      "question": "What are Node Affinity and Pod Affinity/Anti-Affinity?",
      "answer": "**Node Affinity** defines rules for scheduling pods onto nodes based on node labels.\n- `requiredDuringScheduling`: Hard requirement (must match)\n- `preferredDuringScheduling`: Soft preference (best effort)\n\n**Pod Affinity/Anti-Affinity** defines rules based on other pods.\n- **Affinity**: Schedule near certain pods (e.g., same zone)\n- **Anti-Affinity**: Schedule away from certain pods (e.g., spread replicas)\n\n**Use cases:**\n- Affinity: Co-locate related services for low latency\n- Anti-Affinity: Spread replicas for high availability"
    },
    {
      "type": "mcq",
      "question": "Why does Kubernetes recommend odd numbers (3, 5, 7) rather than even numbers for etcd cluster size?",
      "options": [
        "Odd numbers provide better performance",
        "Even numbers cannot form a quorum",
        "Odd numbers are more cost-effective with same fault tolerance as the next even number",
        "Even numbers have security vulnerabilities"
      ],
      "answer": 2,
      "explanation": "Odd numbers are recommended because they provide the same fault tolerance as the next even number. For example, both 3 and 4 nodes can tolerate 1 failure (need quorum of 2 and 3 respectively). Since you get no additional fault tolerance with 4 nodes vs 3, the 4th node is wasted. Odd numbers are more efficient.",
      "hint": "Compare the fault tolerance of 3 vs 4 nodes, or 5 vs 6 nodes."
    },
    {
      "type": "multiple-select",
      "question": "When the kube-scheduler fails, which statements are true? Select all that apply.",
      "options": [
        "Existing pods continue running normally",
        "New pods get stuck in Pending state",
        "Running pods will be terminated",
        "Services and networking continue to work",
        "Controllers stop reconciling"
      ],
      "answers": [0, 1, 3],
      "explanation": "When the scheduler fails: existing pods continue running, networking works, and services function normally. However, new pods cannot be assigned to nodes and remain in Pending state. Controllers continue to work (they don't depend on scheduler), but the pods they create won't be scheduled.",
      "hint": "Think about what the scheduler does vs. what keeps pods running."
    },
    {
      "type": "true-false",
      "question": "The API server uses a 'watch' mechanism that allows components to receive real-time updates when resources change, rather than constantly polling.",
      "answer": true,
      "explanation": "True. The kube-api-server provides a watch mechanism that allows components (scheduler, controllers, kubelet) to subscribe to resource changes. When a resource is created, modified, or deleted, watchers are immediately notified. This event-driven architecture is more efficient than polling.",
      "hint": "Think about how components stay in sync without overwhelming the API server."
    },
    {
      "type": "fill-blank",
      "question": "The cloud-controller-manager includes a Service Controller that creates, updates, and deletes cloud _______ for LoadBalancer type services.",
      "answer": "load balancers",
      "caseSensitive": false,
      "explanation": "The Service Controller within cloud-controller-manager manages cloud load balancers (like AWS ELB/NLB, GCP Load Balancer, Azure Load Balancer) for Kubernetes Services of type LoadBalancer. It automatically provisions and configures these cloud resources.",
      "hint": "What cloud resource distributes traffic across multiple backends?"
    },
    {
      "type": "code-output",
      "question": "Given this nodeSelector configuration, which node label must exist for the pod to be scheduled?",
      "code": "apiVersion: v1\nkind: Pod\nmetadata:\n  name: web-pod\nspec:\n  nodeSelector:\n    disktype: ssd\n    zone: us-east-1a\n  containers:\n  - name: nginx\n    image: nginx",
      "language": "yaml",
      "options": [
        "Only disktype: ssd",
        "Only zone: us-east-1a",
        "Both disktype: ssd AND zone: us-east-1a",
        "Either disktype: ssd OR zone: us-east-1a"
      ],
      "answer": 2,
      "explanation": "nodeSelector requires ALL specified labels to match. A node must have both `disktype=ssd` AND `zone=us-east-1a` labels for this pod to be scheduled on it. If any label is missing or has a different value, the node is filtered out during the scheduling filtering phase.",
      "hint": "Does nodeSelector use AND logic or OR logic?"
    },
    {
      "type": "drag-drop",
      "question": "Order these etcd cluster sizes from LEAST to MOST fault-tolerant:",
      "instruction": "Arrange by number of node failures each can tolerate",
      "items": [
        "1 node (tolerates 0 failures)",
        "3 nodes (tolerates 1 failure)",
        "5 nodes (tolerates 2 failures)",
        "7 nodes (tolerates 3 failures)"
      ],
      "correctOrder": [0, 1, 2, 3],
      "explanation": "Fault tolerance increases with cluster size: 1-node clusters cannot tolerate any failures, 3-node clusters tolerate 1 failure, 5-node clusters tolerate 2 failures, and 7-node clusters tolerate 3 failures. The pattern follows: tolerated failures = (N-1)/2."
    },
    {
      "type": "flashcard",
      "question": "What is the difference between Admission Controllers (mutating vs validating)?",
      "answer": "**Mutating Admission Controllers** modify requests before they're persisted.\n- Run FIRST in admission pipeline\n- Examples: Add default values, inject labels, add sidecars\n- Can change the resource definition\n\n**Validating Admission Controllers** validate requests without modifying them.\n- Run AFTER mutating controllers\n- Examples: Enforce policies, check quotas, validate custom rules\n- Can only accept or reject requests\n\n**Pipeline:** Request → Mutating → Validating → Validation → etcd\n\n**Example:** A mutating webhook might inject an Istio sidecar, then a validating webhook ensures the pod doesn't exceed namespace resource quotas."
    },
    {
      "type": "mcq",
      "question": "What is the PRIMARY role of the Endpoints Controller?",
      "options": [
        "Create external load balancers for services",
        "Assign IP addresses to pods",
        "Populate Endpoints objects that link Services to Pods",
        "Monitor endpoint health and restart failed containers"
      ],
      "answer": 2,
      "explanation": "The Endpoints Controller populates Endpoints objects, which maintain the mapping between Services and the Pods that back them. When pods are created/deleted or their readiness changes, the Endpoints Controller updates the corresponding Endpoints object so traffic is routed correctly.",
      "hint": "Think about how Services know which Pods to send traffic to."
    },
    {
      "type": "code-completion",
      "question": "Complete the pod tolerations configuration to allow scheduling on a node with a specific taint:",
      "instruction": "Fill in the missing toleration field",
      "codeTemplate": "spec:\n  tolerations:\n  - key: \"key\"\n    operator: \"Equal\"\n    value: \"value\"\n    _____: \"NoSchedule\"",
      "answer": "effect",
      "caseSensitive": false,
      "acceptedAnswers": ["effect"],
      "explanation": "The `effect` field in tolerations specifies which taint effect this toleration applies to (NoSchedule, NoExecute, or PreferNoSchedule). The toleration must match the taint's key, value, and effect for the pod to be scheduled on the tainted node."
    },
    {
      "type": "true-false",
      "question": "If etcd experiences total data loss, the cluster can recover by having the controllers and API server rebuild the state from memory.",
      "answer": false,
      "explanation": "False. etcd is the single source of truth—there is no other persistent storage of cluster state. If etcd experiences total data loss without backups, the cluster is unrecoverable and must be rebuilt from scratch. This highlights the critical importance of regular etcd backups.",
      "hint": "Where is cluster state persisted?"
    },
    {
      "type": "multiple-select",
      "question": "Which of the following are responsibilities of the cloud-controller-manager? Select all that apply.",
      "options": [
        "Update node addresses from cloud provider",
        "Schedule pods to nodes",
        "Create and manage cloud load balancers",
        "Store cluster state in etcd",
        "Remove failed nodes from the cluster",
        "Manage persistent cloud volumes"
      ],
      "answers": [0, 2, 4, 5],
      "explanation": "The cloud-controller-manager handles cloud-specific operations: updating node addresses, creating load balancers for LoadBalancer-type services, removing failed nodes, and managing cloud volumes (attach/detach). It does NOT schedule pods (that's the scheduler) or directly interact with etcd (only API server does that).",
      "hint": "Focus on responsibilities that are specific to cloud infrastructure."
    }
  ]
}
{{< /quiz >}}
