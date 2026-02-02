# Credits & Attribution

## Source Project

**SnapIT** is a fork and enhancement of **GitLite**, originally created by Shellomo.

- **Original Project**: [GitLite](https://github.com/Shellomo/vscode_ext_gitlite)
- **Original Author**: Shellomo
- **License**: MIT (Copyright © 2024 No Git)

## Rebranding & Enhancements by Rob MacDonald

This rebranded version includes significant improvements and new features:

### Code Improvements
- **Telemetry Removal**: Completely removed telemetry tracking and dependencies
- **Code Refactoring**: Extracted duplicate logic into reusable helper functions (`getSnapshotInfo()`, `getSnapshotSize()`, `deleteDirectoryRecursive()`)
- **Timestamp Format**: Updated snapshot naming format from `YYYYMMDD-HH:MM:SS` to `YYYYMMDD-HH-MM-SS` for Windows filesystem compatibility
- **Error Handling**: Enhanced try-catch blocks and error messaging throughout
- **Code Optimization**: Reduced code duplication by ~40 lines across extension files

### New Features
- **Commit Messages**: Optional commit message support for each snapshot (defaults to timestamp)
- **Snapshot Metadata**: Enhanced metadata storage including:
  - File counts
  - Snapshot sizes (with human-readable formatting)
  - Creation timestamps
  - Custom commit messages
- **Snapshot Size Tracking**: Display total size and file count for each snapshot
- **Two-Step Confirmation**: Safety dialogs for restore and delete operations
- **Delete Functionality**: Full snapshot deletion with metadata updates
- **Improved UX**: Single, clear confirmation dialogs with relevant information

### User Experience Enhancements
- **List View Improvements**: Display commit messages and metadata in snapshot listings
- **Size Display**: Show compressed file count and size information
- **Confirmation Dialogs**: Clear, actionable confirmations before destructive operations
- **Legacy Support**: Automatic size calculation for older snapshots without stored metadata
- **Directory Exclusion**: Pre-configured exclusion list for common artifact directories

## Version History

### SnapIT 1.0.0 (Current)
- Rebranded from GitLite
- Telemetry removal
- Code refactoring and optimization
- New snapshot features (commit messages, size tracking)
- Enhanced UX with two-step confirmations
- Full snapshot management (create, restore, list, delete)

### GitLite 1.0.5 (Original)
- Original lightweight version control for VS Code
- Basic snapshot create/restore functionality

## License

This project maintains the original **MIT License**. All modifications and enhancements are released under the same license terms.

```
MIT License

Copyright (c) 2024 No Git (Original)
Copyright (c) 2025 Rob MacDonald (Enhancements)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Contributing

To contribute improvements, bug fixes, or new features:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure code quality and documentation
5. Submit a pull request

Questions or feedback? Open an issue on the [GitHub repository](https://github.com/PhishyBongwaters/vscode-snapit).

---

**SnapIT** - Simple snapshots for your workspace, inspired by GitLite.
