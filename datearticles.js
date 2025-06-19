/**
 * SCP Foundation Articles Database
 * Contains SCP documentation with access levels
 * 
 * Format:
 *   "SCP-ID": {
 *     title: "Article Title",
 *     minLevel: MinimumClearanceLevel,
 *     content: "Markdown-formatted content"
 *   }
 */

function loadArticlesData() {
    return {
        "2317": {
            title: "SCP-2317",
            minLevel: 1,
            content: "**Item #**: SCP-2317\n**Object Class**: Keter\n**Special Containment Procedures**: SCP-2317 is to be contained in a reinforced containment chamber..."
        },
        "049": {
            title: "SCP-049",
            minLevel: 0,
            content: "**Item #**: SCP-049\n**Object Class**: Euclid\n**Special Containment Procedures**: SCP-049 is contained in a research cell at Site-19..."
        },
        "173": {
            title: "SCP-173",
            minLevel: 0,
            content: "**Item #**: SCP-173\n**Object Class**: Euclid\n**Special Containment Procedures**: The object is contained in a locked containment chamber..."
        },
        "106": {
            title: "SCP-106",
            minLevel: 2,
            content: "**Item #**: SCP-106\n**Object Class**: Keter\n**Special Containment Procedures**: SCP-106 is contained in a specialized containment facility..."
        },
        "CN-2000": {
            title: "SCP-CN-2000",
            minLevel: 6,
            content: "**Item #**: SCP-CN-2000\n**Object Class**: Keter\n**Special Containment Procedures**: [DATA EXPUNGED]\n\nThis entity exhibits reality-bending properties..."
        }
    };
}
