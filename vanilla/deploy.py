import os
import subprocess
import getpass

print("=====================================")
print("   🚀 Secure GitHub Auto-Deploy     ")
print("=====================================")

# 1. Folder path poochna
default_path = "/storage/emulated/0/class🥳/school-main/"
folder_path = input(f"📁 Folder path dalo (Enter dabao for '{default_path}'): ")

if not folder_path.strip():
    folder_path = default_path

if not os.path.exists(folder_path):
    print("❌ Error: Ye path exist nahi karta! Sahi path dalo.")
    exit()

os.chdir(folder_path)
print(f"✅ Path set: {os.getcwd()}")

# 2. Commit message poochna
commit_msg = input("📝 Commit message likho (e.g. 'updated chapter'): ")
if not commit_msg.strip():
    commit_msg = "Auto update"

# 3. Token poochna
token = getpass.getpass("🔑 GitHub Token paste karo (Paste karte time dikhega nahi, bas Enter dabana): ")

# Repo details
repo = "abhishekkhristi391-blip/Students.git"
remote_url = f"https://{token}@github.com/{repo}"

print("\n⚙️ Changes check kar rahe hain...")

try:
    # Check changes
    status_check = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
    
    if status_check.stdout.strip(): 
        print("📝 Naye changes mile! Add aur commit ho raha hai...")
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", commit_msg], check=True)
    else:
        print("⚠️ Koi naye changes nahi hain (Working tree clean).")
        
    # --- NAYA LOGIC: Push se pehle GitHub se sync (pull) karna ---
    print("🔄 GitHub se latest changes pull kar rahe hain (Syncing)...")
    pull_result = subprocess.run(["git", "pull", remote_url, "main", "--rebase"], capture_output=True, text=True)
    
    if pull_result.returncode != 0:
        print("\n❌ Pull failed! GitHub aur phone ke code me conflict ho sakta hai. Error:")
        print(pull_result.stderr.replace(token, "[HIDDEN_TOKEN]"))
        exit()
    # -------------------------------------------------------------
        
    print("🚀 GitHub pe push ho raha hai...")
    # Git push command
    result = subprocess.run(["git", "push", remote_url, "main"], capture_output=True, text=True)
    
    if result.returncode == 0:
        print("\n✅ Done! File successfully GitHub par push ho gayi hai.")
    else:
        print("\n❌ Push failed! Error:")
        safe_error = result.stderr.replace(token, "[HIDDEN_TOKEN]")
        print(safe_error)

except subprocess.CalledProcessError as e:
    print(f"\n❌ Git command me error aayi: {e}")
except Exception as e:
    print(f"\n❌ Ek error aayi: {e}")
