---
title: Ingress Quiz
linkTitle: Ingress
type: docs
weight: 10
prev: /quiz/kubernetes/09-services
next: /quiz/kubernetes/11-storage
---

{{< quiz id="kubernetes-ingress-quiz" >}}
{
  "questions": [
    {
      "id": "kubernetes-ingress-quiz-01",
      "type": "mcq",
      "question": "What problem does Ingress solve that multiple LoadBalancer Services cannot efficiently address?",
      "options": [
        "Ingress provides faster routing than LoadBalancer Services",
        "Ingress consolidates multiple external endpoints into a single public IP with routing rules, avoiding the cost of multiple LoadBalancers",
        "Ingress provides better security than LoadBalancer Services",
        "LoadBalancer Services don't support HTTP traffic"
      ],
      "answer": 1,
      "explanation": "Ingress solves the problem of needing multiple public IPs/LoadBalancers for different services. Instead of one LoadBalancer per service (expensive and complex), Ingress provides a single entry point that routes to multiple services based on host or path rules.",
      "hint": "Think about cost and efficiency when exposing many services."
    },
    {
      "id": "kubernetes-ingress-quiz-02",
      "type": "flashcard",
      "question": "Explain the difference between an Ingress Resource and an Ingress Controller. How do they work together?",
      "answer": "**Ingress Resource:**\n- Kubernetes API object (YAML manifest)\n- Defines routing rules (host-based, path-based)\n- Declarative specification of desired routing\n- Example: 'api.example.com → api-service'\n\n**Ingress Controller:**\n- Implementation/software that reads Ingress Resources\n- Runs as pods in the cluster (nginx, AWS ALB, Traefik, etc.)\n- Configures actual reverse proxy/load balancer\n- Watches for Ingress Resources and implements their rules\n\n**How they work together:**\n1. You create an Ingress Resource (routing rules)\n2. Ingress Controller watches for new/updated Ingress Resources\n3. Controller configures its reverse proxy based on the rules\n4. Controller routes external traffic to appropriate Services\n\n**Key Point:** Ingress Resource is the 'what' (rules), Controller is the 'how' (implementation)."
    },
    {
      "id": "kubernetes-ingress-quiz-03",
      "type": "multiple-select",
      "question": "Which traffic patterns does Ingress handle?",
      "options": [
        "North-South traffic (external clients → cluster services)",
        "East-West traffic (service-to-service within cluster)",
        "HTTP/HTTPS traffic routing",
        "TCP/UDP traffic routing",
        "TLS termination"
      ],
      "answers": [0, 2, 4],
      "explanation": "Ingress handles north-south HTTP/HTTPS traffic from external clients to cluster services, including TLS termination. It does NOT handle east-west (service-to-service) traffic or general TCP/UDP routing. For east-west advanced features, use Service Mesh.",
      "hint": "Ingress is specifically for HTTP/HTTPS external access."
    },
    {
      "id": "kubernetes-ingress-quiz-04",
      "type": "true-false",
      "question": "Ingress handles both north-south traffic (external to internal) and east-west traffic (service to service within the cluster).",
      "answer": false,
      "explanation": "False! Ingress only handles north-south traffic (external clients → cluster services). East-west traffic (service-to-service communication within the cluster) is handled by regular ClusterIP Services or Service Mesh for advanced features.",
      "hint": "Think about Ingress as the entry point from outside the cluster."
    },
    {
      "id": "kubernetes-ingress-quiz-05",
      "type": "mcq",
      "question": "How does an Ingress Controller receive external traffic?",
      "options": [
        "It uses ClusterIP Services like backend applications",
        "It is exposed via LoadBalancer or NodePort Service",
        "It creates its own external IP automatically",
        "It bypasses Services entirely"
      ],
      "answer": 1,
      "explanation": "The Ingress Controller itself must be exposed externally via a LoadBalancer or NodePort Service so it can receive incoming HTTP/HTTPS traffic. The backend application Services typically use ClusterIP (internal only), while the Ingress Controller's Service needs external access.",
      "hint": "The Ingress Controller is just a pod that needs external access to receive traffic."
    },
    {
      "id": "kubernetes-ingress-quiz-06",
      "type": "code-output",
      "question": "Given this Ingress configuration, which URL pattern will route to the 'api' service?",
      "code": "apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: my-ingress\nspec:\n  ingressClassName: nginx\n  rules:\n  - host: example.com\n    http:\n      paths:\n      - path: /api\n        pathType: Prefix\n        backend:\n          service:\n            name: api\n            port:\n              number: 80",
      "language": "yaml",
      "options": [
        "http://example.com/api only",
        "http://example.com/api, http://example.com/api/v1, http://example.com/api/users",
        "All requests to example.com",
        "Any URL containing '/api' anywhere in the path"
      ],
      "answer": 1,
      "explanation": "With `pathType: Prefix` and `path: /api`, the Ingress matches any path starting with '/api', including /api/v1, /api/users, etc. This is a prefix match, not an exact match.",
      "hint": "Pay attention to pathType: Prefix - what does 'prefix' mean?"
    },
    {
      "id": "kubernetes-ingress-quiz-07",
      "type": "fill-blank",
      "question": "List all three pathType options in Ingress (comma-separated):",
      "answer": "Exact, Prefix, ImplementationSpecific",
      "caseSensitive": false,
      "acceptedAnswers": [
        "Exact, Prefix, ImplementationSpecific",
        "Exact, ImplementationSpecific, Prefix",
        "Prefix, Exact, ImplementationSpecific",
        "Prefix, ImplementationSpecific, Exact",
        "ImplementationSpecific, Exact, Prefix",
        "ImplementationSpecific, Prefix, Exact"
      ],
      "explanation": "The three pathType options are: `Exact` (exact path match), `Prefix` (matches path prefix), and `ImplementationSpecific` (controller-dependent behavior, e.g., nginx regex support).",
      "hint": "The three types are: one for exact matches, one for prefix matches, and one that's controller-specific."
    },
    {
      "id": "kubernetes-ingress-quiz-08",
      "type": "drag-drop",
      "question": "Arrange the Ingress traffic flow in correct order:",
      "instruction": "Sequence from external client to pod",
      "items": [
        "External client makes HTTPS request",
        "Ingress Controller terminates TLS",
        "Request reaches Ingress Controller (via LoadBalancer/NodePort)",
        "Controller routes based on host/path rules",
        "Request forwarded to backend ClusterIP Service",
        "Service routes to Pod",
        "Pod processes HTTP request"
      ],
      "correctOrder": [0, 2, 1, 3, 4, 5, 6],
      "explanation": "Traffic flows: External request → Ingress Controller → TLS termination → Routing decision → Backend Service → Pod. The pod receives plain HTTP after TLS termination at the Ingress layer."
    },
    {
      "id": "kubernetes-ingress-quiz-09",
      "type": "flashcard",
      "question": "Explain the difference between host-based routing and path-based routing in Ingress. Provide examples.",
      "answer": "**Host-Based Routing:**\n- Routes based on the hostname (domain) in the request\n- Different domains → different services\n- Example:\n  - api.example.com → api-service\n  - web.example.com → web-service\n  - admin.example.com → admin-service\n- Use case: Multiple applications on different subdomains\n\n**Path-Based Routing:**\n- Routes based on the URL path\n- Same domain, different paths → different services\n- Example:\n  - example.com/api → api-service\n  - example.com/web → web-service\n  - example.com/admin → admin-service\n- Use case: Microservices architecture on single domain\n\n**Hybrid Routing:**\n- Combine both: different hosts + different paths\n- Example: api.example.com/v1 vs api.example.com/v2\n- Maximum flexibility for complex routing needs"
    },
    {
      "id": "kubernetes-ingress-quiz-10",
      "type": "mcq",
      "question": "In a TLS-enabled Ingress, where does TLS termination occur?",
      "options": [
        "At the pod level",
        "At the Service level",
        "At the Ingress Controller level",
        "At the cloud load balancer level"
      ],
      "answer": 2,
      "explanation": "TLS termination occurs at the Ingress Controller. The controller presents the certificate, terminates TLS, decrypts the request, and forwards plain HTTP to the backend Service/Pod. This means pods receive unencrypted HTTP traffic.",
      "hint": "Think about where the TLS secret is referenced in the Ingress manifest."
    },
    {
      "id": "kubernetes-ingress-quiz-11",
      "type": "code-completion",
      "question": "Complete the Ingress configuration to enable TLS for 'api.example.com' using a secret named 'api-tls':",
      "instruction": "Fill in the TLS section",
      "codeTemplate": "apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: tls-ingress\nspec:\n  ingressClassName: nginx\n  _____:\n  - hosts:\n    - api.example.com\n    secretName: api-tls\n  rules:\n  - host: api.example.com\n    http:\n      paths:\n      - path: /\n        pathType: Prefix\n        backend:\n          service:\n            name: api\n            port:\n              number: 80",
      "answer": "tls",
      "caseSensitive": false,
      "acceptedAnswers": ["tls"],
      "explanation": "The `tls:` section in the Ingress spec defines TLS configuration, including which hosts to secure and which Secret contains the certificate and key."
    },
    {
      "id": "kubernetes-ingress-quiz-12",
      "type": "true-false",
      "question": "When creating a TLS Secret for Ingress, the Secret type must be 'kubernetes.io/tls' with keys 'tls.crt' and 'tls.key'.",
      "answer": true,
      "explanation": "True! TLS Secrets for Ingress must have type `kubernetes.io/tls` and contain two data fields: `tls.crt` (the certificate) and `tls.key` (the private key), both base64-encoded.",
      "hint": "There's a specific Secret type for TLS certificates."
    },
    {
      "id": "kubernetes-ingress-quiz-13",
      "type": "flashcard",
      "question": "What is an IngressClass and why is it important? How does it relate to Ingress Controllers?",
      "answer": "**IngressClass:**\n- Kubernetes resource that identifies which Ingress Controller should handle an Ingress\n- Metadata layer between Ingress Resources and Controllers\n- Allows multiple Ingress Controllers to coexist in the same cluster\n\n**Relationship:**\n```\nIngress Resource\n  ↓ (references via ingressClassName)\nIngressClass\n  ↓ (identifies via controller field)\nIngress Controller (nginx pod)\n  ↓ (watches and implements)\nRouting configuration\n```\n\n**Why Important:**\n- **Multi-controller support**: Run nginx AND AWS ALB in same cluster\n- **Selective processing**: Each Ingress specifies which controller handles it\n- **Default behavior**: Mark one IngressClass as default for Ingress without ingressClassName\n\n**Example:**\n- IngressClass 'nginx' → controller: k8s.io/ingress-nginx\n- IngressClass 'aws-alb' → controller: ingress.k8s.aws/alb\n- Ingress with ingressClassName: nginx → nginx controller handles it"
    },
    {
      "id": "kubernetes-ingress-quiz-14",
      "type": "multiple-select",
      "question": "What can you configure using nginx Ingress Controller annotations?",
      "options": [
        "HTTP to HTTPS redirect (force-ssl-redirect)",
        "CORS settings (enable-cors, cors-allow-origin)",
        "Rate limiting (limit-rps)",
        "Pod resource limits",
        "Path rewriting (rewrite-target)",
        "Authentication (auth-type, auth-secret)"
      ],
      "answers": [0, 1, 2, 4, 5],
      "explanation": "Ingress annotations control controller-specific features like SSL redirect, CORS, rate limiting, path rewriting, and authentication. They don't control pod-level settings like resource limits - those are in the pod spec.",
      "hint": "Annotations control HTTP/routing behavior, not pod configuration."
    },
    {
      "id": "kubernetes-ingress-quiz-15",
      "type": "mcq",
      "question": "What is the purpose of the 'defaultBackend' in an Ingress?",
      "options": [
        "It's the primary backend for all traffic",
        "It handles requests that don't match any rules (404 handling)",
        "It's a backup when primary backends fail",
        "It's required for all Ingress resources"
      ],
      "answer": 1,
      "explanation": "The `defaultBackend` handles requests that don't match any defined rules, typically serving custom 404 pages or error responses. It's optional and provides a catch-all for unmatched traffic.",
      "hint": "Think about what happens when a request doesn't match any routing rule."
    },
    {
      "id": "kubernetes-ingress-quiz-16",
      "type": "code-output",
      "question": "What percentage of traffic goes to 'api-v2' service with this canary configuration?",
      "code": "apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: canary-ingress\n  annotations:\n    nginx.ingress.kubernetes.io/canary: \"true\"\n    nginx.ingress.kubernetes.io/canary-weight: \"10\"\nspec:\n  ingressClassName: nginx\n  rules:\n  - host: api.example.com\n    http:\n      paths:\n      - path: /\n        pathType: Prefix\n        backend:\n          service:\n            name: api-v2\n            port:\n              number: 80",
      "language": "yaml",
      "options": [
        "100% (canary replaces main)",
        "10% (canary-weight: 10)",
        "90% (inverse of weight)",
        "50% (equal split)"
      ],
      "answer": 1,
      "explanation": "With `canary: true` and `canary-weight: 10`, this Ingress receives 10% of traffic to api.example.com. The main (non-canary) Ingress for the same host receives the remaining 90%.",
      "hint": "The weight directly specifies the percentage to this backend."
    },
    {
      "id": "kubernetes-ingress-quiz-17",
      "type": "true-false",
      "question": "An Ingress Controller requires at least one Ingress Resource to function properly.",
      "answer": false,
      "explanation": "False! An Ingress Controller can run without any Ingress Resources. It simply won't route any traffic until Ingress Resources are created. The controller watches for Ingress Resources and configures routing accordingly.",
      "hint": "Think about the controller as software waiting for configuration."
    },
    {
      "id": "kubernetes-ingress-quiz-18",
      "type": "multiple-select",
      "question": "What are the benefits of using Ingress over multiple LoadBalancer Services?",
      "options": [
        "Single public IP instead of one per service",
        "Centralized routing configuration",
        "Built-in TLS termination",
        "Better performance than LoadBalancer",
        "Native Kubernetes integration",
        "Automatic DNS management"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "Ingress provides: single IP (cost savings), centralized config, TLS termination, and Kubernetes-native management. Performance isn't inherently better, and DNS management is separate (requires external DNS or manual configuration).",
      "hint": "Focus on cost, management, and integration benefits."
    },
    {
      "id": "kubernetes-ingress-quiz-19",
      "type": "mcq",
      "question": "Which Service type is typically used for backend application services that Ingress routes to?",
      "options": [
        "LoadBalancer",
        "NodePort",
        "ClusterIP",
        "ExternalName"
      ],
      "answer": 2,
      "explanation": "Backend services typically use ClusterIP (internal-only) since the Ingress Controller handles external access. Only the Ingress Controller itself needs a LoadBalancer/NodePort Service for external reachability.",
      "hint": "Backend services don't need external access - only internal cluster access."
    },
    {
      "id": "kubernetes-ingress-quiz-20",
      "type": "fill-blank",
      "question": "To mark an IngressClass as the default, use the annotation: ingressclass.kubernetes.io/is-default-class: \"_____\"",
      "answer": "true",
      "caseSensitive": false,
      "acceptedAnswers": ["true", "True", "TRUE"],
      "explanation": "The annotation `ingressclass.kubernetes.io/is-default-class: \"true\"` marks an IngressClass as default. Ingress Resources without an ingressClassName will automatically use this default class.",
      "hint": "It's a boolean value as a string."
    },
    {
      "id": "kubernetes-ingress-quiz-21",
      "type": "flashcard",
      "question": "Compare nginx Ingress Controller, AWS ALB Controller, and Istio Gateway. When would you use each?",
      "answer": "**nginx Ingress Controller:**\n- **Pros**: Lightweight, flexible, works anywhere, large community, regex routing\n- **Cons**: Not cloud-native, manual management, requires an external LB\n- **Use when**: Cloud-agnostic deployment, on-premises, need flexibility\n\n**AWS ALB Ingress Controller:**\n- **Pros**: Native AWS integration, auto-scaling, security groups\n- **Cons**: AWS-specific, requires IAM setup\n- **Use when**: AWS-only deployment, want native AWS features, cost optimization\n\n**Istio Ingress Gateway:**\n- **Pros**: Advanced traffic management, mTLS, circuit breaking, unified with service mesh\n- **Cons**: Complex setup, higher resource overhead, steep learning curve\n- **Use when**: Need advanced features, already using Istio, require mTLS\n\n**Decision Matrix:**\n- Cloud-agnostic or hybrid → nginx\n- EKS + want AWS-native integrations (WAF, ACM, Shield) → AWS ALB\n- Need mTLS, traffic shifting, mesh policies → Istio"
    },
    {
      "id": "kubernetes-ingress-quiz-22",
      "type": "code-output",
      "question": "Given this Ingress with multiple paths, which request matches the '/admin' path?",
      "code": "apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: multi-path\nspec:\n  rules:\n  - host: example.com\n    http:\n      paths:\n      - path: /api\n        pathType: Prefix\n        backend:\n          service:\n            name: api-service\n            port:\n              number: 80\n      - path: /admin\n        pathType: Exact\n        backend:\n          service:\n            name: admin-service\n            port:\n              number: 80",
      "language": "yaml",
      "options": [
        "http://example.com/admin only",
        "http://example.com/admin and http://example.com/admin/users",
        "http://example.com/admin, http://example.com/administrator",
        "Any URL containing 'admin'"
      ],
      "answer": 0,
      "explanation": "With `pathType: Exact` on the '/admin' path, only exactly 'http://example.com/admin' matches. Requests like '/admin/users' would not match because Exact requires an exact path match, not a prefix.",
      "hint": "Exact means EXACT - nothing more, nothing less."
    },
    {
      "id": "kubernetes-ingress-quiz-23",
      "type": "mcq",
      "question": "What command creates a TLS Secret from certificate files for use with Ingress?",
      "options": [
        "kubectl create secret generic my-tls --from-file=tls.crt --from-file=tls.key",
        "kubectl create secret tls my-tls --cert=tls.crt --key=tls.key",
        "kubectl create configmap my-tls --from-file=tls.crt --from-file=tls.key",
        "kubectl apply -f tls-secret.yaml"
      ],
      "answer": 1,
      "explanation": "The correct command is `kubectl create secret tls <name> --cert=<cert-file> --key=<key-file>`. This creates a Secret with type 'kubernetes.io/tls' containing the properly named keys 'tls.crt' and 'tls.key'.",
      "hint": "There's a specific 'secret tls' subcommand for TLS certificates."
    },
    {
      "id": "kubernetes-ingress-quiz-24",
      "type": "multiple-select",
      "question": "Which statements about Ingress pathType are TRUE?",
      "options": [
        "Prefix matches any path starting with the specified prefix",
        "Exact matches only the exact path specified",
        "ImplementationSpecific behavior depends on the Ingress Controller",
        "Prefix is case-insensitive",
        "nginx supports regex patterns with ImplementationSpecific"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "Prefix matches path prefixes, Exact requires exact match, ImplementationSpecific is controller-dependent (nginx supports regex), and path matching is case-sensitive by default.",
      "hint": "Path matching is case-sensitive unless specified otherwise."
    },
    {
      "id": "kubernetes-ingress-quiz-25",
      "type": "true-false",
      "question": "After TLS termination at the Ingress Controller, traffic between the Ingress Controller and backend pods is encrypted by default.",
      "answer": false,
      "explanation": "False! After TLS termination at the Ingress Controller, traffic to backend Services/Pods is typically plain HTTP unless you explicitly configure end-to-end encryption. This is why TLS termination can simplify certificate management.",
      "hint": "Think about where 'termination' happens - what happens after that point?"
    },
    {
      "id": "kubernetes-ingress-quiz-26",
      "type": "code-completion",
      "question": "Complete this Ingress to route 'example.com/users' to 'users-service' and 'example.com/products' to 'products-service':",
      "instruction": "Fill in the missing path and service name",
      "codeTemplate": "apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: microservices\nspec:\n  ingressClassName: nginx\n  rules:\n  - host: example.com\n    http:\n      paths:\n      - path: /users\n        pathType: Prefix\n        backend:\n          service:\n            name: users-service\n            port:\n              number: 80\n      - path: _____\n        pathType: Prefix\n        backend:\n          service:\n            name: _____\n            port:\n              number: 80",
      "answer": "/products, products-service",
      "caseSensitive": false,
      "acceptedAnswers": ["/products, products-service"],
      "explanation": "To route 'example.com/products' to 'products-service', the path should be '/products' and the service name should be 'products-service'."
    },
    {
      "id": "kubernetes-ingress-quiz-27",
      "type": "mcq",
      "question": "What happens if you create an Ingress Resource but no Ingress Controller is installed in the cluster?",
      "options": [
        "The Ingress Resource is rejected and fails to create",
        "The Ingress Resource is created but does nothing (no routing occurs)",
        "Kubernetes automatically installs a default Ingress Controller",
        "The API server handles routing automatically"
      ],
      "answer": 1,
      "explanation": "The Ingress Resource will be created successfully but remain non-functional. Without an Ingress Controller to read and implement the routing rules, no traffic routing occurs. The resource just sits in etcd waiting for a controller.",
      "hint": "Ingress Resources are just declarations - they need a controller to implement them."
    },
    {
      "id": "kubernetes-ingress-quiz-28",
      "type": "flashcard",
      "question": "What are the key Ingress components and their responsibilities?",
      "answer": "**Ingress Resource:**\n- Defines routing rules (declarative config)\n- Specifies hosts, paths, and backend services\n- **Role:** What to route\n\n**IngressClass:**\n- Links Ingress Resources to specific Controllers\n- Allows multiple controllers in one cluster\n- **Role:** Which controller handles this Ingress\n\n**Ingress Controller:**\n- Implements the actual routing (runs nginx/ALB/Istio/etc.)\n- Watches Ingress resources and configures load balancer\n- **Role:** How to route (the implementation)\n\n**TLS Secret:**\n- Stores certificates and private keys\n- Referenced by Ingress for HTTPS termination\n- **Role:** Enables secure connections\n\n**Backend Service:**\n- Receives routed traffic from Ingress\n- ClusterIP service that forwards to Pods\n- **Role:** Final destination for requests"
    },
    {
      "id": "kubernetes-ingress-quiz-29",
      "type": "mcq",
      "question": "Which kubectl command shows the external IP assigned to an Ingress?",
      "options": [
        "kubectl get pods",
        "kubectl get services",
        "kubectl get ingress",
        "kubectl get endpoints"
      ],
      "answer": 2,
      "explanation": "`kubectl get ingress` (or `kubectl get ing`) shows Ingress resources including their assigned ADDRESS/external IP. Use `-w` flag to watch for IP assignment: `kubectl get ingress -w`.",
      "hint": "You want to see the Ingress resource itself."
    },
    {
      "id": "kubernetes-ingress-quiz-30",
      "type": "fill-blank",
      "question": "The annotation to force HTTP to HTTPS redirect in nginx Ingress is: nginx.ingress.kubernetes.io/_____: \"true\"",
      "answer": "force-ssl-redirect",
      "caseSensitive": true,
      "acceptedAnswers": ["force-ssl-redirect"],
      "explanation": "The annotation `nginx.ingress.kubernetes.io/force-ssl-redirect: \"true\"` forces all HTTP requests to redirect to HTTPS, a common security practice.",
      "hint": "It's about forcing SSL redirect."
    },
    {
      "id": "kubernetes-ingress-quiz-31",
      "type": "flashcard",
      "question": "Explain how to troubleshoot an Ingress that isn't routing traffic correctly. What should you check?",
      "answer": "**Ingress Troubleshooting Checklist:**\n\n**1. Verify Ingress Status:**\n```bash\nkubectl describe ingress <name>\n# Check: Address assigned? Rules correct? Backends listed?\n```\n\n**2. Verify IngressClass:**\n```bash\nkubectl get ingressclass\n# Does the IngressClass exist?\nkubectl get ingress <name> -o yaml | grep ingressClassName\n# Does Ingress reference the correct IngressClass?\n```\n\n**3. Check Ingress Controller:**\n```bash\nkubectl get pods -n ingress-nginx\n# Is controller running? Check logs for errors\nkubectl logs -n ingress-nginx <controller-pod>\n```\n\n**4. Verify Backend Service:**\n```bash\nkubectl get svc <backend-service>\nkubectl get endpoints <backend-service>\n# Service exists? Has endpoints (pods)?\n```\n\n**5. Check Pods:**\n```bash\nkubectl get pods -l app=<backend>\n# Pods running? Ready?\n```\n\n**6. Test Routing:**\n```bash\ncurl -H \"Host: api.example.com\" http://<ingress-ip>\n# Test host-based routing\ncurl http://<ingress-ip>/api\n# Test path-based routing\n```\n\n**7. Check DNS:**\n```bash\nnslookup api.example.com\n# Does domain resolve to Ingress IP?\n```\n\n**Common Issues:**\n- No Ingress Controller installed\n- IngressClass doesn't exist or wrong ingressClassName\n- Backend Service doesn't exist\n- No pods matching Service selector\n- DNS not pointing to Ingress IP"
    },
    {
      "id": "kubernetes-ingress-quiz-32",
      "type": "true-false",
      "question": "Istio is an Ingress Controller that replaces nginx or other traditional Ingress Controllers.",
      "answer": false,
      "explanation": "False! Istio itself is not an Ingress Controller - it's a service mesh. However, Istio includes an 'Ingress Gateway' component that acts like an Ingress Controller for north-south traffic while providing service mesh features.",
      "hint": "Istio is more than just an Ingress Controller."
    },
    {
      "id": "kubernetes-ingress-quiz-33",
      "type": "multiple-select",
      "question": "When should you use Service Mesh instead of Ingress?",
      "options": [
        "When you need HTTP/HTTPS routing from external clients",
        "When you need east-west traffic management (service-to-service)",
        "When you require mTLS between services",
        "When you need advanced observability and traffic splitting internally",
        "When you want a simple external entry point"
      ],
      "answers": [1, 2, 3],
      "explanation": "Service Mesh (like Istio, Linkerd) is for east-west traffic management, mTLS between services, and advanced internal features. Ingress is for north-south HTTP/HTTPS external access. They serve different purposes and often work together.",
      "hint": "Service Mesh is about internal service communication, not external access."
    },
    {
      "id": "kubernetes-ingress-quiz-34",
      "type": "code-output",
      "question": "With this configuration, what happens when a request to 'http://example.com/users' is made?",
      "code": "apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: test-ingress\nspec:\n  ingressClassName: nginx\n  defaultBackend:\n    service:\n      name: default-404\n      port:\n        number: 80\n  rules:\n  - host: example.com\n    http:\n      paths:\n      - path: /api\n        pathType: Prefix\n        backend:\n          service:\n            name: api-service\n            port:\n              number: 80",
      "language": "yaml",
      "options": [
        "Routes to api-service",
        "Routes to default-404 service (no matching path)",
        "Returns 404 error",
        "Routes to the first available service"
      ],
      "answer": 1,
      "explanation": "The request to '/users' doesn't match the defined path '/api', so it falls through to the defaultBackend which routes to the 'default-404' service. This is the purpose of defaultBackend - catching unmatched requests.",
      "hint": "What happens when no rule matches? Check the defaultBackend."
    }
  ]
}
{{< /quiz >}}
