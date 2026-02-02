/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(__webpack_require__(1));
const fs = __importStar(__webpack_require__(2));
const path = __importStar(__webpack_require__(3));

// Helper function to format bytes as human-readable size
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

// Helper function to generate timestamp in YYYYMMDD-HH-MM-SS format (no colons for filesystem compatibility)
function generateTimestamp() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = now.getFullYear();
    const mm = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    const hh = pad(now.getHours());
    const min = pad(now.getMinutes());
    const ss = pad(now.getSeconds());
    return `${yyyy}${mm}${dd}-${hh}-${min}-${ss}`;
}

// Helper function to calculate snapshot size from disk
function getSnapshotSize(snapshotPath) {
    if (!fs.existsSync(snapshotPath)) return 0;
    let totalSize = 0;
    const walkDir = (dir) => {
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    walkDir(fullPath);
                } else {
                    const stats = fs.statSync(fullPath);
                    totalSize += stats.size;
                }
            }
        } catch (error) {
            console.error(`Error calculating size for ${dir}:`, error);
        }
    };
    walkDir(snapshotPath);
    return totalSize;
}

function activate(context) {
    // Create backup directory if it doesn't exist
    const createBackupDir = (workspacePath) => {
        const backupPath = path.join(workspacePath, '.backup');
        if (!fs.existsSync(backupPath)) {
            fs.mkdirSync(backupPath, { recursive: true });
        }
        return backupPath;
    };

    // Load snapshots metadata
    const loadSnapshots = (workspacePath) => {
        const metadataPath = path.join(workspacePath, '.backup', 'metadata.json');
        if (fs.existsSync(metadataPath)) {
            try {
                return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            } catch (error) {
                console.error('Error loading snapshots metadata:', error);
                return [];
            }
        }
        return [];
    };

    // Save snapshots metadata
    const saveSnapshots = (workspacePath, snapshots) => {
        const metadataPath = path.join(workspacePath, '.backup', 'metadata.json');
        try {
            fs.writeFileSync(metadataPath, JSON.stringify(snapshots, null, 2));
        } catch (error) {
            console.error('Error saving snapshots metadata:', error);
            throw error;
        }
    };

    // Helper to get workspace path safely
    const getWorkspacePath = () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return null;
        }
        return workspaceFolders[0].uri.fsPath;
    };

    // Helper to get snapshot info (file count and size string)
    const getSnapshotInfo = (snapshot, workspacePath) => {
        const fileCount = typeof snapshot.files === 'number' ? snapshot.files : (Array.isArray(snapshot.files) ? snapshot.files.length : 0);
        let sizeStr = 'unknown';
        if (snapshot.size) {
            sizeStr = formatBytes(snapshot.size);
        } else {
            // Calculate size from disk for legacy snapshots
            const snapshotPath = path.join(workspacePath, '.backup', snapshot.name);
            const calculatedSize = getSnapshotSize(snapshotPath);
            sizeStr = calculatedSize > 0 ? formatBytes(calculatedSize) : 'unknown';
        }
        return { fileCount, sizeStr };
    };

    // Helper function to recursively delete a directory
    function deleteDirectoryRecursive(dirPath) {
        if (fs.existsSync(dirPath)) {
            fs.readdirSync(dirPath).forEach((file) => {
                const curPath = path.join(dirPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    deleteDirectoryRecursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(dirPath);
        }
    }

    // Create snapshot command
    let createSnapshotCommand = vscode.commands.registerCommand('snapit.createSnapshot', async () => {
        const workspacePath = getWorkspacePath();
        if (!workspacePath) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }

        const backupPath = createBackupDir(workspacePath);
        const snapshots = loadSnapshots(workspacePath);

        if (snapshots.length >= 100) {
            vscode.window.showErrorMessage('Maximum number of snapshots (100) reached. Please delete some snapshots first.');
            return;
        }

        // Generate default timestamp
        const defaultName = generateTimestamp();

        const snapshotName = await vscode.window.showInputBox({
            prompt: 'Enter snapshot name',
            value: defaultName,
            valueSelection: [0, defaultName.length],
            placeHolder: 'e.g., ' + defaultName
        });

        if (!snapshotName || snapshotName.trim() === '') {
            return;
        }

        const trimmedName = snapshotName.trim();
        
        // Check if snapshot already exists
        if (snapshots.some(s => s.name === trimmedName)) {
            vscode.window.showErrorMessage(`Snapshot "${trimmedName}" already exists.`);
            return;
        }

        // Ask for optional commit message
        const commitMessage = await vscode.window.showInputBox({
            prompt: 'Enter commit message (optional)',
            placeHolder: 'Leave empty to use timestamp only',
            valueSelection: [0, 0]
        });

        const message = commitMessage?.trim() || defaultName;

        try {
            const snapshotPath = path.join(backupPath, trimmedName);
            fs.mkdirSync(snapshotPath, { recursive: true });

            // Copy all files
            const files = [];
            let totalSize = 0;
            const copyFiles = (dirPath, relativePath = '') => {
                const entries = fs.readdirSync(dirPath, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dirPath, entry.name);
                    const relPath = relativePath ? path.join(relativePath, entry.name) : entry.name;

                    if (entry.isDirectory()) {
                        // Skip backup, build artifacts, and hidden directories
                        const excludedDirs = ['.backup', 'node_modules', 'out', '.git', '.vscode', 'build', '.next'];
                        if (!excludedDirs.includes(entry.name) && !entry.name.startsWith('.')) {
                            const targetDir = path.join(snapshotPath, relPath);
                            fs.mkdirSync(targetDir, { recursive: true });
                            copyFiles(fullPath, relPath);
                        }
                    } else {
                        // Skip hidden files
                        if (!entry.name.startsWith('.')) {
                            const targetFile = path.join(snapshotPath, relPath);
                            fs.copyFileSync(fullPath, targetFile);
                            const stats = fs.statSync(targetFile);
                            totalSize += stats.size;
                            files.push(relPath);
                        }
                    }
                }
            };

            copyFiles(workspacePath);

            // Update metadata
            snapshots.push({
                name: trimmedName,
                date: new Date().toISOString(),
                message: message,
                files: files.length,
                size: totalSize,
            });
            saveSnapshots(workspacePath, snapshots);

            vscode.window.showInformationMessage(`Snapshot "${trimmedName}" created successfully (${files.length} files, ${formatBytes(totalSize)})`);
            snapshotProvider.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error('Error creating snapshot:', error);
        }
    });

    // Restore snapshot command
    let restoreSnapshotCommand = vscode.commands.registerCommand('snapit.restoreSnapshot', async () => {
        const workspacePath = getWorkspacePath();
        if (!workspacePath) return;

        const snapshots = loadSnapshots(workspacePath);

        if (snapshots.length === 0) {
            vscode.window.showErrorMessage('No snapshots available');
            return;
        }

        const snapshotItems = snapshots.map(s => {
            const { fileCount, sizeStr } = getSnapshotInfo(s, workspacePath);
            return {
                label: s.name,
                description: new Date(s.date).toLocaleString(),
                detail: `${fileCount} files, ${sizeStr}`
            };
        });

        const selected = await vscode.window.showQuickPick(snapshotItems, {
            placeHolder: 'Select snapshot to restore'
        });

        if (!selected) return;

        const snapshot = snapshots.find(s => s.name === selected.label);
        if (!snapshot) return;

        const { fileCount, sizeStr } = getSnapshotInfo(snapshot, workspacePath);

        // Single clear confirmation dialog
        const confirmed = await vscode.window.showWarningMessage(
            `Restore snapshot "${snapshot.name}"?\n\nThis will overwrite ${fileCount} files (${sizeStr}).\nThis action cannot be undone.`,
            'Yes, Restore',
            'Cancel'
        );

        if (confirmed !== 'Yes, Restore') return;

        try {
            const snapshotPath = path.join(workspacePath, '.backup', snapshot.name);

            // Get list of files to restore
            const filesToRestore = typeof snapshot.files === 'string' ? [] : (Array.isArray(snapshot.files) ? snapshot.files : []);
            
            // If metadata is old format with array of files, use it; otherwise rebuild
            let files = filesToRestore;
            if (files.length === 0 && fs.existsSync(snapshotPath)) {
                const walkDir = (dir, base = '') => {
                    const entries = fs.readdirSync(dir, { withFileTypes: true });
                    for (const entry of entries) {
                        const fullPath = path.join(dir, entry.name);
                        const relPath = base ? path.join(base, entry.name) : entry.name;
                        if (entry.isDirectory()) {
                            walkDir(fullPath, relPath);
                        } else {
                            files.push(relPath);
                        }
                    }
                };
                walkDir(snapshotPath);
            }

            // Restore files
            for (const file of files) {
                const sourcePath = path.join(snapshotPath, file);
                const targetPath = path.join(workspacePath, file);
                const targetDir = path.dirname(targetPath);

                fs.mkdirSync(targetDir, { recursive: true });
                fs.copyFileSync(sourcePath, targetPath);
            }

            vscode.window.showInformationMessage(`Snapshot "${snapshot.name}" restored successfully`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to restore snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error('Error restoring snapshot:', error);
        }
    });

    // List snapshots command
    let listSnapshotsCommand = vscode.commands.registerCommand('snapit.listSnapshots', async () => {
        const workspacePath = getWorkspacePath();
        if (!workspacePath) return;

        const snapshots = loadSnapshots(workspacePath);

        if (snapshots.length === 0) {
            vscode.window.showInformationMessage('No snapshots available');
            return;
        }

        // Create QuickPick items with detailed information
        const items = snapshots.map(s => {
            const date = new Date(s.date);
            const { fileCount, sizeStr } = getSnapshotInfo(s, workspacePath);
            return {
                label: s.name,
                description: `${s.message || '(no message)'}`,
                detail: `${date.toLocaleString()} | ${fileCount} files, ${sizeStr}`,
            };
        });

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a snapshot to view details or restore'
        });

        if (!selected) return;

        const snapshot = snapshots.find(s => s.name === selected.label);
        if (!snapshot) return;

        const { fileCount, sizeStr } = getSnapshotInfo(snapshot, workspacePath);
        const date = new Date(snapshot.date);
        
        const action = await vscode.window.showInformationMessage(
            `Snapshot: ${snapshot.name}\nMessage: ${snapshot.message || '(none)'}\nCreated: ${date.toLocaleString()}\nFiles: ${fileCount}\nSize: ${sizeStr}`,
            'Restore',
            'Delete',
            'Cancel'
        );

        if (action === 'Restore') {
            // Single clear confirmation dialog
            const confirmed = await vscode.window.showWarningMessage(
                `Restore snapshot "${snapshot.name}"?\n\nThis will overwrite ${fileCount} files (${sizeStr}).\nThis action cannot be undone.`,
                'Yes, Restore',
                'Cancel'
            );

            if (confirmed !== 'Yes, Restore') return;

            try {
                const snapshotPath = path.join(workspacePath, '.backup', snapshot.name);
                const filesToRestore = typeof snapshot.files === 'string' ? [] : (Array.isArray(snapshot.files) ? snapshot.files : []);
                
                let files = filesToRestore;
                if (files.length === 0 && fs.existsSync(snapshotPath)) {
                    const walkDir = (dir, base = '') => {
                        const entries = fs.readdirSync(dir, { withFileTypes: true });
                        for (const entry of entries) {
                            const fullPath = path.join(dir, entry.name);
                            const relPath = base ? path.join(base, entry.name) : entry.name;
                            if (entry.isDirectory()) {
                                walkDir(fullPath, relPath);
                            } else {
                                files.push(relPath);
                            }
                        }
                    };
                    walkDir(snapshotPath);
                }

                for (const file of files) {
                    const sourcePath = path.join(snapshotPath, file);
                    const targetPath = path.join(workspacePath, file);
                    const targetDir = path.dirname(targetPath);

                    fs.mkdirSync(targetDir, { recursive: true });
                    fs.copyFileSync(sourcePath, targetPath);
                }

                vscode.window.showInformationMessage(`Snapshot "${snapshot.name}" restored successfully`);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to restore snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
                console.error('Error restoring snapshot:', error);
            }
        } else if (action === 'Delete') {
            // Perform two-step delete confirmation
            const confirm = await vscode.window.showWarningMessage(
                `Delete snapshot "${snapshot.name}"?\nThis will remove ${fileCount} files (${sizeStr}).`,
                'Continue',
                'Cancel'
            );

            if (confirm !== 'Continue') return;

            const finalConfirm = await vscode.window.showWarningMessage(
                'This action cannot be undone. Are you absolutely sure?',
                'Yes, Delete',
                'Cancel'
            );

            if (finalConfirm !== 'Yes, Delete') return;

            try {
                const snapshotPath = path.join(workspacePath, '.backup', snapshot.name);
                deleteDirectoryRecursive(snapshotPath);

                // Update metadata
                const metadataPath = path.join(workspacePath, '.backup', 'metadata.json');
                const updatedSnapshots = snapshots.filter(s => s.name !== snapshot.name);
                fs.writeFileSync(metadataPath, JSON.stringify(updatedSnapshots, null, 2));

                vscode.window.showInformationMessage(`Snapshot "${snapshot.name}" deleted successfully`);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to delete snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
                console.error('Error deleting snapshot:', error);
            }
        }
    });

    context.subscriptions.push(createSnapshotCommand);
    context.subscriptions.push(restoreSnapshotCommand);
    context.subscriptions.push(listSnapshotsCommand);

    // Snapshot Tree Provider
    class SnapshotTreeProvider {
        constructor() {
            this._onDidChangeTreeData = new vscode.EventEmitter();
            this.onDidChangeTreeData = this._onDidChangeTreeData.event;
            this.selectedSnapshot = null;
        }

        refresh() {
            this._onDidChangeTreeData.fire(undefined);
        }

        getTreeItem(element) {
            return element;
        }

        getChildren(element) {
            console.log('SnapshotTreeProvider.getChildren called with element:', element);
            const workspacePath = getWorkspacePath();
            console.log('Workspace path:', workspacePath);
            
            if (element === undefined) {
                // Root level - show action items and snapshots
                const children = [];
                
                // Add "Create Snapshot" action button
                const createItem = new vscode.TreeItem('+ Create Snapshot', vscode.TreeItemCollapsibleState.None);
                createItem.iconPath = new vscode.ThemeIcon('add');
                createItem.command = {
                    command: 'snapit.createSnapshot',
                    title: 'Create Snapshot'
                };
                createItem.contextValue = 'action';
                children.push(createItem);
                
                if (workspacePath) {
                    // Load snapshots from workspace
                    const snapshots = loadSnapshots(workspacePath);
                    console.log('Loaded snapshots:', snapshots);
                    
                    // Add separator (optional visual break)
                    if (snapshots.length > 0) {
                        const separatorItem = new vscode.TreeItem('─────────────', vscode.TreeItemCollapsibleState.None);
                        separatorItem.iconPath = new vscode.ThemeIcon('dash');
                        children.push(separatorItem);
                    }
                    
                    // Add snapshot items
                    for (const snapshot of snapshots) {
                        const { fileCount, sizeStr } = getSnapshotInfo(snapshot, workspacePath);
                        const item = new vscode.TreeItem(snapshot.name, vscode.TreeItemCollapsibleState.None);
                        item.description = new Date(snapshot.date).toLocaleString();
                        item.tooltip = `${snapshot.message || '(no message)'}\n${fileCount} files, ${sizeStr}`;
                        item.contextValue = 'snapshot';
                        item.iconPath = new vscode.ThemeIcon('circle-filled');
                        // Store the snapshot object in the item for later retrieval
                        item.snapshotData = snapshot;
                        children.push(item);
                    }
                }
                
                // Add Settings action at the bottom
                const settingsItem = new vscode.TreeItem('⚙ Settings', vscode.TreeItemCollapsibleState.None);
                settingsItem.iconPath = new vscode.ThemeIcon('settings');
                settingsItem.command = {
                    command: 'workbench.action.openSettings',
                    title: 'Open Settings',
                    arguments: ['snapit']
                };
                settingsItem.contextValue = 'action';
                children.push(settingsItem);
                
                console.log('Returning children:', children.length);
                return children;
            }
            return [];
        }
    }

    const snapshotProvider = new SnapshotTreeProvider();
    vscode.window.registerTreeDataProvider('snapit.snapshotList', snapshotProvider);
    
    // Initial refresh to load snapshots on activation
    // Use setTimeout to ensure VS Code has fully initialized the tree view
    setTimeout(() => {
        snapshotProvider.refresh();
    }, 100);

    // Refresh snapshots command
    let refreshSnapshotsCommand = vscode.commands.registerCommand('snapit.refreshSnapshots', () => {
        snapshotProvider.refresh();
    });
    context.subscriptions.push(refreshSnapshotsCommand);

    // Snapshot details popup command
    let snapshotDetailsCommand = vscode.commands.registerCommand('snapit.snapshotDetails', async (snapshot) => {
        const workspacePath = getWorkspacePath();
        if (!workspacePath || !snapshot) return;

        const { fileCount, sizeStr } = getSnapshotInfo(snapshot, workspacePath);
        const message = snapshot.message || '(no message)';
        const date = new Date(snapshot.date).toLocaleString();

        const action = await vscode.window.showInformationMessage(
            `Snapshot: ${snapshot.name}\nDate: ${date}\nMessage: ${message}\nFiles: ${fileCount}, Size: ${sizeStr}`,
            'Restore',
            'Delete',
            'Cancel'
        );

        if (action === 'Restore') {
            vscode.commands.executeCommand('snapit.snapshotRestore', snapshot);
        } else if (action === 'Delete') {
            vscode.commands.executeCommand('snapit.snapshotDelete', snapshot);
        }
    });
    context.subscriptions.push(snapshotDetailsCommand);

    // Snapshot restore from sidebar command
    let sidebarRestoreCommand = vscode.commands.registerCommand('snapit.snapshotRestore', async (item) => {
        const workspacePath = getWorkspacePath();
        if (!workspacePath) return;
        
        // Handle both tree item context menu and direct snapshot object calls
        let snapshot = item;
        if (item && item.snapshotData) {
            snapshot = item.snapshotData;
        }
        
        if (!snapshot || !snapshot.name) return;

        const { fileCount, sizeStr } = getSnapshotInfo(snapshot, workspacePath);

        const confirmed = await vscode.window.showWarningMessage(
            `Restore snapshot "${snapshot.name}"?\n\nThis will overwrite ${fileCount} files (${sizeStr}).\nThis action cannot be undone.`,
            'Yes, Restore',
            'Cancel'
        );

        if (confirmed !== 'Yes, Restore') return;

        try {
            const snapshotPath = path.join(workspacePath, '.backup', snapshot.name);

            let files = [];
            if (fs.existsSync(snapshotPath)) {
                const walkDir = (dir, base = '') => {
                    const entries = fs.readdirSync(dir, { withFileTypes: true });
                    for (const entry of entries) {
                        const fullPath = path.join(dir, entry.name);
                        const relPath = base ? path.join(base, entry.name) : entry.name;
                        if (entry.isDirectory()) {
                            walkDir(fullPath, relPath);
                        } else {
                            files.push(relPath);
                        }
                    }
                };
                walkDir(snapshotPath);
            }

            for (const file of files) {
                const sourcePath = path.join(snapshotPath, file);
                const targetPath = path.join(workspacePath, file);
                const targetDir = path.dirname(targetPath);

                fs.mkdirSync(targetDir, { recursive: true });
                fs.copyFileSync(sourcePath, targetPath);
            }

            vscode.window.showInformationMessage(`Snapshot "${snapshot.name}" restored successfully`);
            snapshotProvider.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to restore snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error('Error restoring snapshot:', error);
        }
    });
    context.subscriptions.push(sidebarRestoreCommand);

    // Snapshot delete from sidebar command
    let sidebarDeleteCommand = vscode.commands.registerCommand('snapit.snapshotDelete', async (item) => {
        const workspacePath = getWorkspacePath();
        if (!workspacePath) return;
        
        // Handle both tree item context menu and direct snapshot object calls
        let snapshot = item;
        if (item && item.snapshotData) {
            snapshot = item.snapshotData;
        }
        
        if (!snapshot || !snapshot.name) return;

        const { fileCount, sizeStr } = getSnapshotInfo(snapshot, workspacePath);

        const confirmed = await vscode.window.showWarningMessage(
            `Delete snapshot "${snapshot.name}"?\n\nThis will remove ${fileCount} files (${sizeStr}).\nThis action cannot be undone.`,
            'Yes, Delete',
            'Cancel'
        );

        if (confirmed !== 'Yes, Delete') return;

        try {
            const snapshotPath = path.join(workspacePath, '.backup', snapshot.name);
            deleteDirectoryRecursive(snapshotPath);

            const metadataPath = path.join(workspacePath, '.backup', 'metadata.json');
            const snapshots = loadSnapshots(workspacePath);
            const updatedSnapshots = snapshots.filter(s => s.name !== snapshot.name);
            fs.writeFileSync(metadataPath, JSON.stringify(updatedSnapshots, null, 2));

            vscode.window.showInformationMessage(`Snapshot "${snapshot.name}" deleted successfully`);
            snapshotProvider.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to delete snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error('Error deleting snapshot:', error);
        }
    });
    context.subscriptions.push(sidebarDeleteCommand);

    // Delete snapshot command
    let deleteSnapshotCommand = vscode.commands.registerCommand('snapit.deleteSnapshot', async () => {
        const workspacePath = getWorkspacePath();
        if (!workspacePath) return;

        const snapshots = loadSnapshots(workspacePath);

        if (snapshots.length === 0) {
            vscode.window.showErrorMessage('No snapshots available to delete');
            return;
        }

        // Create QuickPick items for deletion
        const items = snapshots.map(s => {
            const date = new Date(s.date);
            const { fileCount, sizeStr } = getSnapshotInfo(s, workspacePath);
            return {
                label: s.name,
                description: `${date.toLocaleString()}`,
                detail: `${fileCount} files, ${sizeStr}`,
            };
        });

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a snapshot to delete'
        });

        if (!selected) return;

        const snapshot = snapshots.find(s => s.name === selected.label);
        if (!snapshot) return;

        const { fileCount, sizeStr } = getSnapshotInfo(snapshot, workspacePath);

        // Single clear confirmation dialog
        const confirmed = await vscode.window.showWarningMessage(
            `Delete snapshot "${snapshot.name}"?\n\nThis will remove ${fileCount} files (${sizeStr}).\nThis action cannot be undone.`,
            'Yes, Delete',
            'Cancel'
        );

        if (confirmed !== 'Yes, Delete') return;

        try {
            const snapshotPath = path.join(workspacePath, '.backup', snapshot.name);
            deleteDirectoryRecursive(snapshotPath);

            // Remove from metadata
            const updatedSnapshots = snapshots.filter(s => s.name !== snapshot.name);
            saveSnapshots(workspacePath, updatedSnapshots);

            vscode.window.showInformationMessage(`Snapshot "${snapshot.name}" deleted successfully`);
            snapshotProvider.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to delete snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error('Error deleting snapshot:', error);
        }
    });

    context.subscriptions.push(deleteSnapshotCommand);
}

function deactivate() { }

/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("path");

/***/ })
/******/ 	]);
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ })();
//# sourceMappingURL=extension.js.map
