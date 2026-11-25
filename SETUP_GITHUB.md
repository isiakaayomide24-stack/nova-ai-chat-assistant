# Add Nova AI to your GitHub account

This folder is ready to publish. Pick whichever method suits you.

---

## Method 1 — GitHub website (no Git installation needed)

1. Go to <https://github.com/new> and sign in.
2. Repository name: `nova-ai-chat-assistant` (or any name you like).
3. Add a description, for example: *"A polished AI chat assistant UI built with HTML, CSS and JavaScript."*
4. Choose **Public** or **Private**.
5. **Do not** tick "Add a README file" — this project already has one.
6. Click **Create repository**.
7. On the setup page, click **"uploading an existing file"** (or drag and drop).
8. Select these files from the `ai-chat-assistant` folder:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `README.md`
   - `LICENSE`
   - `.gitignore` (hidden file — you may need to choose it from the file picker rather than drag it)
9. Click **Commit changes**.

Done — your project is live on GitHub.

---

## Method 2 — Git + GitHub CLI (recommended if you code often)

1. Install Git: <https://git-scm.com/download/win>
2. Install GitHub CLI: <https://cli.github.com>
3. Open PowerShell inside the `ai-chat-assistant` folder.
4. Run the included setup script to create the local commit:
   ```powershell
   .\setup-git.ps1
   ```
5. Sign in to GitHub:
   ```powershell
   gh auth login
   ```
6. Create the remote repository and push in one command:
   ```powershell
   gh repo create nova-ai-chat-assistant --public --source=. --remote=origin --push
   ```
   Use `--private` instead of `--public` if you want it hidden.

---

## Method 3 — Git only

1. Install Git from <https://git-scm.com/download/win>.
2. Open PowerShell inside the `ai-chat-assistant` folder and run:
   ```powershell
   .\setup-git.ps1
   ```
3. Create an empty repository on <https://github.com/new> (no README, no license — we already have both).
4. Copy the repository URL it gives you, then run:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/nova-ai-chat-assistant.git
   git push -u origin main
   ```

---

## Notes

- `setup-git.ps1` is already configured with **AYOMIDE ISIAKA** and `isiakaayomide24@gmail.com` as the commit author. Nothing needs editing.
- No API keys or secrets are stored in any file here — API details are entered in the browser at runtime only.
- To publish later changes: `git add .` → `git commit -m "your message"` → `git push`.
