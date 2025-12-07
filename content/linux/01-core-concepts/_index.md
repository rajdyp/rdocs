---
title: Core Concepts
linkTitle: Core Concepts
type: docs
weight: 1
prev: /linux
next: /linux/02-system-internals
---

## 1. Linux Architecture

Understanding Linux's layered architecture is fundamental to working effectively with the system.

### The Big Picture

Linux follows a layered architecture design that separates concerns and provides abstraction.

```
┌─────────────────────────────────────────────────────────────┐
│                         USER SPACE                          │
│                       (User Mode)                           │
├─────────────────────────────────────────────────────────────┤
│  Applications  │  User Programs  │  System Utilities        │
│  (Firefox,     │  (Python,       │  (ls, cp, mv,            │
│   LibreOffice) │   gcc, editors) │   grep, etc.)            │
├─────────────────────────────────────────────────────────────┤
│                          Shell                              │
│              (bash, zsh, fish, sh)                          │
├─────────────────────────────────────────────────────────────┤
│                    System Libraries                         │
│          (glibc, libm, etc.) - Wrapper Functions            │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ System Calls
                              ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              SYSTEM CALL INTERFACE                          ┃
┃         (The Gateway Between User & Kernel)                 ┃
┃─────────────────────────────────────────────────────────    ┃
┃  What happens here:                                         ┃
┃  1. System library (glibc) invokes syscall                  ┃
┃  2. CPU switches from User Mode → Kernel Mode               ┃
┃  3. Kernel executes the request (read, write, open, etc.)   ┃
┃  4. CPU switches back: Kernel Mode → User Mode              ┃
┃  5. Result returned to your program                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       KERNEL SPACE                          │
│                      (Kernel Mode)                          │
├─────────────────────────────────────────────────────────────┤
│                      Linux Kernel                           │
│  ┌───────────────┬──────────────┬────────────────────────┐  │
│  │   Process     │   Memory     │    File System         │  │
│  │  Management   │  Management  │    Management          │  │
│  ├───────────────┼──────────────┼────────────────────────┤  │
│  │   Network     │   Device     │    Security            │  │
│  │    Stack      │   Drivers    │   (SELinux, etc.)      │  │
│  └───────────────┴──────────────┴────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         HARDWARE                            │
│     CPU  │  Memory (RAM)  │  Storage  │  Network Cards      │
└─────────────────────────────────────────────────────────────┘
```

### Layer Descriptions

#### Hardware Layer
- Physical components: CPU, RAM, disk, network interfaces
- Directly managed by the kernel
- Abstracted from user applications

#### Kernel Space (Kernel Mode)
- Core of the operating system
- Has direct hardware access and full CPU privileges
- Manages system resources and provides services
- Runs in privileged CPU mode

**Key responsibilities:**
- **Process Management**: Schedules, creates, and terminates processes
- **Memory Management**: Manages virtual memory, pages between RAM & disk, allocates memory to processes
- **File System Management**: Reads/writes files, supports multiple filesystem types (ext4, xfs, btrfs, etc.)
- **Device Management**: Abstracts hardware differences, provides device drivers for hardware communication
- **Network Stack**: Implements network protocols (TCP/IP), manages socket connections

#### System Call Interface
The controlled gateway between user and kernel space.

- Acts as the security boundary
- User side: Library wrappers (glibc) prepare the call
- Transition: CPU mode switch (user → kernel)
- Kernel side: System call handlers execute the request
- Returns to user space with results

**Common system calls:**
- File operations: `open()`, `read()`, `write()`, `close()`
- Process control: `fork()`, `exec()`, `exit()`, `wait()`
- Memory: `brk()`, `mmap()`
- Network: `socket()`, `bind()`, `connect()`

#### User Space (User Mode)
- Where applications and user programs run
- **No direct hardware access**
- Must use system calls for kernel services
- Protected memory space (process isolation)

### How System Calls Work

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

### Why This Architecture Matters

**Stability**: Bugs in user programs don't crash the kernel

**Security**: Applications can't directly access hardware or other processes' memory

**Portability**: Kernel abstracts hardware differences

**Multi-tasking**: Kernel manages resource sharing between processes

## 2. The Filesystem

### Everything is a File Philosophy

Linux treats almost everything as a file:
- Regular files (documents, programs)
- Directories (special files containing other files)
- Devices (hardware accessed through files)
- Pipes (inter-process communication)
- Sockets (network communication)

This unified interface simplifies system operations - the same operations (`open`, `read`, `write`, `close`) work on different types of resources.

### Filesystem Hierarchy Standard (FHS)

Linux uses a unified tree structure with a single root (`/`):

```
/                          (root directory)
├── bin/                   Essential user command binaries
├── boot/                  Boot loader files, kernel
├── dev/                   Device files
│   ├── sda                Block device (disk)
│   ├── tty                Terminal devices
│   └── null               Null device
├── etc/                   System configuration files
│   ├── passwd             User account information
│   ├── fstab              File system mount table
│   └── hosts              Static hostname lookup
├── home/                  User home directories
│   ├── user1/
│   └── user2/
├── lib/                   Essential shared libraries
├── media/                 Mount points for removable media
├── mnt/                   Temporary mount points
├── opt/                   Optional application software
├── proc/                  Virtual file system (process info)
│   ├── cpuinfo            CPU information
│   ├── meminfo            Memory information
│   └── [PID]/             Process-specific information
├── root/                  Root user's home directory
├── run/                   Runtime variable data
├── sbin/                  System administration binaries
├── srv/                   Service data
├── sys/                   Virtual file system (device info)
├── tmp/                   Temporary files
├── usr/                   User utilities and applications
│   ├── bin/               User commands
│   ├── lib/               Libraries
│   ├── local/             Local installations
│   └── share/             Shared data
└── var/                   Variable data files
    ├── log/               Log files
    ├── cache/             Application cache
    └── tmp/               Temporary files preserved between reboots
```

### Important Directories Explained

**`/bin` and `/sbin`**
- `/bin`: Essential commands (ls, cp, mv, cat) - needed for system boot and single-user mode
- `/sbin`: System administration commands (fdisk, fsck, reboot) - mostly intended for root

**`/etc`**
- System-wide configuration files
- No executable binaries
- Examples: `/etc/passwd` (user database), `/etc/fstab` (filesystem mounts), `/etc/ssh/sshd_config`

**`/dev`**
Device files representing hardware:
- **Character devices (c)**: Stream-based (keyboards, serial ports)
- **Block devices (b)**: Block-based (hard drives, USB drives)
- Special devices: `/dev/null` (data sink), `/dev/zero` (zeros), `/dev/random` (random data)

**`/proc` and `/sys` - Virtual Filesystems**

These don't exist on disk; the kernel generates them dynamically:

**`/proc`** - Process and kernel information:
```bash
cat /proc/cpuinfo          # CPU details
cat /proc/meminfo          # Memory statistics
cat /proc/[PID]/cmdline    # Process command line
cat /proc/[PID]/status     # Process status
ls -l /proc/[PID]/fd/      # Process file descriptors
```

**`/sys`** - Device and driver information:
```bash
cat /sys/class/net/eth0/address            # Network MAC address
cat /sys/block/sda/size                    # Disk size
cat /sys/class/power_supply/BAT0/capacity  # Battery level
```

**`/home`**
- User personal directories
- Each user has their own subdirectory
- User-owned and controlled

**`/var`**
Variable data that changes during operation:
- `/var/log/`: System and application logs
- `/var/cache/`: Application cache data
- `/var/spool/`: Queued tasks (print jobs, mail)
- `/var/tmp/`: Temporary files preserved across reboots

**`/usr`**
Second-tier file system for user applications:
- `/usr/bin/`: User commands (most applications)
- `/usr/sbin/`: Non-essential system binaries
- `/usr/lib/`: Libraries for programs
- `/usr/local/`: Locally installed software (admin-managed)
- `/usr/share/`: Architecture-independent shared data

### File Types

Linux recognizes several file types (shown in `ls -l` output):

```
Symbol  Type                 Description
─────────────────────────────────────────────────────────────
  -     Regular file         Normal files (text, binary)
  d     Directory            Container for other files
  l     Symbolic link        Pointer to another file
  c     Character device     Stream-oriented device
  b     Block device         Block-oriented device (disks)
  s     Socket               Inter-process communication
  p     Named pipe (FIFO)    Inter-process communication
```

**Example:**
```bash
$ ls -l
drwxr-xr-x  2 user group 4096 Dec  5 10:00 documents/
-rw-r--r--  1 user group 1234 Dec  5 10:01 file.txt
lrwxrwxrwx  1 user group    9 Dec  5 10:02 link -> file.txt
brw-rw----  1 root disk   8,0 Dec  5 10:00 /dev/sda
crw-rw-rw-  1 root tty    1,3 Dec  5 10:00 /dev/null
```

### Mounting and Unmounting

Linux combines all storage devices into a single directory tree through mounting:

```
┌──────────────────────────────────────────────────────────┐
│              Mount Point Concept                         │
└──────────────────────────────────────────────────────────┘

Root filesystem (/)
  ├── home/
  │   └── [MOUNT: /dev/sda2 mounted here]
  │       ├── user1/
  │       └── user2/
  ├── boot/
  │   └── [MOUNT: /dev/sda1 mounted here]
  └── mnt/
      └── external/
          └── [MOUNT: /dev/sdb1 mounted here]
```

**Common mount operations:**
```bash
# View mounted filesystems
mount                              # List all mounts
df -h                              # Disk usage of mounted filesystems

# Mount a filesystem
sudo mount /dev/sdb1 /mnt/usb             # Mount USB drive
sudo mount -t nfs server:/share /mnt/nfs  # Mount network share

# Unmount
sudo umount /mnt/usb               # Unmount by mount point
sudo umount /dev/sdb1              # Unmount by device

# Persistent mounts (/etc/fstab)
# Format: device  mount-point  type  options  dump  pass
/dev/sda2  /home  ext4  defaults  0  2
```

### Links: Hard vs Symbolic

**Key concepts:**
- Directory = list of (name → inode)
- File = inode + data blocks

**Hard Links:**
- Multiple directory entries pointing to the same inode
- Same file, different names
- Cannot cross filesystem boundaries
- Cannot link to directories (prevents loops)

**Symbolic (Soft) Links:**
- Special file containing path to another file
- Can cross filesystem boundaries
- Can link to directories
- Break if target is deleted

```bash
# Create links
ln file.txt hardlink.txt           # Hard link
ln -s file.txt symlink.txt         # Symbolic link

# Compare
$ ls -li
1234567 -rw-r--r--  2 user group 100 Dec 5 file.txt
1234567 -rw-r--r--  2 user group 100 Dec 5 hardlink.txt  # Same inode
9876543 lrwxrwxrwx  1 user group   8 Dec 5 symlink.txt -> file.txt
```

## 3. Users and Permissions

### User and Group Model

Linux is a multi-user system with robust access control.

**Users:**
- Each user has a unique User ID (UID)
- Root user (UID 0) has full system privileges
- Regular users typically have UIDs ≥ 1000
- User information: `/etc/passwd`
- Password hashes: `/etc/shadow` (root-only readable)

**Groups:**
- Each group has a unique Group ID (GID)
- Users can belong to multiple groups
- Group information: `/etc/group`
- **Primary group**: Default group for user's files
- **Secondary groups**: Additional memberships for access

**View user information:**
```bash
whoami                   # Current username
id                       # User and group IDs
id username              # Another user's IDs
groups                   # Group memberships
groups username          # Another user's groups
```

**Example output:**
```bash
$ id
uid=1000(alice) gid=1000(alice) groups=1000(alice),27(sudo),999(docker)
```

### File Permissions System

Every file has an owner, a group, and permissions defining who can do what.

#### Permission Structure

```
┌──────────────────────────────────────────────────────────────────┐
│                    File Permissions Structure                    │
└──────────────────────────────────────────────────────────────────┘

-rwxr-xr--.  1  user  group  4096  Dec 5 10:00  filename
│ │  │  │ │  │    │     │      │       │           └─ Filename
│ │  │  │ │  │    │     │      │       └─ Modification date/time
│ │  │  │ │  │    │     │      └─ File size (bytes)
│ │  │  │ │  │    │     └─ Group owner
│ │  │  │ │  │    └─ User/Owner
│ │  │  │ │  └─ Hard link count
│ │  │  │ │
│ │  │  │ └─ SELinux/ACL indicator
│ │  │  │       • . = SELinux context present
│ │  │  │       • + = ACLs present
│ │  │  │ 
│ │  │  └─ Others permissions (r--)
│ │  │       • Read: yes  
│ │  │       • Write: no  
│ │  │       • Execute: no  
│ │  │
│ │  └─ Group permissions (r-x)
│ │        • Read: yes  
│ │        • Write: no  
│ │        • Execute: yes  
│ │
│ └─ Owner permissions (rwx)
│         • Read: yes  
│         • Write: yes  
│         • Execute: yes  
│
└─ File type
        • - = regular file  
        • d = directory  
        • l = symlink  
        • c = character device  
        • b = block device  
        • p = pipe  
        • s = socket
```

#### Permission Types

**Read (r) - Value: 4**
- **Files**: View file contents
- **Directories**: List directory contents (`ls`)

**Write (w) - Value: 2**
- **Files**: Modify file contents
- **Directories**: Create, delete, rename files in directory

**Execute (x) - Value: 1**
- **Files**: Run file as program/script
- **Directories**: Access directory (cd into it, access files inside)

#### Permission Classes

Permissions apply to three classes:
1. **User (u)**: File owner
2. **Group (g)**: Group owner
3. **Others (o)**: Everyone else

#### Numeric Permissions

```
┌─────────────────────────────────────────┐
│      Numeric Permission Notation        │
└─────────────────────────────────────────┘

Owner    Group    Others
 rwx      r-x      r--
 421      401      400
  7        5        4

Result: 754

Binary breakdown:
r w x
1 1 1 = 7 (owner: read, write, execute)
1 0 1 = 5 (group: read, execute)
1 0 0 = 4 (others: read only)
```

**Common permission values:**
```
755 = rwxr-xr-x   Standard for executable files, directories
644 = rw-r--r--   Standard for regular files
700 = rwx------   Private directory/script
600 = rw-------   Private file (e.g., SSH keys)
777 = rwxrwxrwx   Full access (dangerous - avoid!)
000 = ---------   No access
```

### Managing Permissions

**Changing permissions (chmod):**

```bash
# Numeric mode
chmod 755 script.sh              # rwxr-xr-x
chmod 644 document.txt           # rw-r--r--
chmod 600 ~/.ssh/id_rsa          # rw------- (private key)

# Symbolic mode
chmod u+x script.sh              # Add execute for owner
chmod g-w file.txt               # Remove write for group
chmod o=r file.txt               # Set others to read only
chmod a+r file.txt               # Add read for all (a = all)
chmod u+x,go-w script.sh         # Multiple changes

# Recursive
chmod -R 755 directory/          # Apply to directory and contents
```

**Changing ownership (chown, chgrp):**

```bash
# Change owner
sudo chown alice file.txt        # Change owner to alice
sudo chown -R alice directory/   # Recursive

# Change owner and group
sudo chown alice:developers file.txt

# Change group only
sudo chgrp developers file.txt
chgrp -R developers project/     # Recursive
```

### Permission Evaluation Flow

```
User attempts to access file: /home/alice/document.txt
                   │
                   ▼
         ┌─────────────────────┐
         │ Is user the owner?  │
         └─────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
        YES                 NO
         │                   │
         ▼                   ▼
    Apply owner      ┌──────────────────────┐
    permissions      │ Is user in group?    │
    (rwx)            └──────────────────────┘
                             │
                     ┌───────┴───────┐
                     │               │
                    YES             NO
                     │               │
                     ▼               ▼
                 Apply group    Apply others
                 permissions    permissions
                 (r-x)          (r--)
```

**Important**: Linux checks in order: owner → group → others, and **stops at first match**.

### Special Permissions

```
┌──────────────────────────────────────────────────────────────────────┐
│                      Special Permission Bits                         │
└──────────────────────────────────────────────────────────────────────┘

SUID (Set User ID) - Value: 4000
  -rwsr-xr-x    's' in owner execute position
  • Executes with owner's privileges (not caller's)
  • Example: /usr/bin/passwd (runs as root to change passwords)
  • Security risk if misused

SGID (Set Group ID) - Value: 2000
  -rwxr-sr-x    's' in group execute position
  • File: Executes with group's privileges
  • Directory: New files inherit directory's group

Sticky Bit - Value: 1000
  drwxrwxrwt    't' in others execute position
  • Typically on directories (e.g., /tmp)
  • Only owner can delete their own files
  • Prevents users from deleting others' files in shared directories
```

**Setting special permissions:**
```bash
chmod u+s file          # Add SUID
chmod g+s directory     # Add SGID
chmod +t directory      # Add sticky bit

# Numeric notation (4-digit)
chmod 4755 file         # SUID + 755
chmod 2755 directory    # SGID + 755
chmod 1777 directory    # Sticky + 777 (like /tmp)
```

**Example: /tmp directory:**
```bash
$ ls -ld /tmp
drwxrwxrwt 20 root root 4096 Dec  5 10:00 /tmp
                ↑
         Sticky bit - anyone can create files,
         but only owners can delete their own files
```

### sudo and Privilege Escalation

**sudo** (Super User DO) allows authorized users to run commands as root or other users.

**Configuration:** `/etc/sudoers` (edit with `visudo` only!)

**Common usage:**
```bash
# Run single command as root
sudo command

# Run as different user
sudo -u username command

# Switch to root shell
sudo -i                  # Login shell
sudo -s                  # Non-login shell

# Explanation:
# sudo -i gives you a full login environment (like actually logging in as root)
# sudo -s just elevates your privileges while keeping your current working directory and environment

# Run previous command with sudo
sudo !!

# Edit file as root
sudo vim /etc/config
# Or use sudoedit for safety
sudoedit /etc/config
```

**Best practices:**
- Use `sudo` for individual commands, not `sudo su -`
- Don't run GUI applications with `sudo` (use `pkexec` instead)
- Never modify `/etc/sudoers` directly (use `visudo`)
- Grant minimum necessary privileges

## 4. Processes

### What is a Process?

A process is an instance of a running program - a program in execution with allocated resources.

**Program vs Process:**
- **Program**: Executable file on disk (passive, static)
- **Process**: Program in execution (active, dynamic)

```
Program: /usr/bin/firefox (file on disk)
    │
    │ When executed...
    ▼
Process: firefox (PID 1234)
    ├─ Has memory allocation
    ├─ Has CPU time
    ├─ Has open files
    ├─ Has permissions (UID/GID)
    └─ Has state (running, sleeping, etc.)
```

### Process Attributes

Every process has:

- **PID (Process ID)**: Unique identifier
- **PPID (Parent PID)**: PID of the process that created it
- **UID/GID**: User and group ownership
- **Priority**: Scheduling priority (nice value)
- **State**: Current status (running, sleeping, zombie, etc.)
- **Memory**: Virtual memory allocation
- **File Descriptors**: Open files, sockets, etc.

### Viewing Processes

**ps (Process Status):**
```bash
# Common formats
ps                       # Processes in current terminal
ps aux                   # All processes, detailed
ps -ef                   # All processes, full format
ps -u username           # User's processes

# Custom output
ps -eo pid,ppid,user,cmd,%cpu,%mem,stat

# Sort by resource usage
ps aux --sort=-%cpu      # CPU usage
ps aux --sort=-%mem      # Memory usage
```

**top (Interactive):**
```bash
top                      # Real-time process viewer

# Inside top:
#   P - sort by CPU
#   M - sort by memory
#   k - kill process
#   r - renice process
#   1 - show individual CPUs
#   q - quit
```

**htop (Enhanced top):**
```bash
htop                     # Better UI, mouse support
# F5 - tree view
# F9 - kill process
# F10 - quit
```

**Process tree:**
```bash
pstree                   # ASCII tree
pstree -p                # Show PIDs
pstree username          # User's process tree
```

### Process States

A process goes through different states during its lifetime as the kernel schedules it, handles I/O operations, and manages system resources. Understanding these states helps you diagnose why processes might be stuck or consuming resources.

**The five main states:**
- **Ready**: Waiting for CPU time
- **Running**: Actively executing on the CPU
- **Sleeping**: Waiting for an event (like I/O completion)
- **Stopped**: Paused (by user or debugger)
- **Zombie**: Finished executing but waiting to be cleaned up

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

**State codes (in ps/top):**
- **R**: Running or runnable (on run queue)
- **S**: Interruptible sleep (waiting for event)
- **D**: Uninterruptible sleep (usually I/O)
- **T**: Stopped (by job control signal or tracing)
- **Z**: Zombie (terminated but not reaped)

### Managing Processes

**Starting processes:**
```bash
# Foreground (blocking)
command

# Background (non-blocking)
command &

# Run and detach from terminal
nohup command &
```

**Job control:**
```bash
# Suspend foreground job
Ctrl+Z

# List jobs
jobs

# Bring to foreground
fg %1                    # Job number 1
fg                       # Most recent job

# Send to background
bg %1                    # Continue job 1 in background

# Disown (detach from shell)
disown %1
```

**Stopping processes:**
```bash
# Graceful termination (SIGTERM)
kill PID
kill -15 PID

# Force kill (SIGKILL - cannot be caught)
kill -9 PID
kill -KILL PID

# Kill by name
killall firefox
pkill firefox

# Kill by pattern
pkill -f "python.*script"

# Interactive kill
top                      # Press 'k' and enter PID
htop                     # F9 to kill selected process
```

**Process priority (nice):**
```bash
# Nice values: -20 (highest) to 19 (lowest)
# Lower (negative) nice = higher priority

# Start with lower priority
nice -n 10 command       # Nice value +10

# Change running process priority
renice -n 5 -p PID       # Set nice to 5
renice -n 10 -u username # All user's processes

# Only root can set negative nice values
sudo renice -n -5 -p PID
```

### Signals

Signals are software interrupts for inter-process communication.

**Common signals:**

| Signal | Number | Default Action | Description |
|--------|--------|----------------|-------------|
| `SIGHUP` | 1 | Terminate | Hangup (terminal disconnected) |
| `SIGINT` | 2 | Terminate | Interrupt (Ctrl+C) |
| `SIGQUIT` | 3 | Core dump | Quit (Ctrl+\\) |
| `SIGKILL` | 9 | Terminate | **Cannot be caught or ignored** |
| `SIGTERM` | 15 | Terminate | Graceful termination (default) |
| `SIGCHLD` | 17 | Ignore | Child process terminated |
| `SIGCONT` | 18 | Continue | Continue if stopped |
| `SIGSTOP` | 19 | Stop | **Cannot be caught or ignored** |
| `SIGTSTP` | 20 | Stop | Stop (Ctrl+Z) |

**Sending signals:**
```bash
# By signal name
kill -SIGTERM PID
kill -TERM PID

# By signal number
kill -15 PID             # SIGTERM
kill -9 PID              # SIGKILL

# Special cases
kill -HUP PID            # Often reloads config
kill -USR1 PID           # User-defined signal
```

### Daemons

Daemons are background processes providing services:

**Characteristics:**
- Run in the background
- No controlling terminal
- Usually started at boot
- Parent is typically systemd (PID 1)
- Often end with 'd' (sshd, httpd, mysqld)

**Identifying daemons:**
```bash
# No controlling terminal (TTY = ?)
ps aux | grep '?'

# Typically have PPID of 1
ps -eo pid,ppid,cmd | grep '^\s*[0-9]\+\s\+1\s'
```

## 5. System Services

### systemd: The Modern Init System

systemd is the init system and service manager for modern Linux distributions.

**What is an init system?**
- First process started by kernel (PID 1)
- Parent of all other processes
- Manages system services and startup
- Handles system state (boot, shutdown, etc.)

**Why systemd?**
- Aggressive parallelization (faster boot)
- On-demand service activation
- Dependency-based service control
- Integrated logging (journald)
- Unified management interface

### systemd Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      systemd Components                      │
└──────────────────────────────────────────────────────────────┘

                    systemd (PID 1)
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   Service Units    Target Units    Other Units
   (.service)       (.target)
        │                │                │
        │                │                ├─> Socket (.socket)
        │                │                ├─> Device (.device)
        │                │                ├─> Mount (.mount)
        │                │                ├─> Timer (.timer)
        │                │                └─> Path (.path)
        ▼                ▼
   Services like:   Targets like:
   - ssh.service    - multi-user.target
   - nginx.service  - graphical.target
   - mysql.service  - network.target
```

### Managing Services

**Service control:**
```bash
# Start/stop services
sudo systemctl start nginx.service
sudo systemctl stop nginx.service
sudo systemctl restart nginx.service    # Stop then start
sudo systemctl reload nginx.service     # Reload config without restart
sudo systemctl reload-or-restart nginx  # Reload if possible, otherwise restart

# Service status
systemctl status nginx.service
systemctl is-active nginx              # Running?
systemctl is-enabled nginx             # Will start at boot?
systemctl is-failed nginx              # Failed state?
```

**Enable/disable services (boot time):**
```bash
# Enable (start at boot)
sudo systemctl enable nginx.service
sudo systemctl enable --now nginx      # Enable and start immediately

# Disable (don't start at boot)
sudo systemctl disable nginx.service
sudo systemctl disable --now nginx     # Disable and stop immediately

# Mask (prevent from being started)
sudo systemctl mask nginx              # Create symlink to /dev/null
sudo systemctl unmask nginx            # Remove mask
```

**Listing services:**
```bash
# List all units
systemctl list-units
systemctl list-units --type=service

# List all unit files
systemctl list-unit-files
systemctl list-unit-files --type=service

# Show failed services
systemctl --failed

# Show service dependencies
systemctl list-dependencies nginx.service
systemctl list-dependencies --all nginx  # All deps recursively
```

### Unit Files

Unit files define how systemd manages services. Located in:
- `/etc/systemd/system/` - System-specific (highest priority)
- `/run/systemd/system/` - Runtime units
- `/lib/systemd/system/` - Distribution defaults

**Example service unit:**
```ini
# /etc/systemd/system/myapp.service

[Unit]
Description=My Application Service
Documentation=https://example.com/docs
After=network.target                    # Start after network
Wants=postgresql.service                # Optional dependency
Requires=network-online.target          # Hard dependency

[Service]
Type=simple                             # Service type
User=myuser                             # Run as user
Group=mygroup                           # Run as group
WorkingDirectory=/opt/myapp             # Working directory
ExecStart=/opt/myapp/bin/myapp          # Start command
ExecReload=/bin/kill -HUP $MAINPID      # Reload command
ExecStop=/bin/kill -TERM $MAINPID       # Stop command
Restart=on-failure                      # Restart policy
RestartSec=5                            # Wait before restart
StandardOutput=journal                  # Output to journal
StandardError=journal                   # Errors to journal

# Security settings
PrivateTmp=true                         # Isolated /tmp
NoNewPrivileges=true                    # Prevent privilege escalation
ProtectSystem=strict                    # Read-only system directories

[Install]
WantedBy=multi-user.target              # Enable for multi-user mode
```

**Service types:**
- **simple**: Default, main process specified by ExecStart
- **forking**: Process forks, parent exits (traditional daemons)
- **oneshot**: Runs once and exits (e.g., setup tasks)
- **notify**: Service sends notification when ready
- **idle**: Waits until other jobs finish

**Reload after changes:**
```bash
# After editing unit files
sudo systemctl daemon-reload
sudo systemctl restart myapp.service
```

### Targets (Runlevels)

Targets group units and define system states (like SysV runlevels).

```
┌──────────────────────────────────────────────────────────────┐
│              systemd Targets                                 │
└──────────────────────────────────────────────────────────────┘

poweroff.target          Shutdown
rescue.target            Single-user mode (minimal system)
multi-user.target        Multi-user, no GUI
graphical.target         Multi-user with GUI
reboot.target            Reboot

# SysV Runlevel equivalents:
# 0 (halt) → runlevel0.target → poweroff.target
# 1 (single-user) → runlevel1.target → rescue.target
# 2 (multi-user, Debian default) → runlevel2.target → multi-user.target
# 3 (multi-user) → runlevel3.target → multi-user.target
# 4 (unused/custom) → runlevel4.target → multi-user.target
# 5 (graphical) → runlevel5.target → graphical.target
# 6 (reboot) → runlevel6.target → reboot.target
```

**Working with targets:**
```bash
# Get current target
systemctl get-default

# Set default target
sudo systemctl set-default multi-user.target
sudo systemctl set-default graphical.target

# Switch target (runtime)
sudo systemctl isolate multi-user.target

# List available targets
systemctl list-units --type=target
```

### systemd Timers (Cron Replacement)

Timers trigger services at specified times (alternative to cron):

**Example timer:**
```ini
# /etc/systemd/system/backup.timer
[Unit]
Description=Daily backup timer

[Timer]
OnCalendar=daily                   # When to run
OnCalendar=*-*-* 02:00:00          # Every day at 2 AM
OnCalendar=Mon *-*-* 00:00:00      # Every Monday at midnight
Persistent=true                    # Run if missed (e.g., system was off)

[Install]
WantedBy=timers.target
```

**Corresponding service:**
```ini
# /etc/systemd/system/backup.service
[Unit]
Description=Backup service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/backup.sh
```

**Managing timers:**
```bash
# List timers
systemctl list-timers

# Enable timer
sudo systemctl enable backup.timer
sudo systemctl start backup.timer

# Check timer status
systemctl status backup.timer
```

### journald (Logging)

systemd's integrated logging system:

**Viewing logs:**
```bash
# All logs
journalctl

# Follow logs (like tail -f)
journalctl -f

# Specific service
journalctl -u nginx.service
journalctl -u nginx.service -f

# Time-based filtering
journalctl --since "2024-01-01"
journalctl --since "1 hour ago"
journalctl --since "2024-01-01" --until "2024-01-02"
journalctl --since today

# Priority level
journalctl -p err                  # Error and above
journalctl -p warning              # Warning and above

# Current boot
journalctl -b                      # This boot
journalctl -b -1                   # Previous boot

# Kernel messages
journalctl -k

# Specific process
journalctl _PID=1234

# Limit output
journalctl -n 50                   # Last 50 lines
journalctl -u nginx -n 100

# Output format
journalctl -o json-pretty          # JSON format
journalctl -o verbose              # Verbose
```

**Managing journal:**
```bash
# Disk usage
journalctl --disk-usage

# Vacuum (clean old logs)
sudo journalctl --vacuum-size=100M    # Keep max 100MB
sudo journalctl --vacuum-time=2weeks  # Keep 2 weeks
```

## 6. Package Management

### Package Management Philosophy

Package managers handle:
- Software installation and removal
- Dependency resolution
- Version management
- System updates
- Binary distribution (pre-compiled)

### Distribution-Specific Package Managers

```
┌──────────────────────────────────────────────────────────────┐
│           Linux Distribution Package Managers                │
└──────────────────────────────────────────────────────────────┘

Debian/Ubuntu Family
  │
  ├─> Package format: .deb
  ├─> Low-level tool: dpkg
  └─> High-level tool: apt, apt-get, aptitude

Red Hat/Fedora Family
  │
  ├─> Package format: .rpm
  ├─> Low-level tool: rpm
  └─> High-level tool: yum, dnf
```

### APT (Debian/Ubuntu)

**Package operations:**
```bash
# Update package index
sudo apt update                           # Refresh package list from repositories

# Upgrade packages
sudo apt upgrade                          # Upgrade all packages (safe)
sudo apt full-upgrade                     # Upgrade with dependency changes
sudo apt dist-upgrade                     # Alias for full-upgrade

# Install packages
sudo apt install nginx
sudo apt install nginx mysql-server php   # Multiple packages
sudo apt install nginx=1.18.0-0ubuntu1    # Specific version

# Remove packages
sudo apt remove nginx                     # Remove package, keep config
sudo apt purge nginx                      # Remove package and config
sudo apt autoremove                       # Remove unused dependencies

# Search and information
apt search keyword                        # Search for packages
apt show nginx                            # Show package details
apt list --installed                      # List installed packages
apt list --upgradable                     # List upgradable packages

# Clean up
sudo apt clean                            # Clear package cache
sudo apt autoclean                        # Clear old package cache
```

**Package information:**
```bash
# Which package provides a file?
apt-file search /usr/bin/nginx  # Requires apt-file package

# List files in package
dpkg -L nginx                   # Installed package
apt-file list nginx             # Any package

# Which package is a file from?
dpkg -S /usr/bin/nginx
```

### DNF/YUM (Red Hat/Fedora/CentOS)

**Package operations:**
```bash
# Update system
sudo dnf update                 # Update all packages
sudo dnf upgrade                # Same as update

# Install packages
sudo dnf install nginx
sudo dnf reinstall nginx        # Reinstall package

# Remove packages
sudo dnf remove nginx
sudo dnf autoremove             # Remove unused dependencies

# Search and information
dnf search keyword              # Search packages
dnf info nginx                  # Package information
dnf list installed              # List installed packages
dnf list available              # List available packages

# Repository management
dnf repolist                    # List enabled repositories
dnf repolist all                # List all repositories
sudo dnf config-manager --enable repo_name
sudo dnf config-manager --disable repo_name

# Groups
dnf group list                  # List package groups
sudo dnf group install "Development Tools"

# Clean up
sudo dnf clean all              # Clean cache
```

### Dependency Resolution

When you install a package, the package manager:

```
┌──────────────────────────────────────────────────────────────┐
│         Package Installation Flow                            │
└──────────────────────────────────────────────────────────────┘

User: sudo apt install firefox
        │
        ▼
┌───────────────────────┐
│ Check local package   │
│ cache/database        │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│ Resolve dependencies  │  firefox requires:
│                       │  - libgtk-3-0
│                       │  - libx11-6
│                       │  - libasound2
└───────────────────────┘  - ... (more)
        │
        ▼
┌───────────────────────┐
│ Check if dependencies │
│ already installed     │
└───────────────────────┘
        │
        ├─> Missing: Mark for installation
        └─> Installed: Skip
        │
        ▼
┌───────────────────────┐
│ Download packages     │
│ from repositories     │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│ Verify package        │
│ signatures/checksums  │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│ Install dependencies  │
│ in correct order      │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│ Install main package  │
│ (firefox)             │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│ Run post-install      │
│ scripts               │
└───────────────────────┘
        │
        ▼
  Installation complete
```

### Repository Management

Repositories are sources for packages.

**APT repositories:**
- Main config: `/etc/apt/sources.list`
- Additional repo files: `/etc/apt/sources.list.d/`

```bash
# Add repository
sudo add-apt-repository ppa:user/repo
sudo apt update

# Remove repository
sudo add-apt-repository --remove ppa:user/repo

# Edit sources
sudo nano /etc/apt/sources.list
# Or
sudo nano /etc/apt/sources.list.d/custom.list
```

**DNF repositories:**
- Main repo directory: `/etc/yum.repos.d/`
- DNF config: `/etc/yum.conf`

```bash
# Add repository
sudo dnf config-manager --add-repo https://example.com/repo

# List repositories
dnf repolist

# Enable/disable
sudo dnf config-manager --enable repo_name
sudo dnf config-manager --disable repo_name
```

### Best Practices

1. **Always update package index first**
   ```bash
   # Debian/Ubuntu
   sudo apt update && sudo apt install package

   # Red Hat/Fedora (updates metadata automatically)
   sudo dnf install package
   ```

2. **Regular system updates**
   ```bash
   # Debian/Ubuntu
   sudo apt update && sudo apt upgrade

   # Red Hat/Fedora
   sudo dnf update
   ```

3. **Clean up regularly**
   ```bash
   # Debian/Ubuntu
   sudo apt autoremove
   sudo apt clean

   # Red Hat/Fedora
   sudo dnf autoremove
   sudo dnf clean all
   ```

4. **Use official repositories when possible**
   - More secure
   - Better maintained
   - Stable versions

5. **Check what will be installed**
   ```bash
   # Debian/Ubuntu
   apt show package
   apt-cache depends nginx

   # Red Hat/Fedora
   dnf info package
   dnf repoquery --requires nginx
   ```

## 7. Networking Essentials

### Network Stack Overview

Linux implements the TCP/IP network model.

```
┌──────────────────────────────────────────────────────────────┐
│              Linux Network Stack                             │
└──────────────────────────────────────────────────────────────┘

Application Layer
  │   Applications (Firefox, ssh, curl, etc.)
  │   Use socket API
  ▼
┌──────────────────────────────────────────────────────────────┐
│  Socket Layer                                                │
│  System call interface: socket(), bind(), connect(), etc.    │
└──────────────────────────────────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────────────────────────────────┐
│  Transport Layer                                             │
│  TCP (Transmission Control Protocol) - Reliable              │
│  UDP (User Datagram Protocol) - Fast, connectionless         │
└──────────────────────────────────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────────────────────────────────┐
│  Network Layer                                               │
│  IP (Internet Protocol) - Routing, addressing                │
│  ICMP (Internet Control Message Protocol) - Ping, errors     │
└──────────────────────────────────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────────────────────────────────┐
│  Link Layer                                                  │
│  Ethernet, WiFi, etc.                                        │
│  MAC addressing                                              │
└──────────────────────────────────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────────────────────────────────┐
│  Physical Layer                                              │
│  Network hardware (NIC, WiFi adapter)                        │
└──────────────────────────────────────────────────────────────┘
```

### Network Interfaces

Network interfaces connect your system to networks.

**Viewing interfaces:**
```bash
# Modern command (ip from iproute2)
ip addr show                    # All interfaces
ip addr show eth0               # Specific interface
ip link show                    # Link status
ip -s link show eth0            # Interface statistics

# Legacy command (deprecated but still common)
ifconfig                        # All interfaces
ifconfig eth0                   # Specific interface
```

**Example output:**
```bash
$ ip addr show eth0
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:0c:29:xx:xx:xx brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic eth0
       valid_lft 86394sec preferred_lft 86394sec
    inet6 fe80::xxxx:xxxx:xxxx:xxxx/64 scope link
       valid_lft forever preferred_lft forever
```

**Managing interfaces:**
```bash
# Enable/disable interface
sudo ip link set eth0 up        # Enable
sudo ip link set eth0 down      # Disable

# Assign IP address
sudo ip addr add 192.168.1.100/24 dev eth0
sudo ip addr del 192.168.1.100/24 dev eth0

# Temporary (lost after reboot)
# For persistent configuration, use:
# - /etc/network/interfaces (Debian/Ubuntu)
# - NetworkManager
# - netplan (Ubuntu 18.04+)
```

### IP Addressing and Routing

**IP addressing:**
```bash
IPv4: 192.168.1.100               # 32-bit, four octets
IPv6: fe80::1234:5678:90ab:cdef   # 128-bit, eight groups
CIDR notation: 192.168.1.0/24     # subnet mask
```

**Viewing routing table:**
```bash
# Modern
ip route show
ip route get 8.8.8.8            # Route to specific destination

# Legacy
route -n
netstat -rn
```

**Example routing table:**
```bash
$ ip route show
default via 192.168.1.1 dev eth0 proto dhcp metric 100
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100 metric 100
```

**Managing routes:**
```bash
# Add default gateway
sudo ip route add default via 192.168.1.1

# Add specific route
sudo ip route add 10.0.0.0/8 via 192.168.1.254

# Delete route
sudo ip route del 10.0.0.0/8
```

### DNS Resolution

DNS translates domain names to IP addresses.

**DNS configuration:**
```bash
# System DNS configuration
/etc/resolv.conf                # DNS servers

# Example:
nameserver 8.8.8.8
nameserver 8.8.4.4
search example.com
```

**DNS lookup tools:**
```bash
# nslookup (simple)
nslookup google.com
nslookup google.com 8.8.8.8    # Query specific DNS server

# host (simple)
host google.com
host -t MX google.com          # Mail servers

# dig (detailed)
dig google.com
dig google.com +short          # Just the answer
dig @8.8.8.8 google.com        # Query specific server
dig google.com MX              # Mail records
dig google.com ANY             # All records
```

### Network Testing and Troubleshooting

**Connectivity testing:**
```bash
# Ping (ICMP echo)
ping 8.8.8.8                    # Test connectivity
ping -c 4 google.com            # Send 4 packets only
ping -i 2 google.com            # 2-second interval

# Traceroute (path to destination)
traceroute google.com
traceroute -n google.com        # No DNS resolution (faster)
mtr google.com                  # Continuous traceroute
```

**Port testing:**
```bash
# Check listening ports
ss -tulnp                       # Modern (faster than netstat)
netstat -tulnp                  # Legacy
sudo ss -tulnp                  # With process names

# Test specific port
nc -zv google.com 80            # Test if port 80 is open
telnet google.com 80            # Interactive connection
curl -v telnet://google.com:80  # Using curl

# Show what's using a port
sudo lsof -i :80
sudo ss -tulnp | grep :80
```

**Explanation of ss/netstat flags:**
- `t` - TCP connections
- `u` - UDP connections
- `l` - Listening sockets
- `n` - Numeric (don't resolve names)
- `p` - Show process

**Connection states:**
```bash
# View connection states
ss -tan                         # All TCP connections (-a = all)
ss -tulnp                       # Listening TCP/UDP with process info
ss -tunap                       # All TCP/UDP with process info

# Common states:
# LISTEN      - Waiting for connections
# ESTABLISHED - Active connection
# TIME_WAIT   - Connection closed, waiting for packets to expire
# CLOSE_WAIT  - Remote end closed connection
# SYN_SENT    - Attempting to establish connection
```

### Network Configuration Tools

Linux offers different tools for network configuration. While interchangeable, each is optimized for different use cases:

**NetworkManager (typical: desktops/laptops):**
- Best for: Dynamic networks, WiFi, VPNs, frequent network changes
- Config files: `/etc/NetworkManager/system-connections/`
- Main config: `/etc/NetworkManager/NetworkManager.conf`

```bash
# Command-line interface
nmcli device status             # Device status
nmcli connection show           # Show connections
nmcli connection up eth0        # Activate connection
nmcli connection down eth0      # Deactivate connection

# Interactive TUI
nmtui                           # Text UI for NetworkManager
```

**systemd-networkd (typical: servers):**
- Best for: Static configurations, minimal overhead, file-based management
```bash
# Configuration files in /etc/systemd/network/

# Example: /etc/systemd/network/20-wired.network
[Match]
Name=eth0

[Network]
DHCP=yes
# Or static:
# Address=192.168.1.100/24
# Gateway=192.168.1.1
# DNS=8.8.8.8

# Restart service
sudo systemctl restart systemd-networkd
```

**Netplan (Ubuntu 18.04+):**
```yaml
# /etc/netplan/01-netcfg.yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      dhcp4: true
      # Or static:
      # addresses:
      #   - 192.168.1.100/24
      # gateway4: 192.168.1.1
      # nameservers:
      #   addresses: [8.8.8.8, 8.8.4.4]

# Apply configuration
sudo netplan apply
```

### Common Network Operations

**Download files:**
```bash
# wget
wget https://example.com/file.tar.gz
wget -O output.tar.gz https://example.com/file.tar.gz

# curl
curl -O https://example.com/file.tar.gz
curl -o output.tar.gz https://example.com/file.tar.gz

# Resume download
wget -c https://example.com/large-file.iso
curl -C - -O https://example.com/large-file.iso
```

**SSH (Secure Shell):**
```bash
# Connect to remote system
ssh user@hostname
ssh -p 2222 user@hostname        # Custom port
ssh -i keyfile user@hostname     # Specific key

# File transfer (scp)
scp file.txt user@host:/path     # Copy to remote
scp user@host:/path/file.txt .   # Copy from remote
scp -r directory user@host:/path # Copy directory

# File transfer (rsync - better for large transfers)
rsync -avz file.txt user@host:/path
rsync -avz --progress directory/ user@host:/path/
```

## Key Takeaways

- Linux is **layered** (Hardware → Kernel → User Space)
- **System calls** bridge user space and kernel space
- **Everything is a file** simplifies system operations
- **Permissions** provide security and multi-user support
- **systemd** manages services and system state
- **Package managers** handle software lifecycle
- **Networking** follows standard TCP/IP model

