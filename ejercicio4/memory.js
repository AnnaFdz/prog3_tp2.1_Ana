class Card {
    constructor(name, img) {
        this.name = name;
        this.img = img;
        this.isFlipped = false;
        this.element = this.#createCardElement();
    }

    #createCardElement() {
        const cardElement = document.createElement("div");
        cardElement.classList.add("cell");
        cardElement.innerHTML = `
          <div class="card" data-name="${this.name}">
              <div class="card-inner">
                  <div class="card-front"></div>
                  <div class="card-back">
                      <img src="${this.img}" alt="${this.name}">
                  </div>
              </div>
          </div>
      `;
        return cardElement;
    }

    #flip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.add("flipped");
    }

    #unflip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.remove("flipped");
    }
    
    toggleFlip() {
        if (this.isFlipped == false) {
            this.isFlipped = true;
            this.#flip();
        } else {
            this.isFlipped = false;
            this.#unflip();
        }
      
    }
    matches(otherCard) {
        return this.name === otherCard.name;
    }
}

class Board {
    constructor(cards) {
        this.cards = cards;
        this.fixedGridElement = document.querySelector(".fixed-grid");
        this.gameBoardElement = document.getElementById("game-board");
    }

    #calculateColumns() {
        const numCards = this.cards.length;
        let columns = Math.floor(numCards / 2);

        columns = Math.max(2, Math.min(columns, 12));

        if (columns % 2 !== 0) {
            columns = columns === 11 ? 12 : columns - 1;
        }

        return columns;
    }

    #setGridColumns() {
        const columns = this.#calculateColumns();
        this.fixedGridElement.className = `fixed-grid has-${columns}-cols`;
    }

    render() {
        
        this.#setGridColumns();
        this.gameBoardElement.innerHTML = "";
        this.cards.forEach((card) => {
            card.element
                .querySelector(".card")
                .addEventListener("click", () => this.onCardClicked(card));
            this.gameBoardElement.appendChild(card.element);
        });
    }

    onCardClicked(card) {
        if (this.onCardClick) {
            this.onCardClick(card);
        }
    }
    
    shuffleCards() {

        
        // let cardsOriginal = this.cards.slice();
        // console.log(cardsOriginal);
      let randomizeIndex = this.cards.slice();
    //   console.log(randomizeIndex);
      randomizeIndex.sort(() => Math.random() - 0.5);
      for (let i = 0; i < this.cards.length; i++) {
        this.cards[i] = randomizeIndex[i];
    }
    //console.log(this.cards);
    
    
    }
    flipDownAllCards() {
        this.cards.forEach((card) => {
            if (card.isFlipped) {
                card.toggleFlip();
            }
        });
    }
    reset() {
        this.shuffleCards();
        this.flipDownAllCards();
        this.render();
    }
    
}

class MemoryGame {
    constructor(board, flipDuration = 500) {
        this.board = board;
        this.flippedCards = [];
        this.matchedCards = [];
        if (flipDuration < 350 || isNaN(flipDuration) || flipDuration > 3000) {
            flipDuration = 350;
            alert(
                "La duración de la animación debe estar entre 350 y 3000 ms, se ha establecido a 350 ms"
            );
        }
        this.flipDuration = flipDuration;
        this.board.onCardClick = this.#handleCardClick.bind(this);
        this.board.reset();
        this.count = 0;
        this.updateCounter()
        this.time = 0;  
        this.timerInterval = null;
        this.updateTimer();
    }

    #handleCardClick(card) {
        if (!this.timerInterval) {  
            this.startTimer();
        }
        this.count++;
        this.updateCounter();
        if (this.flippedCards.length < 2 && !card.isFlipped) {
            card.toggleFlip();
            this.flippedCards.push(card);

            if (this.flippedCards.length === 2) {               
                setTimeout(() => this.checkForMatch(), this.flipDuration);
            }
        }
    }
    checkForMatch() {
        const [card1, card2] = this.flippedCards;
        if (card1.matches(card2)) {
            this.matchedCards.push(card1, card2);
            this.flippedCards = [];
            if (this.matchedCards.length === this.board.cards.length) {
                this.stopTimer();
                alert("¡Has encontrado todas las parejas! Fin del Juego!");
                // this.resetGame();
            }
        } else {
            this.flippedCards.forEach((card) => card.toggleFlip());
            this.flippedCards = [];
        }
    }
    updateCounter() {
        document.getElementById("counter").textContent = `Movimientos: ${this.count}`;
    }
    updateTimer() {
        // document.getElementById("timer").textContent = `Tiempo: ${}s`;
                
        const hoursLabel = document.getElementById("hours");
        const minutesLabel = document.getElementById("minutes");
        const secondsLabel = document.getElementById("seconds");
        secondsLabel.innerHTML = this.formatTime(this.time% 60);
        minutesLabel.innerHTML = this.formatTime(parseInt(this.time/ 60));
        hoursLabel.innerHTML = this.formatTime(parseInt(this.time/3600));

    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.time++;
            this.updateTimer();
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }
    formatTime(val) {
        const valString = val + "";
        if (valString.length < 2) {
          return "0" + valString;
        } else {
          return valString;
         }

    }
    resetGame() {
        this.flippedCards = [];
        this.matchedCards = [];
        this.board.reset();
        this.count = 0;
        this.updateCounter();
        this.time = 0;   
        this.stopTimer();
        this.updateTimer(); 
        this.timerInterval = null;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const cardsData = [
        { name: "Python", img: "./img/Python.svg" },
        { name: "JavaScript", img: "./img/JS.svg" },
        { name: "Java", img: "./img/Java.svg" },
        { name: "CSharp", img: "./img/CSharp.svg" },
        { name: "Go", img: "./img/Go.svg" },
        { name: "Ruby", img: "./img/Ruby.svg" },
    ];

    const cards = cardsData.flatMap((data) => [
        new Card(data.name, data.img),
        new Card(data.name, data.img),
    ]);
    const board = new Board(cards);
    const memoryGame = new MemoryGame(board, 1000);
    
    document.getElementById("restart-button").addEventListener("click", () => {
        memoryGame.resetGame();
    });
});
