---
title: Introduction Quiz
linkTitle: Introduction to k8s
type: docs
weight: 1
prev: /quiz/kubernetes
next: /quiz/kubernetes/02-cluster-architecture
---

{{< quiz id="kubernetes-introduction-quiz" >}}
{
  "questions": [
    {
      "type": "mcq",
      "question": "What is Kubernetes primarily used for?",
      "options": [
        "Container orchestration",
        "Database management",
        "Web hosting",
        "File storage"
      ],
      "answer": 0,
      "explanation": "Kubernetes is an open-source container orchestration platform that automates the deployment, scaling, networking, and management of containerized applications at scale.",
      "hint": "Think about what Kubernetes manages and automates."
    },
    {
      "type": "true-false",
      "question": "Kubernetes uses an imperative approach where you specify HOW to achieve your goals rather than WHAT you want.",
      "answer": false,
      "explanation": "Kubernetes uses a **declarative** approach where you describe WHAT you want (desired state), not HOW to achieve it. Kubernetes continuously works to match actual state to desired state.",
      "hint": "Think about whether you tell Kubernetes the steps to follow or the end result you want."
    },
    {
      "type": "fill-blank",
      "question": "The smallest deployable unit in Kubernetes is called a _____.",
      "answer": "pod",
      "caseSensitive": false,
      "explanation": "A **pod** is the smallest deployable unit in Kubernetes. It can contain one or more containers that share storage and network resources.",
      "hint": "It's a three-letter word that can also mean a group of whales or dolphins."
    },
    {
      "type": "multiple-select",
      "question": "Which of the following are key characteristics of Kubernetes? (Select all that apply)",
      "options": [
        "Container orchestration platform",
        "Declarative configuration",
        "Automation at scale",
        "Self-healing capabilities",
        "Built-in database management"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "Kubernetes provides container orchestration, declarative configuration, automation at scale, and self-healing capabilities. It does NOT provide built-in database management - databases run as containerized applications on Kubernetes.",
      "hint": "Four of these are explicitly mentioned as key characteristics in the introduction."
    },
    {
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
      "type": "flashcard",
      "question": "What is the reconciliation loop in Kubernetes and why is it important?",
      "answer": "**The Reconciliation Loop** is Kubernetes' core control mechanism that continuously compares the desired state (what you want) with the actual state (current reality) and takes corrective action when they differ.\n\n**Why it's important:**\n\n- Enables self-healing: automatically recovers from failures\n- Maintains desired state: if a pod crashes, Kubernetes restarts it\n- Runs continuously: checks every ~30 seconds\n- Reduces manual intervention: no need to manually fix issues"
    },
    {
      "type": "mcq",
      "question": "In the reconciliation loop, if you declare 3 replicas but only 2 are running, what does Kubernetes do?",
      "options": [
        "Alerts you to fix it manually",
        "Automatically creates a new pod",
        "Deletes one pod to match",
        "Restarts the entire cluster"
      ],
      "answer": 1,
      "explanation": "Kubernetes automatically creates a new pod to match the desired state of 3 replicas. This is the self-healing capability - Kubernetes continuously works to maintain your declared desired state.",
      "hint": "Remember that Kubernetes uses a declarative model with self-healing."
    },
    {
      "type": "true-false",
      "question": "In Kubernetes, the desired state is specified in the 'status' field and actual state is in the 'spec' field.",
      "answer": false,
      "explanation": "This is reversed! The desired state is specified in the **'spec'** (specification) field, and the actual state is reported in the **'status'** field. Controllers compare these to reconcile differences.",
      "hint": "Think about 'spec' as specification (what you specify/want) and 'status' as the current status."
    },
    {
      "type": "multiple-select",
      "question": "Which problems did organizations face before Kubernetes that it helps solve? (Select all that apply)",
      "options": [
        "Manual deployment orchestration",
        "Resource inefficiency",
        "Scaling complexity",
        "Poor fault tolerance",
        "Lack of programming languages"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "Kubernetes solves: manual deployment orchestration (no more SSHing into servers), resource inefficiency (better utilization through bin-packing), scaling complexity (easy horizontal scaling), and poor fault tolerance (self-healing). It does NOT solve programming language availability!",
      "hint": "Four of these are infrastructure and operations challenges that Kubernetes addresses."
    },
    {
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
      "type": "true-false",
      "question": "Kubernetes eliminates the need for different configurations across dev, staging, and production environments.",
      "answer": false,
      "explanation": "**False!** Kubernetes does NOT eliminate configuration differences across environments. Different configs (like database URLs, resource limits) are still necessary and expected. Kubernetes makes these differences **explicit and manageable** through ConfigMaps and Secrets.",
      "hint": "Think about whether dev and prod should use the same database URL and resource limits."
    },
    {
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
      "type": "fill-blank",
      "question": "Kubernetes makes environment-specific configurations explicit through _____ and Secrets.",
      "answer": "ConfigMaps",
      "caseSensitive": false,
      "explanation": "**ConfigMaps** and Secrets are Kubernetes primitives for managing configuration. ConfigMaps store non-sensitive configuration data, while Secrets store sensitive data like passwords and API keys.",
      "hint": "It's a Kubernetes resource that starts with 'Config'."
    },
    {
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
      "type": "flashcard",
      "question": "Explain the difference between 'declarative' and 'imperative' approaches in infrastructure management.",
      "answer": "**Imperative Approach:**\n\n- You specify HOW to achieve something\n- Step-by-step commands: 'Start 3 servers', 'Update to version 2.0'\n- Like giving directions: 'Turn left, go 2 blocks, turn right'\n\n**Declarative Approach (Kubernetes):**\n\n- You specify WHAT you want\n- Desired state: 'I want 3 replicas running', 'Desired version: 2.0'\n- Like giving a destination: 'Take me to the airport'\n- System figures out HOW to get there\n\n**Benefits of Declarative:**\n\n- Self-healing: system maintains desired state\n- Reproducible: same manifest = same result\n- Version controlled: infrastructure as code"
    },
    {
      "type": "true-false",
      "question": "Kubernetes provides portability, allowing you to run the same workloads on AWS, GCP, Azure, or on-premises infrastructure.",
      "answer": true,
      "explanation": "**True!** One of Kubernetes' key benefits is portability. The same manifests work across any infrastructure - public cloud (AWS, GCP, Azure), private cloud, or on-premises. This avoids vendor lock-in.",
      "hint": "This is one of the key benefits mentioned in the 'Kubernetes vs Other Solutions' section."
    },
    {
      "type": "mcq",
      "question": "What happens during a rolling update if a new version fails health checks?",
      "options": [
        "All pods immediately switch to new version",
        "Kubernetes automatically rolls back",
        "Rollout pauses, manual rollback needed",
        "Cluster shuts down"
      ],
      "answer": 2,
      "explanation": "When new pods fail health checks during a rolling update, Kubernetes **pauses the rollout** and stops replacing old pods. The old version continues running. Automatic rollback does NOT happen - you must manually run `kubectl rollout undo` to roll back to the previous version.",
      "hint": "Kubernetes prevents bad deployments from progressing, but doesn't automatically revert them."
    },
    {
      "type": "multiple-select",
      "question": "Which of the following are key benefits of Kubernetes? (Select all that apply)",
      "options": [
        "High availability through multi-zone deployments",
        "Resource optimization via bin-packing",
        "Operational efficiency with reduced manual work",
        "Portability across different infrastructures",
        "Built-in database replication"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "Kubernetes provides **high availability** (multi-zone deployments with failover), **resource optimization** (efficient bin-packing and QoS), **operational efficiency** (automation and standardization), and **portability** (runs on any infrastructure). It does NOT provide built-in database replication - databases are deployed as applications.",
      "hint": "Four of these are core benefits mentioned in the introduction."
    },
    {
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
      "type": "fill-blank",
      "question": "A set of machines running Kubernetes is called a _____.",
      "answer": "cluster",
      "caseSensitive": false,
      "explanation": "A **cluster** is a set of machines (nodes) running Kubernetes. It consists of at least one control plane and one or more worker nodes that run application workloads.",
      "hint": "It's a term used to describe a group of connected computers working together."
    },
    {
      "type": "true-false",
      "question": "A 'namespace' in Kubernetes provides physical isolation by running on separate hardware.",
      "answer": false,
      "explanation": "**False!** Namespaces provide **virtual** (logical) isolation, not physical isolation. Multiple namespaces can run on the same physical hardware. They're used to organize resources and apply policies, but don't provide hardware-level separation.",
      "hint": "Think about whether namespaces are about organizing resources or separating hardware."
    },
    {
      "type": "mcq",
      "question": "Compared to traditional VMs, containers managed by Kubernetes offer:",
      "options": [
        "Stronger isolation but slower startup",
        "Faster startup and better resource efficiency",
        "Identical resource usage",
        "Always better in every scenario"
      ],
      "answer": 1,
      "explanation": "Containers offer **faster startup and better resource efficiency** compared to VMs. However, VMs provide **stronger isolation**. There are trade-offs - neither is 'always better'. Kubernetes with containers excels at resource efficiency and speed.",
      "hint": "Think about the trade-offs mentioned in 'Kubernetes vs Traditional VMs'."
    },
    {
      "type": "code-completion",
      "question": "Complete this statement about Kubernetes' promise:",
      "instruction": "Fill in the missing core promise",
      "codeTemplate": "Kubernetes promises to abstract infrastructure, provide _____, enable scalability, and ensure availability.",
      "answer": "self-healing",
      "caseSensitive": false,
      "acceptedAnswers": ["self-healing", "self healing"],
      "explanation": "The four core promises of Kubernetes are: 1) Abstract infrastructure, 2) Provide **self-healing**, 3) Enable scalability, 4) Ensure availability. Self-healing means automatic recovery from failures without manual intervention."
    }
  ]
}
{{< /quiz >}}
