---
title: Load Balancing and Auto Scaling Quiz
linkTitle: Load Balancing and Scaling
type: docs
weight: 6
prev: /quiz/aws/05-compute-services
next: /quiz/aws/07-identity-and-access-management
---

{{< quiz id="aws-load-balancing-scaling-quiz" >}}
{
  "questions": [
    {
      "id": "aws-load-balancing-scaling-quiz-01",
      "type": "mcq",
      "question": "Which load balancer type would be MOST appropriate for a gaming application requiring ultra-low latency and static IP addresses for player connections?",
      "options": [
        "Application Load Balancer (ALB)",
        "Network Load Balancer (NLB)",
        "Gateway Load Balancer (GWLB)",
        "Classic Load Balancer (CLB)"
      ],
      "answer": 1,
      "explanation": "Network Load Balancer (NLB) operates at Layer 4, provides ultra-low latency (~100 microseconds), supports TCP/UDP protocols needed for gaming, and offers static IP addresses with Elastic IP support—making it ideal for gaming applications.",
      "hint": "Consider which load balancer operates at Layer 4 and supports static IP addresses."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-02",
      "type": "multiple-select",
      "question": "Which of the following are valid target types for an Application Load Balancer?",
      "options": [
        "EC2 instances",
        "Lambda functions",
        "IP addresses",
        "S3 buckets",
        "Application Load Balancers"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "ALB supports EC2 instances, Lambda functions, IP addresses (for on-premises or container workloads), and even other ALBs. S3 buckets cannot be direct targets for ALB.",
      "hint": "Think about what compute resources can handle HTTP/HTTPS requests."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-03",
      "type": "code-output",
      "question": "An ALB listener has the following rules configured. A request comes in for `https://api.example.com/users`. Which target group receives the request?",
      "code": "Priority   Condition              Action\n-----------------------------------------------\n1          Path: /api/*           → API-TG\n10         Host: admin.*          → Admin-TG\n100        Header: X-User: admin  → Admin-TG\nDefault    (No match)             → Default-TG",
      "language": "text",
      "options": [
        "API-TG",
        "Admin-TG",
        "Default-TG",
        "The request is rejected"
      ],
      "answer": 2,
      "explanation": "The path `/users` doesn't match `/api/*`, the host `api.example.com` doesn't match `admin.*`, and there's no X-User header. Since no rules match, the request goes to the Default-TG.",
      "hint": "Evaluate each rule condition carefully and remember that rules are evaluated by priority."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-04",
      "type": "true-false",
      "question": "In a Network Load Balancer, client IP addresses are preserved and visible to the target instances without requiring X-Forwarded-For headers.",
      "answer": true,
      "explanation": "NLB operates at Layer 4 and preserves the source IP address, making the client IP directly visible to targets. ALB operates at Layer 7 and requires X-Forwarded-For headers to pass client IP information.",
      "hint": "Consider the difference between Layer 4 and Layer 7 load balancing."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-05",
      "type": "fill-blank",
      "question": "The __________ period allows in-flight requests to complete before fully de-registering a target from a load balancer.",
      "answer": "deregistration delay",
      "caseSensitive": false,
      "explanation": "The deregistration delay (also known as connection draining) allows existing connections to complete gracefully before a target is fully removed. The default is 300 seconds, and it can range from 0 to 3600 seconds.",
      "hint": "This feature is also called 'connection draining' in some contexts."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-06",
      "type": "mcq",
      "question": "A target in an ALB target group is failing health checks. What happens to traffic routing?",
      "options": [
        "The load balancer continues sending traffic to the target",
        "The target is immediately terminated",
        "The target is automatically removed from rotation after the unhealthy threshold is reached",
        "The entire target group is marked as unhealthy"
      ],
      "answer": 2,
      "explanation": "When a target fails health checks and reaches the unhealthy threshold (default: 2 consecutive failures), it is automatically removed from the load balancer's rotation. Traffic is no longer sent to unhealthy targets. When it recovers and passes health checks, it's automatically added back.",
      "hint": "Health checks determine which targets receive traffic."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-07",
      "type": "drag-drop",
      "question": "Arrange these steps in the correct order for how an ALB processes an incoming request:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Listener receives request",
        "Evaluate listener rules",
        "Route to target group",
        "Health check and load balance to healthy target"
      ],
      "correctOrder": [0, 1, 2, 3],
      "explanation": "The ALB workflow: (1) Listener receives the request on configured protocol/port, (2) Listener rules are evaluated based on conditions, (3) Request is routed to the matching target group, (4) Load balancer performs health check validation and sends to a healthy target."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-08",
      "type": "multiple-select",
      "question": "Which routing conditions can be used in ALB listener rules?",
      "options": [
        "Path-based routing",
        "Host-based routing",
        "HTTP method routing",
        "Database query routing",
        "Source IP routing"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "ALB supports path-based, host-based, HTTP method, HTTP header, query string, and source IP routing. Database query routing is not a valid ALB routing condition as ALB operates at the HTTP/HTTPS layer.",
      "hint": "Think about HTTP request attributes that ALB can inspect."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-09",
      "type": "code-completion",
      "question": "Complete the health check configuration for a target group:",
      "instruction": "Fill in the missing protocol",
      "codeTemplate": "Health Check Settings:\n├─ Protocol: _____\n├─ Path: /health\n├─ Interval: 30 seconds\n├─ Timeout: 5 seconds\n├─ Healthy threshold: 2\n└─ Success codes: 200",
      "answer": "HTTP",
      "caseSensitive": false,
      "acceptedAnswers": ["HTTP", "HTTPS"],
      "explanation": "Health checks for ALB target groups typically use HTTP or HTTPS protocol to check an endpoint path (like /health). The protocol should match the application's requirements."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-10",
      "type": "mcq",
      "question": "What is the PRIMARY purpose of a Launch Template in Auto Scaling?",
      "options": [
        "To define scaling policies for the Auto Scaling Group",
        "To specify instance configuration that Auto Scaling uses to launch EC2 instances",
        "To monitor CloudWatch metrics for scaling decisions",
        "To distribute instances across Availability Zones"
      ],
      "answer": 1,
      "explanation": "A Launch Template specifies the instance configuration (AMI, instance type, security groups, user data, etc.) that the Auto Scaling Group uses to launch new EC2 instances. Scaling policies, monitoring, and AZ distribution are configured separately in the ASG itself.",
      "hint": "Think about what information is needed to create a new EC2 instance."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-11",
      "type": "true-false",
      "question": "Launch Configurations support versioning and can be modified after creation, making them the recommended choice over Launch Templates.",
      "answer": false,
      "explanation": "This is false. Launch Configurations are immutable (cannot be modified) and do not support versioning. Launch Templates are the recommended choice because they support versioning, can be modified, support multiple instance types, and include modern features.",
      "hint": "Consider which option is marked as 'Legacy' in the content."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-12",
      "type": "mcq",
      "question": "An Auto Scaling Group is configured with Min: 2, Desired: 4, Max: 10. Due to a traffic spike, the ASG scales to 8 instances. When traffic returns to normal, what is the MINIMUM number of instances the ASG will maintain?",
      "options": [
        "2 instances",
        "4 instances",
        "8 instances",
        "10 instances"
      ],
      "answer": 0,
      "explanation": "The ASG will scale back down to the minimum capacity of 2 instances when demand decreases, assuming scaling policies allow it. The minimum setting (2) is the floor that the ASG will never go below, regardless of low demand.",
      "hint": "The 'Min' setting represents the absolute minimum number of instances."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-13",
      "type": "flashcard",
      "question": "What is Target Tracking Scaling?",
      "answer": "**Target Tracking Scaling** is an Auto Scaling policy that automatically adjusts capacity to maintain a specific metric at a target value.\n\n**Example:** Keep average CPU utilization at 50%\n\n**How it works:**\n- If CPU exceeds 50%, ASG adds instances\n- If CPU falls below 50%, ASG removes instances\n- Continuously monitors and adjusts to maintain the target\n\n**Benefits:** Easiest to configure, automatically calculates scaling adjustments, no need to define step scaling rules."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-14",
      "type": "multiple-select",
      "question": "Which scaling policy types are available for EC2 Auto Scaling?",
      "options": [
        "Manual Scaling",
        "Scheduled Scaling",
        "Target Tracking Scaling",
        "Predictive Scaling",
        "Geographic Scaling"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "EC2 Auto Scaling supports Manual (manual adjustments), Scheduled (date/time-based), Dynamic Scaling (including Target Tracking and Step Scaling), and Predictive Scaling (ML-based forecasting). Geographic Scaling is not a valid Auto Scaling policy type.",
      "hint": "Think about different ways to determine when and how to scale capacity."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-15",
      "type": "code-output",
      "question": "An Auto Scaling Group has Step Scaling configured as follows. Current CPU is at 68%. How many instances will be added?",
      "code": "Step Scaling Policy:\n• CPU 50-60%: Add 1 instance\n• CPU 60-70%: Add 2 instances\n• CPU >70%:   Add 3 instances\n\nCurrent State:\n• CPU Utilization: 68%\n• Current Instances: 5",
      "language": "text",
      "options": [
        "1 instance",
        "2 instances",
        "3 instances",
        "0 instances (no scaling)"
      ],
      "answer": 1,
      "explanation": "With CPU at 68%, the condition 'CPU 60-70%' is met, which triggers adding 2 instances. The ASG will scale from 5 to 7 instances (assuming max capacity allows it).",
      "hint": "Find which CPU range 68% falls into."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-16",
      "type": "fill-blank",
      "question": "The __________ period prevents rapid, successive scaling actions by temporarily ignoring new scaling requests after a scaling action completes.",
      "answer": "cooldown",
      "caseSensitive": false,
      "explanation": "The cooldown period (default: 300 seconds) prevents the Auto Scaling Group from launching or terminating additional instances before the effects of previous activities are visible. This helps avoid thrashing and unnecessary scaling actions.",
      "hint": "This period helps instances 'cool down' before evaluating scaling again."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-17",
      "type": "mcq",
      "question": "Which Auto Scaling policy type would be BEST for an e-commerce application that experiences predictable traffic spikes every day at 8 AM and 6 PM?",
      "options": [
        "Target Tracking Scaling only",
        "Step Scaling only",
        "Scheduled Scaling combined with Dynamic Scaling",
        "Predictive Scaling only"
      ],
      "answer": 2,
      "explanation": "Scheduled Scaling is ideal for predictable patterns (scale up at 8 AM, scale down at 6 PM). Combining it with Dynamic Scaling (like Target Tracking) provides both proactive scaling for known patterns and reactive scaling for unexpected spikes—the best of both worlds.",
      "hint": "The traffic pattern is predictable (same time daily), so one policy can handle the scheduled aspect."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-18",
      "type": "true-false",
      "question": "When using Target Tracking Scaling, you need to manually configure cooldown periods for scale-in and scale-out actions.",
      "answer": false,
      "explanation": "False. Target Tracking Scaling automatically manages warmup and cooldown periods. You don't need to manually configure cooldown periods—the scaling policy handles this automatically to prevent rapid scaling actions.",
      "hint": "Target Tracking is designed to be the easiest Auto Scaling policy to configure."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-19",
      "type": "mcq",
      "question": "An Auto Scaling Group is deployed across 3 Availability Zones with 'Balanced Best Effort' distribution strategy. The desired capacity is 6 instances, but AZ-A becomes unavailable. What happens?",
      "options": [
        "ASG maintains strict balance: 2 instances in AZ-B, 2 in AZ-C (total 4)",
        "ASG prioritizes capacity: 3 instances in AZ-B, 3 in AZ-C (total 6)",
        "ASG scales to maximum capacity across all zones",
        "ASG terminates all instances and waits for AZ-A to recover"
      ],
      "answer": 1,
      "explanation": "With 'Balanced Best Effort', the ASG prioritizes meeting the desired capacity (6 instances) over strict balance. It will distribute instances across available AZs (AZ-B and AZ-C) to reach 6 total instances, even if the distribution isn't perfectly balanced.",
      "hint": "The key word is 'Best Effort'—it tries to balance but prioritizes capacity."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-20",
      "type": "flashcard",
      "question": "What is the difference between ALB and NLB?",
      "answer": "**Application Load Balancer (ALB) - Layer 7**\n- Protocol: HTTP, HTTPS, gRPC\n- Routing: Path, host, header, query string based\n- Use case: Web apps, microservices, APIs\n- Features: Content-based routing, WebSocket, HTTP/2\n\n**Network Load Balancer (NLB) - Layer 4**\n- Protocol: TCP, UDP, TLS\n- Performance: Ultra-low latency (~100 μs), millions of req/sec\n- Static IP: One per AZ, Elastic IP support\n- Use case: Extreme performance, gaming, IoT, TCP/UDP apps\n- Preserves client IP without X-Forwarded-For"
    },
    {
      "id": "aws-load-balancing-scaling-quiz-21",
      "type": "multiple-select",
      "question": "What are valid listener actions in an Application Load Balancer?",
      "options": [
        "Forward to target group",
        "Redirect (e.g., HTTP to HTTPS)",
        "Fixed response with custom HTTP response",
        "Authenticate using Cognito",
        "Encrypt data using KMS"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "ALB supports Forward (to target group), Redirect (like HTTP→HTTPS), Fixed Response (return custom HTTP response), and Authenticate (using OIDC or Cognito). KMS encryption is not a listener action—TLS/SSL termination handles encryption.",
      "hint": "Think about what actions can be performed on HTTP/HTTPS requests at the load balancer level."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-22",
      "type": "mcq",
      "question": "What is the purpose of the 'health check grace period' in an Auto Scaling Group integrated with a load balancer?",
      "options": [
        "Time to wait before the first health check is performed",
        "Time allowed for a newly launched instance to warm up before health checks begin",
        "Time between consecutive health check requests",
        "Maximum time a health check request can take before timing out"
      ],
      "answer": 1,
      "explanation": "The health check grace period (default: 300 seconds) gives newly launched instances time to boot up, install software, and become ready before health checks begin. This prevents ASG from terminating instances that are still initializing.",
      "hint": "Think about what happens immediately after a new instance is launched."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-23",
      "type": "code-completion",
      "question": "Complete the target group attribute configuration:",
      "instruction": "Fill in the missing load balancing algorithm option",
      "codeTemplate": "Target Group Attributes:\n├─ Deregistration delay: 300 seconds\n├─ Stickiness: Enabled\n├─ Load balancing algorithm: ___________\n└─ Slow start mode: Disabled",
      "answer": "Round robin",
      "caseSensitive": false,
      "acceptedAnswers": ["Round robin", "least outstanding"],
      "explanation": "ALB target groups support two main load balancing algorithms: 'Round robin' (distributes requests evenly across targets) and 'Least outstanding requests' (sends requests to the target with the fewest outstanding requests).",
      "hint": "There are two common algorithms: one that distributes evenly, and one that considers target load."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-24",
      "type": "true-false",
      "question": "Gateway Load Balancer (GWLB) operates at Layer 3 and is primarily used for deploying and managing third-party virtual appliances like firewalls and intrusion detection systems.",
      "answer": true,
      "explanation": "True. GWLB operates at Layer 3 (network layer), processes all IP packets, and is designed specifically for deploying, scaling, and managing third-party network appliances such as firewalls, IDS/IPS, and deep packet inspection tools.",
      "hint": "Think about which load balancer is designed for network security appliances."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-25",
      "type": "mcq",
      "question": "A web application uses an ALB with session stickiness enabled. What happens when a target instance becomes unhealthy?",
      "options": [
        "Users with sticky sessions to that instance lose their session data and are disconnected",
        "The ALB automatically routes sticky sessions to a healthy instance",
        "All sticky sessions are cleared and users must re-authenticate",
        "The unhealthy instance continues to receive traffic until it's manually removed"
      ],
      "answer": 1,
      "explanation": "When a target becomes unhealthy, the ALB automatically routes sticky sessions to a healthy instance. This ensures high availability—users don't lose connectivity, though session data may be lost if not shared across instances (which is why external session stores like ElastiCache are recommended).",
      "hint": "High availability is a key benefit of load balancers."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-26",
      "type": "flashcard",
      "question": "What is Predictive Scaling?",
      "answer": "**Predictive Scaling** is an ML-based Auto Scaling feature that proactively scales capacity before demand increases.\n\n**How it works:**\n- Analyzes historical CloudWatch metric data\n- Uses machine learning to forecast future traffic patterns\n- Automatically scales capacity ahead of predicted demand\n- Works alongside dynamic scaling policies\n\n**Best for:** Applications with recurring patterns (daily, weekly traffic cycles)\n\n**Example:** An online learning platform that sees traffic spike every weekday at 9 AM when classes start—Predictive Scaling can add capacity at 8:50 AM proactively."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-27",
      "type": "drag-drop",
      "question": "Arrange these Auto Scaling capacity values in the correct order from smallest to largest:",
      "instruction": "Drag to arrange from smallest to largest",
      "items": [
        "Minimum capacity",
        "Desired capacity",
        "Maximum capacity"
      ],
      "correctOrder": [0, 1, 2],
      "explanation": "The capacity hierarchy is: Minimum ≤ Desired ≤ Maximum. The ASG will never go below minimum, tries to maintain desired capacity, and will not exceed maximum even under extreme load."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-28",
      "type": "multiple-select",
      "question": "Which benefits does Elastic Load Balancing provide?",
      "options": [
        "High availability by distributing traffic across multiple targets",
        "Fault tolerance by detecting and routing around unhealthy targets",
        "SSL/TLS termination and certificate management",
        "Automatic instance patching and OS updates",
        "Integration with CloudWatch for monitoring"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "ELB provides high availability (multi-target distribution), fault tolerance (health checks and automatic recovery), security (SSL/TLS termination), and monitoring (CloudWatch integration). Automatic OS patching is an EC2 Systems Manager feature, not an ELB feature.",
      "hint": "Focus on traffic distribution, health, security, and monitoring features."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-29",
      "type": "mcq",
      "question": "Which scenario would benefit MOST from using 'Slow Start Mode' in an ALB target group?",
      "options": [
        "Targets that can immediately handle full traffic load",
        "Targets that need time to warm up caches or establish connections before handling full traffic",
        "Targets that are frequently marked as unhealthy",
        "Targets in multiple Availability Zones"
      ],
      "answer": 1,
      "explanation": "Slow Start Mode gradually increases the amount of traffic sent to newly registered targets over a specified period. This is ideal for applications that need time to warm up caches, establish database connections, or load data before handling full production traffic.",
      "hint": "Think about applications that perform better after an initial warm-up period."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-30",
      "type": "code-output",
      "question": "An Auto Scaling Group has the following configuration. A scaling action is triggered at T+0 to add 2 instances. At T+1 minute, another alarm triggers. What happens?",
      "code": "Auto Scaling Group Configuration:\n├─ Default cooldown: 300 seconds\n├─ Scaling policy: Simple Scaling\n└─ Action: Add 2 instances when CPU > 70%\n\nTimeline:\nT+0:   CPU = 75%, scaling action triggered (Add 2)\nT+1m:  CPU = 80%, alarm triggers again\nT+5m:  Cooldown period ends",
      "language": "text",
      "options": [
        "2 more instances are added immediately",
        "The alarm is ignored due to cooldown period",
        "The instances are removed because of the conflicting signal",
        "The cooldown period is reset to T+1m + 300s"
      ],
      "answer": 1,
      "explanation": "The alarm at T+1 minute is ignored because the cooldown period (300 seconds = 5 minutes) is still active from the T+0 scaling action. New scaling actions are blocked until T+5 minutes when the cooldown ends. This prevents rapid, successive scaling.",
      "hint": "Cooldown prevents scaling actions during the specified period after a scaling event."
    },
    {
      "id": "aws-load-balancing-scaling-quiz-31",
      "type": "fill-blank",
      "question": "In ALB, the __________ threshold determines how many consecutive successful health checks are required before a target is marked as healthy.",
      "answer": "healthy",
      "caseSensitive": false,
      "explanation": "The 'healthy threshold' (default: 2) specifies the number of consecutive successful health checks required before a target transitions from unhealthy to healthy status. Similarly, the 'unhealthy threshold' determines how many failures mark a target as unhealthy.",
      "hint": "This threshold is the opposite of the 'unhealthy threshold'."
    }
  ]
}
{{< /quiz >}}

