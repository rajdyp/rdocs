---
title: Edge and Hybrid Networking
linkTitle: Edge and Hybrid Networking
type: docs
weight: 4
prev: /aws/03-networking-fundamentals
next: /aws/05-compute-services
---

## Overview

While VPCs provide the foundation for networking within AWS, many architectures require additional capabilities: global content delivery, DNS management, and connectivity between AWS and on-premises infrastructure.

Edge networking services bring applications closer to users worldwide, reducing latency and improving performance through AWS's global network of edge locations. Hybrid networking solutions bridge the gap between cloud and on-premises environments, enabling organizations to extend their existing data centers into AWS while maintaining secure, reliable connectivity. 

Together, these services solve critical challenges in modern distributed architectures: delivering content at global scale, routing traffic intelligently, and integrating cloud resources seamlessly with existing enterprise infrastructure.

## Edge Networking Services

### Amazon Route 53

**Amazon Route 53** is a highly available and scalable Domain Name System (DNS) web service designed to route end users to internet applications.

#### Route 53 Core Concepts

**DNS Fundamentals:**
```
DNS Resolution Flow

User types: www.example.com in browser
         │
         ▼
┌────────────────────────────────────┐
│  1. DNS Resolver (ISP)             │
│     Checks cache                   │
└────────┬───────────────────────────┘
         │ (if not cached)
         ▼
┌────────────────────────────────────┐
│  2. Root DNS Servers               │
│     Returns .com nameserver        │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  3. TLD DNS Servers (.com)         │
│     Returns example.com nameserver │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  4. Route 53 (Authoritative DNS)   │
│     Returns IP address             │
│     (e.g., 54.239.28.176)          │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  5. User connects to IP address    │
│     Application responds           │
└────────────────────────────────────┘
```

#### Hosted Zones

A **hosted zone** is a container for DNS records for a specific domain.

**Public Hosted Zones:**
- Contain records for routing internet traffic
- Responses visible to anyone on the internet
- Example: `example.com` → `203.0.113.5`

**Private Hosted Zones:**
- Contain records for routing traffic within VPCs
- Responses only visible within associated VPCs
- Example: `database.internal` → `10.0.1.50`

```
┌─────────────────────────────────────────────────────────────┐
│              Public Hosted Zone                             │
├─────────────────────────────────────────────────────────────┤
│  Domain: example.com                                        │
│                                                             │
│  Records:                                                   │
│  example.com           A      203.0.113.5                   │
│  www.example.com       CNAME  example.com                   │
│  api.example.com       A      203.0.113.10                  │
│  mail.example.com      MX     10 mail-server.example.com    │
│                                                             │
│  Accessible from: Internet                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Private Hosted Zone                            │
├─────────────────────────────────────────────────────────────┤
│  Domain: internal.example.com                               │
│  Associated VPCs: vpc-12345, vpc-67890                      │
│                                                             │
│  Records:                                                   │
│  db.internal.example.com       A    10.0.1.50               │
│  app.internal.example.com      A    10.0.2.20               │
│  cache.internal.example.com    A    10.0.3.30               │
│                                                             │
│  Accessible from: VPCs only                                 │
└─────────────────────────────────────────────────────────────┘
```

#### DNS Record Types

**A Record** - Maps domain to IPv4 address
```
example.com  →  203.0.113.5
```

**AAAA Record** - Maps domain to IPv6 address
```
example.com  →  2001:0db8:85a3::8a2e:0370:7334
```

**CNAME Record** - Maps domain to another domain (alias)
```
www.example.com  →  example.com
```

**MX Record** - Mail exchange servers
```
example.com  →  10 mail.example.com
```

**TXT Record** - Text information (SPF, DKIM, verification)
```
example.com  →  "v=spf1 include:_spf.google.com ~all"
```

**NS Record** - Name server records
```
example.com  →  ns-1234.awsdns-12.org
```

**Alias Record** (Route 53 specific)
- Maps to AWS resources (ELB, CloudFront, S3)
- No charge for Alias queries to AWS resources
- Can be used at zone apex (example.com)
```
example.com  →  ALIAS  my-loadbalancer-1234.us-east-1.elb.amazonaws.com
```

#### Routing Policies

**Simple Routing**
- Single resource for a domain
- No health checks
```
example.com  →  203.0.113.5
```

**Weighted Routing**
- Route traffic based on assigned weights
- Use case: A/B testing, gradual deployments
```
example.com  →  203.0.113.5  (Weight: 70)
example.com  →  203.0.113.10 (Weight: 30)

Result: 70% of traffic to .5, 30% to .10
```

**Latency-Based Routing**
- Route based on lowest network latency
- Use case: Global applications
```
example.com  →  us-east-1  →  203.0.113.5
example.com  →  eu-west-1  →  198.51.100.10
example.com  →  ap-south-1 →  192.0.2.15

Route 53 directs user to lowest latency endpoint
```

**Failover Routing**
- Active-passive failover
- Requires health checks
```
example.com  →  Primary:   203.0.113.5    (Health check: HC-1)
example.com  →  Secondary: 203.0.113.10   (Used if primary fails)
```

**Geolocation Routing**
- Route based on user's geographic location
- Use case: Content localization, compliance
```
example.com  →  North America  →  203.0.113.5
example.com  →  Europe         →  198.51.100.10
example.com  →  Default        →  192.0.2.15
```

**Geoproximity Routing**
- Route based on geographic location with bias
- Use case: Shift traffic between regions
```
example.com  →  us-east-1  (Bias: +20)
example.com  →  eu-west-1  (Bias: -20)

Positive bias: Attract more traffic
Negative bias: Reduce traffic
```

**Multivalue Answer Routing**
- Return multiple IP addresses
- Supports health checks
```
example.com  →  203.0.113.5   (Health check: HC-1)
example.com  →  203.0.113.10  (Health check: HC-2)
example.com  →  203.0.113.15  (Health check: HC-3)

Returns up to 8 healthy records
```

#### Health Checks

Route 53 health checks monitor the health of resources:

```
┌─────────────────────────────────────────────────────────────┐
│                  Health Check Types                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Endpoint Health Checks                                     │
│  ├─ Monitor endpoint (IP or domain)                         │
│  ├─ Protocol: HTTP, HTTPS, TCP                              │
│  ├─ Check interval: 30s (standard) or 10s (fast)            │
│  └─ Threshold: Number of consecutive failures               │
│                                                             │
│  Calculated Health Checks                                   │
│  ├─ Combine multiple health checks                          │
│  ├─ AND, OR, NOT logic                                      │
│  └─ Example: All endpoints healthy OR backup healthy        │
│                                                             │
│  CloudWatch Alarm Health Checks                             │
│  ├─ Monitor CloudWatch alarm state                          │
│  └─ Example: CPU utilization, custom metrics                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Traffic Flow Example

```
Global Traffic Routing with Route 53

                        [User in US]
                             │
                    Route 53 DNS Query
                             │
                ┌────────────┴────────────┐
                │   Route 53              │
                │   Latency-Based Routing │
                └────────────┬────────────┘
                             │
                Lowest latency endpoint
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    [us-east-1]         [eu-west-1]         [ap-south-1]
         │                   │                   │
    ALB (Primary)        ALB (Backup)       ALB (Backup)
         │
    Health Check: OK
         │
    Return IP: 203.0.113.5
```

### Amazon CloudFront

**Amazon CloudFront** is a content delivery network (CDN) service that securely delivers data, videos, applications, and APIs globally with low latency and high transfer speeds.

#### CloudFront Architecture

```
┌────────────────────────────────────────────────────────────┐
│              CloudFront Architecture                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  User (US)   │  │ User (EU)    │  │ User (Asia)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │              │
│         │ Request         │ Request         │ Request      │
│         ▼                 ▼                 ▼              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Edge Location│  │ Edge Location│  │ Edge Location│      │
│  │ (N. Virginia)│  │ (London)     │  │ (Singapore)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │              │
│         │ Cache Miss?     │ Cache Miss?     │ Cache Miss?  │
│         └─────────────────┴─────────────────┘              │
│                           │                                │
│                           │ Fetch from Origin              │
│                           ▼                                │
│                  ┌─────────────────┐                       │
│                  │     Origin      │                       │
│                  │  - S3 Bucket    │                       │
│                  │  - ALB          │                       │
│                  │  - EC2          │                       │
│                  │  - Custom       │                       │
│                  └─────────────────┘                       │
│                                                            │
│  Cache Hit: Serve from edge (fast, low latency)            │
│  Cache Miss: Fetch from origin, cache, then serve          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### CloudFront Core Concepts

**Distribution**
- Configuration that tells CloudFront where your content originates and details about how to track and manage content delivery

**Edge Locations**
- Data centers worldwide that cache copies of your content
- Automatically routes users to nearest edge location

**Regional Edge Caches**
- Intermediate caching layer between edge locations and origin
- Larger cache than edge locations
- Improves cache hit ratio

**Origin**
- Source of the original, definitive version of content
- Can be S3, HTTP server (ALB, EC2), or custom origin

#### CloudFront Origin Types

**S3 Origin**
```
CloudFront Distribution
├─ Origin: my-bucket.s3.amazonaws.com
├─ Origin Access Control (OAC): Enabled
└─ S3 Bucket Policy: Allow CloudFront only

Use case: Static website, images, videos
```

**Custom Origin (ALB/NLB)**
```
CloudFront Distribution
├─ Origin: my-alb-1234.us-east-1.elb.amazonaws.com
├─ Protocol: HTTPS
├─ Origin Headers: X-Custom-Header
└─ Security Group: Allow CloudFront prefix list

Use case: Dynamic content, API, application
```

#### Caching Behavior

```
Cache Control

Request Path          TTL      Cache Key
-------------------------------------------------------
/images/*            86400s   Path + Query String
/api/*               0s       No caching
/css/*               3600s    Path only
Default (*)          300s     Path + Query String

Cache Key Components:
- URL path
- Query strings (optional)
- Headers (optional)
- Cookies (optional)
```

**Cache Invalidation:**
```bash
# Invalidate specific objects
aws cloudfront create-invalidation \
  --distribution-id E1234567890 \
  --paths /images/photo.jpg /css/style.css

# Invalidate all objects
aws cloudfront create-invalidation \
  --distribution-id E1234567890 \
  --paths "/*"

Note: First 1,000 invalidations per month are free
```

#### CloudFront Security Features

**HTTPS/TLS**
- Support for custom SSL certificates
- SNI (Server Name Indication) for multiple domains
- Minimum TLS version configuration

**Access Control**
- Signed URLs: Time-limited access to content
- Signed Cookies: Access to multiple files
- Origin Access Control (OAC): Restrict S3 access to CloudFront only
- Geo-restriction: Block content in specific countries

**AWS WAF Integration**
- Protect against common web exploits
- Custom rules for filtering requests

**DDoS Protection**
- AWS Shield Standard (automatic)
- AWS Shield Advanced (optional)

#### CloudFront Use Cases

```
┌─────────────────────────────────────────────────────────────┐
│              CloudFront Use Cases                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Static Website Acceleration                                │
│  Origin: S3 → Edge Locations → Global Users                 │
│  Benefits: Low latency, reduced origin load                 │
│                                                             │
│  Video Streaming                                            │
│  Origin: S3/MediaPackage → CloudFront → Viewers             │
│  Benefits: Smooth streaming, cost-effective                 │
│                                                             │
│  API Acceleration                                           │
│  Origin: ALB/API Gateway → CloudFront → API Clients         │
│  Benefits: Reduced latency for global API consumers         │
│                                                             │
│  Dynamic Content                                            │
│  Origin: ALB → CloudFront (minimal TTL) → Users             │
│  Benefits: SSL termination at edge, DDoS protection         │
│                                                             │
│  Software Distribution                                      │
│  Origin: S3 → CloudFront → Download requests                │
│  Benefits: Fast downloads, reduced S3 data transfer costs   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### AWS Global Accelerator

**AWS Global Accelerator** improves application availability and performance by routing traffic through AWS's global network infrastructure using static anycast IP addresses (bypassing the public internet).

#### Global Accelerator vs CloudFront

```
┌─────────────────────────────────────────────────────────────┐
│        CloudFront vs Global Accelerator                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CloudFront                                                 │
│  ├─ Content delivery (caching)                              │
│  ├─ HTTP/HTTPS traffic                                      │
│  ├─ Improves cacheable content performance                  │
│  └─ Use case: Websites, APIs, video streaming               │
│                                                             │
│  Global Accelerator                                         │
│  ├─ Network layer acceleration (no caching)                 │
│  ├─ TCP/UDP traffic                                         │
│  ├─ Static anycast IPs                                      │
│  ├─ Health checks and automatic failover                    │
│  └─ Use case: Gaming, IoT, VoIP, non-HTTP apps              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Global Accelerator Architecture

```
┌─────────────────────────────────────────────────────────────┐
│          Global Accelerator Traffic Flow                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Scenario: Global gaming application needs consistent       │
│  performance for players worldwide                          │
│                                                             │
│  ┌──────────────┐                                           │
│  │ Player (Asia)│                                           │
│  │ Playing game │                                           │
│  └──────┬───────┘                                           │
│         │                                                   │
│         │ Connect to: 75.2.60.5 (Anycast IP)                │
│         │ (Game client configured with static IP)           │
│         │                                                   │
│         ▼                                                   │
│  ┌────────────────────────────────────┐                     │
│  │  Nearest Edge Location (Singapore) │                     │
│  │  Routes to healthiest endpoint     │                     │
│  └────────────┬───────────────────────┘                     │
│               │                                             │
│               │ AWS Global Network                          │
│               │ (Low latency path, not internet)            │
│               ▼                                             │
│  ┌────────────────────────────────────┐                     │
│  │  Game Servers (ALB in ap-south-1)  │                     │
│  │  Health Check: OK                  │                     │
│  │  Latency: 20ms (vs 200ms internet) │                     │
│  └────────────────────────────────────┘                     │
│                                                             │
│  Benefits:                                                  │
│  • Performance improvement                                  │
│  • Bypasses congested internet routes                       │
│  • Instant failover (health check based)                    │
│  • Static IPs (no DNS changes needed)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Hybrid Cloud Connectivity

### AWS Site-to-Site VPN

**AWS Site-to-Site VPN** creates a secure connection between your on-premises network and AWS over the internet using IPsec.

#### VPN Components

```
┌─────────────────────────────────────────────────────────────┐
│            Site-to-Site VPN Architecture                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  On-Premises                                                │
│  ┌─────────────────────────────────────────────┐            │
│  │  Corporate Network (192.168.0.0/16)         │            │
│  │                                             │            │
│  │  ┌─────────────────────────────────────┐    │            │
│  │  │  Customer Gateway Device            │    │            │
│  │  │  (Physical router/firewall)         │    │            │
│  │  │  Public IP: 203.0.113.50            │    │            │
│  │  └────────────┬────────────────────────┘    │            │
│  └───────────────┼─────────────────────────────┘            │
│                  │                                          │
│                  │ IPsec VPN Tunnel #1                      │
│                  │ IPsec VPN Tunnel #2 (redundant)          │
│                  ▼                                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              AWS (Internet)                           │  │
│  │  ┌────────────────────────────────────────────────┐   │  │
│  │  │  Customer Gateway (AWS Resource)               │   │  │
│  │  │  Represents on-prem device in AWS              │   │  │
│  │  └────────────┬───────────────────────────────────┘   │  │
│  │               │                                       │  │
│  │               │ VPN Connection                        │  │
│  │               ▼                                       │  │
│  │  ┌────────────────────────────────────────────────┐   │  │
│  │  │  Virtual Private Gateway (VGW)                 │   │  │
│  │  │  Attached to VPC                               │   │  │
│  │  │  or                                            │   │  │
│  │  │  Transit Gateway (TGW)                         │   │  │
│  │  │  (For multiple VPCs)                           │   │  │
│  │  └────────────┬───────────────────────────────────┘   │  │
│  │               │                                       │  │
│  │               ▼                                       │  │
│  │  ┌────────────────────────────────────────────────┐   │  │
│  │  │  VPC (10.0.0.0/16)                             │   │  │
│  │  │  Route: 192.168.0.0/16 → VGW/TGW               │   │  │
│  │  └────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### VPN Configuration

**Virtual Private Gateway (VGW)**
- VPN concentrator on the AWS side
- One VGW per VPC
- Use for single VPC connectivity

**Transit Gateway (TGW)**
- Centralized VPN hub
- Connect VPN to multiple VPCs
- Recommended for complex architectures

**Customer Gateway**
- AWS resource representing your on-premises VPN device
- Specifies public IP and BGP ASN (if using BGP)

**VPN Connection**
- Two IPsec tunnels for redundancy
- Each tunnel connects to a different AZ
- Supports static routing or BGP dynamic routing

#### VPN Routing

**Static Routing**
```
VPN Connection (Static)
├─ On-premises CIDR: 192.168.0.0/16
├─ VPC CIDR: 10.0.0.0/16
│
Route Tables:
├─ VPC: 192.168.0.0/16 → VGW
└─ On-premises: 10.0.0.0/16 → VPN

Limitation: Manual route updates
```

**Dynamic Routing (BGP)**
```
VPN Connection (BGP)
├─ AWS side ASN: 64512
├─ Customer side ASN: 65000
│
BGP automatically exchanges routes
└─ No manual route configuration needed

Benefit: Automatic failover, route propagation
```

#### VPN Performance

```
Bandwidth: Up to 1.25 Gbps per tunnel
Latency: Internet-dependent (variable)
Cost: Per VPN connection hour + data transfer
Encryption: Yes (IPsec)
Use case: Moderate bandwidth, encrypted connectivity
```

### AWS Client VPN

**AWS Client VPN** is a managed client-based VPN service enabling secure access to AWS resources and on-premises networks from any location.

```
┌─────────────────────────────────────────────────────────────┐
│            Client VPN Architecture                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Scenario: Remote employees need secure access to           │
│  company resources in AWS and corporate data center         │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐     │
│  │Remote Worker │   │Remote Worker │   │Remote Worker │     │
│  │  (Laptop)    │   │  (Laptop)    │   │  (Mobile)    │     │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘     │
│         │                  │                  │             │
│         │ OpenVPN Client   │ OpenVPN Client   │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
│                            │ Secure VPN Tunnel              │
│                            ▼                                │
│         ┌─────────────────────────────────────┐             │
│         │     AWS Client VPN Endpoint         │             │
│         │  - Authentication (AD, SAML, cert)  │             │
│         │  - Authorization rules              │             │
│         └──────────────┬────────────┬─────────┘             │
│                        │            │                       │
│          ┌─────────────┘            └────────────┐          │
│          ▼                                       ▼          │
│  ┌──────────────────┐                  ┌──────────────────┐ │
│  │  VPC             │                  │  On-Premises     │ │
│  │  (10.0.0.0/16)   │─── Site-to-Site ─│  Data Center     │ │
│  │  - EC2 Instances │     VPN/DX       │  (192.168.0.0/16)│ │
│  │  - RDS Databases │                  │  - File Servers  │ │
│  └──────────────────┘                  │  - Internal Apps │ │
│                                        └──────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### AWS Direct Connect

**AWS Direct Connect** establishes a dedicated private network connection from your on-premises data center to AWS through an AWS Direct Connect location (partner facility), bypassing the public internet entirely.

#### Direct Connect Architecture

```
┌─────────────────────────────────────────────────────────────┐
│            AWS Direct Connect Architecture                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  On-Premises Data Center                                    │
│  ┌─────────────────────────────────────────────┐            │
│  │  Corporate Network                          │            │
│  │  ┌────────────────────────────────────┐     │            │
│  │  │  Customer Router/Switch            │     │            │
│  │  └───────────┬────────────────────────┘     │            │
│  └──────────────┼─────────────────────────────┘             │
│                 │                                           │
│                 │ Fiber/Ethernet                            │
│                 │                                           │
│                 ▼                                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │       Direct Connect Location                        │   │
│  │  (AWS Partner Data Center / Colocation)              │   │
│  │                                                      │   │
│  │  ┌────────────────────┐  ┌──────────────────────┐    │   │
│  │  │ Customer Router    │  │ Direct Connect Router│    │   │
│  │  │ (Your equipment)   │──│ (AWS equipment)      │    │   │
│  │  └────────────────────┘  └──────┬───────────────┘    │   │
│  └─────────────────────────────────┼────────────────────┘   │
│                                    │                        │
│                                    │ AWS Backbone Network   │
│                                    │                        │
│                                    ▼                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AWS Region (us-east-1)                              │   │
│  │                                                      │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Virtual Interfaces (VIFs)                     │  │   │
│  │  │                                                │  │   │
│  │  │  Private VIF → VPC (10.0.0.0/16)               │  │   │
│  │  │  Private VIF → VPC (10.1.0.0/16)               │  │   │
│  │  │  Public VIF → AWS Public Services (S3, etc.)   │  │   │
│  │  │  Transit VIF → Transit Gateway                 │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Direct Connect Connection Types

**Dedicated Connection**
- Physical Ethernet port dedicated to a single customer
- Speeds: 1 Gbps, 10 Gbps, 100 Gbps
- Direct connection between customer router and AWS

**Hosted Connection**
- Connection provided through an AWS Direct Connect Partner
- Speeds: 50 Mbps to 10 Gbps
- Partner manages physical connection

#### Virtual Interfaces (VIFs)

Virtual Interfaces (VIFs) are logical connections that run over a physical Direct Connect connection. They enable you to access different types of AWS resources (private VPC resources, public AWS services, or Transit Gateways) over the same physical connection. Each VIF is configured with specific VLAN tagging, BGP settings, and routing policies.

**Private Virtual Interface**
```
Purpose: Access VPC using private IP addresses
Use case: EC2 instances, RDS, private resources
Example: Connect to VPC 10.0.0.0/16
```

**Public Virtual Interface**
```
Purpose: Access AWS public services using public IPs
Use case: S3, DynamoDB, public AWS endpoints
Example: Access S3 buckets without internet gateway
```

**Transit Virtual Interface**
```
Purpose: Access one or more Transit Gateways
Use case: Connect to multiple VPCs via TGW
Example: Single Direct Connect → TGW → 50 VPCs
```

#### Direct Connect Benefits vs Limitations

```
┌─────────────────────────────────────────────────────────────┐
│          Direct Connect Benefits                            │
├─────────────────────────────────────────────────────────────┤
│  • Consistent network performance (low latency, low jitter) │
│  • Higher bandwidth (up to 100 Gbps)                        │
│  • Reduced data transfer costs                              │
│  • Private connectivity (not over internet)                 │
│  • Supports hybrid cloud architectures                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│          Direct Connect Limitations                         │
├─────────────────────────────────────────────────────────────┤
│  • No encryption by default (must use VPN over DX)          │
│  • Longer setup time (weeks to months)                      │
│  • Higher cost (port hours + data transfer)                 │
│  • Requires presence at Direct Connect location             │
│  • Or partner for hosted connection                         │
└─────────────────────────────────────────────────────────────┘
```

#### High Availability with Direct Connect

**Single Connection (Not Recommended)**
```
On-Premises ─── Direct Connect ─── AWS

Risk: Single point of failure
```

**Dual Connections (Recommended)**
```
                    ┌─ Direct Connect 1 ─┐
On-Premises ────────┤                     ├──── AWS
                    └─ Direct Connect 2 ─┘

Benefit: Redundancy via multiple connections
```

**Multiple Locations (Maximum Resilience)**
```
                    ┌─ DX Location 1 ─── Direct Connect 1 ─┐
On-Premises ────────┤                                       ├─ AWS
                    └─ DX Location 2 ─── Direct Connect 2 ─┘

Benefit: Geographic redundancy
```

**Direct Connect + VPN Backup**
```
On-Premises ─┬─ Direct Connect (Primary) ──┬─ AWS
             └─ Site-to-Site VPN (Backup) ─┘

Benefit: Cost-effective redundancy
```

### AWS Cloud WAN

**AWS Cloud WAN** is a managed wide-area networking service that simplifies building, managing, and monitoring global networks connecting cloud and on-premises environments.

```
┌─────────────────────────────────────────────────────────────┐
│              Cloud WAN Architecture                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│           ┌─────────────────────────────┐                   │
│           │   Cloud WAN Global Network  │                   │
│           │   (Central Dashboard)       │                   │
│           └────────────┬────────────────┘                   │
│                        │                                    │
│        ┌───────────────┼──────────────┐                     │
│        │               │              │                     │
│   ┌────▼─────┐   ┌─────▼────┐   ┌─────▼────┐                │
│   │Core Net  │   │Core Net  │   │Core Net  │                │
│   │us-east-1 │   │eu-west-1 │   │ap-south-1│                │
│   └────┬─────┘   └────┬─────┘   └─────┬────┘                │
│        │              │               │                     │
│   ┌────▼────┐    ┌────▼────┐    ┌─────▼───┐                 │
│   │VPCs     │    │VPCs     │    │VPCs     │                 │
│   │On-Prem  │    │On-Prem  │    │On-Prem  │                 │
│   │SD-WAN   │    │SD-WAN   │    │SD-WAN   │                 │
│   └─────────┘    └─────────┘    └─────────┘                 │
│                                                             │
│  Benefits:                                                  │
│  • Centralized management                                   │
│  • Policy-based routing                                     │
│  • Network segmentation                                     │
│  • Integration with SD-WAN                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Network Security

### AWS Network Firewall

**AWS Network Firewall** is a managed service providing network-level protection for VPCs with advanced filtering capabilities.

```
┌─────────────────────────────────────────────────────────────┐
│          AWS Network Firewall Architecture                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Internet                                                   │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────┐                                            │
│  │    IGW      │                                            │
│  └──────┬──────┘                                            │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────────────────────────────────┐               │
│  │  Firewall Subnet                         │               │
│  │  ┌────────────────────────────────────┐  │               │
│  │  │  AWS Network Firewall Endpoint     │  │               │
│  │  │  - Stateful inspection             │  │               │
│  │  │  - IDS/IPS                         │  │               │
│  │  │  - Domain filtering                │  │               │
│  │  │  - Custom rules                    │  │               │
│  │  └──────────────┬─────────────────────┘  │               │
│  └─────────────────┼────────────────────────┘               │
│                    │                                        │
│                    ▼                                        │
│  ┌─────────────────────────────────────────┐                │
│  │  Application Subnet                     │                │
│  │  ┌────────────┐  ┌────────────┐         │                │
│  │  │    EC2     │  │    EC2     │         │                │
│  │  └────────────┘  └────────────┘         │                │
│  └─────────────────────────────────────────┘                │
│                                                             │
│  Capabilities:                                              │
│  • Stateful packet inspection                               │
│  • Intrusion prevention (IPS)                               │
│  • Web filtering                                            │
│  • Protocol detection                                       │
│  • Rule groups (managed and custom)                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Summary

**Key Takeaways:**

1. **Route 53** provides DNS management with advanced routing policies (latency, geolocation, failover)
2. **CloudFront** delivers content globally with low latency through edge locations
3. **Global Accelerator** improves application performance using AWS's global network and anycast IPs
4. **Site-to-Site VPN** creates encrypted connections between on-premises and AWS over internet
5. **Client VPN** enables secure remote access for users to AWS and on-premises resources
6. **Direct Connect** provides dedicated, private connectivity with consistent performance
7. **Cloud WAN** simplifies global network management with centralized policies
8. **Network Firewall** provides advanced network protection at the VPC level

**Best Practices:**

- Use Route 53 health checks for automatic failover
- Implement CloudFront for global content delivery and DDoS protection
- Choose VPN for quick setup and encryption, Direct Connect for performance and scale
- Implement redundant Direct Connect connections for production workloads
- Use Transit Gateway to simplify multi-VPC and hybrid connectivity
- Combine multiple services (Direct Connect + VPN, Route 53 + CloudFront) for resilience
- Leverage Network Firewall for advanced threat protection at network perimeter

