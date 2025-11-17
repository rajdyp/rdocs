# rDocs

A comprehensive collection of technical study notes built with Hugo and the Hextra theme.

## Topics Covered

- **Kubernetes**: Container orchestration
- **Kubernetes Add-ons**: Extensions and tools
- **Service Mesh**: Microservices communication
- **Observability**: Metrics, logs, and traces
- **AWS**: Cloud computing services
- **Terraform**: Infrastructure as Code
- **GitOps**: Declarative deployment workflows
- **Linux**: System administration
- **Python**: Programming fundamentals and advanced concepts

## Local Development

### Prerequisites

- Hugo Extended (v0.112.0 or later)

### Running Locally

```bash
# Clone the repository
git clone https://github.com/rajdyp/notebook.git
cd notebook

# Initialize theme submodule
git submodule update --init --recursive

# Start development server
hugo server -D

# Build the site
hugo
```

The site will be available at `http://localhost:1313/notebook/`

## Deployment

This site is automatically deployed to GitHub Pages using GitHub Actions. Any push to the `main` branch triggers a new build and deployment.

## Contributing

These are personal study notes, but feel free to open an issue if you find any errors or have suggestions.

## License

Content is available for educational purposes.
