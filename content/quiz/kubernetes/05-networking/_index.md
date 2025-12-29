---
title: Networking Quiz
linkTitle: Networking
type: docs
weight: 05
prev: /quiz/kubernetes/04-worker-nodes
next: /quiz/kubernetes/06-pods
---

{{< quiz id="kubernetes-networking-quiz" >}}
{
  "questions": [
    {
      "type": "multiple-select",
      "question": "Which of the following are fundamental requirements of the Kubernetes network model?",
      "options": [
        "All pods can communicate with each other without NAT",
        "All nodes can communicate with all pods without NAT",
        "The pod's IP is the same from its own perspective and from others' perspective",
        "All containers within a pod must use different IP addresses",
        "Services must use NAT to reach backend pods"
      ],
      "answers": [0, 1, 2],
      "explanation": "The Kubernetes network model requires: (1) all pods can communicate without NAT, (2) all nodes can communicate with all pods without NAT, and (3) a pod's IP is consistent from all perspectives. Containers within a pod share the same IP, and Services use ClusterIPs (not NAT directly).",
      "hint": "Think about the flat network model that Kubernetes implements."
    },
    {
      "type": "mcq",
      "question": "Which component is responsible for assigning IP addresses to pods?",
      "options": [
        "kube-proxy",
        "CoreDNS",
        "CNI plugin",
        "kube-api-server"
      ],
      "answer": 2,
      "explanation": "The CNI (Container Network Interface) plugin is responsible for assigning IP addresses to pods from the node's pod CIDR range. The kube-api-server assigns Service IPs, while kube-proxy handles routing and CoreDNS handles DNS resolution.",
      "hint": "This component also creates network namespaces and configures routes."
    },
    {
      "type": "true-false",
      "question": "ClusterIPs are virtual IP addresses that don't actually exist on any network interface.",
      "answer": true,
      "explanation": "ClusterIPs are virtual and don't exist on any interface. They are implemented through iptables or IPVS rules created by kube-proxy. When a pod sends traffic to a ClusterIP, the kernel netfilter intercepts the packet and performs DNAT to rewrite the destination to a real pod IP.",
      "hint": "Think about how kube-proxy implements Service networking."
    },
    {
      "type": "drag-drop",
      "question": "Arrange these steps in the correct order for the CNI plugin operation when a pod is scheduled:",
      "instruction": "Drag to arrange in the correct sequence",
      "items": [
        "Pod scheduled to node",
        "kubelet calls CNI plugin",
        "CNI creates network namespace for pod",
        "CNI creates veth pair",
        "CNI assigns IP from node's pod CIDR",
        "CNI configures routes",
        "Returns pod IP to kubelet"
      ],
      "correctOrder": [0, 1, 2, 4, 3, 5, 6],
      "explanation": "The CNI workflow follows this exact sequence: scheduling triggers kubelet, which calls the CNI plugin. The plugin then creates the network namespace, assigns an IP, creates the veth pair (virtual ethernet cable), configures routing, and finally returns the pod IP to kubelet."
    },
    {
      "type": "fill-blank",
      "question": "What is the default Service CIDR range in Kubernetes (format: IP/mask)?",
      "answer": "10.96.0.0/12",
      "caseSensitive": false,
      "explanation": "The default Service CIDR is 10.96.0.0/12, though this is configurable via the `--service-cluster-ip-range` flag. This range must not overlap with the Pod CIDR or Node CIDR.",
      "hint": "Look at the example IP allocation section showing Service CIDR configuration."
    },
    {
      "type": "code-output",
      "question": "A pod with IP 10.244.1.5 on Node 1 wants to communicate with another pod (10.244.1.6) on the same node. Which statement is MOST accurate?",
      "code": "Node 1\n├─ Pod CIDR: 10.244.1.0/24\n├─ Pod A: 10.244.1.5\n└─ Pod B: 10.244.1.6\n\nPod A → Pod B",
      "language": "text",
      "options": [
        "Traffic must go through the CNI overlay network (VXLAN)",
        "Traffic is handled locally within the node by the CNI plugin",
        "kube-proxy iptables rules handle same-node pod communication",
        "Traffic requires cross-node routing to complete"
      ],
      "answer": 1,
      "explanation": "Same-node pod-to-pod communication is handled locally within the node by the CNI plugin. The exact mechanism depends on the CNI implementation: bridge-based CNIs (like Flannel) use a bridge (e.g., cni0), while others like Calico use IP routing, and Cilium uses eBPF. Regardless of the implementation, same-node traffic doesn't need to leave the node or use overlay networks.",
      "hint": "Consider whether traffic between pods on the same node needs to leave that node."
    },
    {
      "type": "mcq",
      "question": "How do containers within the same pod communicate with each other?",
      "options": [
        "Using the pod's IP address and different ports",
        "Using localhost (127.0.0.1) since they share a network namespace",
        "Through the cni0 bridge",
        "Via kube-proxy routing rules"
      ],
      "answer": 1,
      "explanation": "Containers within the same pod share a network namespace, which means they can communicate using localhost (127.0.0.1). They share the same IP address but use different ports. This is one of the four types of communication in Kubernetes.",
      "hint": "Containers in a pod share more than just storage—they share networking too."
    },
    {
      "type": "flashcard",
      "question": "What is the purpose of CoreDNS in a Kubernetes cluster?",
      "answer": "**CoreDNS provides DNS-based service discovery within the cluster.**\n\nIt watches the API server for service creation/changes and automatically creates DNS records. When a pod makes a DNS query, CoreDNS resolves service names to their ClusterIPs, enabling pods to communicate using service names instead of IPs.\n\n**DNS Format:** `<service-name>.<namespace>.svc.<cluster-domain>`\n\n**Example:** `my-service.default.svc.cluster.local` → `10.96.100.50`"
    },
    {
      "type": "multiple-select",
      "question": "Which CNI plugins support Network Policy enforcement?",
      "options": [
        "Calico",
        "Flannel",
        "Cilium",
        "Weave Net",
        "AWS VPC CNI"
      ],
      "answers": [0, 2, 3],
      "explanation": "Calico, Cilium, and Weave Net support Network Policy enforcement. Flannel does not support Network Policies (it's designed to be simple). AWS VPC CNI also doesn't natively support Network Policies, though you can use Calico alongside it for policy enforcement.",
      "hint": "Review the Popular CNI Plugins table to see which ones list 'Network policies' as a feature."
    },
    {
      "type": "code-completion",
      "question": "Complete the DNS configuration that automatically appears in every pod:",
      "instruction": "Fill in the missing nameserver IP",
      "codeTemplate": "# /etc/resolv.conf inside a pod\nnameserver _____\nsearch default.svc.cluster.local\nsearch svc.cluster.local\nsearch cluster.local\noptions ndots:5",
      "answer": "10.96.0.10",
      "caseSensitive": false,
      "acceptedAnswers": ["10.96.0.10"],
      "explanation": "Every pod's /etc/resolv.conf is automatically configured to use 10.96.0.10 as the nameserver, which is the CoreDNS ClusterIP. The search domains allow pods to use short service names within their namespace or cluster-wide.",
      "hint": "This is the ClusterIP address assigned to the CoreDNS service."
    },
    {
      "type": "drag-drop",
      "question": "Arrange the complete traffic flow from an external client to a backend pod in the correct order:",
      "instruction": "Order the steps from client request to pod response",
      "items": [
        "Client DNS lookup resolves to LoadBalancer IP",
        "Cloud LoadBalancer routes to NodePort",
        "First DNAT: NodePort → Service ClusterIP",
        "kube-proxy intercepts NodePort traffic",
        "Second DNAT: ClusterIP → Pod IP",
        "CNI routes packet to destination pod",
        "Application in pod receives request"
      ],
      "correctOrder": [0, 1, 3, 2, 4, 5, 6],
      "explanation": "External traffic follows this exact path: DNS resolution → LoadBalancer → NodePort on any node → kube-proxy intercepts → DNAT to ClusterIP → DNAT to actual pod IP → CNI routing → pod receives request. The return path follows the reverse with SNAT."
    },
    {
      "type": "mcq",
      "question": "What happens when a pod sends a packet to a Service ClusterIP?",
      "options": [
        "The packet is routed directly to a backend pod",
        "The packet goes to the default gateway where kernel netfilter intercepts it and performs DNAT",
        "CoreDNS forwards the packet to the correct pod",
        "The CNI plugin routes it through the cni0 bridge"
      ],
      "answer": 1,
      "explanation": "When a pod sends traffic to a ClusterIP, the packet goes to the default gateway (the node). The kernel netfilter then intercepts the packet using iptables or IPVS rules created by kube-proxy, performs DNAT to rewrite the destination to a real pod IP, and then normal routing takes over to deliver the packet.",
      "hint": "Remember that ClusterIPs are virtual and implemented through netfilter rules."
    },
    {
      "type": "true-false",
      "question": "The kube-proxy component actively routes network traffic between services and pods.",
      "answer": false,
      "explanation": "This is a common misconception. kube-proxy does NOT actively route traffic. Instead, it creates iptables or IPVS rules on each node. The actual traffic routing is performed by the kernel's netfilter subsystem using these rules. kube-proxy's role is to watch the API server and maintain the correct routing rules.",
      "hint": "Think about what 'proxy' really means in this context—it's not a traditional proxy."
    },
    {
      "type": "fill-blank",
      "question": "In the DNS format `<service-name>.<namespace>.svc.<cluster-domain>`, what is the default value for cluster-domain?",
      "answer": "cluster.local",
      "caseSensitive": false,
      "explanation": "The default cluster domain is 'cluster.local', resulting in FQDNs like 'my-service.default.svc.cluster.local'. This is configurable but rarely changed. Pods can use short forms within the same namespace (just 'my-service') thanks to the search domains in /etc/resolv.conf.",
      "hint": "Look at the Service DNS Format examples."
    },
    {
      "type": "code-output",
      "question": "Given this network configuration, identify which statement is CORRECT:",
      "code": "Cluster Configuration:\nPod CIDR:     10.244.0.0/16\nService CIDR: 10.96.0.0/12\nNode CIDR:    192.168.0.0/24\n\nNode 1: 192.168.0.10\n  ├─ Pod CIDR: 10.244.1.0/24\n  └─ Pod 1: 10.244.1.5\n\nServices:\n  └─ my-service: 10.96.100.50",
      "language": "text",
      "options": [
        "The CIDRs are overlapping which will cause routing issues",
        "All CIDRs are properly non-overlapping and correctly configured",
        "The service IP is outside the Service CIDR range",
        "The pod IP is outside its node's Pod CIDR range"
      ],
      "answer": 1,
      "explanation": "This configuration is correct! The CIDRs are properly non-overlapping: Pod CIDR (10.244.0.0/16), Service CIDR (10.96.0.0/12), and Node CIDR (192.168.0.0/24) don't overlap. The node IP (192.168.0.10) is in the node range, pod IP (10.244.1.5) is correctly in its node's pod CIDR (10.244.1.0/24), and service IP (10.96.100.50) is within the service range. CIDR quick reference: /24 -> only last octet varies, /16 -> last two octets vary, /8 -> last three octets vary.",
      "hint": "Check each CIDR range and verify that none of the IP addresses fall outside their designated ranges."
    },
    {
      "type": "mcq",
      "question": "Which CNI plugin would be most appropriate for a production environment with strict security requirements and need for network policies?",
      "options": [
        "Flannel - Simple overlay with VXLAN",
        "Calico - L3 routing with Network policies and BGP",
        "AWS VPC CNI - Native VPC IPs for pods",
        "Weave Net - Mesh network with encryption"
      ],
      "answer": 1,
      "explanation": "Calico is specifically designed for production, security-focused environments. It provides L3 routing, robust Network Policy enforcement, BGP support for advanced routing, and excellent scalability. While AWS VPC CNI is good for AWS environments, it lacks native Network Policy support. Flannel is best for simple setups and learning, not production security.",
      "hint": "Check the 'Use Case' column in the Popular CNI Plugins table."
    },
    {
      "type": "flashcard",
      "question": "What is a veth pair and how does it work in Kubernetes pod networking?",
      "answer": "**A veth (virtual ethernet) pair is like a virtual ethernet cable with two ends. Traffic sent into one end appears on the other.**\n\n**In Kubernetes:**\n- One end is placed in the pod's network namespace (appears as `eth0`)\n- The other end is in the host namespace (appears as `vethXXXX`)\n\n**Purpose:**\n- Connects isolated pod network namespace to host network\n- Allows pods to send and receive traffic via the node\n- Serves as the basic building block for pod networking\n- The host end is managed by the CNI plugin (via a bridge, IP routing, or eBPF depending on the implementation).\n\n**Analogy:** Like a network cable connecting two separate computers, except both 'computers' are on the same physical machine."
    },
    {
      "type": "multiple-select",
      "question": "A NetworkPolicy with the configuration shown will apply to which traffic?\n\n```yaml\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: backend-policy\nspec:\n  podSelector:\n    matchLabels:\n      app: backend\n  policyTypes:\n  - Ingress\n  ingress:\n  - from:\n    - podSelector:\n        matchLabels:\n          app: frontend\n    ports:\n    - protocol: TCP\n      port: 8080\n```",
      "options": [
        "Ingress traffic to pods with label app=backend",
        "Egress traffic from pods with label app=backend",
        "Traffic from pods with label app=frontend to pods with label app=backend on TCP port 8080",
        "Traffic from any pod to pods with label app=backend",
        "All traffic on all ports between frontend and backend"
      ],
      "answers": [0, 2],
      "explanation": "This NetworkPolicy applies to ingress traffic (policyTypes: Ingress) for pods labeled app=backend (podSelector). It only allows traffic FROM pods labeled app=frontend (ingress.from.podSelector) on TCP port 8080. It does not control egress, restricts the source to only frontend pods, and limits to port 8080 only.",
      "hint": "Look at the policyTypes and the podSelector fields to understand what this policy controls."
    },
    {
      "type": "true-false",
      "question": "When a pod on Node 1 (10.244.1.0/24) needs to communicate with a pod on Node 2 (10.244.2.0/24), the CNI plugin must handle cross-node routing.",
      "answer": true,
      "explanation": "Correct. Cross-node pod communication requires the CNI plugin to route traffic between nodes. The packet travels from the source pod through the source node's networking stack, across the network to the destination node, and then to the destination pod. Different CNI plugins use different mechanisms: overlay networks (VXLAN), BGP routing, or direct routing, depending on the implementation.",
      "hint": "Review the 'Pod-to-Pod (Different Nodes)' section."
    },
    {
      "type": "mcq",
      "question": "In the complete DNS resolution flow, after CoreDNS returns the Service ClusterIP to a pod, what happens next?",
      "options": [
        "CoreDNS forwards the traffic to the backend pod",
        "The pod connects to the ClusterIP and kube-proxy iptables intercepts the traffic",
        "The CNI plugin routes directly to the backend pod",
        "The pod queries CoreDNS again for the actual pod IP"
      ],
      "answer": 1,
      "explanation": "After DNS resolution returns the ClusterIP, the pod connects to that virtual IP address. The traffic is then intercepted by kube-proxy's iptables/IPVS rules, which perform DNAT to rewrite the destination to an actual backend pod IP. Finally, the CNI plugin routes the packet to the destination pod. CoreDNS's job ends after returning the ClusterIP.",
      "hint": "Follow the Complete DNS Resolution Flow diagram step-by-step."
    },
    {
      "type": "code-completion",
      "question": "Complete the NetworkPolicy to allow only frontend pods to access backend pods on port 8080:",
      "instruction": "Fill in the missing selector field",
      "codeTemplate": "apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: allow-frontend\nspec:\n  podSelector:\n    matchLabels:\n      app: backend\n  policyTypes:\n  - Ingress\n  ingress:\n  - from:\n    - _____:\n        matchLabels:\n          app: frontend\n    ports:\n    - protocol: TCP\n      port: 8080",
      "answer": "podSelector",
      "caseSensitive": false,
      "acceptedAnswers": ["podSelector"],
      "explanation": "The `podSelector` field in the `ingress.from` section specifies which pods are allowed to send traffic. This NetworkPolicy allows ingress only from pods with label app=frontend. Note this is different from the top-level podSelector which defines which pods the policy applies to (app=backend).",
      "hint": "This selector defines the SOURCE of allowed traffic in the ingress rules."
    },
    {
      "type": "flashcard",
      "question": "Explain why Pod CIDR, Service CIDR, and Node CIDR must not overlap.",
      "answer": "**Non-overlapping CIDRs are critical for proper routing and avoiding conflicts.**\n\n**Why they must be separate:**\n\n1. **Routing ambiguity:** If ranges overlap, the network stack can't determine whether a destination IP belongs to a pod, service, or node\n\n2. **Service ClusterIP uniqueness:** Service IPs must be in a distinct range so kube-proxy can create specific iptables rules\n\n3. **Pod connectivity:** CNI needs to route pod traffic correctly without conflicting with node infrastructure traffic\n\n**Example of bad config:**\n```\n❌ Pod CIDR: 10.0.0.0/16\n❌ Node CIDR: 10.0.0.0/24  ← Overlap!\n```\n\n**Correct config:**\n```\n✅ Pod CIDR: 10.244.0.0/16\n✅ Service CIDR: 10.96.0.0/12\n✅ Node CIDR: 192.168.0.0/24\n```"
    },
    {
      "type": "mcq",
      "question": "What is the primary difference between how Flannel and Calico implement pod networking?",
      "options": [
        "Flannel uses iptables while Calico uses IPVS",
        "Flannel uses overlay networks (VXLAN) while Calico uses L3 routing with BGP",
        "Flannel supports Network Policies while Calico does not",
        "Flannel assigns pod IPs while Calico does not"
      ],
      "answer": 1,
      "explanation": "The key architectural difference is that Flannel typically uses overlay networks (VXLAN or host-gw modes) to create a virtual network on top of the existing infrastructure, while Calico uses L3 routing with BGP to route pod traffic at the network layer. Both assign pod IPs, but their routing mechanisms differ significantly. Calico also supports Network Policies while Flannel does not.",
      "hint": "Look at the 'Features' column in the Popular CNI Plugins comparison table."
    },
    {
      "type": "true-false",
      "question": "The ndots:5 option in a pod's /etc/resolv.conf means that any name with 5 or more dots will be treated as a fully qualified domain name.",
      "answer": true,
      "explanation": "Correct. The `ndots:5` option controls when the resolver treats a name as fully qualified. If a name has 5 or more dots, it's queried as-is first before trying the search domains. If it has fewer than 5 dots, the search domains are tried first (e.g., 'my-service' becomes 'my-service.default.svc.cluster.local'). This is why short service names work within Kubernetes.",
      "hint": "Consider how 'my-service' (0 dots) versus 'my-service.default.svc.cluster.local' (4 dots) would be resolved."
    },
    {
      "type": "drag-drop",
      "question": "Order the layers from closest to the pod to farthest in the network architecture:",
      "instruction": "Arrange from innermost (pod) to outermost (external)",
      "items": [
        "Pod network namespace (eth0)",
        "Host namespace (vethXXXX)",
        "veth pair connection",
        "CNI routing layer (cni0 bridge, IP routing, or eBPF depending on implementation)",
        "Host eth0 interface",
        "External network / Other nodes"
      ],
      "correctOrder": [0, 2, 1, 3, 4, 5],
      "explanation": "Network traffic flows outward from the pod: starts in the pod's isolated network namespace (eth0) → through veth pair → emerges in host namespace (vethXXXX) → processed by the CNI routing layer (cni0 bridge for bridge-based CNIs, IP routing for Calico, or eBPF for Cilium) → routes through host's eth0 interface → reaches external network or other nodes. This architecture allows pods to be isolated yet connected.",
      "hint": "Follow the Pod Network Architecture diagram from inside a pod to outside the node."
    }
  ]
}
{{< /quiz >}}
