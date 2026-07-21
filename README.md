# ⚙️ Trilha da Física

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=111827)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Three.js](https://img.shields.io/badge/3D-Three.js-111111?logo=threedotjs&logoColor=white)
![React Three Fiber](https://img.shields.io/badge/Canvas-React_Three_Fiber-20232A)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Status](https://img.shields.io/badge/status-jogo_educativo-blue)

Um jogo educativo de tabuleiro 3D para revisão de conteúdos de **Física no ensino regular**.

Em uma disputa entre dois robôs, os jogadores respondem questões, lançam o dado, avançam pelo tabuleiro e lidam com eventos como casas de perigo, retorno para a largada, confronto entre peças e animação de vitória.

Projeto desenvolvido como trabalho da disciplina **Física Experimental**, do curso de **Engenharia de Computação** da **UNIVASF**, no período **2021.1**, ministrada pelo professor **Anibal Livramento da Silva Netto**.

## ✨ Propósito

- Apoiar a revisão de conteúdos de Física.
- Estimular participação por meio de perguntas e respostas.
- Tornar a aula mais lúdica com tabuleiro, robôs, sons e animações.
- Oferecer um recurso reutilizável para sala de aula ou estudo orientado.

## 🕹️ Como Jogar

A partida é disputada por dois jogadores, cada um representado por um robô no tabuleiro.

Em cada turno:

1. O jogador ativo recebe uma pergunta.
2. Se errar, o robô reage ao erro e o turno passa para o outro jogador.
3. Se acertar, o robô comemora, o dado é lançado e a peça avança.
4. O robô percorre a rota entre a casa atual e a nova casa.
5. Ao parar, o jogo verifica o tipo da casa e aplica o evento correspondente.

Algumas casas mudam o fluxo da partida:

- casas normais apenas mantêm a corrida;
- casas de perigo fazem o robô voltar para a largada;
- quando um jogador cai na mesma casa do outro, ocorre uma animação de confronto e o oponente volta para o início;
- a casa final encerra a partida com animação de vitória.

## 🧠 Mecânicas do Jogo

- Quiz com perguntas adaptáveis a diferentes conteúdos de Física.
- Dado para definir o avanço após uma resposta correta.
- Tabuleiro 3D com duas faixas de percurso.
- Robôs animados para representar os jogadores.
- Rotas calculadas entre casas, incluindo curvas e retorno.
- Animações para acerto, erro, caminhada, corrida, queda, soco, retorno e vitória.
- Câmera automática para movimentos e eventos importantes, com controle manual fora das animações prioritárias.
- Música de fundo, efeitos sonoros e controles de áudio.
- Estado da partida salvo localmente no navegador.
- Ferramentas de desenvolvimento para testar respostas e valores do dado.

## 🧰 Tecnologias

- **React** para a interface.
- **TypeScript** para tipagem e organização da lógica.
- **Vite** para desenvolvimento e build.
- **Three.js** para a cena 3D.
- **React Three Fiber** para integrar Three.js ao React.
- **Drei** para utilitários de câmera, texto e controles 3D.
- **Tailwind CSS** para estilos.
- **shadcn/ui** como referência para componentes.
- **Lucide React** para ícones.
- **Sonner** para notificações.

## 🚀 Rodando Localmente

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Gere o build de produção:

```bash
npm run build
```

Pré-visualize o build:

```bash
npm run preview
```

### Configuração de Publicação

O build detecta automaticamente o endereço do GitHub Pages a partir da variável `GITHUB_REPOSITORY`, gerando caminhos como `/nome-do-repositorio/` para assets, favicon, sitemap e metadados sociais.

Para usar um domínio customizado ou sobrescrever o endereço público, defina:

```bash
VITE_SITE_URL=https://seudominio.com/
```

Se a aplicação precisar ser publicada em um subdiretório específico, defina também:

```bash
VITE_BASE_PATH=/subdiretorio/
```

## 🗂️ Estrutura

```txt
src/
  assets/
    models/             modelo 3D usado pelos robôs
  components/
    game/               tabuleiro, cena 3D, robôs, HUDs e cards do jogo
    ui/                 componentes reutilizáveis de interface
  data/
    questions.ts        perguntas e alternativas do quiz
  lib/
    confetti.ts         efeito visual de vitória
    gameState.ts        estado inicial, labels e helpers de direção
    soundEffects.ts     efeitos sonoros sintetizados
    useGameAudio.ts     música, volume e controle de áudio
    utils.ts            utilitários gerais
  App.tsx               fluxo principal da partida
  main.tsx              entrada da aplicação
  styles.css            estilos globais
```

## 🧩 Principais Módulos

- `src/App.tsx`: controla fases da partida, turnos, pontuação, respostas e eventos do tabuleiro.
- `src/components/game/GameScene.tsx`: monta a cena 3D, câmera, ambiente, tabuleiro e robôs.
- `src/components/game/RobotPiece.tsx`: controla movimento, animações, orientação e posição dos robôs.
- `src/components/game/board.ts`: define casas, posições, faixas dos jogadores e rotas.
- `src/data/questions.ts`: concentra o banco de perguntas do jogo.
- `src/lib/useGameAudio.ts`: gerencia música, efeitos sonoros e configurações de áudio.

## 📚 Contexto Acadêmico

Este projeto foi desenvolvido como trabalho acadêmico na disciplina:

- **Disciplina:** Física Experimental
- **Curso:** Engenharia de Computação
- **Universidade:** Universidade Federal do Vale do São Francisco (UNIVASF)
- **Período:** 2021.1
- **Professor:** Anibal Livramento da Silva Netto

A aplicação, porém, pode ser adaptada para outros conteúdos de Física da educação básica.

## 🎵 Áudio e Assets

O projeto usa modelo 3D, músicas e efeitos sonoros com créditos e licenças descritos nos arquivos:

- `src/assets/models/LICENSE.md`
- `public/sounds/LICENSE.md`
- `public/LICENSE.md`

## 📌 Status

O projeto está em evolução como jogo educativo web. A base atual já inclui o fluxo principal de partida com perguntas, tabuleiro 3D, robôs animados, áudio e eventos especiais.
