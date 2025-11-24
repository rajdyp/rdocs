---
title: Networking Fundamentals
linkTitle: Networking Fundamentals
type: docs
weight: 3
prev: /aws/02-global-infrastructure
next: /aws/04-edge-and-hybrid-networking
---

## Overview

Amazon Virtual Private Cloud (VPC) is the foundation of networking in AWS. It allows you to create a logically isolated virtual network where you can launch AWS resources with complete control over network environment, including IP address ranges, subnets, route tables, and network gateways.

## Amazon Virtual Private Cloud (VPC)

### What is a VPC?

An **Amazon VPC** is a logically isolated section of the AWS Cloud where you can launch AWS resources in a virtual network that you define. You have complete control over your virtual networking environment.

### VPC Characteristics

**Isolation**
- Each VPC is isolated from other VPCs in AWS
- Resources in one VPC cannot communicate with resources in another VPC without explicit configuration

**Regional Scope**
- VPCs are regional constructs
- A single VPC can span all Availability Zones within a Region
- VPCs cannot span multiple Regions

**IP Addressing**
- Define your own IP address range using CIDR notation
- Supports IPv4 and IPv6

**Customizable Network Configuration**
- Create subnets
- Configure route tables
- Set up network gateways
- Apply security policies

### Default VPC

When you create an AWS account, AWS automatically creates a default VPC in each Region:

**Default VPC Characteristics:**
- CIDR block: `172.31.0.0/16`
- Default subnet in each Availability Zone
- Internet Gateway attached
- Default security group (allows all outbound, limited inbound)
- Default network ACL (allows all inbound and outbound)

**Default VPC vs Custom VPC:**
```
┌────────────────────────────────────────────────────────────┐
│                     Default VPC                            │
├────────────────────────────────────────────────────────────┤
│ • Pre-configured with public subnets                       │
│ • Internet Gateway attached                                │
│ • Good for quick starts and testing                        │
│ • Limited customization                                    │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                     Custom VPC                             │
├────────────────────────────────────────────────────────────┤
│ • Full control over IP ranges                              │
│ • Design your own subnet architecture                      │
│ • Configure security to your requirements                  │
│ • Production best practice                                 │
└────────────────────────────────────────────────────────────┘
```

### VPC CIDR Blocks

When creating a VPC, you specify an IPv4 CIDR block:

**Allowed CIDR Ranges:**
- Minimum: `/28` (16 IP addresses)
- Maximum: `/16` (65,536 IP addresses)

**RFC 1918 Private IP Ranges (Recommended):**
```
10.0.0.0/8        → 10.0.0.0 - 10.255.255.255     (16,777,216 IPs)
172.16.0.0/12     → 172.16.0.0 - 172.31.255.255   (1,048,576 IPs)
192.168.0.0/16    → 192.168.0.0 - 192.168.255.255 (65,536 IPs)
```

**VPC CIDR Examples:**
```
10.0.0.0/16       → 65,536 IP addresses (common choice)
10.0.0.0/24       → 256 IP addresses (smaller VPC)
172.16.0.0/16     → 65,536 IP addresses
192.168.0.0/20    → 4,096 IP addresses
```

### Complete VPC Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    VPC (10.0.0.0/16)                            │
│                    Region: us-east-1                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Internet Gateway (IGW)                  │  │
│  └─────────────────────────┬─────────────────────────────────┘  │
│                            │                                    │
│  ┌─────────────────────────┼─────────────────────────────────┐  │
│  │       Public Subnet (10.0.1.0/24) - AZ-A                  │  │
│  │                         │                                 │  │
│  │  Route Table: 0.0.0.0/0 → IGW                             │  │
│  │                         │                                 │  │
│  │  ┌──────────────┐   ┌───┴───────────┐   ┌──────────────┐  │  │
│  │  │   NACL       │   │  EC2 Instance │   │  Security    │  │  │
│  │  │  (Subnet)    │   │  Public IP    │   │  Group       │  │  │
│  │  │              │   │               │   │  (Instance)  │  │  │
│  │  └──────────────┘   └───────────────┘   └──────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                            ▲                                    │
│                            │ Traffic Flow                       │
│  ┌─────────────────────────┼─────────────────────────────────┐  │
│  │      Private Subnet (10.0.2.0/24) - AZ-A                  │  │
│  │                         │                                 │  │
│  │  Route Table: 0.0.0.0/0 → NAT Gateway (in public subnet)  │  │
│  │                         │                                 │  │
│  │  ┌──────────────┐   ┌───┴───────────┐   ┌──────────────┐  │  │
│  │  │   NACL       │   │  EC2 Instance │   │  Security    │  │  │
│  │  │  (Subnet)    │   │  Private IP   │   │  Group       │  │  │
│  │  │              │   │               │   │  (Instance)  │  │  │
│  │  └──────────────┘   └───────────────┘   └──────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │       Public Subnet (10.0.3.0/24) - AZ-B                  │  │
│  │  (For high availability)                                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │       Private Subnet (10.0.4.0/24) - AZ-B                 │  │
│  │  (For high availability)                                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Subnets

### What is a Subnet?

A **subnet** is a logical subdivision of a VPC's IP address range. Subnets allow you to group resources based on security and operational needs.

### Subnet Characteristics

**Availability Zone Bound**
- Each subnet exists in exactly one Availability Zone
- Subnets cannot span multiple AZs
- Deploy subnets across multiple AZs for high availability

**CIDR Block**
- Must be a subset of the VPC CIDR block
- Cannot overlap with other subnets in the same VPC
- AWS reserves 5 IP addresses in each subnet

**Reserved IP Addresses (Example: 10.0.0.0/24)**
```
10.0.0.0     → Network address
10.0.0.1     → VPC router
10.0.0.2     → DNS server (VPC base + 2)
10.0.0.3     → Reserved for future use
10.0.0.255   → Broadcast address (not used but reserved)

Available IPs: 251 (out of 256)
```

### Public Subnets

A **public subnet** is a subnet that has a route to an Internet Gateway, allowing resources to communicate directly with the internet.

**Public Subnet Characteristics:**
- Route table contains route: `0.0.0.0/0 → Internet Gateway`
- Resources can have public IP addresses
- Directly accessible from the internet (if security allows)

**Use Cases:**
- Web servers
- Application load balancers
- Bastion hosts
- NAT Gateways

### Private Subnets

A **private subnet** is a subnet that does NOT have a direct route to an Internet Gateway. Resources in private subnets cannot be directly accessed from the internet.

**Private Subnet Characteristics:**
- No direct route to Internet Gateway
- Resources use only private IP addresses
- Outbound internet access via NAT Gateway or NAT Instance

**Use Cases:**
- Application servers
- Database servers
- Internal services
- Backend processing

### Subnet Design Patterns

**Pattern 1: Two-Tier Architecture**
```
┌────────────────────────────────────────────────────────────┐
│                    VPC: 10.0.0.0/16                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Availability Zone A          Availability Zone B          │
│  ┌────────────────────┐       ┌────────────────────┐       │
│  │ Public Subnet      │       │ Public Subnet      │       │
│  │ 10.0.1.0/24        │       │ 10.0.2.0/24        │       │
│  │ ┌────────────────┐ │       │ ┌────────────────┐ │       │
│  │ │  Web Servers   │ │       │ │  Web Servers   │ │       │
│  │ └────────────────┘ │       │ └────────────────┘ │       │
│  └────────────────────┘       └────────────────────┘       │
│           │                            │                   │
│  ┌────────┴───────────┐       ┌────────┴───────────┐       │
│  │ Private Subnet     │       │ Private Subnet     │       │
│  │ 10.0.11.0/24       │       │ 10.0.12.0/24       │       │
│  │ ┌────────────────┐ │       │ ┌────────────────┐ │       │
│  │ │   Databases    │ │       │ │   Databases    │ │       │
│  │ └────────────────┘ │       │ └────────────────┘ │       │
│  └────────────────────┘       └────────────────────┘       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Pattern 2: Three-Tier Architecture**
```
┌────────────────────────────────────────────────────────────┐
│                    VPC: 10.0.0.0/16                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Availability Zone A          Availability Zone B          │
│                                                            │
│  ┌────────────────────┐       ┌────────────────────┐       │
│  │ Public Subnet      │       │ Public Subnet      │       │
│  │ (Presentation)     │       │ (Presentation)     │       │
│  │ 10.0.1.0/24        │       │ 10.0.2.0/24        │       │
│  └────────────────────┘       └────────────────────┘       │
│           │                            │                   │
│  ┌────────┴───────────┐       ┌────────┴───────────┐       │
│  │ Private Subnet     │       │ Private Subnet     │       │
│  │ (Application)      │       │ (Application)      │       │
│  │ 10.0.11.0/24       │       │ 10.0.12.0/24       │       │
│  └────────────────────┘       └────────────────────┘       │
│           │                            │                   │
│  ┌────────┴───────────┐       ┌────────┴───────────┐       │
│  │ Private Subnet     │       │ Private Subnet     │       │
│  │ (Database)         │       │ (Database)         │       │
│  │ 10.0.21.0/24       │       │ 10.0.22.0/24       │       │
│  └────────────────────┘       └────────────────────┘       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Route Tables

### What is a Route Table?

A **route table** contains a set of rules (routes) that determine where network traffic from a subnet or gateway is directed.

### Route Table Concepts

**Main Route Table**
- Every VPC has a main (default) route table
- Automatically used by subnets that don't have a custom route table assigned
- Can be customized

**Custom Route Tables**
- Create custom route tables for specific routing requirements
- Associate with specific subnets
- Best practice: Use custom route tables and leave main route table as fallback

**Subnet Route Table Association**
- Each subnet must be associated with exactly one route table
- Multiple subnets can be associated with the same route table

### Route Table Entries

**Route Components:**
```
Destination        Target              Purpose
------------------------------------------------------------
10.0.0.0/16       local               Intra-VPC communication
0.0.0.0/0         igw-xxxxx           Internet access (public)
0.0.0.0/0         nat-xxxxx           Internet access (private)
192.168.0.0/16    pcx-xxxxx           VPC Peering
10.1.0.0/16       tgw-xxxxx           Transit Gateway
10.2.0.0/16       vgw-xxxxx           Virtual Private Gateway (VPN)
```

**Local Route:**
- Automatically added to all route tables
- Enables communication between all resources within the VPC
- Cannot be modified or deleted

```
Destination        Target        
---------------------------------
10.0.0.0/16       local               ← This is the local route (automatic)
0.0.0.0/0         igw-xxxxx           ← For internet access
```

### Route Table Examples

**Public Subnet Route Table:**
```
Destination        Target              Description
----------------------------------------------------------------
10.0.0.0/16       local               VPC internal traffic
0.0.0.0/0         igw-1234567890      All internet traffic to IGW
```

**Private Subnet Route Table:**
```
Destination        Target              Description
----------------------------------------------------------------
10.0.0.0/16       local               VPC internal traffic
0.0.0.0/0         nat-1234567890      Internet traffic via NAT Gateway
```

**Route Priority:**
- Most specific route wins (longest prefix match)
- Example: Traffic to `10.0.1.50`
  - `10.0.1.0/24` is more specific than `10.0.0.0/16`
  - `10.0.1.0/24` route is used

### Default Route Table Behavior

**Internal VPC Communication:**
Every VPC route table includes the local route by default.
```
VPC CIDR: 10.0.0.0/16

Route Table:
Destination        Target
--------------------------
10.0.0.0/16       local
```

This means:
- EC2 in subnet `10.0.1.0/24` can communicate with EC2 in subnet `10.0.2.0/24`
- No additional routing configuration needed for intra-VPC traffic
- Security Groups and NACLs still apply

## Internet Gateway (IGW)

### What is an Internet Gateway?

An **Internet Gateway** is a horizontally scaled, redundant, and highly available VPC component that allows communication between instances in the VPC and the internet.

### IGW Characteristics

**Highly Available**
- Redundant and horizontally scaled by AWS
- No bandwidth constraints
- No availability risk or bandwidth limits

**VPC Attachment**
- One IGW per VPC
- Must be explicitly attached to a VPC

**Dual Functionality**
- **Outbound**: Allows instances to initiate connections to the internet
- **Inbound**: Allows internet to initiate connections to instances (if allowed by security)

### How Internet Gateway Works

```
Internet Traffic Flow (Inbound)

┌────────────────────────────────────────────────────────────┐
│                       Internet                             │
└─────────────────────────┬──────────────────────────────────┘
                          │
                          │ 1. Request to Public IP
                          ▼
          ┌───────────────────────────────┐
          │    Internet Gateway (IGW)     │
          │                               │
          │  NAT: Public IP → Private IP  │
          └───────────────┬───────────────┘
                          │
                          │ 2. Forward to VPC
                          ▼
          ┌───────────────────────────────┐
          │        Route Table            │
          │  0.0.0.0/0 → IGW              │
          └───────────────┬───────────────┘
                          │
                          │ 3. Route to Subnet
                          ▼
          ┌───────────────────────────────┐
          │    Network ACL (Subnet)       │
          │    Allow/Deny Rules           │
          └───────────────┬───────────────┘
                          │
                          │ 4. Check NACL
                          ▼
          ┌───────────────────────────────┐
          │   Public Subnet               │
          │   10.0.1.0/24                 │
          │                               │
          │   ┌───────────────────────┐   │
          │   │  Security Group       │   │
          │   │  Allow/Deny Rules     │   │
          │   └──────────┬────────────┘   │
          │              │                │
          │              │ 5. Check SG    │
          │              ▼                │
          │   ┌───────────────────────┐   │
          │   │   EC2 Instance        │   │
          │   │   Private: 10.0.1.10  │   │
          │   │   Public: 54.x.x.x    │   │
          │   └───────────────────────┘   │
          └───────────────────────────────┘
```

### Configuring Internet Access

**Requirements for Internet Access:**

1. **Create and attach Internet Gateway to VPC**
   ```bash
   aws ec2 create-internet-gateway
   aws ec2 attach-internet-gateway --vpc-id vpc-xxx --internet-gateway-id igw-xxx
   ```

2. **Route table entry**
   - Add route: `0.0.0.0/0 → IGW` to subnet's route table

3. **Public IP address**
   - Instance must have a public IPv4 address or Elastic IP address
   - Auto-assign public IP setting enabled on subnet, or
   - Manually assign Elastic IP address

4. **Security Group rules**
   - Allow desired inbound traffic (e.g., HTTP port 80, HTTPS port 443)
   - Outbound rules allow response traffic (stateful)

5. **Network ACL rules**
   - Allow inbound traffic on desired ports
   - Allow outbound ephemeral ports (1024-65535) for responses

## NAT Gateway

### What is a NAT Gateway?

A **NAT (Network Address Translation) Gateway** is a managed service that enables instances in a private subnet to connect to the internet or other AWS services, while preventing the internet from initiating connections to those instances.

### NAT Gateway Characteristics

**Managed Service**
- Fully managed by AWS (no OS patching or management)
- Highly available within a single Availability Zone
- Automatically scales up to 45 Gbps

**Availability Zone Specific**
- Deployed in a specific Availability Zone
- For high availability, deploy NAT Gateway in each AZ

**Elastic IP Address**
- Requires an Elastic IP address at creation time
- This is the public IP used for outbound traffic

**Use Case**
- Allow private subnet resources to access internet (software updates, API calls)
- Prevent direct inbound connections from internet

### NAT Gateway vs NAT Instance

```
┌─────────────────────────────────────────────────────────────┐
│              NAT Gateway vs NAT Instance                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  NAT Gateway (Recommended)                                  │
│  ├─ Managed by AWS                                          │
│  ├─ Highly available within an AZ                           │
│  ├─ Scales automatically (up to 45 Gbps)                    │
│  ├─ No security groups (use NACLs)                          │
│  └─ Higher cost but less operational overhead               │
│                                                             │
│  NAT Instance (Legacy)                                      │
│  ├─ Self-managed EC2 instance                               │
│  ├─ Single point of failure (manual HA setup needed)        │
│  ├─ Limited by instance type bandwidth                      │
│  ├─ Supports security groups                                │
│  ├─ Can use as bastion host                                 │
│  └─ Lower cost but higher operational overhead              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### NAT Gateway Architecture

```
Private Subnet Outbound Traffic Flow

┌───────────────────────────────────────────────────────────┐
│                    VPC (10.0.0.0/16)                      │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐     │
│  │         Public Subnet (10.0.1.0/24)              │     │
│  │                                                  │     │
│  │   ┌──────────────────────────────────────────┐   │     │
│  │   │         NAT Gateway                      │   │     │
│  │   │  Private IP: 10.0.1.5                    │   │     │
│  │   │  Elastic IP: 54.x.x.x                    │   │     │
│  │   └────────────────▲─┬───────────────────────┘   │     │
│  └────────────────────|─┴───────────────────────────┘     │
│                       │ │                                 │
│                       │ └────> To Internet Gateway        │
│                       │                                   │
│                       │                                   │
│  ┌────────────────────┼─────────────────────────────┐     │
│  │    Private Subnet  │   (10.0.2.0/24)             │     │
│  │                    │                             │     │
│  │  Route Table:      │                             │     │
│  │  0.0.0.0/0 → NAT-GW│                             │     │
│  │                    │                             │     │
│  │   ┌────────────────┴───────────────┐             │     │
│  │   │    EC2 Instance                │             │     │
│  │   │    Private IP: 10.0.2.10       │             │     │
│  │   │    No Public IP                │             │     │
│  │   │                                │             │     │
│  │   │  1. Requests internet resource │             │     │
│  │   │  2. Routed to NAT Gateway      │             │     │
│  │   │  3. NAT-GW translates source   │             │     │
│  │   │     IP to its Elastic IP       │             │     │
│  │   │  4. Traffic goes via IGW       │             │     │
│  │   │  5. Response comes back        │             │     │
│  │   │     through NAT-GW             │             │     │
│  │   └────────────────────────────────┘             │     │
│  └──────────────────────────────────────────────────┘     │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### High Availability NAT Gateway Design

```
┌────────────────────────────────────────────────────────────┐
│                 VPC (10.0.0.0/16)                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  AZ-A                               AZ-B                   │
│  ┌─────────────────────┐           ┌───────────────────┐   │
│  │ Public Subnet       │           │ Public Subnet     │   │
│  │ 10.0.1.0/24         │           │ 10.0.2.0/24       │   │
│  │  ┌──────────────┐   │           │  ┌────────────┐   │   │
│  │  │ NAT Gateway  │   │           │  │NAT Gateway │   │   │
│  │  │ EIP: 54.x.x.1│   │           │  │EIP:54.x.x.2│   │   │
│  │  └──────▲───────┘   │           │  └─────▲──────┘   │   │
│  └─────────┼───────────┘           └────────┼──────────┘   │
│            │                                │              │
│  ┌─────────┼───────────┐       ┌────────────┼────────┐     │
│  │ Private │           │       │ Private    │        │     │
│  │ Subnet  │           │       │ Subnet     │        │     │
│  │ 10.0.11.0/24        │       │ 10.0.12.0/24        │     │
│  │ Route:              │       │ Route:              │     │
│  │ 0.0.0.0/0 → NAT-GW-A│       │ 0.0.0.0/0 → NAT-GW-B│     │
│  │         │           │       │            │        │     │
│  │   ┌─────┴────────┐  │       │   ┌────────┴─────┐  │     │
│  │   │  Instances   │  │       │   │  Instances   │  │     │
│  │   └──────────────┘  │       │   └──────────────┘  │     │
│  └─────────────────────┘       └─────────────────────┘     │
│                                                            │
└────────────────────────────────────────────────────────────┘

Benefits:
- If AZ-A fails, instances in AZ-B continue to have internet access
- Each AZ uses its own NAT Gateway for internet access
```

## Security Groups

### What is a Security Group?

A **Security Group** acts as a virtual firewall for your EC2 instances to control inbound and outbound traffic at the instance level.

### Security Group Characteristics

**Stateful**
- Automatically allows return traffic
- If you allow an inbound request, the response is automatically allowed
- Connection tracking manages this automatically

**Instance-Level**
- Applied to ENI (Elastic Network Interface) of an instance
- Multiple instances can use the same security group
- An instance can have multiple security groups (up to 5)

**Allow Rules Only**
- Can only specify ALLOW rules (no explicit DENY)
- Everything not explicitly allowed is implicitly denied

**Default Behavior**
- Default Security Group: Allows all traffic from instances with the same SG
- Custom Security Group: Denies all inbound by default, allows all outbound

### Security Group Rules

**Rule Components:**
```
Type       Protocol   Port Range   Source/Destination   Description
------------------------------------------------------------------------
HTTP       TCP        80           0.0.0.0/0           Allow web traffic
HTTPS      TCP        443          0.0.0.0/0           Allow HTTPS
SSH        TCP        22           203.0.113.0/24      Admin access
MySQL      TCP        3306         sg-12345678         App server access
All Traffic All       All          10.0.0.0/16         VPC internal
Custom TCP TCP        8080-8090    sg-87654321         Custom app
```

**Source/Destination Types:**
- **CIDR block**: `0.0.0.0/0` (anywhere), `203.0.113.0/24` (specific range)
- **Security Group ID**: `sg-12345678` (reference another SG)
- **Prefix List ID**: `pl-12345678` (AWS service or custom prefix list)

### Security Group Examples

**Web Server Security Group (Public Tier):**
```
Inbound Rules:
Type        Protocol   Port   Source         Description
-------------------------------------------------------------
HTTP        TCP        80     0.0.0.0/0      Public web traffic
HTTPS       TCP        443    0.0.0.0/0      Public HTTPS traffic
SSH         TCP        22     203.0.113.0/24 Admin access (office IP)

Outbound Rules:
Type        Protocol   Port   Destination    Description
-------------------------------------------------------------
All Traffic All        All    0.0.0.0/0      Allow all outbound
```

**Application Server Security Group (Private Tier):**
```
Inbound Rules:
Type        Protocol   Port   Source            Description
----------------------------------------------------------------
Custom TCP  TCP        8080   sg-webserver      From web tier
MySQL       TCP        3306   sg-appserver      Self-reference

Outbound Rules:
Type        Protocol   Port   Destination       Description
----------------------------------------------------------------
HTTPS       TCP        443    0.0.0.0/0         API calls
MySQL       TCP        3306   sg-database       To database tier
```

**Database Security Group (Private Tier):**
```
Inbound Rules:
Type        Protocol   Port   Source            Description
----------------------------------------------------------------
MySQL       TCP        3306   sg-appserver      From app tier

Outbound Rules:
Type        Protocol   Port   Destination       Description
----------------------------------------------------------------
All Traffic All        All    0.0.0.0/0         Allow responses
```

### Security Group Best Practices

1. **Principle of Least Privilege**: Only allow necessary traffic
2. **Use Security Group References**: Reference other SGs instead of IP ranges when possible
3. **Descriptive Names**: Use meaningful names and descriptions
4. **Limit SSH/RDP Access**: Restrict to specific IP ranges, use bastion hosts
5. **Separate Security Groups by Tier**: Web, Application, Database
6. **Regular Audits**: Review and remove unnecessary rules

### Security Group Chaining

```
Security Group Chaining Pattern

┌──────────────────────────────────────────────────────────┐
│  Public Subnet                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Web Server                                        │  │
│  │  Security Group: sg-web                            │  │
│  │                                                    │  │
│  │  Inbound: HTTP(80) from 0.0.0.0/0                  │  │
│  │  Outbound: TCP(8080) to sg-app                     │  │
│  └──────────────────────┬─────────────────────────────┘  │
└─────────────────────────┼────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────┼────────────────────────────────┐
│  Private Subnet         │                                │
│  ┌──────────────────────┴───────────────────────────┐    │
│  │  Application Server                              │    │
│  │  Security Group: sg-app                          │    │
│  │                                                  │    │
│  │  Inbound: TCP(8080) from sg-web                  │    │
│  │  Outbound: TCP(3306) to sg-db                    │    │
│  └──────────────────────┬───────────────────────────┘    │
└─────────────────────────┼────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────┼────────────────────────────────┐
│  Private Subnet         │                                │
│  ┌──────────────────────┴───────────────────────────┐    │
│  │  Database Server                                 │    │
│  │  Security Group: sg-db                           │    │
│  │                                                  │    │
│  │  Inbound: TCP(3306) from sg-app                  │    │
│  │  Outbound: None needed (stateful responses)      │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Network Access Control Lists (NACLs)

### What is a Network ACL?

A **Network Access Control List (NACL)** is an optional layer of security that acts as a firewall for controlling traffic in and out of subnets.

### NACL Characteristics

**Stateless**
- Does NOT track connection state
- Must define explicit rules for both inbound and outbound traffic
- Return traffic must be explicitly allowed

**Subnet-Level**
- Applied at the subnet boundary
- All instances in the subnet are affected
- One NACL per subnet (subnet can have only one NACL)

**Allow and Deny Rules**
- Supports both ALLOW and DENY rules
- Provides additional defense layer

**Rule Evaluation**
- Rules are evaluated in numerical order (lowest to highest)
- First matching rule is applied
- Rule `*` (asterisk) is the default deny

### Default vs Custom NACLs

**Default NACL:**
```
Inbound Rules:
Rule #   Type        Protocol   Port Range   Source       Allow/Deny
----------------------------------------------------------------------
100      All Traffic All        All          0.0.0.0/0    ALLOW
*        All Traffic All        All          0.0.0.0/0    DENY

Outbound Rules:
Rule #   Type        Protocol   Port Range   Destination  Allow/Deny
----------------------------------------------------------------------
100      All Traffic All        All          0.0.0.0/0    ALLOW
*        All Traffic All        All          0.0.0.0/0    DENY
```

**Custom NACL (Initially):**
```
Inbound Rules:
Rule #   Type        Protocol   Port Range   Source       Allow/Deny
----------------------------------------------------------------------
*        All Traffic All        All          0.0.0.0/0    DENY

Outbound Rules:
Rule #   Type        Protocol   Port Range   Destination  Allow/Deny
----------------------------------------------------------------------
*        All Traffic All        All          0.0.0.0/0    DENY
```

### NACL Rule Examples

**Public Subnet NACL:**
```
Inbound Rules:
Rule #   Type        Protocol   Port Range   Source       Allow/Deny
----------------------------------------------------------------------
100      HTTP        TCP        80           0.0.0.0/0    ALLOW
110      HTTPS       TCP        443          0.0.0.0/0    ALLOW
120      SSH         TCP        22           203.0.113.0/24 ALLOW
130      Custom TCP  TCP        1024-65535   0.0.0.0/0    ALLOW (ephemeral)
*        All Traffic All        All          0.0.0.0/0    DENY

Outbound Rules:
Rule #   Type        Protocol   Port Range   Destination  Allow/Deny
----------------------------------------------------------------------
100      HTTP        TCP        80           0.0.0.0/0    ALLOW
110      HTTPS       TCP        443          0.0.0.0/0    ALLOW
120      Custom TCP  TCP        1024-65535   0.0.0.0/0    ALLOW (ephemeral)
*        All Traffic All        All          0.0.0.0/0    DENY
```

**Ephemeral Ports:**
- Required for stateless NACLs to allow return traffic
- Range: 1024-65535 (depends on client OS)
- Linux: typically uses 32768-60999
- Windows: typically uses 49152-65535
- Best practice: Allow 1024-65535 for broad compatibility

### Security Groups vs NACLs

```
┌─────────────────────────────────────────────────────────────┐
│          Security Groups vs Network ACLs                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Security Group                Network ACL                  │
│  ───────────────               ────────────                 │
│  Instance level                Subnet level                 │
│  Stateful                      Stateless                    │
│  Allow rules only              Allow and Deny rules         │
│  All rules evaluated           Rules evaluated in order     │
│  Applied to instance           Applied to all instances     │
│  (when specified)              in subnet                    │
│  Restrictive by default        Default NACL allows all      │
│                                Custom NACL denies all       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Defense in Depth Strategy

```
Traffic Flow Through Security Layers

Internet
   │
   ▼
┌──────────────────┐
│ Internet Gateway │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Network ACL (Subnet Level)         │  ← Layer 1: Subnet firewall
│  - Stateless                        │
│  - Allow/Deny rules                 │
│  - Rule number order                │
└────────┬────────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│  Subnet                        │
│  ┌──────────────────────────┐  │
│  │ Security Group           │  │  ← Layer 2: Instance firewall
│  │ - Stateful               │  │
│  │ - Allow rules only       │  │
│  │ - All rules evaluated    │  │
│  └───────┬──────────────────┘  │
│          │                     │
│          ▼                     │
│  ┌────────────────┐            │
│  │  EC2 Instance  │            │  ← Layer 3: OS firewall (optional)
│  │  - iptables    │            │
│  │  - Host FW     │            │
│  └────────────────┘            │
└────────────────────────────────┘
```

## VPC Flow Logs

### What are VPC Flow Logs?

**VPC Flow Logs** capture information about the IP traffic going to and from network interfaces in your VPC. Flow logs help you monitor and troubleshoot connectivity issues.

### Flow Log Characteristics

**Metadata Only**
- Captures network traffic metadata (source, destination, protocol, ports)
- Does NOT capture packet contents (not a packet sniffer)
- Cannot be used to view actual data being transmitted

**Scope Levels**
- **VPC**: Capture traffic for entire VPC
- **Subnet**: Capture traffic for specific subnet
- **Network Interface (ENI)**: Capture traffic for specific instance

**Log Destinations**
- **Amazon CloudWatch Logs**: Real-time monitoring, alarms, insights
- **Amazon S3**: Long-term storage, analysis with Athena
- **Amazon Kinesis Data Firehose**: Stream to analytics tools

### Flow Log Record Format

**Default Flow Log Record:**
```
<version> <account-id> <interface-id> <srcaddr> <dstaddr> <srcport> <dstport> <protocol> <packets> <bytes> <start> <end> <action> <log-status>
```

**Example Flow Log Entry:**
```
2 123456789012 eni-1a2b3c4d 172.31.16.139 172.31.16.21 20641 22 6 20 4249 1418530010 1418530070 ACCEPT OK
```

**Parsed:**
```
Version: 2
Account ID: 123456789012
Interface ID: eni-1a2b3c4d
Source Address: 172.31.16.139
Destination Address: 172.31.16.21
Source Port: 20641
Destination Port: 22 (SSH)
Protocol: 6 (TCP)
Packets: 20
Bytes: 4249
Start Time: 1418530010
End Time: 1418530070
Action: ACCEPT
Log Status: OK
```

### Flow Log Use Cases

**Security Analysis**
- Detect unauthorized access attempts
- Identify unusual traffic patterns
- Investigate security group rule effectiveness

**Network Troubleshooting**
- Diagnose why connections are being rejected
- Verify traffic is reaching intended destinations
- Identify asymmetric routing issues

**Compliance and Auditing**
- Maintain network traffic records
- Meet regulatory requirements
- Forensic analysis after incidents

### Flow Log Analysis Examples

**Finding Rejected SSH Connections:**
```
Filter: dstport = 22 AND action = REJECT

Interpretation: SSH connection attempts that were blocked
Possible causes: Security group or NACL blocking port 22
```

**Identifying Top Talkers:**
```
Aggregate: SUM(bytes) GROUP BY srcaddr
Sort: Descending

Interpretation: Which sources are generating most traffic
Use case: Identify bandwidth consumers, potential DDoS
```

**Detecting Port Scanning:**
```
Filter: srcaddr = <suspicious-ip>
Aggregate: COUNT DISTINCT(dstport)

Interpretation: Single source trying many ports
Possible indication: Port scanning activity
```

## VPC Connectivity Patterns

### VPC Peering

**VPC Peering** allows you to interconnect VPCs privately using AWS's network. Traffic between peered VPCs stays on the AWS backbone network.

**VPC Peering Characteristics:**

```
┌───────────────────────────────────────────────────────────┐
│                    VPC Peering                            │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────┐         ┌─────────────────────┐  │
│  │   VPC A             │         │   VPC B             │  │
│  │   10.0.0.0/16       │<───────>│   10.1.0.0/16       │  │
│  │                     │         │                     │  │
│  │  Route Table:       │         │  Route Table:       │  │
│  │  10.1.0.0/16 → pcx  │         │  10.0.0.0/16 → pcx  │  │
│  └─────────────────────┘         └─────────────────────┘  │
│                                                           │
│  Properties:                                              │
│  • One-to-one relationship                                │
│  • Non-transitive (A→B, B→C doesn't mean A→C)             │
│  • No overlapping CIDR blocks                             │
│  • Can peer across accounts and regions                   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**Limitations:**
- Non-transitive: Must create direct peering connections
- CIDR blocks cannot overlap
- Becomes complex with many VPCs (N*(N-1)/2 connections for full mesh)

### Transit Gateway

**AWS Transit Gateway** is the scalable alternative to VPC Peering. It acts as a central hub for VPCs and on-premises networks — each connects once, and routing between them is transitive.

```
┌─────────────────────────────────────────────────────────────┐
│              Transit Gateway Architecture                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              ┌─────────────────────────────┐                │
│              │                             │                │
│         ┌────┤    Transit Gateway (TGW)    ├────┐           │
│         │    │    (Regional Construct)     │    │           │
│         │    └────┬────────────────────┬───┘    │           │
│         │         │                    │        │           │
│         │         │                    │        │           │
│    ┌────▼────┐ ┌──▼──────┐      ┌─────▼────┐ ┌─▼────────┐   │
│    │  VPC A  │ │  VPC B  │      │  VPC C   │ │  VPN/DX  │   │
│    │10.0/16  │ │10.1/16  │      │ 10.2/16  │ │On-Prem   │   │
│    └─────────┘ └─────────┘      └──────────┘ └──────────┘   │
│                                                             │
│  Benefits:                                                  │
│  • Hub-and-spoke model (simpler than full mesh)             │
│  • Transitive routing (VPC-A can reach VPC-C via TGW)       │
│  • Centralized management                                   │
│  • Supports thousands of VPCs                               │
│  • Inter-region peering available                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Transit Gateway Features:**
- **Route Tables**: Control which connected networks (VPCs, Direct Connect) can communicate with each other
- **Network Segmentation**: Isolate different environments (prod/dev) or tenants using separate route tables
- **TGW Peering**: Connect multiple TGWs (same region or cross-region)
- **Direct Connect Integration**: Centralized on-premises connectivity

### AWS PrivateLink

**AWS PrivateLink** privately connects a VPC to services using private IP addresses, giving the appearance that these services are hosted within the VPC.

```
┌─────────────────────────────────────────────────────────────┐
│              AWS PrivateLink Architecture                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Consumer VPC (10.0.0.0/16)                          │   │
│  │                                                      │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │   Application                                  │  │   │
│  │  │   Connects to endpoint via private IP          │  │   │
│  │  └──────────────────┬─────────────────────────────┘  │   │
│  │                     │                                │   │
│  │  ┌──────────────────▼─────────────────────────────┐  │   │
│  │  │   VPC Interface Endpoint (ENI)                 │  │   │
│  │  │   Private IP: 10.0.1.10                        │  │   │
│  │  │   DNS: service.region.vpce.amazonaws.com       │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                   │
│                         │ AWS PrivateLink                   │
│                         │ (AWS Backbone)                    │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Provider VPC (172.16.0.0/16)                        │   │
│  │  VPC Endpoint Service: com.amazonaws.vpce.xxx        │   │
│  │                                                      │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │   Network Load Balancer                        │  │   │
│  │  └──────────────────┬─────────────────────────────┘  │   │
│  │                     │                                │   │
│  │  ┌──────────────────▼─────────────────────────────┐  │   │
│  │  │   Backend Service (EC2, Containers, etc.)      │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**PrivateLink Components:**
- **VPC Endpoint** (Consumer side): ENI in your VPC that connects to a service
- **VPC Endpoint Service** (Provider side): Makes your service available via PrivateLink (requires NLB)

**VPC Endpoints:**

**Interface Endpoints** (PrivateLink)
- Elastic Network Interface with private IP
- Requires security group
- Supports most AWS services and SaaS applications
- Charged per hour and per GB processed

**Gateway Endpoints** (S3 and DynamoDB only)
- Route table entry, not an ENI
- No security group (use bucket policies)
- No hourly charges, no data processing charges
- Only for S3 and DynamoDB

```
Gateway Endpoint vs Interface Endpoint

Gateway Endpoint (S3, DynamoDB)
┌─────────────────────────────────┐
│  VPC                            │
│         ┌──────────┐            │
│         │    EC2   │            │
│         └────┬─────┘            │
│              │                  │
│              │ (Route lookup)   │
│  ┌───────────▼───────────────┐  │
│  │  Route Table              │  │  ← Prefix list route
│  │  pl-xxxxx → vpce-gateway  │  │
│  └───────────┬───────────────┘  │
│              │                  │
│  ┌───────────▼───────────────┐  │
│  │  Gateway Endpoint         │  │
│  │  (vpce-gateway)           │  │
│  └───────────────────────────┘  │
└─────────────┬───────────────────┘
              │
              └──> S3 / DynamoDB (via AWS network)

Interface Endpoint (Other Services)
┌─────────────────────────────────┐
│  VPC                            │
│         ┌──────────┐            │
│         │    EC2   │            │
│         └────┬─────┘            │
│              │                  │
│  ┌───────────▼───────────────┐  │
│  │  ENI (vpce-interface)     │  │
│  │  Private IP: 10.0.1.5     │  │  ← Network interface
│  │  Security Group           │  │
│  └───────────────────────────┘  │
└─────────────┬───────────────────┘
              │
              └──> AWS Service / Endpoint Service (via PrivateLink)
```

## Summary

**Key Takeaways:**

1. **VPC** provides isolated virtual networks with full control over IP addressing, routing, and security
2. **Subnets** divide VPCs into smaller segments (public for internet-facing, private for internal resources)
3. **Route Tables** control traffic flow within VPC and to external destinations
4. **Internet Gateway** enables direct internet access for resources in public subnets
5. **NAT Gateway** provides outbound-only internet access for private subnet resources
6. **Security Groups** (stateful, instance-level) provide first line of defense with allow-only rules
7. **NACLs** (stateless, subnet-level) provide additional defense layer with allow/deny rules
8. **VPC Flow Logs** capture network traffic metadata for monitoring and troubleshooting
9. **VPC Peering** connects VPCs in one-to-one relationships
10. **Transit Gateway** simplifies multi-VPC connectivity with hub-and-spoke model
11. **PrivateLink** enables private access to services without internet exposure

**Best Practices:**

- Use custom VPCs (not default VPC) for production workloads
- Deploy resources across multiple AZs for high availability
- Separate public and private subnets based on resource accessibility needs
- Implement defense in depth with both Security Groups and NACLs
- Use VPC Flow Logs for security monitoring and troubleshooting
- Plan IP address ranges carefully to avoid overlap and allow for growth
- Use Transit Gateway for complex multi-VPC architectures
- Leverage PrivateLink for private service access

