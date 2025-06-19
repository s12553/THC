/**
 * Command Handling Module
 * Handles all terminal commands
 */

// 命令处理函数映射
const commandHandlers = {
    help: handleHelp,
    login: handleLogin,
    access: handleAccess,
    logout: handleLogout,
    clear: handleClear,
    add: handleAdd,
    list: handleList,
    mark: handleMark,
    searchstatus: handleSearchStatus,
    mailbox: handleMailbox,
    sync: handleSync
};

// 处理命令
function handleCommand(command) {
    addOutput(command, true);
    
    if (!currentUser) {
        handleUnauthenticated(command);
    } else {
        const parts = command.split(' ');
        const cmd = parts[0].toLowerCase();
        
        if (commandHandlers[cmd]) {
            commandHandlers[cmd](parts);
        } else {
            addOutput('<div class="error">ERROR: Unknown command or insufficient privileges</div>');
            addOutput('<div>Type HELP for available commands</div>');
        }
    }
}

// 未认证状态处理
function handleUnauthenticated(command) {
    if (command.toLowerCase() === 'login') {
        addOutput('<div class="login-prompt">Enter user credentials (format: username | password)</div>');
    } else if (usersData[command]) {
        currentUser = usersData[command];
        addOutput(`<div class="user-info">Credentials accepted. User: ${currentUser.name}<br>Position: ${currentUser.role}, ${currentUser.site}<br>Clearance Level: ${currentUser.level}</div>`);
        addOutput('<div class="command-prompt">Enter command (Type HELP for available commands)</div>');
    } else {
        addOutput('<div class="error">ERROR: Invalid credentials or command</div>');
        addOutput('<div>Available commands: LOGIN</div>');
    }
}

// 帮助命令
function handleHelp() {
    let helpText = '<div class="system-info">Available commands:<br>';
    helpText += 'ACCESS [SCP-NUMBER] - Retrieve SCP documentation<br>';
    helpText += 'LOGOUT - Terminate current session<br>';
    helpText += 'CLEAR - Clear terminal screen<br>';
    helpText += 'HELP - Show command information<br>';
    
    // 管理员命令
    if (currentUser.level >= 2) {
        helpText += '<span class="admin-only">ADMIN COMMANDS:<br>';
        helpText += 'ADD ACCESS - Add new SCP document<br>';
        helpText += 'LIST ARTICLES - Display all available SCP documents</span>';
    }
    
    // O5命令
    if (currentUser.level >= 6) {
        helpText += '<span class="admin-only">O5 COMMANDS:<br>';
        helpText += 'MARK [NEW_MARK] - Reclassify item<br>';
        helpText += 'SEARCHSTATUS [MARKER] - Check item status<br>';
        helpText += 'MAILBOX CHECK-DRAFT [ID] - Access draft emails</span>';
    }
    
    helpText += '<br>SYNC COMMANDS:<br>';
    helpText += 'SYNC UPLOAD [USER/REPO] [TOKEN] - Upload data to GitHub<br>';
    helpText += 'SYNC DOWNLOAD [USER/REPO] [TOKEN] - Download data from GitHub<br>';
    helpText += '</div>';
    
    addOutput(helpText);
}

// 登录处理
function handleLogin(parts) {
    addOutput('<div class="login-prompt">Enter user credentials (format: username | password)</div>');
}

// 访问SCP文档
function handleAccess(parts) {
    if (parts.length < 2) {
        addOutput('<div class="error">ERROR: Missing SCP designation</div>');
        addOutput('<div>Usage: ACCESS [SCP-NUMBER]</div>');
        return;
    }
    
    const articleId = parts[1];
    
    if (!contentData.articles[articleId]) {
        addOutput(`<div class="error">ERROR: Document SCP-${articleId} not found</div>`);
        return;
    }
    
    const article = contentData.articles[articleId];
    if (currentUser.level < article.minLevel) {
        showPermissionWarning(article.minLevel);
        return;
    }
    
    addOutput(`<div class="user-info">User: ${currentUser.name}<br>Position: ${currentUser.role}, ${currentUser.site}<br>Retrieving SCP-${articleId} - ${article.title}<span class="permission-indicator level-${currentUser.level}">Level ${currentUser.level}</span></div>`);
    addOutput('<hr>');
    addOutput(`<div class="scp-header">SCP-${articleId} DOCUMENTATION - ${article.title}</div>`);
    addOutput(`<div class="scp-item">${article.content.replace(/\n/g, '<br>')}</div>`);
}

// 登出
function handleLogout() {
    addOutput(`<div class="success">User ${currentUser.name} logged out</div>`);
    currentUser = null;
    addOutput('<div class="login-prompt">> Type LOGIN to begin authentication</div>');
}

// 清除终端
function handleClear() {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = '';
    addOutput('<div class="output-line">SCP Foundation Terminal Access System</div>');
    
    if (currentUser) {
        addOutput(`<div class="user-info">User: ${currentUser.name}<br>Position: ${currentUser.role}, ${currentUser.site}<br>Clearance Level: ${currentUser.level}</div>`);
        addOutput('<div class="command-prompt">Enter command (Type HELP for available commands)</div>');
    } else {
        addOutput('<div class="login-prompt">> Type LOGIN to begin authentication</div>');
    }
}

// 添加文档
function handleAdd(parts) {
    if (parts[1]?.toLowerCase() !== 'access') {
        addOutput('<div class="error">ERROR: Invalid ADD command</div>');
        return;
    }
    
    if (currentUser.level < 2) {
        addOutput('<div class="error">ERROR: Requires Level 2+ privileges</div>');
        return;
    }
    
    if (parts.length < 5) {
        addOutput('<div class="error">Format: ADD ACCESS [ID] [MIN_LEVEL] "[TITLE]" "[CONTENT]"</div>');
        addOutput('<div>Example: ADD ACCESS 999 1 "SCP-999" "Item #: SCP-999\nObject Class: Safe..."</div>');
        return;
    }
    
    const articleId = parts[2];
    const minLevel = parseInt(parts[3]);
    
    if (isNaN(minLevel)) {
        addOutput('<div class="error">ERROR: Invalid minimum level</div>');
        return;
    }
    
    // 提取标题和内容
    const titleStart = command.indexOf('"');
    const titleEnd = command.indexOf('"', titleStart + 1);
    const contentStart = command.indexOf('"', titleEnd + 1);
    const contentEnd = command.indexOf('"', contentStart + 1);
    
    if (titleStart === -1 || titleEnd === -1 || contentStart === -1 || contentEnd === -1) {
        addOutput('<div class="error">ERROR: Invalid format. Make sure title and content are in double quotes</div>');
        return;
    }
    
    const title = command.substring(titleStart + 1, titleEnd);
    const content = command.substring(contentStart + 1, contentEnd);
    
    // 创建新文档
    contentData.articles[articleId] = {
        title: title,
        minLevel: minLevel,
        content: content
    };
    
    // 保存到本地存储
    localStorage.setItem('contentData', JSON.stringify(contentData));
    
    addOutput(`<div class="success">Document SCP-${articleId} added successfully (Min Level: ${minLevel})</div>`);
}

// 列出文档
function handleList(parts) {
    if (parts[1]?.toLowerCase() !== 'articles') {
        addOutput('<div class="error">ERROR: Invalid LIST command</div>');
        return;
    }
    
    addOutput('<div class="system-info">Available documents:</div>');
    for (const id in contentData.articles) {
        const article = contentData.articles[id];
        addOutput(`<div>SCP-${id}: ${article.title} (Min Level: ${article.minLevel})</div>`);
    }
}

// O5命令：标记项目
function handleMark(parts) {
    if (currentUser.level < 6) {
        addOutput('<div class="error">ERROR: Requires Level 6 (O5 Council) privileges</div>');
        return;
    }
    
    if (parts.length < 2) {
        addOutput('<div class="error">ERROR: Missing new marker designation</div>');
        return;
    }
    
    const newMark = parts[1];
    addOutput(`<div class="success">Item has been re-marked as ${newMark}.</div>`);
}

// O5命令：搜索状态
function handleSearchStatus(parts) {
    if (currentUser.level < 6) {
        addOutput('<div class="error">ERROR: Requires Level 6 (O5 Council) privileges</div>');
        return;
    }
    
    if (parts.length < 2) {
        addOutput('<div class="error">ERROR: Missing marker designation</div>');
        return;
    }
    
    const marker = parts[1];
    addOutput(`<div class="system-info">Searching database for mark ${marker}...</div>`);
    
    setTimeout(() => {
        addOutput('<div class="status-list">Found 6 related items:</div>');
        addOutput('<div class="status-item">SCP-d$gaa0 <span class="status-neutralized">Status: Successfully Neutralized</span></div>');
        addOutput('<div class="status-item">SCP-Ou+os^b-RU <span class="status-neutralized">Status: Successfully Neutralized</span></div>');
        addOutput('<div class="status-item">SCP-auoâb-DE <span class="status-neutralized">Status: Successfully Neutralized</span></div>');
        addOutput('<div class="status-item">SCP-$uroois-FR <span class="status-neutralized">Status: Successfully Neutralized</span></div>');
        addOutput('<div class="status-item">SCP-ifiaâ-JP <span class="status-neutralized">Status: Successfully Neutralized</span></div>');
        addOutput('<div class="status-item">SCP-CN-2000 <span class="status-located">Status: Located</span></div>');
    }, 1500);
}

// O5命令：邮箱
function handleMailbox(parts) {
    if (currentUser.level < 6) {
        addOutput('<div class="error">ERROR: Requires Level 6 (O5 Council) privileges</div>');
        return;
    }
    
    if (parts[1]?.toLowerCase() === 'check-draft') {
        const draftId = parts[2] || '20210129-03';
        addOutput(`<div class="system-info">Opening draft mail ${draftId}...</div>`);
        
        setTimeout(() => {
            addOutput('<div class="mailbox-header">Draft Email</div>');
            addOutput('<div class="mailbox-content">To: O5 Council<br>From: O5-6<br>Subject: SCP-CN-2000 Reclassification<br><br>Per our discussion, I have reclassified SCP-CN-2000 as Neutralized and downgraded its clearance to Level 1. This item no longer poses a threat and can be archived for public research purposes.</div>');
        }, 1500);
    } else {
        addOutput('<div class="error">ERROR: Invalid mailbox command</div>');
    }
}

// 同步命令
function handleSync(parts) {
    if (parts.length < 4) {
        addOutput('<div class="error">Format: SYNC [ACTION] [USER/REPO] [TOKEN]</div>');
        addOutput('<div>Actions: UPLOAD, DOWNLOAD</div>');
        return;
    }
    
    const action = parts[1].toLowerCase();
    const repo = parts[2];
    const token = parts[3];
    
    if (action === 'upload') {
        handleSyncUpload(repo, token);
    } else if (action === 'download') {
        handleSyncDownload(repo, token);
    } else {
        addOutput('<div class="error">ERROR: Invalid sync action. Use UPLOAD or DOWNLOAD</div>');
    }
}
