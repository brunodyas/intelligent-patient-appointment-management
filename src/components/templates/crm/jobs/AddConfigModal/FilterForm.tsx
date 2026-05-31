import { Button } from '@/components/atomics';
import { useState } from 'react';
import { initializePossibleBlinds } from '@/utils/filterBlinds'
import { questionsData } from '@/constants/enums/config';

type Props = {
  setFormData: (val: any) => void;
  formData: Record<string, any>;
};

type QAData = {
  question: string;
  answer: string;
}

const DEFAULT_DATA: QAData[] = questionsData.map(({ question }) => {
  return {
    question,
    answer: ""
  }
})

const FilterForm = ({ formData, setFormData }: Props) => {
  const [possibleBlinds, setPossibleBlinds] = useState<Set<string>>(initializePossibleBlinds(questionsData))
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const totalQuestions = questionsData.length;

  const handleClick = (question: string, option: string) => {
    setFormData((prevState: Record<string, any>) => ({
      ...prevState,
      filter_questions_answers: [...prevState.filter_questions_answers, { question: question, answer: option }]
    }));
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      filterBlinds({ question: question, answer: option })
    }
  };

  const currentQuestion = questionsData[currentQuestionIndex];

  const filterBlinds = (answerData: QAData) => {
    const { question, answer } = answerData;
    if (canUpdateBlinds(question, answer)) {
      const matchedQuestion = questionsData.find(q => q.question === question);
      const updatedBlinds = new Set<string>(matchedQuestion?.blinds[answer]);
      setPossibleBlinds(new Set([...possibleBlinds].filter(blind => updatedBlinds.has(blind))));
    }
  }

  const canUpdateBlinds = (question: string, answer: string): boolean => {
    if (answer === "") return true;  // Always allow deselection

    const matchedQuestion = questionsData.find(q => q.question === question);
    if (!matchedQuestion) return false;

    const updatedBlinds = new Set<string>(matchedQuestion.blinds[answer]);
    return Array.from(possibleBlinds).some(blind => updatedBlinds.has(blind));
  };

  const { question, options } = currentQuestion
  return (
    <div>
      {currentQuestionIndex !== totalQuestions - 1
        ?
        <div className="w-full flex-col m-2">
          <label className="text-sm font-semibold text-neutral-100 max-sm:text-xs">
            {question}
          </label>
          <div className="flex gap-3 mt-2">
            {options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleClick(question, option)}
                disabled={!canUpdateBlinds(question, option)}
                size="md"
                variant={formData[question] === option ? "tab-selected" : "tab-unselect"}
                className="!rounded-lg"
              >
                {option}
              </Button>
            ))}
          </div>
          <div className="w-1/3 bg-gray-200 h-2 mt-5 rounded-lg">
            <div className="bg-primary-main h-2 rounded-lg transition-all duration-1000 ease-out"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}>
            </div>
          </div>
        </div>
        :
        <div>
          <p className="font-lg font-semibold m-2">Compatible Blind{possibleBlinds.size > 1 ? "s" : ""}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from(possibleBlinds).map(blind => (
              <div key={blind} className="p-2 shadow-sm rounded-md border border-gray-200 bg-white">
                <span className="text-gray-800 text-sm font-medium text-center">{blind}</span>
              </div>
            ))}
          </div>
        </div>
      }
      <div className={`w-1/3 flex ${!(currentQuestionIndex > 0) ? "justify-end" : "justify-between"}`}>
        {currentQuestionIndex > 0 && (
          <Button
            variant="primary-outline"
            className="mt-2 !h-10"
            size="sm"
            onClick={() => {
              setPossibleBlinds(initializePossibleBlinds(questionsData));
              setFormData((prevFormData: Record<string, any>) => ({ ...prevFormData, filter_questions_answers: [] }));
              setCurrentQuestionIndex(0);
            }}
          >
            Reset
          </Button>
        )}
        {currentQuestionIndex < totalQuestions - 1 &&
          <Button
            variant="primary-nude"
            className="mt-2 !h-10"
            size="sm"
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
          >
            Skip
          </Button>
        }
      </div>
    </div>
  );
}

export default FilterForm;
