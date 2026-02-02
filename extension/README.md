# SnapIT - Gitless Repository for VS Code

Lightweight snapshot management for your workspace. Create, restore, and manage code snapshots without Git complexity, now featuring a dedicated sidebar view for even faster access!

## About

**SnapIT** is a simple, powerful alternative to Git for developers who want version control without the overhead. Perfect for quick backups, learning, prototyping, or when you just need to save and restore your work with ease. Interact with SnapIT through the dedicated sidebar or the Command Palette—whichever fits your workflow.

### 🎯 Perfect For:
- **Solo Projects**: Track changes without Git complexity.
- **Learning/Teaching**: Simple version control for students.
- **Quick Prototypes**: Experiment safely with instant snapshots.
- **Casual Developers**: Version control that just works.
- **Emergency Backups**: One-click snapshots before major changes.

### 🌟 Key Features

- **Dedicated Sidebar View**: Manage all your snapshots from a convenient and intuitive tree view in the activity bar.
- **Instant Snapshots**: Save your workspace state with optional commit messages.
- **Quick Restore**: Instantly restore your project to any saved snapshot.
- **Zero Setup**: Works immediately after installation.
- **File Exclusions**: Automatically skips `node_modules`, build artifacts, and other common patterns.
- **Safety First**: Confirmation dialogs prevent accidental data loss.

## 📸 How It Works

SnapIT creates a hidden `.backup` folder in your workspace root to store snapshots. Each snapshot is a self-contained, compressed copy of your relevant files, making it easy to restore your work to any previous state. All operations are performed locally on your machine.

## 🚀 Usage

SnapIT gives you two powerful ways to manage your snapshots: the Sidebar and the Command Palette.

### Using the Sidebar View (Recommended)

The sidebar provides the most intuitive and feature-rich experience.

1.  Click the **SnapIT icon** in the VS Code Activity Bar to open the sidebar.
2.  You will see a tree view of all your saved snapshots.
3.  **Hover** over a snapshot to see action icons:
    *   **Create Snapshot**: Click the `+` icon in the view title bar to save your current workspace.
    *   **Restore Snapshot**: Click the `restore` icon next to a snapshot to return your workspace to that state.
    *   **Delete Snapshot**: Click the `delete` icon to permanently remove a snapshot.
    *   **View Details**: Click a snapshot item to see its metadata, including the commit message, creation date, and file count.

### Using the Command Palette

For keyboard-driven workflows, all features are accessible through the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).

-   `SnapIT: Create Snapshot`: Save your current workspace state. You can add an optional message.
-   `SnapIT: Restore Snapshot`: Choose from a list of existing snapshots to restore your workspace.
-   `SnapIT: List Snapshots`: View all saved snapshots with their details.
-   `SnapIT: Delete Snapshot`: Select and remove one or more unwanted snapshots.

## ⚡️ SnapIT vs Traditional Git

| Feature          | SnapIT                               | Traditional Git                            |
| ---------------- | ------------------------------------ | ------------------------------------------ |
| Learning Curve   | Minutes                              | Days/Weeks                                 |
| Primary Interface | GUI Sidebar / Visual Command Palette | Command-line focused                       |
| Setup Time       | None                                 | Repository `init` and setup required       |
| Best For         | Solo projects, quick backups, learning | Team collaboration, complex branching      |

## 🛡️ Safe and Secure

-   All snapshots are stored locally in your project's `.backup` folder.
-   No cloud storage or external services are used. Your data never leaves your computer.
-   Confirmation dialogs for restore and delete operations prevent accidental data loss.

## 📝 Smart Features

-   Automatically excludes build artifacts and dependencies (`.backup`, `node_modules`, `dist`, `.git`, etc.).
-   Timestamps are automatically generated for snapshot names.
-   Optional commit messages for each snapshot provide context.
-   Prevents duplicate snapshot names.

## 🤔 When to Use Traditional Git

SnapIT is a fantastic tool for its purpose, but you should use a full-featured version control system like Git when you need:
-   Team collaboration features (pull requests, merging).
-   Complex branch management.
-   Remote repository hosting (GitHub, GitLab).
-   Detailed commit history and diffing.

## 🤝 Contributing

Found a bug or have an idea?
-   Open an issue on [GitHub](https://github.com/PhishyBongwaters/vscode-snapit)
-   Submit a pull request
-   Share your feedback and suggestions!

## 📜 License

MIT License. See [CREDITS.md](CREDITS.md) for attribution regarding the original source project.

---
**SnapIT** — Simple snapshots, inspired by GitLite. Made with ❤️ by developers, for developers.