# Fiber Doctor 🩺

A structural analysis diagnostic and educational CLI utility for Nervos CKB Fiber Network Node operations.

`fiber-doctor` is a command-line tool designed to help developers and node operators diagnose issues, understand errors, and monitor the health of their Fiber nodes on the CKB network.

## Installation

```bash
npm install -g fiber-doctor
```

## Configuration

The CLI communicates with your Fiber node via its RPC endpoint. By default, it attempts to connect to `http://127.0.0.1:8227`.

You can override this by setting the `FIBER_RPC_URL` environment variable:

```bash
export FIBER_RPC_URL=http://your-node-ip:8227
```

## Usage

The `fiber-doctor` CLI provides several commands to inspect your node.

### `diagnose`

Execute a real-time status and health scan of the running Fiber node architecture. This command provides a quick overview of your node's status, channel metrics, and any flagged alerts.

**Usage:**
```bash
fiber-doctor diagnose
```

**Example Output:**
```
⚡ Running Suite on Core Node Protocol Endpoint: http://127.0.0.1:8227

--- Node Health Report ---
Node Status:  ✔ Running
Channels:     1 open, 0 pending
Alerts Flagged: None
Health Score: 100/100

✔ All evaluated runtime primitives conform to networking specifications!
```

### `explain`

Translate and explain recent low-level Fiber errors into plain English. This is useful for understanding why a payment failed.

**Usage:**
```bash
# Explain the last failed payment
fiber-doctor explain --last-error

# Explain a failure by payment hash
fiber-doctor explain --payment-hash <hash>
```

### `report`

Generate a structured Markdown diagnostic report named `fiber-report.md`. This file is saved in your current working directory and is useful for logging or creating GitHub issues.

**Usage:**
```bash
fiber-doctor report
```