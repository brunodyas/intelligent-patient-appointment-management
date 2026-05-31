import { Input } from "@/components/atomics"

type Props = {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}
const CompanyMinForm = ({ handleChange }: Props) => {

  return (
    <div className="grid w-full grid-cols-2 gap-6 mt-5">
      <Input
        id="website"
        variant="default"
        label="Website"
        placeholder="Enter website"
        handleChange={handleChange}
      />
      <Input
        id="industry"
        variant="default"
        label="Industry"
        placeholder="Enter industry"
        handleChange={handleChange}
      />
      <Input
        id="numberOfEmployees"
        variant="default"
        type="number"
        label="Number of employees"
        placeholder="Enter number of employees"
        handleChange={handleChange}
      />
    </div>
  )
}

export default CompanyMinForm