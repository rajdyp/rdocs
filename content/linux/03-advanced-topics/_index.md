---
title: Advanced Topics
linkTitle: Advanced Topics
type: docs
weight: 3
prev: /linux/02-system-internals
---

## 1. Shell Scripting

### Why Script?

Shell scripts automate repetitive tasks, system administration, and deployment workflows.

**Use cases:**
- System initialization and configuration
- Backup and maintenance tasks
- Log analysis and reporting
- CI/CD pipelines
- Infrastructure automation

### Script Structure

**Basic template:**
```bash
#!/bin/bash
# Script: backup.sh
# Description: Automated backup script
# Author: Your Name
# Date: 2024-12-05

set -euo pipefail  # Exit on error, undefined variables, pipe failures
IFS=$'\n\t'        # Set Internal Field Separator

# Configuration
BACKUP_DIR="/var/backups"
SOURCE_DIR="/home"
LOG_FILE="/var/log/backup.log"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Functions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

cleanup() {
    log "Cleanup on exit"
    # Cleanup code here
}

# Main logic
main() {
    trap cleanup EXIT
    log "Starting backup..."
    # Backup logic here
    log "Backup completed"
}

# Execute
main "$@"
```

**Shebang options:**
```bash
#!/bin/bash              # Bash-specific features
#!/bin/sh                # POSIX-compliant (portable)
#!/usr/bin/env bash      # Find bash in PATH (portable across systems)
```

### Variables and Quoting

```bash
# Variable assignment (no spaces around =)
NAME="value"
NUMBER=42

# Using variables
echo "$NAME"             # Preferred (prevents word splitting)
echo "${NAME}"           # Explicit (required for some cases)

# Special variables
$0                       # Script name
$1, $2, ..., $9          # Positional parameters
$@                       # All parameters as separate words
$*                       # All parameters as single word
$#                       # Number of parameters
$?                       # Exit status of last command
$$                       # Process ID of script
$!                       # Process ID of last background command

# Arrays
ARRAY=("item1" "item2" "item3")
echo "${ARRAY[0]}"       # First element
echo "${ARRAY[@]}"       # All elements
echo "${#ARRAY[@]}"      # Array length

# Command substitution
CURRENT_USER=$(whoami)
FILES=$(ls)
DATE=`date`              # Deprecated syntax

# Arithmetic
NUM=$((5 + 3))
((COUNT++))
RESULT=$((NUM * 2))

# String operations
${VAR:-default}          # Use default if VAR unset/null
${VAR:=default}          # Assign default if VAR unset/null
${VAR:?error}            # Error if VAR unset/null
${#VAR}                  # String length
${VAR:0:5}               # Substring (offset:length)
${VAR#pattern}           # Remove shortest match from start
${VAR##pattern}          # Remove longest match from start
${VAR%pattern}           # Remove shortest match from end
${VAR%%pattern}          # Remove longest match from end
${VAR/pattern/replace}   # Replace first match
${VAR//pattern/replace}  # Replace all matches
```

**Quoting:**
```bash
# Double quotes: Allow variable expansion
echo "Hello $NAME"

# Single quotes: Literal (no expansion)
echo 'Hello $NAME'       # Prints: Hello $NAME

# No quotes: Word splitting and globbing
echo $PATH               # Splits on IFS characters

# Best practice: Always quote variables
rm "$FILE"               # Safe
rm $FILE                 # Dangerous (word splitting)
```

### Control Flow

**Conditionals:**
```bash
# if-elif-else
if [ "$1" = "start" ]; then
    echo "Starting..."
elif [ "$1" = "stop" ]; then
    echo "Stopping..."
else
    echo "Unknown command"
fi

# Test operators
[[ -f file ]]               # File exists and is regular file
[[ -d dir ]]                # Directory exists
[[ -e path ]]               # Path exists (file or directory)
[[ -r file ]]               # File is readable
[[ -w file ]]               # File is writable
[[ -x file ]]               # File is executable
[[ -z "$VAR" ]]             # String is empty
[[ -n "$VAR" ]]             # String is not empty
[[ "$A" = "$B" ]]           # Strings equal
[[ "$A" != "$B" ]]          # Strings not equal
[[ "$A" < "$B" ]]           # String comparison (lexicographic)
[[ $NUM -eq 5 ]]            # Numeric equality
[[ $NUM -ne 5 ]]            # Numeric inequality
[[ $NUM -lt 5 ]]            # Less than
[[ $NUM -gt 5 ]]            # Greater than
[[ $NUM -le 5 ]]            # Less than or equal
[[ $NUM -ge 5 ]]            # Greater than or equal

# [[ ]] vs [ ]
[[ $VAR = "test" ]]         # Preferred (bash extended test)
[ "$VAR" = "test" ]         # POSIX compatible (requires quotes)

# Logical operators
[[ -f file && -r file ]]    # AND
[[ -f file || -d file ]]    # OR
[[ ! -f file ]]             # NOT

# Case statement
case "$1" in
    start)
        echo "Starting..."
        ;;
    stop)
        echo "Stopping..."
        ;;
    restart)
        echo "Restarting..."
        ;;
    *)
        echo "Usage: $0 {start|stop|restart}"
        exit 1
        ;;
esac
```

**Loops:**
```bash
# for loop - iterate over list
for FILE in *.txt; do
    echo "Processing $FILE"
    # Process file
done

# for loop - C-style
for ((i=0; i<10; i++)); do
    echo "Number: $i"
done

# for loop - range
for NUM in {1..10}; do
    echo "$NUM"
done

# while loop
COUNT=0
while [[ $COUNT -lt 10 ]]; do
    echo "Count: $COUNT"
    ((COUNT++))
done

# Read file line by line
while IFS= read -r LINE; do
    echo "Line: $LINE"
done < file.txt

# Infinite loop
while true; do
    echo "Running..."
    sleep 1
done

# Until loop (inverse of while)
until [[ -f /tmp/done ]]; do
    echo "Waiting..."
    sleep 5
done
```

### Functions

```bash
# Function definition
function backup_files() {
    local SOURCE="$1"
    local DEST="$2"

    echo "Backing up $SOURCE to $DEST"
    tar -czf "$DEST/backup_$(date +%Y%m%d).tar.gz" "$SOURCE"
}

# Alternative syntax
backup_files() {
    # Function body
}

# Call function
backup_files "/home" "/backup"

# Return values
check_file() {
    local FILE="$1"
    if [[ -f "$FILE" ]]; then
        return 0  # Success
    else
        return 1  # Failure
    fi
}

# Check return value
if check_file "/etc/passwd"; then
    echo "File exists"
fi

# Return string (via echo and command substitution)
get_timestamp() {
    echo "$(date +%Y%m%d_%H%M%S)"
}

TIMESTAMP=$(get_timestamp)
```

### Error Handling

```bash
# Exit on error
set -e                   # Exit if any command fails
set -u                   # Exit if undefined variable used
set -o pipefail          # Exit if any command in pipeline fails

# Combine them
set -euo pipefail

# Trap signals and errors
cleanup() {
    echo "Cleaning up..."
    rm -f /tmp/myfile.$$
}

trap cleanup EXIT        # Run cleanup on exit
trap cleanup INT TERM    # Run cleanup on Ctrl+C or kill

# Error handling pattern
if ! command arg1 arg2; then
    echo "Error: command failed" >&2
    exit 1
fi

# Or operator for error handling
command || { echo "Error: command failed" >&2; exit 1; }

# Check exit status
if grep -q "pattern" file; then
    echo "Pattern found"
else
    echo "Pattern not found"
fi

# Safer command execution
if [[ $# -lt 2 ]]; then
    echo "Usage: $0 <arg1> <arg2>" >&2
    exit 1
fi
```

### Text Processing

**grep - Search:**
```bash
grep "pattern" file.txt
grep -i "pattern" file           # Case-insensitive
grep -r "pattern" directory/     # Recursive
grep -n "pattern" file           # Show line numbers
grep -v "pattern" file           # Invert match (lines NOT matching)
grep -E "regex" file             # Extended regex
grep -A 3 "pattern" file         # Show 3 lines after
grep -B 3 "pattern" file         # Show 3 lines before
```

**sed - Stream editor:**
```bash
# Substitute
sed 's/old/new/' file            # Replace first occurrence on each line
sed 's/old/new/g' file           # Replace all occurrences
sed 's/old/new/gi' file          # Case-insensitive

# Delete lines
sed '/pattern/d' file            # Delete matching lines
sed '5d' file                    # Delete line 5
sed '5,10d' file                 # Delete lines 5-10

# Print lines
sed -n '/pattern/p' file         # Print only matching lines
sed -n '5,10p' file              # Print lines 5-10

# In-place editing
sed -i 's/old/new/g' file        # GNU sed
sed -i '' 's/old/new/g' file     # BSD sed (macOS)

# Multiple operations
sed -e 's/foo/bar/' -e 's/baz/qux/' file
```

**awk - Pattern scanning and processing:**
```bash
# Print columns
awk '{print $1}' file            # First column
awk '{print $1, $3}' file        # Columns 1 and 3
awk '{print $NF}' file           # Last column

# Field separator
awk -F: '{print $1}' /etc/passwd # Use : as delimiter

# Patterns
awk '/pattern/ {print $1}' file  # Print first column of matching lines
awk '$3 > 100' file              # Lines where column 3 > 100
awk 'NR==5' file                 # Print line 5
awk 'NR>=5 && NR<=10' file       # Lines 5-10

# Built-in variables
# NR - current line number
# NF - number of fields
# $0 - entire line

# Arithmetic
awk '{sum += $1} END {print sum}' file     # Sum first column
awk '{print $1 * 2}' file                  # Double first column

# Formatting
awk '{printf "%-10s %5d\n", $1, $2}' file
```

### Best Practices

1. **Use shellcheck**
   ```bash
   shellcheck script.sh
   ```

2. **Quote variables**
   ```bash
   # Good
   rm "$FILE"

   # Bad (dangerous)
   rm $FILE
   ```

3. **Use meaningful variable names**
   ```bash
   # Good
   BACKUP_DIR="/var/backups"

   # Bad
   BD="/var/backups"
   ```

4. **Check for errors**
   ```bash
   if ! command; then
       echo "Error" >&2
       exit 1
   fi
   ```

5. **Use functions for reusable code**
   ```bash
   check_root() {
       if [[ $EUID -ne 0 ]]; then
           echo "This script must be run as root" >&2
           exit 1
       fi
   }
   ```

6. **Use local variables in functions**
   ```bash
   my_function() {
       local VAR="value"  # Local to function
   }
   ```

7. **Handle cleanup**
   ```bash
   trap cleanup EXIT
   ```

### Real-World Example: System Backup Script

```bash
#!/bin/bash
# backup.sh - Automated system backup with rotation

set -euo pipefail

# Configuration
readonly BACKUP_DIR="/var/backups/system"
readonly SOURCE_DIRS=("/etc" "/home" "/var/www")
readonly RETENTION_DAYS=7
readonly LOG_FILE="/var/log/backup.log"

# Functions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

error() {
    log "ERROR: $*" >&2
    exit 1
}

check_root() {
    [[ $EUID -eq 0 ]] || error "Must run as root"
}

create_backup_dir() {
    mkdir -p "$BACKUP_DIR" || error "Failed to create backup directory"
}

perform_backup() {
    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/backup_$timestamp.tar.gz"

    log "Starting backup to $backup_file"

    if tar -czf "$backup_file" "${SOURCE_DIRS[@]}" 2>> "$LOG_FILE"; then
        log "Backup completed successfully"
        log "Backup size: $(du -h "$backup_file" | cut -f1)"
    else
        error "Backup failed"
    fi
}

rotate_backups() {
    log "Rotating old backups (keeping last $RETENTION_DAYS days)"
    find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
    log "Rotation completed"
}

cleanup() {
    log "Backup script finished"
}

main() {
    trap cleanup EXIT

    check_root
    create_backup_dir
    perform_backup
    rotate_backups
}

main "$@"
```

## 2. Kernel Modules and Parameters

### Loadable Kernel Modules

Kernel modules extend kernel functionality dynamically without rebooting.

**Module Architecture:**

```
┌──────────────────────────────────────────────────────────────┐
│                Kernel Module System                          │
└──────────────────────────────────────────────────────────────┘

        Linux Kernel (Core)
              │
              │ Module Interface
              │
    ┌─────────┼─────────┬─────────┬──────────┐
    │         │         │         │          │
    ▼         ▼         ▼         ▼          ▼
┌────────┐ ┌──────┐ ┌──────┐ ┌────────┐ ┌────────┐
│Network │ │ File │ │Device│ │ Sound  │ │ Other  │
│Modules │ │System│ │Driver│ │ Driver │ │Modules │
│(e1000) │ │(ntfs)│ │(usb) │ │(snd)   │ │        │
└────────┘ └──────┘ └──────┘ └────────┘ └────────┘
    │         │         │         │          │
    └─────────┴─────────┴─────────┴──────────┘
              │
        Dynamically loaded/unloaded
        without kernel reboot
```

**Module Management:**

```bash
# List loaded modules
lsmod                           # List all loaded modules
lsmod | grep module_name        # Check if specific module loaded

# Module information
modinfo module_name             # Show module details
modinfo -p module_name          # Show module parameters

# Load modules
sudo modprobe module_name       # Load module (+ dependencies)
sudo insmod module.ko           # Load specific .ko file (no deps)

# Unload modules
sudo modprobe -r module_name    # Unload module (+ unused deps)
sudo rmmod module_name          # Unload module (no deps check)

# Module dependencies
modprobe --show-depends module_name

# Search for modules
find /lib/modules/$(uname -r) -name "*.ko"
```

**Example: lsmod output:**
```
Module                  Size  Used by
nvidia               1234567  40
bluetooth             567890  15  bnep,btusb
snd_hda_intel          45678  3
usb_storage            12345  2
```

- **Module**: Module name
- **Size**: Memory used by module
- **Used by**: Number of instances + dependent modules

**Module Loading Flow:**

```
User Command: modprobe e1000
      │
      ▼
┌──────────────────────┐
│ Check dependencies   │  Read /lib/modules/$(uname -r)/modules.dep
│ from modules.dep     │
└──────────────────────┘
      │
      ▼
┌──────────────────────┐
│ Load dependencies    │  Load required modules first
│ first                │
└──────────────────────┘
      │
      ▼
┌──────────────────────┐
│ Load module file     │  Read e1000.ko
│ (.ko file)           │
└──────────────────────┘
      │
      ▼
┌──────────────────────┐
│ Verify module        │  Check signature (if required)
│ signature            │
└──────────────────────┘
      │
      ▼
┌──────────────────────┐
│ Resolve symbols      │  Link kernel symbols
│                      │
└──────────────────────┘
      │
      ▼
┌──────────────────────┐
│ Call module_init()   │  Execute initialization
│                      │  Register with kernel
└──────────────────────┘
      │
      ▼
Module loaded and active
```

**Automatic Module Loading:**

```bash
# Modules to load at boot
/etc/modules                    # Debian/Ubuntu
/etc/modules-load.d/*.conf      # systemd systems

# Module configuration
/etc/modprobe.d/*.conf          # Module parameters and options

# Blacklist modules (prevent loading)
echo "blacklist nouveau" > /etc/modprobe.d/blacklist.conf
```

**Example module configuration:**
```bash
# /etc/modprobe.d/alsa-base.conf
options snd-hda-intel model=auto
options snd slots=snd-hda-intel

# /etc/modprobe.d/blacklist.conf
blacklist nouveau                # Prevent nouveau from loading
```

### Kernel Parameters (sysctl)

Runtime kernel tuning without recompilation or rebooting.

**sysctl Interface:**

```
┌──────────────────────────────────────────────────────────────┐
│              Kernel Parameter Management                     │
└──────────────────────────────────────────────────────────────┘

User Space
    │
    │ sysctl command or write to /proc/sys/
    ▼
┌─────────────────────────────────────────┐
│         /proc/sys/ hierarchy            │
├─────────────────────────────────────────┤
│ /proc/sys/net/    - Network settings    │
│ /proc/sys/vm/     - Memory management   │
│ /proc/sys/fs/     - File system         │
│ /proc/sys/kernel/ - Kernel core         │
└─────────────────────────────────────────┘
    │
    │ Parameters stored as files
    │ Read/write to change values
    ▼
Kernel Space
    │
    └─> Kernel behavior changes immediately
```

**sysctl Commands:**

```bash
# View all parameters
sysctl -a                              # List all parameters
sysctl -a | grep net                   # Filter by category

# View specific parameter
sysctl net.ipv4.ip_forward             # IPv4 forwarding status
sysctl kernel.hostname                 # System hostname

# Set parameter (temporary - until reboot)
sudo sysctl -w net.ipv4.ip_forward=1   # Enable IP forwarding
sudo sysctl -w vm.swappiness=10        # Set swap tendency

# Alternative: Direct file modification
echo 1 | sudo tee /proc/sys/net/ipv4/ip_forward
cat /proc/sys/net/ipv4/ip_forward      # Read value
```

**Persistent Configuration:**

```bash
# Main configuration file
/etc/sysctl.conf                          # System-wide settings

# Drop-in configuration directory
/etc/sysctl.d/*.conf                      # Additional config files

# Apply configuration
sudo sysctl -p                            # Load /etc/sysctl.conf
sudo sysctl -p /etc/sysctl.d/custom.conf  # Load specific file
sudo sysctl --system                      # Load all config files
```

**Example /etc/sysctl.conf:**

```ini
# /etc/sysctl.conf - Kernel parameters

# Network settings
net.ipv4.ip_forward = 1                # Enable IP forwarding (for routing)
net.ipv4.tcp_syncookies = 1            # Protection against SYN flood
net.ipv4.conf.all.rp_filter = 1        # Reverse path filtering

# Memory management
vm.swappiness = 10                     # Reduce swap usage (0-100)
vm.dirty_ratio = 15                    # Percentage of memory for dirty pages
vm.dirty_background_ratio = 5          # Background write threshold

# File system
fs.file-max = 100000                   # Maximum open files
fs.inotify.max_user_watches = 524288   # Increase inotify watches

# Kernel core
kernel.pid_max = 4194304               # Maximum process IDs
kernel.panic = 10                      # Reboot after 10 seconds on panic
```

**Common Tuning Scenarios:**

```bash
# Web server optimization
sudo sysctl -w net.core.somaxconn=1024
sudo sysctl -w net.ipv4.tcp_max_syn_backlog=2048
sudo sysctl -w net.ipv4.ip_local_port_range="1024 65535"

# Database server memory
sudo sysctl -w vm.swappiness=1
sudo sysctl -w vm.dirty_ratio=10

# Increase file descriptor limits
sudo sysctl -w fs.file-max=500000

# Security hardening
sudo sysctl -w net.ipv4.conf.all.accept_redirects=0
sudo sysctl -w net.ipv4.conf.all.send_redirects=0
sudo sysctl -w net.ipv4.icmp_echo_ignore_all=1  # Ignore ping
```

## 3. Control Groups (cgroups)

Control Groups limit, account for, and isolate resource usage of process groups.

### cgroups Purpose

**Resource Management:**
- **Limiting**: Set max CPU, memory, I/O usage
- **Prioritization**: Allocate resources proportionally
- **Accounting**: Monitor resource consumption
- **Control**: Freeze/resume process groups
- **Isolation**: Basis for containers

### cgroups Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Control Groups (cgroups)                     │
└─────────────────────────────────────────────────────────────────┘

                    Root Cgroup (/)
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   System.slice    User.slice      Machine.slice
   (system svcs)   (user sessions) (VMs/containers)
        │                │                │
        │                │                └─> Container.service
        │                │                    ├─ CPU limit: 50%
        │                │                    ├─ Memory: 2GB
        │                │                    └─ PIDs: 1000 max
        │                │
        │                └─> user-1000.slice (user alice)
        │                    ├─ session-1.scope
        │                    └─ Firefox processes
        │                        └─ CPU shares: 1024
        │
        └─> nginx.service
            ├─ CPU limit: 2 cores
            ├─ Memory: 1GB
            └─ I/O weight: 100
```

### cgroup Controllers

```
┌──────────────────────────────────────────────────────────────┐
│              cgroup Controllers                              │
└──────────────────────────────────────────────────────────────┘

cpu          → CPU time distribution
cpuset       → CPU and NUMA node assignment
memory       → Memory limits and accounting
blkio        → Block I/O throttling
devices      → Device access control
freezer      → Suspend/resume cgroups
pids         → Process number limits
net_cls      → Network packet classification
perf_event   → Performance monitoring
```

### Managing cgroups with systemd

```bash
# View cgroup hierarchy
systemd-cgls                    # Tree view of cgroups
systemd-cgtop                   # Top-like view of cgroup usage

# Service resource limits (systemd)
# Edit service file: /etc/systemd/system/myapp.service
[Service]
CPUQuota=50%                    # Limit to 50% of one CPU
MemoryMax=1G                    # Maximum 1GB memory
MemoryHigh=800M                 # Throttle at 800MB
TasksMax=100                    # Maximum 100 processes/threads
IOWeight=500                    # I/O priority (100-10000)

# Apply changes
sudo systemctl daemon-reload
sudo systemctl restart myapp

# Runtime limits (temporary)
systemctl set-property myapp.service CPUQuota=25%
systemctl set-property myapp.service MemoryMax=512M
```

### Direct cgroup Management (v2)

```bash
# Create cgroup (cgroups v2)
sudo mkdir /sys/fs/cgroup/mygroup

# Enable controllers
echo "+cpu +memory +pids" | sudo tee /sys/fs/cgroup/cgroup.subtree_control

# Set CPU limit
echo "50000 100000" | sudo tee /sys/fs/cgroup/mygroup/cpu.max
# Format: quota period (50ms out of every 100ms = 50% CPU)

# Set memory limit
echo "1G" | sudo tee /sys/fs/cgroup/mygroup/memory.max

# Set PID limit
echo "100" | sudo tee /sys/fs/cgroup/mygroup/pids.max

# Add process to cgroup
echo $PID | sudo tee /sys/fs/cgroup/mygroup/cgroup.procs

# View cgroup membership
cat /proc/$PID/cgroup

# View resource usage
cat /sys/fs/cgroup/mygroup/memory.current
cat /sys/fs/cgroup/mygroup/cpu.stat
```

### Container Integration

```
Docker/Podman Container
         │
         │ Uses cgroups for resource limits
         ▼
┌────────────────────────────────────┐
│  cgroup: /system.slice/docker-     │
│           abc123.scope             │
├────────────────────────────────────┤
│  CPU: Limited to 2 cores           │
│  Memory: Max 4GB                   │
│  PIDs: Max 512 processes           │
│  I/O: Read 100MB/s, Write 50MB/s   │
└────────────────────────────────────┘
         │
         └─> All container processes
             constrained by these limits
```

## 4. Namespaces

Namespaces provide isolation by creating separate instances of global resources.

### Namespace Types

```
┌──────────────────────────────────────────────────────────────┐
│                 Linux Namespaces                             │
└──────────────────────────────────────────────────────────────┘

PID Namespace       Process IDs
  └─> Isolated process ID space
      Container sees PID 1, host sees real PID

Mount Namespace     File system mounts
  └─> Separate mount points
      Container has own root filesystem

Network Namespace   Network stack
  └─> Isolated network interfaces, routing, firewalls
      Container has own IP, ports, routes

IPC Namespace       Inter-Process Communication
  └─> Isolated message queues, semaphores, shared memory

UTS Namespace       Hostname and domain name
  └─> Different hostname per namespace

User Namespace      User and group IDs
  └─> Map UIDs: root in container = unprivileged outside

Cgroup Namespace    Cgroup hierarchy
  └─> Isolated view of cgroup tree

Time Namespace      System time
  └─> Different clock offsets per namespace
```

### Namespace Visualization

```
┌──────────────────────────────────────────────────────────────┐
│                    Host System                               │
│  PID Namespace (Host)                                        │
│    PID 1: systemd                                            │
│    PID 500: nginx                                            │
│    PID 1000: bash                                            │
│    PID 1234: container_runtime                               │
│         │                                                    │
│         └─> Creates Container                                │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Container (Isolated Namespaces)                       │  │
│  │                                                        │  │
│  │  PID Namespace (Container)                             │  │
│  │    PID 1: /bin/sh        (actually PID 5678 on host)   │  │
│  │    PID 2: python app     (actually PID 5679 on host)   │  │
│  │                                                        │  │
│  │  Network Namespace                                     │  │
│  │    eth0: 172.17.0.2 (container IP)                     │  │
│  │    Isolated from host network                          │  │
│  │                                                        │  │
│  │  Mount Namespace                                       │  │
│  │    / = /var/lib/container/abc123/rootfs (on host)      │  │
│  │    Sees own root filesystem                            │  │
│  │                                                        │  │
│  │  UTS Namespace                                         │  │
│  │    Hostname: container-abc123                          │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Working with Namespaces

```bash
# View process namespaces
ls -l /proc/$$/ns/
# Output shows namespace types and IDs:
# lrwxrwxrwx 1 user user 0 mnt -> mnt:[4026531840]
# lrwxrwxrwx 1 user user 0 net -> net:[4026531956]
# lrwxrwxrwx 1 user user 0 pid -> pid:[4026531836]

# Check if two processes share namespaces
ls -l /proc/1/ns/pid
ls -l /proc/1000/ns/pid
# Same inode number = same namespace

# Create process in new namespaces (unshare)
sudo unshare --fork --pid --mount-proc bash
# Inside new namespace:
ps aux    # Shows only processes in this namespace
# PID 1 is bash in this namespace

# Execute in existing namespace (nsenter)
sudo nsenter --target $PID --all
# Enter all namespaces of process $PID

# Specific namespace entry
sudo nsenter --target $PID --net --pid
# Enter only network and PID namespaces
```

**Creating isolated environment:**

```bash
# Create isolated environment
sudo unshare --fork --pid --mount-proc --net --uts bash

# Now inside isolated namespace:
hostname isolated-env        # Set hostname (only in this namespace)
hostname                     # Shows: isolated-env

# Check network (isolated)
ip addr                      # Only loopback interface

# Check processes (isolated PID namespace)
ps aux                       # Only sees processes in namespace
echo $$                      # Shows PID 1 (in this namespace)

# Exit namespace
exit
```

## 5. Container Fundamentals

Understanding containers from first principles (not Docker-specific).

### What are Containers?

Containers are NOT virtual machines - they're isolated processes using kernel features.

**Container = cgroups + namespaces + filesystem isolation**

```
┌─────────────────────────────────────────┐
│         Container (Docker/Podman)       │
└─────────────────────────────────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
    ▼                    ▼
┌──────────┐      ┌──────────────┐
│Namespaces│      │   cgroups    │
├──────────┤      ├──────────────┤
│Isolation │      │Resource Limit│
│          │      │              │
│• PID     │      │• CPU: 50%    │
│• Net     │      │• RAM: 2GB    │
│• Mount   │      │• I/O: 100MB/s│
│• UTS     │      │• PIDs: 512   │
│• IPC     │      │              │
│• User    │      │              │
└──────────┘      └──────────────┘
    │                    │
    └─────────┬──────────┘
              │
              ▼
     Lightweight, isolated,
     resource-controlled
     application environment
```

### Container vs VM

```
Virtual Machines:
┌─────────────────────────────────────────┐
│ App A  │  App B  │  App C               │
├────────┼─────────┼──────────────────────┤
│ Bins/  │ Bins/   │ Bins/                │
│ Libs   │ Libs    │ Libs                 │
├────────┼─────────┼──────────────────────┤
│Guest OS│Guest OS │Guest OS              │
├────────┴─────────┴──────────────────────┤
│         Hypervisor                      │
├─────────────────────────────────────────┤
│         Host OS                         │
├─────────────────────────────────────────┤
│         Hardware                        │
└─────────────────────────────────────────┘

Containers:
┌─────────────────────────────────────────┐
│ App A  │  App B  │  App C               │
├────────┼─────────┼──────────────────────┤
│ Bins/  │ Bins/   │ Bins/                │
│ Libs   │ Libs    │ Libs                 │
├────────┴─────────┴──────────────────────┤
│    Container Runtime (Docker, Podman)   │
├─────────────────────────────────────────┤
│         Host OS                         │
├─────────────────────────────────────────┤
│         Hardware                        │
└─────────────────────────────────────────┘
```

**Key differences:**
- **VMs**: Full OS, heavyweight, hardware virtualization
- **Containers**: Shared kernel, lightweight, OS-level virtualization

### Building a Container Manually

Understanding what container runtimes do:

```bash
# 1. Create rootfs (filesystem)
mkdir -p /tmp/container/rootfs
cd /tmp/container/rootfs

# Extract minimal base filesystem
# (In production, use base images)
sudo debootstrap stable rootfs http://deb.debian.org/debian

# 2. Create PID namespace and chroot
sudo unshare --fork --pid --mount-proc \
      chroot rootfs /bin/bash

# Now you're "inside" a basic container!
# - PID namespace: ps shows only container processes
# - chroot: / is the container root
# - Still missing: network, cgroups, user namespaces

# 3. Add network namespace
sudo unshare --fork --pid --mount-proc --net \
      chroot rootfs /bin/bash

# 4. Set hostname (UTS namespace)
sudo unshare --fork --pid --mount-proc --net --uts \
      chroot rootfs /bin/bash
hostname mycontainer

# 5. Add cgroup limits (requires separate setup)
# See cgroups section above
```

This demonstrates containers are just:
1. Isolated process (namespaces)
2. Resource-limited (cgroups)
3. Custom filesystem (chroot/pivot_root)

### Container Runtimes

**Hierarchy:**
```
Docker CLI / Podman CLI
      │
      ▼
containerd / CRI-O
      │
      ▼
runc (OCI runtime)
      │
      ▼
Linux kernel (namespaces + cgroups)
```

## 6. System Monitoring and Performance

Effective monitoring identifies bottlenecks before they cause outages.

### Performance Analysis Methodology

**USE Method** (Utilization, Saturation, Errors):

```
For every resource (CPU, memory, disk, network):

1. Utilization: How busy is the resource?
   → CPU at 80% utilization

2. Saturation: Is work queued/waiting?
   → Load average > CPU count means saturation

3. Errors: Are errors occurring?
   → Check kernel logs, network errors, disk errors
```

**Performance Analysis Workflow:**

```
1. Identify the problem
   ├─ User reports: "Application is slow"
   ├─ Monitoring alerts: "High CPU usage"
   └─ Proactive analysis

2. Gather data
   ├─ System metrics (CPU, memory, disk, network)
   ├─ Application metrics
   └─ Logs

3. Analyze
   ├─ Correlate metrics with timeline
   ├─ Identify bottleneck (CPU, I/O, memory, network)
   └─ Check for resource saturation

4. Test hypothesis
   ├─ Reproduce issue
   ├─ Change one variable
   └─ Measure impact

5. Fix and verify
   ├─ Apply solution
   ├─ Monitor improvement
   └─ Document findings
```

### CPU Monitoring

**Understanding Load Average:**

```bash
uptime
# Output: 13:45:01 up 10 days,  2:35,  3 users,  load average: 2.50, 1.80, 1.20
#                                                               1min  5min  15min

# Interpreting load average:
# Load = number of processes waiting for CPU or in uninterruptible I/O

# On 4-core system:
# Load 4.0  = 100% utilized (all cores busy)
# Load 8.0  = 200% utilized (processes waiting)
# Load 2.0  = 50% utilized (half capacity)
# Load 0.5  = 12.5% utilized (mostly idle)
```

**Load Average Analysis:**

```
Scenario 1: Increasing load
  load average: 1.0, 2.5, 4.0
  └─> Problem getting worse (15min ago: 4.0, now: 1.0)
      Actually improving!

Scenario 2: Decreasing load
  load average: 4.0, 2.5, 1.0
  └─> Problem started recently (1min: 4.0, 15min: 1.0)
      Getting worse!

Scenario 3: Sustained high load
  load average: 8.0, 8.0, 8.0
  └─> Consistent problem for 15+ minutes
      System under sustained pressure
```

**top - Real-time Process Monitoring:**

```bash
top

# Key sections:
# 1. Summary (first 5 lines)
top - 13:45:01 up 10 days,  2:35,  3 users,  load average: 2.50, 1.80, 1.20
Tasks: 245 total,   2 running, 243 sleeping,   0 stopped,   0 zombie
%Cpu(s): 25.0 us,  5.0 sy,  0.0 ni, 68.0 id,  2.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :  16384.0 total,   2048.0 free,   8192.0 used,   6144.0 buff/cache
MiB Swap:   8192.0 total,   7168.0 free,   1024.0 used.   7168.0 avail Mem

# CPU breakdown:
# us: user processes (applications)
# sy: system/kernel
# ni: nice (low-priority processes)
# id: idle
# wa: I/O wait (waiting for disk/network)
# hi: hardware interrupts
# si: software interrupts
# st: steal time (VM waiting for hypervisor)

# High 'wa' (I/O wait) → disk bottleneck
# High 'sy' (system) → kernel overhead, many syscalls
# High 'us' (user) → application CPU usage

# 2. Process list
  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1234 www-data  20   0  500000  50000  20000 R  95.0   0.3  12:34.56 nginx
 5678 postgres  20   0 1000000 200000  50000 S  45.0   1.2  45:12.34 postgres

# Columns:
# VIRT: Virtual memory (allocated)
# RES: Resident memory (actually in RAM)
# SHR: Shared memory
# S: State (R=running, S=sleeping, D=uninterruptible, Z=zombie)
```

**Useful top commands (inside top):**

```bash
# Interactive commands:
P    # Sort by CPU usage
M    # Sort by memory usage
1    # Show individual CPU cores
k    # Kill process (enter PID)
r    # Renice process
f    # Select fields to display
W    # Save current configuration
q    # Quit

# Batch mode (for scripts):
top -b -n 1                    # One iteration, batch mode
top -b -n 1 -p 1234            # Monitor specific PID
```

**htop - Enhanced top:**

```bash
htop

# Features:
# - Color-coded meters
# - Mouse support
# - Tree view of processes
# - Easy process management
# - Better visual layout

# Key shortcuts:
F2   # Setup (customize view)
F3   # Search process
F4   # Filter by name
F5   # Tree view
F6   # Sort by column
F9   # Kill process
F10  # Quit
```

**mpstat - Multi-Processor Statistics:**

```bash
# Install: apt install sysstat

mpstat                         # Overall CPU usage
mpstat -P ALL                  # Per-CPU statistics
mpstat -P ALL 1 5              # Every 1 second, 5 times

# Output per CPU:
CPU    %usr   %nice    %sys %iowait    %irq   %soft  %steal  %guest  %gnice   %idle
all    25.00    0.00    5.00    2.00    0.00    0.00    0.00    0.00    0.00   68.00
  0    50.00    0.00   10.00    5.00    0.00    0.00    0.00    0.00    0.00   35.00
  1    15.00    0.00    3.00    1.00    0.00    0.00    0.00    0.00    0.00   81.00
  2    20.00    0.00    4.00    2.00    0.00    0.00    0.00    0.00    0.00   74.00
  3    18.00    0.00    3.00    1.00    0.00    0.00    0.00    0.00    0.00   78.00

# Unbalanced load: CPU 0 at 65% while others idle
# → Check CPU affinity, single-threaded bottleneck
```

### Memory Monitoring

**free - Memory Usage:**

```bash
free -h                        # Human-readable

              total        used        free      shared  buff/cache   available
Mem:           16Gi        8.0Gi       2.0Gi       1.0Gi        6.0Gi        7.0Gi
Swap:          8.0Gi       1.0Gi       7.0Gi

# Important columns:
# total: Total installed RAM
# used: RAM used by applications
# free: Completely unused RAM (usually low)
# buff/cache: Cache for files/buffers (reclaimable)
# available: Memory available for new applications
#            (free + reclaimable cache)

# Key insight: 'available' is what matters, not 'free'
# Linux uses free memory for cache → better performance
```

**Memory Pressure Indicators:**

```bash
# 1. Check OOM (Out of Memory) kills
dmesg | grep -i "out of memory"
dmesg | grep -i "kill"
journalctl -k | grep -i "oom"

# 2. Check swap usage
free -h
# High swap used + low swap free = memory pressure

# 3. Check active swap
vmstat 1
# si (swap in) and so (swap out) columns
# Constant swapping = thrashing = severe memory pressure

# 4. Check cgroup memory pressure
cat /sys/fs/cgroup/memory.pressure
some avg10=0.00 avg60=0.00 avg300=0.00 total=0
full avg10=0.00 avg60=0.00 avg300=0.00 total=0
# Non-zero values = memory pressure
```

**vmstat - Virtual Memory Statistics:**

```bash
vmstat 1                       # Update every 1 second

procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 2  0 102400 204800  51200 614400    0    0   100   200  500 1000 25  5 68  2  0
 1  0 102400 204600  51200 614500    0    0    50   150  480  950 24  5 69  2  0

# Key columns:
# r: Processes waiting for CPU (runnable)
# b: Processes in uninterruptible sleep (usually I/O)
# swpd: Virtual memory used (swap)
# free: Free memory
# si: Memory swapped in from disk (KB/s)
# so: Memory swapped out to disk (KB/s)
# bi: Blocks read from disk (blocks/s)
# bo: Blocks written to disk (blocks/s)
# us: User CPU time
# sy: System CPU time
# id: Idle CPU time
# wa: I/O wait time

# Analysis:
# High 'r' value → CPU saturation
# High 'b' value → I/O bottleneck
# High 'si'/'so' → Swapping (memory pressure)
# High 'wa' → Disk bottleneck
```

**Process Memory Details:**

```bash
# Per-process memory usage
ps aux --sort=-%mem | head -n 10

# Detailed memory map
pmap -x $PID                   # Memory map
pmap -X $PID                   # Extended details

# /proc filesystem
cat /proc/$PID/status | grep -i mem
VmPeak:  1000000 kB            # Peak virtual memory
VmSize:   950000 kB            # Current virtual memory
VmRSS:    500000 kB            # Resident Set Size (physical RAM)
VmSwap:    50000 kB            # Swapped out

# Memory by process
smem -r                        # Sorted by memory
smem -p                        # Show percentages
```

### Disk I/O Monitoring

**iostat - I/O Statistics:**

```bash
# Install: apt install sysstat

iostat -x 1                    # Extended stats, 1 second intervals

Device            r/s     w/s     rkB/s     wkB/s   rrqm/s   wrqm/s  %util
sda              10.0    50.0     100.0    1000.0     1.0     10.0   45.0
sdb               2.0     5.0      20.0      50.0     0.0      2.0    5.0

# Key columns:
# r/s: Reads per second
# w/s: Writes per second
# rkB/s: KB read per second
# wkB/s: KB written per second
# %util: Percentage of time device was busy
#        → Near 100% = saturated disk
# await: Average wait time for I/O requests (ms)
#        → High await = slow disk or saturation

# Red flags:
# %util near 100% → Disk saturated
# await > 20ms → Slow disk response
# High r/s or w/s → Check what's causing I/O
```

**iotop - Per-Process I/O:**

```bash
sudo iotop                     # Real-time I/O monitoring
sudo iotop -o                  # Only show processes doing I/O
sudo iotop -a                  # Accumulated I/O

# Output:
Total DISK READ:   10.00 M/s | Total DISK WRITE:  50.00 M/s
  TID  PRIO  USER     DISK READ  DISK WRITE  SWAPIN     IO>    COMMAND
 1234 be/4 postgres    5.00 M/s   25.00 M/s  0.00 % 45.00 % postgres
 5678 be/4 mysql       3.00 M/s   15.00 M/s  0.00 % 30.00 % mysqld
```

**Disk Saturation Check:**

```bash
# Check I/O queue length
cat /proc/diskstats
# High queue length = saturation

# Check for slow I/O
iostat -x 1
# await > 20ms = slow
# svctm high = device latency

# Find what's using I/O
lsof +D /path/to/directory     # Files open in directory
fuser -v /path/to/file         # Processes using file
```

### Network Monitoring

**ss - Socket Statistics:**

```bash
# Modern replacement for netstat

ss -tuln                       # TCP/UDP listening ports
ss -tunap                      # All connections with process info
ss -s                          # Summary statistics
ss -ta                         # All TCP sockets

# Example output:
ss -tunap
Netid  State   Recv-Q Send-Q  Local Address:Port   Peer Address:Port
tcp    LISTEN  0      128           0.0.0.0:22          0.0.0.0:*     users:(("sshd",pid=1000,fd=3))
tcp    ESTAB   0      0         192.168.1.10:22    192.168.1.20:54321  users:(("sshd",pid=2000,fd=3))

# Key columns:
# Recv-Q: Receive queue (data not yet read by app)
# Send-Q: Send queue (data not yet acknowledged)
# High Recv-Q → Application not reading fast enough
# High Send-Q → Network congestion or slow receiver

# Connection states:
ss -ta | awk '{print $1}' | sort | uniq -c
# Count connections by state
```

**Network Interface Statistics:**

```bash
# Interface stats
ip -s link                     # Show packet/byte counts
ifconfig eth0                  # Classic format

# Per-interface details
cat /proc/net/dev
Inter-|   Receive                                                |  Transmit
 face |bytes    packets errs drop fifo frame compressed multicast|bytes    packets errs drop fifo colls carrier compressed
  eth0: 1234567890 9876543   0    0    0     0          0         0 9876543210 1234567   0    0    0     0       0          0

# Check for errors:
# errs, drop: Packet errors/drops
# → High values indicate network problems
```

**iftop - Real-time Bandwidth:**

```bash
sudo iftop                     # Network bandwidth by connection
sudo iftop -i eth0             # Specific interface
sudo iftop -n                  # Don't resolve hostnames

# Shows:
# - Top connections by bandwidth
# - Upload/download rates
# - Peak rates
```

**nethogs - Per-Process Bandwidth:**

```bash
sudo nethogs                   # Bandwidth by process
sudo nethogs eth0              # Specific interface

# Output:
PID    USER     PROGRAM                DEV    SENT    RECEIVED
1234   user     firefox               eth0   150 KB   2.5 MB
5678   root     sshd                  eth0    50 KB   100 KB
```

**Network Latency and Packet Loss:**

```bash
# Ping test
ping -c 10 8.8.8.8
# Check packet loss, min/avg/max latency

# Traceroute
traceroute 8.8.8.8
mtr 8.8.8.8                    # Continuous traceroute

# Check TCP connection issues
ss -ti                         # TCP info (RTT, cwnd, etc.)
```

### Process Monitoring

**ps - Process Status:**

```bash
# Common ps commands
ps aux                         # All processes, user-oriented
ps -ef                         # All processes, full format
ps -eLf                        # Include threads

# Custom format
ps -eo pid,ppid,cmd,%cpu,%mem,stat,start
# Select specific columns

# Find processes
ps aux | grep nginx
pgrep -a nginx                 # Better: grep process by name

# Process tree
ps auxf                        # ASCII tree
ps -ejH                        # Tree format
pstree -p                      # Visual tree with PIDs
```

**Process States:**

```bash
# ps STAT column meanings:
R  # Running or runnable
S  # Sleeping (waiting for event)
D  # Uninterruptible sleep (usually I/O) ← Problematic if many
Z  # Zombie (terminated, waiting for parent) ← Memory leak if many
T  # Stopped (Ctrl+Z or debugger)
I  # Idle kernel thread

# Additional flags:
< # High priority
N # Low priority
L # Has pages locked in memory
s # Session leader
+ # Foreground process group
```

**strace - System Call Tracing:**

```bash
# Trace system calls
strace -p $PID                     # Attach to running process
strace -c -p $PID                  # Summary of syscalls
strace -e open,read,write -p $PID  # Specific syscalls
strace -f -p $PID                  # Follow forks

# Find what a process is doing
strace -p $PID
# Shows real-time syscalls: open(), read(), write(), etc.

# Diagnose slow process
strace -T -p $PID                  # Show time spent in each syscall
# High time = bottleneck

# Example output:
open("/etc/passwd", O_RDONLY)  = 3 <0.000123>
read(3, "root:x:0:0:root:/root:/bin/bash\n", 4096) = 1850 <0.000045>
close(3)                       = 0 <0.000012>
# Times in <seconds>
```

### Log Analysis

**journalctl - systemd Logs:**

```bash
# View all logs
journalctl                         # All logs (paginated)
journalctl -f                      # Follow (like tail -f)
journalctl -r                      # Reverse (newest first)

# Filter by time
journalctl --since "1 hour ago"
journalctl --since "2024-12-01" --until "2024-12-05"
journalctl --since today
journalctl --since "10 minutes ago"

# Filter by service
journalctl -u nginx.service
journalctl -u nginx -f             # Follow nginx logs

# Filter by priority
journalctl -p err                  # Errors only
journalctl -p warning              # Warnings and above

# Filter by process
journalctl _PID=1234

# Kernel messages
journalctl -k                      # Same as dmesg
journalctl -k -p err               # Kernel errors

# Disk usage
journalctl --disk-usage
# Cleanup old logs
sudo journalctl --vacuum-time=7d   # Keep last 7 days
sudo journalctl --vacuum-size=1G   # Keep max 1GB
```

**Traditional Logs:**

```bash
# Common log locations
/var/log/syslog                # General system logs (Debian/Ubuntu)
/var/log/messages              # General system logs (RHEL/CentOS)
/var/log/auth.log              # Authentication logs
/var/log/kern.log              # Kernel logs
/var/log/nginx/access.log      # Application logs
/var/log/nginx/error.log

# Real-time monitoring
tail -f /var/log/syslog
tail -f /var/log/nginx/access.log | grep 404

# Search logs
grep -i error /var/log/syslog
grep -i "failed" /var/log/auth.log

# Count errors
grep -c "ERROR" /var/log/syslog
```

**Analyzing Patterns:**

```bash
# Count occurrences
journalctl -u nginx | awk '{print $6}' | sort | uniq -c

# Top IP addresses (from access log)
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head

# Requests per minute
awk '{print $4}' /var/log/nginx/access.log | cut -d: -f2 | sort | uniq -c

# Error rate
grep -c "error" /var/log/nginx/error.log
```

### Advanced Performance Tools

**sar - System Activity Reporter:**

```bash
# Install: apt install sysstat

# Historical data (requires sysstat setup)
sar                            # CPU usage (today)
sar -r                         # Memory usage
sar -b                         # I/O statistics
sar -n DEV                     # Network statistics

# Specific time range
sar -s 10:00:00 -e 11:00:00    # Between 10am-11am

# Live monitoring
sar 1 10                       # Every 1 second, 10 times
```

**perf - Linux Profiling:**

```bash
# CPU profiling
perf top                       # Real-time CPU profiling
perf top -p $PID               # Profile specific process

# Record and analyze
perf record -a -g sleep 10     # Record all CPUs for 10 seconds
perf report                    # Analyze recording

# Example use:
# 1. Find hot functions
# 2. Identify CPU bottlenecks
# 3. Profile kernel vs userspace
```

**BPF/eBPF Tools:**

```bash
# Modern performance analysis (requires bpftrace/bcc-tools)

# Trace file opens
sudo opensnoop

# Trace TCP connections
sudo tcpconnect

# Trace slow I/O
sudo biolatency

# Trace syscalls by process
sudo execsnoop

# CPU flame graphs
sudo profile -F 99 -f 30       # Sample at 99Hz for 30 seconds
```

## 7. Performance Tuning

Systematic approach to optimizing Linux performance.

### Tuning Philosophy

**Golden Rule: Measure → Analyze → Tune → Verify**

```
1. Measure (Baseline)
   ├─ Collect performance data
   ├─ Identify bottleneck
   └─ Document current state

2. Analyze
   ├─ Review metrics
   ├─ Correlate symptoms
   └─ Formulate hypothesis

3. Tune (Change ONE variable)
   ├─ Apply single optimization
   ├─ Document change
   └─ Note expected impact

4. Verify
   ├─ Measure again
   ├─ Compare to baseline
   ├─ Confirm improvement
   └─ Rollback if worse

5. Repeat if needed
```

**Anti-Patterns to Avoid:**

```
❌ Tuning without measurement
❌ Changing multiple parameters at once
❌ Tuning based on assumptions
❌ Premature optimization
❌ Copy-paste tuning from internet
❌ Tuning without understanding impact
```

**Proper Approach:**

```
✅ Measure first, identify bottleneck
✅ Change one parameter at a time
✅ Understand what each parameter does
✅ Test under realistic load
✅ Document every change
✅ Have rollback plan
```

### CPU Optimization

**CPU Scheduling:**

```bash
# View current scheduler
cat /sys/block/sda/queue/scheduler
# Output: noop deadline [cfq]
# [brackets] indicate active scheduler

# CPU scheduler policy (per process)
chrt -p $PID                   # View policy
sudo chrt -f -p 50 $PID        # Set FIFO realtime, priority 50
sudo chrt -r -p 50 $PID        # Set RR realtime, priority 50
sudo chrt -o -p 0 $PID         # Set normal (CFS)

# Scheduler policies:
# SCHED_NORMAL (CFS): Default for normal processes
# SCHED_FIFO: Real-time, runs until blocks or yields
# SCHED_RR: Real-time round-robin
# SCHED_BATCH: For batch processing (reduced scheduler overhead)
# SCHED_IDLE: Extremely low priority
```

**CPU Affinity:**

```bash
# Pin process to specific CPUs
taskset -c 0,1 command         # Run on CPU 0 and 1
taskset -p 0x3 $PID            # Set affinity (bitmask: 0x3 = CPUs 0,1)

# View affinity
taskset -p $PID

# Use case: Isolate critical process to dedicated CPUs
# Example: Database on CPUs 0-3, app on CPUs 4-7
```

**CPU Isolation:**

```bash
# Boot parameter (isolate CPUs from scheduler)
# /etc/default/grub
GRUB_CMDLINE_LINUX="isolcpus=2,3"
# CPUs 2-3 isolated, manually assign processes to them

sudo update-grub
# Reboot required

# Then assign critical process:
taskset -c 2,3 ./critical_app
```

**Interrupt Handling:**

```bash
# View interrupt distribution
cat /proc/interrupts

# Set IRQ affinity (pin interrupt to CPU)
echo 1 > /proc/irq/45/smp_affinity  # CPU 0 only (bitmask)
echo f > /proc/irq/45/smp_affinity  # CPUs 0-3 (0xf = 1111 binary)

# Use case: Pin network card interrupts to specific CPUs
# → Reduces cache bouncing, improves throughput
```

**CPU Governor (Frequency Scaling):**

```bash
# View available governors
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_available_governors
# Output: performance powersave

# View current governor
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor

# Set governor
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
# performance: Always max frequency
# powersave: Always min frequency
# ondemand: Scale based on load
# conservative: Like ondemand but more gradual
# schedutil: Integrated with scheduler (recommended)

# For low-latency applications: use 'performance'
# For battery/power saving: use 'powersave' or 'schedutil'
```

### Memory Optimization

**Swappiness:**

```bash
# View current swappiness
cat /proc/sys/vm/swappiness
# Default: 60 (range: 0-100)

# 0   = Swap only to avoid OOM
# 10  = Minimal swapping (good for databases)
# 60  = Balanced (default)
# 100 = Aggressive swapping

# Set temporarily
sudo sysctl vm.swappiness=10

# Set permanently
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Use case:
# Database servers: swappiness=1 (avoid swap)
# Desktop: swappiness=60 (default OK)
# Memory-intensive batch jobs: swappiness=10
```

**Huge Pages:**

```bash
# Benefits: Reduced TLB misses, better performance for large memory apps

# View huge page info
cat /proc/meminfo | grep -i huge
HugePages_Total:       0
HugePages_Free:        0
Hugepagesize:       2048 kB    # 2MB per huge page

# Enable huge pages
# Calculate needed pages: (App memory / 2MB)
# Example: 4GB app = 4096MB / 2MB = 2048 pages

sudo sysctl vm.nr_hugepages=2048

# Permanent:
echo "vm.nr_hugepages=2048" | sudo tee -a /etc/sysctl.conf

# Transparent Huge Pages (THP)
cat /sys/kernel/mm/transparent_hugepage/enabled
# [always] madvise never

# Disable THP (some databases recommend this)
echo never | sudo tee /sys/kernel/mm/transparent_hugepage/enabled

# Use case:
# Databases (PostgreSQL, Oracle): Use explicit huge pages
# Some databases: Disable THP
# General apps: THP=madvise (default) is fine
```

**NUMA Tuning:**

```bash
# Check if system is NUMA
numactl --hardware

# Show NUMA topology
lscpu | grep NUMA
NUMA node(s):          2
NUMA node0 CPU(s):     0-7
NUMA node1 CPU(s):     8-15

# Run process on specific NUMA node
numactl --cpunodebind=0 --membind=0 command
# CPU and memory from node 0

# NUMA policy
numactl --interleave=all command   # Interleave memory across nodes
numactl --preferred=0 command      # Prefer node 0

# Check NUMA stats
numastat

# Use case:
# Bind memory-intensive app to single NUMA node
# → Avoids remote memory access (faster)
```

**Memory Compaction:**

```bash
# Trigger manual compaction
echo 1 | sudo tee /proc/sys/vm/compact_memory

# Compaction proactiveness (0-100)
cat /proc/sys/vm/compaction_proactiveness
# Higher = more aggressive compaction
```

### I/O Optimization

**I/O Scheduler:**

```bash
# View current scheduler
cat /sys/block/sda/queue/scheduler
# Output: [mq-deadline] kyber bfq none

# Available schedulers:
# mq-deadline: Good for SSDs (default for SATA SSDs)
# kyber: Low-latency, good for fast NVMe
# bfq: Best for HDDs and interactive workloads
# none: No scheduling (good for very fast NVMe)

# Change scheduler (temporary)
echo kyber | sudo tee /sys/block/sda/queue/scheduler

# Change permanently (udev rule)
# /etc/udev/rules.d/60-scheduler.rules
ACTION=="add|change", KERNEL=="sd[a-z]|nvme[0-9]n[0-9]", ATTR{queue/scheduler}="mq-deadline"

# Recommendations:
# SATA SSD: mq-deadline
# NVMe SSD: kyber or none
# HDD: bfq
```

**Read-Ahead:**

```bash
# View current read-ahead
sudo blockdev --getra /dev/sda
# Output: 256 (sectors, usually 512 bytes each = 128KB)

# Set read-ahead
sudo blockdev --setra 512 /dev/sda  # 256KB
# Larger = better for sequential reads
# Smaller = better for random I/O

# Recommendations:
# Sequential workload (video streaming): 1024-2048 (512KB-1MB)
# Random workload (database): 128-256 (64-128KB)
# SSD: Usually keep default (256)
```

**Filesystem Mount Options:**

```bash
# /etc/fstab optimizations

# For performance (reduce writes):
/dev/sda1 / ext4 defaults,noatime,nodiratime 0 1
# noatime: Don't update access time on reads
# nodiratime: Don't update directory access times

# For databases:
/dev/sdb1 /var/lib/mysql ext4 defaults,noatime,data=writeback 0 2
# data=writeback: Fastest but less safe (use with battery-backed cache)
# data=ordered: Default, balanced
# data=journal: Slowest but safest

# For SSDs:
/dev/sdc1 /mnt/ssd ext4 defaults,noatime,discard 0 2
# discard: Enable TRIM for SSDs
```

**Filesystem Tuning:**

```bash
# ext4 tuning
sudo tune2fs -l /dev/sda1            # View current settings

# Reduce reserved space (default 5%)
sudo tune2fs -m 1 /dev/sda1          # Reserve 1% for root

# Adjust commit interval (default 5 seconds)
# Longer = better performance, higher data loss risk
sudo tune2fs -o commit=30 /dev/sda1  # 30 second commits

# XFS tuning (via mount options)
/dev/sda1 /data xfs defaults,noatime,logbufs=8,logbsize=256k 0 0
# logbufs: Number of log buffers
# logbsize: Size of each buffer
```

### Network Tuning

**TCP Buffer Sizes:**

```bash
# View current settings
sysctl net.ipv4.tcp_rmem
sysctl net.ipv4.tcp_wmem

# TCP read buffer (min, default, max) in bytes
net.ipv4.tcp_rmem = 4096 87380 6291456
# TCP write buffer
net.ipv4.tcp_wmem = 4096 16384 4194304

# Increase for high-bandwidth networks (10Gbps+)
sudo sysctl -w net.ipv4.tcp_rmem="4096 87380 33554432"  # 32MB max
sudo sysctl -w net.ipv4.tcp_wmem="4096 65536 33554432"  # 32MB max

# Core socket buffer limits
sudo sysctl -w net.core.rmem_max=33554432
sudo sysctl -w net.core.wmem_max=33554432

# Permanent: Add to /etc/sysctl.conf
```

**TCP Parameters:**

```bash
# Connection backlog
sudo sysctl -w net.core.somaxconn=4096
sudo sysctl -w net.ipv4.tcp_max_syn_backlog=8192
# Increase for high-traffic web servers

# TCP time wait reuse
sudo sysctl -w net.ipv4.tcp_tw_reuse=1
# Reuse TIME_WAIT sockets for new connections
# Safe for clients, carefully for servers

# TCP keepalive
sudo sysctl -w net.ipv4.tcp_keepalive_time=600      # Start after 10 min idle
sudo sysctl -w net.ipv4.tcp_keepalive_intvl=60      # Probe every 60s
sudo sysctl -w net.ipv4.tcp_keepalive_probes=3      # 3 probes before timeout
# Reduce for faster dead connection detection

# TCP congestion control
cat /proc/sys/net/ipv4/tcp_available_congestion_control
sysctl net.ipv4.tcp_congestion_control
sudo sysctl -w net.ipv4.tcp_congestion_control=bbr
# bbr: Google's BBR (recommended for high latency/bandwidth)
# cubic: Default (good general purpose)
# reno: Classic TCP
```

**Network Interface Tuning:**

```bash
# Ring buffer sizes
ethtool -g eth0                       # View current
sudo ethtool -G eth0 rx 4096 tx 4096  # Increase ring buffers
# Larger = handle more packets, reduce drops

# Interrupt coalescing (reduce CPU interrupts)
ethtool -c eth0
sudo ethtool -C eth0 rx-usecs 100     # Wait 100µs before interrupt
# Balance: Lower = less latency, higher = less CPU

# Enable hardware offloading
ethtool -k eth0                       # View features
sudo ethtool -K eth0 gso on           # Generic segmentation offload
sudo ethtool -K eth0 tso on           # TCP segmentation offload
sudo ethtool -K eth0 gro on           # Generic receive offload
# Offload work from CPU to NIC
```

**UDP Tuning:**

```bash
# UDP buffer sizes
sudo sysctl -w net.core.rmem_default=26214400  # 25MB
sudo sysctl -w net.core.rmem_max=26214400
# Important for UDP streaming, DNS servers
```

### Application-Level Tuning

**File Descriptor Limits:**

```bash
# View current limits
ulimit -n                      # Soft limit
ulimit -Hn                     # Hard limit

# System-wide limit
cat /proc/sys/fs/file-max
sudo sysctl -w fs.file-max=500000

# Per-user limits (/etc/security/limits.conf)
*  soft  nofile  65536
*  hard  nofile  65536

# Per-process (systemd service)
[Service]
LimitNOFILE=65536
```

**Database Tuning Example (PostgreSQL):**

```bash
# Kernel tuning for PostgreSQL
sudo sysctl -w vm.swappiness=1                    # Minimal swap
sudo sysctl -w vm.overcommit_memory=2             # Don't overcommit
sudo sysctl -w vm.dirty_ratio=10                  # Trigger writeback at 10%
sudo sysctl -w vm.dirty_background_ratio=5        # Background writes at 5%
sudo sysctl -w kernel.shmmax=17179869184          # Shared memory max
sudo sysctl -w kernel.shmall=4194304              # Shared memory pages

# Huge pages for PostgreSQL
# Calculate pages needed based on shared_buffers
# shared_buffers=8GB, page size=2MB → 4096 pages
sudo sysctl -w vm.nr_hugepages=4096
```

**Web Server Tuning Example (Nginx):**

```bash
# Kernel tuning
sudo sysctl -w net.core.somaxconn=65535
sudo sysctl -w net.ipv4.tcp_max_syn_backlog=65535
sudo sysctl -w net.ipv4.ip_local_port_range="1024 65535"
sudo sysctl -w net.ipv4.tcp_tw_reuse=1

# Nginx config
worker_processes auto;                # One per CPU core
worker_rlimit_nofile 65535;
events {
    worker_connections 10000;
    use epoll;                        # Efficient event mechanism
    multi_accept on;
}
```

### Benchmarking and Validation

**CPU Benchmarking:**

```bash
# sysbench CPU test
sysbench cpu --threads=4 --time=30 run

# Stress test
stress-ng --cpu 4 --timeout 60s
```

**Memory Benchmarking:**

```bash
# Memory bandwidth
sysbench memory --threads=4 run

# Memory stress
stress-ng --vm 4 --vm-bytes 1G --timeout 60s
```

**Disk Benchmarking:**

```bash
# Sequential read/write
dd if=/dev/zero of=/tmp/test bs=1M count=1024 oflag=direct
dd if=/tmp/test of=/dev/null bs=1M iflag=direct

# Random I/O (fio)
fio --name=random-rw --ioengine=libaio --rw=randrw --bs=4k --numjobs=4 \
    --size=1G --runtime=60 --time_based --group_reporting

# IOPS test
fio --name=iops-test --ioengine=libaio --rw=randread --bs=4k \
    --iodepth=64 --numjobs=4 --size=1G --runtime=60
```

**Network Benchmarking:**

```bash
# Bandwidth test (iperf3)
# Server:
iperf3 -s

# Client:
iperf3 -c server_ip -t 30      # 30 second test

# Latency test
ping -c 100 server_ip
# Check min/avg/max, jitter
```

**Application Benchmarking:**

```bash
# HTTP load testing
# Apache Bench
ab -n 10000 -c 100 http://localhost/

# wrk (modern alternative)
wrk -t4 -c100 -d30s http://localhost/

# Database benchmarking
pgbench -c 10 -j 2 -t 1000 mydb  # PostgreSQL
sysbench oltp_read_write --mysql-host=localhost --mysql-db=test run
```

## Key Takeaways

- **Monitor before tuning**: Always establish baselines
- **Change one thing at a time**: Isolate cause and effect
- **Understand the impact**: Know what each parameter does
- **Test under load**: Synthetic tests + real workload
- **Document everything**: Track changes and results
- **Containers are kernel features**: cgroups + namespaces + filesystem isolation
- **USE method**: Utilization, Saturation, Errors

