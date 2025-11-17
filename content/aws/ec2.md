---
title: EC2
type: docs
weight: 1
prev: /aws
next: /aws/s3
---

# Amazon EC2

Scalable computing capacity in the AWS cloud. Launch virtual servers (instances) on demand.

## Instance Types

### General Purpose
- **T3/T4g**: Burstable performance
- **M5/M6i**: Balanced compute, memory, and networking

### Compute Optimized
- **C5/C6i**: High-performance processors for compute-intensive workloads

### Memory Optimized
- **R5/R6i**: Fast performance for memory-intensive workloads
- **X1/X2**: Lowest price per GiB of RAM

### Storage Optimized
- **I3/I4i**: High sequential read/write access to large datasets
- **D2**: High disk throughput

## Pricing Models

1. **On-Demand**: Pay by the second, no long-term commitments
2. **Reserved Instances**: 1 or 3-year commitment, up to 75% discount
3. **Spot Instances**: Bid on spare capacity, up to 90% discount
4. **Savings Plans**: Flexible pricing model, 1 or 3-year commitment

## Security Groups

Virtual firewalls that control inbound and outbound traffic:

```bash
# Allow SSH from specific IP
Type: SSH
Protocol: TCP
Port: 22
Source: 203.0.113.0/24

# Allow HTTP from anywhere
Type: HTTP
Protocol: TCP
Port: 80
Source: 0.0.0.0/0
```

## User Data Script

Bootstrap instances with custom scripts:

```bash
#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd
echo "<h1>Hello from EC2</h1>" > /var/www/html/index.html
```
