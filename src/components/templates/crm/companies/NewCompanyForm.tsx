import { Input } from '@/components/atomics';
import { CompanyFormInterface } from '@/interface/companies';
import React from 'react'



type Props = {
  companyFormData: CompanyFormInterface
  setCompanyFormData: (data: any) => void
  errors: { [key: string]: string }
  isExternalForm?: boolean
}

const NewCompanyForm = ({ companyFormData, setCompanyFormData, errors, isExternalForm = false }: Props) => {
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCompanyFormData((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-2 max-smx:grid-cols-1 gap-6">
        <div>
          <Input
            id="name"
            variant="default"
            label="Company Name"
            placeholder="John Smith"
            handleChange={handleChange}
            value={companyFormData?.name}
            isRequired
          />
          {errors.name && (
            <span className="text-red-500 text-xs">{errors.name}</span>
          )}
        </div>
        <div>
          <Input
            id="email"
            variant="default"
            label="Email"
            placeholder="example@gmail.com"
            handleChange={handleChange}
            value={companyFormData?.email}
          />
          {errors.email && (
            <span className="text-red-500 text-xs">{errors.email}</span>
          )}
        </div>
        <div className="">
          <Input
            id="phone"
            variant="phone"
            label="Phone Number"
            placeholder="1234567890"
            handleChange={handleChange}
            value={companyFormData?.phone}
          />
          {errors.phone && (
            <span className="text-red-500 text-xs">{errors.phone}</span>
          )}
        </div>
        <Input
          type="address"
          id="address"
          variant="default"
          label="Address"
          placeholder="123 Main St, City, State, ZIP"
          handleChange={handleChange}
          defaultValue={companyFormData.address}
          isRequired={true}
          disabled={false}
        />
      </div>
      {!isExternalForm && (
        <div className="grid w-full grid-cols-2 max-smx:grid-cols-1 gap-6 pt-6">
          <Input
            id="website"
            variant="default"
            label="Website"
            placeholder="Website URL"
            handleChange={handleChange}
            value={companyFormData?.website}
          />
          <Input
            id="industry"
            variant="default"
            label="Industry"
            placeholder="Enter Industry"
            handleChange={handleChange}
            value={companyFormData?.industry}
          />
          <Input
            id="num_employees"
            type="number"
            variant="default"
            label="Number of Employees"
            placeholder="1, 2, 3..."
            handleChange={handleChange}
            value={companyFormData?.num_employees}
          />
        </div>
      )}
    </div>
  )
}

export default NewCompanyForm