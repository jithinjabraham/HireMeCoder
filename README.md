# 2019-S2-SEP-UG2
See https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow for a more detailed description.

## 1. Install git
Check if you have git installed on your computer. Install git from their website https://git-scm.com/downloads. 

## 2. Clone a repository
Change to the directory where you want the project to be located.
Clone the repository (only needs to be done once):
```
// Clone the remote repository
git clone https://github.cs.adelaide.edu.au/a1226467/2019-S2-SEP-UG2.git
```

## 3. Update your local copy
Once you have a working copy on your laptop, the following commands can be used to update your local copy when the remote copy (on GitHub) changes.
```
// Download all new changes (new branches, etc.)
git fetch
```
```
// Update the current branch with the latest files from the remote branch
git pull
```
## 4. Work on a separate branch

If the branch already exists:
```
git checkout branch_name
```
If this fails but the branch has been created on the remote, you may need to run `git fetch` first to download the new branch.

After checking out a branch, it may need to be updated (`git fetch` will not update a branch if you already have a local copy of it). You may need to run `git pull` once you have checked out the branch to pull any changes from the remote into your local copy of the branch.

When making a new branch, switch to the branch you want to base the new branch on (update it using `git pull`), then:
```
git checkout -b branch_name
```
This creates a branch for a feature called "branch_name". The branch name should usually be the name of the feature, bug fix, or change that is being made on the new branch.

Use the following command to push the new branch to the remote repository:
```
git push origin branch_name
```
For branches that you have not pushed to or pulled from the remote repository, you may be prompted to run:
```
git branch --set-upstream-to=origin/branch_name branch_name
```
This will enable you to run `git pull` and `git push` without typing the remote name every time.

## 4. Add changes
Add files that you have edited that you want to include in the next commit:
```
git add file_name
```
`file_name` can be a new file (that git is not yet tracking), or a file that was changed since the last commit.

Git takes a snapshot of the file when you add it, and stages it for the next commit. If the file has changed since you last added it, you will have to add it again if you want those new changes to be included in the next commit.

## 5. Make commits
To commit the changes you've added to the current branch:
```
// Check that you're on the correct branch
git branch

// Check if tracked files are staged for commit
git status

// If they are not staged for commits yet, stage them using
git add file_to_commit_1 file_to_commit_2

// Commit
git commit -m “Message here in imperative mood”
```
Your message should describe the changes you made. Use this to concisely summarise what changes were made.
Style notes:
- Capitalise the first letter
- Imperative mood (write what you would have to do to replicate the change that the commit is applying)

**E.g.:**
- bug-fix: `"Fix bug where cowbell levels are much lower than required"`
- feature: `"Add cowbell space exploration algorithm"`

To see the commit history of the current branch:
```
git log
```

## 6. Push
When you are ready to publish your changes to the branch, you use the command:
```
// Check that you're on the correct branch
git branch

// Push latest committed version to remote
git push
```

## 7. Merge to master (or another branch)
Once you have completed some work and your branch is in a working state, you can merge your current branch back into master:

1. Pull from `master` (or the branch you want to merge to). This will merge changes from `master` into your branch, allowing you to fix conflicts before merging in the other direction (your branch into `master`).
    ```
    // If merging back into master
    git pull origin master

    // OR if merging to another branch
    git pull origin other_branch_name
    ```
    Conflicts can occur when one or more files have changed on both branches since the last merge.

    If any conflicts occur, you'll get a message that looks like this
    ```
    CONFLICT (content): Merge conflict in file_name
    Automatic merge failed; fix conflicts and then commit the result.
    ```
    You'll have to open the file with the conflict and handle the conflict (refer to https://help.github.com/en/articles/resolving-a-merge-conflict-using-the-command-line).
2. Create a pull request on the GitHub website. Go to the branches tab, find your branch, and select "New pull request". Select `master` as the base branch (or another branch if desired). Describe the content of the pull request in the description.
3. Assign group members to review your code. The pull request allows you to view the differences between the two branches and make comments. When changes are required, follow the same process for adding, committing, and pushing as discussed previously. Then repeat step 1 to ensure there are no merge conflicts with the base branch. This will automatically update the content of the pull request.
4. After code review, you can merge the branch back to the master (or whatever branch you want to merge to) by first changing the working branch to the branch you want to merge into. You can also merge by clicking the button on the website. There should be no conflicts if the person that made the pull request merged their branch with the branch they wanted to merge to before making the request. If there are conflicts, repeat step 1.
    ```
    // Change to branch you want to merge into
    git checkout master [or branch that you want to merge to]
	
	// Merge your branch by pulling it into the current branch
    git pull branch_to_merge
    ```