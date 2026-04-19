---
title: Introduction Quiz
linkTitle: Introduction
type: docs
weight: 1
prev: /quiz/aws
next: /quiz/aws/02-global-infrastructure
---

{{< quiz id="aws-introduction-quiz" >}}
{
  "questions": [
    {
      "id": "aws-introduction-quiz-01",
      "type": "flashcard",
      "question": "What is the fundamental definition of cloud computing?",
      "answer": "On-demand delivery of IT resources over the internet with pay-as-you-go pricing."
    },
    {
      "id": "aws-introduction-quiz-02",
      "type": "multiple-select",
      "question": "Which of the following are key characteristics of cloud computing?",
      "options": [
        "On-Demand Self-Service",
        "Fixed pricing regardless of usage",
        "Resource Pooling",
        "Rapid Elasticity",
        "Measured Service",
        "Single-tenant dedicated infrastructure per customer"
      ],
      "answers": [0, 2, 3, 4],
      "explanation": "The five NIST key characteristics of cloud computing are: On-Demand Self-Service, Broad Network Access, Resource Pooling, Rapid Elasticity, and Measured Service. Fixed pricing contradicts the pay-as-you-go model (Measured Service). Cloud infrastructure is multi-tenant by design — dedicated infrastructure per customer is the opposite of Resource Pooling, where a provider serves multiple consumers from shared infrastructure.",
      "hint": "Think about the characteristics that enable flexibility, scalability, and cost optimization."
    },
    {
      "id": "aws-introduction-quiz-03",
      "type": "drag-drop",
      "question": "Arrange these AWS services from most to least customer control:",
      "instruction": "Drag to arrange in the correct order (most control → least control)",
      "items": [
        "AWS Elastic Beanstalk (PaaS)",
        "Amazon EC2 (IaaS)",
        "Amazon WorkMail (SaaS)",
        "AWS Lambda (PaaS)"
      ],
      "correctOrder": [1, 0, 3, 2],
      "explanation": "From most to least customer control: EC2 (IaaS — you manage OS through applications), Elastic Beanstalk (PaaS — platform manages runtime; you manage code and configuration), Lambda (PaaS — you provide only function code; AWS manages the runtime, scaling, and execution environment entirely), WorkMail (SaaS — you configure mailboxes only; AWS manages the entire email stack). The key distinction between EB and Lambda: Lambda abstracts even the server and container concept, giving less control than EB."
    },
    {
      "id": "aws-introduction-quiz-04",
      "type": "mcq",
      "question": "When a customer deploys applications on Amazon EC2, which set of components does the customer manage?",
      "options": [
        "Applications and Data only",
        "Applications, Data, Runtime, Middleware, and OS",
        "Applications, Data, Runtime, Middleware, OS, and Virtualization",
        "Applications, Data, and Runtime only"
      ],
      "answer": 1,
      "explanation": "With Amazon EC2 (IaaS), the customer manages Applications, Data, Runtime, Middleware, and OS. AWS handles Virtualization, Servers, Storage, and Networking. A common mistake is thinking customers also manage the virtualization layer — but the hypervisor is AWS's responsibility. EC2 gives you an OS and above; everything below belongs to AWS. 'Applications and Data only' describes PaaS, where the provider also manages Runtime and Middleware.",
      "hint": "EC2 is IaaS — you manage the operating system and everything that runs on it."
    },
    {
      "id": "aws-introduction-quiz-05",
      "type": "mcq",
      "question": "A company deploys sensitive financial data on its on-premises servers while running scalable web applications on AWS. Which deployment model best describes this architecture?",
      "options": [
        "Public Cloud",
        "Private Cloud",
        "Hybrid Cloud",
        "Multi-Cloud"
      ],
      "answer": 2,
      "explanation": "Hybrid Cloud combines public and private clouds, letting data and applications be shared between them. A common mistake is calling this 'Private Cloud' because of the on-premises component — but Private Cloud means infrastructure used exclusively by a single organization with no public cloud involved. Multi-Cloud means using multiple public cloud providers (e.g., AWS + Azure), not a mix of on-premises and cloud. The defining feature of Hybrid is the connection and data-sharing between both environments.",
      "hint": "The key is the combination of different infrastructure types working together."
    },
    {
      "id": "aws-introduction-quiz-06",
      "type": "fill-blank",
      "question": "What AWS service is an example of Platform as a Service (PaaS) that automatically handles deployment, capacity provisioning, load balancing, and auto-scaling?",
      "answer": "Elastic Beanstalk",
      "acceptedAnswers": ["Elastic Beanstalk", "AWS Elastic Beanstalk", "Amazon Elastic Beanstalk"],
      "caseSensitive": false,
      "explanation": "AWS Elastic Beanstalk is a PaaS offering that manages the infrastructure while developers focus on applications and data. AWS Lambda is also mentioned as a PaaS example.",
      "hint": "Think about AWS services that manage the platform layer for you."
    },
    {
      "id": "aws-introduction-quiz-07",
      "type": "true-false",
      "question": "In the AWS Shared Responsibility Model, AWS is responsible for managing customer data encryption and network firewall configuration.",
      "answer": false,
      "explanation": "False. Customer data encryption and network firewall configuration are customer responsibilities (Security IN the Cloud). AWS is responsible for the security OF the cloud infrastructure itself.",
      "hint": "Consider the difference between 'Security OF the Cloud' vs 'Security IN the Cloud'."
    },
    {
      "id": "aws-introduction-quiz-08",
      "type": "multiple-select",
      "question": "Which of the following are AWS responsibilities under the Shared Responsibility Model?",
      "options": [
        "Physical security of data centers",
        "Operating system patching for EC2 instances",
        "Hardware and network infrastructure",
        "Identity and access management policies",
        "Virtualization layer security"
      ],
      "answers": [0, 2, 4],
      "explanation": "AWS is responsible for physical security, hardware/network infrastructure, and the virtualization layer (Security OF the Cloud). Customers handle OS patching and IAM policies (Security IN the Cloud).",
      "hint": "AWS manages the infrastructure and foundation. What can you physically touch in a data center?"
    },
    {
      "id": "aws-introduction-quiz-09",
      "type": "flashcard",
      "question": "What does 'Rapid Elasticity' mean in cloud computing?",
      "answer": "**Rapid Elasticity**\n\nThe ability to quickly scale resources up or down based on demand.\n\n- Resources can be elastically provisioned and released automatically\n- Systems scale outward during peak demand and inward when demand drops\n- Avoids over-provisioning — pay only for what you need, when you need it\n- Enables workloads to handle sudden traffic spikes without manual intervention\n- Contrast with traditional IT: capacity was planned months in advance and over-provisioned as a safety buffer"
    },
    {
      "id": "aws-introduction-quiz-10",
      "type": "mcq",
      "question": "Which AWS benefit directly addresses the challenge of reducing latency for global users?",
      "options": [
        "Cost Efficiency",
        "Agility and Speed",
        "Global Reach",
        "High Availability"
      ],
      "answer": 2,
      "explanation": "Global Reach enables deploying applications in multiple geographic regions, directly reducing network latency for end users. 'Agility and Speed' refers to how quickly you can deploy resources (minutes to launch), not network latency — a common point of confusion. 'High Availability' improves resilience and uptime through redundancy, but deploying across multiple AZs in one region doesn't reduce distance to global users. Only deploying to geographically closer regions reduces latency, which is what Global Reach enables.",
      "hint": "Think about geographical distribution of infrastructure."
    },
    {
      "id": "aws-introduction-quiz-11",
      "type": "fill-blank",
      "question": "Which AWS value proposition covers industry-leading security practices, compliance certifications, and the Shared Responsibility Model?",
      "answer": "Security",
      "acceptedAnswers": ["Security", "AWS Security"],
      "caseSensitive": false,
      "explanation": "Security is a core AWS value proposition — not just a feature. AWS invests in physical security, compliance frameworks, and the Shared Responsibility Model so customers can inherit compliance certifications without building their own. This matters for organizations in regulated industries (healthcare, finance) that can leverage AWS to satisfy compliance requirements that would otherwise require years of independent auditing.",
      "hint": "Think about the AWS value that relates to certifications, compliance, and the Shared Responsibility Model."
    },
    {
      "id": "aws-introduction-quiz-12",
      "type": "multiple-select",
      "question": "Which statements accurately describe customer responsibilities in the AWS Shared Responsibility Model?",
      "options": [
        "Patching the underlying host OS on managed services like RDS",
        "Data encryption at rest and in transit",
        "Network configuration and firewall rules",
        "Physical network hardware maintenance between data centers",
        "Application security and patching",
        "Securing the virtualization software layer beneath EC2 instances"
      ],
      "answers": [1, 2, 4],
      "explanation": "Customers are responsible for data encryption, network configuration and firewall rules, and application security and patching (Security IN the Cloud). The wrong options are all AWS responsibilities: managed services like RDS handle host OS patching (AWS managed service operations); physical network hardware is AWS infrastructure; the virtualization layer beneath EC2 belongs to AWS, not the EC2 customer. For IaaS, the customer's responsibility starts at the OS — not below it.",
      "hint": "Focus on what happens 'in' the cloud that customers control, not the cloud infrastructure itself."
    },
    {
      "id": "aws-introduction-quiz-13",
      "type": "true-false",
      "question": "With AWS's pay-as-you-go model, organizations benefit from economies of scale, which means variable costs decrease over time as AWS grows.",
      "answer": true,
      "explanation": "True. AWS passes on the benefits of economies of scale to customers — as AWS's infrastructure and customer base grow, per-unit costs drop and AWS regularly reduces service prices. A common misconception is that these cost reductions benefit only AWS's margins; in practice, customers see lower prices over time without any action on their part. This is why cloud computing becomes more cost-effective over time, not just at initial adoption.",
      "hint": "Consider how large-scale operations typically affect per-unit costs."
    },
    {
      "id": "aws-introduction-quiz-14",
      "type": "mcq",
      "question": "A startup wants to experiment with machine learning without large capital expenditure and needs to deploy quickly. Which AWS benefit is most relevant to this scenario?",
      "options": [
        "Security and compliance certifications",
        "Agility and Speed with no upfront investment",
        "Global infrastructure for low latency",
        "Managed service operations"
      ],
      "answer": 1,
      "explanation": "Agility and Speed, combined with no upfront infrastructure investment, allows startups to experiment and deploy resources in minutes without large capital expenditure. This directly addresses their needs.",
      "hint": "What matters most for a startup: fast deployment or geographical distribution?"
    },
    {
      "id": "aws-introduction-quiz-15",
      "type": "flashcard",
      "question": "What is the AWS Shared Responsibility Model?",
      "answer": "**AWS Shared Responsibility Model**\n\nA security framework that defines the division of responsibilities between AWS and customers:\n\n**AWS Responsibility (Security OF the Cloud):**\n- Physical security, hardware, networking\n- Virtualization layer\n- Global infrastructure (Regions, AZs, Edge Locations)\n\n**Customer Responsibility (Security IN the Cloud):**\n- Data encryption and integrity\n- Network and firewall configuration\n- Identity and access management\n- OS and application patching\n- Application security"
    },
    {
      "id": "aws-introduction-quiz-16",
      "type": "fill-blank",
      "question": "In cloud computing, the ability to provision resources automatically without human interaction with service providers is called _______ Self-Service.",
      "answer": "On-Demand",
      "caseSensitive": false,
      "explanation": "On-Demand Self-Service allows users to provision resources automatically, without waiting for a service provider to act. This distinguishes cloud from traditional IT procurement — no purchase order approvals or hardware delivery wait times. It directly enables the Agility and Speed AWS benefit: developers can spin up new environments in minutes rather than weeks.",
      "hint": "This characteristic emphasizes immediate availability without waiting."
    },
    {
      "id": "aws-introduction-quiz-17",
      "type": "mcq",
      "question": "Which example best illustrates the 'Resource Pooling' characteristic of cloud computing?",
      "options": [
        "A company scales EC2 instances up during peak hours and down during off-hours",
        "Multiple customers' workloads run on shared physical servers with dynamic resource allocation",
        "Users access AWS services through web browsers, mobile apps, and APIs",
        "AWS charges customers based on actual resource consumption"
      ],
      "answer": 1,
      "explanation": "Resource Pooling means the provider's computing resources serve multiple consumers, with resources dynamically assigned and reassigned according to demand. This is best illustrated by multi-tenant infrastructure. Option 1 describes Rapid Elasticity, option 3 describes Broad Network Access, and option 4 describes Measured Service.",
      "hint": "Think about how resources are shared among multiple customers."
    },
    {
      "id": "aws-introduction-quiz-18",
      "type": "mcq",
      "question": "A company uses Amazon WorkMail for email. Under the SaaS model, what does the company primarily manage?",
      "options": [
        "Everything except physical infrastructure",
        "Limited configuration and customization only",
        "Applications and data",
        "Nothing — the provider manages the entire stack"
      ],
      "answer": 1,
      "explanation": "Amazon WorkMail is SaaS. In SaaS, the provider manages the entire technology stack, and customers only handle limited configuration and customization (mailbox settings, user accounts, policies). 'Applications and data' describes PaaS. 'Nothing — provider manages everything' is nearly correct but imprecise: customers do configure user accounts and settings, so it overstates AWS's role.",
      "hint": "WorkMail is SaaS — think about how much less control you have compared to running your own email server on EC2."
    },
    {
      "id": "aws-introduction-quiz-19",
      "type": "true-false",
      "question": "AWS Lambda is classified as Infrastructure as a Service (IaaS) because it provides virtual machines for running code.",
      "answer": false,
      "explanation": "False. AWS Lambda is classified as Platform as a Service (PaaS). It abstracts the infrastructure entirely, and developers only manage code (applications and data), not virtual machines or operating systems.",
      "hint": "Lambda is serverless—you don't manage any servers or VMs."
    },
    {
      "id": "aws-introduction-quiz-20",
      "type": "multiple-select",
      "question": "Which characteristics distinguish a Private Cloud deployment model?",
      "options": [
        "Resources owned and operated by third-party cloud service providers",
        "Cloud infrastructure used exclusively by a single organization",
        "Can be hosted on-premises or by a third party",
        "Delivered over the public internet",
        "Provides greater control and security"
      ],
      "answers": [1, 2, 4],
      "explanation": "Private Cloud is characterized by exclusive use by a single organization, can be hosted on-premises or by a third party, and provides greater control and security compared to public cloud.",
      "hint": "Focus on exclusivity, control, and security aspects."
    },
    {
      "id": "aws-introduction-quiz-21",
      "type": "fill-blank",
      "question": "The NIST cloud characteristic that enables access to cloud services via standard mechanisms across laptops, mobile phones, and APIs is called _____ Network Access.",
      "answer": "Broad",
      "acceptedAnswers": ["Broad", "broad"],
      "caseSensitive": false,
      "explanation": "Broad Network Access means cloud services are available over the network and accessed through standard mechanisms across heterogeneous devices — laptops, smartphones, tablets, and APIs. It is the most overlooked of the five NIST cloud characteristics (the others being On-Demand Self-Service, Resource Pooling, Rapid Elasticity, and Measured Service). The key distinction: it is not about internet-only access; it is about using standardized protocols and interfaces so any capable device or client can reach the service.",
      "hint": "This characteristic emphasizes access from any device type via standard network mechanisms."
    },
    {
      "id": "aws-introduction-quiz-22",
      "type": "true-false",
      "question": "A company that runs workloads on both AWS and Microsoft Azure, with no on-premises infrastructure, is operating a Hybrid Cloud deployment.",
      "answer": false,
      "explanation": "False. Using multiple public cloud providers with no on-premises infrastructure is Multi-Cloud, not Hybrid Cloud. Hybrid Cloud specifically requires combining a public cloud with a private cloud or on-premises infrastructure, with data and applications able to move between them. The defining element of Hybrid is the private/public integration — not simply 'more than one environment.' Calling this Hybrid Cloud is one of the most common exam misconceptions: learners see 'multiple clouds' and reach for 'hybrid,' missing that the private/on-premises component is what makes it hybrid.",
      "hint": "Think about what 'hybrid' means — mixing different types, not just multiple instances of the same type."
    },
    {
      "id": "aws-introduction-quiz-23",
      "type": "mcq",
      "question": "Under the AWS Shared Responsibility Model, a company migrates its MySQL database from Amazon EC2 to Amazon RDS. Which responsibility automatically shifts to AWS after the migration?",
      "options": [
        "Encrypting database data at rest",
        "Operating system and database engine patching",
        "Configuring database security group rules",
        "Managing database user credentials and access policies"
      ],
      "answer": 1,
      "explanation": "Operating system and database engine patching shifts to AWS when using Amazon RDS (a managed service). With EC2 (IaaS), the customer owns the guest OS — including all patching. RDS abstracts the underlying OS and database engine, making AWS responsible for those updates. The other three remain customer responsibilities in both cases: data encryption choices belong to the customer (Security IN the Cloud), security group rules are network configuration (customer's domain), and IAM/user access policies are always the customer's responsibility. The practical consequence of getting this wrong: teams that mentally carry over the EC2 responsibility model to RDS either waste effort on tasks AWS handles, or — worse — assume AWS handles security group rules and leave databases exposed.",
      "hint": "Think about which layer RDS actually abstracts away that EC2 does not."
    },
    {
      "id": "aws-introduction-quiz-24",
      "type": "mcq",
      "question": "An e-commerce site's auto-scaling group automatically adds 18 EC2 instances during a Black Friday traffic surge and removes them when traffic normalizes. Which NIST cloud characteristic primarily describes this behavior?",
      "options": [
        "Measured Service — AWS tracks and bills for the extra instances used during the surge",
        "On-Demand Self-Service — engineers provisioned the auto-scaling group without calling AWS",
        "Rapid Elasticity — capacity scales outward and inward to match demand",
        "Resource Pooling — AWS assigns shared physical hardware to serve this workload"
      ],
      "answer": 2,
      "explanation": "Rapid Elasticity is the NIST characteristic that enables capabilities to be elastically provisioned and released, rapidly scaling outward and inward with demand — exactly what auto-scaling demonstrates. Measured Service (option A) is about monitoring usage and billing accurately — it applies to the situation (the extra instances are billed), but it does not describe the *scaling behavior itself*. This is the most common confusion between these two characteristics: Elasticity is about capacity adjustment, Measured Service is about billing accuracy. On-Demand Self-Service (option B) applies more to the initial setup of auto-scaling without calling AWS support, not the dynamic scaling during the event. Resource Pooling (option D) describes the provider's infrastructure sharing model — it makes elasticity possible on the backend but does not describe the customer-visible scaling behavior.",
      "hint": "Measured Service is about the bill; Rapid Elasticity is about the scaling itself."
    },
    {
      "id": "aws-introduction-quiz-25",
      "type": "mcq",
      "question": "A company uses Amazon Chime for employee video conferencing and AWS Lambda for a serverless customer-facing API. Which statement correctly compares the management responsibilities of both teams?",
      "options": [
        "Both use SaaS — neither team manages application code",
        "The Chime team manages application code; the Lambda team manages the runtime and OS",
        "The Lambda team manages only function code; the Chime team manages only limited configuration",
        "Both use PaaS — both teams must manage the underlying operating system"
      ],
      "answer": 2,
      "explanation": "Amazon Chime is SaaS — AWS manages the entire stack, leaving the customer with limited configuration (user accounts, meeting policies, settings). AWS Lambda is PaaS — the developer provides function code (application and data layer), while AWS handles the runtime, OS, containers, and scaling. Option A is wrong because Lambda is PaaS, not SaaS — the Lambda team does manage the function code. Option B reverses the model: Lambda abstracts the runtime and OS from the developer; the Chime team does not manage application code at all. Option D is wrong because SaaS users never manage the OS, and Lambda (PaaS) also shields the developer from the OS. The distinction that matters: in SaaS you configure; in PaaS you code; in IaaS you also manage the OS.",
      "hint": "SaaS gives you configuration knobs; PaaS gives you a code deployment surface."
    },
    {
      "id": "aws-introduction-quiz-26",
      "type": "mcq",
      "question": "A global retailer keeps its core ERP system on-premises due to data sovereignty laws, runs its customer-facing e-commerce platform on AWS, and uses Azure Cognitive Services for AI-powered search. Which deployment model correctly classifies this architecture?",
      "options": [
        "Multi-Cloud, because the company uses both AWS and Azure",
        "Hybrid Cloud, because it combines on-premises infrastructure with public cloud services",
        "Private Cloud, because the core ERP system is on-premises",
        "Neither — this architecture spans all three models simultaneously"
      ],
      "answer": 1,
      "explanation": "This is Hybrid Cloud. The defining characteristic of Hybrid Cloud is the combination of on-premises (or private cloud) infrastructure with public cloud services, with data and applications able to move between environments. The presence of both on-premises ERP and AWS/Azure public cloud services fits this definition. The common trap here is option A — seeing AWS and Azure together and immediately labeling it Multi-Cloud. Multi-Cloud applies when a company uses only multiple public cloud providers with no on-premises component. Because this company has on-premises infrastructure that is integrated with public cloud services, Hybrid Cloud is the correct classification. Option C (Private Cloud) would require no public cloud involvement at all. The data sovereignty driver is also a reminder that Global Reach's data residency capability is a key Hybrid Cloud use case.",
      "hint": "The on-premises component is the deciding factor — check for that before reaching for Multi-Cloud."
    }
  ]
}
{{< /quiz >}}
