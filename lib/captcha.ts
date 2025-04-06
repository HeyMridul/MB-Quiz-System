// Simple CAPTCHA generation and validation

type CaptchaType = {
  question: string
  answer: string
}

// Generate a simple math CAPTCHA
export function generateCaptcha(): CaptchaType {
  const operations = ["+", "-", "×"]
  const operation = operations[Math.floor(Math.random() * operations.length)]

  let num1: number, num2: number, answer: number

  switch (operation) {
    case "+":
      num1 = Math.floor(Math.random() * 10) + 1
      num2 = Math.floor(Math.random() * 10) + 1
      answer = num1 + num2
      break
    case "-":
      num1 = Math.floor(Math.random() * 10) + 5
      num2 = Math.floor(Math.random() * 5) + 1
      answer = num1 - num2
      break
    case "×":
      num1 = Math.floor(Math.random() * 5) + 1
      num2 = Math.floor(Math.random() * 5) + 1
      answer = num1 * num2
      break
    default:
      num1 = Math.floor(Math.random() * 10) + 1
      num2 = Math.floor(Math.random() * 10) + 1
      answer = num1 + num2
  }

  return {
    question: `${num1} ${operation} ${num2} = ?`,
    answer: answer.toString(),
  }
}

// Validate the CAPTCHA answer
export function validateCaptcha(captcha: CaptchaType, userAnswer: string): boolean {
  return captcha.answer === userAnswer.trim()
}

