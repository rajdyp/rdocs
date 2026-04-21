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
      "id": "kubernetes-control-plane-quiz-01",
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
      "id": "kubernetes-control-plane-quiz-02",
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
      "id": "kubernetes-control-plane-quiz-03",
      "type": "true-false",
      "question": "The kube-scheduler both makes scheduling decisions AND executes the actual pod placement on nodes.",
      "answer": false,
      "explanation": "False. The kube-scheduler only makes scheduling DECISIONS by assigning pods to nodes (updating the nodeName field). The actual pod PLACEMENT and execution is done by the kubelet on the assigned node.",
      "hint": "Think about the division of responsibilities between control plane and worker nodes."
    },
    {
      "id": "kubernetes-control-plane-quiz-04",
      "type": "fill-blank",
      "question": "The scheduling process has two main phases: the filtering phase removes unsuitable nodes, and the _______ phase ranks the remaining nodes.",
      "answer": "scoring",
      "caseSensitive": false,
      "explanation": "The scheduling process consists of two phases: 1) Filtering (predicate) phase that eliminates unsuitable nodes, and 2) Scoring (priority) phase that ranks the remaining nodes to select the best match.",
      "hint": "After filtering, nodes need to be ranked somehow."
    },
    {
      "id": "kubernetes-control-plane-quiz-05",
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
      "id": "kubernetes-control-plane-quiz-06",
      "type": "flashcard",
      "question": "What is the reconciliation loop in Kubernetes?",
      "answer": "**Reconciliation Loop** is the continuous process where controllers compare the **desired state** (from resource specs in etcd) with the **actual state** (current reality) and take corrective action when they differ.\n\n**Key characteristics:**\n- Runs approximately every 30 seconds\n- Event-driven but also periodic\n- Ensures self-healing and state enforcement\n- Foundation of Kubernetes' declarative model"
    },
    {
      "id": "kubernetes-control-plane-quiz-07",
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
      "id": "kubernetes-control-plane-quiz-08",
      "type": "code-completion",
      "question": "Complete the kubectl command to taint a node so that no pods will schedule on it:",
      "instruction": "Fill in the missing taint effect",
      "codeTemplate": "kubectl taint nodes node1 maintenance=true:_____",
      "answer": "NoSchedule",
      "caseSensitive": false,
      "acceptedAnswers": ["NoSchedule", "noschedule"],
      "explanation": "The `NoSchedule` effect prevents new pods from being scheduled on the node unless they have a matching toleration. Other effects include `NoExecute` (evicts existing pods) and `PreferNoSchedule` (soft version). Syntax: `kubectl taint nodes <node-name> <key>=<value>:<effect>`"
    },
    {
      "id": "kubernetes-control-plane-quiz-09",
      "type": "mcq",
      "question": "In a 3-node etcd cluster, what happens if 2 nodes fail?",
      "options": [
        "The cluster continues to operate normally",
        "The cluster becomes read-only",
        "The cluster immediately crashes",
        "The remaining node can still process writes"
      ],
      "answer": 1,
      "explanation": "With 2 out of 3 nodes failed, the cluster loses quorum (needs 2, has only 1). The cluster becomes read-only — existing workloads continue running, but no changes can be made. Quorum must be restored to resume write operations.",
      "hint": "Think about the quorum formula: (N/2) + 1"
    },
    {
      "id": "kubernetes-control-plane-quiz-10",
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
      "explanation": "The kube-controller-manager includes `Node Controller`, `Endpoints Controller`, `Deployment Controller`, and `StatefulSet Controller` (among others). `Ingress Controller` and `Service Mesh Controller` are typically separate components deployed in the cluster, not part of the core controller manager.",
      "hint": "Consider which controllers are fundamental to Kubernetes vs. add-ons."
    },
    {
      "id": "kubernetes-control-plane-quiz-11",
      "type": "true-false",
      "question": "When the kube-controller-manager fails, Kubernetes can no longer perform self-healing operations like replacing failed pods.",
      "answer": true,
      "explanation": "True. The kube-controller-manager runs the reconciliation loops that enable self-healing. When it fails, controllers cannot detect and correct state discrepancies, so failed pods won't be replaced, scaling won't work, and rolling updates will stop.",
      "hint": "Think about what component enforces desired state."
    },
    {
      "id": "kubernetes-control-plane-quiz-12",
      "type": "fill-blank",
      "question": "The kube-scheduler watches for pods where the _______ field is null, indicating they need to be assigned to a node.",
      "answer": "nodeName",
      "caseSensitive": true,
      "explanation": "The kube-scheduler watches for pods with nodeName=null (unscheduled pods). After selecting an appropriate node through filtering and scoring, the scheduler updates the pod's nodeName field via the API server, which triggers the kubelet on that node to start the pod.",
      "hint": "What field identifies which node a pod should run on?"
    },
    {
      "id": "kubernetes-control-plane-quiz-13",
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
      "id": "kubernetes-control-plane-quiz-14",
      "type": "flashcard",
      "question": "What is the Raft consensus algorithm's role in etcd?",
      "answer": "**Raft Consensus Algorithm** ensures consistency across the distributed etcd cluster.\n\n**How it works:**\n- Elects a leader among etcd nodes\n- Leader handles all write operations\n- Writes must be acknowledged by quorum (majority)\n- Guarantees strong consistency\n- Automatically handles leader failures\n\n**Why it matters:** Prevents split-brain scenarios and ensures all nodes agree on the cluster state even during network partitions or node failures."
    },
    {
      "id": "kubernetes-control-plane-quiz-15",
      "type": "drag-drop",
      "question": "Arrange the complete flow of pod creation in the correct order:",
      "instruction": "Order these steps from when a user creates a pod to when it's running",
      "items": [
        "API server authenticates & validates",
        "kubelet starts container",
        "kubectl creates pod request",
        "Controller verifies desired state",
        "Pod stored in etcd (nodeName=null)",
        "Scheduler detects and assigns node"
      ],
      "correctOrder": [2, 0, 4, 5, 1, 3],
      "explanation": "The complete flow: 1) User sends create request, 2) API server processes it (auth, authz, validation), 3) Pod saved to etcd without node assignment, 4) Scheduler watches, selects node, and binds pod, 5) kubelet on assigned node pulls image and starts container, 6) Controller monitors to ensure state is maintained."
    },
    {
      "id": "kubernetes-control-plane-quiz-16",
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
      "id": "kubernetes-control-plane-quiz-17",
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
      "id": "kubernetes-control-plane-quiz-18",
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
      "id": "kubernetes-control-plane-quiz-19",
      "type": "true-false",
      "question": "The cloud-controller-manager is required for all Kubernetes clusters to function properly.",
      "answer": false,
      "explanation": "False. The cloud-controller-manager is optional and only needed for clusters running on cloud providers (AWS, GCP, Azure). It manages cloud-specific resources like load balancers, volumes, and routes. On-premises or bare-metal clusters don't use it.",
      "hint": "Think about whether all Kubernetes clusters run in the cloud."
    },
    {
      "id": "kubernetes-control-plane-quiz-20",
      "type": "fill-blank",
      "question": "All control plane components communicate through the _______, which serves as the central hub for the cluster.",
      "answer": "kube-api-server",
      "caseSensitive": false,
      "acceptedAnswers": ["kube-api-server", "api server", "api-server", "kube api server"],
      "explanation": "All control plane components communicate through the kube-api-server, which acts as the central hub. No component directly communicates with another—everything goes through the API server. This design simplifies security, consistency, and monitoring.",
      "hint": "What component is described as the 'front door' of Kubernetes?"
    },
    {
      "id": "kubernetes-control-plane-quiz-21",
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
      "id": "kubernetes-control-plane-quiz-22",
      "type": "flashcard",
      "question": "What are Node Affinity and Pod Affinity/Anti-Affinity?",
      "answer": "**Node Affinity** — places pods on nodes matching labels; not topology-aware\n- `required...`: hard constraint; pod stays Pending if no node matches\n- `preferred...`: soft preference; scheduler tries but won't block scheduling\n\n**Pod Affinity / Anti-Affinity** — topology-aware placement relative to other pods\n- `topologyKey` defines scope (e.g., `hostname` for node-level, `zone` for zone-level)\n- **Affinity**: co-locate pods near matching pods (e.g., same zone for low latency)\n- **Anti-Affinity**: spread pods away from matching pods (e.g., across nodes for HA)"
    },
    {
      "id": "kubernetes-control-plane-quiz-23",
      "type": "mcq",
      "question": "Why does Kubernetes recommend odd numbers (3, 5, 7) rather than even numbers for etcd cluster size?",
      "options": [
        "Odd numbers provide better performance",
        "Even numbers cannot form a quorum",
        "Odd numbers are more cost-effective with same fault tolerance as the next even number",
        "Even numbers create split-brain risk since equal partitions can both claim leadership"
      ],
      "answer": 2,
      "explanation": "Odd numbers are recommended because they provide the same fault tolerance as the next even number. For example, both 3 and 4 nodes can tolerate 1 failure (need quorum of 2 and 3 respectively). Since you get no additional fault tolerance with 4 nodes vs 3, the 4th node is wasted. Even numbers do NOT create split-brain risk—Raft's quorum requirement blocks writes on both sides of an equal partition, preventing conflicting writes. The reason to prefer odd numbers is purely cost efficiency.",
      "hint": "Compare the fault tolerance of 3 vs 4 nodes, or 5 vs 6 nodes."
    },
    {
      "id": "kubernetes-control-plane-quiz-24",
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
      "id": "kubernetes-control-plane-quiz-25",
      "type": "true-false",
      "question": "The API server provides a 'watch' mechanism that allows components to subscribe to real-time updates when resources change, rather than constantly polling.",
      "answer": true,
      "explanation": "True. The kube-api-server provides a watch mechanism that allows components (scheduler, controllers, kubelet) to subscribe to resource changes. When a resource is created, modified, or deleted, watchers are immediately notified. This event-driven architecture is more efficient than polling.",
      "hint": "Think about how components stay in sync without overwhelming the API server."
    },
    {
      "id": "kubernetes-control-plane-quiz-26",
      "type": "mcq",
      "question": "A Kubernetes Service of type LoadBalancer is created on an AWS cluster. Which component provisions the corresponding AWS load balancer?",
      "options": [
        "kube-controller-manager via its Service Account Controller",
        "cloud-controller-manager via its Service Controller",
        "kube-api-server by calling the AWS API directly",
        "kube-scheduler via cloud affinity rules"
      ],
      "answer": 1,
      "explanation": "The cloud-controller-manager's Service Controller provisions and manages cloud-specific load balancers (like AWS ELB/NLB, GCP Load Balancer, Azure Load Balancer) for Services of type LoadBalancer. The kube-controller-manager handles cloud-agnostic resources; cloud-specific integrations are handled by cloud-controller-manager to keep provider logic out of the core Kubernetes codebase.",
      "hint": "Which component handles cloud provider-specific operations?"
    },
    {
      "id": "kubernetes-control-plane-quiz-27",
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
      "id": "kubernetes-control-plane-quiz-28",
      "type": "drag-drop",
      "question": "Order these etcd cluster sizes from LEAST to MOST fault-tolerant:",
      "instruction": "Arrange by number of node failures each can tolerate",
      "items": [
        "5 nodes",
        "1 node",
        "7 nodes",
        "3 nodes"
      ],
      "correctOrder": [1, 3, 0, 2],
      "explanation": "Fault tolerance increases with cluster size: 1-node clusters cannot tolerate any failures, 3-node clusters tolerate 1 failure, 5-node clusters tolerate 2 failures, and 7-node clusters tolerate 3 failures. The pattern follows: tolerated failures = (N-1)/2."
    },
    {
      "id": "kubernetes-control-plane-quiz-29",
      "type": "flashcard",
      "question": "What is the difference between Admission Controllers (mutating vs validating)?",
      "answer": "**Mutating Admission Controllers** — modify requests before persistence; run FIRST\n- Inject sidecars, set defaults, add labels\n- Can change the resource definition\n\n**Validating Admission Controllers** — validate without modifying; run AFTER mutating\n- Enforce policies, check quotas, apply custom rules\n- Can only accept or reject\n\n**Pipeline:** Request → Mutating → Validating → Validation → etcd\n\n**Example:** Mutating injects Istio sidecar; Validating blocks pod if namespace quota exceeded."
    },
    {
      "id": "kubernetes-control-plane-quiz-30",
      "type": "mcq",
      "question": "A new pod passes its readiness probe and joins a Deployment's ReplicaSet. Which component updates the Endpoints object so the Service begins routing traffic to it?",
      "options": [
        "kube-scheduler, which tracks pod placement across nodes",
        "kubelet, which reports the pod's Ready status to the API server",
        "Endpoints Controller, which populates Endpoints objects when pod readiness changes",
        "Node Controller, which monitors pod health on the node"
      ],
      "answer": 2,
      "explanation": "The Endpoints Controller watches for pods whose readiness changes and updates the corresponding Endpoints objects accordingly. Services route traffic to pods by reading these Endpoints objects, so the Endpoints Controller is the bridge between pod lifecycle and Service-level traffic routing. kubelet reports Ready status upstream, but the Endpoints Controller is what acts on that signal to update routing.",
      "hint": "Think about how a Service discovers which pods are ready to receive traffic."
    },
    {
      "id": "kubernetes-control-plane-quiz-31",
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
      "id": "kubernetes-control-plane-quiz-32",
      "type": "true-false",
      "question": "If etcd experiences total data loss, the cluster can recover by having the controllers and API server rebuild the state from memory.",
      "answer": false,
      "explanation": "False. etcd is the single source of truth — there is no other persistent storage of cluster state. If etcd experiences total data loss without backups, the cluster is unrecoverable and must be rebuilt from scratch. This highlights the critical importance of regular etcd backups.",
      "hint": "Where is cluster state persisted?"
    },
    {
      "id": "kubernetes-control-plane-quiz-33",
      "type": "multiple-select",
      "question": "Which of the following are responsibilities of the cloud-controller-manager? Select all that apply.",
      "options": [
        "Update node addresses from cloud provider",
        "Manage TLS certificates for ingress controllers",
        "Create and manage cloud load balancers",
        "Configure cluster autoscaling policies",
        "Remove failed nodes from the cluster",
        "Manage persistent cloud volumes"
      ],
      "answers": [0, 2, 4, 5],
      "explanation": "The cloud-controller-manager handles cloud-specific operations: updating node addresses, creating load balancers for LoadBalancer-type services, removing failed nodes, and managing cloud volumes (attach/detach). TLS certificate management is handled by separate tools like cert-manager, not cloud-controller-manager. Cluster autoscaling is handled by Cluster Autoscaler, a separate component that runs independently.",
      "hint": "Focus on responsibilities that are specific to cloud infrastructure integration."
    },
    {
      "id": "kubernetes-control-plane-quiz-34",
      "type": "fill-blank",
      "question": "Complete the etcdctl command to restore a cluster from a snapshot backup: `ETCDCTL_API=3 etcdctl snapshot _____ snapshot.db`",
      "answer": "restore",
      "caseSensitive": false,
      "acceptedAnswers": ["restore"],
      "explanation": "The `etcdctl snapshot restore` command restores an etcd database from a backup file. While `snapshot save` creates the backup, `snapshot restore` is the recovery operation — after restoring, etcd must be restarted pointing to the new data directory. Together, save and restore form the critical backup/recovery workflow that protects against total cluster data loss.",
      "hint": "Think about the opposite of 'save'."
    },
    {
      "id": "kubernetes-control-plane-quiz-35",
      "type": "mcq",
      "question": "A developer creates a new namespace `dev-team`. Without any additional configuration, which component ensures a default service account is automatically available in that namespace?",
      "options": [
        "kube-api-server, which creates default resources when persisting a new namespace",
        "Service Account Controller in kube-controller-manager",
        "kubelet, which provisions the service account when the first pod is scheduled",
        "Namespace Controller, which manages all child resources within a namespace"
      ],
      "answer": 1,
      "explanation": "The Service Account Controller (part of kube-controller-manager) watches for new namespaces and automatically creates a `default` service account in each one. This is reconciliation loop behavior — the controller continuously ensures every namespace has a default SA. The API server handles validation and storage but does not create child resources; the Namespace Controller manages namespace lifecycle (cleanup on deletion), not resource provisioning within namespaces.",
      "hint": "Which component runs reconciliation loops to maintain desired state?"
    },
    {
      "id": "kubernetes-control-plane-quiz-36",
      "type": "mcq",
      "question": "Which sub-controller of the cloud-controller-manager configures network routes in cloud infrastructure so that pods on different nodes can communicate directly using their pod IPs?",
      "options": [
        "Service Controller",
        "Node Controller",
        "Route Controller",
        "Volume Controller"
      ],
      "answer": 2,
      "explanation": "The Route Controller sets up routes in the cloud provider's network so pod IPs are reachable across nodes — without these routes, pods on different nodes cannot communicate. This is distinct from the Service Controller (which creates cloud load balancers for LoadBalancer-type Services) and the Volume Controller (which handles persistent disk attach/detach). The Route Controller is the networking plumbing that makes the pod network function on cloud providers.",
      "hint": "Think about which controller manages network *paths* between nodes."
    },
    {
      "id": "kubernetes-control-plane-quiz-37",
      "type": "true-false",
      "question": "A pod is running on a node that matched its `requiredDuringSchedulingIgnoredDuringExecution` node affinity rule. If the node's matching label is later removed, the pod will be evicted.",
      "answer": false,
      "explanation": "False. The `IgnoredDuringExecution` suffix means the affinity rule is enforced only at scheduling time — once a pod is running, label changes on the node do NOT trigger eviction. The `required` part gates whether the pod can be initially scheduled, but confers no ongoing enforcement. If you need eviction when conditions change, you would use taints/tolerations with `NoExecute` effect instead, which do apply to running pods.",
      "hint": "Focus on the second half of the field name: 'IgnoredDuringExecution'."
    },
    {
      "id": "kubernetes-control-plane-quiz-38",
      "type": "mcq",
      "question": "A high-priority pod cannot be scheduled because no node has sufficient CPU. The scheduler finds one node where evicting two lower-priority pods would free enough resources. What does the scheduler do?",
      "options": [
        "Keeps the high-priority pod in Pending state until capacity is organically freed",
        "Evicts the lower-priority pods and schedules the high-priority pod on that node",
        "Reduces the resource requests of lower-priority pods to make room",
        "Migrates the lower-priority pods to other nodes, then schedules the high-priority pod"
      ],
      "answer": 1,
      "explanation": "Pod preemption: when a higher-priority pod cannot be scheduled, the scheduler can evict (delete) lower-priority pods to free resources. The evicted pods may reschedule elsewhere if capacity allows, but there is no guarantee — the scheduler does not first find a destination for them. This is why Priority Classes matter in production: a misconfigured high-priority workload can forcibly displace running pods across the cluster.",
      "hint": "Kubernetes has a mechanism specifically for this scenario called 'preemption'."
    },
    {
      "id": "kubernetes-control-plane-quiz-39",
      "type": "code-output",
      "question": "Given the etcd cluster status below, what state is the cluster in?",
      "code": "# 5-node etcd cluster status:\n# Node1: UP   ✅\n# Node2: DOWN ❌\n# Node3: DOWN ❌\n# Node4: DOWN ❌\n# Node5: UP   ✅\n\n# Quorum formula: (N/2) + 1\n# For 5 nodes: quorum = 3\n# Nodes currently available: 2",
      "language": "bash",
      "options": [
        "Fully operational — 2 out of 5 nodes is sufficient for a 5-node cluster",
        "Read-only — quorum is lost, writes are blocked but existing data is preserved",
        "Crashed — all data is lost and the cluster must be rebuilt from scratch",
        "Degraded but writable — the leader node handles writes alone"
      ],
      "answer": 1,
      "explanation": "With only 2 of 5 nodes available (below the required quorum of 3), the cluster loses quorum and becomes read-only. Raft intentionally blocks all writes rather than risk split-brain inconsistency — this is correct, safe behavior, not a crash. Existing data is fully preserved; unlike total data loss, quorum loss is recoverable by bringing nodes back online. The cluster resumes write operations automatically once quorum (≥3 nodes) is restored.",
      "hint": "Quorum requires (N/2)+1 nodes. Count how many are available versus required."
    },
    {
      "id": "kubernetes-control-plane-quiz-40",
      "type": "true-false",
      "question": "During the binding phase of pod scheduling, the kube-scheduler writes the pod's `nodeName` field directly to etcd.",
      "answer": false,
      "explanation": "False. The kube-scheduler never communicates directly with etcd. During binding, the scheduler sends a Binding API request to the kube-api-server, which then updates etcd. This enforces the invariant that only the API server has direct etcd access — bypassing it would skip authentication, authorization, and admission control. Every control plane component (scheduler, controller-manager) exclusively uses the API server as its gateway to read and write cluster state.",
      "hint": "Which is the *only* component allowed to talk to etcd directly?"
    },
    {
      "id": "kubernetes-control-plane-quiz-41",
      "type": "mcq",
      "question": "Both kube-controller-manager and cloud-controller-manager contain a component called 'Node Controller'. What distinguishes their specific responsibilities?",
      "options": [
        "kube-controller-manager's Node Controller handles cloud node deletion; cloud-controller-manager's Node Controller marks nodes as NotReady",
        "kube-controller-manager's Node Controller monitors node health and marks nodes as NotReady; cloud-controller-manager's Node Controller checks whether nodes still exist in the cloud provider",
        "kube-controller-manager's Node Controller applies to bare-metal only; cloud-controller-manager's Node Controller applies to cloud clusters only",
        "They perform identical functions — the cloud-controller-manager's version overrides the kube-controller-manager's when running on a cloud provider"
      ],
      "answer": 1,
      "explanation": "They share a name but have different scopes. The kube-controller-manager's Node Controller is cloud-agnostic: it monitors node heartbeats, updates node conditions, and marks nodes NotReady when they stop responding. The cloud-controller-manager's Node Controller is cloud-aware: it queries the cloud provider's API to confirm whether a VM instance still exists — if the cloud deleted the VM, it removes the Kubernetes Node object. Both run in parallel on cloud clusters, each handling their own responsibility.",
      "hint": "One tracks Kubernetes health signals; the other queries the cloud provider's API."
    }
  ]
}
{{< /quiz >}}
