---
title: Services Quiz
linkTitle: Services
type: docs
weight: 09
prev: /quiz/kubernetes/08-workload-controllers
next: /quiz/kubernetes/10-ingress
---

{{< quiz id="kubernetes-services-quiz" >}}
{
  "questions": [
    {
      "type": "mcq",
      "question": "Why do we need Services in Kubernetes instead of connecting directly to pod IPs?",
      "options": [
        "Pods have static IPs that never change",
        "Pods are ephemeral and their IPs change when recreated; Services provide stable endpoints",
        "Services are faster than direct pod communication",
        "Direct pod IP communication is not supported in Kubernetes"
      ],
      "answer": 1,
      "explanation": "Pods are ephemeral and can be created/destroyed dynamically. Each pod gets a unique IP that changes when the pod is replaced. Services provide a stable IP address and DNS name that persists regardless of pod lifecycle changes.",
      "hint": "Think about what happens when a pod crashes and is recreated."
    },
    {
      "type": "flashcard",
      "question": "Explain how Endpoints work in the context of Service traffic routing. Are they queried during active traffic?",
      "answer": "**Background Synchronization (NOT queried during traffic):**\n\nEndpoints work as a background synchronization mechanism:\n\n1. **Setup Phase**: Endpoints Controller watches pods matching Service selector → Updates Endpoints object → kube-proxy watches Endpoints → Programs iptables/IPVS rules\n\n2. **Active Traffic**: Request hits Service IP → Kernel networking stack → Pre-programmed iptables/IPVS rules → Direct routing to Pod IP\n\n**Key Point**: Endpoints are NOT queried during active traffic. They update iptables/IPVS rules asynchronously in the background.\n\n**Benefits**:\n- Kernel-level routing (no API calls)\n- No control plane bottleneck\n- Nanosecond routing decisions\n- Traffic continues even if API server is slow"
    },
    {
      "type": "multiple-select",
      "question": "What does a Kubernetes Service provide?",
      "options": [
        "Stable IP address that persists across pod restarts",
        "DNS name for service discovery",
        "Load balancing across pod replicas",
        "Automatic pod health monitoring",
        "Abstraction of pod lifecycle dynamics"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "Services provide stable IP addresses, DNS names, load balancing across pods, and abstract the dynamic pod lifecycle. While Services route to healthy pods, the actual health monitoring is done by probes in the pod spec, not by the Service itself.",
      "hint": "Think about what Services directly manage vs. what they depend on."
    },
    {
      "type": "true-false",
      "question": "When traffic reaches a Service IP, the Endpoints object is queried in real-time to determine which pod to route to.",
      "answer": false,
      "explanation": "False! Endpoints are NOT queried during active traffic. Instead, kube-proxy watches Endpoints objects in the background and pre-programs iptables/IPVS rules. When traffic hits the Service IP, the kernel networking stack uses these pre-programmed rules for direct, fast routing to pods.",
      "hint": "Think about performance - would querying an API object for every request be fast?"
    },
    {
      "type": "mcq",
      "question": "What is the default Service type in Kubernetes?",
      "options": [
        "NodePort",
        "LoadBalancer",
        "ClusterIP",
        "Headless"
      ],
      "answer": 2,
      "explanation": "ClusterIP is the default Service type. It provides an internal cluster IP address accessible only within the cluster, making it ideal for internal service-to-service communication.",
      "hint": "Think about the most common use case - internal microservices communication."
    },
    {
      "type": "code-output",
      "question": "Given this Service configuration, how can you access it from outside the cluster?",
      "code": "apiVersion: v1\nkind: Service\nmetadata:\n  name: backend-api\nspec:\n  type: ClusterIP\n  selector:\n    app: backend\n  ports:\n  - port: 80\n    targetPort: 8080",
      "language": "yaml",
      "options": [
        "curl http://<node-ip>:80",
        "curl http://backend-api (from any external client)",
        "Not directly accessible; use kubectl port-forward",
        "curl http://<cluster-ip>:80 from your laptop"
      ],
      "answer": 2,
      "explanation": "ClusterIP Services are only accessible within the cluster. From outside, you must use `kubectl port-forward svc/backend-api 8080:80` to create a local tunnel, then access via `localhost:8080`.",
      "hint": "ClusterIP means cluster-internal only."
    },
    {
      "type": "fill-blank",
      "question": "The DNS format for a Service in Kubernetes is: <service-name>.<namespace>._____.cluster.local",
      "answer": "svc",
      "caseSensitive": false,
      "acceptedAnswers": ["svc"],
      "explanation": "The full DNS format for Services is `<service-name>.<namespace>.svc.cluster.local`. The `svc` component identifies it as a Service resource. Example: `api.default.svc.cluster.local`.",
      "hint": "It's a three-letter abbreviation for the resource type."
    },
    {
      "type": "drag-drop",
      "question": "Arrange the ClusterIP traffic flow in the correct order:",
      "instruction": "Sequence from client request to pod response",
      "items": [
        "Client inside cluster makes request",
        "CoreDNS resolves Service name to ClusterIP",
        "Client sends packet to ClusterIP",
        "iptables/IPVS rules route traffic (DNAT: ClusterIP → Pod IP)",
        "Packet arrives at Pod",
        "Pod processes request and responds"
      ],
      "correctOrder": [0, 1, 2, 3, 4, 5],
      "explanation": "Traffic flow: Client request → DNS resolution → Packet to ClusterIP → Kernel routing via iptables/IPVS → Pod. Note that kube-proxy pre-programs the routing rules but doesn't handle actual traffic."
    },
    {
      "type": "mcq",
      "question": "What is the default port range for NodePort services?",
      "options": [
        "1024-65535",
        "30000-32767",
        "8000-9000",
        "80-443"
      ],
      "answer": 1,
      "explanation": "NodePort services use ports in the range 30000-32767 by default. You can specify a port in this range or let Kubernetes auto-assign one. This range is configurable but 30000-32767 is the standard default.",
      "hint": "It's a high port range above the well-known ports."
    },
    {
      "type": "code-completion",
      "question": "Complete the NodePort Service to expose port 80 on node port 30080:",
      "instruction": "Fill in the missing Service type",
      "codeTemplate": "apiVersion: v1\nkind: Service\nmetadata:\n  name: web-app\nspec:\n  type: _____\n  selector:\n    app: web-app\n  ports:\n  - port: 80\n    targetPort: 8080\n    nodePort: 30080",
      "answer": "NodePort",
      "caseSensitive": false,
      "acceptedAnswers": ["NodePort", "nodeport"],
      "explanation": "The `NodePort` type exposes the Service on each node's IP at a static port (30080 in this case), allowing external access via any node's IP address."
    },
    {
      "type": "multiple-select",
      "question": "Why is NodePort NOT recommended for production external access?",
      "options": [
        "NodePort requires manual tracking of port allocations (30000-32767)",
        "Nodes can be replaced, making it difficult for clients to track which Node IP to use",
        "NodePort services don't support load balancing",
        "LoadBalancer (L4) or Ingress (L7) are better alternatives for production",
        "NodePort services are slower than other types"
      ],
      "answers": [0, 1, 3],
      "explanation": "NodePort has port management challenges, node ephemerality issues, and better alternatives exist (LoadBalancer, Ingress). NodePort DOES support load balancing across pods and isn't inherently slower - the issues are operational.",
      "hint": "Think about operational challenges and better architectural patterns."
    },
    {
      "type": "flashcard",
      "question": "Explain the traffic flow for a LoadBalancer Service from external client to pod.",
      "answer": "**LoadBalancer Traffic Flow:**\n\n```\nClient (external)\n  ↓\nCloud Load Balancer (AWS ELB, GCP LB, Azure LB)\n  ↓\nNode IP:NodePort (LB distributes across nodes)\n  ↓\niptables/IPVS rules (programmed by kube-proxy)\n  ↓\nDNAT: NodePort → Pod IP (e.g., 10.244.1.5:8080)\n  ↓\nPod\n```\n\n**Key Points:**\n- LoadBalancer type automatically creates a NodePort\n- Cloud provider's LB uses NodePorts as backend targets\n- kube-proxy programs iptables/IPVS rules\n- ClusterIP is also created but data plane traffic flows directly from NodePort to Pod via DNAT\n- Only works with cloud providers (AWS, GCP, Azure)"
    },
    {
      "type": "true-false",
      "question": "A LoadBalancer Service can only be created in cloud environments (AWS, GCP, Azure) and will not work in on-premises clusters.",
      "answer": true,
      "explanation": "True! LoadBalancer Services require cloud provider integration to provision external load balancers (AWS ELB, GCP LB, Azure LB). In on-premises clusters, the Service will remain in 'Pending' state unless you have a solution like MetalLB to provide LoadBalancer functionality.",
      "hint": "Think about who provides the external load balancer."
    },
    {
      "type": "mcq",
      "question": "What makes a Headless Service different from a regular ClusterIP Service?",
      "options": [
        "Headless Services have no pods",
        "Headless Services set clusterIP: None and return Pod IPs directly instead of a single ClusterIP",
        "Headless Services only work with Deployments",
        "Headless Services provide better load balancing"
      ],
      "answer": 1,
      "explanation": "Headless Services have `clusterIP: None`, which means no ClusterIP is allocated. DNS queries return individual Pod IPs instead of a single Service IP, allowing direct pod-to-pod connectivity without kube-proxy load balancing.",
      "hint": "Think about what 'headless' means - no head/single IP."
    },
    {
      "type": "code-output",
      "question": "A Headless Service named 'mysql' is created with 3 StatefulSet pods (mysql-0, mysql-1, mysql-2). What DNS records are created?",
      "code": "apiVersion: v1\nkind: Service\nmetadata:\n  name: mysql\nspec:\n  clusterIP: None\n  selector:\n    app: mysql\n  ports:\n  - port: 3306",
      "language": "yaml",
      "options": [
        "Only mysql.default.svc.cluster.local → ClusterIP",
        "mysql.default.svc.cluster.local → All pod IPs, plus individual records like mysql-0.mysql.default.svc.cluster.local",
        "No DNS records are created for Headless Services",
        "mysql-0, mysql-1, mysql-2 DNS records only (no Service DNS)"
      ],
      "answer": 1,
      "explanation": "Headless Services create DNS records that return all pod IPs for the service name, plus individual DNS records for each pod: `mysql-0.mysql.default.svc.cluster.local`, `mysql-1.mysql.default.svc.cluster.local`, etc. This enables both direct pod access and load balancing.",
      "hint": "Headless Services provide BOTH collective and individual pod DNS records."
    },
    {
      "type": "fill-blank",
      "question": "An ExternalName Service type returns a _____ DNS record instead of creating a ClusterIP or proxying traffic.",
      "answer": "CNAME",
      "caseSensitive": false,
      "acceptedAnswers": ["CNAME", "cname"],
      "explanation": "ExternalName Services return a CNAME (Canonical Name) record that points to an external DNS name. This provides DNS aliasing without any proxying - traffic goes directly to the external service.",
      "hint": "It's a DNS record type that aliases one domain to another."
    },
    {
      "type": "mcq",
      "question": "Which Kubernetes components are involved in routing traffic for an ExternalName Service?",
      "options": [
        "CoreDNS, kube-proxy, iptables/IPVS",
        "Only CoreDNS (returns CNAME, no proxying)",
        "kube-proxy and Endpoints",
        "Service Controller and kube-proxy"
      ],
      "answer": 1,
      "explanation": "ExternalName Services only involve CoreDNS for DNS resolution. There's no ClusterIP, no kube-proxy involvement, no iptables/IPVS rules, and no Endpoints. It's purely a DNS alias that returns a CNAME record pointing to an external service.",
      "hint": "ExternalName is DNS-only, no Kubernetes networking components."
    },
    {
      "type": "flashcard",
      "question": "Compare the five Service types: ClusterIP, NodePort, LoadBalancer, Headless, and ExternalName. When would you use each?",
      "answer": "**ClusterIP** (default):\n- Internal cluster communication only\n- Use for: Microservices, internal APIs, backends\n- Access: Within cluster via DNS or ClusterIP\n\n**NodePort**:\n- Exposes Service on each node's IP at a static port (30000-32767)\n- Use for: Development/testing, direct node access\n- Access: External via <NodeIP>:<NodePort>\n- Production: ❌ Use LoadBalancer or Ingress instead\n\n**LoadBalancer**:\n- Creates external cloud load balancer\n- Use for: Production external access (cloud only)\n- Access: External via cloud LB IP\n\n**Headless** (clusterIP: None):\n- Returns pod IPs directly, no load balancing\n- Use for: StatefulSets, direct pod access, custom load balancing\n- Access: DNS returns individual pod IPs\n\n**ExternalName**:\n- DNS alias (CNAME) to external service\n- Use for: Accessing external databases/APIs, migration scenarios\n- Access: Returns CNAME, no proxying"
    },
    {
      "type": "true-false",
      "question": "When you create a Service with a selector, Kubernetes automatically creates a corresponding Endpoints object.",
      "answer": true,
      "explanation": "True! When a Service has a selector, the Endpoints Controller automatically creates and maintains an Endpoints object with the same name, populated with IPs and ports of pods matching the selector. This happens automatically in the background.",
      "hint": "Services with selectors are 'selector-based' and get automatic endpoint management."
    },
    {
      "type": "multiple-select",
      "question": "What are the benefits of EndpointSlices over the older Endpoints objects?",
      "options": [
        "EndpointSlices split large endpoint lists into smaller chunks",
        "EndpointSlices provide more efficient watch updates",
        "EndpointSlices improve scalability for services with thousands of pods",
        "EndpointSlices are faster at routing traffic",
        "EndpointSlices reduce control plane load"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "EndpointSlices improve scalability by splitting large endpoint lists into chunks (typically 100 endpoints each), enabling more efficient updates and reducing control plane load. They don't directly affect traffic routing speed - that's handled by pre-programmed iptables/IPVS rules.",
      "hint": "Focus on scalability and control plane efficiency, not data plane performance."
    },
    {
      "type": "code-output",
      "question": "What happens when you create a Service without a selector?",
      "code": "apiVersion: v1\nkind: Service\nmetadata:\n  name: external-database\nspec:\n  ports:\n  - port: 3306\n    targetPort: 3306",
      "language": "yaml",
      "options": [
        "The Service fails to create",
        "Kubernetes automatically finds all pods in the namespace",
        "No Endpoints object is created automatically; you must manually create it",
        "The Service uses all pods in the cluster"
      ],
      "answer": 2,
      "explanation": "Services without selectors don't get automatic Endpoints management. You must manually create an Endpoints object with the same name to specify which IPs to route to. This is useful for routing to external services or manually managed endpoints.",
      "hint": "No selector = no automatic pod discovery."
    },
    {
      "type": "mcq",
      "question": "What does sessionAffinity: ClientIP do in a Service?",
      "options": [
        "Routes all traffic to the pod with the matching IP",
        "Ensures requests from the same client IP go to the same pod",
        "Balances traffic based on client IP hash",
        "Blocks traffic from unknown client IPs"
      ],
      "answer": 1,
      "explanation": "`sessionAffinity: ClientIP` ensures that requests from the same client IP address are consistently routed to the same pod. This creates session stickiness based on the client's source IP, useful for stateful connections or in-memory caching.",
      "hint": "Think about maintaining session state across requests."
    },
    {
      "type": "code-completion",
      "question": "Complete the Service configuration to enable session affinity with a 3-hour timeout:",
      "instruction": "Fill in the sessionAffinity value and timeout",
      "codeTemplate": "apiVersion: v1\nkind: Service\nmetadata:\n  name: stateful-app\nspec:\n  sessionAffinity: _____\n  sessionAffinityConfig:\n    clientIP:\n      timeoutSeconds: _____\n  selector:\n    app: stateful-app\n  ports:\n  - port: 80",
      "answer": "ClientIP",
      "caseSensitive": false,
      "acceptedAnswers": ["ClientIP", "clientip"],
      "explanation": "Set `sessionAffinity: ClientIP` and `timeoutSeconds: 10800` (3 hours = 10800 seconds). This ensures requests from the same client IP go to the same pod for 3 hours."
    },
    {
      "type": "mcq",
      "question": "With sessionAffinity: None (default), how does traffic distribution work?",
      "options": [
        "All traffic goes to the first pod",
        "Random selection (iptables mode) or round-robin (IPVS mode)",
        "Weighted distribution based on pod resources",
        "Least connections algorithm"
      ],
      "answer": 1,
      "explanation": "With `sessionAffinity: None`, traffic distribution depends on kube-proxy mode: iptables (default) uses random selection, while IPVS mode uses round-robin by default. No session stickiness is maintained.",
      "hint": "The behavior differs based on kube-proxy's networking mode."
    },
    {
      "type": "flashcard",
      "question": "Explain externalTrafficPolicy: Local vs Cluster. What are the tradeoffs?",
      "answer": "**externalTrafficPolicy: Cluster (default):**\n- Traffic can be routed to any pod on any node\n- Even distribution across all pods\n- ❌ Source IP is lost (SNAT applied)\n- ❌ Extra network hop possible (cross-node traffic)\n- ✅ Better load distribution\n\n**externalTrafficPolicy: Local:**\n- Traffic only routes to pods on the same node\n- Nodes without pods are marked unhealthy\n- ✅ Source IP preserved (no SNAT)\n- ✅ No extra network hops\n- ❌ Uneven distribution if pods spread unevenly\n\n**Use Cases:**\n- Local: When you need source IP (logging, security) or want to avoid cross-node traffic\n- Cluster: When even distribution is more important than preserving source IP\n\n**Note:** With LoadBalancer + Local, health checks ensure only nodes with pods receive traffic."
    },
    {
      "type": "true-false",
      "question": "When using externalTrafficPolicy: Local with a LoadBalancer Service, the cloud load balancer's health checks automatically exclude nodes that don't have any matching pods.",
      "answer": true,
      "explanation": "True! With `externalTrafficPolicy: Local`, Kubernetes configures health checks so that nodes without local pods are marked as unhealthy, causing the cloud load balancer to exclude them from the backend pool. This ensures traffic only goes to nodes with running pods.",
      "hint": "Health checks are key to making Local policy work effectively."
    },
    {
      "type": "multiple-select",
      "question": "Which Service fields are used in the port configuration section?",
      "options": [
        "`port` - The Service's exposed port",
        "`targetPort` - The pod's container port",
        "`nodePort` - The node's static port (for NodePort/LoadBalancer)",
        "`containerPort` - The container's listening port",
        "`protocol` - TCP, UDP, or SCTP"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "Service port configuration uses: `port` (Service's port), `targetPort` (pod's port), `nodePort` (optional for NodePort/LoadBalancer), and `protocol`. Note: `containerPort` is defined in the pod spec, not the Service spec.",
      "hint": "containerPort is a pod-level configuration, not Service-level."
    },
    {
      "type": "code-output",
      "question": "Given this Service configuration, what happens when a client inside the cluster accesses it using just the Service name 'api'?",
      "code": "apiVersion: v1\nkind: Service\nmetadata:\n  name: api\n  namespace: production\nspec:\n  type: ClusterIP\n  ports:\n  - port: 80\n    targetPort: 8080\n  selector:\n    app: api-server",
      "language": "yaml",
      "options": [
        "It works if the client is in the 'production' namespace; fails otherwise",
        "It fails because the full FQDN must be used",
        "It works from any namespace in the cluster",
        "It only works from the 'default' namespace"
      ],
      "answer": 0,
      "explanation": "Short DNS names (just the service name) only work within the same namespace. To access across namespaces, use `api.production` or the full FQDN `api.production.svc.cluster.local`. This is Kubernetes' DNS search domain behavior.",
      "hint": "DNS shortcuts are namespace-scoped."
    },
    {
      "type": "drag-drop",
      "question": "Match the Service type to its primary use case:",
      "instruction": "Pair each Service type with its best use case",
      "items": [
        "ClusterIP → Internal microservices communication",
        "NodePort → Development and testing",
        "LoadBalancer → Production external access (cloud)",
        "Headless → StatefulSets with direct pod access",
        "ExternalName → Accessing external databases/APIs"
      ],
      "correctOrder": [0, 1, 2, 3, 4],
      "explanation": "Each Service type is optimized for specific scenarios: ClusterIP for internal traffic, NodePort for dev/test external access, LoadBalancer for production external access, Headless for direct pod connectivity, ExternalName for external service aliasing."
    },
    {
      "type": "mcq",
      "question": "What kubectl command allows you to access a ClusterIP Service from your local machine?",
      "options": [
        "kubectl expose svc/my-service",
        "kubectl proxy svc/my-service",
        "kubectl port-forward svc/my-service 8080:80",
        "kubectl tunnel svc/my-service"
      ],
      "answer": 2,
      "explanation": "`kubectl port-forward svc/my-service 8080:80` creates a tunnel from your local machine's port 8080 to the Service's port 80. You can then access it via `localhost:8080`. This is useful for debugging ClusterIP Services without exposing them externally.",
      "hint": "Think about creating a local tunnel to the cluster."
    },
    {
      "type": "fill-blank",
      "question": "The Kubernetes component responsible for resolving Service DNS names to IP addresses is _____.",
      "answer": "CoreDNS",
      "caseSensitive": false,
      "acceptedAnswers": ["CoreDNS", "coredns", "core-dns"],
      "explanation": "CoreDNS is the DNS server running in Kubernetes clusters that resolves Service names to their ClusterIP addresses. It intercepts DNS queries from pods and returns the appropriate Service IPs or records.",
      "hint": "It's the DNS component that replaced kube-dns."
    },
    {
      "type": "true-false",
      "question": "kube-proxy directly handles all network traffic flowing through Services by acting as a proxy layer between clients and pods.",
      "answer": false,
      "explanation": "False! kube-proxy does NOT handle data plane traffic. It watches Service and EndpointSlice objects and programs iptables/IPVS rules on each node. The actual traffic routing happens at the kernel level using these rules, making it very fast without kube-proxy involvement in the data path.",
      "hint": "The name 'proxy' is misleading - think about what kube-proxy actually does."
    },
    {
      "type": "mcq",
      "question": "When a pod is deleted, how quickly does the Service stop routing traffic to it?",
      "options": [
        "Immediately when the delete command is issued",
        "Within 1-2 seconds after Endpoints Controller updates and kube-proxy programs new rules",
        "After the pod's terminationGracePeriodSeconds expires",
        "After the Service's sessionAffinity timeout"
      ],
      "answer": 1,
      "explanation": "When a pod is deleted, the Endpoints Controller detects the termination, updates the Endpoints object, kube-proxy receives the update and removes iptables/IPVS rules for that pod. This typically happens within 1-2 seconds, after which traffic stops going to the deleted pod.",
      "hint": "Think about the asynchronous background update process."
    },
    {
      "type": "flashcard",
      "question": "Explain the complete lifecycle of how a new pod becomes part of Service traffic routing.",
      "answer": "**Pod to Service Traffic Lifecycle:**\n\n1. **Pod Created**: New pod starts with labels matching Service selector\n\n2. **Endpoints Controller Detection**: Controller watches pods and detects the new pod\n\n3. **Endpoints Update**: Endpoints object updated to add new Pod IP:Port\n\n4. **kube-proxy Watch**: kube-proxy receives Endpoints update notification\n\n5. **Rules Programming**: kube-proxy programs new iptables/IPVS rules on the node to include the new pod\n\n6. **Traffic Inclusion**: Traffic now routes to the new pod (typically within 1-2 seconds)\n\n**Reverse for deletion:**\nPod Deleted → Endpoints Controller removes IP → Endpoints updated → kube-proxy removes rules → Traffic stops\n\n**Key Point**: This is all asynchronous background synchronization. Active traffic uses pre-programmed kernel rules, not real-time API queries."
    },
    {
      "type": "multiple-select",
      "question": "Which statements about Service selectors are TRUE?",
      "options": [
        "Selectors use labels to identify which pods the Service routes to",
        "Selectors must match the labels in the pod's metadata.labels field",
        "Services can have multiple selectors with OR logic",
        "Changing a Service selector immediately updates routing",
        "Services without selectors require manual Endpoints management"
      ],
      "answers": [0, 1, 3, 4],
      "explanation": "Service selectors use label matching (must match pod labels), updates take effect quickly, and services without selectors need manual Endpoints. However, Service selectors use AND logic for multiple labels, not OR.",
      "hint": "Multiple labels in a selector all must match (AND logic)."
    },
    {
      "type": "code-output",
      "question": "What happens when you try to create a LoadBalancer Service in an on-premises cluster without cloud provider integration?",
      "code": "kubectl apply -f loadbalancer-service.yaml\nkubectl get svc my-service",
      "language": "bash",
      "options": [
        "The Service is rejected and fails to create",
        "The Service is created but EXTERNAL-IP shows <pending> indefinitely",
        "Kubernetes automatically falls back to NodePort type",
        "The Service creates a ClusterIP only"
      ],
      "answer": 1,
      "explanation": "Without cloud provider integration, LoadBalancer Services are created successfully but the EXTERNAL-IP field shows `<pending>` indefinitely since there's no controller to provision an external load balancer. The Service still works as a NodePort internally.",
      "hint": "Kubernetes creates the resource, but can't fulfill the LoadBalancer provisioning."
    }
  ]
}
{{< /quiz >}}
