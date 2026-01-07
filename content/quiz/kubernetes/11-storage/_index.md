---
title: Storage Quiz
linkTitle: Storage
type: docs
weight: 11
prev: /quiz/kubernetes/10-ingress
next: /quiz/kubernetes/12-configuration
---

{{< quiz id="kubernetes-storage-quiz" >}}
{
  "questions": [
    {
      "id": "kubernetes-storage-quiz-01",
      "type": "mcq",
      "question": "What happens to data stored in a pod's local filesystem when the pod is deleted?",
      "options": [
        "The data is automatically backed up to a PersistentVolume",
        "The data is lost permanently",
        "The data is transferred to the next pod that uses the same name",
        "The data is stored in the node's /var/lib/kubernetes directory"
      ],
      "answer": 1,
      "explanation": "By default, pod storage is ephemeral. When a pod is deleted, all data stored in its local filesystem is lost. This is why persistent storage solutions like PersistentVolumes are needed for stateful applications.",
      "hint": "Think about the ephemeral nature of pods in Kubernetes."
    },
    {
      "id": "kubernetes-storage-quiz-02",
      "type": "true-false",
      "question": "An emptyDir volume survives pod deletion and can be reused by a new pod.",
      "answer": false,
      "explanation": "An emptyDir volume is created when a pod is assigned to a node and exists only as long as that pod is running. It is deleted when the pod is removed. However, it does survive container restarts within the same pod.",
      "hint": "Consider the lifecycle relationship between emptyDir and the pod."
    },
    {
      "id": "kubernetes-storage-quiz-03",
      "type": "multiple-select",
      "question": "Which of the following are valid use cases for emptyDir volumes?",
      "options": [
        "Sharing data between multiple containers in the same pod",
        "Storing database data that must persist across pod restarts",
        "Temporary cache or scratch space",
        "Sharing configuration files across multiple pods",
        "Temporary storage for computational tasks"
      ],
      "answers": [0, 2, 4],
      "explanation": "emptyDir is ideal for temporary, ephemeral storage needs: sharing data between containers in a pod, caching, and scratch space. It's NOT suitable for persistent data (databases) or sharing across multiple pods.",
      "hint": "Remember that emptyDir is ephemeral and pod-scoped."
    },
    {
      "id": "kubernetes-storage-quiz-04",
      "type": "code-output",
      "question": "Given this emptyDir configuration, what happens if the pod tries to write 2Gi of data?",
      "code": "volumes:\n- name: cache\n  emptyDir:\n    sizeLimit: 1Gi",
      "language": "yaml",
      "options": [
        "The data is automatically compressed to fit",
        "The pod is evicted or the write operation fails",
        "The sizeLimit is automatically increased",
        "The data overwrites older cached data"
      ],
      "answer": 1,
      "explanation": "When an emptyDir volume exceeds its sizeLimit, the pod may be evicted or the write operation will fail. The sizeLimit acts as a hard constraint to prevent runaway storage usage.",
      "hint": "Consider what happens when a resource limit is exceeded in Kubernetes."
    },
    {
      "id": "kubernetes-storage-quiz-05",
      "type": "mcq",
      "question": "What is the primary security concern with using hostPath volumes?",
      "options": [
        "They consume too much network bandwidth",
        "They provide direct access to the host node's filesystem",
        "They cannot be encrypted",
        "They don't support ReadWriteMany access mode"
      ],
      "answer": 1,
      "explanation": "hostPath volumes mount directories from the host node's filesystem directly into the pod. This creates a security risk as it gives containers direct access to the host system, potentially allowing access to sensitive files or system directories.",
      "hint": "Think about what 'hostPath' means - accessing the host's files."
    },
    {
      "id": "kubernetes-storage-quiz-06",
      "type": "fill-blank",
      "question": "In a hostPath volume configuration, the `type: ___` ensures the path exists as a directory before mounting.",
      "answer": "Directory",
      "caseSensitive": true,
      "explanation": "The `type: Directory` validation ensures that the specified path exists on the host and is actually a directory before the volume is mounted. Other types include File, FileOrCreate, DirectoryOrCreate, and Socket.",
      "hint": "It's a type that validates the path is a folder structure."
    },
    {
      "id": "kubernetes-storage-quiz-07",
      "type": "drag-drop",
      "question": "Arrange these steps in the correct order for the PV-PVC binding process:",
      "instruction": "Drag to arrange from first to last step",
      "items": [
        "Administrator creates PersistentVolume",
        "User creates PersistentVolumeClaim",
        "Kubernetes matches and binds PVC to PV",
        "Pod references PVC in its volume configuration",
        "Pod can now read/write to persistent storage"
      ],
      "correctOrder": [0, 1, 2, 3, 4],
      "explanation": "The PV-PVC workflow: First, an admin provisions a PV. Then, a user requests storage via PVC. Kubernetes automatically binds the PVC to a suitable PV. The pod references the PVC name, and finally the pod can use the storage."
    },
    {
      "id": "kubernetes-storage-quiz-08",
      "type": "mcq",
      "question": "A pod needs persistent storage that can be mounted by multiple pods across different nodes simultaneously for read and write operations. Which access mode is required?",
      "options": [
        "ReadWriteOnce (RWO)",
        "ReadOnlyMany (ROX)",
        "ReadWriteMany (RWX)",
        "ReadWriteOncePod (RWOP)"
      ],
      "answer": 2,
      "explanation": "ReadWriteMany (RWX) allows the volume to be mounted by multiple nodes simultaneously with read-write access. This is typically supported by network storage solutions like NFS. RWO only allows one node, ROX is read-only, and RWOP restricts to a single pod.",
      "hint": "The requirement is 'multiple nodes' AND 'read-write'."
    },
    {
      "id": "kubernetes-storage-quiz-09",
      "type": "flashcard",
      "question": "What is the difference between a PersistentVolume (PV) and a PersistentVolumeClaim (PVC)?",
      "answer": "**PersistentVolume (PV)**: A cluster-level storage resource provisioned by administrators. It represents actual storage (NFS, EBS, etc.) with specific capacity and access modes.\n\n**PersistentVolumeClaim (PVC)**: A user's request for storage. It's like a \"storage voucher\" that asks for specific storage requirements (size, access mode). Kubernetes binds PVCs to suitable PVs.\n\n**Analogy**: PV is like a parking spot, PVC is like a parking ticket requesting a spot."
    },
    {
      "id": "kubernetes-storage-quiz-10",
      "type": "code-completion",
      "question": "Complete the PVC manifest to request 50Gi of storage:",
      "instruction": "Fill in the missing storage size",
      "codeTemplate": "apiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: my-pvc\nspec:\n  accessModes:\n  - ReadWriteOnce\n  resources:\n    requests:\n      storage: ___",
      "answer": "50Gi",
      "caseSensitive": false,
      "acceptedAnswers": ["50Gi", "50gi"],
      "explanation": "In Kubernetes resource requests, storage is specified with units like Gi (gibibytes), Mi (mebibytes), etc. The format is a number followed by the unit."
    },
    {
      "id": "kubernetes-storage-quiz-11",
      "type": "mcq",
      "question": "What problem does StorageClass solve that manual PV provisioning cannot?",
      "options": [
        "StorageClass provides better security encryption",
        "StorageClass automatically creates PVs on-demand when PVCs are created",
        "StorageClass allows ReadWriteMany access mode",
        "StorageClass makes storage faster"
      ],
      "answer": 1,
      "explanation": "StorageClass enables dynamic provisioning - when a PVC references a StorageClass, the provisioner automatically creates a matching PV without manual administrator intervention. This solves the scalability problem of manually pre-creating PVs.",
      "hint": "Think about the word 'dynamic' in dynamic provisioning."
    },
    {
      "id": "kubernetes-storage-quiz-12",
      "type": "multiple-select",
      "question": "Which of the following are components/parameters typically found in a StorageClass definition?",
      "options": [
        "provisioner",
        "reclaimPolicy",
        "containerPort",
        "volumeBindingMode",
        "replicas",
        "parameters"
      ],
      "answers": [0, 1, 3, 5],
      "explanation": "StorageClass includes: provisioner (which CSI driver to use), reclaimPolicy (what happens when PVC is deleted), volumeBindingMode (when to provision), and parameters (provider-specific settings). containerPort and replicas are pod/deployment concepts.",
      "hint": "Think about storage-specific configuration, not pod configuration."
    },
    {
      "id": "kubernetes-storage-quiz-13",
      "type": "true-false",
      "question": "When a PVC with reclaimPolicy: Retain is deleted, the underlying PersistentVolume and its data are automatically deleted.",
      "answer": false,
      "explanation": "With reclaimPolicy: Retain, when a PVC is deleted, the PV is NOT automatically deleted. It enters a 'Released' state and retains the data, allowing administrators to manually reclaim or backup the data. The 'Delete' policy would automatically delete the PV.",
      "hint": "What does 'Retain' mean in everyday language?"
    },
    {
      "id": "kubernetes-storage-quiz-14",
      "type": "code-output",
      "question": "A StorageClass has `volumeBindingMode: WaitForFirstConsumer`. When does the actual storage get provisioned?",
      "code": "apiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata:\n  name: fast-ssd\nprovisioner: ebs.csi.aws.com\nvolumeBindingMode: WaitForFirstConsumer",
      "language": "yaml",
      "options": [
        "Immediately when the PVC is created",
        "When the PV is manually created by an administrator",
        "When a pod that uses the PVC is scheduled to a node",
        "After 5 minutes of the PVC being in Pending state"
      ],
      "answer": 2,
      "explanation": "WaitForFirstConsumer delays volume provisioning until a pod using the PVC is scheduled. This ensures the volume is created in the correct availability zone/region where the pod will run, which is especially important for cloud providers with zone-specific storage.",
      "hint": "The keyword is 'FirstConsumer' - think about when the consumer (pod) appears."
    },
    {
      "id": "kubernetes-storage-quiz-15",
      "type": "flashcard",
      "question": "What is CSI (Container Storage Interface) and why is it important?",
      "answer": "**CSI** is a standard interface that allows storage vendors to write one plugin that works across multiple container orchestrators (Kubernetes, Mesos, etc.).\n\n**Before CSI**: Each storage provider had to write Kubernetes-specific code, tightly coupled to K8s releases.\n\n**After CSI**: Storage providers implement the standard CSI interface. This allows:\n- Decoupling: Storage drivers can update independently of Kubernetes\n- Portability: Same driver works across orchestrators\n- Innovation: Easier for new storage providers to integrate\n\n**Example**: AWS EBS CSI driver (`ebs.csi.aws.com`) can be updated by AWS without waiting for Kubernetes releases."
    },
    {
      "id": "kubernetes-storage-quiz-16",
      "type": "mcq",
      "question": "In a StatefulSet with volumeClaimTemplates creating 3 replicas, how many PVCs are automatically created?",
      "options": [
        "1 PVC shared by all 3 pods",
        "3 PVCs, one for each pod replica",
        "0 PVCs, you must create them manually",
        "6 PVCs, for redundancy"
      ],
      "answer": 1,
      "explanation": "StatefulSet's volumeClaimTemplates automatically create one unique PVC for each pod replica. For 3 replicas, you get 3 PVCs (e.g., data-mysql-0, data-mysql-1, data-mysql-2), ensuring each pod has its own persistent storage.",
      "hint": "StatefulSets are designed for applications where each instance needs its own state."
    },
    {
      "id": "kubernetes-storage-quiz-17",
      "type": "code-completion",
      "question": "Complete the pod manifest to mount a PVC named 'app-data':",
      "instruction": "Fill in the PVC reference",
      "codeTemplate": "volumes:\n- name: storage\n  persistentVolumeClaim:\n    claimName: ___",
      "answer": "app-data",
      "caseSensitive": true,
      "acceptedAnswers": ["app-data"],
      "explanation": "To use a PVC in a pod, you reference it under `volumes` with `persistentVolumeClaim.claimName` pointing to the PVC's name. The pod must be in the same namespace as the PVC."
    },
    {
      "id": "kubernetes-storage-quiz-18",
      "type": "multiple-select",
      "question": "Which storage provisioners would be appropriate for a multi-cloud or on-premise Kubernetes cluster?",
      "options": [
        "kubernetes.io/aws-ebs",
        "nfs.io/nfs",
        "pd.csi.storage.gke.io",
        "local",
        "disk.csi.azure.com"
      ],
      "answers": [1, 3],
      "explanation": "NFS and local provisioners are cloud-agnostic and work in on-premise or multi-cloud environments. AWS EBS, GCP Persistent Disk, and Azure Disk are cloud-specific and tied to their respective platforms.",
      "hint": "Which provisioners don't have cloud provider names in them?"
    },
    {
      "id": "kubernetes-storage-quiz-19",
      "type": "mcq",
      "question": "What is the primary use case for mounting ConfigMaps and Secrets as volumes instead of using environment variables?",
      "options": [
        "Volumes are more secure than environment variables",
        "Files can be updated automatically when ConfigMap/Secret changes, and applications can watch for file changes",
        "Volumes use less memory than environment variables",
        "Environment variables don't support binary data"
      ],
      "answer": 1,
      "explanation": "When ConfigMaps/Secrets are mounted as volumes, updates to the ConfigMap/Secret are reflected in the mounted files (after a sync period). Applications can watch these files and reload configuration without restarting. Environment variables are only set at container startup.",
      "hint": "Think about dynamic configuration updates without restarting pods."
    },
    {
      "id": "kubernetes-storage-quiz-20",
      "type": "drag-drop",
      "question": "Arrange these storage abstractions from lowest (closest to hardware) to highest (closest to application):",
      "instruction": "Drag from lowest to highest abstraction level",
      "items": [
        "Physical storage backend (NFS, EBS)",
        "PersistentVolume (PV)",
        "StorageClass",
        "PersistentVolumeClaim (PVC)",
        "volumeMount in Pod"
      ],
      "correctOrder": [0, 2, 1, 3, 4],
      "explanation": "Abstraction layers from lowest to highest: Physical storage → StorageClass (provisioning template) → PersistentVolume (cluster resource) → PersistentVolumeClaim (user request) → volumeMount (application usage). Each layer abstracts complexity from the layer above."
    },
    {
      "id": "kubernetes-storage-quiz-21",
      "type": "true-false",
      "question": "A PersistentVolume with accessMode ReadWriteOnce can be mounted by multiple pods as long as they are on the same node.",
      "answer": true,
      "explanation": "ReadWriteOnce (RWO) means the volume can be mounted as read-write by a single node, not a single pod. Multiple pods on the same node can share a RWO volume. If you need to restrict to a single pod across the entire cluster, use ReadWriteOncePod.",
      "hint": "RWO is 'once per node', not 'once per pod'."
    },
    {
      "id": "kubernetes-storage-quiz-22",
      "type": "fill-blank",
      "question": "The ___ policy for a PV determines what happens to the volume when its PVC is deleted.",
      "answer": "reclaim",
      "caseSensitive": false,
      "explanation": "The reclaimPolicy (or reclaim policy) specifies what should happen to a PersistentVolume when the PersistentVolumeClaim bound to it is deleted. Options are Retain, Delete, or Recycle (deprecated).",
      "hint": "It's about 'reclaiming' storage resources."
    },
    {
      "id": "kubernetes-storage-quiz-23",
      "type": "mcq",
      "question": "You need storage for a database in a StatefulSet that must survive pod rescheduling, node failures, and cluster upgrades. Which solution is most appropriate?",
      "options": [
        "emptyDir volume",
        "hostPath volume",
        "PersistentVolumeClaim with StorageClass",
        "ConfigMap volume"
      ],
      "answer": 2,
      "explanation": "PersistentVolumeClaim with StorageClass provides true persistent storage that survives pod deletion, node failures, and rescheduling. emptyDir is ephemeral, hostPath is node-specific (data lost if pod moves), and ConfigMap is for configuration, not data storage.",
      "hint": "The requirement is survival across pod and node lifecycle events."
    },
    {
      "id": "kubernetes-storage-quiz-24",
      "type": "code-output",
      "question": "What happens when this StatefulSet is scaled from 3 to 5 replicas?",
      "code": "apiVersion: apps/v1\nkind: StatefulSet\nmetadata:\n  name: db\nspec:\n  replicas: 5\n  volumeClaimTemplates:\n  - metadata:\n      name: data\n    spec:\n      storageClassName: fast\n      accessModes: [\"ReadWriteOnce\"]\n      resources:\n        requests:\n          storage: 10Gi",
      "language": "yaml",
      "options": [
        "All 5 pods share the existing 3 PVCs",
        "2 new PVCs are automatically created for the new pods",
        "The scaling operation fails until you manually create PVCs",
        "The new pods start without any persistent storage"
      ],
      "answer": 1,
      "explanation": "When a StatefulSet scales up, Kubernetes automatically creates new PVCs based on the volumeClaimTemplates for the new pods. Scaling from 3 to 5 replicas creates data-db-3 and data-db-4 PVCs. When scaling down, PVCs are retained by default.",
      "hint": "StatefulSet volumeClaimTemplates provide automatic PVC management."
    },
    {
      "id": "kubernetes-storage-quiz-25",
      "type": "flashcard",
      "question": "Explain the concept of 'dynamic provisioning' in Kubernetes storage.",
      "answer": "**Dynamic Provisioning** automatically creates PersistentVolumes on-demand when a PVC is created, without manual administrator intervention.\n\n**How it works**:\n1. User creates PVC referencing a StorageClass\n2. StorageClass's provisioner (e.g., AWS EBS CSI) is triggered\n3. Provisioner creates actual storage in backend (e.g., EBS volume)\n4. Provisioner creates PV object in Kubernetes\n5. Kubernetes binds PVC to the new PV\n6. Pod can use storage immediately\n\n**Benefits**:\n- Scalable: No need to pre-create PVs\n- Automated: Reduces manual operations\n- Efficient: Storage created only when needed\n\n**vs. Static Provisioning**: Admin manually creates PVs, users claim from existing pool."
    },
    {
      "id": "kubernetes-storage-quiz-26",
      "type": "multiple-select",
      "question": "Which scenarios would benefit from using hostPath volumes despite the security risks?",
      "options": [
        "A logging DaemonSet that needs to read container logs from /var/log",
        "A database requiring persistent storage across pod restarts",
        "A monitoring agent that needs access to /proc and /sys",
        "Sharing configuration files between multiple pods",
        "A node problem detector that inspects host system files"
      ],
      "answers": [0, 2, 4],
      "explanation": "hostPath is appropriate for system-level pods (typically DaemonSets) that need host access: log collectors reading /var/log, monitoring agents accessing /proc or /sys, and node diagnostics. It's NOT suitable for application data persistence or cross-pod sharing.",
      "hint": "Think about pods that need to inspect or monitor the host node itself."
    },
    {
      "id": "kubernetes-storage-quiz-27",
      "type": "mcq",
      "question": "A PVC has been created but remains in 'Pending' status. What is the most likely cause?",
      "options": [
        "The pod hasn't been created yet",
        "No PersistentVolume matches the PVC's requirements (size, access mode, StorageClass)",
        "The cluster has run out of CPU resources",
        "The namespace quota has been exceeded"
      ],
      "answer": 1,
      "explanation": "A PVC stays Pending when Kubernetes cannot find or create a suitable PV. Common reasons: no PV with sufficient capacity, mismatched accessModes, wrong/missing StorageClass, or provisioner failure. Creating a pod is not required for PVC binding.",
      "hint": "Think about the PV-PVC matching process."
    },
    {
      "id": "kubernetes-storage-quiz-28",
      "type": "true-false",
      "question": "ConfigMaps and Secrets mounted as volumes appear as files in the container's filesystem.",
      "answer": true,
      "explanation": "When ConfigMaps and Secrets are mounted as volumes, each key-value pair becomes a file in the mount path. The key becomes the filename and the value becomes the file content. For example, a ConfigMap with key 'app.conf' appears as a file named 'app.conf' in the mounted directory.",
      "hint": "Think about how volume mounting works in general."
    },
    {
      "id": "kubernetes-storage-quiz-29",
      "type": "code-completion",
      "question": "Complete the StorageClass to enable volume expansion after creation:",
      "instruction": "Fill in the parameter that allows PVC size increases",
      "codeTemplate": "apiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata:\n  name: expandable\nprovisioner: ebs.csi.aws.com\n___: true",
      "answer": "allowVolumeExpansion",
      "caseSensitive": true,
      "acceptedAnswers": ["allowVolumeExpansion"],
      "explanation": "The `allowVolumeExpansion: true` field in a StorageClass permits PVCs using that StorageClass to be expanded after creation by editing the PVC's storage request. Not all storage backends support this feature."
    },
    {
      "id": "kubernetes-storage-quiz-30",
      "type": "mcq",
      "question": "What is the purpose of the `subPath` field in a volumeMount?",
      "options": [
        "It creates a subdirectory in the volume",
        "It mounts only a specific file or subdirectory from the volume instead of the entire volume",
        "It specifies the path on the container where the volume should be mounted",
        "It defines the storage path on the backend system"
      ],
      "answer": 1,
      "explanation": "The `subPath` field allows mounting a specific file or subdirectory from a volume rather than mounting the entire volume root. This is useful when multiple containers need different subdirectories from the same volume, or to avoid mounting over existing directories.",
      "hint": "It's about mounting a 'sub' portion of the volume."
    },
    {
      "id": "kubernetes-storage-quiz-31",
      "type": "flashcard",
      "question": "What are the three reclaim policies for PersistentVolumes and what does each do?",
      "answer": "**1. Retain** (default for manually created PVs):\n- PV is not deleted when PVC is deleted\n- Data is preserved\n- PV status becomes 'Released' (not 'Available')\n- Admin must manually clean up and reclaim\n- Use for: Critical data requiring manual backup\n\n**2. Delete** (default for dynamic provisioning):\n- PV and underlying storage are automatically deleted when PVC is deleted\n- Data is permanently lost\n- Use for: Temporary data, development environments\n\n**3. Recycle** (DEPRECATED):\n- Basic scrub (rm -rf on the volume)\n- PV becomes available for new claims\n- No longer recommended; use Delete + dynamic provisioning instead"
    }
  ]
}
{{< /quiz >}}
