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
      "type": "mcq",
      "question": "What are the two main parts of a Kubernetes cluster?",
      "options": [
        "Control Plane & Worker Nodes",
        "Master & Slave",
        "API Server & kubelet",
        "etcd & Pods"
      ],
      "answer": 0,
      "explanation": "A Kubernetes cluster consists of two main parts: the **Control Plane** (the 'brain' that manages the cluster) and **Worker Nodes** (the 'muscle' that runs application workloads).",
      "hint": "Think about management vs execution layers."
    },
    {
      "type": "mcq",
      "question": "Which component is responsible for assigning pods to nodes?",
      "options": [
        "kube-controller-manager",
        "kube-scheduler",
        "kubelet",
        "kube-proxy"
      ],
      "answer": 1,
      "explanation": "The **kube-scheduler** is responsible for assigning pods to nodes. It watches for newly created pods that have no node assigned and selects a node for them to run on.",
      "hint": "The name gives away its primary function."
    },
    {
      "type": "true-false",
      "question": "The kubelet connects to the API server (not the reverse).",
      "answer": true,
      "explanation": "Correct! The kubelet on each worker node initiates and maintains a connection to the API server using a watch mechanism. The API server does not initiate connections to kubelets.",
      "hint": "Consider which direction the persistent connection is established."
    },
    {
      "type": "fill-blank",
      "question": "The _____ component stores all cluster data as a distributed key-value store.",
      "answer": "etcd",
      "caseSensitive": false,
      "explanation": "**etcd** is the distributed key-value store that stores all cluster data. It is the single source of truth for the cluster state.",
      "hint": "It's a four-letter word and acts as the cluster's database."
    },
    {
      "type": "mcq",
      "question": "Which namespace contains Kubernetes system components like CoreDNS and kube-proxy?",
      "options": [
        "default",
        "kube-system",
        "kube-public",
        "kube-node-lease"
      ],
      "answer": 1,
      "explanation": "The **kube-system** namespace contains Kubernetes system components including CoreDNS, kube-proxy, CNI plugins, and metrics-server.",
      "hint": "It has 'system' in the name."
    },
    {
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
      "explanation": "Control Plane components include: **kube-api-server**, **kube-scheduler**, **etcd**, and **kube-controller-manager**. The kubelet and kube-proxy are Worker Node components.",
      "hint": "Worker nodes run pods; control plane manages the cluster."
    },
    {
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
      "explanation": "Namespace-scoped resources include: **Pods**, **Services**, **Deployments**, and **Secrets**. Cluster-scoped resources include Nodes, PersistentVolumes, and StorageClasses.",
      "hint": "Think about resources that belong to specific teams or projects."
    },
    {
      "type": "true-false",
      "question": "In Kubernetes pod-to-pod communication, pods use NAT (Network Address Translation) to communicate.",
      "answer": false,
      "explanation": "False! Kubernetes uses **direct IP connectivity** without NAT. Each pod gets its own IP address and can communicate directly with any other pod using that IP, with the CNI plugin handling routing.",
      "hint": "Kubernetes networking follows a flat network model."
    },
    {
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
      "type": "fill-blank",
      "question": "For an etcd cluster with 3 nodes, the quorum formula (N/2) + 1 means it can tolerate _____ failure(s).",
      "answer": "1",
      "caseSensitive": false,
      "explanation": "With 3 nodes, the quorum is (3/2) + 1 = 2 nodes. This means the cluster can tolerate **1 failure** and still maintain quorum with 2 healthy nodes.",
      "hint": "Calculate: how many nodes remain if one fails? Is that enough for quorum?"
    },
    {
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
      "type": "drag-drop",
      "question": "Arrange these steps in the correct order when creating a Deployment:",
      "instruction": "Drag to arrange in the correct deployment creation workflow",
      "items": [
        "User submits deployment manifest",
        "kubectl sends to API Server",
        "API Server validates & stores in etcd",
        "Deployment Controller creates ReplicaSet",
        "Scheduler assigns Pods to Nodes",
        "kubelet starts containers"
      ],
      "correctOrder": [0, 1, 2, 3, 4, 5],
      "explanation": "The correct workflow is: User submits → kubectl sends to API Server → API Server validates & stores in etcd → Deployment Controller creates ReplicaSet → Scheduler assigns Pods to Nodes → kubelet starts containers."
    },
    {
      "type": "mcq",
      "question": "A pod in the 'app' namespace needs to connect to a service called 'postgres' in the 'database' namespace. Which DNS name should it use?",
      "options": [
        "postgres",
        "postgres.database",
        "postgres.database.svc.cluster.local",
        "database.postgres"
      ],
      "answer": 2,
      "explanation": "For cross-namespace service access, use the fully qualified DNS name: **service-name.namespace-name.svc.cluster.local**. In this case: `postgres.database.svc.cluster.local`. You can also use the short form `postgres.database`.",
      "hint": "Format: service-name.namespace.svc.cluster.local"
    },
    {
      "type": "true-false",
      "question": "Namespaces provide complete security boundaries and network isolation by default.",
      "answer": false,
      "explanation": "False! Namespaces are **NOT security boundaries** by default. They provide logical separation but not network isolation. Network policies are required for true isolation between namespaces.",
      "hint": "Think about what additional resources you need for network isolation."
    },
    {
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
      "explanation": "Use separate clusters for: **strict security requirements**, **different Kubernetes versions**, and **regulatory compliance**. Different teams and resource organization can be handled with namespaces.",
      "hint": "When do namespaces become insufficient?"
    },
    {
      "type": "code-completion",
      "question": "Complete this ResourceQuota to limit a namespace to 50 pods and 20Gi memory:",
      "instruction": "Fill in the missing field name",
      "codeTemplate": "apiVersion: v1\nkind: ResourceQuota\nmetadata:\n  name: compute-quota\nspec:\n  _____:\n    pods: \"50\"\n    requests.memory: 20Gi",
      "answer": "hard",
      "caseSensitive": false,
      "acceptedAnswers": ["hard"],
      "explanation": "The **hard** field in a ResourceQuota spec defines the maximum resource limits that can be consumed in a namespace."
    },
    {
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
      "type": "flashcard",
      "question": "What is the primary difference between stacked and external etcd deployment?",
      "answer": "**Stacked etcd** runs on the same nodes as control plane components, making it simpler but less resilient.\n\n**External etcd** uses a dedicated cluster separate from control plane nodes, providing better isolation and resilience but with more complexity to manage."
    },
    {
      "type": "true-false",
      "question": "In a production multi-node cluster, control plane nodes should run user workloads to maximize resource utilization.",
      "answer": false,
      "explanation": "False! In production, control plane nodes should **NOT run user workloads**. They should be dedicated to cluster management to ensure stability and isolation from worker node failures.",
      "hint": "Think about best practices for HA and stability."
    },
    {
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
      "type": "mcq",
      "question": "For high availability, you need an etcd cluster that can tolerate 2 failures. How many etcd nodes should you deploy?",
      "options": [
        "3",
        "4",
        "5",
        "7"
      ],
      "answer": 2,
      "explanation": "You need **5 nodes**. With 5 nodes, quorum is (5/2)+1 = 3. If 2 nodes fail, you still have 3 healthy nodes, which meets the quorum requirement.",
      "hint": "Use the formula: (N/2) + 1 for quorum. You need quorum even after 2 failures."
    },
    {
      "type": "multiple-select",
      "question": "Which components are REQUIRED for pod networking to function properly?",
      "options": [
        "CNI Plugin",
        "CoreDNS",
        "kube-proxy",
        "Ingress Controller",
        "Metrics Server"
      ],
      "answers": [0, 2],
      "explanation": "**CNI Plugin** (for pod networking) and **kube-proxy** (for service networking) are required. CoreDNS is highly recommended but technically optional. Ingress Controller and Metrics Server are optional add-ons.",
      "hint": "What's needed for basic pod-to-pod and service communication?"
    },
    {
      "type": "drag-drop",
      "question": "Arrange the communication flow when a user runs `kubectl get pods`:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "kubectl authenticates with API Server",
        "API Server queries etcd",
        "etcd returns pod data",
        "API Server sends response to kubectl",
        "User sees pod list"
      ],
      "correctOrder": [0, 1, 2, 3, 4],
      "explanation": "The flow is: kubectl authenticates → API Server queries etcd → etcd returns data → API Server responds → User sees results. All cluster operations flow through the API Server."
    },
    {
      "type": "fill-blank",
      "question": "The control plane component that handles cloud provider integration (like load balancers and storage) is called _____.",
      "answer": "cloud-controller-manager",
      "caseSensitive": false,
      "explanation": "The **cloud-controller-manager** is an optional component that integrates with cloud provider APIs to manage cloud-specific features like load balancers, storage volumes, and routes.",
      "hint": "It has 'cloud' and 'controller' in its name."
    },
    {
      "type": "true-false",
      "question": "When a worker node's kubelet fails, all pods running on that node immediately stop.",
      "answer": false,
      "explanation": "False! When kubelet fails, **pods keep running** because the container runtime continues to operate. However, the pods are no longer managed—kubelet won't restart failed containers or report status to the control plane.",
      "hint": "Think about the separation between container runtime and kubelet."
    },
    {
      "type": "mcq",
      "question": "Which component is described as the 'front-end for the control plane'?",
      "options": [
        "kube-scheduler",
        "kube-controller-manager",
        "kube-api-server",
        "etcd"
      ],
      "answer": 2,
      "explanation": "The **kube-api-server** is the front-end for the control plane. It exposes the Kubernetes API and handles all cluster operations—all communication goes through it.",
      "hint": "It's the component that all other components and users interact with."
    },
    {
      "type": "flashcard",
      "question": "What are the three key responsibilities of Worker Nodes?",
      "answer": "1. **Run pods** (application containers)\n2. **Monitor pod health** and report status\n3. **Provide networking** for pods and communicate with control plane\n\nWorker nodes execute workloads while the control plane makes decisions."
    },
    {
      "type": "mcq",
      "question": "What is the best practice for namespace usage in production?",
      "options": [
        "Use the 'default' namespace for all workloads",
        "Create one namespace per pod",
        "Avoid using 'default' namespace; create dedicated namespaces",
        "Use only 'kube-system' for production"
      ],
      "answer": 2,
      "explanation": "Best practice is to **avoid using the 'default' namespace for production workloads**. Instead, create dedicated namespaces for different environments (dev, staging, prod) or teams.",
      "hint": "Organization and separation are key in production."
    },
    {
      "type": "true-false",
      "question": "All cluster operations must go through the API server for authentication and authorization.",
      "answer": true,
      "explanation": "True! The API server is the **only entry point** for all cluster operations. Every request (from kubectl, components, or controllers) must go through the API server where authentication and authorization are enforced.",
      "hint": "Think about the centralized control pattern."
    },
    {
      "type": "fill-blank",
      "question": "The component on each worker node that maintains network rules for service routing is called _____.",
      "answer": "kube-proxy",
      "caseSensitive": false,
      "explanation": "**kube-proxy** is the network proxy that runs on each worker node. It maintains network rules for service routing and enables pod-to-service communication.",
      "hint": "It has 'proxy' in its name and handles networking."
    }
  ]
}
{{< /quiz >}}
