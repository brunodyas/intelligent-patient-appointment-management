import dynamic from "next/dynamic";

const PublicAddJobModal = dynamic(
  () => import("@/components/templates/public-pages/add-job"),
  {
    ssr: false,
  }
);

const AddJob: React.FC = () => {
  return <PublicAddJobModal />;
};

export default AddJob;
