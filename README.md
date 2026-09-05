# Sgroup — Proteção Veicular Mutualista (Mockup)

Mockup funcional de apresentação do aplicativo **Sgroup** (Android), 100% local:
HTML + CSS + JavaScript puros, **sem dependências e sem build** — todos os dados são fictícios.

## Como abrir

- **Duplo clique** em `index.html` (abre no navegador), ou
- Sirva localmente para uma URL: `npx serve .` ou `python -m http.server 8080`

No desktop, o app aparece dentro de uma moldura de celular Android.
Em telas pequenas (celular), ele ocupa a tela inteira automaticamente.

## Como apresentar em um celular Android

1. Rode `npx serve .` (ou `python -m http.server 8080`) no PC.
2. No celular (mesma rede Wi-Fi), abra `http://IP-DO-PC:8080` no Chrome.
3. Menu ⋮ → **"Adicionar à tela inicial"** → abre em tela cheia como um app.

## Telas e fluxos funcionais

| Tela | Interações |
|---|---|
| Início | Atalhos de assistência, banner 24h, cartão do veículo, notificações |
| Meu veículo | Dados do veículo, coberturas, condutores, certificado |
| Assistência 24h | Solicitação com escolha de tipo → confirmação em bottom sheet |
| Acompanhamento | Mapa animado, ETA regressivo, linha do tempo de status, cancelar |
| Comunicar evento | Tipos selecionáveis, anexos simulados, protocolo gerado |
| Financeiro | Pagamento PIX (QR + copia-e-cola), histórico, débito automático |
| Minha Mutualidade | Indicadores da associação e fundo mutualista |
| Documentos / Perfil | Listas navegáveis, indicar amigos, sair com confirmação |

## Estrutura

```
MOCKUP/
├── index.html      # todas as telas + sprite de ícones SVG
├── css/style.css   # design system (cores, cards, sheets, animações)
└── js/app.js       # navegação, sheets, toasts e simulações
```

## Próximos passos sugeridos

- Empacotar como APK com Capacitor/WebView quando for além do mockup
- Trocar dados fictícios por API real
