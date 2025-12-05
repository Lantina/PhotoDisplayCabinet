# PathValidation.ps1 - Windows 路径标准化 Hook
# Claude Code 修复方案

param(
    [string]$ProjectRoot = (Get-Location).Path
)

# 转换路径为标准格式
function ConvertTo-StandardizedPath {
    param([string]$Path)
    
    if ([string]::IsNullOrWhiteSpace($Path)) { return $Path }
    
    # 统一使用反斜杠并解析相对路径
    $standardized = $Path.Replace('/', '\')
    
    # 如果是相对路径或已在项目内，转换为相对路径
    if (!$standardized.Contains(':') -or $standardized.StartsWith($ProjectRoot)) {
        try {
            $fullPath = Resolve-Path $standardized -Relative -ErrorAction SilentlyContinue
            return $fullPath.Replace('/', '\')
        } catch {
            return $standardized
        }
    }
    
    return $standardized
}

# 处理传入的参数
$args | ForEach-Object {
    if ($_ -match '^--path=(.+)$') {
        $originalPath = $matches[1]
        $newPath = ConvertTo-StandardizedPath $originalPath
        Write-Host "标准化路径: $originalPath -> $newPath"
    }
}