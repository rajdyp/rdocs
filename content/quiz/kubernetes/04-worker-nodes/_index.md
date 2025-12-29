---
title: Worker Node Components Quiz
linkTitle: Worker Nodes
type: docs
weight: 04
prev: /quiz/kubernetes/03-control-plane
next: /quiz/kubernetes/05-networking
---

{{< quiz id="kubernetes-worker-nodes-quiz" >}}
{
  "questions": [
    {
      "type": "mcq",
      "question": "What is the primary role of kubelet in a Kubernetes worker node?",
      "options": [
        "It routes network traffic between services and pods",
        "It manages pod lifecycle and ensures containers are running as specified",
        "It stores container images and manages image pulls",
        "It creates iptables rules for service routing"
      ],
      "answer": 1,
      "explanation": "kubelet is the node-level agent responsible for managing pod lifecycle—ensuring containers are running and healthy according to pod specifications received from the API server.",
      "hint": "Think about which component directly interacts with containers on the node."
    },
    {
      "type": "multiple-select",
      "question": "Which of the following are direct responsibilities of kubelet?",
      "options": [
        "Executing health probes (liveness, readiness, startup)",
        "Creating iptables rules for service load balancing",
        "Enforcing resource limits via cgroups",
        "Mounting volumes for pods",
        "Distributing traffic across backend pods"
      ],
      "answers": [0, 2, 3],
      "explanation": "kubelet handles health probes, enforces resource limits through cgroups, and mounts volumes. Creating iptables rules and distributing traffic are kube-proxy responsibilities.",
      "hint": "Focus on pod-level operations rather than cluster-wide networking."
    },
    {
      "type": "true-false",
      "question": "The Service object in Kubernetes directly routes traffic from the Service IP to pod IPs.",
      "answer": false,
      "explanation": "This is a common misconception. Service objects are just configuration stored in etcd. kube-proxy reads Service configuration and creates iptables/IPVS rules, and the Linux kernel applies these rules to route traffic. Services themselves never touch packets.",
      "hint": "Think about what happens at the kernel level when packets arrive."
    },
    {
      "type": "code-output",
      "question": "A pod has the following resource configuration. What happens when the container tries to use 600Mi of memory?",
      "code": "resources:\n  requests:\n    memory: 128Mi\n  limits:\n    memory: 512Mi",
      "language": "yaml",
      "options": [
        "The container continues running normally",
        "The container is throttled but continues running",
        "The container is killed (OOMKilled)",
        "kubelet logs a warning but takes no action"
      ],
      "answer": 2,
      "explanation": "When a container exceeds its memory limit (512Mi in this case), kubelet kills the container with an OOMKilled status. Memory limits are hard limits enforced via cgroups, unlike CPU which is throttled.",
      "hint": "Memory and CPU limits are handled differently—one is throttled, one is killed."
    },
    {
      "type": "fill-blank",
      "question": "kubelet uses _____ (control groups) to enforce resource requests and limits on containers.",
      "answer": "cgroups",
      "caseSensitive": false,
      "explanation": "cgroups (control groups) is a Linux kernel feature that kubelet uses to limit and monitor resource usage (CPU, memory) of containers.",
      "hint": "It's a Linux kernel feature abbreviated as a single word."
    },
    {
      "type": "drag-drop",
      "question": "Arrange the pod startup flow in the correct sequence:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Scheduler assigns Pod to Worker Node",
        "kubelet calls Container Runtime to pull image and start container",
        "kubelet calls CNI plugin to setup networking",
        "kube-proxy updates iptables/IPVS rules",
        "kubelet starts health probes"
      ],
      "correctOrder": [0, 2, 1, 4, 3],
      "explanation": "The sequence is: 1) Scheduler assigns pod → 2) kubelet detects assignment → 3) CNI creates network namespace and assigns IP → 4) Runtime pulls image and starts container → 5) kubelet starts health probes → 6) Status reported to API server → 7) Endpoints updated → 8) kube-proxy updates rules."
    },
    {
      "type": "mcq",
      "question": "What happens when a pod's readiness probe fails?",
      "options": [
        "The container is immediately restarted",
        "The pod is removed from service endpoints (stops receiving traffic)",
        "The pod is evicted from the node",
        "kubelet marks the node as NotReady"
      ],
      "answer": 1,
      "explanation": "When a readiness probe fails, kubelet removes the pod from service endpoints so it stops receiving traffic, but the container continues running. Liveness probe failures trigger container restarts.",
      "hint": "Consider what 'ready' means in the context of receiving traffic."
    },
    {
      "type": "flashcard",
      "question": "What is the Container Runtime Interface (CRI)?",
      "answer": "**Container Runtime Interface (CRI)**\n\nA standardized gRPC API that allows Kubernetes (specifically kubelet) to work with different container runtimes (containerd, CRI-O, etc.) without being tied to a specific implementation. It abstracts image management, container lifecycle, and execution operations."
    },
    {
      "type": "code-completion",
      "question": "Complete the health probe configuration to check if a container is alive:",
      "instruction": "Fill in the probe type",
      "codeTemplate": "_____Probe:\n  httpGet:\n    path: /healthz\n    port: 8080\n  initialDelaySeconds: 30\n  periodSeconds: 10",
      "answer": "liveness",
      "caseSensitive": false,
      "acceptedAnswers": ["liveness"],
      "explanation": "livenessProbe checks if a container is alive. If it fails, kubelet restarts the container. This is different from readinessProbe (can accept traffic?) and startupProbe (has finished starting?)."
    },
    {
      "type": "multiple-select",
      "question": "In the traffic routing flow, which components actually process or modify network packets?",
      "options": [
        "Service object",
        "iptables/IPVS rules in the kernel",
        "kube-proxy process",
        "CNI plugin",
        "Endpoints object"
      ],
      "answers": [1, 3],
      "explanation": "Only iptables/IPVS rules (in the Linux kernel) and CNI plugins actually process packets. Service and Endpoints are just configuration objects in etcd, and kube-proxy creates rules but doesn't process packets itself.",
      "hint": "Think about what operates at the kernel/network layer versus what's stored in etcd."
    },
    {
      "type": "mcq",
      "question": "When kube-proxy operates in iptables mode and a client sends a request to a Service ClusterIP (10.96.100.50), what happens at the network level?",
      "options": [
        "The packet is forwarded to the Service object which then routes it to a pod",
        "kube-proxy intercepts the packet and forwards it to a backend pod",
        "The kernel's netfilter applies iptables rules that rewrite the destination to a pod IP (DNAT)",
        "The CNI plugin routes the packet through the overlay network to the service"
      ],
      "answer": 2,
      "explanation": "The packet reaches the node's network stack where the kernel's netfilter intercepts it. iptables rules (created by kube-proxy) match the Service ClusterIP and perform DNAT (Destination NAT) to rewrite the destination to a real pod IP. Neither the Service object nor kube-proxy process touches the packet.",
      "hint": "Focus on what happens at the kernel level with the rules that were pre-configured."
    },
    {
      "type": "true-false",
      "question": "When kubelet enforces CPU limits on a container, the container is killed if it exceeds the limit.",
      "answer": false,
      "explanation": "CPU limits are enforced by throttling, not killing. When a container reaches its CPU limit, it's throttled (slowed down) but continues running. Only memory limit violations result in the container being killed (OOMKilled).",
      "hint": "Think about the difference between how CPU and memory limits are enforced."
    },
    {
      "type": "mcq",
      "question": "During pod eviction due to node resource pressure, in what order does kubelet evict pods?",
      "options": [
        "Guaranteed → Burstable → BestEffort",
        "BestEffort → Burstable → Guaranteed",
        "Randomly based on pod age",
        "Based on pod priority class only"
      ],
      "answer": 1,
      "explanation": "kubelet evicts pods in order of QoS class: BestEffort first (no requests/limits), then Burstable (requests < limits), and finally Guaranteed (requests = limits). This protects workloads with stronger resource guarantees.",
      "hint": "Think about which pods have the least resource guarantees."
    },
    {
      "type": "flashcard",
      "question": "Why is the Service ClusterIP called a 'virtual IP'?",
      "answer": "**Virtual IP (VIP)**\n\nThe Service ClusterIP doesn't exist on any network interface in the cluster. It's not assigned to any device. Instead, it's a placeholder IP that kube-proxy uses to create iptables/IPVS rules. When packets are sent to this IP, kernel rules intercept and rewrite them to real pod IPs. The ClusterIP exists only in routing rules, not as an actual network address."
    },
    {
      "type": "multiple-select",
      "question": "Which of the following statements correctly describe kube-proxy's role?",
      "options": [
        "It watches the API server for Service and Endpoint changes",
        "It receives network packets destined for Service IPs and forwards them",
        "It creates and maintains iptables or IPVS rules on the node",
        "It performs load balancing by round-robin forwarding packets to pods",
        "It translates Service configuration into actual network rules"
      ],
      "answers": [0, 2, 4],
      "explanation": "kube-proxy watches for changes, creates network rules, and translates Service config into rules. However, it does NOT receive or forward packets itself—the kernel applies the rules it creates. Load balancing happens via kernel rules, not a proxy process.",
      "hint": "kube-proxy is a 'rule creator', not a 'packet processor'."
    },
    {
      "type": "code-output",
      "question": "A node stops sending heartbeats to the API server. How long until the node is marked as NotReady?",
      "code": "# Default Kubernetes node monitoring settings\nnode-monitor-period: 5s\nnode-monitor-grace-period: 40s\npod-eviction-timeout: 5m",
      "language": "yaml",
      "options": [
        "5 seconds",
        "40 seconds",
        "5 minutes",
        "Immediately"
      ],
      "answer": 1,
      "explanation": "The node is marked NotReady after the node-monitor-grace-period (default ~40 seconds) of missing heartbeats. Pod eviction happens later, after the pod-eviction-timeout (~5 minutes).",
      "hint": "Look at the grace period specifically for node monitoring."
    },
    {
      "type": "mcq",
      "question": "What is the primary advantage of kube-proxy's IPVS mode over iptables mode?",
      "options": [
        "IPVS works on older kernel versions",
        "IPVS provides O(1) lookup time and better performance at scale",
        "IPVS is simpler to configure and debug",
        "IPVS supports more service types"
      ],
      "answer": 1,
      "explanation": "IPVS mode offers O(1) lookup time (vs O(n) for iptables), better performance with many services, and advanced load balancing algorithms (round-robin, least connection, etc.). However, it requires kernel modules and is more complex.",
      "hint": "Think about algorithmic complexity and scale."
    },
    {
      "type": "fill-blank",
      "question": "kubelet communicates with the container runtime through the _____ (three-letter acronym) interface.",
      "answer": "CRI",
      "caseSensitive": false,
      "explanation": "CRI (Container Runtime Interface) is the standardized gRPC API that allows kubelet to work with different container runtimes like containerd, CRI-O, etc.",
      "hint": "It's a three-letter acronym that starts with 'C'."
    },
    {
      "type": "true-false",
      "question": "kubelet can run containers even if the API server is down, as long as it has the pod specifications cached.",
      "answer": true,
      "explanation": "kubelet maintains a local cache of pod specifications and can continue managing existing pods even if the API server becomes unavailable. However, it won't receive new pod assignments or updates during the outage.",
      "hint": "Think about kubelet's autonomy and local caching capabilities."
    },
    {
      "type": "mcq",
      "question": "Which component is responsible for assigning an IP address to a newly created pod?",
      "options": [
        "kubelet",
        "kube-proxy",
        "CNI plugin",
        "Container runtime"
      ],
      "answer": 2,
      "explanation": "The CNI (Container Network Interface) plugin is responsible for setting up pod networking, including creating the network namespace and assigning an IP address. kubelet calls the CNI plugin to perform these operations.",
      "hint": "Think about which plugin handles networking specifically."
    },
    {
      "type": "drag-drop",
      "question": "Arrange the components in order of who interacts with what during packet routing from Service IP to Pod IP:",
      "instruction": "Order from first to last in the routing process",
      "items": [
        "Client sends packet to Service ClusterIP",
        "Kernel netfilter intercepts packet",
        "Node network stack receives packet",
        "iptables/IPVS rules rewrite destination (DNAT)",
        "CNI routes packet to destination pod"
      ],
      "correctOrder": [0, 2, 1, 3, 4],
      "explanation": "Traffic flow: Client sends to ClusterIP → Node network stack → Kernel netfilter intercepts → iptables/IPVS performs DNAT → CNI routes to pod. The Service object is never in this flow—it's just configuration."
    },
    {
      "type": "flashcard",
      "question": "Explain the three QoS classes that determine pod eviction priority.",
      "answer": "**QoS Classes (Quality of Service)**\n\n1. **Guaranteed**: requests = limits for all containers. Highest priority, evicted last.\n\n2. **Burstable**: requests < limits (or only requests set). Medium priority.\n\n3. **BestEffort**: No requests or limits set. Lowest priority, evicted first.\n\nkubelet uses these classes during resource pressure to decide which pods to evict, protecting workloads with stronger resource guarantees."
    },
    {
      "type": "multiple-select",
      "question": "When a worker node fails completely, which of the following occur in the cluster recovery process?",
      "options": [
        "kubelet stops sending heartbeats to the API server",
        "Node is immediately removed from the cluster",
        "After ~5 minutes, pods enter Terminating state",
        "Controllers (ReplicaSet, Deployment) detect pod loss and create replacements",
        "kube-proxy on the failed node updates iptables rules to redirect traffic"
      ],
      "answers": [0, 2, 3],
      "explanation": "When a node fails: heartbeats stop → Node marked NotReady (~40s) → After grace period (~5m) pods are terminated → Controllers create replacement pods on healthy nodes. The node isn't immediately removed, and the failed node's kube-proxy can't update anything since it's down.",
      "hint": "Consider what happens to pods and how controllers respond, not immediate removal."
    },
    {
      "type": "mcq",
      "question": "What is the relationship between Service objects and Endpoints objects?",
      "options": [
        "Services create Endpoints based on pod labels, and kube-proxy uses Endpoints to route traffic",
        "Endpoints are deprecated—Services now route traffic directly to pods",
        "Endpoints create Services when pods with matching labels are found",
        "Services and Endpoints are two names for the same object"
      ],
      "answer": 0,
      "explanation": "The Endpoints controller watches Services and creates/updates Endpoints objects based on the Service selector matching pod labels. kube-proxy watches Endpoints to know which pod IPs to include in its routing rules. Services define what to match, Endpoints list the actual IPs.",
      "hint": "Think about the flow: Service selector → which pods match → where to route."
    },
    {
      "type": "code-completion",
      "question": "Complete the probe that determines if a container should receive traffic from a Service:",
      "instruction": "Fill in the probe type",
      "codeTemplate": "_____Probe:\n  httpGet:\n    path: /ready\n    port: 8080\n  periodSeconds: 5",
      "answer": "readiness",
      "caseSensitive": false,
      "acceptedAnswers": ["readiness"],
      "explanation": "readinessProbe determines if a container can accept traffic. When it fails, the pod is removed from Service endpoints. This is different from livenessProbe (restart if fails) and startupProbe (initial startup check)."
    },
    {
      "type": "true-false",
      "question": "In iptables mode, kube-proxy supports advanced load balancing algorithms like least-connection and round-robin with weights.",
      "answer": false,
      "explanation": "iptables mode only provides random selection among backends (statistically distributing traffic). Advanced load balancing algorithms like round-robin, least-connection, and weighted distribution are available in IPVS mode.",
      "hint": "Think about the capabilities difference between iptables and IPVS modes."
    },
    {
      "type": "mcq",
      "question": "Which statement best describes how kubelet interacts with the API server?",
      "options": [
        "kubelet polls the API server every 30 seconds for new pod assignments",
        "The API server pushes pod assignments to kubelet when they're scheduled",
        "kubelet watches the API server for pods assigned to its node and sends status updates back",
        "kubelet only contacts the API server during node registration"
      ],
      "answer": 2,
      "explanation": "kubelet uses the watch mechanism to efficiently monitor the API server for pods assigned to its node (via nodeName field). It also continuously sends status updates (heartbeats, pod status) back to the API server.",
      "hint": "Think about the efficiency of watch vs polling, and two-way communication."
    },
    {
      "type": "flashcard",
      "question": "What happens at each step when kubelet enforces resource limits on a container?",
      "answer": "**Resource Limit Enforcement**\n\n**Setup**: kubelet reads resource requests/limits from pod spec.\n\n**Enforcement via cgroups**: kubelet configures Linux cgroups to limit container resources.\n\n**CPU**: When limit reached → container is *throttled* (slowed down) but continues running.\n\n**Memory**: When limit exceeded → container is *killed* with OOMKilled status.\n\n**Requests vs Limits**: Requests (guarantee) used for scheduling, limits (just promise) enforced by kubelet."
    },
    {
      "type": "multiple-select",
      "question": "Which of the following are responsibilities of the container runtime (not kubelet)?",
      "options": [
        "Pulling container images from registries",
        "Running liveness and readiness probes",
        "Creating and managing container namespaces (PID, network, mount)",
        "Deciding which node to schedule pods on",
        "Providing container logs to kubelet"
      ],
      "answers": [0, 2, 4],
      "explanation": "The container runtime handles image management, creates/manages container namespaces and cgroups, and provides logs. kubelet runs probes and reports results. Scheduling is the scheduler's job.",
      "hint": "Focus on low-level container operations vs orchestration tasks."
    },
    {
      "type": "mcq",
      "question": "Why does the Service ClusterIP (e.g., 10.96.100.50) not appear on any network interface in the cluster?",
      "options": [
        "It's a configuration error—ClusterIPs should be assigned to the kube-proxy interface",
        "ClusterIPs are virtual IPs that exist only in iptables/IPVS rules for packet rewriting",
        "The ClusterIP is actually assigned to the Service object's network namespace",
        "ClusterIPs are assigned to the API server's network interface"
      ],
      "answer": 1,
      "explanation": "Service ClusterIPs are virtual IPs (VIPs) that don't exist on any actual network interface. They're used by kube-proxy to create routing rules. When packets arrive destined for a ClusterIP, kernel rules intercept and rewrite them to real pod IPs via DNAT.",
      "hint": "Think about the concept of 'virtual' IP and where routing actually happens."
    }
  ]
}
{{< /quiz >}}

