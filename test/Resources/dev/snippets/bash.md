## Rename File extension

```bash
find /the/path -depth -name "*.js" -exec sh -c 'mv "$1" "${1%.js}.ts"' _ {} \;
```

# 

## Find / Remove & Exclude

```bash
find . -name '*conflict*' -not -path "*node_modules*" -exec rm -rf {} \;
```
