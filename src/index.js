import { from, fromEvent, Subject, merge } from 'rxjs';
import WORDS_LIST from './wordsList.json';
import { map, filter, takeUntil } from 'rxjs/operators';

const restartButton = document.getElementById("restart-button");
const letterRows    = document.getElementsByClassName("letter-row");
const onKeyDown$    = fromEvent(document,"keydown");
const messageText   = document.getElementById("message-text");
let letterIndex;
let letterRowIndex;
let userAnswer;
const getRandomWord = () => WORDS_LIST[ Math.floor(Math.random() * WORDS_LIST.length) ];
let rightWord;
const userWinOrLoose$ = new Subject();

const insertLetter$ = onKeyDown$.pipe(
    map( (event) => event.key.toUpperCase() ),
    filter(
        (pressedKey) =>
            pressedKey.length === 1 && pressedKey.match(/[a-z]/i)  && letterIndex < 5
    ) 
)

const insertLetter = {
    next: (letter) => {
        let letterBox = Array.from(letterRows)[letterRowIndex].children[letterIndex];
        letterBox.textContent = letter;
        letterBox.classList.add("filled-letter");
        letterIndex++; 
        userAnswer.push(letter);    
    },
};

const checkWord$ = onKeyDown$.pipe(
    map( (event) => event.key ),
    filter((key) => key === "Enter" && letterRowIndex < 6)
);

const checkWord = {
    next: () => {       
            //const rightWordArray = Array.from(rightWord);
            if (userAnswer.length != 5) {
                messageText.textContent =
                  userAnswer.length === 4
                    ? "Te falta 1 letra"
                    : `Te faltan ${5 - userAnswer.length} letras`;
                return;
            }
          
            
            if (!WORDS_LIST.includes(userAnswer.join(""))) {
                messageText.textContent = `La palabra ${userAnswer
                .join("")
                .toUpperCase()} no está en la lista`;
                return;
            }

            userAnswer.map((_, index) => {
                let letterColor = "";
                //let letterBox =  Array.from(letterRows)[letterRowIndex].children[index];
                let letterBox = letterRows[letterRowIndex].children[index];
                //let letterPosition = Array.from(rightWord).indexOf(userAnswer[index]);
                let letterPosition = rightWord.indexOf(userAnswer[index]);
                console.log(letterPosition);

                if (rightWord[index] === userAnswer[index]) {
                    letterColor = "letter-green";
                } else {
                    if (letterPosition === -1) {
                        letterColor = "letter-grey";
                    } else {
                        letterColor = "letter-yellow";
                    }
                }
                letterBox.classList.add(letterColor);
            });

            if( userAnswer.join("") === rightWord ){                
                messageText.textContent = `Si, la palabra ${rightWord.toUpperCase()} es correcta`;
                userWinOrLoose$.next();
                restartButton.disabled = false;
            } else {
                letterIndex = 0;
                letterRowIndex++;
                userAnswer = [];
 
                if( letterRowIndex === 6 ) {
                    messageText.textContent = `Perdiste, la palabra correcta era ${rightWord.toUpperCase()}`;
                    userWinOrLoose$.next();
                    restartButton.disabled = false;
                }
            }
           
        
    }
}

    const removeLetter$ = onKeyDown$.pipe(
        map((event) => event.key),
        filter((key) => key === "Backspace" && letterIndex !== 0)
    );

    const removeLetter = {
        next: () => {
            let letterBox = letterRows[letterRowIndex].children[userAnswer.length - 1];
            letterBox.textContent = "";
            letterBox.classList = "letter";
            letterIndex--;
            userAnswer.pop();
        },
    };
  

    // userWinOrLoose$.subscribe( () => {
    //     let letterRowsWinned = Array.from(letterRows)[letterRowIndex];  
    //     for (let index = 0; index < 5; index++) {
    //         letterRowsWinned.children[index].classList.add('letter-green');
    //     }
    // });


    const onWindowLoad$   = fromEvent(window, "load");
    const onRestartClick$ = fromEvent(restartButton, "click");
    const restartGame$    = merge(onWindowLoad$, onRestartClick$);

    restartGame$.subscribe( () => {
        
        Array.from(letterRows).map((row) =>
            Array.from(row.children).map((letterBox) => {
                    letterBox.textContent = "";
                    letterBox.classList = "letter";
                })
        );
        
        letterRowIndex = 0;
        letterIndex    = 0;
        userAnswer     = [];
        messageText.textContent = "";
        rightWord               = getRandomWord();    
        restartButton.disabled  = true;
        
        console.log(`Right word: ${rightWord}`);

        let insertLetterSuscription = insertLetter$.pipe( takeUntil(userWinOrLoose$) ).subscribe(insertLetter);
        let checkWordSuscription    = checkWord$.pipe( takeUntil(userWinOrLoose$) ).subscribe(checkWord);
        let removeLetterSuscription = removeLetter$.pipe( takeUntil(userWinOrLoose$) ).subscribe(removeLetter);
    }); 