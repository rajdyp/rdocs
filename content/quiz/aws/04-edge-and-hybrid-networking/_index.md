---
title: Edge and Hybrid Networking Quiz
linkTitle: Edge and Hybrid Networking
type: docs
weight: 4
prev: /quiz/aws/03-networking-fundamentals
next: /quiz/aws/05-compute-services
---

{{< quiz id="aws-edge-hybrid-networking-quiz" >}}
{
  "questions": [
    {
      "id": "aws-edge-hybrid-networking-quiz-01",
      "type": "mcq",
      "question": "In the DNS resolution flow, what role does Route 53 play?",
      "options": [
        "Root DNS Server",
        "TLD DNS Server",
        "Authoritative DNS Server",
        "DNS Resolver"
      ],
      "answer": 2,
      "explanation": "Route 53 acts as the **Authoritative DNS Server** that returns the final IP address for a domain. The DNS resolver (ISP), root servers, and TLD servers are all queried before reaching Route 53.",
      "hint": "Route 53 provides the final answer in the DNS query chain."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-02",
      "type": "multiple-select",
      "question": "Which Route 53 routing policies support health checks?",
      "options": [
        "Simple Routing",
        "Failover Routing",
        "Weighted Routing",
        "Multivalue Answer Routing",
        "Latency-Based Routing"
      ],
      "answers": [1, 3, 4],
      "explanation": "**Failover**, **Multivalue Answer**, and **Weighted Routing** (when configured) support health checks. Simple routing does not support health checks. Latency-based routing can use health checks but the question asks which inherently support them in their design.",
      "hint": "Think about which routing policies need to know if endpoints are healthy to make routing decisions."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-03",
      "type": "true-false",
      "question": "A Route 53 Alias record can be used at the zone apex (e.g., example.com) and there is no charge for Alias queries to AWS resources.",
      "answer": true,
      "explanation": "This is **true**. Alias records are a Route 53-specific feature that can be used at the zone apex (unlike CNAME records) and queries to AWS resources via Alias records are free.",
      "hint": "Alias records are specifically designed for AWS resource integration."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-04",
      "type": "fill-blank",
      "question": "Route 53 Private Hosted Zones contain records for routing traffic within ____ and responses are only visible within associated resources.",
      "answer": "VPCs",
      "caseSensitive": false,
      "explanation": "Private Hosted Zones route traffic within **VPCs** (Virtual Private Clouds). Unlike public hosted zones that are accessible from the internet, private hosted zones only work within specified VPCs.",
      "hint": "Think about AWS's private network isolation construct."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-05",
      "type": "code-output",
      "question": "A Route 53 weighted routing policy has two records: Record A (weight: 70) and Record B (weight: 30). If 1000 users make requests, approximately how many will be routed to Record B?",
      "code": "example.com → 203.0.113.5  (Weight: 70)\nexample.com → 203.0.113.10 (Weight: 30)\n\nTotal requests: 1000",
      "language": "text",
      "options": [
        "100 users",
        "200 users",
        "300 users",
        "700 users"
      ],
      "answer": 2,
      "explanation": "With a weight of 30 out of a total weight of 100 (70+30), Record B receives **30% of traffic**, which equals **300 users** out of 1000.",
      "hint": "Calculate the percentage: weight / total_weight × 100"
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-06",
      "type": "drag-drop",
      "question": "Arrange the DNS resolution steps in the correct order:",
      "instruction": "Drag to arrange from first to last step",
      "items": [
        "User types domain in browser",
        "DNS Resolver checks cache",
        "Query Root DNS Servers",
        "Query TLD DNS Servers",
        "Route 53 returns IP address",
        "User connects to IP address"
      ],
      "correctOrder": [0, 1, 2, 3, 4, 5],
      "explanation": "The correct DNS resolution flow is: User request → Resolver cache check → Root servers → TLD servers → Authoritative DNS (Route 53) → Connection to IP."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-07",
      "type": "mcq",
      "question": "What is the primary difference between CloudFront and Global Accelerator?",
      "options": [
        "CloudFront caches content at edge locations; Global Accelerator does not cache",
        "CloudFront is for TCP/UDP traffic; Global Accelerator is for HTTP/HTTPS",
        "CloudFront provides static IPs; Global Accelerator does not",
        "CloudFront requires health checks; Global Accelerator does not"
      ],
      "answer": 0,
      "explanation": "The key difference is that **CloudFront is a CDN that caches content**, while **Global Accelerator provides network layer acceleration without caching**. CloudFront is for HTTP/HTTPS, while Global Accelerator supports TCP/UDP and provides static anycast IPs.",
      "hint": "Think about whether content is stored at edge locations or just routed through them."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-08",
      "type": "multiple-select",
      "question": "Which are valid CloudFront origin types?",
      "options": [
        "S3 Bucket",
        "Application Load Balancer",
        "Lambda Function",
        "EC2 Instance",
        "Custom HTTP Server"
      ],
      "answers": [0, 1, 3, 4],
      "explanation": "Valid CloudFront origins include **S3 buckets**, **ALB/NLB**, **EC2 instances**, and **custom HTTP servers**. While Lambda@Edge can run at CloudFront edge locations, Lambda functions themselves are not origins.",
      "hint": "Origins must be HTTP/HTTPS endpoints that serve content."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-09",
      "type": "code-completion",
      "question": "Complete the AWS CLI command to invalidate all objects in a CloudFront distribution:",
      "instruction": "Fill in the missing parameter value",
      "codeTemplate": "aws cloudfront create-invalidation \\\n  --distribution-id E1234567890 \\\n  --paths _____",
      "answer": "\"/*\"",
      "caseSensitive": false,
      "acceptedAnswers": ["\"/*\"", "'/*'", "/*"],
      "explanation": "To invalidate all objects, use `--paths \"/*\"`. The wildcard `/*` matches all paths in the distribution. Note: The first 1,000 invalidations per month are free."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-10",
      "type": "flashcard",
      "question": "What is Origin Access Control (OAC) in CloudFront?",
      "answer": "**Origin Access Control (OAC)** is a CloudFront security feature that restricts S3 bucket access to only allow requests from CloudFront.\n\n**Purpose:** Prevents users from bypassing CloudFront and accessing S3 content directly.\n\n**Implementation:** Configure OAC on CloudFront distribution and update S3 bucket policy to allow only CloudFront access."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-11",
      "type": "true-false",
      "question": "CloudFront Regional Edge Caches are smaller than edge locations but improve cache hit ratio by serving as an intermediate layer.",
      "answer": false,
      "explanation": "This is **false**. Regional Edge Caches are **larger** than edge locations, not smaller. They serve as an intermediate caching layer between edge locations and the origin, improving cache hit ratio for less frequently accessed content.",
      "hint": "Think about the caching hierarchy from smallest to largest."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-12",
      "type": "mcq",
      "question": "Which Global Accelerator feature makes it ideal for gaming applications compared to CloudFront?",
      "options": [
        "Content caching at edge locations",
        "Static anycast IP addresses",
        "Support for signed URLs",
        "Geo-restriction capabilities"
      ],
      "answer": 1,
      "explanation": "**Static anycast IP addresses** are key for gaming applications. These IPs don't change and are automatically routed to the nearest healthy endpoint, providing consistent, low-latency connections without DNS changes. CloudFront uses dynamic IPs and is designed for content delivery, not real-time applications.",
      "hint": "Gaming clients need stable connection endpoints that don't require DNS lookups."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-13",
      "type": "multiple-select",
      "question": "What are the key components of an AWS Site-to-Site VPN architecture?",
      "options": [
        "Customer Gateway (on-premises device)",
        "Customer Gateway (AWS resource)",
        "Virtual Private Gateway or Transit Gateway",
        "Direct Connect Gateway",
        "IPsec VPN Tunnels"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "Site-to-Site VPN requires: **Customer Gateway device** (physical on-premises), **Customer Gateway** (AWS resource representation), **VGW or TGW** (AWS VPN endpoint), and **IPsec tunnels**. Direct Connect Gateway is for Direct Connect, not VPN.",
      "hint": "Think about what's needed to establish an encrypted tunnel between on-premises and AWS."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-14",
      "type": "code-output",
      "question": "A Site-to-Site VPN connection has two tunnels. What is the maximum throughput achievable?",
      "code": "VPN Connection:\n├─ Tunnel 1: 1.25 Gbps max\n├─ Tunnel 2: 1.25 Gbps max\n└─ Protocol: IPsec",
      "language": "text",
      "options": [
        "1.25 Gbps (single tunnel limit)",
        "2.5 Gbps (both tunnels combined)",
        "5 Gbps (with optimization)",
        "10 Gbps (with ECMP)"
      ],
      "answer": 0,
      "explanation": "Each VPN tunnel supports **up to 1.25 Gbps**. While two tunnels exist for redundancy, they don't aggregate bandwidth in standard configuration. The throughput is limited to **1.25 Gbps per tunnel**, making this the practical maximum.",
      "hint": "VPN tunnels are for redundancy, not load balancing in standard setup."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-15",
      "type": "fill-blank",
      "question": "In a Site-to-Site VPN with dynamic routing, ____ is used to automatically exchange routes between AWS and on-premises networks.",
      "answer": "BGP",
      "caseSensitive": false,
      "explanation": "**BGP (Border Gateway Protocol)** enables dynamic routing, automatically exchanging routes between AWS and on-premises. This eliminates manual route configuration and enables automatic failover.",
      "hint": "It's a standard routing protocol with a three-letter acronym."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-16",
      "type": "flashcard",
      "question": "What is the difference between Virtual Private Gateway (VGW) and Transit Gateway (TGW) for VPN connectivity?",
      "answer": "**Virtual Private Gateway (VGW):**\n- VPN concentrator on AWS side\n- One VGW per VPC\n- Use for single VPC connectivity\n\n**Transit Gateway (TGW):**\n- Centralized VPN hub\n- Connect VPN to multiple VPCs\n- Recommended for complex architectures\n- Simplifies network topology"
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-17",
      "type": "mcq",
      "question": "AWS Client VPN is primarily used for:",
      "options": [
        "Connecting two VPCs in different regions",
        "Connecting on-premises data center to AWS",
        "Providing remote user access to AWS and on-premises resources",
        "Connecting multiple AWS accounts"
      ],
      "answer": 2,
      "explanation": "**AWS Client VPN** is a managed client-based VPN service for **remote users** (laptops, mobile devices) to securely access AWS resources and on-premises networks. Site-to-Site VPN is for network-to-network connections.",
      "hint": "Think about individual users vs. entire networks."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-18",
      "type": "multiple-select",
      "question": "Which authentication methods does AWS Client VPN support?",
      "options": [
        "Active Directory",
        "SAML-based identity provider",
        "Certificate-based authentication",
        "IAM users",
        "API keys"
      ],
      "answers": [0, 1, 2],
      "explanation": "Client VPN supports: **Active Directory**, **SAML-based IdP** (like Okta), and **certificate-based authentication**. It does not use IAM users or API keys for user authentication.",
      "hint": "Think about enterprise authentication systems and PKI."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-19",
      "type": "true-false",
      "question": "AWS Direct Connect provides encrypted connectivity by default.",
      "answer": false,
      "explanation": "This is **false**. Direct Connect provides a **private connection but does not encrypt traffic by default**. For encryption, you must run a VPN connection over Direct Connect (VPN over DX).",
      "hint": "Private doesn't mean encrypted."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-20",
      "type": "drag-drop",
      "question": "Arrange the Direct Connect architecture components from on-premises to AWS:",
      "instruction": "Order from customer side to AWS side",
      "items": [
        "Corporate Network",
        "Customer Router at DX Location",
        "Direct Connect Router (AWS equipment)",
        "Virtual Interface (VIF)",
        "VPC Resources"
      ],
      "correctOrder": [0, 1, 2, 3, 4],
      "explanation": "The connection path is: Corporate Network → Customer Router (at DX location) → AWS Direct Connect Router → Virtual Interface → VPC Resources."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-21",
      "type": "mcq",
      "question": "What is a Virtual Interface (VIF) in Direct Connect?",
      "options": [
        "A physical network card in the customer router",
        "A logical connection running over the physical Direct Connect link",
        "A virtual machine that routes traffic",
        "A software-defined network overlay"
      ],
      "answer": 1,
      "explanation": "A **Virtual Interface (VIF)** is a **logical connection** that runs over a physical Direct Connect connection. VIFs enable access to different types of AWS resources (private VPC, public services, or Transit Gateway) using VLAN tagging and BGP.",
      "hint": "Think about how one physical connection supports multiple logical paths."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-22",
      "type": "multiple-select",
      "question": "Which statements about Direct Connect Virtual Interfaces are correct?",
      "options": [
        "Private VIF accesses VPC using private IPs",
        "Public VIF accesses AWS public services like S3",
        "Transit VIF connects to Transit Gateway",
        "Public VIF requires an Internet Gateway in your VPC",
        "Multiple VIFs can run over a single physical connection"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "**Private VIF** uses private IPs for VPC access, **Public VIF** accesses public AWS services (S3, DynamoDB) without internet, **Transit VIF** connects to TGW, and **multiple VIFs** can share one physical connection. Public VIF does NOT require an IGW—it accesses AWS public endpoints directly.",
      "hint": "VIFs are logical constructs that multiplex over the physical connection."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-23",
      "type": "code-completion",
      "question": "Complete the Direct Connect high availability strategy:",
      "instruction": "Fill in the recommended backup connectivity method",
      "codeTemplate": "On-Premises ─┬─ Direct Connect (Primary) ──┬─ AWS\n             └─ _____ (Backup) ─────────────┘",
      "answer": "Site-to-Site VPN",
      "caseSensitive": false,
      "acceptedAnswers": ["Site-to-Site VPN", "VPN", "S2S VPN"],
      "explanation": "The most **cost-effective redundancy** strategy is combining **Direct Connect (primary)** with **Site-to-Site VPN (backup)**. This provides automatic failover while managing costs better than dual Direct Connect."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-24",
      "type": "fill-blank",
      "question": "Direct Connect dedicated connections support speeds of 1 Gbps, 10 Gbps, and ____ Gbps.",
      "answer": "100",
      "caseSensitive": false,
      "explanation": "Direct Connect dedicated connections are available in **1 Gbps, 10 Gbps, and 100 Gbps** configurations. Hosted connections (through partners) support 50 Mbps to 10 Gbps.",
      "hint": "It's the highest speed tier available."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-25",
      "type": "flashcard",
      "question": "What are the benefits and limitations of AWS Direct Connect?",
      "answer": "**Benefits:**\n• Consistent network performance (low latency, low jitter)\n• Higher bandwidth (up to 100 Gbps)\n• Reduced data transfer costs\n• Private connectivity (not over internet)\n• Supports hybrid cloud architectures\n\n**Limitations:**\n• No encryption by default (need VPN over DX)\n• Longer setup time (weeks to months)\n• Higher cost (port hours + data transfer)\n• Requires presence at Direct Connect location or partner"
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-26",
      "type": "mcq",
      "question": "For maximum Direct Connect resilience, which architecture is recommended?",
      "options": [
        "Single Direct Connect connection",
        "Two Direct Connect connections in the same location",
        "Two Direct Connect connections in different locations",
        "One Direct Connect with CloudFront"
      ],
      "answer": 2,
      "explanation": "**Maximum resilience** requires **two Direct Connect connections in different geographic locations**. This protects against both connection failures and location-level failures (power, natural disasters, etc.).",
      "hint": "Consider what happens if an entire data center facility goes down."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-27",
      "type": "multiple-select",
      "question": "Which are valid use cases for CloudFront?",
      "options": [
        "Static website acceleration",
        "Video streaming",
        "Real-time gaming connections",
        "Software distribution",
        "API acceleration"
      ],
      "answers": [0, 1, 3, 4],
      "explanation": "CloudFront is ideal for **static websites**, **video streaming**, **software distribution**, and **API acceleration** (caching GET requests). **Real-time gaming** needs Global Accelerator due to requirements for static IPs and non-cacheable TCP/UDP traffic.",
      "hint": "CloudFront excels at delivering cacheable content over HTTP/HTTPS."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-28",
      "type": "true-false",
      "question": "Route 53 Geolocation Routing and Geoproximity Routing are the same feature with different names.",
      "answer": false,
      "explanation": "This is **false**. **Geolocation routing** routes based on the user's **geographic location** (continent, country). **Geoproximity routing** routes based on geographic location **with bias adjustments** (+/- values to shift traffic between regions).",
      "hint": "One allows you to manually adjust traffic distribution."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-29",
      "type": "mcq",
      "question": "What is the purpose of AWS Cloud WAN?",
      "options": [
        "A VPN service for remote workers",
        "A managed service for building global networks connecting cloud and on-premises",
        "A replacement for CloudFront",
        "A monitoring tool for network traffic"
      ],
      "answer": 1,
      "explanation": "**AWS Cloud WAN** is a **managed wide-area networking service** that simplifies building, managing, and monitoring **global networks** connecting AWS and on-premises environments with centralized policy management.",
      "hint": "Think about managing complex multi-region, multi-site networks from one place."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-30",
      "type": "multiple-select",
      "question": "Which AWS Network Firewall capabilities are available?",
      "options": [
        "Stateful packet inspection",
        "Intrusion prevention (IPS)",
        "Web filtering",
        "DDoS mitigation at network edge",
        "Domain filtering"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "AWS Network Firewall provides **stateful inspection**, **IPS**, **web filtering**, and **domain filtering**. While it helps with security, **DDoS mitigation at scale** is handled by AWS Shield, not Network Firewall.",
      "hint": "Network Firewall works at the VPC level, not at the global edge."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-31",
      "type": "code-output",
      "question": "Given this Route 53 health check configuration, how long until an endpoint is marked unhealthy?",
      "code": "Health Check Configuration:\n- Check interval: 30 seconds\n- Failure threshold: 3 consecutive failures\n- Protocol: HTTPS",
      "language": "text",
      "options": [
        "30 seconds",
        "60 seconds",
        "90 seconds",
        "120 seconds"
      ],
      "answer": 2,
      "explanation": "With a **30-second interval** and **3 consecutive failures** required, the endpoint will be marked unhealthy after **90 seconds** (30s × 3 = 90s).",
      "hint": "Multiply the interval by the number of failures needed."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-32",
      "type": "flashcard",
      "question": "What is the difference between Dedicated and Hosted Direct Connect connections?",
      "answer": "**Dedicated Connection:**\n- Physical Ethernet port dedicated to single customer\n- Speeds: 1 Gbps, 10 Gbps, 100 Gbps\n- Direct connection between customer router and AWS\n- Customer manages entire connection\n\n**Hosted Connection:**\n- Provided through AWS Direct Connect Partner\n- Speeds: 50 Mbps to 10 Gbps\n- Partner manages physical connection\n- More flexible, easier to provision"
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-33",
      "type": "mcq",
      "question": "Which Route 53 routing policy would be best for implementing a blue-green deployment with gradual traffic shift?",
      "options": [
        "Simple Routing",
        "Failover Routing",
        "Weighted Routing",
        "Geolocation Routing"
      ],
      "answer": 2,
      "explanation": "**Weighted Routing** is ideal for blue-green deployments and gradual traffic shifts. You can start with 90% blue/10% green, then gradually adjust weights to shift more traffic to green, enabling controlled rollouts and easy rollback.",
      "hint": "Think about which policy lets you control the percentage of traffic to each environment."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-34",
      "type": "true-false",
      "question": "CloudFront can only serve static content from S3 buckets.",
      "answer": false,
      "explanation": "This is **false**. CloudFront can serve both static and dynamic content from multiple origin types including **S3, ALB, EC2, and custom HTTP servers**. It can cache dynamic content with low TTLs or pass through uncached requests.",
      "hint": "CloudFront is more versatile than just an S3 CDN."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-35",
      "type": "multiple-select",
      "question": "Which factors can be included in a CloudFront cache key?",
      "options": [
        "URL path",
        "Query strings",
        "Request headers",
        "Client IP address",
        "Cookies"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "CloudFront cache keys can include: **URL path**, **query strings**, **headers** (selected), and **cookies** (selected). **Client IP address** is not part of the cache key but can be passed to origin via headers.",
      "hint": "Cache keys are based on request attributes that vary content."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-36",
      "type": "fill-blank",
      "question": "The first ____ CloudFront invalidations per month are free.",
      "answer": "1000",
      "caseSensitive": false,
      "explanation": "AWS provides the first **1,000 invalidation paths** free per month per distribution. After that, you pay per invalidation path.",
      "hint": "It's a four-digit number commonly used as a free tier limit."
    }
  ]
}
{{< /quiz >}}

