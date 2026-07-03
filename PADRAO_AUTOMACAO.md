# Padrao De Automacao Dos Estudos

## Arquivos principais
- `busca_estudo.html`: tela de busca por livro, capitulo e versiculo.
- `layout_fixo.html`: layout padrao fixo (A4) para exibicao.
- `estudos_index.json`: indice dos estudos cadastrados.

## Regra de busca
A busca encontra o estudo quando o versiculo consultado estiver entre `versiculoInicio` e `versiculoFim`.

Exemplo:
- Consulta: Atos 1:3
- Estudo cadastrado: Atos 1:1-5
- Resultado: abre o estudo 1-5

## Padrao recomendado de pastas
Use este padrao para novos estudos:
- `Livro/Cap_XX/Inicio_Fim.md`
- `Livro/Cap_XX/img/` para imagens

Exemplos:
- `Atos/Cap_01/1_5.md`
- `Atos/Cap_01/img/`

## Cadastro no indice (estudos_index.json)
Para cada novo estudo, adicione um objeto em `estudos_index.json`:

```json
{
  "id": "atos_1_1_5",
  "livro": "Atos",
  "capitulo": 1,
  "versiculoInicio": 1,
  "versiculoFim": 5,
  "titulo": "Atos 1:1-5",
  "markdownPath": "Atos/At_1/1_5.md",
  "imageDir": "Atos/At_1/img",
  "additionalStudyUrl": "https://seu-link-de-estudo-adicional",
  "layout": "v2"
}
```

## QR code de estudos adicionais
- Recomendado: cadastrar o link em `estudos_index.json` no campo `additionalStudyUrl`.
- Opcional: no arquivo `.md`, criar uma secao `## Estudos adicionais` com um link HTTP/HTTPS.
- Prioridade do sistema:
  1. Link do Markdown (`## Estudos adicionais`)
  2. Link do indice (`additionalStudyUrl`)

## Como usar
1. Abra `busca_estudo.html` no Live Server.
2. Informe livro, capitulo e versiculo.
3. O sistema abre `layout_fixo.html` automaticamente no estudo correto.
