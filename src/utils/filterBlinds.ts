import { Question } from "@/constants/enums/config";
import { questionsData } from "@/constants/enums/config";

// Utility function to initialize possible blinds
export function initializePossibleBlinds(questions = questionsData): Set<string> {
  return questions.reduce((acc, question) => {
    Object.values(question.blinds).forEach(blinds => {
      blinds.forEach(blind => acc.add(blind));
    });
    return acc;
  }, new Set<string>());
}

//on choose option
//preprocess
//filter 