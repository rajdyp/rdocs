---
title: "Configuration Management Quiz"
description: "Test your knowledge of Kubernetes ConfigMaps, Secrets, and configuration best practices"
weight: 12
---

{{< quiz id="kubernetes-configuration-quiz" >}}
{
  "questions": [
    {
      "type": "mcq",
      "question": "What is the maximum size limit for a single ConfigMap in Kubernetes?",
      "options": [
        "256KB",
        "512KB",
        "1MB",
        "2MB"
      ],
      "answer": 2,
      "explanation": "ConfigMaps have a maximum size limit of 1MB per ConfigMap. For larger configuration files, external storage should be used.",
      "hint": "Think about the documented size constraints for Kubernetes configuration objects."
    },
    {
      "type": "true-false",
      "question": "Kubernetes Secrets are encrypted by default when stored in etcd.",
      "answer": false,
      "explanation": "By default, Secrets are stored as base64-encoded (not encrypted) in etcd. Base64 encoding is trivially reversible. You must explicitly enable encryption at rest for etcd to secure secrets.",
      "hint": "Base64 encoding and encryption are not the same thing."
    },
    {
      "type": "multiple-select",
      "question": "Which of the following are valid methods to consume ConfigMap data in a Pod?",
      "options": [
        "Environment variables using configMapKeyRef",
        "Volume mounts",
        "Command-line arguments",
        "envFrom with configMapRef"
      ],
      "answers": [0, 1, 3],
      "explanation": "ConfigMaps can be consumed via environment variables (using configMapKeyRef or envFrom), and volume mounts. While command-line arguments can reference environment variables that come from ConfigMaps, ConfigMaps aren't directly consumed as command-line arguments.",
      "hint": "Consider how Pods can reference external configuration sources."
    },
    {
      "type": "fill-blank",
      "question": "What field in a ConfigMap or Secret YAML makes it unchangeable after creation?",
      "answer": "immutable",
      "caseSensitive": true,
      "explanation": "Setting `immutable: true` prevents modifications to a ConfigMap or Secret after creation. This improves performance (kubelet doesn't watch for changes) and prevents accidental modifications.",
      "hint": "It's a boolean field that, when set to true, prevents changes."
    },
    {
      "type": "code-output",
      "question": "What happens when you run this command?",
      "code": "echo \"bXlzZWNyZXQ=\" | base64 -d",
      "language": "bash",
      "options": [
        "bXlzZWNyZXQ=",
        "mysecret",
        "Error: invalid input",
        "mysecret="
      ],
      "answer": 1,
      "explanation": "The string `bXlzZWNyZXQ=` is the base64 encoding of `mysecret`. The `-d` flag decodes it, demonstrating that base64 encoding is trivially reversible and NOT a security measure.",
      "hint": "Base64 is an encoding scheme, not encryption."
    },
    {
      "type": "mcq",
      "question": "Which Secret type should you use for storing Docker registry credentials?",
      "options": [
        "Opaque",
        "kubernetes.io/basic-auth",
        "kubernetes.io/dockerconfigjson",
        "kubernetes.io/tls"
      ],
      "answer": 2,
      "explanation": "The `kubernetes.io/dockerconfigjson` type is specifically designed for Docker registry credentials and is used with `imagePullSecrets` in Pod specs.",
      "hint": "There's a specific type for Docker configuration in JSON format."
    },
    {
      "type": "drag-drop",
      "question": "Arrange these configuration practices from LEAST secure to MOST secure:",
      "instruction": "Drag to arrange from least secure (top) to most secure (bottom)",
      "items": [
        "Hardcoded credentials in application code",
        "Secrets stored in ConfigMap",
        "Kubernetes Secrets with base64 encoding",
        "External secrets management (Vault, AWS Secrets Manager)"
      ],
      "correctOrder": [0, 1, 2, 3],
      "explanation": "Hardcoded credentials are worst (in code/images). ConfigMaps store data as plain text. K8s Secrets use base64 (not true encryption). External secrets managers provide proper encryption, rotation, and access control."
    },
    {
      "type": "true-false",
      "question": "By default, Pods automatically reload when a mounted ConfigMap is updated.",
      "answer": false,
      "explanation": "By default, Pods do NOT automatically reload when a ConfigMap is updated. Applications need to implement their own configuration reloading logic, or you need to restart the Pod/Deployment.",
      "hint": "Think about whether Kubernetes handles hot-reloading of configuration."
    },
    {
      "type": "mcq",
      "question": "What is the primary purpose of Configuration Management in Kubernetes?",
      "options": [
        "To reduce container image sizes",
        "To decouple configuration data from application code",
        "To speed up container startup times",
        "To enable automatic scaling"
      ],
      "answer": 1,
      "explanation": "Configuration Management decouples configuration from container images, enabling the same image to be deployed across different environments (dev, staging, production) with different configurations.",
      "hint": "Think about the 12-factor app principles."
    },
    {
      "type": "code-completion",
      "question": "Complete the Pod spec to mount a Secret as a read-only volume:",
      "instruction": "Fill in the missing boolean value",
      "codeTemplate": "volumeMounts:\n- name: db-credentials\n  mountPath: /etc/secrets\n  _____: true",
      "answer": "readOnly",
      "caseSensitive": true,
      "acceptedAnswers": ["readOnly"],
      "explanation": "The `readOnly: true` field ensures the mounted Secret cannot be modified by the container, which is a security best practice for sensitive data."
    },
    {
      "type": "multiple-select",
      "question": "Which of the following are valid Kubernetes Secret types?",
      "options": [
        "kubernetes.io/tls",
        "kubernetes.io/ssh-auth",
        "kubernetes.io/api-key",
        "kubernetes.io/service-account-token"
      ],
      "answers": [0, 1, 3],
      "explanation": "TLS, SSH auth, and service-account-token are valid Secret types. There is no built-in `kubernetes.io/api-key` type; API keys would use the generic Opaque type.",
      "hint": "Review the documented Secret types in Kubernetes."
    },
    {
      "type": "flashcard",
      "question": "What is the key difference between ConfigMap `data` and `stringData` fields?",
      "answer": "**data** - Values must be base64-encoded\n\n**stringData** - Values are plain text; Kubernetes automatically base64-encodes them\n\n`stringData` is more convenient for writing manifests, but both store data the same way internally."
    },
    {
      "type": "mcq",
      "question": "When using `subPath` in a volumeMount, what is the primary benefit?",
      "options": [
        "It improves read performance",
        "It allows mounting only a specific file from the ConfigMap",
        "It enables automatic config reloading",
        "It encrypts the mounted file"
      ],
      "answer": 1,
      "explanation": "Using `subPath` allows you to mount a specific key from a ConfigMap as a single file at a specific path, rather than mounting all keys as files in a directory.",
      "hint": "Think about selective file mounting."
    },
    {
      "type": "fill-blank",
      "question": "What kubectl command decodes a secret value? `kubectl get secret db-secret -o jsonpath='{.data.password}' | _____ -d`",
      "answer": "base64",
      "caseSensitive": true,
      "explanation": "Since Secrets store values as base64-encoded strings, you need to pipe the output to `base64 -d` to decode and view the actual value.",
      "hint": "Secrets are base64-encoded in Kubernetes."
    },
    {
      "type": "true-false",
      "question": "The `envFrom` field in a Pod spec can load all keys from a ConfigMap as environment variables at once.",
      "answer": true,
      "explanation": "Using `envFrom` with `configMapRef` loads all key-value pairs from a ConfigMap as environment variables, which is more convenient than defining each variable individually with `valueFrom`.",
      "hint": "Think about bulk loading configuration."
    },
    {
      "type": "code-output",
      "question": "Given this ConfigMap, what files will be created when mounted at /etc/config?",
      "code": "apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: app-config\ndata:\n  database.host: \"db.example.com\"\n  app.properties: |\n    timeout=30\n    level=INFO",
      "language": "yaml",
      "options": [
        "One file: app-config containing all data",
        "Two files: database.host and app.properties",
        "Three files: database, host, and app.properties",
        "One directory with nested files"
      ],
      "answer": 1,
      "explanation": "When a ConfigMap is mounted as a volume, each key becomes a separate file. So `database.host` becomes a file containing `db.example.com`, and `app.properties` becomes a file containing the multi-line content.",
      "hint": "Each key in the ConfigMap data section becomes a file."
    },
    {
      "type": "flashcard",
      "question": "Why should you use external secrets management systems like HashiCorp Vault instead of native Kubernetes Secrets?",
      "answer": "**Native K8s Secrets limitations:**\n- Only base64-encoded, not encrypted by default\n- No automatic rotation\n- Limited audit capabilities\n\n**External systems provide:**\n- True encryption at rest and in transit\n- Automatic secret rotation\n- Fine-grained access control\n- Comprehensive audit logging\n- Dynamic secret generation"
    },
    {
      "type": "multiple-select",
      "question": "Which are benefits of making ConfigMaps immutable (`immutable: true`)?",
      "options": [
        "Prevents accidental modifications",
        "Improved cluster performance (kubelet doesn't watch)",
        "Automatic secret encryption",
        "Clear intent that config shouldn't change"
      ],
      "answers": [0, 1, 3],
      "explanation": "Immutable ConfigMaps prevent accidents, improve performance by eliminating watch overhead, and clearly signal intent. Immutability has nothing to do with encryption.",
      "hint": "Think about operational and performance benefits."
    },
    {
      "type": "mcq",
      "question": "What is the recommended approach when you have 50+ configuration values to pass to a container?",
      "options": [
        "Define each as a separate environment variable",
        "Use volume mount with configuration files",
        "Hardcode them in the container image",
        "Use command-line arguments"
      ],
      "answer": 1,
      "explanation": "For large numbers of configuration values, volume mounting configuration files is cleaner and more maintainable than defining many individual environment variables. It also makes the Pod spec more readable.",
      "hint": "Think about what's more maintainable and readable."
    },
    {
      "type": "drag-drop",
      "question": "Arrange the steps to create and use a ConfigMap from a file:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Create local config file (app.properties)",
        "Run kubectl create configmap --from-file",
        "Reference ConfigMap in Pod spec",
        "Verify with kubectl get configmap -o yaml"
      ],
      "correctOrder": [0, 1, 3, 2],
      "explanation": "First create the config file, then create the ConfigMap from it, verify it was created correctly, and finally reference it in your Pod spec."
    }
  ]
}
{{< /quiz >}}
