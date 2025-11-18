---
linkTitle: Kubernetes
title: Kubernetes
weight: 1
layout: docs
cascade:
  type: docs
sidebar:
  open: true
next: /kubernetes/01-introduction/
---

Learn about Kubernetes architecture, concepts, and how to deploy and manage containerized applications at scale.

{{< cards >}}
  {{< card link="01-introduction" title="Introduction" subtitle="What is Kubernetes and why use it" >}}
  {{< card link="02-cluster-architecture" title="Architecture" subtitle="Control plane, worker nodes, and namespaces" >}}
  {{< card link="03-control-plane" title="Control Plane Components" subtitle="API server, scheduler, controller manager, and etcd" >}}
  {{< card link="04-worker-nodes" title="Worker Node Components" subtitle="kubelet, kube-proxy, and container runtime" >}}
  {{< card link="05-networking" title="Networking" subtitle="CNI, CoreDNS, and network policies" >}}
  {{< card link="06-pods" title="Pods" subtitle="The smallest deployable unit in Kubernetes" >}}
  {{< card link="07-pod-lifecycle" title="Pod Lifecycle and Scheduling" subtitle="Pod phases, probes, and scheduling constraints" >}}
  {{< card link="08-workload-controllers" title="Workload Controllers" subtitle="Deployments, StatefulSets, DaemonSets, and Jobs" >}}
  {{< card link="09-services" title="Services" subtitle="ClusterIP, NodePort, LoadBalancer, and DNS" >}}
  {{< card link="10-ingress" title="Ingress" subtitle="HTTP/HTTPS routing and external access" >}}
  {{< card link="11-storage" title="Storage" subtitle="Volumes, PersistentVolumes, and StorageClasses" >}}
  {{< card link="12-configuration" title="Configuration" subtitle="ConfigMaps and Secrets" >}}
  {{< card link="13-security" title="Security" subtitle="RBAC, pod security, and network policies" >}}
  {{< card link="14-autoscaling" title="Autoscaling" subtitle="HPA, VPA, and cluster autoscaling" >}}
  {{< card link="15-observability" title="Observability" subtitle="Logging, metrics, and monitoring" >}}
  {{< card link="16-advanced-topics" title="Advanced Topics" subtitle="Custom resources, operators, and service mesh" >}}
{{< /cards >}}
