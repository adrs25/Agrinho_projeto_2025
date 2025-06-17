// Garante que o script só execute após o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {
    // --- Variáveis Globais do Jogo ---
    let car1; // Objeto para o Carro 1
    let car2; // Objeto para o Carro 2
    const carWidth = 50; // Largura dos carros
    const carHeight = 30; // Altura dos carros
    const carSpeed = 5; // A velocidade base que cada "toque" de tecla adiciona

    let startLineX; // Posição X da linha de partida
    let finishLineX; // Posição X da linha de chegada
    let trackHeight; // Altura de cada "faixa" da corrida

    let gameState = 'start'; // Estados do jogo: 'start', 'playing', 'finished'
    let winner = null; // Armazena o vencedor ('Jogador 1' ou 'Jogador 2')

    let resetButton; // Referência ao botão de reiniciar o jogo (criado pelo p5.js)
    let p5Canvas; // Referência ao canvas criado pelo p5.js

    // --- Cria e Estiliza os Elementos HTML Fora do Canvas (UI) ---
    const body = document.body;
    body.style.margin = '0'; // Remove margens padrão do body
    body.style.overflow = 'hidden'; // Evita barras de rolagem
    body.style.display = 'flex'; // Usa flexbox para centralizar o conteúdo
    body.style.flexDirection = 'column'; // Organiza itens em coluna
    body.style.justifyContent = 'center'; // Centraliza verticalmente
    body.style.alignItems = 'center'; // Centraliza horizontalmente
    body.style.minHeight = '100vh'; // Garante que o body ocupe a altura total da viewport
    body.style.backgroundColor = '#333'; // Fundo escuro para destacar o canvas
    body.style.fontFamily = "'Inter', sans-serif"; // Fonte moderna
    body.style.color = '#eee'; // Cor do texto principal

    const gameInfoDiv = document.createElement('div');
    gameInfoDiv.className = 'game-info';
    gameInfoDiv.style.marginTop = '20px'; // Margem superior
    gameInfoDiv.style.textAlign = 'center'; // Texto centralizado
    body.appendChild(gameInfoDiv); // Adiciona a div ao body

    const title = document.createElement('h1');
    title.textContent = 'Corrida da Ligação Campo-Cidade!';
    gameInfoDiv.appendChild(title); // Adiciona o título à div de informações

    const player1Info = document.createElement('p');
    player1Info.textContent = "Jogador 1 (Carro Vermelho): Pressione 'D' para acelerar";
    gameInfoDiv.appendChild(player1Info); // Adiciona a instrução do jogador 1

    const player2Info = document.createElement('p');
    player2Info.textContent = "Jogador 2 (Carro Azul): Pressione 'Ç' para acelerar";
    gameInfoDiv.appendChild(player2Info); // Adiciona a instrução do jogador 2

    // --- Sketch p5.js ---
    // A função 's' será o nosso sketch, recebendo 'p' como a instância de p5.js
    const s = (p) => {
        // --- p.setup(): Configurações Iniciais do Canvas ---
        p.setup = () => {
            const canvasWidth = 800; // Largura fixa para manter a proporção do jogo
            const canvasHeight = 300; // Altura para duas pistas
            p5Canvas = p.createCanvas(canvasWidth, canvasHeight); // Cria o canvas
            p5Canvas.elt.style.display = 'block'; // Remove espaço extra abaixo do canvas
            p5Canvas.elt.style.border = '5px solid #fff'; // Borda branca ao redor do jogo
            p5Canvas.elt.style.borderRadius = '15px'; // Cantos arredondados
            p5Canvas.elt.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.5)'; // Sombra neon

            // Calcula as posições das linhas e pistas com base nas dimensões do canvas
            startLineX = 50;
            finishLineX = p.width - 70; // 70px da borda direita
            trackHeight = p.height / 2; // Cada carro terá metade da altura do canvas

            // Inicializa os objetos dos carros com suas propriedades
            car1 = {
                x: startLineX, // Posição inicial X
                y: trackHeight / 2, // Posição Y na pista superior
                color: p.color(255, 0, 0), // Cor Vermelha
                player: 'Jogador 1' // Nome do jogador
            };

            car2 = {
                x: startLineX, // Posição inicial X
                y: trackHeight + trackHeight / 2, // Posição Y na pista inferior
                color: p.color(0, 0, 255), // Cor Azul
                player: 'Jogador 2' // Nome do jogador
            };

            // Configura o botão de reset (criado pelo p5.js, mas com estilo CSS customizado)
            resetButton = p.createButton('Jogar Novamente');
            // Posiciona o botão abaixo do canvas
            resetButton.position(p.width / 2 - resetButton.width / 2, p.height + 70);
            resetButton.mousePressed(resetGame); // Define a função a ser chamada ao clicar
            resetButton.hide(); // Esconde o botão no início do jogo
            styleButton(resetButton); // Aplica o estilo CSS customizado ao botão
        };

        // --- p.draw(): Loop Principal do Jogo ---
        // Esta função é chamada repetidamente pelo p5.js para animar o jogo
        p.draw = () => {
            p.background(50, 150, 50); // Cor de fundo da pista (verde escuro)

            // Desenha os elementos da pista
            drawTrack(p);

            // Controla o fluxo do jogo de acordo com o estado atual
            if (gameState === 'start') {
                drawStartScreen(p); // Desenha a tela inicial
            } else if (gameState === 'playing') {
                updateGame(); // Atualiza a lógica do jogo (movimento dos carros, etc.)
                drawCars(p); // Desenha os carros
            } else if (gameState === 'finished') {
                drawCars(p); // Desenha os carros na posição final
                drawWinnerScreen(p); // Desenha a tela do vencedor
            }
        };

        // --- Funções de Desenho ---

        // Desenha a pista de corrida, linhas e textos
        function drawTrack(p) {
            // Desenha a linha de partida (branca, grossa)
            p.strokeWeight(5);
            p.stroke(255); // Branco
            p.line(startLineX, 0, startLineX, p.height);
            // Desenha a linha de chegada (branca, grossa)
            p.line(finishLineX, 0, finishLineX, p.height);

            // Linha divisória da pista (amarela, mais fina)
            p.strokeWeight(2);
            p.stroke(255, 200, 0); // Amarelo
            p.line(0, p.height / 2, p.width, p.height / 2);

            // Texto "START" na linha de partida
            p.fill(255); // Cor do texto (branco)
            p.textSize(20); // Tamanho da fonte
            p.textAlign(p.CENTER, p.CENTER); // Alinhamento do texto
            p.text("START", startLineX, p.height / 2);

            // Texto "FINISH" na linha de chegada
            p.text("FINISH", finishLineX, p.height / 2);
        }

        // Desenha os carros na tela
        function drawCars(p) {
            // Desenha Carro 1 (vermelho)
            p.fill(car1.color);
            p.rect(car1.x, car1.y, carWidth, carHeight, 5); // Desenha um retângulo com cantos arredondados

            // Desenha Carro 2 (azul)
            p.fill(car2.color);
            p.rect(car2.x, car2.y, carWidth, carHeight, 5); // Desenha um retângulo com cantos arredondados
        }

        // Desenha a tela inicial do jogo
        function drawStartScreen(p) {
            p.fill(0); // Cor do texto (preto)
            p.textSize(30);
            p.textAlign(p.CENTER, p.CENTER);
            p.text("Preparar... Apontar... Correr!", p.width / 2, p.height / 2 - 40);
            p.textSize(20);
            p.text("Pressione ENTER para começar!", p.width / 2, p.height / 2 + 20);
        }

        // Desenha a tela quando um vencedor é determinado
        function drawWinnerScreen(p) {
            p.fill(0); // Cor do texto (preto)
            p.textSize(40);
            p.textAlign(p.CENTER, p.CENTER);
            p.text(winner + " Venceu!", p.width / 2, p.height / 2 - 30);
            p.textSize(25);
            p.text("Pressione o botão para jogar novamente.", p.width / 2, p.height / 2 + 20);
            resetButton.show(); // Torna o botão de reset visível
        }

        // --- Funções de Lógica do Jogo ---

        // Atualiza o estado dos carros e verifica o vencedor
        function updateGame() {
            // Garante que os carros não ultrapassem as linhas de partida e chegada
            car1.x = p.constrain(car1.x, startLineX, finishLineX);
            car2.x = p.constrain(car2.x, startLineX, finishLineX);

            // Verifica se o Carro 1 alcançou a linha de chegada e não há vencedor ainda
            if (car1.x >= finishLineX && winner === null) {
                winner = car1.player; // Define o Carro 1 como vencedor
                gameState = 'finished'; // Muda o estado do jogo para finalizado
            }
            // Verifica se o Carro 2 alcançou a linha de chegada e não há vencedor ainda
            if (car2.x >= finishLineX && winner === null) {
                winner = car2.player; // Define o Carro 2 como vencedor
                gameState = 'finished'; // Muda o estado do jogo para finalizado
            }
        }

        // Reinicia o jogo para o estado inicial
        function resetGame() {
            car1.x = startLineX; // Reseta a posição do Carro 1
            car2.x = startLineX; // Reseta a posição do Carro 2
            winner = null; // Limpa o vencedor
            gameState = 'start'; // Volta para a tela de início
            resetButton.hide(); // Esconde o botão novamente
        }

        // --- Eventos do Teclado (Função do p5.js) ---
        // Detecta quando uma tecla é pressionada
        p.keyPressed = () => {
            // Se o jogo está na tela inicial e ENTER é pressionado, inicia o jogo
            if (gameState === 'start' && p.keyCode === p.ENTER) {
                gameState = 'playing';
            } else if (gameState === 'playing') {
                // Se o jogo está em andamento:
                if (p.key === 'd' || p.key === 'D') { // Tecla 'D' para o Jogador 1
                    car1.x += carSpeed * 5; // Acelera o carro vermelho
                }
                // Verifica a tecla 'ç' (considerando minúscula e maiúscula)
                if (p.key.toLowerCase() === 'ç') { // Tecla 'Ç' para o Jogador 2
                    car2.x += carSpeed * 5; // Acelera o carro azul
                }
            }
        };

        // Função para aplicar estilos CSS diretamente ao elemento DOM do botão p5.js
        function styleButton(buttonElement) {
            buttonElement.style('padding', '12px 25px');
            buttonElement.style('font-size', '1.2em');
            buttonElement.style('cursor', 'pointer');
            buttonElement.style('border', 'none');
            buttonElement.style('border-radius', '10px');
            buttonElement.style('background', 'linear-gradient(145deg, #007bff, #0056b3)');
            buttonElement.style('color', 'white');
            buttonElement.style('box-shadow', '5px 5px 15px rgba(0,0,0,0.3), -5px -5px 15px rgba(255,255,255,0.1)');
            buttonElement.style('transition', 'all 0.3s ease');
            buttonElement.style('margin-top', '20px');

            // Adiciona event listeners para efeitos de hover e active no elemento DOM nativo do botão
            buttonElement.elt.onmouseover = () => {
                buttonElement.style('background', 'linear-gradient(145deg, #0056b3, #007bff)');
                buttonElement.style('box-shadow', '3px 3px 10px rgba(0,0,0,0.2), -3px -3px 10px rgba(255,255,255,0.05)');
                buttonElement.style('transform', 'translateY(-2px)');
            };
            buttonElement.elt.onmouseout = () => {
                buttonElement.style('background', 'linear-gradient(145deg, #007bff, #0056b3)');
                buttonElement.style('box-shadow', '5px 5px 15px rgba(0,0,0,0.3), -5px -5px 15px rgba(255,255,255,0.1)');
                buttonElement.style('transform', 'translateY(0)');
            };
            buttonElement.elt.onmousedown = () => {
                buttonElement.style('transform', 'translateY(0)');
                buttonElement.style('box-shadow', 'inset 2px 2px 5px rgba(0,0,0,0.3)');
            };
            buttonElement.elt.onmouseup = () => {
                 buttonElement.style('background', 'linear-gradient(145deg, #007bff, #0056b3)'); // Reseta background ao soltar
                buttonElement.style('box-shadow', '5px 5px 15px rgba(0,0,0,0.3), -5px -5px 15px rgba(255,255,255,0.1)'); // Reseta sombra
            };
        }
    };

    // Cria uma nova instância do p5.js, passando nosso sketch 's'
    // Isso inicia o ambiente p5.js e executa as funções setup() e draw()
    new p5(s);
});