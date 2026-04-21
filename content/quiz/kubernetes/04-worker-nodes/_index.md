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
      "id": "kubernetes-worker-nodes-quiz-01",
      "type": "mcq",
      "question": "A pod is scheduled to a worker node but its containers are repeatedly crash-looping. Which component detects the failures, triggers restarts according to the pod's restart policy, and reports the pod status back to the API server?",
      "options": [
        "kube-proxy, because it monitors pod health across the node and redirects traffic when pods fail",
        "kubelet, because it manages pod lifecycle and ensures containers are running as specified",
        "The container runtime, because it self-heals containers when they exit unexpectedly",
        "The node controller, because it monitors worker nodes and restarts failed containers"
      ],
      "answer": 1,
      "explanation": "kubelet is the node agent responsible for the full pod lifecycle — it calls the container runtime to start containers and runs health probes. When a liveness probe fails or a container exits, kubelet applies the pod's restart policy and triggers a new container start. kube-proxy (A) only configures network rules for service routing; it never monitors container health. The container runtime (C) executes containers but doesn't independently decide when to restart them — kubelet drives that decision. The node controller (D) monitors node health from the control plane but doesn't directly restart individual containers.",
      "hint": "Think about which component directly watches pod specs and bridges the scheduler's assignment with container execution."
    },
    {
      "id": "kubernetes-worker-nodes-quiz-02",
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
      "id": "kubernetes-worker-nodes-quiz-03",
      "type": "true-false",
      "question": "The Service object in Kubernetes directly routes traffic from the Service IP to pod IPs.",
      "answer": false,
      "explanation": "This is a common misconception. Service objects are just configuration stored in etcd. kube-proxy reads Service configuration and creates iptables/IPVS rules, and the Linux kernel applies these rules to route traffic. Services themselves never touch packets.",
      "hint": "Think about what happens at the kernel level when packets arrive."
    },
    {
      "id": "kubernetes-worker-nodes-quiz-04",
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
      "id": "kubernetes-worker-nodes-quiz-05",
      "type": "fill-blank",
      "question": "kubelet uses _____ (control groups) to enforce resource requests and limits on containers.",
      "answer": "cgroups",
      "caseSensitive": false,
      "explanation": "Linux cgroups (control groups) are kernel-level resource namespaces that enforce hard limits on container resource usage. kubelet writes to a pod's cgroup hierarchy during startup, translating `limits.memory: 512Mi` in the pod spec into a kernel enforcement boundary. Without cgroups, a container could freely consume all CPU and memory on the node, starving other pods. Think of resource requests as a scheduling reservation and limits as a hard ceiling enforced by the kernel at runtime.",
      "hint": "It's a Linux kernel feature abbreviated as a single word."
    },
    {
      "id": "kubernetes-worker-nodes-quiz-06",
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
      "id": "kubernetes-worker-nodes-quiz-07",
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
      "id": "kubernetes-worker-nodes-quiz-08",
      "type": "flashcard",
      "question": "What is the Container Runtime Interface (CRI)?",
      "answer": "**Container Runtime Interface (CRI)**\n\nStandard gRPC API that lets kubelet work with any container runtime without code changes.\n\n- **Purpose**: decouple kubelet from specific runtime implementations\n- **Protocol**: gRPC — runtime runs as a separate process that kubelet calls\n- **What it abstracts**: image pulls, container lifecycle, execution, log streaming\n- **Common runtimes**: containerd (default in most distros), CRI-O (K8s-native)\n- **Key benefit**: swap runtimes (e.g., containerd → CRI-O) without modifying kubelet"
    },
    {
      "id": "kubernetes-worker-nodes-quiz-09",
      "type": "code-completion",
      "question": "Complete the health probe configuration to check if a container is alive:",
      "instruction": "Fill in the probe type",
      "codeTemplate": "_____:\n  httpGet:\n    path: /healthz\n    port: 8080\n  initialDelaySeconds: 30\n  periodSeconds: 10",
      "answer": "livenessProbe",
      "caseSensitive": false,
      "acceptedAnswers": ["livenessProbe"],
      "explanation": "`livenessProbe` checks if a container is alive. If it fails, kubelet restarts the container. This is different from `readinessProbe` (can accept traffic?) and `startupProbe` (has finished starting?)."
    },
    {
      "id": "kubernetes-worker-nodes-quiz-10",
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
      "id": "kubernetes-worker-nodes-quiz-11",
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
      "id": "kubernetes-worker-nodes-quiz-12",
      "type": "true-false",
      "question": "When kubelet enforces CPU limits on a container, the container is killed if it exceeds the limit.",
      "answer": false,
      "explanation": "CPU limits are enforced by throttling, not killing. When a container reaches its CPU limit, it's throttled (slowed down) but continues running. Only memory limit violations result in the container being killed (OOMKilled).",
      "hint": "Think about the difference between how CPU and memory limits are enforced."
    },
    {
      "id": "kubernetes-worker-nodes-quiz-13",
      "type": "mcq",
      "question": "During pod eviction due to node resource pressure, in what order does kubelet evict pods?",
      "options": [
        "Guaranteed → Burstable → BestEffort",
        "BestEffort → Burstable → Guaranteed",
        "BestEffort → Guaranteed → Burstable",
        "Based on pod priority class only"
      ],
      "answer": 1,
      "explanation": "kubelet evicts pods in order of QoS class: BestEffort first (no requests/limits), then Burstable (requests < limits), and finally Guaranteed (requests = limits). This protects workloads with stronger resource guarantees.",
      "hint": "Think about which pods have the least resource guarantees."
    },
    {
      "id": "kubernetes-worker-nodes-quiz-14",
      "type": "flashcard",
      "question": "Why is the Service ClusterIP called a 'virtual IP'?",
      "answer": "**Virtual IP (VIP) — Service ClusterIP**\n\nA Service ClusterIP is a fictional IP that exists only in iptables/IPVS rules — not on any actual network interface.\n\n- **Not assigned to**: any pod, node interface, kube-proxy process, or Service object itself\n- **Lives in**: iptables/IPVS rules created by kube-proxy on each node\n- **How traffic works**: packet to VIP → kernel netfilter matches rule → DNAT rewrites destination to real pod IP\n- **Why it's virtual**: Linux netfilter intercepts and rewrites the packet before it ever leaves the node network stack\n- **Mental model**: a 'catch rule' that hijacks packets destined for the ClusterIP and redirects them to a real pod"
    },
    {
      "id": "kubernetes-worker-nodes-quiz-15",
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
      "id": "kubernetes-worker-nodes-quiz-16",
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
      "id": "kubernetes-worker-nodes-quiz-17",
      "type": "mcq",
      "question": "What is the primary advantage of kube-proxy's IPVS mode over iptables mode?",
      "options": [
        "IPVS eliminates the need for kube-proxy, routing traffic directly in the kernel without a controller",
        "IPVS provides O(1) lookup time and better performance at scale",
        "IPVS mode is enabled by default in Kubernetes because it outperforms iptables in all cases",
        "IPVS supports more service types"
      ],
      "answer": 1,
      "explanation": "IPVS mode offers O(1) lookup time (vs O(n) for iptables), better performance with many services, and advanced load balancing algorithms (round-robin, least connection, etc.). However, it requires kernel modules and is more complex.",
      "hint": "Think about algorithmic complexity and scale."
    },
    {
      "id": "kubernetes-worker-nodes-quiz-18",
      "type": "fill-blank",
      "question": "kubelet communicates with the container runtime through the _____ (three-letter acronym) interface.",
      "answer": "CRI",
      "caseSensitive": false,
      "explanation": "CRI (Container Runtime Interface) is the standardized gRPC API that allows kubelet to work with different container runtimes like containerd, CRI-O, etc.",
      "hint": "It's a three-letter acronym that starts with 'C'."
    },
    {
      "id": "kubernetes-worker-nodes-quiz-19",
      "type": "true-false",
      "question": "kubelet can run containers even if the API server is down, as long as it has the pod specifications cached.",
      "answer": true,
      "explanation": "kubelet maintains a local cache of pod specifications and can continue managing existing pods even if the API server becomes unavailable. However, it won't receive new pod assignments or updates during the outage.",
      "hint": "Think about kubelet's autonomy and local caching capabilities."
    },
    {
      "id": "kubernetes-worker-nodes-quiz-20",
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
      "id": "kubernetes-worker-nodes-quiz-21",
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
      "id": "kubernetes-worker-nodes-quiz-22",
      "type": "flashcard",
      "question": "Explain the three QoS classes that determine pod eviction priority.",
      "answer": "**QoS Classes (Quality of Service)**\n\n1. **Guaranteed**: requests = limits for all containers. Highest priority, evicted last.\n\n2. **Burstable**: requests < limits (or only requests set). Medium priority.\n\n3. **BestEffort**: No requests or limits set. Lowest priority, evicted first.\n\nkubelet uses these classes during resource pressure to decide which pods to evict, protecting workloads with stronger resource guarantees."
    },
    {
      "id": "kubernetes-worker-nodes-quiz-23",
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
      "id": "kubernetes-worker-nodes-quiz-24",
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
      "id": "kubernetes-worker-nodes-quiz-25",
      "type": "code-completion",
      "question": "Complete the probe that determines if a container should receive traffic from a Service:",
      "instruction": "Fill in the probe type",
      "codeTemplate": "_____:\n  httpGet:\n    path: /ready\n    port: 8080\n  periodSeconds: 5",
      "answer": "readinessProbe",
      "caseSensitive": false,
      "acceptedAnswers": ["readinessProbe"],
      "explanation": "`readinessProbe` determines if a container can accept traffic. When it fails, the pod is removed from Service endpoints. This is different from `livenessProbe` (restart if fails) and `startupProbe` (initial startup check)."
    },
    {
      "id": "kubernetes-worker-nodes-quiz-26",
      "type": "true-false",
      "question": "In iptables mode, kube-proxy supports advanced load balancing algorithms like least-connection and round-robin with weights.",
      "answer": false,
      "explanation": "iptables mode only provides random selection among backends (statistically distributing traffic). Advanced load balancing algorithms like round-robin, least-connection, and weighted distribution are available in IPVS mode.",
      "hint": "Think about the capabilities difference between iptables and IPVS modes."
    },
    {
      "id": "kubernetes-worker-nodes-quiz-27",
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
      "id": "kubernetes-worker-nodes-quiz-28",
      "type": "flashcard",
      "question": "What happens at each step when kubelet enforces resource limits on a container?",
      "answer": "**Resource Limit Enforcement**\n\n**Setup**: kubelet reads resource requests/limits from pod spec.\n\n**Enforcement via cgroups**: kubelet configures Linux cgroups to limit container resources.\n\n**CPU**: When limit reached → container is *throttled* (slowed down) but continues running.\n\n**Memory**: When limit exceeded → container is *killed* with OOMKilled status.\n\n**Requests vs Limits**: Requests (guarantee) used for scheduling, limits (just promise) enforced by kubelet."
    },
    {
      "id": "kubernetes-worker-nodes-quiz-29",
      "type": "multiple-select",
      "question": "Which of the following are responsibilities of the container runtime (not kubelet)?",
      "options": [
        "Pulling container images from registries",
        "Running liveness and readiness probes",
        "Creating and managing container namespaces (PID, network, mount)",
        "Reporting pod status and container metrics directly to the API server",
        "Providing container logs to kubelet"
      ],
      "answers": [0, 2, 4],
      "explanation": "The container runtime handles image management, creates/manages container namespaces and cgroups, and provides logs. kubelet runs probes and reports pod status to the API server (the runtime reports container state to kubelet, not directly to the API server). Scheduling is the scheduler's job.",
      "hint": "Focus on low-level container operations vs orchestration tasks."
    },
    {
      "id": "kubernetes-worker-nodes-quiz-30",
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
    },
    {
      "id": "kubernetes-worker-nodes-quiz-31",
      "type": "true-false",
      "question": "After a startupProbe succeeds once, it continues running on each periodSeconds interval alongside liveness and readiness probes.",
      "answer": false,
      "explanation": "startupProbe is a one-shot gate, not a continuous monitor. Its sole job is to disable liveness and readiness probes until the application finishes initializing — protecting slow-starting containers from premature restarts. Once it succeeds, it permanently stops firing for that container's lifetime. kubelet then hands off to livenessProbe (restart if alive-check fails) and readinessProbe (traffic gating). The common misconception is treating all three probes as continuous background loops — startupProbe is the odd one out.",
      "hint": "Think about what 'startup' implies about when this probe's job is done."
    },
    {
      "id": "kubernetes-worker-nodes-quiz-32",
      "type": "true-false",
      "question": "A single centralized kube-proxy instance manages iptables/IPVS rules across all nodes in the cluster.",
      "answer": false,
      "explanation": "kube-proxy runs as a DaemonSet — one instance per node. Each independently watches the API server for Service and Endpoint changes, then maintains its own local iptables/IPVS rules. This per-node design is what makes routing efficient: when a packet arrives at a node, the kernel applies local rules without contacting any other node or central process. A centralized proxy would be a single point of failure and a bottleneck; the distributed model means kube-proxy failure on one node only affects routing updates on that node.",
      "hint": "Think about how Kubernetes typically deploys node-level agents."
    },
    {
      "id": "kubernetes-worker-nodes-quiz-33",
      "type": "mcq",
      "question": "kube-proxy on a node crashes and is not restarted. Which of the following best describes the immediate impact on that node?",
      "options": [
        "All Service-to-pod traffic on the node immediately stops, because kube-proxy forwards every packet",
        "Existing Service routing continues working, but rule updates (new pods added, old pods removed, Services changed) are no longer applied to that node",
        "All pods on the node are evicted and rescheduled to nodes with a healthy kube-proxy",
        "CoreDNS stops resolving Service names for pods on that node until kube-proxy restarts"
      ],
      "answer": 1,
      "explanation": "kube-proxy writes rules into the kernel and then exits the packet path entirely — the kernel applies those rules independently. If kube-proxy crashes, the existing iptables/IPVS rules remain intact and traffic continues flowing normally. The damage is staleness: new pod additions, pod terminations, and Service updates won't be reflected on that node's rules until kube-proxy recovers. Option A reflects the misconception that kube-proxy actively forwards packets (it doesn't — it's a rule creator, not a proxy in the traditional sense). Option C describes node failure eviction, not kube-proxy failure. Option D conflates kube-proxy with CoreDNS — DNS resolution is entirely separate.",
      "hint": "Recall which component actually processes packets versus which component writes rules and then steps aside."
    },
    {
      "id": "kubernetes-worker-nodes-quiz-34",
      "type": "fill-blank",
      "question": "kubelet sends heartbeats to the API server every _____ seconds by default.",
      "answer": "10",
      "caseSensitive": false,
      "explanation": "kubelet sends node status heartbeats every 10 seconds by default. The node-monitor-grace-period is ~40 seconds, meaning the node is marked NotReady after roughly 4 consecutive missed heartbeats. This interval isn't arbitrary — it's tuned to tolerate brief network blips without triggering false NotReady events while still detecting genuine failures quickly. Understanding the heartbeat rate helps reason about the ~40s/~5m thresholds for NotReady and pod eviction.",
      "hint": "The node-monitor-grace-period is ~40 seconds — how many missed beats does that represent?"
    },
    {
      "id": "kubernetes-worker-nodes-quiz-35",
      "type": "multiple-select",
      "question": "Which of the following are valid eviction signals that kubelet monitors when a node is under resource pressure?",
      "options": [
        "memory.available",
        "cpu.available",
        "nodefs.available",
        "imagefs.available",
        "network.available",
        "pid.available"
      ],
      "answers": [0, 2, 3, 5],
      "explanation": "kubelet monitors four eviction signal categories: memory.available (available RAM), nodefs.available (disk space for volumes and pod logs), imagefs.available (disk space for container images and layers), and pid.available (process ID exhaustion). CPU pressure is notably absent — when CPU is saturated, throttling handles it via cgroups without evicting pods. Network pressure is managed at a different layer and doesn't trigger eviction. Configuring eviction thresholds for nonexistent signals like cpu.available silently has no effect.",
      "hint": "CPU handles pressure through throttling, not eviction. Which resource types can be genuinely 'full'?"
    },
    {
      "id": "kubernetes-worker-nodes-quiz-36",
      "type": "true-false",
      "question": "In modern Kubernetes clusters (1.21+), kube-proxy exclusively watches Endpoints objects to determine which pod IPs to include in routing rules.",
      "answer": false,
      "explanation": "Starting in Kubernetes 1.21, kube-proxy defaults to watching EndpointSlice objects rather than Endpoints. EndpointSlices shard large backend lists into smaller objects (default max: 100 endpoints per slice). When a single pod is added or removed, only the affected slice is updated — instead of retransmitting the entire endpoints list. Endpoints still exist for backward compatibility, but modern kube-proxy uses EndpointSlices for scalability. This matters when debugging: a Service may appear correct in Endpoints but routing can still be stale if the matching EndpointSlice is inconsistent.",
      "hint": "Think about what 'slices' implies about how endpoints are partitioned at scale."
    },
    {
      "id": "kubernetes-worker-nodes-quiz-37",
      "type": "true-false",
      "question": "Starting from Kubernetes 1.24, Docker Engine can be used directly as the container runtime without any additional adapter.",
      "answer": false,
      "explanation": "Docker Engine doesn't implement the CRI (Container Runtime Interface) natively. Kubernetes previously supported it via dockershim — a built-in CRI-to-Docker translation layer — but this was deprecated in 1.20 and removed entirely in 1.24. After 1.24, clusters that need Docker Engine must use cri-dockerd, a separate adapter maintained outside the Kubernetes project. Most clusters migrated to containerd or CRI-O, which implement CRI natively. Ignoring this when upgrading to 1.24+ causes container startup to fail immediately since kubelet can no longer communicate with Docker.",
      "hint": "Docker doesn't natively implement the interface kubelet uses to talk to runtimes."
    },
    {
      "id": "kubernetes-worker-nodes-quiz-38",
      "type": "fill-blank",
      "question": "kubelet uses _____ (three-letter acronym) plugins to mount volumes and manage storage for pods.",
      "answer": "CSI",
      "caseSensitive": false,
      "explanation": "CSI (Container Storage Interface) is the standardized API through which kubelet interacts with storage plugins — analogous to CRI for container runtimes and CNI for networking. CSI plugins handle volume mounting, lifecycle management, and storage driver interaction, keeping kubelet decoupled from any specific storage implementation. The three interfaces — CRI, CNI, CSI — are kubelet's extension points for compute, networking, and storage respectively. When a pod mounts a PersistentVolumeClaim, kubelet calls the appropriate CSI driver to attach and mount the underlying storage.",
      "hint": "It forms a trio with CRI and CNI — think about what the 'S' stands for."
    },
    {
      "id": "kubernetes-worker-nodes-quiz-39",
      "type": "mcq",
      "question": "After a node has been NotReady for approximately 5 minutes, how does the Node Controller trigger eviction of the pods running on that node?",
      "options": [
        "It sends delete requests directly to the failed node's kubelet, which terminates the pods",
        "It contacts the container runtime on the failed node via CRI to stop all containers",
        "It adds a NoExecute taint to the node, causing pods without a matching toleration to be evicted",
        "It marks all pods as Failed and the scheduler immediately reschedules them onto healthy nodes"
      ],
      "answer": 2,
      "explanation": "The Node Controller applies a `node.kubernetes.io/not-ready:NoExecute` taint (or `unreachable:NoExecute`) to the failed node. Pods without a matching toleration are automatically removed via the taint eviction mechanism. This design is elegant: the Node Controller only needs to set a taint — it doesn't need to know which pods are running or enumerate them individually. Each pod's own tolerations determine whether it gets evicted. Option A is wrong because kubelet on a failed node is unreachable — that's why the taint mechanism exists. Option B is wrong because the control plane doesn't speak CRI directly; that's kubelet's job. Option D is wrong because pods enter Terminating state (not Failed), and it's the pod's controller (ReplicaSet, Deployment) — not the scheduler — that creates replacements.",
      "hint": "Think about the taint/toleration mechanism and why it's well-suited for a node the control plane can't directly reach."
    }
  ]
}
{{< /quiz >}}

