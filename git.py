import os
import subprocess
import getpass

# Terminal Colors for Pro UI/UX
class C:
    G = '\033[92m'  # Green
    R = '\033[91m'  # Red
    B = '\033[96m'  # Cyan
    Y = '\033[93m'  # Yellow
    M = '\033[95m'  # Magenta
    W = '\033[97m'  # White
    BOLD = '\033[1m'
    END = '\033[0m'

print(f"\n{C.B}{C.BOLD}========================================={C.END}")
print(f"{C.M}{C.BOLD}    🚀 SECURE GITHUB AUTO-DEPLOY 🚀    {C.END}")
print(f"{C.B}{C.BOLD}========================================={C.END}\n")

# 1. Folder path
default_path = "/storage/emulated/0/MIUI/class10-notes"
print(f"{C.BOLD}{C.B}📁 Path Setup{C.END}")
folder_path = input(f"{C.W}Folder path dalo {C.END}{C.M}(Enter for '{default_path}'){C.W}:\n{C.G}➤ {C.END}")

if not folder_path.strip():
    folder_path = default_path

if not os.path.exists(folder_path):
    print(f"\n{C.R}{C.BOLD}❌ Error: Ye path exist nahi karta! Sahi path dalo.{C.END}")
    exit()

os.chdir(folder_path)
print(f"{C.G}✅ Active Directory: {os.getcwd()}{C.END}\n")

# Git Validation & Dynamic Branching
git_check = subprocess.run(["git", "status"], capture_output=True, text=True)
if git_check.returncode != 0:
    print(f"{C.R}{C.BOLD}❌ Error: Ye folder Git repository nahi hai! Pehle terminal me 'git init' run karo.{C.END}")
    exit()

branch_check = subprocess.run(["git", "branch", "--show-current"], capture_output=True, text=True)
current_branch = branch_check.stdout.strip()

if not current_branch:
    current_branch = "main"
    subprocess.run(["git", "checkout", "-b", current_branch], capture_output=True)

# 2. Commit message
print(f"\n{C.BOLD}{C.B}📝 Commit Details{C.END}")
commit_msg = input(f"{C.W}Commit message likho {C.END}{C.M}(Enter for 'Auto update'){C.W}:\n{C.G}➤ {C.END}")
if not commit_msg.strip():
    commit_msg = "Auto update"

# 3. Token
print(f"\n{C.BOLD}{C.B}🔑 Authentication{C.END}")
token = getpass.getpass(f"{C.W}GitHub Token paste karo (Hidden) {C.G}➤ {C.END}")

# Repo details
repo = "abhishekkhristi391-blip/Students.git"
remote_url = f"https://{token}@github.com/{repo}"

print(f"\n{C.Y}⚙️  Changes check kar rahe hain...{C.END}")

try:
    # Check changes
    status_check = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
    
    if status_check.stdout.strip(): 
        print(f"{C.G}📝 Naye changes mile! Add aur commit ho raha hai...{C.END}")
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", commit_msg], check=True)
    else:
        print(f"{C.Y}⚠️  Koi naye changes nahi hain (Working tree clean).{C.END}")
        
    # --- SURGICAL FIX: Bulletproof Automated Pull ---
    if os.path.exists(".git/rebase-merge") or os.path.exists(".git/rebase-apply"):
        print(f"{C.Y}⚠️  Purana stuck rebase detect hua. Usse automatically clear kar rahe hain...{C.END}")
        subprocess.run(["git", "rebase", "--abort"], capture_output=True)
        
    print(f"{C.B}🔄 GitHub se latest changes pull kar rahe hain (Syncing '{current_branch}')...{C.END}")
    
    # Auto-merge strategy: No rebase, No editor, Auto-resolve conflicts keeping local changes
    pull_cmd = [
        "git", "pull", remote_url, current_branch, 
        "--no-rebase", 
        "--allow-unrelated-histories", 
        "--no-edit", 
        "-X", "ours"
    ]
    pull_result = subprocess.run(pull_cmd, capture_output=True, text=True)
    
    if pull_result.returncode != 0:
        if "couldn't find remote ref" in pull_result.stderr:
            print(f"{C.Y}⚠️  Remote pe branch '{current_branch}' naya hai. First push attempt kar rahe hain...{C.END}")
        else:
            print(f"\n{C.R}{C.BOLD}❌ Pull failed! Error details:{C.END}")
            print(f"{C.W}{pull_result.stderr.replace(token, '[HIDDEN_TOKEN]')}{C.END}")
            exit()
    # ------------------------------------------------
        
    print(f"{C.M}🚀 GitHub pe push ho raha hai (Branch: {current_branch})...{C.END}")
    
    # Git push command
    result = subprocess.run(["git", "push", "-u", remote_url, current_branch], capture_output=True, text=True)
    
    if result.returncode == 0:
        print(f"\n{C.G}{C.BOLD}✅ BOOM! File successfully GitHub par push ho gayi hai! 🎉{C.END}\n")
    else:
        print(f"\n{C.R}{C.BOLD}❌ Push failed! Error:{C.END}")
        print(f"{C.W}{result.stderr.replace(token, '[HIDDEN_TOKEN]')}{C.END}")

except subprocess.CalledProcessError as e:
    print(f"\n{C.R}{C.BOLD}❌ Git command error: {e}{C.END}")
except Exception as e:
    print(f"\n{C.R}{C.BOLD}❌ System error: {e}{C.END}")
