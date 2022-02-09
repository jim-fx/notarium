# Roadblocks

## ~~Nested tmux sessions~~

Adding this:
```config
  RequestTTY true
  RemoteCommand tmux new -A -s ssh
```
to the ssh config if the specific hosts will automatically start tmux when connected

If i ssh into a remote machine with tmux started as well I have some problems:
  - ~~Duplicate tmux bar~~
  - ~~Shortcuts don't work in remote~~
    - This works by hitting the prefix key twice, e.g. ctrl-a-a

## ~~Debian Gnome sometimes comma key doesn't work~~

Has not happened in a while

## ~~Neovim shortcut to comment out~~

Fixed this by installing the NerdCommenter Plugin

##  ~~Neovim Auto fix problems shortcut + hover window~~

## ~~Better git merging in Neovim, like in VScode~~

## ~~Copying between neovim, tmux and ssh sessions does not work~~
## Learn how to use splits and buffers in neovim
## Fix the dictionary for neovim ltex-ls
