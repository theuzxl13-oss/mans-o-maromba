# Mansão Maromba — Sistema de Academia

Protótipo funcional de **demonstração** do sistema de gestão da academia Mansão Maromba:
site institucional + painel administrativo completo (alunos, mensalidades, controle de acesso,
biometria, catraca, Wellhub, TotalPass, financeiro e relatórios).

> ⚠️ Todas as integrações (catraca, leitor biométrico, Wellhub, TotalPass, PIX/pagamentos) são
> **simuladas**. Os dados são fictícios e ficam salvos apenas no navegador (localStorage).

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`. Login do painel:

- **E-mail:** admin@mansaomaromba.com
- **Senha:** admin123

Outros comandos: `npm run build` (gera `dist/`) · `npm run typecheck`.

## Roteiro de apresentação

1. Site → seções Estrutura e Planos → **Acessar sistema**
2. Dashboard → **Novo aluno** → escolher plano → salvar (matrícula `MM-000488` gerada)
3. **Cadastrar digital agora** (simulação do leitor)
4. **Controle de Acesso** → selecionar o aluno → **Simular biometria** → ✓ ACESSO LIBERADO
5. Selecionar *Carlos Henrique* (inadimplente) → ✕ ACESSO NEGADO → **Liberar manualmente**
6. **Wellhub** / **TotalPass** → verificar check-in → liberar acesso
7. **Mensalidades** → Receber (Carlos) → status muda para ATIVO
8. **Catraca** (central ao vivo) e **Relatórios** → Exportar PDF

Para recomeçar a apresentação: **Configurações → Restaurar dados de demonstração**.

## Tecnologias

React 19 · TypeScript · Vite · Tailwind CSS 4 · Lucide Icons · Recharts · jsPDF

## Estrutura

```
src/
  assets/        imagens ilustrativas
  components/
    ui/          componentes reutilizáveis (Button, Modal, Badge, Table...)
    admin/       componentes do painel (catraca, leitor, pagamentos...)
    charts/      gráficos
    site/        seções do site público
  data/          dados fictícios (seed) e séries dos gráficos
  hooks/         estado global (dados, auth, toasts) e utilitários
  layouts/       layout do painel (sidebar, topo, busca, notificações)
  pages/         páginas (public, auth, admin)
  services/
    integrations/  contratos + implementações SIMULADAS
    repository.ts  persistência (localStorage → Supabase futuramente)
    rules.ts       regras de negócio (status, liberação de acesso)
    reports.ts     relatórios e exportação PDF
  types/         tipos de domínio
  utils/         formatação, datas, máscaras
```

## Integrações futuras

Cada integração possui uma interface em `src/services/integrations/types.ts`
(`BiometricReader`, `TurnstileDriver`, `PartnerCheckinProvider`, `PaymentGateway`) e uma
implementação simulada em `simulated.ts`. Para conectar o serviço real, crie uma nova classe que
implemente a interface e troque a instância em `src/services/integrations/index.ts`.

A persistência segue o mesmo padrão: implemente `DataRepository` (ex.: com Supabase/PostgreSQL)
em `src/services/repository.ts`.

## Publicação (GitHub Pages)

O workflow `.github/workflows/deploy.yml` publica o site a cada push na branch `main`.
No GitHub: **Settings → Pages → Source: GitHub Actions**.

## Logo

`public/logo.png` (logo completa) e `public/logo-mark.png` (ícone usado no menu e na aba do navegador).
