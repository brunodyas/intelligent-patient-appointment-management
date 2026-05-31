import { CRMConfigByIdResponse } from "@/interface/config"
import { CRMJob } from "@/interface/jobs"

// Function to convert Markdown to plain text
function stripMarkdown(markdown: string): string {
  const regex = /[#*]+|(\*\*|__)(.*?)\1|<\/?\w+>|---|<!--.*?-->|`{3}.*?`{3}|`{1,2}(.*?)`{1,2}|~~(.*?)~~|\[(.*?)\]\(.*?\)/gs;

  // Replace Markdown syntax with plain text
  const plainText = markdown
      .replace(regex, '$2$3$4$5')
      .replace(/\n{2,}/g, '\n')   
      .trim();                    

  return plainText;
}

export const configPurpose = (config: CRMConfigByIdResponse, job: CRMJob) => {
  let customer_request_description = "Customer Request Description: \n" +
                                      (job.customer_description ? job.customer_description : "None provided") + "\n\n" 
  
  let technician_questions = "Questions that technician asked the customer: \n";
  if (job.questions_for_technician_to_ask) technician_questions += (stripMarkdown(job.questions_for_technician_to_ask) + "\n\n");

  let technician_notes = "Technician notes on customer response to questions: \n" + 
                          (job.technician_notes ? job.technician_notes : "None") + "\n\n";
  
  //from config
  let technician_filters = "Quick Filters Selected by Technician:\n===============================\nQuick Filters:\n"
  technician_filters += `${config.blind_width_in} in width x ${config.blind_height_in} in height\n`
  
  config.filter_questions_answers && config.filter_questions_answers.forEach(({ question, answer }) => {
    technician_filters += `${question}: ${answer}\n`
  })

  let recording_transript = "\nTranscript From technician appointment with customer:\n";
  if (config.appointment_recording_transcription) recording_transript += config.appointment_recording_transcription;

  return customer_request_description + technician_questions + technician_notes + technician_filters + recording_transript
}