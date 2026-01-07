---
title: Autoscaling Quiz
linkTitle: Autoscaling
type: docs
weight: 14
prev: /quiz/kubernetes/13-security
next: /quiz/kubernetes/15-observability
---

{{< quiz id="kubernetes-autoscaling-quiz" >}}
{
  "questions": [
    {
      "id": "kubernetes-autoscaling-quiz-01",
      "type": "mcq",
      "question": "What is the default interval at which the HPA controller queries the Metrics API?",
      "options": [
        "5 seconds",
        "15 seconds",
        "30 seconds",
        "60 seconds"
      ],
      "answer": 1,
      "explanation": "The HPA controller queries the Metrics API every 15 seconds by default to calculate desired replica counts.",
      "hint": "This is different from the Metrics Server scrape interval."
    },
    {
      "id": "kubernetes-autoscaling-quiz-02",
      "type": "multiple-select",
      "question": "Which of the following are required for HPA to function properly?",
      "options": [
        "Metrics Server installed",
        "Resource requests defined on pods",
        "VPA configured",
        "At least one replica running"
      ],
      "answers": [0, 1, 3],
      "explanation": "HPA requires Metrics Server for metrics, resource requests to calculate utilization percentages, and at least one replica to scale. VPA is a separate autoscaler and not required for HPA.",
      "hint": "Think about what HPA needs to calculate utilization and make scaling decisions."
    },
    {
      "id": "kubernetes-autoscaling-quiz-03",
      "type": "true-false",
      "question": "Karpenter provisions nodes faster than Cluster Autoscaler because it provisions directly through cloud provider APIs rather than scaling node groups.",
      "answer": true,
      "explanation": "Karpenter typically provisions nodes in 30-90 seconds by calling cloud APIs directly, while Cluster Autoscaler takes 2-5 minutes because it works through ASG/node group scaling.",
      "hint": "Consider the architectural difference between direct API calls and group-based scaling."
    },
    {
      "id": "kubernetes-autoscaling-quiz-04",
      "type": "code-output",
      "question": "Using the HPA formula, calculate the desired replicas:",
      "code": "currentReplicas = 3\ncurrentCPU = 90%\ntargetCPU = 50%\n\ndesiredReplicas = ceil[currentReplicas * (currentCPU / targetCPU)]",
      "language": "text",
      "options": [
        "5",
        "6",
        "4",
        "3"
      ],
      "answer": 1,
      "explanation": "desiredReplicas = ceil[3 * (90/50)] = ceil[3 * 1.8] = ceil[5.4] = 6 pods",
      "hint": "Remember to use ceiling function on the final result."
    },
    {
      "id": "kubernetes-autoscaling-quiz-05",
      "type": "mcq",
      "question": "Which VPA update mode should be used for databases where automatic restarts are risky?",
      "options": [
        "Auto",
        "Recreate",
        "Initial",
        "Off"
      ],
      "answer": 3,
      "explanation": "The 'Off' mode only provides recommendations without automatic updates, making it safe for stateful workloads like databases where unexpected restarts could cause issues.",
      "hint": "Databases need careful handling when changing resources."
    },
    {
      "id": "kubernetes-autoscaling-quiz-06",
      "type": "fill-blank",
      "question": "What component embedded in Kubelet collects container-level metrics like CPU, memory, and network I/O?",
      "answer": "cAdvisor",
      "caseSensitive": false,
      "explanation": "cAdvisor (Container Advisor) is embedded in Kubelet and collects container-level metrics from the container runtime.",
      "hint": "Its full name is Container Advisor."
    },
    {
      "id": "kubernetes-autoscaling-quiz-07",
      "type": "drag-drop",
      "question": "Arrange the metrics collection flow from container to HPA:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Container Runtime",
        "cAdvisor",
        "Kubelet",
        "Metrics Server",
        "HPA Controller"
      ],
      "correctOrder": [0, 1, 2, 3, 4],
      "explanation": "Container Runtime runs containers → cAdvisor collects metrics → Kubelet aggregates → Metrics Server queries and aggregates cluster-wide → HPA Controller consumes metrics for scaling decisions."
    },
    {
      "id": "kubernetes-autoscaling-quiz-08",
      "type": "multiple-select",
      "question": "Which are valid KEDA trigger sources for event-driven autoscaling?",
      "options": [
        "AWS SQS queue length",
        "Kafka consumer lag",
        "Node CPU utilization",
        "Custom HTTP webhooks"
      ],
      "answers": [0, 1, 3],
      "explanation": "KEDA scales based on external event sources like SQS queues, Kafka topics, and custom webhooks. Node CPU is handled by standard HPA, not KEDA's event-driven model.",
      "hint": "KEDA focuses on external events, not resource metrics."
    },
    {
      "id": "kubernetes-autoscaling-quiz-09",
      "type": "true-false",
      "question": "VPA and HPA can safely be used together on the same deployment scaling on the same metric (CPU).",
      "answer": false,
      "explanation": "Using VPA and HPA together on the same metric can cause conflicts. VPA adjusts resource requests while HPA scales based on utilization of those requests, potentially causing unpredictable behavior.",
      "hint": "Consider what happens when both try to optimize CPU at the same time."
    },
    {
      "id": "kubernetes-autoscaling-quiz-10",
      "type": "mcq",
      "question": "In Karpenter, what is the purpose of the NodeClass (EC2NodeClass)?",
      "options": [
        "Defines what type of nodes to create (requirements, limits)",
        "Defines how to create nodes (AMI, networking, IAM)",
        "Monitors node utilization for consolidation",
        "Handles spot instance interruptions"
      ],
      "answer": 1,
      "explanation": "NodeClass defines HOW to create nodes - cloud-specific configuration like AMI selection, subnets, security groups, and IAM roles. NodePool defines WHAT nodes to create.",
      "hint": "NodePool and NodeClass have distinct responsibilities."
    },
    {
      "id": "kubernetes-autoscaling-quiz-11",
      "type": "code-completion",
      "question": "Complete the HPA behavior policy to prevent aggressive scale-down:",
      "instruction": "Fill in the parameter that limits scale-down to 50% of pods",
      "codeTemplate": "behavior:\n  scaleDown:\n    stabilizationWindowSeconds: 300\n    policies:\n    - type: _____\n      value: 50\n      periodSeconds: 60",
      "answer": "Percent",
      "caseSensitive": true,
      "acceptedAnswers": ["Percent"],
      "explanation": "The 'Percent' type allows you to specify scale-down as a percentage of current replicas, preventing too many pods from being removed at once."
    },
    {
      "id": "kubernetes-autoscaling-quiz-12",
      "type": "flashcard",
      "question": "What is the key difference between Cluster Autoscaler and Karpenter in terms of instance selection?",
      "answer": "**Cluster Autoscaler** is limited to pre-defined instance types configured in ASGs/node groups.\n\n**Karpenter** dynamically selects the optimal instance type from the entire cloud provider catalog based on actual pod requirements, enabling better bin-packing and cost optimization."
    },
    {
      "id": "kubernetes-autoscaling-quiz-13",
      "type": "mcq",
      "question": "What does Karpenter's consolidation policy 'WhenUnderutilized' do?",
      "options": [
        "Removes empty nodes only",
        "Combines pods from underutilized nodes and replaces with smaller instances",
        "Scales pods down when CPU is low",
        "Prevents any node removal"
      ],
      "answer": 1,
      "explanation": "WhenUnderutilized actively consolidates by combining pods from multiple underutilized nodes, deleting unnecessary nodes, and potentially replacing nodes with cheaper/smaller instances.",
      "hint": "Think about active optimization, not just cleanup."
    },
    {
      "id": "kubernetes-autoscaling-quiz-14",
      "type": "fill-blank",
      "question": "In the HPA formula `desiredReplicas = ceil[currentReplicas * (currentMetric / targetMetric)]`, what mathematical function is applied to the result?",
      "answer": "ceil",
      "caseSensitive": false,
      "explanation": "The ceiling function (ceil) is used to round up, ensuring there are always enough replicas to handle the load.",
      "hint": "It rounds in a specific direction."
    },
    {
      "id": "kubernetes-autoscaling-quiz-15",
      "type": "true-false",
      "question": "The Metrics Server stores historical metrics data for long-term analysis.",
      "answer": false,
      "explanation": "Metrics Server stores only short-term, in-memory data with no historical retention. For historical metrics, you need a dedicated monitoring solution like Prometheus.",
      "hint": "Consider its purpose as a real-time metrics aggregator."
    },
    {
      "id": "kubernetes-autoscaling-quiz-16",
      "type": "multiple-select",
      "question": "Which actions does Karpenter perform for cost optimization?",
      "options": [
        "Delete empty nodes immediately",
        "Consolidate underutilized nodes",
        "Replace with cheaper instance types",
        "Handle spot instance interruptions"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "Karpenter performs all these optimizations: removes empty nodes, consolidates underutilized ones, replaces with cheaper instances when possible, and gracefully handles spot interruptions with replacement provisioning.",
      "hint": "Karpenter is designed for comprehensive cost optimization."
    },
    {
      "id": "kubernetes-autoscaling-quiz-17",
      "type": "mcq",
      "question": "Which VPA component is responsible for evicting pods that need resource updates?",
      "options": [
        "Recommender",
        "Updater",
        "Admission Controller",
        "Metrics Server"
      ],
      "answer": 1,
      "explanation": "The Updater component compares current vs recommended requests and evicts pods when updates are needed. The Admission Controller then sets new requests on recreated pods.",
      "hint": "Each VPA component has a specific role in the update workflow."
    },
    {
      "id": "kubernetes-autoscaling-quiz-18",
      "type": "drag-drop",
      "question": "Arrange the VPA workflow steps in correct order:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Recommender analyzes metrics",
        "Updater evicts pod",
        "Admission Controller mutates new pod",
        "New pod starts with optimal requests"
      ],
      "correctOrder": [0, 1, 2, 3],
      "explanation": "Recommender analyzes usage and updates recommendations → Updater sees difference and evicts pod → Admission Controller intercepts pod creation and applies recommendations → New pod runs with optimized resources."
    },
    {
      "id": "kubernetes-autoscaling-quiz-19",
      "type": "flashcard",
      "question": "Why is stabilizationWindowSeconds important for HPA scale-down behavior?",
      "answer": "**stabilizationWindowSeconds** prevents \"flapping\" - rapid scale up/down cycles caused by temporary metric fluctuations.\n\nBy requiring metrics to stay below the threshold for the window duration (e.g., 300 seconds), HPA avoids premature scale-down that could cause capacity issues when load returns."
    },
    {
      "id": "kubernetes-autoscaling-quiz-20",
      "type": "code-output",
      "question": "A deployment has these resource specifications. What percentage CPU utilization triggers HPA scaling?",
      "code": "resources:\n  requests:\n    cpu: 200m\n  limits:\n    cpu: 500m\n\nHPA target: averageUtilization: 70",
      "language": "yaml",
      "options": [
        "When pods use > 70% of 500m (350m)",
        "When pods use > 70% of 200m (140m)",
        "When pods use > 70% of total node CPU",
        "When average across all pods > 70%"
      ],
      "answer": 1,
      "explanation": "HPA calculates utilization based on resource requests, not limits. 70% of 200m request = 140m. When average CPU usage exceeds 140m per pod, HPA scales up.",
      "hint": "Utilization percentage is calculated against requests."
    }
  ]
}
{{< /quiz >}}
