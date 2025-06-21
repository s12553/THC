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
    sync: handleSync,
    search: handleSearch,
    setlevel: handleSetLevel
};

// 确保全局可用
if (typeof window !== 'undefined') {
    window.commandHandlers = window.commandHandlers || {};
    // 合并命令处理器而不是覆盖
    Object.assign(window.commandHandlers, commandHandlers);
    console.log("Command handlers registered:", Object.keys(commandHandlers));
}
// 核心命令处理函数


// 未认证状态处理
function handleUnauthenticated(command) {
    console.log("Processing unauthenticated command:", command);
    
    // 替换所有冒号为空格
    command = command.replace(/:/g, ' ');
    const parts = command.split(' ').filter(part => part !== '');
    const cmd = parts[0].toLowerCase();
    
    if (cmd === 'login') {
        if (parts.length < 2) {
            addOutput('<div class="error">ERROR: Missing username</div>');
            return;
        }
        currentLoginUsername = parts.slice(1).join(' ');
        awaitingCredentials = true;
        addOutput('<div class="login-prompt">Enter credentials (username | password):</div>');
    } else {
        addOutput('<div class="error">ERROR: Invalid command</div>');
        addOutput('<div>Available commands: LOGIN [USERNAME]</div>');
    }
}

// 凭证处理函数
function handleCredentialInput(credentials) {
    try {
        console.log("Handling credentials:", credentials);
        credentials = credentials.trim();
        
        // 验证格式
        if (!credentials.includes('|')) {
            addOutput('<div class="error">ERROR: Format must be: username | password</div>');
            awaitingCredentials = false;
            return;
        }

        // 分割凭证
        const [inputUsername, inputPassword] = credentials.split('|').map(s => s.trim());
        const credentialKey = `${inputUsername} | ${inputPassword}`;
        
        console.log("Checking credential:", credentialKey);
        
        // 验证凭证
        if (usersData[credentialKey]) {
            const user = usersData[credentialKey];
            
            // 验证用户名匹配
            if (user.name.toLowerCase() === currentLoginUsername.toLowerCase()) {
                currentUser = user;
                addOutput(`<div class="user-info">Credentials accepted. User: ${currentUser.name}<br>Position: ${currentUser.role}, ${currentUser.site}<br>Clearance Level: ${currentUser.level}</div>`);
                addOutput('<div class="command-prompt">Enter command (Type HELP for available commands)</div>');
            } else {
                addOutput(`<div class="error">ERROR: Username mismatch. Expected: ${currentLoginUsername}, Found: ${user.name}</div>`);
            }
        } else {
            addOutput('<div class="error">ERROR: Invalid credentials</div>');
        }
    } catch (error) {
        console.error("Credential processing error:", error);
        addOutput('<div class="error">SYSTEM ERROR: Credential processing failed</div>');
    } finally {
        // 重置状态
        currentLoginUsername = null;
        awaitingCredentials = false;
    }
}

// 帮助命令实现
function handleHelp(parts) {
    console.log("Handling HELP command");
    let helpText = '<div class="system-info">Available commands:<br>';
    helpText += 'ACCESS [SCP-NUMBER] - Retrieve SCP documentation<br>';
    helpText += 'SEARCH [TERM] - Search SCP documents<br>';
    helpText += 'SEARCH MARK [MARK] - Search by mark<br>';
    helpText += 'LOGOUT - Terminate current session<br>';
    helpText += 'CLEAR - Clear terminal screen<br>';
    helpText += 'HELP - Show command information<br>';
    
    if (currentUser?.level >= 2) {
        helpText += '<span class="admin-only">ADMIN COMMANDS:<br>';
        helpText += 'ADD ACCESS - Add new SCP document<br>';
        helpText += 'LIST ARTICLES - Display all available SCP documents</span>';
    }
    
    if (currentUser?.isO5) {
        helpText += '<span class="admin-only">O5 COMMANDS:<br>';
        helpText += 'MARK [SCP-NUMBER] [MARK] - Add mark to SCP<br>';
        helpText += 'SETLEVEL [SCP-NUMBER] [LEVEL] - Set access level<br>';
        helpText += 'SEARCHSTATUS [MARKER] - Check item status<br>';
        helpText += 'MAILBOX CHECK-DRAFT [ID] - Access draft emails</span>';
    }
    
    helpText += '<br>SYNC COMMANDS:<br>';
    helpText += 'SYNC UPLOAD [USER/REPO] [TOKEN] - Upload data to GitHub<br>';
    helpText += 'SYNC DOWNLOAD [USER/REPO] [TOKEN] - Download data from GitHub<br>';
    helpText += '</div>';
    
    addOutput(helpText);
}

// SCP访问命令实现
function handleAccess(parts) {
    console.log("Handling ACCESS command with parts:", parts);
    if (parts.length < 2) {
        addOutput('<div class="error">ERROR: Missing SCP designation</div>');
        addOutput('<div>Usage: ACCESS [SCP-NUMBER]</div>');
        return;
    }
    
    const articleId = parts[1];
    console.log("Requesting SCP:", articleId);
    
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
    
    if (article.marks && article.marks.length > 0) {
        addOutput('<div class="system-info">Marks: ' + article.marks.map(m => `<span class="mark-tag">${m}</span>`).join(' ') + '</div>');
    }
}

// 其他命令实现保持不变（logout, clear, list等）...
// 注意：此处应包含所有其他命令的实现，但为简洁起见省略

// 登出
function handleLogout() {
    addOutput(`<div class="success">User ${currentUser.name} logged out</div>`);
    currentUser = null;
    addOutput('<div class="login-prompt">> Type LOGIN [USERNAME] to begin authentication</div>');
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
        addOutput('<div class="login-prompt">> Type LOGIN [USERNAME] to begin authentication</div>');
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
        content: content,
        tags: [],
        marks: []
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
        if (currentUser.level >= article.minLevel) {
            addOutput(`<div>SCP-${id}: ${article.title} (Min Level: ${article.minLevel}) ${article.marks?.map(m => `<span class="mark-tag">${m}</span>`).join(' ')}</div>`);
        }
    }
}

// O5命令：添加标记
function handleMark(parts) {
    if (!currentUser?.isO5) {
        addOutput('<div class="error">ERROR: Requires O5 Council privileges</div>');
        return;
    }
    
    if (parts.length < 3) {
        addOutput('<div class="error">ERROR: Missing parameters</div>');
        addOutput('<div>Usage: MARK [SCP-NUMBER] [MARK]</div>');
        return;
    }
    
    const scpNumber = parts[1];
    const newMark = parts[2];
    
    if (!contentData.articles[scpNumber]) {
        addOutput(`<div class="error">ERROR: SCP-${scpNumber} not found</div>`);
        return;
    }
    
    if (!contentData.articles[scpNumber].marks) {
        contentData.articles[scpNumber].marks = [];
    }
    
    if (!contentData.articles[scpNumber].marks.includes(newMark)) {
        contentData.articles[scpNumber].marks.push(newMark);
        localStorage.setItem('contentData', JSON.stringify(contentData));
        addOutput(`<div class="success">Mark "${newMark}" added to SCP-${scpNumber}</div>`);
    } else {
        addOutput(`<div class="error">ERROR: Mark "${newMark}" already exists on SCP-${scpNumber}</div>`);
    }
}

// O5命令：设置权限等级
function handleSetLevel(parts) {
    if (!currentUser?.isO5) {
        addOutput('<div class="error">ERROR: Requires O5 Council privileges</div>');
        return;
    }
    
    if (parts.length < 3) {
        addOutput('<div class="error">ERROR: Missing parameters</div>');
        addOutput('<div>Usage: SETLEVEL [SCP-NUMBER] [NEW-LEVEL]</div>');
        return;
    }
    
    const scpNumber = parts[1];
    const newLevel = parseInt(parts[2]);
    
    if (!contentData.articles[scpNumber]) {
        addOutput(`<div class="error">ERROR: SCP-${scpNumber} not found</div>`);
        return;
    }
    
    if (isNaN(newLevel)) {
        addOutput('<div class="error">ERROR: Invalid level</div>');
        return;
    }
    
    contentData.articles[scpNumber].minLevel = newLevel;
    localStorage.setItem('contentData', JSON.stringify(contentData));
    addOutput(`<div class="success">SCP-${scpNumber} access level set to ${newLevel}</div>`);
}

// O5命令：搜索状态
function handleSearchStatus(parts) {
    if (!currentUser?.isO5) {
        addOutput('<div class="error">ERROR: Requires O5 Council privileges</div>');
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
    if (!currentUser?.isO5) {
        addOutput('<div class="error">ERROR: Requires O5 Council privileges</div>');
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

// 搜索命令
function handleSearch(parts) {
    if (parts.length < 2) {
        addOutput('<div class="error">ERROR: Missing search term</div>');
        addOutput('<div>Usage: SEARCH [TERM] or SEARCH MARK [MARK]</div>');
        return;
    }

    // 处理MARK搜索
    if (parts[1].toLowerCase() === 'mark') {
        if (parts.length < 3) {
            addOutput('<div class="error">ERROR: Missing mark term</div>');
            return;
        }
        const markTerm = parts.slice(2).join(' ').toLowerCase();
        searchMarks(markTerm);
        return;
    }

    const searchTerm = parts.slice(1).join(' ').toLowerCase();
    addOutput(`<div class="system-info">Searching for "${searchTerm}"...</div>`);

    setTimeout(() => {
        const results = performSearch(searchTerm);
        displaySearchResults(results, searchTerm);
    }, 800);
}

// 搜索标记
function searchMarks(markTerm) {
    const results = [];
    
    for (const id in contentData.articles) {
        const article = contentData.articles[id];
        
        if (currentUser.level < article.minLevel) continue;
        
        if (article.marks && article.marks.some(m => m.toLowerCase().includes(markTerm))) {
            results.push({
                id: id,
                article: article,
                matchType: 'mark'
            });
        }
    }
    
    displaySearchResults(results, markTerm, true);
}

// 执行搜索
function performSearch(term) {
    const results = [];
    
    for (const id in contentData.articles) {
        const article = contentData.articles[id];
        
        // 检查用户权限
        if (currentUser.level < article.minLevel) continue;
        
        // 在标题、内容和标签中搜索
        const inTitle = article.title.toLowerCase().includes(term);
        const inContent = article.content.toLowerCase().includes(term);
        const inTags = article.tags?.some(tag => tag.toLowerCase().includes(term));
        
        if (inTitle || inContent || inTags) {
            results.push({
                id: id,
                article: article,
                matches: {
                    title: inTitle,
                    content: inContent,
                    tags: inTags
                }
            });
        }
    }
    
    return results;
}

// 显示搜索结果
function displaySearchResults(results, term, isMarkSearch = false) {
    if (results.length === 0) {
        addOutput(`<div class="search-error">No matching ${isMarkSearch ? 'marks' : 'documents'} found</div>`);
        return;
    }

    if (results.length === 1) {
        const result = results[0];
        const searchType = isMarkSearch ? 'mark' : 'keyword';
        addOutput(`<div class="search-results">1 result matching the ${searchType} "${term}" was found in the Chinese branch database:</div>`);
        addOutput(`
            <div class="search-item">
                <strong>SCP-${result.id}</strong>: ${highlightMatches(result.article.title, term)}
                ${result.article.marks?.map(m => `<span class="mark-tag">${m}</span>`).join('')}
            </div>
        `);
        addOutput('<div class="search-confirm">Do you want to access the document (Y/N)?</div>');
        
        pendingAction = (confirmed) => {
            if (confirmed) {
                handleAccess(['ACCESS', result.id]);
            } else {
                addOutput('<div class="system-info">Search completed.</div>');
            }
        };
        return;
    }

    addOutput(`<div class="search-results">${results.length} results matching the ${isMarkSearch ? 'mark' : 'keyword'} "${term}" were found in the Chinese branch database:</div>`);
    
    results.forEach(result => {
        addOutput(`
            <div class="search-item">
                <strong>SCP-${result.id}</strong>: ${highlightMatches(result.article.title, term)}
                ${result.article.marks?.map(m => `<span class="mark-tag">${m}</span>`).join('')}
            </div>
        `);
    });
}

// 高亮匹配文本
function highlightMatches(text, term) {
    if (!term) return text;
    
    const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
    return text.replace(regex, '<span class="search-match">$1</span>');
}

// 转义正则表达式特殊字符
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
