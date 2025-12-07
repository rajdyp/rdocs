---
title: System Internals
linkTitle: System Internals
type: docs
weight: 2
prev: /linux
next: /linux/03-advanced-topics
---
# 

## 1. The Linux Kernel

The kernel is the core of the Linux operating system, managing hardware and providing services to applications.

### Kernel Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Linux Kernel                          │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │          Process Management                        │  │
│  │  • Process scheduling (CPU allocation)             │  │
│  │  • Process creation and termination                │  │
│  │  • Inter-process communication (IPC)               │  │
│  │  • Context switching                               │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │          Memory Management                         │  │
│  │  • Virtual memory management                       │  │
│  │  • Page allocation and deallocation                │  │
│  │  • Memory mapping                                  │  │
│  │  • Swap space management                           │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │          File System Management                    │  │
│  │  • File operations (open, read, write, close)      │  │
│  │  • Directory management                            │  │
│  │  • File system types (ext4, xfs, btrfs)            │  │
│  │  • Virtual File System (VFS) layer                 │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │          Device Management                         │  │
│  │  • Device drivers                                  │  │
│  │  • Character and block devices                     │  │
│  │  • Device file system (/dev)                       │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │          Network Stack                             │  │
│  │  • Protocol implementation (TCP/IP)                │  │
│  │  • Socket interface                                │  │
│  │  • Network device drivers                          │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### System Calls: The Kernel Interface

System calls are the programming interface between user space and kernel space.

**How System Calls Work:**

```
User Application
      │
      │ 1. Call library function (e.g., printf)
      ▼
┌─────────────┐
│   glibc     │
└─────────────┘
      │
      │ 2. Invoke system call (e.g., write)
      ▼
┌─────────────┐
│   Kernel    │  3. Switch to kernel mode
│             │  4. Execute system call handler
│             │  5. Perform requested operation
│             │  6. Return result
└─────────────┘
      │
      │ 7. Return to user space
      ▼
User Application
```

**Common System Calls:**

| Category | System Call | Purpose |
|----------|-------------|---------|
| Process | `fork()` | Create new process |
| Process | `exec()` | Execute a program |
| Process | `exit()` | Terminate process |
| Process | `wait()` | Wait for child process |
| Process | `clone()` | Create child process (with options) |
| File | `open()` | Open file |
| File | `read()` | Read from file |
| File | `write()` | Write to file |
| File | `close()` | Close file |
| File | `stat()` | Get file status |
| Memory | `brk()` | Change data segment size |
| Memory | `mmap()` | Map files/devices into memory |
| Memory | `munmap()` | Unmap memory |
| Signal | `kill()` | Send signal to process |
| Signal | `signal()` | Set signal handler |

**System Call Overhead:**
- Mode switch (user → kernel → user)
- Context preservation
- Validation and security checks
- Actual operation execution

**Tracing system calls:**
```bash
# Trace all system calls
strace ls /home

# Count system calls
strace -c command

# Trace specific syscalls
strace -e open,read,write command

# Trace running process
strace -p PID
```

### Kernel vs User Mode

**User Mode (Ring 3):**
- Restricted CPU mode
- No direct hardware access
- Cannot execute privileged instructions
- Protected memory space
- Must use system calls for kernel services

**Kernel Mode (Ring 0):**
- Full CPU privileges
- Direct hardware access
- Can execute all instructions
- Access to all memory
- Runs kernel code and drivers

**Mode Switching:**
- System call: user → kernel → user
- Interrupt/Exception: forces switch to kernel
- Expensive operation (context preservation)

### Context Switching

When the kernel switches between processes:

```
┌──────────────────────────────────────────────────────────┐
│               Context Switch Process                     │
└──────────────────────────────────────────────────────────┘

Process A running
      │
      │ 1. Timer interrupt or I/O wait
      ▼
┌─────────────────────┐
│ Save Process A state│  • CPU registers
│                     │  • Program counter
│                     │  • Stack pointer
└─────────────────────┘  • Process state
      │
      ▼
┌─────────────────────┐
│  Select Process B   │  Scheduler decision
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│ Restore Process B   │  • Load saved registers
│ state               │  • Set program counter
│                     │  • Switch memory context
└─────────────────────┘
      │
      ▼
Process B running
```

**Context switch includes:**
- Save current process state
- Update process control block (PCB)
- Select next process (scheduler)
- Load new process state
- Switch virtual memory context (page tables)
- Flush CPU caches (expensive!)

**Viewing context switches:**
```bash
# Per-process context switches
pidstat -w 1

# System-wide
vmstat 1                # "cs" column
sar -w 1 5              # Context switch rate
```

## 2. Process Management Deep Dive

### Process Lifecycle

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          Process Lifecycle                               │
└──────────────────────────────────────────────────────────────────────────┘

    [NEW]
      │
      │ Process created via fork()
      ▼
  [READY/RUNNABLE]  <──────────────────────────────────────┐
      │             <────────────┐                         │
      │ Scheduler selects        │ Time slice expired      │ 
      ▼                          │ or preempted            │ back to READY
  [RUNNING]                      │                         │
      │                          │                         │
      ├──────────────────────────┘                         │
      │                                                    │
      ├─> Waiting for I/O ──> [SLEEPING] ──> I/O complete ─┘
      │                   
      │
      └─> exit() called ───> [ZOMBIE] ───> parent wait() ──> [TERMINATED]
                                │
                                └─> Cleaned up by kernel
```

### Process Creation: fork() and exec()

**The fork() System Call:**

Creates a duplicate of the calling process:

```
Parent Process (PID: 1234)
      │
      │ 1. fork() system call
      ▼
┌─────────────────────────────────────┐
│         Kernel Creates Copy         │
└─────────────────────────────────────┘
      │
      ├──────────────────┬──────────────────┐
      ▼                  ▼                  ▼
Parent Process    Child Process       Return Values
(PID: 1234)       (PID: 5678)        Parent: returns child PID (5678)
                                     Child: returns 0
      │                  │
      │                  │ 2. exec() system call (optional)
      │                  ▼
      │            ┌──────────────────┐
      │            │ Replace process  │
      │            │ with new program │
      │            └──────────────────┘
      │                  │
      │                  ▼
      │            New Program Running
      │            (still PID: 5678)
      │                  │
      │                  │ Program exits
      │                  ▼
      │            [ZOMBIE STATE]
      │                  │
      │ 3. wait() to     │
      │    collect exit  │
      │    status        │
      <──────────────────┘
      │
      ▼
Child fully cleaned up
```

**Example: fork() in C:**
```c
#include <stdio.h>
#include <unistd.h>

int main() {
    pid_t pid = fork();

    if (pid < 0) {
        // Fork failed
        perror("fork failed");
    } else if (pid == 0) {
        // Child process
        printf("Child: PID=%d, Parent PID=%d\n", getpid(), getppid());
    } else {
        // Parent process
        printf("Parent: PID=%d, Child PID=%d\n", getpid(), pid);
        wait(NULL);  // Wait for child to finish
    }

    return 0;
}
```

**The exec() Family:**

Replaces current process with new program:
- `execl()`, `execv()`, `execle()`, `execve()`, `execlp()`, `execvp()`
- Does NOT create new process
- Replaces process image
- PID remains same
- If successful, never returns

### Process Scheduling

The scheduler decides which process runs and when.

**Linux Scheduler: Completely Fair Scheduler (CFS)**

```
┌──────────────────────────────────────────────────────────┐
│           Completely Fair Scheduler (CFS)                │
└──────────────────────────────────────────────────────────┘

Goal: Give each process fair share of CPU time

Red-Black Tree (sorted by virtual runtime):

            Process C (vruntime: 50)
           /                        \
    Process A                    Process E
    (vruntime: 20)              (vruntime: 80)
         \                       /
       Process B            Process D
       (vruntime: 30)      (vruntime: 60)

Scheduler always picks leftmost node (lowest vruntime)
→ Process A runs next

After running, vruntime increases
→ Process moved to appropriate position in tree
```

**Scheduling policies:**

1. **SCHED_NORMAL (CFS)**: Default for normal processes
2. **SCHED_BATCH**: For batch/background jobs (lower priority)
3. **SCHED_IDLE**: Very low priority
4. **SCHED_FIFO**: Real-time, first-in-first-out
5. **SCHED_RR**: Real-time, round-robin
6. **SCHED_DEADLINE**: Real-time, deadline-based

**Nice values:**
- Range: -20 (highest priority) to +19 (lowest priority)
- Default: 0
- Affects CPU time allocation

```bash
# View process priority
ps -eo pid,ni,pri,cmd

# Set nice value
nice -n 10 command          # Start with nice +10
renice -n 5 -p PID          # Change running process

# Real-time priorities (requires root)
chrt -f 50 command          # FIFO, priority 50
chrt -r 50 command          # Round-robin, priority 50
```

### Program vs Process vs Thread

```
┌──────────────────────────────────────────────────────────────┐
│           Program vs Process vs Thread                       │
└──────────────────────────────────────────────────────────────┘

PROGRAM (Static Entity)
  │
  │  • Executable file stored on disk
  │  • Contains compiled code and data
  │  • Passive entity (just instructions)
  │  • Example: /usr/bin/firefox
  │
  │  When executed...
  │
  ▼
PROCESS (Dynamic Entity)
  │
  │  • Program in execution
  │  • Active entity with its own:
  │    - Memory space (code, data, stack, heap)
  │    - PID (Process ID)
  │    - System resources (file descriptors, etc.)
  │    - At least one thread of execution
  │
  │  Can create multiple threads...
  │
  ▼
THREADS (Lightweight Processes)
  │
  │  • Multiple execution paths within same process
  │  • Share process resources:
  │    - Same memory space (code, data, heap)
  │    - Same file descriptors
  │    - Same PID (but unique Thread IDs - TID)
  │  • Each thread has its own:
  │    - Stack
  │    - Registers
  │    - Program counter
  │
  └─ Enable concurrent execution within one process
```

**Process Memory Layout:**

```
High Memory
    ┌─────────────────┐
    │  Kernel Space   │  (only accessible in kernel mode)
    ├─────────────────┤ ← 0xC0000000 (on 32-bit)
    │                 │
    │     Stack       │  ↓ grows downward
    │                 │    (local variables, function calls)
    ├─────────────────┤
    │                 │
    │   (unused)      │
    │                 │
    ├─────────────────┤
    │     Heap        │  ↑ grows upward
    │                 │    (dynamic memory: malloc, new)
    ├─────────────────┤
    │  BSS Segment    │  (uninitialized static variables)
    ├─────────────────┤
    │  Data Segment   │  (initialized static variables)
    ├─────────────────┤
    │  Code/Text      │  (executable instructions)
    └─────────────────┘
Low Memory (0x00000000)
```

### Zombie and Orphan Processes

#### Zombie Process

A terminated process that still has an entry in the process table:

```
┌──────────────────────────────────────────────────────────────┐
│                   Zombie Process                             │
└──────────────────────────────────────────────────────────────┘

Parent Process                    Child Process
(PID: 1000)                      (PID: 2000)
    │                                 │
    │  fork()                         │
    │─────────────────────────────────→ Created
    │                                 │
    │                                 │ Running...
    │                                 │
    │                                 │ exit() called
    │                                 ▼
    │                            [ZOMBIE STATE]
    │                                 │
    │                       • Process terminated
    │                       • Resources freed
    │  Parent not calling   • BUT entry in process table remains
    │  wait() yet           • Waiting for parent to read exit status
    │                       • Shows as <defunct> in ps
    │                                 │
    │  wait() called                  │
    │◄────────────────────────────────┘
    │                                 │
    │  Reads exit status              ▼
    │                            [REMOVED]
    │                       Process table entry cleared
    ▼
Parent continues
```

**Why zombies exist:**
- Preserve exit status for parent
- Maintain process accounting
- Prevent PID reuse before parent checks

**Identifying zombies:**
```bash
# Find zombie processes
ps aux | grep 'Z'
ps aux | grep '<defunct>'

# Count zombies
ps aux | awk '$8=="Z" {print}' | wc -l

# With parent PID
ps -eo pid,ppid,stat,cmd | grep '^Z'
```

**Cleaning up zombies:**

You cannot kill zombies directly (they're already dead). Solutions:

1. **Signal parent to reap:**
   ```bash
   kill -SIGCHLD <parent_pid>
   ```

2. **Kill parent process:**
   ```bash
   # Parent dies → init/systemd adopts zombie → automatically reaped
   kill <parent_pid>
   ```

3. **Fix the parent program:**
   - Parent should call `wait()` or `waitpid()`
   - Or handle `SIGCHLD` signal

#### Orphan Process

A process whose parent has terminated:

```
┌──────────────────────────────────────────────────────────────┐
│                   Orphan Process                             │
└──────────────────────────────────────────────────────────────┘

Parent Process                    Child Process
(PID: 1000)                      (PID: 2000)
    │                                 │
    │  fork()                         │
    │─────────────────────────────────> Created
    │                                 │
    │                                 │ Running...
    │  Parent exits!                  │
    ▼                                 │
[TERMINATED]                          │
                                      │
                              ┌───────┘
                              │
                              ▼
                    ORPHAN - PPID changes
                              │
                              │ Adopted by init/systemd
                              ▼
                    New PPID: 1 (systemd)
                              │
                              │ Continues running normally
                              │
                              │ When it exits...
                              ▼
                         systemd calls wait()
                              │
                              ▼
                      Cleaned up properly
                      (No zombie!)
```

**Orphans are NOT a problem:**
- Adopted by init/systemd (PID 1)
- Run normally
- Properly cleaned up when they exit

### Signals

Software interrupts for inter-process communication.

**Signal Flow:**

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            Signal Mechanism                              │
└──────────────────────────────────────────────────────────────────────────┘

Sender                              Receiver Process
(User, Process, Kernel)             (PID: 1234)
     │                                    │
     │  kill -TERM 1234                   │
     │  (Send SIGTERM)                    │
     │────────────────────────────────────> Signal queued
                                          │
                                          │ Kernel delivers signal
                                          ▼
                                    ┌──────────────┐
                                    │ What to do?  │
                                    └──────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
              Default Action      Ignore Signal      Custom Handler
                    │                     │                     │
                    │                     │                     │
              ┌─────┴──────┐    ┌─────────────────┐  ┌─────────────────┐
              │ Terminate  │    │ Signal discarded│  │ Execute function│
              │ or Core    │    │ Process continues  │ then continue   │
              │ Dump, etc. │    │ as if nothing   │  └─────────────────┘
              └────────────┘    │ happened        │
                                └─────────────────┘
```

**Common Signals:**

| Signal | Number | Default | Description | Can Catch? |
|--------|--------|---------|-------------|------------|
| `SIGHUP` | 1 | Terminate | Hangup (terminal closed) | Yes |
| `SIGINT` | 2 | Terminate | Interrupt (Ctrl+C) | Yes |
| `SIGQUIT` | 3 | Core dump | Quit (Ctrl+\\) | Yes |
| `SIGKILL` | 9 | Terminate | **Force kill** | **NO** |
| `SIGSEGV` | 11 | Core dump | Segmentation fault | Yes |
| `SIGTERM` | 15 | Terminate | Graceful termination | Yes |
| `SIGCHLD` | 17 | Ignore | Child terminated/stopped | Yes |
| `SIGCONT` | 18 | Continue | Continue if stopped | Yes |
| `SIGSTOP` | 19 | Stop | **Force stop** | **NO** |
| `SIGTSTP` | 20 | Stop | Stop (Ctrl+Z) | Yes |
| `SIGUSR1` | 10 | Terminate | User-defined | Yes |
| `SIGUSR2` | 12 | Terminate | User-defined | Yes |

**Uncatchable signals:**
- `SIGKILL` (9): Immediate termination (cannot be blocked, caught, or ignored)
- `SIGSTOP` (19): Immediate stop (cannot be blocked, caught, or ignored)

This ensures you can always terminate or stop a process from outside.

### Inter-Process Communication (IPC)

Processes need to communicate and synchronize:

**IPC Mechanisms:**

1. **Pipes**
   ```bash
   # Anonymous pipe (shell)
   ls | grep ".txt"

   # Named pipe (FIFO)
   mkfifo mypipe
   echo "data" > mypipe &    # Writer (blocks until reader)
   cat < mypipe              # Reader
   ```

2. **Signals**
   ```bash
   kill -USR1 PID           # Send user-defined signal
   ```

3. **Message Queues**
   - System V message queues
   - POSIX message queues
   - Allow structured messages

4. **Shared Memory**
   - Fastest IPC (no copying)
   - Processes share memory region
   - Need synchronization (semaphores)

5. **Semaphores**
   - Synchronization primitive
   - Control access to shared resources
   - System V vs POSIX

6. **Sockets**
   - Network or local (Unix domain sockets)
   - Bidirectional communication
   - Most flexible

**Viewing IPC resources:**
```bash
# System V IPC
ipcs                    # All IPC resources
ipcs -q                 # Message queues
ipcs -m                 # Shared memory
ipcs -s                 # Semaphores

# Remove IPC resource
ipcrm -m <shmid>        # Shared memory
ipcrm -q <msqid>        # Message queue
```

## 3. Memory Management

### Virtual Memory Concepts

Linux uses virtual memory to:
- Isolate processes (security)
- Allow processes larger than physical RAM
- Simplify memory management
- Enable memory overcommit

**Virtual vs Physical Memory:**

```
┌──────────────────────────────────────────────────────────────┐
│            Virtual Memory Architecture                       │
└──────────────────────────────────────────────────────────────┘

Process 1                Process 2                Process 3
Virtual Memory          Virtual Memory           Virtual Memory
┌────────────┐         ┌────────────┐           ┌────────────┐
│ 0xFFFFFFFF │         │ 0xFFFFFFFF │           │ 0xFFFFFFFF │
├────────────┤         ├────────────┤           ├────────────┤
│   Stack    │         │   Stack    │           │   Stack    │
├────────────┤         ├────────────┤           ├────────────┤
│    Heap    │         │    Heap    │           │    Heap    │
├────────────┤         ├────────────┤           ├────────────┤
│   Data     │         │   Data     │           │   Data     │
├────────────┤         ├────────────┤           ├────────────┤
│   Code     │         │   Code     │           │   Code     │
└────────────┘         └────────────┘           └────────────┘
│ 0x00000000 │         │ 0x00000000 │           │ 0x00000000 │
      │                      │                        │
      │                      │                        │
      └──────────────┬───────┴────────────┬───────────┘
                     │                    │
                     │  MMU (Memory       │
                     │  Management Unit)  │
                     │  + Page Tables     │
                     │                    │
                     ▼                    ▼
           ┌─────────────────────────────────────┐
           │      Physical Memory (RAM)          │
           ├─────────────────────────────────────┤
           │  Frame 0  │  Frame 1  │  Frame 2    │
           │  Process1 │  Process2 │  Process3   │
           ├───────────┼───────────┼─────────────┤
           │  Frame 3  │  Frame 4  │  Frame 5    │
           │  Kernel   │  Process1 │  Free       │
           └─────────────────────────────────────┘
```

**Key concepts:**
- Each process has own virtual address space (0x00000000 to 0xFFFFFFFF on 32-bit)
- Virtual addresses mapped to physical addresses by MMU
- Pages: Virtual memory divided into fixed-size pages (usually 4KB)
- Frames: Physical memory divided into frames (same size as pages)
- Page tables: Store virtual-to-physical mappings

### Address Spaces

**32-bit address space:**
```
4 GB total
├─ 3 GB: User space (0x00000000 - 0xBFFFFFFF)
└─ 1 GB: Kernel space (0xC0000000 - 0xFFFFFFFF)
```

**64-bit address space:**
```
256 TB total (48-bit addressing)
├─ 128 TB: User space (0x0000000000000000 - 0x00007FFFFFFFFFFF)
└─ 128 TB: Kernel space (0xFFFF800000000000 - 0xFFFFFFFFFFFFFFFF)
```

### Paging

**Page Table Structure:**

```
Virtual Address (32-bit example):
┌─────────────┬─────────────┬──────────────┐
│   Page Dir  │  Page Table │   Offset     │
│   (10 bits) │  (10 bits)  │  (12 bits)   │
└─────────────┴─────────────┴──────────────┘
     │              │              │
     │              │              └─> Offset within page (0-4095)
     │              └─> Index into page table
     └─> Index into page directory

Translation:
1. Use page directory index → find page table
2. Use page table index → find physical frame number
3. Add offset → physical address
```

**Page Fault:**

Occurs when accessing a page not in physical memory:

```
Process accesses virtual address
      │
      ▼
┌─────────────────┐
│ MMU checks      │
│ page table      │
└─────────────────┘
      │
      ├─ Page present? ─> YES ─> Access memory
      │
      └─ NO ─> Page Fault!
              │
              ▼
        ┌──────────────────┐
        │ Kernel handles   │
        │ page fault       │
        └──────────────────┘
              │
              ├─> Invalid access? ─> SIGSEGV (crash)
              │
              └─> Valid access
                  │
                  ├─> In swap? ─> Load from swap (major fault)
                  │
                  └─> Not allocated? ─> Allocate new page (minor fault)
                      │
                      ▼
                Update page table
                      │
                      ▼
                Retry instruction
```

### Memory Allocation

**User Space Allocation:**

```c
// Allocate on heap
void *ptr = malloc(1024);         // Request 1KB
free(ptr);                        // Release

// Alternative: mmap
void *ptr = mmap(NULL, 4096, PROT_READ | PROT_WRITE,
                 MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
munmap(ptr, 4096);
```

**Behind the scenes:**
1. `malloc()` uses `brk()` for small allocations (< 128KB typically)
2. `malloc()` uses `mmap()` for large allocations
3. Kernel doesn't allocate physical memory until first access (lazy allocation)
4. Page fault on first access → physical page allocated

**Kernel Space Allocation:**
- `kmalloc()`: Small, physically contiguous
- `vmalloc()`: Large, virtually contiguous
- Slab allocator: Object caching (efficient for frequent alloc/free)

### Swapping

When physical memory is full, pages moved to swap space (disk):

```
┌───────────────────────────────────────────────────────────────┐
│                    Swapping Process                           │
└───────────────────────────────────────────────────────────────┘

     Physical Memory (RAM) Full
              │
              ▼
┌──────────────────────────────┐
│ Kernel selects victim page   │  (LRU - Least Recently Used)
└──────────────────────────────┘
              │
              ▼
┌──────────────────────────────┐
│ Write page to swap space     │  (disk partition or file)
└──────────────────────────────┘
              │
              ▼
┌──────────────────────────────┐
│ Mark page table entry        │  (present = 0, swap location)
│ as "not present"             │
└──────────────────────────────┘
              │
              ▼
┌──────────────────────────────┐
│ Free physical frame          │  (available for other use)
└──────────────────────────────┘

Later, if process accesses swapped page:
  → Page fault
  → Load from swap (major page fault - slow!)
  → Update page table
```

**Swap thrashing:**
- System spends more time swapping than executing
- Occurs when working set > physical memory
- Solution: Add RAM or reduce workload

### Memory Usage Monitoring

**View memory usage:**
```bash
# Overview
free -h
#               total    used    free    shared  buff/cache  available
# Mem:          16Gi     8.0Gi   2.0Gi   500Mi   6.0Gi       7.0Gi
# Swap:         8.0Gi   1.0Gi   7.0Gi

# Detailed statistics
vmstat 1 5                          # Every second, 5 times
# Shows: swap in/out, memory allocation, page faults

# Process memory
ps aux --sort=-%mem | head -10      # Top memory consumers
pmap -x PID                         # Memory map of process
smem                                # Per-process accurate memory

# Detailed info
cat /proc/meminfo
```

**Memory metrics:**
- **Total**: Total physical RAM
- **Used**: Used RAM (total - free - buff/cache)
- **Free**: Completely unused RAM
- **Shared**: Shared memory (tmpfs, etc.)
- **Buff/Cache**: Buffers and cache (can be reclaimed)
- **Available**: Memory available for new applications

**Important**: Linux uses available RAM for caching. "Used" memory includes cache, which is reclaimable!

### OOM Killer

Out-Of-Memory Killer terminates processes when system runs out of memory:

```
System runs out of memory
      │
      ▼
┌────────────────────────┐
│ Kernel invokes         │
│ OOM Killer             │
└────────────────────────┘
      │
      ▼
┌────────────────────────┐
│ Score each process     │  Based on:
│ (oom_score)            │  • Memory usage
│                        │  • Runtime
└────────────────────────┘  • Priority
      │
      ▼
┌────────────────────────┐
│ Select highest score   │
│ (biggest culprit)      │
└────────────────────────┘
      │
      ▼
┌────────────────────────┐
│ Send SIGKILL           │
│ to selected process    │
└────────────────────────┘
      │
      ▼
 Memory freed
```

**View/set OOM scores:**
```bash
# View OOM scores
cat /proc/[PID]/oom_score                          # Current score
cat /proc/[PID]/oom_score_adj                      # Adjustment (-1000 to 1000)

# Protect from OOM killer
echo -1000 | sudo tee /proc/[PID]/oom_score_adj    # Never kill

# Make more likely to be killed
echo 1000 | sudo tee /proc/[PID]/oom_score_adj

# Check OOM killer logs
dmesg | grep -i 'killed process'
journalctl -k | grep -i 'out of memory'
```

## 4. File Systems Internals

### Virtual File System (VFS)

The VFS is an abstraction layer that provides a unified interface to different file system types.

**VFS Architecture:**

```
┌────────────────────────────────────────────────────────────┐
│                Virtual File System (VFS)                   │
└────────────────────────────────────────────────────────────┘

User Space
    │
    │ System calls: open(), read(), write(), etc.
    ▼
┌────────────────────────────────────────────────────────────┐
│                   VFS Layer                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Common interface for all file systems               │  │
│  │  - File operations (struct file_operations)          │  │
│  │  - Inode operations (struct inode_operations)        │  │
│  │  - Dentry operations (struct dentry_operations)      │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
    │
    ├─> ext4 implementation
    ├─> xfs implementation
    ├─> btrfs implementation
    ├─> nfs implementation
    └─> tmpfs implementation
```

**Key VFS concepts:**

**1. Inode (Index Node):**
- Represents a file or directory
- Contains metadata (not the filename!)
- Permissions, ownership, timestamps
- Pointers to data blocks
- Each file has exactly one inode

**2. Dentry (Directory Entry):**
- Maps filename to inode
- Cache of name → inode mappings
- Speeds up path resolution

**3. Superblock:**
- Contains filesystem metadata
- Block size, total blocks, free blocks
- Magic number (filesystem type identifier)
- Mount state

**4. File:**
- Represents an open file
- Points to dentry (filename) and inode (metadata)
- Current file position
- Access mode (read/write/append)

### Inode Structure

```
Inode #12345
┌────────────────────────────────────────┐
│ Metadata                               │
├────────────────────────────────────────┤
│ Mode: -rw-r--r-- (0644)                │
│ Owner: UID 1000, GID 1000              │
│ Size: 4567 bytes                       │
│ Links: 1 (hard link count)             │
│ Timestamps:                            │
│   - Access time (atime)                │
│   - Modification time (mtime)          │
│   - Change time (ctime)                │
├────────────────────────────────────────┤
│ Data Block Pointers                    │
├────────────────────────────────────────┤
│ Direct blocks (12 pointers)            │
│   Block 1: 5000                        │
│   Block 2: 5001                        │
│   ...                                  │
│   Block 12: 5011                       │
├────────────────────────────────────────┤
│ Indirect block pointer                 │
│   → Points to block of pointers        │
├────────────────────────────────────────┤
│ Double indirect pointer                │
│   → Points to block of indirect ptrs   │
├────────────────────────────────────────┤
│ Triple indirect pointer                │
│   → For very large files               │
└────────────────────────────────────────┘
```

**Inode operations:**
```bash
# View inode number
ls -i filename
# Output: 12345 filename

# View detailed inode information
stat filename

# Find files by inode
find / -inum 12345

# Check inode usage
df -i                    # Inode usage per filesystem
```

### File System Types

**ext4 (Fourth Extended File System):**
- Default on many Linux distributions
- Journaling filesystem
- Maximum file size: 16 TB
- Maximum volume size: 1 EB
- Extents (contiguous blocks for large files)
- Delayed allocation
- Backward compatible with ext3, ext2

**XFS:**
- High-performance journaling filesystem
- Designed for large files and volumes
- Maximum file size: 8 EB
- Maximum volume size: 8 EB
- Excellent scalability
- Delayed allocation
- Cannot shrink (only grow)

**Btrfs (B-tree File System):**
- Modern copy-on-write filesystem
- Built-in snapshots and cloning
- Subvolumes
- RAID support
- Checksumming (data integrity)
- Online resizing (grow/shrink)
- Compression

**Comparison:**

| Feature | ext4 | XFS | Btrfs |
|---------|------|-----|-------|
| **Journaling** | Yes | Yes | CoW (no journal) |
| **Snapshots** | No | No | Yes (built-in) |
| **Compression** | No | No | Yes |
| **Checksums** | No | No | Yes |
| **Online Resize** | Grow only | Grow only | Grow/shrink |
| **RAID** | No | No | Yes (built-in) |
| **Maturity** | Very mature | Mature | Maturing |
| **Best For** | General use | Large files | Advanced features |

### Journaling

Journaling prevents filesystem corruption during crashes.

**How journaling works:**

```
┌──────────────────────────────────────────────────────────────┐
│               Journaling Process                             │
└──────────────────────────────────────────────────────────────┘

Without Journaling:
1. Update inode
2. Update data blocks        ← CRASH HERE
3. Update directory entry    ✗ Filesystem inconsistent!

With Journaling:
1. Write operation to journal (log)
2. Mark journal entry as complete
3. Apply changes to filesystem (commit)
4. Mark journal entry as applied
   ↓
   If crash occurs:
   - During step 1-2: Journal incomplete, discard
   - During step 3-4: Replay journal on next boot
   Result: Filesystem remains consistent!
```

**Journal modes:**

**1. Journal (full)**
- Metadata + data written to journal
- Safest but slowest
- Rarely used

**2. Ordered (default)**
- Only metadata journaled
- Data written before metadata
- Good balance

**3. Writeback**
- Only metadata journaled
- Data written anytime
- Fastest but less safe

### File Operations Flow

```
┌──────────────────────────────────────────────────────────────┐
│          File Read Operation Flow                            │
└──────────────────────────────────────────────────────────────┘

User Process: read(fd, buffer, size)
      │
      ▼
┌──────────────────┐
│ VFS read()       │  Check permissions, file position
└──────────────────┘
      │
      ▼
┌──────────────────┐
│ Page Cache       │  Check if data already cached
└──────────────────┘
      │
      ├─> Cache hit ──> Copy to user buffer ──> Return
      │
      └─> Cache miss
          │
          ▼
    ┌──────────────────┐
    │ Filesystem read  │  ext4/xfs/btrfs specific
    └──────────────────┘
          │
          ▼
    ┌──────────────────┐
    │ Block layer      │  Request blocks from disk
    └──────────────────┘
          │
          ▼
    ┌──────────────────┐
    │ I/O scheduler    │  Optimize disk access
    └──────────────────┘
          │
          ▼
    ┌──────────────────┐
    │ Device driver    │  Issue commands to hardware
    └──────────────────┘
          │
          ▼
    ┌──────────────────┐
    │ Physical disk    │  Read sectors
    └──────────────────┘
          │
          ▼
      Data returns through same path
          │
          ▼
    Store in page cache for future reads
          │
          ▼
    Copy to user buffer
          │
          ▼
      Return to user process
```

### Page Cache

The page cache speeds up file I/O by caching file data in RAM.

```
┌──────────────────────────────────────────────────────────────┐
│                   Page Cache                                 │
└──────────────────────────────────────────────────────────────┘

      Physical Memory (RAM)
┌─────────────────────────────────────┐
│  Free Memory: 2 GB                  │
├─────────────────────────────────────┤
│  Application Memory: 4 GB           │
├─────────────────────────────────────┤
│  Page Cache: 10 GB                  │  ← Caches file data
│  ├─ /var/log/syslog                 │
│  ├─ /home/user/document.txt         │
│  ├─ /usr/bin/firefox                │
│  └─ ... (recently accessed files)   │
└─────────────────────────────────────┘

Benefits:
- Subsequent reads are from RAM (fast!)
- Writes can be buffered and batched
- Kernel automatically manages cache size
- Cache is "free memory" (reclaimed when needed)
```

**Viewing page cache:**
```bash
# Memory usage (note buff/cache)
free -h
#               total    used    free    buff/cache   available
# Mem:          16Gi     4.0Gi   2.0Gi   10.0Gi       11.5Gi

# Page cache for specific file
vmtouch -v filename

# Clear page cache (usually not needed!)
sync                                        # Flush dirty pages first
echo 3 | sudo tee /proc/sys/vm/drop_caches  # Clear all caches
```

### Filesystem Maintenance

**Checking filesystem integrity:**
```bash
# Check filesystem (must be unmounted or read-only)
sudo fsck /dev/sda1              # Check and repair
sudo fsck -n /dev/sda1           # Check only (no repairs)
sudo fsck -y /dev/sda1           # Auto-repair (dangerous!)

# Filesystem-specific tools
sudo e2fsck /dev/sda1            # ext4
sudo xfs_repair /dev/sda1        # XFS
sudo btrfs check /dev/sda1       # Btrfs
```

**Tuning filesystem parameters:**
```bash
# ext4 parameters
sudo tune2fs -l /dev/sda1        # Show parameters
sudo tune2fs -c 30 /dev/sda1     # Check every 30 mounts
sudo tune2fs -i 180d /dev/sda1   # Check every 180 days
sudo tune2fs -m 1 /dev/sda1      # Reserve 1% for root (default 5%)

# XFS parameters
sudo xfs_info /dev/sda1          # Show filesystem info
sudo xfs_growfs /dev/sda1        # Grow XFS filesystem

# Btrfs operations
sudo btrfs filesystem show       # Show btrfs filesystems
sudo btrfs filesystem usage /    # Detailed usage
sudo btrfs scrub start /         # Verify data integrity
```

## 5. The Boot Process

Understanding the boot sequence from power-on to login prompt.

### Complete Boot Sequence

```
┌──────────────────────────────────────────────────────────────┐
│               Linux Boot Process with Systemd                │
└──────────────────────────────────────────────────────────────┘

1. Power On
   │
   ▼
2. BIOS/UEFI
   ├─ Power-On Self Test (POST)
   ├─ Initialize hardware (CPU, RAM, etc.)
   ├─ Detect boot devices
   └─ Load boot loader from disk
   │
   ▼
3. Boot Loader (GRUB)
   ├─ Display boot menu
   ├─ Load kernel image (vmlinuz)
   ├─ Load initial RAM disk (initramfs/initrd)
   └─ Pass control to kernel with parameters
   │
   ▼
4. Linux Kernel
   ├─ Decompress and load into memory
   ├─ Initialize kernel subsystems
   │  ├─ Memory management
   │  ├─ Process scheduler
   │  └─ Device drivers (built-in)
   ├─ Mount initramfs as temporary root
   └─ Execute /init from initramfs
   │
   ▼
5. initramfs (Early Userspace)
   ├─ Load essential drivers (storage, filesystem)
   ├─ Detect and configure root filesystem
   ├─ Switch to real root filesystem (pivot_root)
   └─ Execute systemd (PID 1)
   │
   ▼
6. systemd (PID 1)
   ├─ Read systemd configuration
   ├─ Determine default target (multi-user or graphical)
   ├─ Start system services in parallel
   │  ├─→ udev (device manager)
   │  ├─→ journald (logging)
   │  ├─→ systemd-logind (login management)
   │  ├─→ Network services
   │  └─→ Other system daemons
   ├─ Mount filesystems (/home, /var, etc.)
   ├─ Activate swap
   └─ Reach target (multi-user.target or graphical.target)
   │
   ▼
7. Login Prompt
   ├─ Console (getty) for multi-user.target
   └─ Display Manager (GDM, SDDM) for graphical.target
   │
   ▼
8. User Session
```

### BIOS vs UEFI

**Legacy BIOS:**
```
┌──────────────────────────────────────────┐
│ BIOS Boot Process                        │
├──────────────────────────────────────────┤
│ 1. BIOS reads MBR (first 512 bytes)      │
│ 2. MBR contains stage 1 bootloader       │
│ 3. Stage 1 loads stage 2 (GRUB)          │
│ 4. GRUB loads kernel                     │
└──────────────────────────────────────────┘

Limitations:
- MBR limited to 2 TB disks
- Maximum 4 primary partitions
- 16-bit real mode initially
```

**UEFI (Unified Extensible Firmware Interface):**
```
┌──────────────────────────────────────────┐
│ UEFI Boot Process                        │
├──────────────────────────────────────────┤
│ 1. UEFI firmware                         │
│ 2. EFI System Partition (ESP)            │
│ 3. Boot loader (GRUB or direct)          │
│ 4. Load kernel                           │
└──────────────────────────────────────────┘

Advantages:
- GPT partition table (>2 TB disks)
- Secure Boot support
- Faster boot times
- Network boot capabilities
- Graphical interface
```

### GRUB (Grand Unified Bootloader)

**GRUB configuration:**
```bash
# Main configuration file
/boot/grub/grub.cfg              # Auto-generated, don't edit!

# User configuration
/etc/default/grub                # Edit this

# Custom entries
/etc/grub.d/                     # Scripts that generate grub.cfg
```

**Common GRUB parameters:**
```bash
# /etc/default/grub
GRUB_DEFAULT=0                               # Default menu entry
GRUB_TIMEOUT=5                               # Menu timeout in seconds
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"    # Kernel parameters
GRUB_CMDLINE_LINUX=""                        # Additional parameters

# Apply changes
sudo update-grub                             # Debian/Ubuntu
sudo grub2-mkconfig -o /boot/grub2/grub.cfg  # RHEL/Fedora
```

**Kernel boot parameters:**
```bash
# Common parameters passed to kernel:
quiet                # Suppress most boot messages
splash               # Show splash screen
ro                   # Mount root filesystem read-only initially
root=/dev/sda1       # Root filesystem location
root=UUID=xxxx       # Root by UUID (preferred)
init=/bin/bash       # Alternative init (recovery)
single               # Single-user mode (runlevel 1)
3                    # Multi-user mode (runlevel 3)
5                    # Graphical mode (runlevel 5)
```

### initramfs (Initial RAM Filesystem)

**Purpose of initramfs:**
- Contains drivers needed to mount root filesystem
- Modular kernel support (load only needed drivers)
- Encrypted root filesystem support
- LVM/RAID support
- Network root filesystem (NFS, iSCSI)

**initramfs contents:**
```bash
# Extract initramfs (for inspection)
mkdir /tmp/initramfs
cd /tmp/initramfs
zcat /boot/initramfs-$(uname -r).img | cpio -idmv

# Contents:
/
├── bin/                    # Essential binaries
├── dev/                    # Device nodes
├── etc/                    # Configuration
├── init                    # Init script (executed by kernel)
├── lib/                    # Essential libraries
├── lib/modules/            # Kernel modules (drivers)
├── sbin/                   # System binaries
└── usr/                    # Additional utilities
```

**Rebuilding initramfs:**
```bash
# Debian/Ubuntu
sudo update-initramfs -u

# RHEL/Fedora
sudo dracut --force

# Arch
sudo mkinitcpio -P
```

### systemd Initialization

**systemd startup sequence:**

```
systemd (PID 1) starts
      │
      ▼
Read /etc/systemd/system.conf
      │
      ▼
Determine default target
systemctl get-default
├─> multi-user.target (text mode)
└─> graphical.target (GUI)
      │
      ▼
Parse unit dependencies
      │
      ▼
Start units in parallel (based on dependencies)
      │
      ├─> sysinit.target
      │   ├─ Mount filesystems (/etc/fstab)
      │   ├─ Activate swap
      │   ├─ fsck if needed
      │   └─ Set hostname
      │
      ├─> basic.target
      │   ├─ udev (device management)
      │   ├─ journald (logging)
      │   └─ Essential system services
      │
      ├─> multi-user.target
      │   ├─ Network services
      │   ├─ SSH server
      │   ├─ Cron
      │   └─ User services
      │
      └─> graphical.target (if GUI)
          └─ Display manager (GDM, SDDM, etc.)
```

**Viewing boot process:**
```bash
# Boot time analysis
systemd-analyze                  # Total boot time
systemd-analyze blame            # Time per service
systemd-analyze critical-chain   # Critical path
systemd-analyze plot > boot.svg  # Graphical timeline

# Boot logs
journalctl -b                    # This boot
journalctl -b -1                 # Previous boot
journalctl -b -p err             # Errors only
```

### Boot Troubleshooting

**Common boot issues:**

**1. Kernel panic:**
```
Symptoms: System halts with "Kernel panic" message
Causes:
  - Incorrect kernel parameters
  - Missing initramfs drivers
  - Corrupted filesystem
  - Hardware failure

Solutions:
  - Boot older kernel from GRUB menu
  - Check kernel parameters (root=, init=)
  - Rebuild initramfs
  - Check filesystem with fsck
```

**2. Cannot mount root:**
```
Symptoms: "Unable to mount root fs" error
Causes:
  - Wrong root= parameter
  - Missing filesystem driver in initramfs
  - Corrupted partition table

Solutions:
  - Verify root= parameter matches actual device
  - Check /etc/fstab for correct UUID/device
  - Rebuild initramfs with required drivers
  - Boot from live USB and repair
```

**3. Service failures:**
```
Symptoms: Boot hangs or services fail
Causes:
  - Dependency issues
  - Configuration errors
  - Resource problems

Solutions:
  - journalctl -xb (detailed boot log)
  - systemctl list-units --failed
  - systemctl status <service>
  - Boot to rescue target: systemd.unit=rescue.target
```

**Emergency boot modes:**
```bash
# Boot to emergency shell (minimal system)
# Add to kernel parameters:
systemd.unit=emergency.target

# Boot to rescue mode (more services)
systemd.unit=rescue.target

# Boot to root shell (no systemd)
init=/bin/bash
# Then:
mount -o remount,rw /
# Make repairs, then:
exec /sbin/init
```

## 6. Device Management

### Linux Device Model

**Device hierarchy:**

```
┌──────────────────────────────────────────────────────────────┐
│                  Linux Device Model                          │
└──────────────────────────────────────────────────────────────┘

           Kernel Device Model
                   │
         ┌─────────┴─────────┐
         │                   │
    Physical Bus        Virtual Devices
    (PCI, USB, etc.)    (loop, ram, etc.)
         │                   │
         ├─────┬─────┬───────┴───────┐
         │     │     │               │
      Device  Device Device        Device
      (sda)   (eth0) (input0)     (loop0)
         │
         └─> Represented in:
             ├─ /dev/ (device files)
             ├─ /sys/ (sysfs - device hierarchy)
             └─ /proc/ (legacy device info)
```

### Device Files (/dev)

Device files provide interface to hardware and pseudo-devices.

**Device file types:**

```
Character Devices (c):
- Stream-oriented (byte by byte)
- No buffering
- Examples: terminals, serial ports, random

Block Devices (b):
- Block-oriented (fixed-size blocks)
- Buffered
- Examples: hard drives, USB drives, CD-ROMs
```

**Viewing devices:**
```bash
ls -l /dev/

# Character devices
crw-rw-rw- 1 root tty     5, 0 Dec  5 10:00 /dev/tty
crw------- 1 root root    1, 3 Dec  5 10:00 /dev/null
crw-rw-rw- 1 root root    1, 8 Dec  5 10:00 /dev/random

# Block devices
brw-rw---- 1 root disk    8, 0 Dec  5 10:00 /dev/sda
brw-rw---- 1 root disk    8, 1 Dec  5 10:00 /dev/sda1
brw-rw---- 1 root cdrom  11, 0 Dec  5 10:00 /dev/sr0
```

**Device numbers:**
```
brw-rw---- 1 root disk  8, 0 Dec 5 10:00 /dev/sda
                        │  │
                        │  └─ Minor number (partition/device instance)
                        └─ Major number (driver type)

Major numbers identify driver:
  1 = RAM, memory devices
  3 = IDE hard drive
  8 = SCSI disk
 11 = CD-ROM
253 = Device mapper (LVM)
```

**Special devices:**
```bash
/dev/null        # Data sink (discard all writes)
/dev/zero        # Infinite zeros
/dev/random      # True random data (blocks if entropy low)
/dev/urandom     # Pseudo-random data (doesn't block)
/dev/full        # Always "full" (write fails with ENOSPC)
/dev/tty         # Controlling terminal
/dev/stdin       # Standard input (symlink to /proc/self/fd/0)
/dev/stdout      # Standard output
/dev/stderr      # Standard error
```

### sysfs (/sys)

sysfs exposes kernel device model to userspace.

**sysfs structure:**
```
/sys/
├── block/                      # Block devices
│   ├── sda/
│   │   ├── size                # Device size in blocks
│   │   ├── removable           # 0 = fixed, 1 = removable
│   │   ├── device/             # Symlink to physical device
│   │   └── queue/              # I/O scheduler parameters
│   └── loop0/
├── class/                      # Device classes
│   ├── net/                    # Network devices
│   │   ├── eth0/
│   │   │   ├── address         # MAC address
│   │   │   ├── mtu             # Maximum transmission unit
│   │   │   ├── operstate       # up/down
│   │   │   └── statistics/     # TX/RX counters
│   │   └── wlan0/
│   ├── power_supply/           # Batteries, AC adapters
│   │   └── BAT0/
│   │       ├── capacity        # Battery percentage
│   │       └── status          # Charging/Discharging
│   └── input/                  # Input devices (keyboard, mouse)
├── bus/                        # Bus types
│   ├── pci/                    # PCI devices
│   ├── usb/                    # USB devices
│   └── i2c/                    # I2C devices
├── devices/                    # Device hierarchy
│   └── pci0000:00/             # PCI bus
│       └── 0000:00:1f.2/       # PCI device
└── firmware/                   # Firmware information
    └── acpi/                   # ACPI tables
```

**Using sysfs:**
```bash
# Read device information
cat /sys/class/net/eth0/address               # MAC address
cat /sys/class/net/eth0/speed                 # Link speed (Mbps)
cat /sys/block/sda/size                       # Disk size (512-byte sectors)
cat /sys/class/power_supply/BAT0/capacity     # Battery level

# Modify device parameters
echo 1500 | sudo tee /sys/class/net/eth0/mtu  # Set MTU

# Find device information
udevadm info --query=all --name=/dev/sda
udevadm info --query=path --name=/dev/sda
```

### udev: Dynamic Device Management

udev manages device nodes dynamically, creating/removing them as hardware is added/removed.

**udev workflow:**

```
┌──────────────────────────────────────────────────────────────┐
│                   udev Process                               │
└──────────────────────────────────────────────────────────────┘

Hardware Event (device plugged in)
      │
      ▼
┌──────────────────┐
│  Kernel detects  │  Driver binds to device
│  new device      │  Information added to sysfs
└──────────────────┘
      │
      ▼
┌──────────────────┐
│  Kernel sends    │  uevent through netlink socket
│  uevent          │
└──────────────────┘
      │
      ▼
┌──────────────────┐
│  udevd receives  │  udev daemon listening
│  event           │
└──────────────────┘
      │
      ▼
┌──────────────────┐
│  Match rules     │  Check /etc/udev/rules.d/
│  in order        │  Check /lib/udev/rules.d/
└──────────────────┘
      │
      ▼
┌──────────────────┐
│  Execute actions │  - Create device node in /dev/
│                  │  - Set permissions/ownership
└──────────────────┘  - Create symlinks
      │               - Run programs
      ▼
Device ready for use
```

**udev rules:**

Location: `/etc/udev/rules.d/` (user rules) or `/lib/udev/rules.d/` (system rules)

**Example rule:**
```bash
# /etc/udev/rules.d/99-custom.rules

# Give specific USB device a predictable name
SUBSYSTEM=="net", ATTR{address}=="aa:bb:cc:dd:ee:ff", NAME="lan0"

# Set permissions for specific device
KERNEL=="ttyUSB0", MODE="0666", GROUP="dialout"

# Run script when device plugged in
ACTION=="add", SUBSYSTEM=="usb", ATTR{idVendor}=="1234", RUN+="/usr/local/bin/notify.sh"

# Create symlink for device
KERNEL=="sd?1", SUBSYSTEM=="block", ENV{ID_SERIAL}=="MyBackupDrive", SYMLINK+="backup"
```

**udev commands:**
```bash
# Reload udev rules
sudo udevadm control --reload-rules
sudo udevadm trigger

# Monitor udev events (real-time)
sudo udevadm monitor

# Test rule matching
sudo udevadm test /sys/class/net/eth0

# Device information
udevadm info /dev/sda
udevadm info --attribute-walk --name=/dev/sda  # Detailed attributes
```

### Hotplug and Coldplug

**Coldplug:**
- Devices present at boot time
- Detected during kernel initialization
- udev creates device nodes during boot

**Hotplug:**
- Devices added/removed while system running
- USB drives, network cards, etc.
- udev handles dynamically

**Example: USB drive hotplug:**
```bash
# Monitor kernel messages
dmesg -w

# In another terminal, plug in USB drive:
# Kernel messages:
usb 2-1: new high-speed USB device number 3 using xhci_hcd
usb 2-1: New USB device found, idVendor=1234, idProduct=5678
usb-storage 2-1:1.0: USB Mass Storage device detected
scsi 2:0:0:0: Direct-Access     Generic  USB3.0-CRW       1.00 PQ: 0 ANSI: 6
sd 2:0:0:0: Attached scsi generic sg1 type 0
sd 2:0:0:0: [sdb] 15667200 512-byte logical blocks: (8.02 GB/7.47 GiB)
sd 2:0:0:0: [sdb] Write Protect is off
sdb: sdb1
sd 2:0:0:0: [sdb] Attached SCSI removable disk

# Device is now /dev/sdb1
# udev may create additional symlinks in /dev/disk/by-*
ls -l /dev/disk/by-uuid/  # By UUID
ls -l /dev/disk/by-label/ # By label
ls -l /dev/disk/by-id/    # By hardware ID
```

## 7. Networking Stack

### Packet Flow Through Kernel

**Complete packet journey:**

```
┌──────────────────────────────────────────────────────────────┐
│          Packet Flow Through Linux Network Stack             │
└──────────────────────────────────────────────────────────────┘

RECEIVING A PACKET:

01. Physical Layer
    │  Network card receives electrical signals
    │  Converts to bits
    ▼
02. Network Card (NIC)
    │  DMA transfer to ring buffer in RAM
    │  Generate interrupt (or use NAPI polling)
    ▼
03. Interrupt Handler
    │  Minimal processing
    │  Schedule soft IRQ
    ▼
04. Soft IRQ (NET_RX_SOFTIRQ)
    │  Process packets from ring buffer
    ▼
05. Link Layer (Ethernet)
    │  Remove Ethernet header
    │  Check destination MAC address
    │  Determine protocol (IPv4, IPv6, ARP, etc.)
    ▼
06. Netfilter: PREROUTING
    │  iptables NAT/mangle/raw tables
    │  DNAT (destination NAT) happens here
    ▼
07. Routing Decision
    │  Is packet for local machine?
    │  ├─> YES: goto Local Input
    │  └─> NO: goto Forward
    ▼
LOCAL INPUT PATH:
08. Netfilter: INPUT
    │  iptables filter table
    │  Accept/drop decision
    ▼
09. Network Layer (IP)
    │  Remove IP header
    │  Checksum verification
    │  Determine upper protocol (TCP, UDP, ICMP)
    ▼
10. Transport Layer (TCP/UDP)
    │  Remove TCP/UDP header
    │  Checksum verification
    │  Find socket (based on port)
    ▼
11. Socket Buffer
    │  Store data in socket receive buffer
    │  Wake up waiting process
    ▼
12. Application
    │  read()/recv() system call
    │  Data copied to user space
    └─> Application processes packet

FORWARD PATH (if routing enabled):
08. Netfilter: FORWARD
    │  iptables filter table
    ▼
09. Routing Decision
    │  Determine outgoing interface
    ▼
    (Continue to Sending Path...)

SENDING A PACKET:

01. Application
    │  write()/send() system call
    ▼
02. Socket Layer
    │  Copy data from user space to kernel
    │  Create socket buffer (skb)
    ▼
03. Transport Layer (TCP/UDP)
    │  Add TCP/UDP header
    │  Calculate checksum
    │  Segment if needed (MSS)
    ▼
04. Network Layer (IP)
    │  Add IP header
    │  TTL, source/dest IP
    │  Calculate checksum
    ▼
05. Netfilter: OUTPUT
    │  iptables NAT/mangle/filter
    │  SNAT (source NAT) happens here
    ▼
06. Routing Decision
    │  Determine outgoing interface
    │  Determine next hop
    ▼
07. Netfilter: POSTROUTING
    │  iptables NAT/mangle
    │  Final SNAT/masquerading
    ▼
08. Link Layer (Ethernet)
    │  Add Ethernet header
    │  Determine destination MAC (ARP)
    ▼
09. Queue Discipline (qdisc)
    │  Traffic control/shaping
    │  Packet scheduling
    ▼
10. Device Driver
    │  DMA to network card buffer
    ▼
11. Network Card (NIC)
    │  Transmit packet
    │  Convert bits to electrical signals
    ▼
12. Physical Layer
    └─> Packet on the wire
```

### Netfilter and iptables

**Netfilter hooks:**

```
┌──────────────────────────────────────────────────────────────┐
│              Netfilter/iptables Packet Flow                  │
└──────────────────────────────────────────────────────────────┘

        Incoming Packet
              │
              ▼
       ┌────────────┐
       │ PREROUTING │  (NAT, mangle, raw)
       └────────────┘
              │
              ▼
         Routing Decision
              │
      ┌───────┴───────┐
      │               │
    Local           Forward
 Destination          │
      │               ▼
      │         ┌────────────┐
      │         │  FORWARD   │  (filter, mangle)
      │         └────────────┘
      │               │
      ▼               ▼
┌────────────┐  ┌────────────┐
│   INPUT    │  │POSTROUTING │  (NAT, mangle)
│  (filter,  │  └────────────┘
│   mangle)  │        │
└────────────┘        ▼
      │          Outgoing Packet
      ▼
  Local Process
      │
      ▼
┌────────────┐
│   OUTPUT   │  (filter, NAT, mangle, raw)
└────────────┘
      │
      ▼
┌────────────┐
│POSTROUTING │  (NAT, mangle)
└────────────┘
      │
      ▼
 Outgoing Packet
```

**iptables tables:**

1. **raw**: Connection tracking bypass
2. **mangle**: Packet alteration
3. **nat**: Network Address Translation
4. **filter**: Packet filtering (default)

**Example iptables rules:**
```bash
# View current rules
sudo iptables -L -v -n            # Filter table
sudo iptables -t nat -L -v -n     # NAT table

# Allow SSH
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow established connections
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Drop all other input
sudo iptables -P INPUT DROP

# NAT (masquerading for internet sharing)
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

# Port forwarding
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination 192.168.1.100:80
```

### Socket Layer

**Socket types:**

```
┌──────────────────────────────────────────────────────────────┐
│                   Socket Types                               │
└──────────────────────────────────────────────────────────────┘

SOCK_STREAM (TCP)
  ├─ Connection-oriented
  ├─ Reliable, ordered delivery
  ├─ Byte stream
  └─ Examples: HTTP, SSH, SMTP

SOCK_DGRAM (UDP)
  ├─ Connectionless
  ├─ Unreliable, unordered
  ├─ Message-oriented
  └─ Examples: DNS, DHCP, streaming

SOCK_RAW
  ├─ Direct access to IP layer
  ├─ Requires root privileges
  └─ Examples: ping (ICMP), traceroute

SOCK_PACKET (deprecated)
  └─ Use AF_PACKET instead

AF_UNIX (Unix Domain Sockets)
  ├─ Local IPC
  ├─ Faster than network sockets
  └─ Examples: Docker, X11, systemd
```

**Socket system calls:**
```c
// TCP Server
int sock = socket(AF_INET, SOCK_STREAM, 0);            // Create socket
bind(sock, (struct sockaddr*)&addr, sizeof(addr));     // Bind to address
listen(sock, 10);                                      // Listen (queue size 10)
int client = accept(sock, NULL, NULL);                 // Accept connection
recv(client, buffer, size, 0);                         // Receive data
send(client, data, size, 0);                           // Send data
close(client);                                         // Close connection

// TCP Client
int sock = socket(AF_INET, SOCK_STREAM, 0);
connect(sock, (struct sockaddr*)&addr, sizeof(addr));  // Connect to server
send(sock, data, size, 0);
recv(sock, buffer, size, 0);
close(sock);
```

### TCP Connection States

**Phase 1: Connection Establishment (3-Way Handshake)**

```
CLIENT SIDE:                           SERVER SIDE:

CLOSED                                 CLOSED
  │                                      │
  │ socket() + connect()                 │ socket() + bind() + listen()
  │                                      │
  ▼                                      ▼
SYN_SENT ──────────────────────────> LISTEN
  │         [SYN packet]                 │
  │                                      │
  │                                      ▼
  │                                   SYN_RCVD
  │         [SYN-ACK packet]             │
  │ <────────────────────────────────────┘
  │
  ▼
ESTABLISHED ─────────────────────────> ESTABLISHED
            [ACK packet]

Result: Both sides are now in ESTABLISHED state
```

**Phase 2: Data Transfer**

```
ESTABLISHED <────────────────────────> ESTABLISHED
    │          Data flows freely           │
    │          (send/recv calls)           │
    │                                      │
```

**Phase 3: Connection Termination (4-Way Handshake)**

```
ACTIVE CLOSER (calls close() first):   PASSIVE CLOSER (receives FIN):

ESTABLISHED                            ESTABLISHED
  │                                      │
  │ close()                              │
  │                                      │
  ▼                                      │
FIN_WAIT_1 ──────────────────────────>   │
  │         [FIN packet]                 │
  │                                      ▼
  │                                   CLOSE_WAIT
  │                                      │ (app still running)
  │         [ACK packet]                 │
  │ <────────────────────────────────────┘
  │                                      │
  ▼                                      │ close()
FIN_WAIT_2                               │
  │                                      ▼
  │                                   LAST_ACK
  │         [FIN packet]                 │
  │ <────────────────────────────────────┘
  │
  │         [ACK packet]
  │ ─────────────────────────────────> (CLOSED)
  │
  ▼
TIME_WAIT
  │ (wait 2×MSL = ~60-120 seconds)
  │
  ▼
CLOSED
```

**Summary of Key States:**

| State | Meaning |
|-------|---------|
| `CLOSED` | No connection exists |
| `LISTEN` | Server waiting for incoming connections |
| `SYN_SENT` | Client sent SYN, waiting for SYN-ACK |
| `SYN_RCVD` | Server received SYN, sent SYN-ACK, waiting for ACK |
| `ESTABLISHED` | Connection is open, data can flow |
| `FIN_WAIT_1` | Sent FIN, waiting for ACK |
| `FIN_WAIT_2` | Received ACK of FIN, waiting for peer's FIN |
| `CLOSE_WAIT` | Received FIN, waiting for app to close |
| `LAST_ACK` | Sent FIN, waiting for final ACK |
| `TIME_WAIT` | Waiting to ensure remote received ACK (2×MSL) |

**Viewing connections:**
```bash
# Connection states
ss -tan                          # TCP connections with state
netstat -tan                     # Legacy command

# Common states:
# ESTABLISHED - Active connection
# LISTEN - Waiting for connections
# SYN_SENT - Attempting to connect
# SYN_RECV - Received connection request
# FIN_WAIT_1/2 - Closing connection
# TIME_WAIT - Waiting for packets to expire
# CLOSE_WAIT - Remote closed, waiting for local close

# Count connections by state
ss -tan | awk '{print $1}' | sort | uniq -c
```

### Network Performance Parameters

**TCP tuning:**
```bash
# View current settings
sysctl -a | grep net.ipv4.tcp

# Socket buffer sizes (bytes)
net.core.rmem_max = 134217728             # Max receive buffer
net.core.wmem_max = 134217728             # Max send buffer
net.core.rmem_default = 212992            # Default receive
net.core.wmem_default = 212992            # Default send

# TCP buffer auto-tuning
net.ipv4.tcp_rmem = 4096 87380 6291456    # min default max
net.ipv4.tcp_wmem = 4096 16384 4194304

# Connection queue
net.core.somaxconn = 1024                 # Max queued connections
net.ipv4.tcp_max_syn_backlog = 2048       # SYN queue size

# TCP behavior
net.ipv4.tcp_fin_timeout = 30             # FIN_WAIT_2 timeout
net.ipv4.tcp_tw_reuse = 1                 # Reuse TIME_WAIT sockets
net.ipv4.tcp_keepalive_time = 600         # Keepalive probe interval
net.ipv4.tcp_slow_start_after_idle = 0    # Don't reduce cwnd when idle

# Congestion control
net.ipv4.tcp_congestion_control = cubic   # Algorithm (cubic, bbr, reno)
```

**Apply tuning:**
```bash
# Temporary
sudo sysctl -w net.core.somaxconn=4096

# Persistent
echo "net.core.somaxconn = 4096" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Key Insights

- **Everything connects**: Processes use memory, access filesystems, communicate over networks
- **Abstraction layers**: VFS unifies filesystems, sockets unify network protocols
- **Dynamic management**: udev manages devices, systemd manages services
- **Performance matters**: Understanding internals enables effective tuning

### Further Exploration

- Kernel source code: `https://kernel.org/`
- System call man pages: `man 2 syscall_name`
- Kernel documentation: `/usr/share/doc/linux-doc/`
- Performance analysis: `perf`, `ftrace`, `eBPF`
