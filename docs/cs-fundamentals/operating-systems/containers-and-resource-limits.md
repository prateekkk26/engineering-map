---
title: Containers and resource limits
summary: Namespaces and cgroups, not virtual machines — and the limits they impose are the reason your process was killed without a stack trace.
level: deep
minutes: 20
order: 5
tags: [operating-systems, containers, operations]

related:
  - cs-fundamentals/operating-systems/virtual-memory-and-the-memory-hierarchy
  - cs-fundamentals/operating-systems/scheduling-and-context-switching
  - cs-fundamentals/operating-systems/processes-memory-and-the-kernel-boundary

resources:
  - title: What even is a container?
    url: https://jvns.ca/blog/2016/10/10/what-even-is-a-container/
    source: Julia Evans
    type: article
    minutes: 25
    primary: true
  - title: cgroups(7)
    url: https://man7.org/linux/man-pages/man7/cgroups.7.html
    source: Linux man-pages
    type: docs
    minutes: 40
  - title: Managing resources for containers
    url: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
    source: Kubernetes
    type: docs
    minutes: 25
  - title: CPU limits and aggressive throttling
    url: https://engineering.indeedblog.com/blog/2019/12/unthrottled-fixing-cpu-limits-in-the-cloud/
    source: Indeed Engineering
    type: article
    minutes: 25
---

## In one line

A container is a normal Linux process with namespaces restricting what it can see and cgroups restricting what it can use — there is no guest kernel and no virtual machine.

## What it is

**Namespaces** provide isolation of view. A PID namespace makes the container's first process appear as PID 1 with no visibility of the host's processes. Mount, network, UTS, IPC, and user namespaces do the same for the filesystem, network interfaces, hostname, IPC objects, and UID mapping. **cgroups** provide limits on use — memory, CPU, block I/O, and process count. Together that is the whole mechanism. The kernel is shared, which is why containers start in milliseconds and why container escape is a kernel-level security concern in a way that VM escape is not.

The two limits that produce real incidents behave completely differently.

**Memory is a hard limit.** Exceed the cgroup memory limit and the kernel's OOM killer terminates the process immediately — `SIGKILL`, no handler, no stack trace, exit code 137, and in Kubernetes a status of `OOMKilled`. This is the failure that looks like a mysterious restart. The subtlety that catches runtimes: older JVMs and Node builds read the *host's* total memory rather than the cgroup limit, so a runtime sizes its heap for 64GB inside a 512MB container and gets killed on the first real workload. Set heap limits explicitly (`--max-old-space-size` for Node) rather than trusting auto-detection.

**CPU is a throttle, not a kill.** A CPU limit is implemented as a quota per 100ms period; using it up means the process is stopped until the next period. So an application under a CPU limit does not fail — it gets slower in a bursty, hard-to-read way, with latency spikes that look like network problems. The classic misconfiguration is a low CPU limit on a multi-threaded runtime: the quota is consumed by parallel threads in the first few milliseconds of every period, and the container spends most of its time frozen. Watch `container_cpu_cfs_throttled_seconds_total`.

Two more traps. `nproc` and `os.cpus()` often report host cores rather than the cgroup allocation, so default thread-pool and worker sizing is wrong inside containers. And PID 1 in a container has no default signal handlers and does not reap zombies, which is why `SIGTERM` can be ignored and shutdown takes the full grace period — fixed by an init shim like `tini` or by handling signals explicitly.

## Why it matters

Exit code 137 with no application error is one of the most common and most confusing production symptoms, and it has exactly one explanation. Requests and limits are also a routine engineering decision with an unintuitive shape — memory too low kills you, CPU too low silently throttles you — and getting the distinction right is the difference between a stable service and one with unexplained latency.

## Key points

- Containers are processes with namespaces for isolation and cgroups for limits; the host kernel is shared, so this is not virtualisation.
- Memory limits are enforced by killing the process with `SIGKILL` — exit 137, no cleanup, no stack trace.
- CPU limits throttle rather than kill, producing bursty latency that is easily misdiagnosed as a network or downstream problem.
- Runtimes that auto-size from host memory or host core count get it wrong inside a container; set heap and worker counts explicitly.
- CPU quota is consumed per 100ms period, so multi-threaded workloads can exhaust it early and freeze for most of each period.
- PID 1 in a container does not reap children or apply default signal handling, which breaks graceful shutdown unless handled.
- Requests drive scheduling and limits drive enforcement — setting them equal is what gives predictable behaviour.
- Copy-on-write image layers make container start cheap, but a large image still costs pull time on a cold node.
