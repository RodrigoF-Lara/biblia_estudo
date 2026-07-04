param(
    [string]$Message = "deploy: atualiza site",
    [string]$Branch = "main",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Invoke-Git {
    param(
        [string]$Label,
        [string[]]$GitArgs
    )

    Write-Host "`n==> $Label" -ForegroundColor Cyan
    Write-Host ("git " + ($GitArgs -join " ")) -ForegroundColor DarkGray

    if ($DryRun) {
        return
    }

    & git @GitArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao executar: git $($GitArgs -join ' ')"
    }
}

Write-Host "Iniciando deploy para a branch '$Branch'..." -ForegroundColor Green

git rev-parse --is-inside-work-tree *> $null
if ($LASTEXITCODE -ne 0) {
    throw "Esta pasta nao e um repositorio Git."
}

$changes = git status --porcelain
if (-not $changes) {
    Write-Host "Nenhuma alteracao para publicar. Nada a fazer." -ForegroundColor Yellow
    exit 0
}

Invoke-Git -Label "Adicionar arquivos" -GitArgs @("add", "-A")
Invoke-Git -Label "Criar commit" -GitArgs @("commit", "-m", $Message)
Invoke-Git -Label "Enviar para remoto" -GitArgs @("push", "origin", $Branch)

if ($DryRun) {
    Write-Host "`nDry-run concluido. Nenhum comando foi executado." -ForegroundColor Yellow
} else {
    Write-Host "`nDeploy concluido com sucesso." -ForegroundColor Green
}
