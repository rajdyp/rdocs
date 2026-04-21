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
      "type": "mcq",
      "question": "Which Route 53 routing policy does NOT support health checks?",
      "options": [
        "Failover Routing",
        "Latency-Based Routing",
        "Simple Routing",
        "Multivalue Answer Routing"
      ],
      "answer": 2,
      "explanation": "**Simple Routing** does not support health checks — it returns a single configured value regardless of endpoint health. All other major policies support health checks: **Failover Routing** requires them (it needs to know when to switch to the backup), **Latency-Based Routing** uses them to avoid sending traffic to unhealthy endpoints, and **Multivalue Answer Routing** only returns healthy IPs.",
      "hint": "One policy has no mechanism to react to endpoint failures at all."
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
      "acceptedAnswers": ["VPC", "VPCs"],
      "caseSensitive": false,
      "explanation": "Private Hosted Zones route traffic within **VPCs** (Virtual Private Clouds). Unlike public hosted zones that are accessible from the internet, private hosted zones only work within specified VPCs.",
      "hint": "Think about AWS's private network isolation construct."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-05",
      "type": "mcq",
      "question": "A Route 53 weighted routing policy has two records: Record A (203.0.113.5, weight 70) and Record B (203.0.113.10, weight 30). Out of 1000 total requests, approximately how many go to Record B?",
      "options": [
        "100 requests",
        "200 requests",
        "300 requests",
        "700 requests"
      ],
      "answer": 2,
      "explanation": "Record B has weight 30 out of a total weight of 100 (70 + 30), so it receives **30% of traffic**: 30% × 1000 = **300 requests**. Record A receives the remaining 700. A common mistake is selecting 700 — that is what Record A gets.",
      "hint": "Calculate the percentage: Record B weight / total weight × total requests."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-06",
      "type": "drag-drop",
      "question": "Arrange the DNS resolution steps in the correct order:",
      "instruction": "Drag to arrange from first to last step",
      "items": [
        "User types domain in browser",
        "Route 53",
        "DNS Resolver checks cache",
        "Query Root DNS Servers",
        "Query TLD DNS Servers",
        "User connects to IP address"
      ],
      "correctOrder": [0, 2, 3, 4, 1, 5],
      "explanation": "The correct DNS resolution flow is: User request → Resolver cache check → Root servers → TLD servers → Authoritative DNS returns IP address (Route 53) → Connection to IP."
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
        "Custom HTTP Server",
        "RDS Database instance"
      ],
      "answers": [0, 1, 3, 4],
      "explanation": "Valid CloudFront origins include **S3 buckets**, **ALB/NLB**, **EC2 instances**, and **custom HTTP servers**. Lambda functions are not origins — Lambda@Edge runs code at CloudFront edge locations but is not an origin server. **RDS databases** cannot be origins; they require an application layer (EC2, Lambda) in front of them to serve HTTP responses.",
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
      "answer": "**Origin Access Control (OAC)** is a CloudFront security feature that ensures only CloudFront can access S3 bucket origin.\n\n**Purpose:** Prevents users from bypassing CloudFront and accessing S3 content directly.\n\n**Implementation:** Configure OAC on CloudFront distribution and update S3 bucket policy to allow only CloudFront access."
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
        "IPsec VPN Tunnels",
        "Dedicated fiber connection at a colocation facility"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "Site-to-Site VPN requires: **Customer Gateway device** (physical on-premises router/firewall), **Customer Gateway** (AWS resource representing that device), **VGW or TGW** (AWS VPN endpoint), and **IPsec tunnels** (encrypted connections). Direct Connect Gateway is used with Direct Connect, not VPN. A dedicated fiber connection is how Direct Connect works — VPN runs over the regular internet using IPsec encryption.",
      "hint": "Think about what's needed to establish an encrypted tunnel between on-premises and AWS over the internet."
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
      "question": "A developer works remotely and needs secure access to EC2 instances in a private VPC subnet from their home laptop. Which AWS service should they use?",
      "options": [
        "AWS Site-to-Site VPN",
        "AWS Direct Connect",
        "AWS Client VPN",
        "VPC Peering with the developer's home network"
      ],
      "answer": 2,
      "explanation": "**AWS Client VPN** is a managed client-based VPN for **individual remote users** (laptops, mobile devices) to securely access AWS and on-premises resources. Site-to-Site VPN connects entire networks (e.g., an office to AWS), not individual users. Direct Connect requires dedicated physical infrastructure provisioned weeks in advance. VPC Peering connects VPCs to each other — home networks are not VPCs.",
      "hint": "Think about individual users vs. entire networks connecting."
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
        "Username/password (basic) authentication"
      ],
      "answers": [0, 1, 2],
      "explanation": "Client VPN supports: **Active Directory**, **SAML-based IdP** (like Okta), and **certificate-based authentication**. It does not use IAM users for VPN authentication. Basic username/password authentication is not a supported method — Client VPN requires one of the three enterprise-grade mechanisms above.",
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
        "Direct Connect Router (AWS equipment)",
        "Customer Router at DX Location",
        "VPC Resources",
        "Virtual Interface (VIF)"
      ],
      "correctOrder": [0, 2, 1, 4, 3],
      "explanation": "The connection path is: Corporate Network → Customer Router (at DX location) → AWS Direct Connect Router → Virtual Interface → VPC Resources."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-21",
      "type": "mcq",
      "question": "A company has one Direct Connect physical connection. They need to access both private EC2 instances in a VPC and public AWS services like S3 over the same link. What enables this?",
      "options": [
        "They must order a second physical connection dedicated to public service access",
        "Virtual Interfaces (VIFs) — a Private VIF for VPC access and a Public VIF for S3",
        "A Transit Gateway that routes between the VPC and AWS public service endpoints",
        "VPC Gateway Endpoints for S3, which extend the Direct Connect scope automatically"
      ],
      "answer": 1,
      "explanation": "**Virtual Interfaces (VIFs)** are logical connections running over a single physical Direct Connect link, using VLAN tagging to separate traffic. A **Private VIF** accesses VPC resources via private IPs; a **Public VIF** accesses AWS public services (S3, DynamoDB) without going through the internet. Multiple VIFs can share one physical connection. A second physical connection is not required. Transit Gateway routes between VPCs, not between VPC and public AWS services. VPC Gateway Endpoints work at the VPC network level independently of Direct Connect.",
      "hint": "One physical connection can carry logically separate traffic streams."
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
        "Multiple VIFs can run over a single physical connection",
        "Private VIF can directly access public AWS services like S3"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "**Private VIF** uses private IPs for VPC access, **Public VIF** accesses public AWS services (S3, DynamoDB) without internet, **Transit VIF** connects to TGW, and **multiple VIFs** can share one physical connection. Public VIF does NOT require an IGW — it accesses AWS public endpoints directly over the Direct Connect link. Private VIF cannot access public AWS services directly — that requires a Public VIF.",
      "hint": "VIFs are logical constructs that multiplex over the physical connection, each with a specific purpose."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-23",
      "type": "code-completion",
      "question": "Complete the Direct Connect high availability strategy:",
      "instruction": "Fill in the recommended backup connectivity method",
      "codeTemplate": "On-Premises ─┬─ Direct Connect (Primary) ──┬─ AWS\n             └──────── (Backup) ────────────┘",
      "answer": "Site-to-Site VPN",
      "caseSensitive": false,
      "acceptedAnswers": ["Site-to-Site VPN", "VPN", "AWS Site-to-Site VPN"],
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
      "answer": "**Benefits:**\n- Consistent network performance (low latency, low jitter)\n- Higher bandwidth (up to 100 Gbps)\n- Reduced data transfer costs\n- Private connectivity (not over internet)\n- Supports hybrid cloud architectures\n\n**Limitations:**\n- No encryption by default (need VPN over DX)\n- Longer setup time (weeks to months)\n- Higher cost (port hours + data transfer)\n- Requires presence at Direct Connect location or partner"
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-26",
      "type": "mcq",
      "question": "For maximum Direct Connect resilience, which architecture is recommended?",
      "options": [
        "Two Direct Connect connections at the same location, from different providers",
        "Two Direct Connect connections in the same location",
        "Two Direct Connect connections in different locations",
        "One Direct Connect with CloudFront as failover"
      ],
      "answer": 2,
      "explanation": "**Maximum resilience** requires **two Direct Connect connections in different geographic locations**. Using the same location — even with different providers — still exposes you to a single point of failure: a power outage, fire, or physical access issue at that facility affects both connections. CloudFront is a CDN, not a Direct Connect failover mechanism.",
      "hint": "Consider what happens if an entire data center facility goes down, regardless of how many providers are in it."
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
        "API acceleration",
        "VoIP and real-time audio/video communication"
      ],
      "answers": [0, 1, 3, 4],
      "explanation": "CloudFront is ideal for **static websites**, **video streaming**, **software distribution**, and **API acceleration** (caching GET requests). **Real-time gaming** needs Global Accelerator due to requirements for static IPs and non-cacheable TCP/UDP traffic. **VoIP and real-time audio/video** also require Global Accelerator — CloudFront's HTTP/HTTPS caching layer adds latency and doesn't support the UDP protocols these applications depend on.",
      "hint": "CloudFront excels at delivering cacheable content over HTTP/HTTPS."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-28",
      "type": "true-false",
      "question": "Route 53 Geolocation Routing and Geoproximity Routing are the same feature with different names.",
      "answer": false,
      "explanation": "This is **false**. They work differently:\n\n- **Geolocation** — rule-based. You explicitly map locations to endpoints. User in Germany → Frankfurt endpoint.\n- **Geoproximity** — distance-based. Routes to the nearest resource automatically. Use **bias** values (+/-) to shift traffic boundaries between regions.",
      "hint": "One allows you to manually adjust traffic distribution."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-29",
      "type": "mcq",
      "question": "A multinational company operates VPCs in 6 AWS regions, 4 on-premises data centers, and 3 partner SD-WAN networks. They want centralized, policy-based management of all connectivity from a single dashboard. Which service is designed for this?",
      "options": [
        "Transit Gateway deployed independently per region, interconnected via TGW peering",
        "AWS Cloud WAN",
        "AWS Direct Connect with individual connections per site",
        "AWS Site-to-Site VPN configured in a hub-and-spoke topology"
      ],
      "answer": 1,
      "explanation": "**AWS Cloud WAN** is a managed wide-area networking service for building, managing, and monitoring **global networks** with centralized policy across multiple AWS regions, on-premises, and SD-WAN. Per-region Transit Gateways require manual peering and lack a unified policy framework. Direct Connect and Site-to-Site VPN are point-to-point connectivity options — they don't provide global topology management.",
      "hint": "Think about managing complex multi-region, multi-site networks from one place."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-30",
      "type": "multiple-select",
      "question": "Which of the following security features does AWS Network Firewall provide?",
      "options": [
        "Stateful packet inspection",
        "Intrusion prevention (IPS)",
        "Web filtering",
        "DDoS mitigation at network edge",
        "Domain filtering",
        "TLS/SSL certificate provisioning and management"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "AWS Network Firewall provides **stateful inspection**, **IPS**, **web filtering**, and **domain filtering**. **DDoS mitigation at scale** is handled by AWS Shield, not Network Firewall — Network Firewall operates at the VPC level and is not designed for volumetric DDoS absorption. **TLS/SSL certificate management** is handled by AWS Certificate Manager (ACM), not Network Firewall.",
      "hint": "Network Firewall works at the VPC level on traffic content and patterns — not at the global edge or certificate layer."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-31",
      "type": "mcq",
      "question": "A Route 53 health check is configured with a 30-second check interval and a failure threshold of 3 consecutive failures. An endpoint goes down. How long until Route 53 marks it unhealthy and begins routing traffic away?",
      "options": [
        "30 seconds",
        "60 seconds",
        "90 seconds",
        "120 seconds"
      ],
      "answer": 2,
      "explanation": "With a **30-second interval** and **3 consecutive failures** required, the endpoint is marked unhealthy after **90 seconds** (30s × 3 = 90s). This lag matters for SLA planning — DNS-based failover is not instantaneous. Reducing to a 10-second fast health check with 3 failures cuts this to 30 seconds, but at higher cost.",
      "hint": "Multiply the check interval by the number of consecutive failures needed."
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
        "Latency-Based Routing",
        "Failover Routing",
        "Weighted Routing",
        "Geolocation Routing"
      ],
      "answer": 2,
      "explanation": "**Weighted Routing** is ideal for blue-green deployments. Start with 90% blue / 10% green, then gradually adjust the weights to shift more traffic as confidence grows, enabling controlled rollouts and easy rollback. **Latency-Based Routing** optimizes for the fastest endpoint but cannot control traffic percentages — it doesn't let you say \"send exactly 10% to green.\" **Failover Routing** switches all traffic when the primary fails — not a gradual shift. **Geolocation Routing** locks users to endpoints by geography.",
      "hint": "Think about which policy lets you precisely control the percentage of traffic to each environment."
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
        "Cookies",
        "Request body content (for POST requests)"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "CloudFront cache keys can include: **URL path**, **query strings**, **headers** (selected), and **cookies** (selected). **Client IP address** is not part of the cache key — it can be forwarded to the origin via headers, but using it as a cache key would prevent sharing cached responses between users. **Request body** (POST) is not cacheable in CloudFront — POST requests bypass the cache entirely.",
      "hint": "Cache keys are based on request attributes that determine what a unique cacheable object looks like."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-36",
      "type": "fill-blank",
      "question": "The first ____ CloudFront invalidations per month are free.",
      "answer": "1000",
      "caseSensitive": false,
      "explanation": "AWS provides the first **1,000 invalidation paths** free per month per distribution. After that, you pay per invalidation path.",
      "hint": "It's a four-digit number commonly used as a free tier limit."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-37",
      "type": "mcq",
      "question": "A startup must connect their on-premises office to a VPC within 48 hours. They need encrypted connectivity and can tolerate up to 1 Gbps throughput. Which hybrid connectivity solution fits best?",
      "options": [
        "AWS Direct Connect dedicated connection — private, high-bandwidth, and consistent",
        "AWS Site-to-Site VPN — provisions in hours over the internet with IPsec encryption",
        "AWS Client VPN — secure per-user access to VPC resources",
        "AWS Transit Gateway — routes traffic between on-premises and multiple VPCs"
      ],
      "answer": 1,
      "explanation": "**AWS Site-to-Site VPN** provisions in hours, encrypts traffic with IPsec by default, and supports up to 1.25 Gbps per tunnel — all requirements met. **Direct Connect** takes weeks to months to provision a dedicated physical circuit; impossible in 48 hours. **Client VPN** connects individual remote users, not entire office networks. **Transit Gateway** is a network routing hub — it works with VPN or Direct Connect but does not itself establish connectivity between on-premises and AWS.",
      "hint": "Think about which option can be provisioned in hours vs. weeks."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-38",
      "type": "true-false",
      "question": "A CNAME record can be created at the zone apex (e.g., example.com) to point to another domain name.",
      "answer": false,
      "explanation": "This is **false**. The DNS specification prohibits CNAME records at the zone apex because the apex must also have SOA and NS records, and a CNAME cannot coexist with any other record type on the same name. A common mistake is trying to create `example.com → CNAME → my-alb.elb.amazonaws.com`. The fix is to use a **Route 53 Alias record**, which behaves like a CNAME, works at the zone apex, and is free for queries to AWS resources. CNAMEs work fine on subdomains like `www.example.com`.",
      "hint": "CNAME has a DNS spec restriction at the apex — Route 53 offers a proprietary alternative."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-39",
      "type": "mcq",
      "question": "A company monitors three separate Route 53 health checks — one each for their web tier, app tier, and database tier. They want Route 53 to mark the application as healthy only when ALL three checks pass. Which Route 53 health check type enables this?",
      "options": [
        "Endpoint health check with a composite protocol rule",
        "CloudWatch Alarm health check aggregating all three metrics",
        "Calculated health check using AND logic",
        "Failover health check with a primary and secondary threshold"
      ],
      "answer": 2,
      "explanation": "**Calculated health checks** combine multiple existing Route 53 health checks using **AND**, **OR**, or **NOT** logic. AND logic requires all child checks to pass before the parent is healthy. **Endpoint health checks** each monitor a single endpoint — they have no mechanism to aggregate other checks. **CloudWatch Alarm health checks** monitor the state of a CloudWatch alarm metric, not a collection of Route 53 checks. **Failover health check** is not a Route 53 health check type — Failover Routing Policy uses health checks to switch endpoints but does not combine multiple checks into one.",
      "hint": "Route 53 has a health check type specifically designed to aggregate other checks with boolean logic."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-40",
      "type": "mcq",
      "question": "A video streaming platform wants to restrict its entire content library (thousands of videos) to paid subscribers only. Once a subscriber authenticates, they should be able to stream any video without per-file restrictions. Which CloudFront access control mechanism is correct?",
      "options": [
        "Signed URLs — generate one URL per video request for each subscriber",
        "Signed Cookies — set once at login and grant access to the full library for the session",
        "Origin Access Control (OAC) — restrict S3 bucket access to CloudFront only",
        "Geo-restriction — limit content delivery to countries where the service is licensed"
      ],
      "answer": 1,
      "explanation": "**Signed Cookies** are designed for exactly this scenario: the user authenticates once and receives a cookie that grants access to multiple files for the session — no per-video URL generation needed. **Signed URLs** are ideal for single-file access (e.g., sharing a download link to one document), but generating thousands of them per subscriber session is impractical. **OAC** controls whether S3 allows CloudFront to fetch content at all — it does not differentiate between authenticated and unauthenticated users at the CloudFront layer. **Geo-restriction** controls access by country, not by subscription status.",
      "hint": "One mechanism works per-file; the other works for the entire session."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-41",
      "type": "mcq",
      "question": "A team needs Route 53 to return multiple IP addresses in a single DNS response and automatically exclude unhealthy endpoints from those responses. Which routing policy meets both requirements?",
      "options": [
        "Simple Routing configured with multiple IP values",
        "Weighted Routing with equal weights on each record",
        "Multivalue Answer Routing with health checks enabled",
        "Latency-Based Routing with health check integration"
      ],
      "answer": 2,
      "explanation": "**Multivalue Answer Routing** returns up to 8 records per response and supports health checks — unhealthy endpoints are automatically excluded. The client receives multiple healthy IPs and can load balance or retry among them. **Simple Routing** can store multiple values but does **not** support health checks — it returns all configured IPs regardless of endpoint health, including ones that are down. **Weighted Routing** assigns traffic percentages to separate records and returns one IP per query, not multiple. **Latency-Based Routing** selects the single lowest-latency endpoint per query; it does not return a set of IPs.",
      "hint": "The key distinction from Simple Routing is built-in health check support."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-42",
      "type": "fill-blank",
      "question": "AWS Client VPN is built on the ____ open-source VPN protocol, which users must install a compatible client for.",
      "answer": "OpenVPN",
      "acceptedAnswers": ["OpenVPN", "openvpn"],
      "caseSensitive": false,
      "explanation": "Client VPN is a managed **OpenVPN** service. Users install an OpenVPN-compatible client — such as the AWS-provided VPN client, Tunnelblick (macOS), or OpenVPN Connect — to establish the encrypted tunnel. This is why Client VPN supports certificate-based authentication and SAML IdPs that integrate with OpenVPN clients.",
      "hint": "It's a popular open-source VPN protocol, also the name of the company behind it."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-43",
      "type": "mcq",
      "question": "An application uses Route 53 Failover Routing with a 60-second TTL. The team claims switching to AWS Global Accelerator would enable sub-second failover. Are they correct, and why?",
      "options": [
        "No — Global Accelerator also relies on DNS TTL expiry for failover, so behavior is identical",
        "Yes — Global Accelerator detects failures via health checks and reroutes traffic at the network layer without waiting for DNS TTL to expire",
        "Yes — Global Accelerator's anycast IPs eliminate the need for health checks entirely",
        "No — Global Accelerator is slower because it must propagate routing changes to all edge locations worldwide"
      ],
      "answer": 1,
      "explanation": "The team is **correct**. With Route 53 + 60s TTL, failover takes at least 60 seconds and often longer because DNS resolvers may cache beyond TTL — clients cannot reach the new endpoint until their cached record expires. **Global Accelerator** uses static anycast IPs (no DNS change ever needed) and health checks that trigger rerouting at the **AWS network layer in seconds**. Users' connections shift without waiting for any DNS cache to expire. This makes Global Accelerator the right choice for applications with strict availability SLAs that cannot tolerate DNS-based failover delays. Health checks are still required — GA doesn't eliminate them, it just acts on them faster.",
      "hint": "The key difference is whether failover waits for DNS caches to expire."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-44",
      "type": "multiple-select",
      "question": "Which CloudFront features specifically control who can access your content or restrict content access by identity or location?",
      "options": [
        "Signed URLs",
        "Origin Access Control (OAC)",
        "Signed Cookies",
        "Regional Edge Caches",
        "Geo-restriction",
        "Minimum TLS version configuration"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "**Signed URLs** grant time-limited access to individual files. **OAC** ensures only CloudFront can fetch from the S3 origin, preventing direct S3 access. **Signed Cookies** grant session-based access to multiple files for authenticated users. **Geo-restriction** blocks or allows content delivery based on the user's country. **Regional Edge Caches** are an intermediate caching layer for performance — they have no access control role. **Minimum TLS version** enforces encryption standards for in-transit security but does not control *who* can access content, only *how* the connection is secured.",
      "hint": "Focus on features that gate access based on identity or geography, not on encryption or performance."
    },
    {
      "id": "aws-edge-hybrid-networking-quiz-45",
      "type": "mcq",
      "question": "A company configures Route 53 Geolocation Routing with explicit records for North America and Europe only. A user from Southeast Asia queries the domain. What does Route 53 return?",
      "options": [
        "The Europe record — it routes to the geographically nearest configured location",
        "Either the North America or Europe record, chosen at random",
        "No answer — Route 53 returns nothing if no default record is configured and the location doesn't match",
        "Route 53 automatically falls back to Simple Routing for unmatched locations"
      ],
      "answer": 2,
      "explanation": "**Geolocation Routing is explicit mapping, not proximity-based.** If a user's location doesn't match any configured geographic rule and there is no default record, Route 53 returns no answer — the domain is effectively unreachable for that user. Routing to the 'nearest' geographic record is how **Geoproximity Routing** works, not Geolocation. There is no automatic fallback to Simple Routing. The best practice is to always configure a **default record** in Geolocation Routing to catch all locations without explicit rules, preventing unexpected outages for unmatched regions.",
      "hint": "Geolocation requires an explicit match — there is no automatic nearest-neighbor fallback."
    }
  ]
}
{{< /quiz >}}


