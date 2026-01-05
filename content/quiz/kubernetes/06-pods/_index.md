---
title: Pods Quiz
linkTitle: Pods
type: docs
weight: 06
prev: /quiz/kubernetes/05-networking
next: /quiz/kubernetes/07-pod-lifecycle
---

{{< quiz id="kubernetes-pods-quiz" >}}
{
  "questions": [
    {
      "type": "mcq",
      "question": "What is the smallest and most basic deployable unit in Kubernetes?",
      "options": [
        "Container",
        "Pod",
        "Deployment",
        "Service"
      ],
      "answer": 1,
      "explanation": "A Pod is the smallest and most basic deployable unit in Kubernetes. It represents a single instance of a running process in your cluster and can contain one or more containers.",
      "hint": "Think about what wraps containers in Kubernetes."
    },
    {
      "type": "multiple-select",
      "question": "Which resources are shared by all containers within a Pod?",
      "options": [
        "Network namespace (IP address)",
        "Process ID namespace",
        "Volumes",
        "IPC namespace",
        "User namespace"
      ],
      "answers": [0, 2, 3],
      "explanation": "Containers in a Pod share the network namespace (same IP), volumes, and IPC namespace. Process namespace is optional. User namespace is typically not shared.",
      "hint": "Consider what allows containers to communicate via localhost and share files."
    },
    {
      "type": "true-false",
      "question": "Containers within the same Pod must use different ports to avoid conflicts.",
      "answer": true,
      "explanation": "Since all containers in a Pod share the same network namespace and IP address, they must use different ports to avoid port conflicts. For example, if nginx uses port 80, a metrics container must use a different port like 9090.",
      "hint": "Think about what happens when multiple processes share the same IP address."
    },
    {
      "type": "fill-blank",
      "question": "Containers in a Pod can communicate with each other using which hostname?",
      "answer": "localhost",
      "caseSensitive": false,
      "explanation": "Since containers in a Pod share the same network namespace, they can communicate with each other using `localhost`. For example, Container A can reach Container B at `localhost:port`.",
      "hint": "It's the same address you'd use to access services on your own machine."
    },
    {
      "type": "code-output",
      "question": "Given this Pod configuration, what will happen when you try to access the writer container's file from the reader container?",
      "code": "containers:\n- name: writer\n  image: busybox\n  command: [\"/bin/sh\", \"-c\", \"echo hello > /data/message.txt\"]\n  volumeMounts:\n  - name: shared-data\n    mountPath: /data\n\n- name: reader\n  image: busybox\n  command: [\"/bin/sh\", \"-c\", \"cat /data/message.txt\"]\n  volumeMounts:\n  - name: shared-data\n    mountPath: /data\n\nvolumes:\n- name: shared-data\n  emptyDir: {}",
      "language": "yaml",
      "options": [
        "The reader will successfully read \"hello\"",
        "The reader will get a file not found error",
        "Both containers will fail to start",
        "Only the writer can access the volume"
      ],
      "answer": 0,
      "explanation": "Both containers mount the same volume (`shared-data`) at `/data`. The writer creates the file, and the reader can access it because they share the same `emptyDir` volume. This is a common pattern for data sharing between containers in a Pod.",
      "hint": "Consider what `emptyDir` volumes are designed for."
    },
    {
      "type": "flashcard",
      "question": "What is the Sidecar Pattern?",
      "answer": "**Sidecar Pattern**\n\nA multi-container pod pattern where auxiliary containers enhance the primary container's functionality.\n\n**Common Use Cases:**\n- Log aggregation (Fluentd, Filebeat)\n- Service mesh proxies (Envoy, Istio)\n- Configuration reloaders\n- Monitoring agents\n\n**Key Characteristic:** The sidecar extends or enhances the main container without modifying its code."
    },
    {
      "type": "drag-drop",
      "question": "Arrange these container lifecycle events in the correct execution order:",
      "instruction": "Drag to arrange from first to last",
      "items": [
        "Init Container 1 starts",
        "Init Container 2 starts",
        "Init Container 1 completes",
        "Init Container 2 completes",
        "Application containers start"
      ],
      "correctOrder": [0, 2, 1, 3, 4],
      "explanation": "Init containers run sequentially (serially) before application containers. Each init container must complete successfully before the next one starts. Only after all init containers complete do the application containers start in parallel."
    },
    {
      "type": "code-completion",
      "question": "Complete the Pod manifest to make the log-aggregator a proper sidecar container (Kubernetes 1.28+):",
      "instruction": "Fill in the missing field and value",
      "codeTemplate": "spec:\n  initContainers:\n  - name: setup\n    image: busybox\n    command: ['sh', '-c', 'echo Setup complete']\n  \n  - name: log-aggregator\n    image: fluentd\n    _____: _____  # Makes it a sidecar\n  \n  containers:\n  - name: app\n    image: nginx",
      "answer": "restartPolicy: Always",
      "caseSensitive": false,
      "acceptedAnswers": ["restartPolicy: Always", "restartPolicy:Always"],
      "explanation": "In Kubernetes 1.28+, sidecar containers are defined in the `initContainers` section with `restartPolicy: Always`. This makes them start before app containers but continue running alongside them, unlike regular init containers which terminate after completion."
    },
    {
      "type": "mcq",
      "question": "What is the primary purpose of the Ambassador Pattern in multi-container Pods?",
      "options": [
        "To normalize output formats for monitoring",
        "To proxy connections to/from the main container",
        "To collect and aggregate logs",
        "To enhance security through encryption"
      ],
      "answer": 1,
      "explanation": "The Ambassador Pattern uses a sidecar container to proxy connections to/from the main container. Common uses include database connection pooling (pgbouncer), service mesh proxies (Envoy), and cloud service proxies. This simplifies the main application by offloading connection management.",
      "hint": "Think about what an ambassador does in diplomacy—they represent and facilitate communication."
    },
    {
      "type": "true-false",
      "question": "Init containers and application containers within the same Pod run in parallel.",
      "answer": false,
      "explanation": "Init containers run serially (one after another) and must all complete successfully before application containers start. Application containers then run in parallel. This sequential execution ensures that prerequisites are met before the main application starts.",
      "hint": "Consider the purpose of init containers—they prepare the environment."
    },
    {
      "type": "fill-blank",
      "question": "What type of volume is commonly used for sharing data between containers in a Pod when the data doesn't need to persist beyond the Pod's lifetime?",
      "answer": "emptyDir",
      "caseSensitive": false,
      "explanation": "An `emptyDir` volume is created when a Pod is assigned to a node and exists as long as the Pod runs. It's initially empty and is commonly used for sharing data between containers in a Pod. When the Pod is removed, the data in the emptyDir is deleted.",
      "hint": "The name describes its initial state."
    },
    {
      "type": "mcq",
      "question": "A Pod has two containers: nginx (port 80) and a metrics exporter (port 9090). If you want the metrics exporter to scrape nginx metrics, what address should it use?",
      "options": [
        "The Pod's IP address (e.g., 10.244.1.5:80)",
        "localhost:80",
        "nginx:80",
        "The Service name"
      ],
      "answer": 1,
      "explanation": "Containers within the same Pod share the same network namespace, so they can communicate using `localhost`. The metrics exporter would connect to `localhost:80` to access nginx.",
      "hint": "Remember that containers in a Pod share the network namespace."
    },
    {
      "type": "multiple-select",
      "question": "Which statements about Pod characteristics are correct?",
      "options": [
        "Pods are ephemeral and disposable",
        "Each Pod has its own unique IP address",
        "Containers within a Pod can be split across multiple nodes",
        "Pods are the atomic unit of deployment",
        "Pods can only contain one container"
      ],
      "answers": [0, 1, 3],
      "explanation": "Pods are ephemeral (disposable), have one IP address per Pod, and are atomic units (cannot be split across nodes). Pods commonly contain a single container but can have multiple containers. The atomic nature means all containers in a Pod must run on the same node.",
      "hint": "Think about what makes Pods the fundamental building block in Kubernetes."
    },
    {
      "type": "flashcard",
      "question": "What is the Adapter Pattern in multi-container Pods?",
      "answer": "**Adapter Pattern** (translates)\n\nA multi-container pattern where a sidecar container standardizes or normalizes the output/interface of the main container.\n\n**Example Use Case:**\nAn application produces custom metrics format → Adapter container converts to Prometheus format → Monitoring system scrapes standardized metrics\n\n**Why Use It:** Allows legacy or third-party applications to integrate with standardized systems without modifying the original application."
    },
    {
      "type": "code-output",
      "question": "What will be the result of this Pod configuration?",
      "code": "spec:\n  initContainers:\n  - name: check-db\n    image: busybox\n    command: ['sh', '-c', 'exit 1']  # Fails\n  \n  - name: setup-config\n    image: busybox\n    command: ['sh', '-c', 'echo config > /config/app.conf']\n  \n  containers:\n  - name: app\n    image: myapp",
      "language": "yaml",
      "options": [
        "All containers will run successfully",
        "The app container will start, but check-db will restart",
        "The Pod will fail and app container will never start",
        "Only setup-config and app will run"
      ],
      "answer": 2,
      "explanation": "Init containers run sequentially and must complete successfully. Since `check-db` exits with code 1 (failure), the Pod initialization fails. The second init container (`setup-config`) never runs, and the application container never starts. Kubernetes will retry based on the Pod's restart policy.",
      "hint": "What happens when a prerequisite check fails?"
    },
    {
      "type": "drag-drop",
      "question": "Arrange these multi-container patterns based on their primary purpose, from 'data transformation' to 'connection management':",
      "instruction": "Drag to arrange from data transformation to connection management",
      "items": [
        "Adapter Pattern",
        "Sidecar Pattern",
        "Ambassador Pattern"
      ],
      "correctOrder": [0, 1, 2],
      "explanation": "Adapter Pattern normalizes/transforms output (data transformation), Sidecar Pattern enhances functionality (general purpose, middle ground), and Ambassador Pattern proxies connections (connection management). Each serves a distinct architectural purpose."
    },
    {
      "type": "mcq",
      "question": "When should you use a multi-container Pod instead of separate Pods?",
      "options": [
        "When you want to scale containers independently",
        "When containers need to communicate frequently and share resources",
        "When containers are developed by different teams",
        "When you want to reduce resource usage"
      ],
      "answer": 1,
      "explanation": "Multi-container Pods should be used when containers must share data, communicate frequently via localhost, scale together, and be co-located on the same node. If containers need independent scaling or are loosely coupled, use separate Pods instead.",
      "hint": "Think about tight coupling vs. loose coupling."
    },
    {
      "type": "true-false",
      "question": "A Pod's IP address persists even if the Pod is rescheduled to a different node.",
      "answer": false,
      "explanation": "Pods are ephemeral, and their IP addresses are not persistent. When a Pod is deleted and recreated (even by a controller like Deployment), it gets a new IP address. This is why you use Services for stable networking.",
      "hint": "Consider what 'ephemeral' means for Pod lifecycle."
    },
    {
      "type": "code-completion",
      "question": "Complete the init container configuration to wait for the database service `db-service` on port `5432` to be ready before starting the application:",
      "instruction": "Fill in the missing command",
      "codeTemplate": "spec:\n  initContainers:\n  - name: wait-for-db\n    image: busybox:1.36\n    command: ['sh', '-c', '_____']\n  \n  containers:\n  - name: app\n    image: myapp",
      "answer": "until nc -z db-service 5432; do sleep 2; done",
      "caseSensitive": false,
      "acceptedAnswers": [
        "until nc -z db-service 5432; do sleep 2; done",
        "until nc -z db-service 5432; do sleep 2; done;",
        "until nc -z db-service 5432;do sleep 2;done"
      ],
      "explanation": "This command uses `nc -z` (netcat) to check if port 5432 on db-service is accepting connections. The `-z` flag performs a zero-I/O scan (just checks if port is open). This is more reliable than DNS checks like `nslookup` because it verifies the database port is actually ready to accept connections, not just that the service name resolves.",
      "hint": "Think about network connectivity testing commands that check if a specific port is open."
    },
    {
      "type": "fill-blank",
      "question": "What field distinguishes a sidecar container from a regular init container in Kubernetes 1.28+?",
      "answer": "restartPolicy",
      "caseSensitive": false,
      "acceptedAnswers": [
        "restartPolicy",
        "restartPolicy: Always",
        "restartPolicy:Always"
      ],
      "explanation": "In Kubernetes 1.28+, native sidecar containers are defined in the `initContainers` section with `restartPolicy: Always`. This tells Kubernetes to keep the container running alongside application containers, unlike regular init containers which terminate after completion.",
      "hint": "It's about how the container behaves after starting."
    },
    {
      "type": "mcq",
      "question": "In a production web service Pod with nginx, fluentd, and Istio proxy, what is the primary role of the Istio proxy?",
      "options": [
        "Collecting and shipping nginx logs",
        "Serving web traffic to external users",
        "Intercepting and managing all network traffic to/from the Pod",
        "Monitoring container health"
      ],
      "answer": 2,
      "explanation": "The Istio proxy (Envoy) intercepts all network traffic entering and leaving the Pod. It provides traffic management, security (mTLS), load balancing, and observability without modifying the nginx code. This is the Ambassador/Service Mesh pattern in action.",
      "hint": "Service mesh proxies control the network layer."
    },
    {
      "type": "multiple-select",
      "question": "What are valid use cases for init containers?",
      "options": [
        "Waiting for dependencies to become available",
        "Continuously collecting logs from the application",
        "Pre-populating data or configuration files",
        "Setting up file permissions before app starts",
        "Proxying traffic to external services"
      ],
      "answers": [0, 2, 3],
      "explanation": "Init containers are designed for one-time setup tasks that must complete before the application starts: waiting for dependencies, pre-populating data, setting permissions, etc. Continuous tasks like log collection and traffic proxying should use sidecar containers instead.",
      "hint": "Init containers complete and terminate—they're not for ongoing tasks."
    },
    {
      "type": "flashcard",
      "question": "Why can't containers within a Pod be split across different nodes?",
      "answer": "**Pods are Atomic Units**\n\nPods are the smallest schedulable unit in Kubernetes. All containers in a Pod must run on the same node because:\n\n1. **Shared namespaces and resources:** Containers share network namespace and local volumes, requiring co-location on a single node\n2. **Localhost communication:** Containers communicate over localhost using a shared IP address (only works within same node)\n3. **Scheduling semantics:** Kubernetes schedules Pods—not individual containers—ensuring tightly coupled containers are co-located\n\n**Result:** All containers in a Pod always run on the same node, enabling low-latency communication and shared resource access."
    },
    {
      "type": "true-false",
      "question": "The CNI (Container Network Interface) plugin is responsible for assigning IP addresses to Pods and creating the Pod network.",
      "answer": true,
      "explanation": "CNI plugins implement Pod networking in Kubernetes. They create a unified Pod network across nodes, assign IP addresses to Pods, and enable direct Pod-to-Pod communication without NAT. Examples include Calico, Flannel, and Cilium.",
      "hint": "Think about what creates the network layer for Pods."
    }
  ]
}
{{< /quiz >}}

