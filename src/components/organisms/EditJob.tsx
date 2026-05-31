import { CRMJob } from '@/interface/jobs';
import React, { useState } from 'react'
import { Button, Input } from '../atomics';
import { PIPELINES } from '@/constants/enums/enums';

type Props = {
  job: CRMJob
}

const EditJob = ({ job }: Props) => {
  const [statusState, setStatusState] = useState<string>(job.status)
  const [stageState, setStageState] = useState<string>(job.stage)

  const statuses: string[] = ["🕛 Pending" , "🚚 Active" , "❌ Failed" , "✅ Completed", "❌ Canceled"]

  const stages: string[] = job?.pipeline === PIPELINES.CONSULTATION 
    ? ["New", "Consultation" , "Ordered" , "Installation"] 
    : ["New", "Diagnose", "In Progress", "Completed"];
    
  const [formData, setFormData] = useState({
    name: job.linked_contact.contact_name,
    pipeline: job.pipeline,
    stage: job.stage,
    status: job.status,
    completionDate: job.consultation_date,
    tech: "",
    customer: "idk",
    notes: job.technician_notes 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    //call api
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(); 
        }}
      >
        <Input
          id="name"
          variant="default"
          label="Name"
          placeholder="Enter Name"
          handleChange={handleChange}
          value={formData.name}
        />
        
        <div className="my-4">
            <p className="text-sm font-semibold text-neutral-100 max-sm:text-xs p-1">
              Status
            </p>
          <div className="flex gap-4">
            {statuses.map(status => {
              const cleanStatus = status.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(); 
              return (
                <div 
                  className={`rounded-full text-sm border py-2 px-4 hover:bg-primary-hover/30 transition hover:ease-in-out duration-150 hover:cursor-pointer ${statusState === cleanStatus && "bg-primary-selected/10 text-primary-main border-primary-main"}`}
                  onClick={() => setStatusState(cleanStatus)}
                  key={status}
                >
                  {status}
                </div>
              )
            })}
          </div>
        </div>

        <div className="my-4">
          <p className="text-sm font-semibold text-neutral-100 max-sm:text-xs p-1">
            Status
          </p>
          <div className="flex gap-4">
              {stages.map(stage =>
                <div 
                  className={`rounded-full text-sm border py-2 px-4 hover:bg-primary-hover/50 transition hover:ease-in-out duration-150 hover:cursor-pointer ${stageState === stage.toUpperCase() && "bg-primary-selected/10 text-primary-main border-primary-main"}`}
                  onClick={async () => setStageState(stage.toUpperCase())}
                  key={stage}
                >
                  {stage}
                </div>
              )}
            </div>
        </div>
        {/* Repeat similar blocks for stage, status, etc. */}
        <div className="mt-4 flex justify-between">
          <Button 
            variant="primary-bg"
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditJob