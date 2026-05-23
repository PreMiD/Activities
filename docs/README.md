# PreMiD Activity Development Documentation

This directory contains the documentation for PreMiD Activity Development, built with [VitePress](https://vitepress.dev/).

## Development

To start the development server:

```bash
cd docs
npm install
npm run dev
```

This will start a local development server at `http://localhost:5173/`.

## Building

To build the documentation for production:

```bash
cd docs
npm run build
```

This will generate static files in the `.vitepress/dist` directory.

## Structure

- `.vitepress/`: VitePress configuration
- `v1/`: Documentation for API version 1 (current)
  - `guide/`: Getting started guides and tutorials
  - `api/`: API reference documentation
  - `examples/`: Example code for different types of activities
- `v2/`: Documentation for API version 2 (coming soon)

## Versioning

The documentation is versioned to support different API versions:

- **v1**: Current stable API used for all activities in the PreMiD store
- **v2**: Next generation API currently in development

Each version has its own directory structure with separate guides, API references, and examples. This allows us to maintain documentation for multiple API versions simultaneously, making it easier for developers to find information relevant to the API version they're using.

### Versioned Documentation Structure

The documentation follows this versioning structure:

```
docs/
├── v1/
│   ├── guide/
│   ├── api/
│   └── examples/
└── v2/
    ├── guide/
    ├── api/
    └── examples/
```

This structure mirrors how activities themselves are versioned in the PreMiD repository, where an activity can support multiple API versions simultaneously using a similar directory structure:

```
websites/
├── E/
│   └── Example/
│       ├── v1/
│       │   ├── metadata.json
│       │   └── presence.ts
│       └── v2/
│           ├── metadata.json
│           └── presence.ts
```

The versioning structure is inspired by the approach used in the wxt documentation, which provides a clean and intuitive way to navigate between different versions.

## Contributing

If you'd like to contribute to the documentation, please:

1. Fork the repository
2. Create a new branch for your changes
3. Make your changes
4. Submit a pull request

Please make sure to follow the existing style and structure of the documentation.
