---
title: "channel: provisionEmail - Microsoft Graph v1.0"
source: "https://learn.microsoft.com/pt-br/graph/api/channel-provisionemail?view=graph-rest-1.0&tabs=http"
author:
  - "[[anandab-msft]]"
published:
created: 2026-06-30
description: "Aprovisionar um endereço de e-mail para um canal."
tags:
  - "clippings"
---
## channel: provisionEmail

Namespace: microsoft.graph

Aprovisionar um endereço de e-mail para um [canal](https://learn.microsoft.com/pt-br/graph/api/resources/channel?view=graph-rest-1.0).

O Microsoft Teams não aprovisiona automaticamente um endereço de e-mail para um **canal** por predefinição. Para que o Teams aprovisione um endereço de e-mail, pode ligar para **provisionEmail** ou através da interface de utilizador do Teams, selecione **Obter endereço de e-mail**, o que aciona o Teams para gerar um endereço de e-mail se ainda não tiver aprovisionado um.

Para remover o endereço de e-mail de um **canal**, utilize o método [removeEmail](https://learn.microsoft.com/pt-br/graph/api/channel-removeemail?view=graph-rest-1.0).

> **Notas**: esta API funciona de forma diferente numa ou mais clouds nacionais. Para obter detalhes, veja [Diferenças de implementação nas clouds nacionais](https://learn.microsoft.com/pt-br/graph/teamwork-national-cloud-differences).

Esta API está disponível nas seguintes [implementações de cloud nacionais](https://learn.microsoft.com/pt-br/graph/deployments).

| Serviço global | US Government L4 | US Government L5 (DOD) | China operada pela 21Vianet |
| --- | --- | --- | --- |
| ✅ | ❌ | ❌ | ✅ |

## Permissões

Escolha a permissão ou permissões marcadas como menos privilegiadas para esta API. Utilize uma permissão ou permissões com privilégios mais elevados [apenas se a sua aplicação o exigir](https://learn.microsoft.com/pt-br/graph/permissions-overview#best-practices-for-using-microsoft-graph-permissions). Para obter detalhes sobre as permissões delegadas e de aplicação, veja [Tipos de permissão](https://learn.microsoft.com/pt-br/graph/permissions-overview#permission-types). Para saber mais sobre estas permissões, veja a [referência de permissões](https://learn.microsoft.com/pt-br/graph/permissions-reference).

| Tipo de permissão | Permissões com menos privilégios | Permissões com privilégios superiores |
| --- | --- | --- |
| Delegado (conta corporativa ou de estudante) | ChannelSettings.ReadWrite.All | Indisponível. |
| Delegado (conta pessoal da Microsoft) | Sem suporte. | Sem suporte. |
| Aplicativo | Sem suporte. | Sem suporte. |

## Solicitação HTTP

HTTP

```http
POST /teams/{team-id}/channels/{channel-id}/provisionEmail
```

## Cabeçalhos de solicitação

| Cabeçalho | Valor |
| --- | --- |
| Autorização | {token} de portador. Obrigatório. Saiba mais sobre [autenticação e autorização](https://learn.microsoft.com/pt-br/graph/auth/auth-concepts). |

## Corpo da solicitação

Não forneça um corpo de solicitação para esse método.

## Resposta

Se for bem-sucedido, este método devolve um `200 OK` código de resposta e um objeto [provisionChannelEmailResult](https://learn.microsoft.com/pt-br/graph/api/resources/provisionchannelemailresult?view=graph-rest-1.0) no corpo da resposta. O endereço de e-mail aprovisionado está na `email` propriedade.

## Exemplo

### Solicitação

O exemplo a seguir mostra uma solicitação.

- [HTTP](#tabpanel_1_http)
- [C#](#tabpanel_1_csharp)
- [Ir](#tabpanel_1_go)
- [Java](#tabpanel_1_java)
- [JavaScript](#tabpanel_1_javascript)
- [PHP](#tabpanel_1_php)
- [PowerShell](#tabpanel_1_powershell)
- [Python](#tabpanel_1_python)

```http
POST https://graph.microsoft.com/v1.0/teams/893075dd-2487-4122-925f-022c42e20265/channels/19:561fbdbbfca848a484f0a6f00ce9dbbd@thread.tacv2/provisionEmail
```

### Resposta

O exemplo a seguir mostra a resposta.

> **Observação:** o objeto de resposta mostrado aqui pode ser encurtado para legibilidade.

HTTP

```http
HTTP/1.1 200 OK
Content-type: application/json

{
    "@odata.type": "#microsoft.graph.provisionChannelEmailResult",
    "email": "contoso.com@amer.teams.ms"
}
```