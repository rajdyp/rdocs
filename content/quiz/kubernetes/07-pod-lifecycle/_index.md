---
title: Pod Lifecycle and Scheduling Quiz
linkTitle: Pod Lifecycle
type: docs
weight: 07
prev: /quiz/kubernetes/06-pods
next: /quiz/kubernetes/08-workload-controllers
---

{{< quiz id="kubernetes-pod-lifecycle-quiz" >}}
{
  "questions": [
    {
      "id": "kubernetes-pod-lifecycle-quiz-01",
      "type": "mcq",
      "question": "A Pod is stuck in the `Pending` phase with `nodeName=worker-1` set. What is the most likely cause?",
      "options": [
        "The scheduler hasn't assigned a node yet",
        "The kubelet on worker-1 is pulling container images",
        "The Pod has been deleted",
        "The container is waiting for a liveness probe"
      ],
      "answer": 1,
      "explanation": "When `nodeName` is set but the Pod is still `Pending`, it means the scheduler has already assigned the node, but the kubelet is likely pulling images, creating containers, or running init containers.",
      "hint": "Check the pod lifecycle diagram - what happens after the scheduler assigns a node?"
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-02",
      "type": "multiple-select",
      "question": "Which of the following will cause a container to restart when `restartPolicy: Always` is set?",
      "options": [
        "Container exits with code 0 (success)",
        "Container exits with code 1 (failure)",
        "Container process crashes",
        "Liveness probe fails repeatedly",
        "Node runs out of memory"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "`restartPolicy: Always` restarts containers on ANY termination (exit code 0 or non-zero), crashes, and liveness probe failures. Node resource exhaustion would cause pod eviction, not container restart.",
      "hint": "Remember that 'Always' means restart on ANY termination, not just failures."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-03",
      "type": "true-false",
      "question": "The scheduler's filtering phase removes nodes that have insufficient resources, while the scoring phase ranks the remaining nodes.",
      "answer": true,
      "explanation": "Correct! The filtering phase eliminates unsuitable nodes (insufficient resources, taint mismatches, etc.), and then the scoring phase ranks the remaining candidates to select the best one.",
      "hint": "Think about the two-phase approach: eliminate first, then rank."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-04",
      "type": "drag-drop",
      "question": "Arrange the scheduling process steps in the correct order:",
      "instruction": "Drag to arrange from first to last",
      "items": [
        "Scheduler watches for unscheduled pods",
        "Pod created (nodeName=null)",
        "Filtering phase (remove unsuitable nodes)",
        "Scoring phase (rank remaining nodes)",
        "Select highest-scored node",
        "Bind pod to node"
      ],
      "correctOrder": [1, 0, 2, 3, 4, 5],
      "explanation": "The scheduler follows this exact sequence: watch for unscheduled pods → filter unsuitable nodes → score remaining nodes → select best → bind to node."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-05",
      "type": "code-output",
      "question": "Given this configuration, what will happen if you try to schedule a pod without the required toleration?",
      "code": "# Node taint:\nkubectl taint nodes worker-1 gpu=nvidia:NoSchedule\n\n# Pod spec (no tolerations):\napiVersion: v1\nkind: Pod\nmetadata:\n  name: regular-app\nspec:\n  containers:\n  - name: app\n    image: nginx",
      "language": "yaml",
      "options": [
        "Pod schedules on worker-1 normally",
        "Pod stays Pending and cannot schedule on worker-1",
        "Pod schedules but gets evicted immediately",
        "Pod schedules only if worker-1 has available resources"
      ],
      "answer": 1,
      "explanation": "The `NoSchedule` taint effect prevents pods without matching tolerations from being scheduled on the node. The pod will remain `Pending` until it can find a suitable node or gets a matching toleration.",
      "hint": "NoSchedule affects new pod scheduling, not running pods."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-06",
      "type": "mcq",
      "question": "What is the key difference between `nodeSelector` and `nodeAffinity`?",
      "options": [
        "`nodeSelector` is faster to evaluate than `nodeAffinity`",
        "`nodeAffinity` supports soft preferences and more operators, while `nodeSelector` only supports hard requirements with exact label matches",
        "`nodeSelector` can use OR logic, while `nodeAffinity` only supports AND",
        "`nodeAffinity` is deprecated in favor of `nodeSelector`"
      ],
      "answer": 1,
      "explanation": "`nodeAffinity` provides more expressiveness with `required` (hard) and `preferred` (soft) constraints, plus operators like In, NotIn, Exists, Gt, and Lt. `nodeSelector` only supports exact label matching with AND logic.",
      "hint": "Think about flexibility - which one offers 'preferred' scheduling?"
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-07",
      "type": "fill-blank",
      "question": "In pod affinity rules, the `topologyKey` field defines the scope of co-location. What is the topologyKey value to ensure pods are scheduled on the same physical node?",
      "answer": "kubernetes.io/hostname",
      "caseSensitive": false,
      "explanation": "The `kubernetes.io/hostname` label uniquely identifies each node, so using it as a topologyKey ensures pods are co-located on the exact same physical node.",
      "hint": "It's a built-in Kubernetes label that identifies individual nodes."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-08",
      "type": "code-completion",
      "question": "Complete the PodDisruptionBudget to ensure at least 3 pods remain available during voluntary disruptions:",
      "instruction": "Fill in the missing field name and value",
      "codeTemplate": "apiVersion: policy/v1\nkind: PodDisruptionBudget\nmetadata:\n  name: web-pdb\nspec:\n  _____: 3\n  selector:\n    matchLabels:\n      app: web",
      "answer": "minAvailable",
      "caseSensitive": false,
      "acceptedAnswers": ["minAvailable", "minavailable"],
      "explanation": "The `minAvailable` field specifies the minimum number of pods that must remain running during voluntary disruptions. Alternatively, you could use `maxUnavailable` to specify the maximum number that can be down."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-09",
      "type": "multiple-select",
      "question": "Which scenarios are considered VOLUNTARY disruptions that PodDisruptionBudgets protect against?",
      "options": [
        "kubectl drain node-1",
        "Node hardware failure",
        "Deployment rolling update",
        "Node runs out of memory",
        "Manual pod deletion (kubectl delete pod)",
        "Kernel panic"
      ],
      "answers": [0, 2, 4],
      "explanation": "PDBs protect against human-initiated or automated voluntary disruptions like draining nodes, rolling updates, and manual deletions. They do NOT protect against involuntary disruptions like hardware failures, resource exhaustion, or kernel panics.",
      "hint": "Think 'planned' vs 'unexpected' - PDBs protect against planned operations."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-10",
      "type": "flashcard",
      "question": "What is Pod Priority and how does it differ from Preemption?",
      "answer": "**Pod Priority** assigns importance levels to pods using PriorityClass, determining scheduling order when resources are available.\n\n**Preemption** is the action of evicting lower-priority pods to make room for higher-priority pods when the cluster is at capacity.\n\n**Key difference:**\n- Priority = scheduling order (which pod goes first)\n- Preemption = resource reclamation (whether to evict others)\n\nYou can have priority WITHOUT preemption by setting `preemptionPolicy: Never`."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-11",
      "type": "mcq",
      "question": "A pod has resource requests and limits defined, but the values are not equal (requests < limits). What QoS class will it be assigned?",
      "options": [
        "Guaranteed",
        "Burstable",
        "BestEffort",
        "Premium"
      ],
      "answer": 1,
      "explanation": "This is `Burstable` QoS because the pod has resource requests and limits defined, but they are not equal. Guaranteed requires requests == limits for all resources. BestEffort has no resources defined.",
      "hint": "Look for whether requests equal limits or not."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-12",
      "type": "code-output",
      "question": "What is the correct eviction order when a node experiences memory pressure?",
      "code": "Node memory pressure detected!\n\nRunning pods:\n- Pod A: BestEffort (no resources defined)\n- Pod B: Burstable (using more than requests)\n- Pod C: Guaranteed (requests == limits)\n- Pod D: Burstable (within requests)",
      "language": "text",
      "options": [
        "A → B → D → C",
        "C → D → B → A",
        "A → B → C → D",
        "D → B → A → C"
      ],
      "answer": 0,
      "explanation": "Eviction order under resource pressure: 1) BestEffort first, 2) Burstable pods exceeding requests, 3) Burstable pods within requests, 4) Guaranteed pods last (only as last resort).",
      "hint": "Best effort gets evicted first, guaranteed last."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-13",
      "type": "true-false",
      "question": "The `preStop` hook executes AFTER the SIGTERM signal is sent to the container.",
      "answer": false,
      "explanation": "False! The `preStop` hook executes BEFORE SIGTERM. Flow: Pod deleted → preStop runs (blocking) → SIGTERM sent → wait for graceful shutdown → SIGKILL if needed.",
      "hint": "The name 'preStop' gives a clue about when it runs."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-14",
      "type": "mcq",
      "question": "You set `terminationGracePeriodSeconds: 60` and your `preStop` hook runs for 45 seconds. How much time does your application have to handle SIGTERM and shut down gracefully?",
      "options": [
        "60 seconds (grace period doesn't include preStop)",
        "15 seconds (60 - 45 from preStop)",
        "45 seconds (same as preStop duration)",
        "105 seconds (60 + 45)"
      ],
      "answer": 1,
      "explanation": "The `terminationGracePeriodSeconds` is a TOTAL budget that includes preStop execution time. If preStop takes 45s, only 15s remain for the application to handle SIGTERM before SIGKILL is sent at the 60s mark.",
      "hint": "It's a total budget, not separate time allowances."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-15",
      "type": "fill-blank",
      "question": "What exit code indicates that a container was forcefully killed with SIGKILL?",
      "answer": "137",
      "caseSensitive": false,
      "explanation": "Exit code 137 = 128 + 9 (SIGKILL signal number). When a process is terminated by a signal, the exit code is 128 plus the signal number. SIGKILL (exit code 137) indicates forceful termination, often because the container didn't exit within `terminationGracePeriodSeconds`. For reference, SIGTERM has exit code 143 (128 + 15).",
      "hint": "It's 128 plus the signal number for SIGKILL (9)."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-16",
      "type": "code-output",
      "question": "What happens when you apply this topology spread constraint with 3 replicas across 3 zones?",
      "code": "topologySpreadConstraints:\n- maxSkew: 1\n  topologyKey: topology.kubernetes.io/zone\n  whenUnsatisfiable: DoNotSchedule\n  labelSelector:\n    matchLabels:\n      app: web",
      "language": "yaml",
      "options": [
        "All 3 pods scheduled in zone A (random selection)",
        "Pods distributed: 1 in each zone (A: 1, B: 1, C: 1)",
        "Pods distributed: 2 in zone A, 1 in zone B (any distribution allowed)",
        "Scheduling fails because maxSkew is too restrictive"
      ],
      "answer": 1,
      "explanation": "With `maxSkew: 1` and 3 replicas across 3 zones, pods will be evenly distributed (1 per zone) because the maximum difference between any two zones cannot exceed 1. This achieves perfect balance: 1-0=1, satisfying the constraint.",
      "hint": "Calculate: what's the most even distribution possible with maxSkew=1?"
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-17",
      "type": "multiple-select",
      "question": "Which taint effects will cause existing pods WITHOUT matching tolerations to be evicted?",
      "options": [
        "NoSchedule",
        "PreferNoSchedule",
        "NoExecute",
        "ScheduleAnyway"
      ],
      "answers": [2],
      "explanation": "Only `NoExecute` evicts existing pods without matching tolerations. `NoSchedule` and `PreferNoSchedule` only affect new pod scheduling, allowing existing pods to continue running. `ScheduleAnyway` is not a valid taint effect.",
      "hint": "The word 'Execute' relates to running pods, not just scheduling."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-18",
      "type": "flashcard",
      "question": "Explain the difference between Pod Affinity and Pod Anti-Affinity, with use cases.",
      "answer": "**Pod Affinity:**\n- Attracts pods to nodes where certain other pods are running\n- Purpose: Co-locate related pods\n- Use case: Schedule app pod near its cache pod (reduce network latency)\n\n**Pod Anti-Affinity:**\n- Repels pods from nodes where certain other pods are running\n- Purpose: Separate pods for high availability\n- Use case: Spread replicas across different nodes/zones (avoid single point of failure)\n\n**topologyKey determines scope:**\n- `kubernetes.io/hostname` = same/different node\n- `topology.kubernetes.io/zone` = same/different availability zone"
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-19",
      "type": "mcq",
      "question": "A deployment has 5 replicas with a PodDisruptionBudget of `minAvailable: 3`. You run `kubectl drain node-1` which has 3 of the 5 pods. What happens?",
      "options": [
        "All 3 pods are evicted immediately",
        "Drain is blocked completely - no pods can be evicted",
        "Drain proceeds but can only evict 2 pods at a time, waiting for rescheduling between evictions",
        "The PDB is ignored during drain operations"
      ],
      "answer": 2,
      "explanation": "The drain operation will respect the PDB by evicting pods gradually. It can evict up to 2 pods (5-3=2) while ensuring at least 3 remain available. As evicted pods reschedule on other nodes, the drain can continue until all pods are moved.",
      "hint": "PDBs ensure minimum availability - drain must work around this constraint."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-20",
      "type": "code-completion",
      "question": "Complete the node affinity rule to PREFER (soft constraint) SSD nodes:",
      "instruction": "Fill in the missing field name for soft preferences",
      "codeTemplate": "affinity:\n  nodeAffinity:\n    _____:\n    - weight: 100\n      preference:\n        matchExpressions:\n        - key: disktype\n          operator: In\n          values:\n          - ssd",
      "answer": "preferredDuringSchedulingIgnoredDuringExecution",
      "caseSensitive": false,
      "acceptedAnswers": ["preferredDuringSchedulingIgnoredDuringExecution", "preferredduringschedulingignoreduringexecution"],
      "explanation": "`preferredDuringSchedulingIgnoredDuringExecution` creates a soft constraint - the scheduler tries to match but will schedule anyway if impossible. Compare with `requiredDuringSchedulingIgnoredDuringExecution` for hard constraints."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-21",
      "type": "mcq",
      "question": "When using `nodeName` to assign a pod to a specific node, which of the following is TRUE?",
      "options": [
        "The scheduler still validates resource availability on the target node",
        "Taints and tolerations are still checked before scheduling",
        "The scheduler is bypassed completely - no validation occurs",
        "Node affinity rules are still evaluated"
      ],
      "answer": 2,
      "explanation": "When `nodeName` is set, the scheduler is completely bypassed. No resource checks, no taint validation, no affinity evaluation - the pod is directly assigned to the specified node. This can lead to scheduling failures if the node doesn't exist or can't run the pod.",
      "hint": "Think about the trade-off: speed vs safety checks."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-22",
      "type": "true-false",
      "question": "Setting `preemptionPolicy: Never` on a PriorityClass means the pod will have low priority and can be preempted by others.",
      "answer": false,
      "explanation": "False! `preemptionPolicy: Never` means this pod will NOT preempt (evict) other lower-priority pods, even if it has high priority. The pod still benefits from priority for queue ordering, but won't kick out running workloads.",
      "hint": "The policy controls what the pod CAN DO, not what can be done TO it."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-23",
      "type": "multiple-select",
      "question": "Which of the following are valid node affinity operators?",
      "options": [
        "In",
        "NotIn",
        "Exists",
        "Contains",
        "Gt (Greater than)",
        "Equals"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "Valid node affinity operators are: `In`, `NotIn`, `Exists`, `DoesNotExist`, `Gt` (greater than), and `Lt` (less than). `Contains` and `Equals` are not valid operators.",
      "hint": "Think about set operations and numeric comparisons."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-24",
      "type": "code-output",
      "question": "A pod with this configuration is deleted. What happens at t=30s if the preStop hook is still running?",
      "code": "spec:\n  terminationGracePeriodSeconds: 30\n  containers:\n  - name: app\n    lifecycle:\n      preStop:\n        exec:\n          command: [\"/bin/sh\", \"-c\", \"sleep 60\"]",
      "language": "yaml",
      "options": [
        "The preStop hook is allowed to complete (total 60s)",
        "SIGKILL is sent immediately, forcefully terminating the container",
        "SIGTERM is sent, giving the app 30 more seconds",
        "The grace period is automatically extended to 60s"
      ],
      "answer": 1,
      "explanation": "At t=30s, the `terminationGracePeriodSeconds` budget is exhausted, so SIGKILL is sent immediately, even if preStop is still running. This is why preStop duration MUST be less than the total grace period.",
      "hint": "The grace period is a hard limit - it's not extended for hooks."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-25",
      "type": "flashcard",
      "question": "What is the difference between Topology Spread Constraints and Pod Anti-Affinity?",
      "answer": "**Pod Anti-Affinity:**\n- **Relationship-based**: \"Keep pods with label X away from pods with label Y\"\n- Can be hard (required) or soft (preferred with weights)\n- Works across any topology domain defined by `topologyKey` (node, zone, region, etc.)\n- Good for: High availability (spread replicas), workload isolation\n\n**Topology Spread Constraints:**\n- **Distribution-based**: \"Spread pods evenly within a max skew of N\"\n- Fine-grained control via `maxSkew` (1, 2, 3...) for balanced distribution\n- Focuses on balanced distribution across topology domains\n- Good for: Even load distribution, multi-zone deployments\n\n**Key Difference:**\n- Anti-affinity: \"Don't schedule near pods with label X\" (defines relationships)\n- Topology spread: \"Balance across domains with max skew N\" (defines distribution)\n\n**Example:**\n- Anti-affinity with `topologyKey: kubernetes.io/hostname`: \"Never 2 replicas on same node\"\n- Topology spread with `maxSkew: 1`: \"Across 3 zones, distribution can be 2-2-1 but not 3-1-1\""
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-26",
      "type": "mcq",
      "question": "What is the default value for `terminationGracePeriodSeconds` if not specified?",
      "options": [
        "0 seconds (immediate termination)",
        "15 seconds",
        "30 seconds",
        "60 seconds"
      ],
      "answer": 2,
      "explanation": "The default `terminationGracePeriodSeconds` is 30 seconds if not explicitly specified. This gives pods 30 seconds total for preStop hooks and graceful shutdown before SIGKILL.",
      "hint": "It's the most commonly seen value in Kubernetes documentation."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-27",
      "type": "fill-blank",
      "question": "What is the scheduling phase called where unsuitable nodes are eliminated before scoring?",
      "answer": "filtering",
      "caseSensitive": false,
      "acceptedAnswers": ["filtering", "filter", "filtering phase"],
      "explanation": "The **filtering phase** (also called predicate phase) eliminates nodes that cannot run the pod due to insufficient resources, taint mismatches, node selector conflicts, or affinity violations. The remaining nodes proceed to the scoring phase.",
      "hint": "It's about removing/eliminating unsuitable options."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-28",
      "type": "true-false",
      "question": "A Pod's QoS class can be changed after the Pod is created by updating its resource requests and limits.",
      "answer": false,
      "explanation": "False! QoS class is determined at Pod creation based on resource definitions and cannot be changed afterward. You must delete and recreate the Pod with different resource specifications to change its QoS class.",
      "hint": "Think about immutability - many pod specs cannot be changed after creation."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-29",
      "type": "mcq",
      "question": "Which built-in Kubernetes taint is automatically applied when a node becomes unready?",
      "options": [
        "node.kubernetes.io/not-ready:NoSchedule",
        "node.kubernetes.io/not-ready:NoExecute",
        "node.kubernetes.io/unready:PreferNoSchedule",
        "node.kubernetes.io/unavailable:NoSchedule"
      ],
      "answer": 1,
      "explanation": "Kubernetes automatically applies `node.kubernetes.io/not-ready:NoExecute` when a node becomes unready. The `NoExecute` effect means both new pods cannot schedule AND existing pods without tolerations are evicted.",
      "hint": "NoExecute is used because running pods should be moved off unhealthy nodes."
    },
    {
      "id": "kubernetes-pod-lifecycle-quiz-30",
      "type": "code-completion",
      "question": "Complete the toleration to allow scheduling on nodes tainted with ANY value for the 'gpu' key:",
      "instruction": "Fill in the operator type",
      "codeTemplate": "tolerations:\n- key: \"gpu\"\n  operator: \"_____\"\n  effect: \"NoSchedule\"",
      "answer": "Exists",
      "caseSensitive": false,
      "acceptedAnswers": ["Exists", "exists"],
      "explanation": "The `Exists` operator tolerates any value for the specified key. This is useful when you want to tolerate a taint regardless of its value. Compare with `Equal` which requires an exact value match."
    }
  ]
}
{{< /quiz >}}
