/**
 * SCP Foundation Personnel Database
 * Contains user credentials and access levels
 * 
 * Format: 
 *   "username | password": {
 *     name: "Full Name",
 *     role: "Position",
 *     site: "Location",
 *     level: ClearanceLevel
 *   }
 */

function loadPersonnelData() {
    return {
        "jvance1@foundation.scp | password9910": {
            name: "Jonathan Vance",
            role: "Research Assistant",
            site: "Site 179",
            level: 0
        },
        "hmasterson4@foundation.scp | 12341lovethemarinecorps": {
            name: "Hannibal Masterson",
            role: "Junior Security Specialist",
            site: "Area-10",
            level: 1
        },
        "jchoi98@foundation.scp | beethovens9th123": {
            name: "Dr. Jackson Choi",
            role: "Associate Researcher",
            site: "Area-13",
            level: 2
        },
        "AdebenChristensen@foundation.scp | Повстанцев Хаꙮса": {
            name: "SCP-ꙮ",
            role: "Chief Engineer of the Chaos Splitter",
            site: "████████",
            level: 6
        },
        "oadmin@foundation.scp | omega-level-secure": {
            name: "O5-6",
            role: "Overseer Council Member",
            site: "Area-00",
            level: 6
        }
    };
}
