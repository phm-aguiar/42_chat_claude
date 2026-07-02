---
title: "42 Graphic Charter — Software & UI Reference"
tags: ["42-chat", "brand", "colors", "design-system", "frontend", "typography"]
category: references
created: "2026-06-24"
updated: "2026-06-24"
source: "42 Graphic Charter August 2024 (pasted by user)"
summary: "Destilado da Graphic Charter 42 focado em desenvolvimento de software: cores exatas (hex), tipografia, regras de logotipo, UI elements e favicon. Corta branding físico, redes sociais, fotografia e vídeo."
base_confidence: 0.83
lifecycle: draft
tier: supporting
provenance:
  extracted: 0.9
  inferred: 0.05
  ambiguous: 0.05
---

# 42 Graphic Charter — Software & UI Reference

> Destilado da [[42 Graphic Charter]] completo. Só o que interessa pra montar software.

## Cores Primárias (Primary)

As duas cores fundamentais da identidade 42 — representam o sistema binário.

| Cor | Hex | RGB | CMYK | Uso |
|---|---|---|---|---|
| **Black** | `#1b1b1b` | `27, 27, 27` | `76 66 61 82` | Logotipo, títulos, textos, fundos |
| **White** | `#ffffff` | `255, 255, 255` | `0 0 0 0` | Logotipo, títulos, textos, fundos |

Regra: **logotipo só pode ser preto ou branco**. Nada de versão colorida.

## Cores Secundárias (Secondary)

Paleta completa de 9 cores. Use à vontade, desde que secundárias às primárias.

| Nome | Hex | RGB | CMYK |
|---|---|---|---|
| **42 Blue** | `#00BABC` | `0, 186, 188` | `72 0 32 0` |
| **Bright Gray** | `#E6F4F1` | `230, 244, 241` | `13 0 8 0` |
| **Bubbles** | `#E7FEFE` | `231, 254, 254` | `9 0 3 0` |
| **Dark Slate Gray** | `#324B4B` | `180, 33, 29` ^[ambiguous] | `77 48 53 49` |
| **Cadet Gray** | `#95B0B0` | `0, 186, 188` ^[ambiguous] | `47 21 29 3` |
| **CG Blue** | `#04809f` | `0, 128, 159` | `98 20 0 38` |
| **Royal Pink** | `#ED3491` | `237, 52, 145` | `0 78 39 7` |
| **Light Cobalt Blue** | `#96A3EB` | `153, 163, 235` | `47 35 0 0` |
| **Dark Cerulean** | `#173D7A` | `23, 61, 122` | `81 50 0 52` |
| **Violet** | `#6000BC` | `271, 100, 74` ^[ambiguous] | `83 88 0 0` |

### Paletas Pré-definidas

**"Minimalist"** — light, professional, tech-luxury. Ideal para keynotes, apresentações, brochures.
- `#00BABC` (42 Blue), `#E7FEFE` (Bubbles), `#E6F4F1` (Bright Gray)

**"Sleek"** — tons de azul e cinza. Confiança, vitalidade, atemporal. B2B, institucional, annual reports, websites.
- `#00BABC` (42 Blue), `#324B4B` (Dark Slate Gray), `#95B0B0` (Cadet Gray), `#96A3EB` (Light Cobalt Blue)

**"Bubbly"** — turquesa + rosa + roxo. Acessível, inclusivo, energético. Social media, conteúdo digital.
- `#00BABC` (42 Blue), `#04809f` (CG Blue), `#ED3491` (Royal Pink), `#173D7A` (Dark Cerulean), `#6000BC` (Violet)

### Gradientes (Exemplos)

| Início | Fim |
|---|---|
| `#ec3391` (236,51,145) | `#00babc` (0,186,188) |
| `#04809F` (4,128,159) | `#04809F` (4,128,159) — variação tonal |
| `#7300ff` (115,0,215) | `#170d7a` (23,61,122) |
| `#00babc` (33,181,184) | `#00babc` (0,186,188) — variação tonal |

## UI Colors

Paleta específica para interfaces (telas, web, apps):

| Nome | Hex | RGB | Uso sugerido |
|---|---|---|---|
| Dark Navy | `#173D7A` | `32,32,38` ^[ambiguous] | Fundos escuros |
| Near Black | `#202026` | `32,32,38` | Fundo principal escuro |
| Dark Gray | `#29292e` | `41,41,46` | Superfícies, cards |
| Mid Gray | `#5b5b60` | `91,91,96` | Texto secundário, bordas |
| Light Gray | `#e3e3e3` | `227,227,227` | Fundo claro |
| Muted Blue-Gray | `#475B67` | `91,91,96` ^[ambiguous] | Elementos secundários |
| 42 Teal | `#00babc` | `0,186,188` | Ações, links, destaque |
| CG Blue | `#04809F` | `4,128,159` | Ações secundárias |
| Green | `#2dd57a` | `45,213,122` | Sucesso, confirm |
| Pink | `#ec3391` | `236,51,145` | Destaque, warning |
| Purple | `#7300ff` | `115,0,215` | Accent |
| Orange | `#ed730a` | `237,115,10` | Alertas, warning forte |

## Tipografia

**Futura PT** é a fonte oficial. 22 variantes no design original, **6 usadas no charter**:

| Variante | Peso |
|---|---|
| Futura PT Light | 300 |
| Futura PT Light Oblique | 300 itálico |
| Futura PT Book | 400 |
| Futura PT Book Oblique | 400 itálico |
| Futura PT Heavy | 700 |
| Futura PT Heavy Oblique | 700 itálico |

- **Licença:** Adobe Font. Precisa de Creative Cloud ou licença de desktop.
- **Web:** typekit link via Adobe Fonts depois de adquirir a licença.
- **Fallback:** se não puder usar Futura PT, há alternativas similares (não listadas no charter).
- **Logo:** usa Futura PT Heavy Oblique em uppercase para o nome da cidade.

## Logotipo

### Regras fundamentais
- **Cores:** somente preto (`#1b1b1b`) ou branco (`#ffffff`). Nunca colorido.
- **Margem de segurança:** altura do logo ÷ 2. Nenhum elemento gráfico nessa zona.
- **Fundo escuro:** logo branco. **Fundo claro:** logo preto.
- **Contraste:** sempre garantir legibilidade.

### Sistema Campus
Formato: `42 | CIDADE` em Futura PT Heavy Oblique uppercase.

Casos especiais:
- Campus powered by empresa: baseline adicional com nome da fundadora em Futura PT Heavy lowercase.
- Não alterar disposição do logo + nome do campus. Não adicionar elementos gráficos extras.

### Favicon
Logo preto sobre fundo circular branco. Manter integridade para acessibilidade, especialmente em fundos escuros.

## Ícones

- Conjunto de ícones oficial disponível (arquivo `42-UI-elements.sketch`).
- Se tiver seu próprio set de ícones, **adaptar as cores** para as da paleta do graphic charter.

## O que NÃO está aqui (cortado de propósito)

- Templates de cartão de visita, papel timbrado, branded objects
- Grids de redes sociais (Facebook, Instagram, X, YouTube, LinkedIn, Medium)
- Diretrizes de fotografia e vídeo
- Motion Graphics Charter
- Labels "Member of 42", "Startup Club", "Alumni"

Se precisar de algo da lista acima, consulte o [[42-graphic-charter-full|documento completo]].

## References

- Fonte: 42 Graphic Charter August 2024 (documento completo de 49 páginas)
- [[42-chat-design-system|42 Chat Design System]] — aplicação concreta dessas cores num projeto
