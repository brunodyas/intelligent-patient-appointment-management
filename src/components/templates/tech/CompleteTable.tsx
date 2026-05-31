import { Button, Pagination, Title } from "@/components/atomics";
import { FunnelIcon, MagnifyingGlassIcon } from "@/assets/icons";

const CompleteTable = () => {
  const tableData = [
    {
      name: "Michael Sampino",
      position: "Consultation",
      address: "41 SE 5th St #402, Boca Raton, Fl 33432",
    },
    {
      name: "Michael Sampino",
      position: "Consultation",
      address: "41 SE 5th St #402, Boca Raton, Fl 33432",
    },
    {
      name: "Michael Sampino",
      position: "Consultation",
      address: "41 SE 5th St #402, Boca Raton, Fl 33432",
    },
  ];

  return (
    <div className="relative space-y-6 p-6 max-smx:p-0">
      <h1 className="text-xl sm:text-body-xl font-semibold"></h1>

      <section className="relative space-y-6 rounded-lg-10 bg-white p-6">
        <nav className="space-y-6">
          <section className="flex items-center justify-between max-smx:flex-col max-smx:justify-start max-smx:items-start max-smx:gap-5">
            <Title size="xl" variant="success">
              Completed
            </Title>
            <div className="flex flex-row gap-3 max-smx:flex-col max-smx:w-full">
              <div className="relative w-72 2xl:w-96 max-smx:w-full">
                <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-50" />
                <input
                  className="w-full rounded-lg border border-transparent bg-neutral-20 px-3.5 py-2.5 pl-11  outline-0 ring-2 ring-transparent transition-all duration-300 ease-out focus-within:ring-primary-surface focus:border-primary-main"
                  placeholder="Search"
                />
              </div>
              <Button size="md" variant="default-bg">
                Filter
                <FunnelIcon className="h-4 w-4 stroke-neutral-100 stroke-[4px]" />
              </Button>
            </div>
          </section>
        </nav>
        <div className="mb-6 overflow-x-auto">
          <table className="w-full table-auto">
            <tbody className="divide-y divide-neutral-20 pt-4 text-sm">
              {tableData.map((item, index) => (
                <tr
                  className={
                    "hover:bg-gray-100 ease-in-out duration-300 transition-all group hover:cursor-pointer"
                  }
                  key={index}
                >
                  <td className="whitespace-nowrap px-3 py-5 text-left first:pl-5 last:pr-5">
                    {item.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-5 text-center first:pl-5 last:pr-5 text-neutral-light">
                    {item.position}
                  </td>
                  <td className="whitespace-nowrap px-3 py-5 text-center first:pl-5 last:pr-5 text-neutral-light">
                    {item.address}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
        </div>
        {tableData?.length ? <Pagination currentPage={1} totalPages={5} onPageChange={() => {}}/> : <></>}
      </section>
    </div>
  );
};

export default CompleteTable;
