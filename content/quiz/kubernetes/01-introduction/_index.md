---
title: Introduction to K8s Quiz
linkTitle: Introduction to K8s
type: docs
weight: 1
prev: /quiz/kubernetes
next: /quiz/kubernetes/02-cluster-architecture
---

{{< quiz id="kubernetes-introduction-quiz" >}}
{
  "questions": [
    {
      "id": "kubernetes-introduction-quiz-01",
      "type": "flashcard",
      "question": "What is Kubernetes and what core problems does it solve?",
      "answer": "**Kubernetes** is an open-source container orchestration platform that automates the deployment, scaling, networking, and management of containerized applications.\n\n**Core problems it solves:**\n\n- Manual deployment orchestration: replaces SSHing into individual servers\n- Resource inefficiency: intelligent bin-packing maximizes utilization\n- Scaling complexity: horizontal scaling with a single command\n- Poor fault tolerance: self-healing detects and replaces failures automatically"
    },
    {
      "id": "kubernetes-introduction-quiz-02",
      "type": "true-false",
      "question": "Kubernetes uses an imperative approach where you specify HOW to achieve your goals rather than WHAT you want.",
      "answer": false,
      "explanation": "Kubernetes uses a **declarative** approach where you describe WHAT you want (desired state), not HOW to achieve it. Kubernetes continuously works to match actual state to desired state.",
      "hint": "Think about whether you tell Kubernetes the steps to follow or the end result you want."
    },
    {
      "id": "kubernetes-introduction-quiz-03",
      "type": "fill-blank",
      "question": "The smallest deployable unit in Kubernetes is called a _____.",
      "answer": "pod",
      "caseSensitive": false,
      "explanation": "A **pod** is the smallest deployable unit in Kubernetes. It can contain one or more containers that share storage and network resources.",
      "hint": "It's a three-letter word that can also mean a group of whales or dolphins."
    },
    {
      "id": "kubernetes-introduction-quiz-04",
      "type": "multiple-select",
      "question": "Which of the following are key characteristics of Kubernetes? (Select all that apply)",
      "options": [
        "Container orchestration platform",
        "Declarative configuration",
        "Automation at scale",
        "Self-healing capabilities",
        "Built-in database management",
        "Native CI/CD pipeline"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "Kubernetes provides container orchestration, declarative configuration, automation at scale, and self-healing capabilities. It does NOT provide built-in database management or a native CI/CD pipeline — these are separate concerns. Databases run as containerized applications, and CI/CD requires external tools like Jenkins, Argo CD, or GitHub Actions.",
      "hint": "Four of these are explicitly mentioned as key characteristics in the introduction."
    },
    {
      "id": "kubernetes-introduction-quiz-05",
      "type": "drag-drop",
      "question": "Arrange the steps in the Kubernetes reconciliation loop in the correct order:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Observe actual state (status)",
        "Define desired state (spec)",
        "Compare desired vs actual state",
        "Take action if different"
      ],
      "correctOrder": [1, 0, 2, 3],
      "explanation": "The reconciliation loop: 1) You define desired state in spec, 2) Kubernetes observes actual state, 3) Compares them, 4) Takes action if they differ. This runs continuously (~every 30 seconds)."
    },
    {
      "id": "kubernetes-introduction-quiz-06",
      "type": "flashcard",
      "question": "What is the reconciliation loop in Kubernetes and why is it important?",
      "answer": "**The Reconciliation Loop** is Kubernetes' core control mechanism where controllers continuously compare the desired state (what you want) with the actual state (current reality) and take corrective actions to reconcile any differences.\n\nControllers watch the cluster state via the API server, detect any drift, and take corrective actions to reconcile the difference.\n\n**Why it's important:**\n\n- Enables self-healing: automatically recovers from failures\n- Maintains desired state: ensures declared configuration is always enforced\n- Runs continuously: checks every ~30 seconds\n- Reduces manual intervention: system corrects itself automatically"
    },
    {
      "id": "kubernetes-introduction-quiz-07",
      "type": "mcq",
      "question": "In the reconciliation loop, if you declare 3 replicas but only 2 are running, what does Kubernetes do?",
      "options": [
        "Alerts you to fix it manually",
        "Automatically creates a new pod",
        "Deletes one pod to match",
        "Scales down to 2 replicas to match the actual running count"
      ],
      "answer": 1,
      "explanation": "Kubernetes automatically creates a new pod to match the desired state of 3 replicas. This is the self-healing capability — Kubernetes reconciles toward the **desired** state (spec), not the actual state. Option D is a common mistake: Kubernetes never adjusts desired state down to match a failure; it always works to restore the desired state.",
      "hint": "Remember that Kubernetes uses a declarative model with self-healing."
    },
    {
      "id": "kubernetes-introduction-quiz-08",
      "type": "true-false",
      "question": "In Kubernetes, the desired state is specified in the 'status' field and actual state is in the 'spec' field.",
      "answer": false,
      "explanation": "This is reversed! The desired state is specified in the **'spec'** (specification) field, and the actual state is reported in the **'status'** field. Controllers compare these to reconcile differences.",
      "hint": "Think about 'spec' as specification (what you specify/want) and 'status' as the current status."
    },
    {
      "id": "kubernetes-introduction-quiz-09",
      "type": "multiple-select",
      "question": "Which problems did organizations face before Kubernetes that it helps solve? (Select all that apply)",
      "options": [
        "Manual deployment orchestration",
        "Resource inefficiency",
        "Scaling complexity",
        "Poor fault tolerance",
        "Lack of programming languages",
        "Security vulnerability management in containers"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "Kubernetes solves: manual deployment orchestration (no more SSHing into servers), resource inefficiency (better utilization through bin-packing), scaling complexity (easy horizontal scaling), and poor fault tolerance (self-healing). It does NOT solve programming language availability or automatically patch security vulnerabilities in container images — those require separate tooling.",
      "hint": "Four of these are infrastructure and operations challenges that Kubernetes addresses."
    },
    {
      "id": "kubernetes-introduction-quiz-10",
      "type": "code-completion",
      "question": "Complete the kubectl command to deploy an application:",
      "instruction": "Fill in the missing kubectl subcommand",
      "codeTemplate": "kubectl _____ -f deployment.yaml",
      "answer": "apply",
      "caseSensitive": false,
      "acceptedAnswers": ["apply"],
      "explanation": "The `kubectl apply` command is used to deploy or update resources declaratively. It applies the configuration from the YAML file to your cluster. This is the preferred declarative approach in Kubernetes."
    },
    {
      "id": "kubernetes-introduction-quiz-11",
      "type": "mcq",
      "question": "What is 'bin-packing' in the context of Kubernetes resource optimization?",
      "options": [
        "Compressing container images",
        "Efficiently scheduling pods onto nodes to maximize resource utilization",
        "Backing up data in binary format",
        "Grouping similar applications together"
      ],
      "answer": 1,
      "explanation": "**Bin-packing** means efficiently scheduling pods onto nodes to maximize resource utilization while avoiding overloading any node - like fitting items neatly into boxes. Kubernetes intelligently places workloads based on resource requirements.",
      "hint": "Think about how you pack items into boxes to use space efficiently."
    },
    {
      "id": "kubernetes-introduction-quiz-12",
      "type": "true-false",
      "question": "Kubernetes eliminates the need for different configurations across dev, staging, and production environments.",
      "answer": false,
      "explanation": "**False!** Kubernetes does NOT eliminate configuration differences across environments. Different configs (like database URLs, resource limits) are still necessary and expected. Kubernetes makes these differences **explicit and manageable** through ConfigMaps and Secrets.",
      "hint": "Think about whether dev and prod should use the same database URL and resource limits."
    },
    {
      "id": "kubernetes-introduction-quiz-13",
      "type": "code-output",
      "question": "Given these two ConfigMaps, what will the LOG_LEVEL environment variable be in the production namespace?",
      "code": "# dev/configmap.yaml\napiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: app-config\n  namespace: dev\ndata:\n  LOG_LEVEL: \"debug\"\n\n# prod/configmap.yaml\napiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: app-config\n  namespace: prod\ndata:\n  LOG_LEVEL: \"info\"",
      "language": "yaml",
      "options": [
        "\"debug\"",
        "\"info\"",
        "\"warning\"",
        "Both values (conflict error)"
      ],
      "answer": 1,
      "explanation": "In the **prod namespace**, the ConfigMap sets LOG_LEVEL to **\"info\"**. Each namespace has its own ConfigMap with the same name but different values. The app in prod will use the prod ConfigMap, getting \"info\" as the log level.",
      "hint": "Look at which namespace you're asking about and what value that namespace's ConfigMap defines."
    },
    {
      "id": "kubernetes-introduction-quiz-14",
      "type": "fill-blank",
      "question": "Kubernetes makes environment-specific configurations explicit through _____ and Secrets.",
      "answer": "ConfigMaps",
      "caseSensitive": false,
      "explanation": "**ConfigMaps** and Secrets are Kubernetes primitives for managing configuration. ConfigMaps store non-sensitive configuration data, while Secrets store sensitive data like passwords and API keys.",
      "hint": "It's a Kubernetes resource that starts with 'Config'."
    },
    {
      "id": "kubernetes-introduction-quiz-15",
      "type": "mcq",
      "question": "Which deployment scenario is Kubernetes BEST suited for?",
      "options": [
        "Small monolithic app with 100 users",
        "Microservices architecture with high availability needs",
        "Simple WordPress blog",
        "Single-page static website"
      ],
      "answer": 1,
      "explanation": "Kubernetes excels at managing **microservices with high availability needs**. It's designed for cloud-native applications requiring scaling, self-healing, and complex orchestration. For simple apps (WordPress, static sites), Kubernetes is often overkill.",
      "hint": "Think about which scenario requires the most orchestration, scaling, and automation."
    },
    {
      "id": "kubernetes-introduction-quiz-16",
      "type": "multiple-select",
      "question": "What does Kubernetes actually solve? (Select all correct statements)",
      "options": [
        "Automated deployment orchestration",
        "Different configs across environments",
        "Process consistency across environments",
        "Infrastructure abstraction",
        "Zero manual intervention ever"
      ],
      "answers": [0, 2, 3],
      "explanation": "Kubernetes solves: automated deployment orchestration (no manual SSHing), process consistency (same deployment mechanism everywhere), and infrastructure abstraction (portable across clouds). It does NOT eliminate config differences or achieve zero manual intervention.",
      "hint": "Three of these are what Kubernetes DOES solve according to the content."
    },
    {
      "id": "kubernetes-introduction-quiz-17",
      "type": "flashcard",
      "question": "Explain the difference between 'declarative' and 'imperative' approaches in infrastructure management.",
      "answer": "**Imperative:** You specify HOW — step-by-step commands ('Start 3 servers', 'Update to version 2.0'). Like giving turn-by-turn directions.\n\n**Declarative (Kubernetes):** You specify WHAT — desired state ('I want 3 replicas running'). Like giving a destination; the system figures out how to get there.\n\n**Why declarative wins:**\n\n- Self-healing: system continuously maintains desired state\n- Reproducible: same manifest always produces the same result\n- Version controlled: infrastructure defined as code"
    },
    {
      "id": "kubernetes-introduction-quiz-18",
      "type": "true-false",
      "question": "Kubernetes is only for public cloud deployments (AWS, GCP, Azure) and cannot run on on-premises infrastructure.",
      "answer": false,
      "explanation": "**False!** One of Kubernetes' key benefits is portability — the same manifests work on any infrastructure: public cloud (AWS, GCP, Azure), private cloud, or on-premises bare metal. This avoids vendor lock-in. The confusion arises because major K8s use cases are cloud-focused, but the platform itself is infrastructure-agnostic.",
      "hint": "Think about whether Kubernetes is tied to any particular cloud provider."
    },
    {
      "id": "kubernetes-introduction-quiz-19",
      "type": "mcq",
      "question": "What happens during a rolling update if a new version fails health checks?",
      "options": [
        "All pods immediately switch to new version",
        "Kubernetes automatically rolls back",
        "Rollout pauses, manual rollback needed",
        "Kubernetes terminates the failed pods and waits for them to pass health checks before continuing"
      ],
      "answer": 2,
      "explanation": "When new pods fail health checks during a rolling update, Kubernetes **pauses the rollout** and stops replacing old pods. The old version continues running. Automatic rollback does NOT happen — you must manually run `kubectl rollout undo` to revert. Option B is the most common misconception: K8s is self-healing for crashes but does not automatically roll back a deployment that fails health checks.",
      "hint": "Kubernetes prevents bad deployments from progressing, but doesn't automatically revert them."
    },
    {
      "id": "kubernetes-introduction-quiz-20",
      "type": "multiple-select",
      "question": "Which of the following are key benefits of Kubernetes? (Select all that apply)",
      "options": [
        "High availability through multi-zone deployments",
        "Resource optimization via bin-packing",
        "Operational efficiency with reduced manual work",
        "Portability across different infrastructures",
        "Built-in database replication",
        "Automated security patching of container images"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "Kubernetes provides **high availability** (multi-zone deployments with failover), **resource optimization** (efficient bin-packing and QoS), **operational efficiency** (automation and standardization), and **portability** (runs on any infrastructure). It does NOT provide built-in database replication or automated security patching — databases are deployed as applications and image security requires separate tooling (e.g., Trivy, Snyk).",
      "hint": "Four of these are core benefits mentioned in the introduction."
    },
    {
      "id": "kubernetes-introduction-quiz-21",
      "type": "multiple-select",
      "question": "Which of these are valid local Kubernetes development options? (Select all that apply)",
      "options": [
        "minikube",
        "kind",
        "k3s",
        "kubedocker",
        "kubelocal"
      ],
      "answers": [0, 1, 2],
      "explanation": "**Valid options:** minikube (single-node cluster), kind (Kubernetes in Docker), k3s (lightweight Kubernetes). **Invalid:** 'kubedocker' and 'kubelocal' are not real Kubernetes tools.",
      "hint": "Three of these are real tools mentioned in the 'Getting Started Paths' section."
    },
    {
      "id": "kubernetes-introduction-quiz-22",
      "type": "fill-blank",
      "question": "A set of machines running Kubernetes is called a _____.",
      "answer": "cluster",
      "caseSensitive": false,
      "explanation": "A **cluster** is a set of machines (nodes) running Kubernetes. It consists of at least one control plane and one or more worker nodes that run application workloads.",
      "hint": "It's a term used to describe a group of connected computers working together."
    },
    {
      "id": "kubernetes-introduction-quiz-23",
      "type": "true-false",
      "question": "A 'namespace' in Kubernetes provides physical isolation by running on separate hardware.",
      "answer": false,
      "explanation": "**False!** Namespaces provide **virtual** (logical) isolation, not physical isolation. Multiple namespaces can run on the same physical hardware. They're used to organize resources and apply policies, but don't provide hardware-level separation.",
      "hint": "Think about whether namespaces are about organizing resources or separating hardware."
    },
    {
      "id": "kubernetes-introduction-quiz-24",
      "type": "mcq",
      "question": "Compared to traditional VMs, containers managed by Kubernetes offer:",
      "options": [
        "Stronger isolation but slower startup",
        "Faster startup and better resource efficiency",
        "Faster startup and equivalent security isolation to VMs",
        "Always better in every scenario"
      ],
      "answer": 1,
      "explanation": "Containers offer **faster startup and better resource efficiency** compared to VMs. However, VMs provide **stronger isolation** (hardware-level vs. OS-level). Option C is a common misconception: containers do start faster and use fewer resources, but their OS-level isolation is weaker than VM hypervisor isolation. Neither technology is 'always better' — the right choice depends on isolation vs. efficiency requirements.",
      "hint": "Think about the trade-offs mentioned in 'Kubernetes vs Traditional VMs'."
    },
    {
      "id": "kubernetes-introduction-quiz-25",
      "type": "fill-blank",
      "question": "Kubernetes promises to abstract infrastructure, provide _____, enable scalability, and ensure availability.",
      "answer": "self-healing",
      "caseSensitive": false,
      "explanation": "The four core promises of Kubernetes are: 1) Abstract infrastructure, 2) Provide **self-healing** (automatic recovery from failures), 3) Enable scalability, 4) Ensure availability. Self-healing means Kubernetes continuously reconciles actual state to desired state — no manual intervention needed when pods crash or nodes fail."
    },
    {
      "id": "kubernetes-introduction-quiz-26",
      "type": "fill-blank",
      "question": "A physical or virtual machine in a Kubernetes cluster is called a _____.",
      "answer": "node",
      "caseSensitive": false,
      "explanation": "A **node** is a physical or virtual machine that makes up a Kubernetes cluster. There are two types: **control plane nodes** (which manage the cluster) and **worker nodes** (which run application workloads as pods).",
      "hint": "It's a term used in many distributed systems to refer to a single machine in a group."
    },
    {
      "id": "kubernetes-introduction-quiz-27",
      "type": "mcq",
      "question": "What is the primary trade-off when choosing Docker Swarm over Kubernetes?",
      "options": [
        "Simpler to set up and operate, but less powerful than Kubernetes",
        "More powerful and flexible, but with the same operational complexity",
        "Purpose-built for stateless microservices and unsuitable for stateful apps",
        "Better integration with Docker containers since it uses the same CLI"
      ],
      "answer": 0,
      "explanation": "Docker Swarm is **simpler to set up and operate** — appealing for smaller or less complex deployments — but it is significantly less powerful than Kubernetes. Kubernetes is the industry standard, offering richer features (auto-scaling, advanced scheduling, rich ecosystem) at the cost of a steeper learning curve. Option D is a common misconception: both tools work with Docker containers, and Kubernetes uses its own CLI (`kubectl`), not Docker's.",
      "hint": "Think about what you give up and what you gain when choosing simplicity over features."
    },
    {
      "id": "kubernetes-introduction-quiz-28",
      "type": "mcq",
      "question": "How does Kubernetes provide stable network endpoints for services when individual pods are constantly being created and destroyed?",
      "options": [
        "By assigning static IP addresses to each pod that persist across restarts",
        "Through built-in DNS-based service discovery that abstracts individual pod IPs",
        "By requiring an external load balancer to be configured for each service",
        "Through direct container-to-container IP communication within the cluster"
      ],
      "answer": 1,
      "explanation": "Kubernetes provides **built-in DNS-based service discovery**: a Service resource gets a stable DNS name and virtual IP that never changes, even as the underlying pods come and go. Option A is the most common misconception — pods do NOT have stable IPs; they receive dynamic IPs on creation, which is exactly the problem the Service abstraction solves. Option C is wrong because Kubernetes handles load balancing natively without external configuration for basic use cases.",
      "hint": "Think about what abstraction layer Kubernetes places between clients and individual pods."
    },
    {
      "id": "kubernetes-introduction-quiz-29",
      "type": "mcq",
      "question": "A small startup wants to deploy a web application and focus entirely on development with minimal infrastructure management. They don't need fine-grained control over container scheduling. Which deployment approach is MOST appropriate?",
      "options": [
        "Self-hosted Kubernetes using kubeadm on bare metal",
        "Managed Kubernetes (AWS EKS or Google GKE)",
        "Platform-as-a-Service such as Heroku",
        "Docker Swarm on a dedicated VM"
      ],
      "answer": 2,
      "explanation": "When the priority is **minimal operational overhead** with no need for fine-grained infrastructure control, Platform-as-a-Service like Heroku is the best fit — it abstracts away all infrastructure entirely. Managed Kubernetes (option B) reduces cluster management burden but still requires understanding Kubernetes concepts like pods, services, and deployments. Self-hosted Kubernetes (option A) has the highest operational cost. This illustrates the core K8s trade-off: PaaS offers simplicity, Kubernetes offers control.",
      "hint": "Consider which option abstracts away the most infrastructure so the team can focus purely on code."
    },
    {
      "id": "kubernetes-introduction-quiz-30",
      "type": "true-false",
      "question": "Configuration drift (servers diverging from their intended state over time) and having different configurations across environments (dev vs prod) are the same problem, and Kubernetes solves both.",
      "answer": false,
      "explanation": "**False — these are two distinct problems.** Configuration drift is **unintentional**: servers within an environment accumulate ad-hoc manual changes over time, causing them to diverge from the declared desired state. Kubernetes prevents this by continuously reconciling actual state to the desired spec. Different configs across environments are **intentional and expected** (dev uses a test database, prod uses a production database with more resources) — Kubernetes doesn't eliminate these differences, it makes them *explicit and manageable* via ConfigMaps and Secrets. Conflating the two leads to incorrect expectations: Kubernetes solves drift, not the need for environment-specific configuration.",
      "hint": "Think about whether the difference between dev and prod configs is a mistake or a deliberate design choice."
    },
    {
      "id": "kubernetes-introduction-quiz-31",
      "type": "mcq",
      "question": "A worker node in your Kubernetes cluster suddenly fails due to a hardware issue. What happens to the pods that were running on that node?",
      "options": [
        "The pods are permanently lost and must be manually redeployed",
        "Kubernetes automatically reschedules the pods onto healthy nodes",
        "The pods remain in a Failed state until the node is repaired and rejoins the cluster",
        "The pods are migrated live to another node with zero interruption to running processes"
      ],
      "answer": 1,
      "explanation": "Kubernetes **automatically reschedules** the affected pods onto healthy nodes — this is self-healing applied at the node level. The scheduler detects that the node is unavailable (via heartbeat timeout), marks its pods for rescheduling, and creates new pod instances elsewhere. Option A describes the pre-Kubernetes world of manual recovery. Option C is a common misconception — pods do NOT wait for the original node to return; Kubernetes always reconciles toward desired state on available infrastructure. Option D is the most tempting wrong answer: rescheduling *appears* seamless from the service perspective (via the Service abstraction), but pods are terminated and *recreated*, not live-migrated like VMs.",
      "hint": "Remember that Kubernetes reconciles desired state continuously — even when nodes fail."
    },
    {
      "id": "kubernetes-introduction-quiz-32",
      "type": "mcq",
      "question": "What is the difference between horizontal scaling and cluster autoscaling in Kubernetes?",
      "options": [
        "They are the same: both increase the number of pods to handle more traffic",
        "Horizontal scaling adds or removes pods; cluster autoscaling adds or removes nodes",
        "Horizontal scaling adds or removes nodes; cluster autoscaling adds or removes pods",
        "Cluster autoscaling only works on public cloud providers, while horizontal scaling works anywhere"
      ],
      "answer": 1,
      "explanation": "These operate at two distinct levels: **horizontal scaling** adds or removes *pods* based on metrics like CPU or memory. **Cluster autoscaling** adds or removes *nodes* to ensure the cluster has enough capacity to schedule those pods. They work together: when HPA requests more pods and no node has sufficient capacity, the cluster autoscaler provisions new nodes. Option C is the classic reversal error. Option D is a common assumption — while cluster autoscalers integrate with cloud provider APIs, the *concept* of separating pod scaling and node scaling applies in any environment.",
      "hint": "One level of scaling operates on application instances; the other operates on the machines running them."
    }
  ]
}
{{< /quiz >}}
