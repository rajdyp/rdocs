---
title: OpenTelemetry Quiz
linkTitle: OpenTelemetry
type: docs
weight: 1
prev: /quiz/observability
---

{{< quiz id="opentelemetry-quiz" >}}
{
  "questions": [
    {
      "id": "opentelemetry-quiz-01",
      "type": "mcq",
      "question": "What is the primary purpose of OpenTelemetry?",
      "options": [
        "A vendor-specific monitoring solution",
        "A standardized way to collect, process, and export telemetry data",
        "A replacement for Kubernetes",
        "A cloud-native database system"
      ],
      "answer": 1,
      "explanation": "OpenTelemetry (OTel) is an open-source observability framework that provides a standardized way to collect, process, and export telemetry data (traces, metrics, and logs) from applications and infrastructure.",
      "hint": "Think about what makes OTel vendor-agnostic."
    },
    {
      "id": "opentelemetry-quiz-02",
      "type": "multiple-select",
      "question": "Which of the following are the four telemetry signals supported by OpenTelemetry?",
      "options": [
        "Traces",
        "Metrics",
        "Logs",
        "Baggage",
        "Events"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "OpenTelemetry supports four types of telemetry signals: Traces (distributed request tracking), Metrics (numerical measurements), Logs (timestamped event records), and Baggage (key-value pairs propagated across services).",
      "hint": "Events is not listed as a separate signal type in OTel."
    },
    {
      "id": "opentelemetry-quiz-03",
      "type": "true-false",
      "question": "In OpenTelemetry, the trace_id changes at each service hop while span_id remains constant throughout the request flow.",
      "answer": false,
      "explanation": "It's the opposite: trace_id NEVER changes as the request flows through services (it uniquely identifies the entire trace), while span_id CHANGES at each service hop to identify each operation.",
      "hint": "Think about what uniquely identifies the entire distributed request."
    },
    {
      "id": "opentelemetry-quiz-04",
      "type": "mcq",
      "question": "What is the correct order of components in an OpenTelemetry Collector pipeline?",
      "options": [
        "Exporters → Processors → Receivers",
        "Processors → Receivers → Exporters",
        "Receivers → Processors → Exporters",
        "Receivers → Exporters → Processors"
      ],
      "answer": 2,
      "explanation": "The OTel Collector processes data in this order: Receivers (ingest data) → Processors (transform/filter) → Exporters (send to backends).",
      "hint": "Data must be received before it can be processed or exported."
    },
    {
      "id": "opentelemetry-quiz-05",
      "type": "fill-blank",
      "question": "The default OTLP gRPC port for the OpenTelemetry Collector is ____.",
      "answer": "4317",
      "caseSensitive": false,
      "explanation": "OTLP endpoints use port 4317 for gRPC and port 4318 for HTTP.",
      "hint": "It's a 4-digit number starting with 43."
    },
    {
      "id": "opentelemetry-quiz-06",
      "type": "code-output",
      "question": "Given this traceparent header, what is the trace_id?",
      "code": "traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01",
      "language": "text",
      "options": [
        "00",
        "0af7651916cd43dd8448eb211c80319c",
        "b7ad6b7169203331",
        "01"
      ],
      "answer": 1,
      "explanation": "The traceparent format is: VERSION-TRACE_ID-PARENT_SPAN_ID-TRACE_FLAGS. The trace_id is the 32-character hex string (128 bits) that uniquely identifies the entire trace.",
      "hint": "The trace_id is the longest component in the header."
    },
    {
      "id": "opentelemetry-quiz-07",
      "type": "flashcard",
      "question": "What are the three types of metric instrument types in OpenTelemetry and when would you use each?",
      "answer": "**Counter**: Cumulative value that only increases (e.g., total requests, errors)\n\n**Gauge**: Point-in-time value that can go up or down (e.g., CPU usage, memory, queue depth)\n\n**Histogram**: Distribution of values with configurable buckets (e.g., request durations, response sizes)"
    },
    {
      "id": "opentelemetry-quiz-08",
      "type": "drag-drop",
      "question": "Arrange these OpenTelemetry Collector processors in the recommended order for a production pipeline:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "memory_limiter",
        "batch",
        "attributes",
        "filter"
      ],
      "correctOrder": [0, 3, 2, 1],
      "explanation": "Best practice order: memory_limiter (prevent OOM first), filter (drop unwanted data early), attributes (enrich/modify), batch (optimize export last)."
    },
    {
      "id": "opentelemetry-quiz-09",
      "type": "mcq",
      "question": "What is the key difference between head-based and tail-based sampling?",
      "options": [
        "Head-based is more expensive than tail-based",
        "Head-based decides at trace start; tail-based decides after trace completion",
        "Tail-based can only sample errors",
        "Head-based requires the OTel Collector"
      ],
      "answer": 1,
      "explanation": "Head-based sampling makes the decision at trace start (root span), while tail-based sampling waits until the trace is complete to make a decision based on criteria like errors, latency, or attributes.",
      "hint": "Think about when the sampling decision is made."
    },
    {
      "id": "opentelemetry-quiz-10",
      "type": "multiple-select",
      "question": "Which are valid use cases for the transform processor?",
      "options": [
        "Redacting PII from attributes",
        "Replacing dynamic path segments with placeholders",
        "Creating new collector instances",
        "Removing sensitive fields like passwords",
        "Normalizing attribute names"
      ],
      "answers": [0, 1, 3, 4],
      "explanation": "The transform processor uses OTTL to modify telemetry data: redacting PII, sanitizing URLs, removing credentials, and normalizing formats. It cannot create collector instances.",
      "hint": "The transform processor modifies data, not infrastructure."
    },
    {
      "id": "opentelemetry-quiz-11",
      "type": "true-false",
      "question": "Zero-code instrumentation requires modifying application source code to add OpenTelemetry support.",
      "answer": false,
      "explanation": "Zero-code (automatic) instrumentation attaches an agent at runtime without modifying application code. For example, Java uses `-javaagent:opentelemetry-javaagent.jar`.",
      "hint": "The name 'zero-code' is descriptive of its approach."
    },
    {
      "id": "opentelemetry-quiz-12",
      "type": "code-completion",
      "question": "Complete the Python code to create a new span:",
      "instruction": "Fill in the missing method call",
      "codeTemplate": "from opentelemetry import trace\n\ntracer = trace.get_tracer(__name__)\n\nwith tracer._____(\"process_order\"):\n    process_payment()\n    update_inventory()",
      "answer": "start_as_current_span",
      "caseSensitive": true,
      "acceptedAnswers": ["start_as_current_span"],
      "explanation": "The `start_as_current_span` method creates a new span and sets it as the current span within the context manager."
    },
    {
      "id": "opentelemetry-quiz-13",
      "type": "mcq",
      "question": "What is the purpose of exemplars in OpenTelemetry?",
      "options": [
        "To provide example configurations",
        "To link specific trace examples to aggregated metrics",
        "To demonstrate best practices",
        "To generate sample telemetry data"
      ],
      "answer": 1,
      "explanation": "Exemplars link specific trace examples to aggregated metrics, enabling direct navigation from a metric alert to the actual trace that caused it. This enables faster root cause analysis.",
      "hint": "Think about bridging metrics and traces."
    },
    {
      "id": "opentelemetry-quiz-14",
      "type": "fill-blank",
      "question": "The W3C Trace Context standard uses the ____ header to transmit trace context between services.",
      "answer": "traceparent",
      "caseSensitive": true,
      "explanation": "The traceparent header is the required W3C Trace Context header containing VERSION-TRACE_ID-PARENT_SPAN_ID-TRACE_FLAGS. The optional tracestate header allows vendor-specific data.",
      "hint": "It combines 'trace' with the relationship to the caller."
    },
    {
      "id": "opentelemetry-quiz-15",
      "type": "multiple-select",
      "question": "Which deployment patterns are valid for OpenTelemetry Collector?",
      "options": [
        "Agent Pattern (sidecar/DaemonSet)",
        "Gateway Pattern (centralized cluster)",
        "Hybrid Pattern (agent + gateway)",
        "Mesh Pattern (service mesh integration)"
      ],
      "answers": [0, 1, 2],
      "explanation": "The three documented deployment patterns are: Agent (collector alongside app), Gateway (centralized collector cluster), and Hybrid (agents for basic batching, gateway for heavy processing).",
      "hint": "Three patterns are explicitly documented."
    },
    {
      "id": "opentelemetry-quiz-16",
      "type": "flashcard",
      "question": "What is the spanmetrics connector and what RED metrics does it generate?",
      "answer": "**Spanmetrics Connector**: Generates metrics from trace spans (replaces deprecated spanmetrics processor).\n\n**RED Metrics Generated:**\n- **R**ate: `calls_total` (total call count)\n- **E**rrors: Error counts by status code\n- **D**uration: `duration_milliseconds_sum/count`\n\nDimensions include: service, operation, status_code"
    },
    {
      "id": "opentelemetry-quiz-17",
      "type": "mcq",
      "question": "What happens when `otel.bsp.max.export.batch.size` is larger than `otel.bsp.max.queue.size`?",
      "options": [
        "The collector automatically adjusts the values",
        "The exporter will fail to start",
        "It won't be able to form a batch of that size",
        "Spans will be dropped immediately"
      ],
      "answer": 2,
      "explanation": "If max.export.batch.size is larger than the queue size, the batch span processor won't be able to form a batch of that size because there aren't enough spans in the queue.",
      "hint": "Think about the relationship between queue capacity and batch size."
    },
    {
      "id": "opentelemetry-quiz-18",
      "type": "true-false",
      "question": "The tracestate header is required for W3C Trace Context propagation.",
      "answer": false,
      "explanation": "Only the traceparent header is required. The tracestate header is optional and allows vendors to add proprietary information without breaking the standard.",
      "hint": "One header is mandatory, the other is optional."
    },
    {
      "id": "opentelemetry-quiz-19",
      "type": "drag-drop",
      "question": "Arrange these components in the order data flows through the OpenTelemetry architecture:",
      "instruction": "Drag to arrange in the correct data flow order",
      "items": [
        "Observability Backend",
        "Application (Traces/Metrics/Logs)",
        "OTLP Protocol",
        "OTel Collector"
      ],
      "correctOrder": [1, 2, 3, 0],
      "explanation": "Data flows: Application generates telemetry → OTLP transmits it → Collector processes it → Backend stores/visualizes it."
    },
    {
      "id": "opentelemetry-quiz-20",
      "type": "mcq",
      "question": "Which processor should you use to prevent memory overload in the OTel Collector?",
      "options": [
        "batch",
        "filter",
        "memory_limiter",
        "attributes"
      ],
      "answer": 2,
      "explanation": "The memory_limiter processor prevents memory overload by dropping data when memory usage exceeds configured limits. It should be placed first in the processor chain.",
      "hint": "The processor name directly describes its function."
    },
    {
      "id": "opentelemetry-quiz-21",
      "type": "code-output",
      "question": "What does trace_flags value '01' indicate in a traceparent header?",
      "code": "traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
      "language": "text",
      "options": [
        "Trace is version 1",
        "Trace is not sampled",
        "Trace is sampled (being recorded)",
        "First span in the trace"
      ],
      "answer": 2,
      "explanation": "Trace flags '01' means the trace is sampled (being recorded). '00' would mean not sampled. This is an 8-bit flag field.",
      "hint": "The flag indicates the sampling decision."
    },
    {
      "id": "opentelemetry-quiz-22",
      "type": "multiple-select",
      "question": "What are the benefits of using the OpenTelemetry Collector over direct export from applications?",
      "options": [
        "Decouples telemetry generation from export",
        "Enables multi-backend export",
        "Reduces load on applications",
        "Provides data buffering and retry logic",
        "Eliminates the need for instrumentation"
      ],
      "answers": [0, 1, 2, 3],
      "explanation": "The Collector provides decoupling, centralized processing, reduced app load, multi-backend export, and buffering/retry. It does NOT eliminate the need for instrumentation.",
      "hint": "Four of these are actual benefits mentioned in the documentation."
    },
    {
      "id": "opentelemetry-quiz-23",
      "type": "flashcard",
      "question": "Explain the difference between the attributes processor and the transform processor.",
      "answer": "**Attributes Processor**: Simple operations on attributes\n- insert, update, delete, hash\n- Extract values with patterns\n- Good for basic attribute management\n\n**Transform Processor**: Advanced transformations using OTTL\n- Complex regex replacements\n- Conditional logic with 'where' clauses\n- Cross-field operations\n- Truncation, case changes\n- More powerful but more complex syntax"
    },
    {
      "id": "opentelemetry-quiz-24",
      "type": "fill-blank",
      "question": "The Target Allocator in the OpenTelemetry Operator distributes ____ scrape targets across multiple collector instances.",
      "answer": "Prometheus",
      "caseSensitive": false,
      "explanation": "The Target Allocator discovers Prometheus scrape targets (ServiceMonitors, PodMonitors) and distributes them evenly across collector instances for load balancing.",
      "hint": "It relates to a popular metrics collection system."
    },
    {
      "id": "opentelemetry-quiz-25",
      "type": "true-false",
      "question": "In a hybrid deployment pattern, agents handle heavy processing while gateways perform basic batching.",
      "answer": false,
      "explanation": "It's the opposite: In a hybrid pattern, agents handle basic batching (lightweight) while the gateway performs expensive processing like tail sampling and enrichment.",
      "hint": "Think about where you'd want to concentrate compute-intensive tasks."
    },
    {
      "id": "opentelemetry-quiz-26",
      "type": "mcq",
      "question": "Which scrape job collects container-level resource usage metrics and is embedded in the Kubelet?",
      "options": [
        "kube-state-metrics",
        "node_exporter",
        "cadvisor",
        "kubelet"
      ],
      "answer": 2,
      "explanation": "cAdvisor (Container Advisor) is embedded in the Kubelet and collects container-level resource usage metrics. It's scraped from `https://<node>:10250/metrics/cadvisor`.",
      "hint": "Its name suggests container-level monitoring."
    },
    {
      "id": "opentelemetry-quiz-27",
      "type": "code-completion",
      "question": "Complete the YAML to configure a filter processor that excludes health check endpoints:",
      "instruction": "Fill in the attribute name to filter on",
      "codeTemplate": "processors:\n  filter:\n    traces:\n      span:\n        - 'attributes[\"_____\"] == \"/health\"'",
      "answer": "http.url",
      "caseSensitive": true,
      "acceptedAnswers": ["http.url"],
      "explanation": "The http.url attribute contains the URL path being accessed. Filtering on this attribute allows excluding health check endpoints from traces."
    },
    {
      "id": "opentelemetry-quiz-28",
      "type": "multiple-select",
      "question": "Which of these are valid resource detectors in OpenTelemetry?",
      "options": [
        "env (environment variables)",
        "kubernetes",
        "ec2 (AWS)",
        "azure",
        "gcp (Google Cloud)"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "The documented resource detectors include env, kubernetes, ec2, gcp, and docker. Azure is not mentioned in the provided documentation.",
      "hint": "Four detectors are explicitly listed in the documentation."
    },
    {
      "id": "opentelemetry-quiz-29",
      "type": "flashcard",
      "question": "What is context propagation and why is it essential for distributed tracing?",
      "answer": "**Context Propagation**: The mechanism that passes trace metadata (trace_id, span_id) between services via HTTP headers.\n\n**Why Essential:**\n- Without it, each service creates disconnected, independent spans\n- Enables linking all spans from a single request into one trace\n- Provides end-to-end visibility across distributed systems\n- Allows reconstruction of the complete request journey\n\n**Transmitted via**: W3C traceparent header"
    },
    {
      "id": "opentelemetry-quiz-30",
      "type": "mcq",
      "question": "What is the default value for `otel.bsp.max.export.batch.size`?",
      "options": [
        "128",
        "256",
        "512",
        "1024"
      ],
      "answer": 2,
      "explanation": "The default max export batch size is 512 spans. Recommended range is 512-2048 depending on span size.",
      "hint": "It's a power of 2 between 256 and 1024."
    },
    {
      "id": "opentelemetry-quiz-31",
      "type": "true-false",
      "question": "Histograms perform server-side quantile calculation while Summaries perform client-side quantile calculation.",
      "answer": true,
      "explanation": "Histograms use configurable buckets for server-side quantile calculation and can be aggregated across dimensions. Summaries pre-calculate quantiles (p50, p90, p99) on the client side and cannot be aggregated.",
      "hint": "One can be aggregated, the other cannot."
    }
  ]
}
{{< /quiz >}}
