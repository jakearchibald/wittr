git checkout --detach master &&
git cherry-pick task-register-sw &&
git branch -f task-register-sw &&
git cherry-pick log-requests &&
git branch -f log-requests &&
git cherry-pick custom-response &&
git branch -f custom-response &&
git cherry-pick install-and-cache &&
git branch -f install-and-cache &&
git cherry-pick handling-updates &&
git branch -f handling-updates &&
git cherry-pick update-interaction &&
git branch -f update-interaction &&
git cherry-pick page-shell &&
git branch -f page-shell &&
git cherry-pick idb-store &&
git branch -f idb-store &&
git cherry-pick cache-photos &&
git branch -f cache-photos &&
git cherry-pick cache-avatars &&
git branch -f cache-avatars