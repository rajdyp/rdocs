---
title: Introduction to AWS Core Services
linkTitle: Introduction
type: docs
weight: 1
prev: /aws
next: /aws/02-global-infrastructure
---

## Overview

Amazon Web Services (AWS) is the world's most comprehensive and broadly adopted cloud platform, offering a wide range of fully featured services from data centers around the globe. This learning guide focuses on the **core services** that form the foundation of most AWS implementations.

## Cloud Computing Fundamentals

Before diving into specific AWS services, let's establish key cloud computing concepts:

### What is Cloud Computing?

Cloud computing is the on-demand delivery of IT resources over the internet with pay-as-you-go pricing. Instead of buying, owning, and maintaining physical data centers and servers, you can access technology services on an as-needed basis.

### Key Characteristics

**On-Demand Self-Service**
- Provision resources automatically without human interaction with service providers
- Scale resources up or down based on demand

**Broad Network Access**
- Access services over the network using standard mechanisms
- Available through various devices (laptops, mobile phones, workstations)

**Resource Pooling**
- Provider's computing resources serve multiple consumers
- Resources are dynamically assigned and reassigned according to demand

**Rapid Elasticity**
- Capabilities can be elastically provisioned and released
- Scale rapidly outward and inward with demand

**Measured Service**
- Cloud systems automatically control and optimize resource use
- Pay only for what you consume

### Cloud Service Models

```
┌──────────────────────────────────────────────────────────────┐
│                   Cloud Service Models                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  IaaS (Infrastructure as a Service)                          │
│  ├─ You manage: Applications, Data, Runtime, Middleware, OS  │
│  └─ Provider manages: Virtualization, Servers, Storage,      │
│                       Networking                             │
│  Examples: Amazon EC2, Amazon VPC, Amazon S3                 │
│                                                              │
│  PaaS (Platform as a Service)                                │
│  ├─ You manage: Applications, Data                           │
│  └─ Provider manages: Runtime, Middleware, OS,               │
│                       Virtualization, Servers, Storage,      │
│                       Networking                             │
│  Examples: AWS Elastic Beanstalk, AWS Lambda                 │
│                                                              │
│  SaaS (Software as a Service)                                │
│  ├─ You manage: Limited configuration and customization      │
│  └─ Provider manages: Everything (full stack)                │
│  Examples: Amazon WorkMail, Amazon Chime                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Cloud Deployment Models

**Public Cloud**
- Resources owned and operated by third-party cloud service provider
- Delivered over the internet
- Example: AWS, Microsoft Azure, Google Cloud Platform

**Private Cloud**
- Cloud infrastructure used exclusively by a single organization
- Can be hosted on-premises or by a third party
- Greater control and security

**Hybrid Cloud**
- Combination of public and private clouds
- Data and applications can be shared between them
- Provides greater flexibility and optimization

## AWS Value Proposition

### Benefits of AWS

**Cost Efficiency**
- No upfront infrastructure investment
- Pay-as-you-go pricing model
- Economies of scale (lower variable costs over time)

**Agility and Speed**
- Deploy resources in minutes
- Experiment without large capital expenditure
- Faster time to market

**Global Reach**
- Deploy applications in multiple geographic regions
- Reduce latency for end users
- Meet data residency requirements

**Security**
- Industry-leading security practices
- Compliance certifications and accreditations
- Shared Responsibility Model

**Innovation**
- Rapid adoption of new technologies
- Access to cutting-edge services
- Focus on application development rather than infrastructure management

### AWS Shared Responsibility Model

Understanding the division of security responsibilities between AWS and customers is crucial:

```
┌──────────────────────────────────────────────────────────────┐
│              AWS Shared Responsibility Model                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Customer Responsibility (Security IN the Cloud)             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ • Customer Data                                        │  │
│  │ • Platform, Applications, Identity & Access Management │  │
│  │ • Operating System, Network & Firewall Configuration   │  │
│  │ • Client-side Data Encryption & Data Integrity         │  │
│  │ • Server-side Encryption (file system and/or data)     │  │
│  │ • Network Traffic Protection (encryption, integrity)   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  AWS Responsibility (Security OF the Cloud)                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ • Software (Compute, Storage, Database, Networking)    │  │
│  │ • Hardware / AWS Global Infrastructure                 │  │
│  │   - Regions                                            │  │
│  │   - Availability Zones                                 │  │
│  │   - Edge Locations                                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**AWS Responsibilities:**
- Physical security of data centers
- Hardware and network infrastructure
- Virtualization layer
- Managed service operations

**Customer Responsibilities:**
- Data encryption (at rest and in transit)
- Network configuration and firewall rules
- Identity and access management
- Operating system and application patching
- Application security

## Getting Help and Further Resources

- **AWS Documentation**: https://docs.aws.amazon.com/
- **AWS Training and Certification**: https://aws.amazon.com/training/
- **AWS Well-Architected Framework**: https://aws.amazon.com/architecture/well-architected/
- **AWS Architecture Center**: https://aws.amazon.com/architecture/

## Summary

This chapter introduced cloud computing fundamentals, the AWS value proposition, and the shared responsibility model. You learned about cloud service models (IaaS, PaaS, SaaS), deployment models (public, private, hybrid), and how AWS fits into the cloud ecosystem.

---

**Key Takeaways:**

- Cloud computing delivers IT resources on-demand with pay-as-you-go pricing
- AWS provides comprehensive cloud services across compute, storage, networking, and more
- Understanding the shared responsibility model is crucial for security
