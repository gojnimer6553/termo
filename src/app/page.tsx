'use client'
import React, { useState, useEffect, useRef } from 'react';
import { InputButton, InputContainer, KeyboardContainer, KeyboardLetter, KeyboardLine, Letter, Message, StyledInput, Title, Word, styleLetterAlmost, styleLetterKeyBoardAlmost, styleLetterKeyBoardStrong, styleLetterKeyBoardSuccess, styleLetterKeyBoardUnknown, styleLetterStrong, styleLetterSuccess, } from '../../styles'
import palavras from './palavras.json'
import { KeyboardLetterItem } from '@/components/KeyboardLetter';

export enum LetterClassification {
  correct = 1,
  strong = 2,
  almost = 3,
  unknown = 4
}

export default function Home() {
  const [correctWord, setCorrectWord] = useState('');
  const [word, setWord] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [inputValue, setInputValue] = useState(['', '', '', '', '']);
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef()];
    const [focusIndex, setFocusIndex] = useState(-1);

  const handleInputWordSubmit = () => {
    let text = ''
    inputValue.forEach(i => text += i)
    setMessage('')
    setFocusIndex(0)
    setWord(text)

    if (words.length === 6) {
      setMessage(`Que pena, vc perdeu! a palavra era ${correctWord.toUpperCase()}`)
      return
    }

    if (text.length === 5) {
      const existsWord = palavras.find(p => p.toUpperCase() === text.toUpperCase())
      if (!existsWord) {
        setMessage('Palavra não existe')
        return
      }

      setWords([...words, text])
      setWord('')
      setInputValue(['', '', '', '', ''])
      inputRefs[0].current.focus()

      if (text === correctWord) {
        setMessage('Parabens vc arrebentou')
      }
      return
    }
    const indexWithoutValue = inputValue.findIndex(i => !i)
    setFocusIndex(indexWithoutValue)
    inputRefs[indexWithoutValue].current.focus()
  };

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * palavras.length);
    setCorrectWord(palavras[randomIndex])
  }, [])

  const handleChange = (index: number, value: string) => {
    const newInputValue = [...inputValue];
    newInputValue[index] = value;
    setInputValue(newInputValue);

    if (value && index < inputRefs.length - 1) {
      inputRefs[index + 1].current.focus();
      setFocusIndex(index + 1)
      return
    }

    const indexWithoutValue = inputValue.findIndex(i => !i)
    setFocusIndex(indexWithoutValue)
    inputRefs?.[indexWithoutValue]?.current.focus()
  };

  const handleKeyDown = (index: number, event: any) => {
    if (event.key === 'Backspace' && index > 0 && !inputValue[index]) {
      // Se pressionar "Backspace" e o campo atual estiver vazio, move o foco para o campo anterior
      inputRefs[index - 1].current.focus();
      setFocusIndex(index - 1)
    }
    if (event.key === 'Enter') {
      handleInputWordSubmit()
    }
  };

  const validedLetter = (letter: string, index: number, inputWord: string): LetterClassification => {
    const correctLetters = correctWord.split('')
    if (correctLetters[index].toUpperCase() === letter.toUpperCase()) {
      return LetterClassification.correct
    }

    const lettersWithExistsInWord = correctLetters.filter(l => l.toUpperCase() === letter.toUpperCase())
    if (lettersWithExistsInWord.length) {
      for (let index = 0; index < correctLetters.length; index++) {
        const iterator = correctLetters[index];

        if(iterator === letter) {
          if(lettersWithExistsInWord.length === 1 && inputWord[index] === iterator) {
            console.log({lettersWithExistsInWord, inputWord : inputWord[index], iterator})
            return LetterClassification.strong
          }
        }
      }
      return LetterClassification.almost
    }

    return LetterClassification.strong
  }

  const validedLetterOfWord = (letter: string, index: number, inputWord: string): React.CSSProperties => {
    const letterClassification = validedLetter(letter, index, inputWord)

    if (letterClassification === LetterClassification.correct) return styleLetterSuccess

    if (letterClassification === LetterClassification.almost) return styleLetterAlmost

    return styleLetterStrong
  }

  const validedLetterOfKeboard = (letter: string): LetterClassification => {
    let letterClassification = LetterClassification.unknown
    for (const w of words) {
      const l = w.split('')
      for (let index = 0; index < l.length; index++) {
        const iterator = l[index];

        if (letter === iterator) {
          letterClassification = validedLetter(letter, index, '')
        }
      }
    }

    return letterClassification
  }

  const firstLine = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']
  const secondLine = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l']
  const thirdLine = ['z', 'x', 'c', 'v', 'b', 'n', 'm']

  const onClickLetterKeyboard = (letter: string) => {
    const focusedIndex = focusIndex

    if (focusedIndex !== -1) {
      handleChange(focusedIndex, letter);
    } else {
      // Lógica a ser executada se nenhum input estiver com foco
      console.log("Nenhum input está com foco.");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Title>TERMO</Title>
      <Message>{message}</Message>
      {words.map(w => (
        <Word>{w.split('').map((letter, index) => {
          const letterStyle = validedLetterOfWord(letter, index, w)
          return (<Letter style={letterStyle}>{letter}</Letter>)
        })}</Word>
      ))}

      <InputContainer>
        {inputValue.map((value, index) => (
          <StyledInput
            key={index}
            type="text"
            maxLength={1}
            value={value}
            onClick={() => setFocusIndex(index)}
            onChange={(e: any) => handleChange(index, e.target.value)}
            ref={inputRefs[index]}
            onKeyDown={(e) => handleKeyDown(index, e)}
          />
        ))}
      </InputContainer>

      <KeyboardContainer>
        <KeyboardLine>
          {firstLine.map(k => (<KeyboardLetterItem onHandleClick={onClickLetterKeyboard} letter={k} validedLetterOfKeyboard={validedLetterOfKeboard} />))}
        </KeyboardLine>
        <KeyboardLine>
        {secondLine.map(k => (<KeyboardLetterItem onHandleClick={onClickLetterKeyboard} letter={k} validedLetterOfKeyboard={validedLetterOfKeboard} />))}
        </KeyboardLine>
        <KeyboardLine>
        {thirdLine.map(k => (<KeyboardLetterItem onHandleClick={onClickLetterKeyboard} letter={k} validedLetterOfKeyboard={validedLetterOfKeboard} />))}
          <InputButton onClick={handleInputWordSubmit}>ENTER</InputButton>
        </KeyboardLine>
      </KeyboardContainer>

    </main>
  )
}
