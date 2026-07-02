---
summary: "Knowledge page - summary pending"
base_confidence: 0.5
lifecycle: draft
title: "Edge Cases"
tags: [qa, reference]
created: 2026-06-20
rag_score: 0.49
---
summary: "Knowledge page - summary pending"
base_confidence: 0.5
lifecycle: draft
# Edge Cases — Checklist

## Checklist por tipo de entrada

### Strings
- [ ] Vazia ("")
- [ ] Muito longa (> 1000 chars)
- [ ] Caracteres especiais (\n, \t, unicode)
- [ ] Apenas espacos
- [ ] SQL injection / XSS (se relevante)

### Inteiros
- [ ] Zero
- [ ] Positivo pequeno (1)
- [ ] Negativo pequeno (-1)
- [ ] Maximo (math.MaxInt)
- [ ] Minimo (math.MinInt)

### Slices/Arrays
- [ ] Vazio (nil ou []T{})
- [ ] Um elemento
- [ ] Muitos elementos
- [ ] Elementos duplicados

### Ponteiros/Interfaces
- [ ] nil

### Erros
- [ ] Erro retornado por funcao interna
- [ ] Erro de validacao
- [ ] Erro de timeout/context

## Checklist por operacao

### Divisao
- [ ] Divisor zero
- [ ] Dividendo zero
- [ ] Numeros negativos
- [ ] Resultado fracionario

### Validacao
- [ ] Campo obrigatorio ausente
- [ ] Formato invalido
- [ ] Valor fora do range
- [ ] Valor duplicado (unicidade)
