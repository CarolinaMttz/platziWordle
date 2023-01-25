import { fromEvent, Subject } from 'rxjs';
import WORDS_LIST from './wordsList.json';


const letterRows    = document.getElementsByClassName("letter-row");
const onKeyDown$    = fromEvent(document,"keydown");
let letterIndex     = 0;
let letterRowIndex  = 0;
let userAnswer      = [];
const getRandomWord = () => WORDS_LIST[ Math.floor(Math.random() * WORDS_LIST.length) ];
let rightWord       = getRandomWord();
const userWinOrLoose$ = new Subject();
const messageText   = document.getElementById("message-text");
console.log('Palabra correcta: ', rightWord );

const insertLetter = {
    next: (event) => {
        const pressedKey = event.key.toUpperCase();
        if( pressedKey.length === 1 && pressedKey.match(/[a-z]/i) ){
            let letterBox = Array.from(letterRows)[letterRowIndex].children[letterIndex];
            letterBox.textContent = pressedKey;
            letterBox.classList.add("filled-letter");
            userAnswer.push(pressedKey);            
            letterIndex++;
        }

       
    },
};

const checkWord = {
    next: (event) => {
        if( event.key === 'Enter' ){         

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

            if(userAnswer.length === 5){
                letterIndex = 0;
                userAnswer = [];
                letterRowIndex++;
            }

            if( userAnswer.join("") === rightWord ){
                userWinOrLoose$.next();
            }
           
        }
    }
}

//Observador `removeLetter` (o `deleteLetter`) que nos ayuda a borrar la última letra
const deleteLetter = {
    next: (event) => {
      const pressedKey = event.key;
      // Verificamos si es la tecla Backspace y que no estamos en la primera posición [0]
      if (pressedKey === "Backspace" && letterIndex !== 0) {
        let currentRow = letterRows[letterRowIndex];
        let letterBox = currentRow.children[letterIndex-1];
        letterBox.textContent = "";
        letterBox.classList.remove("filled-letter");                   
        letterIndex--;
        userAnswer.pop(); 
      }
    }
  };
  

onKeyDown$.subscribe(insertLetter);
onKeyDown$.subscribe(checkWord);
onKeyDown$.subscribe(deleteLetter);

userWinOrLoose$.subscribe( () => {
    let letterRowsWinned = Array.from(letterRows)[letterRowIndex];   
    console.log(letterRowsWinned);  
    for (let index = 0; index < 5; index++) {
        letterRowsWinned.children[index].classList.add('letter-green');
    }
});

