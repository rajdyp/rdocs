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
  {{< card link="chapter-01-introduction-to-kubernetes" title="Introduction" subtitle="What is Kubernetes and why use it" >}}
  {{< card link="chapter-02-kubernetes-cluster-architecture" title="Architecture" subtitle="Control plane, worker nodes, and namespaces" >}}
  {{< card link="chapter-03-control-plane-components" title="Control Plane Components" subtitle="API server, scheduler, controller manager, and etcd" >}}
  {{< card link="chapter-04-worker-node-components" title="Worker Node Components" subtitle="kubelet, kube-proxy, and container runtime" >}}
  {{< card link="chapter-05-kubernetes-networking" title="Networking" subtitle="CNI, CoreDNS, and network policies" >}}
  {{< card link="chapter-06-pods" title="Pods" subtitle="The smallest deployable unit in Kubernetes" >}}
  {{< card link="chapter-07-pod-lifecycle-and-scheduling" title="Pod Lifecycle and Scheduling" subtitle="Pod phases, probes, and scheduling constraints" >}}
  {{< card link="chapter-08-workload-controllers" title="Workload Controllers" subtitle="Deployments, StatefulSets, DaemonSets, and Jobs" >}}
  {{< card link="chapter-09-services-and-service-discovery" title="Services" subtitle="ClusterIP, NodePort, LoadBalancer, and DNS" >}}
  {{< card link="chapter-10-ingress-and-external-access" title="Ingress" subtitle="HTTP/HTTPS routing and external access" >}}
  {{< card link="chapter-11-storage" title="Storage" subtitle="Volumes, PersistentVolumes, and StorageClasses" >}}
  {{< card link="chapter-12-configuration-management" title="Configuration" subtitle="ConfigMaps and Secrets" >}}
  {{< card link="chapter-13-security" title="Security" subtitle="RBAC, pod security, and network policies" >}}
  {{< card link="chapter-14-autoscaling" title="Autoscaling" subtitle="HPA, VPA, and cluster autoscaling" >}}
  {{< card link="chapter-15-observability" title="Observability" subtitle="Logging, metrics, and monitoring" >}}
  {{< card link="chapter-16-advanced-topics" title="Advanced Topics" subtitle="Custom resources, operators, and service mesh" >}}
{{< /cards >}}
