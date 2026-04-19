---
title: Cluster Architecture Quiz
linkTitle: Architecture
type: docs
weight: 2
prev: /quiz/kubernetes/01-introduction
next: /quiz/kubernetes/03-control-plane
---

{{< quiz id="kubernetes-architecture-quiz" >}}
{
  "questions": [
    {
      "id": "kubernetes-architecture-quiz-01",
      "type": "mcq",
      "question": "What are the two main parts of a Kubernetes cluster?",
      "options": [
        "Control Plane & Worker Nodes",
        "Master & Slave",
        "API Server & kubelet",
        "Nodes & Pods"
      ],
      "answer": 0,
      "explanation": "A Kubernetes cluster has two main parts: the **Control Plane** (the 'brain' that makes all scheduling and management decisions) and **Worker Nodes** (the 'muscle' that runs application containers). A common mistake is naming sub-components like API Server or kubelet — those exist *within* these two layers, not as the layers themselves.",
      "hint": "Think about management vs execution layers."
    },
    {
      "id": "kubernetes-architecture-quiz-02",
      "type": "mcq",
      "question": "Which component is responsible for assigning pods to nodes?",
      "options": [
        "kube-controller-manager",
        "kube-scheduler",
        "kubelet",
        "cloud-controller-manager"
      ],
      "answer": 1,
      "explanation": "The **kube-scheduler** watches for newly created pods with no assigned node and selects the best node based on resource availability, affinity rules, and other constraints. A common confusion: **kube-controller-manager** reconciles desired state to actual state (e.g., ensuring 3 replicas exist) but doesn't decide *where* to place pods — that's strictly the scheduler's job.",
      "hint": "The name gives away its primary function."
    },
    {
      "id": "kubernetes-architecture-quiz-03",
      "type": "true-false",
      "question": "The kubelet connects to the API server (not the reverse).",
      "answer": true,
      "explanation": "Correct! The kubelet on each worker node initiates and maintains a connection to the API server using a watch mechanism. The API server does not initiate connections to kubelets.",
      "hint": "Consider which direction the persistent connection is established."
    },
    {
      "id": "kubernetes-architecture-quiz-04",
      "type": "fill-blank",
      "question": "The _____ component stores all cluster data as a distributed key-value store.",
      "answer": "etcd",
      "caseSensitive": false,
      "explanation": "**etcd** is the single source of truth for all cluster state — every object (pods, services, configs, secrets) is persisted here, and nowhere else. This is why backing up etcd is critical for disaster recovery: if etcd is lost without a backup, the entire cluster state is unrecoverable.",
      "hint": "It's a four-letter word and acts as the cluster's database."
    },
    {
      "id": "kubernetes-architecture-quiz-05",
      "type": "mcq",
      "question": "Which namespace contains Kubernetes system components like CoreDNS and kube-proxy?",
      "options": [
        "default",
        "kube-system",
        "kube-public",
        "kube-node-lease"
      ],
      "answer": 1,
      "explanation": "**kube-system** is reserved for Kubernetes system components that must be present for the cluster to function. Keeping them in their own namespace prevents accidental modification by users. The **default** namespace is where resources land when no namespace is specified — it's intentionally kept separate from system components.",
      "hint": "It has 'system' in the name."
    },
    {
      "id": "kubernetes-architecture-quiz-06",
      "type": "multiple-select",
      "question": "Which of the following are Control Plane components?",
      "options": [
        "kube-api-server",
        "kubelet",
        "kube-scheduler",
        "kube-proxy",
        "etcd",
        "kube-controller-manager"
      ],
      "answers": [0, 2, 4, 5],
      "explanation": "**kube-api-server**, **kube-scheduler**, **etcd**, and **kube-controller-manager** run on control plane nodes. **kubelet** and **kube-proxy** run on every worker node — kubelet receives pod assignments and kube-proxy maintains service routing rules. A common mistake is placing kube-proxy in the control plane because 'proxy' sounds like infrastructure.",
      "hint": "Worker nodes run pods; control plane manages the cluster."
    },
    {
      "id": "kubernetes-architecture-quiz-07",
      "type": "multiple-select",
      "question": "Which resources are namespace-scoped (not cluster-scoped)?",
      "options": [
        "Pods",
        "Nodes",
        "Services",
        "PersistentVolumes",
        "Deployments",
        "StorageClasses",
        "Secrets"
      ],
      "answers": [0, 2, 4, 6],
      "explanation": "**Pods**, **Services**, **Deployments**, and **Secrets** are namespace-scoped — they belong to a team or environment's namespace. **Nodes**, **PersistentVolumes**, and **StorageClasses** are cluster-scoped because they represent physical infrastructure shared across all namespaces. The PV/PVC split is a classic trap: *PersistentVolumeClaims* are namespace-scoped, but the *PersistentVolumes* they bind to are cluster-scoped.",
      "hint": "Think about resources that belong to specific teams or projects."
    },
    {
      "id": "kubernetes-architecture-quiz-08",
      "type": "true-false",
      "question": "In Kubernetes pod-to-pod communication, pods use NAT (Network Address Translation) to communicate.",
      "answer": false,
      "explanation": "False! Kubernetes uses **direct IP connectivity** without NAT. Each pod gets its own IP address and can communicate directly with any other pod using that IP, with the CNI plugin handling routing.",
      "hint": "Kubernetes networking follows a flat network model."
    },
    {
      "id": "kubernetes-architecture-quiz-09",
      "type": "mcq",
      "question": "What happens when the kube-api-server fails in a cluster?",
      "options": [
        "All pods stop immediately",
        "No new changes possible, but workloads keep running",
        "All data is lost",
        "Worker nodes shut down"
      ],
      "answer": 1,
      "explanation": "When the API server fails, **no new changes are possible, but existing workloads keep running**. Running pods continue to operate because kubelet manages them independently, but you cannot make any cluster modifications.",
      "hint": "Think about the separation between control plane and data plane."
    },
    {
      "id": "kubernetes-architecture-quiz-10",
      "type": "fill-blank",
      "question": "For an etcd cluster with 3 nodes, the quorum formula (N/2) + 1 means it can tolerate _____ failure(s).",
      "answer": "1",
      "acceptedAnswers": ["1", "one"],
      "caseSensitive": false,
      "explanation": "With 3 nodes, the quorum is (3/2) + 1 = 2 nodes. This means the cluster can tolerate **1 failure** and still maintain quorum with 2 healthy nodes.",
      "hint": "Calculate: how many nodes remain if one fails? Is that enough for quorum?"
    },
    {
      "id": "kubernetes-architecture-quiz-11",
      "type": "mcq",
      "question": "What is the first status a namespace enters during deletion?",
      "options": [
        "Deleted",
        "Terminating",
        "Removing",
        "Finalizing"
      ],
      "answer": 1,
      "explanation": "When you delete a namespace, it first enters the **Terminating** status. During this phase, admission controllers prevent new resource creation, all resources are deleted, finalizers are processed, and finally the namespace is removed.",
      "hint": "It's similar to pod deletion status."
    },
    {
      "id": "kubernetes-architecture-quiz-12",
      "type": "drag-drop",
      "question": "Arrange these steps in the correct order when creating a Deployment:",
      "instruction": "Drag to arrange in the correct deployment creation workflow",
      "items": [
        "User submits deployment manifest",
        "kubectl sends to API Server",
        "API Server validates & stores in etcd",
        "Scheduler assigns Pods to Nodes",
        "Deployment Controller creates ReplicaSet",
        "kubelet starts containers"
      ],
      "correctOrder": [0, 1, 2, 4, 3, 5],
      "explanation": "The correct workflow is: User submits → kubectl sends to API Server → API Server validates & stores in etcd → Deployment Controller creates ReplicaSet → Scheduler assigns Pods to Nodes → kubelet starts containers. The **Deployment Controller must create the ReplicaSet (and the ReplicaSet Controller creates the Pod objects) before the Scheduler can act** — you can't schedule pods that don't exist yet as API objects."
    },
    {
      "id": "kubernetes-architecture-quiz-13",
      "type": "mcq",
      "question": "A pod in the 'app' namespace needs to connect to a service called 'postgres' in the 'database' namespace. What is the **fully qualified DNS name** (FQDN) it should use?",
      "options": [
        "postgres",
        "postgres.database",
        "postgres.database.svc.cluster.local",
        "database.postgres"
      ],
      "answer": 2,
      "explanation": "The **fully qualified DNS name** format is `<service-name>.<namespace>.svc.cluster.local`. In this case: `postgres.database.svc.cluster.local`. The shorter `postgres.database` also works for cross-namespace access, but the FQDN is preferred in production configs because it's explicit and works regardless of DNS search domain configuration.",
      "hint": "Format: `<service-name>.<namespace-name>.svc.cluster.local`"
    },
    {
      "id": "kubernetes-architecture-quiz-14",
      "type": "true-false",
      "question": "Namespaces provide complete security boundaries and network isolation by default.",
      "answer": false,
      "explanation": "False! Namespaces are **NOT security boundaries** by default. They provide logical separation but not network isolation. Network policies are required for true isolation between namespaces.",
      "hint": "Think about what additional resources you need for network isolation."
    },
    {
      "id": "kubernetes-architecture-quiz-15",
      "type": "multiple-select",
      "question": "Which of the following are valid reasons to use separate clusters instead of namespaces?",
      "options": [
        "Different teams working on projects",
        "Strict security requirements",
        "Different Kubernetes versions needed",
        "Resource organization",
        "Regulatory compliance requirements"
      ],
      "answers": [1, 2, 4],
      "explanation": "Use separate clusters for **strict security requirements** (namespaces share nodes and network — they are not real isolation boundaries), **different Kubernetes versions** (impossible within a single cluster), and **regulatory compliance** (may require physical infrastructure separation). Different teams and resource organization are exactly what namespaces are designed for — creating separate clusters for these would waste resources and add operational overhead.",
      "hint": "When do namespaces become insufficient?"
    },
    {
      "id": "kubernetes-architecture-quiz-16",
      "type": "code-completion",
      "question": "Complete this ResourceQuota to limit a namespace to 50 pods and 20Gi memory:",
      "instruction": "Fill in the missing field name",
      "codeTemplate": "apiVersion: v1\nkind: ResourceQuota\nmetadata:\n  name: compute-quota\nspec:\n  _____:\n    pods: \"50\"\n    requests.memory: 20Gi",
      "answer": "hard",
      "caseSensitive": false,
      "acceptedAnswers": ["hard"],
      "explanation": "The **hard** field sets absolute maximum limits — any request that would exceed a hard limit is immediately rejected by the admission controller. There is no 'soft' limit in ResourceQuota; the name reflects that these limits are enforced without exception. Compare this to LimitRange, which sets per-container defaults and bounds rather than per-namespace totals."
    },
    {
      "id": "kubernetes-architecture-quiz-17",
      "type": "mcq",
      "question": "Your namespace deletion is stuck in 'Terminating' status. What is the MOST likely cause?",
      "options": [
        "Network connectivity issues",
        "Resources with finalizers",
        "Insufficient permissions",
        "etcd is full"
      ],
      "answer": 1,
      "explanation": "The most common cause of stuck namespace deletion is **resources with finalizers** that haven't been properly cleaned up. Other causes include unavailable API services or custom resources without proper cleanup.",
      "hint": "What prevents Kubernetes from completing the deletion process?"
    },
    {
      "id": "kubernetes-architecture-quiz-18",
      "type": "flashcard",
      "question": "What is the primary difference between stacked and external etcd deployment?",
      "answer": "**Stacked etcd** (common default): etcd runs on the same nodes as control plane components\n- Simpler setup and operations\n- Fewer machines required\n- Less resilient: a node failure takes down both control plane components *and* etcd together\n\n**External etcd** (better HA): dedicated etcd cluster separate from control plane nodes\n- Control plane failures don't affect etcd data\n- Independent scaling of each tier\n- More complex to manage and more machines required"
    },
    {
      "id": "kubernetes-architecture-quiz-19",
      "type": "true-false",
      "question": "In a production multi-node cluster, control plane nodes should run user workloads to maximize resource utilization.",
      "answer": false,
      "explanation": "False! In production, control plane nodes should **NOT run user workloads**. They should be dedicated to cluster management to ensure stability and isolation from worker node failures.",
      "hint": "Think about best practices for HA and stability."
    },
    {
      "id": "kubernetes-architecture-quiz-20",
      "type": "code-output",
      "question": "A LimitRange is configured in the 'dev' namespace with a maximum container CPU of 2. A user tries to create a pod requesting 3 CPUs. What happens?",
      "code": "apiVersion: v1\nkind: LimitRange\nmetadata:\n  name: limits\n  namespace: dev\nspec:\n  limits:\n  - type: Container\n    max:\n      cpu: 2\n      memory: 2Gi",
      "language": "yaml",
      "options": [
        "Pod is created successfully",
        "Pod creation is rejected",
        "Pod runs with 2 CPUs automatically",
        "Warning shown but pod created"
      ],
      "answer": 1,
      "explanation": "**Pod creation is rejected**. When a pod requests resources exceeding the LimitRange maximum, the admission controller rejects the request before the pod is created.",
      "hint": "LimitRange is enforced at admission time."
    },
    {
      "id": "kubernetes-architecture-quiz-21",
      "type": "mcq",
      "question": "For high availability, you need an etcd cluster that can tolerate 2 failures. How many etcd nodes should you deploy?",
      "options": [
        "3",
        "4",
        "5",
        "6"
      ],
      "answer": 2,
      "explanation": "You need **5 nodes**. With 5 nodes, quorum is (5/2)+1 = 3. If 2 nodes fail, you still have 3 healthy nodes, which meets the quorum requirement.",
      "hint": "Use the formula: (N/2) + 1 for quorum. You need quorum even after 2 failures."
    },
    {
      "id": "kubernetes-architecture-quiz-22",
      "type": "multiple-select",
      "question": "Which components are REQUIRED for pod networking to function properly?",
      "options": [
        "CNI Plugin",
        "CoreDNS",
        "kube-proxy",
        "Ingress Controller",
        "Network Policy Controller"
      ],
      "answers": [0, 2],
      "explanation": "**CNI Plugin** (provides pod IP addresses and routing) and **kube-proxy** (maintains iptables/ipvs rules for Service routing) are required. **CoreDNS** is highly recommended for service discovery but pods can technically communicate by IP without it. **Ingress Controller** is only needed for HTTP/HTTPS routing rules. **Network Policy Controller** enforces network policies but pods route traffic fine without one — policies just won't be enforced.",
      "hint": "What's needed for basic pod-to-pod and service communication?"
    },
    {
      "id": "kubernetes-architecture-quiz-23",
      "type": "drag-drop",
      "question": "Arrange the communication flow when a user runs `kubectl get pods`:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "kubectl authenticates with API Server",
        "API Server sends response to kubectl",
        "API Server queries etcd",
        "etcd returns pod data",
        "User sees pod list"
      ],
      "correctOrder": [0, 2, 3, 1, 4],
      "explanation": "The flow is: kubectl authenticates → API Server queries etcd → etcd returns data → API Server sends response → User sees results. **Authentication happens first** because the API server rejects any request before verifying identity. Every read operation goes through etcd via the API server — there is no in-memory cache in the standard control path, which is why API server latency scales directly with etcd performance."
    },
    {
      "id": "kubernetes-architecture-quiz-24",
      "type": "fill-blank",
      "question": "The control plane component that handles cloud provider integration (like load balancers and storage) is called _____.",
      "answer": "cloud-controller-manager",
      "caseSensitive": false,
      "explanation": "The **cloud-controller-manager** decouples cloud-specific logic from core Kubernetes, allowing each cloud provider to implement their own controllers without patching the core codebase. It manages cloud resources like load balancers (for Services of type LoadBalancer), storage volumes, and routes — things that differ across AWS, GCP, and Azure. It is **optional** in on-premises clusters that have no cloud integrations.",
      "hint": "It has 'cloud' and 'controller' in its name."
    },
    {
      "id": "kubernetes-architecture-quiz-25",
      "type": "true-false",
      "question": "When a worker node's kubelet fails, all pods running on that node immediately stop.",
      "answer": false,
      "explanation": "False! When kubelet fails, **pods keep running** because the container runtime continues to operate. However, the pods are no longer managed—kubelet won't restart failed containers or report status to the control plane.",
      "hint": "Think about the separation between container runtime and kubelet."
    },
    {
      "id": "kubernetes-architecture-quiz-26",
      "type": "fill-blank",
      "question": "The _____ is the 'front-end for the control plane' that all other components and users must communicate through.",
      "answer": "kube-api-server",
      "caseSensitive": false,
      "acceptedAnswers": ["kube-api-server", "api-server", "api server", "kube-apiserver"],
      "explanation": "The **kube-api-server** is the sole entry point for all cluster operations. Every request — from kubectl, from internal controllers, from kubelets — is authenticated, authorized, and processed through the API server before being committed to etcd. No component reads from or writes to etcd directly.",
      "hint": "It's the component that all other components and users interact with."
    },
    {
      "id": "kubernetes-architecture-quiz-27",
      "type": "flashcard",
      "question": "What are the three key responsibilities of Worker Nodes?",
      "answer": "1. **Run pods** (application containers)\n2. **Monitor pod health** and report status\n3. **Provide networking** for pods and communicate with control plane\n\nWorker nodes execute workloads while the control plane makes decisions."
    },
    {
      "id": "kubernetes-architecture-quiz-28",
      "type": "mcq",
      "question": "What is the best practice for namespace usage in production?",
      "options": [
        "Use the 'default' namespace for all workloads",
        "Create one namespace per pod",
        "Avoid using 'default' namespace; create dedicated namespaces",
        "Use only 'kube-system' for production"
      ],
      "answer": 2,
      "explanation": "Using the **default** namespace in production is an anti-pattern: there is no access control isolation (any user can see and modify all resources), no resource quotas scoped to a team, and `kubectl get pods` returns all pods making operational visibility poor. Dedicated namespaces let you apply RBAC, ResourceQuotas, and LimitRanges per team or environment.",
      "hint": "Organization and separation are key in production."
    },
    {
      "id": "kubernetes-architecture-quiz-29",
      "type": "true-false",
      "question": "All cluster operations must go through the API server for authentication and authorization.",
      "answer": true,
      "explanation": "True! The API server is the **only entry point** for all cluster operations. Every request (from kubectl, components, or controllers) must go through the API server where authentication and authorization are enforced.",
      "hint": "Think about the centralized control pattern."
    },
    {
      "id": "kubernetes-architecture-quiz-30",
      "type": "fill-blank",
      "question": "The component on each worker node that maintains network rules for service routing is called _____.",
      "answer": "kube-proxy",
      "caseSensitive": false,
      "explanation": "**kube-proxy** implements Kubernetes Service abstraction on each node. When you create a Service, kube-proxy watches the API server for endpoint changes and updates iptables or ipvs rules so traffic to a Service's ClusterIP is routed to healthy pods. If kube-proxy fails on a node, new services and endpoint changes stop taking effect on that node — existing connections may persist until they break, but no new routing updates are applied.",
      "hint": "It has 'proxy' in its name and handles networking."
    },
    {
      "id": "kubernetes-architecture-quiz-31",
      "type": "mcq",
      "question": "What happens when kube-scheduler fails in a Kubernetes cluster?",
      "options": [
        "All running pods stop immediately",
        "New pods remain in Pending state, but running pods continue normally",
        "No new cluster changes are possible, but workloads keep running",
        "Failed pods are not replaced and self-healing stops"
      ],
      "answer": 1,
      "explanation": "When kube-scheduler fails, **existing pods keep running** unaffected — the scheduler does not manage running pods, only assigns new ones to nodes. New pods get created as API objects but remain in **Pending** state indefinitely because no component is available to assign them a node. Common mix-up: 'No new changes possible' describes **kube-api-server** failure; 'self-healing stops' describes **kube-controller-manager** failure. The scheduler only handles placement, not detection of failures.",
      "hint": "The scheduler's only job is assigning pods to nodes — it doesn't control what's already running."
    },
    {
      "id": "kubernetes-architecture-quiz-32",
      "type": "mcq",
      "question": "A Deployment is running 3 replicas. Two pods crash, but no replacement pods are created — not even in Pending state. Which component has most likely failed?",
      "options": [
        "kube-scheduler",
        "kube-controller-manager",
        "kubelet",
        "kube-proxy"
      ],
      "answer": 1,
      "explanation": "The **kube-controller-manager** hosts the ReplicaSet controller, which detects discrepancies between desired state (3 replicas) and actual state (1 running) and creates new pod objects. If no pod objects are being created at all (not even in Pending), the controller-manager has failed. **kube-scheduler** failure would leave new pods stuck in Pending — the pods would at least exist as API objects. **kubelet** failure affects only one node and would not prevent cluster-wide pod replacement. **kube-proxy** only handles service routing rules.",
      "hint": "What component detects that fewer replicas exist than desired and creates new pod objects to compensate?"
    },
    {
      "id": "kubernetes-architecture-quiz-33",
      "type": "code-completion",
      "question": "Complete the LimitRange to set the default CPU limit applied to containers when no resource limits are specified:",
      "instruction": "Fill in the missing field name",
      "codeTemplate": "spec:\n  limits:\n  - type: Container\n    _____:\n      cpu: 500m\n      memory: 512Mi\n    defaultRequest:\n      cpu: 100m\n      memory: 128Mi",
      "answer": "default",
      "caseSensitive": false,
      "acceptedAnswers": ["default"],
      "explanation": "The **default** field sets the **limits** automatically applied to a container when none are specified. The **defaultRequest** field sets the **requests** applied when none are specified. These are commonly confused: `default` → limits; `defaultRequest` → requests. If neither is set and a ResourceQuota enforces limits, a pod without explicit limits is rejected. The `max` and `min` fields are bounds — they reject pods outside the allowed range rather than applying defaults."
    },
    {
      "id": "kubernetes-architecture-quiz-34",
      "type": "true-false",
      "question": "The kube-public namespace is readable only by authenticated users.",
      "answer": false,
      "explanation": "False! **kube-public** is intentionally readable by **all users, including unauthenticated ones**. Its purpose is to expose cluster information that needs to be publicly accessible — typically a ConfigMap with cluster metadata used during cluster bootstrapping. The name 'public' is the giveaway. This is a security consideration: never store sensitive data in kube-public. Both **kube-system** (system components) and **kube-node-lease** (heartbeat objects) require authentication.",
      "hint": "The name of the namespace describes its access policy."
    },
    {
      "id": "kubernetes-architecture-quiz-35",
      "type": "fill-blank",
      "question": "The _____ namespace contains Lease objects that worker nodes use to report heartbeats to the control plane.",
      "answer": "kube-node-lease",
      "caseSensitive": false,
      "acceptedAnswers": ["kube-node-lease"],
      "explanation": "**kube-node-lease** holds a Lease object for each node. The kubelet renews its node's Lease on each heartbeat cycle. The control plane uses lease expiry to detect node health — a missed renewal triggers the node condition to change to NotReady. This dedicated namespace was introduced to reduce API server load: before Lease objects existed, kubelet heartbeats required updating the Node object directly, which caused write contention under high node counts.",
      "hint": "The namespace name combines 'kube' with the purpose: tracking node leases."
    },
    {
      "id": "kubernetes-architecture-quiz-36",
      "type": "mcq",
      "question": "A worker node's container runtime (containerd) crashes. What is the IMMEDIATE impact on that node?",
      "options": [
        "All existing containers stop immediately",
        "Existing containers keep running, but new containers cannot start",
        "kubelet automatically restarts containerd and resumes normal operation",
        "The node is immediately marked NotReady and all pods are evicted"
      ],
      "answer": 1,
      "explanation": "**Existing containers keep running** because containerd uses a per-container shim process (`containerd-shim`) that is independent from the main containerd daemon. Running containers are owned by these shim processes, not containerd itself, so they survive a containerd crash. **New containers cannot start** because container creation requires the runtime daemon. The node is eventually marked NotReady as kubelet loses its ability to report status, but this is not immediate — it happens after the heartbeat timeout expires.",
      "hint": "Think about what actually owns the running container process vs what manages container lifecycle."
    },
    {
      "id": "kubernetes-architecture-quiz-37",
      "type": "fill-blank",
      "question": "In a highly available Kubernetes control plane with 3 API server instances, a _____ is required in front of them so that kubectl and other components use a single stable endpoint.",
      "answer": "load balancer",
      "caseSensitive": false,
      "acceptedAnswers": ["load balancer", "load-balancer", "loadbalancer"],
      "explanation": "A **load balancer** sits in front of multiple API server instances in an HA control plane. Without it, clients (kubectl, kubelets, controllers) would be hardcoded to a single API server — defeating the purpose of running multiple instances. The load balancer provides one stable endpoint while distributing traffic and routing around failed instances. In cloud environments this is typically a cloud load balancer (ELB, GCP LB); on-premises setups often use HAProxy or keepalived.",
      "hint": "What distributes traffic across multiple servers and provides a single stable endpoint?"
    },
    {
      "id": "kubernetes-architecture-quiz-38",
      "type": "true-false",
      "question": "A ClusterRole can only be bound at the cluster scope — it cannot grant permissions within a specific namespace.",
      "answer": false,
      "explanation": "False! A **ClusterRole can be bound within a namespace** by pairing it with a **RoleBinding** (not a ClusterRoleBinding). When a RoleBinding references a ClusterRole, it grants those permissions only within the RoleBinding's namespace. This is useful for defining standard permission templates once (e.g., a 'pod-reader' ClusterRole) and reusing them across namespaces without duplicating Role objects. The scope of the permission grant is determined by the **Binding type**: ClusterRoleBinding = cluster-wide, RoleBinding = namespace-scoped, regardless of whether the role is a Role or ClusterRole.",
      "hint": "The binding type — RoleBinding vs ClusterRoleBinding — determines the scope, not the role type itself."
    },
    {
      "id": "kubernetes-architecture-quiz-39",
      "type": "mcq",
      "question": "You configure a HorizontalPodAutoscaler (HPA) targeting CPU utilization, but pods never scale. No errors are visible in the Deployment. Which missing add-on is the most likely cause?",
      "options": [
        "CoreDNS",
        "Ingress Controller",
        "Metrics Server",
        "Network Policy Controller"
      ],
      "answer": 2,
      "explanation": "**Metrics Server** provides the resource metrics API that HPA queries to read current CPU and memory utilization. Without it, the HPA controller cannot retrieve utilization data and silently fails to scale — the HPA status shows 'unable to get metrics' but no Deployment error appears. **CoreDNS** enables service discovery but does not supply resource metrics. **Ingress Controller** handles HTTP routing. **Network Policy Controller** enforces traffic rules. Metrics Server is frequently overlooked because it is not installed by default in many Kubernetes distributions.",
      "hint": "HPA needs to read live CPU/memory usage — what add-on component provides that data?"
    }
  ]
}
{{< /quiz >}}
