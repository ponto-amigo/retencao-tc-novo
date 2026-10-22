# Chat Story Studio V38 — geração em lote a partir do relatório de retenção

## Como executar (Windows)

1. Extraia o ZIP inteiro.
2. Clique duas vezes em `ABRIR.bat`. O sistema será aberto em `http://localhost:8765/`.
3. Na seção **Gerar imagens em massa**, anexe o CSV ou XLSX.
4. O arquivo `contratos_retencao_...csv` é reconhecido automaticamente, inclusive no formato UTF-16 com aspas duplicadas.
5. Clique em **Pré-visualizar 1ª conversa** e depois em **Gerar todas as imagens (ZIP)**.

Não precisa de Selenium, Vercel, Supabase, Python, instalação de pacotes ou banco de dados. O processamento acontece no navegador, na máquina local.

## Relatório de retenção

- Agrupa por **CPF + número da portabilidade**, não por CPF apenas.
- Preserva contrato, CPF, cliente, telefone, banco e loja. Mostra o número completo da portabilidade.
- Organiza os PNGs em pastas por loja dentro dos ZIPs.
- Cria `RELATORIO_DE_CONFERENCIA.csv` em cada ZIP.
- Para arquivos com mais de 80 imagens, divide em ZIPs de 50 para reduzir risco de travamento; todos são gerados num único clique.
- Oferece 2× (mais rápido), 3× e 4× para qualidade do PNG.
- Lógica de 4 mensagens da automação Python: abertura, resposta simulada, mensagem oficial e resposta simulada final.
- Mesmas listas de respostas (93 neutras, 28 manhã, 28 tarde, 66 finais); evita as últimas 18 repetições.
- Horários aleatórios em sequência dentro de 08:00 a 18:00, com intervalos [1-30], [1-5], [1-30], [1-5] minutos.
- Balões maiores (95% da largura útil), sem reserva lateral desnecessária de 44 px; horário fica na faixa inferior.
- As respostas são marcadas com **[SIMULAÇÃO]** e o print exibe a tarja **SIMULAÇÃO · SEM ACEITE REAL**.
- Não faz upload do CSV para serviços externos.

**Transparência:** o CSV não contém mensagens ou aceitações reais. O sistema gera conversas **inteiramente simuladas**, reproduzindo a lógica do script Python apenas para testes e demonstrações. Cada resposta inventada recebe o prefixo [SIMULAÇÃO] e as capturas mantêm o rótulo permanente. Não representam confirmações de clientes nem substituem evidências originais. Para validar aceite real, use a conversa ou o registro autenticado da operação.

## Excel genérico

O modo antigo continua disponível: use `{nome}`, `{numero}` e quaisquer colunas como variáveis; ou colunas `mensagem_1`, `mensagem_2`, `lado_1`, `hora_1`, etc. O arquivo `modelo_conversas_em_massa.csv` fornece um exemplo.

## Arquivos

- `index.html`, `styles.css`, `app.js`: interface e gerador.
- `assets/wallpaper-unificado.jpg` e `assets/barra-inferior-transparente.png`: fundo original preservado.
- `vendor/jszip.min.js`: leitura de XLSX e gravação de ZIP sem internet.
- `server.ps1`: servidor HTTP estático em localhost.
- `ABRIR.bat`: iniciador corrigido.

## Observações

No Chrome/Edge, o navegador pode pedir autorização para baixar vários ZIPs quando o arquivo contém centenas de linhas; permita múltiplos downloads para este servidor local. Não feche a aba durante a geração.

## Ajuste automático para conteúdo longo

Antes de exportar cada imagem, o sistema verifica se as quatro mensagens cabem inteiras no visor. Ele aproveita até 95% da largura dos balões e, se necessário, reduz progressivamente fonte/espaçamentos. Se mesmo assim algum caso exceder a altura disponível, registra erro e não salva imagem cortada.

## V38 — espaço dentro dos balões

Reduzido o padding interno direito de 44px para 9px, inclusive nas versões compactas. O horário permanece ancorado no canto inferior direito com folga inferior independente do texto. Não foram alteradas as mensagens, a importação do CSV nem a lógica do lote.


## Balões V38 — referência exata V28
Os elementos `.bubble-row`, `.message-bubble`, `.message-meta` e suas caudas
seguem exatamente os estilos do arquivo `v28.zip` fornecido como referência.
A hora é um elemento flutuante junto do texto, não uma camada com posição absoluta.
O construtor das bolhas no JavaScript já era idêntico ao da V28 e foi preservado.
Apenas em conversas muito extensas o tamanho da fonte pode ser reduzido
automaticamente, sem alterar as margens/paddings nem a localização da hora.
