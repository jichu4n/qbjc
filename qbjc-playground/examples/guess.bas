' Welcome to qbjc Playground!
'
' qbjc is a QBasic to JavaScript compiler. The qbjc Playground
' lets you edit and run QBasic programs directly in the browser.
'
' To get started:
'
' - Press the blue "Play" button below to run this program. The
'   result will be displayed in the "OUTPUT" window on the right.
'
' - Feel free to modify and play around with this program. You can
'   also check out some other example programs using the "Open"
'   button at the top.
' 

CLS
PRINT "Hi! Welcome to qbjc Playground!"
PRINT

INPUT "What's your name? ", name$
PRINT "Hello, "; name$; "! Let's play a game! "

DO
  PRINT
  PlayNumberGuessingGame
  PRINT
  playAgain$ = InputYN$("Play again?")
  PRINT
LOOP WHILE playAgain$ = "Y"

PRINT
PRINT "Thanks for playing "; name$; "! Have a great day!"
PRINT


SUB PlayNumberGuessingGame
  PRINT "I'll think of a number between 1 and 10, ";
  PRINT "and you have 3 tries to guess it!"
  answer = INT(RND * 10) + 1
  remainingTries = 3
  DO
    PRINT
    INPUT "Enter your guess: ", guess
    IF answer = guess THEN
      PRINT "Yay! You guessed the answer!"
      EXIT DO
    ELSE
      remainingTries = remainingTries - 1
      IF remainingTries <= 0 THEN
        PRINT "Sorry, you lost! The answer was"; answer
        EXIT DO
      ELSEIF answer < guess THEN
        PRINT "The answer is smaller than"; guess
      ELSE
        PRINT "The answer is larger than"; guess
      END IF
    END IF
  LOOP
END SUB


FUNCTION InputYN$(prompt$)
  PRINT prompt$; " (Y/N)";
  DO
    key$ = UCASE$(INKEY$)
  LOOP UNTIL key$ = "Y" OR key$ = "N"
  InputYN$ = key$
END FUNCTION
