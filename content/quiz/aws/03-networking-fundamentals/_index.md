---
title: Networking Fundamentals Quiz
linkTitle: Networking Fundamentals
type: docs
weight: 3
prev: /quiz/aws/02-global-infrastructure
next: /quiz/aws/04-edge-and-hybrid-networking
---

{{< quiz id="aws-networking-fundamentals-quiz" >}}
{
  "questions": [
    {
      "type": "mcq",
      "question": "What is the valid CIDR block size range for an AWS VPC?",
      "options": [
        "Minimum `/24`, Maximum `/8`",
        "Minimum `/28`, Maximum `/16`",
        "Minimum `/32`, Maximum `/16`",
        "Minimum `/16`, Maximum `/8`"
      ],
      "answer": 1,
      "explanation": "AWS VPCs support CIDR blocks from `/28` (16 IP addresses) to `/16` (65,536 IP addresses). This allows flexibility in VPC sizing while maintaining reasonable limits.",
      "hint": "Think about the range from smallest to largest supported VPC sizes."
    },
    {
      "type": "multiple-select",
      "question": "Which IP addresses are reserved by AWS in a subnet with CIDR block `10.0.0.0/24`?",
      "options": [
        "`10.0.0.0` - Network address",
        "`10.0.0.1` - VPC router",
        "`10.0.0.2` - DNS server",
        "`10.0.0.3` - Reserved for future use",
        "`10.0.0.255` - Broadcast address"
      ],
      "answers": [0, 1, 2, 3, 4],
      "explanation": "AWS reserves 5 IP addresses in every subnet: the network address (.0), VPC router (.1), DNS server (.2), one for future use (.3), and broadcast address (.255). This leaves 251 usable IPs in a /24 subnet.",
      "hint": "AWS always reserves exactly 5 IP addresses in each subnet."
    },
    {
      "type": "true-false",
      "question": "A VPC can span multiple AWS Regions.",
      "answer": false,
      "explanation": "VPCs are regional constructs and cannot span multiple Regions. However, a single VPC can span all Availability Zones within a Region. To connect VPCs across regions, you would use VPC Peering or Transit Gateway with inter-region peering.",
      "hint": "Consider the scope of a VPC - is it global, regional, or AZ-specific?"
    },
    {
      "type": "mcq",
      "question": "What is the primary difference between a public subnet and a private subnet?",
      "options": [
        "Public subnets have more IP addresses than private subnets",
        "Public subnets have a route to an Internet Gateway in their route table",
        "Private subnets cannot communicate with other subnets in the VPC",
        "Public subnets are always in different Availability Zones"
      ],
      "answer": 1,
      "explanation": "A public subnet is defined by having a route to an Internet Gateway (0.0.0.0/0 → IGW) in its route table. Private subnets lack this direct route to the IGW, instead using NAT Gateways for outbound internet access.",
      "hint": "Focus on routing configuration, not size or location."
    },
    {
      "type": "code-output",
      "question": "Given a VPC with CIDR `10.0.0.0/16`, which route is automatically added to all route tables?",
      "code": "VPC CIDR: 10.0.0.0/16\n\nRoute Table:\nDestination        Target\n--------------------------\n?                  ?",
      "language": "text",
      "options": [
        "`0.0.0.0/0` → `local`",
        "`10.0.0.0/16` → `local`",
        "`10.0.0.0/16` → `igw-xxxxx`",
        "`0.0.0.0/0` → `igw-xxxxx`"
      ],
      "answer": 1,
      "explanation": "The local route (`10.0.0.0/16` → `local`) is automatically added to all route tables in the VPC. This enables communication between all resources within the VPC. It cannot be modified or deleted.",
      "hint": "This route enables intra-VPC communication and is automatic."
    },
    {
      "type": "fill-blank",
      "question": "What keyword is used in route tables to enable intra-VPC communication?",
      "answer": "local",
      "caseSensitive": false,
      "explanation": "The `local` target in route tables enables communication between all resources within the VPC. Every VPC route table automatically includes this route for the VPC's CIDR block.",
      "hint": "It's a 5-letter word that describes traffic staying within the VPC."
    },
    {
      "type": "flashcard",
      "question": "What is the difference between a NAT Gateway and a NAT Instance?",
      "answer": "**NAT Gateway:**\n- Managed by AWS (no maintenance)\n- Highly available within an AZ\n- Scales automatically up to 45 Gbps\n- No security groups (use NACLs)\n- Higher cost, lower operational overhead\n\n**NAT Instance:**\n- Self-managed EC2 instance\n- Single point of failure (manual HA needed)\n- Limited by instance type bandwidth\n- Supports security groups\n- Can be used as bastion host\n- Lower cost, higher operational overhead"
    },
    {
      "type": "multiple-select",
      "question": "What are the requirements for an EC2 instance in a public subnet to have internet access?",
      "options": [
        "Internet Gateway attached to the VPC",
        "Route table entry: `0.0.0.0/0` → IGW",
        "Public IP address or Elastic IP assigned to instance",
        "Security Group allows desired traffic",
        "Network ACL allows traffic"
      ],
      "answers": [0, 1, 2, 3, 4],
      "explanation": "All five requirements must be met: (1) IGW attached to VPC, (2) route to IGW in subnet's route table, (3) public IP on instance, (4) Security Group allowing traffic, and (5) NACL allowing traffic on required ports including ephemeral ports.",
      "hint": "Internet access requires multiple layers to be configured correctly."
    },
    {
      "type": "true-false",
      "question": "Security Groups are stateful, meaning return traffic is automatically allowed.",
      "answer": true,
      "explanation": "Security Groups are stateful - they automatically track connection state and allow return traffic. If you allow an inbound request, the response is automatically allowed regardless of outbound rules. This is different from NACLs which are stateless.",
      "hint": "Think about whether you need to configure both inbound and outbound rules for a connection."
    },
    {
      "type": "mcq",
      "question": "At what level are Network ACLs (NACLs) applied?",
      "options": [
        "Instance level (ENI)",
        "Subnet level",
        "VPC level",
        "Availability Zone level"
      ],
      "answer": 1,
      "explanation": "NACLs are applied at the subnet level, affecting all instances within that subnet. This is different from Security Groups which are applied at the instance level (ENI). Each subnet must be associated with exactly one NACL.",
      "hint": "NACLs provide a boundary defense for a specific network segment."
    },
    {
      "type": "drag-drop",
      "question": "Arrange the security layers in order from outermost to innermost when traffic enters a VPC:",
      "instruction": "Drag to arrange in the correct order (first to last)",
      "items": [
        "Internet Gateway",
        "Network ACL (Subnet Level)",
        "Security Group (Instance Level)",
        "EC2 Instance (Optional OS Firewall)"
      ],
      "correctOrder": [0, 1, 2, 3],
      "explanation": "Traffic flows through multiple security layers: Internet Gateway → Network ACL (subnet boundary) → Security Group (instance firewall) → EC2 Instance. This defense-in-depth strategy provides multiple security checkpoints."
    },
    {
      "type": "code-completion",
      "question": "Complete the route table entry for a private subnet to route internet traffic through a NAT Gateway:",
      "instruction": "Fill in the destination CIDR block",
      "codeTemplate": "Destination        Target\n--------------------------\n10.0.0.0/16       local\n_____             nat-1234567890",
      "answer": "0.0.0.0/0",
      "caseSensitive": false,
      "acceptedAnswers": ["0.0.0.0/0"],
      "explanation": "The route `0.0.0.0/0` → NAT Gateway directs all internet-bound traffic from the private subnet through the NAT Gateway. The NAT Gateway then forwards traffic to the Internet Gateway."
    },
    {
      "type": "multiple-select",
      "question": "Which statements are true about VPC Flow Logs?",
      "options": [
        "Captures actual packet contents (payload data)",
        "Captures network traffic metadata (source, destination, ports)",
        "Can be sent to CloudWatch Logs or S3",
        "Shows whether traffic was accepted or rejected",
        "Can be created at VPC, subnet, or ENI level"
      ],
      "answers": [1, 2, 3, 4],
      "explanation": "VPC Flow Logs capture metadata only (not packet contents), including source/destination IPs, ports, protocol, and accept/reject status. They can be sent to CloudWatch, S3, or Kinesis and can be scoped to VPC, subnet, or individual network interfaces.",
      "hint": "Flow Logs are for metadata analysis, not deep packet inspection."
    },
    {
      "type": "mcq",
      "question": "How many NAT Gateways should you deploy for high availability in a VPC with resources across two Availability Zones?",
      "options": [
        "One NAT Gateway shared across both AZs",
        "One NAT Gateway per AZ (total of 2)",
        "One NAT Gateway per subnet (depends on subnet count)",
        "Three NAT Gateways for redundancy"
      ],
      "answer": 1,
      "explanation": "Deploy one NAT Gateway per Availability Zone for high availability. NAT Gateways are AZ-specific, so if an AZ fails, only a NAT Gateway in another AZ can provide internet access. Each private subnet routes to the NAT Gateway in its own AZ.",
      "hint": "NAT Gateways are highly available within an AZ but not across AZs."
    },
    {
      "type": "true-false",
      "question": "VPC Peering connections are transitive, meaning if VPC-A peers with VPC-B and VPC-B peers with VPC-C, then VPC-A can communicate with VPC-C.",
      "answer": false,
      "explanation": "VPC Peering is NOT transitive. Each VPC pair requires a direct peering connection. If VPC-A needs to communicate with VPC-C, a direct peering connection must be established between them, even if both peer with VPC-B. For transitive routing, use Transit Gateway instead.",
      "hint": "Consider whether VPC Peering supports hub-and-spoke patterns."
    },
    {
      "type": "flashcard",
      "question": "What is AWS Transit Gateway and when should you use it?",
      "answer": "**AWS Transit Gateway** is a central hub that connects VPCs and on-premises networks with transitive routing.\n\n**Key Features:**\n- Hub-and-spoke model (simpler than VPC Peering mesh)\n- Transitive routing (A→TGW→C works)\n- Centralized management\n- Supports thousands of VPCs\n- Inter-region peering available\n- Route tables for network segmentation\n\n**Use When:**\n- Connecting many VPCs (>3-5)\n- Need transitive routing\n- Centralizing on-premises connectivity\n- Requiring network segmentation between environments"
    },
    {
      "type": "mcq",
      "question": "What is the main advantage of Gateway Endpoints over Interface Endpoints for S3 and DynamoDB?",
      "options": [
        "Gateway Endpoints provide faster data transfer speeds",
        "Gateway Endpoints have no hourly charges or data processing fees",
        "Gateway Endpoints support more AWS services",
        "Gateway Endpoints provide better security with encryption"
      ],
      "answer": 1,
      "explanation": "Gateway Endpoints (available only for S3 and DynamoDB) have no hourly charges or data processing fees, unlike Interface Endpoints. They work via route table entries rather than ENIs, making them cost-effective for high-volume S3/DynamoDB access.",
      "hint": "Think about cost differences between the two endpoint types."
    },
    {
      "type": "code-output",
      "question": "In a NACL, what happens when traffic matches rule number 100 that denies it, but rule 200 would allow it?",
      "code": "NACL Inbound Rules:\nRule #   Type        Port   Source       Allow/Deny\n-----------------------------------------------\n100      SSH         22     0.0.0.0/0    DENY\n200      SSH         22     0.0.0.0/0    ALLOW\n*        All         All    0.0.0.0/0    DENY\n\nSSH request from 203.0.113.5 arrives.",
      "language": "text",
      "options": [
        "Traffic is allowed (both rules are evaluated)",
        "Traffic is denied (rule 100 matches first)",
        "Traffic is allowed (ALLOW overrides DENY)",
        "Error: conflicting rules"
      ],
      "answer": 1,
      "explanation": "NACL rules are evaluated in numerical order (lowest to highest). The first matching rule is applied and evaluation stops. Since rule 100 matches first and denies the traffic, rule 200 is never evaluated. This demonstrates the importance of rule ordering in NACLs.",
      "hint": "NACLs use a 'first match wins' evaluation strategy."
    },
    {
      "type": "fill-blank",
      "question": "For NACLs to work with stateless connections, outbound rules must allow ephemeral ports in the range _____ to 65535.",
      "answer": "1024",
      "caseSensitive": false,
      "explanation": "Ephemeral ports (1024-65535) must be allowed in outbound NACL rules to permit return traffic, since NACLs are stateless. The exact range depends on the client OS, but 1024-65535 provides broad compatibility (Linux typically uses 32768-60999, Windows uses 49152-65535).",
      "hint": "Think about the starting port number for the ephemeral port range."
    },
    {
      "type": "multiple-select",
      "question": "Which components are required to implement AWS PrivateLink?",
      "options": [
        "VPC Interface Endpoint (consumer side)",
        "Internet Gateway",
        "Network Load Balancer (provider side)",
        "VPC Endpoint Service (provider side)",
        "NAT Gateway"
      ],
      "answers": [0, 2, 3],
      "explanation": "AWS PrivateLink requires three main components: (1) VPC Interface Endpoint (ENI in consumer VPC), (2) VPC Endpoint Service (provider configuration), and (3) Network Load Balancer (fronts the provider's service). Internet Gateway and NAT Gateway are not needed as PrivateLink uses AWS's private network.",
      "hint": "PrivateLink is about private connectivity, not internet-facing components."
    },
    {
      "type": "mcq",
      "question": "What is the maximum number of VPC peering connections needed for a full mesh topology with 5 VPCs?",
      "options": [
        "5 connections",
        "10 connections",
        "15 connections",
        "20 connections"
      ],
      "answer": 1,
      "explanation": "For a full mesh topology, the formula is N*(N-1)/2. With 5 VPCs: 5*(5-1)/2 = 5*4/2 = 10 peering connections. This demonstrates why VPC Peering becomes complex at scale and why Transit Gateway is recommended for many VPCs.",
      "hint": "Use the formula N*(N-1)/2 where N is the number of VPCs."
    },
    {
      "type": "drag-drop",
      "question": "Arrange these networking components from least granular (broadest scope) to most granular (narrowest scope):",
      "instruction": "Drag to arrange from broadest to narrowest scope",
      "items": [
        "VPC (Regional)",
        "Subnet (AZ-specific)",
        "Security Group (Instance)",
        "ENI (Network Interface)"
      ],
      "correctOrder": [0, 1, 2, 3],
      "explanation": "The hierarchy from broadest to narrowest: VPC spans an entire region and multiple AZs → Subnet exists in a single AZ → Security Group applies to instances → ENI is the actual network interface attached to an instance."
    },
    {
      "type": "true-false",
      "question": "A subnet can span multiple Availability Zones for high availability.",
      "answer": false,
      "explanation": "Subnets are AZ-specific and cannot span multiple AZs. Each subnet exists in exactly one Availability Zone. To achieve high availability, you must create subnets in multiple AZs and distribute resources across them.",
      "hint": "Think about the AZ binding of subnets."
    },
    {
      "type": "mcq",
      "question": "Which VPC Flow Logs analysis would help identify potential port scanning activity?",
      "options": [
        "Aggregate SUM(bytes) GROUP BY srcaddr",
        "Filter: dstport = 22 AND action = REJECT",
        "Filter: srcaddr = <suspicious-ip>, COUNT DISTINCT(dstport)",
        "Filter: action = ACCEPT, GROUP BY protocol"
      ],
      "answer": 2,
      "explanation": "Port scanning is detected by observing a single source IP attempting connections to many different destination ports. The query filters for a suspicious source IP and counts distinct destination ports, revealing scanning patterns where one host probes many ports.",
      "hint": "Port scanning involves one source trying many different ports."
    },
    {
      "type": "flashcard",
      "question": "Explain the concept of Security Group chaining and its benefits.",
      "answer": "**Security Group Chaining** is a pattern where Security Groups reference other Security Groups instead of IP addresses.\n\n**Example:**\n- Web tier SG: Outbound to `sg-app` on port 8080\n- App tier SG: Inbound from `sg-web` on port 8080, Outbound to `sg-db` on port 3306\n- DB tier SG: Inbound from `sg-app` on port 3306\n\n**Benefits:**\n- **Dynamic**: Rules automatically apply to all instances with referenced SG\n- **Maintainable**: No need to update IP addresses when instances change\n- **Secure**: Enforces tier-based access control\n- **Scalable**: Works regardless of instance count in each tier\n- **Clear**: Documents architectural relationships"
    },
    {
      "type": "code-completion",
      "question": "Complete the Security Group rule to allow HTTPS traffic from anywhere:",
      "instruction": "Fill in the source CIDR block for 'anywhere'",
      "codeTemplate": "Type        Protocol   Port   Source\n--------------------------------------\nHTTPS       TCP        443    _____",
      "answer": "0.0.0.0/0",
      "caseSensitive": false,
      "acceptedAnswers": ["0.0.0.0/0"],
      "explanation": "`0.0.0.0/0` represents all IPv4 addresses (anywhere on the internet). For public web servers, this is the appropriate source for HTTP (80) and HTTPS (443) traffic. For SSH/RDP, you should restrict to specific IP ranges."
    },
    {
      "type": "multiple-select",
      "question": "What are the key differences between Security Groups and NACLs?",
      "options": [
        "Security Groups are stateful, NACLs are stateless",
        "Security Groups apply at instance level, NACLs apply at subnet level",
        "Security Groups support only ALLOW rules, NACLs support both ALLOW and DENY",
        "Security Groups evaluate all rules, NACLs evaluate rules in order",
        "Security Groups are mandatory, NACLs are optional"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "All four differences are correct: (1) SGs are stateful (auto-allow return), NACLs are stateless, (2) SGs at instance level, NACLs at subnet level, (3) SGs only ALLOW rules, NACLs have both ALLOW/DENY, (4) SGs evaluate all rules, NACLs use first-match. Both are actually mandatory but you can use defaults.",
      "hint": "Focus on statefulness, scope, rule types, and evaluation logic."
    },
    {
      "type": "mcq",
      "question": "In a three-tier architecture, which subnets should the database tier be placed in?",
      "options": [
        "Public subnets for easy access",
        "Private subnets to prevent direct internet access",
        "Public subnets in one AZ, private in another",
        "No subnet needed, databases are region-level resources"
      ],
      "answer": 1,
      "explanation": "Database tiers should always be in private subnets to prevent direct internet access. They should only be accessible from the application tier via security group rules. This follows the principle of least privilege and defense in depth.",
      "hint": "Think about security best practices for sensitive data."
    },
    {
      "type": "true-false",
      "question": "An Internet Gateway has bandwidth constraints that may limit high-traffic applications.",
      "answer": false,
      "explanation": "Internet Gateways are horizontally scaled and redundant by AWS with no bandwidth constraints or availability risk. They automatically scale to handle your traffic without any configuration or capacity planning on your part.",
      "hint": "Consider AWS-managed service characteristics."
    },
    {
      "type": "fill-blank",
      "question": "How many IP addresses are available for use in a /24 subnet after AWS reserves its required addresses?",
      "answer": "251",
      "caseSensitive": false,
      "explanation": "A /24 subnet has 256 total IP addresses. AWS reserves 5 addresses (.0 network, .1 router, .2 DNS, .3 future, .255 broadcast), leaving 256 - 5 = 251 usable addresses.",
      "hint": "Start with 256 IPs in a /24, subtract AWS's 5 reserved addresses."
    },
    {
      "type": "mcq",
      "question": "What happens when a NAT Gateway in AZ-A fails and private subnet instances in AZ-A need internet access?",
      "options": [
        "Traffic automatically fails over to NAT Gateway in AZ-B",
        "Instances lose internet access until NAT Gateway is restored",
        "AWS automatically creates a replacement NAT Gateway",
        "Traffic routes through the Internet Gateway directly"
      ],
      "answer": 1,
      "explanation": "NAT Gateways are highly available within an AZ but do not automatically fail over across AZs. If the NAT Gateway in AZ-A fails, instances in that AZ lose internet access. This is why the best practice is to create separate NAT Gateways in each AZ with AZ-specific route tables.",
      "hint": "NAT Gateways provide HA within an AZ, not across AZs."
    }
  ]
}
{{< /quiz >}}

