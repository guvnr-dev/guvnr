# MCP Tasks Feature Guide

This guide covers the MCP Tasks feature introduced in the November 2025 specification (2025-11-25).

## Overview

Tasks provide a new abstraction in MCP for tracking work being performed by an MCP server. Any request can be augmented with a task that allows clients to query its status and retrieve results asynchronously.

**Status**: Experimental (part of core protocol but not yet finalized)

## When to Use Tasks

Tasks are particularly helpful for:

| Use Case | Description |
|----------|-------------|
| Long-running data analysis | Processing hundreds of thousands of data points |
| Enterprise automation | Complex multi-step workflows |
| Code migration tools | Refactors and migrations running for minutes/hours |
| Test execution platforms | Streaming logs from long-running test suites |
| Deep research tools | Spawning multiple internal agents |

## Task Lifecycle

```
┌──────────┐    ┌─────────┐    ┌───────────────┐    ┌───────────┐
│  Create  │───▶│ Working │───▶│Input Required │───▶│ Completed │
│  Task    │    │         │    │   (optional)  │    │           │
└──────────┘    └─────────┘    └───────────────┘    └───────────┘
                     │                                    │
                     ▼                                    │
               ┌──────────┐                               │
               │  Failed  │                               │
               └──────────┘                               │
                     │                                    │
                     ▼                                    ▼
               ┌───────────┐                        ┌───────────┐
               │ Cancelled │                        │  Results  │
               └───────────┘                        │ Available │
                                                    └───────────┘
```

### Task States

| State | Description |
|-------|-------------|
| `working` | Task is actively being processed |
| `input_required` | Task needs additional input from client |
| `completed` | Task finished successfully |
| `failed` | Task encountered an error |
| `cancelled` | Task was cancelled by client |

## Key Capabilities

### 1. Active Polling

Clients can check the status of ongoing work at any time:

```json
{
  "method": "tasks/get",
  "params": {
    "taskId": "task-12345"
  }
}
```

### 2. Result Retrieval

Results of completed tasks are accessible after the request completes:

```json
{
  "method": "tasks/result",
  "params": {
    "taskId": "task-12345"
  }
}
```

### 3. Flexible Lifecycle Management

Tasks support proper lifecycle with:
- State transitions with validation
- Cancellation support
- Error handling with detailed messages
- Timeout management

### 4. Task Isolation

Proper security boundaries with session-based access control:
- Tasks are scoped to the creating session
- Cross-session task access is prevented
- Proper cleanup on session termination

## Implementation Patterns

### Creating a Long-Running Task

```python
from mcp.server import Server
from mcp.types import Task, TaskState

server = Server("my-server")

@server.tool()
async def analyze_large_dataset(dataset_url: str) -> Task:
    """Analyze a large dataset asynchronously."""

    # Create a task for long-running operation
    task = await server.create_task(
        name="dataset-analysis",
        description=f"Analyzing dataset from {dataset_url}"
    )

    # Start background processing
    asyncio.create_task(
        process_dataset(task.id, dataset_url)
    )

    # Return task handle immediately
    return task

async def process_dataset(task_id: str, url: str):
    """Background processing of dataset."""
    try:
        await server.update_task(task_id, state=TaskState.WORKING)

        # Long-running analysis...
        results = await perform_analysis(url)

        # Complete with results
        await server.complete_task(task_id, result=results)

    except Exception as e:
        await server.fail_task(task_id, error=str(e))
```

### Checking Task Status (Client)

```javascript
// Periodically poll for task status
async function waitForTask(client, taskId) {
  while (true) {
    const status = await client.request("tasks/get", { taskId });

    switch (status.state) {
      case "completed":
        return await client.request("tasks/result", { taskId });
      case "failed":
        throw new Error(status.error);
      case "cancelled":
        throw new Error("Task was cancelled");
      case "input_required":
        // Handle input request
        await handleInputRequired(client, taskId, status.inputSchema);
        break;
      default:
        // Still working, wait and retry
        await sleep(1000);
    }
  }
}
```

### Handling Input Required State

```python
@server.tool()
async def interactive_analysis(data: str) -> Task:
    """Analysis that may require user confirmation."""

    task = await server.create_task(name="interactive-analysis")

    # Start analysis
    preliminary_results = await analyze(data)

    if preliminary_results.needs_confirmation:
        # Request user input
        await server.request_input(
            task.id,
            prompt="Confirm deletion of 500 records?",
            schema={
                "type": "object",
                "properties": {
                    "confirmed": {"type": "boolean"}
                }
            }
        )
        return task  # Client will provide input

    await server.complete_task(task.id, result=preliminary_results)
    return task
```

## Integration with AI Excellence Framework

### Project Memory Server Enhancement

The Project Memory MCP server can be extended to support Tasks for:

1. **Bulk Decision Import** - Import large decision histories asynchronously
2. **Pattern Analysis** - Analyze codebase patterns over time
3. **Memory Export** - Export large memory databases

### Example: Async Memory Export

```python
@server.tool()
async def export_memory_async() -> Task:
    """Export all memory data asynchronously for large databases."""

    task = await server.create_task(
        name="memory-export",
        description="Exporting project memory database"
    )

    # Background export
    asyncio.create_task(perform_export(task.id))

    return task
```

## Best Practices

### 1. Use Tasks for Operations > 30 Seconds

```python
# Synchronous for fast operations
@server.tool()
async def get_recent_decisions(limit: int = 10):
    return await db.get_decisions(limit)

# Task-based for slow operations
@server.tool()
async def analyze_all_decisions() -> Task:
    # Could take minutes for large codebases
    return await create_analysis_task()
```

### 2. Provide Progress Updates

```python
async def long_running_task(task_id: str, items: List):
    for i, item in enumerate(items):
        await process(item)

        # Update progress
        await server.update_task(
            task_id,
            progress={
                "current": i + 1,
                "total": len(items),
                "message": f"Processing item {i + 1}/{len(items)}"
            }
        )
```

### 3. Clean Up on Cancellation

```python
async def cancellable_task(task_id: str):
    try:
        while not await server.is_task_cancelled(task_id):
            await do_work()
    except asyncio.CancelledError:
        await cleanup_resources()
        raise
```

### 4. Set Appropriate Timeouts

```python
task = await server.create_task(
    name="long-analysis",
    timeout_seconds=3600  # 1 hour max
)
```

## Limitations

Current limitations of the experimental Tasks feature:

1. **Not all clients support Tasks** - Check client capabilities first
2. **Result storage duration** - Results may be garbage collected after server-defined period
3. **No built-in persistence** - Task state is in-memory by default
4. **Session scoping** - Tasks are tied to the creating session

## Related Resources

- [MCP November 2025 Specification](https://modelcontextprotocol.io/specification/2025-11-25)
- [MCP Tasks Discussion](http://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/)
- [WorkOS MCP Spec Analysis](https://workos.com/blog/mcp-2025-11-25-spec-update)

## Migration Path

When Tasks become stable:

1. Identify long-running operations in your MCP server
2. Refactor to return Task handles
3. Implement progress updates
4. Add cancellation support
5. Test with clients that support Tasks

---

_Last Updated: January 2026_
_MCP Spec Version: 2025-11-25_
