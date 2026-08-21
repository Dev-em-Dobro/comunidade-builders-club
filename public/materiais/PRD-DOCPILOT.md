# Product Requirements Document (PRD) - DocPilot

**Versão:** 2.0 (Ultra-MVP / Stateless)

| Metadado | Detalhes |
| --- | --- |
| **Objetivo** | Ferramenta instantânea para "conversar" com um PDF. Sem login, sem gestão. |
| **Público** | Qualquer pessoa que precise extrair info de um PDF rapidamente. |

---

## 1. Fluxo do Usuário (Simplificado)

O fluxo agora é linear e descartável:

1. Usuário acessa o site (sem login).
2. Usuário clica no botão e seleciona **um** arquivo PDF.
3. Sistema processa e libera o chat.
4. Usuário faz perguntas.
5. Ao fechar a aba, tudo é perdido (sessão efêmera).

---

## 2. Requisitos Funcionais (Escopo Revisado)

### Epico 1: Ingestão Simplificada

*Removidos: Drag & drop, listagem e exclusão.*

| ID | Funcionalidade | Descrição Técnica | Prioridade |
| --- | --- | --- | --- |
| **RF-01** | **Upload Simples** | Um botão clássico de `<input type="file">`. Apenas um arquivo por vez (nesta versão). | **P0** |
| **RF-02** | **Processamento Imediato** | Ao selecionar o arquivo, o sistema extrai o texto e gera os vetores imediatamente. Exibir um *loader* simples ("Lendo documento..."). | **P0** |
| **RF-03** | **Reset de Sessão** | Como não há botão de excluir, deve haver um botão ou link "Carregar novo arquivo" que limpa o estado atual e volta para a tela inicial. | **P1** |

### Epico 2: Experiência de Chat (RAG)

| ID | Funcionalidade | Descrição Técnica | Prioridade |
| --- | --- | --- | --- |
| **RF-04** | **Input de Pergunta** | Campo de texto fixo no rodapé da tela. | **P0** |
| **RF-05** | **RAG com Citação** | A IA responde baseada no vetor recuperado no Astra DB e cita a fonte. | **P0** |
| **RF-06** | **Tratamento de Erro** | Se o documento for ilegível (ex: PDF scan de imagem sem OCR), avisar o usuário imediatamente. | **P1** |

---

## 3. Arquitetura & Stack Técnica (Definida)

Esta stack foi escolhida para escalabilidade de vetores e rapidez no desenvolvimento frontend.

* **Frontend:** **Next.js**
* Foco em *Server Actions* para processar o upload ou chamadas de API rápidas.
* Interface limpa e reativa.


* **Orquestração de IA:** **LangChain** (Versão JS/TS)
* Responsável por criar a *Chain* de conversação (RetrievalQA).
* Gerenciamento do *prompt template* para garantir que a IA siga as regras.


* **Banco Vetorial:** **Astra DB** (DataStax)
* Banco NoSQL baseado em Cassandra, excelente para busca vetorial escalável e com baixa latência.
* Armazenará os *embeddings* temporários do documento.


* **Modelos de IA (LLM):** **OpenAI**
* *Embeddings:* `text-embedding-3-small` (Rápido e barato para vetorizar o PDF).
* *Chat:* `gpt-4o-mini` ou `gpt-3.5-turbo` (Equilíbrio entre custo e inteligência para leitura de texto).



---

## 4. Design & UX (Wireframe Mental)

**Layout de Tela Única (Centralizado)**

A interface não possui mais barra lateral. Todo o foco está no centro.

**Estado 1: Aterrissagem (Upload)**

* Tela limpa, título "DocPilot" no centro.
* Subtítulo: "Converse com seus documentos instantaneamente."
* **Ação Central:** Botão "Selecionar PDF".
* (Sem drag & drop visual complexo, apenas o botão funcional).

**Estado 2: Chat Ativo (Pós-upload)**

* O botão de upload desaparece.
* A interface se transforma em uma timeline de chat (estilo WhatsApp web ou ChatGPT, mas sem sidebar).
* **Topo:** Nome do arquivo atual (ex: `manual_rh.pdf`) + Botão pequeno "Trocar Arquivo" (que reseta para o Estado 1).
* **Meio:** Área de rolagem com as mensagens.
* **Rodapé:** Input de texto fixo "Faça uma pergunta sobre este documento...".

---

## 5. Próximo Passo para o Desenvolvedor

**Recomendação:** Começar configurando a conexão do **LangChain** com o **Astra DB**.
Como o app não tem login, você precisará decidir uma estratégia simples para identificar a sessão do usuário no banco (ex: gerar um `session_id` aleatório no frontend e usar como filtro na busca vetorial, para que um usuário não receba respostas do documento de outra pessoa).