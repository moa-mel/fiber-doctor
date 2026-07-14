# Fiber Doctor

`fiber-doctor` is a command-line diagnostic tool designed to run real-time health checks, generate reports, and explain errors for a running Fiber node.

## Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Build the project from the TypeScript source:
    ```bash
    npm run build
    ```

## Usage

The tool is run via the `fiber-doctor` command, which is made available in your path by the `bin` field in `package.json`.

### `diagnose`

Execute a real-time status and health scan of the running Fiber node. It provides an immediate summary of the node's operational status, channel health, and any flagged alerts.

```bash
fiber-doctor diagnose [options]
```

**Options:**

*   `--rpc-url <url>`: Specify the RPC URL of the Fiber node to connect to. Defaults to `http://127.0.0.1:8227`. This can also be set via the `FIBER_RPC_URL` environment variable.

**Example:**

```bash
fiber-doctor diagnose --rpc-url http://127.0.0.1:8227
```

### `report`

Generate a structured Markdown diagnostic report (`fiber-report.md`) suitable for sharing in logs or GitHub issues. This provides a more detailed, shareable version of the `diagnose` output.

```bash
fiber-doctor report
```

### `explain`

Translate and explain recent low-level Fiber errors into plain English. This is primarily used for diagnosing failed payments.

```bash
fiber-doctor explain [options]
```

**Options:**

*   `--last-error`: Analyze the most recent failed payment found in the node's history.
*   `--payment-hash <hash>`: Analyze a specific failed payment by its hash.