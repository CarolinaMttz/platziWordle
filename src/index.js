import { fromEvent, Subject } from 'rxjs';
import WORDS_LIST from './wordsList.json';
import { map, filter, takeUntil } from 'rxjs/operators';

const restartButton = document.getElementById("restart-button");
const letterRows    = document.getElementsByClassName("letter-row");
const onKeyDown$    = fromEvent(document,"keydown");
const messageText   = document.getElementById("message-text");
let letterIndex     = 0;
let letterRowIndex  = 0;
let userAnswer      = [];
const getRandomWord = () => WORDS_LIST[ Math.floor(Math.random() * WORDS_LIST.length) ];
let rightWord       = getRandomWord();
const userWinOrLoose$ = new Subject();
console.log('Palabra correcta: ', rightWord );

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
        userAnswer.push(letter);            
        letterIndex++;        
    },
};

const checkWord$ = onKeyDown$.pipe(
    map( (event) => event.key ),
    filter( (key) => key === 'Enter' && letterIndex === 5  && letterRowIndex <= 5)
);

const checkWord = {
    next: () => {       
            const rightWordArray = Array.from(rightWord);
            if(userAnswer.length !== 5){
                messageText.textContent = 'Te faltan algunas letras';
                return;
            }

            for (let index = 0; index < 5; index++) {
                let letterColor = "";
                let letterBox =  Array.from(letterRows)[letterRowIndex].children[index];
                let letterPosition = Array.from(rightWord).indexOf(userAnswer[index]);
                console.log(letterPosition);

                if( letterPosition === -1 ){
                    letterColor = 'letter-gray';
                }else{
                    if( rightWordArray[index] === userAnswer[index] ){
                        letterColor = 'letter-green';
                    }else{
                        letterColor = 'letter-yellow';
                    }
                }
                letterBox.classList.add(letterColor);
            }

            // if(userAnswer.length === 5){
            //     letterIndex = 0;
            //     userAnswer = [];
            //     letterRowIndex++;
            // }

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
  

    userWinOrLoose$.subscribe( () => {
        let letterRowsWinned = Array.from(letterRows)[letterRowIndex];  
        for (let index = 0; index < 5; index++) {
            letterRowsWinned.children[index].classList.add('letter-green');
        }
    });

    insertLetter$.pipe( takeUntil(userWinOrLoose$) ).subscribe(insertLetter);
    checkWord$.pipe( takeUntil(userWinOrLoose$) ).subscribe(checkWord);
    removeLetter$.pipe( takeUntil(userWinOrLoose$) ).subscribe(removeLetter);
